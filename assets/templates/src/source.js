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
// const SCRIPTS = [
//   'https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/prism.min.js',
//   'https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-typescript.min.js',
//   'https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/plugins/line-numbers/prism-line-numbers.min.js',
//   'https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/plugins/line-highlight/prism-line-highlight.min.js',
//   'https://cdnjs.cloudflare.com/ajax/libs/gojs/2.2.19/go.js',
// ];

function loadScript(script) {
  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.src = script;
    document.body.appendChild(scriptElement);
    scriptElement.onload = () => {
      resolve(true);
    };
  });
}

function handle() {
  document.querySelectorAll('.source').forEach(highlight);
  // document.querySelectorAll('pre').forEach(elem => {
  //   const className = elem.className.split(' ')[0];
  //   if (!className.startsWith('language-')) return;
  //   highlight(elem.querySelector('code'), className.split('language-')[1]);
  // });
  document.querySelectorAll('[data-toline]').forEach(elem => {
    const line = elem.dataset.toline;
    elem.addEventListener(
      'click',
      ev => {
        location.hash = `#line=${line}&tab=source`;
        setTimeout(() => {
          document.querySelectorAll('.source').forEach(highlight);
        }, 0);
      },
      false
    );
  });
}

export const init = async () => {
  handle();

  window.addEventListener('hashchange', event => {
    console.log('HASH', location.hash);
  });

  // setTimeout(() => {
  //   Prism.highlightAll();
  //   setTimeout(() => {
  //     Prism.highlightAll();
  //   }, 1000);
  // }, 500);
  // for (const script of SCRIPTS) {
  //   await loadScript(script);
  // }
};

function highlight(elem, language) {
  language = language || elem.dataset.language;
  const source = elem.innerHTML;
  let line = null;
  try {
    line = +location.hash.split('line=')[1].split('&')[0];
  } catch (err) {}
  console.log('LINE', line);
  // const html = Prism.highlight(source, Prism.languages[language], language);
  const wrapper = document.createElement('div');
  wrapper.className = 'line-numbers';
  wrapper.innerHTML =
    `<pre ${
      line ? `data-line="${line}"` : ``
    } style="width: 100%; white-space: wrap;" data-source="${language}"` +
    `class="language-${language} code"><code ` +
    `class="language-${language}">${source}</code></pre>`;
  elem.innerHTML = '';
  elem.appendChild(wrapper);
  // const wrapper = document.createElement('div');
  // wrapper.classList.add('rendered-code');
  // wrapper.innerHTML = html;
  // const container = elem.parentElement.parentElement;
  // container.replaceChild(wrapper, elem.parentElement);
}
