import {getCatalog} from '../core/api.js';
import {el,externalLink,matches,normalize,voiceLabels} from '../core/dom.js';
export async function initResearch() {
  const grid = document.querySelector('#research-grid'), count = document.querySelector('#research-count');
  const query = document.querySelector('#research-query');
  const filters = Object.fromEntries(['period','region','people','topic'].map(key => [key,document.querySelector(`#filter-${key}`)]));
  const params = new URLSearchParams(location.search);
  let voice = params.get('voz') || 'all';
  if (!['all',...Object.keys(voiceLabels)].includes(voice)) voice='all';
  let items;
  try { items = (await getCatalog()).research; } catch (error) { count.textContent=error.message; return; }
  for (const [key,select] of Object.entries(filters)) {
    [...new Set(items.map(item=>item[key]))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(value => { const option=el('option','',value); option.value=value; select.append(option); });
    select.addEventListener('change',render);
  }
  const topic = params.get('tema') || '';
  const browseDimensions = {periodizacao:'period',regiao:'region',povo:'people'};
  if (browseDimensions[normalize(topic)]) filters[browseDimensions[normalize(topic)]].focus();
  else query.value = params.get('q') || topic;
  function render() {
    document.querySelectorAll('[data-voice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.voice===voice)));
    const result=items.filter(item => (voice==='all' || item.voice===voice || (['indigena','nao-indigena'].includes(voice) && item.voice==='coautoria')) && matches(`${item.title} ${item.author} ${item.summary} ${item.people} ${item.topic} ${item.period} ${item.region}`,query.value) && Object.entries(filters).every(([key,select]) => !select.value || item[key]===select.value));
    count.textContent=`${result.length} ${result.length===1?'referência encontrada':'referências encontradas'}`;
    grid.replaceChildren();
    result.forEach(item => {
      const card=el('article','research-card');
      card.append(el('span','tag',voiceLabels[item.voice]),el('h2','',item.title),el('p','author',item.author),el('p','',item.summary),el('p','metadata',`${item.year ?? 'Portal de referência'} · ${item.region} · ${item.topic}`),externalLink(item.url,'Consultar fonte original ↗'));
      grid.append(card);
    });
    if (!result.length) {
      const empty=el('div','empty-state'); empty.append(el('h3','','Há espaço para novas histórias.'),el('p','','Ainda não há material cadastrado para essa combinação. Limpe os filtros ou contribua com uma pesquisa.'));
      const link=el('a','button','Enviar uma contribuição ↗');link.href='/contribuir';empty.append(link);grid.append(empty);
    }
  }
  document.querySelectorAll('[data-voice]').forEach(button=>button.addEventListener('click',()=>{voice=button.dataset.voice;render();}));
  query.addEventListener('input',render);
  document.querySelector('#clear-filters').addEventListener('click',()=>{voice='all';query.value='';Object.values(filters).forEach(select=>select.value='');render();});
  render();
}
