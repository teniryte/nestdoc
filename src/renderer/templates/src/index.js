// @ts-nocheck

import * as menu from './menu';
import * as tabs from './tabs';
import * as code from './code';

document.addEventListener('DOMContentLoaded', () => {
  menu.init();
  tabs.init();
  code.init();
});
