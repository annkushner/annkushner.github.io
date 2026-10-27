/* ============================================
   ПОРТФОЛИО — интерактив
   ============================================ */
(function () {
  "use strict";

  /* ---------- Язык: определение и переключение ---------- */
  var STORAGE_KEY = "portfolio-lang";
  var LANGS = ["ru", "en"];

  function detectLang() {
    // 1. Явно сохранённый выбор пользователя
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}

    // 2. Язык браузера: ru → русский, всё остальное → английский
    var navLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    return navLang.indexOf("ru") === 0 ? "ru" : "en";
  }

  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);
    var currentLabel = document.querySelector("[data-lang-current]");
    if (currentLabel) currentLabel.textContent = lang.toUpperCase();
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.setAttribute("aria-checked", String(btn.getAttribute("data-lang-btn") === lang));
    });
    // Обновляем title документа
    var titleEl = document.querySelector("title[data-i18n-title-" + lang + "]");
    if (titleEl) {
      document.title = titleEl.getAttribute("data-i18n-title-" + lang);
    }
    // Обновляем meta description
    var descEl = document.querySelector("meta[name='description']");
    if (descEl) {
      var descVal = descEl.getAttribute("data-i18n-desc-" + lang);
      if (descVal) descEl.setAttribute("content", descVal);
    }
  }

  var currentLang = detectLang();
  applyLang(currentLang);

  // Компактное меню выбора языка в шапке.
  var langMenu = document.querySelector("[data-lang-menu]");
  var langTrigger = langMenu && langMenu.querySelector(".lang__trigger");
  var langOptions = langMenu && langMenu.querySelector(".lang__menu");
  function closeLangMenu() {
    if (!langOptions) return;
    langOptions.hidden = true;
    langTrigger.setAttribute("aria-expanded", "false");
  }
  if (langTrigger && langOptions) {
    langTrigger.addEventListener("click", function () {
      var opening = langOptions.hidden;
      langOptions.hidden = !opening;
      langTrigger.setAttribute("aria-expanded", String(opening));
    });
    langOptions.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang-btn");
        if (lang !== currentLang) {
          currentLang = lang;
          try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
          applyLang(lang);
        }
        closeLangMenu();
        langTrigger.focus();
      });
    });
    document.addEventListener("click", function (event) {
      if (!langMenu.contains(event.target)) closeLangMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeLangMenu();
    });
  }

  /* ---------- Текущий год в подвале ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Навигация: тень при скролле ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 10) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var links = document.querySelector(".nav__links");
  var menuLinks = links ? links.querySelectorAll("a") : [];

  function closeMenu() {
    burger.classList.remove("open");
    links.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (burger && links) {
    burger.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      burger.classList.toggle("open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Закрытие по клику на пункт
    menuLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Закрытие по Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) closeMenu();
    });
  }

  /* ---------- Анимации появления (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Лёгкая каскадная задержка для проектов
            var grid = entry.target.closest(".projects__grid");
            if (grid) {
              var siblings = Array.prototype.slice.call(grid.children);
              var idx = siblings.indexOf(entry.target);
              entry.target.style.transitionDelay = idx * 80 + "ms";
            }
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // Фолбэк: показать всё сразу
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Лайтбокс: увеличение картинок в кейсах ---------- */
  var lightboxSelectors = ".p-gallery img, .p-figure img, .p-cover img";
  var lightboxImgs = document.querySelectorAll(lightboxSelectors);

  if (lightboxImgs.length) {
    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.innerHTML =
      '<button class="lightbox__close" aria-label="Закрыть">&times;</button>' +
      '<img class="lightbox__img" src="" alt="" />';
    document.body.appendChild(overlay);

    var lightboxImg = overlay.querySelector(".lightbox__img");
    var closeBtn = overlay.querySelector(".lightbox__close");

    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    lightboxImgs.forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        openLightbox(img.src, img.alt);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });
    lightboxImg.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeLightbox();
    });
  }
})();

/* Self-contained footer physics: no network dependency or shared animation state. */
(function () {
  'use strict';
  const area = document.querySelector('.footer-glass');
  if (!area) return;
  const style = document.createElement('style');
  style.id = 'footer-glass-styles';
  style.textContent = '/* Footer glass playground — isolated from the career ladder and page cards. */\n.contact .footer-glass {\n  position:relative;height:380px;width:100%;overflow:hidden;\n  margin-top:36px;isolation:isolate;touch-action:pan-y;\n  background:radial-gradient(ellipse at 50% 115%,rgba(121,72,235,.16),transparent 65%);\n}\n.contact:has(.footer-glass) {padding-bottom:0;}\n.footer-glass__cube {\n  position:absolute;left:0;top:0;display:grid;place-items:center;\n  --glass-rgb:169,105,255;\n  border-radius:24%;border:1px solid rgba(var(--glass-rgb),.85);\n  color:#f6efff;font-family:inherit;font-size:22px;line-height:1;font-weight:650;\n  background:linear-gradient(135deg,rgba(255,255,255,.55),rgba(var(--glass-rgb),.22) 24%,rgba(var(--glass-rgb),.52) 65%,rgba(var(--glass-rgb),.68));\n  box-shadow:inset 1px 1px 2px rgba(255,255,255,.8),inset -2px -3px 5px rgba(var(--glass-rgb),.55),inset 0 0 12px rgba(var(--glass-rgb),.3),0 5px 10px #0006;\n  text-shadow:0 1px 4px #44217480;pointer-events:none;user-select:none;\n}\n.footer-glass__cube::before {content:"";position:absolute;inset:4px;border:1px solid #eadbff38;border-radius:21%;background:linear-gradient(150deg,#fff3,transparent 40%,#ae75ff18);}\n.footer-glass__cube::after {content:"";position:absolute;top:5px;left:22%;width:45%;height:2px;border-radius:50%;background:#fff9;filter:blur(.5px);}\n.footer-glass__cube:nth-child(3n) {background-color:rgba(var(--glass-rgb),.18);}\n.footer-glass__cube:nth-child(7n) {background-color:rgba(var(--glass-rgb),.12);}\n.footer-glass__cube span {position:relative;display:grid;place-items:center;width:55%;height:55%;}\n.footer-glass__cube svg {display:block;width:100%;height:100%;overflow:visible;}\n@media(max-width:600px){.contact .footer-glass{height:300px;margin-top:24px}.footer-glass__cube{font-size:18px;}}\n\n/* The text and glass share one stage; glass travels behind the contact content. */\n.contact:has(.footer-glass) {\n  position:relative;isolation:isolate;overflow:hidden;background:#0c0c0e;\n  min-height:720px;padding-top:90px;padding-bottom:260px;\n}\n.contact .contact__text {position:relative;z-index:2;pointer-events:none;}\n.contact .contact__text a,.contact .contact__text button {pointer-events:auto;}\n.contact .contact__text::before {\n  content:"";position:absolute;inset:-40px -70px;z-index:-1;pointer-events:none;\n  background:radial-gradient(ellipse,rgba(12,12,14,.30),rgba(12,12,14,.10) 60%,transparent 76%);\n}\n.contact .footer-glass {\n  position:absolute;inset:0;width:100%;height:100%;margin:0;z-index:0;pointer-events:none;\n}\n@media(max-width:600px){\n  .contact:has(.footer-glass){min-height:740px;padding-top:64px;padding-bottom:230px;}\n  .contact .footer-glass{height:100%;margin:0;}\n  .contact .contact__text::before{inset:-25px -20px;}\n}\n';
  style.textContent += '\n.footer-glass__cube{animation:none!important;transition:none!important;}';
  style.textContent += `
.contact:has(.footer-glass){min-height:820px;padding-bottom:350px;}
@media(max-width:600px){.contact:has(.footer-glass){min-height:880px;padding-bottom:350px;}}
.footer-glass__cube{pointer-events:auto;cursor:grab;touch-action:none;}
.footer-glass__cube.is-held{cursor:grabbing;z-index:5;filter:brightness(1.15);}
.footer-idea-box{position:absolute;pointer-events:none;z-index:3;border:1px solid #cbb8ff9c;border-top:0;border-radius:0 0 24px 24px;background:linear-gradient(135deg,#d9c9ff32,#8050ff18);box-shadow:inset 0 -8px 24px #9873ff35,0 12px 24px #0004;color:white;text-align:center;display:flex;flex-direction:column;justify-content:center;font-family:inherit;}
.footer-idea-box::before{content:'';position:absolute;top:-8px;left:-4px;right:-4px;height:16px;border:2px solid #e4d8ffb0;border-radius:50%;background:#b599ff12;}
.footer-idea-box__count{font-size:38px;line-height:1.1;font-weight:650;}
.footer-idea-box__label{font-size:11px;opacity:.7;margin-top:5px;}
.footer-game-tip{position:absolute;color:#eee9ffb3;font:inherit;font-size:13px;line-height:1.5;max-width:210px;pointer-events:none;z-index:3;}
.footer-game-score{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}
`;
  style.textContent += `
.contact .socials a[title="Telegram" i]{--social-brand:#26a5e4;}
.contact .socials a[title="Behance" i]{--social-brand:#1769ff;}
.contact .socials a[title="Dribbble" i]{--social-brand:#ea4c89;}
.contact .socials a[title="LinkedIn" i]{--social-brand:#0a66c2;}
.contact .socials a:hover,.contact .socials a:focus-visible{color:var(--social-brand,#fff);}
`;
  document.head.appendChild(style);
  area.closest('.contact').querySelector('.contact__inner').classList.add('contact__text');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const icons = {
    cursor: '<path d="m6 3 13 10-7 1-3 7Z"/>',
    research: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    flow: '<rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>',
    component: '<path d="m12 2 5 5-5 5-5-5Zm-6 7 5 5-5 5-5-5Zm12 0 5 5-5 5-5-5Zm-6 7 5 5-5 5-5-5Z" transform="translate(2 0) scale(.83)"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    wireframe: '<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 8h20M9 8v13m3-9h7m-7 4h5"/>',
    prototype: '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="m10 8 5 4-5 4Z"/>',
    interview: '<path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-6a8 8 0 0 1-1-5 9 9 0 0 1 18 0Z"/><path d="M7 10h10m-10 4h6"/>',
    analytics: '<path d="M3 3v18h19M7 16v-5m5 5V6m5 10v-8"/>',
    sliders: '<path d="M3 6h8m6 0h4M3 12h3m6 0h9M3 18h11m6 0h1"/><circle cx="14" cy="6" r="3"/><circle cx="9" cy="12" r="3"/><circle cx="17" cy="18" r="3"/>',
    toggle: '<rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="15" cy="12" r="3"/>',
    heart: '<path d="M12 21 3 12C-3 5 7-1 12 6c5-7 15-1 9 6Z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
    layers: '<path d="m12 2 10 6-10 6L2 8Zm-10 11 10 6 10-6M2 18l10 5 10-5"/>',
    idea: '<path d="M8 16c0-3-3-4-3-8a7 7 0 0 1 14 0c0 4-3 5-3 8Zm1 4h6m-5 3h4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    accessibility: '<circle cx="12" cy="4" r="2"/><path d="m3 8 9 2 9-2m-9 2v5m0 0-5 7m5-7 5 7"/>'
  };
  const symbols = ['UX', 'research', 'UI', 'flow', 'AI', 'component', 'grid', 'cursor',
    'wireframe', '{ }', 'prototype', 'interview', 'A/B', 'analytics', 'sliders',
    'toggle', 'heart', 'check', 'layers', 'idea', 'target', 'accessibility', 'Aa', '↗'];
  let bodies = [], width = 0, height = 0, frame = 0, last = 0, accumulator = 0;
  let visible = false, movingUntil = 0;
  let socialZone = null;
  const pointer = { x: -1000, y: -1000, active: false };
  let interacting = false;
  let box = null, scoreNode = null, live = null, score = 0, held = null, samples = [], activePointer = null, touchGesture = null;
  const gameTip=document.createElement('div');gameTip.className='footer-game-message';
  renderGameTip();
  gameTip.style.cssText='margin:48px auto 0;max-width:400px;font:inherit;font-size:16px;line-height:1.5;color:#ddd6ec;text-align:center;';
  area.closest('.contact').querySelector('.contact__inner').append(gameTip);
  const scoreKey = 'anna-portfolio-ideas-score-v1';
  try {score = Math.max(0,parseInt(localStorage.getItem(scoreKey),10)||0);}catch(e){}
  area.removeAttribute('aria-hidden');
  function words(ru,en){return document.documentElement.lang==='en'?en:ru;}
  function renderGameTip(){
    gameTip.innerHTML='<span style="display:block;font-weight:600;line-height:1.5">'+words(
      'Пока думаете, над чем поработаем,<br>накидайте мне задач в корзинку.',
      'While you’re thinking about what we could work on,<br>toss a few design tasks into my basket.'
    )+'</span><small style="display:block;margin:10px auto 0;max-width:330px;font-size:13px;font-weight:400;line-height:1.5;color:#aaa4b6">'+words(
      'Потяните и подбросьте кубик, чтобы попасть в корзинку.',
      'Drag and toss a cube to land it in the basket.'
    )+'</small>';
  }

  function announce(){if(scoreNode)scoreNode.textContent=String(score);if(live)live.textContent=words('Задач в корзинке: ','Tasks collected: ')+score;}
  function makeBox(){
    const mobile=width<=600,w=mobile?90:108;
    const left=mobile?(width-w)/2:width-w-Math.max(88,width*.04);
    box={left,right:left+w,y:height-350,bottom:height-232};
    const target=document.createElement('div');target.className='footer-idea-box';
    target.style.cssText=`left:${box.left}px;top:${box.y}px;width:${w}px;height:118px`;
    scoreNode=document.createElement('span');scoreNode.className='footer-idea-box__count';
    const label=document.createElement('span');label.className='footer-idea-box__label';label.textContent=words('задач в корзинке','tasks collected');target.append(scoreNode,label);area.append(target);
    renderGameTip();
    live=document.createElement('span');live.className='footer-game-score';live.setAttribute('aria-live','polite');area.append(live);announce();
  }
  new MutationObserver(()=>{
    const label=area.querySelector('.footer-idea-box__label');
    if(label)label.textContent=words('задач в корзинке','tasks collected');
    renderGameTip();
  }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  function hit(b,oldY){
    if(!box||b===held||b.scoring||b.vy<0)return false;
    const extent=b.r*(Math.abs(Math.cos(b.a))+Math.abs(Math.sin(b.a)));
    const insideX=x=>x-extent>box.left+3 && x+extent<box.right-3;
    // Catch descending entries as well as cubes released inside the opening.
    // No arbitrary minimum speed or travel distance can invalidate a visible hit.
    if(b.y>=box.y && b.y<=box.bottom-b.r && insideX(b.x))return true;
    if(oldY<box.y && b.y>=box.y){
      const t=(box.y-oldY)/(b.y-oldY);
      return insideX(b.px+(b.x-b.px)*t);
    }
    return false;
  }
  function collect(b){
    b.scoring=true;b.sleep=true;b.thrown=false;b.el.style.opacity='0';b.el.style.visibility='hidden';
    score++;try{localStorage.setItem(scoreKey,String(score));}catch(e){}announce();
    setTimeout(()=>{
      if(!bodies.includes(b))return;
      b.x=b.r+10;b.y=height-220;b.vx=1.5;b.vy=0;b.va=.012;b.sleep=false;b.scoring=false;b.el.style.opacity='1';b.el.style.visibility='visible';
      interacting=true;movingUntil=performance.now()+6000;wake();
    },450);
  }
  function paint() {
    bodies.forEach(b => { b.el.style.transform = `translate3d(${b.x-b.r}px,${b.y-b.r}px,0) rotate(${b.a}rad)`; });
  }
  function build() {
    const previousWidth = width, previousHeight = height;
    width = area.clientWidth; height = area.clientHeight;
    if (!width) return;
    if (bodies.length && Math.abs(width - previousWidth) < 1 && Math.abs(height - previousHeight) < 1) return;
    const socials = area.closest('.contact').querySelector('.socials');
    const stageRect = area.getBoundingClientRect();
    const rect = socials ? socials.getBoundingClientRect() : null;
    socialZone = rect ? {left:rect.left-stageRect.left-20,right:rect.right-stageRect.left+20,bottom:Math.max(rect.bottom,gameTip.getBoundingClientRect().bottom)-stageRect.top+30} : null;
    held=null;activePointer=null;area.replaceChildren(); bodies = [];
    makeBox();
    const mobile = width <= 600, count = Math.min(mobile ? 32 : 96, Math.max(26, Math.round(width / 13)));
    const columns = Math.max(1, Math.floor(width / (mobile ? 52 : 74)));
    for (let i = 0; i < count; i++) {
      const size = mobile ? 30 + Math.random()*10 : 42 + Math.random()*16;
      const el = document.createElement('div'); el.className = 'footer-glass__cube';
      const rgb = ['169,105,255','96,176,255','115,208,160','255,183,105','238,128,185','193,180,255'][i % 6];
      el.style.setProperty('--glass-rgb', rgb);
      el.style.background = `linear-gradient(135deg,rgba(255,255,255,.65),rgba(${rgb},.48) 24%,rgba(${rgb},.72) 65%,rgba(${rgb},.88))`;
      el.style.borderColor = `rgba(${rgb},.95)`;
      const label = document.createElement('span');
      const symbol = symbols[i % symbols.length];
      if (icons[symbol]) {
        label.innerHTML = '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + icons[symbol] + '</svg>';
      } else label.textContent = symbol;
      const textScale=symbol==='A/B'||symbol==='{ }'?.29:symbol==='↗'?.45:.38;
      label.style.cssText='display:flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box;width:'+(icons[symbol]?'64%':'80%')+';height:64%;white-space:nowrap;font-size:'+Math.min(22,size*textScale)+'px;line-height:1;letter-spacing:0;';
      el.append(label);
      const svg = label.querySelector('svg');
      if (svg) {
        svg.style.cssText = 'display:block;width:100%;height:100%;overflow:visible;color:#fff;fill:none;stroke:#fff;stroke-width:1.8';
        svg.querySelectorAll('path,circle,rect').forEach(shape => {
          shape.style.stroke = '#fff'; shape.style.fill = 'none';
        });
      }
      el.setAttribute('aria-hidden','true');
      el.style.width = el.style.height = size + 'px'; area.append(el);
      bodies.push({el,r:size/2,x:(i%columns+.5)*width/columns+(Math.random()-.5)*20,y:height-50-Math.floor(i/columns)*(mobile ? 66 : 98),a:(Math.random()-.5)*.45,vx:0,vy:0,va:0,flight:0});
    }
    // Form a natural pile before it is ever shown; no startup animation.
    for(let i=0;i<300;i++) step(false);
    bodies.forEach(b=>{b.vx=0;b.vy=0;b.va=0;b.flight=0;b.sleep=true;b.quiet=0;});
    cancelAnimationFrame(frame);frame=0;movingUntil=0;interacting=false;
    paint();
  }
  function mobileRange() { return width < 600 ? 95 : 135; }
  function step(interact) {
    bodies.forEach(b => {
      b.px=b.x;b.py=b.y;b.pa=b.a;
      if(interact && (b.sleep||b===held||b.scoring))return;
      b.flight=Math.max(0,b.flight-1);
      b.supported=false;
      b.vy+=.095;b.vx*=.992;b.vy*=.997;b.va*=.955;
      b.vx=Math.max(-10,Math.min(10,b.vx));b.vy=Math.max(-25,Math.min(15,b.vy));
      b.x+=b.vx;b.y+=b.vy;b.a+=b.va;
      if(interact && hit(b,b.py)){collect(b);return;}
      if(interact && box && !b.scoring){
        const e=b.r*(Math.abs(Math.cos(b.a))+Math.abs(Math.sin(b.a)));
        // Solid walls and rim: touching an edge is a miss, never a forced failure.
        for(const wall of [box.left,box.right]){
          if(b.y+e>box.y-5 && b.y-e<box.bottom && Math.abs(b.x-wall)<e+3){
            const side=b.px<wall?-1:1;b.x=wall+side*(e+3);b.vx=side*Math.max(1,Math.abs(b.vx)*.55);b.va+=side*.025;
          }
        }
        if(b.py-e>=box.bottom && b.y-e<box.bottom && b.x>box.left && b.x<box.right){b.y=box.bottom+e;b.vy=Math.abs(b.vy)*.4;}
      }
    });
    for(let pass=0;pass<5;pass++) {
      for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++) {
        const a=bodies[i],b=bodies[j]; if(interact && (a.scoring||b.scoring||a===held||b===held||(a.sleep&&b.sleep)))continue; if(Math.abs(a.x-b.x)>a.r*1.42+b.r*1.42||Math.abs(a.y-b.y)>a.r*1.42+b.r*1.42)continue;
        const axes=[[Math.cos(a.a),Math.sin(a.a)],[-Math.sin(a.a),Math.cos(a.a)],[Math.cos(b.a),Math.sin(b.a)],[-Math.sin(b.a),Math.cos(b.a)]];
        let overlap=Infinity,nx=0,ny=0;
        for(const [x,y] of axes){
          const extent=o=>o.r*(Math.abs(x*Math.cos(o.a)+y*Math.sin(o.a))+Math.abs(-x*Math.sin(o.a)+y*Math.cos(o.a)));
          const delta=(b.x-a.x)*x+(b.y-a.y)*y,depth=extent(a)+extent(b)-Math.abs(delta);
          if(depth<=0){overlap=0;break;}if(depth<overlap){overlap=depth;nx=x*(delta<0?-1:1);ny=y*(delta<0?-1:1);}
        }
        if(!overlap)continue;
        if(ny>.3)a.supported=true;
        if(ny<-.3)b.supported=true;
        if(interact && overlap>2){
          if(a.sleep && Math.hypot(b.vx,b.vy)>3.5){a.sleep=false;a.quiet=0;}
          if(b.sleep && Math.hypot(a.vx,a.vy)>3.5){b.sleep=false;b.quiet=0;}
        }
        const wa=interact&&a.sleep?0:1,wb=interact&&b.sleep?0:1,total=wa+wb;
        if(!total)continue;
        const push=Math.max(0,overlap-.12)/total;
        a.x-=nx*push*wa;a.y-=ny*push*wa;b.x+=nx*push*wb;b.y+=ny*push*wb;
        const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
        if(speed<0){const impulse=-speed*(speed < -2 ? 1.08 : 1)/total;a.vx-=nx*impulse*wa;a.vy-=ny*impulse*wa;b.vx+=nx*impulse*wb;b.vy+=ny*impulse*wb;
          const tangent=(b.vx-a.vx)*-ny+(b.vy-a.vy)*nx;
          a.va*=.94;b.va*=.94;a.vx*=.98;b.vx*=.98;
        }
      }
      bodies.forEach(b=>{
        if(interact && (b.sleep||b===held||b.scoring))return;
        const e=b.r*(Math.abs(Math.cos(b.a))+Math.abs(Math.sin(b.a)));
        if(!interact && socialZone && b.y-e<socialZone.bottom){
          // The entire resting pile stays below the social links, including its sides.
          b.y=socialZone.bottom+e;b.vy=Math.max(0,b.vy);
        }
        if(!interact && box && b.y-e<box.bottom+16 && b.x+e>box.left-12 && b.x-e<box.right+12){
          b.x=box.left-e-14;b.vx=Math.min(0,b.vx);
        }
        if(b.x<e){b.x=e;b.vx=Math.abs(b.vx)*.45;}if(b.x>width-e){b.x=width-e;b.vx=-Math.abs(b.vx)*.45;}
        if(b.y<e){b.y=e;b.vy=Math.abs(b.vy)*.3;}
        if(b.y>height-e){b.y=height-e;b.supported=true;b.vy=b.vy>1.6?-b.vy*.18:0;b.vx*=.87;b.va*=.8;}
      });
    }
  }
  function freeze(b){b.vx=0;b.vy=0;b.va=0;b.sleep=true;b.quiet=0;}
  function tick(now){
    frame=0;
    if(!visible||document.hidden||reduced.matches||!interacting)return;
    accumulator+=Math.min((now-last)||16.67,50);last=now;
    while(accumulator>=16.667){
      step(true);accumulator-=16.667;
      bodies.forEach(b=>{
        if(b.sleep||b===held||b.scoring)return;
        const displacement=Math.hypot(b.x-b.px,b.y-b.py);
        if(b.supported && displacement<.32 && Math.abs(b.a-b.pa)<.004 && Math.hypot(b.vx,b.vy)<1.1)b.quiet=(b.quiet||0)+1;
        else b.quiet=0;
        if(b.quiet>14)freeze(b);
      });
    }
    // A sleeping pile has no scheduled animation frames and cannot jitter.
    if(now>=movingUntil && !held)bodies.forEach(b=>{if(!b.scoring)freeze(b);});
    paint();
    interacting=!!held||bodies.some(b=>!b.sleep&&!b.scoring);
    if(interacting)frame=requestAnimationFrame(tick);
  }
  function wake(){
    if(!interacting||!visible||document.hidden||reduced.matches||frame)return;
    last=performance.now();accumulator=0;frame=requestAnimationFrame(tick);
  }
  function coords(e){const rect=area.getBoundingClientRect();return {x:e.clientX-rect.left,y:e.clientY-rect.top,t:performance.now()};}
  function down(e){
    if(reduced.matches||e.button>0||held||e.target.closest('a,button,input'))return;
    const p=coords(e);if(p.x<0||p.x>width||p.y<0||p.y>height)return;
    const candidates=bodies.filter(b=>!b.scoring&&Math.hypot(b.x-p.x,b.y-p.y)<b.r*1.3);
    if(!candidates.length)return;
    held=candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    held.sleep=false;held.thrown=false;held.vx=0;held.vy=0;held.quiet=0;
    held.el.classList.add('is-held');samples=[p];activePointer=e.pointerId;
    touchGesture=e.pointerType==='touch'?{x:p.x,y:p.y,t:p.t,moved:0}:null;
    e.preventDefault();visible=true;interacting=true;movingUntil=p.t+6000;wake();
  }
  function hover(e){
    if(held||reduced.matches||e.buttons||e.pointerType==='touch')return;
    const p=coords(e);
    if(p.x<0||p.x>width||p.y<0||p.y>height){pointer.active=false;return;}
    const moved=!pointer.active||Math.hypot(p.x-pointer.x,p.y-pointer.y)>2;
    pointer.x=p.x;pointer.y=p.y;pointer.active=true;
    if(!moved)return;
    const nearby=bodies.filter(b=>!b.scoring&&!b.thrown&&p.t-(b.hoverAt||-1000)>450 && Math.hypot(b.x-p.x,b.y-p.y)<b.r+42)
      .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,3);
    nearby.forEach(b=>{
      const dx=b.x-p.x,range=b.r+42,d=Math.hypot(dx,b.y-p.y),force=1-d/range;
      b.sleep=false;b.quiet=0;b.hoverAt=p.t;
      b.vx=Math.max(-3,Math.min(3,b.vx+(dx<0?-1:1)*(.5+force)));
      b.vy=Math.min(b.vy,-(3.2+force*1.2));
      b.va+=(dx<0?-1:1)*.012;
    });
    if(nearby.length){visible=true;interacting=true;movingUntil=p.t+6000;wake();}
  }
  function move(e){
    if(!held){hover(e);return;}
    if(e.pointerId!==activePointer)return;
    e.preventDefault();const p=coords(e);
    if(touchGesture)touchGesture.moved=Math.max(touchGesture.moved,Math.hypot(p.x-touchGesture.x,p.y-touchGesture.y));
    held.x=Math.max(held.r,Math.min(width-held.r,p.x));held.y=Math.max(held.r,Math.min(height-held.r,p.y));
    samples.push({...p,x:held.x,y:held.y});samples=samples.filter(q=>p.t-q.t<=110).slice(-12);
    movingUntil=p.t+6000;paint();
  }
  function release(e,cancelled=false){
    if(!held||e.pointerId!==activePointer)return;
    const b=held,p=coords(e),recent=samples.filter(q=>p.t-q.t<=110);
    const first=recent[0],lastSample=recent[recent.length-1];
    b.vx=b.vy=0;
    if(!cancelled&&first&&lastSample&&recent.length>1){
      const dt=Math.max(20,p.t-first.t);
      b.vx=Math.max(-16,Math.min(16,(lastSample.x-first.x)/dt*16.667));
      b.vy=Math.max(-19,Math.min(16,(lastSample.y-first.y)/dt*16.667));
    }
    const isTap=!cancelled && touchGesture && p.t-touchGesture.t<300 &&
      touchGesture.moved<10 && Math.hypot(p.x-touchGesture.x,p.y-touchGesture.y)<10;
    if(isTap){
      b.vy=-5.8;
      b.vx=(b.x-touchGesture.x<0?-1:1)*.85;
      b.va=b.vx*.025;
    }else b.va=b.vx*.008;
    touchGesture=null;
    b.thrown=!cancelled&&Math.hypot(b.vx,b.vy)>1.5;
    b.travel=0;b.wasAbove=box&&b.y+b.r<box.y;b.sleep=false;b.quiet=0;
    b.el.classList.remove('is-held');held=null;activePointer=null;samples=[];
    if(hit(b,b.y)){collect(b);}
    interacting=true;movingUntil=performance.now()+6500;wake();
  }
  document.addEventListener('pointerdown',down,{passive:false});
  document.addEventListener('pointermove',move,{passive:false});
  document.addEventListener('pointerup',e=>release(e));
  document.addEventListener('pointercancel',e=>release(e,true));
  window.addEventListener('blur',()=>{if(held)release({pointerId:activePointer,clientX:0,clientY:0},true);});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else {cancelAnimationFrame(frame);frame=0;pointer.active=false;}},{threshold:0});observer.observe(area);
  // Only a size change rebuilds the static pile; pointer/scroll cannot do so.
  new ResizeObserver(build).observe(area);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;pointer.active=false;}else wake();});
  reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0;}else wake();});
  build();
})();
