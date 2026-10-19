import {clamp,fitTransform,zoomTransform} from './model.js';
import {drawConnections} from './cards.js';

export function createViewport(viewport, onChange) {
  const canvas=document.querySelector('#board-canvas'),svg=document.querySelector('#board-connections');
  const indicator=document.querySelector('#board-zoom');
  let cards=[],state={x:0,y:0,scale:1},drag;
  function apply(){canvas.style.transform=`translate(${state.x}px,${state.y}px) scale(${state.scale})`;indicator.value=`${Math.round(state.scale*100)}%`;}
  function place(){cards.forEach(card=>{card.element.style.left=`${card.x}px`;card.element.style.top=`${card.y}px`;});drawConnections(svg,cards);}
  function fit(){state=fitTransform(cards.map(card=>({...card,width:card.element.offsetWidth,height:card.element.offsetHeight})),viewport.clientWidth,viewport.clientHeight);apply();}
  function start(){
    fit();
    if(viewport.clientWidth<650 && cards.length && state.scale<.75){
      const root=cards[0];state={scale:.75,x:24-root.x*.75,y:(viewport.clientHeight-root.element.offsetHeight*.75)/2-root.y*.75};apply();
    }
  }
  function focusCard(id){
    const card=cards.find(item=>item.id===id);if(!card)return;
    state.scale=viewport.clientWidth<650?1:Math.max(.9,state.scale);
    state.x=(viewport.clientWidth-card.element.offsetWidth*state.scale)/2-card.x*state.scale;
    state.y=(viewport.clientHeight-card.element.offsetHeight*state.scale)/2-card.y*state.scale;apply();
  }
  function zoom(factor,point={x:viewport.clientWidth/2,y:viewport.clientHeight/2}){state=zoomTransform(state,factor,point);apply();}
  viewport.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    const handle=event.target.closest('.board-card-handle');
    if(!handle && event.target.closest('.board-card'))return;
    const card=handle?cards.find(item=>item.element.contains(handle)):null;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:card?card.x:state.x,startY:card?card.y:state.y,card};
    viewport.setPointerCapture(event.pointerId);viewport.classList.add('grabbing');card?.element.classList.add('dragging');
  });
  viewport.addEventListener('pointermove',event=>{
    if(!drag || drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(drag.card){drag.card.x=clamp(drag.startX+dx/state.scale,-2000,4000);drag.card.y=clamp(drag.startY+dy/state.scale,-2000,4000);place();}
    else {state.x=drag.startX+dx;state.y=drag.startY+dy;apply();}
  });
  function end(event){
    if(!drag || drag.id!==event.pointerId)return;
    const active=drag;drag=null;active.card?.element.classList.remove('dragging');viewport.classList.remove('grabbing');
    if(active.card){
      const moved=Math.hypot(event.clientX-active.x,event.clientY-active.y)>5;
      if(moved)onChange(cards);
      else if(event.type==='pointerup')active.card.element.dispatchEvent(new Event('board:open'));
    }
  }
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',end);
  viewport.addEventListener('wheel',event=>{event.preventDefault();const rect=viewport.getBoundingClientRect();zoom(event.deltaY<0?1.08:1/1.08,{x:event.clientX-rect.left,y:event.clientY-rect.top});},{passive:false});
  viewport.addEventListener('keydown',event=>{
    const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
    if(!direction)return;
    const card=cards.find(item=>item.element.contains(event.target.closest('.board-card-handle')));
    if(!card && event.target!==viewport)return;
    event.preventDefault();const step=event.shiftKey?50:10;
    if(card){card.x=clamp(card.x+direction[0]*step,-2000,4000);card.y=clamp(card.y+direction[1]*step,-2000,4000);place();onChange(cards);document.querySelector('#board-status').textContent=`Card movido: ${Math.round(card.x)}, ${Math.round(card.y)}.`;}
    else{state.x-=direction[0]*step;state.y-=direction[1]*step;apply();}
  });
  // Keyboard focus always brings an off-screen card into the viewport.
  viewport.addEventListener('focusin',event=>{
    const card=cards.find(item=>item.element.contains(event.target));if(!card)return;
    const left=card.x*state.scale+state.x,top=card.y*state.scale+state.y;
    if(left<0 || top<0 || left+250*state.scale>viewport.clientWidth || top+card.element.offsetHeight*state.scale>viewport.clientHeight){
      state.x=(viewport.clientWidth-250*state.scale)/2-card.x*state.scale;
      state.y=(viewport.clientHeight-card.element.offsetHeight*state.scale)/2-card.y*state.scale;apply();
    }
  });
  return {setCards(next){cards=next;place();start();},fit,start,focusCard,zoom,place};
}
