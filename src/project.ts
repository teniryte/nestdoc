import { readFileSync } from 'fs';
import { resolve } from 'path';
import { File } from './files/file';
import { Module } from './module';
import { render } from './renderer';
import * as colors from 'colors/safe';

export class Project extends Module {
  output: string;
  options: any;
  logo: string;
  favicon: string;
  items: any = {};

  constructor(root: string, parent: any, options?: any) {
    super(root, parent);
    this.output = options.output;
    this.options = options;
    this.logo = options.logo;
    this.favicon = options.favicon;
  }

  async generate(): Promise<void> {
    console.info(
      colors.dim(`Building docs project for root «${this.root}»...`)
    );
    await this.build();
    await render(this);
  }

  register(item) {
    this.items[item.id] = item;
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
      ...super.toJSON(),
      logo: this.logo,
    };
  }

  getPagesCount() {
    let count = 0;
    this.modules.forEach(module => {
      count++;
      count += module.services.length + 1;
      count += module.controllers.length + 1;
      count += module.dto.length + 1;
      count += module.types.length + 1;
      count += module.guards.length + 1;
      count += module.middlewares.length + 1;
      count += module.entities.length + 1;
    });
    return count;
  }
}
