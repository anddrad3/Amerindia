import {el,externalLink,voiceLabels} from '../core/dom.js';
let dialog,body,title;
function ensureDialog(){
  if(dialog)return;
  dialog=el('dialog','detail-dialog');dialog.setAttribute('aria-labelledby','detail-title');
  const header=el('div','detail-heading');title=el('h2');title.id='detail-title';
  const close=el('button','icon-button','×');close.type='button';close.setAttribute('aria-label','Fechar informações');
  close.addEventListener('click',()=>dialog.close());header.append(title,close);
  body=el('div','detail-body');dialog.append(header,body);document.body.append(dialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)dialog.close();}});
}
function link(url,label){if(url?.startsWith('/') && !url.startsWith('//')){const a=el('a','text-link',label);a.href=url;return a;}return externalLink(url,label);}
export function showDetails(node){
  ensureDialog();title.textContent=node.title;body.replaceChildren();
  const item=node.research;
  body.append(el('p','eyebrow',item?voiceLabels[item.voice]:node.tag),el('p','',item?item.summary:node.text));
  if(item){
    body.append(el('p','metadata',`${item.year ?? 'Portal de referência'} · ${item.people} · ${item.period} · ${item.topic}`));
    body.append(el('h3','','Sobre a autoria'));
    const authors=item.authors?.length?item.authors:[{name:item.author,bio:'Biografia ainda não cadastrada. Consulte os créditos na fonte original.',url:item.url}];
    for(const author of authors){const section=el('section','author-profile');section.append(el('h4','',author.name),el('p','',author.bio),externalLink(author.url,'Consultar fonte sobre a autoria ↗'));body.append(section);}
    body.append(el('h3','','Acesso ao material'));
    if(item.download_url)body.append(externalLink(item.download_url,item.download_label || 'Baixar pesquisa · PDF ↗','button primary'));
    else body.append(el('p','microcopy','Não há PDF autorizado cadastrado para download.'));
    if(item.rights_note)body.append(el('p','microcopy',item.rights_note));
  }
  if(node.href)body.append(link(node.href,node.link || 'Consultar fonte original ↗'));
  const correction=el('a','text-link','Sugerir uma correção →');correction.href='/contribuir?tipo=correction';body.append(correction);
  if(!dialog.open)dialog.showModal();
}
export function researchDetails(item){showDetails({title:item.title,research:item,href:item.url,link:'Consultar fonte original ↗'});}
