import {normalize} from '../core/dom.js';
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function boardNodes(territory, research, year) {
  const snapshot = territory.snapshots.find(item => item.valid_from <= year && item.valid_to >= year);
  const terms = [territory.name, ...territory.people.split(',')].map(normalize);
  const related = research.filter(item => terms.some(term => term.length > 3 && normalize(`${item.people} ${item.title} ${item.summary}`).includes(term)));
  const query = territory.name === 'Parque do Xingu' ? 'Xingu' : territory.people.split(',')[0].trim();
  return [
    {id:'territory',kind:'territory',title:territory.name,tag:territory.official_status,year,
      text:territory.description,href:snapshot?.source_url || territory.source_url,link:'Consultar fonte cartográfica ↗'},
    {id:'people',kind:'people',title:'Povos & pertencimento',tag:territory.region,glyph:'◎',
      text:territory.people,href:`/acervo?q=${encodeURIComponent(query)}`,link:'Explorar pesquisas →'},
    {id:'source',kind:'source',title:`Cartografia · ${year}`,tag:snapshot?'Recorte documentado':'Sem recorte cadastrado',glyph:'⌖',year,
      text:snapshot?`Atualização informada: ${snapshot.source_date}. Consulta à fonte: ${snapshot.retrieved_at}. O limite representa este recorte; não toda a história do território.`:`Ainda não há limites documentados neste acervo para ${year}. Isso não significa ausência de ocupação indígena.`,
      href:snapshot?.source_url || territory.source_url,link:'Examinar a fonte ↗'},
    ...related.map(item=>({id:`research-${item.id}`,kind:'research',title:item.title,tag:item.topic,year:item.year,glyph:'“',text:`${item.author}. ${item.summary}`,href:item.url,link:'Abrir referência original ↗',research:item})),
    {id:'contribute',kind:'contribute',title:'Uma nova conexão',tag:'Acervo em construção',glyph:'+',text:'Tem uma pesquisa ou uma fonte sobre este território? Compartilhe seu material para análise editorial.',href:'/contribuir',link:'Contribuir →'},
  ];
}

export function initialPosition(index) {
  if (index === 0) return {x:40,y:220};
  return {x:410 + Math.floor((index-1)/2)*350,y:30 + ((index-1)%2)*430};
}

export function fitTransform(cards, width, height) {
  if (!cards.length || width <= 0 || height <= 0) return {x:24,y:24,scale:1};
  const left=Math.min(...cards.map(c=>c.x)), top=Math.min(...cards.map(c=>c.y));
  const right=Math.max(...cards.map(c=>c.x+c.width)), bottom=Math.max(...cards.map(c=>c.y+c.height));
  const scale=clamp(Math.min((width-48)/(right-left),(height-48)/(bottom-top)),.02,1);
  return {scale,x:(width-(right-left)*scale)/2-left*scale,y:(height-(bottom-top)*scale)/2-top*scale};
}

export function zoomTransform(state, factor, anchor) {
  const scale=clamp(state.scale*factor,.02,1.8), ratio=scale/state.scale;
  return {scale,x:anchor.x-(anchor.x-state.x)*ratio,y:anchor.y-(anchor.y-state.y)*ratio};
}
