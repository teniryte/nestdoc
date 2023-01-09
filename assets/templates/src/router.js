// @ts-nocheck
import Prism from 'prismjs';

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

export const init = async () => {
  location.hash = '#tab=info&line=0';
  window.addEventListener('hashchange', event => {
    const tab = location.hash.split('tab=')[1].split('&')[0];
    document.querySelector(`.tab[data-value="${tab}"]`).click();
    setTimeout(() => {
      Prism.highlightAll();
    }, 0);
  });
};
