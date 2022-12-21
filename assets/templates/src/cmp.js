export function create(renderer) {
  return data => {
    const html = renderer(data);
    return html;
  };
}

export function render(cmp, data) {
  const html = cmp(data);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper.children[0];
}

export function each(items, cmp) {
  return items.map(item => cmp(item)).join('');
}
