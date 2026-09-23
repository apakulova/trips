(function () {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = {
    route: document.getElementById('route-view'),
    practice: document.getElementById('practice-view')
  };
  const navs = {
    route: document.getElementById('route-nav'),
    practice: document.getElementById('practice-nav')
  };

  function viewForHash() {
    const target = location.hash && document.querySelector(location.hash);
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
    if (options.updateHash) history.replaceState(null, '', next === 'practice' ? '#bookings' : '#summary');
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
  window.addEventListener('hashchange', () => setView(viewForHash(), {scroll: true}));
  setView(viewForHash());

  if (location.hash) {
    const scrollOnLoad = () => scrollToHash('auto');
    if (document.readyState === 'complete') scrollOnLoad();
    else window.addEventListener('load', scrollOnLoad, {once: true});
  }
})();
