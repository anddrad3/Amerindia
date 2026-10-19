import test from 'node:test';
import assert from 'node:assert/strict';
import {peopleGroups} from '../public/assets/js/map/people.js';
const feature=id=>({properties:{id},geometry:{type:'Polygon',coordinates:[[[-40,-16],[-39,-16],[-39,-17],[-40,-17],[-40,-16]]]}});
test('one people pin can connect multiple lands without duplicating the people',()=>{
  const groups=peopleGroups([{id:'a',people:'Pataxó'},{id:'b',people:'Pataxó'}],[feature('a'),feature('b')]);
  assert.equal(groups.length,1);assert.equal(groups[0].territories.length,2);
  assert.deepEqual(groups[0].latlng,[-16.5,-39.5]);
});
test('multi-people territories have a collective label, and missing geometry creates no invented pin',()=>{
  const groups=peopleGroups([{id:'a',name:'Parque do Xingu',people:'Aweti, Kalapalo'},{id:'missing',people:'Example'}],[feature('a')]);
  assert.equal(groups.length,1);assert.equal(groups[0].name,'Povos do Xingu');
});
