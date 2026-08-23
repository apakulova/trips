document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app');
  const parts = await Promise.all(['content-a.html', 'schedule.html', 'content-b.html'].map(async file => {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Не удалось загрузить ${file}`);
    return response.text();
  }));

  app.innerHTML = `<div class="page">${parts.join('')}</div>`;

  function typographText(root) {
    const ignoredTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue?.trim() || ignoredTags.has(node.parentElement?.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    // Короткие слова связываем со следующим словом или знаком неразрывным пробелом.
    const shortWord = /(^|[^\p{L}\p{N}])([\p{L}]{1,3})[ \t]+(?=\S|$)/gu;
    nodes.forEach(node => {
      let value = node.nodeValue;
      let previousValue;
      do {
        previousValue = value;
        value = value.replace(shortWord, '$1$2\u00a0');
      } while (value !== previousValue);
      node.nodeValue = value;
    });
  }

  typographText(app);

  const boxes = [...document.querySelectorAll('input[type="checkbox"][data-key]')];
  const bar = document.getElementById('progressBar');
  const label = document.getElementById('progressLabel');

  function update() {
    let done = 0;
    boxes.forEach(cb => {
      const key = 'turkey-guide-' + cb.dataset.key;
      if (localStorage.getItem(key) === '1') cb.checked = true;
      cb.closest('.checkrow')?.classList.toggle('checked', cb.checked);
      if (cb.checked) done++;
    });
    const pct = boxes.length ? (done / boxes.length) * 100 : 0;
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = done + ' из ' + boxes.length;
  }

  boxes.forEach(cb => cb.addEventListener('change', () => {
    localStorage.setItem('turkey-guide-' + cb.dataset.key, cb.checked ? '1' : '0');
    update();
  }));

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    boxes.forEach(cb => {
      localStorage.removeItem('turkey-guide-' + cb.dataset.key);
      cb.checked = false;
    });
    update();
  });

  update();
}).catch(error => {
  document.getElementById('app').innerHTML = '<main style="padding:24px;font-family:system-ui">Не удалось загрузить памятку. Обнови страницу.</main>';
  console.error(error);
});
