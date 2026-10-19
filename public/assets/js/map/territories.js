import {getCatalog,request} from '../core/api.js';
import {el,matches} from '../core/dom.js';
import {createBoard} from '../board/controller.js';
import {constrainToBrazil} from './brazil.js';
import {createPeoplePins} from './people.js';
import {nearestTerritory} from './geometry.js';
import {getDevicePosition,locationFailureMessage} from './location.js';
export async function initTerritories() {
  const list=document.querySelector('#territory-list'),status=document.querySelector('#map-status');
  const range=document.querySelector('#map-year');
  const note=document.querySelector('#timeline-note'),output=document.querySelector('#year-output');
  const locate=document.querySelector('#locate-me'),locationStatus=document.querySelector('#location-status');
  const retry=document.querySelector('#retry-map');
  if (!window.L) { status.hidden=false;status.textContent='Não foi possível carregar a biblioteca do mapa. Recarregue a página.';return; }
  const map=L.map('map',{zoomControl:false,scrollWheelZoom:true,zoomSnap:.1,zoomDelta:.5}).setView([-14,-54],4);
  const geography=constrainToBrazil(map,L);
  L.control.zoom({position:'bottomleft',zoomInTitle:'Aproximar mapa',zoomOutTitle:'Afastar mapa'}).addTo(map);
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,noWrap:true,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',crossOrigin:true}).addTo(map);
  const board=createBoard();
  const peoplePanel=document.querySelector('#people-panel'),peopleToggle=document.querySelector('#toggle-people');
  function setPeople(open){peoplePanel.hidden=!open;peopleToggle.setAttribute('aria-expanded',String(open));}
  peopleToggle.addEventListener('click',()=>setPeople(peoplePanel.hidden));
  document.querySelector('#close-people').addEventListener('click',()=>{setPeople(false);peopleToggle.focus();});
  document.querySelector('#territory-search-form').addEventListener('submit',event=>{event.preventDefault();setPeople(true);});
  let failures=0,successes=0;
  tiles.on('tileload',()=>{successes++;if(successes>3 && failures===0){status.hidden=true;retry.hidden=true;}});
  tiles.on('tileerror',()=>{if(++failures>=3){status.hidden=false;status.textContent='O mapa de fundo está indisponível. Os limites cadastrados continuam acessíveis. Tente recarregar.';retry.hidden=false;}});
  retry.addEventListener('click',()=>{failures=successes=0;status.textContent='Recarregando mapa de fundo…';tiles.redraw();});
  let catalog,features=[],selected='',hover='',hoverPeople=[],pins,layer,controller,requestNumber=0,locationMarker;
  const cache=new Map(),buttons=new Map(),layers=new Map();
  const style=id=>({color:'#ff6a1a',weight:id===selected || id===hover || hoverPeople.includes(id)?3:1.5,fillColor:'#ff6a1a',fillOpacity:id===selected || id===hover || hoverPeople.includes(id)?.4:.18});
  function restyle(){layers.forEach((item,id)=>item.setStyle(style(id)));buttons.forEach((button,id)=>button.classList.toggle('is-selected',id===selected));pins?.highlight(hover||selected);}
  function select(id,zoom=true){
    selected=id;const territory=catalog.territories.find(t=>t.id===id);if(!territory)return;
    if(zoom)geography.focus();
    board.show(territory,catalog.research,+range.value,features.find(feature=>feature.properties.id===id)?.geometry,{reveal:zoom});restyle();
    if(zoom){setPeople(false);requestAnimationFrame(()=>{
      map.invalidateSize();const polygon=layers.get(id);
      if(polygon)map.fitBounds(polygon.getBounds(),{paddingTopLeft:[30,150],paddingBottomRight:[30,160],maxZoom:9,animate:false});
    });}
  }
  function renderList(query=''){
    list.replaceChildren();buttons.clear();
    catalog.territories.filter(t=>matches(`${t.name} ${t.people} ${t.region}`,query)).forEach((territory,index)=>{
      const button=el('button','territory-item');button.type='button';
      const text=el('span');text.append(el('strong','',territory.name),el('small','',`${territory.region} · ${territory.people.length>65?territory.people.slice(0,62)+'…':territory.people}`));
      button.append(el('span','territory-number',String(index+1).padStart(2,'0')),text,el('span','item-arrow','↗'));
      button.addEventListener('click',()=>select(territory.id));
      for(const event of ['mouseenter','focus'])button.addEventListener(event,()=>{hover=territory.id;restyle();});
      for(const event of ['mouseleave','blur'])button.addEventListener(event,()=>{hover='';restyle();});
      buttons.set(territory.id,button);list.append(button);
    });
    if(!buttons.size)list.append(el('p','microcopy','Nenhuma terra encontrada no cadastro atual.'));
    restyle();
  }
  async function setYear(year){
    const current=++requestNumber;controller?.abort();controller=new AbortController();
    output.textContent=year;document.querySelector('#timeline-summary-year').textContent=year;note.textContent='Carregando o recorte…';
    if(layer)map.removeLayer(layer);layer=null;layers.clear();features=[];
    if(selected && catalog)board.show(catalog.territories.find(t=>t.id===selected),catalog.research,year,undefined,{reveal:false});
    try{
      const collection=cache.get(year) || await request(`/api/territories?year=${year}`,{signal:controller.signal});
      if(current!==requestNumber)return;
      if(cache.size>12)cache.clear();cache.set(year,collection);features=collection.features;
      layer=L.geoJSON(collection,{style:feature=>style(feature.properties.id),onEachFeature:(feature,polygon)=>{
        const id=feature.properties.id;layers.set(id,polygon);
        const tooltip=el('span','',feature.properties.name);polygon.bindTooltip(tooltip,{sticky:true});
        polygon.on('mouseover',()=>{hover=id;restyle();});polygon.on('mouseout',()=>{hover='';restyle();});polygon.on('click',()=>select(id));
      }}).addTo(map);
      note.textContent=features.length?`${features.length} limites documentados neste recorte. Consulte a fonte e a data em cada terra.`:`Não há cartografia cadastrada para ${year}. A ausência de mapa não significa ausência de ocupação indígena.`;
      if(selected)select(selected,false);
    }catch(error){if(error.name!=='AbortError')note.textContent=error.message;}
  }
  try{
    catalog=await getCatalog();renderList();await setYear(+range.value);
    const current=cache.get(2026) || await request('/api/territories?year=2026');
    pins=createPeoplePins(map,L,catalog.territories,current.features,select,ids=>{hoverPeople=ids;restyle();});
  }catch(error){list.replaceChildren(el('p','',error.message));return;}
  document.querySelector('#territory-search').addEventListener('input',event=>{renderList(event.target.value);setPeople(true);});
  let debounce;
  range.addEventListener('input',()=>{output.textContent=range.value;note.textContent='Atualizando o recorte…';clearTimeout(debounce);debounce=setTimeout(()=>setYear(+range.value),150);});
  document.querySelector('#reset-year').addEventListener('click',()=>{range.value=2026;clearTimeout(debounce);setYear(2026);});
  const initial=new URLSearchParams(location.search).get('povo');if(initial)select(initial);
  locate.addEventListener('click',async()=>{
    const resetYear=document.querySelector('#reset-year');
    locate.disabled=range.disabled=resetYear.disabled=true;
    locationStatus.textContent='Aguardando sua permissão para usar a localização…';
    clearTimeout(debounce);
      try{
        const position=await getDevicePosition(navigator.geolocation);
        range.value=2026;await setYear(2026);
        if(+output.value!==2026 || !features.length)throw new Error('Não foi possível carregar os limites para comparar a proximidade.');
        const point=[position.coords.longitude,position.coords.latitude],nearest=nearestTerritory(point,features);
        if(!nearest)throw new Error('Não há terras cadastradas para comparação.');
        if(locationMarker)map.removeLayer(locationMarker);
        locationMarker=L.circleMarker([point[1],point[0]],{radius:7,color:'#286c99',fillOpacity:.9}).bindTooltip('Sua localização aproximada').addTo(map);
        select(nearest.feature.properties.id);
        const distance=nearest.distance<.1?'Você está dentro ou junto ao limite cadastrado':`Distância aproximada até o limite: ${nearest.distance.toLocaleString('pt-BR',{maximumFractionDigits:1})} km`;
        locationStatus.textContent=`${nearest.feature.properties.name}: ${distance}. Comparação somente entre as ${features.length} terras cadastradas; precisão informada pelo dispositivo: ${Math.round(position.coords.accuracy)} m. Não é rota de acesso ou autorização de entrada.`;
        document.querySelector('#board-description').textContent=locationStatus.textContent;
        setPeople(true);
      }catch(error){locationStatus.textContent=locationFailureMessage(error);}finally{locate.disabled=range.disabled=resetYear.disabled=false;}
  });
}
