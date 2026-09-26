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

  const lightbox = document.querySelector('.photo-lightbox');
  if (lightbox?.showModal) {
    const viewport = lightbox.querySelector('.photo-lightbox-viewport');
    const image = lightbox.querySelector('.photo-lightbox-image');
    const counter = lightbox.querySelector('.photo-lightbox-count');
    const previous = lightbox.querySelector('.photo-lightbox-prev');
    const next = lightbox.querySelector('.photo-lightbox-next');
    const zoomOut = lightbox.querySelector('.photo-lightbox-zoom-out');
    const zoomIn = lightbox.querySelector('.photo-lightbox-zoom-in');
    const zoomReset = lightbox.querySelector('.photo-lightbox-zoom-reset');
    const close = lightbox.querySelector('.photo-lightbox-close');
    let photos = [];
    let index = 0;
    let zoom = 1;
    let touchStart = null;
    let pinchStart = null;
    let lastTrigger = null;

    function centerImage() {
      requestAnimationFrame(() => {
        viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
        viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2);
      });
    }

    function fitImage() {
      if (!lightbox.open || !image.naturalWidth || !viewport.clientWidth || !viewport.clientHeight) return;
      const fit = Math.min(viewport.clientWidth / image.naturalWidth, viewport.clientHeight / image.naturalHeight);
      image.style.width = `${Math.round(image.naturalWidth * fit * zoom)}px`;
      image.style.height = `${Math.round(image.naturalHeight * fit * zoom)}px`;
      centerImage();
    }

    function setZoom(value) {
      zoom = Math.min(4, Math.max(1, value));
      zoomOut.disabled = zoom <= 1;
      zoomIn.disabled = zoom >= 4;
      zoomReset.textContent = `${Math.round(zoom * 100)}%`;
      image.style.cursor = zoom > 1 ? 'zoom-out' : 'zoom-in';
      fitImage();
    }

    function showPhoto(newIndex) {
      index = (newIndex + photos.length) % photos.length;
      const photo = photos[index];
      image.style.width = '';
      image.style.height = '';
      image.alt = photo.querySelector('img')?.alt || 'Фото поездки';
      image.src = photo.href;
      counter.textContent = `Фото ${index + 1} из ${photos.length}`;
      previous.disabled = photos.length < 2;
      next.disabled = photos.length < 2;
      setZoom(1);
    }

    document.querySelectorAll('.timeline-photo-strip').forEach(strip => {
      const links = [...strip.querySelectorAll('figure > a[href]')];
      links.forEach((link, photoIndex) => link.addEventListener('click', event => {
        event.preventDefault();
        photos = links;
        lastTrigger = link;
        if (!lightbox.open) lightbox.showModal();
        document.documentElement.classList.add('lightbox-open');
        showPhoto(photoIndex);
        close.focus();
      }));
    });

    image.addEventListener('load', fitImage);
    window.addEventListener('resize', fitImage);
    previous.addEventListener('click', () => showPhoto(index - 1));
    next.addEventListener('click', () => showPhoto(index + 1));
    zoomOut.addEventListener('click', () => setZoom(zoom - .5));
    zoomIn.addEventListener('click', () => setZoom(zoom + .5));
    zoomReset.addEventListener('click', () => setZoom(1));
    close.addEventListener('click', () => lightbox.close());
    image.addEventListener('dblclick', () => setZoom(zoom > 1 ? 1 : 2.5));
    lightbox.addEventListener('close', () => {
      document.documentElement.classList.remove('lightbox-open');
      image.removeAttribute('src');
      photos = [];
      lastTrigger?.focus();
    });
    lightbox.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(index + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(index - 1); }
      if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(zoom + .5); }
      if (event.key === '-') { event.preventDefault(); setZoom(zoom - .5); }
      if (event.key === '0') { event.preventDefault(); setZoom(1); }
    });

    function touchDistance(touches) {
      return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    }

    viewport.addEventListener('touchstart', event => {
      if (event.touches.length === 2) {
        pinchStart = {distance: touchDistance(event.touches), zoom};
        touchStart = null;
      } else if (event.touches.length === 1 && zoom === 1) {
        touchStart = {x: event.touches[0].clientX, y: event.touches[0].clientY};
      }
    }, {passive: true});
    viewport.addEventListener('touchmove', event => {
      if (event.touches.length !== 2 || !pinchStart) return;
      event.preventDefault();
      setZoom(pinchStart.zoom * touchDistance(event.touches) / pinchStart.distance);
    }, {passive: false});
    viewport.addEventListener('touchend', event => {
      if (pinchStart) {
        if (event.touches.length < 2) pinchStart = null;
        touchStart = null;
        return;
      }
      if (!touchStart || event.touches.length || zoom > 1) return;
      const end = event.changedTouches[0];
      const dx = end.clientX - touchStart.x;
      const dy = end.clientY - touchStart.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) showPhoto(index + (dx < 0 ? 1 : -1));
      touchStart = null;
    }, {passive: true});
  }
})();
