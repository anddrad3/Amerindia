import {boardNodes,initialPosition,clamp} from './model.js';
import {createCard} from './cards.js';
import {createViewport} from './viewport.js';
import {el} from '../core/dom.js';

export function createBoard() {
  const panel=document.querySelector('#research-board'),workspace=document.querySelector('#map-workspace');
  const divider=document.querySelector('#pane-divider'),container=document.querySelector('#board-cards');
  const expand=document.querySelector('#board-expand'),reopen=document.querySelector('#reopen-board');
  const viewport=document.querySelector('#board-viewport');
  const jump=document.querySelector('#board-card-select');
  const mobile=matchMedia('(max-width:800px)');
  function syncOverlay(){
    const overlay=!panel.hidden && (mobile.matches || panel.classList.contains('is-expanded'));
    document.querySelector('.map-stage').inert=overlay;
    document.querySelector('.site-header').inert=overlay;
    divider.inert=overlay;
    panel.setAttribute('role',overlay?'dialog':'complementary');
    if(overlay)panel.setAttribute('aria-modal','true');else panel.removeAttribute('aria-modal');
    document.body.classList.toggle('board-expanded',overlay);
  }
  mobile.addEventListener('change',syncOverlay);
  let currentId='',cards=[],saved={},returnFocus;
  function save(next){
    saved=Object.fromEntries(next.map(card=>[card.id,{x:card.x,y:card.y}]));
    try{localStorage.setItem(`amerindia.board.${currentId}`,JSON.stringify(saved));}catch{}
  }
  const view=createViewport(viewport,save);
  function expanded(value){panel.classList.toggle('is-expanded',value);expand.setAttribute('aria-pressed',String(value));expand.setAttribute('aria-label',value?'Reduzir board':'Expandir board');syncOverlay();requestAnimationFrame(()=>view.start());}
  function open(){
    panel.hidden=false;divider.hidden=false;workspace.classList.add('has-board');reopen.hidden=false;
    syncOverlay();
    requestAnimationFrame(()=>view.start());
  }
  function close(){expanded(false);panel.hidden=true;divider.hidden=true;workspace.classList.remove('has-board');syncOverlay();(returnFocus?.isConnected && returnFocus.offsetParent?returnFocus:reopen).focus();}
  panel.addEventListener('keydown',event=>{
    if(event.key!=='Tab' || panel.getAttribute('aria-modal')!=='true')return;
    const focusable=[...panel.querySelectorAll('button,a[href],select,input,textarea,[tabindex="0"]')].filter(item=>!item.disabled && item.offsetParent);
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  });
  document.querySelector('#board-close').addEventListener('click',close);
  reopen.addEventListener('click',()=>{open();document.querySelector('#board-close').focus();});
  expand.addEventListener('click',()=>expanded(!panel.classList.contains('is-expanded')));
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && !panel.hidden && !document.querySelector('dialog[open]')){if(panel.classList.contains('is-expanded')){expanded(false);expand.focus();}else close();}});
  document.querySelector('#board-zoom-in').addEventListener('click',()=>view.zoom(1.2));
  document.querySelector('#board-zoom-out').addEventListener('click',()=>view.zoom(1/1.2));
  document.querySelector('#board-fit').addEventListener('click',()=>view.fit());
  jump.addEventListener('change',()=>{view.focusCard(jump.value);});
  document.querySelector('#board-reset').addEventListener('click',()=>{cards.forEach((card,index)=>Object.assign(card,initialPosition(index)));save(cards);view.place();view.fit();});
  let resizing=false;
  function split(value){const percent=clamp(value,35,65);workspace.style.setProperty('--map-split',`${percent}%`);divider.setAttribute('aria-valuenow',String(Math.round(percent)));}
  divider.addEventListener('pointerdown',event=>{if(event.button!==0)return;resizing=true;divider.setPointerCapture(event.pointerId);document.body.classList.add('pane-resizing');});
  divider.addEventListener('pointermove',event=>{if(resizing){const rect=workspace.getBoundingClientRect();split((event.clientX-rect.left)/rect.width*100);}});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])divider.addEventListener(name,()=>{resizing=false;document.body.classList.remove('pane-resizing');});
  divider.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;event.preventDefault();split(event.key==='Home'?50:Number(divider.getAttribute('aria-valuenow'))+(event.key==='ArrowRight'?2:-2));});
  divider.addEventListener('dblclick',()=>split(50));
  new ResizeObserver(()=>{if(!panel.hidden)view.start();}).observe(viewport);
  return {
    show(territory,research,year,geometry,{reveal=true}={}) {
      if(currentId!==territory.id){
        currentId=territory.id;saved={};
        try{const stored=JSON.parse(localStorage.getItem(`amerindia.board.${currentId}`));if(stored && typeof stored==='object')saved=stored;}catch{}
      }
      if(reveal){returnFocus=document.activeElement;open();}
      document.querySelector('#board-title').textContent=territory.name;
      document.querySelector('#board-description').textContent=`${year} · Relações do acervo. As linhas conectam referências; não representam limites geográficos.`;
      const nodes=boardNodes(territory,research,year);container.replaceChildren();
      const placeholder=el('option','','Navegar pelos cards…');placeholder.value='';jump.replaceChildren(placeholder);
      nodes.forEach(node=>{const option=el('option','',node.title);option.value=node.id;jump.append(option);});
      cards=nodes.map((node,index)=>{
        const stored=saved[node.id],position=stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)?{x:clamp(stored.x,-2000,4000),y:clamp(stored.y,-2000,4000)}:initialPosition(index);
        const element=createCard(node,geometry);container.append(element);return {id:node.id,element,...position};
      });
      view.setCards(cards);
      if(reveal)requestAnimationFrame(()=>{document.querySelector('#board-close').focus({preventScroll:true});view.start();});
    },
  };
}
