// Runs before paint, without inline script or a dependency on the page modules.
(() => {
  let theme = 'dark';
  try { if (localStorage.getItem('amerindia.theme') === 'light') theme = 'light'; } catch {}
  document.documentElement.dataset.theme = theme;
})();
