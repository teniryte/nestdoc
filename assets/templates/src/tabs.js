// @ts-nocheck

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
  if (value === 'source') {
    const elem = document.querySelector('.line-highlight');
    if (!elem) return;
    elem.scrollIntoView();
  }
}
