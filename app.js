function typographText(root) {
  const ignoredTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);
  const nodes = [];

  if (root.nodeType === Node.TEXT_NODE) {
    nodes.push(root);
  } else {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
  }

  const shortWord = /(^|[^\p{L}\p{N}])([\p{L}]{1,3})[ \t]+(?=\S|$)/gu;
  nodes.forEach(node => {
    if (!node.nodeValue?.trim() || ignoredTags.has(node.parentElement?.tagName)) return;
    let value = node.nodeValue;
    let previousValue;
    do {
      previousValue = value;
      value = value.replace(shortWord, '$1$2\u00a0');
    } while (value !== previousValue);
    node.nodeValue = value;
  });
}

typographText(document.body);

const typographyObserver = new MutationObserver(records => {
  records.forEach(record => {
    record.addedNodes.forEach(node => typographText(node));
  });
});
typographyObserver.observe(document.body, {childList: true, subtree: true});

const guidesGrid = document.getElementById('guidesGrid');
const countLabels = document.querySelectorAll('[data-guide-count]');

function pluralizeGuides(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} гайдов`;
  if (last === 1) return `${count} гайд`;
  if (last >= 2 && last <= 4) return `${count} гайда`;
  return `${count} гайдов`;
}

function createGuideCard(guide) {
  const link = document.createElement('a');
  link.className = 'guide-card';
  link.href = guide.href;
  link.style.setProperty('--accent', guide.accent);

  const image = document.createElement('img');
  image.className = 'card-cover';
  image.src = guide.cover;
  image.alt = '';
  image.loading = 'lazy';
  image.style.objectPosition = guide.coverPosition || 'center';

  const top = document.createElement('div');
  top.className = 'card-top';

  const kind = document.createElement('span');
  kind.className = 'card-kind';
  kind.textContent = guide.kind;

  const year = document.createElement('span');
  year.className = 'card-year';
  year.textContent = '26';
  year.setAttribute('aria-label', '2026 год');

  const body = document.createElement('div');
  body.className = 'card-body';

  const dates = document.createElement('p');
  dates.className = 'card-dates';
  dates.textContent = guide.dates;

  const titleRow = document.createElement('div');
  titleRow.className = 'card-title-row';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = guide.title;

  const arrow = document.createElement('span');
  arrow.className = 'card-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = guide.description;

  top.append(kind, year);
  titleRow.append(title, arrow);
  body.append(dates, titleRow, description);
  link.append(image, top, body);
  return link;
}

fetch('guides.json')
  .then(response => {
    if (!response.ok) throw new Error('Не удалось загрузить список гайдов');
    return response.json();
  })
  .then(guides => {
    guidesGrid.replaceChildren(...guides.map(createGuideCard));
    const label = pluralizeGuides(guides.length);
    countLabels.forEach(node => { node.textContent = label; });
  })
  .catch(error => {
    guidesGrid.innerHTML = '<p class="loading">Не удалось загрузить гайды. Обновите страницу.</p>';
    console.error(error);
  });
