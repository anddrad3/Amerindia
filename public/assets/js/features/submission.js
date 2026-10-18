import {request} from '../core/api.js';
import {el} from '../core/dom.js';
export function initSubmission() {
  const form=document.querySelector('#contribution-form'),kind=document.querySelector('#submission-kind');
  const research=document.querySelector('#research-fields'),result=document.querySelector('#submission-result');
  const button=document.querySelector('#submit-contribution'),message=document.querySelector('#message-label');
  const initial=new URLSearchParams(location.search).get('tipo');
  if (['research','correction','contact'].includes(initial)) kind.value=initial;
  function sync() {
    research.hidden=research.disabled=kind.value!=='research';
    message.textContent=kind.value==='correction'?'Qual informação precisa ser corrigida? Inclua o link, a correção proposta e as fontes.':kind.value==='contact'?'Como podemos ajudar?':'Apresente seu trabalho, suas fontes e os créditos das imagens';
    result.replaceChildren();
  }
  kind.addEventListener('change',sync);sync();
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;
    for (const field of form.querySelectorAll('input[type=file]')) {
      if (!research.disabled && field.files[0]?.size>5*1024*1024) { result.className='submission-error'; result.textContent='Cada PDF pode ter no máximo 5 MB.'; return; }
    }
    const payload=new FormData(form);
    button.disabled=true;button.textContent='Enviando…'; result.className='';result.textContent='';
    try {
      const response=await request('/api/submissions',{method:'POST',body:payload});
      form.reset();kind.value=payload.get('kind');sync();
      result.className='submission-success';result.append(el('strong','','Contribuição recebida.'),el('p','',response.message),el('p','',`Protocolo: ${response.protocol}`));
      result.tabIndex=-1;result.focus();
    } catch(error) {result.className='submission-error';result.textContent=error.message;}
    finally {button.disabled=false;button.textContent='Enviar para análise ↗';}
  });
}
