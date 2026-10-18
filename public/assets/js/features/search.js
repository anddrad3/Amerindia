import {getCatalog} from '../core/api.js';
import {el,matches} from '../core/dom.js';
export function initSearch() {
  const dialog = document.querySelector('#search-dialog');
  const query = document.querySelector('#global-query');
  const results = document.querySelector('#global-results');
  let trigger, sequence = 0;
  document.querySelectorAll('.search-trigger').forEach(button => button.addEventListener('click', () => {
    trigger = button; dialog.showModal(); query.focus();
  }));
  document.querySelector('#close-search').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger?.focus());
  dialog.addEventListener('click', event => { if (event.target === dialog && event.clientX < dialog.getBoundingClientRect().left) dialog.close(); });
  query.addEventListener('input', async () => {
    const current = ++sequence, term = query.value.trim();
    results.replaceChildren(el('p','',term ? 'Buscando…' : 'Experimente “Yanomami”, “mulheres” ou “ditadura”.'));
    if (!term) return;
    try {
      const catalog = await getCatalog();
      if (current !== sequence) return;
      const entries = [
        ...catalog.territories.map(t => ({title:t.name,meta:`Território · ${t.people}`,keywords:t.region,href:`/territorios?povo=${encodeURIComponent(t.id)}`})),
        ...catalog.research.map(r => ({title:r.title,meta:`${r.author} · ${r.topic}`,keywords:`${r.people} ${r.summary} ${r.period} ${r.region}`,href:`/acervo?q=${encodeURIComponent(r.title)}`}))
      ].filter(item => matches(`${item.title} ${item.meta} ${item.keywords}`,term)).slice(0,10);
      results.replaceChildren();
      if (!entries.length) results.append(el('p','','Nenhum registro encontrado. O acervo está em construção.'));
      entries.forEach(item => { const link = el('a'); link.href=item.href; link.append(el('strong','',item.title),el('small','',item.meta)); results.append(link); });
    } catch (error) { if (current === sequence) results.replaceChildren(el('p','',error.message)); }
  });
}
