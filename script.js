(() => {
  const root = document.documentElement;
  const languageButtons = document.querySelectorAll('[data-lang]');
  const heroImage = document.getElementById('hero-image');
  const catalogCardImage = document.getElementById('catalog-card-image');
  const menuButton = document.getElementById('menu-button');
  const nav = document.getElementById('site-nav');
  const search = document.getElementById('gallery-search');
  const grid = document.getElementById('gallery-grid');
  const count = document.getElementById('gallery-count');
  const empty = document.getElementById('empty-state');
  const dialog = document.getElementById('preview-dialog');
  const dialogImage = document.getElementById('dialog-image');
  const dialogTitle = document.getElementById('dialog-title');
  const closeDialog = document.getElementById('dialog-close');

  const previewFiles = [
    '003.png','004.png','0200.png','0201.png','0202.png','0203.png','0204.png','0205.png','0206.png','0207.png','0208.png','0209.png','0210.png','0211.png','0212.png','0214.png','0215.png','0216.png','0217.png','0225.png','0226.png','0227.png','0305B.png','0305L.png','0321A.png','0401.png','0402.png','0403.png','0409.png','0410.png','0411.png','0415.png','0416.png','0420.png','0421.png','0422.png','0423.png','0424.png','0425.png','0426.png','0427.png','0428.png','0430.png','0431.png','0432.png','0433.png','0434.png','0439.png','0440.png','0441.png','0442.png','0443.png','0444.png','0445.png','0449.png','0770.png','421A.png','422A.png','422K.png','B3H3.png','N11.png','RND.png'
  ];

  const queryLanguage = new URLSearchParams(location.search).get('lang');
  let language = ['ru', 'en'].includes(queryLanguage)
    ? queryLanguage
    : (localStorage.getItem('box-types-language') || (navigator.language.toLowerCase().startsWith('en') ? 'en' : 'ru'));
  let filter = 'all';

  const codeOf = file => file.replace('.png', '');
  const familyOf = code => code.startsWith('02') ? '02' : code.startsWith('03') ? '03' : code.startsWith('04') ? '04' : 'other';
  const titleOf = code => /^\d/.test(code) ? `FEFCO ${code}` : code === 'RND' ? (language === 'ru' ? 'Репераунд' : 'Reperaund') : code;

  function applyTheme(theme) {
    const nextTheme = theme === 'night' ? 'night' : 'day';
    root.dataset.theme = nextTheme;
    document.querySelector('meta[name="theme-color"]').setAttribute('content', nextTheme === 'night' ? '#06111b' : '#f5f8fb');
  }

  function automaticTheme() {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  }

  function initialTheme() {
    const mode = localStorage.getItem('packtuning-color-scheme-mode') || 'auto';
    if (mode === 'night' || mode === 'day') return mode;
    if (mode === 'system') return matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    return automaticTheme();
  }

  function applyLanguage(nextLanguage) {
    language = nextLanguage;
    root.lang = language;
    localStorage.setItem('box-types-language', language);
    const url = new URL(location.href);
    if (language === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    history.replaceState(null, '', url);
    document.querySelectorAll('[data-ru][data-en]').forEach(element => {
      element.textContent = element.dataset[language];
    });
    languageButtons.forEach(button => button.classList.toggle('active', button.dataset.lang === language));
    document.querySelectorAll('.social-ru').forEach(link => { link.hidden = language !== 'ru'; });
    heroImage.src = `assets/site/hero-${language}.png`;
    heroImage.alt = language === 'ru'
      ? 'Конструктор типов гофроящиков: библиотека FEFCO, редактор конструкций и параметрические развёртки'
      : 'Corrugated Box Type Designer: FEFCO library, structure editor and parametric die-lines';
    catalogCardImage.src = `assets/site/catalog_banner${language === 'en' ? '_en' : ''}.png`;
    catalogCardImage.alt = language === 'ru' ? 'Каталог программ PackTuning Software' : 'PackTuning Software catalog';
    search.placeholder = language === 'ru' ? 'Код, например 0427' : 'Code, e.g. 0427';
    document.title = language === 'ru'
      ? 'Конструктор типов ящиков — проектирование конструкций гофроупаковки'
      : 'Corrugated Box Type Designer — parametric packaging design';
    renderGallery();
  }

  function renderGallery() {
    const query = search.value.trim().toLowerCase();
    const visible = previewFiles.filter(file => {
      const code = codeOf(file);
      const matchesFilter = filter === 'all' || familyOf(code) === filter;
      return matchesFilter && titleOf(code).toLowerCase().includes(query);
    });
    grid.replaceChildren(...visible.map(file => {
      const code = codeOf(file);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gallery-card';
      card.setAttribute('aria-label', `${language === 'ru' ? 'Открыть' : 'Open'} ${titleOf(code)}`);
      card.innerHTML = `<img src="assets/previews/${file}" alt="${titleOf(code)} — ${language === 'ru' ? 'объёмный вид и развёртка' : '3D view and die-line'}" loading="lazy"><span><strong>${titleOf(code)}</strong><small>${language === 'ru' ? 'Открыть' : 'View'} +</small></span>`;
      card.addEventListener('click', () => openPreview(file));
      return card;
    }));
    count.textContent = visible.length;
    empty.hidden = visible.length > 0;
  }

  function openPreview(file) {
    const code = codeOf(file);
    openImage(`assets/previews/${file}`, titleOf(code), `${titleOf(code)} — ${language === 'ru' ? 'объёмный вид и развёртка' : '3D view and die-line'}`);
  }

  function openImage(src, title, alt = title) {
    dialogImage.src = src;
    dialogImage.alt = alt;
    dialogTitle.textContent = title;
    closeDialog.setAttribute('aria-label', language === 'ru' ? 'Закрыть' : 'Close');
    dialog.showModal();
  }

  applyTheme(initialTheme());
  applyLanguage(language);

  languageButtons.forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.lang)));
  document.querySelectorAll('[data-screen]').forEach(button => button.addEventListener('click', () => {
    openImage(button.dataset.screen, button.dataset[`title${language === 'ru' ? 'Ru' : 'En'}`], button.querySelector('img').alt);
  }));
  search.addEventListener('input', renderGallery);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button));
    renderGallery();
  }));
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
  closeDialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  setInterval(() => {
    if ((localStorage.getItem('packtuning-color-scheme-mode') || 'auto') === 'auto') applyTheme(automaticTheme());
  }, 60 * 1000);
})();
