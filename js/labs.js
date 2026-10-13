(function(){
'use strict';
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var FONT="'Be Vietnam Pro',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",MONO="ui-monospace,Menlo,Consolas,monospace";
var PAL={};
function readPal(){var cs=getComputedStyle(document.documentElement);['bg','surface','ink','muted','line','soft','volt','amp','ok','bad'].forEach(function(k){PAL[k]=cs.getPropertyValue('--'+k).trim()})}
readPal();
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',readPal)}catch(e){}
try{new MutationObserver(readPal).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})}catch(e){}

function nf(v,d){return (+v).toFixed(d==null?2:d).replace('.',',')}
function si(v,unit,sig){
  sig=sig||3;if(!isFinite(v))return '—';if(v===0)return '0 '+unit;
  var pre=[[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n']],a=Math.abs(v),p=pre[pre.length-1];
  for(var i=0;i<pre.length;i++){if(a>=pre[i][0]*0.9995){p=pre[i];break}}
  var s=(v/p[0]).toPrecision(sig);if(s.indexOf('e')>=0)s=String(+s);
  if(s.indexOf('.')>=0)s=s.replace(/0+$/,'').replace(/\.$/,'');
  return s.replace('.',',')+' '+p[1]+unit;
}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function sig2(x){return +x.toPrecision(2)}
function fit(c,ratio){
  var dpr=Math.min(2,window.devicePixelRatio||1),w=c.clientWidth||300,h=Math.round(w*ratio);
  c.style.height=h+'px';c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
  var g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return {g:g,w:w,h:h};
}
function ptAt(pts,s){
  var L=0,i,segs=[];for(i=0;i<pts.length-1;i++){var d=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);segs.push(d);L+=d}
  s=((s%L)+L)%L;
  for(i=0;i<segs.length;i++){if(s<=segs[i]){var u=segs[i]?s/segs[i]:0;return [pts[i][0]+(pts[i+1][0]-pts[i][0])*u,pts[i][1]+(pts[i+1][1]-pts[i][1])*u]}s-=segs[i]}
  return pts[pts.length-1];
}
function plen(pts){var L=0;for(var i=0;i<pts.length-1;i++)L+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);return L}
function polyline(g,pts,col,lw){g.strokeStyle=col;g.lineWidth=lw||2;g.lineJoin='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
function dots(g,pts,phase,spacing,col,r,skip){
  var L=plen(pts),n=Math.floor(L/spacing);g.fillStyle=col;
  for(var k=0;k<n;k++){var p=ptAt(pts,k*spacing+phase);if(skip&&skip(p))continue;g.beginPath();g.arc(p[0],p[1],r,0,6.2832);g.fill()}
}
function logmap(s,lo,hi,max){return lo*Math.pow(hi/lo,s/max)}
function uCur(I){return clamp((Math.log10(Math.max(I,1e-9))+3)/(Math.log10(3)+3),0,1)}

/* ---------- registry ---------- */
var labs={},cur=null,curId='ohm',paused=false;
try{paused=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
var pauseBtn=$('#pause');
function setPauseLabel(){pauseBtn.textContent=paused?'Chạy tiếp':'Tạm dừng'}
setPauseLabel();
pauseBtn.addEventListener('click',function(){paused=!paused;setPauseLabel()});
function show(id){
  $$('.lab').forEach(function(s){s.hidden=(s.id!=='lab-'+id)});
  $$('.tab').forEach(function(t){var on=t.dataset.lab===id;t.setAttribute('aria-selected',on?'true':'false');if(on){try{t.scrollIntoView({block:'nearest',inline:'center'})}catch(e){}}});
  readPal();curId=id;cur=labs[id]||null;if(cur&&cur.resize)cur.resize();
  
}
$$('.tab').forEach(function(t){t.addEventListener('click',function(){show(t.dataset.lab)})});
var last=performance.now();
function loop(now){var dt=Math.min(0.05,(now-last)/1000);last=now;if(cur&&cur.frame)cur.frame(paused?0:dt);requestAnimationFrame(loop)}
window.addEventListener('resize',function(){if(cur&&cur.resize)cur.resize()});

/* ================= 1. OHM ================= */
labs.ohm=(function(){
  var c=$('#ohm-c'),vS=$('#ohm-v'),rS=$('#ohm-r'),g,w,h,V=12,R=4,I=3,parts=[],i;
  for(i=0;i<30;i++)parts.push({t:Math.random(),o:Math.random()*1.6-0.8});
  function calc(){
    V=+vS.value;R=sig2(Math.pow(10,(+rS.value)/250));I=V/R;var P=V*I;
    $('#ohm-vv').textContent=nf(V,1)+' V';$('#ohm-rv').textContent=si(R,'Ω',2);
    $('#ohm-i').textContent=si(I,'A');$('#ohm-p').textContent=si(P,'W');
    $('#ohm-f').textContent='I = V ÷ R = '+nf(V,1)+' ÷ '+si(R,'Ω',2)+' = '+si(I,'A')+'\nP = V × I = '+nf(V,1)+' × '+si(I,'A')+' = '+si(P,'W');
    $('#ohm-f').style.whiteSpace='pre-line';
  }
  function geom(){
    var f=1-0.72*(Math.log10(R)/4);
    return {tx0:w*0.05,tx1:w*0.28,ty0:h*0.1,ty1:h*0.86,x0:w*0.28,x1:w*0.96,yc:h*0.68,ph:h*0.1,f:f};
  }
  function hh(x,G){
    var a=G.x0+(G.x1-G.x0)*0.30,b=G.x0+(G.x1-G.x0)*0.40,c2=G.x0+(G.x1-G.x0)*0.58,d=G.x0+(G.x1-G.x0)*0.68;
    if(x<=a||x>=d)return G.ph;
    if(x<b)return G.ph+(G.ph*G.f-G.ph)*((x-a)/(b-a));
    if(x<=c2)return G.ph*G.f;
    return G.ph*G.f+(G.ph-G.ph*G.f)*((x-c2)/(d-c2));
  }
  function draw(dt){
    var G=geom(),u=clamp((Math.log10(I)+3.5)/(Math.log10(24)+3.5),0,1),speed=15+230*u;
    g.clearRect(0,0,w,h);
    var lvl=clamp(V/24,0.05,1),th=G.ty1-G.ty0;
    g.fillStyle=PAL.volt;g.globalAlpha=0.28;g.fillRect(G.tx0,G.ty1-th*lvl,G.tx1-G.tx0,th*lvl);g.globalAlpha=1;
    g.strokeStyle=PAL.volt;g.lineWidth=2;g.beginPath();g.moveTo(G.tx0,G.ty1-th*lvl);g.lineTo(G.tx1,G.ty1-th*lvl);g.stroke();
    g.strokeStyle=PAL.muted;g.lineWidth=2;g.beginPath();g.moveTo(G.tx0,G.ty0);g.lineTo(G.tx0,G.ty1);g.lineTo(G.tx1,G.ty1);g.lineTo(G.tx1,G.yc+G.ph);g.stroke();
    g.beginPath();g.moveTo(G.tx1,G.yc-G.ph);g.lineTo(G.tx1,G.ty0);g.lineTo(G.tx0,G.ty0);g.stroke();
    var N=60,k,x;
    g.fillStyle=PAL.volt;g.globalAlpha=0.22;g.beginPath();
    for(k=0;k<=N;k++){x=G.x0+(G.x1-G.x0)*k/N;g[k?'lineTo':'moveTo'](x,G.yc-hh(x,G));}
    for(k=N;k>=0;k--){x=G.x0+(G.x1-G.x0)*k/N;g.lineTo(x,G.yc+hh(x,G));}
    g.closePath();g.fill();g.globalAlpha=1;
    g.strokeStyle=PAL.muted;g.lineWidth=2;
    g.beginPath();for(k=0;k<=N;k++){x=G.x0+(G.x1-G.x0)*k/N;g[k?'lineTo':'moveTo'](x,G.yc-hh(x,G));}g.stroke();
    g.beginPath();for(k=0;k<=N;k++){x=G.x0+(G.x1-G.x0)*k/N;g[k?'lineTo':'moveTo'](x,G.yc+hh(x,G));}g.stroke();
    g.fillStyle=PAL.amp;
    parts.forEach(function(p){p.t+=speed*dt/(G.x1-G.x0);if(p.t>1)p.t-=1;var px=G.x0+(G.x1-G.x0)*p.t;g.beginPath();g.arc(px,G.yc+p.o*hh(px,G)*0.8,Math.max(2,h*0.012),0,6.2832);g.fill()});
    g.fillStyle=PAL.ink;g.font='500 '+Math.max(11,w*0.034)+'px '+FONT;g.textAlign='center';
    g.fillText('V = '+nf(V,1)+' V',(G.tx0+G.tx1)/2,G.ty0-4+ (G.ty0<14?14:0));
    g.fillText('R = '+si(R,'Ω',2),G.x0+(G.x1-G.x0)*0.49,G.yc+G.ph+Math.max(16,h*0.12));
    g.fillStyle=PAL.amp;g.fillText('I = '+si(I,'A'),G.x0+(G.x1-G.x0)*0.49,G.yc-G.ph-8);
  }
  function resize(){var f=fit(c,0.5);g=f.g;w=f.w;h=f.h;calc();draw(0)}
  [vS,rS].forEach(function(e){e.addEventListener('input',function(){calc();if(g)draw(0)})});
  return {resize:resize,frame:function(dt){if(g)draw(dt)}};
})();

/* ================= 2. MÃ MÀU ================= */
labs.mau=(function(){
  var DC=['#161616','#7A4A25','#D9362C','#F0892A','#F1D12B','#2E9E4F','#2F6FD6','#8A4FC8','#8E949B','#F5F5F5'];
  var DN=['Đen','Nâu','Đỏ','Cam','Vàng','Lục','Lam','Tím','Xám','Trắng'];
  var LIGHT={4:1,9:1,3:1};
  var GOLD='#C9A227',SILVER='#BFC5CC';
  var TOL=[{n:'Nâu',c:DC[1],v:1},{n:'Đỏ',c:DC[2],v:2},{n:'Vàng kim',c:GOLD,v:5},{n:'Bạc',c:SILVER,v:10}];
  var st={d1:4,d2:7,m:3,t:2};
  function mkSvg(svg){
    var s='<line x1="0" y1="45" x2="70" y2="45" stroke="#9AA3AD" stroke-width="4"/><line x1="250" y1="45" x2="320" y2="45" stroke="#9AA3AD" stroke-width="4"/>';
    s+='<rect x="70" y="20" width="180" height="50" rx="22" fill="#DCC9A0" stroke="#A8946A"/>';
    [95,125,155,215].forEach(function(x,i){s+='<rect id="'+svg.id+'-b'+i+'" x="'+x+'" y="20" width="16" height="50" fill="#888"/>'});
    svg.innerHTML=s;
  }
  function setBands(svg,b){[b.d1,b.d2,b.m,b.t].forEach(function(v,i){var col;
    if(i<3)col=(v===10)?GOLD:(v===11)?SILVER:DC[v];else col=TOL[v].c;
    svg.querySelector('#'+svg.id+'-b'+i).setAttribute('fill',col)})}
  function multName(m){return m===10?'Vàng kim':m===11?'Bạc':DN[m]}
  function value(d1,d2,m){var mm=m===10?-1:m===11?-2:m;return (10*d1+d2)*Math.pow(10,mm)}
  function mkRow(id,list,key,extra){
    var row=$(id),html='';
    list.forEach(function(it){html+='<button type="button" class="sw" data-k="'+key+'" data-v="'+it.v+'" style="--c:'+it.c+';--t:'+(it.light?'#13202C':'#fff')+'" aria-label="'+it.n+(it.sub?': '+it.sub:'')+'" aria-pressed="false">'+(it.label||'')+'</button>'});
    row.innerHTML=html;
  }
  function digits(from){var a=[];for(var i=from;i<10;i++)a.push({n:DN[i],c:DC[i],v:i,label:i,sub:i,light:!!LIGHT[i]});return a}
  mkRow('#rd-b1',digits(1),'d1');mkRow('#rd-b2',digits(0),'d2');
  var mult=digits(0).map(function(x){x.sub='thêm '+x.v+' chữ số 0';return x});
  mult.push({n:'Vàng kim',c:GOLD,v:10,label:'×0,1',sub:'nhân 0,1',light:true});mult.push({n:'Bạc',c:SILVER,v:11,label:'×0,01',sub:'nhân 0,01',light:true});
  mkRow('#rd-b3',mult,'m');
  mkRow('#rd-b4',TOL.map(function(t,i){return {n:t.n,c:t.c,v:i,label:'±'+t.v+'%',sub:'sai số '+t.v+'%',light:(i>=2)}}),'t');
  var svg=$('#rd-svg');mkSvg(svg);var qsvg=$('#qz-svg');mkSvg(qsvg);
  function render(){
    setBands(svg,st);
    $$('#lab-mau .card:first-of-type .sw').forEach(function(b){b.setAttribute('aria-pressed',(+b.dataset.v===st[b.dataset.k])?'true':'false')});
    var v=value(st.d1,st.d2,st.m),tol=TOL[st.t].v,mm=st.m;
    $('#rd-val').textContent=si(v,'Ω',3);$('#rd-tol').textContent='±'+tol+'%';
    var step3=(mm>=10)?('Vạch 3 là '+multName(mm)+': nhân '+(mm===10?'0,1':'0,01')+' → '+nf(v,2)+' Ω.'):('Vạch 3 là '+multName(mm)+' ('+mm+'): thêm '+mm+' chữ số 0 → '+((10*st.d1+st.d2)+'0'.repeat(mm))+' Ω.');
    $('#rd-exp').style.whiteSpace='pre-line';
    $('#rd-exp').textContent='Vạch 1, 2: '+DN[st.d1]+' ('+st.d1+'), '+DN[st.d2]+' ('+st.d2+') → ghép thành '+(10*st.d1+st.d2)+'.\n'+step3+'\nVạch 4: '+TOL[st.t].n+' → sai số ±'+tol+'%.\nKết quả: '+si(v,'Ω',3)+' ±'+tol+'%.';
  }
  $('#lab-mau').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.sw');if(!b||b.closest('#qz-opts'))return;st[b.dataset.k]=+b.dataset.v;render()});
  /* quiz */
  var q=null,score=0,total=0;
  function fmtOpt(d1,d2,m){return si(value(d1,d2,m),'Ω',3)}
  function newQ(){
    var d1=1+Math.floor(Math.random()*9),d2=Math.floor(Math.random()*10),m=Math.floor(Math.random()*7),t=Math.random()<0.7?2:(Math.random()<0.5?0:1);
    q={d1:d1,d2:d2,m:m,t:t,done:false};
    setBands(qsvg,{d1:d1,d2:d2,m:m,t:t});
    var right=fmtOpt(d1,d2,m),opts=[right];
    [[d1,d2,m-1],[d1,d2,m+1],[d1,d2,0],[d1,d2,m+2],[d1,d2,Math.max(0,m-2)]].forEach(function(o){if(o[2]<0)return;var s=fmtOpt(o[0],o[1],o[2]);if(opts.indexOf(s)<0&&opts.length<4)opts.push(s)});
    var guard=0;while(opts.length<4&&guard++<20){var s2=fmtOpt(d1,d2,Math.floor(Math.random()*8));if(opts.indexOf(s2)<0)opts.push(s2)}
    opts.sort(function(){return Math.random()-0.5});
    $('#qz-opts').innerHTML=opts.map(function(o){return '<button type="button" data-o="'+o+'">'+o+' ±'+TOL[t].v+'%</button>'}).join('');
    q.right=right;$('#qz-fb').hidden=true;$('#qz-score').textContent=total?('Đúng '+score+'/'+total):'';
  }
  $('#qz-opts').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!q||q.done)return;q.done=true;total++;
    var ok=b.dataset.o===q.right;if(ok)score++;
    $$('#qz-opts button').forEach(function(x){if(x.dataset.o===q.right)x.classList.add('right');else if(x===b)x.classList.add('wrong');x.disabled=true});
    var fb=$('#qz-fb');fb.hidden=false;fb.style.whiteSpace='pre-line';
    fb.textContent=(ok?'Đúng. ':'Chưa đúng. ')+'Vạch 1, 2: '+q.d1+q.d2+'. Vạch 3 ('+multName(q.m)+'): thêm '+q.m+' chữ số 0 → '+q.right+'.';
    $('#qz-score').textContent='Đúng '+score+'/'+total;
  });
  $('#qz-next').addEventListener('click',newQ);
  render();newQ();
  return {resize:function(){}};
})();

/* ================= 3. NỐI TIẾP / SONG SONG ================= */
labs.mach=(function(){
  var c=$('#mc-c'),g,w,h,mode='ser',ph=[0,0,0,0,0],S;
  var vS=$('#mc-v'),r1S=$('#mc-r1'),r2S=$('#mc-r2'),opn=$('#mc-open');
  function calc(){
    var V=+vS.value,R1=sig2(logmap(+r1S.value,10,1000,1000)),R2=sig2(logmap(+r2S.value,10,1000,1000)),op=opn.checked,r={};
    if(mode==='ser'){
      if(op){r={Rt:Infinity,It:0,I1:0,I2:0,V1:0,V2:V}}
      else{var Rt=R1+R2,I=V/Rt;r={Rt:Rt,It:I,I1:I,I2:I,V1:I*R1,V2:I*R2}}
    }else{
      var I1=V/R1,I2=op?0:V/R2;r={Rt:op?R1:R1*R2/(R1+R2),It:I1+I2,I1:I1,I2:I2,V1:V,V2:V}
    }
    S={V:V,R1:R1,R2:R2,op:op,r:r};
    $('#mc-vv').textContent=nf(V,1)+' V';$('#mc-r1v').textContent=si(R1,'Ω',2);$('#mc-r2v').textContent=si(R2,'Ω',2);
    $('#mc-read').innerHTML=[['R tổng',r.Rt===Infinity?'∞ (hở)':si(r.Rt,'Ω')],['I tổng',si(r.It,'A')],['U trên R1',si(r.V1,'V')],['I qua R1',si(r.I1,'A')],['U trên R2',si(r.V2,'V')],['I qua R2',si(r.I2,'A')]]
      .map(function(x){return '<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>'}).join('');
    var f;
    if(mode==='ser')f=op?'R2 đứt: mạch hở, không có dòng. Toàn bộ điện áp nguồn rơi trên chỗ hở.':'Rt = R1 + R2 = '+si(R1,'Ω',2)+' + '+si(R2,'Ω',2)+' = '+si(r.Rt,'Ω')+'\nI = V ÷ Rt = '+nf(V,1)+' ÷ '+si(r.Rt,'Ω')+' = '+si(r.It,'A')+' (dòng như nhau ở mọi điểm)';
    else f=op?'R2 đứt: nhánh R2 không còn dòng, R1 vẫn chạy bình thường. Rt = R1 = '+si(R1,'Ω',2)+'.':'Rt = R1 × R2 ÷ (R1 + R2) = '+si(R1,'Ω',2)+' × '+si(R2,'Ω',2)+' ÷ ('+si(R1+R2,'Ω')+') = '+si(r.Rt,'Ω')+(r.Rt<Math.min(R1,R2)?'\nNhỏ hơn điện trở nhỏ nhất ('+si(Math.min(R1,R2),'Ω',2)+').':'')+'\nĐiện áp bằng nhau ở mọi nhánh, dòng tổng = '+si(r.I1,'A')+' + '+si(r.I2,'A')+' = '+si(r.It,'A');
    $('#mc-f').style.whiteSpace='pre-line';$('#mc-f').textContent=f;
  }
  function box(x,y,bw,bh,label,bad){
    g.fillStyle=PAL.surface;g.strokeStyle=bad?PAL.bad:PAL.ink;g.lineWidth=2;g.fillRect(x,y,bw,bh);g.strokeRect(x,y,bw,bh);
    if(bad){g.beginPath();g.moveTo(x+4,y+4);g.lineTo(x+bw-4,y+bh-4);g.moveTo(x+bw-4,y+4);g.lineTo(x+4,y+bh-4);g.stroke()}
  }
  function battery(x,y){
    g.fillStyle=PAL.surface;g.fillRect(x-20,y-14,40,28);
    g.strokeStyle=PAL.ink;g.lineWidth=3;g.beginPath();g.moveTo(x-16,y-5);g.lineTo(x+16,y-5);g.stroke();
    g.lineWidth=3;g.beginPath();g.moveTo(x-9,y+6);g.lineTo(x+9,y+6);g.stroke();
    g.fillStyle=PAL.bad;g.font='600 14px '+FONT;g.textAlign='left';g.fillText('+',x+22,y-3);g.fillStyle=PAL.volt;g.fillText('−',x+23,y+14);
  }
  function label(x,y,t,col,al){g.fillStyle=col||PAL.ink;g.font='500 12px '+FONT;g.textAlign=al||'center';g.fillText(t,x,y)}
  function draw(dt){
    var s=w/360;g.setTransform((Math.min(2,window.devicePixelRatio||1))*s,0,0,(Math.min(2,window.devicePixelRatio||1))*s,0,0);
    g.clearRect(0,0,360,230);var r=S.r,x0=40,x1=320,y0=60,y1=190,paths,i;
    function spd(I){return I>0?18+130*uCur(I):0}
    if(mode==='ser'){
      paths=[{p:[[x0,y1],[x0,y0],[x1,y0],[x1,y1],[x0,y1]],I:r.It}];
    }else{
      var xa=160,xb=260;
      paths=[{p:[[x0,y1],[x0,y0],[xa,y0]],I:r.It},{p:[[xa,y0],[xa,y1]],I:r.I1},{p:[[xa,y0],[xb,y0],[xb,y1]],I:r.I2},{p:[[xb,y1],[xa,y1]],I:r.I2},{p:[[xa,y1],[x0,y1]],I:r.It}];
    }
    paths.forEach(function(P){polyline(g,P.p,PAL.muted,2)});
    if(mode==='par'){polyline(g,[[xa,y0],[xb,y0]],PAL.muted,2);polyline(g,[[xb,y1],[xa,y1]],PAL.muted,2)}
    paths.forEach(function(P,k){ph[k]+=spd(P.I)*dt;if(P.I>0)dots(g,P.p,ph[k],20,PAL.amp,3.4)});
    battery(x0,125);
    if(mode==='ser'){
      box(110,y0-14,64,28,'R1',false);box(200,y0-14,64,28,'R2',S.op);
      label(142,y0+4,'R1',PAL.ink);label(232,y0+4,'R2',S.op?PAL.bad:PAL.ink);
      label(142,y0-24,si(S.R1,'Ω',2),PAL.muted);label(232,y0-24,si(S.R2,'Ω',2),PAL.muted);
      label(142,y0+36,'U = '+si(r.V1,'V'),PAL.volt);label(232,y0+36,'U = '+si(r.V2,'V'),PAL.volt);
      label(142,y0+52,'I = '+si(r.I1,'A'),PAL.amp);label(232,y0+52,'I = '+si(r.I2,'A'),PAL.amp);
    }else{
      box(xa-15,100,30,60,'R1',false);box(xb-15,100,30,60,'R2',S.op);
      label(xa,134,'R1',PAL.ink);label(xb,134,'R2',S.op?PAL.bad:PAL.ink);
      label(xa-24,115,si(S.R1,'Ω',2),PAL.muted,'right');label(xb+24,115,si(S.R2,'Ω',2),PAL.muted,'left');
      label(xa-24,150,'I = '+si(r.I1,'A'),PAL.amp,'right');label(xb+24,150,'I = '+si(r.I2,'A'),PAL.amp,'left');
      label(x0+30,y0-8,'I tổng = '+si(r.It,'A'),PAL.amp,'left');
    }
  }
  function resize(){var f=fit(c,230/360);g=f.g;w=f.w;h=f.h;calc();draw(0)}
  [vS,r1S,r2S,opn].forEach(function(e){e.addEventListener('input',function(){calc();if(g)draw(0)})});
  $('#mc-ser').addEventListener('click',function(){mode='ser';$('#mc-ser').setAttribute('aria-pressed','true');$('#mc-par').setAttribute('aria-pressed','false');calc();draw(0)});
  $('#mc-par').addEventListener('click',function(){mode='par';$('#mc-par').setAttribute('aria-pressed','true');$('#mc-ser').setAttribute('aria-pressed','false');calc();draw(0)});
  return {resize:resize,frame:function(dt){if(g)draw(dt)}};
})();

/* ================= 4. TỤ NẠP / XẢ ================= */
labs.tu=(function(){
  var c=$('#tu-c'),g,w,h,mode='chg',tt=0,running=true,cS=$('#tu-cc'),rS=$('#tu-r'),vS=$('#tu-v'),C,R,V,tau;
  function dur(s){if(s>=120)return nf(s/60,1)+' phút';if(s>=1)return nf(s,2)+' s';return nf(s*1000,1)+' ms'}
  function params(){
    C=sig2(logmap(+cS.value,1,10000,1000))*1e-6;R=sig2(logmap(+rS.value,1,100000,1000));V=+vS.value;tau=R*C;
    $('#tu-ccv').textContent=si(C,'F',2);$('#tu-rv').textContent=si(R,'Ω',2);$('#tu-vv').textContent=V+' V';
    $('#tu-tau').textContent=dur(tau);$('#tu-5t').textContent=dur(5*tau);
    var I0=V/R,w2=$('#tu-warn');
    if(R<=10){w2.hidden=false;w2.innerHTML='<b>Dòng ban đầu '+si(I0,'A',2)+'.</b> R càng nhỏ thì dòng nạp hoặc xả ban đầu V ÷ R càng lớn. Chập trực tiếp hai cực tụ bằng tua vít giống R gần 0: dòng cực lớn, tia lửa, hỏng tụ và nguy hiểm. Hãy xả qua điện trở.'}
    else w2.hidden=true;
  }
  function vcOf(t){return mode==='chg'?V*(1-Math.exp(-t)):V*Math.exp(-t)}
  function readouts(){
    var vc=vcOf(tt),i=mode==='chg'?(V-vc)/R:vc/R;
    $('#tu-vc').textContent=si(vc,'V',3)+' ('+nf(100*vc/V,0)+'%)';$('#tu-i').textContent=si(i,'A',3);
    $('#tu-bar').style.width=(100*vc/V)+'%';
    $('#tu-f').style.whiteSpace='pre-line';
    $('#tu-f').textContent='τ = R × C = '+si(R,'Ω',2)+' × '+si(C,'F',2)+' = '+dur(tau)+'\nt = '+nf(tt,2)+' τ = '+dur(tt*tau)+(mode==='chg'?'\nNạp: Uc = V × (1 − e^(−t/τ)). Sau 5τ đạt khoảng 99,3%.':'\nXả: Uc = V × e^(−t/τ). Sau 5τ còn khoảng 0,7% ('+si(V*Math.exp(-5),'V',2)+').');
  }
  function draw(){
    g.clearRect(0,0,w,h);var L=44,Rr=12,T=14,B=30,pw=w-L-Rr,ph=h-T-B,i;
    function X(t){return L+pw*t/6}function Y(v){return T+ph*(1-v/(V*1.05))}
    g.font='11px '+FONT;g.textAlign='center';g.lineWidth=1;
    for(i=0;i<=6;i++){g.strokeStyle=PAL.line;g.beginPath();g.moveTo(X(i),T);g.lineTo(X(i),T+ph);g.stroke();g.fillStyle=PAL.muted;g.fillText(i===0?'0':(i+'τ'),X(i),h-14)}
    g.fillStyle=PAL.muted;g.fillText('5τ = '+dur(5*tau),X(5),h-2);
    g.textAlign='right';[0,0.5,1].forEach(function(f){g.strokeStyle=PAL.line;g.beginPath();g.moveTo(L,Y(V*f));g.lineTo(L+pw,Y(V*f));g.stroke();g.fillStyle=PAL.muted;g.fillText(nf(V*f,V*f%1?1:0)+' V',L-4,Y(V*f)+4)});
    var mk=mode==='chg'?0.632:0.368;g.setLineDash([4,4]);g.strokeStyle=PAL.amp;g.beginPath();g.moveTo(L,Y(V*mk));g.lineTo(X(1),Y(V*mk));g.lineTo(X(1),T+ph);g.stroke();g.setLineDash([]);
    g.fillStyle=PAL.amp;g.textAlign='left';g.fillText(mode==='chg'?'63% tại 1τ':'37% tại 1τ',X(1)+4,Y(V*mk)-4);
    g.strokeStyle=PAL.ok;g.lineWidth=3;g.beginPath();var n=120;
    for(i=0;i<=n;i++){var t=Math.min(tt,6)*i/n;g[i?'lineTo':'moveTo'](X(t),Y(vcOf(t)))}g.stroke();
    g.fillStyle=PAL.ok;g.beginPath();g.arc(X(Math.min(tt,6)),Y(vcOf(Math.min(tt,6))),5,0,6.2832);g.fill();
  }
  function start(m){mode=m;tt=0;running=true;$('#tu-chg').setAttribute('aria-pressed',m==='chg'?'true':'false');$('#tu-dis').setAttribute('aria-pressed',m==='dis'?'true':'false');params();readouts();if(g)draw()}
  [cS,rS,vS].forEach(function(e){e.addEventListener('input',function(){start(mode)})});
  $('#tu-chg').addEventListener('click',function(){start('chg')});$('#tu-dis').addEventListener('click',function(){start('dis')});$('#tu-re').addEventListener('click',function(){start(mode)});
  function resize(){var f=fit(c,0.62);g=f.g;w=f.w;h=f.h;params();readouts();draw()}
  return {resize:resize,frame:function(dt){if(!g)return;if(running&&dt>0){tt+=dt*0.9;if(tt>=6){tt=6;running=false}}readouts();draw()}};
})();

/* ================= 3b. TỤ ĐÔI ================= */
labs.doi=(function(){
  var c=$('#doi-c'),g,w,h,V0=300,vh=V0,vf=V0,conn=null,rS=$('#doi-rr'),hS=$('#doi-ch'),fS=$('#doi-cf'),R,Ch,Cf;
  function dur(x){if(x>=120)return nf(x/60,1)+' phút';if(x>=1)return nf(x,1)+' s';return nf(x*1000,0)+' ms'}
  function params(){
    R=sig2(logmap(+rS.value,100,100000,1000));Ch=+hS.value*1e-6;Cf=+fS.value*1e-6;
    $('#doi-rrv').textContent=si(R,'Ω',2);$('#doi-chv').textContent=(+hS.value)+' µF';$('#doi-cfv').textContent=(+fS.value)+' µF';
    $('#doi-p').textContent=nf(V0*V0/R,1)+' W';
    $('#doi-5t').textContent='HERM '+dur(5*R*Ch)+', FAN '+dur(5*R*Cf);
    var w2=$('#doi-warn');
    if(R<=300){w2.hidden=false;w2.innerHTML='<b>R rất nhỏ: gần như chập.</b> Dòng ban đầu '+si(V0/R,'A',2)+', công suất '+nf(V0*V0/R,0)+' W. Điện trở thường không chịu nổi, và đó là lý do không chập bằng tua vít. Chọn điện trở và công suất theo tài liệu hãng.'}
    else w2.hidden=true;
  }
  function setConn(k){conn=k;$('#doi-h').setAttribute('aria-pressed',k==='h'?'true':'false');$('#doi-f').setAttribute('aria-pressed',k==='f'?'true':'false')}
  function status(v){return v<=1?'gần 0 V (an toàn để chạm)':'còn điện'}
  function readouts(){
    $('#doi-vh').textContent=si(vh,'V',3);$('#doi-vf').textContent=si(vf,'V',3);
    var e=function(C){return nf(0.5*C*V0*V0,1)+' J'};
    $('#doi-f2').style.whiteSpace='pre-line';
    $('#doi-f2').textContent='HERM: '+status(vh)+'\nFAN: '+status(vf)+'\nτ = R × C. Điện áp mỗi phần giảm theo e^(−t/τ) khi có điện trở nối vào phần đó. Năng lượng ban đầu: HERM '+e(Ch)+', FAN '+e(Cf)+'.';
  }
  function draw(){
    g.clearRect(0,0,w,h);var u=h/10,xc=w*0.18,xf=w*0.5,xh=w*0.82,yT=u*3,yB=u*8.2,yP1=u*5.2,yP2=u*5.7;
    g.fillStyle=PAL.soft;g.strokeStyle=PAL.line;g.lineWidth=1.5;g.beginPath();g.roundRect?g.roundRect(8,yT,w-16,h-yT-6,12):g.rect(8,yT,w-16,h-yT-6);g.fill();g.stroke();
    var tm=[[xc,'C'],[xf,'FAN'],[xh,'HERM']];g.font='600 12px '+FONT;g.textAlign='center';
    tm.forEach(function(t){g.fillStyle=PAL.muted;g.fillRect(t[0]-6,yT-14,12,16);g.fillStyle=PAL.ink;g.fillText(t[1],t[0],yT+16)});
    g.strokeStyle=PAL.ink;g.lineWidth=2;
    function wire(a,b){g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
    wire([xc,yT],[xc,yB]);wire([xc,yB],[xh,yB]);
    [[xf,vf,Cf,'FAN'],[xh,vh,Ch,'HERM']].forEach(function(p){
      var x=p[0];wire([x,yT],[x,yP1]);wire([x-16,yP1],[x+16,yP1]);wire([x-16,yP2],[x+16,yP2]);wire([x,yP2],[x,yB]);
      var f=clamp(p[1]/V0,0,1);g.fillStyle=PAL.soft;g.fillRect(x+24,yP1-u*0.8,10,u*2.4);g.strokeStyle=PAL.line;g.lineWidth=1;g.strokeRect(x+24,yP1-u*0.8,10,u*2.4);
      g.fillStyle=f>0.003?(p[1]>1?PAL.bad:PAL.ok):PAL.ok;var bh=u*2.4*f;g.fillRect(x+24,yP1-u*0.8+u*2.4-bh,10,bh);
      g.fillStyle=PAL.ink;g.font='12px '+MONO;g.textAlign='center';g.fillText(si(p[2],'F',2),x-4,yP2+u*1.4);
      g.fillStyle=p[1]>1?PAL.bad:PAL.ok;g.font='600 13px '+MONO;g.fillText(nf(p[1],p[1]<10?2:0)+' V',x,yB+u*1.2);
    });
    g.fillStyle=PAL.muted;g.font='12px '+FONT;g.textAlign='center';g.fillText('chung',xc,yB+u*1.2);
    if(conn){
      var xt=conn==='h'?xh:xf,mid=(xc+xt)/2,y=yT-u*1.6;
      g.strokeStyle=PAL.amp;g.lineWidth=2.5;g.beginPath();g.moveTo(xc,yT-14);g.lineTo(xc,y);g.lineTo(mid-16,y);g.moveTo(mid+16,y);g.lineTo(xt,y);g.lineTo(xt,yT-14);g.stroke();
      g.fillStyle=PAL.surface;g.fillRect(mid-16,y-7,32,14);g.strokeRect(mid-16,y-7,32,14);g.fillStyle=PAL.amp;g.font='600 12px '+FONT;g.fillText('R',mid,y+4);
      var v=conn==='h'?vh:vf;g.textAlign='left';g.fillText('I = '+si(v/R,'A',2),8,y-8);
    }
  }
  function frame(dt){if(!g)return;if(dt>0&&conn){if(conn==='h')vh=Math.max(0,vh*Math.exp(-dt/(R*Ch)));else vf=Math.max(0,vf*Math.exp(-dt/(R*Cf)));if(vh<0.01)vh=0;if(vf<0.01)vf=0}readouts();draw()}
  function resize(){var f=fit(c,0.78);g=f.g;w=f.w;h=f.h;params();readouts();draw()}
  [rS,hS,fS].forEach(function(e){e.addEventListener('input',function(){params();readouts();if(g)draw()})});
  $('#doi-h').addEventListener('click',function(){setConn('h')});$('#doi-f').addEventListener('click',function(){setConn('f')});
  $('#doi-off').addEventListener('click',function(){setConn(null)});
  $('#doi-re').addEventListener('click',function(){vh=V0;vf=V0;setConn(null);readouts();if(g)draw()});
  return {resize:resize,frame:frame};
})();

/* ================= 5. DIODE ================= */
labs.diode=(function(){
  var IS=1e-14,VT=0.02585,RS=100,c=$('#dd-c'),j=$('#dd-j'),gc,w,h,gj,jw,jh,vS=$('#dd-v'),Vs=2,Vd=0,Id=0;
  function idOf(v){return IS*(Math.exp(Math.min(v,1.2)/VT)-1)}
  function solve(){
    Vs=+vS.value;
    if(Vs<=0){Vd=Vs;Id=-IS;return}
    var lo=0,hi=Vs/RS,k,mid;
    for(k=0;k<60;k++){mid=(lo+hi)/2;var vd=VT*Math.log(mid/IS+1);if(vd+mid*RS>Vs)hi=mid;else lo=mid}
    Id=(lo+hi)/2;Vd=VT*Math.log(Id/IS+1);
  }
  function upd(){
    solve();$('#dd-vv').textContent=nf(Vs,2)+' V';$('#dd-vd').textContent=nf(Vd,2)+' V';
    $('#dd-id').textContent=Vs<=0?'≈ 0':si(Id,'A',3);
    var s=$('#dd-st');if(Vs<=0){s.textContent='Khóa (ngược)';s.className='badc'}else if(Vd<0.5){s.textContent='Chưa dẫn';s.className=''}else{s.textContent='Dẫn (thuận)';s.className='good'}
  }
  function drawIV(){
    var g=gc;g.clearRect(0,0,w,h);var L=44,Rr=12,T=14,B=26,pw=w-L-Rr,ph=h-T-B,xmin=-2,xmax=1.2,ymax=50,i;
    function X(v){return L+pw*(v-xmin)/(xmax-xmin)}function Y(a){return T+ph*(1-a/ymax)}
    g.font='11px '+FONT;g.lineWidth=1;g.textAlign='center';
    [-2,-1,0,1].forEach(function(v){g.strokeStyle=v===0?PAL.muted:PAL.line;g.beginPath();g.moveTo(X(v),T);g.lineTo(X(v),T+ph);g.stroke();g.fillStyle=PAL.muted;g.fillText(v+' V',X(v),h-10)});
    g.textAlign='right';[0,25,50].forEach(function(a){g.strokeStyle=PAL.line;g.beginPath();g.moveTo(L,Y(a));g.lineTo(L+pw,Y(a));g.stroke();g.fillStyle=PAL.muted;g.fillText(a+' mA',L-4,Y(a)+4)});
    g.setLineDash([4,4]);g.strokeStyle=PAL.amp;g.beginPath();g.moveTo(X(0.7),T);g.lineTo(X(0.7),T+ph);g.stroke();g.setLineDash([]);
    g.fillStyle=PAL.amp;g.textAlign='left';g.fillText('≈ 0,7 V',X(0.7)+4,T+12);
    g.strokeStyle=PAL.volt;g.lineWidth=3;g.beginPath();var started=false;
    for(i=0;i<=240;i++){var v=xmin+(xmax-xmin)*i/240,a=idOf(v)*1000;if(a>ymax){g.lineTo(X(v),Y(ymax));break}g[started?'lineTo':'moveTo'](X(v),Y(Math.max(a,0)));started=true}
    g.stroke();
    var px=clamp(Vd,xmin,xmax),py=Math.max(0,Id*1000);
    g.fillStyle=PAL.amp;g.beginPath();g.arc(X(px),Y(Math.min(py,ymax)),6,0,6.2832);g.fill();
    g.fillStyle=PAL.ink;g.textAlign=px>0.4?'right':'left';g.fillText(Vd<xmin?('Vd = '+nf(Vd,1)+' V (ngoài khung)'):'',px>0.4?X(px)-10:X(px)+10,Y(Math.min(py,ymax))-10);
  }
  function drawJ(){
    var g=gj;g.clearRect(0,0,jw,jh);var mid=jw/2,pH=jh*0.5,y=jh*0.18,dw=clamp(14+26*Math.sqrt(Math.max(0.05,(0.8-Vd)/0.8)),12,92);
    g.fillStyle=PAL.bad;g.globalAlpha=0.22;g.fillRect(16,y,mid-dw/2-16,pH);g.globalAlpha=1;
    g.fillStyle=PAL.volt;g.globalAlpha=0.22;g.fillRect(mid+dw/2,y,jw-16-(mid+dw/2),pH);g.globalAlpha=1;
    g.fillStyle=PAL.muted;g.globalAlpha=0.35;g.fillRect(mid-dw/2,y,dw,pH);g.globalAlpha=1;
    g.strokeStyle=PAL.muted;g.lineWidth=1.5;g.strokeRect(16,y,jw-32,pH);
    g.font='600 14px '+FONT;g.textAlign='center';g.fillStyle=PAL.ink;g.fillText('P',(16+mid-dw/2)/2,y+pH/2+5);g.fillText('N',(mid+dw/2+jw-16)/2,y+pH/2+5);
    g.font='12px '+FONT;g.fillStyle=PAL.muted;g.fillText('vùng nghèo '+(Vd>0.45?'hẹp':Vd<-0.5?'rộng':'trung bình'),mid,y+pH+16);
    g.fillStyle=PAL.bad;g.textAlign='left';g.fillText(Vs>0?'+ A (anode)':'− A (anode)',16,y-6);g.fillStyle=PAL.volt;g.textAlign='right';g.fillText(Vs>0?'− K (cathode)':'+ K (cathode)',jw-16,y-6);
  }
  function resize(){var f=fit(c,0.62);gc=f.g;w=f.w;h=f.h;var f2=fit(j,0.3);gj=f2.g;jw=f2.w;jh=f2.h;upd();drawIV();drawJ()}
  vS.addEventListener('input',function(){upd();if(gc){drawIV();drawJ()}});
  /* meter */
  var ms='good',mp='fwd';
  function meter(){
    var lcd=$('#dm-lcd'),txt=$('#dm-txt'),val,expl;
    if(ms==='good'){
      if(mp==='fwd'){var vt=VT*Math.log(1e-3/IS+1);lcd.innerHTML=nf(vt,3)+'<small>V</small>';expl='Chiều thuận: hiện cỡ vài trăm mV (khoảng 0,5 đến 0,7 V với diode silicon). Diode tốt.'}
      else{lcd.innerHTML='OL';expl='Chiều ngược: hiện OL (không dẫn). Một chiều có giá trị, một chiều OL là diode tốt.'}
    }else if(ms==='short'){lcd.innerHTML='0,000<small>V</small>';expl='Cả hai chiều đều gần 0: diode bị chập. Nên tháo một đầu diode ra khỏi mạch đo lại để chắc chắn.'}
    else{lcd.innerHTML='OL';expl='Cả hai chiều đều OL: diode bị đứt (hở mạch).'}
    txt.textContent=expl;
  }
  $('#dm-state').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;ms=b.dataset.v;$$('#dm-state button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});meter()});
  $('#dm-probe').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;mp=b.dataset.v;$$('#dm-probe button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});meter()});
  meter();
  return {resize:resize,frame:null};
})();

/* ================= 6. CẦU CHỈNH LƯU ================= */
labs.cau=(function(){
  var cs=$('#br-s'),cw=$('#br-w'),gs,sw,sh,gw,ww,wh,vpS=$('#br-vp'),cS=$('#br-c'),rS=$('#br-r'),fault='none',P,sims,tcur=0,ph=0,ph2=0;
  var DT=5e-5,N=1200;
  function sim(Vp,Cuf,Rl,flt){
    var f=50,drop=1.4,C=Cuf*1e-6,vc=0,vin=new Float32Array(N),vout=new Float32Array(N),cond=new Uint8Array(N),k;
    for(k=-500;k<N;k++){
      var t=k*DT,vi=Vp*Math.sin(2*Math.PI*f*t),pos=vi>=0,ok=pos?(flt!=='D1'&&flt!=='D4'):(flt!=='D2'&&flt!=='D3'),vr=Math.abs(vi)-drop,cd=0,vo;
      if(C>0){if(ok&&vr>vc){vc=vr;cd=pos?1:2}else vc*=Math.exp(-DT/(Rl*C));vo=vc}
      else{if(ok&&vr>0){vo=vr;cd=pos?1:2}else vo=0}
      if(k>=0){vin[k]=vi;vout[k]=vo;cond[k]=cd}
    }
    return {vin:vin,vout:vout,cond:cond};
  }
  function stats(s){var mx=-1e9,mn=1e9,sum=0,i,pulses=0,last=-1e9;for(i=0;i<N;i++){mx=Math.max(mx,s.vout[i]);mn=Math.min(mn,s.vout[i]);sum+=s.vout[i];if(s.cond[i]){if(i-last>20)pulses++;last=i}}return {avg:sum/N,mx:mx,mn:mn,rip:mx-mn,pulses:pulses/3}}
  function params(){
    var cs_=+cS.value;P={Vp:+vpS.value,C:cs_===0?0:sig2(10*Math.pow(470,(cs_-1)/99)),R:sig2(logmap(+rS.value,20,1000,1000))};
    $('#br-vpv').textContent=P.Vp+' V';$('#br-cv').textContent=P.C?si(P.C*1e-6,'F',2):'không có tụ';$('#br-rv').textContent=si(P.R,'Ω',2);
    var m=sim(P.Vp,P.C,P.R,fault),ref=sim(P.Vp,0,P.R,fault),base=fault==='none'?m:sim(P.Vp,P.C,P.R,'none');
    sims={m:m,ref:ref};var a=stats(m),b=stats(base);
    $('#br-avg').textContent=nf(a.avg,1)+' V';$('#br-rip').textContent=nf(a.rip,1)+' V';$('#br-pul').textContent=nf(a.pulses,0);
    var msg;
    if(fault==='none'){
      msg=P.C?('Tụ nạp ở gần đỉnh sóng (diode dẫn), rồi xả nuôi tải khi diode khóa. Gợn sóng khoảng '+nf(a.rip,1)+' V. Tụ lớn hơn hoặc tải nhẹ hơn thì gợn sóng nhỏ hơn.'):'Không có tụ: mỗi nửa chu kỳ cho một xung, điện áp ra về 0 liên tục (2 xung mỗi chu kỳ).';
    }else{
      msg='Đứt '+fault+': mất đường dẫn ở một nửa chu kỳ nên chỉ còn '+nf(a.pulses,0)+' xung mỗi chu kỳ (bình thường là 2).\nĐiện áp ra trung bình '+nf(a.avg,1)+' V, bình thường là '+nf(b.avg,1)+' V.\n'+(P.C?'Tụ chỉ được nạp một lần mỗi chu kỳ nên tụt sâu hơn: gợn sóng '+nf(a.rip,1)+' V (bình thường '+nf(b.rip,1)+' V).':'Không có tụ nên điện áp ra rỗng một nửa thời gian.');
    }
    $('#br-msg').style.whiteSpace='pre-line';$('#br-msg').textContent=msg;
  }
  /* sơ đồ */
  var A=[110,40],B=[110,180],Nn=[40,110],Pp=[180,110],SC=[110,110];
  var pathPos=[[110,88],[110,40],[180,110],[315,110],[315,225],[20,225],[20,110],[40,110],[110,180],[110,132]];
  var pathNeg=[[110,132],[110,180],[180,110],[315,110],[315,225],[20,225],[20,110],[40,110],[110,40],[110,88]];
  var pathDis=[[240,110],[315,110],[315,225],[240,225],[240,110]];
  function diode(p1,p2,name,lit,broken,lx,ly){
    var mx=(p1[0]+p2[0])/2,my=(p1[1]+p2[1])/2,ang=Math.atan2(p2[1]-p1[1],p2[0]-p1[0]);
    gs.save();gs.translate(mx,my);gs.rotate(ang);
    gs.strokeStyle=broken?PAL.bad:(lit?PAL.amp:PAL.muted);gs.lineWidth=2;
    gs.fillStyle=lit?PAL.amp:PAL.surface;
    gs.beginPath();gs.moveTo(-9,-9);gs.lineTo(-9,9);gs.lineTo(9,0);gs.closePath();gs.fill();gs.stroke();
    gs.beginPath();gs.moveTo(9,-10);gs.lineTo(9,10);gs.stroke();
    gs.restore();
    if(broken){gs.strokeStyle=PAL.bad;gs.lineWidth=2.5;gs.beginPath();gs.moveTo(mx-9,my-9);gs.lineTo(mx+9,my+9);gs.moveTo(mx+9,my-9);gs.lineTo(mx-9,my+9);gs.stroke()}
    gs.fillStyle=broken?PAL.bad:PAL.ink;gs.font='600 13px '+FONT;gs.textAlign='center';gs.fillText(name,mx+lx,my+ly);
  }
  function drawS(dt){
    var d=Math.min(2,window.devicePixelRatio||1),s=sw/360;gs.setTransform(d*s,0,0,d*s,0,0);gs.clearRect(0,0,360,270);
    var idx=clamp(Math.floor(tcur/DT),0,N-1),cd=sims.m.cond[idx],vo=sims.m.vout[idx],hasC=P.C>0;
    var wires=[[A,Pp],[Pp,[315,110]],[[315,110],[315,225]],[[315,225],[20,225]],[[20,225],[20,110]],[[20,110],Nn],[Nn,B],[Nn,A],[B,Pp],[A,[110,88]],[B,[110,132]]];
    wires.forEach(function(wr){polyline(gs,wr,PAL.muted,2)});
    if(hasC){polyline(gs,[[240,110],[240,158]],PAL.muted,2);polyline(gs,[[240,172],[240,225]],PAL.muted,2)}
    var path=cd===1?pathPos:cd===2?pathNeg:(hasC&&vo>0.3?pathDis:null);
    if(path){var sp=cd?95:25+60*vo/P.Vp;ph+=sp*dt;var hide=function(p){return Math.hypot(p[0]-110,p[1]-110)<23||(p[0]===240&&p[1]>156&&p[1]<174)||(Math.abs(p[0]-315)<1&&p[1]>140&&p[1]<182)};dots(gs,path,ph,18,PAL.amp,3.2,hide)}
    gs.fillStyle=PAL.surface;gs.strokeStyle=PAL.ink;gs.lineWidth=2;gs.beginPath();gs.arc(110,110,22,0,6.2832);gs.fill();gs.stroke();
    gs.strokeStyle=PAL.volt;gs.lineWidth=2;gs.beginPath();for(var i=0;i<=20;i++){var x=98+i*1.2,y=110-6*Math.sin(i/20*6.2832);gs[i?'lineTo':'moveTo'](x,y)}gs.stroke();
    diode(Nn,A,'D3',cd===2&&fault!=='D3',fault==='D3',-14,-12);diode(A,Pp,'D1',cd===1&&fault!=='D1',fault==='D1',14,-12);
    diode(Nn,B,'D4',cd===1&&fault!=='D4',fault==='D4',-14,20);diode(B,Pp,'D2',cd===2&&fault!=='D2',fault==='D2',14,20);
    gs.fillStyle=PAL.ink;gs.font='500 13px '+FONT;gs.textAlign='center';gs.fillText('~',110,30);gs.fillText('~',110,200);
    gs.fillStyle=PAL.bad;gs.font='600 15px '+FONT;gs.fillText('+',190,100);gs.fillStyle=PAL.volt;gs.fillText('−',30,100);
    if(hasC){
      gs.strokeStyle=PAL.ink;gs.lineWidth=3;gs.beginPath();gs.moveTo(226,158);gs.lineTo(254,158);gs.moveTo(226,172);gs.lineTo(254,172);gs.stroke();
      gs.fillStyle=PAL.muted;gs.font='12px '+FONT;gs.fillText('Tụ lọc',240,246);
      gs.strokeStyle=PAL.line;gs.lineWidth=1;gs.strokeRect(266,125,10,85);gs.fillStyle=PAL.ok;var fh=85*clamp(vo/P.Vp,0,1);gs.fillRect(267,210-fh,8,fh);
      gs.fillStyle=PAL.muted;gs.fillText('U tụ',271,120);
    }
    var lum=clamp(vo/P.Vp,0,1);gs.fillStyle=PAL.surface;gs.strokeStyle=PAL.ink;gs.lineWidth=2;gs.beginPath();gs.arc(315,166,16,0,6.2832);gs.fill();gs.stroke();
    gs.globalAlpha=0.15+0.85*lum;gs.fillStyle=PAL.amp;gs.beginPath();gs.arc(315,166,12,0,6.2832);gs.fill();gs.globalAlpha=1;
    gs.fillStyle=PAL.muted;gs.font='12px '+FONT;gs.fillText('Tải',315,196);
    gs.fillStyle=cd?PAL.amp:PAL.muted;gs.font='500 12px '+FONT;gs.textAlign='left';
    gs.fillText(cd===1?'Nửa dương: D1 và D4 dẫn':cd===2?'Nửa âm: D2 và D3 dẫn':(hasC&&vo>0.3?'Diode khóa: tụ xả nuôi tải':'Diode khóa, không có dòng'),12,262);
  }
  function drawW(){
    var g=gw;g.setTransform(Math.min(2,window.devicePixelRatio||1),0,0,Math.min(2,window.devicePixelRatio||1),0,0);g.clearRect(0,0,ww,wh);
    var L=36,Rr=8,T=10,Bm=22,pw=ww-L-Rr,ph_=wh-T-Bm,ym=P.Vp*1.08,i;
    function X(t){return L+pw*t/(N*DT)}function Y(v){return T+ph_*(1-(v+ym)/(2*ym))}
    g.font='11px '+FONT;g.lineWidth=1;g.textAlign='center';
    for(i=0;i<=6;i++){var tm=i*10e-3;g.strokeStyle=PAL.line;g.beginPath();g.moveTo(X(tm),T);g.lineTo(X(tm),T+ph_);g.stroke();g.fillStyle=PAL.muted;g.fillText(i*10+' ms',X(tm),wh-6)}
    g.textAlign='right';[-P.Vp,0,P.Vp].forEach(function(v){g.strokeStyle=v===0?PAL.muted:PAL.line;g.beginPath();g.moveTo(L,Y(v));g.lineTo(L+pw,Y(v));g.stroke();g.fillStyle=PAL.muted;g.fillText(v+'',L-4,Y(v)+4)});
    function line(arr,col,lw,dash){g.strokeStyle=col;g.lineWidth=lw;g.setLineDash(dash||[]);g.beginPath();for(var k=0;k<N;k+=2){g[k?'lineTo':'moveTo'](X(k*DT),Y(arr[k]))}g.stroke();g.setLineDash([])}
    line(sims.m.vin,PAL.volt,1.5);if(P.C>0)line(sims.ref.vout,PAL.muted,1.5,[4,4]);line(sims.m.vout,PAL.ok,3);
    var cx=X(tcur),idx=clamp(Math.floor(tcur/DT),0,N-1);g.strokeStyle=PAL.amp;g.lineWidth=1.5;g.beginPath();g.moveTo(cx,T);g.lineTo(cx,T+ph_);g.stroke();
    g.fillStyle=PAL.volt;g.beginPath();g.arc(cx,Y(sims.m.vin[idx]),4,0,6.2832);g.fill();g.fillStyle=PAL.ok;g.beginPath();g.arc(cx,Y(sims.m.vout[idx]),4.5,0,6.2832);g.fill();
  }
  function frame(dt){if(!gs)return;if(dt>0){tcur+=dt*(N*DT)/6;if(tcur>=N*DT)tcur-=N*DT}drawS(dt);drawW()}
  function resize(){var a=fit(cs,270/360);gs=a.g;sw=a.w;sh=a.h;var b=fit(cw,0.5);gw=b.g;ww=b.w;wh=b.h;params();drawS(0);drawW()}
  [vpS,cS,rS].forEach(function(e){e.addEventListener('input',function(){params();if(gs){drawS(0);drawW()}})});
  $('#br-fault').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;fault=b.dataset.v;$$('#br-fault button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});params();if(gs){drawS(0);drawW()}});
  return {resize:resize,frame:frame};
})();

/* ================= 6. CHU TRÌNH LẠNH ================= */
labs.lanh=(function(){
  var c=$('#lanh-c'),g,w,h,sel=0,phase=0,ang=0,st={comp:true,fan:true,evap:true,gas:true};
  var HOT='#D64533',WARM='#E8890C',COLD='#6FB8FF',COLD2='#2F7FD8';
  var INFO=[
    {n:'① Máy nén',i:'hơi lạnh, áp thấp',o:'hơi nóng, áp cao',t:'Nén môi chất để tạo áp cao và đẩy môi chất đi vòng. Đây là bộ phận dùng điện, có tụ chạy.',f:'Máy nén không chạy: không có chênh áp giữa hai phía, môi chất đứng yên, không lạnh. Tụ chạy yếu thì máy nén khó khởi động.'},
    {n:'② Dàn nóng (ngưng tụ)',i:'hơi nóng, áp cao',o:'lỏng, áp cao',t:'Quạt thổi không khí qua dàn để lấy nhiệt đi. Hơi nguội xuống và ngưng thành lỏng, nhả nhiệt ra ngoài.',f:'Quạt không quay (tụ quạt hỏng, cuộn dây đứt, kẹt cánh): nhiệt không thoát, áp cao tăng, máy nén nóng, có thể ngắt bảo vệ.'},
    {n:'③ Van tiết lưu',i:'lỏng, áp cao',o:'lỏng lẫn hơi lạnh, áp thấp',t:'Môi chất bị ép qua chỗ rất hẹp nên áp giảm đột ngột và nhiệt độ tụt xuống rất thấp.',f:'Van tắc hoặc nghẹt: môi chất không qua đủ, phía thấp thiếu môi chất, lạnh kém.'},
    {n:'④ Dàn lạnh (bay hơi)',i:'lỏng lẫn hơi lạnh, áp thấp',o:'hơi lạnh, áp thấp',t:'Môi chất lỏng sôi ở nhiệt độ thấp nên hút nhiệt của không khí trong phòng. Phòng mát đi.',f:'Dàn bẩn hoặc quạt dàn lạnh yếu: hút nhiệt kém, phòng lạnh chậm, có thể đóng tuyết.'}
  ];
  var dirt=[];for(var i=0;i<16;i++){dirt.push([(i*37%100)/100,((i*61+13)%100)/100])}
  function model(){
    var m={};
    if(!st.comp){m.hi=0.42;m.lo=0.42;m.flow=0;m.cool=0;m.rel=0;m.ct=0.15;return m}
    var hi=0.7,lo=0.26,cool=1,flow=1,rel=1,ct=0.45;
    if(!st.fan){hi=1;cool*=0.35;flow*=0.8;rel=0.2;ct=1}
    if(!st.evap){lo=Math.min(lo,0.14);cool*=0.5;flow*=0.85}
    if(!st.gas){hi*=0.65;lo*=0.5;cool*=0.4;flow*=0.6;rel*=0.5;if(st.fan)ct=0.7}
    m.hi=hi;m.lo=lo;m.flow=flow;m.cool=cool;m.rel=rel;m.ct=ct;return m;
  }
  function lvl(v,n){return Math.abs(v-n)<0.08?'bình thường':(v>n?'cao hơn bình thường':'thấp hơn bình thường')}
  function refresh(){
    var m=model(),i=INFO[sel];
    $('#lanh-info').innerHTML='<b>'+i.n+'</b><br>Vào: '+i.i+'<br>Ra: '+i.o+'<br>Việc: '+i.t+'<br><span style="color:var(--bad)">Nếu có sự cố: '+i.f+'</span>';
    $('#lanh-hi').textContent=st.comp?lvl(m.hi,0.7):'cân bằng';
    $('#lanh-lo').textContent=st.comp?lvl(m.lo,0.26):'cân bằng';
    $('#lanh-ef').textContent=m.cool>0.85?'tốt':(m.cool>0.3?'yếu':'không lạnh');
    $('#lanh-ct').textContent=!st.comp?'tắt':(m.ct>0.9?'rất nóng':(m.ct>0.6?'nóng hơn':'bình thường'));
    var d=$('#lanh-dx'),t='';
    if(!st.comp)t='<b>Máy nén tắt:</b> hai phía cân bằng áp, không có chênh áp nên môi chất đứng yên. Kiểm tra nguồn, tụ chạy, cuộn dây, bảo vệ quá tải.';
    else if(!st.fan&&!st.gas)t='<b>Quạt dàn nóng hỏng và thiếu gas:</b> nhiều lỗi cùng lúc, khó đọc triệu chứng. Sửa từng lỗi và đo lại.';
    else if(!st.fan)t='<b>Quạt dàn nóng không quay:</b> nhiệt không thoát ra được, áp cao tăng mạnh, máy nén nóng. Kiểm tra tụ quạt (nhớ xả tụ trước), cuộn dây, cánh quạt, giắc cắm.';
    else if(!st.gas)t='<b>Thiếu gas (xì):</b> áp cao và áp thấp đều thấp, lạnh yếu. Cần tìm chỗ rò, không chỉ nạp thêm.';
    else if(!st.evap)t='<b>Dàn lạnh bẩn:</b> hút nhiệt kém, phòng lạnh chậm, áp thấp giảm, có thể đóng tuyết. Vệ sinh dàn và kiểm tra quạt dàn lạnh.';
    d.hidden=!t;d.innerHTML=t;
    $('#lanh-comp').textContent='Máy nén: '+(st.comp?'chạy':'TẮT');$('#lanh-fan').textContent='Quạt dàn nóng: '+(st.fan?'chạy':'HỎNG');
    $('#lanh-evap').textContent='Dàn lạnh: '+(st.evap?'sạch':'BẨN');$('#lanh-gas').textContent='Gas: '+(st.gas?'đủ':'THIẾU');
    $('#lanh-comp').setAttribute('aria-pressed',st.comp?'false':'true');$('#lanh-fan').setAttribute('aria-pressed',st.fan?'false':'true');
    $('#lanh-evap').setAttribute('aria-pressed',st.evap?'false':'true');$('#lanh-gas').setAttribute('aria-pressed',st.gas?'false':'true');
    $$('#lab-lanh [data-p]').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.p===sel?'true':'false')});
  }
  var R=[[36,5,28,12],[70,34,24,32],[36,83,28,12],[4,34,24,32]];
  function seg(arr){return arr.map(function(p){return [p[0]*w/100,p[1]*h/100]})}
  function rrect(x,y,ww,hh,r){g.beginPath();if(g.roundRect)g.roundRect(x,y,ww,hh,r);else g.rect(x,y,ww,hh)}
  function draw(){
    g.clearRect(0,0,w,h);var sc=w/390,m=model(),on=st.comp;
    var S=[seg([[64,11],[82,11],[82,34]]),seg([[82,66],[82,89],[64,89]]),seg([[36,89],[16,89],[16,66]]),seg([[16,34],[16,11],[36,11]])];
    var col=[HOT,WARM,COLD,COLD2],sp=[17,7,10,17],rr=[2.4,3,2.8,2.4];
    S.forEach(function(p,k){g.globalAlpha=on?0.3:0.15;polyline(g,p,col[k],7*sc);g.globalAlpha=1});
    S.forEach(function(p,k){g.globalAlpha=on?1:0.45;dots(g,p,phase,sp[k]*sc,col[k],rr[k]*sc);g.globalAlpha=1});
    var lab=[['hơi nóng','áp cao',80,19,'right',HOT],['lỏng','áp cao',80,72,'right',WARM],['lỏng+hơi','áp thấp',18,72,'left',COLD2],['hơi lạnh','áp thấp',18,19,'left',COLD2]];
    g.font='11px '+FONT;
    lab.forEach(function(l){g.textAlign=l[4];g.fillStyle=l[5];g.fillText(l[0],l[2]*w/100,l[3]*h/100);g.fillText(l[1],l[2]*w/100,l[3]*h/100+13)});
    // components
    R.forEach(function(r,k){
      var x=r[0]*w/100,y=r[1]*h/100,ww=r[2]*w/100,hh=r[3]*h/100;
      g.save();
      if(k===1&&m.rel>0){g.shadowColor='rgba(214,69,51,.55)';g.shadowBlur=18*m.rel*(on?1:0)}
      if(k===3&&m.cool>0){g.shadowColor='rgba(47,127,216,.55)';g.shadowBlur=18*m.cool}
      rrect(x,y,ww,hh,8);g.fillStyle=PAL.surface;g.fill();g.restore();
      if(k===0){var t=m.ct;rrect(x,y,ww,hh,8);g.fillStyle='rgba(214,69,51,'+(0.08+0.45*Math.max(0,(t-0.4)))+')';g.fill()}
      if(k===1){for(var q=0;q<7;q++){var yy=y+hh*0.3+q*hh*0.09;g.strokeStyle=HOT;g.globalAlpha=0.35;g.lineWidth=1;g.beginPath();g.moveTo(x+6,yy);g.lineTo(x+ww-6,yy);g.stroke();g.globalAlpha=1}
        var cx=x+ww/2,cy=y+hh*0.74,fr=Math.min(ww,hh)*0.17;g.strokeStyle=PAL.ink;g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,fr+3,0,6.2832);g.stroke();
        for(var b=0;b<3;b++){var a=ang+b*2.0944;g.strokeStyle=st.fan?PAL.ink:PAL.bad;g.lineWidth=2.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+fr*Math.cos(a),cy+fr*Math.sin(a));g.stroke()}
        if(!st.fan){g.strokeStyle=PAL.bad;g.lineWidth=2.5;g.beginPath();g.moveTo(cx-fr,cy-fr);g.lineTo(cx+fr,cy+fr);g.moveTo(cx+fr,cy-fr);g.lineTo(cx-fr,cy+fr);g.stroke()}}
      if(k===3){for(var q2=0;q2<7;q2++){var y2=y+hh*0.3+q2*hh*0.09;g.strokeStyle=COLD2;g.globalAlpha=0.4;g.lineWidth=1;g.beginPath();g.moveTo(x+6,y2);g.lineTo(x+ww-6,y2);g.stroke();g.globalAlpha=1}
        if(!st.evap){g.fillStyle=PAL.muted;dirt.forEach(function(d){g.beginPath();g.arc(x+6+d[0]*(ww-12),y+hh*0.3+d[1]*(hh*0.65),3*sc+1,0,6.2832);g.fill()});g.fillStyle=PAL.muted;g.font='11px '+FONT;g.textAlign='center';g.fillText('bụi bẩn',x+ww/2,y+hh-4)}}
      if(k===2){var cx2=x+ww/2,cy2=y+hh*0.62;g.strokeStyle=PAL.ink;g.lineWidth=2;g.beginPath();g.moveTo(x+8,cy2-8);g.lineTo(cx2-4,cy2);g.lineTo(x+8,cy2+8);g.moveTo(x+ww-8,cy2-8);g.lineTo(cx2+4,cy2);g.lineTo(x+ww-8,cy2+8);g.stroke()}
      rrect(x,y,ww,hh,8);g.lineWidth=k===sel?3.5:1.5;g.strokeStyle=k===sel?PAL.amp:PAL.ink;g.stroke();
      g.fillStyle=PAL.ink;g.font='600 12px '+FONT;g.textAlign='center';g.fillText(INFO[k].n.split(' (')[0],x+ww/2,y+16);
    });
    // gauges
    function gauge(cxp,v,nrm,colr,name){
      var gx=cxp*w/100-9*sc,gy=h*0.32,gh=h*0.34,gw=18*sc;
      g.fillStyle=PAL.soft;g.fillRect(gx,gy,gw,gh);
      g.fillStyle='rgba(22,132,90,.25)';g.fillRect(gx,gy+gh*(1-nrm-0.08),gw,gh*0.16);
      g.fillStyle=colr;var fh=gh*v;g.fillRect(gx,gy+gh-fh,gw,fh);
      g.strokeStyle=PAL.ink;g.lineWidth=1.2;g.strokeRect(gx,gy,gw,gh);
      g.fillStyle=PAL.ink;g.font='600 11px '+FONT;g.textAlign='center';g.fillText(name,gx+gw/2,gy+gh+14);
    }
    gauge(42.5,m.hi,0.7,HOT,'Áp cao');gauge(57.5,m.lo,0.26,COLD2,'Áp thấp');
    g.fillStyle=PAL.muted;g.font='10px '+FONT;g.textAlign='center';g.fillText('vùng xanh = bình thường',w/2,h*0.32-7);
    if(!on){g.fillStyle=PAL.bad;g.font='600 11px '+FONT;g.textAlign='center';g.fillText('môi chất đứng yên',w/2,h*0.76)}
  }
  function frame(dt){if(!g)return;var m=model();phase+=dt*60*sc1()*m.flow;if(st.fan&&st.comp)ang+=dt*9*Math.max(0.5,m.flow);draw()}
  function sc1(){return w?w/390:1}
  function resize(){var f=fit(c,1.12);g=f.g;w=f.w;h=f.h;refresh();draw()}
  function pick(k){sel=k;refresh();if(g)draw()}
  $$('#lab-lanh [data-p]').forEach(function(b){b.addEventListener('click',function(){pick(+b.dataset.p)})});
  c.addEventListener('click',function(e){
    var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
    for(var k=0;k<4;k++){var q=R[k];if(x>=q[0]-2&&x<=q[0]+q[2]+2&&y>=q[1]-2&&y<=q[1]+q[3]+2){pick(k);return}}
  });
  function tog(id,key,pickIdx){$(id).addEventListener('click',function(){st[key]=!st[key];sel=pickIdx;refresh();if(g)draw()})}
  tog('#lanh-comp','comp',0);tog('#lanh-fan','fan',1);tog('#lanh-evap','evap',3);tog('#lanh-gas','gas',3);
  $('#lanh-reset').addEventListener('click',function(){st={comp:true,fan:true,evap:true,gas:true};refresh();if(g)draw()});
  return {resize:resize,frame:frame};
})();

/* ================= 7. RELAY + TRANSISTOR ================= */
labs.rl=(function(){
  var c=$('#rl-c'),wc=$('#rl-w'),g,gw,w,h,ww,wh,pin=false,dio=true,rbS=$('#rl-rb'),Rb,Ib,Ic,on=false,blade=0,fan=0,t=0,t0=-99,hist=[],prevOn=false;
  var VCH=3.3,VBE=0.7,V=12,RC=400,BETA=100,NEED=V/RC;
  function params(){
    Rb=sig2(logmap(+rbS.value,100,100000,1000));$('#rl-rbv').textContent=si(Rb,'Ω',2);
    Ib=pin?Math.max(0,(VCH-VBE)/Rb):0;var pos=BETA*Ib;Ic=Math.min(pos,NEED);on=pin&&pos>=NEED;
    $('#rl-ib').textContent=si(Ib,'A',2);$('#rl-ic').textContent=si(Ic,'A',2);
    $('#rl-st').textContent=on?'hút (NO đóng)':(pin&&Ic>0?'thiếu dòng':'nhả (NC)');
    $('#rl-ld').textContent=on?'chạy':'dừng';
    var f=$('#rl-f');
    f.textContent=pin?('Ib = (3,3 V − 0,7 V) ÷ '+si(Rb,'Ω',2)+' = '+si(Ib,'A',2)+'\nIc tối đa = 100 × Ib = '+si(pos,'A',2)+'; cuộn cần '+si(NEED,'A',2)+' (12 V ÷ 400 Ω)\n'+(on?'Ic đủ nên transistor dẫn bão hòa, relay hút.':'Ic không đủ nên cuộn thiếu dòng.')):'Chân chip ở 0 V: không có Ib, transistor tắt, cuộn không có dòng, relay nhả.';
    var wn=$('#rl-warn');
    if(pin&&!on){wn.hidden=false;wn.innerHTML='<b>Điện trở nền quá lớn:</b> Ib nhỏ nên transistor không dẫn đủ. Relay có thể không hút hoặc hút yếu. Trên board thật, kiểm tra điện trở nền và transistor.'}
    else if(!dio){wn.hidden=false;wn.innerHTML='<b>Không có diode dập xung:</b> khi tắt, cuộn sinh xung điện áp cao tại chân C, có thể làm hỏng transistor. Kiểm tra diode (chập hoặc đứt) khi transistor hỏng lặp lại.'}
    else wn.hidden=true;
    $('#rl-pin').textContent='Chân chip: '+(pin?'CAO (3,3 V)':'THẤP (0 V)');$('#rl-dio').textContent='Diode dập xung: '+(dio?'CÓ':'MẤT');
    $('#rl-pin').setAttribute('aria-pressed',pin?'true':'false');$('#rl-dio').setAttribute('aria-pressed',dio?'false':'true');
  }
  function X(v){return v*w/100}function Y(v){return v*h/100}
  function line(pts,col,lw){g.strokeStyle=col;g.lineWidth=lw||2;g.beginPath();pts.forEach(function(p,i){g[i?'lineTo':'moveTo'](X(p[0]),Y(p[1]))});g.stroke()}
  function draw(){
    g.clearRect(0,0,w,h);var ink=PAL.ink,hi=on?PAL.ok:PAL.line,sc=w/390;
    g.font='600 '+11*sc+'px '+FONT;g.textAlign='center';
    // rail and coil
    line([[6,8],[34,8]],PAL.bad,2.5);g.fillStyle=PAL.bad;g.textAlign='left';g.fillText('+12 V',X(6),Y(5));
    line([[24,8],[24,22]],on?PAL.amp:ink,2);g.fillStyle=on?'rgba(255,179,71,.35)':PAL.soft;g.fillRect(X(19),Y(22),X(10),Y(20));g.strokeStyle=ink;g.lineWidth=1.6;g.strokeRect(X(19),Y(22),X(10),Y(20));
    g.fillStyle=ink;g.textAlign='center';g.fillText('Cuộn',X(24),Y(30));g.fillText('relay',X(24),Y(35));
    line([[24,42],[24,52],[48,52]],on?PAL.amp:ink,2);
    // diode
    var dc=dio?ink:PAL.bad;line([[36,8],[36,23]],dc,2);line([[36,36],[36,52]],dc,2);
    g.fillStyle=PAL.surface;g.strokeStyle=dc;g.lineWidth=1.8;g.beginPath();g.moveTo(X(33.5),Y(36));g.lineTo(X(38.5),Y(36));g.lineTo(X(36),Y(29));g.closePath();g.fill();g.stroke();line([[33.5,28.2],[38.5,28.2]],dc,3);
    g.fillStyle=dio?PAL.volt:PAL.bad;g.textAlign='left';g.font='11px '+FONT;g.fillText(dio?'diode':'diode MẤT',X(40),Y(47));
    if(!dio){g.strokeStyle=PAL.bad;g.lineWidth=2;g.beginPath();g.moveTo(X(32),Y(26));g.lineTo(X(40),Y(38));g.moveTo(X(40),Y(26));g.lineTo(X(32),Y(38));g.stroke()}
    // transistor
    var tc=on?PAL.ok:ink;g.strokeStyle=ink;g.lineWidth=1.6;g.beginPath();g.arc(X(50),Y(66),Math.min(X(6.5),Y(8)),0,6.2832);g.stroke();
    line([[48,52],[48,57],[46.5,60]],tc,2.2);line([[46,57],[46,75]],tc,3.5);line([[46.5,72],[48,76],[48,84]],tc,2.2);
    // base wire + resistor
    line([[17,66],[22,66]],pin?PAL.ok:ink,2);g.fillStyle=PAL.soft;g.fillRect(X(22),Y(63),X(10),Y(6));g.strokeStyle=ink;g.lineWidth=1.4;g.strokeRect(X(22),Y(63),X(10),Y(6));line([[32,66],[46,66]],pin?PAL.ok:ink,2);
    g.fillStyle=ink;g.textAlign='center';g.font='11px '+FONT;g.fillText('R nền',X(27),Y(60));
    g.fillStyle=pin?PAL.ok:PAL.muted;g.font='600 11px '+FONT;g.fillText('Chip',X(9),Y(63));g.fillText(pin?'3,3 V':'0 V',X(9),Y(71));
    g.fillStyle=ink;g.font='11px '+FONT;g.fillText('B',X(43),Y(69));g.fillText('C',X(56),Y(55));g.fillText('E',X(56),Y(80));
    // ground
    line([[48,84],[48,88]],ink,2);line([[44,88],[52,88]],ink,2);line([[45.5,90.5],[50.5,90.5]],ink,2);line([[47,93],[49,93]],ink,2);
    // current dots
    if(on){g.fillStyle=PAL.amp;for(var i=0;i<8;i++){var u=((t*40+i*12.5)%100)/100,pp=[[24,8],[24,52],[48,52],[48,84]],L=0,k;var seg=[],tot=0;for(k=0;k<3;k++){var d=Math.hypot(pp[k+1][0]-pp[k][0],pp[k+1][1]-pp[k][1]);seg.push(d);tot+=d}var s0=u*tot;for(k=0;k<3;k++){if(s0<=seg[k]){var q=s0/seg[k];g.beginPath();g.arc(X(pp[k][0]+(pp[k+1][0]-pp[k][0])*q),Y(pp[k][1]+(pp[k+1][1]-pp[k][1])*q),2.5,0,6.2832);g.fill();break}s0-=seg[k]}}}
    // contacts
    g.fillStyle=ink;g.textAlign='center';g.font='600 11px '+FONT;g.fillText('Nguồn AC',X(66),Y(6));line([[66,9],[66,28]],ink,2);
    var cx=X(66),cy=Y(30),nx=X(90),ny=Y(14),ncx=X(90),ncy=Y(46);
    g.fillStyle=PAL.surface;[[cx,cy],[nx,ny],[ncx,ncy]].forEach(function(q){g.beginPath();g.arc(q[0],q[1],4,0,6.2832);g.fill();g.strokeStyle=ink;g.lineWidth=1.4;g.stroke()});
    g.fillStyle=ink;g.font='10.5px '+FONT;g.textAlign='right';g.fillText('COM',cx-8,cy+4);g.textAlign='center';g.fillText('NO',nx,ny-9);g.fillText('NC',ncx,ncy+16);
    var tx=ncx+(nx-ncx)*blade,ty=ncy+(ny-ncy)*blade;g.strokeStyle=on?PAL.ok:ink;g.lineWidth=3;g.beginPath();g.moveTo(cx,cy);g.lineTo(tx,ty);g.stroke();
    line([[93,14],[96,14]],on?PAL.ok:ink,2);
    // load fan
    var lx=X(88),ly=Y(70),r=Math.min(X(9),Y(10));g.strokeStyle=ink;g.lineWidth=1.6;g.beginPath();g.arc(lx,ly,r,0,6.2832);g.stroke();
    for(var b=0;b<3;b++){var a=fan+b*2.0944;g.strokeStyle=on?PAL.ok:PAL.muted;g.lineWidth=3;g.beginPath();g.moveTo(lx,ly);g.lineTo(lx+r*0.8*Math.cos(a),ly+r*0.8*Math.sin(a));g.stroke()}
    g.fillStyle=ink;g.font='11px '+FONT;g.textAlign='center';g.fillText('Tải (quạt)',lx,ly+r+14);
    line([[96,14],[96,58],[88,58],[88,ly-r]],on?PAL.ok:PAL.line,2);
    line([[88,ly+r+18],[88,95]],ink,1.2);
    g.font='10px '+FONT;g.fillStyle=PAL.muted;g.fillText('về N',X(88),Y(98));
    g.strokeStyle=PAL.volt;g.setLineDash([3,4]);g.lineWidth=1.5;g.beginPath();g.moveTo(X(29),Y(24));g.lineTo(cx,cy);g.stroke();g.setLineDash([]);
  }
  function vcAt(tt){
    // điện áp chân C (minh họa): relay hút -> gần 0, tắt -> 12 V, xung lúc tắt
    var st=hist.length?hist:[];var val=null,i;
    var state=false,last=-1e9;for(i=0;i<st.length;i++){if(st[i].t<=tt){state=st[i].on;last=st[i].t}else break}
    if(state)return 0.2;
    var dt=tt-last;if(last<-1e8||dt<0)return V;
    var amp=dio?0.9:45;return V+amp*Math.exp(-dt/0.12)*Math.min(1,dt/0.01);
  }
  function drawW(){
    gw.clearRect(0,0,ww,wh);var L=40,Rr=8,T=10,B=22,pw=ww-L-Rr,ph=wh-T-B,i;
    gw.font='10.5px '+FONT;gw.textAlign='right';gw.fillStyle=PAL.muted;gw.strokeStyle=PAL.line;gw.lineWidth=1;
    function Yv(v){return T+ph*(1-v/(V*6.2))}
    [0,12].forEach(function(v){gw.beginPath();gw.moveTo(L,Yv(v));gw.lineTo(L+pw,Yv(v));gw.stroke();gw.fillText(v+' V',L-4,Yv(v)+4)});
    gw.textAlign='center';gw.fillText('3 giây gần nhất',L+pw/2,wh-6);
    var win=3,tend=t,tst=t-win;gw.strokeStyle=PAL.volt;gw.lineWidth=2.2;gw.beginPath();
    for(i=0;i<=240;i++){var tt=tst+win*i/240,v=vcAt(tt);gw[i?'lineTo':'moveTo'](L+pw*i/240,Yv(v))}gw.stroke();
    var ytop=Yv(V*6.2);gw.fillStyle=PAL.muted;
  }
  function frame(dt){if(!g)return;t+=dt;
    if(on!==prevOn){hist.push({t:t,on:on});if(hist.length>40)hist.shift();prevOn=on}
    blade+=((on?1:0)-blade)*Math.min(1,dt*14);if(on)fan+=dt*9;draw();drawW()}
  function resize(){var a=fit(c,0.82);g=a.g;w=a.w;h=a.h;var b=fit(wc,0.42);gw=b.g;ww=b.w;wh=b.h;params();draw();drawW()}
  $('#rl-pin').addEventListener('click',function(){pin=!pin;params()});
  $('#rl-dio').addEventListener('click',function(){dio=!dio;params()});
  rbS.addEventListener('input',params);
  return {resize:resize,frame:frame};
})();

window.Labs={enter:function(id){show(labs[id]?id:curId)},leave:function(){cur=null}};
requestAnimationFrame(function(t){last=t;loop(t)});
})();
