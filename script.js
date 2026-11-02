/* Laboratory drawer. The Laboratories link also works without JavaScript (goes to the lab list on the home page). */
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded',function(){
  var root=document.documentElement,drawer=document.getElementById('lab-drawer'),overlay=document.getElementById('drawer-overlay'),closeBtn=document.getElementById('drawer-close'),menu=document.getElementById('nav-toggle'),last=null;
  var triggers=document.querySelectorAll('.lab-trigger');
  if(drawer&&overlay&&closeBtn){
    var setState=function(o){
      drawer.classList.toggle('open',o);overlay.classList.toggle('open',o);root.classList.toggle('drawer-open',o);
      drawer.setAttribute('aria-hidden',o?'false':'true');
      triggers.forEach(function(t){t.setAttribute('aria-expanded',o?'true':'false');});
    };
    var openDrawer=function(t){last=t;if(menu){menu.checked=false;}setState(true);setTimeout(function(){closeBtn.focus();},60);};
    var closeDrawer=function(){setState(false);if(last){last.focus();}};
    triggers.forEach(function(t){t.addEventListener('click',function(e){e.preventDefault();openDrawer(t);});});
    closeBtn.addEventListener('click',closeDrawer);
    overlay.addEventListener('click',closeDrawer);
    document.addEventListener('keydown',function(e){
      if(!drawer.classList.contains('open')){return;}
      if(e.key==='Escape'){closeDrawer();return;}
      if(e.key==='Tab'){
        var f=drawer.querySelectorAll('a[href],button'),first=f[0],end=f[f.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}
        else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}
      }
    });
  }
  /* subtle fade-in on scroll */
  var items=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.08});
    items.forEach(function(el){io.observe(el);});
  }else{items.forEach(function(el){el.classList.add('in');});}
  /* close the mobile menu after choosing a normal link */
  document.querySelectorAll('.nav a:not(.lab-trigger)').forEach(function(a){a.addEventListener('click',function(){if(menu){menu.checked=false;}});});
});
/* News & Events scroller. Order of use: 1) real items listed in news.js, 2) images found in the "News & Events" folder (works with VS Code Live Server), 3) placeholder cards. */
document.addEventListener('DOMContentLoaded',function(){
  var track=document.getElementById('news-track');
  if(!track){return;}
  var FOLDER='News & Events/';
  var win=track.parentNode,pv=document.getElementById('news-prev'),nx=document.getElementById('news-next');
  function by(d){win.scrollBy({left:d*250,behavior:'smooth'});}
  if(pv){pv.addEventListener('click',function(){by(-1);});}
  if(nx){nx.addEventListener('click',function(){by(1);});}
  var list=(typeof NEWS!=='undefined'&&NEWS.length)?NEWS:[];
  var real=list.filter(function(n){return n.image&&n.image.indexOf('your-photo')<0;});
  function card(n,clone){
    var a=document.createElement(n.link?'a':'div');a.className='ncard';
    if(n.link){a.href=n.link;}
    if(clone){a.setAttribute('aria-hidden','true');a.tabIndex=-1;}
    var img=document.createElement('img');img.src=encodeURI(n.image||'logo.jpeg');img.alt=clone?'':(n.title||'');
    img.onerror=function(){img.onerror=null;img.src='logo.jpeg';};
    var b=document.createElement('div');b.className='nbody';
    var t=document.createElement('span');t.className='ntag';t.textContent=(n.type||'News')+(n.date?' \u2022 '+n.date:'');
    var h=document.createElement('h4');h.textContent=n.title||'';
    var p=document.createElement('p');p.textContent=n.text||'';
    b.appendChild(t);b.appendChild(h);b.appendChild(p);a.appendChild(img);a.appendChild(b);return a;
  }
  function render(items){
    while(track.firstChild){track.removeChild(track.firstChild);}
    var sets=1;
    for(var s=0;s<sets;s++){items.forEach(function(n){track.appendChild(card(n,s>0));});}
  }
  if(real.length){render(real);return;}
  render(list);
  if(!window.fetch||!window.DOMParser){return;}
  fetch(encodeURI(FOLDER)).then(function(r){return r.ok?r.text():'';}).then(function(html){
    var doc=new DOMParser().parseFromString(html,'text/html'),found=[],seen={};
    doc.querySelectorAll('a').forEach(function(a){
      var href=a.getAttribute('href')||'',name=href.split('/').pop();
      try{name=decodeURIComponent(name);}catch(e){}
      if(/\.(jpe?g|png|webp|gif)$/i.test(name)&&!seen[name]){
        seen[name]=1;
        found.push({type:'News',date:'',title:name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' '),text:'',image:FOLDER+name,link:''});
      }
    });
    if(found.length){render(found);}
  }).catch(function(){});
});