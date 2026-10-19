import {el,externalLink} from '../core/dom.js';
import {showDetails} from '../features/details.js';
const SVG='http://www.w3.org/2000/svg';

function outline(geometry) {
  if (!geometry || !['Polygon','MultiPolygon'].includes(geometry.type)) return null;
  const rings=geometry.type==='Polygon'?geometry.coordinates:geometry.coordinates.flat();
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  rings.forEach(ring=>ring.forEach(([x,y])=>{minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}));
  const scale=Math.min(210/Math.max(.001,maxX-minX),90/Math.max(.001,maxY-minY));
  const svg=document.createElementNS(SVG,'svg');svg.setAttribute('viewBox','0 0 230 110');svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS(SVG,'path');
  path.setAttribute('d',rings.map(ring=>ring.map(([x,y],i)=>`${i?'L':'M'}${(115+(x-(minX+maxX)/2)*scale).toFixed(2)},${(55-(y-(minY+maxY)/2)*scale).toFixed(2)}`).join(' ')+' Z').join(' '));
  path.setAttribute('fill-rule','evenodd');svg.append(path);return svg;
}

export function createCard(node, geometry) {
  const card=el('article','board-card');card.dataset.cardId=node.id;card.dataset.kind=node.kind;
  const visual=el('div','board-card-visual');
  const map=node.kind==='territory'?outline(geometry):null;
  visual.append(map || el('span','board-glyph',node.glyph || '⌖'));
  if(node.year)visual.append(el('span','board-year',String(node.year)));
  const body=el('div','board-card-body'),heading=el('h3','board-card-heading');
  const handle=el('button','board-card-handle',node.title);handle.type='button';handle.setAttribute('aria-label',`Mover card: ${node.title}`);
  handle.title='Clique para abrir informações; arraste ou use as setas para mover.';
  heading.append(handle);body.append(el('span','board-tag',node.tag),heading,el('p','',node.text));
  let link;
  if(node.href.startsWith('/')) {link=el('a','text-link',node.link);link.href=node.href;}
  else link=externalLink(node.href,node.link);
  const detail=el('button','board-detail','Ver informações ↗');detail.type='button';detail.addEventListener('click',()=>showDetails(node));
  card.addEventListener('board:open',()=>showDetails(node));
  card.addEventListener('click',event=>{if(!event.target.closest('a,button'))showDetails(node);});
  handle.addEventListener('click',event=>{if(event.detail===0)showDetails(node);});
  body.append(detail,link);card.append(visual,body);return card;
}

export function drawConnections(svg,cards) {
  svg.replaceChildren();if(cards.length<2)return;
  const root=cards[0],start={x:root.x+root.element.offsetWidth,y:root.y+root.element.offsetHeight/2};
  for(const card of cards.slice(1)) {
    const end={x:card.x,y:card.y+card.element.offsetHeight/2};
    const path=document.createElementNS(SVG,'path'),bend=Math.max(60,Math.abs(end.x-start.x)*.5);
    path.setAttribute('d',`M ${start.x} ${start.y} C ${start.x+bend} ${start.y}, ${end.x-bend} ${end.y}, ${end.x} ${end.y}`);
    const dot=document.createElementNS(SVG,'circle');dot.setAttribute('cx',end.x);dot.setAttribute('cy',end.y);dot.setAttribute('r',3);
    svg.append(path,dot);
  }
}
