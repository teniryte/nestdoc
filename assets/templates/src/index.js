// @ts-nocheck

import * as menu from './menu';
import * as tabs from './tabs';
import * as code from './code';
import * as modulesDiagram from './modules-diagram';
import * as toggle from './toggle';
import * as viewer from './viewer';
import * as source from './source';

document.addEventListener('DOMContentLoaded', () => {
  menu.init();
  tabs.init();
  code.init();
  modulesDiagram.init();
  viewer.init();
  // toggle.init();
  source.init();
});
