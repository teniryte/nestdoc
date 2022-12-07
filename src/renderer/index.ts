import * as styla from 'styla';
import * as pug from 'pug';
import { resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as rimraf from 'rimraf';
import * as webpack from 'webpack';
import { createConfig } from './webpack';
import { copySync } from 'fs-extra';

export const render = async project => {
  const OUTPUT_DIR = project.output;
  const CSS_DIR = resolve(project.output, 'css');
  const CSS_BUILD = resolve(CSS_DIR, 'app.css');
  const JS_DIR = resolve(project.output, 'js');
  const IMAGES_DIR = resolve(project.output, 'images');
  const TEMPLATES_DIR = resolve(__dirname, '../../src/renderer/templates');
  const STYLES_DIR = resolve(__dirname, '../../src/renderer/styles');
  const STYLES_INDEX = resolve(STYLES_DIR, 'index.styl');
  const HTML_DIR = project.output;
  const MODULES_DIR = resolve(HTML_DIR, 'modules');
  const SERVICES_DIR = resolve(HTML_DIR, 'services');
  const CONTROLLERS_DIR = resolve(HTML_DIR, 'controllers');
  const ENTITIES_DIR = resolve(HTML_DIR, 'entities');
  const DTO_DIR = resolve(HTML_DIR, 'dto');
  const TYPES_DIR = resolve(HTML_DIR, 'types');
  const GUARDS_DIR = resolve(HTML_DIR, 'guards');
  const MIDDLEWARES_DIR = resolve(HTML_DIR, 'middlewares');
  const LIB_DIR = resolve(__dirname, '../../src/renderer/templates/lib');
  const OUTPUT_LIB_DIR = resolve(project.output, 'lib');

  const CONTEXT = {
    menu: project.getMenu(),
    base: project.options.base,
    logo: project.logo,
    project,
    formatDecoratorArgs(val) {
      return val.replace(/«/gim, '(').replace(/»/gim, ')');
    },
  };

  await clearFiles();
  await createDirs();
  await renderStyles();
  await renderJs();
  await renderPage('index');
  await renderPage('modules', {
    breadcrumbs: [
      {
        title: 'Home',
        url: project.options.base,
        icon: 'fa-solid fa-house',
      },
      {
        title: 'Modules',
        icon: 'fa-solid fa-box-open',
      },
    ],
  });

  const START_BREADCRUMBS = [
    {
      title: 'Home',
      url: project.options.base,
      icon: 'fa-solid fa-house',
    },
    {
      title: 'Modules',
      url: project.options.base + '/' + 'modules.html',
      icon: 'fa-solid fa-box-open',
    },
  ];

  project.modules.forEach(module => {
    const data = module.toJSON();
    const mod = data;
    renderItemPage(
      'modules',
      'module',
      {
        module: data,
        breadcrumbs: [
          ...START_BREADCRUMBS,
          { title: data.name, icon: 'fa-solid fa-box-open' },
        ],
        parent: module,
      },
      module.linkId
    );
    renderItemPage(
      'services',
      'services',
      {
        module: data,
        breadcrumbs: [
          ...START_BREADCRUMBS,
          {
            title: data.name,
            icon: 'fa-solid fa-box-open',
            url: project.options.base + '/modules/' + module.linkId + '.html',
          },
          { title: 'Services', icon: 'fa-sharp fa-solid fa-person-digging' },
        ],
        parent: module,
      },
      module.linkId + '-services'
    );
    renderItemPage(
      'controllers',
      'controllers',
      {
        module: data,
        breadcrumbs: [
          ...START_BREADCRUMBS,
          {
            title: data.name,
            icon: 'fa-solid fa-box-open',
            url: project.options.base + '/modules/' + module.linkId + '.html',
          },
          { title: 'Controllers', icon: 'fa-solid fa-link' },
        ],
        parent: module,
      },
      module.linkId + '-controllers'
    );
    renderItemPage(
      'entities',
      'entities',
      {
        module: data,
        breadcrumbs: [
          ...START_BREADCRUMBS,
          {
            title: data.name,
            icon: 'fa-solid fa-box-open',
            url: project.options.base + '/modules/' + module.linkId + '.html',
          },
          { title: 'Entities', icon: 'fa-solid fa-database' },
        ],
        parent: module,
      },
      module.linkId + '-entities'
    );
    renderItemPage(
      'dto',
      'dto',
      {
        module: data,
        breadcrumbs: [
          ...START_BREADCRUMBS,
          {
            title: data.name,
            icon: 'fa-solid fa-box-open',
            url: project.options.base + '/modules/' + module.linkId + '.html',
          },
          { title: "DTO's", icon: 'fa-solid fa-server' },
        ],
        parent: module,
      },
      module.linkId + '-dto'
    );
    renderItemPage(
      'types',
      'types',
      {
        module: data,
        breadcrumbs: [
          ...START_BREADCRUMBS,
          {
            title: data.name,
            icon: 'fa-solid fa-box-open',
            url: project.options.base + '/modules/' + module.linkId + '.html',
          },
          { title: 'Types', icon: 'fa-solid fa-folder-tree' },
        ],
        parent: module,
      },
      module.linkId + '-types'
    );
    renderItemPage(
      'guards',
      'guards',
      {
        module: data,
        breadcrumbs: [
          ...START_BREADCRUMBS,
          {
            title: data.name,
            icon: 'fa-solid fa-box-open',
            url: project.options.base + '/modules/' + module.linkId + '.html',
          },
          { title: 'Guards', icon: 'fa-solid fa-shield-halved' },
        ],
        parent: module,
      },
      module.linkId + '-guards'
    );
    renderItemPage(
      'middlewares',
      'middlewares',
      {
        module: data,
        breadcrumbs: [
          ...START_BREADCRUMBS,
          {
            title: data.name,
            icon: 'fa-solid fa-box-open',
            url: project.options.base + '/modules/' + module.linkId + '.html',
          },
          { title: 'Middlewares', icon: 'fa-solid fa-spider' },
        ],
        parent: module,
      },
      module.linkId + '-middlewares'
    );
    module.services.forEach(service => {
      const data = service.toJSON();
      renderItemPage(
        'services',
        'service',
        {
          service: data,
          breadcrumbs: [
            ...START_BREADCRUMBS,
            {
              title: mod.name,
              icon: 'fa-solid fa-box-open',
              url: project.options.base + '/modules/' + module.linkId + '.html',
            },
            {
              title: 'Services',
              icon: 'fa-sharp fa-solid fa-person-digging',
              url:
                project.options.base +
                '/services/' +
                mod.linkId +
                '-services.html',
            },
            { title: data.name, icon: 'fa-sharp fa-solid fa-person-digging' },
          ],
          parent: service,
        },
        service.linkId
      );
    });
    module.controllers.forEach(controller => {
      const data = controller.toJSON();
      renderItemPage(
        'controllers',
        'controller',
        {
          controller: data,
          breadcrumbs: [
            ...START_BREADCRUMBS,
            {
              title: mod.name,
              icon: 'fa-solid fa-box-open',
              url: project.options.base + '/modules/' + module.linkId + '.html',
            },
            {
              title: 'Controllers',
              icon: 'fa-solid fa-link',
              url:
                project.options.base +
                '/controllers/' +
                mod.linkId +
                '-controllers.html',
            },
            { title: data.name, icon: 'fa-solid fa-link' },
          ],
          parent: controller,
        },
        controller.linkId
      );
    });
    module.entities.forEach(entity => {
      const data = entity.toJSON();
      renderItemPage(
        'entities',
        'entity',
        {
          entity: data,
          breadcrumbs: [
            ...START_BREADCRUMBS,
            {
              title: mod.name,
              icon: 'fa-solid fa-box-open',
              url: project.options.base + '/modules/' + module.linkId + '.html',
            },
            {
              title: 'Entities',
              icon: 'fa-solid fa-database',
              url:
                project.options.base +
                '/entities/' +
                mod.linkId +
                '-entities.html',
            },
            { title: data.name, icon: 'fa-solid fa-database' },
          ],
          parent: entity,
        },
        entity.linkId
      );
    });
    module.dto.forEach(dto => {
      const data = dto.toJSON();
      renderItemPage(
        'dto',
        'dto-item',
        {
          dto: data,
          breadcrumbs: [
            ...START_BREADCRUMBS,
            {
              title: mod.name,
              icon: 'fa-solid fa-box-open',
              url: project.options.base + '/modules/' + module.linkId + '.html',
            },
            {
              title: "DTO's",
              icon: 'fa-solid fa-server',
              url: project.options.base + '/dto/' + mod.linkId + '-dto.html',
            },
            { title: data.name, icon: 'fa-solid fa-server' },
          ],
          parent: dto,
        },
        dto.linkId
      );
    });
    module.types.forEach(type => {
      const data = type.toJSON();
      renderItemPage(
        'types',
        'type',
        {
          type: data,
          breadcrumbs: [
            ...START_BREADCRUMBS,
            {
              title: mod.name,
              icon: 'fa-solid fa-box-open',
              url: project.options.base + '/modules/' + module.linkId + '.html',
            },
            {
              title: 'Types',
              icon: 'fa-solid fa-folder-tree',
              url:
                project.options.base + '/types/' + mod.linkId + '-types.html',
            },
            { title: data.name, icon: 'fa-solid fa-folder-tree' },
          ],
          parent: type,
        },
        type.linkId
      );
    });
    module.guards.forEach(guard => {
      const data = guard.toJSON();
      renderItemPage(
        'guards',
        'guard',
        {
          guard: data,
          breadcrumbs: [
            ...START_BREADCRUMBS,
            {
              title: mod.name,
              icon: 'fa-solid fa-box-open',
              url: project.options.base + '/modules/' + module.linkId + '.html',
            },
            {
              title: 'Guards',
              icon: 'fa-solid fa-shield-halved',
              url:
                project.options.base + '/guards/' + mod.linkId + '-guards.html',
            },
            { title: data.name, icon: 'fa-solid fa-shield-halved' },
          ],
          parent: guard,
        },
        guard.linkId
      );
    });
    module.middlewares.forEach(middleware => {
      const data = middleware.toJSON();
      renderItemPage(
        'middlewares',
        'middleware',
        {
          middleware: data,
          breadcrumbs: [
            ...START_BREADCRUMBS,
            {
              title: mod.name,
              icon: 'fa-solid fa-box-open',
              url: project.options.base + '/modules/' + module.linkId + '.html',
            },
            {
              title: 'Middlewares',
              icon: 'fa-solid fa-spider',
              url:
                project.options.base +
                '/middlewares/' +
                mod.linkId +
                '-middlewares.html',
            },
            { title: data.name, icon: 'fa-solid fa-spider' },
          ],
          parent: middleware,
        },
        middleware.linkId
      );
    });
  });

  async function clearFiles() {
    rimraf.sync(OUTPUT_DIR);
  }

  async function renderPage(name: string, context: any = {}) {
    const template = pug.compileFile(
      resolve(TEMPLATES_DIR, `pages/${name}.pug`)
    );
    const html = template({
      name: name,
      ...CONTEXT,
      ...context,
    });
    writeFileSync(resolve(HTML_DIR, `${name}.html`), html);
  }

  async function renderItemPage(
    section: string,
    templateName: string,
    context: any,
    id: string
  ) {
    const template = pug.compileFile(
      resolve(TEMPLATES_DIR, `pages/${templateName}.pug`)
    );
    const html = template({
      ...context,
      ...CONTEXT,
    });
    writeFileSync(resolve(HTML_DIR, section, `${id}.html`), html);
  }

  async function createDirs() {
    [
      OUTPUT_DIR,
      CSS_DIR,
      JS_DIR,
      IMAGES_DIR,
      MODULES_DIR,
      SERVICES_DIR,
      CONTROLLERS_DIR,
      ENTITIES_DIR,
      DTO_DIR,
      TYPES_DIR,
      GUARDS_DIR,
      MIDDLEWARES_DIR,
      OUTPUT_LIB_DIR,
    ].forEach(dir => {
      if (!existsSync(dir)) mkdirSync(dir);
    });
  }

  function renderJs() {
    return new Promise((resolve, reject) => {
      const CONFIG: any = createConfig(project);
      webpack(CONFIG, (err, stats) => {
        if (err || stats.hasErrors()) {
          console.log('ERROR', err, stats.toJson());
          return;
        }
        console.log('JS rendered');
        resolve(null);
      });
    });
  }

  async function renderStyles() {
    const css = styla.renderFile(STYLES_INDEX);
    writeFileSync(CSS_BUILD, css);
  }
};
