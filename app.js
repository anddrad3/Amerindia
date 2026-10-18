const { researchers, placesData, yanomamiBoard, eventsTimeline } = window.AmerindiaData;

customElements.whenDefined('number-snapper').then(() => {
  const tl = document.querySelector('#timeline');
  const info = tl.querySelector('[slot="info"]');
  tl.shadowRoot.querySelectorAll('li[value]').forEach(li => {
    const v = li.getAttribute('value');
    if (eventsTimeline[v]) li.setAttribute('title', eventsTimeline[v]);
  });
  tl.addEventListener('change', e => {
    const year = e.detail.value;
    let txt = eventsTimeline[year];
    if (!txt) {
      const years = Object.keys(eventsTimeline).map(Number).sort((a,b)=>a-b);
      const closest = years.filter(y => y <= year).pop();
      txt = closest ? eventsTimeline[closest] : '';
    }
    info.textContent = txt;
  });
  info.textContent = eventsTimeline[2026];
});

/* EDITAR ANO */
const yearEditBtn = document.getElementById('year-edit-btn');
const yearInlineEdit = document.getElementById('year-inline-edit');
const yearInput = document.getElementById('year-input');
const yearConfirm = document.getElementById('year-confirm');
function openYearEdit() { yearInput.value = document.getElementById('timeline').getValue(); yearInlineEdit.classList.add('visible'); yearEditBtn.classList.add('active'); setTimeout(() => yearInput.select(), 100); }
function closeYearEdit() { yearInlineEdit.classList.remove('visible'); yearEditBtn.classList.remove('active'); }
function applyYearEdit() { const y = parseInt(yearInput.value); if (!isNaN(y)) document.getElementById('timeline').setValue(y); closeYearEdit(); }
yearEditBtn.addEventListener('click', () => { yearInlineEdit.classList.contains('visible') ? closeYearEdit() : openYearEdit(); });
yearConfirm.addEventListener('click', applyYearEdit);
yearInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyYearEdit(); if (e.key === 'Escape') closeYearEdit(); });
yearInput.addEventListener('blur', () => { setTimeout(() => { if (document.activeElement !== yearConfirm) applyYearEdit(); }, 150); });

/* MAPA */
const markerSvgActive = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="18" fill="#FF6A1A" fill-opacity="0.20"/><circle cx="22" cy="22" r="12" fill="#FF6A1A" fill-opacity="0.40"/><circle cx="22" cy="22" r="7" fill="#FF6A1A" stroke="#0a0a0c" stroke-width="2.5"/></svg>`;
const markerSvgLocked = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="14" fill="#98989d" fill-opacity="0.12"/><circle cx="18" cy="18" r="9" fill="#98989d" fill-opacity="0.22"/><circle cx="18" cy="18" r="5" fill="#636366" stroke="#0a0a0c" stroke-width="2"/></svg>`;
const markerActive = 'data:image/svg+xml;utf8,' + encodeURIComponent(markerSvgActive);
const markerLocked = 'data:image/svg+xml;utf8,' + encodeURIComponent(markerSvgLocked);
const styleActive = new ol.style.Style({ image: new ol.style.Icon({ src: markerActive, anchor: [0.5, 0.5], scale: 1 }) });
const styleLocked = new ol.style.Style({ image: new ol.style.Icon({ src: markerLocked, anchor: [0.5, 0.5], scale: 1 }) });
const LATIN_AMERICA_BOUNDS = [-118.6, -56.6, -30.0, 33.4];
const LATIN_AMERICA_EXTENT = ol.proj.transformExtent(LATIN_AMERICA_BOUNDS, 'EPSG:4326', 'EPSG:3857');
const BRAZIL_START_CENTER = ol.proj.fromLonLat([-54.0, -14.0]);
const LATIN_AMERICA_DESKTOP_START_ZOOM = 5.0;
const LATIN_AMERICA_MOBILE_START_ZOOM = 3.75;
const LATIN_AMERICA_PLACE_IDS = new Set(['yanomami', 'maya', 'quechua', 'mapuche', 'xingu', 'pataxo']);
const latinAmericaPlaces = placesData.filter(p => LATIN_AMERICA_PLACE_IDS.has(p.id));
const features = latinAmericaPlaces.map(p => {
  const f = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat([p.lon, p.lat])), placeInfo: p });
  f.setStyle(p.complete ? styleActive : styleLocked);
  return f;
});
const vectorSource = new ol.source.Vector({ features });
const vectorLayer = new ol.layer.Vector({ source: vectorSource, updateWhileAnimating: true, updateWhileInteracting: true });
const baseTileLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    urls: [
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    ],
    attributions: 'Â© OpenStreetMap Â· Â© CARTO',
    maxZoom: 19,
    crossOrigin: 'anonymous'
  })
});
const osmTileLayer = new ol.layer.Tile({
  visible: false,
  source: new ol.source.OSM({
    attributions: 'Â© OpenStreetMap contributors',
    crossOrigin: 'anonymous'
  })
});
const view = new ol.View({
  center: BRAZIL_START_CENTER,
  zoom: getLatinAmericaStartZoom(),
  maxZoom: 18,
  minZoom: getLatinAmericaStartZoom(),
  extent: LATIN_AMERICA_EXTENT,
  constrainOnlyCenter: true,
  smoothExtentConstraint: false,
  smoothResolutionConstraint: false,
  showFullExtent: true
});
const map = new ol.Map({
  target: 'map', view,
  layers: [
    baseTileLayer,
    osmTileLayer,
    vectorLayer
  ],
  controls: ol.control.defaults.defaults({ attributionOptions: { collapsible: true }, rotate: false })
});

function syncLatinAmericaMapConstraints({ reset = false } = {}) {
  const size = map.getSize();
  if (!size || !size[0] || !size[1]) return;

  const startZoom = getLatinAmericaStartZoom();
  const previousMinZoom = view.getMinZoom();
  view.setMinZoom(startZoom);

  if (reset) {
    view.setZoom(startZoom);
    view.setCenter(BRAZIL_START_CENTER);
  }

  const currentZoom = view.getZoom();
  if (!reset && Number.isFinite(currentZoom) && Math.abs(currentZoom - previousMinZoom) < 0.02 && currentZoom > startZoom) {
    view.setZoom(startZoom);
  }
  if (!Number.isFinite(currentZoom) || currentZoom < view.getMinZoom()) {
    view.setZoom(view.getMinZoom());
  }

  clampViewToLatinAmerica();
}

function getLatinAmericaStartZoom() {
  return isMobileViewport() ? LATIN_AMERICA_MOBILE_START_ZOOM : LATIN_AMERICA_DESKTOP_START_ZOOM;
}

function clampViewToLatinAmerica() {
  const center = view.getCenter();
  if (!center) return;

  const nextX = Math.max(LATIN_AMERICA_EXTENT[0], Math.min(LATIN_AMERICA_EXTENT[2], center[0] || BRAZIL_START_CENTER[0]));
  const nextY = Math.max(LATIN_AMERICA_EXTENT[1], Math.min(LATIN_AMERICA_EXTENT[3], center[1] || BRAZIL_START_CENTER[1]));

  if (Math.abs(nextX - center[0]) > 1 || Math.abs(nextY - center[1]) > 1) {
    view.setCenter([nextX, nextY]);
  }
}

map.once('postrender', () => syncLatinAmericaMapConstraints({ reset: true }));
map.on('moveend', clampViewToLatinAmerica);

/* TOOLTIP */
const tooltip = document.getElementById('map-tooltip');
const tipImg = document.getElementById('tip-img');
const tipName = document.getElementById('tip-name');
const tipMeta = document.getElementById('tip-meta');
const tipMetaText = document.getElementById('tip-meta-text');
const tipQuote = document.getElementById('tip-quote');
const tipAction = document.getElementById('tip-action');
const tipActionText = document.getElementById('tip-action-text');
let currentHoverFeature = null;
function showTooltip(info, pixel) {
  if (currentHoverFeature !== info) {
    tipImg.src = info.previewImage; tipImg.alt = info.name;
    tipName.textContent = info.name;
    tipMetaText.textContent = `${info.region} Â· ${info.population}`;
    tipQuote.textContent = info.previewQuote;
    if (info.complete) { tipMeta.classList.remove('locked'); tipAction.classList.remove('locked'); tipAction.querySelector('i').className='fa-solid fa-magnifying-glass'; tipActionText.textContent='Encontrar'; }
    else { tipMeta.classList.add('locked'); tipAction.classList.add('locked'); tipAction.querySelector('i').className='fa-solid fa-clock'; tipActionText.textContent='Em breve'; }
    currentHoverFeature = info;
  }
  positionTooltip(pixel); tooltip.classList.add('visible');
}
function positionTooltip(pixel) {
  const rect = map.getTargetElement().getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const tipW = tipRect.width || 240, tipH = tipRect.height || 200;
  const offset = 16;
  let x = rect.left + pixel[0] + offset, y = rect.top + pixel[1] - tipH - offset;
  const maxX = window.innerWidth - tipW - 8;
  if (x > maxX) x = rect.left + pixel[0] - tipW - offset;
  if (x < 8) x = 8;
  if (y < 8) y = rect.top + pixel[1] + offset;
  if (y + tipH > window.innerHeight - 8) y = window.innerHeight - tipH - 8;
  tooltip.style.left = `${x}px`; tooltip.style.top = `${y}px`;
}
function hideTooltip() { tooltip.classList.remove('visible'); currentHoverFeature = null; }
map.on('pointermove', e => {
  if (e.dragging) { hideTooltip(); return; }
  const feature = map.forEachFeatureAtPixel(e.pixel, f => f, { hitTolerance: 4 });
  if (feature) { map.getTargetElement().style.cursor = 'pointer'; showTooltip(feature.get('placeInfo'), e.pixel); }
  else { map.getTargetElement().style.cursor = ''; hideTooltip(); }
});
map.on('movestart', hideTooltip);

/* TOAST */
const toastEl = document.getElementById('toast'), toastMsg = document.getElementById('toast-msg');
let toastTimer = null;
function showToast(msg) { toastMsg.textContent = msg; toastEl.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2800); }

/* CHAT STORE */
const chatStore = {
  chats: [], currentId: null,
  newChat(place = null) {
    const id = 'c' + Date.now() + Math.random().toString(36).slice(2,5);
    const title = place ? place.name : 'Nova board';
    const chat = { id, title, place, messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    this.chats.unshift(chat); this.currentId = id; return chat;
  },
  current() { return this.chats.find(c => c.id === this.currentId) || null; },
  switchTo(id) { if (this.chats.find(c => c.id === id)) { this.currentId = id; return true; } return false; },
  delete(id) {
    const idx = this.chats.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const wasCurrent = this.currentId === id;
    this.chats.splice(idx, 1);
    if (wasCurrent) this.currentId = this.chats[0]?.id || null;
    return true;
  },
  appendMessage(role, content, extras = {}) {
    const c = this.current(); if (!c) return;
    c.messages.push({ role, content, ...extras }); c.updatedAt = Date.now();
    if (!c.place && c.title === 'Nova board' && role === 'user') {
      c.title = content.length > 40 ? content.slice(0, 40) + 'â€¦' : content;
    }
  }
};

/* CHAT UI */
const app = document.getElementById('app');
const mapPane = document.querySelector('.map-pane');
const paneDivider = document.getElementById('pane-divider');
const chatPane = document.getElementById('chat-pane');
const boardSurface = document.getElementById('board-surface');
const chatMessages = document.getElementById('chat-messages');
const chatTitle = document.getElementById('chat-title');
const chatSubtitle = document.getElementById('chat-subtitle');
const chatCloseBtn = document.getElementById('chat-close');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const chatInputForm = document.getElementById('chat-input-form');
const chatInputField = document.getElementById('chat-input-field');
const chatSendBtn = chatInputForm?.querySelector('.send-btn');
const chatSendIcon = chatSendBtn?.querySelector('i');
const boardSearchStatus = document.getElementById('board-search-status');
const suggestionsEl = document.getElementById('suggestions');
const floatingSearch = document.getElementById('floating-search');
const searchInput = document.getElementById('search-input');
const floatingSearchStatus = document.getElementById('floating-search-status');
const floatingSendBtn = floatingSearch?.querySelector('.send-btn');
const floatingSendIcon = floatingSendBtn?.querySelector('i');
const sidebarList = document.getElementById('sidebar-list');
const newChatBtn = document.getElementById('new-chat-btn');
const contextChip = document.getElementById('context-chip');
const contextChipName = document.getElementById('context-chip-name');
const contextClearBtn = document.getElementById('context-clear');
const siteMenuToggle = document.getElementById('site-menu-toggle');
const siteMenu = document.getElementById('site-menu');
const siteMenuViews = siteMenu ? Array.from(siteMenu.querySelectorAll('[data-site-menu-view]')) : [];
const peopleSearchInput = document.getElementById('people-search-input');
const peopleSearchClear = document.getElementById('people-search-clear');
const peopleSearchEmpty = document.getElementById('people-search-empty');
const peopleRows = siteMenu ? Array.from(siteMenu.querySelectorAll('.people-row')) : [];

let isWaitingResponse = false;
let selectedPlace = null;
chatInputField.placeholder = 'Adicionar pergunta, nota ou evento...';
chatSubtitle.textContent = 'Mapa e board dos povos originÃ¡rios';
const DESKTOP_SPLIT_DEFAULT = 50;
const DESKTOP_SPLIT_MIN = 32;
const DESKTOP_SPLIT_MAX = 68;

function isMobileViewport() { return window.matchMedia('(max-width: 768px)').matches; }
function setAppViewportHeight() {
  const h = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
  document.documentElement.style.setProperty('--app-h', `${Math.round(h)}px`);
}
function syncWorkspaceLayout({ fitBoards = true } = {}) {
  map.updateSize();
  syncLatinAmericaMapConstraints();
  if (fitBoards) document.querySelectorAll('.board-widget').forEach(w => w._api?.fit?.());
}
function setDesktopSplit(percent) {
  const appWidth = app ? app.getBoundingClientRect().width : (window.innerWidth || 1440);
  const dividerWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--divider-w')) || 22;
  const minSplit = Math.max(DESKTOP_SPLIT_MIN, (320 / appWidth) * 100);
  const maxSplit = Math.min(DESKTOP_SPLIT_MAX, ((appWidth - 380 - dividerWidth) / appWidth) * 100);
  const next = Math.max(minSplit, Math.min(maxSplit, percent));
  document.documentElement.style.setProperty('--map-split', `${next}%`);
  return next;
}
function resolvePlaceBoardId(place) {
  return place?.id === 'yanomami' && place.complete ? 'yanomami' : null;
}
function handleViewportResize() {
  setAppViewportHeight();
  requestAnimationFrame(() => syncWorkspaceLayout({ fitBoards: false }));
}
setAppViewportHeight();
setDesktopSplit(DESKTOP_SPLIT_DEFAULT);
window.addEventListener('resize', handleViewportResize, { passive: true });
window.visualViewport?.addEventListener('resize', handleViewportResize, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(handleViewportResize, 250), { passive: true });

function setSiteMenuView(viewName, { focus = true } = {}) {
  if (!siteMenuViews.length) return;
  siteMenuViews.forEach(view => {
    const active = view.dataset.siteMenuView === viewName;
    view.classList.toggle('is-active', active);
    view.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  const activeView = siteMenuViews.find(view => view.dataset.siteMenuView === viewName);
  const focusTarget = activeView?.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
  if (focus && focusTarget) setTimeout(() => focusTarget.focus({ preventScroll: true }), 120);
}

function openSiteMenu(viewName = 'home') {
  if (!siteMenu || !siteMenuToggle) return;
  if (mapPane.classList.contains('source-open')) closeSourcePanel();
  if (app.classList.contains('chat-open')) closeChat();
  document.body.classList.add('site-menu-open');
  siteMenu.setAttribute('aria-hidden', 'false');
  siteMenuToggle.setAttribute('aria-expanded', 'true');
  siteMenuToggle.setAttribute('aria-label', 'Fechar menu');
  setSiteMenuView(viewName);
  hideTooltip();
}

function closeSiteMenu() {
  if (!siteMenu || !siteMenuToggle) return;
  document.body.classList.remove('site-menu-open');
  siteMenu.setAttribute('aria-hidden', 'true');
  siteMenuToggle.setAttribute('aria-expanded', 'false');
  siteMenuToggle.setAttribute('aria-label', 'Abrir menu');
  siteMenuToggle.focus({ preventScroll: true });
  setTimeout(() => setSiteMenuView('home', { focus: false }), 220);
}

function handleSiteMenuAction(action) {
  const viewMap = {
    home: 'home',
    povos: 'povos',
    sobre: 'sobre',
    yanomami: 'yanomami'
  };
  if (viewMap[action]) setSiteMenuView(viewMap[action]);
}

siteMenuToggle?.addEventListener('click', () => {
  document.body.classList.contains('site-menu-open') ? closeSiteMenu() : openSiteMenu();
});
siteMenu?.addEventListener('click', e => {
  const actionEl = e.target.closest('[data-site-menu-action]');
  if (!actionEl || actionEl.disabled) return;
  handleSiteMenuAction(actionEl.dataset.siteMenuAction);
});

function escapeHtml(s = '') { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function touchCurrentChat() {
  const c = chatStore.current();
  if (c) c.updatedAt = Date.now();
}
function normalizeSearchText(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
function findSearchPlace(text) {
  const query = normalizeSearchText(text);
  if (!query) return null;
  return latinAmericaPlaces.find(place => {
    if (!place.complete) return false;
    const name = normalizeSearchText(place.name);
    return query === name || query.includes(name) || name.includes(query);
  }) || null;
}

function clampNumber(value, min, max, fallback = max) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function setTimelineYearEditor(form, btn, input, isOpen, value) {
  if (!form || !btn || !input) return;
  form.classList.toggle('visible', Boolean(isOpen));
  btn.classList.toggle('active', Boolean(isOpen));
  if (isOpen) {
    input.value = value;
    setTimeout(() => {
      input.focus({ preventScroll: true });
      input.select();
    }, 40);
  }
}

function extractResearchYear(meta = '') {
  const matches = String(meta).match(/\b(19|20)\d{2}\b/g);
  if (!matches?.length) return null;
  return Number(matches[matches.length - 1]);
}

const menuResearchItems = Object.entries(researchers).map(([key, researcher]) => ({
  key,
  people: 'Yanomami',
  researcher: researcher.name,
  title: researcher.research?.title || 'Pesquisa',
  meta: researcher.research?.meta || '',
  summary: researcher.research?.summary || '',
  year: extractResearchYear(researcher.research?.meta || researcher.research?.title || '')
})).filter(item => Number.isFinite(item.year));

function syncPeopleSearch() {
  if (!peopleSearchInput) return;
  const query = normalizeSearchText(peopleSearchInput.value);
  let visibleCount = 0;
  peopleRows.forEach(row => {
    const haystack = normalizeSearchText(row.textContent || '');
    const visible = !query || haystack.includes(query);
    row.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  if (peopleSearchEmpty) peopleSearchEmpty.hidden = visibleCount > 0;
  if (peopleSearchClear) peopleSearchClear.classList.toggle('visible', Boolean(query));
}

function renderMenuResearchResults(root, year) {
  const results = root.querySelector('[data-menu-research-results]');
  const snapper = root.querySelector('.menu-timeline-snapper');
  const info = snapper?.querySelector('[slot="info"]');
  if (!results) return;
  const matches = menuResearchItems.filter(item => item.year === year);
  if (info) {
    info.textContent = matches.length
      ? `${matches.length} pesquisa${matches.length > 1 ? 's' : ''} publicada${matches.length > 1 ? 's' : ''} em ${year}`
      : `Nenhuma pesquisa cadastrada para ${year}`;
  }
  if (!matches.length) {
    const nearest = menuResearchItems.slice().sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year))[0];
    results.innerHTML = `<div class="menu-research-empty">
      <strong>Nenhuma pesquisa cadastrada para ${year}.</strong>
      <span>${nearest ? `Ano mais próximo no acervo: ${nearest.year}, ${escapeHtml(nearest.title)}.` : 'Use outro ano da timeline.'}</span>
    </div>`;
    return;
  }
  results.innerHTML = matches.map(item => `<article class="menu-research-item">
    <div class="menu-research-year">${item.year}</div>
    <div>
      <p>${escapeHtml(item.people)} · ${escapeHtml(item.researcher)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <small>${escapeHtml(item.meta)}</small>
      <span>${escapeHtml(item.summary)}</span>
    </div>
  </article>`).join('');
}

function initMenuResearchTimelines() {
  const roots = siteMenu ? Array.from(siteMenu.querySelectorAll('[data-menu-research-timeline]')) : [];
  roots.forEach(root => {
    const snapper = root.querySelector('.menu-timeline-snapper');
    const editBtn = root.querySelector('[data-menu-timeline-edit]');
    const editForm = root.querySelector('[data-menu-timeline-form]');
    const editInput = root.querySelector('[data-menu-timeline-input]');
    if (!snapper) return;
    const min = parseInt(snapper.getAttribute('min'), 10);
    const max = parseInt(snapper.getAttribute('max'), 10);
    const render = year => renderMenuResearchResults(root, clampNumber(year, min, max, max));

    customElements.whenDefined('number-snapper').then(() => {
      const ticks = Array.from(snapper.shadowRoot?.querySelectorAll('li[value]') || []);
      menuResearchItems.forEach(item => {
        const tick = ticks.find(li => Math.round(parseFloat(li.getAttribute('value'))) === item.year);
        if (tick) tick.setAttribute('title', `${item.year}: ${item.title}`);
      });
      snapper.addEventListener('change', e => render(e.detail.value));
      snapper.setValue(max);
    });

    editBtn?.addEventListener('click', () => {
      const open = !editForm.classList.contains('visible');
      setTimelineYearEditor(editForm, editBtn, editInput, open, snapper.getValue ? snapper.getValue() : max);
    });
    editForm?.addEventListener('submit', e => {
      e.preventDefault();
      const year = clampNumber(editInput.value, min, max, max);
      snapper.setValue(year);
      setTimelineYearEditor(editForm, editBtn, editInput, false, year);
    });
    editInput?.addEventListener('keydown', e => {
      if (e.key === 'Escape') setTimelineYearEditor(editForm, editBtn, editInput, false, snapper.getValue ? snapper.getValue() : max);
    });
  });
}

peopleSearchInput?.addEventListener('input', syncPeopleSearch);
peopleSearchClear?.addEventListener('click', () => {
  peopleSearchInput.value = '';
  syncPeopleSearch();
  peopleSearchInput.focus({ preventScroll: true });
});
initMenuResearchTimelines();

function setSendButtonBusy(sendBtn, sendIcon, input, isBusy) {
  if (!sendBtn || !sendIcon) return;
  sendBtn.disabled = isBusy;
  sendBtn.classList.toggle('loading', isBusy);
  sendBtn.setAttribute('aria-busy', isBusy ? 'true' : 'false');
  sendIcon.className = isBusy ? 'fa-solid fa-spinner' : 'fa-solid fa-paper-plane';
  if (input) input.readOnly = isBusy;
}
function setFloatingSearchStatus(label = '') {
  if (!floatingSearchStatus) return;
  if (!label) {
    floatingSearchStatus.hidden = true;
    floatingSearchStatus.innerHTML = '';
    return;
  }
  floatingSearchStatus.hidden = false;
  floatingSearchStatus.innerHTML = `<div class="locating-pill"><div class="spinner"></div><span>Localizando <span class="target">${escapeHtml(label)}</span></span></div>`;
}
function setFloatingSearchBusy(isBusy) {
  setSendButtonBusy(floatingSendBtn, floatingSendIcon, searchInput, isBusy);
}
function clearFloatingSearchUi() {
  setFloatingSearchStatus('');
  setFloatingSearchBusy(false);
}
function setBoardSearchStatus(label = '') {
  if (!boardSearchStatus) return;
  if (!label) {
    boardSearchStatus.hidden = true;
    boardSearchStatus.innerHTML = '';
    return;
  }
  boardSearchStatus.hidden = false;
  boardSearchStatus.innerHTML = `<div class="locating-pill"><div class="spinner"></div><span>Localizando <span class="target">${escapeHtml(label)}</span></span></div>`;
}
function setChatInputBusy(isBusy) {
  setSendButtonBusy(chatSendBtn, chatSendIcon, chatInputField, isBusy);
}
function clearBoardSearchUi() {
  setBoardSearchStatus('');
  setChatInputBusy(false);
}
function lightMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  html = html.replace(/`([^`\n]+?)`/g, '<code>$1</code>');
  return html.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
}

function renderCardMedia(media = []) {
  if (!media || !media.length) return '';
  const items = media.map(item => {
    const label = escapeHtml(item.label || 'MÃ­dia');
    if (item.type === 'audio') {
      return `<button type="button" class="media-pill media-audio" data-audio-sim="${escapeHtml(item.id || 'audio_sim')}" aria-label="Tocar ${label}"><i class="fa-solid fa-volume-high"></i><span class="media-label">${label}</span><span class="media-wave" aria-hidden="true"><span></span><span></span><span></span><span></span></span></button>`;
    }
    if (item.type === 'video') {
      return `<button type="button" class="media-video" data-video-sim="${escapeHtml(item.id || 'video_sim')}" aria-label="Reproduzir ${label}"><span class="video-frame"><i class="fa-solid fa-play"></i></span><span class="media-label">${label}</span></button>`;
    }
    const icon = item.type === 'photo' ? 'fa-images' : item.type === 'doc' ? 'fa-file-lines' : 'fa-clapperboard';
    return `<button type="button" class="media-chip" data-media-note="${label}"><i class="fa-solid ${icon}"></i><span class="media-label">${label}</span></button>`;
  }).join('');
  return `<div class="bc-media">${items}</div>`;
}

function upgradeBoardImageUrl(url, width = 1600) {
  let out = String(url || '');
  if (/([?&])w=\d+/.test(out)) out = out.replace(/([?&])w=\d+/, `$1w=${width}`);
  else out += (out.includes('?') ? '&' : '?') + `w=${width}`;
  if (/([?&])q=\d+/.test(out)) out = out.replace(/([?&])q=\d+/, '$1q=90');
  else out += '&q=90';
  return out;
}
function boardImageSrcSet(url) {
  return [800, 1200, 1600].map(w => `${upgradeBoardImageUrl(url, w)} ${w}w`).join(', ');
}

const BOARD_TIMELINE_MIN = 1960;
const BOARD_TIMELINE_MAX = 2026;
let currentBoardYear = BOARD_TIMELINE_MAX;

function renderBoardWidget(boardId, highlightCardId) {
  const year = Math.max(BOARD_TIMELINE_MIN, Math.min(BOARD_TIMELINE_MAX, parseInt(currentBoardYear || BOARD_TIMELINE_MAX, 10)));
  return `<div class="board-widget" data-board="${boardId}" data-year="${year}"${highlightCardId ? ` data-highlight="${highlightCardId}"` : ''}>
    <div class="board-viewport">
      <div class="board-canvas">
        <svg class="board-arrows"></svg>
        <div class="board-cards-container"></div>
      </div>
      <div class="board-timeline">
        <button type="button" class="board-timeline-toggle" data-board-timeline-toggle aria-expanded="false" aria-label="Abrir linha do tempo">
          <span data-board-timeline-year>${year}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <number-snapper class="board-timeline-snapper" label="Linha do tempo" min="${BOARD_TIMELINE_MIN}" max="${BOARD_TIMELINE_MAX}" step="1" value="${year}" snap="none" interval="5" ticks="${BOARD_TIMELINE_MAX - BOARD_TIMELINE_MIN}">
          <small slot="info"></small>
        </number-snapper>
        <button type="button" class="timeline-edit-btn board-timeline-edit-btn" data-board-timeline-edit aria-label="Editar ano"><i class="fa-solid fa-pen"></i></button>
        <form class="timeline-year-editor board-timeline-editor" data-board-timeline-form>
          <input type="number" min="${BOARD_TIMELINE_MIN}" max="${BOARD_TIMELINE_MAX}" step="1" data-board-timeline-input aria-label="Ano da timeline">
          <button type="submit" aria-label="Filtrar ano"><i class="fa-solid fa-check"></i></button>
        </form>
      </div>
      <div class="zoom-indicator">100%</div>
      <div class="board-controls">
        <button class="bc-control" data-action="zoom-in" title="+"><i class="fa-solid fa-plus"></i></button>
        <button class="bc-control" data-action="zoom-out" title="-"><i class="fa-solid fa-minus"></i></button>
        <button class="bc-control" data-action="fit" title="Ajustar"><i class="fa-solid fa-expand-arrows-alt"></i></button>
        <button class="bc-control fs-btn" data-action="fullscreen" title="Tela cheia" aria-label="Tela cheia"><i class="fa-solid fa-expand"></i></button>
      </div>
      <button class="fs-close-btn" data-action="exit-fullscreen" aria-label="Sair tela cheia"><i class="fa-solid fa-xmark"></i></button>
    </div>
  </div>`;
}

function renderBoardStage(boardId, highlightCardId) {
  chatPane.classList.add('board-mode');
  boardSurface.setAttribute('aria-hidden', 'false');
  boardSurface.innerHTML = '';
  const stage = document.createElement('section');
  stage.className = 'board-stage';
  stage.innerHTML = renderBoardWidget(boardId, highlightCardId);
  boardSurface.appendChild(stage);
  requestAnimationFrame(() => {
    const widget = stage.querySelector(`[data-board="${boardId}"]`);
    if (widget) initBoard(widget, boardId, highlightCardId);
  });
  return stage;
}

function renderMessage(role, content, opts = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `msg ${role}`;
  const avatar = role === 'assistant'
    ? `<div class="msg-avatar"><i class="fa-solid fa-magnifying-glass"></i></div>`
    : `<div class="msg-avatar">VC</div>`;
  const name = role === 'assistant' ? 'AmerÃ­ndia' : 'VocÃª';
  let body;
  if (opts.typing) body = `<div class="typing"><span></span><span></span><span></span></div>`;
  else if (opts.locating) body = `<div class="locating-pill"><div class="spinner"></div><span>Localizando <span class="target">${escapeHtml(opts.locating)}</span> no mapa do tempoâ€¦</span></div>`;
  else {
    body = lightMarkdown(content);
    if (opts.boardId && !findLastBoardWidget(opts.boardId)) body += renderBoardWidget(opts.boardId, opts.highlightCardId);
  }
  wrapper.innerHTML = `${avatar}<div class="msg-content"><div class="msg-name">${name}</div><div class="msg-text">${body}</div></div>`;
  chatMessages.appendChild(wrapper);
  if (!opts.typing && !opts.locating && opts.boardId && wrapper.querySelector(`[data-board="${opts.boardId}"]`)) {
    requestAnimationFrame(() => {
      const widget = wrapper.querySelector(`[data-board="${opts.boardId}"]`);
      if (widget) initBoard(widget, opts.boardId, opts.highlightCardId);
    });
  }
  requestAnimationFrame(() => { chatMessages.scrollTop = chatMessages.scrollHeight; });
  return wrapper;
}

function clearMessages() {
  chatPane.classList.remove('board-mode');
  chatMessages.innerHTML = '';
  boardSurface.innerHTML = '';
  boardSurface.setAttribute('aria-hidden', 'true');
  clearBoardSearchUi();
}
function showSuggestions(items) {
  suggestionsEl.innerHTML = '';
  items.forEach(text => {
    const chip = document.createElement('button');
    chip.type = 'button'; chip.className = 'suggestion-chip'; chip.textContent = text;
    chip.addEventListener('click', () => { hideSuggestions(); sendUserMessage(text); });
    suggestionsEl.appendChild(chip);
  });
  suggestionsEl.hidden = false;
}
function hideSuggestions() { suggestionsEl.hidden = true; suggestionsEl.innerHTML = ''; }

function updateContextChip() {
  if (selectedPlace) { contextChipName.textContent = selectedPlace.name; contextChip.classList.add('visible'); }
  else { contextChip.classList.remove('visible'); }
}
function legacyOldUpdateChatHeader() {
  const c = chatStore.current();
  if (c?.place) { chatTitle.textContent = c.place.name; chatSubtitle.textContent = `${c.place.region} Â· ${c.place.population}`; }
  else if (c) { chatTitle.textContent = c.title; chatSubtitle.textContent = 'Encontrar com IA'; }
  else { chatTitle.textContent = 'Encontrar com IA'; chatSubtitle.textContent = 'Buscador dos povos originÃ¡rios'; }
}
function openChat() {
  setAppViewportHeight();
  const mobile = isMobileViewport();
  if (mobile) {
    document.body.classList.add('chat-mobile-open');
    chatPane.classList.remove('sidebar-open');
    sidebarToggle.classList.remove('active');
  }
  requestAnimationFrame(() => {
    app.classList.add('chat-open');
    chatPane.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
      if (!mobile) chatInputField.focus();
    });
  });
  setTimeout(() => syncWorkspaceLayout({ fitBoards: false }), 680);
  setTimeout(() => syncWorkspaceLayout({ fitBoards: false }), 520);
}
function closeChat() {
  app.classList.remove('chat-open');
  chatPane.classList.remove('sidebar-open');
  sidebarToggle.classList.remove('active');
  chatPane.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('chat-mobile-open');
  clearBoardSearchUi();
  setTimeout(() => syncWorkspaceLayout({ fitBoards: false }), 520);
}

function reopenContextChat() {
  if (!selectedPlace || app.classList.contains('chat-open')) return;
  if (chatStore.current()) openChat();
  else startNewChat(selectedPlace);
}

function handleDividerResizeStart(e) {
  if (isMobileViewport() || !app.classList.contains('chat-open')) return;
  e.preventDefault();
  const appRect = app.getBoundingClientRect();
  const currentSplit = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--map-split')) || DESKTOP_SPLIT_DEFAULT;
  const startX = e.clientX;
  const startWidth = (currentSplit / 100) * appRect.width;
  document.body.classList.add('pane-resizing');

  const handleMove = evt => {
    const nextWidth = startWidth + (evt.clientX - startX);
    const nextSplit = (nextWidth / appRect.width) * 100;
    setDesktopSplit(nextSplit);
    syncWorkspaceLayout({ fitBoards: false });
  };

  const handleEnd = () => {
    document.body.classList.remove('pane-resizing');
    document.removeEventListener('pointermove', handleMove);
    document.removeEventListener('pointerup', handleEnd);
    document.removeEventListener('pointercancel', handleEnd);
    syncWorkspaceLayout({ fitBoards: false });
  };

  document.addEventListener('pointermove', handleMove);
  document.addEventListener('pointerup', handleEnd);
  document.addEventListener('pointercancel', handleEnd);
}

paneDivider?.addEventListener('pointerdown', handleDividerResizeStart);
paneDivider?.addEventListener('keydown', e => {
  if (isMobileViewport()) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  e.preventDefault();
  const currentSplit = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--map-split')) || DESKTOP_SPLIT_DEFAULT;
  const delta = e.key === 'ArrowLeft' ? -3 : 3;
  setDesktopSplit(currentSplit + delta);
  syncWorkspaceLayout({ fitBoards: false });
});

chatCloseBtn.addEventListener('click', closeChat);
sidebarToggle.addEventListener('click', () => { chatPane.classList.toggle('sidebar-open'); sidebarToggle.classList.toggle('active'); refreshSidebar(); });
sidebarClose.addEventListener('click', () => { chatPane.classList.remove('sidebar-open'); sidebarToggle.classList.remove('active'); });

function legacyBuildPlaceOpeningPrompt(place) {
  const examples = place?.id === 'yanomami'
    ? 'origens, demarcaÃ§Ãµes de terras, garimpo, HaximÃº, shabono, xapiri, saÃºde, lideranÃ§as e fontes verificadas'
    : 'origens, territÃ³rio, cultura, deslocamentos, direitos e fontes verificadas';
  return `**AmerÃ­ndia: o que deseja saber sobre os ${place.name}?** Pergunte sobre ${examples}.\n\nAbri o board com os marcos disponÃ­veis: ajuste o ano dentro do board para mostrar apenas os cards daquele ano para trÃ¡s.`;
}

function legacyOldStartNewChat(place = null, openWithPrompt = null) {
  chatStore.newChat(place);
  selectedPlace = place;
  updateContextChip(); clearMessages(); hideSuggestions(); updateChatHeader(); openChat();
  if (openWithPrompt) sendUserMessage(openWithPrompt);
  else if (place && place.complete) {
    const prompt = buildPlaceOpeningPrompt(place);
    const opts = place.id === 'yanomami' ? { boardId: 'yanomami' } : {};
    renderMessage('assistant', prompt, opts);
    chatStore.appendMessage('assistant', prompt, opts);
    showSuggestions(['Origens e histÃ³ria', 'DemarcaÃ§Ã£o e territÃ³rio', 'Cultura e xamanismo', 'Crise do garimpo', 'Fontes verificadas']);
  }
  refreshSidebar();
}
function legacyOldLoadChatById(id) {
  if (!chatStore.switchTo(id)) return;
  const c = chatStore.current(); selectedPlace = c.place;
  updateContextChip(); clearMessages(); hideSuggestions();
  c.messages.forEach(m => renderMessage(m.role, m.content, { boardId: m.boardId, highlightCardId: m.highlightCardId }));
  updateChatHeader(); refreshSidebar();
  // mobile: fechar sidebar apÃ³s selecionar
  if (isMobileViewport()) { chatPane.classList.remove('sidebar-open'); sidebarToggle.classList.remove('active'); }
}

function updateChatHeader() {
  const c = chatStore.current();
  if (c?.place) {
    chatTitle.textContent = c.place.name;
    chatSubtitle.textContent = `${c.place.region} Â· ${c.place.population}`;
    return;
  }
  if (c) {
    chatTitle.textContent = c.title;
    chatSubtitle.textContent = 'Board de pesquisa';
    return;
  }
  chatTitle.textContent = 'Board de pesquisa';
  chatSubtitle.textContent = 'Mapa e board dos povos originÃ¡rios';
}

function startNewChat(place = null, openWithPrompt = null) {
  chatStore.newChat(place);
  selectedPlace = place;
  updateContextChip();
  clearMessages();
  hideSuggestions();
  updateChatHeader();
  openChat();

  const boardId = resolvePlaceBoardId(place);
  if (boardId) {
    currentBoardYear = BOARD_TIMELINE_MAX;
    renderBoardStage(boardId);
  }
  if (openWithPrompt) sendUserMessage(openWithPrompt);

  refreshSidebar();
}

function loadChatById(id) {
  if (!chatStore.switchTo(id)) return;
  const c = chatStore.current();
  const boardId = resolvePlaceBoardId(c?.place);
  let lastHighlightCardId = null;

  selectedPlace = c.place;
  updateContextChip();
  clearMessages();
  hideSuggestions();

  if (boardId) {
      currentBoardYear = BOARD_TIMELINE_MAX;
    renderBoardStage(boardId);
  }

  c.messages.forEach(m => {
    if (m.highlightCardId) lastHighlightCardId = m.highlightCardId;
    renderMessage(m.role, m.content, boardId ? {} : { boardId: m.boardId, highlightCardId: m.highlightCardId });
  });

  updateChatHeader();
  refreshSidebar();

  if (boardId && lastHighlightCardId) {
    const sourceCard = (boardData[boardId] || []).find(card => card.id === lastHighlightCardId);
    if (sourceCard) currentBoardYear = Math.max(currentBoardYear, sourceCard.year);
    const widget = findLastBoardWidget(boardId);
    requestAnimationFrame(() => setTimeout(() => {
      widget?._api?.setYear?.(currentBoardYear, false);
      widget?._api?.zoomToCard?.(lastHighlightCardId);
    }, 280));
  }

  if (isMobileViewport()) {
    chatPane.classList.remove('sidebar-open');
    sidebarToggle.classList.remove('active');
  }
}

/* MATCHER de query â†’ card do board */
function matchBoardCard(query, boardData) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const queryWords = q.split(/\s+/).filter(w => w.length >= 3);
  if (queryWords.length === 0) return null;
  let best = null, bestScore = 0;
  boardData.forEach(card => {
    const haystack = (card.title + ' ' + card.desc + ' ' + card.year).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let matches = 0;
    queryWords.forEach(w => { if (haystack.includes(w)) matches++; });
    const score = matches / queryWords.length;
    if (score > bestScore && score >= 0.5) { best = card; bestScore = score; }
  });
  return best;
}

/* MATCHER geral de respostas */
function matchAnswer(question, place) {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!place || !place.complete) {
    return { text: `Posso te apresentar com profundidade os **Yanomami** (Brasil â€” AmazÃ´nia) clicando no marcador laranja no mapa. Os outros povos estÃ£o em curadoria e estarÃ£o disponÃ­veis em breve.\n\nVocÃª tambÃ©m pode buscar por eventos especÃ­ficos como "Massacre de HaximÃº" ou "DemarcaÃ§Ã£o 1992" â€” eu vou destacar a resposta no board interativo.` };
  }
  const a = place.answers;
  let text, withBoard = false;
  if (/hist[oÃ³]ri|passado|origem|come[cÃ§]ou|massacre|conflito|genoc|antigament|haxim/.test(q)) { text = a.history; withBoard = true; }
  else if (/territ[oÃ³]ri|terra|demarca|onde|locali|fronteir|hectar|extens|tamanho|reserva/.test(q)) text = a.territory;
  else if (/cultura|tradi[cÃ§][aÃ£]o|ritual|cerim|l[iÃ­]ngua|festa|dan[cÃ§]a|crenc|cosmolog|espiritual|mito|xapiri|shabono|reahu/.test(q)) text = a.culture;
  else if (/atual|hoje|amea[cÃ§]a|luta|garimpo|invas|crise|situa[cÃ§][aÃ£]o|agora|recente|2023|2024|2025|2026/.test(q)) text = a.current;
  else { text = a.intro; withBoard = true; }

  const result = { text };
  if (place.id === 'yanomami') result.boardId = 'yanomami';
  return result;
}

function findLastBoardWidget(boardId) {
  const surfaceWidget = boardSurface.querySelector(`[data-board="${boardId}"]`);
  if (surfaceWidget) return surfaceWidget;
  const widgets = chatMessages.querySelectorAll(`[data-board="${boardId}"]`);
  return widgets[widgets.length - 1] || null;
}

async function legacyOldSendUserMessage(text) {
  if (!text || !text.trim() || isWaitingResponse) return;
  text = text.trim();
  hideSuggestions();
  renderMessage('user', text);
  chatStore.appendMessage('user', text);
  chatInputField.value = '';
  updateChatHeader();
  refreshSidebar();
  isWaitingResponse = true;

  // Busca semÃ¢ntica â†’ tenta achar card no board Yanomami
  const card = matchBoardCard(text, yanomamiBoard);
  if (card) {
    if (card.year > currentBoardYear) currentBoardYear = card.year;
    // PÃ­lula de loading
    const locatingNode = renderMessage('assistant', '', { locating: card.title });
    await new Promise(r => setTimeout(r, 1100));
    locatingNode.remove();

    const existingWidget = findLastBoardWidget('yanomami');
    if (existingWidget) {
      existingWidget._api?.setYear?.(Math.max(currentBoardYear, card.year), false);
      // jÃ¡ tem board no chat â€” manda mensagem curta e zooma
      const replyText = `Encontrei **${card.title} (${card.year})** â€” destaquei no board acima.`;
      renderMessage('assistant', replyText);
      chatStore.appendMessage('assistant', replyText);
      // scroll atÃ© o widget e zoom
      existingWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => existingWidget._api?.zoomToCard(card.id), 500);
    } else {
      // criar novo board jÃ¡ com highlight
      const replyText = `Encontrei **${card.title} (${card.year})** no board interativo abaixo.`;
      renderMessage('assistant', replyText, { boardId: 'yanomami', highlightCardId: card.id });
      chatStore.appendMessage('assistant', replyText, { boardId: 'yanomami', highlightCardId: card.id });
    }
    refreshSidebar();
    isWaitingResponse = false;
    return;
  }

  // Fluxo normal
  const typingNode = renderMessage('assistant', '', { typing: true });
  const delay = 600 + Math.floor(Math.random() * 600);
  await new Promise(r => setTimeout(r, delay));
  const result = matchAnswer(text, selectedPlace);
  typingNode.remove();
  renderMessage('assistant', result.text, { boardId: result.boardId });
  chatStore.appendMessage('assistant', result.text, { boardId: result.boardId });
  refreshSidebar();
  isWaitingResponse = false;
}

async function sendUserMessage(text) {
  if (!text || !text.trim() || isWaitingResponse) return;
  text = text.trim();
  hideSuggestions();
  clearBoardSearchUi();
  const boardId = resolvePlaceBoardId(selectedPlace);
  const card = boardId === 'yanomami' ? matchBoardCard(text, yanomamiBoard) : null;

  if (boardId && card) {
    isWaitingResponse = true;
    chatInputField.value = '';
    chatMessages.innerHTML = '';
    setBoardSearchStatus(card.title);
    setChatInputBusy(true);
    touchCurrentChat();
    refreshSidebar();
    try {
      await new Promise(r => setTimeout(r, 950));
      let widget = findLastBoardWidget(boardId);
      if (!widget) {
        renderBoardStage(boardId);
        await new Promise(r => setTimeout(r, 180));
        widget = findLastBoardWidget(boardId);
      }
      requestAnimationFrame(() => {
        const found = widget?._api?.zoomToCard?.(card.id, { revealIfHidden: false, targetScale: 1.08 });
        if (found === false) showToast('Esse card estÃ¡ fora do filtro atual. Use "Mostrar tudo".');
      });
    } finally {
      clearBoardSearchUi();
      refreshSidebar();
      isWaitingResponse = false;
    }
    return;
  }

  renderMessage('user', text);
  chatStore.appendMessage('user', text);
  chatInputField.value = '';
  updateChatHeader();
  refreshSidebar();
  isWaitingResponse = true;

  try {
    const typingNode = renderMessage('assistant', '', { typing: true });
    const delay = 600 + Math.floor(Math.random() * 600);
    await new Promise(r => setTimeout(r, delay));
    const result = matchAnswer(text, selectedPlace);
    typingNode.remove();

    const existingWidget = result.boardId ? findLastBoardWidget(result.boardId) : null;
    if (existingWidget) {
      renderMessage('assistant', result.text);
      chatStore.appendMessage('assistant', result.text);
    } else {
      renderMessage('assistant', result.text, { boardId: result.boardId });
      chatStore.appendMessage('assistant', result.text, { boardId: result.boardId });
    }

    refreshSidebar();
  } finally {
    clearBoardSearchUi();
    isWaitingResponse = false;
  }
}

/* SIDEBAR */
function refreshSidebar() {
  sidebarList.innerHTML = '';
  if (chatStore.chats.length === 0) { sidebarList.innerHTML = '<div class="sidebar-empty">Nenhuma board ainda</div>'; return; }
  chatStore.chats.forEach(c => {
    const li = document.createElement('li');
    li.className = 'sidebar-item' + (c.id === chatStore.currentId ? ' active' : '');
    li.tabIndex = 0;
    const icon = c.place ? '<i class="fa-solid fa-location-dot"></i>' : '<i class="fa-solid fa-magnifying-glass"></i>';
    const time = new Date(c.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    li.innerHTML = `<div class="sidebar-item-icon">${icon}</div><div class="sidebar-item-text"><div class="sidebar-item-title">${escapeHtml(c.title)}</div><div class="sidebar-item-time">${time}</div></div><button type="button" class="sidebar-delete" aria-label="Deletar board ${escapeHtml(c.title)}" title="Deletar board"><i class="fa-solid fa-trash-can"></i></button>`;
    li.addEventListener('click', () => loadChatById(c.id));
    li.addEventListener('keydown', e => { if (e.key === 'Enter') loadChatById(c.id); });
    li.querySelector('.sidebar-delete').addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      deleteChatById(c.id);
    });
    sidebarList.appendChild(li);
  });
}

function deleteChatById(id) {
  const wasCurrent = chatStore.currentId === id;
  if (!chatStore.delete(id)) return;
  if (wasCurrent) {
    const next = chatStore.current();
    if (next) loadChatById(next.id);
    else {
      selectedPlace = null;
      clearMessages(); hideSuggestions(); updateContextChip(); updateChatHeader(); refreshSidebar();
    }
  } else refreshSidebar();
  showToast('Board removida');
}
newChatBtn.addEventListener('click', () => {
  startNewChat(null);
  if (isMobileViewport()) { chatPane.classList.remove('sidebar-open'); sidebarToggle.classList.remove('active'); }
});

/* INPUTS */
floatingSearch.addEventListener('submit', async e => {
  e.preventDefault();
  const text = searchInput.value.trim();
  if (!text || isWaitingResponse) return;
  const foundPlace = findSearchPlace(text);
  if (foundPlace?.id === 'yanomami') {
    isWaitingResponse = true;
    searchInput.value = '';
    setFloatingSearchStatus(foundPlace.name);
    setFloatingSearchBusy(true);
    try {
      const feature = features.find(f => f.get('placeInfo')?.id === foundPlace.id);
      if (feature) {
        view.animate({
          center: feature.getGeometry().getCoordinates(),
          zoom: Math.max(view.getZoom() || 2.2, 4.2),
          duration: 650
        });
      }
      await new Promise(resolve => setTimeout(resolve, 720));
      startNewChat(foundPlace);
    } finally {
      clearFloatingSearchUi();
      isWaitingResponse = false;
    }
    return;
  }
  searchInput.value = '';
  startNewChat(selectedPlace, text);
});
chatInputForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = chatInputField.value.trim();
  if (!text) return;
  if (!chatStore.current()) chatStore.newChat(selectedPlace);
  sendUserMessage(text);
});
contextChip.addEventListener('click', e => {
  if (e.target.closest('#context-clear')) return;
  reopenContextChat();
});
contextChip.addEventListener('keydown', e => {
  if (e.target.closest('#context-clear')) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    reopenContextChat();
  }
});
contextClearBtn.addEventListener('click', e => {
  e.stopPropagation();
  selectedPlace = null;
  updateContextChip();
});

let lastFeatureTapAt = 0;
function handleMapFeature(feature) {
  if (!feature) return false;
  if (mapPane.classList.contains('source-open')) closeSourcePanel();
  const info = feature.get('placeInfo');
  hideTooltip();
  if (!info.complete) {
    showToast(`${info.name} â€” pesquisa em curadoria`);
    view.animate({ center: feature.getGeometry().getCoordinates(), duration: 500, easing: t => 1 - Math.pow(1 - t, 3) });
    return true;
  }
  view.animate({ center: feature.getGeometry().getCoordinates(), duration: 600, easing: t => 1 - Math.pow(1 - t, 3) });
  startNewChat(info);
  return true;
}
map.on('singleclick', evt => {
  const feature = map.forEachFeatureAtPixel(evt.pixel, f => f, { hitTolerance: isMobileViewport() ? 32 : 12 });
  if (feature) {
    lastFeatureTapAt = Date.now();
    handleMapFeature(feature);
  }
});
map.getViewport().addEventListener('pointerup', e => {
  if (!isMobileViewport()) return;
  if (Date.now() - lastFeatureTapAt < 450) return;
  const pixel = map.getEventPixel(e);
  const feature = map.forEachFeatureAtPixel(pixel, f => f, { hitTolerance: 34 });
  if (feature) {
    e.preventDefault();
    lastFeatureTapAt = Date.now();
    handleMapFeature(feature);
  }
}, { passive: false });

/* PAINEL FONTE */
const sourcePanel = document.getElementById('source-panel');
const sourceClose = document.getElementById('source-close');
const sourcePanelHead = sourcePanel?.querySelector('.source-panel-head');
const sourcePanelBody = document.getElementById('source-panel-body');
const sourcePipFullscreen = document.getElementById('source-pip-fullscreen');
const verifiedDocument = {
  title: 'Caderno "Povos indigenas Povos Originarios"',
  meta: 'Fundacao Vale · FGV DGPE · Trilhos da Alfabetizacao · 27/05/2024',
  summary: 'Caderno pedagogico elaborado no contexto do projeto Trilhos da Alfabetizacao para valorizar a cultura, os saberes e a historia dos povos indigenas em sua diversidade e afastar preconceitos em sala de aula.',
  pdfUrl: 'https://www.fundacaovale.org/wp-content/uploads/2024/05/cad-povos-indigenas_web_fundacaovale_fgv-dgpe.pdf',
  pageUrl: 'https://www.fundacaovale.org/material/caderno-povos-indigenas-povos-originarios/',
  newsUrl: 'https://www.fundacaovale.org/fundacao-vale-lanca-o-caderno-pedagogico-povos-indigenas-povos-originarios-no-maranhao/'
};
function setSourceSidebarOpen(isOpen) {
  sourcePanel.classList.toggle('source-sidebar-open', Boolean(isOpen));
}

function updateSourcePipFullscreenButton() {
  if (!sourcePipFullscreen) return;
  const expanded = sourcePanel.classList.contains('source-pip-expanded');
  sourcePipFullscreen.setAttribute('aria-label', expanded ? 'Voltar para PiP' : 'Expandir PDF');
  sourcePipFullscreen.querySelector('i').className = expanded ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
}

function clearSourcePipPosition() {
  sourcePanel.style.left = '';
  sourcePanel.style.top = '';
  sourcePanel.style.right = '';
  sourcePanel.style.bottom = '';
}

function positionSourcePipFromOrigin(originEl) {
  if (!sourcePanel.classList.contains('source-pip')) return;
  const margin = 18;
  const originRect = originEl?.getBoundingClientRect?.();
  const currentRect = sourcePanel.getBoundingClientRect();
  const width = Math.min(currentRect.width || 560, window.innerWidth - margin * 2);
  const height = Math.min(currentRect.height || 720, window.innerHeight - margin * 2);
  let left = window.innerWidth - width - 28;
  let top = window.innerHeight - height - 28;

  if (originRect) {
    const rightSide = originRect.left + originRect.width / 2 < window.innerWidth / 2;
    left = rightSide ? originRect.right + 18 : originRect.left - width - 18;
    if (left < margin || left + width > window.innerWidth - margin) {
      left = rightSide ? originRect.left - width - 18 : originRect.right + 18;
    }
    top = originRect.top + originRect.height / 2 - height / 2;
  }

  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  sourcePanel.style.left = `${Math.max(margin, Math.min(maxX, left))}px`;
  sourcePanel.style.top = `${Math.max(margin, Math.min(maxY, top))}px`;
  sourcePanel.style.right = 'auto';
  sourcePanel.style.bottom = 'auto';
  sourcePanel.classList.remove('source-pip-spawning');
  void sourcePanel.offsetWidth;
  sourcePanel.classList.add('source-pip-spawning');
  setTimeout(() => sourcePanel.classList.remove('source-pip-spawning'), 360);
}

function setSourcePipMode(isPip) {
  sourcePanel.classList.toggle('source-pip', Boolean(isPip));
  sourcePanel.classList.remove('source-pip-expanded', 'source-pip-dragging');
  clearSourcePipPosition();
  updateSourcePipFullscreenButton();
}

function toggleSourcePipFullscreen() {
  if (!sourcePanel.classList.contains('source-pip')) return;
  const expanded = !sourcePanel.classList.contains('source-pip-expanded');
  sourcePanel.classList.toggle('source-pip-expanded', expanded);
  clearSourcePipPosition();
  updateSourcePipFullscreenButton();
}

function openSourcePanel(researcherKey, opts = {}) {
  const r = researchers[researcherKey];
  if (!r) return;
  const fullscreenWidget = document.querySelector('.board-widget.fullscreen');
  const openAsPip = Boolean(fullscreenWidget) && !isMobileViewport();
  if (fullscreenWidget && !openAsPip) fullscreenWidget._api?.toggleFullscreen?.();
  const originalLinks = [
    { icon: 'fa-file-pdf', label: 'PDF original', url: verifiedDocument.pdfUrl },
    { icon: 'fa-globe', label: 'Pagina do material', url: verifiedDocument.pageUrl },
    { icon: 'fa-newspaper', label: 'Noticia de lancamento', url: verifiedDocument.newsUrl }
  ];
  const linksHTML = originalLinks.map(l => `<a href="${l.url}" target="_blank" rel="noopener"><i class="fa-solid ${l.icon}"></i> ${escapeHtml(l.label)}</a>`).join('');
  const pdfTitle = escapeHtml(verifiedDocument.title);
  setSourceSidebarOpen(false);
  setSourcePipMode(openAsPip);
  sourcePanelBody.innerHTML = `
    <aside class="source-doc-pane">
      <div class="source-reader-top">
        <button type="button" class="source-researcher-pill" data-action="toggle-source-sidebar" aria-expanded="false">
          <span class="dot"></span>
          <span>${escapeHtml(r.name)}</span>
          <i class="fa-solid fa-panel-right"></i>
        </button>
        <div class="source-reader-meta">
          <span><i class="fa-solid fa-file-pdf"></i> leitura simulada</span>
          <span>12 paginas</span>
        </div>
      </div>
      <div class="pdf-viewer" role="img" aria-label="Leitura simulada do PDF ${pdfTitle}">
        <div class="pdf-toolbar"><span><i class="fa-solid fa-file-pdf"></i> ${pdfTitle}</span><span>p. 1 / 12</span></div>
        <div class="pdf-reader-stage">
          <div class="pdf-thumbs" aria-hidden="true">
            <button type="button" class="pdf-thumb active"><span>1</span></button>
            <button type="button" class="pdf-thumb"><span>2</span></button>
            <button type="button" class="pdf-thumb"><span>3</span></button>
          </div>
          <div class="pdf-page-stack">
            <article class="pdf-page pdf-page-cover">
              <div class="pdf-kicker">TRILHOS DA ALFABETIZACAO</div>
              <h3 class="pdf-doc-title">${pdfTitle}</h3>
              <p class="pdf-doc-meta">${escapeHtml(verifiedDocument.meta)}</p>
              <div class="pdf-line wide"></div><div class="pdf-line mid"></div><div class="pdf-line"></div>
              <div class="pdf-figure pdf-figure-hero"></div>
              <div class="pdf-line"></div><div class="pdf-line short"></div><div class="pdf-line tiny"></div>
              <div class="pdf-stamp">VERIFICADO</div>
            </article>
            <article class="pdf-page">
              <div class="pdf-page-title"></div>
              <p class="pdf-paragraph">${escapeHtml(verifiedDocument.summary)}</p>
              <div class="pdf-line wide"></div><div class="pdf-line"></div><div class="pdf-line mid"></div>
              <div class="pdf-figure"></div>
              <div class="pdf-line"></div><div class="pdf-line short"></div><div class="pdf-line tiny"></div>
            </article>
          </div>
        </div>
      </div>
      <p class="pdf-caption">Leitura simulada do PDF original da Fundacao Vale com base no material e na pagina publica do documento.</p>
    </aside>
    <article class="source-info">
      <div class="source-info-head">
        <div class="researcher-profile">
          <div class="researcher-photo">${escapeHtml(r.photo)}</div>
          <div>
            <h3 class="researcher-name">${escapeHtml(r.name)}</h3>
            <p class="researcher-aff">${escapeHtml(r.affiliation)}</p>
          </div>
        </div>
        <button type="button" class="source-info-close" data-action="close-source-sidebar" aria-label="Fechar descricao do pesquisador"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="section-label">Sobre</div>
      <p class="section-text">${escapeHtml(r.bio)}</p>
      <div class="section-label">Pesquisa</div>
      <div class="research-card-info">
        <h4 class="research-title">${escapeHtml(r.research.title)}</h4>
        <p class="research-meta">${escapeHtml(r.research.meta)}</p>
        <p class="section-text" style="margin:0">${escapeHtml(r.research.summary)}</p>
      </div>
      <div class="section-label">Documento verificado</div>
      <div class="research-card-info">
        <h4 class="research-title">${pdfTitle}</h4>
        <p class="research-meta">${escapeHtml(verifiedDocument.meta)}</p>
        <p class="section-text" style="margin:0">${escapeHtml(verifiedDocument.summary)}</p>
      </div>
      <div class="section-label">Links originais</div>
      <div class="research-where">${linksHTML}</div>
      <a class="research-cta" href="${verifiedDocument.pdfUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-file-pdf"></i> Abrir PDF original</a>
    </article>`;
  hideTooltip();
  mapPane.classList.add('source-open');
  sourcePanel.setAttribute('aria-hidden', 'false');
  sourcePanelBody.scrollTop = 0;
  if (openAsPip) requestAnimationFrame(() => positionSourcePipFromOrigin(opts.originEl));
}
function closeSourcePanel() {
  setSourceSidebarOpen(false);
  setSourcePipMode(false);
  mapPane.classList.remove('source-open');
  sourcePanel.setAttribute('aria-hidden', 'true');
}
sourceClose.addEventListener('click', closeSourcePanel);
sourcePipFullscreen?.addEventListener('click', toggleSourcePipFullscreen);

let sourcePipDrag = null;
sourcePanelHead?.addEventListener('pointerdown', e => {
  if (!sourcePanel.classList.contains('source-pip')) return;
  if (e.target.closest('button, a')) return;
  e.preventDefault();
  if (sourcePanel.classList.contains('source-pip-expanded')) {
    const margin = 12;
    const width = Math.min(560, window.innerWidth - margin * 2);
    const height = Math.min(720, window.innerHeight - margin * 2);
    const left = Math.max(margin, Math.min(window.innerWidth - width - margin, e.clientX - width / 2));
    const top = Math.max(margin, Math.min(window.innerHeight - height - margin, e.clientY - 24));
    sourcePanel.classList.remove('source-pip-expanded');
    sourcePanel.style.left = `${left}px`;
    sourcePanel.style.top = `${top}px`;
    sourcePanel.style.right = 'auto';
    sourcePanel.style.bottom = 'auto';
    updateSourcePipFullscreenButton();
  }
  const rect = sourcePanel.getBoundingClientRect();
  sourcePipDrag = {
    pointerId: e.pointerId,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    width: rect.width,
    height: rect.height
  };
  sourcePanel.classList.add('source-pip-dragging');
  try { sourcePanelHead.setPointerCapture(e.pointerId); } catch (_) {}
});

document.addEventListener('pointermove', e => {
  if (!sourcePipDrag || e.pointerId !== sourcePipDrag.pointerId) return;
  const margin = 12;
  const maxX = Math.max(margin, window.innerWidth - sourcePipDrag.width - margin);
  const maxY = Math.max(margin, window.innerHeight - sourcePipDrag.height - margin);
  const nextX = Math.max(margin, Math.min(maxX, e.clientX - sourcePipDrag.offsetX));
  const nextY = Math.max(margin, Math.min(maxY, e.clientY - sourcePipDrag.offsetY));
  sourcePanel.style.left = `${nextX}px`;
  sourcePanel.style.top = `${nextY}px`;
  sourcePanel.style.right = 'auto';
  sourcePanel.style.bottom = 'auto';
});

function endSourcePipDrag(e) {
  if (!sourcePipDrag || (e && e.pointerId !== sourcePipDrag.pointerId)) return;
  try { sourcePanelHead?.releasePointerCapture(sourcePipDrag.pointerId); } catch (_) {}
  sourcePipDrag = null;
  sourcePanel.classList.remove('source-pip-dragging');
}
document.addEventListener('pointerup', endSourcePipDrag);
document.addEventListener('pointercancel', endSourcePipDrag);

/* DelegaÃ§Ã£o: click no selo verde dos cards do board */
let simAudioContext = null;
function playSimulatedLanguage(btn) {
  try {
    simAudioContext = simAudioContext || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = simAudioContext;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime + 0.03;
    const pattern = [220, 247, 196, 262, 233, 294, 208, 247, 185, 220, 262, 196];
    btn.classList.add('playing');
    pattern.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 3 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.16);
      osc.frequency.exponentialRampToValueAtTime(freq * (i % 2 ? 1.08 : 0.94), now + i * 0.16 + 0.13);
      gain.gain.setValueAtTime(0.0001, now + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.055, now + i * 0.16 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.16);
      osc.stop(now + i * 0.16 + 0.17);
    });
    setTimeout(() => btn.classList.remove('playing'), 2300);
  } catch (_) {
    showToast('NÃ£o foi possÃ­vel tocar o Ã¡udio neste navegador');
  }
}

function handleBoardSurfaceAction(e) {
  const audioBtn = e.target.closest('[data-audio-sim]');
  if (audioBtn) {
    e.preventDefault(); e.stopPropagation();
    playSimulatedLanguage(audioBtn);
    return true;
  }
  const videoBtn = e.target.closest('[data-video-sim]');
  if (videoBtn) {
    e.preventDefault(); e.stopPropagation();
    videoBtn.classList.toggle('playing');
    showToast(videoBtn.classList.contains('playing') ? 'VÃ­deo simulado em reproduÃ§Ã£o' : 'VÃ­deo simulado pausado');
    return true;
  }
  const mediaNote = e.target.closest('[data-media-note]');
  if (mediaNote) {
    e.preventDefault(); e.stopPropagation();
    showToast(mediaNote.dataset.mediaNote);
    return true;
  }
  const tag = e.target.closest('[data-source-key]');
  if (tag) {
    e.preventDefault(); e.stopPropagation();
    openSourcePanel(tag.dataset.sourceKey, { originEl: tag.closest('.board-card') || tag });
    return true;
  }
  return false;
}

chatMessages.addEventListener('click', handleBoardSurfaceAction);
boardSurface.addEventListener('click', handleBoardSurfaceAction);

sourcePanelBody.addEventListener('click', e => {
  const sidebarToggleBtn = e.target.closest('[data-action="toggle-source-sidebar"]');
  if (sidebarToggleBtn) {
    e.preventDefault();
    e.stopPropagation();
    const next = !sourcePanel.classList.contains('source-sidebar-open');
    setSourceSidebarOpen(next);
    sidebarToggleBtn.setAttribute('aria-expanded', String(next));
    return;
  }
  const sidebarCloseBtn = e.target.closest('[data-action="close-source-sidebar"]');
  if (sidebarCloseBtn) {
    e.preventDefault();
    e.stopPropagation();
    setSourceSidebarOpen(false);
    sourcePanelBody.querySelector('[data-action="toggle-source-sidebar"]')?.setAttribute('aria-expanded', 'false');
    return;
  }
  const disabledLink = e.target.closest('[data-link-disabled]');
  if (!disabledLink) return;
  e.preventDefault();
  e.stopPropagation();
  showToast(`${disabledLink.dataset.linkDisabled} em curadoria`);
});

/* BOARD MIRO INSTÃ‚NCIA */
const boardData = { yanomami: yanomamiBoard };
const boardCardWidth = 240;
const boardCardHeight = 322;
const boardVSpacing = 80;
const boardLaneOffset = 180;

function initBoard(widget, boardId, highlightCardId) {
  const events = (boardData[boardId] || []).slice().sort((a, b) => a.year - b.year);
  if (!events.length) return;
  const viewport = widget.querySelector('.board-viewport');
  const canvas = widget.querySelector('.board-canvas');
  const cardsContainer = widget.querySelector('.board-cards-container');
  const arrows = widget.querySelector('.board-arrows');
  const zoomInd = widget.querySelector('.zoom-indicator');
  const boardTimelineBox = widget.querySelector('.board-timeline');
  const boardTimeline = widget.querySelector('.board-timeline-snapper');
  const boardTimelineInfo = boardTimeline?.querySelector('[slot="info"]');
  const boardTimelineToggle = widget.querySelector('[data-board-timeline-toggle]');
  const boardTimelineYear = widget.querySelector('[data-board-timeline-year]');
  const boardTimelineEditBtn = widget.querySelector('[data-board-timeline-edit]');
  const boardTimelineEditForm = widget.querySelector('[data-board-timeline-form]');
  const boardTimelineEditInput = widget.querySelector('[data-board-timeline-input]');

  const isMobileSize = window.matchMedia('(max-width: 768px)').matches;
  const cardW = isMobileSize ? 200 : boardCardWidth;
  const cardH = isMobileSize ? 292 : boardCardHeight;
  const laneOff = isMobileSize ? 140 : boardLaneOffset;
  const maxYear = BOARD_TIMELINE_MAX;
  const eventLabelsByYear = events.reduce((acc, ev) => {
    acc[ev.year] = acc[ev.year] ? `${acc[ev.year]} · ${ev.title}` : ev.title;
    return acc;
  }, {});

  const state = { scale: 0.91, x: 0, y: 0, minScale: 0.32, maxScale: 3.2 };
  let activeYear = Math.max(BOARD_TIMELINE_MIN, Math.min(maxYear, parseInt(widget.dataset.year || currentBoardYear || maxYear, 10)));
  let cards = [];
  const cardPositions = new Map();
  let initialVisibleFitDone = false;
  let visibleFitTimer = null;
  let pendingViewRestore = null;
  let timelineChangeSuppressedUntil = 0;

  function applyTransform() {
    canvas.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
    zoomInd.textContent = `${Math.round(state.scale * 100)}%`;
  }

  function captureViewCenter() {
    const vp = viewport.getBoundingClientRect();
    if (vp.width < 1 || vp.height < 1) return null;
    return {
      scale: state.scale,
      wx: ((vp.width / 2) - state.x) / state.scale,
      wy: ((vp.height / 2) - state.y) / state.scale
    };
  }

  function restoreViewCenter(saved) {
    if (!saved) return false;
    const vp = viewport.getBoundingClientRect();
    if (vp.width < 1 || vp.height < 1) return false;
    state.scale = Math.max(state.minScale, Math.min(state.maxScale, saved.scale));
    state.x = (vp.width / 2) - saved.wx * state.scale;
    state.y = (vp.height / 2) - saved.wy * state.scale;
    applyTransform();
    return true;
  }

  function syncBoardTimelineChrome() {
    if (!boardTimelineBox) return;
    const widgetRect = viewport.getBoundingClientRect();
    const titleRect = chatTitle?.getBoundingClientRect?.();
    const closeRect = chatCloseBtn?.getBoundingClientRect?.();
    if (!widgetRect.width || !titleRect || !closeRect) return;

    const left = Math.max(12, titleRect.left - widgetRect.left);
    const right = Math.max(12, widgetRect.right - closeRect.right);
    const openWidth = Math.max(112, widgetRect.width - left - right);
    const titleW = Math.max(0, titleRect.width);
    const triggerW = 112;
    const centeredTriggerLeft = (widgetRect.width - triggerW) / 2;
    const maxTriggerLeft = Math.max(left, widgetRect.width - right - triggerW);
    const splitTriggerLeft = Math.max(12, Math.min(maxTriggerLeft, centeredTriggerLeft));
    const triggerLeft = widget.classList.contains('fullscreen')
      ? Math.max(12, Math.min(maxTriggerLeft, left + titleW + 8))
      : splitTriggerLeft;

    widget.style.setProperty('--board-timeline-left', `${Math.round(left)}px`);
    widget.style.setProperty('--board-timeline-right', `${Math.round(right)}px`);
    widget.style.setProperty('--board-timeline-open-w', `${Math.round(openWidth)}px`);
    widget.style.setProperty('--board-timeline-title-w', `${Math.round(titleW)}px`);
    widget.style.setProperty('--board-timeline-trigger-left', `${Math.round(triggerLeft)}px`);
  }

  function updateYearUI() {
    widget.dataset.year = activeYear;
    currentBoardYear = activeYear;
    if (boardTimelineYear) boardTimelineYear.textContent = activeYear;
    if (boardTimelineEditInput && !boardTimelineEditForm?.classList.contains('visible')) {
      boardTimelineEditInput.value = activeYear;
    }
    updateBoardTimelineInfo();
  }

  function updateBoardTimelineInfo() {
    if (!boardTimelineInfo) return;
    const visible = events.filter(ev => ev.year <= activeYear);
    const latest = visible[visible.length - 1];
    boardTimelineInfo.textContent = latest
      ? `${visible.length} marco${visible.length > 1 ? 's' : ''} até ${activeYear} · ${latest.year}: ${latest.title}`
      : `Nenhum marco até ${activeYear}`;
  }

  function suppressTimelineChanges(duration = 520) {
    timelineChangeSuppressedUntil = performance.now() + duration;
  }

  function setupBoardTimeline() {
    if (!boardTimeline) return;
    boardTimelineToggle?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const stableYear = activeYear;
      suppressTimelineChanges();
      const open = !boardTimelineBox.classList.contains('is-open');
      boardTimelineBox.classList.toggle('is-open', open);
      boardTimelineToggle.setAttribute('aria-expanded', String(open));
      boardTimelineToggle.setAttribute('aria-label', open ? 'Fechar linha do tempo' : 'Abrir linha do tempo');
      updateYearUI();
      if (open) {
        syncBoardTimelineChrome();
        requestAnimationFrame(() => {
          suppressTimelineChanges(360);
          boardTimeline?.setValue?.(stableYear);
        });
      } else {
        setTimelineYearEditor(boardTimelineEditForm, boardTimelineEditBtn, boardTimelineEditInput, false, activeYear);
        requestAnimationFrame(() => {
          suppressTimelineChanges(320);
          boardTimeline?.setValue?.(stableYear);
        });
      }
    });
    customElements.whenDefined('number-snapper').then(() => {
      const ticks = Array.from(boardTimeline.shadowRoot?.querySelectorAll('li[value]') || []);
      Object.entries(eventLabelsByYear).forEach(([year, label]) => {
        const tick = ticks.find(li => Math.round(parseFloat(li.getAttribute('value'))) === Number(year));
        if (tick) tick.setAttribute('title', label);
      });
      boardTimeline.addEventListener('change', e => {
        if (performance.now() < timelineChangeSuppressedUntil) {
          if (e.detail.value !== activeYear) requestAnimationFrame(() => boardTimeline.setValue(activeYear));
          return;
        }
        setYear(e.detail.value, false, false);
      });
      suppressTimelineChanges(320);
      boardTimeline.setValue(activeYear);
    });
  }

  function setupBoardTimelineEditor() {
    if (!boardTimelineEditBtn || !boardTimelineEditForm || !boardTimelineEditInput) return;
    boardTimelineEditBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const open = !boardTimelineEditForm.classList.contains('visible');
      setTimelineYearEditor(boardTimelineEditForm, boardTimelineEditBtn, boardTimelineEditInput, open, activeYear);
    });
    boardTimelineEditForm.addEventListener('submit', e => {
      e.preventDefault();
      e.stopPropagation();
      const next = clampNumber(boardTimelineEditInput.value, BOARD_TIMELINE_MIN, maxYear, activeYear);
      setYear(next, false);
      setTimelineYearEditor(boardTimelineEditForm, boardTimelineEditBtn, boardTimelineEditInput, false, next);
    });
    boardTimelineEditInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setTimelineYearEditor(boardTimelineEditForm, boardTimelineEditBtn, boardTimelineEditInput, false, activeYear);
      }
    });
  }

  function layoutCards() {
    const visibleEvents = events.filter(ev => ev.year <= activeYear);
    cards = visibleEvents.map((ev, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const defaultX = isMobileSize ? 0 : side * laneOff - (side === -1 ? cardW : 0);
      const defaultY = i * (cardH + boardVSpacing);
      const saved = cardPositions.get(ev.id);
      const x = saved?.x ?? defaultX;
      const y = saved?.y ?? defaultY;
      return { ...ev, x, y };
    });
  }

  function renderCards({ fit = true } = {}) {
    layoutCards();
    updateYearUI();
    if (!cards.length) {
      canvas.style.width = `${Math.max(viewport.clientWidth || 0, 1)}px`;
      canvas.style.height = `${Math.max(viewport.clientHeight || 0, 1)}px`;
      cardsContainer.innerHTML = '<div class="board-empty"><strong>Nenhum card disponivel</strong><p>Os marcos da board ainda nao foram carregados.</p></div>';
      arrows.innerHTML = '';
      if (fit) fitToView();
      return;
    }

    cardsContainer.innerHTML = cards.map(c => {
      const verifiedBadge = c.sourceKey
        ? `<button type="button" class="bc-verified" data-source-key="${escapeHtml(c.sourceKey)}" title="Verificar fatos Â· abrir fonte" aria-label="Verificar fatos: ${escapeHtml(c.title)}"><i class="fa-solid fa-check"></i></button>`
        : '';
      const mediaHTML = renderCardMedia(c.media);
      const imgSrc = upgradeBoardImageUrl(c.image, 1600);
      const imgSrcSet = boardImageSrcSet(c.image);
      return `<div class="board-card" data-card-id="${escapeHtml(c.id)}" data-tag="${escapeHtml(c.tag)}" style="left:${c.x}px;top:${c.y}px;width:${cardW}px">
        <div class="bc-image">
          <span class="bc-year-badge">${c.year}</span>
          ${verifiedBadge}
          <img src="${escapeHtml(imgSrc)}" srcset="${escapeHtml(imgSrcSet)}" sizes="${Math.ceil(cardW * state.maxScale)}px" alt="${escapeHtml(c.title)}" loading="lazy" decoding="async" />
        </div>
        <div class="bc-body">
          <h5 class="bc-title">${escapeHtml(c.title)}</h5>
          <p class="bc-desc">${escapeHtml(c.desc)}</p>
          <span class="bc-tag">${escapeHtml(c.tag)}</span>
          ${mediaHTML}
        </div>
      </div>`;
    }).join('');

    const contentHeight = cards[cards.length - 1].y + cardH + boardVSpacing;
    canvas.style.width = `${isMobileSize ? cardW + 160 : (laneOff * 2) + cardW + 260}px`;
    canvas.style.height = `${contentHeight + 220}px`;
    drawArrows();
    if (fit) requestAnimationFrame(() => fitToView());
  }

  function drawArrows() {
    if (!cards.length) { arrows.innerHTML = ''; return; }
    const margin = 200;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    cards.forEach(c => {
      minX = Math.min(minX, c.x); minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + cardW); maxY = Math.max(maxY, c.y + cardH);
    });
    const svgW = maxX - minX + margin * 2;
    const svgH = maxY - minY + margin * 2;
    arrows.setAttribute('viewBox', `${minX - margin} ${minY - margin} ${svgW} ${svgH}`);
    arrows.style.left = `${minX - margin}px`;
    arrows.style.top = `${minY - margin}px`;
    arrows.setAttribute('width', svgW); arrows.setAttribute('height', svgH);

    let html = '';
    for (let i = 0; i < cards.length - 1; i++) {
      const a = cards[i], b = cards[i + 1];
      const x1 = a.x + cardW / 2, y1 = a.y + cardH;
      const x2 = b.x + cardW / 2, y2 = b.y;
      const dy = y2 - y1;
      const cx1 = x1, cy1 = y1 + dy * 0.55;
      const cx2 = x2, cy2 = y1 + dy * 0.45;
      html += `<path class="arrow-path" d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" />`;
      html += `<circle cx="${x2}" cy="${y2}" r="3.5" fill="rgba(255,106,26,0.58)" />`;
    }
    arrows.innerHTML = html;
  }

  function fitToView() {
    const vp = viewport.getBoundingClientRect();
    if (vp.width < 120 || vp.height < 120) return false;
    if (!cards.length) {
      state.scale = 1;
      state.x = 0;
      state.y = 0;
      applyTransform();
      return true;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    cards.forEach(c => {
      minX = Math.min(minX, c.x); minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + cardW); maxY = Math.max(maxY, c.y + cardH);
    });
    const contentW = Math.max(1, maxX - minX), contentH = Math.max(1, maxY - minY);
    const padding = widget.classList.contains('fullscreen') ? 124 : 96;
    const scaleX = (vp.width - padding * 2) / contentW;
    const scaleY = (vp.height - padding * 2) / contentH;
    state.scale = Math.max(state.minScale, Math.min(0.95, Math.min(scaleX, scaleY)));
    const centerX = (minX + maxX) / 2;
    state.x = vp.width / 2 - centerX * state.scale;
    state.y = padding - minY * state.scale;
    applyTransform();
    return true;
  }

  function focusInitialCard() {
    const vp = viewport.getBoundingClientRect();
    if (vp.width < 120 || vp.height < 120 || !cards.length) return false;
    const firstCard = cards[0];
    state.scale = isMobileSize ? 0.85 : 0.91;
    if (isMobileSize) {
      state.x = (vp.width - (cardW * state.scale)) / 2 - (firstCard.x * state.scale);
      state.y = Math.max(132, vp.height * 0.2) - (firstCard.y * state.scale);
    } else {
      state.x = (vp.width * 0.42) - ((firstCard.x + (cardW / 2)) * state.scale);
      state.y = Math.max(136, vp.height * 0.22) - (firstCard.y * state.scale);
    }
    applyTransform();
    return true;
  }

  function queueVisibleFit(attempts = 14) {
    clearTimeout(visibleFitTimer);
    requestAnimationFrame(() => {
      const positioned = highlightCardId ? fitToView() : focusInitialCard();
      if (positioned) {
        initialVisibleFitDone = true;
        return;
      }
      if (attempts <= 0) return;
      visibleFitTimer = setTimeout(() => queueVisibleFit(attempts - 1), 90);
    });
  }

  function setYear(year, fit = true, updateTimeline = true) {
    const nextYear = Math.max(BOARD_TIMELINE_MIN, Math.min(maxYear, parseInt(year || maxYear, 10)));
    activeYear = Number.isFinite(nextYear) ? nextYear : maxYear;
    renderCards({ fit });
    if (updateTimeline && boardTimeline?.getValue && boardTimeline.getValue() !== activeYear) {
      boardTimeline.setValue(activeYear);
    }
  }

  function syncCardElementPosition(cardEl, card) {
    cardEl.style.left = `${card.x}px`;
    cardEl.style.top = `${card.y}px`;
  }

  function zoomToCard(cardId, opts = {}) {
    const { revealIfHidden = true, targetScale = isMobileSize ? 1 : 1.22, highlight = true, topOffset = null } = opts;
    let card = cards.find(c => c.id === cardId);
    const sourceCard = events.find(c => c.id === cardId);
    if (!card && sourceCard) {
      if (!revealIfHidden) return false;
      setYear(Math.max(activeYear, sourceCard.year), false);
      card = cards.find(c => c.id === cardId);
    }
    if (!card) return false;
    const cardEl = cardsContainer.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardEl) return false;
    const vp = viewport.getBoundingClientRect();
    canvas.classList.add('animating');
    const cardCenterX = card.x + cardW / 2;
    const cardCenterY = card.y + cardH / 2;
    state.scale = Math.min(state.maxScale, targetScale);
    state.x = vp.width / 2 - cardCenterX * state.scale;
    if (topOffset != null) state.y = topOffset - card.y * state.scale;
    else state.y = vp.height / 2 - cardCenterY * state.scale;
    applyTransform();
    setTimeout(() => canvas.classList.remove('animating'), 850);
    if (highlight) {
      cardEl.classList.remove('highlight');
      void cardEl.offsetWidth;
      cardEl.classList.add('highlight');
      setTimeout(() => cardEl.classList.remove('highlight'), 2900);
    }
    return true;
  }

  function animateFullscreenTransition(goingFull, fromRect) {
    const toRect = widget.getBoundingClientRect();
    const sx = fromRect.width / Math.max(1, toRect.width);
    const sy = fromRect.height / Math.max(1, toRect.height);
    const dx = fromRect.left - toRect.left;
    const dy = fromRect.top - toRect.top;

    widget.classList.add('fullscreen-animating');
    widget.style.transformOrigin = 'top left';
    widget.style.transition = 'none';
    widget.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`;
    widget.style.setProperty('border-radius', goingFull ? '18px' : '0', 'important');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        widget.style.transition = 'transform .68s var(--ease-ios), border-radius .68s var(--ease-ios)';
        widget.style.transform = 'translate3d(0, 0, 0) scale(1)';
        if (goingFull) widget.style.setProperty('border-radius', '0', 'important');
        else widget.style.removeProperty('border-radius');
      });
    });

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      widget.classList.remove('fullscreen-animating');
      widget.style.transition = '';
      widget.style.transform = '';
      widget.style.transformOrigin = '';
      widget.style.removeProperty('border-radius');
      widget.removeEventListener('transitionend', cleanup);
      if (pendingViewRestore && restoreViewCenter(pendingViewRestore)) pendingViewRestore = null;
      syncBoardTimelineChrome();
    };
    widget.addEventListener('transitionend', cleanup);
    setTimeout(cleanup, 850);
  }

  function animateFullscreenExit() {
    const fromRect = widget.getBoundingClientRect();
    widget.classList.remove('fullscreen');
    document.body.classList.remove('board-fullscreen');
    const targetRect = widget.getBoundingClientRect();
    widget.classList.add('fullscreen');
    document.body.classList.add('board-fullscreen');

    const sx = targetRect.width / Math.max(1, fromRect.width);
    const sy = targetRect.height / Math.max(1, fromRect.height);
    const dx = targetRect.left - fromRect.left;
    const dy = targetRect.top - fromRect.top;

    widget.classList.add('fullscreen-animating');
    widget.style.transformOrigin = 'top left';
    widget.style.transition = 'transform .6s var(--ease-ios), border-radius .6s var(--ease-ios)';
    requestAnimationFrame(() => {
      widget.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`;
      widget.style.setProperty('border-radius', '18px', 'important');
    });

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      widget.classList.remove('fullscreen', 'fullscreen-animating');
      document.body.classList.remove('board-fullscreen');
      widget.style.transition = '';
      widget.style.transform = '';
      widget.style.transformOrigin = '';
      widget.style.removeProperty('border-radius');
      widget.removeEventListener('transitionend', cleanup);
      if (pendingViewRestore && restoreViewCenter(pendingViewRestore)) pendingViewRestore = null;
      syncBoardTimelineChrome();
    };
    widget.addEventListener('transitionend', cleanup);
    setTimeout(cleanup, 760);
  }

  function toggleFullscreen() {
    const goingFull = !widget.classList.contains('fullscreen');
    const beforeRect = widget.getBoundingClientRect();
    pendingViewRestore = captureViewCenter();
    if (!goingFull && sourcePanel.classList.contains('source-pip')) closeSourcePanel();
    if (!goingFull) {
      const fsBtn = widget.querySelector('.fs-btn');
      if (fsBtn) {
        fsBtn.classList.remove('active');
        fsBtn.querySelector('i').className = 'fa-solid fa-expand';
      }
      animateFullscreenExit();
      return;
    }
    widget.classList.toggle('fullscreen');
    document.body.classList.toggle('board-fullscreen', goingFull);
    const fsBtn = widget.querySelector('.fs-btn');
    if (fsBtn) {
      fsBtn.classList.toggle('active', goingFull);
      fsBtn.querySelector('i').className = goingFull ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
    }
    requestAnimationFrame(() => {
      restoreViewCenter(pendingViewRestore);
      syncBoardTimelineChrome();
    });
    animateFullscreenTransition(goingFull, beforeRect);
  }

  function zoomBy(deltaFactor, clientX, clientY) {
    const newScale = Math.max(state.minScale, Math.min(state.maxScale, state.scale * (1 + deltaFactor)));
    if (newScale === state.scale) return;
    const rect = viewport.getBoundingClientRect();
    const cx = clientX ?? rect.left + rect.width / 2;
    const cy = clientY ?? rect.top + rect.height / 2;
    const px = cx - rect.left, py = cy - rect.top;
    const wx = (px - state.x) / state.scale;
    const wy = (py - state.y) / state.scale;
    state.scale = newScale;
    state.x = px - wx * newScale;
    state.y = py - wy * newScale;
    applyTransform();
  }

  setupBoardTimeline();
  setupBoardTimelineEditor();
  renderCards({ fit: false });
  requestAnimationFrame(syncBoardTimelineChrome);
  queueVisibleFit();

  let cardDrag = null;
  cardsContainer.addEventListener('pointerdown', e => {
    const cardEl = e.target.closest('.board-card');
    if (!cardEl || !cardsContainer.contains(cardEl)) return;
    if (e.target.closest('button, a, input, textarea, select, [data-source-key], [data-audio-sim], [data-video-sim], [data-media-note]')) return;

    const card = cards.find(c => c.id === cardEl.dataset.cardId);
    if (!card) return;
    e.preventDefault();
    e.stopPropagation();
    cardDrag = {
      card,
      cardEl,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: card.x,
      originY: card.y,
      moved: false
    };
    cardEl.classList.add('dragging');
    try { cardEl.setPointerCapture(e.pointerId); } catch (_) {}
  });

  cardsContainer.addEventListener('pointermove', e => {
    if (!cardDrag || e.pointerId !== cardDrag.pointerId) return;
    const dx = (e.clientX - cardDrag.startX) / state.scale;
    const dy = (e.clientY - cardDrag.startY) / state.scale;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) cardDrag.moved = true;
    cardDrag.card.x = cardDrag.originX + dx;
    cardDrag.card.y = cardDrag.originY + dy;
    cardPositions.set(cardDrag.card.id, { x: cardDrag.card.x, y: cardDrag.card.y });
    syncCardElementPosition(cardDrag.cardEl, cardDrag.card);
    drawArrows();
  });

  function endCardDrag(e) {
    if (!cardDrag || (e && e.pointerId !== cardDrag.pointerId)) return;
    try { cardDrag.cardEl.releasePointerCapture(cardDrag.pointerId); } catch (_) {}
    cardDrag.cardEl.classList.remove('dragging');
    if (cardDrag.moved) {
      e?.preventDefault();
      e?.stopPropagation();
    }
    cardDrag = null;
  }
  cardsContainer.addEventListener('pointerup', endCardDrag);
  cardsContainer.addEventListener('pointercancel', endCardDrag);

  // Pan
  let pan = null;
  viewport.addEventListener('pointerdown', e => {
    if (e.target.closest('.board-card, .board-controls, .board-timeline, .board-widget-header, .fs-close-btn')) return;
    pan = { sx: e.clientX, sy: e.clientY, ox: state.x, oy: state.y, pid: e.pointerId };
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('grabbing');
  });
  viewport.addEventListener('pointermove', e => {
    if (!pan) return;
    state.x = pan.ox + (e.clientX - pan.sx);
    state.y = pan.oy + (e.clientY - pan.sy);
    applyTransform();
  });
  function endPan(e) {
    if (pan && (!e || e.pointerId === pan.pid)) {
      try { viewport.releasePointerCapture(pan.pid); } catch(_) {}
    }
    pan = null;
    viewport.classList.remove('grabbing');
  }
  viewport.addEventListener('pointerup', endPan);
  viewport.addEventListener('pointercancel', endPan);

  viewport.addEventListener('wheel', e => { e.preventDefault(); zoomBy(-e.deltaY * 0.0015, e.clientX, e.clientY); }, { passive: false });

  // Pinch
  let pinch = null;
  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      pinch = {
        d: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY),
        cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        scale: state.scale
      };
    }
  }, { passive: true });
  viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinch) {
      e.preventDefault();
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const factor = d / pinch.d;
      const target = Math.max(state.minScale, Math.min(state.maxScale, pinch.scale * factor));
      const delta = (target - state.scale) / state.scale;
      zoomBy(delta, pinch.cx, pinch.cy);
    }
  }, { passive: false });
  viewport.addEventListener('touchend', () => { pinch = null; });

  // BotÃµes â€” header, controles e estado vazio
  widget.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !widget.contains(btn)) return;
    e.stopPropagation();
    const action = btn.dataset.action;
    if (action === 'zoom-in') zoomBy(0.25);
    else if (action === 'zoom-out') zoomBy(-0.25);
    else if (action === 'fit') fitToView();
    else if (action === 'fullscreen') toggleFullscreen();
    else if (action === 'exit-fullscreen') toggleFullscreen();
  });

  // Listener resize quando em fullscreen
  const resizeObs = new ResizeObserver(() => {
    syncBoardTimelineChrome();
    if (pendingViewRestore && restoreViewCenter(pendingViewRestore)) return;
    if (widget.classList.contains('fullscreen')) {
      applyTransform();
      return;
    }
    if (!initialVisibleFitDone) queueVisibleFit(4);
  });
  resizeObs.observe(viewport);

  // API expostas para zoom externo
  widget._api = { zoomToCard, fit: fitToView, zoomBy, toggleFullscreen, setYear };

  // Aplica highlight inicial se solicitado
  if (highlightCardId) {
    setTimeout(() => zoomToCard(highlightCardId), 500);
  }
}

/* ESC universal */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.body.classList.contains('site-menu-open')) { closeSiteMenu(); return; }
  // sair fullscreen do board primeiro
  const fsWidget = document.querySelector('.board-widget.fullscreen');
  if (fsWidget) { fsWidget._api?.toggleFullscreen(); return; }
  if (mapPane.classList.contains('source-open')) closeSourcePanel();
  else if (yearInlineEdit.classList.contains('visible')) closeYearEdit();
  else if (chatPane.classList.contains('sidebar-open')) {
    chatPane.classList.remove('sidebar-open');
    sidebarToggle.classList.remove('active');
  }
  else if (app.classList.contains('chat-open')) closeChat();
});

document.addEventListener('click', e => {
  // Click fora do year-edit fecha
  if (yearInlineEdit.classList.contains('visible')
      && !yearInlineEdit.contains(e.target)
      && !yearEditBtn.contains(e.target)) {
    closeYearEdit();
  }
  // Click no scrim do sidebar (mobile)
  if (isMobileViewport() && chatPane.classList.contains('sidebar-open')) {
    const sidebar = chatPane.querySelector('.chat-sidebar');
    if (sidebar && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      chatPane.classList.remove('sidebar-open');
      sidebarToggle.classList.remove('active');
    }
  }
});

function updateChatHeader() {
  const c = chatStore.current();
  if (c?.place) {
    chatTitle.textContent = c.place.name;
    chatSubtitle.textContent = `${c.place.region} Â· ${c.place.population}`;
    return;
  }
  if (c) {
    chatTitle.textContent = c.title;
    chatSubtitle.textContent = 'Board de pesquisa';
    return;
  }
  chatTitle.textContent = 'Board de pesquisa';
  chatSubtitle.textContent = 'Mapa e board dos povos originÃ¡rios';
}

/* INIT */
chatStore.newChat(null);
updateChatHeader();
refreshSidebar();

