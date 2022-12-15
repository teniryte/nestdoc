// @ts-nocheck

import * as menu from './menu';
import * as tabs from './tabs';
import * as code from './code';
import * as modulesDiagram from './modules-diagram';
import * as toggle from './toggle';

document.addEventListener('DOMContentLoaded', () => {
  menu.init();
  tabs.init();
  code.init();
  modulesDiagram.init();
  // toggle.init();
});
