/* ===== Chat Widget — M7M Beauty (M7M Beauty) =====
   Self-contained: injeta CSS + HTML + lógica. Funciona em modo MENU sozinho;
   quando o n8n estiver pronto, preencha N8N_WEBHOOK que ele passa a usar o n8n. */
(function(){
  var CFG = {
    N8N_WEBHOOK: "",                 // <-- cole aqui a URL do webhook do n8n quando estiver pronto
    WHATSAPP: "353834335251",       // WhatsApp da loja (13 díg.)
    NOME: "M7M Beauty"
  };
  // respostas de menu (funcionam sem n8n) — palavra-chave -> resposta
  var FAQ = [
    {k:["frete","entrega","envio","correio","chega"], a:"🚚 Enviamos para todo o Brasil! Frete grátis acima de R$199. Na região da fronteira, dá pra combinar retirada. Me diz seu CEP no WhatsApp que eu calculo certinho 😉"},
    {k:["pag","pix","cartao","cartão","parcel","juros"], a:"💳 Aceitamos Pix e cartão (parcelamos!). Fecho seu pedido pelo WhatsApp com o link de pagamento 💛"},
    {k:["original","autentic","verdad","falso"], a:"✅ Todos os produtos são ORIGINAIS. Você recebe lacrado e pode conferir. É outlet de marca famosa com preço bom, não réplica 💎"},
    {k:["marca","dior","chanel","ysl","mac","kerastase","kérastase","ordinary","fenty","vichy","cerave"], a:"💄 Trabalhamos com Dior, Chanel, YSL, MAC, La Roche-Posay, Kérastase, The Ordinary, Fenty, Vichy e mais — tudo com preço de outlet. Qual você procura?"},
    {k:["kit","presente","gift"], a:"🎁 Temos kits de presente prontos (embalagem premium)! Perfeitos pra presentear. Quer ver os disponíveis? Chama no WhatsApp 💛"},
    {k:["perfume","fragran"], a:"🌸 Temos perfumes Dior, Chanel, YSL, Paco Rabanne, Carolina Herrera e mais, com desconto. Qual estilo você curte — doce, amadeirado, floral?"},
    {k:["skincare","pele","serum","sérum","creme"], a:"✨ Skincare de La Roche-Posay, The Ordinary, CeraVe, Vichy... me conta seu tipo de pele que eu te indico 😊"},
    {k:["cabelo","shampoo","kerast"], a:"💇‍♀️ Linha de cabelo Kérastase e mais — shampoo, óleo, kits. Quer nutrição, brilho ou reconstrução?"},
    {k:["ola","olá","oi","bom dia","boa tarde","boa noite","tudo bem"], a:"Oi! 💛 Bem-vinda à "+CFG.NOME+". Como posso te ajudar? Você pode perguntar sobre marcas, frete, pagamento ou kits — ou falar direto com a gente no WhatsApp."}
  ];
  var QUICK = ["Marcas & preços","Frete","Formas de pagamento","Kits de presente"];

  var CSS = ""
  +".lschat-btn{position:fixed;bottom:26px;left:26px;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#E91E63,#B0004B);box-shadow:0 10px 26px rgba(233,30,99,.5);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:250;transition:.3s;border:none}"
  +".lschat-btn:hover{transform:scale(1.08)}.lschat-btn svg{width:30px;height:30px;fill:#fff}"
  +".lschat-badge{position:absolute;top:-3px;right:-3px;width:16px;height:16px;background:#C7A26A;border-radius:50%;border:2px solid #fff}"
  +".lschat-box{position:fixed;bottom:96px;left:26px;width:350px;max-width:calc(100vw - 40px);height:480px;max-height:70vh;background:#fff;border-radius:16px;box-shadow:0 24px 60px -18px rgba(43,43,43,.45);z-index:251;display:none;flex-direction:column;overflow:hidden;font-family:'Poppins',sans-serif}"
  +".lschat-box.open{display:flex;animation:lsup .28s ease}@keyframes lsup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}"
  +".lschat-head{background:linear-gradient(135deg,#2B2B2B,#B0004B);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:10px}"
  +".lschat-head .av{width:38px;height:38px;border-radius:50%;background:#E91E63;display:flex;align-items:center;justify-content:center;font-size:18px}"
  +".lschat-head h4{font-size:15px;font-weight:600;margin:0}.lschat-head p{font-size:11px;opacity:.85;margin:0}"
  +".lschat-head .x{margin-left:auto;background:none;border:none;color:#fff;font-size:22px;cursor:pointer;opacity:.8}"
  +".lschat-msgs{flex:1;overflow-y:auto;padding:16px;background:#F9F5F7;display:flex;flex-direction:column;gap:10px}"
  +".lschat-msg{max-width:82%;padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;font-weight:300}"
  +".lschat-msg.bot{background:#fff;color:#2B2B2B;border:1px solid #f0e3e9;align-self:flex-start;border-bottom-left-radius:4px}"
  +".lschat-msg.me{background:#E91E63;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}"
  +".lschat-quick{display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 10px;background:#F9F5F7}"
  +".lschat-quick button{background:#fff;border:1px solid #E91E63;color:#B0004B;font-size:12px;padding:6px 12px;border-radius:20px;cursor:pointer;font-family:inherit;transition:.2s}"
  +".lschat-quick button:hover{background:#E91E63;color:#fff}"
  +".lschat-wa{display:block;margin:0 16px 10px;text-align:center;background:#25d366;color:#fff;padding:10px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none}"
  +".lschat-in{display:flex;border-top:1px solid #eee;padding:10px}"
  +".lschat-in input{flex:1;border:1px solid #eadfe4;border-radius:20px;padding:9px 14px;font-size:13.5px;outline:none;font-family:inherit}"
  +".lschat-in input:focus{border-color:#E91E63}"
  +".lschat-in button{background:#E91E63;border:none;color:#fff;width:38px;height:38px;border-radius:50%;margin-left:8px;cursor:pointer;font-size:16px}"
  +"@media(max-width:600px){.lschat-btn{bottom:20px;left:16px}.lschat-box{bottom:86px;left:16px}}";

  function el(html){var d=document.createElement('div');d.innerHTML=html;return d.firstElementChild;}
  function inject(){
    var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    var btn=el('<button class="lschat-btn" aria-label="Abrir chat"><span class="lschat-badge"></span><svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1L4 22l4.6-1.9c1.1.3 2.2.4 3.4.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z"/></svg></button>');
    var box=el('<div class="lschat-box" role="dialog" aria-label="Chat"><div class="lschat-head"><div class="av">💛</div><div><h4>'+CFG.NOME+'</h4><p>Online • responde rápido</p></div><button class="x" aria-label="Fechar">×</button></div><div class="lschat-msgs" id="lschatMsgs"></div><div class="lschat-quick" id="lschatQuick"></div><a class="lschat-wa" target="_blank" href="https://wa.me/'+CFG.WHATSAPP+'?text='+encodeURIComponent('Olá! Vim pelo chat do site 💛')+'">💬 Falar no WhatsApp</a><form class="lschat-in" id="lschatForm"><input id="lschatInput" placeholder="Escreva sua mensagem..." autocomplete="off"><button type="submit" aria-label="Enviar">➤</button></form></div>');
    document.body.appendChild(btn);document.body.appendChild(box);
    var msgs=box.querySelector('#lschatMsgs'),quick=box.querySelector('#lschatQuick'),form=box.querySelector('#lschatForm'),input=box.querySelector('#lschatInput');
    function add(text,who){var m=el('<div class="lschat-msg '+who+'"></div>');m.innerHTML=text;msgs.appendChild(m);msgs.scrollTop=msgs.scrollHeight;}
    function localReply(t){t=t.toLowerCase();for(var i=0;i<FAQ.length;i++){for(var j=0;j<FAQ[i].k.length;j++){if(t.indexOf(FAQ[i].k[j])>=0)return FAQ[i].a;}}return "Boa pergunta! 💛 Pra te responder certinho, chama a gente no WhatsApp (é rapidinho) que o time M7M te ajuda pessoalmente 😊";}
    function botAnswer(t){
      if(CFG.N8N_WEBHOOK){
        add("digitando...","bot");var typing=msgs.lastChild;
        fetch(CFG.N8N_WEBHOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:t,page:location.pathname})})
          .then(function(r){return r.json();}).then(function(d){typing.remove();add((d&&(d.reply||d.output||d.text))||localReply(t),"bot");})
          .catch(function(){typing.remove();add(localReply(t),"bot");});
      } else { setTimeout(function(){add(localReply(t),"bot");},350); }
    }
    QUICK.forEach(function(q){var b=el('<button></button>');b.textContent=q;b.onclick=function(){add(q,"me");botAnswer(q);};quick.appendChild(b);});
    form.onsubmit=function(e){e.preventDefault();var v=input.value.trim();if(!v)return;add(v,"me");input.value="";botAnswer(v);};
    var opened=false;
    function toggle(){box.classList.toggle('open');if(box.classList.contains('open')&&!opened){opened=true;add("Oi! 💛 Sou o atendimento da <b>"+CFG.NOME+"</b>. Posso te ajudar com marcas, preços, frete e pagamento — ou te levar pro WhatsApp. Como posso ajudar?","bot");input.focus();}}
    btn.onclick=toggle;box.querySelector('.x').onclick=toggle;
  }
  if(document.readyState!=='loading')inject();else document.addEventListener('DOMContentLoaded',inject);
})();
