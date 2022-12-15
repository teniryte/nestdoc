import { readFileSync } from 'fs';
import { basename, dirname, extname, relative, resolve } from 'path';
import { Module } from '../module';

import { ClassDeclaration, TypescriptParser } from 'typescript-parser';
import { Comment } from '../comment';
import { inspect } from 'util';
import { Node } from '../nodes/node';
import { Decorator } from '../decorator';
import { uniqueId } from '../util';
import { NamedInterface } from '../types/named.interface';
import { Linked } from '../types/linked';
import * as babelParser from '@babel/parser';

const parser = new TypescriptParser();

const DECORATOR_REG = /^\s*\@([a-zA-Z0-9\_\$]+)\(([^\)]*?)\)/gim;
const IMPORT_REG = /import\s+([\s\S]+?)from\s+\'(.+)\'\;?$/gim;

export class File extends Linked implements NamedInterface {
  fileType: string;
  children: any;
  name: string;
  imports: any;
  id: string;
  source: string;
  uid: number;
  originalSource: string;

  constructor(public filename: string, public parent: Module) {
    super(parent);
    this.name = basename(filename, extname(filename)).split('.')[0];
    this.id = this.getId();
    this.source = this.getSource();
    this.originalSource = this.source;
    this.imports = this.getImports();
    this.uid = uniqueId();
  }

  getName() {
    return this.children.find(node => node.nodeType === 'class').name;
  }

  getSource(): string {
    const filename = this.parent
      ? resolve(this.parent.root, this.filename)
      : this.filename;
    const source = readFileSync(filename, 'utf-8');
    return source;
  }

  getImports(): any {
    const reg = IMPORT_REG;
    let results;
    const imports = [];

    while ((results = reg.exec(this.source)) !== null) {
      let vars = results[1];
      let named = [];
      vars = vars.replace(
        /\{\s*([\s\S]+)\s*\}/gim,
        (txt: string, names: string) => {
          named = [
            ...named,
            ...names
              .split(',')
              .map(val => val.trim())
              .filter(val => !!val),
          ];
          return '';
        }
      );
      named = named.map(n => {
        const original = n.split(' as ')[0],
          alias = n.split(' as ')[1] || original;
        return [original, alias];
      });
      let defaults =
        vars
          .split(',')
          .map(val => val.trim())
          .filter(val => !!val)[0] || '';
      if (defaults.includes(' as ')) {
        defaults = defaults.split(' as ')[1];
      }
      let path = results[2];
      if (path.startsWith('.')) {
        path = '@app/' + relative(this.getRoot().root, this.resolve(path));
      }
      const item = {
        vars: vars,
        path,
        named,
        default: defaults,
      };
      imports.push(item);
    }
    return imports;
  }

  resolve(...paths) {
    return resolve(dirname(this.filename), ...paths);
  }

  getImportPath(name: string): string {
    if (!name) return null;
    let path = null;
    if (name.endsWith('[]')) {
      name = name.slice(0, -2);
    }
    this.imports.forEach(imp => {
      if (imp.default === name) {
        path = imp.path;
        return;
      }
      imp.named.forEach(names => {
        if (names[1] === name) {
          path = imp.path + ':' + names[0];
        }
      });
    });
    return path;
  }

  async getComments(): Promise<any> {
    const comments: Comment[] = [];
    const reg = /\/\*\*([\s\S]+?)\*\//gim;
    let results;
    const source = this.source.replace(/§/gim, '@');

    while ((results = reg.exec(source)) !== null) {
      const item = new Comment(results[1], results.index, reg.lastIndex, this);
      comments.push(item);
    }

    return comments;
  }

  async getDeclarations(): Promise<any> {
    const source = this.source;
    const build = await parser.parseSource(source);
    return build.declarations;
  }

  async getDecorators(): Promise<any> {
    const decorators = [];
    let source = removeComments(this.source);

    if (this.filename.endsWith('.module.ts')) {
      return [];
    }

    const extractNextDecorator = () => {
      source.replace(/\@([a-zA-Z0-9_\$]+)\(/gim, (txt, name, position) => {
        const closing =
          findClosingBracketMatchIndex(source, position + 1 + name.length) + 1;
        const val = source.slice(position, closing);
        const item = {
          name: name,
          args: source.slice(position + 2 + name.length, closing - 1),
          start: position - 1,
          end: closing,
          type: 'decorator',
        };
        decorators.push(new Decorator(item, this));
        source = source.replace(val, '/*' + val.slice(2, -2) + '*/');
        return txt;
      });
    };

    while (/\@([a-zA-Z0-9_\$]+)\(/gim.test(source)) {
      extractNextDecorator();
    }

    this.source = source;

    return decorators;
  }

  async parse(): Promise<any> {
    const decorators = await this.getDecorators();
    const comments = await this.getComments();
    const declarations = await this.getDeclarations();
    const Class =
      declarations.find(
        declaration => declaration instanceof ClassDeclaration
      ) || {};

    let children = [
      ...comments,
      ...declarations,
      ...(Class.properties || []),
      ...(Class.methods || []),
      Class.ctor,
      ...decorators,
    ];
    children = children
      .filter(val => !!val)
      .sort((a, b) => (a.start > b.start ? 1 : -1));

    let decs: any = [];
    children.forEach((item, i) => {
      if (item.type === 'decorator') {
        decs.push(item);
        return;
      }
      item.decorators = decs;
      decs = [];
    });
    let comment;
    children.forEach((item, i) => {
      if (item.type === 'CommentBlock') {
        comment = item;
        return;
      }
      if (comment && !(item instanceof Decorator)) {
        item.comment = comment || null;
        comment = null;
      }
    });

    this.children = declarations
      .map(declaration => Node.createNode(declaration, this))
      .filter(child => !!child);
  }

  getRoot() {
    let parent = this.parent;
    while (parent && parent.parent) {
      parent = parent.parent;
    }
    return parent;
  }

  getId() {
    const top = this.getRoot();
    let root;
    if (!top) root = dirname(this.filename);
    else root = top.root;
    return '@app/' + relative(root, this.filename);
  }

  toJSON() {
    const main =
      this.children.find(child => child.nodeType === 'class') || null;
    return {
      name: this.getName(),
      id: this.id,
      filename: this.filename,
      linkId: this.linkId,
      main: main?.toJSON(),
      source: this.originalSource,
    };
  }

  getNodeLink(val) {
    const id = this.getImportPath(val);
    if (!id) return '';
    try {
      const moduleName = id.split('/')[1];
      const name = id.split(':').pop();
      const type = id.split(':')[0].split('.').pop();
      const sectionType = {
        service: 'services',
        controller: 'controllers',
        entity: 'entities',
        dto: 'dto',
        type: 'types',
        guard: 'guards',
        middleware: 'middlewares',
        interface: 'types',
      };
      const t = sectionType[type];
      if (!moduleName || !name || !t) return '';
      return `/${t}/${moduleName}-${name}.html`;
    } catch (err) {
      return '';
    }
  }
}

function removeComments(string) {
  //Takes a string of code, not an actual function.
  return string
    .replace(/\/\*([\s\S]*?)\*\/|\/\/.*/g, txt => {
      return txt.replace(/\@/gim, '§');
    })
    .trim(); //Strip comments
}

function findClosingBracketMatchIndex(str, pos) {
  if (str[pos] != '(') {
    throw new Error("No '(' at index " + pos);
  }
  let depth = 1;
  for (let i = pos + 1; i < str.length; i++) {
    switch (str[i]) {
      case '(':
        depth++;
        break;
      case ')':
        if (--depth == 0) {
          return i;
        }
        break;
    }
  }
  return -1; // No matching closing parenthesis
}
