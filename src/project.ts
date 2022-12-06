import { readFileSync } from 'fs';
import { resolve } from 'path';
import { File } from './files/file';
import { Module } from './module';
import { render } from './renderer';

export class Project extends Module {
  output: string;
  options: any;
  logo: string;
  favicon: string;

  constructor(root: string, parent: any, options?: any) {
    super(root, parent);
    this.output = options.output;
    this.options = options;
    this.logo =
      options.logo || 'https://cdn.cort.one/images/logo/nestdoc/logo.png';
    this.favicon =
      options.favicon || 'https://cdn.cort.one/images/logo/nestdoc/favicon.png';
  }

  async generate(): Promise<void> {
    await this.build();
    await render(this);
  }

  getMenu(): any {
    const modules = [];
    this.modules.forEach(module => {
      modules.push({
        name: module.name,
        root: module.root,
        filename: module.filename,
        linkId: module.linkId,
        services: module.services.map(service => service.toJSON()),
        controllers: module.controllers.map(controller => controller.toJSON()),
        entities: module.entities.map(entity => entity.toJSON()),
        dto: module.dto.map(dto => dto.toJSON()),
        types: module.types.map(type => type.toJSON()),
        guards: module.guards.map(guard => guard.toJSON()),
        middlewares: module.middlewares.map(middleware => middleware.toJSON()),
      });
    });
    return modules;
  }

  override toJSON() {
    return {
      name: this.name,
      logo: this.logo,
    };
  }
}
