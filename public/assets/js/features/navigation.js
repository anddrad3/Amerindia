export function initNavigation() {
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  function syncTheme() {
    const dark = root.dataset.theme !== 'light';
    toggle.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
    toggle.setAttribute('aria-pressed', String(!dark));
    toggle.querySelector('span').textContent = dark ? '☀' : '☾';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#08080a' : '#f5f5f7';
  }
  toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('amerindia.theme', root.dataset.theme); } catch {}
    syncTheme();
  });
  syncTheme();
  const menu = document.querySelector('#site-menu');
  const open = document.querySelector('#site-menu-toggle');
  const close = document.querySelector('#site-menu-close');
  open.addEventListener('click', () => {
    menu.showModal();
    document.body.classList.add('site-menu-open');
    open.setAttribute('aria-expanded', 'true');
    close.focus();
  });
  close.addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {
    document.body.classList.remove('site-menu-open');
    open.setAttribute('aria-expanded', 'false');
    open.focus();
  });
}
