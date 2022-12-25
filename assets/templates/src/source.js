import Prism from 'prismjs';

export const init = async () => {
  document.querySelectorAll('.source').forEach(highlight);
};

function highlight(elem) {
  const source = elem.innerHTML;
  const language = elem.dataset.source;
  console.log('HIGHLIGHT', { source, language });
}
