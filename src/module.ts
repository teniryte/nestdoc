import { existsSync, readdirSync, statSync } from 'fs';
import { basename, relative, resolve } from 'path';
import { ControllerFile } from './files/controller.file';
import { DecoratorFile } from './files/decorator.file';
import { DtoFile } from './files/dto.file';
import { EntityFile } from './files/entity.file';
import { File } from './files/file';
import { GuardFile } from './files/guard.file';
import { MiddlewareFile } from './files/middleware.file';
import { ModuleFile } from './files/module.file';
import { ServiceFile } from './files/service.file';
import { TypeFile } from './files/type.file';
import { Linked } from './types/linked';
import { uniqueId } from './util';

export class Module extends Linked {
  services: ServiceFile[] = [];
  modules: Module[] = [];
  entities: EntityFile[] = [];
  dto: DtoFile[] = [];
  types: TypeFile[] = [];
  controllers: ControllerFile[] = [];
  guards: GuardFile[] = [];
  decorators: DecoratorFile[] = [];
  middlewares: MiddlewareFile[] = [];
  handledFiles: string[] = [];
  file: ModuleFile;
  otherFiles: File[] = [];
  data: any = {};
  name: string;
  uid: number;
  filename: string;

  constructor(
    public root: string,
    public parent?: Module,
    public options?: any
  ) {
    super();
    this.name = basename(root);
    this.uid = uniqueId();
    this.filename = this.getFilename();
    this.options = options;
  }

  getName() {
    return this.name;
  }

  getFilename() {
    const filename = this.list()
      .filter(file => file.endsWith('.module.ts'))
      .map(file => this.resolve(file))
      .find(filename => existsSync(filename));
    return filename || null;
  }

  list(path = '.'): string[] {
    return readdirSync(this.resolve(path));
  }

  getTypeFiles(type: string): string[] {
    const filenames = [];
    this.list().forEach(file => {
      if (file.endsWith(`.${type}.ts`)) {
        filenames.push(this.resolve(file));
      }
      if (!statSync(this.resolve(file)).isDirectory()) return;
      this.list(file).forEach(sub => {
        if (!sub.endsWith(`.${type}.ts`)) return;
        filenames.push(this.resolve(file, sub));
      });
    });
    this.handledFiles = [...this.handledFiles, ...filenames];
    return filenames;
  }

  async getModules() {
    const files = this.list().map(file => resolve(this.root, file));
    const modules = [];
    for (const file of files) {
      if (!statSync(file).isDirectory()) continue;
      const subFiles = this.list(file);
      const isModule = !!subFiles.find(subFile =>
        subFile.endsWith('.module.ts')
      );
      if (!isModule) continue;
      modules.push(new Module(file, this));
    }
    return modules;
  }

  async buildModules(): Promise<any> {
    const modules = await this.getModules();
    this.modules = modules;
  }

  async buildType(name: string, plural: string, Class: any): Promise<void> {
    const files = this.getTypeFiles(name);
    for (const file of files) {
      const item = new Class(file, this);
      await item.parse();
      this[plural].push(item);
    }
  }

  async buildModuleFile(): Promise<any> {
    const files = this.list();
    const moduleFile = files.find(file => file.endsWith('.module.ts'));
    this.handledFiles.push(this.resolve(moduleFile));
    this.file = new ModuleFile(this.resolve(moduleFile), this);
  }

  async buildOtherFiles(): Promise<any> {
    const files = this.getUnhandledFiles();
    for (const file of files) {
      const item = new File(file, this);
      await item.parse();
      this.otherFiles.push(item);
    }
  }

  getAllFiles(): string[] {
    let files = [];

    readdir(this.root);

    function readdir(dir) {
      const subFiles = readdirSync(dir).map(file => resolve(dir, file));
      subFiles.forEach(file => {
        if (statSync(file).isDirectory()) {
          if (readdirSync(file).find(file => file.endsWith('.module.ts')))
            return;
          readdir(file);
        } else {
          files.push(file);
        }
      });
    }

    return files;
  }

  getUnhandledFiles(): any {
    return this.getAllFiles()
      .filter(file => !this.handledFiles.includes(file))
      .filter(val => !val.includes('ormconfig'));
  }

  async build(): Promise<any> {
    await this.buildModules();
    await this.buildModuleFile();
    await this.buildType('service', 'services', ServiceFile);
    await this.buildType('entity', 'entities', EntityFile);
    await this.buildType('dto', 'dto', DtoFile);
    await this.buildType('interface', 'types', TypeFile);
    await this.buildType('controller', 'controllers', ControllerFile);
    await this.buildType('guard', 'guards', GuardFile);
    await this.buildType('decorator', 'decorators', DecoratorFile);
    await this.buildType('middleware', 'middlewares', MiddlewareFile);
    await this.buildOtherFiles();
    this.data = await this.file.parseModule();
    for (const module of this.modules) {
      await module.build();
    }
  }

  resolve(...paths): string {
    if (!this.parent) return resolve(this.root, ...paths);
    return resolve(this.parent.resolve(this.root), ...paths);
  }

  getJsonServices(): any {
    const services = [];
    this.services.forEach(service => {
      services.push({
        filename: service.filename,
        name: service.name,
        id: service.id,
      });
    });
    return services;
  }

  toJSON() {
    return {
      name: this.name,
      id: this.file.id,
      linkId: this.linkId,
    };
  }
}
