import {el} from '../core/dom.js';
// Reference pins derive from the CURRENT registered lands, not villages or historical occupation.
export function peopleGroups(territories,features){
  const groups=new Map();
  for(const territory of territories){
    const feature=features.find(item=>item.properties.id===territory.id);if(!feature)continue;
    const name=territory.people.includes(',')?(territory.name==='Parque do Xingu'?'Povos do Xingu':`Povos da terra ${territory.name}`):territory.people;
    const group=groups.get(name)||{name,territories:[],bounds:[Infinity,Infinity,-Infinity,-Infinity]};
    group.territories.push(territory);
    const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
    for(const polygon of polygons)for(const [x,y] of polygon[0]){group.bounds[0]=Math.min(group.bounds[0],x);group.bounds[1]=Math.min(group.bounds[1],y);group.bounds[2]=Math.max(group.bounds[2],x);group.bounds[3]=Math.max(group.bounds[3],y);}
    groups.set(name,group);
  }
  return [...groups.values()].map(({bounds,...group})=>{
    return {...group,latlng:[(bounds[1]+bounds[3])/2,(bounds[0]+bounds[2])/2]};
  });
}
export function createPeoplePins(map,L,territories,features,select,highlight){
  const markers=[];
  for(const group of peopleGroups(territories,features)){
    const icon=el('span','people-pin-dot','◎');
    const marker=L.marker(group.latlng,{icon:L.divIcon({className:'people-pin',html:icon,iconSize:[32,38],iconAnchor:[16,38]}),title:`${group.name} — abrir terras cadastradas`,alt:group.name,riseOnHover:true}).addTo(map);
    marker.bindTooltip(el('span','',group.name),{direction:'top',offset:[0,-34]});
    const popup=el('div','people-popup');popup.append(el('strong','',group.name),el('p','','Pin de referência do cadastro de 2026. Não indica aldeia, limite territorial ou ocupação em outros períodos.'));
    for(const territory of group.territories){const button=el('button','button small',`Explorar ${territory.name} ↗`);button.addEventListener('click',()=>{marker.closePopup();select(territory.id);});popup.append(button);}
    marker.bindPopup(popup,{maxWidth:300});
    const ids=group.territories.map(t=>t.id);
    marker.on('mouseover',()=>highlight(ids));marker.on('mouseout',()=>highlight([]));
    const element=marker.getElement();element.setAttribute('aria-label',`${group.name} — abrir terras cadastradas`);element.addEventListener('focus',()=>highlight(ids));element.addEventListener('blur',()=>highlight([]));
    if(group.territories.length===1)marker.on('click',()=>{marker.closePopup();select(group.territories[0].id);});
    markers.push({marker,ids});
  }
  return {highlight(id){markers.forEach(({marker,ids})=>marker.getElement()?.classList.toggle('is-active',ids.includes(id)));}};
}
