(function(){
var KEY="dashboard-dentes-v1",CK="dashboard-dentes-clientes",PK="dashboard-dentes-precos2",NK="dashboard-dentes-notas2",data=[],half=1,sel="",extra=[],prices={},notas={},lastTxt="";
var $=function(i){return document.getElementById(i)};
var brl=function(n){return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
function rd(k){try{var r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(e){return null}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function save(){wr(KEY,data)}
var today=new Date(),pad=function(n){return String(n).padStart(2,"0")},ym=today.getFullYear()+"-"+pad(today.getMonth()+1);
$("mes").value=ym;$("dt").value=ym+"-"+pad(today.getDate());
function setHalf(h){half=h;document.querySelectorAll(".seg button").forEach(function(b){b.setAttribute("aria-pressed",String(+b.dataset.h===h))})}
setHalf(today.getDate()<=15?1:2);
data=rd(KEY);
if(!data){data=[
{id:1,dr:"Dr. Illan Hadson",pac:"Roberto Silva",desc:"Adesiva 41",qtd:1,vl:20,dt:ym+"-03"},
{id:2,dr:"Dr. Illan Hadson",pac:"José Ribeiro",desc:"Protocolo 16 a 26",qtd:12,vl:20,dt:ym+"-05"},
{id:3,dr:"Dr. Illan Hadson",pac:"João Eude",desc:"Enc. sup. 16 a 26 – inf. cor. 46, 42 a 33",qtd:24,vl:20,dt:ym+"-09"}];save()}
extra=rd(CK)||[];
prices=rd(PK);
if(!prices){var old=rd("dashboard-dentes-precos");prices={"":old&&old.length?old:[{n:"Adesiva",v:20},{n:"Protocolo",v:20},{n:"Encaixe",v:20}]}}
notas=rd(NK);
if(!notas){notas={"":""};try{notas[""]=localStorage.getItem("dashboard-dentes-notas")||""}catch(e){}}
function names(){var o={};extra.forEach(function(n){o[n]=1});data.forEach(function(e){o[e.dr]=1});return Object.keys(o).sort()}
function inPeriod(e){if(e.dt.slice(0,7)!==$("mes").value)return false;var d=+e.dt.slice(8,10);return half===0||(half===1&&d<=15)||(half===2&&d>15)}
function filtered(){var q=$("q").value.trim().toLowerCase();return data.filter(function(e){return inPeriod(e)&&(!sel||e.dr===sel)&&(!q||(e.dr+" "+e.pac+" "+e.desc+" "+(e.obs||"")).toLowerCase().indexOf(q)>-1)}).sort(function(a,b){return a.dt<b.dt?1:-1})}
function priceFor(n){return prices[n]||prices[""]||[]}
function curP(){if(!prices[sel])prices[sel]=priceFor("").map(function(p){return{n:p.n,v:p.v}});return prices[sel]}
function prev(){$("prev").textContent="Total: "+brl((+$("qtd").value||0)*(+$("vl").value||0))}
function renderTp(){var cur=$("tp").value;$("tp").innerHTML='<option value="">Outro</option>'+priceFor($("dr").value.trim()).map(function(p){return '<option value="'+esc(p.n)+'">'+esc(p.n)+' ('+brl(p.v)+')</option>'}).join("");$("tp").value=cur}
function renderPrices(){var L=prices[sel]||prices[""]||[];
$("plTitle").textContent=sel?"Tabela de preços — "+sel:"Tabela de preços padrão (novos clientes)";
$("pl").innerHTML=L.map(function(p,i){return '<div class="bar"><div class="h"><span>'+esc(p.n)+'</span><span>'+brl(p.v)+' por dente <button class="ghost" data-pd="'+i+'">Remover</button></span></div></div>'}).join("");renderTp()}
function pick(n){sel=n;if(n){$("dr").value=n}
$("ntTitle").textContent=n?"Anotações — "+n:"Anotações gerais";$("notas").value=notas[n]||"";renderPrices();render()}
function render(){
var all=data.filter(inPeriod),L=filtered(),tot=0,pend=0,dentes=0,pacs={},drs={};
L.forEach(function(e){var t=e.qtd*e.vl;tot+=t;if(!e.pago)pend+=t;dentes+=e.qtd;pacs[e.pac.toLowerCase()]=1;drs[e.dr]=1});
var np=Object.keys(pacs).length,cs={};
names().forEach(function(n){cs[n]={t:0,d:0,p:0}});
all.forEach(function(e){var c=cs[e.dr],v=e.qtd*e.vl;c.t+=v;c.d+=e.qtd;if(!e.pago)c.p+=v});
$("clients").innerHTML=Object.keys(cs).map(function(n){var c=cs[n];return '<button type="button" class="cc'+(n===sel?' on':'')+'" data-c="'+esc(n)+'" aria-pressed="'+(n===sel)+'"><b>'+esc(n)+'</b><span>'+c.d+' dentes</span><span>'+brl(c.t)+'</span>'+(c.p?'<small>a receber '+brl(c.p)+'</small>':'')+'</button>'}).join("")||'<div class="empty">Nenhum cliente ainda. Adicione o primeiro acima.</div>';
$("heroLbl").textContent="Total do período — "+(sel||"todos os clientes");
$("kTotal").textContent=brl(tot);$("kDentes").textContent=dentes;$("kPac").textContent=np;$("kDr").textContent=Object.keys(drs).length;
$("kMed").textContent=brl(np?tot/np:0);$("kPend").textContent=brl(pend);
var n=sel?dentes:0,full=Math.floor(n/32),rest=n%32;
$("archInfo").textContent=sel?full+(full===1?" arcada completa":" arcadas completas")+" · "+rest+" de 32 na próxima":"Clique em um cliente para preencher a arcada";
var a="";for(var i=0;i<32;i++){a+='<i class="'+(i<rest?"on ":"")+(i>=16?"low":"")+'"></i>'}
$("arch").innerHTML=a;
$("genrep").textContent=sel?"Gerar relatório de "+sel:"Gerar relatório de todos os clientes";
$("rows").innerHTML=L.map(function(e){return "<tr><td>"+esc(e.dr)+"</td><td>"+esc(e.pac)+"</td><td>"+esc(e.desc)+(e.tp||e.pz?'<div class="lbl">'+(e.tp?esc(e.tp):'')+(e.tp&&e.pz?' — ':'')+(e.pz?'entrega '+e.pz.slice(8)+'/'+e.pz.slice(5,7):'')+'</div>':'')+(e.obs?'<div class="lbl">'+esc(e.obs)+'</div>':'')+'</td><td class="n">'+e.qtd+'</td><td class="n">'+brl(e.vl)+'</td><td class="n"><b>'+brl(e.qtd*e.vl)+'</b></td><td><button class="pill'+(e.pago?'':' pend')+'" data-pg="'+e.id+'" title="Alternar status">'+(e.pago?'Pago':'Pendente')+'</button>'+(e.pz?' <button class="pill'+(e.ent?'':' pend')+'" data-en="'+e.id+'" title="Alternar entrega">'+(e.ent?'Entregue':'A entregar')+'</button>':'')+'</td><td><button class="ghost" data-del="'+e.id+'" aria-label="Apagar registro">Apagar</button></td></tr>'}).join("");
$("empty").hidden=L.length>0;
$("drs").innerHTML=names().map(function(x){return '<option value="'+esc(x)+'">'}).join("");
extras()}
function extras(){
var D=sel?data.filter(function(e){return e.dr===sel}):data;
var td=new Date(),f=function(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())},iso=f(td),li=f(new Date(td.getTime()+2*864e5)),at=0,pr=0;
D.forEach(function(e){if(e.pz&&!e.ent){if(e.pz<iso)at++;else if(e.pz<=li)pr++}});
var al=$("alert");al.hidden=!(at||pr);al.textContent=(at?at+(at>1?" entregas atrasadas":" entrega atrasada"):"")+(at&&pr?" e ":"")+(pr?pr+(pr>1?" entregas":" entrega")+" para os próximos 2 dias":"");
var m=$("mes").value.split("-"),y=+m[0],mo=+m[1],mxv=1,arr=[];
for(var i=5;i>=0;i--){var d=new Date(y,mo-1-i,1),k=d.getFullYear()+"-"+pad(d.getMonth()+1),s=0;D.forEach(function(e){if(e.dt.slice(0,7)===k)s+=e.qtd*e.vl});arr.push({s:s,l:d.toLocaleDateString("pt-BR",{month:"short"}).replace(".","")});mxv=Math.max(mxv,s)}
$("mb").innerHTML=arr.map(function(a,i){return '<div class="mb'+(i===5?' cur':'')+'"><small>'+(a.s?a.s.toLocaleString("pt-BR",{maximumFractionDigits:0}):"")+'</small><span style="height:'+(a.s/mxv*70)+'%"></span><small>'+a.l+'</small></div>'}).join("")}
/* Relatório */
function period(){return half===1?"DIA 1 AO DIA 15":half===2?"DIA 16 AO DIA 30/31":"MÊS INTEIRO"}
function mm(){var m=$("mes").value.split("-");return m[1]+"/"+m[0]}
function rep(n){var rows={},order=[],t=0,pend=0,q=0,rates={};
data.filter(function(e){return inPeriod(e)&&e.dr===n}).sort(function(a,b){return a.dt<b.dt?-1:1}).forEach(function(e){var k=e.pac.toLowerCase(),r=rows[k],v=e.qtd*e.vl;if(!r){r=rows[k]={p:e.pac,d:[],q:0,s:0};order.push(k)}r.d.push(e.desc);r.q+=e.qtd;r.s+=v;t+=v;q+=e.qtd;if(!e.pago)pend+=v;rates[e.vl]=1});
var rk=Object.keys(rates);
return{n:n,rows:order.map(function(k){return rows[k]}),t:t,q:q,pend:pend,rate:rk.length===1?brl(+rk[0]):(rk.length?"variável (ver subtotais)":brl(0))}}
function repHtml(r){return '<div class="rp"><h3>Relatório de Produção e Desenho Dental</h3><p class="rt">PERÍODO: '+period()+' — '+mm()+'</p><p>Cliente: <b>'+esc(r.n)+'</b><br>Valor de referência por unidade/elemento: '+esc(r.rate)+'</p><table><thead><tr><th>PACIENTE</th><th>DENTES DESENHADOS / TRABALHO</th><th class="n">QTD. ELEMENTOS</th><th class="n">SUBTOTAL (R$)</th></tr></thead><tbody>'+r.rows.map(function(x){return '<tr><td>'+esc(x.p)+'</td><td>'+esc(x.d.join(" / "))+'</td><td class="n">'+x.q+'</td><td class="n">'+brl(x.s)+'</td></tr>'}).join("")+'</tbody></table><h4>Resumo financeiro da produção</h4><p>Total de pacientes atendidos: '+r.rows.length+'<br>Total de elementos desenhados: '+r.q+' u.<br>Valor por unidade: '+esc(r.rate)+(r.t>r.pend?'<br>Total da produção: '+brl(r.t)+'<br>Já recebido: '+brl(r.t-r.pend):'')+'</p><p class="rtot">VALOR TOTAL A RECEBER: '+brl(r.pend)+'</p></div>'}
function repText(r){return "RELATÓRIO DE PRODUÇÃO E DESENHO DENTAL\nCliente: "+r.n+"\nPERÍODO: "+period()+" ("+mm()+")\nValor por unidade/elemento: "+r.rate+"\n\n"+r.rows.map(function(x){return x.p+" | "+x.d.join(" / ")+" | "+x.q+" | "+brl(x.s)}).join("\n")+"\n\nPacientes atendidos: "+r.rows.length+"\nElementos desenhados: "+r.q+" u.\nVALOR TOTAL A RECEBER: "+brl(r.pend)}
function copyText(s,b,lb){try{navigator.clipboard.writeText(s).then(function(){b.textContent="Copiado!"},function(){b.textContent="Não foi possível copiar"})}catch(e){b.textContent="Não foi possível copiar"}setTimeout(function(){b.textContent=lb},2000)}
$("genrep").addEventListener("click",function(){
var ns=(sel?[sel]:names()).filter(function(n){return data.some(function(e){return inPeriod(e)&&e.dr===n})});
if(!ns.length){$("gm").textContent="Nenhum registro neste período.";setTimeout(function(){$("gm").textContent=""},2500);return}
var rs=ns.map(rep);$("rbody").innerHTML=rs.map(repHtml).join("");lastTxt=rs.map(repText).join("\n\n----------\n\n");
$("rep").hidden=false;document.body.style.overflow="hidden"});
$("rclose").addEventListener("click",function(){$("rep").hidden=true;document.body.style.overflow=""});
$("rprint").addEventListener("click",function(){try{window.print()}catch(e){}});
$("rcopy").addEventListener("click",function(){copyText(lastTxt,$("rcopy"),"Copiar texto")});
/* Interações */
$("clients").addEventListener("click",function(ev){var b=ev.target.closest(".cc");if(!b)return;var n=b.getAttribute("data-c");pick(n===sel?"":n)});
$("all").addEventListener("click",function(){pick("")});
$("ncb").addEventListener("click",function(){var n=$("nc").value.trim();if(!n)return;if(names().indexOf(n)<0){extra.push(n);wr(CK,extra)}$("nc").value="";pick(n)});
["qtd","vl"].forEach(function(i){$(i).addEventListener("input",prev)});
$("dr").addEventListener("input",renderTp);
$("mes").addEventListener("change",render);
$("q").addEventListener("input",render);
document.querySelectorAll(".seg button").forEach(function(b){b.addEventListener("click",function(){setHalf(+b.dataset.h);render()})});
$("tp").addEventListener("change",function(){var p=priceFor($("dr").value.trim()).filter(function(x){return x.n===$("tp").value})[0];if(p){$("vl").value=p.v;prev()}});
$("add").addEventListener("click",function(){
if(!$("f").reportValidity())return;
data.push({id:Date.now(),dr:$("dr").value.trim(),pac:$("pac").value.trim(),desc:$("desc").value.trim(),qtd:+$("qtd").value,vl:+$("vl").value,dt:$("dt").value,obs:$("obs").value.trim(),pago:$("pg").value==="1",tp:$("tp").value,pz:$("pz").value,ent:false});
save();$("pz").value="";$("obs").value="";$("pac").value="";$("desc").value="";$("qtd").value=1;prev();
$("mes").value=$("dt").value.slice(0,7);setHalf(+$("dt").value.slice(8,10)<=15?1:2);render();$("pac").focus()});
$("rows").addEventListener("click",function(ev){var t=ev.target,en=t.getAttribute("data-en"),pg=t.getAttribute("data-pg"),id=t.getAttribute("data-del");
if(en||pg){data.forEach(function(e){if(String(e.id)===(en||pg)){if(en)e.ent=!e.ent;else e.pago=!e.pago}});save();render();return}
if(!id)return;data=data.filter(function(e){return String(e.id)!==id});save();render()});
$("clr").addEventListener("click",function(){if(confirm("Apagar todos os registros? Isso não pode ser desfeito.")){data=[];save();render()}});
$("pa").addEventListener("click",function(){var n=$("pn").value.trim(),v=+$("pv").value;if(!n||$("pv").value===""||!(v>=0))return;prices[sel]=curP().filter(function(x){return x.n!==n}).concat([{n:n,v:v}]);wr(PK,prices);$("pn").value="";$("pv").value="";renderPrices()});
$("pl").addEventListener("click",function(ev){var i=ev.target.getAttribute("data-pd");if(i===null)return;curP().splice(+i,1);wr(PK,prices);renderPrices()});
$("notas").addEventListener("input",function(){notas[sel]=$("notas").value;wr(NK,notas)});
$("cp").addEventListener("click",function(){
var L=filtered(),t=0,d=0,p=0;L.forEach(function(e){var v=e.qtd*e.vl;t+=v;d+=e.qtd;if(!e.pago)p+=v});
var s="Resumo "+$("mes").value+(sel?" — "+sel:"")+" — "+d+" dentes, total "+brl(t)+", pendente "+brl(p)+"\n"+L.map(function(e){return e.dt.slice(8)+"/"+e.dt.slice(5,7)+" "+e.dr+" | "+e.pac+" | "+e.desc+" | "+e.qtd+" | "+brl(e.qtd*e.vl)+(e.pago?" (pago)":" (pendente)")}).join("\n");
copyText(s,$("cp"),"Copiar resumo do período")});
/* Backup */
function bkText(){return JSON.stringify({v:2,data:data,clientes:extra,precos:prices,notas:notas},null,1)}
$("bc").addEventListener("click",function(){copyText(bkText(),$("bc"),"Copiar backup")});
$("bd").addEventListener("click",function(){try{var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([bkText()],{type:"application/json"}));a.download="backup-dentes-"+ym+".json";document.body.appendChild(a);a.click();a.remove();$("bm").textContent="Se o arquivo não baixou, use Copiar backup."}catch(e){$("bm").textContent="Não foi possível baixar. Use Copiar backup."}});
$("bf").addEventListener("change",function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){$("bk").value=r.result};r.readAsText(f)});
$("br").addEventListener("click",function(){try{var o=JSON.parse($("bk").value);if(!o||!Array.isArray(o.data))throw 0;if(!confirm("Substituir os dados atuais pelo backup?"))return;
data=o.data;extra=Array.isArray(o.clientes)?o.clientes:[];
if(o.precos)prices=Array.isArray(o.precos)?{"":o.precos}:o.precos;if(!prices[""])prices[""]=[];
if(o.notas)notas=typeof o.notas==="string"?{"":o.notas}:o.notas;
save();wr(CK,extra);wr(PK,prices);wr(NK,notas);$("bk").value="";pick("");$("bm").textContent="Backup restaurado."}catch(e){$("bm").textContent="Texto de backup inválido."}});
pick("");prev();
/* Abertura */
var intro=$("intro"),cv=$("tc"),cx=cv.getContext("2d"),pts=[],mx=-999,my=-999,sx=0,sy=0,tx=0,ty=0,live=true;
$("dataHoje").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
var LOGO="00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000002000000000000000000000000001fffffffffffe0000000006001fffffffffffc000000000e401fffffffffff8000000001d801fffffffffff0000000001b001ffffffffffe00000000076001ffffffffffc000000000fc001ffffffffff8000000001fc001ffffffffff0000000003fc001fffffffffe000000000ff8001fffffffffc000000001ff8001fff0000000030000003fe0001fff0000000078000007fc0801fff00000000fc00000ffc1c01fff00000001fe00003ff83c01fff00000003ff00007ff87c01fff00000007ff8000fff0f801fff0000000ffbc001ffe3fc01fff0000001ff7e003ffc7fc01fff00c0043feff007ffcffc01ffffffffc7fdff80fff9ffc01ffffffff8ff3ffc0fff3ffc01ffffffff1ff3ffe3ffe7ffc01fffffffe3fe7fff7ffcfffc01fffffffc7fcfffffff9fffc01fffffff8ff1fffffff7fffc01fffffff1fe3ffffffeffffc01ffffffe3fe7efffffdffffc01ffffffc7f8fe7fffffffffc01ffffff8ff1fe3fffffffffc01ffffff1fe3fe1fffffffffc01fff0003fe7fe0ffffff3ffc01fff0007f87fe07ffffe3ffc01fff000fd8ffe03ffffc3ffc01fff000fa0ffe01ffff83ffc01fff001f40ffe00ffff03ffc01fff003f80ffe007ffe03ffc01fff00ff00ffe003ff803ffc01fff01fe00ffe001ff003ffc01fff03f800ffe000fe003ffc01fff07f000ffe0007c003ffc01fff0fe000ffe00038003ffc01fff1fc000ffe00010003ffc01fff3f8000ffe00000003ffc01ffe3f0000ffe00000003ffc01ffc7e0000ffe00000003ffc01ff8780000ffe00000003ffc01ff0f00000ffe00000003ffc01fe1e00000ffe00000003ffc01fc3c00000ffe00000003ff801f8d800000ffe00000003ffc01f1a000000ffe00000003ffc01e340000000008003ff807fc01c60000038003e01ffff807c018c00000f8007f06ffffc000000800007ff00ff07ffffe00000100001ffe00ff3ffffff00000000003fff01ff1ffffff80000000007ffe03ff0ffc03fc000000001fffe07ff0ffc01fc000000003fffc07ff01f801fc000000007fffc0fff01f801fc00000000ffdf81fff03f803fe00000001ff9f03fff03f003fc00000003fe1e03f7f03f00ff800000003fc1c07f7f07f01ff800000007f8180fe7fc7f01ff00000000ff0000fc7ff7f03fe00000003fe0001fcffe7f07fe00000007fc0003ffff0fe0ffa0000000ff80003ffff0fe1ff40000001ff00007ffff0fc3fe80000001fe00007fffe1fc7ff80000003fe0001fffff1fcffe00000005fc000bffe7f1fbffc00000003f8003fff87e1fffe000000007f800fffc07e1fffc000000007f001fff007e1fff800000000ff007f7f007e1fff000000000fe01fffe007e3ff8000000001bc03fefc007e3fe0000000001fc0ffdf8007e7fc0000000001fc3ff1f8007e7fc0000000003f9ffe3f0003e0f00000000003ffffc3f0003e0200000000000ffff03e0001e0000000000001ffff01c0001e0000000000001fffc0680000c0000000000000fff0080000000000000000000bfa00000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",LN=100,LS=4;
for(var gi=0;gi<LN*LN;gi++){if(parseInt(LOGO.charAt(gi>>2),16)>>(3-(gi&3))&1){var X=(gi%LN)*LS+2,Y=Math.floor(gi/LN)*LS+2;pts.push({x:X,y:Y,ox:X,oy:Y,vx:0,vy:0})}}
var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
intro.addEventListener("pointermove",function(ev){var r=cv.getBoundingClientRect(),k=cv.width/r.width;mx=(ev.clientX-r.left)*k;my=(ev.clientY-r.top)*k;if(!still){tx=(ev.clientX/innerWidth-.5)*-26;ty=(ev.clientY/innerHeight-.5)*-26}});
intro.addEventListener("pointerleave",function(){mx=my=-999;tx=ty=0});
function frame(){if(!live)return;
var col=getComputedStyle(document.documentElement).getPropertyValue("--ink").trim()||"#17332a";
cx.clearRect(0,0,cv.width,cv.height);cx.fillStyle=col;sx+=(tx-sx)*.08;sy+=(ty-sy)*.08;
for(var i=0;i<pts.length;i++){var p=pts[i],dx=p.x-mx,dy=p.y-my,d=Math.sqrt(dx*dx+dy*dy)||1;
if(!still&&d<80){var f=(80-d)/80;p.vx+=dx/d*f*3;p.vy+=dy/d*f*3}
p.vx+=(p.ox-p.x)*.06;p.vy+=(p.oy-p.y)*.06;p.vx*=.85;p.vy*=.85;p.x+=p.vx;p.y+=p.vy;
cx.globalAlpha=.9;cx.beginPath();cx.arc(p.x+sx,p.y+sy,1.8,0,6.283);cx.fill()}
requestAnimationFrame(frame)}
function openIntro(){intro.style.display="grid";live=true;requestAnimationFrame(function(){intro.classList.remove("off")});frame()}
function closeIntro(){intro.classList.add("off");live=false;setTimeout(function(){if(!live)intro.style.display="none"},500)}
$("go").addEventListener("click",closeIntro);
$("ttl").addEventListener("click",openIntro);
document.addEventListener("keydown",function(ev){if(ev.key==="Enter"&&live&&ev.target.tagName!=="BUTTON")closeIntro()});
frame();
})();
