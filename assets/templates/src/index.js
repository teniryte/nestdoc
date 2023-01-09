// @ts-nocheck

import * as menu from './menu';
import * as tabs from './tabs';
import * as code from './code';
import * as modulesDiagram from './modules-diagram';
import * as toggle from './toggle';
import * as viewer from './viewer';
import * as source from './source';
import * as router from './router';

document.addEventListener('DOMContentLoaded', async () => {
  await menu.init();
  await tabs.init();
  await code.init();
  await modulesDiagram.init();
  await viewer.init();
  // toggle.init();
  await source.init();
  await router.init();
});
