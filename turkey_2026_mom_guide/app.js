document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app');
  const [contentA, schedule, contentB, spaContent] = await Promise.all(
    ['content-a.html', 'schedule.html', 'content-b.html', 'spa.html'].map(async file => {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Не удалось загрузить ${file}`);
      return response.text();
    })
  );

  app.innerHTML = `<div class="page">${contentA}${contentB}</div>`;

  const checklistSection = app.querySelector('#checklist');
  const quickSection = app.querySelector('.quick');

  if (checklistSection) {
    checklistSection.insertAdjacentHTML('beforebegin', `${schedule}${spaContent}`);
  } else if (quickSection) {
    quickSection.insertAdjacentHTML('beforebegin', `${schedule}${spaContent}`);
  }

  const sectionAnchors = [
    ['Перелёт', 'flight'],
    ['Самое важное', 'packing'],
    ['Как всё будет после', 'arrival'],
    ['Море, бассейн', 'sea'],
    ['Одежда в отеле', 'clothes'],
    ['Деньги', 'money'],
    ['Для номера', 'room'],
    ['Когда кормят', 'food'],
    ['Хамам и массаж', 'spa'],
    ['Твой чек-лист', 'checklist']
  ];

  const sections = [...app.querySelectorAll('.section')];
  sectionAnchors.forEach(([start, id]) => {
    const section = sections.find(item => {
      const title = item.querySelector('h2')?.textContent.replace(/\s+/g, ' ').trim() || '';
      return title.startsWith(start);
    });
    if (section) section.id = id;
  });

  // Убираем повторную оговорку под расписанием — она уже есть в подзаголовке блока.
  app.querySelector('#food .alert')?.remove();

  // В карточках перелёта переносим длительность из отдельной плашки под стрелку.
  app.querySelectorAll('#flight .card').forEach(card => {
    const flight = card.querySelector('.flight');
    const arrow = flight?.querySelector('.arrow');
    const meta = card.querySelector('.meta');
    const metaItems = meta ? [...meta.querySelectorAll('span')] : [];
    if (!flight || !arrow || metaItems.length < 3) return;

    const duration = metaItems[0].textContent.trim();
    const wrap = document.createElement('div');
    wrap.className = 'arrow-wrap';
    wrap.innerHTML = `<div class="arrow">→</div><div class="flight-duration">В пути ${duration}</div>`;
    arrow.replaceWith(wrap);
    metaItems[0].remove();
  });

  // Уточняем блок необязательных расходов.
  const moneyCard = app.querySelector('#money .card.pink');
  if (moneyCard) {
    const title = moneyCard.querySelector('h3');
    const lead = moneyCard.querySelector('.money-lead');
    const list = moneyCard.querySelector('.list');
    if (title) title.textContent = 'Если захочется';
    if (lead) lead.textContent = 'Для чего пригодятся деньги';
    if (list) {
      list.innerHTML = `
        <div class="item"><span class="bullet">✓</span><span>Сувениры и турецкие сладости на базаре — обязательно выделим время просто походить и посмотреть</span></div>
        <div class="item"><span class="bullet">✓</span><span>Хамам и массаж — по отзывам это стоит около $30 с человека</span></div>
        <div class="item"><span class="bullet">✓</span><span>Какая-нибудь мелочь: крем, надувной круг и другое</span></div>
        <div class="item"><span class="bullet">✓</span><span>Экскурсии — это я беру на себя</span></div>
      `;
    }
  }

  const hero = app.querySelector('.hero');
  if (hero) {
    const toc = document.createElement('nav');
    toc.className = 'toc-nav';
    toc.setAttribute('aria-label', 'Оглавление');
    toc.innerHTML = `
      <div class="toc-label">Оглавление</div>
      <div class="toc-chips">
        <a class="toc-chip pink" href="#flight">✈️ Перелёт</a>
        <a class="toc-chip green" href="#packing">🧳 Сборы</a>
        <a class="toc-chip sand" href="#arrival">🛂 Прилёт</a>
        <a class="toc-chip green" href="#sea">🏖 Море</a>
        <a class="toc-chip sand" href="#clothes">👗 Одежда</a>
        <a class="toc-chip pink" href="#money">💳 Деньги</a>
        <a class="toc-chip sand" href="#room">🛏 Для номера</a>
        <a class="toc-chip pink" href="#food">🍽 Еда</a>
        <a class="toc-chip green" href="#spa">🧖‍♀️ Хамам</a>
        <a class="toc-chip sand" href="#checklist">✓ Чек-лист</a>
      </div>
    `;
    hero.insertAdjacentElement('afterend', toc);
  }

  const tocStyle = document.createElement('style');
  tocStyle.textContent = `
    .section[id]{scroll-margin-top:18px}
    .toc-nav{margin:-10px 2px -8px;padding-top:2px}
    .toc-label{margin:0 0 9px 2px;color:var(--muted);font-size:13px;font-weight:800;letter-spacing:.02em}
    .toc-chips{display:flex;flex-wrap:wrap;gap:8px}
    .toc-chip{display:inline-flex;align-items:center;min-height:36px;padding:8px 12px;border:1px solid var(--line);border-radius:999px;text-decoration:none;font-size:13px;font-weight:800;line-height:1;background:var(--paper);box-shadow:0 3px 12px rgba(65,46,45,.04);transition:transform .15s ease,box-shadow .15s ease}
    .toc-chip.pink{background:var(--fuchsia-soft);border-color:#f9c5d8;color:#98244e}
    .toc-chip.green{background:var(--green-soft);border-color:#dbe9b8;color:#4d671f}
    .toc-chip.sand{background:#f4efe8;border-color:#e6d9ce;color:#665d63}
    .toc-chip:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(65,46,45,.08)}
    .toc-chip:focus-visible{outline:3px solid rgba(217,31,104,.2);outline-offset:2px}
    .arrow-wrap{display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
    .arrow-wrap .arrow{height:34px;line-height:34px}
    .flight-duration{margin-top:6px;font-size:14px;line-height:1;color:var(--muted);font-weight:400;white-space:nowrap}
    @media (max-width:640px){
      .toc-nav{margin:-3px 2px -3px}
      .toc-label{font-size:12px;margin-bottom:7px}
      .toc-chips{gap:6px}
      .toc-chip{min-height:32px;padding:7px 10px;font-size:12px}
      .arrow-wrap .arrow{height:29px;line-height:29px}
      .flight-duration{margin-top:6px;font-size:12px}
    }
  `;
  document.head.appendChild(tocStyle);

  const ignoredTypographyTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);

  function typographValue(source) {
    let value = source;

    // Тире связываем с предыдущим словом, чтобы оно не начинало новую строку.
    value = value.replace(/[ \t\u00a0]+[–—-][ \t\u00a0]+/g, '\u00a0— ');

    // Числа не отрываем от единиц измерения, процентов и названий месяцев.
    value = value.replace(
      /(\d(?:[\d.,]*\d)?)[ \t]+(?=(?:кг|г|мл|л|км|м|см|мм|ч|мин|сек|%|°C|руб\.?|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?!\p{L}))/giu,
      '$1\u00a0'
    );
    value = value.replace(/№[ \t]+(?=\d)/g, '№\u00a0');

    // Короткие слова связываем со следующим словом или знаком неразрывным пробелом.
    const shortWord = /(^|[^\p{L}\p{N}])(?<!\d\u00a0)([\p{L}]{1,3})[ \t]+(?=\S|$)/gu;
    let previousValue;
    do {
      previousValue = value;
      value = value.replace(shortWord, '$1$2\u00a0');
    } while (value !== previousValue);

    return value;
  }

  function typographNode(node) {
    if (
      node.nodeType !== Node.TEXT_NODE ||
      !node.nodeValue?.trim() ||
      ignoredTypographyTags.has(node.parentElement?.tagName)
    ) return;

    const value = typographValue(node.nodeValue);
    if (value !== node.nodeValue) node.nodeValue = value;
  }

  function typographText(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      typographNode(root);
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(typographNode);
  }

  typographText(app);

  const typographyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'characterData') typographNode(mutation.target);
      mutation.addedNodes.forEach(typographText);
    });
  });
  typographyObserver.observe(app, { childList: true, characterData: true, subtree: true });

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
