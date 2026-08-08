/* TravelVogue UI layer - local enhancement script */
(function () {
  'use strict';

  function basePath() {
    var parts = location.pathname.split('/').filter(Boolean);
    var depth = Math.max(0, parts.length - 1);
    return '../'.repeat(depth);
  }
  var base = basePath();

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  document.documentElement.classList.add('tv-js');

  /* ---------- Mobile menu (hamburger + drawer) ---------- */
  var burger = $('.button-menu-mobile');
  var drawer = $('#sidebar-nav');
  var drawerClose = $('#close-sidebar-nav');
  function closeDrawer() { if (drawer) drawer.classList.remove('open'); }
  if (burger && drawer) {
    burger.addEventListener('click', function (e) { e.preventDefault(); drawer.classList.toggle('open'); });
  }
  if (drawerClose) drawerClose.addEventListener('click', function (e) { e.preventDefault(); closeDrawer(); });
  document.addEventListener('click', function (e) {
    if (drawer && drawer.classList.contains('open') && !drawer.contains(e.target) && !(burger && burger.contains(e.target))) {
      closeDrawer();
    }
  });

  /* fallback: if no drawer markup exists, expand the inline menu on mobile */
  var navMenu = $('#navigation ul.menu');
  if (burger && navMenu && !drawer) {
    burger.addEventListener('click', function (e) {
      e.preventDefault();
      navMenu.classList.toggle('mobile-open');
    });
  }

  /* ---------- Search toggle ---------- */
  var searchPanel = $('.show-search');
  $all('.search-click').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (searchPanel) {
        var open = searchPanel.classList.toggle('search-open');
        if (open) {
          var input = searchPanel.querySelector('input.search-input');
          if (input) setTimeout(function () { input.focus(); }, 120);
        }
      }
    });
  });

  /* ---------- Hero slider ---------- */
  var hero = $('.penci-custom-slides');
  if (hero) {
    var slides = $all('.swiper-slide', hero);
    var current = 0;
    var autoplayTimer = null;
    var interval = 4500;

    var dots = document.createElement('div');
    dots.className = 'swiper-pagination';
    slides.forEach(function (_, i) {
      var d = document.createElement('span');
      d.className = 'swiper-pagination-bullet' + (i === 0 ? ' active' : '');
      d.setAttribute('role', 'button');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', function () { show(i); restart(); });
      dots.appendChild(d);
    });
    hero.appendChild(dots);

    function show(i) {
      slides.forEach(function (s, idx) { s.classList.toggle('penci-slide-active', idx === i); });
      $all('.swiper-pagination-bullet', dots).forEach(function (d, idx) { d.classList.toggle('active', idx === i); });
      current = i;
    }
    function restart() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(function () { show((current + 1) % slides.length); }, interval);
    }
    if (slides.length > 1) restart();
    show(0);
  }

  /* ---------- Fallback hero backgrounds (theme css unavailable) ---------- */
  var heroSlides = $all('.penci-custom-slides .swiper-slide');
  var heroBg = [
    'wp-content/uploads/2025/04/pexels-photo-2907578-2907578-scaled.jpg',
    'wp-content/uploads/2025/04/a-lone-hiker-with-a-backpack-gazes-at-snow-covered-mountains-in-kashmir-j-k.-6521437-scaled.jpg',
    'wp-content/uploads/2025/04/explore-the-breathtaking-landscapes-of-shallabugh-with-a-solo-hiker-under-a-vibrant-blue-sky.-9405277-scaled.jpg'
  ];
  heroSlides.forEach(function (slide, i) {
    var bg = $('.penci-ctslide-bg', slide);
    if (bg && !bg.style.backgroundImage) {
      bg.style.backgroundImage = 'url(' + base + heroBg[i % heroBg.length] + ')';
    }
  });

  /* ---------- Testimonial / product sliders -> allow wrapping ---------- */
  $all('.penci-testimonails .swiper-wrapper').forEach(function (w) { w.classList.add('tv-wrap'); });

  /* ---------- Search submission ---------- */
  function submitSearch(input) {
    var q = (input.value || '').trim();
    location.href = base + 'search.html' + (q ? '?s=' + encodeURIComponent(q) : '');
  }
  $all('form.pc-searchform, form.wp-block-search').forEach(function (form) {
    form.setAttribute('action', base + 'search.html');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[name="s"], input.search-input, input[type="search"]');
      if (input) submitSearch(input);
    });
  });

  /* ---------- Login / register / password popups ---------- */
  var loginPopup = $('#penci-login-popup');
  function openPopup(innerId) {
    if (!loginPopup) return;
    $all('.penci-login-register', loginPopup).forEach(function (p) { p.classList.add('penci-hidden'); });
    var target = innerId ? $('#' + innerId, loginPopup) : $('#penci-popup-login', loginPopup);
    if (target) target.classList.remove('penci-hidden');
    loginPopup.classList.add('penci-popup-open');
    document.body.style.overflow = 'hidden';
  }
  function closePopup() {
    if (loginPopup) loginPopup.classList.remove('penci-popup-open');
    document.body.style.overflow = '';
  }
  if (loginPopup) {
    $all('a[href="#login"], a[href*="#login"], .penci-login-popup-btn').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openPopup('penci-popup-login'); });
    });
    $all('.penci-register-popup-btn').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openPopup('penci-popup-register'); });
    });
    $all('.penci-lostpassword-btn').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openPopup('penci-popup-passreset'); });
    });
    loginPopup.addEventListener('click', function (e) { if (e.target === loginPopup) closePopup(); });
    var closeBtn = document.createElement('span');
    closeBtn.className = 'penci-popup-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closePopup);
    loginPopup.prepend(closeBtn);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePopup(); });
  }

  /* ---------- Back to top ---------- */
  var topBtn = document.createElement('button');
  topBtn.className = 'penci-go-to-top-floating';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '&#8593;';
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(topBtn);
  window.addEventListener('scroll', function () {
    topBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  /* ---------- Active nav highlighting ---------- */
  var path = location.pathname.replace(/\/index\.html$/, '/');
  $all('#navigation .menu a, #sidebar-nav .menu a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('#')[0].replace(/\/index\.html$/, '/');
    if (href && path.indexOf(href) === 0) a.closest('li').classList.add('current-menu-item');
  });

  /* ---------- Fix images missing alt text ---------- */
  $all('img:not([alt])').forEach(function (img) {
    if (img.width > 40) img.setAttribute('alt', 'TravelVogue');
  });

  /* ---------- Broken image fallback (unreachable originals) ---------- */
  var fallbackPool = [
    base + 'wp-content/uploads/2025/04/pexels-photo-2907578-2907578-scaled.jpg',
    base + 'wp-content/uploads/2025/04/a-lone-hiker-with-a-backpack-gazes-at-snow-covered-mountains-in-kashmir-j-k.-6521437-scaled.jpg',
    base + 'wp-content/uploads/2025/04/explore-the-breathtaking-landscapes-of-shallabugh-with-a-solo-hiker-under-a-vibrant-blue-sky.-9405277-scaled.jpg',
    base + 'wp-content/uploads/2025/04/IMG20240319152149-scaled.jpg',
    base + 'wp-content/uploads/2025/11/generated-image-12-1170x780.png',
    base + 'wp-content/uploads/2025/11/generated-image-13-1170x780.jpg',
    base + 'wp-content/uploads/2025/11/generated-image-14-1170x669.png',
    base + 'wp-content/uploads/2019/10/1920x1080-29.png'
  ];
  function fallbackFor(img) {
    var src = img.getAttribute('src') || '';
    var h = 0;
    for (var i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
    return fallbackPool[h % fallbackPool.length];
  }
  function markBroken(img) {
    if (img.dataset.tvFallback) return;
    img.dataset.tvFallback = '1';
    var fb = fallbackFor(img);
    img.classList.add('tv-fallback-img');
    if (img.getAttribute('srcset')) img.removeAttribute('srcset');
    img.src = fb;
  }
  $all('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.offsetWidth > 20) markBroken(img);
    img.addEventListener('error', function () { markBroken(img); });
  });
})();
