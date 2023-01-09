// @ts-nocheck

import Prism from 'prismjs';
import query from 'ooi/query';

// @ts-ignore
require('prismjs/components/prism-typescript');
// @ts-ignore
require('prismjs/components/prism-bash');
// @ts-ignore
require('prismjs/components/prism-nginx');
// @ts-ignore
require('prismjs/plugins/line-numbers/prism-line-numbers');
// @ts-ignore
require('prismjs/plugins/line-highlight/prism-line-highlight');

export function init() {
  document.querySelectorAll('.tabs').forEach($tabs => {
    const tabs = Array.from($tabs.querySelectorAll('.tab'));
    tabs.forEach($tab => {
      if ($tab.dataset.active === 'active') {
        activateTab($tabs.dataset.name, $tab.dataset.value);
      }
      $tab.addEventListener('click', ev => {
        activateTab($tabs.dataset.name, $tab.dataset.value);
      });
    });
  });
}

function activateTab(name, value) {
  const tabs = Array.from(
    document.querySelectorAll(`.tabs[data-name="${name}"] .tab`)
  );
  const tab = document.querySelector(
    `.tabs[data-name="${name}"] .tab[data-value="${value}"]`
  );
  tabs.forEach(tab => {
    tab.dataset.active = '';
  });
  tab.dataset.active = 'active';

  const container = document.querySelector(
    `.tabs-container[data-name="${name}"]`
  );
  const contents = Array.from(container.querySelectorAll(`.tab-content`));
  const content = container.querySelector(
    `.tab-content[data-value="${value}"]`
  );
  contents.forEach(elem => {
    elem.style.display = 'none';
  });
  content.style.display = 'block';
  const q = query('?' + location.hash.slice(1));
  q.tab = value;
  location.hash = '#' + query(q);
  if (value === 'source') {
    Prism.highlightAll();
    const elem = document.querySelector('.line-highlight');
    if (!elem) return;
    elem.scrollIntoView();
  }
}
