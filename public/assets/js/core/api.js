let catalogPromise;
export async function request(url, options = {}) {
  const response = await fetch(url, {credentials:'same-origin', ...options});
  let data;
  try { data = await response.json(); } catch { throw new Error('O servidor não respondeu como esperado. Tente novamente.'); }
  if (!response.ok) throw new Error(data.error || 'Não foi possível completar a operação.');
  return data;
}
export function getCatalog() {
  if (!catalogPromise) catalogPromise = request('/api/catalog').catch(error => { catalogPromise = null; throw error; });
  return catalogPromise;
}
