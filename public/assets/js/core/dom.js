export function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
export function externalLink(url, label, className = 'text-link') {
  const link = el('a', className, label);
  const target = new URL(url, window.location.origin);
  if (target.protocol !== 'https:') return el('span', className, label);
  link.href = target.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
  return link;
}
export function normalize(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
}
export function matches(value, query) { return normalize(value).includes(normalize(query)); }
export function announce(message) { document.querySelector('#announcement').textContent = message; }
export const voiceLabels = {indigena:'Voz indígena','nao-indigena':'Voz não indígena',coautoria:'Coautoria indígena e não indígena',institucional:'Referência institucional'};
