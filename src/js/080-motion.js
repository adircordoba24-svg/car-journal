/* ---------- motion and delight: rolling odometer, swipe, car health, pump loader, celebrations, live countdowns ---------- */
const reduceMotion=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms||12);}catch(e){}};

/* 1. rolling odometer: every digit is a strip 0-9 that rolls to its value */
const ODO_SHOWN={};
function odoRoll(v){
  const s=String(Math.round(v||0)).padStart(6,'0');const prev=ODO_SHOWN[CAR];
  const from=prev==null?'000000':String(Math.round(prev)).padStart(6,'0');let lead=true;
  return `<div class="odo-digits roll" aria-label="${km(v)} קילומטר" data-to="${s}">${[...s].map((c,i)=>{if(c!=='0')lead=false;
    return `<span class="${lead?'lead':''}" aria-hidden="true"><b class="strip" style="--d:${reduceMotion()?c:from[i]}">${'0123456789'.split('').map(x=>`<i>${x}</i>`).join('')}</b></span>`;}).join('')}<em>ק״מ</em></div>`;
}
function rollOdos(){
  const els=document.querySelectorAll('.odo-digits.roll[data-to]');if(!els.length)return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    els.forEach(el=>{const to=el.dataset.to;el.querySelectorAll('.strip').forEach((b,i)=>{b.style.transitionDelay=(5-i)*70+'ms';b.style.setProperty('--d',to[i]);});el.removeAttribute('data-to');});
    ODO_SHOWN[CAR]=odo();
  }));
}

/* 3. car health: one number from everything the app knows */
function carHealth(){
  if(!S.car||S.car.example)return null;
  let score=100;const why=[];
  for(const {r,st} of sortedReminders(r=>r.carId!=='*')){
    if(st.snoozed)continue;
    const doc=r.kind==='doc',chk=r.kind==='check';
    if(st.status==='over'){const p=doc?25:chk?4:14;score-=p;why.push({p,t:`${r.title}: ${st.label}`});}
    else if(st.status==='soon'){const p=doc?6:chk?1:5;score-=p;why.push({p,t:`${r.title}: ${st.label}`});}
  }
  const upd=S.car.odoUpdatedAt||'';if(upd&&daysBetween(upd,today())>45){score-=5;why.push({p:5,t:'הקילומטראז׳ לא עודכן יותר מחודש וחצי'});}
  score=Math.max(0,Math.min(100,Math.round(score)));
  why.sort((a,b)=>b.p-a.p);
  const lvl=score>=85?{c:'ok',t:'מצוין'}:score>=65?{c:'ok',t:'טוב'}:score>=40?{c:'soon',t:'דורש תשומת לב'}:{c:'over',t:'דורש טיפול'};
  return {score,lvl,why};
}
const HEALTH_SHOWN={};
function healthCard(){
  const h=carHealth();if(!h)return '';
  const R=34,C=2*Math.PI*R;
  return `<button type="button" class="card health" data-act="healthOpen" data-s="${h.lvl.c}" aria-label="מצב הרכב ${h.score} מתוך 100, ${h.lvl.t}">
    <svg viewBox="0 0 84 84" class="hring" aria-hidden="true"><circle cx="42" cy="42" r="${R}" class="hr-bg"/><circle cx="42" cy="42" r="${R}" class="hr-fg" style="--c:${C};--off:${C*(1-h.score/100)}" stroke-dasharray="${C}" stroke-dashoffset="${reduceMotion()||HEALTH_SHOWN[CAR]===h.score?C*(1-h.score/100):C}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" class="hr-num">${h.score}</text></svg>
    <span class="h-txt"><span class="eyebrow">מצב הרכב</span><b>${h.lvl.t}</b><span>${h.why.length?esc(h.why[0].t):'הכול מעודכן. ככה ממשיכים 👌'}</span></span></button>`;
}
function fillRings(){requestAnimationFrame(()=>requestAnimationFrame(()=>{document.querySelectorAll('.hr-fg').forEach(c=>c.style.strokeDashoffset=c.style.getPropertyValue('--off'));const h=document.querySelector('.health .hr-num');if(h)HEALTH_SHOWN[CAR]=+h.textContent;}));}
function healthSheet(){
  const h=carHealth();if(!h)return;
  openModal('מצב הרכב',`<div class="stack" style="gap:12px"><p style="margin:0"><b>${h.score} מתוך 100 · ${h.lvl.t}.</b> הציון יורד כשטיפול, טסט, ביטוח או בדיקה מתקרבים או עוברים את המועד, ועולה כשמסמנים ״בוצע״.</p>
    ${h.why.length?`<div class="tkc-list">${h.why.slice(0,8).map(w=>`<div class="tkc-i" data-s="${w.p>=10?'bad':'warn'}"><span class="tkc-ic">${I(w.p>=10?'bell':'clock')}</span><span>${esc(w.t)} <span class="muted small">(−${w.p})</span></span></div>`).join('')}</div>`:'<p class="small muted">אין שום דבר פתוח. 💪</p>'}
    <div class="formacts"><button class="btn primary" data-nav="reminder">${I('bell')}לתזכורות</button><button class="btn ghost" data-act="close">סגירה</button></div></div>`);
}

/* 4. fuel pump loader instead of a spinner while the agent reads something */
const PUMP=`<svg class="pump" viewBox="0 0 24 24" aria-hidden="true"><path class="pb" d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13"/><rect class="pf" x="6" y="9" width="7" height="10" rx="1"/><path class="pb" d="M15 8l3 3v7a1.5 1.5 0 0 0 3 0V9l-3-3"/><circle class="pd" cx="19.5" cy="20" r="1"/></svg>`;

/* 5. celebrations: every 10,000 km, and a year / two years with no tickets */
function confetti(){
  if(reduceMotion())return;
  const box=document.createElement('div');box.className='confetti';box.setAttribute('aria-hidden','true');
  const cols=['var(--accent)','var(--ok)','var(--warn)','#7aa7ff','#ff8fb1'];
  for(let i=0;i<46;i++){const p=document.createElement('i');p.style.cssText=`--x:${Math.random()*100}vw;--r:${Math.random()*720-360}deg;--t:${1.6+Math.random()*1.4}s;--dl:${Math.random()*.4}s;background:${cols[i%cols.length]};left:${Math.random()*100}%`;box.appendChild(p);}
  document.body.appendChild(box);setTimeout(()=>box.remove(),3600);
}
function celebrate(title,text){
  confetti();buzz([20,40,20]);
  let el=document.createElement('div');el.className='celebrate';el.setAttribute('role','status');
  el.innerHTML=`<b>${esc(title)}</b><span>${esc(text)}</span>`;document.body.appendChild(el);
  setTimeout(()=>el.classList.add('out'),3800);setTimeout(()=>el.remove(),4400);
}
const lsGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}},lsSet=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
function checkMilestones(){
  if(!S.car||S.car.example||S.ready.size<COLS.length)return;
  // kilometers
  const k='cj-ms-km-'+CAR,m=Math.floor(odo()/10000);const was=lsGet(k);
  if(was===null)lsSet(k,String(m));
  else if(m>+was){lsSet(k,String(m));setTimeout(()=>celebrate(`${km(m*10000)} ק״מ! 🎉`,`ה${carName(S.car)} עברה עוד 10,000 ק״מ איתך.`),600);return;}
  // no tickets
  const last=[...S.ticket].map(t=>t.offenseDate).filter(Boolean).sort().pop();if(!last)return;
  const yrs=Math.floor(daysBetween(last,today())/365);const kt='cj-ms-clean';const wt=lsGet(kt);
  if(wt===null)lsSet(kt,String(yrs));
  else if(yrs>+wt&&yrs>=1){lsSet(kt,String(yrs));setTimeout(()=>celebrate(yrs===1?'שנה בלי דוחות! 🏆':`${yrs} שנים בלי דוחות! 🏆`,yrs>=2?'כל הנקודות מאחוריך. נהיגה מעולה.':'ככה ממשיכים.'),600);}
}

/* live countdowns: test, insurance, points reset, two years without a ticket */
function countdownItems(){
  const out=[];const t=sortedReminders(r=>r.carId!=='*'&&r.kind==='doc');
  const test=t.find(x=>isTest(x.r)),ins=t.find(x=>isIns(x.r));
  if(test&&test.st.dueDate)out.push({k:'test',ic:'doc',l:'טסט',d:test.st.dueDate});
  if(ins&&ins.st.dueDate)out.push({k:'ins',ic:'shield',l:'ביטוח',d:ins.st.dueDate});
  try{const ps=pointsState();if(ps.total&&ps.reset)out.push({k:'pts',ic:'ticket',l:'איפוס נקודות',d:ps.reset});
    const last=[...S.ticket].map(x=>x.offenseDate).filter(Boolean).sort().pop();const clean=last?addDays(last,730):null;
    if(clean&&clean>today()&&clean!==ps.reset)out.push({k:'clean',ic:'check',l:'שנתיים בלי דוח',d:clean});}catch(e){}
  return out;
}
function cdParts(d){const ms=new Date(d+'T00:00:00').getTime()-Date.now();const s=Math.max(0,Math.floor(ms/1000));return {past:ms<=0,days:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60};}
const p2=x=>String(x).padStart(2,'0');
function cdHTML(d){const p=cdParts(d);if(p.past)return `<b class="cd-days">עבר</b><span class="cd-clock">${fmtD(d)}</span>`;return `<b class="cd-days">${km(p.days)}<small> ימים</small></b><span class="cd-clock" dir="ltr">${p2(p.h)}:${p2(p.m)}:${p2(p.s)}</span>`;}
function countdownCard(){
  const it=countdownItems();if(!it.length)return '';
  return `<section class="card cd-card"><div class="card-head"><h2>ספירה לאחור</h2>${helpBtn('points','הסבר על הנקודות')}</div>
    <div class="cd-grid">${it.map(x=>{const p=cdParts(x.d);const s=p.past?'over':x.k==='clean'||x.k==='pts'?'ok':p.days<=14?'over':p.days<=45?'soon':'ok';
      return `<div class="cd" data-s="${s}" data-cd="${x.d}"><span class="cd-l">${I(x.ic)}${x.l}</span><span class="cd-v">${cdHTML(x.d)}</span><span class="cd-d">${x.k==='clean'?'מאז הדוח האחרון · ':''}${fmtD(x.d)}</span></div>`;}).join('')}</div></section>`;
}
setInterval(()=>{document.querySelectorAll('[data-cd]').forEach(el=>{const v=el.querySelector('.cd-v');if(v)v.innerHTML=cdHTML(el.dataset.cd);});},1000);

/* 2. swipe a reminder: right = done, left = snooze (phones) */
(function(){
  let row=null,x0=0,y0=0,dx=0,dir=null;
  document.addEventListener('touchstart',e=>{const r=e.target.closest('.rrow');if(!r||e.target.closest('button')||e.touches.length>1)return;row=r;x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0;dir=null;},{passive:true});
  document.addEventListener('touchmove',e=>{if(!row)return;const t=e.touches[0];const mx=t.clientX-x0,my=t.clientY-y0;
    if(!dir){if(Math.abs(mx)<8&&Math.abs(my)<8)return;dir=Math.abs(mx)>Math.abs(my)*1.3?'h':'v';}
    if(dir!=='h'){row=null;return;}
    dx=Math.max(-140,Math.min(140,mx));row.classList.add('swiping');row.style.transform=`translateX(${dx}px)`;
    row.dataset.sw=dx>60?'done':dx<-60?'snooze':'';},{passive:true});
  const end=()=>{if(!row)return;const r=row;row=null;const act=r.dataset.sw;r.classList.remove('swiping');r.style.transform='';r.dataset.sw='';
    if(!act)return;const id=(r.querySelector('[data-act=done]')||{}).dataset;if(!id||!id.id)return;buzz(act==='done'?[15,30,15]:12);
    if(act==='done'){r.classList.add('stamp');const rem=S.reminder.find(x=>x.id===id.id);
      if(rem&&rem.kind==='service')serviceForm(null,{title:rem.title,remId:rem.id});else markDone(id.id).then(()=>render()).catch(()=>toast('העדכון נכשל'));}
    else snoozeSheet(id.id);};
  document.addEventListener('touchend',end);document.addEventListener('touchcancel',end);
})();

document.addEventListener('click',e=>{const b=e.target.closest('[data-act="healthOpen"]');if(b)healthSheet();});
// after every render
function afterRender(){rollOdos();fillRings();checkMilestones();}
