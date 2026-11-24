/* ---------- polish: shake, pull to refresh, count-up numbers, paid/cancelled stamps, first-run tour ---------- */

/* shake a field that needs fixing */
function shake(el){if(!el)return;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');buzz(30);setTimeout(()=>el.classList.remove('shake'),600);}
document.addEventListener('invalid',e=>{shake(e.target.closest('.field')||e.target);},true);

/* pull down at the top of a screen to refresh */
(function(){
  let y0=null,pull=0,busyR=false;const sc=()=>$('#scroller');
  const ind=()=>{let el=$('#ptr');if(!el){el=document.createElement('div');el.id='ptr';el.className='ptr';el.setAttribute('aria-hidden','true');el.innerHTML=`<svg viewBox="0 0 24 24" class="ptr-tire"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21"/></svg>`;document.body.appendChild(el);}return el;};
  document.addEventListener('touchstart',e=>{const s=sc();if(busyR||!s||s.scrollTop>0||!$('#ov').hidden||e.target.closest('.rrow,.onb,.intro-track,input,textarea,select'))return;y0=e.touches[0].clientY;pull=0;},{passive:true});
  document.addEventListener('touchmove',e=>{if(y0===null)return;const s=sc();if(s.scrollTop>0){y0=null;return;}pull=Math.max(0,Math.min(110,(e.touches[0].clientY-y0)*.5));const el=ind();el.style.setProperty('--p',pull);el.classList.toggle('ready',pull>=70);el.classList.add('show');},{passive:true});
  const end=async()=>{if(y0===null)return;y0=null;const el=$('#ptr');if(!el)return;
    if(pull<70){el.classList.remove('show','ready');el.style.setProperty('--p',0);return;}
    busyR=true;buzz(12);el.classList.add('spin-on');
    try{if(window.cjRefresh)await window.cjRefresh();await new Promise(r=>setTimeout(r,450));toast('עודכן');}catch(x){toast('אין חיבור כרגע');}
    finally{busyR=false;el.classList.remove('show','ready','spin-on');el.style.setProperty('--p',0);}};
  document.addEventListener('touchend',end);document.addEventListener('touchcancel',end);
})();

/* numbers count up from zero the first time they show (and when they change) */
const COUNTED={};
function countUp(){
  if(reduceMotion())return;
  document.querySelectorAll('.kpi .v,.fl-kpis .v').forEach((el,i)=>{
    const node=[...el.childNodes].find(nd=>nd.nodeType===3&&/\d/.test(nd.textContent));if(!node)return;
    const txt=node.textContent,m=txt.match(/-?[\d,]*\.?\d+/);if(!m)return;
    const key=view+':'+i;if(COUNTED[key]===txt)return;COUNTED[key]=txt;
    const target=parseFloat(m[0].replace(/,/g,''));if(!isFinite(target)||target===0)return;
    const dec=(m[0].split('.')[1]||'').length,fmt=new Intl.NumberFormat('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
    const pre=txt.slice(0,m.index),post=txt.slice(m.index+m[0].length),t0=performance.now(),dur=900;
    const step=t=>{if(!node.isConnected)return;const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);node.textContent=pre+fmt.format(target*e)+post;if(k<1)requestAnimationFrame(step);else node.textContent=txt;};
    node.textContent=pre+fmt.format(0)+post;requestAnimationFrame(step);
  });
}

/* stamps on tickets: paid / cancelled */
let JUST_STAMP=null;
function tkStamp(t){
  const s=t.status==='paid'?{c:'paid',x:'שולם'}:t.status==='cancelled'?{c:'cancelled',x:'בוטל'}:null;if(!s)return '';
  const fresh=JUST_STAMP&&JUST_STAMP.id===t.id&&Date.now()-JUST_STAMP.at<4000;
  return `<span class="stampmark ${s.c}${fresh?' fresh':''}" aria-hidden="true">${s.x}</span>`;
}

/* first-run tour: three quick pointers on the home screen */
const TOUR=[
  {sel:'[data-act=helpHere]',t:'הסבר בכל רגע',p:'לוחצים על ״?״ ומקבלים הסבר קצר על המסך.'},
  {sel:'[data-act=agentOpen]',t:'הסוכן',p:'מספרים לו מה עשית, ״עשיתי איזון וכיוון פרונט ב־250״, והוא רושם בשבילך. אפשר גם לדבר.'},
  {sel:'.m-actions,.m-hero,.hero',t:'רישום מהיר',p:'תדלוק, בדיקה, בקול או רישום. ובתזכורות: מחליקים ימינה = בוצע, שמאלה = דחייה.'},
];
function maybeTour(){
  if(view!=='home'||lsGet('cj-tour-pending')!=='1'||$('#tour')||$('#onb')||!$('#ov').hidden)return;
  lsSet('cj-tour-pending','0');setTimeout(()=>tourStep(0),500);
}
function tourStep(i){
  let el=$('#tour');if(i>=TOUR.length){if(el)el.remove();return;}
  const s=TOUR[i];const tg=s.sel.split(',').map(x=>document.querySelector(x)).find(x=>x&&x.getBoundingClientRect().width);if(!tg){tourStep(i+1);return;}
  tg.scrollIntoView({block:'center',behavior:'instant'});const r=tg.getBoundingClientRect();
  if(!el){el=document.createElement('div');el.id='tour';el.className='tour';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','סיור קצר');document.body.appendChild(el);}
  const below=r.bottom<innerHeight*.6;
  el.innerHTML=`<div class="tour-hole" style="left:${r.left-6}px;top:${r.top-6}px;width:${r.width+12}px;height:${r.height+12}px"></div>
    <div class="tour-tip" style="${below?`top:${Math.min(innerHeight-200,r.bottom+14)}px`:`bottom:${Math.min(innerHeight-200,innerHeight-r.top+14)}px`}"><b>${s.t}</b><p>${s.p}</p>
    <div class="tour-acts"><span class="small muted">${i+1} מתוך ${TOUR.length}</span><span><button class="onb-skip" data-tour="x">דילוג</button><button class="btn primary sm" data-tour="n">${i===TOUR.length-1?'הבנתי':'הבא'}</button></span></div></div>`;
  el.querySelector('[data-tour=n]').onclick=()=>tourStep(i+1);el.querySelector('[data-tour=x]').onclick=()=>el.remove();
  el.querySelector('[data-tour=n]').focus();
}

/* hooked into every render */
const _afterRender=afterRender;
afterRender=function(){_afterRender();countUp();maybeTour();};
