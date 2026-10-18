const R=6371.0088, rad=degrees=>degrees*Math.PI/180;
function angular(a,b) {
  const dlat=rad(b[1]-a[1]),dlon=rad(b[0]-a[0]);
  return 2*Math.asin(Math.min(1,Math.sqrt(Math.sin(dlat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dlon/2)**2)));
}
function bearing(a,b) {
  const dl=rad(b[0]-a[0]),la=rad(a[1]),lb=rad(b[1]);
  return Math.atan2(Math.sin(dl)*Math.cos(lb),Math.cos(la)*Math.sin(lb)-Math.sin(la)*Math.cos(lb)*Math.cos(dl));
}
export function segmentDistance(point,a,b) {
  const segment=angular(a,b),d=angular(a,point);
  if (segment<1e-12) return d*R;
  const delta=bearing(a,point)-bearing(a,b);
  const cross=Math.asin(Math.max(-1,Math.min(1,Math.sin(d)*Math.sin(delta))));
  const along=Math.atan2(Math.sin(d)*Math.cos(delta),Math.cos(d));
  return (along>=0 && along<=segment ? Math.abs(cross) : Math.min(d,angular(b,point)))*R;
}
function inRing(point,ring) {
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[i],b=ring[j];
    if((a[1]>point[1])!==(b[1]>point[1]) && point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
  }
  return inside;
}
export function distanceToGeometry(point,geometry) {
  const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
  let distance=Infinity;
  for(const polygon of polygons) {
    if(inRing(point,polygon[0]) && !polygon.slice(1).some(hole=>inRing(point,hole))) return 0;
    for(const ring of polygon) for(let i=1;i<ring.length;i++) distance=Math.min(distance,segmentDistance(point,ring[i-1],ring[i]));
  }
  return distance;
}
export function nearestTerritory(point,features) {
  return features.map(feature=>({feature,distance:distanceToGeometry(point,feature.geometry)})).sort((a,b)=>a.distance-b.distance)[0] ?? null;
}
