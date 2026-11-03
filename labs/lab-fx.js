/* ==========================================================================
   Nalanda Research Sanctum | VMKVEC  -  LAB PAGES ENHANCER (lab-fx.js)
   ONE file for all 10 centre pages. It injects its own CSS, so nothing else
   is needed. Each page just loads it with:
       <script src="../lab-fx.js" defer></script>

   What it adds
   - Per-centre accent colours + emoji badge (auto-detected from the folder)
   - Hero: floating glow orbs, mouse spotlight, orbiting badge, animated wave
   - Animated counters (research areas / equipment / photos)
   - Giant section numbers, staggered scroll-in for tags, cards, equipment
   - Numbered gradient cards with cursor spotlight + growing accent bar
   - Equipment grid with tick icons and a live search box
   - Gallery: hover overlay + full-screen lightbox (click, arrows, Esc, swipe)
   - Animated gradient border on the contact card
   - Floating section dots (right edge) that follow your scroll
   Works with the existing themes (Royal / Midnight / Emerald / Sunset) and
   respects "reduced motion". Delete the script tag to switch it all off.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 0. Only run on a centre page ---------- */
  var doc = document, root = doc.documentElement;
  function qa(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function q1(s, r) { return (r || doc).querySelector(s); }
  function el(t, c, x) { var e = doc.createElement(t); if (c) { e.className = c; } if (x !== undefined) { e.textContent = x; } return e; }
  function mq(s) { return !!(window.matchMedia && window.matchMedia(s).matches); }

  /* slug -> [accent, accent 2, emoji, short label] */
  var LABS = {
    'rehabilitation':    ['#db2777', '#f59e0b', '\uD83E\uDDBE', 'Rehab'],
    'semiconductor':     ['#0891b2', '#6366f1', '\uD83D\uDD0C', 'Chips'],
    'manufacturing':     ['#ea580c', '#facc15', '\uD83D\uDEE0\uFE0F', 'Make'],
    'ev-battery':        ['#16a34a', '#84cc16', '\uD83D\uDD0B', 'EV'],
    'bioengineering':    ['#9333ea', '#ec4899', '\uD83E\uDDEC', 'Bio'],
    'drug-discovery':    ['#0284c7', '#14b8a6', '\uD83D\uDC8A', 'Drug'],
    'web-development':   ['#2563eb', '#06b6d4', '\uD83D\uDCBB', 'Web'],
    'iot':               ['#0d9488', '#3b82f6', '\uD83D\uDCE1', 'IoT'],
    'smart-agriculture': ['#65a30d', '#eab308', '\uD83C\uDF31', 'Agri'],
    'drone':             ['#4f46e5', '#38bdf8', '\uD83D\uDE81', 'Drone']
  };

  function init() {
    if (!q1('.crumb') || !q1('.hero')) { return; }           /* not a centre page */
    var m = location.pathname.match(/\/labs\/([^\/]+)\//);
    var slug = m ? m[1] : '';
    var L = LABS[slug] || ['#2f5bea', '#f2b632', '\uD83D\uDD2C', 'Lab'];
    var reduced = mq('(prefers-reduced-motion: reduce)');
    var fine = mq('(hover: hover) and (pointer: fine)');

    var hex = L[0].replace('#', '');
    var rgb = parseInt(hex.substr(0, 2), 16) + ',' + parseInt(hex.substr(2, 2), 16) + ',' + parseInt(hex.substr(4, 2), 16);
    root.style.setProperty('--lx-a', L[0]);
    root.style.setProperty('--lx-b', L[1]);
    root.style.setProperty('--lx-rgb', rgb);
    root.classList.add('lx-on');
    if (reduced) { root.classList.add('lx-reduced'); }

    injectCSS();
    buildHero(L, reduced, fine);
    decorate();
    buildFilter();
    setupReveal(reduced);
    setupGallery();
    setupDots();
    setupCardSpotlight(fine);
  }

  /* ======================================================================
     1. CSS
     ====================================================================== */
  function injectCSS() {
    var css = `
html.lx-on{--lx-grad:linear-gradient(135deg,var(--lx-a),var(--lx-b))}

/* ---------- hero ---------- */
.lx-on .hero{padding:76px 0 112px;position:relative;overflow:hidden;isolation:isolate}
.lx-on .hero .wrap{position:relative;z-index:2}
.lx-on .hero h1{max-width:820px;text-shadow:0 4px 30px rgba(0,0,0,.25)}
.lx-on .hero .eyebrow{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);padding:6px 14px 6px 12px;border-radius:99px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.lx-on .hero .eyebrow::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--lx-b);box-shadow:0 0 0 0 rgba(255,255,255,.6);animation:lxPulse 2s infinite}
.lx-on .hero .lead{border-left:3px solid var(--lx-b);padding-left:16px;animation:lxFadeR .9s .35s cubic-bezier(.2,.8,.2,1) backwards}
.lx-on .hero .btn{border-radius:99px;position:relative;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.25)}
.lx-bg{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.lx-orb{position:absolute;border-radius:50%;filter:blur(60px);opacity:.5;mix-blend-mode:screen;will-change:transform}
.lx-orb.o1{width:420px;height:420px;left:-120px;top:-140px;background:var(--lx-a);animation:lxDrift1 16s ease-in-out infinite alternate}
.lx-orb.o2{width:360px;height:360px;right:-80px;bottom:-120px;background:var(--lx-b);animation:lxDrift2 19s ease-in-out infinite alternate}
.lx-orb.o3{width:220px;height:220px;left:46%;top:10%;background:var(--lx-a);opacity:.28;animation:lxDrift3 13s ease-in-out infinite alternate}
.lx-grid{position:absolute;inset:-40px;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:44px 44px;-webkit-mask-image:radial-gradient(ellipse at 30% 40%,#000 10%,transparent 72%);mask-image:radial-gradient(ellipse at 30% 40%,#000 10%,transparent 72%);animation:lxGrid 14s linear infinite}
.lx-spot{position:absolute;inset:0;background:radial-gradient(520px circle at var(--lx-hx,30%) var(--lx-hy,30%),rgba(255,255,255,.14),transparent 62%);transition:background .08s}
.lx-spark{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff;opacity:0;animation:lxSpark var(--d,6s) var(--s,0s) infinite ease-in-out}
.lx-wave{position:absolute;left:0;right:0;bottom:-1px;height:64px;z-index:1;background:var(--page,#fff);-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 60' preserveAspectRatio='none'%3E%3Cpath d='M0 30C150 60 300 0 450 30S750 60 900 30 1050 0 1200 30V60H0Z'/%3E%3C/svg%3E") repeat-x 0 100%/1200px 100%;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 60' preserveAspectRatio='none'%3E%3Cpath d='M0 30C150 60 300 0 450 30S750 60 900 30 1050 0 1200 30V60H0Z'/%3E%3C/svg%3E") repeat-x 0 100%/1200px 100%;animation:lxWave 14s linear infinite}
.lx-wave.w2{opacity:.45;height:78px;animation-duration:22s;animation-direction:reverse}

/* orbiting badge */
.lx-badge{position:absolute;right:24px;top:50%;width:190px;height:190px;margin-top:-95px;z-index:1;display:none;transform:translate(calc(var(--px,0)*18px),calc(var(--py,0)*18px));transition:transform .25s ease-out;pointer-events:none}
.lx-badge .core{position:absolute;inset:26px;border-radius:50%;display:grid;place-items:center;font-size:62px;background:linear-gradient(145deg,rgba(255,255,255,.22),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 18px 50px rgba(0,0,0,.35),inset 0 0 30px rgba(255,255,255,.12)}
.lx-badge .core span{display:block;animation:lxFloat 4.5s ease-in-out infinite;filter:drop-shadow(0 8px 12px rgba(0,0,0,.35))}
.lx-badge .ring{position:absolute;inset:0;border-radius:50%;border:2px dashed rgba(255,255,255,.35);animation:lxSpin 22s linear infinite}
.lx-badge .ring::after{content:"";position:absolute;top:-7px;left:50%;margin-left:-7px;width:14px;height:14px;border-radius:50%;background:var(--lx-b);box-shadow:0 0 18px 4px var(--lx-b)}
.lx-badge .ring.r2{inset:-18px;border-width:1px;border-style:solid;border-color:rgba(255,255,255,.16);animation-duration:34s;animation-direction:reverse}
.lx-badge .ring.r2::after{background:#fff;box-shadow:0 0 14px 3px rgba(255,255,255,.7);width:10px;height:10px;margin-left:-5px;top:-5px}
@media(min-width:1020px){.lx-badge{display:block}}

/* stat chips */
.lx-stats{display:flex;flex-wrap:wrap;gap:14px;margin:26px 0 0}
.lx-stat{display:flex;align-items:center;gap:12px;padding:12px 20px 12px 14px;border-radius:16px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:lxPop .8s cubic-bezier(.2,.9,.3,1.3) backwards;animation-delay:calc(var(--i,0)*120ms + 500ms);transition:transform .25s,background .25s}
.lx-stat:hover{transform:translateY(-4px);background:rgba(255,255,255,.16)}
.lx-stat i{font-style:normal;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:20px;background:var(--lx-grad);box-shadow:0 6px 16px rgba(var(--lx-rgb),.45)}
.lx-stat b{display:block;font:700 1.55rem/1 Georgia,serif;color:#fff}
.lx-stat span{display:block;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:#cfe0f7;margin-top:3px}
.lx-stat[hidden]{display:none!important}

/* buttons: shine */
.lx-on .btn::after{content:"";position:absolute;top:0;left:-70%;width:50%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-20deg);transition:left .6s}
.lx-on .btn:hover::after{left:130%}
.lx-on .btn.dark{position:relative;overflow:hidden;border-radius:99px;box-shadow:0 6px 16px rgba(11,31,77,.2)}
.lx-arr{display:inline-block;transition:transform .3s}
.lx-on .btn:hover .lx-arr.l{transform:translateX(-6px)}
.lx-on .btn:hover .lx-arr.r{transform:translateX(6px)}

/* ---------- sections ---------- */
.lx-on main>.sec{position:relative;overflow:hidden}
.lx-on main>.sec>.wrap{position:relative;z-index:1}
.lx-num{position:absolute;right:3%;top:10px;font:800 clamp(7rem,16vw,13rem)/1 Georgia,serif;color:transparent;-webkit-text-stroke:2px rgba(var(--lx-rgb),.13);pointer-events:none;user-select:none;z-index:0;animation:lxNum 9s ease-in-out infinite alternate}
.lx-on main>.sec h2{position:relative;padding-bottom:.35em}
.lx-on main>.sec h2::after{content:"";position:absolute;left:0;bottom:0;height:4px;width:72px;border-radius:4px;background:var(--lx-grad);animation:lxBar 3.2s ease-in-out infinite alternate}
.lx-on main>.sec .eyebrow:not(.light){display:inline-block;background:var(--lx-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:var(--lx-a)}
.lx-on .lead2{position:relative}

/* tags */
.lx-on .tags li{border-radius:99px;border:1px solid rgba(var(--lx-rgb),.5);position:relative;overflow:hidden;cursor:default;transition:transform .25s,box-shadow .25s,color .25s,border-color .25s}
.lx-on .tags li::before{content:"";position:absolute;inset:0;background:var(--lx-grad);transform:translateY(101%);transition:transform .3s cubic-bezier(.2,.8,.2,1);z-index:-1}
.lx-on .tags li{z-index:0}
.lx-on .tags li:hover{color:#fff;transform:translateY(-3px) scale(1.04);box-shadow:0 10px 22px rgba(var(--lx-rgb),.32);border-color:transparent}
.lx-on .tags li:hover::before{transform:translateY(0)}

/* cards */
.lx-on .grid .card{position:relative;overflow:hidden;border-radius:18px;border-color:rgba(var(--lx-rgb),.18);padding:28px 26px 26px;
  background-image:radial-gradient(280px circle at var(--lx-x,-999px) var(--lx-y,-999px),rgba(var(--lx-rgb),.14),transparent 62%),linear-gradient(90deg,var(--lx-a),var(--lx-b));
  background-repeat:no-repeat;background-size:100% 100%,0% 4px;background-position:0 0,0 0;
  transition:background-size .5s cubic-bezier(.2,.8,.2,1),transform .3s,box-shadow .3s,border-color .3s}
.lx-on .grid .card:hover{background-size:100% 100%,100% 4px;border-color:rgba(var(--lx-rgb),.55);box-shadow:0 18px 40px rgba(var(--lx-rgb),.2)}
.lx-on .card h3.lx-n{display:inline-grid;place-items:center;width:52px;height:52px;border-radius:16px;margin:0 0 14px;font:700 1.15rem Georgia,serif;color:#fff;background:var(--lx-grad);box-shadow:0 8px 20px rgba(var(--lx-rgb),.4);transition:transform .5s cubic-bezier(.3,1.6,.5,1)}
.lx-on .card:hover h3.lx-n{transform:rotate(-8deg) scale(1.12)}

/* equipment */
.lx-filter{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:22px 0 4px}
.lx-filter label{position:relative;flex:1 1 260px;max-width:420px}
.lx-filter input{width:100%;font:inherit;padding:12px 16px 12px 44px;border-radius:99px;border:1.5px solid rgba(var(--lx-rgb),.35);background:var(--card,#fff);color:var(--ink,#141b3a);transition:border-color .2s,box-shadow .2s}
.lx-filter input:focus{outline:none;border-color:var(--lx-a);box-shadow:0 0 0 4px rgba(var(--lx-rgb),.18)}
.lx-filter label::before{content:"";position:absolute;left:17px;top:50%;width:11px;height:11px;margin-top:-8px;border:2px solid var(--lx-a);border-radius:50%}
.lx-filter label::after{content:"";position:absolute;left:29px;top:50%;width:2px;height:7px;margin-top:2px;background:var(--lx-a);transform:rotate(-45deg);border-radius:2px}
.lx-cnt{font-size:.9rem;font-weight:600;color:var(--muted,#55607f)}
.lx-none{margin:18px 0 0;padding:16px 20px;border-radius:14px;background:rgba(var(--lx-rgb),.08);color:var(--muted,#55607f);font-weight:600}
.lx-on .eqs{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px!important}
.lx-on .eqs li{position:relative;font-size:.95rem!important;font-weight:600;padding:14px 16px 14px 54px!important;border-radius:14px;border:1px solid rgba(var(--lx-rgb),.2)!important;background:var(--card,#fff)!important;color:var(--ink,#141b3a);box-shadow:0 2px 10px rgba(11,31,77,.05);overflow:hidden;transition:transform .28s,box-shadow .28s,border-color .28s,padding .28s}
.lx-on .eqs li::before{content:"\\2713";position:absolute;left:14px;top:50%;margin-top:-15px;width:30px;height:30px;border-radius:10px;display:grid;place-items:center;font-size:.95rem;font-weight:800;color:#fff;background:var(--lx-grad);box-shadow:0 5px 12px rgba(var(--lx-rgb),.35);transition:transform .4s cubic-bezier(.3,1.7,.5,1)}
.lx-on .eqs li::after{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--lx-grad);transform:scaleY(0);transform-origin:top;transition:transform .3s}
.lx-on .eqs li:hover{transform:translateX(6px);border-color:rgba(var(--lx-rgb),.6)!important;box-shadow:0 12px 26px rgba(var(--lx-rgb),.2)}
.lx-on .eqs li:hover::before{transform:rotate(360deg) scale(1.1)}
.lx-on .eqs li:hover::after{transform:scaleY(1)}
.lx-on .eqs li mark{background:rgba(var(--lx-rgb),.22);color:inherit;border-radius:4px;padding:0 2px}
.lx-hide{display:none!important}

/* gallery */
.lx-on .gal{gap:22px!important}
.lx-on .gal figure{position:relative;border-radius:18px!important;border-color:rgba(var(--lx-rgb),.2)!important;transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.lx-on .gal figure:hover{box-shadow:0 22px 46px rgba(var(--lx-rgb),.28)}
.lx-on .gal figure a{position:relative;cursor:zoom-in;overflow:hidden}
.lx-on .gal figure a::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(var(--lx-rgb),.55));opacity:0;transition:opacity .3s;z-index:1}
.lx-on .gal figure a::after{content:"\\2922";position:absolute;right:14px;bottom:12px;z-index:2;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-size:1.1rem;color:#fff;background:var(--lx-grad);opacity:0;transform:scale(.4) rotate(-90deg);transition:opacity .3s,transform .4s cubic-bezier(.3,1.6,.5,1)}
.lx-on .gal figure:hover a::before{opacity:1}
.lx-on .gal figure:hover a::after{opacity:1;transform:none}
.lx-on .gal figcaption{background:linear-gradient(90deg,transparent,rgba(var(--lx-rgb),.08),transparent)}

/* lightbox */
.lx-lb{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(6,10,24,.9);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:24px}
.lx-lb.open{display:flex;animation:lxFade .3s}
.lx-lb figure{margin:0;max-width:min(1100px,92vw);text-align:center}
.lx-lb img{max-width:100%;max-height:78vh;margin:0 auto;background:#fff;border-radius:14px;padding:12px;box-shadow:0 30px 80px rgba(0,0,0,.6);animation:lxZoom .45s cubic-bezier(.2,.9,.3,1.2)}
.lx-lb figcaption{color:#fff;margin-top:16px;font-weight:600;font-size:1.05rem}
.lx-lb figcaption small{display:block;opacity:.7;font-weight:400;margin-top:4px}
.lx-lb button{position:absolute;border:0;cursor:pointer;color:#fff;width:48px;height:48px;border-radius:50%;font-size:1.5rem;background:rgba(255,255,255,.12);transition:background .2s,transform .2s}
.lx-lb button:hover{background:var(--lx-a);transform:scale(1.1)}
.lx-lb .x{top:20px;right:20px}.lx-lb .p{left:20px;top:50%;margin-top:-24px}.lx-lb .n{right:20px;top:50%;margin-top:-24px}

/* contact: travelling gradient border */
.lx-on .card.contact{border:2px solid transparent;border-radius:20px;
  background-image:linear-gradient(var(--card,#fff),var(--card,#fff)),linear-gradient(90deg,var(--lx-a),var(--lx-b),var(--lx-a));
  background-origin:border-box;background-clip:padding-box,border-box;background-repeat:no-repeat,repeat-x;background-size:100% 100%,200% 100%;
  animation:lxBorder 5s linear infinite}
.lx-on .card.contact:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(var(--lx-rgb),.25)}
.lx-on .contact a{color:var(--lx-a);font-weight:700;text-decoration:none;background:linear-gradient(var(--lx-a),var(--lx-a)) 0 100%/0 2px no-repeat;transition:background-size .3s}
.lx-on .contact a:hover{background-size:100% 2px}

/* footer links */
.lx-on .site-footer li a{display:inline-block;transition:transform .2s,color .2s}
.lx-on .site-footer li a:hover{transform:translateX(5px)}

/* dots */
.lx-dots{position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:40;display:none;flex-direction:column;gap:12px}
@media(min-width:1100px){.lx-dots{display:flex}}
.lx-dots a{position:relative;width:12px;height:12px;border-radius:50%;background:rgba(var(--lx-rgb),.28);border:2px solid transparent;transition:transform .25s,background .25s;display:block}
.lx-dots a:hover{transform:scale(1.35);background:rgba(var(--lx-rgb),.6)}
.lx-dots a.on{background:var(--lx-grad);transform:scale(1.5);box-shadow:0 0 0 4px rgba(var(--lx-rgb),.2)}
.lx-dots a span{position:absolute;right:26px;top:50%;transform:translate(8px,-50%);white-space:nowrap;font-size:.75rem;font-weight:700;letter-spacing:.06em;padding:5px 11px;border-radius:99px;background:var(--lx-grad);color:#fff;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}
.lx-dots a:hover span{opacity:1;transform:translate(0,-50%)}

/* ---------- scroll reveal (animation only, so tilt/hover transforms still work) ---------- */
.lx-r:not(.lx-v){opacity:0}
.lx-v.lx-up{animation:lxUp .75s cubic-bezier(.2,.8,.2,1) backwards;animation-delay:var(--lxd,0ms)}
.lx-v.lx-pop{animation:lxPop .6s cubic-bezier(.2,.9,.3,1.35) backwards;animation-delay:var(--lxd,0ms)}
.lx-v.lx-l{animation:lxFadeR .8s cubic-bezier(.2,.8,.2,1) backwards;animation-delay:var(--lxd,0ms)}

/* ---------- keyframes ---------- */
@keyframes lxPulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,.55)}70%{box-shadow:0 0 0 12px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}
@keyframes lxDrift1{to{transform:translate(160px,90px) scale(1.2)}}
@keyframes lxDrift2{to{transform:translate(-190px,-70px) scale(1.15)}}
@keyframes lxDrift3{to{transform:translate(-120px,110px) scale(1.4)}}
@keyframes lxGrid{to{background-position:44px 44px}}
@keyframes lxSpark{0%,100%{opacity:0;transform:translateY(0) scale(.5)}50%{opacity:.9;transform:translateY(-40px) scale(1.4)}}
@keyframes lxWave{to{-webkit-mask-position:-1200px 100%;mask-position:-1200px 100%}}
@keyframes lxSpin{to{transform:rotate(360deg)}}
@keyframes lxFloat{0%,100%{transform:translateY(-6px) rotate(-3deg)}50%{transform:translateY(8px) rotate(4deg)}}
@keyframes lxPop{from{opacity:0;transform:translateY(18px) scale(.7)}to{opacity:1;transform:none}}
@keyframes lxUp{from{opacity:0;transform:translateY(38px)}to{opacity:1;transform:none}}
@keyframes lxFadeR{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}
@keyframes lxNum{from{transform:translateY(-8px)}to{transform:translateY(14px)}}
@keyframes lxBar{from{width:56px}to{width:150px}}
@keyframes lxBorder{to{background-position:0 0,200% 0}}
@keyframes lxFade{from{opacity:0}to{opacity:1}}
@keyframes lxZoom{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}

/* ---------- small screens + reduced motion ---------- */
@media(max-width:700px){
  .lx-on .hero{padding:52px 0 92px}
  .lx-num{font-size:6rem;right:2%}
  .lx-stat{padding:10px 14px 10px 10px}
  .lx-orb{filter:blur(46px)}
}
html.lx-reduced .lx-r:not(.lx-v){opacity:1}
@media(prefers-reduced-motion:reduce){
  .lx-on *,.lx-on *::before,.lx-on *::after,.lx-lb,.lx-lb *{animation:none!important;transition:none!important}
  .lx-r:not(.lx-v){opacity:1}
}
`;
    var st = el('style'); st.id = 'lx-style'; st.textContent = css; doc.head.appendChild(st);
  }

  /* ======================================================================
     2. Hero extras
     ====================================================================== */
  function buildHero(L, reduced, fine) {
    var hero = q1('.hero'), wrap = q1('.wrap', hero);
    var bg = el('div', 'lx-bg'); bg.setAttribute('aria-hidden', 'true');
    bg.appendChild(el('div', 'lx-grid'));
    ['o1', 'o2', 'o3'].forEach(function (c) { bg.appendChild(el('div', 'lx-orb ' + c)); });
    var spot = el('div', 'lx-spot'); bg.appendChild(spot);
    for (var i = 0; i < 14; i++) {
      var s = el('span', 'lx-spark');
      s.style.left = (4 + Math.random() * 92) + '%';
      s.style.top = (10 + Math.random() * 75) + '%';
      s.style.setProperty('--d', (4 + Math.random() * 5).toFixed(1) + 's');
      s.style.setProperty('--s', (Math.random() * 5).toFixed(1) + 's');
      bg.appendChild(s);
    }
    hero.insertBefore(bg, hero.firstChild);
    hero.appendChild(el('div', 'lx-wave w2'));
    hero.appendChild(el('div', 'lx-wave'));

    /* orbiting emoji badge */
    var b = el('div', 'lx-badge'); b.setAttribute('aria-hidden', 'true');
    b.appendChild(el('div', 'ring r2')); b.appendChild(el('div', 'ring'));
    var core = el('div', 'core'); core.appendChild(el('span', null, L[2])); b.appendChild(core);
    wrap.appendChild(b);

    /* stat chips */
    var areas = qa('main .tags li').length;
    var eq = qa('.eqs li').length;
    var stats = el('div', 'lx-stats');
    function chip(icon, label, n, i, hidden) {
      var c = el('div', 'lx-stat'); c.style.setProperty('--i', i);
      var ic = el('i', null, icon), box = el('div'), num = el('b', null, '0'), lab = el('span', null, label);
      num.setAttribute('data-to', n); box.appendChild(num); box.appendChild(lab);
      c.appendChild(ic); c.appendChild(box); if (hidden) { c.hidden = true; }
      stats.appendChild(c); return c;
    }
    chip('\uD83C\uDFAF', 'Research areas', areas, 0);
    chip('\u2699\uFE0F', 'Equipment items', eq, 1);
    var photoChip = chip('\uD83D\uDCF8', 'Equipment photos', 0, 2, true);
    wrap.appendChild(stats);

    function count(node, to) {
      var from = parseInt(node.textContent, 10) || 0;
      if (reduced) { node.textContent = to; return; }
      var t0 = null, dur = 1300;
      function step(t) {
        if (t0 === null) { t0 = t; }
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(from + (to - from) * e);
        if (p < 1) { requestAnimationFrame(step); }
      }
      requestAnimationFrame(step);
    }
    setTimeout(function () { qa('b[data-to]', stats).forEach(function (n) { count(n, +n.getAttribute('data-to')); }); }, 650);

    /* gallery count comes later (images are discovered asynchronously) */
    var gal = q1('#gal');
    if (gal && window.MutationObserver) {
      var last = 0, tm = 0;
      new MutationObserver(function () {
        clearTimeout(tm);
        tm = setTimeout(function () {
          var n = qa('figure', gal).length;
          if (n && n !== last) { last = n; photoChip.hidden = false; photoChip.style.setProperty('--i', 2); count(q1('b', photoChip), n); }
        }, 120);
      }).observe(gal, { childList: true });
    }

    /* mouse spotlight + badge parallax */
    if (fine && !reduced) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        spot.style.setProperty('--lx-hx', (x * 100) + '%'); spot.style.setProperty('--lx-hy', (y * 100) + '%');
        b.style.setProperty('--px', (x - 0.5).toFixed(3)); b.style.setProperty('--py', (y - 0.5).toFixed(3));
      });
    }
  }

  /* ======================================================================
     3. Small DOM touches (numbers, badges, arrows)
     ====================================================================== */
  function decorate() {
    /* giant section numbers */
    var secs = qa('main > section.sec'), n = 0;
    secs.forEach(function (s) {
      if (s.id === 'contact') { return; }
      n++;
      var big = el('div', 'lx-num', (n < 10 ? '0' : '') + n); big.setAttribute('aria-hidden', 'true');
      s.insertBefore(big, s.firstChild);
    });
    /* 01 / 02 / 03 inside cards -> gradient badges */
    qa('.grid .card h3').forEach(function (h) { if (/^\d{1,2}$/.test(h.textContent.trim())) { h.classList.add('lx-n'); } });
    /* arrows in the Previous / Next buttons */
    qa('.btn.dark, .btn.ghost').forEach(function (a) {
      var t = a.textContent;
      if (t.indexOf('\u2190') > -1) { a.innerHTML = ''; a.appendChild(el('span', 'lx-arr l', '\u2190')); a.appendChild(doc.createTextNode(t.replace('\u2190', ''))); }
      else if (t.indexOf('\u2192') > -1) { a.innerHTML = ''; a.appendChild(doc.createTextNode(t.replace('\u2192', ''))); a.appendChild(el('span', 'lx-arr r', '\u2192')); }
    });
  }

  /* ======================================================================
     4. Equipment search box
     ====================================================================== */
  function buildFilter() {
    var list = q1('.eqs'); if (!list) { return; }
    var items = qa('li', list);
    if (items.length < 6) { return; }
    var orig = items.map(function (li) { return li.textContent; });
    var box = el('div', 'lx-filter'), lab = el('label'), inp = el('input'), cnt = el('span', 'lx-cnt');
    inp.type = 'search'; inp.placeholder = 'Search equipment\u2026'; inp.setAttribute('aria-label', 'Search equipment'); inp.autocomplete = 'off';
    lab.appendChild(inp); box.appendChild(lab); box.appendChild(cnt);
    var none = el('p', 'lx-none', 'No equipment matches your search.'); none.hidden = true;
    list.parentNode.insertBefore(box, list); list.parentNode.insertBefore(none, list.nextSibling);
    function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
    function run() {
      var v = inp.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (li, i) {
        li.classList.add('lx-v');                      /* make sure nothing stays invisible */
        var t = orig[i], k = v ? t.toLowerCase().indexOf(v) : 0;
        if (v && k < 0) { li.classList.add('lx-hide'); li.textContent = t; return; }
        li.classList.remove('lx-hide'); shown++;
        if (v) { li.innerHTML = esc(t.slice(0, k)) + '<mark>' + esc(t.slice(k, k + v.length)) + '</mark>' + esc(t.slice(k + v.length)); }
        else { li.textContent = t; }
      });
      none.hidden = shown > 0;
      cnt.textContent = v ? shown + ' of ' + items.length + ' shown' : items.length + ' items';
    }
    inp.addEventListener('input', run); run();
  }

  /* ======================================================================
     5. Scroll reveal with stagger
     ====================================================================== */
  function setupReveal(reduced) {
    if (reduced || !('IntersectionObserver' in window)) { return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lx-v'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    function mark(nodes, kind, step) {
      nodes.forEach(function (n, i) {
        if (n.classList.contains('lx-r')) { return; }
        n.classList.add('lx-r', kind); n.style.setProperty('--lxd', Math.min(i, 14) * step + 'ms');
        io.observe(n);
      });
    }
    mark(qa('main .tags li'), 'lx-pop', 55);
    mark(qa('main .grid .card'), 'lx-up', 130);
    mark(qa('main .eqs li'), 'lx-l', 45);
    mark(qa('main .card.contact'), 'lx-up', 0);
    mark(qa('main .btn.dark'), 'lx-pop', 120);
    var gal = q1('#gal');
    if (gal && window.MutationObserver) {
      new MutationObserver(function () { mark(qa('figure', gal), 'lx-up', 110); }).observe(gal, { childList: true });
    }
    setTimeout(function () { qa('.lx-r:not(.lx-v)').forEach(function (n) { if (n.getBoundingClientRect().top < window.innerHeight * 1.2) { n.classList.add('lx-v'); } }); }, 2500);
  }

  /* ======================================================================
     6. Cursor spotlight on cards
     ====================================================================== */
  function setupCardSpotlight(fine) {
    if (!fine) { return; }
    doc.addEventListener('mousemove', function (e) {
      var c = e.target.closest ? e.target.closest('.grid .card') : null;
      if (!c) { return; }
      var r = c.getBoundingClientRect();
      c.style.setProperty('--lx-x', (e.clientX - r.left) + 'px'); c.style.setProperty('--lx-y', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ======================================================================
     7. Gallery lightbox
     ====================================================================== */
  function setupGallery() {
    var gal = q1('#gal'); if (!gal) { return; }
    var lb = el('div', 'lx-lb'); lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
    var fig = el('figure'), img = el('img'), cap = el('figcaption');
    var bx = el('button', 'x', '\u00d7'), bp = el('button', 'p', '\u2039'), bn = el('button', 'n', '\u203a');
    bx.type = bp.type = bn.type = 'button';
    bx.setAttribute('aria-label', 'Close'); bp.setAttribute('aria-label', 'Previous photo'); bn.setAttribute('aria-label', 'Next photo');
    fig.appendChild(img); fig.appendChild(cap);
    [fig, bx, bp, bn].forEach(function (n) { lb.appendChild(n); });
    doc.body.appendChild(lb);
    var idx = 0, opener = null;
    function figs() { return qa('figure', gal); }
    function show(i) {
      var f = figs(); if (!f.length) { return; }
      idx = (i + f.length) % f.length;
      var im = q1('img', f[idx]), c = q1('figcaption', f[idx]);
      img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
      img.src = im.src; img.alt = im.alt; cap.innerHTML = ''; cap.appendChild(doc.createTextNode(c ? c.textContent : ''));
      cap.appendChild(el('small', null, (idx + 1) + ' / ' + f.length));
    }
    function open(i) { opener = doc.activeElement; show(i); lb.classList.add('open'); doc.body.style.overflow = 'hidden'; bx.focus(); }
    function close() { lb.classList.remove('open'); doc.body.style.overflow = ''; if (opener && opener.focus) { opener.focus(); } }
    gal.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) { return; }
      var a = e.target.closest && e.target.closest('a'); if (!a) { return; }
      var f = a.parentNode; e.preventDefault(); open(figs().indexOf(f));
    });
    bx.addEventListener('click', close);
    bp.addEventListener('click', function () { show(idx - 1); });
    bn.addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) { close(); } });
    doc.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) { return; }
      if (e.key === 'Escape') { close(); } else if (e.key === 'ArrowLeft') { show(idx - 1); } else if (e.key === 'ArrowRight') { show(idx + 1); }
    });
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) { show(idx + (dx < 0 ? 1 : -1)); } }, { passive: true });
  }

  /* ======================================================================
     8. Floating section dots
     ====================================================================== */
  function setupDots() {
    var nav = el('nav', 'lx-dots'); nav.setAttribute('aria-label', 'Sections'); doc.body.appendChild(nav);
    var io = null;
    function build() {
      nav.innerHTML = ''; if (io) { io.disconnect(); }
      var secs = qa('main > section.sec').filter(function (s) { return !s.hidden; }), links = [];
      secs.forEach(function (s) {
        var eb = q1('.eyebrow', s), name = eb ? eb.textContent.toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); }) : 'Section';
        var a = el('a'); a.href = '#'; a.setAttribute('aria-label', name); a.appendChild(el('span', null, name));
        a.addEventListener('click', function (e) { e.preventDefault(); s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        nav.appendChild(a); links.push(a);
      });
      if (!('IntersectionObserver' in window)) { return; }
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var i = secs.indexOf(e.target); links.forEach(function (l, j) { l.classList.toggle('on', i === j); }); } });
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(function (s) { io.observe(s); });
    }
    build();
    var g = q1('#gallery');
    if (g && window.MutationObserver) { new MutationObserver(build).observe(g, { attributes: true, attributeFilter: ['hidden'] }); }
  }

  if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', init); } else { init(); }
})();