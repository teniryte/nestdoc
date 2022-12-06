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

const parse = require('../../packages/jsdoc-parse');

const parser = new TypescriptParser();

const DECORATOR_REG =
  /\@([a-zA-Z0-9]+?)\(([a-zA-Z0-9,\{\}\.\[\]\=\>\(\)\:\'\"\s]*?)\)/gim;
const IMPORT_REG = /import\s+([\s\S]+?)from\s+\'(.+)\'\;?$/gim;

export class File extends Linked implements NamedInterface {
  fileType: string;
  children: any;
  name: string;
  imports: any;
  id: string;
  source: string;
  uid: number;

  constructor(public filename: string, public parent: Module) {
    super();
    this.name = basename(filename, extname(filename)).split('.')[0];
    this.id = this.getId();
    this.source = this.getSource();
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
        path =
          '@app/' + relative(this.getRoot().root, this.parent.resolve(path));
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

    while ((results = reg.exec(this.source)) !== null) {
      const item = new Comment(results[1], results.index, reg.lastIndex, this);
      comments.push(item);
    }

    return comments;
  }

  async getDeclarations(): Promise<any> {
    const source = this.source.replace(DECORATOR_REG, (...args) => {
      return '/*' + args[0].slice(2, -2) + '*/';
    });
    const build = await parser.parseSource(source);
    return build.declarations;
  }

  async getDecorators(): Promise<any> {
    const reg = DECORATOR_REG;
    let results;
    const decorators: any = [];

    while ((results = reg.exec(this.source)) !== null) {
      const item = {
        name: results[1],
        args: results[2],
        start: results.index,
        end: reg.lastIndex,
        type: 'decorator',
      };
      decorators.push(new Decorator(item, this));
      // console.log('ITEM', item);
    }

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
    const children = [
      ...comments,
      ...declarations,
      ...(Class.properties || []),
      ...(Class.methods || []),
      Class.ctor,
      ...decorators,
    ]
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
      item.comment = comment || null;
      comment = null;
    });

    this.children = declarations
      .map(declaration => Node.createNode(declaration, this))
      .filter(child => !!child);
    // console.log('FILE', inspect(this.children, { depth: 100 }));
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
    return {
      name: this.getName(),
      id: this.id,
      filename: this.filename,
      linkId: this.linkId,
    };
  }
}
