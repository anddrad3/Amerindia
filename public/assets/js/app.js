import {initSearch} from './features/search.js';
import {initNavigation} from './features/navigation.js';
initNavigation();
initSearch();
const page=document.body.dataset.page;
const modules={
  research:()=>import('./features/research.js').then(module=>module.initResearch()),
  contribute:()=>import('./features/submission.js').then(module=>module.initSubmission()),
  territories:()=>import('./map/territories.js').then(module=>module.initTerritories()),
};
if(modules[page]) modules[page]().catch(error=>{
  console.error('Não foi possível iniciar a página.',error);
  document.querySelector('#announcement').textContent='Ocorreu um problema ao carregar a página. Tente recarregar.';
});
