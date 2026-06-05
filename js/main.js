/* ================================================
   AKHMADJON KHASANJONOV — Main JS v4
   ================================================ */

// ===== CURSOR =====
const cursor=document.getElementById('cursor');
const cursorGlow=document.getElementById('cursor-glow');
let mx=0,my=0,gx=0,gy=0;
if(cursor&&cursorGlow){
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
  (function loop(){gx+=(mx-gx)*0.06;gy+=(my-gy)*0.06;cursorGlow.style.left=gx+'px';cursorGlow.style.top=gy+'px';requestAnimationFrame(loop);})();
  document.querySelectorAll('a,button,.photo-item,.diploma-item,.achievement-card,.contact-card,.press-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>cursor.classList.add('expanded'));
    el.addEventListener('mouseleave',()=>cursor.classList.remove('expanded'));
  });
}

// ===== NAV SCROLL =====
const nav=document.querySelector('nav');
if(nav) window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>60),{passive:true});

// ===== HERO PARALLAX =====
const heroBgs=document.querySelectorAll('.hero-bg');
if(heroBgs.length){
  window.addEventListener('scroll',()=>{
    heroBgs.forEach(bg=>bg.style.transform=`translateY(${window.pageYOffset*0.35}px)`);
  },{passive:true});
}

// ===== HERO SLIDESHOW — only flag photos =====
function initSlideshow(){
  const slides=document.querySelectorAll('.hero-bg');
  if(slides.length<2) return;
  let current=0;
  setInterval(()=>{
    slides[current].style.opacity='0';
    current=(current+1)%slides.length;
    slides[current].style.opacity='1';
  },4500);
}

// ===== ALI SECTION — scroll between 2 photos =====
function initAliScroll(){
  const section=document.querySelector('.quote-section');
  const bg1=document.getElementById('ali-bg1');
  const bg2=document.getElementById('ali-bg2');
  if(!section||!bg1||!bg2) return;
  window.addEventListener('scroll',()=>{
    const rect=section.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,-rect.top/(rect.height*0.6)));
    bg1.style.opacity=1-progress;
    bg2.style.opacity=progress;
  },{passive:true});
}

// ===== HAMBURGER =====
const hamburger=document.querySelector('.hamburger');
const mobileMenu=document.querySelector('.mobile-menu');
if(hamburger&&mobileMenu){
  hamburger.addEventListener('click',()=>{
    const open=mobileMenu.classList.toggle('open');
    const [s1,s2,s3]=hamburger.querySelectorAll('span');
    if(open){s1.style.transform='rotate(45deg) translate(5px,5px)';s2.style.opacity='0';s3.style.transform='rotate(-45deg) translate(5px,-5px)';document.body.style.overflow='hidden';}
    else{[s1,s2,s3].forEach(s=>{s.style.transform='';s.style.opacity='';});document.body.style.overflow='';}
  });
  mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s=>{s.style.transform='';s.style.opacity='';});
    document.body.style.overflow='';
  }));
}

// ===== SCROLL REVEAL =====
const revealObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
},{threshold:0.08});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el=>revealObs.observe(el));

// ===== LANGUAGE SWITCHER =====
const LANG_KEY='ak_lang';
let currentLang=localStorage.getItem(LANG_KEY)||'en';
const langCodes={en:'en',ru:'ru',uz_lat:'uz',ar:'ar'};

function applyLang(lang){
  currentLang=lang;
  localStorage.setItem(LANG_KEY,lang);
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  const sel=document.querySelector('.goog-te-combo');
  if(sel){sel.value=langCodes[lang]||'en';sel.dispatchEvent(new Event('change'));}
}
document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.lang)));
window.addEventListener('load',()=>{
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===currentLang));
  if(currentLang!=='en') setTimeout(()=>applyLang(currentLang),1600);
});

// ===== API BASE URL =====
const API='https://akhmadjon-website-production.up.railway.app';

// ===== VIEW COUNTER =====
async function initViewCounter(){
  const el=document.getElementById('viewCount');
  if(!el) return;
  try{
    const res=await fetch(`${API}/api/views`,{method:'POST',headers:{'Content-Type':'application/json'}});
    if(!res.ok) throw new Error();
    const data=await res.json();
    animateCount(el,data.count||0);
  } catch{ el.textContent='—'; }
}
function animateCount(el,target,dur=2200){
  let t0=null;
  (function step(ts){
    if(!t0) t0=ts;
    const p=Math.min((ts-t0)/dur,1);
    const e=1-Math.pow(1-p,3);
    el.textContent=Math.floor(e*target).toLocaleString();
    if(p<1) requestAnimationFrame(step);
    else el.textContent=target.toLocaleString();
  })(performance.now());
}

// ===== CONTACT FORM =====
const contactForm=document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=contactForm.querySelector('.submit-btn');
    const successEl=document.getElementById('formSuccess');
    const origText=btn.textContent;
    btn.textContent='Sending...';btn.disabled=true;
    const body={name:contactForm.querySelector('[name=name]').value,email:contactForm.querySelector('[name=email]').value,message:contactForm.querySelector('[name=message]').value};
    try{
      const res=await fetch(`${API}/api/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(res.ok){contactForm.style.display='none';if(successEl)successEl.classList.add('visible');}
      else throw new Error();
    } catch{btn.textContent='Error — Try Again';btn.disabled=false;setTimeout(()=>{btn.textContent=origText;},3000);}
  });
}

// ===== LIGHTBOX =====
const lightbox=document.getElementById('lightbox');
const lightboxImg=document.getElementById('lightboxImg');
if(lightbox&&lightboxImg){
  function openLb(src){lightboxImg.src=src;lightbox.classList.add('open');document.body.style.overflow='hidden';}
  function closeLb(){lightbox.classList.remove('open');document.body.style.overflow='';setTimeout(()=>lightboxImg.src='',300);}
  document.querySelectorAll('.diploma-item,[data-lightbox]').forEach(item=>{
    item.addEventListener('click',()=>{const img=item.querySelector('img');if(img)openLb(img.src);});
  });
  document.querySelector('.lightbox-close')?.addEventListener('click',closeLb);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLb();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb();});
}

// ===== INIT =====
initViewCounter();
initSlideshow();
initAliScroll();
