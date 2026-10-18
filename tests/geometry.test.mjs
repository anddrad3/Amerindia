import test from 'node:test';
import assert from 'node:assert/strict';
import {distanceToGeometry,nearestTerritory,segmentDistance} from '../public/assets/js/map/geometry.js';
const square={type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,1],[0,0]]]};
test('inside a polygon is zero distance',()=>assert.equal(distanceToGeometry([.5,.5],square),0));
test('nearest edge, rather than centroid, determines proximity',()=>{
  const distance=distanceToGeometry([.5,-.1],square);
  assert.ok(distance>11 && distance<11.2);
});
test('holes do not count as part of the territory',()=>{
  const withHole={...square,coordinates:[...square.coordinates,[[.2,.2],[.8,.2],[.8,.8],[.2,.8],[.2,.2]]]};
  assert.ok(distanceToGeometry([.5,.5],withHole)>30);
});
test('multipolygon supports separate areas',()=>assert.equal(distanceToGeometry([.5,.5],{type:'MultiPolygon',coordinates:[square.coordinates]}),0));
test('nearest function chooses the containing feature and handles empty collections',()=>{
  const features=[{id:'near',geometry:square},{id:'far',geometry:{type:'Polygon',coordinates:[[[10,0],[11,0],[11,1],[10,1],[10,0]]]}}];
  assert.equal(nearestTerritory([.5,.5],features).feature.id,'near');assert.equal(nearestTerritory([0,0],[]),null);
});
test('great-circle segment distance clamps to endpoints and handles repeated vertices',()=>{
  assert.ok(segmentDistance([-1,0],[0,0],[1,0])>111);
  assert.equal(segmentDistance([0,0],[0,0],[0,0]),0);
});
