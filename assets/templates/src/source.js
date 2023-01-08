import Prism from 'prismjs';

export const init = async () => {
  document.querySelectorAll('.source').forEach(highlight);
};

function highlight(elem) {
  const source = elem.innerHTML;
  const language = elem.dataset.source;
  const type = elem.dataset.source;
}
