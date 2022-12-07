// @ts-nocheck

const state = {
  menu: null,
};

export function init() {
  const menu = getMenuElements();
  state.menu = menu;
  setEvents();
  highlightCurrentPage();
}

function filterTextChanged(text) {
  if (text && text.length > 1) {
    toggleMenuItems(false);
    filterItems(text);
  } else {
    toggleMenuItems(true);
  }
}

function filterItems(text) {
  const words = text.toLowerCase().split(' ');

  state.menu.modules.forEach(module => {
    module.sections.forEach(section => {
      section.items.forEach(item => {
        if (!matches(item.name)) return;
        module.elem.style.display = 'block';
        section.elem.style.display = 'block';
        item.elem.style.display = 'block';
      });
    });
  });

  function matches(name) {
    const val = name.toLowerCase();
    return words.filter(word => val.includes(word)).length === words.length;
  }
}

function toggleMenuItems(isVisible = true) {
  state.menu.elem.dataset.filtering = isVisible ? '' : 'filtering';
  state.menu.modules.forEach(module => {
    module.elem.style.display = isVisible ? 'block' : 'none';
    module.sections.forEach(section => {
      section.elem.style.display = isVisible ? 'block' : 'none';
      section.items.forEach(item => {
        item.elem.style.display = isVisible ? 'block' : 'none';
      });
    });
  });
}

function setEvents() {
  // document.querySelectorAll('a').forEach(elem => {
  //   console.log('ELEM', elem);
  // });
  document
    .querySelector('.main-menu-search input')
    .addEventListener('keyup', ev => {
      filterTextChanged(ev.target.value);
    });
}

function highlightCurrentPage() {
  const moduleName = location.pathname.split('/').pop().split('-')[0];
  const entityName = location.pathname
    .split('/')
    .pop()
    .split('-')[1]
    .split('.html')[0];
  const $module = document.querySelector(
    `.main-menu-module[data-name="${moduleName}"]`
  );
  const $item = $module.querySelector(
    `.main-menu-section__items__item[data-name="${entityName}"]`
  );
  const $section = $item.parentElement.parentElement;
  $section.dataset.expanded = 'expanded';
  $item.dataset.active = 'active';
}

function getMenuElements() {
  const $menu = document.querySelector('.main-menu');
  const $modules = Array.from($menu.querySelectorAll('.main-menu-module'));
  const menu = {
    elem: $menu,
    modules: [],
  };
  for (const $module of $modules) {
    const module = {
      name: $module.dataset.name,
      elem: $module,
      sections: [],
    };
    menu.modules.push(module);
    const $sections = Array.from(
      $module.querySelectorAll('.main-menu-section')
    );
    for (const $section of $sections) {
      const section = {
        name: $section.dataset.name,
        elem: $section,
        items: [],
      };
      module.sections.push(section);
      $section.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        $section.dataset.expanded =
          $section.dataset.expanded === 'expanded' ? '' : 'expanded';
      });
      const $items = $section.querySelectorAll(
        '.main-menu-section__items__item'
      );
      $items.forEach($item => {
        const item = {
          name: $item.dataset.name,
          elem: $item,
        };
        section.items.push(item);
        $item.addEventListener('click', ev => {
          ev.stopPropagation();
        });
      });
    }
  }
  return menu;
}
