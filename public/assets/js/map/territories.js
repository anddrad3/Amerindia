import {getCatalog,request} from '../core/api.js';
import {el,externalLink,matches} from '../core/dom.js';
import {nearestTerritory} from './geometry.js';
import {getDevicePosition,locationFailureMessage} from './location.js';
export async function initTerritories() {
  const list=document.querySelector('#territory-list'),status=document.querySelector('#map-status');
  const detail=document.querySelector('#territory-detail'),range=document.querySelector('#map-year');
  const note=document.querySelector('#timeline-note'),output=document.querySelector('#year-output');
  const locate=document.querySelector('#locate-me'),locationStatus=document.querySelector('#location-status');
  const retry=document.querySelector('#retry-map');
  if (!window.L) { status.hidden=false;status.textContent='Não foi possível carregar a biblioteca do mapa. Recarregue a página.';return; }
  const map=L.map('map',{zoomControl:false,scrollWheelZoom:true}).setView([-13,-54],4);
  L.control.zoom({position:'topright'}).addTo(map);
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',crossOrigin:true}).addTo(map);
  let failures=0,successes=0;
  tiles.on('tileload',()=>{successes++;if(successes>3 && failures===0){status.hidden=true;retry.hidden=true;}});
  tiles.on('tileerror',()=>{if(++failures>=3){status.hidden=false;status.textContent='O mapa de fundo está indisponível. Os limites cadastrados continuam acessíveis. Tente recarregar.';retry.hidden=false;}});
  retry.addEventListener('click',()=>{failures=successes=0;status.textContent='Recarregando mapa de fundo…';tiles.redraw();});
  let catalog,features=[],selected='',hover='',layer,controller,requestNumber=0,locationMarker;
  const cache=new Map(),buttons=new Map(),layers=new Map();
  const style=id=>({color:id===selected || id===hover?'#b34d2d':'#456c50',weight:id===selected || id===hover?3:1.5,fillColor:id===selected || id===hover?'#cb6c45':'#67885e',fillOpacity:id===selected || id===hover?.35:.2});
  function restyle(){layers.forEach((item,id)=>item.setStyle(style(id)));buttons.forEach((button,id)=>button.classList.toggle('is-selected',id===selected));}
  function showDetail(territory){
    detail.replaceChildren();detail.hidden=false;
    const close=el('button','detail-close','×');close.type='button';close.setAttribute('aria-label','Fechar detalhes');close.addEventListener('click',()=>{detail.hidden=true;selected='';restyle();});
    const snapshot=territory.snapshots.find(s=>s.valid_from<=+range.value && s.valid_to>=+range.value);
    detail.append(close,el('span','detail-tag',territory.official_status),el('h2','',territory.name),el('p','',territory.people),el('p','',territory.description),el('p','microcopy',snapshot?`Atualização informada pela fonte: ${snapshot.source_date || 'não informada'} · consulta: ${snapshot.retrieved_at}.`:`Sem limite documentado neste acervo para ${range.value}. Isso não significa ausência de ocupação indígena.`),externalLink(snapshot?.source_url || territory.source_url,'Consultar fonte cartográfica ↗'));
    const research=el('a','text-link','Ver pesquisas relacionadas →');research.href=`/acervo?q=${encodeURIComponent(territory.name==='Parque do Xingu'?'Xingu':territory.name.split(' ')[0])}`;detail.append(research);
  }
  function select(id,zoom=true){
    selected=id;const territory=catalog.territories.find(t=>t.id===id);if(!territory)return;
    showDetail(territory);restyle();
    const polygon=layers.get(id);if(polygon && zoom)map.fitBounds(polygon.getBounds(),{paddingTopLeft:[40,90],paddingBottomRight:[50,235],maxZoom:10,animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
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
    output.textContent=year;note.textContent='Carregando o recorte…';
    if(layer)map.removeLayer(layer);layer=null;layers.clear();features=[];
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
  try{catalog=await getCatalog();renderList();await setYear(+range.value);}catch(error){list.replaceChildren(el('p','',error.message));return;}
  document.querySelector('#territory-search').addEventListener('input',event=>renderList(event.target.value));
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
      }catch(error){locationStatus.textContent=locationFailureMessage(error);}finally{locate.disabled=range.disabled=resetYear.disabled=false;}
  });
  new ResizeObserver(()=>map.invalidateSize()).observe(document.querySelector('.map-stage'));
}
