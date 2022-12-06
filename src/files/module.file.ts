import { File } from './file';
import { ClassDeclaration, TypescriptParser } from 'typescript-parser';
const parser = new TypescriptParser();

export class ModuleFile extends File {
  fileType = 'module';

  constructor(filename: any, parent: any) {
    super(filename, parent);
  }

  async parseModule(): Promise<any> {
    super.parse();
    let str: string = this.source
      .split('@Module({')[1]
      .split('export class')[0]
      .trim()
      .slice(0, -2);
    const exports: [string, string][] = [];
    const controllers: [string, string][] = [];
    const providers: [string, string][] = [];
    let imports: any = [];
    let entities: [string, string][] = [];
    str = str.replace(/exports\s*\:\s*\[([^\]]*)\]\,/gim, (txt, vars) => {
      vars
        .split(',')
        .map(val => val.trim())
        .filter(val => !!val)
        .forEach(val => {
          const path = this.getImportPath(val);
          exports.push([val, path]);
        });
      return '';
    });
    str = str.replace(/providers\s*\:\s*\[([^\]]*)\]\,/gim, (txt, vars) => {
      vars
        .split(',')
        .map(val => val.trim())
        .filter(val => !!val)
        .forEach(val => {
          const path = this.getImportPath(val);
          providers.push([val, path]);
        });
      return '';
    });
    str = str.replace(/controllers\s*\:\s*\[([^\]]*)\]\,/gim, (txt, vars) => {
      vars
        .split(',')
        .map(val => val.trim())
        .filter(val => !!val)
        .forEach(val => {
          const path = this.getImportPath(val);
          controllers.push([val, path]);
        });
      return '';
    });
    str = (str.trim().split('imports: [')[1] || '').split('],')[0];
    str = str.replace(
      /TypeOrmModule\.forFeature\(\[([^\]]+)\]\)\,?/gim,
      (txt, val) => {
        entities = [
          ...val
            .split(',')
            .map(val => val.trim())
            .filter(val => !!val),
        ].map(name => [name, this.getImportPath(name)]);
        return '';
      }
    );
    imports = str
      .replace(/\(([\s\S]+)\)/gim, (txt, val) => {
        return txt.replace(/\,/gim, '__COMMA__');
      })
      .split(',')
      .map(val => val.trim())
      .filter(val => !!val)
      .map(val => val.replace(/__COMMA__/gim, ','));
    const data = {
      exports,
      controllers,
      providers,
      imports,
      entities,
    };
    return data;
  }
}
