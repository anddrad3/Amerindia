import test from 'node:test';
import assert from 'node:assert/strict';
import {boardNodes,fitTransform,zoomTransform} from '../public/assets/js/board/model.js';
const territory={name:'Yanomami',people:'Yanomámi',region:'RR, AM',official_status:'Regularizada',description:'Fonte cartográfica.',source_url:'https://example.com/current',snapshots:[{valid_from:2026,valid_to:2026,source_date:'2026-01-23',retrieved_at:'2026-10-18',source_url:'https://example.com/snapshot'}]};
test('board connects only research related to this territory, including accented names',()=>{
  const research=[{id:'related',people:'Yanomami',title:'Memórias',summary:'Pesquisa',author:'Autoria',topic:'História',url:'https://example.com/research'},{id:'other',people:'Pataxó',title:'Outra pesquisa',summary:'Outro povo'}];
  const cards=boardNodes(territory,research,2026);
  assert.ok(cards.some(card=>card.id==='research-related'));
  assert.ok(!cards.some(card=>card.id==='research-other'));
  assert.equal(cards.find(card=>card.id==='source').href,'https://example.com/snapshot');
});
test('missing historical geography never becomes a documented snapshot',()=>{
  const source=boardNodes(territory,[],1800).find(card=>card.id==='source');
  assert.equal(source.tag,'Sem recorte cadastrado');
  assert.match(source.text,/não significa ausência/);
});
test('zoom keeps the pointed canvas coordinate stationary and respects limits',()=>{
  const state={x:100,y:-20,scale:.8},anchor={x:320,y:240};
  for(const factor of [1.2,.1,20]){
    const next=zoomTransform(state,factor,anchor);
    assert.ok(next.scale>=.02 && next.scale<=1.8);
    assert.ok(Math.abs((anchor.x-state.x)/state.scale-(anchor.x-next.x)/next.scale)<1e-9);
    assert.ok(Math.abs((anchor.y-state.y)/state.scale-(anchor.y-next.y)/next.scale)<1e-9);
  }
});
test('fit accommodates displaced cards with negative coordinates',()=>{
  const cards=[{x:-200,y:-100,width:250,height:300},{x:500,y:350,width:250,height:320}];
  const view=fitTransform(cards,1000,800);
  for(const card of cards){assert.ok(card.x*view.scale+view.x>=0);assert.ok(card.y*view.scale+view.y>=0);assert.ok((card.x+card.width)*view.scale+view.x<=1000);assert.ok((card.y+card.height)*view.scale+view.y<=800);}
});
test('overview can recover far-apart cards on a narrow screen',()=>{
  const cards=[{x:-2000,y:-2000,width:250,height:300},{x:4000,y:4000,width:250,height:320}];
  const view=fitTransform(cards,320,500);
  for(const card of cards){assert.ok(card.x*view.scale+view.x>=0);assert.ok((card.x+card.width)*view.scale+view.x<=320);assert.ok(card.y*view.scale+view.y>=0);assert.ok((card.y+card.height)*view.scale+view.y<=500);}
});
