// WGS84 bounding box around Brazil. Adjacent countries may be visible at the edges.
export const BRAZIL_BOUNDS = [[-34,-74],[6,-34]];
export function constrainToBrazil(map,L) {
  const bounds=L.latLngBounds(BRAZIL_BOUNDS);
  map.setMaxBounds(bounds);map.options.maxBoundsViscosity=1;
  let overview=true,adjusting=false;
  map.on('zoomstart movestart',()=>{if(!adjusting)overview=false;});
  function resize(reset=false){
    adjusting=true;
    map.invalidateSize({pan:false});
    // Fractional zoom retains the full Brazil overview in a narrow split panel.
    const minimum=map.getBoundsZoom(bounds,false,[40,150]);
    map.setMinZoom(minimum);
    if(reset || overview){map.fitBounds(bounds,{paddingTopLeft:[20,80],paddingBottomRight:[20,70],animate:false});overview=true;}
    else map.panInsideBounds(bounds,{animate:false});
    adjusting=false;
  }
  resize(true);
  new ResizeObserver(()=>resize()).observe(document.querySelector('.map-stage'));
  document.querySelector('#reset-brazil').addEventListener('click',()=>resize(true));
  return {focus(){overview=false;}};
}
