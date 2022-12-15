export const init = () => {
  document.querySelectorAll('[data-toggle]').forEach(setToggleEvents);
};

function setToggleEvents($container) {
  const name = $container.dataset.toggle;
  $container.querySelector(`[data-toggle-trigger="${name}"]`).addEventListener(
    'click',
    ev => {
      ev.preventDefault();
      const $content = $container.querySelector(
        `[data-toggle-content="${name}"]`
      );
      const expanded = $container.dataset.expanded;
      if (expanded === 'expanded') {
        $container.dataset.expanded = '';
      } else {
        $container.dataset.expanded = 'expanded';
      }
    },
    false
  );
}
