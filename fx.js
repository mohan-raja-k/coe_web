/* ==========================================================================
   Nalanda Research Sanctum | VMKVEC  -  themes + motion (fx.js)
   Load in <head> AFTER style.css / fx.css. The site still works without it.
   - Theme switcher (saved in localStorage, circular-reveal where supported)
   - Splash, scroll progress, back-to-top, animated hero (particle network,
     word-by-word headline, parallax), staggered scroll reveals, counters,
     3D tilt + glare, magnetic buttons, smooth open/close for centre cards.
   Visitors who prefer reduced motion (or switch Effects off) get themes only.
   ========================================================================== */
(function(){
'use strict';
var root=document.documentElement;
var THEMES=[
  {id:'royal',   name:'Royal Gold', a:'#0b1f4d',b:'#f2b632',meta:'#0b1f4d'},
  {id:'midnight',name:'Midnight',   a:'#070c1b',b:'#7aa2ff',meta:'#070c1b'},
  {id:'emerald', name:'Emerald',    a:'#062b27',b:'#0f9d7a',meta:'#062b27'},
  {id:'sunset',  name:'Sunset',     a:'#2a0f3d',b:'#ff9f43',meta:'#2a0f3d'}
];
function mq(q){return !!(window.matchMedia&&window.matchMedia(q).matches);}
function get(k){try{return window.localStorage.getItem(k);}catch(e){return null;}}
function put(k,v){try{window.localStorage.setItem(k,v);}catch(e){}}
function el(t,c,x){var e=document.createElement(t);if(c){e.className=c;}if(x!==undefined){e.textContent=x;}return e;}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function raf(f){return window.requestAnimationFrame(f);}

var reduced=mq('(prefers-reduced-motion: reduce)');
var fine=mq('(hover: hover) and (pointer: fine)');
var theme=get('nrs-theme');
if(!THEMES.some(function(t){return t.id===theme;})){theme='royal';}
root.setAttribute('data-theme',theme);
var fxOn=!reduced&&get('nrs-fx')!=='off';
root.classList.add(fxOn?'fx':'fx-off');

/* ---- splash: first visit in this tab only ---- */
var t0=Date.now();
if(fxOn){
  var seen=true;
  try{seen=window.sessionStorage.getItem('nrs-splash')==='1';window.sessionStorage.setItem('nrs-splash','1');}catch(e){}
  if(!seen){root.classList.add('fx-splash-on');}
}
function hideSplash(){
  if(!root.classList.contains('fx-splash-on')){return;}
  setTimeout(function(){
    root.classList.add('fx-splash-out');
    setTimeout(function(){root.classList.remove('fx-splash-on','fx-splash-out');},900);
  },Math.max(0,1400-(Date.now()-t0)));
}
if(document.readyState==='complete'){hideSplash();}else{window.addEventListener('load',hideSplash);}
setTimeout(hideSplash,6000);

function ready(f){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',f);}else{f();}}

ready(function(){
  var header=document.querySelector('.site-header');
  var body=document.body;

  /* ---------- theme colour for mobile browser chrome ---------- */
  var meta=document.querySelector('meta[name="theme-color"]');
  if(!meta){meta=document.createElement('meta');meta.name='theme-color';document.head.appendChild(meta);}
  function metaColor(id){THEMES.forEach(function(t){if(t.id===id){meta.content=t.meta;}});}
  metaColor(theme);

  /* ---------- scroll progress + back to top ---------- */
  var bar=el('div','fx-progress');bar.setAttribute('aria-hidden','true');body.appendChild(bar);
  var C=138.23;
  var topBtn=el('button','fx-top');topBtn.type='button';topBtn.setAttribute('aria-label','Back to top');
  topBtn.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="bg" cx="24" cy="24" r="22" fill="none" stroke-width="3"/><circle class="fg" cx="24" cy="24" r="22" fill="none" stroke-width="3"/></svg><svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="transform:none"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  body.appendChild(topBtn);
  var fg=topBtn.querySelector('.fg'),ticking=false;
  function onScroll(){
    ticking=false;
    var y=window.pageYOffset||root.scrollTop,h=Math.max(1,root.scrollHeight-window.innerHeight),p=Math.min(1,Math.max(0,y/h));
    bar.style.transform='scaleX('+p.toFixed(4)+')';
    if(header){header.classList.toggle('fx-scrolled',y>8);}
    topBtn.classList.toggle('show',y>700);
    if(y<150){var act=document.querySelector('.nav a.fx-active');if(act){act.classList.remove('fx-active');}}
    fg.style.strokeDashoffset=(C*(1-p)).toFixed(2);
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;raf(onScroll);}},{passive:true});
  window.addEventListener('resize',onScroll);
  topBtn.addEventListener('click',function(){window.scrollTo({top:0,behavior:fxOn?'smooth':'auto'});});
  onScroll();

  /* ---------- theme dock ---------- */
  var dock=el('div','fx-dock');dock.setAttribute('role','group');dock.setAttribute('aria-label','Appearance');
  var dbtn=el('button','fx-dock-btn');dbtn.type='button';dbtn.setAttribute('aria-label','Change theme and effects');dbtn.setAttribute('aria-expanded','false');dbtn.setAttribute('aria-controls','fx-panel');
  dbtn.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.3-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4c0-4.4-4-8.2-9-8.2z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="10.5" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="7.5" r="1" fill="currentColor"/></svg>';
  var panel=el('div','fx-dock-panel');panel.id='fx-panel';
  panel.appendChild(el('div','fx-dh','Theme'));
  var sws=el('div','fx-swatches'),tname=el('span','fx-tname');tname.setAttribute('aria-live','polite');
  THEMES.forEach(function(t){
    var b=el('button','fx-sw');b.type='button';b.title=t.name;b.setAttribute('aria-label',t.name+' theme');b.setAttribute('data-id',t.id);
    b.style.setProperty('--a',t.a);b.style.setProperty('--b',t.b);
    b.addEventListener('click',function(e){
      var r=b.getBoundingClientRect();
      setTheme(t.id,e.clientX||r.left+r.width/2,e.clientY||r.top+r.height/2);
    });
    sws.appendChild(b);
  });
  panel.appendChild(sws);panel.appendChild(tname);
  var fxb=el('button','fx-fxbtn');fxb.type='button';fxb.setAttribute('aria-pressed',fxOn?'true':'false');
  fxb.innerHTML='<span>Animations &amp; effects</span><i aria-hidden="true"></i>';
  if(reduced){fxb.disabled=true;fxb.title='Your device asks for reduced motion';fxb.style.opacity='.55';fxb.style.cursor='not-allowed';}
  fxb.addEventListener('click',function(){put('nrs-fx',fxOn?'off':'on');window.location.reload();});
  panel.appendChild(fxb);
  dock.appendChild(dbtn);dock.appendChild(panel);body.appendChild(dock);
  function paintDock(){
    qa('.fx-sw',sws).forEach(function(b){var on=b.getAttribute('data-id')===theme;b.setAttribute('aria-pressed',on?'true':'false');if(on){tname.textContent=b.title;}});
  }
  function setTheme(id,x,y){
    if(id===theme){return;}
    function apply(){theme=id;root.setAttribute('data-theme',id);put('nrs-theme',id);metaColor(id);paintDock();window.dispatchEvent(new Event('nrs-theme'));}
    if(fxOn&&document.startViewTransition){
      root.style.setProperty('--vt-x',x+'px');root.style.setProperty('--vt-y',y+'px');
      document.startViewTransition(apply);
    }else{
      root.classList.add('fx-theming');apply();
      setTimeout(function(){root.classList.remove('fx-theming');},750);
    }
  }
  function toggleDock(o){dock.classList.toggle('open',o);dbtn.setAttribute('aria-expanded',o?'true':'false');}
  dbtn.addEventListener('click',function(e){e.stopPropagation();toggleDock(!dock.classList.contains('open'));});
  document.addEventListener('click',function(e){if(dock.classList.contains('open')&&!dock.contains(e.target)){toggleDock(false);}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dock.classList.contains('open')){toggleDock(false);dbtn.focus();}});
  paintDock();

  if(!fxOn){return;}   /* everything below is motion */

  /* ---------- hero: orbs, particle network, headline, parallax ---------- */
  var hero=document.querySelector('.hero');
  if(hero){
    ['o1','o2','o3'].forEach(function(c){var o=el('div','fx-orb '+c);o.setAttribute('aria-hidden','true');hero.insertBefore(o,hero.firstChild);});
    var h1=hero.querySelector('h1');
    if(h1&&!h1.querySelector('.fx-w')){
      var txt=h1.textContent.trim().replace(/\s+/g,' ');
      h1.setAttribute('aria-label',txt);h1.textContent='';
      txt.split(' ').forEach(function(w,i){
        var o=el('span','fx-w'),n=el('span','fx-wi',w);o.setAttribute('aria-hidden','true');n.style.setProperty('--i',i);
        o.appendChild(n);h1.appendChild(o);h1.appendChild(document.createTextNode(' '));
      });
    }
    network(hero);
    if(fine){
      var tx=0,ty=0,px=0,py=0,running=false;
      var loop=function(){
        px+=(tx-px)*.07;py+=(ty-py)*.07;
        hero.style.setProperty('--px',px.toFixed(4));hero.style.setProperty('--py',py.toFixed(4));
        if(Math.abs(tx-px)>.0008||Math.abs(ty-py)>.0008){raf(loop);}else{running=false;}
      };
      var kick=function(){if(!running){running=true;raf(loop);}};
      hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;kick();});
      hero.addEventListener('pointerleave',function(){tx=0;ty=0;kick();});
    }
  }
  function network(host){
    var c=el('canvas','fx-canvas');c.setAttribute('aria-hidden','true');host.insertBefore(c,host.firstChild);
    var ctx=c.getContext&&c.getContext('2d');if(!ctx){return;}
    var w=0,h=0,pts=[],mouse={x:-9999,y:-9999},live=false,id=0,dot='255,255,255',lnk='242,182,50';
    function colours(){var s=getComputedStyle(root);dot=(s.getPropertyValue('--fx-dot')||dot).trim();lnk=(s.getPropertyValue('--fx-link')||lnk).trim();}
    function mk(){return{x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.38,vy:(Math.random()-.5)*.38,r:Math.random()*1.7+.7};}
    function size(){
      var r=host.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
      w=r.width;h=r.height;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.round(Math.min(95,Math.max(22,w*h/15500)));
      while(pts.length<n){pts.push(mk());}pts.length=n;
    }
    function frame(){
      id=0;if(!live){return;}
      ctx.clearRect(0,0,w,h);
      var i,j,p,q,dx,dy,d,L=125;
      for(i=0;i<pts.length;i++){
        p=pts[i];p.x+=p.vx;p.y+=p.vy;
        if(p.x<-10){p.x=w+10;}else if(p.x>w+10){p.x=-10;}
        if(p.y<-10){p.y=h+10;}else if(p.y>h+10){p.y=-10;}
        dx=p.x-mouse.x;dy=p.y-mouse.y;d=Math.sqrt(dx*dx+dy*dy);
        if(d<150&&d>0){var f=(150-d)/150*.9;p.x+=dx/d*f;p.y+=dy/d*f;}
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.2832);ctx.fillStyle='rgba('+dot+',.78)';ctx.fill();
        for(j=i+1;j<pts.length;j++){
          q=pts[j];dx=p.x-q.x;dy=p.y-q.y;d=dx*dx+dy*dy;
          if(d<L*L){ctx.strokeStyle='rgba('+lnk+','+((1-Math.sqrt(d)/L)*.42).toFixed(3)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
        }
        dx=p.x-mouse.x;dy=p.y-mouse.y;d=Math.sqrt(dx*dx+dy*dy);
        if(d<170){ctx.strokeStyle='rgba('+lnk+','+((1-d/170)*.75).toFixed(3)+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();}
      }
      id=raf(frame);
    }
    function start(){if(!live){live=true;if(!id){id=raf(frame);}}}
    function stop(){live=false;}
    host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
    host.addEventListener('pointerleave',function(){mouse.x=-9999;mouse.y=-9999;});
    window.addEventListener('resize',size);
    window.addEventListener('nrs-theme',colours);
    document.addEventListener('visibilitychange',function(){if(document.hidden){stop();}else if(vis){start();}});
    var vis=true;
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!document.hidden){start();}else{stop();}},{threshold:0}).observe(host);}
    colours();size();start();
  }

  /* ---------- staggered scroll reveals ---------- */
  var SEL='.card,.cbox,.fac,.mis,.gal figure,.shot,.grp,.lab,.theme,.vision,.news,.fx-stat,.tagline,.eq>li,.tags>li';
  var items=qa(SEL).filter(function(n){return !n.closest('.hero,.cb,.cb-panel,.fx-dock,.drawer');});
  items.forEach(function(n){
    n.classList.add('fx-item');
    if(n.matches('.tags>li')){n.classList.add('fx-pill');}
    else if(n.matches('.eq>li')){n.classList.add('fx-row');}
  });
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      var vis=es.filter(function(e){return e.isIntersecting;}).sort(function(a,b){
        var ra=a.boundingClientRect,rb=b.boundingClientRect;return (Math.round(ra.top/40)-Math.round(rb.top/40))||(ra.left-rb.left);
      });
      vis.forEach(function(e,i){e.target.style.setProperty('--d',Math.min(i,9)*75+'ms');e.target.classList.add('fx-in');io.unobserve(e.target);});
    },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
    items.forEach(function(n){io.observe(n);});
  }else{items.forEach(function(n){n.classList.add('fx-in');});}

  /* vision statement: word-by-word */
  var vp=document.querySelector('.vision p');
  if(vp&&!vp.querySelector('.fx-vw')){
    var words=vp.textContent.trim().split(/\s+/);vp.setAttribute('aria-label',words.join(' '));vp.textContent='';
    words.forEach(function(w,i){var s=el('span','fx-vw',w);s.setAttribute('aria-hidden','true');s.style.setProperty('--i',i);vp.appendChild(s);vp.appendChild(document.createTextNode(' '));});
  }

  /* ---------- counters ---------- */
  var counters=qa('[data-count]');
  function count(n,end){
    var d=1900,s=null;
    function step(ts){
      if(s===null){s=ts;}
      var p=Math.min(1,(ts-s)/d),e=p===1?1:1-Math.pow(2,-10*p);
      n.textContent=String(Math.round(end*e));
      if(p<1){raf(step);}else{n.classList.add('fx-done');}
    }
    raf(step);
  }
  if(counters.length&&'IntersectionObserver' in window){
    counters.forEach(function(n){n.textContent='0';});
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){count(e.target,parseInt(e.target.getAttribute('data-count'),10)||0);co.unobserve(e.target);}});},{threshold:.6});
    counters.forEach(function(n){co.observe(n);});
  }

  /* ---------- tilt + glare, magnetic buttons, ripples (mouse devices) ---------- */
  qa('.cbox').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');});
  });
  if(fine){
    qa('.feat,.fac,.mis,.card:not(.feat),.gal figure,.shot,.fx-stat').forEach(function(c){
      if(c.closest('.hero,.cb,.cb-panel,.news')){return;}
      c.classList.add('fx-tilt');
      var max=c.classList.contains('fx-stat')?3:7;
      c.addEventListener('pointermove',function(e){
        if(e.pointerType==='touch'){return;}
        var r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
        c.style.setProperty('--mx',x+'px');c.style.setProperty('--my',y+'px');
        c.style.transform='perspective(900px) rotateX('+((.5-y/r.height)*2*max).toFixed(2)+'deg) rotateY('+((x/r.width-.5)*2*max).toFixed(2)+'deg) translateY(-6px) scale(1.012)';
      });
      c.addEventListener('pointerleave',function(){c.style.transform='';});
    });
    qa('.btn').forEach(function(b){
      b.addEventListener('pointermove',function(e){
        var r=b.getBoundingClientRect();
        b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px)';
      });
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });
    /* soft light that follows the cursor */
    var glow=el('div','fx-glow');glow.setAttribute('aria-hidden','true');body.appendChild(glow);
    var gx=-999,gy=-999,cx=-999,cy=-999,gOn=false;
    (function gl(){cx+=(gx-cx)*.12;cy+=(gy-cy)*.12;glow.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0)';raf(gl);})();
    document.addEventListener('pointermove',function(e){if(!gOn){gOn=true;cx=gx=e.clientX;cy=gy=e.clientY;glow.classList.add('on');}gx=e.clientX;gy=e.clientY;},{passive:true});
    document.documentElement.addEventListener('pointerleave',function(){glow.classList.remove('on');gOn=false;});
  }
  document.addEventListener('pointerdown',function(e){
    var b=e.target.closest&&e.target.closest('.btn');if(!b){return;}
    var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2,rp=el('span','fx-rip');
    rp.style.width=rp.style.height=s+'px';rp.style.left=(e.clientX-r.left)+'px';rp.style.top=(e.clientY-r.top)+'px';
    b.appendChild(rp);setTimeout(function(){if(rp.parentNode){rp.parentNode.removeChild(rp);}},800);
  });

  /* ---------- centre cards: smooth height animation ---------- */
  qa('.cbox').forEach(function(d){
    qa('.cb .tags li, .cb .eqs li',d).forEach(function(li,i){li.style.setProperty('--i',i);});
    var s=d.querySelector('summary'),b=d.querySelector('.cb');if(!s||!b||!b.animate){return;}
    var anim=null;
    function clean(){b.style.overflow='';b.style.height='';anim=null;}
    s.addEventListener('click',function(e){
      e.preventDefault();
      var opening=!d.open||(anim&&anim.closing);
      if(anim){anim.cancel();clean();}
      if(opening){
        d.open=true;b.style.overflow='hidden';
        var hh=b.offsetHeight;
        anim=b.animate([{height:'0px'},{height:hh+'px'}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)'});
        anim.onfinish=clean;anim.oncancel=clean;
      }else{
        var h0=b.offsetHeight;b.style.overflow='hidden';
        anim=b.animate([{height:h0+'px'},{height:'0px'}],{duration:340,easing:'cubic-bezier(.4,0,.2,1)'});
        anim.closing=true;
        anim.onfinish=function(){d.open=false;clean();};anim.oncancel=clean;
      }
    });
  });

  /* ---------- scroll spy for the main menu ---------- */
  var links={};
  qa('.nav a[href*="#"]').forEach(function(a){var h=a.getAttribute('href'),k=h.slice(h.indexOf('#')+1);if(k){links[k]=a;}});
  var onIndex=!!document.getElementById('about');
  if(onIndex&&'IntersectionObserver' in window){
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting&&links[e.target.id]){qa('.nav a.fx-active').forEach(function(a){a.classList.remove('fx-active');});links[e.target.id].classList.add('fx-active');}
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(links).forEach(function(k){var s=document.getElementById(k);if(s){so.observe(s);}});
  }

  /* ---------- fade between pages ---------- */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey){return;}
    if(a.target&&a.target!=='_self'){return;}
    if(a.hasAttribute('download')){return;}
    var u;try{u=new URL(a.href,location.href);}catch(x){return;}
    if(u.origin!==location.origin||!/\.html?$|\/$/.test(u.pathname)){return;}
    if(u.pathname===location.pathname){return;}
    e.preventDefault();root.classList.add('fx-leaving');
    setTimeout(function(){window.location.href=a.href;},260);
  });
  window.addEventListener('pageshow',function(){root.classList.remove('fx-leaving');});
});
})();
/* ==========================================================================
   COLOUR BOOST - extras (floating shapes in every section; "Explore other
   centres" strip on the centre pages). Part of fx.js - no extra files needed.
   ========================================================================== */
(function(){
'use strict';
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function el(t,c,x){var e=document.createElement(t);if(c){e.className=c;}if(x!==undefined){e.textContent=x;}return e;}
function init(){
  /* 1. floating shapes behind the content of each section */
  var kinds=['s-ring','s-plus','s-tri','s-sq','s-dot','s-ring','s-plus','s-dot'],cols=['var(--ac1)','var(--ac3)','var(--ac2)','var(--ac4)'];
  qa('main .sec').forEach(function(sec,n){
    var box=el('div','vx-shapes');box.setAttribute('aria-hidden','true');
    for(var i=0;i<7;i++){
      var s=el('i',kinds[(i+n)%kinds.length]);
      s.style.left=(3+Math.random()*92)+'%';s.style.top=(5+Math.random()*88)+'%';
      s.style.setProperty('--kc',cols[(i+n)%cols.length]);
      s.style.setProperty('--z',(20+Math.random()*30).toFixed(0)+'px');
      s.style.setProperty('--d',(18+Math.random()*22).toFixed(0)+'s');
      s.style.animationDelay=(-Math.random()*20).toFixed(1)+'s';
      box.appendChild(s);
    }
    sec.insertBefore(box,sec.firstChild);
  });

  /* 2. "Explore other centres" strip on centre pages (before the footer) */
  var footer=document.querySelector('.site-footer'),links=qa('.site-footer .fl a');
  if(!document.querySelector('.crumb')||!footer||!links.length){return;}
  var META={'rehabilitation':['\uD83E\uDDBE','CREAT'],'semiconductor':['\uD83D\uDD0C','CSPDT'],'manufacturing':['\uD83D\uDEE0\uFE0F','CAM3D'],
    'ev-battery':['\uD83D\uDD0B','CEBT'],'bioengineering':['\uD83E\uDDEC','CBE'],'drug-discovery':['\uD83D\uDC8A','CD3'],
    'web-development':['\uD83D\uDCBB','Web CoE'],'iot':['\uD83D\uDCE1','IoT CoE'],'smart-agriculture':['\uD83C\uDF31','CSACC'],'drone':['\uD83D\uDE81','Drone CoE']};
  var strip=el('section','vx-strip'),wrap=el('div','wrap'),view=el('div','vx-view'),track=el('div','vx-track');
  wrap.appendChild(el('p','eyebrow','KEEP EXPLORING'));wrap.appendChild(el('h2',null,'Explore other centres'));
  [0,1].forEach(function(copy){
    links.forEach(function(a){
      var m=a.getAttribute('href').match(/([^\/]+)\.html/),slug=m?m[1]:'',meta=META[slug]||['\uD83D\uDD2C',a.textContent.slice(0,14)];
      var p=el('a','vx-pill');p.href=a.getAttribute('href');
      p.appendChild(el('b',null,meta[0]));p.appendChild(document.createTextNode(meta[1]));p.title=a.textContent;
      if(location.pathname.indexOf('/'+slug+'/')>-1){p.className+=' cur';p.setAttribute('aria-current','page');}
      if(copy){p.tabIndex=-1;p.setAttribute('aria-hidden','true');}
      track.appendChild(p);
    });
  });
  view.appendChild(track);wrap.appendChild(view);strip.appendChild(wrap);
  footer.parentNode.insertBefore(strip,footer);
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();