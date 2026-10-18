export function getDevicePosition(geolocation) {
  if (!geolocation) return Promise.reject(new Error('Seu navegador não oferece localização.'));
  return new Promise((resolve,reject)=>geolocation.getCurrentPosition(resolve,reject,{
    enableHighAccuracy:false, timeout:12000, maximumAge:60000,
  }));
}
export function locationFailureMessage(error) {
  if (error.code===1) return 'Permissão não concedida. Você pode continuar explorando pela lista.';
  if (error.code===2) return 'Não foi possível determinar sua localização. Verifique o GPS e tente novamente.';
  if (error.code===3) return 'A localização demorou a responder. Tente novamente.';
  return error.message || 'Não foi possível consultar a localização.';
}
