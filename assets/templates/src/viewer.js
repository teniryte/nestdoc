// @ts-nocheck

import { create, each, render } from './cmp';

const state = {
  elems: [],
};

const Type = create(
  ({ type, generic }) => `
  <div class="link-viewer-type">
    ${type}
  </div>
`
);

const Property = create(
  ({ name, type, generic }) => `
  <div class="link-viewer-property link-viewer__section__items__item">
    <strong>${name}</strong>:&nbsp;
    <em>${Type({ type, generic })}</em>
  </div>
`
);

const Method = create(
  ({ name, args }) => `
  <div class="link-viewer-property link-viewer__section__items__item">
    <strong>${name}</strong>&nbsp;(
    <em>${args.map(arg => arg.name).join(', ')}</em>
    <strong>)</strong>
  </div>
`
);

const Viewer = create(
  ({ name, main }) => `
  <div class="link-viewer">
    <header>
      <span>class</span>
      <strong>${name}</strong>
    </header>
    ${
      main.comment && main.comment.description
        ? `<div class="link-viewer__description">${main.comment.description}</div>`
        : ''
    }
    ${
      main.properties.length
        ? `<div class="link-viewer__section">
          <div class="link-viewer__section__header">Properties</div>
          <div class="link-viewer__section__items">
            ${each(main.properties, Property)}
          </div>
        </div>`
        : ''
    }
    ${
      main.methods.length
        ? `<div class="link-viewer__section">
          <div class="link-viewer__section__header">Methods</div>
          <div class="link-viewer__section__items">
            ${each(main.methods, Method)}
          </div>
        </div>`
        : ''
    }
  </div>
`
);

async function showLinkViewer(module, type, name, ev) {
  hideLinkViewer();
  const response = await fetch(
    window.BASE_URL + `/json/${module}-${type}-${name}.json`
  );
  const data = await response.json();
  const elem = render(Viewer, data);
  state.elems.push(elem);
  document.body.appendChild(elem);
  elem.style.top = `${ev.pageY + 20}px`;
  elem.style.left = `${ev.pageX + 20}px`;
  setTimeout(() => {
    const y = ev.clientY;
    const height = elem.offsetHeight;
    const windowHeight = window.innerHeight;
    if (y + height < windowHeight) return;
    const diff = windowHeight - (y + height);
    elem.style.top = ev.pageY + diff - 30 + 'px';
  }, 0);
}

function hideLinkViewer() {
  state.elems.forEach(elem => {
    elem.remove();
  });
  state.elems = [];
}

export const init = () => {
  document.querySelectorAll('[data-node-link]').forEach(elem => {
    const url = elem.dataset.nodeLink;
    const parts = url.split('/');
    const type = {
      services: 'service',
      controllers: 'controller',
      entities: 'entity',
      dto: 'dto',
      types: 'type',
      guards: 'guard',
      middlewares: 'middleware',
    }[parts[1]];
    const module = parts[2].split('-')[0];
    const name = parts[2].split('-')[1].split('.')[0];
    elem.addEventListener('mouseenter', ev => {
      showLinkViewer(module, type, name, ev);
    });
    elem.addEventListener('mouseleave', ev => {
      hideLinkViewer();
    });
    elem.addEventListener('mousemove', ev => {
      ev.stopPropagation();
    });
  });
  document.addEventListener('mousemove', ev => {
    hideLinkViewer();
  });
};
