(function () {
  // Заголовок каждого пункта таймлайна всегда показываем без точки в конце.
  document.querySelectorAll('.timeline .timeline-copy > p:first-child > strong:first-child').forEach(heading => {
    const lastNode = heading.lastChild;
    if (lastNode?.nodeType === Node.TEXT_NODE) {
      lastNode.textContent = lastNode.textContent.replace(/\.\s*$/, '');
    }
  });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = {
    route: document.getElementById('route-view'),
    practice: document.getElementById('practice-view'),
    clothing: document.getElementById('clothing-view')
  };
  const navs = {
    route: document.getElementById('route-nav'),
    practice: document.getElementById('practice-nav'),
    clothing: document.getElementById('clothing-nav')
  };

  function viewForHash() {
    const target = location.hash && document.querySelector(location.hash);
    if (target && panels.clothing.contains(target)) return 'clothing';
    return target && panels.practice.contains(target) ? 'practice' : 'route';
  }

  function scrollToHash(behavior = 'smooth') {
    const hash = location.hash;
    if (!hash) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({behavior, block: 'start'});
      });
    });
  }

  function setView(view, options = {}) {
    const next = panels[view] ? view : 'route';
    Object.entries(panels).forEach(([name, panel]) => { panel.hidden = name !== next; });
    Object.entries(navs).forEach(([name, nav]) => { nav.hidden = name !== next; });
    tabs.forEach(tab => {
      const active = tab.dataset.view === next;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (options.updateHash) history.replaceState(null, '', {route: '#summary', practice: '#bookings', clothing: '#clothing-intro'}[next]);
    if (options.scroll) scrollToHash(options.instant ? 'auto' : 'smooth');
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setView(tab.dataset.view, {updateHash: true, scroll: true}));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      next.focus();
      setView(next.dataset.view, {updateHash: true});
    });
  });

  navs.practice.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setView('practice')));
  navs.route.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setView('route')));
  navs.clothing.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setView('clothing')));
  panels.clothing.querySelectorAll('img[data-sheet]').forEach(image => {
    image.src = `assets/wardrobe-${image.dataset.sheet}.png`;
  });
  window.addEventListener('hashchange', () => setView(viewForHash(), {scroll: true}));
  setView(viewForHash());

  if (location.hash) {
    const scrollOnLoad = () => scrollToHash('auto');
    if (document.readyState === 'complete') scrollOnLoad();
    else window.addEventListener('load', scrollOnLoad, {once: true});
  }
})();
