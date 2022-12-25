import { existsSync, readdirSync, statSync } from 'fs';
import { basename, dirname, relative, resolve } from 'path';
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
    super(parent);
    this.name = basename(root);
    this.uid = uniqueId();
    this.filename = this.getFilename();
    this.options = options;
    this.parent = parent;
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
        const filename = this.resolve(file, sub);
        const files = readdirSync(dirname(filename));
        if (files.find(file => file.endsWith('.module.ts'))) return;
        filenames.push(filename);
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
    if (!moduleFile) return;
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

  getFile() {
    return this.file;
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
    if (this.file) {
      this.data = await this.file.parseModule();
    }
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

  getNodeLink(val) {
    const id = this.file.getImportPath(val);
    if (!id) return '';
    try {
      const moduleName = id.split('/')[1];
      const type = id.split('/')[2];
      const name = id.split(':').pop();
      return `/${type}/${moduleName}-${name}.html`;
    } catch (err) {
      return '';
    }
  }

  getTree() {
    if (!this.file) return;
    let items: any = [
      {
        key: this.uid,
        name: this.file.children[0].name,
        type: 'module',
        linkId: this.linkId,
      },
    ];
    const module = this;
    if (this.parent) {
      items = [
        ...items,
        {
          key: module.uid,
          name: module.getName(),
          parent: this.uid,
          type: 'module',
          linkId: module.linkId,
          description: 'This is description!',
        },
      ];
      if (module.services.length) {
        items = [
          ...items,
          {
            key: module.uid + 1000,
            name: 'Services',
            parent: module.uid,
            type: 'service',
            linkId:
              module.parent.getName() + '-' + module.getName() + '-services',
            description: 'This is description!',
          },
          ...module.services.map(service => ({
            key: service.uid,
            name: service.getName(),
            parent: module.uid + 1000,
            type: 'service',
            linkId: service.linkId,
            description: 'This is description!',
          })),
        ];
      }
      if (module.controllers.length) {
        items = [
          ...items,
          {
            key: module.uid + 10001,
            name: 'Controllers',
            parent: module.uid,
            type: 'controller',
            linkId:
              module.parent.getName() + '-' + module.getName() + '-controllers',
            description: 'This is description!',
          },
          ...module.controllers.map(controller => ({
            key: controller.uid,
            name: controller.getName(),
            parent: module.uid + 10001,
            type: 'controller',
            linkId: controller.linkId,
            description: 'This is description!',
          })),
        ];
      }
      if (module.entities.length) {
        items = [
          ...items,
          {
            key: module.uid + 100002,
            name: 'Entities',
            parent: module.uid,
            type: 'entity',
            linkId:
              module.parent.getName() + '-' + module.getName() + '-entities',
            description: 'This is description!',
          },
          ...module.entities.map(entity => ({
            key: entity.uid,
            name: entity.getName(),
            parent: module.uid + 100002,
            type: 'entity',
            linkId: entity.linkId,
            description: 'This is description!',
          })),
        ];
      }
      if (module.dto.length) {
        items = [
          ...items,
          {
            key: module.uid + 1000003,
            name: "Dto's",
            parent: module.uid,
            type: 'dto',
            linkId: module.parent.getName() + '-' + module.getName() + '-dto',
            description: 'This is description!',
          },
          ...module.dto.map(dto => ({
            key: dto.uid,
            name: dto.getName(),
            parent: module.uid + 1000003,
            type: 'dto',
            linkId: dto.linkId,
            description: 'This is description!',
          })),
        ];
      }
      if (module.types.length) {
        items = [
          ...items,
          {
            key: module.uid + 10000004,
            name: 'Types',
            parent: module.uid,
            type: 'type',
            linkId: module.parent.getName() + '-' + module.getName() + '-dto',
            description: 'This is description!',
          },
          ...module.types.map(type => ({
            key: type.uid,
            name: type.getName(),
            parent: module.uid + 10000004,
            type: 'type',
            linkId: type.linkId,
            description: 'This is description!',
          })),
        ];
      }
      return items;
    }
    this.modules.forEach(module => {
      // console.log('SERVICES', {
      //   file: module.file.filename,
      //   name: module.getName(),
      //   module: module.name,
      //   services: this.services.length,
      // });
      items = [
        ...items,
        {
          key: module.uid,
          name: module.getName(),
          parent: this.uid,
          type: 'module',
          linkId: module.linkId,
          description: 'This is description!',
        },
      ];
      if (module.services.length) {
        items = [
          ...items,
          {
            key: module.uid + 1000,
            name: 'Services',
            parent: module.uid,
            type: 'service',
            linkId:
              module.parent.getName() + '-' + module.getName() + '-services',
            description: 'This is description!',
          },
          ...module.services.map(service => ({
            key: service.uid,
            name: service.getName(),
            parent: module.uid + 1000,
            type: 'service',
            linkId: service.linkId,
            description: 'This is description!',
          })),
        ];
      }
      if (module.controllers.length) {
        items = [
          ...items,
          {
            key: module.uid + 10001,
            name: 'Controllers',
            parent: module.uid,
            type: 'controller',
            linkId:
              module.parent.getName() + '-' + module.getName() + '-controllers',
            description: 'This is description!',
          },
          ...module.controllers.map(controller => ({
            key: controller.uid,
            name: controller.getName(),
            parent: module.uid + 10001,
            type: 'controller',
            linkId: controller.linkId,
            description: 'This is description!',
          })),
        ];
      }
      if (module.entities.length) {
        items = [
          ...items,
          {
            key: module.uid + 100002,
            name: 'Entities',
            parent: module.uid,
            type: 'entity',
            linkId:
              module.parent.getName() + '-' + module.getName() + '-entities',
            description: 'This is description!',
          },
          ...module.entities.map(entity => ({
            key: entity.uid,
            name: entity.getName(),
            parent: module.uid + 100002,
            type: 'entity',
            linkId: entity.linkId,
            description: 'This is description!',
          })),
        ];
      }
      if (module.dto.length) {
        items = [
          ...items,
          {
            key: module.uid + 1000003,
            name: "Dto's",
            parent: module.uid,
            type: 'dto',
            linkId: module.parent.getName() + '-' + module.getName() + '-dto',
            description: 'This is description!',
          },
          ...module.dto.map(dto => ({
            key: dto.uid,
            name: dto.getName(),
            parent: module.uid + 1000003,
            type: 'dto',
            linkId: dto.linkId,
            description: 'This is description!',
          })),
        ];
      }
      if (module.types.length) {
        items = [
          ...items,
          {
            key: module.uid + 10000004,
            name: 'Types',
            parent: module.uid,
            type: 'type',
            linkId: module.parent.getName() + '-' + module.getName() + '-dto',
            description: 'This is description!',
          },
          ...module.types.map(type => ({
            key: type.uid,
            name: type.getName(),
            parent: module.uid + 10000004,
            type: 'type',
            linkId: type.linkId,
            description: 'This is description!',
          })),
        ];
      }
    });
    return items;
  }
}
