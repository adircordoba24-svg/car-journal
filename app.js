(function(){
"use strict";
/* ===== 01-core.js ===== */
try{document.documentElement.dir="rtl";document.documentElement.lang="he";}catch(e){}
/* ---------- icons ---------- */
const P={
 mic:"M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3M9 21h6",
 grid:"M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
 sheet:"M4 4h16v16H4zM4 9h16M4 14h16M10 4v16",
 upload:"M12 16V4M7 9l5-5 5 5M4 20h16",
 download:"M12 4v12M7 11l5 5 5-5M4 20h16",
 home:"M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
 fuel:"M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M6 9h7M15 8l3 3v7a1.5 1.5 0 0 0 3 0V9l-3-3",
 wrench:"M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
 receipt:"M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3",
 bell:"M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
 spark:"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
 plus:"M12 5v14M5 12h14",
 drop:"M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
 oil:"M3 13h11l5-4 2 1-6 8H3zM7 13v-3h4v3M9 10V8h-2M20 15c0 1-.6 2-1 2",
 tire:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 3v5M12 16v5M3 12h5M16 12h5",
 wiper:"M4 18c4-8 12-8 16 0M12 18l5-9",
 cal:"M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
 cam:"M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
 trash:"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
 edit:"M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
 check:"M5 12l5 5L20 7",
 chart:"M4 20V11M10 20V5M16 20v-8M21 20H3",
 shield:"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
 send:"M20 4L4 11l6 2 2 6z",
 gauge:"M4 16a8 8 0 1 1 16 0M12 16l4-5",
 doc:"M6 3h9l4 4v14H6zM14 3v5h5",
 list:"M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
 park:"M6 21V3h6a5 5 0 0 1 0 10H6",
 sparkles:"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
 battery:"M3 8h16v8H3zM21 11v2M7 12h4M9 10v4",
 brake:"M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
 filter:"M4 5h16l-6 7v6l-4 2v-8z",
 chat:"M4 5h16v11H9l-5 4z",
 car:"M5 17h14v-5l-2-5H7l-2 5zM5 12h14M7 17v2M17 17v2M8 14.5h.01M16 14.5h.01",
 bug:"M8 9h8v6a4 4 0 0 1-8 0zM12 9v10M8 12H4M20 12h-4M5 7l3 2M19 7l-3 2M9 5l1 2M15 5l-1 2",
 ticket:"M4 5h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4zM10 5v12",
 clock:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
 undo:"M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
 id:"M3 6h18v12H3zM7 10h4M7 14h6M15 10h3v4h-3z",
};
const I=(n,cls)=>`<svg class="i ${cls||''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]||P.list}"/></svg>`;

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dstr=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>dstr(new Date());
const pd=s=>new Date(s+'T12:00:00');
const daysBetween=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const addDays=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+Math.round(n));return dstr(d)};
const nf0=new Intl.NumberFormat('he-IL',{maximumFractionDigits:0});
const nf1=new Intl.NumberFormat('he-IL',{maximumFractionDigits:1,minimumFractionDigits:1});
const nf2=new Intl.NumberFormat('he-IL',{maximumFractionDigits:2,minimumFractionDigits:2});
const ils=v=>'₪'+nf0.format(Math.round(+v||0));
const ils2=v=>'₪'+nf2.format(+v||0);
const km=v=>nf0.format(Math.round(+v||0));
const fmtD=s=>s?pd(s).toLocaleDateString('he-IL',{day:'numeric',month:'short',year:'2-digit'}):'—';
const monthKey=s=>s.slice(0,7);
const monthName=k=>pd(k+'-15').toLocaleDateString('he-IL',{month:'short'});
// numbers from forms and from the AI: accepts 291.62, "₪291.62", "291,62", "1,092.50", "14,739"
const n=v=>{if(typeof v==='number')return isFinite(v)?v:null;if(v==null)return null;let s=String(v).replace(/[^\d.,\-]/g,'');if(!s||s==='-')return null;
  if(s.includes(',')&&s.includes('.'))s=s.replace(/,/g,'');else if(s.includes(','))s=/,\d{1,2}$/.test(s)?s.replace(',','.'):s.replace(/,/g,'');
  const x=parseFloat(s);return isFinite(x)?x:null};

const CATS={fuel:'דלק',service:'טיפולים ותיקונים',insurance:'ביטוח',test:'טסט ורישוי',tires:'צמיגים',parking:'חניה ואגרות',wash:'שטיפה וטיפוח',parts:'חלפים ואביזרים',other:'אחר'};
const CAT_ICON={fuel:'fuel',service:'wrench',insurance:'shield',test:'doc',tires:'tire',parking:'park',wash:'drop',parts:'filter',other:'receipt'};
const KIND={service:'טיפול תקופתי',check:'בדיקה שוטפת',doc:'מסמכים ותשלומים'};
function iconFor(title,kind){
  const t=title||'';
  if(/שמן/.test(t)) return 'oil';
  if(/מים|קירור|נוזל קירור/.test(t)) return 'drop';
  if(/אוויר|צמיג|גלגל|פרונט|איזון/.test(t)) return 'tire';
  if(/שמשה|מגב|ווישר/.test(t)) return 'wiper';
  if(/בלמ|רפיד/.test(t)) return 'brake';
  if(/מצבר/.test(t)) return 'battery';
  if(/מסנן|פילטר/.test(t)) return 'filter';
  if(/ביטוח/.test(t)) return 'shield';
  if(/טסט|רישיון|רישוי/.test(t)) return 'doc';
  return kind==='check'?'check':kind==='doc'?'cal':'wrench';
}

/* ---------- state ---------- */
const COLS=['garage','fuel','service','expense','reminder','paper','ticket','person'];
const S={car:null,cars:[],fuel:[],service:[],expense:[],reminder:[],paper:[],ticket:[],person:null,ready:new Set(),offline:false};
const RAW={garage:[],fuel:[],service:[],expense:[],reminder:[],paper:[],ticket:[],person:[]};
let MAX_CARS=2,PLAN='private';
let CAR='car';try{CAR=localStorage.getItem('cj-car')||'car';}catch(e){}
function applyCar(){
  const cars=[...RAW.garage].sort((a,b)=>a.id==='car'?-1:b.id==='car'?1:(a.createdAt||0)-(b.createdAt||0));
  if(cars.length&&!cars.some(c=>c.id===CAR))CAR=cars[0].id;
  S.cars=cars;S.car=cars.find(c=>c.id===CAR)||null;
  for(const c of ['fuel','service','expense','reminder','paper'])S[c]=RAW[c].filter(r=>(r.carId||'car')===CAR||r.carId==='*');
  S.ticket=RAW.ticket;S.person=RAW.person.find(x=>x.id==='me')||null;
}
function switchCar(id){if(id===CAR)return;CAR=id;try{localStorage.setItem('cj-car',id);}catch(e){}chatLog.length=0;applyCar();render();toast('עברת ל'+carName(S.car));}
function carName(c){c=c||{};return c.nickname||[c.make,c.model].filter(Boolean).join(' ')||'הרכב';}
let db=null,assets=null,sample=null,mcp=null,imgOK=false;
let view='home';
try{const h=location.hash.slice(1);if(['home','fuel','service','expense','reminder','agents'].includes(h))view=h}catch(e){}

/* ---------- derived ---------- */
function odo(){
  let m=n(S.car?.odometer)||0;
  for(const r of [...S.fuel,...S.service]) if(n(r.odo)>m) m=n(r.odo);
  return m;
}
function kmPerDay(){
  const pts=[...S.fuel,...S.service].filter(r=>n(r.odo)&&r.date).sort((a,b)=>a.date<b.date?-1:1);
  const cut=addDays(today(),-240); const rec=pts.filter(p=>p.date>=cut);
  const use=rec.length>=2?rec:pts;
  if(use.length<2) return 40;
  const a=use[0],b=use[use.length-1],d=daysBetween(a.date,b.date);
  return d>0?Math.max(5,(b.odo-a.odo)/d):40;
}
function fuelEff(){
  const f=[...S.fuel].filter(r=>n(r.odo)).sort((a,b)=>a.odo-b.odo);
  const out=[];let last=null,acc=0;
  for(const r of f){
    if(!last){ if(r.full) {last=r;acc=0;} continue; }
    acc+=n(r.liters)||0;
    if(r.full){ const d=r.odo-last.odo; if(d>0&&acc>0) out.push({id:r.id,date:r.date,odo:r.odo,kmpl:d/acc,km:d}); last=r; acc=0; }
  }
  return out;
}
function effStats(){
  const e=fuelEff(); if(!e.length) return null;
  const tk=e.reduce((s,x)=>s+x.km,0), tl=e.reduce((s,x)=>s+x.km/x.kmpl,0);
  return {avg:tk/tl,last:e[e.length-1].kmpl,prev:e.length>1?e[e.length-2].kmpl:null,series:e};
}
function allSpend(){
  const rows=[];
  for(const f of S.fuel) rows.push({date:f.date,cat:'fuel',amount:n(f.total)||0,title:f.station||'תדלוק',src:'fuel',rec:f});
  for(const s of S.service) rows.push({date:s.date,cat:'service',amount:n(s.cost)||0,title:s.title||'טיפול',src:'service',rec:s});
  for(const x of S.expense) rows.push({date:x.date,cat:x.category||'other',amount:n(x.amount)||0,title:x.title||CATS[x.category]||'הוצאה',src:'expense',rec:x});
  return rows.filter(r=>r.date).sort((a,b)=>a.date<b.date?1:-1);
}
function lastMonths(k){
  const out=[];const d=new Date();d.setDate(15);
  for(let i=k-1;i>=0;i--){const x=new Date(d);x.setMonth(d.getMonth()-i);out.push(x.getFullYear()+'-'+pad(x.getMonth()+1));}
  return out;
}
function remState(r){
  const o=odo(),t=today();let kmLeft=null,daysLeft=null,pk=0,pdd=0;
  if(n(r.intervalKm)){kmLeft=(n(r.lastKm)||0)+n(r.intervalKm)-o;pk=1-kmLeft/n(r.intervalKm);}
  if(n(r.intervalDays)){const due=addDays(r.lastDate||t,n(r.intervalDays));daysLeft=daysBetween(t,due);pdd=1-daysLeft/n(r.intervalDays);}
  const kpd=kmPerDay(); const cands=[];
  if(daysLeft!==null) cands.push(addDays(t,daysLeft));
  if(kmLeft!==null) cands.push(addDays(t,Math.max(-3650,kmLeft/kpd)));
  const dueDate=cands.sort()[0]||null;
  const kmBinding=kmLeft!==null&&(daysLeft===null||kmLeft/kpd<daysLeft);
  const over=(kmLeft!==null&&kmLeft<=0)||(daysLeft!==null&&daysLeft<0);
  const soonDays=r.kind==='check'?2:21;
  const soon=!over&&(Math.max(pk,pdd)>=.85||(daysLeft!==null&&daysLeft<=soonDays)||(kmLeft!==null&&kmLeft<=1000));
  const pct=Math.min(1,Math.max(0,Math.max(pk,pdd)));
  let label;
  if(kmBinding){label=kmLeft<=0?`באיחור ${km(-kmLeft)} ק״מ`:`עוד ${km(kmLeft)} ק״מ`;}
  else if(daysLeft!==null){label=daysLeft<0?`באיחור ${-daysLeft} ימים`:daysLeft===0?'היום':daysLeft===1?'מחר':`עוד ${daysLeft} ימים`;}
  else label='ללא מועד';
  const snz=(r.snoozeDate&&t<r.snoozeDate)||(n(r.snoozeKm)&&o<n(r.snoozeKm));
  if(snz&&(over||soon))return {kmLeft,daysLeft,pct,dueDate,status:'ok',label:r.snoozeDate&&t<r.snoozeDate?`נדחה עד ${fmtD(r.snoozeDate)}`:`נדחה עד ${km(r.snoozeKm)} ק״מ`,kmBinding,snoozed:true};
  return {kmLeft,daysLeft,pct,dueDate,status:over?'over':soon?'soon':'ok',label,kmBinding};
}
const RANK={over:0,soon:1,ok:2};
function sortedReminders(filter){
  return S.reminder.filter(r=>!filter||filter(r)).map(r=>({r,st:remState(r)}))
    .sort((a,b)=>RANK[a.st.status]-RANK[b.st.status]||b.st.pct-a.st.pct);
}

/* ---------- db ---------- */
async function boot(){
  renderNav();
  try{PENDING=window.cjPending?window.cjPending():0;}catch(e){}
  if(window.cjAccount){const ab=$('#acctBtn');if(ab)ab.hidden=false;const bt=$('#betaTag');if(bt)bt.hidden=false;
    if(window.cjAccount.plan)window.cjAccount.plan().then(pl=>{if(pl&&pl.maxCars){MAX_CARS=pl.maxCars;PLAN=pl.plan||'private';render();}}).catch(()=>{});}
  try{const qp=new URLSearchParams(location.search);const qc=qp.get('car');if(qc){CAR=qc;try{localStorage.setItem('cj-car',qc);}catch(e){}history.replaceState(null,'',location.pathname+location.hash);}}catch(e){}
  if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',e=>{const d=e.data||{};if(d.type==='cj-open'){if(d.car&&d.car!==CAR&&S.cars.some(c=>c.id===d.car))switchCar(d.car);go('reminder');}});
  const timer=setTimeout(()=>{if(S.ready.size<COLS.length){S.offline=true;render();}},10000);
  try{ db=await window.claude?.use?.('db'); }catch(e){ db=null; }
  if(!db){clearTimeout(timer);S.noDb=true;render();return;}
  for(const c of COLS){
    db.collection(c).onSnapshot(snap=>{
      const rows=snap.docs.map(d=>Object.assign({id:d.id},d.data()));
      RAW[c]=rows; applyCar();
      if(!snap.metadata.fromCache){S.ready.add(c); if(S.ready.size===COLS.length){clearTimeout(timer);S.offline=false;}}
      else S.ready.add(c);
      render();
    },err=>{S.ready.add(c);S.offline=true;console.warn(err);render();});
  }
  window.claude.use('assets').then(a=>{assets=a;}).catch(()=>{});
  window.claude.use('mcp').then(m=>{mcp=m;}).catch(()=>{});
  window.claude.use('sample').then(async s=>{sample=s; if(s){try{const l=await s.limits();imgOK=!!l?.images;}catch(e){}} render();}).catch(()=>{});
}
const col=c=>db.collection(c);
async function addRec(c,data){ if(!db) throw new Error('nodb'); return col(c).add(Object.assign({createdAt:Date.now()},c==='garage'?{}:{carId:CAR},data)); }
async function updRec(c,id,data){ return col(c).doc(id).update(data); }
async function setRec(c,id,data){ return col(c).doc(id).set(data); }
async function delRec(c,id){ return col(c).doc(id).delete(); }
async function bumpOdo(v){
  v=n(v); if(!v||!S.car) return;
  if(v>(n(S.car.odometer)||0)) await updRec('garage',S.car.id,{odometer:v,odoUpdatedAt:today()});
}

/* ---------- ui infra ---------- */
let toastT;
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;t.classList.remove('has-act');clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600);}
// short message with an action button (used for undo); onExpire runs if the action was not used
function toastAct(msg,label,onAct,onExpire,ms){const t=$('#toast');let used=false;
  t.innerHTML=`<span>${esc(msg)}</span><button type="button" class="toast-act">${I('undo')}${esc(label)}</button>`;t.hidden=false;t.classList.add('has-act');
  clearTimeout(toastT);const prevExp=t._exp;if(prevExp){t._exp=null;prevExp();}
  t._exp=onExpire||null;
  t.querySelector('.toast-act').onclick=()=>{used=true;t._exp=null;clearTimeout(toastT);t.hidden=true;onAct();};
  toastT=setTimeout(()=>{t.hidden=true;const ex=t._exp;t._exp=null;if(!used&&ex)ex();},ms||6000);}
function openModal(title,html,mount){document.body.style.overflow='hidden';$('#mtitle').textContent=title;$('#mbody').innerHTML=html;$('#ov').hidden=false;if(mount)mount($('#mbody'));const f=$('#mbody').querySelector('input,select,textarea,button');if(f&&window.innerWidth>700)f.focus();}
function closeModal(){document.body.style.overflow='';$('#ov').hidden=true;$('#mbody').innerHTML='';}
$('#ov').addEventListener('click',e=>{if(e.target.id==='ov')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#ov').hidden)closeModal();});

const NAV=[['home','בית','home'],['fuel','דלק','fuel'],['service','טיפולים','wrench'],['expense','הוצאות','receipt'],['reminder','תזכורות','bell'],['agents','סוכנים','spark']];
const scroller=()=>$('#scroller');
const scrollMem={};
function renderNav(instant){
  const nav=$('#nav');
  if(!nav.querySelector('button')){
    nav.innerHTML='<i class="nav-ind instant" id="navInd"></i>'+NAV.map(([k,l,i])=>`<button data-nav="${k}">${I(i)}<span>${l}</span></button>`).join('');
    instant=true;
  }
  try{document.body.dataset.view=view;}catch(e){}
  nav.querySelectorAll('button').forEach(b=>{if(b.dataset.nav===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  placeInd(instant);
}
function placeInd(instant){
  const ind=$('#navInd'),b=$('#nav')&&$('#nav').querySelector('[aria-current="page"]');if(!ind||!b)return;
  if(instant)ind.classList.add('instant');
  ind.style.width=b.offsetWidth+'px';ind.style.transform=`translateX(${b.offsetLeft}px)`;
  if(instant){void ind.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>ind.classList.remove('instant')));}
}
window.addEventListener('resize',()=>placeInd(true));
function animateView(kind){
  const v=$('#view');v.classList.remove('in-fwd','in-back','in-first');void v.offsetWidth;
  [...v.children].forEach((c,i)=>c.style.setProperty('--k',Math.min(i,8)));
  v.classList.add('in-'+kind);
  clearTimeout(animateView.t);animateView.t=setTimeout(()=>v.classList.remove('in-'+kind),1600);
}
function go(v){
  if(v===view){try{scroller().scrollTo({top:0,behavior:'smooth'})}catch(e){scroller().scrollTop=0}return;}
  const oi=NAV.findIndex(x=>x[0]===view),ni=NAV.findIndex(x=>x[0]===v);
  scrollMem[view]=scroller().scrollTop;
  view=v;try{history.replaceState(null,'','#'+v)}catch(e){try{location.hash=v}catch(_){}}
  renderNav();
  if(rq){cancelAnimationFrame(rq);rq=0;}
  renderNow();
  scroller().scrollTop=scrollMem[v]||0;
  animateView(ni>oi?'fwd':'back');
}

/* ---------- charts ---------- */
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v)));const m=v/p;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p;}
function lineChart(pts,{h=200,fmt=v=>nf1.format(v),unit=''}={}){
  if(pts.length<2) return `<div class="empty">הגרף יופיע אחרי עוד תדלוק מלא עם קילומטראז׳</div>`;
  const W=380,H=h,L=44,R=14,T=16,B=24;
  const ys=pts.map(p=>p.y);let lo=Math.min(...ys),hi=Math.max(...ys);
  const span=(hi-lo)||hi*.1||1;lo=Math.max(0,lo-span*.25);hi=hi+span*.25;
  const X=i=>L+(W-L-R)*(pts.length===1?.5:i/(pts.length-1));
  const Y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo));
  const grid=[lo,(lo+hi)/2,hi].map(v=>`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line-soft)"/><text x="${L-8}" y="${Y(v)+3.5}" text-anchor="end">${fmt(v)}</text>`).join('');
  const d=pts.map((p,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area=`${d}L${X(pts.length-1)},${H-B}L${X(0)},${H-B}Z`;
  const step=Math.ceil(pts.length/5);
  const xl=pts.map((p,i)=>(i%step===0||i===pts.length-1)?`<text x="${X(i)}" y="${H-8}" text-anchor="${i===0?'start':i===pts.length-1?'end':'middle'}">${esc(p.label)}</text>`:'').join('');
  const last=pts[pts.length-1];
  const id='g'+Math.random().toString(36).slice(2,7);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="גרף ${unit}"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#${id})"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>${pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.y)}" r="${i===pts.length-1?4.5:2.5}" fill="${i===pts.length-1?'var(--accent)':'var(--surface)'}" stroke="var(--accent)" stroke-width="1.5"/>`).join('')}<text x="${X(pts.length-1)}" y="${Y(last.y)-10}" text-anchor="end" style="fill:var(--fg)">${fmt(last.y)}</text>${xl}</svg>`;
}
function spark(vals){
  if(vals.length<2) return '';
  const W=200,H=34;let lo=Math.min(...vals),hi=Math.max(...vals);if(hi===lo){hi+=1;lo-=1;}
  const X=i=>2+(W-4)*i/(vals.length-1),Y=v=>3+(H-6)*(1-(v-lo)/(hi-lo));
  const d=vals.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}L${W-2},${H}L2,${H}Z" fill="var(--accent-soft)"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}
const SERIES=[['fuel','דלק','var(--accent)'],['service','טיפולים','var(--ok)'],['other','שאר ההוצאות','var(--muted)']];
function barsChart(months){
  const sp=allSpend();const data=months.map(m=>{const o={m,fuel:0,service:0,other:0};for(const r of sp)if(monthKey(r.date)===m){const k=r.cat==='fuel'?'fuel':r.cat==='service'?'service':'other';o[k]+=r.amount;}o.t=o.fuel+o.service+o.other;return o;});
  const W=380,H=230,L=50,R=6,T=18,B=24;const mx=niceMax(Math.max(...data.map(d=>d.t),1));
  const bw=(W-L-R)/data.length;const Y=v=>T+(H-T-B)*(1-v/mx);
  const grid=[0,mx/2,mx].map(v=>`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line-soft)"/><text x="${L-8}" y="${Y(v)+3.5}" text-anchor="end">${ils(v)}</text>`).join('');
  const bars=data.map((d,i)=>{let y0=Y(0),out='';const x=L+i*bw+bw*.22,w=bw*.56;
    for(const [k,,c] of SERIES){if(!d[k])continue;const h=y0-Y(d[k]);out+=`<rect x="${x}" y="${y0-h}" width="${w}" height="${Math.max(h,0)}" fill="${c}" rx="2"><title>${esc(monthName(d.m))}: ${ils(d[k])}</title></rect>`;y0-=h;}
    return out+`<text x="${x+w/2}" y="${H-8}" text-anchor="middle">${esc(monthName(d.m))}</text>`+(d.t?`<text x="${x+w/2}" y="${y0-5}" text-anchor="middle" style="fill:var(--fg)">${ils(d.t)}</text>`:'');}).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="הוצאות לפי חודש">${grid}${bars}</svg><div class="legend">${SERIES.map(([,l,c])=>`<span><i style="background:${c}"></i>${l}</span>`).join('')}</div>`;
}
function gauge(st,r){
  const cx=130,cy=118,R=98,SW=240;
  const pt=t=>{const a=(210-SW*t)*Math.PI/180;return [cx+R*Math.cos(a),cy-R*Math.sin(a)];};
  const arc=(t0,t1)=>{const [x0,y0]=pt(t0),[x1,y1]=pt(t1);return `M${x0.toFixed(2)},${y0.toFixed(2)}A${R},${R} 0 ${SW*(t1-t0)>180?1:0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;};
  const rem=Math.max(0,1-st.pct);
  const col=st.status==='over'?'var(--crit)':st.status==='soon'?'var(--warn)':'var(--accent)';
  let ticks='';for(let i=0;i<=20;i++){const t=i/20,a=(210-SW*t)*Math.PI/180,r1=R-14,r2=i%5===0?R-24:R-19;ticks+=`<line x1="${cx+r1*Math.cos(a)}" y1="${cy-r1*Math.sin(a)}" x2="${cx+r2*Math.cos(a)}" y2="${cy-r2*Math.sin(a)}" stroke="var(--faint)" stroke-width="${i%5===0?1.6:1}"/>`;}
  const big=st.kmBinding?km(Math.abs(st.kmLeft)):st.daysLeft!==null?String(Math.abs(st.daysLeft)):'—';
  const unit=st.kmBinding?'ק״מ':'ימים';
  const sub=st.status==='over'?'באיחור':'נותרו';
  const [ex,ey]=pt(1),[sx,sy]=pt(0);
  return `<svg class="gauge" viewBox="0 0 260 200" role="img" aria-label="${esc(r.title)}: ${esc(st.label)}">
   <path d="${arc(0,1)}" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round"/>
   ${rem>0.005?`<path class="gauge-arc" pathLength="1" d="${arc(0,rem)}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round"/>`:''}
   ${ticks}
   <text x="${cx}" y="${cy-14}" text-anchor="middle" font-size="12" style="fill:var(--muted);font-family:var(--f-body)">${sub}</text>
   <text x="${cx}" y="${cy+20}" text-anchor="middle" font-size="38" style="fill:var(--fg)">${big}</text>
   <text x="${cx}" y="${cy+42}" text-anchor="middle" font-size="12" style="fill:var(--muted);font-family:var(--f-body)">${unit}</text>
   <text x="${sx+4}" y="${sy+22}" text-anchor="middle" font-size="11" style="fill:var(--faint)">E</text>
   <text x="${ex-4}" y="${ey+22}" text-anchor="middle" font-size="11" style="fill:var(--faint)">F</text>
  </svg>`;
}

/* ---------- pieces ---------- */
function plate(p){const s=esc(p||'00-000-00');return `<span class="plate" aria-label="מספר רישוי ${s}"><span class="il">IL<br>ישראל</span><span class="no">${s}</span></span>`;}
function odoDigits(v){const s=String(Math.round(v||0)).padStart(6,'0');let lead=true;return `<div class="odo-digits" aria-label="${km(v)} קילומטר">${[...s].map(c=>{if(c!=='0')lead=false;return `<span class="${lead?'lead':''}">${c}</span>`;}).join('')}<em>ק״מ</em></div>`;}
function rcptChip(rc){return rc?.id?`<button class="chip" data-act="rcpt" data-id="${esc(rc.id)}" data-type="${esc(rc.type||'')}">${I('receipt')}קבלה</button>`:'';}
function remRow(x,compact){
  const {r,st}=x;
  const due=st.dueDate?`צפוי ${fmtD(st.dueDate)}`:'';
  const intervals=[n(r.intervalKm)?`כל ${km(r.intervalKm)} ק״מ`:'',n(r.intervalDays)?`כל ${daysLabel(r.intervalDays)}`:''].filter(Boolean).join(' או ');
  return `<div class="rrow${compact?'':' full'}" data-s="${st.status}">
    <div class="ricon">${I(iconFor(r.title,r.kind))}</div>
    <div style="min-width:0"><div class="rtitle">${esc(r.title)}</div>
      <div class="rsub"><span class="pill ${st.status}">${esc(st.label)}</span>${!compact&&intervals?`<span class="nw">${esc(intervals)}</span>`:''}${due?`<span class="nw">${esc(due)}</span>`:''}</div>
      <div class="bar"><i style="width:${Math.round(st.pct*100)}%"></i></div></div>
    <div class="racts">
      <button class="btn sm" data-act="done" data-id="${r.id}">${I('check')}בוצע</button>
      ${st.status!=='ok'||st.snoozed?`<button class="mini" data-act="snooze" data-id="${r.id}" aria-label="דחייה">${I('clock')}</button>`:''}
      ${compact?'':`<button class="mini" data-act="cal" data-id="${r.id}" title="הוספה ליומן Google" aria-label="הוספה ליומן">${I('cal')}</button><button class="mini" data-act="editRem" data-id="${r.id}" aria-label="עריכה">${I('edit')}</button>`}
    </div></div>`;
}
function daysLabel(d){d=+d;if(d%365===0)return d===365?'שנה':`${d/365} שנים`;if(d%30===0)return d===30?'חודש':`${d/30} חודשים`;if(d%7===0)return d===7?'שבוע':`${d/7} שבועות`;return `${d} ימים`;}

/* ===== 02-views.js ===== */
/* ---------- views ---------- */
let rq=0;
function render(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;renderNow();});}
function movedScreen(){
  $('#banner').innerHTML='';
  $('#view').innerHTML=`<div class="card docs-empty" style="margin-top:12px"><img src="${$('.brand .mark')?.src||''}" alt="" width="84" height="84" style="border-radius:22px">
    <b style="font-size:20px">היומן עבר לאפליקציה העצמאית</b>
    <p>כל הנתונים שלך נמצאים שם, עם כל התכונות החדשות: ביטוח ומסמכים, שני רכבים, התראות לטלפון וקריאת קבלות משופרת. הגרסה הזאת בתוך Claude כבר לא שומרת שינויים, כדי שלא יהיו שני יומנים שונים.</p>
    <a class="btn primary" href="${APP_URL}" target="_blank" rel="noopener">${I('send')}פתיחת היומן</a>
    <p class="small">כדאי להוסיף אותו למסך הבית: ב־Safari לוחצים שיתוף ← ״הוספה למסך הבית״.</p></div>`;
  const nav=$('#nav');if(nav)nav.hidden=true;document.querySelectorAll('.top-actions,.fab,#fabFuel').forEach(x=>x.hidden=true);
}
function renderNow(){
  const v=$('#view');
  if(!window.cjSB){movedScreen();return;}
  renderBanner();
  if(S.noDb){v.innerHTML=`<div class="card empty"><b>היומן לא מצליח להתחבר למאגר הנתונים</b>פתח את הדף מחשבון Claude מחובר כדי לשמור ולקרוא את הנתונים של הרכב.</div>`;return;}
  if(S.ready.size<COLS.length&&!S.offline){return;}
  const car=S.car;
  {const sl=$('#subline');sl.textContent=car?[car.make,car.model,car.year].filter(Boolean).join(' · '):'המוסך הפרטי שלך';const cb=$('#carBtn');if(cb){cb.hidden=!(window.cjAccount&&car&&!car.example);cb.textContent=S.cars.length>1?(PLAN==='business'?'הצי ('+S.cars.length+')':'החלפת רכב'):'+ רכב';cb.setAttribute('aria-label',S.cars.length>1?'החלפת רכב':'הוספת רכב');}}
  {const sp=$('#spSub');if(sp&&car&&car.make)sp.textContent=[car.make,car.model,car.year].filter(Boolean).join(' · ');}
  if(view==='agents'&&chatBusy) return;
  if(view==='home'&&insightBusy) return;
  const biz=isBiz(),fleet=biz&&view==='home'&&FLEET_VIEW;
  try{document.body.dataset.fleet=fleet?'1':'';}catch(e){}
  const fn=fleet?vFleet:biz&&view==='home'?()=>fleetToggle()+vHome():{home:vHome,fuel:vFuel,service:vService,expense:vExpense,reminder:vReminder,agents:vAgents}[view]||vHome;
  const keepChat=view==='agents'?captureChat():null;
  v.innerHTML=fn();
  if(keepChat) restoreChat(keepChat);
  if(view==='agents'&&agTab==='agents') fillAgentQuota();
}
const APP_URL='https://adircordoba24-svg.github.io/car-journal/';
let PENDING=0;window.addEventListener('cj-queue',e=>{const was=PENDING;PENDING=e.detail||0;if(was&&!PENDING)toast('כל השינויים נשלחו');render();});
function renderBanner(){
  const b=$('#banner');
  if(window.cjSB&&PENDING>0){b.innerHTML=`<div class="banner warn"><span><b>אין קליטה.</b> ${PENDING===1?'שינוי אחד נשמר':PENDING+' שינויים נשמרו'} בטלפון ${PENDING===1?'ויישלח':'ויישלחו'} אוטומטית כשהחיבור יחזור.</span></div>`;return;}
  if(!window.cjSB&&!S.noDb){b.innerHTML=`<div class="banner"><span><b>היומן עבר לאפליקציה העצמאית.</b> כל הנתונים נמצאים שם, והגרסה הזאת לא מתעדכנת יותר.</span><a class="btn primary sm" href="${APP_URL}" target="_blank" rel="noopener">${I('home')}פתיחת האפליקציה</a></div>`;return;}
  if(S.offline&&!S.noDb){b.innerHTML=`<div class="banner warn">המאגר לא עונה כרגע, ייתכן שהנתונים שמוצגים לא מעודכנים. השינויים יישמרו כשהחיבור יחזור.</div>`;return;}
  if(S.car?.example){b.innerHTML=`<div class="banner"><span><b>אלה נתוני דוגמה</b> כדי שתראה איך היומן עובד. כשתגדיר את הרכב שלך, הדוגמאות יימחקו.</span><button class="btn primary sm" data-act="setup">${I('edit')}הגדרת הרכב שלי</button></div>`;return;}
  if(!S.car&&S.ready.size===COLS.length){maybeOnboard();b.innerHTML=`<div class="banner"><span><b>ברוך הבא.</b> נתחיל בפרטי הרכב ובקילומטראז׳ הנוכחי.</span><button class="btn primary sm" data-act="onboard">${I('plus')}הגדרת הרכב</button></div>`;return;}
  {let dis=false;try{dis=localStorage.getItem('cj-install-hint')==='1';}catch(e){}
   const ios=/iPad|iPhone|iPod/.test(navigator.userAgent),standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
   if(S.car&&view==='home'&&ios&&!standalone&&!dis){b.innerHTML=`<div class="banner"><span><b>התקן את היומן בטלפון.</b> ככה הוא נפתח כמו אפליקציה ושולח התראות לפני טיפול, טסט וביטוח.</span><span style="display:flex;gap:6px"><button class="btn primary sm" data-act="installHint">איך?</button><button class="btn ghost sm" data-act="installHintX" aria-label="סגירה">✕</button></span></div>`;return;}}
  b.innerHTML='';
}

const mqPhone=window.matchMedia?matchMedia('(max-width:600px)'):{matches:false};
try{mqPhone.addEventListener('change',()=>render());}catch(e){}
function miniRing(st){
  const R=26,c=32,rem=Math.max(0,1-st.pct);
  const col=st.status==='over'?'var(--crit)':st.status==='soon'?'var(--warn)':'var(--accent)';
  const a=t=>{const g=(90-360*t)*Math.PI/180;return [(c+R*Math.cos(g)).toFixed(2),(c-R*Math.sin(g)).toFixed(2)];};
  let arc='';
  if(st.status==='over') arc=`<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="${col}" stroke-width="5" stroke-dasharray="3 4" opacity=".85"/>`;
  else if(rem>0.995) arc=`<circle class="gauge-arc" pathLength="1" cx="${c}" cy="${c}" r="${R}" fill="none" stroke="${col}" stroke-width="5" transform="rotate(-90 32 32)"/>`;
  else if(rem>0.005){const [x0,y0]=a(0),[x1,y1]=a(rem);arc=`<path class="gauge-arc" pathLength="1" d="M${x0},${y0}A${R},${R} 0 ${rem>.5?1:0} 1 ${x1},${y1}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`;}
  const big=st.kmBinding?km(Math.abs(st.kmLeft)):st.daysLeft!==null?String(Math.abs(st.daysLeft)):'—';
  const unit=st.kmBinding?'ק״מ':'ימים';
  return `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="var(--line)" stroke-width="5"/>${arc}<text x="32" y="33" text-anchor="middle" font-size="${big.length>4?11:15}" style="fill:var(--fg);font-family:var(--f-mono)">${big}</text><text x="32" y="44" text-anchor="middle" font-size="8" style="fill:var(--muted);font-family:var(--f-body)">${unit}</text></svg>`;
}
function feedItem(r){return `<div class="fitem"><div class="ic">${I(CAT_ICON[r.cat]||'receipt')}</div><div style="min-width:0"><div class="rtitle">${esc(r.title)}</div><div class="rsub"><span>${fmtD(r.date)}</span><span>${esc(CATS[r.cat]||'')}</span>${r.src==='fuel'&&r.rec.liters?`<span>${nf1.format(r.rec.liters)} ל׳</span>`:''}${r.src==='fuel'&&!n(r.rec.odo)?`<span class="pill soon">חסר ק״מ</span>`:''}</div></div><div class="amt">${ils(r.amount)}</div></div>`;}
function noKmFuel(){return S.fuel.filter(f=>!n(f.odo)&&f.date>=addDays(today(),-90)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));}
function noKmBanner(cls){const nk=noKmFuel();if(!nk.length)return '';return `<section class="banner warn ${cls||''}"><span>${nk.length===1?`לתדלוק מ־${fmtD(nk[0].date)} חסר קילומטראז׳.`:`ל־${nk.length} תדלוקים חסר קילומטראז׳.`} בלי זה הצריכה לא מחושבת.</span><button class="btn sm primary" data-act="fuelForm" data-id="${nk[0].id}">${I('edit')}הוספת ק״מ</button></section>`;}
function vHomeMobile(){
  const car=S.car||{};const o=odo();
  const svc=sortedReminders(r=>r.kind!=='check');const top=svc[0];
  const ck=sortedReminders(r=>r.kind==='check')[0];
  const eff=effStats();const sp=allSpend();const thisM=monthKey(today());
  const mSpend=sp.filter(r=>monthKey(r.date)===thisM).reduce((s,r)=>s+r.amount,0);
  const docs=sortedReminders(r=>/טסט/.test(r.title))[0];
  const attn=svc.filter(x=>x.st.status!=='ok').slice(0,3);
  return `
  <section class="card m m-hero">
    <div class="m-car"><div style="min-width:0"><div class="eyebrow">${esc(car.nickname||'הרכב שלי')}</div><div class="m-carname">${esc([car.make,car.model].filter(Boolean).join(' ')||'רכב חדש')}</div></div>${plate(car.plate)}</div>
    <button class="m-odo" data-act="odo" aria-label="עדכון מד אוץ">${odoDigits(o)}<span class="m-odo-edit">${I('edit')}</span></button>
    <div class="m-next">
      ${top?`<button class="m-tile" data-nav="reminder" data-s="${top.st.status}">${miniRing(top.st)}<span class="m-tile-txt"><span class="eyebrow">טיפול הבא</span><b>${esc(top.r.title)}</b><span class="pill ${top.st.status}">${esc(top.st.label)}</span></span></button>`:''}
      ${ck?`<div class="m-tile" data-s="${ck.st.status}">${miniRing(ck.st)}<span class="m-tile-txt"><span class="eyebrow">בדיקה הבאה</span><b>${esc(ck.r.title)}</b><button class="btn sm" data-act="done" data-id="${ck.r.id}">${I('check')}בדקתי</button></span></div>`:''}
    </div>
  </section>
  <section class="m m-actions four">
    <button class="m-act primary" data-act="fuelQuick">${I('fuel')}<span>תדלוק</span></button>
    <button class="m-act" data-act="checks">${I('oil')}<span>בדיקה</span></button>
    <button class="m-act" data-act="voice" ${sample?'':'disabled'}>${I('mic')}<span>בקול</span></button>
    <button class="m-act" data-act="quick">${I('plus')}<span>רישום</span></button>
  </section>
  ${noKmBanner('m')}
  <section class="m m-kpis" aria-label="נתונים">
    <div class="card kpi"><div class="eyebrow">ק״מ לליטר</div><div class="v">${eff?nf1.format(eff.avg):'—'}</div><div class="d">${eff?'ממוצע':'אחרי 2 מילויים מלאים'}</div></div>
    <div class="card kpi"><div class="eyebrow">החודש</div><div class="v">${ils(mSpend)}</div><div class="d">הוצאות</div></div>
    <div class="card kpi"><div class="eyebrow">טסט</div><div class="v">${docs&&docs.st.daysLeft!==null?(docs.st.daysLeft<0?'עבר':docs.st.daysLeft):'—'}${docs&&docs.st.daysLeft>=0?'<small>ימים</small>':''}</div><div class="d">${docs?'עד '+fmtD(docs.st.dueDate):''}</div></div>
    <div class="card kpi"><div class="eyebrow">נסיעה</div><div class="v">${km(kmPerDay())}<small>ק״מ</small></div><div class="d">ביום בממוצע</div></div>
  </section>
  <section class="card m"><div class="card-head"><h2>דורש תשומת לב</h2><button class="link" data-nav="reminder">הכול</button></div>
    <div class="rlist">${attn.map(x=>remRow(x,true)).join('')||'<div class="empty"><b>הכול תקין</b>אין טיפולים שמגיעים בקרוב</div>'}</div></section>
  <section class="card m"><div class="card-head"><h2>אחרונים</h2><button class="link" data-nav="expense">הכול</button></div>
    <div class="feed">${sp.slice(0,3).map(feedItem).join('')||'<div class="empty">עוד לא נרשם כלום</div>'}</div></section>
  <section class="card m"><div class="card-head"><h2>תובנות הסוכן</h2><button class="btn sm" data-act="insight">${I('spark')}ניתוח</button></div>
    <div class="insight" id="insight">${lastInsight||'<span class="muted small">סיכום קצר של הצריכה וההוצאות, ומה כדאי לעשות החודש.</span>'}</div></section>`;
}
function vHome(){
  if(mqPhone.matches) return vHomeMobile();
  const car=S.car||{};const o=odo();
  const urgent=sortedReminders(r=>r.kind!=='check');
  const top=urgent[0];
  const eff=effStats();
  const thisM=monthKey(today());const sp=allSpend();
  const mSpend=sp.filter(r=>monthKey(r.date)===thisM).reduce((s,r)=>s+r.amount,0);
  const yCut=addDays(today(),-365);const ySp=sp.filter(r=>r.date>=yCut);
  const yTotal=ySp.reduce((s,r)=>s+r.amount,0);
  const odoPts=[...S.fuel,...S.service].filter(r=>r.date>=yCut&&n(r.odo)).map(r=>r.odo);
  const kmYear=odoPts.length>1?Math.max(...odoPts)-Math.min(...odoPts):0;
  const cpk=kmYear>200?yTotal/kmYear:null;
  const docs=sortedReminders(r=>/טסט/.test(r.title))[0];
  const checks=sortedReminders(r=>r.kind==='check');
  const feed=sp.slice(0,6);
  const effDelta=eff&&eff.prev?eff.last-eff.prev:null;
  return `
  <section class="hero">
    <div class="card carcard">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
        <div><div class="eyebrow">${esc(car.nickname||'הרכב שלי')}</div><div class="carname">${esc([car.make,car.model].filter(Boolean).join(' ')||'רכב חדש')}</div>
        <div class="carmeta">${esc([car.year,car.fuelType?('דלק '+car.fuelType):'',car.tankL?`מכל ${car.tankL} ל׳`:''].filter(Boolean).join(' · '))}</div></div>
        ${plate(car.plate)}
      </div>
      <div class="odo">${odoDigits(o)}<button class="btn sm" data-act="odo">${I('gauge')}עדכון מד אוץ</button></div>
      <div class="small muted">נסיעה ממוצעת: כ־${km(kmPerDay())} ק״מ ביום${car.odoUpdatedAt?` · עודכן ${fmtD(car.odoUpdatedAt)}`:''}</div>
    </div>
    <div class="card gaugecard">
      ${top?gauge(top.st,top.r):`<div class="empty">אין טיפולים מתוזמנים</div>`}
      <div class="gauge-info">
        <div class="eyebrow">הטיפול הקרוב</div>
        ${top?`<h3>${esc(top.r.title)}</h3><div class="when">${esc(top.st.label)}${top.st.dueDate?` · משוער ל־${fmtD(top.st.dueDate)}`:''}</div>
        <div class="acts"><button class="btn primary sm" data-act="done" data-id="${top.r.id}">${I('check')}סימון כבוצע</button><button class="btn sm" data-act="snooze" data-id="${top.r.id}">${I('clock')}דחייה</button><button class="btn sm" data-act="cal" data-id="${top.r.id}">${I('cal')}${mcp?'ליומן Google':'ליומן'}</button></div>`
        :`<h3>הכול מסודר</h3><div class="when">הוסף תזכורת או בקש מהסוכן לבנות תוכנית טיפולים</div><div class="acts"><button class="btn sm" data-nav="agents">${I('spark')}תוכנית טיפולים</button></div>`}
      </div>
    </div>
  </section>
  <section class="kpis">
    <div class="card kpi"><div class="eyebrow">ק״מ לליטר</div><div class="v">${eff?nf1.format(eff.avg):'—'}<small>ממוצע</small></div>
      <div class="d">${eff?`אחרון ${nf1.format(eff.last)}${effDelta!==null?` (${effDelta>=0?'+':''}${nf1.format(effDelta)})`:''}`:'נדרשים שני מילויים מלאים'}</div>${eff?spark(eff.series.slice(-10).map(x=>x.kmpl)):''}</div>
    <div class="card kpi"><div class="eyebrow">הוצאות החודש</div><div class="v">${ils(mSpend)}</div><div class="d">${pd(thisM+'-15').toLocaleDateString('he-IL',{month:'long',year:'numeric'})}</div>${spark(lastMonths(6).map(m=>sp.filter(r=>monthKey(r.date)===m).reduce((s,r)=>s+r.amount,0)))}</div>
    <div class="card kpi"><div class="eyebrow">עלות לק״מ</div><div class="v">${cpk?'₪'+nf2.format(cpk):'—'}</div><div class="d">${cpk?`${ils(yTotal)} על ${km(kmYear)} ק״מ בשנה האחרונה`:'יחושב אחרי כמה רישומים'}</div></div>
    <div class="card kpi"><div class="eyebrow">טסט שנתי</div><div class="v">${docs&&docs.st.daysLeft!==null?(docs.st.daysLeft<0?'עבר':docs.st.daysLeft):'—'}${docs&&docs.st.daysLeft>=0?'<small>ימים</small>':''}</div><div class="d">${docs?`עד ${fmtD(docs.st.dueDate)}`:'הוסף תזכורת טסט'}</div></div>
  </section>
  <section class="two">
    <div class="card"><div class="card-head"><h2>דורש תשומת לב</h2><button class="link" data-nav="reminder">כל התזכורות</button></div>
      <div class="rlist">${urgent.slice(0,5).map(x=>remRow(x,true)).join('')||'<div class="empty">אין תזכורות עדיין</div>'}</div></div>
    <div class="stack">
      <div class="card"><div class="card-head"><h2>בדיקות שוטפות</h2><span class="small muted">שמן, מים ואוויר</span></div>
        <div class="checks">${checks.slice(0,4).map(({r,st})=>`<div class="chk" data-s="${st.status}"><div class="t">${I(iconFor(r.title,'check'))}${esc(r.title)}</div><div class="s">${r.lastDate?`נבדק ${fmtD(r.lastDate)}`:'טרם נבדק'} · <span class="pill ${st.status}">${esc(st.label)}</span></div><button class="btn sm" data-act="done" data-id="${r.id}">${I('check')}בדקתי</button></div>`).join('')||'<div class="empty" style="grid-column:1/-1">אין בדיקות מוגדרות</div>'}</div></div>
      <div class="card"><div class="card-head"><h2>פעילות אחרונה</h2><button class="link" data-nav="expense">כל ההוצאות</button></div>
        <div class="feed">${feed.map(feedItem).join('')||'<div class="empty"><b>עוד לא נרשם כלום</b>לחץ על ״רישום חדש״ כדי לתעד תדלוק או טיפול</div>'}</div></div>
    </div>
  </section>
  <section class="card" style="margin-top:16px">
    <div class="card-head"><h2>תובנות הסוכן</h2><div style="display:flex;gap:8px"><button class="btn sm" data-act="insight">${I('spark')}נתח את הנתונים</button></div></div>
    <div class="insight" id="insight">${lastInsight||`<span class="muted small">הסוכן האנליטי עובר על הצריכה, ההוצאות והטיפולים ומצביע על חריגות, מגמות ודברים שכדאי לעשות החודש.</span>`}</div>
  </section>`;
}

function vFuel(){
  const eff=effStats();const effMap=new Map((eff?.series||[]).map(x=>[x.id,x.kmpl]));
  const rows=[...S.fuel].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.odo||0)-(a.odo||0));
  const ppl=rows.filter(r=>n(r.liters)&&n(r.total)).slice(0,14).reverse().map(r=>({label:fmtD(r.date).replace(/\s?\d{2}$/,''),y:r.total/r.liters}));
  const totL=rows.reduce((s,r)=>s+(n(r.liters)||0),0),totC=rows.reduce((s,r)=>s+(n(r.total)||0),0);
  return `
  <div class="sec-title"><h2>דלק וצריכה</h2><button class="btn primary" data-act="fuelQuick">${I('plus')}תדלוק חדש</button></div>
  ${noKmBanner()}
  <section class="kpis" style="margin-top:0">
    <div class="card kpi"><div class="eyebrow">ממוצע ק״מ לליטר</div><div class="v">${eff?nf1.format(eff.avg):'—'}</div><div class="d">${eff?`${nf1.format(100/eff.avg)} ל׳ ל־100 ק״מ`:''}</div></div>
    <div class="card kpi"><div class="eyebrow">ליטרים שתודלקו</div><div class="v">${km(totL)}<small>ל׳</small></div><div class="d">${rows.length} תדלוקים</div></div>
    <div class="card kpi"><div class="eyebrow">סך עלות דלק</div><div class="v">${ils(totC)}</div><div class="d">${totL?`ממוצע ${ils2(totC/totL)} לליטר`:''}</div></div>
    <div class="card kpi"><div class="eyebrow">טווח משוער במכל</div><div class="v">${eff&&n(S.car?.tankL)?km(eff.avg*S.car.tankL):'—'}<small>ק״מ</small></div><div class="d">${n(S.car?.tankL)?`מכל של ${S.car.tankL} ליטר`:'הגדר נפח מכל'}</div></div>
  </section>
  <section class="two">
    <div class="card"><div class="card-head"><h2>ק״מ לליטר לאורך זמן</h2><span class="small muted">בין מילויים מלאים</span></div>${lineChart((eff?.series||[]).slice(-14).map(x=>({label:fmtD(x.date).replace(/\s?\d{2}$/,''),y:x.kmpl})),{unit:'ק״מ לליטר'})}</div>
    <div class="card"><div class="card-head"><h2>מחיר לליטר</h2><span class="small muted">בתדלוקים שלך</span></div>${lineChart(ppl,{fmt:v=>'₪'+nf2.format(v),unit:'מחיר לליטר'})}</div>
  </section>
  <section class="card" style="margin-top:16px"><div class="card-head"><h2>יומן תדלוקים</h2></div>
  ${rows.length?`<div class="tablewrap"><table class="ledger"><thead><tr><th>תאריך</th><th>תחנה</th><th>ליטרים</th><th>סכום</th><th>לליטר</th><th>ק״מ לליטר</th><th>מד אוץ</th><th></th></tr></thead><tbody>
  ${rows.map(r=>`<tr><td data-label="תאריך">${fmtD(r.date)}</td><td class="wrap">${esc(r.station||'—')}${r.full?'':' <span class="pill neutral">חלקי</span>'}</td><td class="n" data-label="ליטרים">${n(r.liters)?nf1.format(r.liters):'—'}</td><td class="n" data-label="סכום">${ils2(r.total)}</td><td class="n" data-label="לליטר">${n(r.liters)&&n(r.total)?ils2(r.total/r.liters):'—'}</td><td class="n" data-label="ק״מ לליטר">${effMap.has(r.id)?nf1.format(effMap.get(r.id)):'—'}</td><td class="n" data-label="מד אוץ">${n(r.odo)?km(r.odo):'—'}</td><td><div class="rowacts">${rcptChip(r.receipt)}<button class="mini" data-act="fuelForm" data-id="${r.id}" aria-label="עריכה">${I('edit')}</button><button class="mini" data-act="del" data-col="fuel" data-id="${r.id}" aria-label="מחיקה">${I('trash')}</button></div></td></tr>`).join('')}
  </tbody></table></div>`:`<div class="empty"><b>אין תדלוקים עדיין</b>רשום תדלוק ראשון, או צלם קבלה והסוכן ימלא את הפרטים</div>`}</section>`;
}

function vService(){
  const rows=[...S.service].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const sched=sortedReminders(r=>r.kind==='service');
  const tot=rows.reduce((s,r)=>s+(n(r.cost)||0),0);
  return `
  <div class="sec-title"><h2>טיפולים</h2><button class="btn primary" data-act="serviceForm">${I('plus')}רישום טיפול</button></div>
  <section class="two" style="margin-top:0">
    <div class="card"><div class="card-head"><h2>היסטוריית טיפולים</h2><span class="small muted">${rows.length} טיפולים · ${ils(tot)}</span></div>
      <div class="feed">${rows.map(r=>`<div class="fitem"><div class="ic">${I('wrench')}</div><div style="min-width:0"><div class="rtitle">${esc(r.title)}</div><div class="rsub">${fmtD(r.date)} · ${km(r.odo)} ק״מ${r.garage?' · '+esc(r.garage):''}</div>${r.note?`<div class="rsub" style="margin-top:3px">${esc(r.note)}</div>`:''}</div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="amt">${ils(r.cost)}</span><div class="rowacts">${rcptChip(r.receipt)}<button class="mini" data-act="serviceForm" data-id="${r.id}" aria-label="עריכה">${I('edit')}</button><button class="mini" data-act="del" data-col="service" data-id="${r.id}" aria-label="מחיקה">${I('trash')}</button></div></div></div>`).join('')||'<div class="empty"><b>אין טיפולים רשומים</b>תעד טיפול במוסך כדי לעקוב אחרי ההיסטוריה של הרכב</div>'}</div></div>
    <div class="card"><div class="card-head"><h2>לוח טיפולים</h2><button class="link" data-act="remForm" data-kind="service">הוספה</button></div>
      <div class="rlist">${sched.map(x=>remRow(x,true)).join('')||'<div class="empty">אין טיפולים מתוזמנים</div>'}</div></div>
  </section>`;
}

function vExpense(){
  const sp=allSpend();const yCut=addDays(today(),-365);
  const byCat={};for(const r of sp.filter(r=>r.date>=yCut)) byCat[r.cat]=(byCat[r.cat]||0)+r.amount;
  const catRows=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);const mx=Math.max(1,...catRows.map(c=>c[1]));
  const yTot=catRows.reduce((s,c)=>s+c[1],0);
  const rcpts=sp.filter(r=>r.rec.receipt?.id).slice(0,24);
  return `
  <div class="sec-title"><h2>הוצאות וקבלות</h2><button class="btn primary" data-act="expenseForm">${I('plus')}הוצאה חדשה</button></div>
  <section class="two" style="margin-top:0">
    <div class="card"><div class="card-head"><h2>לפי חודש</h2><span class="small muted">6 חודשים אחרונים</span></div>${barsChart(lastMonths(6))}</div>
    <div class="card"><div class="card-head"><h2>לפי קטגוריה</h2><span class="small muted">שנה אחרונה · ${ils(yTot)}</span></div>
      <div class="cats">${catRows.map(([c,v])=>`<div class="cat"><div class="row"><span>${esc(CATS[c]||c)}</span><span class="num">${ils(v)} <span class="muted small">${Math.round(v/yTot*100)}%</span></span></div><div class="bar"><i style="width:${v/mx*100}%"></i></div></div>`).join('')||'<div class="empty">אין הוצאות בשנה האחרונה</div>'}</div></div>
  </section>
  <section class="card" style="margin-top:16px"><div class="card-head"><h2>ארכיון קבלות</h2><span class="small muted">${rcpts.length} קבלות שמורות</span></div>
    ${rcpts.length?`<div class="receipts">${rcpts.map(r=>{const img=(r.rec.receipt.type||'').startsWith('image/');return `<button class="rcpt" data-act="rcpt" data-id="${esc(r.rec.receipt.id)}" data-type="${esc(r.rec.receipt.type||'')}"><div class="img" ${img?`style="background-image:url('${rcptSrc(r.rec.receipt.id)}')"`:''}>${img?'':I('doc')}</div><div class="cap"><b>${esc(r.title)}</b><span class="muted">${fmtD(r.date)} · ${ils(r.amount)}</span></div></button>`;}).join('')}</div>`:`<div class="empty"><b>עוד אין קבלות</b>צרף תמונה או PDF כשאתה רושם תדלוק, טיפול או הוצאה</div>`}
  </section>
  <section class="card" style="margin-top:16px"><div class="card-head"><h2>כל ההוצאות</h2></div>
  ${sp.length?`<div class="tablewrap"><table class="ledger"><thead><tr><th>תאריך</th><th>תיאור</th><th>קטגוריה</th><th>סכום</th><th></th></tr></thead><tbody>
  ${sp.slice(0,80).map(r=>`<tr><td data-label="תאריך">${fmtD(r.date)}</td><td class="wrap">${esc(r.title)}</td><td data-label="קטגוריה">${esc(CATS[r.cat]||'')}</td><td class="n" data-label="סכום">${ils2(r.amount)}</td><td><div class="rowacts">${rcptChip(r.rec.receipt)}<button class="mini" data-act="${r.src}Form" data-id="${r.rec.id}" aria-label="עריכה">${I('edit')}</button><button class="mini" data-act="del" data-col="${r.src}" data-id="${r.rec.id}" aria-label="מחיקה">${I('trash')}</button></div></td></tr>`).join('')}
  </tbody></table></div>`:'<div class="empty">אין הוצאות רשומות</div>'}</section>`;
}

function vReminder(){
  const groups=['service','check','doc'];
  return `<div class="sec-title"><h2>תזכורות</h2><button class="btn primary" data-act="remForm">${I('plus')}תזכורת חדשה</button></div>
  <p class="muted small" style="margin:-4px 0 16px;max-width:65ch">כל תזכורת נמדדת לפי קילומטרים, לפי זמן, או לפי מה שמגיע קודם. המועד המשוער מחושב לפי קצב הנסיעה שלך. ${window.cjPush?'כשמגיע המועד, היומן שולח התראה לטלפון (מפעילים ב״החשבון שלי״). אפשר גם להוסיף תזכורת ליומן של הטלפון.':'אפשר לשלוח כל תזכורת ליומן Google כדי לקבל התראה בטלפון.'}</p>
  <div class="stack">${groups.map(g=>{const list=sortedReminders(r=>(r.kind||'service')===g);return `<section class="card"><div class="card-head"><h2>${KIND[g]}</h2><button class="link" data-act="remForm" data-kind="${g}">הוספה</button></div><div class="rlist">${list.map(x=>remRow(x,false)).join('')||'<div class="empty">אין תזכורות בקבוצה הזו</div>'}</div></section>`;}).join('')}</div>`;
}

let lastInsight='',insightBusy=false;
let agTab='agents';try{if(location.hash==='#docs')agTab='docs';if(location.hash==='#tickets')agTab='tickets';}catch(e){}
function agTabs(){const t=(id,ic,l)=>`<button type="button" role="tab" aria-selected="${agTab===id}" class="${agTab===id?'on':''}" data-act="agtab" data-id="${id}">${I(ic)}${l}</button>`;
  return `<div class="seg agtabs" role="tablist" aria-label="סוכנים, מסמכים ודוחות">${t('agents','spark','סוכנים')}${t('docs','shield','מסמכים')}${t('tickets','ticket','דוחות')}</div>`;}
function vAgents(){
  if(agTab==='docs')return agTabs()+vDocs();
  if(agTab==='tickets')return agTabs()+vTickets();
  const off=!sample;
  return agTabs()+`<div class="sec-title"><h2>סוכנים</h2><span class="small muted">עוזרים חכמים שעובדים על הנתונים של הרכב שלך</span></div>
  ${off?`<div class="banner warn">הסוכנים זמינים כשהדף פתוח ב־Claude עם חשבון מחובר.</div>`:''}
  ${window.cjAccount?`<div class="small muted" id="agQuota" style="margin:-4px 0 14px"></div>`:''}
  <section class="agents">
    <div class="card agent"><div class="badge">${I('cam')}</div><h3>סוכן הקבלות</h3><p>צלם קבלה מהתחנה או מהמוסך. הסוכן יזהה אם זה תדלוק, טיפול או הוצאה, ימלא סכום, ליטרים, תאריך ותחנה, ויצרף את הקבלה לרישום.</p><button class="btn primary" data-act="scan" ${off||!imgOK?'disabled':''}>${I('cam')}סריקת קבלה</button>${!off&&!imgOK?'<span class="small muted">סריקת תמונות לא זמינה בתצוגה הזו</span>':''}</div>
    <div class="card agent"><div class="badge">${I('list')}</div><h3>מתכנן הטיפולים</h3><p>לפי היצרן, הדגם, השנה והקילומטראז׳, הסוכן בונה לוח טיפולים מומלץ עם מרווחים בק״מ ובזמן. אתה בוחר מה להוסיף לתזכורות.</p><button class="btn primary" data-act="plan" ${off?'disabled':''}>${I('spark')}בניית תוכנית</button></div>
    <div class="card agent"><div class="badge">${I('chart')}</div><h3>האנליסט</h3><p>סוקר את הצריכה, המחירים וההוצאות, מאתר חריגות כמו ירידה פתאומית בק״מ לליטר, ומסכם מה כדאי לעשות החודש.</p><button class="btn primary" data-act="insight" ${off?'disabled':''}>${I('chart')}ניתוח עכשיו</button></div>
  </section>
  <section class="card" style="margin-top:16px">
    <div class="card-head"><h2>יועץ הרכב</h2><span class="small muted">שאלות על הרכב והנתונים שלך בלבד</span></div>
    <div class="chat" id="chat">
      <div class="msgs" id="msgs">${chatLog.length?'':`<div class="msg a">שלום! אני מכיר את כל היומן של ${esc(S.car?.nickname||'הרכב')}: תדלוקים, טיפולים, הוצאות ותזכורות. על מה נדבר?</div>`}</div>
      <div class="suggest" id="sugg">${['כמה הוצאתי על הרכב בשלושת החודשים האחרונים?','הצריכה שלי תקינה לדגם הזה?','מה הטיפולים שמחכים לי עד סוף השנה?','סמן שבדקתי היום לחץ אוויר'].map(q=>`<button class="btn sm ghost" data-act="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <form class="composer" id="composer"><input type="text" id="chatIn" placeholder="שאל את יועץ הרכב…" autocomplete="off" ${off?'disabled':''}><button class="btn primary" type="submit" ${off?'disabled':''} aria-label="שליחה">${I('send')}</button></form>
    </div>
  </section>`;
}

/* ===== 03-forms-agents.js ===== */
/* ---------- forms ---------- */
function fileField(label,id){return `<div class="field full"><label>${label}</label><div class="drop" id="${id}Box"><input type="file" id="${id}" accept="image/*,application/pdf"><span id="${id}Txt">${I('receipt')} צרף תמונה או PDF של הקבלה</span></div></div>`;}
function wireFile(root,id,preset){
  const inp=root.querySelector('#'+id),box=root.querySelector('#'+id+'Box'),txt=root.querySelector('#'+id+'Txt');
  const show=f=>{box.classList.add('has');txt.innerHTML=(f.type.startsWith('image/')?`<img class="preview" alt="" src="${URL.createObjectURL(f)}">`:'')+esc(f.name||'קבלה');};
  inp.addEventListener('change',()=>{if(inp.files[0])show(inp.files[0]);});
  if(preset){inp._preset=preset;show(preset);}
  return ()=>inp.files[0]||inp._preset||null;
}
async function uploadReceipt(file){
  if(!file) return null;
  if(!assets) {toast('לא ניתן לשמור קבלות בתצוגה הזו');return null;}
  try{const r=await assets.upload(file);return {id:r.id,type:r.contentType||file.type||'',name:file.name||''};}
  catch(e){if(e&&e.code==='offline'||navigator.onLine===false){toast('אין קליטה: הרישום נשמר בלי הקבלה. אפשר לצרף אותה אחר כך בעריכה');return null;}throw e;}
}
function busy(btn,on,label){if(!btn)return;btn.disabled=on;if(on){btn._l=btn.innerHTML;btn.innerHTML=`<span class="spin"></span>${label||'שומר…'}`;}else if(btn._l)btn.innerHTML=btn._l;}
function fv(root,id){const e=root.querySelector('#'+id);return e?(e.type==='checkbox'?e.checked:e.value.trim()):'';}

/* ---------- reading fuel receipts with the agent ---------- */
const fuelPrompt=()=>`זו תמונה של קבלה על תדלוק, לרוב צילום מסך של חשבונית דיגיטלית מאפליקציית Yellow או קבלה מתחנת דלק בישראל.
איך לקרוא חשבונית של Yellow: הסכום ששולם מופיע בגדול בראש הקבלה (למשל "₪ 205.41") וגם בשורה "סכום לתשלום לאחר הנחות". הכמות מופיעה ליד סוג הדלק בצורה "x 27.947 ל", וזה מספר הליטרים. שם הסניף מופיע מתחת ללוגו (למשל "ויסוצקי"). התאריך מופיע בשורה "תאריך". אסור להשתמש ב"סכום ללא מע״מ", ב"מע״מ" או ב"צבירה" בתור הסכום.
בקבלה של תחנה אחרת: total הוא הסכום הסופי ששולם, כולל מע״מ ואחרי הנחות.
ליטרים: חפש בכל הקבלה מספר עם 2–3 ספרות אחרי הנקודה ליד "ל", "ל'", "ליטר", "ליטרים", "כמות", "L" או ליד סוג הדלק (95, 98, סולר, בנזין). זה כמעט תמיד מופיע, גם בשורה קטנה באמצע הקבלה.
מחיר לליטר: מופיע ליד "מחיר ליטר", "מחיר יחידה", "₪/ל" או כמספר כמו 7.62 ליד הכמות.
תחנה: שם הרשת (Yellow, פז, סונול, דלק, Ten, דור אלון) ושם הסניף מראש הקבלה.
החזר JSON בלבד בצורה {"isFuel":boolean,"date":"YYYY-MM-DD"|null,"total":number|null,"liters":number|null,"pricePerL":number|null,"station":string|null,"invoice":string|null}.
מספרים יוחזרו כמספרי JSON בלבד, בלי ₪, בלי פסיקים ובלי מרכאות. station הוא רשת וסניף, למשל "Yellow ויסוצקי". אם ערך לא מופיע בקבלה, החזר null ואל תנחש. היום ${today()}.`;
function normFuel(r){
  if(!r||r.isFuel===false)return null;
  const o={total:n(r.total),liters:n(r.liters),pricePerL:n(r.pricePerL),station:r.station?String(r.station).trim():null,date:/^\d{4}-\d\d-\d\d$/.test(r.date||'')?r.date:null,invoice:r.invoice?String(r.invoice):null};
  if(!o.total&&o.liters&&o.pricePerL)o.total=+(o.liters*o.pricePerL).toFixed(2);
  if(!o.liters&&o.total&&o.pricePerL)o.liters=+(o.total/o.pricePerL).toFixed(2);
  if(o.total&&o.liters&&(!o.pricePerL||Math.abs(o.liters*o.pricePerL-o.total)>Math.max(2,o.total*0.03)))o.pricePerL=+(o.total/o.liters).toFixed(3);
  return o;
}
async function readFuelReceipt(blob){
  let raw=await sample.json(fuelPrompt(),{images:[blob],modelTier:'default'});let o=normFuel(raw);
  // partial read (amount only): one more careful pass with the stronger model
  if(o&&o.total&&!o.liters&&!o.pricePerL){
    try{const raw2=await sample.json(fuelPrompt()+'\nבקריאה קודמת לא נמצאו הליטרים. קרא שוב בקפידה כל שורה בקבלה.',{images:[blob],modelTier:'complex'});const o2=normFuel(raw2);
      if(o2&&(o2.liters||o2.pricePerL)){o=Object.assign({},o,Object.fromEntries(Object.entries(o2).filter(([k,v])=>v!=null&&v!=='')));raw=raw2;}}catch(e){}
    if(!o.liters&&window.cjReport)window.cjReport('receipt-partial: '+JSON.stringify(raw).slice(0,600),'receipt');
  }
  return o;
}
function aiErr(e,fallback){const c=e&&e.code;
  if(c==='missing_api_key')return 'הסוכן עוד לא מחובר: חסר מפתח API בשרת. אפשר למלא ידנית.';
  if(c==='not_granted')return 'הסוכן לא קיבל הרשאה. אפשר למלא ידנית.';
  if(c==='rate_limited')return 'הסוכן עמוס כרגע. נסה שוב בעוד דקה.';
  if(c==='image_rejected'||c==='images_unavailable')return 'התמונה לא נתמכת. נסה צילום מסך או JPG.';
  if(c==='invalid_json')return 'הסוכן החזיר תשובה לא תקינה. נסה שוב.';
  if(c==='quota_exceeded')return e.kind==='receipt'?'נגמרו צילומי הקבלות לחודש הזה. אפשר למלא ידנית, והמכסה מתחדשת ב־1 לחודש.':e.kind==='analysis'?'נגמרו הניתוחים לחודש הזה. המכסה מתחדשת ב־1 לחודש.':'נגמרה מכסת השיחות לחודש הזה. המכסה מתחדשת ב־1 לחודש.';
  if(window.cjReport&&c!=='cancelled')window.cjReport('ai: '+(c||'')+' '+String(e&&e.message||e).slice(0,300),'ai');
  return fallback||'לא הצלחתי לקרוא את הקבלה. אפשר למלא ידנית.';}
function fuelForm(id,pre,file){
  const r=id?S.fuel.find(x=>x.id===id):Object.assign({date:today(),odo:'',full:true},pre||{});
  openModal(id?'עריכת תדלוק':'תדלוק חדש',`<form id="f"><div class="fgrid">
   <div class="field"><label for="fDate">תאריך</label><input type="date" id="fDate" value="${esc(r.date)}" required></div>
   <div class="field"><label for="fOdo">מד אוץ (ק״מ)</label><input type="number" id="fOdo" inputmode="numeric" value="${esc(r.odo??'')}" placeholder="אחרון: ${km(odo())}"></div>
   <div class="field"><label for="fL">ליטרים</label><input type="number" step="0.01" id="fL" inputmode="decimal" value="${esc(r.liters??'')}"></div>
   <div class="field"><label for="fT">סכום ששולם (₪)</label><input type="number" step="0.01" id="fT" inputmode="decimal" value="${esc(r.total??'')}" required></div>
   <div class="field"><label for="fP">מחיר לליטר (₪)</label><input type="number" step="0.001" id="fP" inputmode="decimal" value="${esc(r.pricePerL??'')}"></div>
   <div class="field"><label for="fS">תחנה</label><input type="text" id="fS" value="${esc(r.station||'')}" placeholder="פז, דלק, סונול…"></div>
   <label class="toggle full"><input type="checkbox" id="fFull" ${r.full!==false?'checked':''}> מילוי מלא של המכל (נדרש לחישוב הצריכה)</label>
   ${fileField('קבלה','fFile')}
   ${id&&r.receipt?.id&&String(r.receipt.type||'').startsWith('image/')&&sample&&imgOK?`<div class="full" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn sm" type="button" id="fRead">${I('spark')}מילוי מהקבלה השמורה</button><span class="small muted" id="fReadSt" aria-live="polite"></span></div>`:''}
   <div class="field full"><label for="fN">הערה</label><input type="text" id="fN" value="${esc(r.note||'')}"></div>
  </div><div class="formacts"><button class="btn primary" type="submit">${I('check')}שמירה</button><button class="btn ghost" type="button" data-act="close">ביטול</button></div></form>`,root=>{
    const getFile=wireFile(root,'fFile',file);
    const rb=root.querySelector('#fRead');
    if(rb)rb.onclick=async()=>{const st=root.querySelector('#fReadSt');busy(rb,true,'הסוכן קורא…');st.textContent='';
      try{const url=window.__rcptUrlAsync?await window.__rcptUrlAsync(r.receipt.id):'/_blob/'+encodeURIComponent(r.receipt.id);
        const blob=await (await fetch(url)).blob();const x=await readFuelReceipt(blob);if(!rb.isConnected)return;
        if(!x){st.textContent='זו לא נראית קבלת דלק';return;}
        const put=(sel,v,dec)=>{const el=root.querySelector(sel);if(v!=null&&!n(el.value))el.value=dec!=null?(+v).toFixed(dec):v;};
        put('#fT',x.total,2);put('#fL',x.liters,2);put('#fP',x.pricePerL,3);
        const sEl=root.querySelector('#fS');if(x.station&&!sEl.value.trim())sEl.value=x.station;
        const tNow=n(root.querySelector('#fT').value);
        st.textContent=x.total&&tNow&&Math.abs(tNow-x.total)>0.05?`מולא מה שהיה חסר. בקבלה כתוב ${ils2(x.total)}, ובשדה ${ils2(tNow)}.`:'הסוכן מילא את מה שהיה חסר. בדוק ושמור.';
      }catch(e){st.textContent=aiErr(e);}finally{busy(rb,false);}};
    const L=root.querySelector('#fL'),T=root.querySelector('#fT'),Pp=root.querySelector('#fP');
    const calc=src=>{const l=n(L.value),t=n(T.value),p=n(Pp.value);
      if(src!=='p'&&l&&t) Pp.value=(t/l).toFixed(3);
      else if(src==='p'&&p&&t&&!l) L.value=(t/p).toFixed(2);
      else if(src==='p'&&p&&l) T.value=(p*l).toFixed(2);};
    L.oninput=()=>calc('l');T.oninput=()=>calc('t');Pp.oninput=()=>calc('p');
    root.querySelector('#f').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||root.querySelector('[type=submit]');busy(btn,true);
      try{const data={date:fv(root,'fDate'),odo:n(fv(root,'fOdo')),liters:n(fv(root,'fL')),total:n(fv(root,'fT')),pricePerL:n(fv(root,'fP')),station:fv(root,'fS'),full:fv(root,'fFull'),note:fv(root,'fN')};
        if(!data.liters&&data.total&&data.pricePerL) data.liters=+(data.total/data.pricePerL).toFixed(2);
        const f=getFile(); const oldRid=id?(((S.fuel.concat(S.service,S.expense)).find(x=>x.id===id)||{}).receipt||{}).id:null; if(f){const rc=await uploadReceipt(f); if(rc) data.receipt=rc;}
        if(id) await updRec('fuel',id,data); else await addRec('fuel',data); if(oldRid&&data.receipt&&data.receipt.id!==oldRid)cleanupReceipt(oldRid,id);
        await bumpOdo(data.odo); closeModal(); toast('התדלוק נשמר');
      }catch(err){console.error(err);busy(btn,false);toast('השמירה נכשלה. בדוק את החיבור ונסה שוב');}};
  });
}
function serviceForm(id,pre,file){
  const r=id?S.service.find(x=>x.id===id):Object.assign({date:today(),odo:odo()||''},pre||{});
  const remOpts=S.reminder.filter(x=>x.kind!=='check');
  openModal(id?'עריכת טיפול':'רישום טיפול',`<form id="f"><div class="fgrid">
   <div class="field full"><label for="sT">מה בוצע</label><input type="text" id="sT" value="${esc(r.title||'')}" placeholder="טיפול 45,000, החלפת רפידות…" required></div>
   <div class="field"><label for="sD">תאריך</label><input type="date" id="sD" value="${esc(r.date)}" required></div>
   <div class="field"><label for="sO">מד אוץ (ק״מ)</label><input type="number" id="sO" value="${esc(r.odo??'')}" required></div>
   <div class="field"><label for="sC">עלות (₪)</label><input type="number" step="0.01" id="sC" value="${esc(r.cost??'')}"></div>
   <div class="field"><label for="sG">מוסך</label><input type="text" id="sG" value="${esc(r.garage||'')}"></div>
   ${remOpts.length&&!id?`<div class="field full"><label>סמן תזכורות שבוצעו בטיפול הזה</label><div style="display:flex;flex-wrap:wrap;gap:8px 16px">${remOpts.map(x=>`<label class="toggle"><input type="checkbox" class="remDone" value="${x.id}" ${pre?.remId===x.id?'checked':''}> ${esc(x.title)}</label>`).join('')}</div></div>`:''}
   ${fileField('חשבונית','sFile')}
   <div class="field full"><label for="sN">פירוט והערות</label><textarea id="sN">${esc(r.note||'')}</textarea></div>
  </div><div class="formacts"><button class="btn primary" type="submit">${I('check')}שמירה</button><button class="btn ghost" type="button" data-act="close">ביטול</button></div></form>`,root=>{
    const getFile=wireFile(root,'sFile',file);
    root.querySelector('#f').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||root.querySelector('[type=submit]');busy(btn,true);
      try{const data={title:fv(root,'sT'),date:fv(root,'sD'),odo:n(fv(root,'sO')),cost:n(fv(root,'sC'))||0,garage:fv(root,'sG'),note:fv(root,'sN')};
        const f=getFile(); const oldRid=id?(((S.fuel.concat(S.service,S.expense)).find(x=>x.id===id)||{}).receipt||{}).id:null; if(f){const rc=await uploadReceipt(f); if(rc) data.receipt=rc;}
        if(id) await updRec('service',id,data); else await addRec('service',data); if(oldRid&&data.receipt&&data.receipt.id!==oldRid)cleanupReceipt(oldRid,id);
        await bumpOdo(data.odo);
        for(const cb of root.querySelectorAll('.remDone:checked')) await markDone(cb.value,data.odo,data.date,true);
        closeModal(); toast('הטיפול נשמר');
      }catch(err){console.error(err);busy(btn,false);toast('השמירה נכשלה. נסה שוב');}};
  });
}
function expenseForm(id,pre,file){
  const r=id?S.expense.find(x=>x.id===id):Object.assign({date:today(),category:'other'},pre||{});
  openModal(id?'עריכת הוצאה':'הוצאה חדשה',`<form id="f"><div class="fgrid">
   <div class="field full"><label for="eT">תיאור</label><input type="text" id="eT" value="${esc(r.title||'')}" placeholder="ביטוח מקיף, חניון, שטיפה…" required></div>
   <div class="field"><label for="eC">קטגוריה</label><select id="eC">${Object.entries(CATS).filter(([k])=>k!=='fuel'&&k!=='service').map(([k,v])=>`<option value="${k}" ${r.category===k?'selected':''}>${v}</option>`).join('')}</select></div>
   <div class="field"><label for="eA">סכום (₪)</label><input type="number" step="0.01" id="eA" value="${esc(r.amount??'')}" required></div>
   <div class="field"><label for="eD">תאריך</label><input type="date" id="eD" value="${esc(r.date)}" required></div>
   <div class="field"><label for="eV">ספק</label><input type="text" id="eV" value="${esc(r.vendor||'')}"></div>
   ${fileField('קבלה או חשבונית','eFile')}
   <div class="field full"><label for="eN">הערה</label><input type="text" id="eN" value="${esc(r.note||'')}"></div>
  </div><div class="formacts"><button class="btn primary" type="submit">${I('check')}שמירה</button><button class="btn ghost" type="button" data-act="close">ביטול</button></div></form>`,root=>{
    const getFile=wireFile(root,'eFile',file);
    root.querySelector('#f').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||root.querySelector('[type=submit]');busy(btn,true);
      try{const data={title:fv(root,'eT'),category:fv(root,'eC'),amount:n(fv(root,'eA'))||0,date:fv(root,'eD'),vendor:fv(root,'eV'),note:fv(root,'eN')};
        const f=getFile(); const oldRid=id?(((S.fuel.concat(S.service,S.expense)).find(x=>x.id===id)||{}).receipt||{}).id:null; if(f){const rc=await uploadReceipt(f); if(rc) data.receipt=rc;}
        if(id) await updRec('expense',id,data); else await addRec('expense',data); if(oldRid&&data.receipt&&data.receipt.id!==oldRid)cleanupReceipt(oldRid,id);
        closeModal(); toast('ההוצאה נשמרה');
      }catch(err){console.error(err);busy(btn,false);toast('השמירה נכשלה. נסה שוב');}};
  });
}
function remForm(id,kind){
  const r=id?S.reminder.find(x=>x.id===id):{kind:kind||'service',lastKm:odo(),lastDate:today()};
  openModal(id?'עריכת תזכורת':'תזכורת חדשה',`<form id="f"><div class="fgrid">
   <div class="field full"><label for="rT">שם</label><input type="text" id="rT" value="${esc(r.title||'')}" placeholder="החלפת שמן, בדיקת לחץ אוויר…" required></div>
   <div class="field full"><label for="rK">סוג</label><select id="rK">${Object.entries(KIND).map(([k,v])=>`<option value="${k}" ${r.kind===k?'selected':''}>${v}</option>`).join('')}</select></div>
   <div class="field"><label for="rIK">כל כמה ק״מ</label><input type="number" id="rIK" value="${esc(r.intervalKm??'')}" placeholder="למשל 10000"></div>
   <div class="field"><label for="rID">כל כמה ימים</label><input type="number" id="rID" value="${esc(r.intervalDays??'')}" placeholder="למשל 365"></div>
   <div class="field"><label for="rLK">בוצע לאחרונה בק״מ</label><input type="number" id="rLK" value="${esc(r.lastKm??'')}"></div>
   <div class="field"><label for="rLD">בוצע לאחרונה בתאריך</label><input type="date" id="rLD" value="${esc(r.lastDate||'')}"></div>
   <div class="field full"><label for="rN">הערה</label><input type="text" id="rN" value="${esc(r.note||'')}"></div>
  </div><div class="formacts"><button class="btn primary" type="submit">${I('check')}שמירה</button>${id?`<button class="btn danger" type="button" data-act="del" data-col="reminder" data-id="${id}">${I('trash')}מחיקה</button>`:''}<button class="btn ghost" type="button" data-act="close">ביטול</button></div></form>`,root=>{
    root.querySelector('#f').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||root.querySelector('[type=submit]');
      const data={title:fv(root,'rT'),kind:fv(root,'rK'),intervalKm:n(fv(root,'rIK')),intervalDays:n(fv(root,'rID')),lastKm:n(fv(root,'rLK')),lastDate:fv(root,'rLD')||today(),note:fv(root,'rN')};
      if(!data.intervalKm&&!data.intervalDays){toast('צריך להגדיר מרווח בק״מ או בימים');return;}
      busy(btn,true);
      try{ if(id) await updRec('reminder',id,data); else await addRec('reminder',data); closeModal(); toast('התזכורת נשמרה'); }
      catch(err){console.error(err);busy(btn,false);toast('השמירה נכשלה. נסה שוב');}};
  });
}
function odoForm(){
  openModal('עדכון מד אוץ',`<form id="f"><div class="field"><label for="oV">קילומטראז׳ נוכחי</label><input type="number" id="oV" inputmode="numeric" value="${odo()}" required></div>
  <p class="small muted">התזכורות לפי ק״מ יתעדכנו מיד. תדלוקים וטיפולים מעדכנים את המד אוטומטית.</p>
  <div class="formacts"><button class="btn primary" type="submit">${I('check')}עדכון</button><button class="btn ghost" type="button" data-act="close">ביטול</button></div></form>`,root=>{
    root.querySelector('#f').onsubmit=async e=>{e.preventDefault();const v=n(fv(root,'oV'));if(!v||!S.car)return;
      try{await updRec('garage',S.car.id,{odometer:v,odoUpdatedAt:today()});closeModal();toast('מד האוץ עודכן');}catch(err){toast('העדכון נכשל');}};
  });
}
function carForm(){
  const c=S.car&&!S.car.example?S.car:{};const ex=!!S.car?.example;
  openModal(ex||!S.car?'הגדרת הרכב שלך':'פרטי הרכב',`<form id="f"><div class="fgrid">
   <div class="field"><label for="cN">כינוי</label><input type="text" id="cN" value="${esc(c.nickname||'')}" placeholder="השחורה, הרכב של אבא…"></div>
   <div class="field"><label for="cP">מספר רישוי</label><input type="text" id="cP" value="${esc(c.plate||'')}" placeholder="12-345-67" dir="ltr"></div>
   <div class="field"><label for="cMk">יצרן</label><input type="text" id="cMk" value="${esc(c.make||'')}" required></div>
   <div class="field"><label for="cMd">דגם</label><input type="text" id="cMd" value="${esc(c.model||'')}" required></div>
   <div class="field"><label for="cY">שנת ייצור</label><input type="number" id="cY" value="${esc(c.year||'')}"></div>
   <div class="field"><label for="cF">סוג דלק</label><select id="cF">${['95','98','סולר','היברידי','פלאג־אין','חשמלי'].map(x=>`<option ${c.fuelType===x?'selected':''}>${x}</option>`).join('')}</select></div>
   <div class="field"><label for="cT">נפח מכל (ליטר)</label><input type="number" id="cT" value="${esc(c.tankL||'')}"></div>
   <div class="field"><label for="cO">קילומטראז׳ נוכחי</label><input type="number" id="cO" value="${esc(c.odometer||'')}" required></div>
   <div class="field"><label for="cPF">לחץ אוויר קדמי (PSI)</label><input type="number" id="cPF" value="${esc(c.psiFront||'')}"></div>
   <div class="field"><label for="cPR">לחץ אוויר אחורי (PSI)</label><input type="number" id="cPR" value="${esc(c.psiRear||'')}"></div>
   ${ex?`<label class="toggle full"><input type="checkbox" id="cReset" checked> לאפס את התזכורות ולהתחיל לספור מהיום ומהקילומטראז׳ הנוכחי</label><p class="small muted full" style="margin:0">תדלוקים, טיפולים והוצאות לדוגמה יימחקו. אחר כך אפשר לבקש ממתכנן הטיפולים לבנות לוח לפי הדגם שלך.</p>`:''}
  </div><div class="formacts"><button class="btn primary" type="submit">${I('check')}שמירה</button><button class="btn ghost" type="button" data-act="close">ביטול</button>${window.cjSignOut?'<button class="btn ghost danger" type="button" id="signOut">התנתקות</button>':''}</div></form>`,root=>{
    const so=root.querySelector('#signOut');if(so)so.onclick=()=>window.cjSignOut();
    root.querySelector('#f').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||root.querySelector('[type=submit]');busy(btn,true);
      try{
        const data={nickname:fv(root,'cN'),plate:fv(root,'cP'),make:fv(root,'cMk'),model:fv(root,'cMd'),year:n(fv(root,'cY')),fuelType:fv(root,'cF'),tankL:n(fv(root,'cT')),odometer:n(fv(root,'cO'))||0,psiFront:n(fv(root,'cPF')),psiRear:n(fv(root,'cPR')),odoUpdatedAt:today(),example:false};
        if(ex){
          for(const c of ['fuel','service','expense']) for(const r of S[c].filter(x=>x.example)) await delRec(c,r.id);
          if(fv(root,'cReset')) for(const r of S.reminder) await updRec('reminder',r.id,{lastKm:data.odometer,lastDate:today(),history:[]});
        }
        await setRec('garage',S.car&&!ex?S.car.id:CAR,Object.assign(ex?{}:(({id,...o})=>o)(S.car||{}),data)); closeModal(); toast('פרטי הרכב נשמרו');
      }catch(err){console.error(err);busy(btn,false);toast('השמירה נכשלה. נסה שוב');}};
  });
}
function quickSheet(){
  const items=[['fuelQuick','תדלוק','fuel'],['serviceForm','טיפול','wrench'],['expenseForm','הוצאה','receipt'],['checks','בדיקה שוטפת','oil'],['scan','סריקת קבלה','cam'],['voice','רישום בקול','mic'],['odo','מד אוץ','gauge']];
  openModal('רישום חדש',`<div class="qgrid">${items.map(([a,l,i])=>`<button class="qbtn" data-act="${a}" ${(a==='scan'&&(!sample||!imgOK))||(a==='voice'&&!sample)?'disabled':''}>${I(i)}${l}</button>`).join('')}</div>`);
}
function checksSheet(){
  const list=sortedReminders(r=>r.kind==='check');
  openModal('בדיקה שוטפת',`<p class="small muted" style="margin-top:0">סמן מה בדקת היום. ${S.car?.psiFront?`לחץ מומלץ: ${S.car.psiFront} PSI קדימה, ${S.car.psiRear||S.car.psiFront} PSI אחורה.`:''}</p>
  <div class="stack" style="gap:10px">${list.map(({r,st})=>`<label class="toggle"><input type="checkbox" class="ck" value="${r.id}" ${st.status!=='ok'?'checked':''}> ${esc(r.title)} <span class="pill ${st.status}">${esc(st.label)}</span></label>`).join('')||'<div class="empty">אין בדיקות מוגדרות</div>'}</div>
  <div class="formacts"><button class="btn primary" id="ckSave">${I('check')}סימון כבוצע</button><button class="btn ghost" data-act="close">ביטול</button></div>`,root=>{
    root.querySelector('#ckSave').onclick=async e=>{busy(e.currentTarget,true);try{for(const c of root.querySelectorAll('.ck:checked')) await markDone(c.value,odo(),today(),true);closeModal();toast('הבדיקות נרשמו');}catch(err){toast('השמירה נכשלה');}};
  });
}
async function markDone(id,atKm,atDate,silent){
  const r=S.reminder.find(x=>x.id===id); if(!r) return false;
  if(r.once){ // one-off deadline: done means it is gone
    const k=r.docKey||'';
    if(k.startsWith('tk:')){await ticketPaid(k.slice(3));return true;}
    await delRec('reminder',id);
    if(k==='refresher'){const p=S.person||{};await setRec('person','me',Object.assign({},(({id,...o})=>o)(p),{refresherDone:true}));}
    if(k==='dlic'){toast('מעולה! עדכן את התוקף החדש של הרישיון');setTimeout(driverSheet,300);}
    else if(!silent)toast(`״${r.title}״ סומן כבוצע`);
    return true;
  }
  const hist=Array.isArray(r.history)?r.history.slice(-19):[];
  hist.push({date:atDate||today(),km:atKm||odo()});
  await updRec('reminder',id,{lastKm:atKm||odo(),lastDate:atDate||today(),history:hist,snoozeDate:'',snoozeKm:null});
  if(!silent) toast(`״${r.title}״ סומן כבוצע`);
  return true;
}
const rcptSrc=id=>window.__rcptUrl?window.__rcptUrl(id):'/_blob/'+encodeURIComponent(id);
window.__rcptRefresh=()=>render();
async function receiptView(id,type,title){
  let url=rcptSrc(id);
  if(window.__rcptUrlAsync){try{url=await window.__rcptUrlAsync(id);}catch(e){toast('לא הצלחתי לטעון את הקבלה');return;}}
  openModal(title||'קבלה',type.startsWith('image/')?`<img src="${url}" alt="${esc(title||'קבלה')}" style="width:100%;border-radius:12px">`:`<div class="empty"><b>קובץ PDF</b><a href="${url}" target="_blank" rel="noopener" style="color:var(--accent)">פתיחת הקובץ בלשונית חדשה</a></div>`);
}
async function addToCalendar(id,btn){
  const r=S.reminder.find(x=>x.id===id);if(!r)return;
  if(!mcp){
    const st0=remState(r);let d0=st0.dueDate||today();if(d0<today())d0=today();
    const ymd=x=>x.replace(/-/g,'');const esc2=t=>String(t).replace(/[\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//car-journal//he','BEGIN:VEVENT','UID:'+r.id+'-'+ymd(d0)+'@car-journal','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART;VALUE=DATE:'+ymd(d0),'DTEND;VALUE=DATE:'+ymd(addDays(d0,1)),'SUMMARY:'+esc2('🚗 '+r.title),'DESCRIPTION:'+esc2(st0.label+' · יומן הרכב'),'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:'+esc2(r.title),'END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
    try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='car-'+r.id+'.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},4000);toast('פותח את היומן בטלפון…');}catch(e){toast('לא הצלחתי ליצור אירוע ביומן');}
    return;
  }
  const st=remState(r);let due=st.dueDate||today();if(due<today())due=today();
  busy(btn,true,'');
  try{
    await mcp.callTool('Google Calendar','create_event',{summary:`🚗 ${r.title}`,allDay:true,startTime:due+'T00:00:00',endTime:addDays(due,1)+'T00:00:00',
      description:`תזכורת מיומן הרכב (${[S.car?.make,S.car?.model].filter(Boolean).join(' ')}).\n${st.label}. ${n(r.intervalKm)?`מרווח: ${km(r.intervalKm)} ק״מ. `:''}${n(r.intervalDays)?`מרווח: ${daysLabel(r.intervalDays)}.`:''}`,
      overrideReminders:[{method:'popup',minutes:1440},{method:'popup',minutes:10080}]});
    await updRec('reminder',id,{calDate:due}); toast(`נוסף ליומן Google ל־${fmtD(due)}`);
  }catch(err){console.warn(err);toast(err?.code==='server_not_connected'||err?.code==='not_connected'?'חבר את יומן Google ב־Claude כדי להשתמש בזה':'ההוספה ליומן נכשלה');}
  finally{busy(btn,false);}
}
function cleanupReceipt(rid,exceptId){
  if(!rid||!assets||!assets.delete)return;
  const used=['fuel','service','expense','paper','ticket'].some(c=>(RAW[c]||[]).some(x=>x.id!==exceptId&&((x.receipt&&x.receipt.id===rid)||(x.files||[]).some(f=>f.id===rid))));
  if(!used)Promise.resolve(assets.delete(rid)).catch(()=>{});
}
function confirmDelete(colName,id){ undoDelete(colName,id); }
function undoDelete(colName,id,label){
  const rec=(RAW[colName]||[]).find(x=>x.id===id);if(!rec)return;
  const data=(({id,...o})=>o)(rec);const files=[rec.receipt,...(rec.files||[])].filter(f=>f&&f.id);
  closeModal();
  delRec(colName,id).then(()=>{
    toastAct(label||'נמחק','ביטול',async()=>{try{await setRec(colName,id,data);toast('שוחזר');}catch(e){toast('השחזור נכשל');}},
      ()=>{for(const f of files)cleanupReceipt(f.id,id);});
  }).catch(()=>toast('המחיקה נכשלה'));
}
function confirmDeleteOld(colName,id){
  openModal('מחיקה',`<p>למחוק את הרישום הזה? אי אפשר לשחזר אחר כך.</p><div class="formacts"><button class="btn primary" id="yes" style="background:var(--crit);border-color:var(--crit)">${I('trash')}מחיקה</button><button class="btn ghost" data-act="close">ביטול</button></div>`,root=>{
    root.querySelector('#yes').onclick=async()=>{const rid=((S[colName]||[]).find(x=>x.id===id)||{}).receipt?.id;try{await delRec(colName,id);cleanupReceipt(rid,id);closeModal();toast('נמחק');}catch(e){toast('המחיקה נכשלה');}};
  });
}

/* ---------- agents ---------- */
function snapshotData(){
  const eff=effStats();const sp=allSpend();
  return {
    today:today(),car:S.car?{make:S.car.make,model:S.car.model,year:S.car.year,fuelType:S.car.fuelType,tankL:S.car.tankL,nickname:S.car.nickname,psiFront:S.car.psiFront,psiRear:S.car.psiRear}:null,
    odometer:odo(),kmPerDay:Math.round(kmPerDay()),
    fuelEconomy:eff?{avgKmPerL:+eff.avg.toFixed(2),last:+eff.last.toFixed(2),series:eff.series.slice(-12).map(x=>({date:x.date,kmPerL:+x.kmpl.toFixed(2),km:x.km}))}:null,
    spendByMonth:lastMonths(6).map(m=>({month:m,total:Math.round(sp.filter(r=>monthKey(r.date)===m).reduce((s,r)=>s+r.amount,0))})),
    reminders:sortedReminders().map(({r,st})=>({id:r.id,title:r.title,kind:r.kind,intervalKm:r.intervalKm||null,intervalDays:r.intervalDays||null,lastKm:r.lastKm,lastDate:r.lastDate,status:st.status,remaining:st.label,expectedDate:st.dueDate}))
  };
}
function mdLite(t){
  const lines=esc(t).split('\n');let out='',inList=false;
  for(let l of lines){l=l.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^#{1,4}\s*(.+)/,'<b>$1</b>');
    if(/^\s*[-•*]\s+/.test(l)){if(!inList){out+='<ul>';inList=true;}out+='<li>'+l.replace(/^\s*[-•*]\s+/,'')+'</li>';}
    else{if(inList){out+='</ul>';inList=false;} if(l.trim()) out+='<p>'+l+'</p>';}}
  return out+(inList?'</ul>':'');
}
async function runInsight(btn){
  if(!sample){toast('הסוכנים זמינים כשהדף פתוח ב־Claude');return;}
  const box=$('#insight')||(()=>{go('home');return $('#insight');})();
  busy(btn,true,'מנתח…');insightBusy=true;box.innerHTML='<span class="muted">חושב…</span>';
  const prompt=`אתה אנליסט רכב אישי. כתוב בעברית, בגוף שני, בקצרה (עד 170 מילים): 3–5 נקודות תבליט עם תובנות קונקרטיות מהנתונים בלבד: מגמת צריכת דלק (ק״מ לליטר) וחריגות, הוצאות חודשיות ומה בולט, ומה כדאי לעשות בשבועיים הקרובים לפי התזכורות. אל תמציא נתונים. אם חסר מידע, אמור מה כדאי לתעד. אם הצריכה ירדה בחדות, הצע סיבות אפשריות (לחץ אוויר, נסיעה עירונית, טיפול שהתעכב).\n\nנתונים (JSON):\n${JSON.stringify(snapshotData())}`;
  try{
    const res=await sample(prompt,{modelTier:'complex',cache:{gcTime:6*3600e3},onText:({text})=>{box.innerHTML=mdLite(text);}});
    lastInsight=mdLite(res.text);box.innerHTML=lastInsight;
  }catch(e){box.innerHTML=`<span class="muted">${e?.code==='missing_api_key'?'האנליסט עוד לא מחובר: חסר מפתח API בשרת.':e?.code==='not_granted'?'הסוכן לא קיבל הרשאה לפנות ל־Claude.':e?.code==='rate_limited'?'הגעת למגבלת השימוש. נסה שוב מאוחר יותר.':e?.code==='quota_exceeded'?aiErr(e,''):'הניתוח לא הצליח. נסה שוב.'}</span>`;}
  finally{insightBusy=false;busy(btn,false);}
}
async function runPlan(btn){
  if(!sample){toast('הסוכנים זמינים כשהדף פתוח ב־Claude');return;}
  const c=S.car||{};
  busy(btn,true,'בונה תוכנית…');
  try{
    const res=await sample.json(`אתה מכונאי רכב מומחה בישראל. בנה לוח טיפולים ובדיקות שוטפות לרכב: ${c.make||'לא ידוע'} ${c.model||''} שנת ${c.year||'לא ידוע'}, דלק ${c.fuelType||'95'}, קילומטראז׳ ${odo()}, נסיעה ממוצעת ${Math.round(kmPerDay())} ק״מ ביום, אקלים ישראלי חם.
החזר אובייקט JSON בלבד בצורה {"items":[{"title":string,"kind":"service"|"check"|"doc","intervalKm":number|null,"intervalDays":number|null,"why":string}]}.
כלול 10–14 פריטים: טיפולים לפי היצרן (שמן ומסנן, מסנן אוויר, מסנן מזגן, מצתים, נוזל בלמים, נוזל קירור, רצועה/שרשרת אם רלוונטי, צמיגים, איזון וכיוון פרונט, מצבר), בדיקות שוטפות (מפלס שמן, מים/נוזל קירור, לחץ אוויר בצמיגים, נוזל שמשות) ומסמכים (טסט שנתי, חידוש ביטוח). כותרות בעברית, "why" משפט קצר בעברית.`,{modelTier:'complex'});
    const items=(res&&res.items)||[];
    const existing=new Set(S.reminder.map(r=>r.title.trim()));
    openModal('תוכנית טיפולים מומלצת',`<p class="small muted" style="margin-top:0">עבור ${esc([c.make,c.model,c.year].filter(Boolean).join(' ')||'הרכב')}. סמן מה להוסיף לתזכורות. ספירה מתחילה מהיום ומ־${km(odo())} ק״מ, ואפשר לערוך כל תזכורת אחר כך.</p>
    <div class="stack" style="gap:10px">${items.map((it,i)=>`<label class="toggle" style="align-items:flex-start"><input type="checkbox" class="pi" value="${i}" ${existing.has((it.title||'').trim())?'':'checked'}><span><b style="font-weight:500">${esc(it.title)}</b> <span class="pill neutral">${esc(KIND[it.kind]||'')}</span><br><span class="small muted">${[it.intervalKm?`כל ${km(it.intervalKm)} ק״מ`:'',it.intervalDays?`כל ${daysLabel(it.intervalDays)}`:''].filter(Boolean).join(' או ')} · ${esc(it.why||'')}</span>${existing.has((it.title||'').trim())?' <span class="pill ok">קיים</span>':''}</span></label>`).join('')}</div>
    <div class="formacts"><button class="btn primary" id="planAdd">${I('plus')}הוספה לתזכורות</button><button class="btn ghost" data-act="close">סגירה</button></div>`,root=>{
      root.querySelector('#planAdd').onclick=async e=>{busy(e.currentTarget,true);let k=0;
        try{for(const cb of root.querySelectorAll('.pi:checked')){const it=items[+cb.value];if(!it||!(it.intervalKm||it.intervalDays))continue;
          await addRec('reminder',{title:it.title,kind:['service','check','doc'].includes(it.kind)?it.kind:'service',intervalKm:n(it.intervalKm),intervalDays:n(it.intervalDays),lastKm:odo(),lastDate:today(),note:it.why||''});k++;}
          closeModal();toast(`נוספו ${k} תזכורות`);go('reminder');}catch(err){toast('ההוספה נכשלה');busy(e.currentTarget,false);}};
    });
  }catch(e){toast(aiErr(e,'התכנון לא הצליח, נסה שוב'));}
  finally{busy(btn,false);}
}

/* ===== 04-fuel-account.js ===== */
/* ---------- quick fuel: odometer, receipt, save ---------- */
function fuelQuick(){
  const last=odo();
  const since=S.car?.odoUpdatedAt?Math.max(0,daysBetween(S.car.odoUpdatedAt,today())):0;
  const est=Math.round(last+kmPerDay()*since);
  const ai=!!(sample&&imgOK);
  openModal('תדלוק',`<form id="qf" class="qf" novalidate>
    <div class="field"><label for="qfOdo">כמה ק״מ מראה המד עכשיו?</label>
      <input type="number" id="qfOdo" class="big" inputmode="numeric" enterkeyhint="done" placeholder="${km(est)}" autocomplete="off">
      <div class="small muted">הקילומטראז׳ האחרון: ${km(last)}</div></div>
    <label class="qf-cam" id="qfCam"><input type="file" id="qfFile" accept="image/*">
      <span class="qf-cam-ic" id="qfThumb">${I('cam')}</span>
      <span class="qf-cam-t"><b id="qfCamT">קבלה מ־Yellow או מהתחנה</b><span class="small muted">${ai?'צילום מסך או תמונה, והסוכן ימלא את הפרטים':'צירוף תמונה של הקבלה'}</span><span class="small muted" id="qfQuota"></span></span></label>
    <div class="qf-status" id="qfStatus" hidden></div>
    <details class="qf-more" id="qfMore" ${ai?'':'open'}><summary>פרטי התדלוק <span class="muted small" id="qfSum"></span></summary>
      <div class="fgrid" style="margin-top:12px">
        <div class="field"><label for="qfT">סכום ששולם (₪)</label><input type="number" step="0.01" inputmode="decimal" id="qfT"></div>
        <div class="field"><label for="qfL">ליטרים</label><input type="number" step="0.01" inputmode="decimal" id="qfL"></div>
        <div class="field"><label for="qfS">תחנה</label><input type="text" id="qfS" placeholder="Yellow, פז, דלק…"></div>
        <div class="field"><label for="qfD">תאריך</label><input type="date" id="qfD" value="${today()}"></div>
        <label class="toggle full"><input type="checkbox" id="qfFull" checked> מילוי מלא של המכל</label>
      </div></details>
    <button class="btn primary block" type="submit" id="qfSave">${I('check')}שמירת התדלוק</button>
  </form>`,root=>{
    const $r=q=>root.querySelector(q);
    const odoIn=$r('#qfOdo'),file=$r('#qfFile'),st=$r('#qfStatus');
    quotaText('receipt').then(t=>{const q=$r('#qfQuota');if(q&&t)q.textContent=t;});
    let rcpt=null,ppl=null,okLow=false,reading=false;
    try{odoIn.focus({preventScroll:true});}catch(e){}
    const status=(cls,html)=>{st.hidden=!html;st.className='qf-status'+(cls?' '+cls:'');st.innerHTML=html||'';};
    const sum=()=>{const t=n($r('#qfT').value),l=n($r('#qfL').value),s=$r('#qfS').value.trim();$r('#qfSum').textContent=[t?ils2(t):'',l?nf1.format(l)+' ל׳':'',s].filter(Boolean).join(' · ');};
    root.querySelectorAll('#qfT,#qfL,#qfS').forEach(i=>i.addEventListener('input',sum));
    file.addEventListener('change',async()=>{
      const f=file.files[0];if(!f)return;rcpt=f;
      $r('#qfCam').classList.add('has');$r('#qfThumb').innerHTML=`<img alt="" src="${URL.createObjectURL(f)}">`;$r('#qfCamT').textContent='הקבלה צורפה';
      if(!(sample&&imgOK)){$r('#qfMore').open=true;return;}
      reading=true;status('',`<span class="spin"></span>הסוכן קורא את הקבלה…`);
      try{
        const r=await readFuelReceipt(f);
        if(!root.contains(file))return; // the window was closed while the agent was reading
        if(!r){status('warn','זו לא נראית קבלת דלק. אפשר למלא את הפרטים ידנית.');$r('#qfMore').open=true;return;}
        if(r.total)$r('#qfT').value=r.total.toFixed(2);
        if(r.liters)$r('#qfL').value=+r.liters.toFixed(3);
        if(r.station)$r('#qfS').value=r.station;
        if(r.date)$r('#qfD').value=r.date;
        ppl=r.pricePerL;if(r.invoice)root._inv=r.invoice;
        sum();
        if(r.total)status('ok',`${I('check')}הסוכן מילא: ${esc($r('#qfSum').textContent)}${r.date&&r.date!==today()?` · ${fmtD(r.date)}`:''}`);
        else{status('warn','הסוכן לא מצא את הסכום בקבלה. השלם אותו בפרטים.');$r('#qfMore').open=true;$r('#qfT').focus();}
      }catch(e){console.warn(e);if(!root.contains(file))return;status('warn',aiErr(e));$r('#qfMore').open=true;}
      finally{reading=false;}
    });
    $r('#qf').onsubmit=async e=>{
      e.preventDefault();
      if(reading){toast('רגע, הסוכן עוד קורא את הקבלה');return;}
      const total=n($r('#qfT').value),o=n(odoIn.value);
      if(!total){$r('#qfMore').open=true;$r('#qfT').focus();status('warn',rcpt?'חסר סכום. השלם אותו בפרטים.':'צרף קבלה או מלא סכום.');return;}
      if(o&&o<last&&!okLow){okLow=true;status('warn',`המספר נמוך מהקילומטראז׳ האחרון (${km(last)}). לחץ שוב לשמירה בכל זאת.`);return;}
      const btn=$r('#qfSave');busy(btn,true);
      try{
        let liters=n($r('#qfL').value);if(!liters&&ppl)liters=+(total/ppl).toFixed(2);
        const data={date:$r('#qfD').value||today(),odo:o,liters,total,pricePerL:ppl||(liters?+(total/liters).toFixed(3):null),station:$r('#qfS').value.trim(),full:$r('#qfFull').checked,note:root._inv?'חשבונית '+root._inv:''};
        if(rcpt){const rc=await uploadReceipt(rcpt);if(rc)data.receipt=rc;}
        let msg='התדלוק נשמר';
        if(o&&data.full&&liters){
          const prev=S.fuel.filter(f=>f.full&&n(f.odo)&&f.odo<o).sort((a,b)=>b.odo-a.odo)[0];
          if(prev){const mid=S.fuel.filter(f=>n(f.odo)&&f.odo>prev.odo&&f.odo<o).reduce((t,f)=>t+(n(f.liters)||0),0);const k=(o-prev.odo)/(mid+liters);if(isFinite(k)&&k>2&&k<40)msg=`נשמר · ${nf1.format(k)} ק״מ לליטר`;}
        }
        await addRec('fuel',data);await bumpOdo(o);closeModal();toast(msg);
      }catch(err){console.error(err);busy(btn,false);status('warn','השמירה נכשלה. בדוק את החיבור ונסה שוב.');}
    };
  });
}

/* ---------- AI quota ---------- */
async function quotaText(kind){
  if(!window.cjAccount)return '';
  try{const q=await window.cjAccount.quota();if(q.unlimited)return '';const k=q[kind];if(!k)return '';
    const left=Math.max(0,k.limit-k.used);
    return kind==='receipt'?`נשארו ${left} מתוך ${k.limit} צילומים החודש`:kind==='chat'?`נשארו ${left} מתוך ${k.limit} שאלות ליועץ החודש`:`נשארו ${left} מתוך ${k.limit} ניתוחים החודש`;
  }catch(e){return '';}
}
function fillAgentQuota(){const el=$('#agQuota');if(!el||!window.cjAccount)return;
  Promise.all(['receipt','chat','analysis'].map(quotaText)).then(t=>{const x=t.filter(Boolean);if($('#agQuota'))$('#agQuota').textContent=x.length?x.join(' · '):'';});}

/* ---------- account (standalone app) ---------- */
async function accountSheet(){
  const A=window.cjAccount;if(!A)return;
  openModal('החשבון שלי',`<div class="stack" style="gap:18px">
    <div class="small muted" dir="ltr" style="text-align:right">${esc(A._email||'')}</div>
    <div class="acct-q" id="acQ"><div class="small muted">טוען את המכסה…</div></div>
    <div class="acct-list">
      <button type="button" data-act="car">${I('edit')}פרטי הרכב</button>
      <button type="button" data-act="cars">${I('car')}הרכבים שלי (${S.cars.length} מתוך ${MAX_CARS})</button>
      <button type="button" id="acPush">${I('bell')}<span id="acPushTxt">התראות לטלפון</span><span class="acct-state" id="acPushState"></span></button>
      <button type="button" data-act="feedback">${I('chat')}משוב ודיווח על תקלה</button>
      <button type="button" id="acExport">${I('doc')}ייצוא כל הנתונים (קובץ גיבוי)</button>
      <button type="button" data-act="restore">${I('undo')}שחזור מגיבוי</button>
      <a href="privacy.html" target="_blank" rel="noopener">${I('shield')}מדיניות פרטיות</a>
      <a href="terms.html" target="_blank" rel="noopener">${I('list')}תנאי שימוש</a>
      <button type="button" id="acOut">${I('send')}התנתקות</button>
      <button type="button" id="acDel" class="danger">${I('trash')}מחיקת החשבון</button>
    </div></div>`,root=>{
    A.quota().then(q=>{const box=root.querySelector('#acQ');if(!box)return;
      if(q.unlimited){box.innerHTML='<div class="small muted">שימוש בסוכנים ללא הגבלה.</div>';return;}
      const L={receipt:'צילומי קבלות',chat:'שאלות ליועץ',analysis:'ניתוחים ותוכניות'};
      box.innerHTML='<div class="eyebrow">שימוש בסוכנים החודש</div>'+Object.keys(L).map(k=>{const x=q[k]||{limit:0,used:0};const pct=x.limit?Math.min(100,x.used/x.limit*100):0;
        return `<div><div class="row"><span>${L[k]}</span><span class="num">${x.used}/${x.limit}</span></div><div class="bar"><i style="width:${pct}%;background:${pct>=100?'var(--crit)':pct>=80?'var(--warn)':'var(--accent)'}"></i></div></div>`;}).join('')+'<div class="small muted">המכסה מתחדשת ב־1 בכל חודש.</div>';
    }).catch(()=>{const b=root.querySelector('#acQ');if(b)b.innerHTML='';});
    root.querySelector('#acExport').onclick=async e=>{busy(e.currentTarget,true,'מכין קובץ…');try{const nRec=await A.exportData();toast(`יוצאו ${nRec} רשומות`);}catch(x){toast('הייצוא נכשל, נסה שוב');}finally{busy(e.currentTarget,false);}};
    root.querySelector('#acOut').onclick=()=>A.signOut();
    if(A.isAdmin)A.isAdmin().then(ok=>{if(!ok)return;const l=root.querySelector('.acct-list');if(l&&!l.querySelector('.adm')){const a=document.createElement('a');a.className='adm';a.href='admin.html';a.innerHTML=I('chart')+'מסך מנהל';l.prepend(a);}});
    setupPushRow(root);
    root.querySelector('#acDel').onclick=()=>deleteAccountSheet();
  });
}
/* ---------- phone notifications ---------- */
async function setupPushRow(root){
  const P=window.cjPush,btn=root.querySelector('#acPush');if(!btn)return;
  if(!P){btn.hidden=true;return;}
  const sup=P.support();
  const paint=on=>{const st=root.querySelector('#acPushState');if(!st)return;st.textContent=sup==='ok'?(on?'פעיל':'כבוי'):sup==='denied'?'חסום':'';st.className='acct-state'+(on?' on':'');};
  let on=sup==='ok'?await P.status():false;paint(on);
  btn.onclick=async()=>{
    if(sup==='need-install'){pushInstallSheet();return;}
    if(sup==='unsupported'){toast('הדפדפן הזה לא תומך בהתראות');return;}
    if(sup==='denied'){toast('ההתראות חסומות. אפשר להפעיל אותן בהגדרות הטלפון');return;}
    busy(btn,true,on?'מכבה…':'מפעיל…');
    try{if(on){await P.disable();on=false;toast('ההתראות כובו');}else{await P.enable();on=true;toast('ההתראות פועלות. שלחנו התראת ניסיון');}}
    catch(e){toast(e&&e.code==='denied'?'לא אישרת התראות. אפשר לשנות בהגדרות הטלפון':'ההפעלה לא הצליחה, נסה שוב');}
    finally{busy(btn,false);paint(on);}
  };
}
function pushInstallSheet(){
  openModal('התקנה במסך הבית',`<p style="margin-top:0">ככה היומן נפתח כמו אפליקציה, בלי שורת כתובת, ויכול לשלוח התראות:</p>
    <ol class="steps-list"><li>לוחצים על כפתור השיתוף <b>⎙</b> בתחתית Safari.</li><li>בוחרים <b>״הוספה למסך הבית״</b>.</li><li>פותחים את היומן מהאייקון החדש, ומפעילים התראות ב״החשבון שלי״.</li></ol>
    <div class="formacts"><button class="btn primary" data-act="close">הבנתי</button></div>`);
}

/* ---------- beta feedback ---------- */
function feedbackSheet(pre){
  if(!window.cjFeedback)return;
  openModal('משוב',`<form id="fb" class="stack" style="gap:14px">
    <p class="small muted" style="margin:0">היומן בגרסת בטא. כל הערה עוזרת: מה לא עבד, מה חסר, מה היה מבלבל.</p>
    <div class="seg" role="radiogroup" aria-label="סוג">
      <label><input type="radio" name="k" value="bug" ${pre==='biz'?'':'checked'}><span>תקלה</span></label>
      <label><input type="radio" name="k" value="idea" ${pre==='biz'?'checked':''}><span>רעיון</span></label>
      <label><input type="radio" name="k" value="other"><span>אחר</span></label>
    </div>
    <div class="field"><label for="fbT">מה תרצה לספר?</label><textarea id="fbT" rows="5" maxlength="3000" required>${pre==='biz'?'מעוניין בחשבון עסקי. כמה רכבים: ':''}</textarea></div>
    <div class="formacts"><button class="btn primary" type="submit">${I('send')}שליחה</button><button class="btn ghost" type="button" data-act="close">ביטול</button></div>
    <p class="small muted" style="margin:0">גרסה ${esc(window.cjVersion||'')}</p></form>`,root=>{
    root.querySelector('#fb').onsubmit=async e=>{e.preventDefault();const t=root.querySelector('#fbT').value.trim();if(!t)return;
      const b=root.querySelector('button[type=submit]');busy(b,true,'שולח…');
      try{await window.cjFeedback(root.querySelector('input[name=k]:checked').value,t);closeModal();toast('תודה! המשוב התקבל');}
      catch(x){busy(b,false);toast(x&&x.code==='limit'?'שלחת הרבה משוב היום, נסה מחר':'השליחה נכשלה, נסה שוב');}};
  });
}

function deleteAccountSheet(){
  openModal('מחיקת החשבון',`<p style="margin-top:0">המחיקה מוחקת לצמיתות את החשבון, את כל הרישומים ואת כל הקבלות. אי אפשר לשחזר אחר כך.</p>
    <p class="small muted">כדאי לייצא קודם את הנתונים מתוך ״החשבון שלי״.</p>
    <div class="field"><label for="delTxt">כדי לאשר, הקלד <b>מחק</b></label><input type="text" id="delTxt" autocomplete="off"></div>
    <div class="formacts"><button class="btn primary" id="delGo" disabled style="background:var(--crit);border-color:var(--crit)">${I('trash')}מחיקה לצמיתות</button><button class="btn ghost" data-act="close">ביטול</button></div>`,root=>{
    const t=root.querySelector('#delTxt'),g=root.querySelector('#delGo');
    t.oninput=()=>{g.disabled=t.value.trim()!=='מחק';};
    g.onclick=async()=>{busy(g,true,'מוחק…');try{await window.cjAccount.deleteAccount();}catch(e){busy(g,false);toast('המחיקה נכשלה. נסה שוב או פנה אלינו.');}};
  });
}

/* ===== 05-documents.js ===== */
/* ---------- insurance & documents ---------- */
const DOC_KIND={insurance:'פוליסת ביטוח',license:'רישיון רכב'};
function docDays(d){return d?daysBetween(today(),d):null;}
function docWhen(d){const k=docDays(d);if(k===null)return {txt:'אין תאריך',cls:''};
  if(k<0)return {txt:`פג לפני ${-k} ימים`,cls:'crit'};if(k===0)return {txt:'פג היום',cls:'crit'};
  return {txt:k<=45?`עוד ${k} ימים`:`עד ${fmtD(d)}`,cls:k<=14?'crit':k<=45?'warn':'ok'};}
function money(v){const x=n(v);return x==null?'':'₪'+nf0.format(x);}
function vDocs(){
  const pols=S.paper.filter(p=>p.type==='insurance').sort((a,b)=>(a.end||'').localeCompare(b.end||''));
  const lic=S.paper.find(p=>p.type==='license');
  const upBtns=`<div class="docs-up"><button class="btn primary" data-act="docUp" data-type="insurance">${I('shield')}העלאת פוליסת ביטוח</button><button class="btn ghost" data-act="docUp" data-type="license">${I('doc')}העלאת רישיון רכב</button></div>`;
  if(!pols.length&&!lic)return `<div class="sec-title"><h2>הביטוח והמסמכים</h2><span class="small muted">${esc(carName(S.car))}</span></div>${driverCard()}
    <div class="card docs-empty"><div class="dstat" style="border:0;padding:0"><div class="ic">${I('shield')}</div></div>
      <b style="font-size:18px">כל הביטוח במקום אחד, בשפה פשוטה</b>
      <p>מעלים את פוליסת הביטוח (PDF או צילומים) ואת רישיון הרכב. הסוכן קורא אותם, מסביר בשפה פשוטה מה מכוסה ומה לא, ומזכיר לך לפני שהביטוח או הטסט נגמרים.</p>
      ${upBtns}</div>`;
  const strip=[...pols.map(p=>{const w=docWhen(p.end);return `<div class="dstat ${w.cls}"><div class="ic">${I('shield')}</div><div style="min-width:0"><b>ביטוח ${esc(p.policyType||'')}</b><span>${esc(p.insurer||'')}</span></div><div class="when">${w.txt}</div></div>`;}),
    lic?(()=>{const w=docWhen(lic.validUntil);return `<div class="dstat ${w.cls}"><div class="ic">${I('doc')}</div><div style="min-width:0"><b>טסט ורישיון רכב</b><span>${lic.validUntil?'בתוקף עד '+fmtD(lic.validUntil):'אין תאריך'}</span></div><div class="when">${w.txt}</div></div>`;})():''].join('');
  return `<div class="sec-title"><h2>הביטוח והמסמכים</h2><span class="small muted">${esc(carName(S.car))}</span></div>
  <div class="docs-strip">${strip}</div>
  ${pols.map(polCard).join('')}
  ${lic?licCard(lic):''}
  ${driverCard()}
  <div class="card" style="margin-bottom:16px">${upBtns}<p class="small muted" style="text-align:center;margin:12px 0 0">אפשר להעלות כמה פוליסות, למשל חובה ומקיף בנפרד. העלאה של רישיון חדש מחליפה את הקודם.</p></div>`;
}
function polCard(p){
  const w=docWhen(p.end);
  const ded=(p.deductibles||[]).filter(d=>d&&d.label);
  const covs=(p.coverages||[]).filter(c=>c&&c.title);
  const nc=(p.notCovered||[]).filter(Boolean);
  const ph=[['תביעות ונזקים',p.claimsPhone],['גרירה ושירותי דרך',p.roadsidePhone],['סוכן הביטוח',p.agentPhone]].filter(x=>x[1]);
  return `<section class="card pol">
    <div class="pol-head"><div style="min-width:0"><div class="eyebrow">${esc(p.insurer||'חברת ביטוח')}</div><h2>ביטוח ${esc(p.policyType||'רכב')}</h2></div>
      <div class="chips"><span class="chip ${w.cls==='ok'?'acc':''}" style="${w.cls==='crit'?'color:var(--crit);border-color:var(--crit)':w.cls==='warn'?'color:var(--warn);border-color:var(--warn)':''}">${p.end?`בתוקף עד ${fmtD(p.end)}`:'אין תאריך סיום'}</span>${n(p.premium)?`<span class="chip">פרמיה ${money(p.premium)}</span>`:''}${p.policyNo?`<span class="chip" dir="ltr">${esc(p.policyNo)}</span>`:''}</div></div>
    ${p.summary?`<p class="lead2">${esc(p.summary)}</p>`:''}
    ${p.drivers?`<div><h3>מי רשאי לנהוג</h3><p class="lead2">${esc(p.drivers)}</p></div>`:''}
    ${ded.length?`<div><h3>השתתפות עצמית</h3><div class="chips">${ded.map(d=>`<span class="chip">${esc(d.label)}${d.amount?': <b style="color:var(--fg)">'+esc(String(d.amount))+'</b>':''}</span>`).join('')}</div></div>`:''}
    ${covs.length?`<div><h3>מה מכוסה (${covs.length})</h3><div class="covs">${covs.map(c=>`<details class="cov"><summary><span class="t">${esc(c.title)}</span>${c.limit?`<span class="lim">${esc(String(c.limit))}</span>`:''}</summary><div class="body">${esc(c.plain||'')}${c.deductible?`<span class="small muted">השתתפות עצמית: ${esc(String(c.deductible))}</span>`:''}</div></details>`).join('')}</div></div>`:''}
    ${nc.length?`<div><h3>מה לא מכוסה</h3><ul class="nocov">${nc.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
    ${ph.length?`<div><h3>טלפונים חשובים</h3><div class="phones">${ph.map(([l,v])=>`<div class="phone"><span>${l}</span><a href="tel:${esc(String(v).replace(/[^\d*+#]/g,''))}">${esc(v)}</a></div>`).join('')}</div></div>`:''}
    ${!covs.length&&!p.summary?`<p class="small muted" style="margin:0">הפוליסה נשמרה, אבל הסוכן עוד לא קרא אותה. ${sample?'אפשר לבקש קריאה בכפתור למטה.':''}</p>`:''}
    <div class="pol-acts">
      ${(p.files||[]).map((f,i)=>`<button class="btn sm ghost" data-act="docFile" data-id="${p.id}" data-i="${i}">${I('doc')}${(p.files.length>1?'עמוד '+(i+1):'קובץ הפוליסה')}</button>`).join('')}
      ${sample&&covs.length?`<button class="btn sm ghost" data-act="docAsk">${I('chat')}שאלה על הביטוח</button>`:''}
      ${sample&&!covs.length&&(p.files||[]).length?`<button class="btn sm primary" data-act="docEdit" data-id="${p.id}" data-reread="1">${I('spark')}קריאה ע״י הסוכן</button>`:''}
      <button class="btn sm ghost" data-act="docEdit" data-id="${p.id}">${I('edit')}עריכה</button>
      <button class="btn sm ghost" data-act="docDel" data-id="${p.id}" style="color:var(--crit)">${I('trash')}מחיקה</button>
    </div>
    ${p.readAt?`<p class="small muted" style="margin:0">הסיכום נכתב על ידי סוכן ועלול לטעות. הנוסח המחייב הוא הפוליסה עצמה.</p>`:''}
  </section>`;
}
function licCard(l){
  const w=docWhen(l.validUntil);
  const rows=[['מספר רישוי',l.plate],['רכב',[l.make,l.model,l.year].filter(Boolean).join(' ')],['בעלות',l.ownership],['צבע',l.color]].filter(x=>x[1]);
  return `<section class="card pol">
    <div class="pol-head"><div><div class="eyebrow">רישיון רכב</div><h2>טסט הבא</h2></div><div class="chips"><span class="chip" style="${w.cls==='crit'?'color:var(--crit);border-color:var(--crit)':w.cls==='warn'?'color:var(--warn);border-color:var(--warn)':''}">${l.validUntil?'עד '+fmtD(l.validUntil)+' · '+w.txt:'אין תאריך'}</span></div></div>
    ${rows.length?`<div class="chips">${rows.map(([k,v])=>`<span class="chip">${k}: <b style="color:var(--fg)" ${k==='מספר רישוי'?'dir="ltr"':''}>${esc(String(v))}</b></span>`).join('')}</div>`:''}
    <p class="small muted" style="margin:0">את הטסט אפשר לעשות עד חודשיים לפני תום תוקף הרישיון בלי לאבד ימים. נזכיר לך מראש.</p>
    <div class="pol-acts">${(l.files||[]).map((f,i)=>`<button class="btn sm ghost" data-act="docFile" data-id="${l.id}" data-i="${i}">${I('doc')}קובץ הרישיון</button>`).join('')}
      <button class="btn sm ghost" data-act="docEdit" data-id="${l.id}">${I('edit')}עריכה</button>
      <button class="btn sm ghost" data-act="docDel" data-id="${l.id}" style="color:var(--crit)">${I('trash')}מחיקה</button></div>
  </section>`;
}
const policyPrompt=()=>`אלה עמודים של פוליסת ביטוח רכב בישראל, או מפרט/דף פרטי ביטוח/אישור ביטוח. קרא את כל העמודים, כולל הכותרת העליונה, הכותרת התחתונה והלוגו בכל עמוד, והחזר JSON בלבד, בצורה:
{"isPolicy":boolean,"insurer":string|null,"policyType":"חובה"|"מקיף"|"צד ג׳"|"חובה ומקיף"|string|null,"policyNo":string|null,"start":"YYYY-MM-DD"|null,"end":"YYYY-MM-DD"|null,"premium":number|null,
"plate":string|null,"drivers":string|null,"summary":string,"deductibles":[{"label":string,"amount":string}],
"coverages":[{"title":string,"plain":string,"limit":string|null,"deductible":string|null}],"notCovered":[string],"claimsPhone":string|null,"roadsidePhone":string|null,"agentPhone":string|null}
איפה למצוא:
- insurer: שם חברת הביטוח מופיע לרוב רק בלוגו או בשורה התחתונה של כל עמוד, למשל "IDI חברה לביטוח בע״מ" (ביטוח ישיר / 9000000), הראל, מגדל, הפניקס, כלל, מנורה, AIG, שלמה, איילון, ליברה, הכשרה, שומרה. כתוב את השם המוכר בקיצור, למשל "ביטוח ישיר (IDI)".
- policyType: לפי כותרת המסמך ("מפרט פוליסה ... ביטוח מקיף" = מקיף; "תעודת ביטוח חובה" = חובה), גם אם השדה "סוג ביטוח" ריק.
- start/end: מתוך "תקופת הביטוח: מ־... עד־...". תאריכים בישראל כתובים יום/חודש/שנה (01/12/2026 = 2026-12-01). end הוא התאריך שאחרי "עד".
- premium: הפרמיה השנתית לתשלום (לא התשלום החודשי).
- claimsPhone: מספר הטלפון הראשי של חברת הביטוח, לרוב בשורה התחתונה של כל עמוד ("טל. 03-..."), או מוקד תביעות אם כתוב במפורש.
- roadsidePhone: מוקד גרירה ושירותי דרך (למשל "דרכים *5553"). אם יש מוקד נפרד לשמשות או לרכב חלופי, הוסף אותו לכיסוי המתאים בתוך plain.
- drivers: מי רשאי לנהוג. אפשר שמות ותפקיד (נהג עיקרי / נהג נוסף), אבל בלי מספרי תעודת זהות ובלי תאריכי לידה.
- אם הפוליסה משועבדת לגוף מימון, ציין זאת במשפט ב־notCovered או ב־summary.
פרטיות: אל תעתיק לשום שדה מספרי תעודת זהות, תאריכי לידה, כתובת מגורים, טלפון נייד או מייל של המבוטח.
הנחיות:
- summary: 2–3 משפטים בשפה פשוטה, בגובה העיניים: איזה ביטוח זה, ממתי עד מתי, ומה הדבר הכי חשוב לדעת.
- drivers: מי מותר לנהוג לפי הפוליסה (גיל, ותק, נהגים נקובים), במשפט פשוט.
- coverages: כל כיסוי בנפרד, כולל כתבי שירות (גרירה, שמשות, רכב חלופי, פנסים ומראות, רדיו) וכיסויים נוספים. title קצר (2–5 מילים). plain מסביר במשפט־שניים מה זה אומר בפועל, עם דוגמה מהחיים אם עוזר ("אם מישהו נכנס בך בחניה..."). limit: גבול האחריות או התקרה, כמו שכתוב ("עד ₪1,000,000", "עד 14 ימים"). deductible: השתתפות עצמית לכיסוי הזה אם יש.
- deductibles: כל ההשתתפויות העצמיות בפוליסה (נזק עצמי, צד ג׳, שמשות, גניבה וכו׳) עם הסכום כמו שכתוב.
- notCovered: חריגים חשובים במשפטים פשוטים ("נהג מתחת לגיל 24 לא מכוסה", "נזק כשנוהגים בלי רישיון בתוקף").
- בלי מונחים משפטיים כשאפשר להגיד פשוט. בלי לנחש: מה שלא מופיע הוא null או רשימה ריקה. סכומים בשקלים כמו שמופיעים. היום ${today()}.`;
const licensePrompt=()=>`זה רישיון רכב ישראלי (צילום או PDF). החזר JSON בלבד:
{"isLicense":boolean,"plate":string|null,"make":string|null,"model":string|null,"year":number|null,"validUntil":"YYYY-MM-DD"|null,"ownership":string|null,"color":string|null,"fuel":string|null}
fuel הוא "סוג דלק" כמו שכתוב ברישיון (בנזין, דיזל, היברידי, חשמל). make ו־model בעברית כמו ברישיון, בלי קודים.
validUntil הוא תאריך "תוקף הרישיון" / "בתוקף עד" (זה מועד הטסט). אל תנחש; מה שלא מופיע הוא null. היום ${today()}.`;
function docUploadSheet(type){
  const ins=type==='insurance';
  openModal(ins?'העלאת פוליסת ביטוח':'העלאת רישיון רכב',`<form id="du" class="stack" style="gap:14px">
    <p class="small muted" style="margin:0">${ins?'PDF של הפוליסה, או צילומים של העמודים (אפשר לבחור כמה תמונות). אם יש פוליסת חובה ומקיף נפרדות, מעלים כל אחת בנפרד.':'צילום ברור של רישיון הרכב, או PDF.'}</p>
    <div class="drop" id="duBox"><input type="file" id="duFile" accept="image/*,application/pdf" ${ins?'multiple':''}><span id="duTxt">${I('doc')} בחירת קובץ</span></div>
    <div class="formacts"><button class="btn primary" type="submit" id="duGo" disabled>${I('spark')}${sample?'העלאה וקריאה':'העלאה'}</button><button class="btn ghost" type="button" data-act="close">ביטול</button></div>
    ${!sample?'<p class="small muted" style="margin:0">הסוכן לא זמין כרגע, אז תמלא את התאריכים בעצמך אחרי ההעלאה.</p>':''}</form>`,root=>{
    const inp=root.querySelector('#duFile'),go=root.querySelector('#duGo');
    inp.onchange=()=>{const fs=[...inp.files];go.disabled=!fs.length;root.querySelector('#duTxt').textContent=fs.length?(fs.length===1?fs[0].name:`${fs.length} קבצים`):'בחירת קובץ';root.querySelector('#duBox').classList.toggle('has',!!fs.length);};
    root.querySelector('#du').onsubmit=async e=>{e.preventDefault();let fs=[...inp.files];if(!fs.length)return;
      const pdf=fs.find(f=>f.type==='application/pdf');if(pdf)fs=[pdf];fs=fs.slice(0,8);
      if(fs.some(f=>f.size>15*1024*1024)){toast('הקובץ גדול מדי (עד 15MB)');return;}
      busy(go,true,'מעלה…');
      try{
        const files=[];for(const f of fs){const a=await assets.upload(f);files.push({id:a.id,type:f.type||a.contentType||'',name:(f.name||'').slice(0,120)});}
        const base={type,files,createdAt:Date.now()};
        if(type==='license'){const old=S.paper.filter(p=>p.type==='license');for(const o of old){await delRec('paper',o.id);for(const f of o.files||[])Promise.resolve(assets.delete(f.id)).catch(()=>{});}}
        const ref=await addRec('paper',base);const id=ref&&ref.id;
        if(sample&&id){await readDoc(id,fs,type);}else{closeModal();toast('הקובץ נשמר');if(id)docEditSheet(id);}
      }catch(err){console.error(err);busy(go,false);toast('ההעלאה נכשלה, נסה שוב');}
    };
  });
}
async function readDoc(id,blobs,type){
  const ins=type==='insurance';
  openModal(ins?'קורא את הפוליסה':'קורא את הרישיון',`<div class="docread"><span class="spin" style="width:28px;height:28px"></span><b>${ins?'הסוכן קורא את הפוליסה ומסביר אותה בשפה פשוטה':'הסוכן קורא את הרישיון'}</b><span class="small muted">${ins?'זה יכול לקחת עד דקה.':'כמה שניות.'}</span></div>`);
  try{
    const ask=imgs=>sample.json(ins?policyPrompt():licensePrompt(),{images:imgs,modelTier:'default',maxTokens:ins?6000:800,purpose:ins?'document':'scan'});
    let raw;
    try{raw=await ask(blobs);}
    catch(e1){
      // the PDF could not be read as is: turn its pages into pictures and try once more
      if(e1&&e1.code==='quota_exceeded'||!blobs.some(b=>b.type==='application/pdf'))throw e1;
      if(window.cjReport)window.cjReport('doc-pdf-native: '+(e1&&(e1.code||e1.message)),'docs');
      raw=await ask(await pdfToImages(blobs.find(b=>b.type==='application/pdf'),8));
    }
    const ok=ins?raw&&raw.isPolicy!==false:raw&&raw.isLicense!==false;
    if(!ok){closeModal();toast(ins?'זה לא נראה כמו פוליסת ביטוח רכב':'זה לא נראה כמו רישיון רכב');docEditSheet(id);return;}
    const d=/^\d{4}-\d\d-\d\d$/;const clean={readAt:Date.now()};
    if(ins){Object.assign(clean,{insurer:raw.insurer||'',policyType:raw.policyType||'',policyNo:raw.policyNo||'',start:d.test(raw.start||'')?raw.start:'',end:d.test(raw.end||'')?raw.end:'',premium:n(raw.premium),drivers:raw.drivers||'',summary:raw.summary||'',
      deductibles:(raw.deductibles||[]).slice(0,20).map(x=>({label:String(x.label||'').slice(0,80),amount:String(x.amount||'').slice(0,60)})),
      coverages:(raw.coverages||[]).slice(0,40).map(x=>({title:String(x.title||'').slice(0,80),plain:String(x.plain||'').slice(0,600),limit:x.limit?String(x.limit).slice(0,80):'',deductible:x.deductible?String(x.deductible).slice(0,80):''})),
      notCovered:(raw.notCovered||[]).slice(0,20).map(x=>String(x).slice(0,300)),claimsPhone:raw.claimsPhone||'',roadsidePhone:raw.roadsidePhone||'',agentPhone:raw.agentPhone||''});}
    else Object.assign(clean,{plate:raw.plate||'',make:raw.make||'',model:raw.model||'',year:n(raw.year),validUntil:d.test(raw.validUntil||'')?raw.validUntil:'',ownership:raw.ownership||'',color:raw.color||''});
    await updRec('paper',id,clean);
    const p=Object.assign({},S.paper.find(x=>x.id===id)||{},clean,{id,type});
    await syncDocReminder(p);
    closeModal();toast(ins?'הפוליסה נקראה ונשמרה':'הרישיון נקרא ונשמר');go('agents');agTab='docs';render();
  }catch(e){closeModal();toast(aiErr(e,'הסוכן לא הצליח לקרוא. אפשר למלא את התאריכים ידנית'));docEditSheet(id);}
}
let pdfjsP=null;
function loadPdfjs(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
  return pdfjsP||(pdfjsP=new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='vendor/pdf.min.js';
    sc.onload=()=>{try{window.pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';res(window.pdfjsLib);}catch(e){rej(e);}};sc.onerror=()=>{pdfjsP=null;rej(new Error('pdfjs'));};document.head.appendChild(sc);}));
}
async function pdfToImages(file,maxPages){
  const lib=await loadPdfjs();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const out=[];
  for(let i=1;i<=Math.min(doc.numPages,maxPages||8);i++){
    const page=await doc.getPage(i);const vp1=page.getViewport({scale:1});const vp=page.getViewport({scale:Math.min(2.2,1500/vp1.width)});
    const cv=document.createElement('canvas');cv.width=Math.round(vp.width);cv.height=Math.round(vp.height);const ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);
    await page.render({canvasContext:ctx,viewport:vp}).promise;
    out.push(await new Promise(r=>cv.toBlob(b=>r(new File([b],`page-${i}.jpg`,{type:'image/jpeg'})),'image/jpeg',0.9)));
  }
  return out;
}
async function syncDocReminder(p){
  const date=p.type==='license'?p.validUntil:p.end;if(!date)return;
  const key=p.type==='license'?'test':'ins:'+p.id;
  const title=p.type==='license'?'טסט שנתי':`חידוש ביטוח ${p.policyType||'רכב'}`;
  let r=S.reminder.find(x=>x.docKey===key)||(p.type==='license'?S.reminder.find(x=>/טסט/.test(x.title||'')):null);
  const data={title,kind:'doc',intervalKm:null,intervalDays:365,lastDate:addDays(date,-365),docKey:key};
  if(r)await updRec('reminder',r.id,data);else await addRec('reminder',Object.assign({note:'',history:[],lastKm:odo()},data));
}
function docEditSheet(id){
  const p=S.paper.find(x=>x.id===id);if(!p)return;const ins=p.type==='insurance';
  openModal(ins?'פרטי הפוליסה':'פרטי הרישיון',`<form id="de"><div class="fgrid">
    ${ins?`<div class="field"><label for="deI">חברת ביטוח</label><input type="text" id="deI" value="${esc(p.insurer||'')}"></div>
    <div class="field"><label for="deT">סוג</label><input type="text" id="deT" list="deTl" value="${esc(p.policyType||'')}"><datalist id="deTl"><option>חובה</option><option>מקיף</option><option>צד ג׳</option><option>חובה ומקיף</option></datalist></div>
    <div class="field"><label for="deS">מתאריך</label><input type="date" id="deS" value="${esc(p.start||'')}"></div>
    <div class="field"><label for="deE">בתוקף עד *</label><input type="date" id="deE" value="${esc(p.end||'')}"></div>
    <div class="field"><label for="deC">טלפון לתביעות</label><input type="tel" id="deC" dir="ltr" value="${esc(p.claimsPhone||'')}"></div>
    <div class="field"><label for="deR">טלפון לגרירה</label><input type="tel" id="deR" dir="ltr" value="${esc(p.roadsidePhone||'')}"></div>`
    :`<div class="field full"><label for="deV">תוקף הרישיון (מועד הטסט) *</label><input type="date" id="deV" value="${esc(p.validUntil||'')}"></div>`}
    </div><div class="formacts"><button class="btn primary" type="submit">${I('check')}שמירה</button>${sample&&(p.files||[]).length?`<button class="btn ghost" type="button" id="deRe">${I('spark')}קריאה מחדש ע״י הסוכן</button>`:''}<button class="btn ghost" type="button" data-act="close">ביטול</button></div></form>`,root=>{
    root.querySelector('#de').onsubmit=async e=>{e.preventDefault();const g=k=>{const el=root.querySelector('#'+k);return el?el.value.trim():'';};
      const data=ins?{insurer:g('deI'),policyType:g('deT'),start:g('deS'),end:g('deE'),claimsPhone:g('deC'),roadsidePhone:g('deR')}:{validUntil:g('deV')};
      if(ins?!data.end:!data.validUntil){toast(ins?'צריך תאריך סיום':'צריך תאריך תוקף');return;}
      try{await updRec('paper',id,data);await syncDocReminder(Object.assign({},p,data));closeModal();toast('נשמר. התזכורת עודכנה');agTab='docs';go('agents');}catch(x){toast('השמירה נכשלה');}};
    const re=root.querySelector('#deRe');if(re)re.onclick=async()=>{busy(re,true,'טוען…');try{const blobs=[];for(const f of p.files){const url=window.__rcptUrlAsync?await window.__rcptUrlAsync(f.id):rcptSrc(f.id);const b=await (await fetch(url)).blob();blobs.push(new File([b],f.name||'doc',{type:f.type||b.type}));}await readDoc(id,blobs,p.type);}catch(x){busy(re,false);toast('לא הצלחתי לטעון את הקובץ');}};
  });
}
function docDeleteSheet(id){
  const p=S.paper.find(x=>x.id===id);if(!p)return;
  return undoDelete('paper',id,p.type==='license'?'רישיון הרכב נמחק':'הפוליסה נמחקה');
  openModal('מחיקת מסמך',`<p style="margin-top:0">למחוק את ${p.type==='license'?'רישיון הרכב':'הפוליסה'} ואת הקובץ? התזכורת שנוצרה ממנו תישאר.</p><div class="formacts"><button class="btn primary" id="ddY" style="background:var(--crit);border-color:var(--crit)">${I('trash')}מחיקה</button><button class="btn ghost" data-act="close">ביטול</button></div>`,root=>{
    root.querySelector('#ddY').onclick=async()=>{try{await delRec('paper',id);for(const f of p.files||[])Promise.resolve(assets&&assets.delete&&assets.delete(f.id)).catch(()=>{});closeModal();toast('נמחק');}catch(e){toast('המחיקה נכשלה');}};
  });
}

/* ---------- driver: license renewal and refresher course ---------- */
function driverInfo(){const p=S.person||{};const newEnd=p.firstIssued?addDays(p.firstIssued,730):'';
  return {p,exp:p.licenseExpiry||'',newEnd,refresherDue:!!(newEnd&&!p.refresherDone),files:p.files||[]};}
function driverCard(){
  const d=driverInfo(),w=docWhen(d.exp),nw=d.newEnd?docWhen(d.newEnd):null;
  if(!d.exp&&!d.p.firstIssued)return `<section class="card pol"><div class="pol-head"><div><div class="eyebrow">רישיון הנהיגה שלי</div><h2>חידוש ורענון</h2></div></div>
    <p class="lead2 small muted" style="margin:0">נזכיר לך לפני שרישיון הנהיגה פג, ובסוף תקופת נהג חדש נזכיר על קורס הרענון. מספר הזהות לא נשמר.</p>
    <div class="pol-acts"><button class="btn sm primary" data-act="drvEdit">${I('id')}הוספת רישיון נהיגה</button></div></section>`;
  return `<section class="card pol"><div class="pol-head"><div><div class="eyebrow">רישיון הנהיגה שלי</div><h2>חידוש ורענון</h2></div></div>
    <div class="docs-strip" style="margin:0">
      <div class="dstat ${w.cls}"><div class="ic">${I('id')}</div><div style="min-width:0"><b>חידוש רישיון נהיגה</b><span>${d.exp?'בתוקף עד '+fmtD(d.exp):'אין תאריך'}</span></div><div class="when">${w.txt}</div></div>
      ${d.p.firstIssued?`<div class="dstat ${d.p.refresherDone?'ok':nw.cls}"><div class="ic">${I('check')}</div><div style="min-width:0"><b>רענון נהיגה</b><span>${d.p.refresherDone?'בוצע':'בסוף שנתיים של נהג חדש'}</span></div><div class="when">${d.p.refresherDone?'✓':daysBetween(today(),d.newEnd)>0?'עוד '+daysBetween(today(),d.newEnd)+' ימים':'הגיע הזמן'}</div></div>`:''}
    </div>
    <div class="pol-acts">${d.files.map((f,i)=>`<button class="btn sm ghost" data-act="drvFile" data-i="${i}">${I('doc')}הקובץ</button>`).join('')}<button class="btn sm ghost" data-act="drvEdit">${I('edit')}עריכה</button></div>
  </section>`;
}
const dlicPrompt=()=>`זה רישיון נהיגה ישראלי (צילום או PDF). החזר JSON בלבד: {"isDriverLicense":boolean,"expiry":"YYYY-MM-DD"|null,"firstIssued":"YYYY-MM-DD"|null,"categories":string|null}
expiry הוא "בתוקף עד" של הרישיון. firstIssued: התאריך הכי מוקדם שבו הוצא רישיון לדרגה כלשהי (אם מופיע). תאריכים בישראל כתובים יום.חודש.שנה. אסור להחזיר מספר זהות, שם, כתובת או תאריך לידה. אל תנחש; מה שלא מופיע הוא null. היום ${today()}.`;
function driverSheet(){
  const p=S.person||{};
  openModal('רישיון הנהיגה שלי',`<form id="dv" class="stack" style="gap:14px">
    ${sample?`<button type="button" class="btn ghost block" id="dvScan">${I('cam')}צילום רישיון הנהיגה (הסוכן ממלא את התאריכים)</button><input type="file" id="dvF" accept="image/*,application/pdf" hidden>`:''}
    <div class="fgrid">
      <div class="field"><label for="dvE">רישיון הנהיגה בתוקף עד</label><input type="date" id="dvE" value="${esc(p.licenseExpiry||'')}"></div>
      <div class="field"><label for="dvI">קיבלתי רישיון לראשונה ב־</label><input type="date" id="dvI" max="${today()}" value="${esc(p.firstIssued||'')}"></div>
      <label class="field full" style="display:flex;gap:10px;align-items:center;flex-direction:row"><input type="checkbox" id="dvR" ${p.refresherDone?'checked':''} style="width:20px;height:20px;accent-color:var(--accent)">עשיתי כבר את קורס רענון הנהיגה</label>
    </div>
    <p class="small muted" style="margin:0">רענון נהיגה: קורס קצר שמקבלים בסוף שנתיים של נהג חדש. התוקף של רישיון הנהיגה משתנה לפי גיל ולפי מועד ההנפקה, לכן כדאי להעתיק אותו מהרישיון עצמו.</p>
    <div class="formacts"><button class="btn primary" type="submit">${I('check')}שמירה</button><button class="btn ghost" type="button" data-act="close">ביטול</button></div></form>`,root=>{
    let file=null;
    const sc=root.querySelector('#dvScan');if(sc){const f=root.querySelector('#dvF');sc.onclick=()=>f.click();
      f.onchange=async()=>{file=f.files[0];if(!file)return;busy(sc,true,'הסוכן קורא…');
        try{const raw=await sample.json(dlicPrompt(),{images:[file],modelTier:'default',maxTokens:400,purpose:'scan'});if(!sc.isConnected)return;const d=/^\d{4}-\d\d-\d\d$/;
          if(!raw||raw.isDriverLicense===false){toast('זה לא נראה כמו רישיון נהיגה');}else{if(d.test(raw.expiry||''))root.querySelector('#dvE').value=raw.expiry;if(d.test(raw.firstIssued||''))root.querySelector('#dvI').value=raw.firstIssued;toast('התאריכים מולאו. בדוק ושמור');}
        }catch(e){toast(aiErr(e,'לא הצלחתי לקרוא. אפשר למלא ידנית'));}busy(sc,false);};}
    root.querySelector('#dv').onsubmit=async e=>{e.preventDefault();
      const data={licenseExpiry:root.querySelector('#dvE').value,firstIssued:root.querySelector('#dvI').value,refresherDone:root.querySelector('#dvR').checked};
      const b=e.submitter||root.querySelector('button[type=submit]');busy(b,true);
      try{
        if(file&&assets){const a=await assets.upload(file);for(const f of (p.files||[]))Promise.resolve(assets.delete(f.id)).catch(()=>{});data.files=[{id:a.id,type:file.type||'',name:(file.name||'').slice(0,120)}];}
        await setRec('person','me',Object.assign({},(({id,...o})=>o)(p),data));
        await syncGlobalReminder('dlic',`חידוש רישיון נהיגה`,data.licenseExpiry);
        const ne=data.firstIssued?addDays(data.firstIssued,730):'';
        await syncGlobalReminder('refresher','רענון נהיגה (סוף תקופת נהג חדש)',!data.refresherDone&&ne&&daysBetween(today(),ne)>-365?ne:'');
        closeModal();toast('נשמר. נזכיר לך בזמן');
      }catch(x){busy(b,false);toast('השמירה נכשלה');}};
  });
}
// one-off deadlines shared by all cars (license, refresher, ticket payment)
async function syncGlobalReminder(key,title,date){
  const r=RAW.reminder.find(x=>x.docKey===key);
  if(!date){if(r)await delRec('reminder',r.id);return;}
  const data={title,kind:'doc',intervalKm:null,intervalDays:60,lastDate:addDays(date,-60),docKey:key,carId:'*',once:true};
  if(r)await updRec('reminder',r.id,data);else await addRec('reminder',Object.assign({note:'',history:[],lastKm:null},data));
}

/* ===== 06-snooze-restore-tickets.js ===== */
/* ---------- snooze a reminder ---------- */
function snoozeSheet(id){
  const r=S.reminder.find(x=>x.id===id);if(!r)return;const st=remState(r);const o=odo();
  const opts=[['d',7,'שבוע'],['d',14,'שבועיים'],['d',30,'חודש']];
  if(n(r.intervalKm)&&!r.once)opts.push(['k',500,'עוד 500 ק״מ'],['k',1000,'עוד 1,000 ק״מ']);
  openModal('דחיית תזכורת',`<p style="margin-top:0"><b>${esc(r.title)}</b> · ${esc(st.label)}</p>
    <div class="snz">${opts.map(([t,v,l])=>`<button type="button" class="btn ghost" data-t="${t}" data-v="${v}">${l}</button>`).join('')}</div>
    ${st.snoozed?`<button type="button" class="btn ghost block" id="snzOff" style="margin-top:10px">ביטול הדחייה</button>`:''}
    <p class="small muted" style="margin:12px 0 0">בזמן הדחייה לא נשלחות התראות על התזכורת הזאת.</p>`,root=>{
    root.querySelectorAll('[data-t]').forEach(b=>b.onclick=async()=>{const t=b.dataset.t,v=+b.dataset.v;
      const data=t==='d'?{snoozeDate:addDays(today(),v),snoozeKm:null}:{snoozeKm:o+v,snoozeDate:''};
      try{await updRec('reminder',id,data);closeModal();toast(t==='d'?`נזכיר שוב ב־${fmtD(data.snoozeDate)}`:`נזכיר שוב ב־${km(data.snoozeKm)} ק״מ`);}catch(e){toast('הדחייה נכשלה');}});
    const off=root.querySelector('#snzOff');if(off)off.onclick=async()=>{try{await updRec('reminder',id,{snoozeDate:'',snoozeKm:null});closeModal();toast('הדחייה בוטלה');}catch(e){toast('העדכון נכשל');}};
  });
}

/* ---------- restore an exported backup ---------- */
function restoreSheet(){
  const A=window.cjAccount;if(!A||!A.restoreData)return;
  openModal('שחזור מגיבוי',`<div class="stack" style="gap:14px">
    <p style="margin:0">בוחרים קובץ גיבוי שייצאת מ״החשבון שלי״ (קובץ JSON). הרישומים מהקובץ יתווספו לחשבון, ורישום שכבר קיים יעודכן לגרסה שבקובץ. שום דבר לא נמחק.</p>
    <div class="drop" id="rsBox"><input type="file" id="rsF" accept="application/json,.json"><span id="rsT">${I('doc')} בחירת קובץ הגיבוי</span></div>
    <div id="rsSum" class="small" role="status"></div>
    <div class="formacts"><button class="btn primary" id="rsGo" disabled>${I('undo')}שחזור</button><button class="btn ghost" data-act="close">ביטול</button></div></div>`,root=>{
    let data=null;const go=root.querySelector('#rsGo'),sum=root.querySelector('#rsSum');
    root.querySelector('#rsF').onchange=async e=>{const f=e.target.files[0];if(!f)return;data=null;go.disabled=true;
      try{const j=JSON.parse(await f.text());if(!j||!j.records||typeof j.records!=='object')throw 0;data=j.records;
        const L={garage:'רכבים',fuel:'תדלוקים',service:'טיפולים',expense:'הוצאות',reminder:'תזכורות',paper:'מסמכים',ticket:'דוחות',person:'פרטי נהג'};
        const parts=Object.keys(L).filter(k=>Array.isArray(data[k])&&data[k].length).map(k=>`${data[k].length} ${L[k]}`);
        sum.innerHTML=parts.length?`בקובץ: ${parts.join(' · ')}${j.exportedAt?`<br><span class="muted">גובה ב־${fmtD(String(j.exportedAt).slice(0,10))}</span>`:''}`:'הקובץ ריק.';
        root.querySelector('#rsT').textContent=f.name;go.disabled=!parts.length;
      }catch(x){sum.textContent='זה לא נראה כמו קובץ גיבוי של יומן הרכב.';}};
    go.onclick=async()=>{if(!data)return;busy(go,true,'משחזר…');
      try{const r=await A.restoreData(data,k=>{sum.textContent=`משחזר… ${k}`;});
        closeModal();toast(`שוחזרו ${r.done} רישומים`+(r.limit?` · ${r.limit} רכבים מעבר למגבלה לא נוספו`:'')+(r.failed?` · ${r.failed} נכשלו`:''));
      }catch(x){busy(go,false);toast('השחזור נכשל');}};
  });
}

/* ---------- traffic tickets and points ---------- */
const TK_KIND={traffic:'דוח תנועה',camera:'מצלמה',parking:'חניה',other:'אחר'};
function tkDue(t){return t.dueDate||(t.serviceDate||t.offenseDate?addDays(t.serviceDate||t.offenseDate,90):'');}
function pointsState(){
  const t0=today();const pts=S.ticket.filter(t=>n(t.points)>0&&t.status!=='cancelled'&&t.offenseDate).sort((a,b)=>a.offenseDate.localeCompare(b.offenseDate));
  const in2=pts.filter(t=>daysBetween(t.offenseDate,t0)<730);
  const sum2=in2.reduce((s,t)=>s+n(t.points),0);
  const years=sum2>=22?4:2;
  const valid=pts.filter(t=>daysBetween(t.offenseDate,t0)<years*365);
  const total=valid.reduce((s,t)=>s+n(t.points),0);
  const last=S.ticket.filter(t=>t.offenseDate&&t.status!=='cancelled').map(t=>t.offenseDate).sort().pop()||'';
  const lastPts=valid.length?valid[valid.length-1].offenseDate:'';
  const reset=lastPts?addDays(lastPts,years*365):'';
  return {total,years,last,reset,valid};
}
function vTickets(){
  const ps=pointsState();const open=S.ticket.filter(t=>t.status==='open').sort((a,b)=>tkDue(a).localeCompare(tkDue(b)));
  const rest=S.ticket.filter(t=>t.status!=='open').sort((a,b)=>(b.offenseDate||'').localeCompare(a.offenseDate||''));
  const lvl=ps.total>=36?{c:'crit',t:'36 נקודות ומעלה: פסילה של 3 חודשים'}:ps.total>=24?{c:'crit',t:'24 ומעלה: קורס נהיגה מתקדם'}:ps.total>=12?{c:'warn',t:'12 ומעלה: קורס נהיגה נכונה'}:{c:'ok',t:'מתחת לסף של 12 נקודות'};
  const pct=Math.min(100,ps.total/36*100);
  const since=ps.last?daysBetween(ps.last,today()):null;
  const tl=ps.reset&&ps.valid.length?(()=>{const start=ps.valid[ps.valid.length-1].offenseDate;const all=daysBetween(start,ps.reset),gone=Math.max(0,Math.min(all,daysBetween(start,today())));return {pct:all?gone/all*100:100,left:Math.max(0,all-gone),start};})():null;
  const up=`<div class="docs-up"><button class="btn primary" data-act="tkAdd">${I('cam')}דוח חדש</button><button class="btn ghost" data-act="tkImport">${I('doc')}ייבוא תדפיס נקודות</button></div>`;
  return `<div class="sec-title"><h2>דוחות ונקודות</h2><span class="small muted">של הנהג, לכל הרכבים</span></div>
  <section class="card pol">
    <div class="pol-head"><div><div class="eyebrow">הנקודות שלי כרגע</div><h2 class="num" style="font-size:44px;line-height:1">${ps.total}<small style="font-size:16px;color:var(--muted);font-weight:400"> נקודות</small></h2></div>
      <span class="chip" style="${lvl.c==='crit'?'color:var(--crit);border-color:var(--crit)':lvl.c==='warn'?'color:var(--warn);border-color:var(--warn)':'color:var(--ok);border-color:var(--ok)'}">${lvl.t}</span></div>
    <div class="ptsbar" role="img" aria-label="${ps.total} מתוך 36 נקודות"><i style="width:${pct}%"></i><span style="inset-inline-start:33.3%">12</span><span style="inset-inline-start:66.6%">24</span><span style="inset-inline-start:calc(100% - 14px)">36</span></div>
    <div class="docs-strip" style="margin:0">
      <div class="dstat"><div class="ic">${I('cal')}</div><div><b>${since===null?'אין דוחות':since+' ימים'}</b><span>${since===null?'עוד לא נרשם דוח':'מאז הדוח האחרון ('+fmtD(ps.last)+')'}</span></div></div>
      <div class="dstat ${ps.total?'':'ok'}"><div class="ic">${I('check')}</div><div><b>${ps.total?(tl?tl.left+' ימים':''):'אין נקודות'}</b><span>${ps.total?'עד שכל הנקודות מתאפסות ('+fmtD(ps.reset)+')':'אין נקודות בתוקף'}</span></div></div>
    </div>
    ${tl?`<div><div class="tline"><i style="width:${tl.pct}%"></i></div><div class="small muted" style="display:flex;justify-content:space-between;margin-top:6px"><span>הדוח האחרון עם נקודות · ${fmtD(tl.start)}</span><span>איפוס · ${fmtD(ps.reset)}</span></div></div>`:''}
    <p class="small muted" style="margin:0">נקודות נספרות ${ps.years===4?'4 שנים (צברת 22 ומעלה בתוך שנתיים)':'שנתיים'} מתאריך העבירה. החישוב לפי הדוחות שרשמת; הנתון הרשמי בתדפיס הנקודות של משרד התחבורה.</p>
  </section>
  <section class="card" style="margin-bottom:16px">
    <div class="card-head"><h2>לתשלום</h2><span class="small muted">תזכורת שבוע לפני המועד האחרון</span></div>
    ${open.length?`<div class="stack" style="gap:10px">${open.map(tkRow).join('')}</div>`:`<p class="small muted" style="margin:0">אין דוחות פתוחים. 👏</p>`}
    <div style="margin-top:14px">${up}</div>
  </section>
  ${rest.length?`<section class="card" style="margin-bottom:16px"><div class="card-head"><h2>היסטוריה</h2></div><div class="stack" style="gap:10px">${rest.map(tkRow).join('')}</div></section>`:''}`;
}
function tkRow(t){
  const due=tkDue(t),dl=due?daysBetween(today(),due):null;
  const st=t.status==='paid'?{c:'ok',x:'שולם'}:t.status==='cancelled'?{c:'',x:'בוטל'}:t.status==='court'?{c:'',x:'ביקשתי להישפט'}:dl===null?{c:'',x:'פתוח'}:dl<0?{c:'crit',x:`באיחור ${-dl} ימים · +50% פיגורים`}:{c:dl<=7?'crit':dl<=21?'warn':'ok',x:`עוד ${dl} ימים לשלם`};
  const car=t.carId&&t.carId!=='*'?S.cars.find(c=>c.id===t.carId):null;
  return `<div class="dstat ${st.c}" style="align-items:flex-start"><div class="ic">${I('ticket')}</div><div style="min-width:0;flex:1"><span class="tkst">${st.x}</span><b>${esc(t.description||TK_KIND[t.kind]||'דוח')}</b>
    <span>${[TK_KIND[t.kind],t.offenseDate&&fmtD(t.offenseDate),n(t.amount)?money(t.amount):'',n(t.points)?t.points+' נק׳':'',car&&carName(car)].filter(Boolean).join(' · ')}</span>
    <div class="pol-acts" style="margin-top:8px">${t.status==='open'?`<button class="btn sm primary" data-act="tkPaid" data-id="${t.id}">${I('check')}שילמתי</button>`:''}<button class="btn sm ghost" data-act="tkEdit" data-id="${t.id}">${I('edit')}עריכה</button>${(t.files||[]).length?`<button class="btn sm ghost" data-act="tkFile" data-id="${t.id}">${I('doc')}הדוח</button>`:''}</div></div>
    </div></div>`;
}
const ticketPrompt=()=>`זה דוח תנועה, דוח מצלמה או דוח חניה בישראל (צילום או PDF). החזר JSON בלבד:
{"isTicket":boolean,"kind":"traffic"|"camera"|"parking"|"other","offenseDate":"YYYY-MM-DD"|null,"serviceDate":"YYYY-MM-DD"|null,"dueDate":"YYYY-MM-DD"|null,"amount":number|null,"points":number|null,"description":string|null,"ticketNo":string|null,"plate":string|null,"authority":string|null}
- offenseDate: תאריך העבירה. serviceDate: תאריך מסירת הדוח/המצאה אם מופיע. dueDate: "לתשלום עד" / מועד אחרון אם כתוב במפורש.
- description: תיאור העבירה בעברית פשוטה ובקצרה ("מהירות 20 קמ״ש מעל המותר", "חניה באדום־לבן").
- points: רק אם מספר הנקודות כתוב בדוח. אל תנחש.
- authority: מי הוציא (משטרת ישראל, עיריית תל אביב...). תאריכים יום/חודש/שנה. אל תעתיק מספר זהות, שם או כתובת. היום ${today()}.`;
function ticketSheet(id){
  const t=id?S.ticket.find(x=>x.id===id)||{}:{kind:'traffic',status:'open'};
  openModal(id?'עריכת דוח':'דוח חדש',`<form id="tk" class="stack" style="gap:14px">
    ${sample&&!id?`<button type="button" class="btn primary block" id="tkScan">${I('cam')}צילום הדוח (הסוכן ממלא)</button><input type="file" id="tkF" accept="image/*,application/pdf" hidden><div class="small muted" id="tkS" style="text-align:center;min-height:1.2em"></div>`:''}
    <div class="fgrid">
      <div class="field"><label for="tkK">סוג</label><select id="tkK">${Object.entries(TK_KIND).map(([k,v])=>`<option value="${k}" ${t.kind===k?'selected':''}>${v}</option>`).join('')}</select></div>
      <div class="field"><label for="tkD">תיאור</label><input type="text" id="tkD" value="${esc(t.description||'')}" placeholder="מהירות, רמזור, חניה…"></div>
      <div class="field"><label for="tkO">תאריך העבירה *</label><input type="date" id="tkO" max="${today()}" value="${esc(t.offenseDate||'')}"></div>
      <div class="field"><label for="tkR">קיבלתי את הדוח ב־</label><input type="date" id="tkR" max="${today()}" value="${esc(t.serviceDate||'')}"></div>
      <div class="field"><label for="tkA">סכום (₪)</label><input type="number" inputmode="decimal" id="tkA" value="${esc(t.amount??'')}"></div>
      <div class="field"><label for="tkP">נקודות</label><input type="number" inputmode="numeric" id="tkP" min="0" max="20" value="${esc(t.points??'')}"></div>
      <div class="field"><label for="tkU">לשלם עד</label><input type="date" id="tkU" value="${esc(t.dueDate||'')}"><span class="small muted">ריק = 90 יום מקבלת הדוח</span></div>
      <div class="field"><label for="tkSt">מצב</label><select id="tkSt">${[['open','פתוח'],['paid','שולם'],['court','ביקשתי להישפט'],['cancelled','בוטל']].map(([k,v])=>`<option value="${k}" ${t.status===k?'selected':''}>${v}</option>`).join('')}</select></div>
      ${S.cars.length>1?`<div class="field full"><label for="tkC">רכב</label><select id="tkC"><option value="*">לא משנה</option>${S.cars.map(c=>`<option value="${esc(c.id)}" ${t.carId===c.id?'selected':''}>${esc(carName(c))}</option>`).join('')}</select></div>`:''}
    </div>
    <div class="formacts"><button class="btn primary" type="submit">${I('check')}שמירה</button>${id?`<button class="btn ghost" type="button" id="tkDel" style="color:var(--crit)">${I('trash')}מחיקה</button>`:''}<button class="btn ghost" type="button" data-act="close">ביטול</button></div></form>`,root=>{
    let file=null;const v=k=>root.querySelector('#'+k);
    const sc=v('tkScan');if(sc){sc.onclick=()=>v('tkF').click();v('tkF').onchange=async()=>{file=v('tkF').files[0];if(!file)return;busy(sc,true,'הסוכן קורא את הדוח…');
      try{const r=await sample.json(ticketPrompt(),{images:[file],modelTier:'default',maxTokens:600,purpose:'scan'});if(!sc.isConnected)return;const d=/^\d{4}-\d\d-\d\d$/;
        if(!r||r.isTicket===false){v('tkS').textContent='זה לא נראה כמו דוח. אפשר למלא ידנית.';}
        else{if(TK_KIND[r.kind])v('tkK').value=r.kind;if(r.description)v('tkD').value=r.description;['offenseDate:tkO','serviceDate:tkR','dueDate:tkU'].forEach(x=>{const [k,i]=x.split(':');if(d.test(r[k]||''))v(i).value=r[k];});
          if(n(r.amount))v('tkA').value=n(r.amount);if(n(r.points)!=null)v('tkP').value=n(r.points);file._no=r.ticketNo||'';
          v('tkS').textContent=n(r.points)==null&&r.kind!=='parking'?'מולא. אם יש נקודות על העבירה, הוסף אותן ידנית.':'מולא. בדוק ושמור.';}
      }catch(e){if(sc.isConnected)v('tkS').textContent=aiErr(e,'הסוכן לא הצליח לקרוא. אפשר למלא ידנית.');}busy(sc,false);};}
    const del=v('tkDel');if(del)del.onclick=async()=>{await syncGlobalReminder('tk:'+id,'','');undoDelete('ticket',id,'הדוח נמחק');};
    root.querySelector('#tk').onsubmit=async e=>{e.preventDefault();
      const data={kind:v('tkK').value,description:v('tkD').value.trim(),offenseDate:v('tkO').value,serviceDate:v('tkR').value,amount:n(v('tkA').value),points:n(v('tkP').value)||0,dueDate:v('tkU').value,status:v('tkSt').value,carId:v('tkC')?v('tkC').value:'*'};
      if(!data.offenseDate){toast('צריך תאריך עבירה');return;}
      if(data.status==='paid'&&t.status!=='paid')data.paidAt=today();
      const b=root.querySelector('button[type=submit]');busy(b,true);
      try{
        if(file&&assets){const a=await assets.upload(file);data.files=[{id:a.id,type:file.type||'',name:(file.name||'').slice(0,120)}];if(file._no)data.ticketNo=file._no;}
        let tid=id;if(id)await updRec('ticket',id,data);else{const ref=await addRec('ticket',Object.assign({createdAt:Date.now()},data));tid=ref.id;}
        const due=tkDue(data);await syncGlobalReminder('tk:'+tid,`תשלום ${TK_KIND[data.kind]||'דוח'}${n(data.amount)?' '+money(data.amount):''}`,data.status==='open'?due:'');
        closeModal();toast(data.status==='open'&&due?`נשמר. נזכיר לך לפני ${fmtD(due)}`:'נשמר');
      }catch(x){console.error(x);busy(b,false);toast('השמירה נכשלה');}};
  });
}
async function ticketPaid(id){const t=S.ticket.find(x=>x.id===id);if(!t)return;try{await updRec('ticket',id,{status:'paid',paidAt:today()});await syncGlobalReminder('tk:'+id,'','');toast('סומן כשולם');}catch(e){toast('העדכון נכשל');}}
const pointsPrompt=()=>`זה תדפיס נקודות / רישום תעבורתי ממשרד התחבורה בישראל. החזר JSON בלבד: {"isPointsReport":boolean,"totalPoints":number|null,"offenses":[{"offenseDate":"YYYY-MM-DD","points":number,"description":string}]}
כל עבירה עם תאריך העבירה, מספר הנקודות ותיאור קצר בעברית פשוטה. תאריכים יום/חודש/שנה. אל תעתיק מספר זהות, שם או כתובת. היום ${today()}.`;
function pointsImportSheet(){
  if(!sample){toast('הסוכן לא זמין כרגע');return;}
  openModal('ייבוא תדפיס נקודות',`<div class="stack" style="gap:14px">
    <p style="margin:0">מורידים את <b>תדפיס הנקודות</b> מאתר משרד התחבורה (שירות חינמי עם הזדהות), ומעלים אותו כאן. הסוכן יוסיף את כל העבירות עם הנקודות, כדי שהספירה תהיה מדויקת.</p>
    <a class="btn ghost" href="https://www.gov.il/he/service/driver_penalty_point_check" target="_blank" rel="noopener">${I('send')}לאתר משרד התחבורה</a>
    <div class="drop" id="ptBox"><input type="file" id="ptF" accept="image/*,application/pdf"><span>${I('doc')} בחירת התדפיס (PDF או צילום)</span></div>
    <div class="small muted" id="ptS" role="status"></div></div>`,root=>{
    root.querySelector('#ptF').onchange=async e=>{const f=e.target.files[0];if(!f)return;const st=root.querySelector('#ptS');st.innerHTML='<span class="spin"></span> הסוכן קורא את התדפיס…';
      try{const r=await sample.json(pointsPrompt(),{images:[f],modelTier:'default',maxTokens:2500,purpose:'document'});
        if(!r||r.isPointsReport===false||!Array.isArray(r.offenses)){st.textContent='זה לא נראה כמו תדפיס נקודות.';return;}
        const d=/^\d{4}-\d\d-\d\d$/;let added=0;
        for(const o of r.offenses.slice(0,60)){if(!d.test(o.offenseDate||''))continue;const pts=n(o.points)||0;
          if(S.ticket.some(t=>t.offenseDate===o.offenseDate&&(n(t.points)||0)===pts))continue;
          await addRec('ticket',{kind:'traffic',description:String(o.description||'').slice(0,120),offenseDate:o.offenseDate,points:pts,status:'paid',source:'mot',carId:'*',createdAt:Date.now()});added++;}
        closeModal();toast(added?`נוספו ${added} עבירות מהתדפיס`:'כל העבירות מהתדפיס כבר רשומות');
      }catch(x){st.textContent=aiErr(x,'הסוכן לא הצליח לקרוא את התדפיס.');}};
  });
}

/* ===== 07-cars-onboarding.js ===== */
/* ---------- cars (up to MAX_CARS per account) ---------- */
// next thing due for any car (computed by briefly viewing that car)
function carNext(id){const keep=CAR;CAR=id;applyCar();let out=null;
  try{const it=sortedReminders(r=>r.carId!=='*')[0];if(it)out={title:it.r.title,st:it.st};}finally{CAR=keep;applyCar();}return out;}
function carSheet(){
  const fleet=S.cars.map(c=>({c,nx:carNext(c.id)})).sort((a,b)=>(a.nx?RANK[a.nx.st.status]:3)-(b.nx?RANK[b.nx.st.status]:3));
  const list=fleet.map(({c,nx})=>{const on=c.id===CAR;
    const tag=nx?`<span class="chip" style="${nx.st.status==='over'?'color:var(--crit);border-color:var(--crit)':nx.st.status==='soon'?'color:var(--warn);border-color:var(--warn)':''}">${esc(nx.title)} · ${esc(nx.st.label)}</span>`:'';
    return `<button type="button" class="caropt ${on?'on':''}" data-car="${esc(c.id)}"><div class="ic">${I('car')}</div><div style="min-width:0;flex:1"><b>${esc(carName(c))}</b><span>${esc([c.year,c.plate,n(c.odometer)?km(c.odometer)+' ק״מ':''].filter(Boolean).join(' · '))}</span>${tag?`<div style="margin-top:6px">${tag}</div>`:''}</div>${on?`<span class="chk">${I('check')}</span>`:''}</button>`;}).join('');
  const canAdd=S.cars.length<MAX_CARS;
  openModal(PLAN==='business'?'הצי שלי':'הרכבים שלי',`<div class="stack" style="gap:16px">
    ${S.cars.length>2?`<p class="small muted" style="margin:0">${S.cars.length} רכבים, מסודרים לפי מה שהכי דחוף.</p>`:''}
    ${isBiz()&&S.cars.length>1?`<button type="button" class="btn block" id="carFleet">${I('grid')}כל הצי במסך אחד</button>`:''}
    <div class="carlist">${list}</div>
    ${canAdd?`<button type="button" class="btn primary block" id="carAdd">${I('plus')}הוספת רכב${PLAN==='business'?'':' שני'}</button>`:`<p class="small muted" style="margin:0">${PLAN==='business'?`החשבון העסקי שלך כולל עד ${MAX_CARS} רכבים.`:`חשבון פרטי כולל עד ${MAX_CARS} רכבים. מנהל יותר רכבים, לעסק או למשפחה? <button type="button" class="linkbtn" data-act="bizAsk">חשבון עסקי</button>`}</p>`}
    ${S.cars.length>1&&S.car?`<button type="button" class="btn ghost block" id="carDel" style="color:var(--crit)">${I('trash')}מחיקת ${esc(carName(S.car))} וכל הרישומים שלו</button>`:''}
  </div>`,root=>{
    root.querySelectorAll('[data-car]').forEach(b=>b.onclick=()=>{closeModal();switchCar(b.dataset.car);});
    const a=root.querySelector('#carAdd');if(a)a.onclick=()=>{closeModal();let id='car';for(let i=2;S.cars.some(c=>c.id===id);i++)id='car'+i;onboarding(2,{carId:id});};
    const d=root.querySelector('#carDel');if(d)d.onclick=()=>deleteCarSheet();
    const fl=root.querySelector('#carFleet');if(fl)fl.onclick=()=>{closeModal();setFleetView(true);if(view!=='home')go('home');else render();};
  });
}
function deleteCarSheet(){
  const c=S.car;if(!c||S.cars.length<2)return;
  const recs=['fuel','service','expense','reminder','paper'].flatMap(k=>RAW[k].filter(r=>(r.carId||'car')===c.id).map(r=>[k,r]));
  openModal('מחיקת רכב',`<p>יימחקו <b>${esc(carName(c))}</b> ו־${recs.length} רישומים שלו, כולל הקבלות. אי אפשר לשחזר.</p>
    <div class="field"><label for="cdTxt">כדי לאשר, הקלד <b>מחק</b></label><input type="text" id="cdTxt" autocomplete="off"></div>
    <div class="formacts"><button class="btn primary" id="cdYes" style="background:var(--crit);border-color:var(--crit)">${I('trash')}מחיקה</button><button class="btn ghost" data-act="close">ביטול</button></div>`,root=>{
    root.querySelector('#cdYes').onclick=async e=>{
      if(root.querySelector('#cdTxt').value.trim()!=='מחק'){toast('צריך להקליד מחק');return;}
      busy(e.currentTarget,true,'מוחק…');
      try{
        for(const [k,r] of recs){await delRec(k,r.id);for(const f of [r.receipt,...(r.files||[])])if(f&&f.id&&assets&&assets.delete)await Promise.resolve(assets.delete(f.id)).catch(()=>{});}
        await delRec('garage',c.id);
        const other=S.cars.find(x=>x.id!==c.id);if(other){CAR=other.id;try{localStorage.setItem('cj-car',other.id);}catch(x){}}
        applyCar();closeModal();render();toast('הרכב נמחק');
      }catch(err){console.error(err);busy(e.currentTarget,false);toast('המחיקה נכשלה');}
    };
  });
}

/* ---------- onboarding for a new user ---------- */
let onbShown=false;
function maybeOnboard(){
  if(onbShown||S.car||!window.cjSB)return;
  let skipped=false;try{skipped=localStorage.getItem('cj-onb-skip')==='1';}catch(e){}
  if(skipped)return;
  onbShown=true;setTimeout(()=>onboarding(1),50);
}
function onboarding(step,st){
  st=st||{};
  let el=$('#onb');if(!el){el=document.createElement('div');el.id='onb';el.className='onb';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','הגדרה ראשונית');document.body.appendChild(el);}
  const dots=`<div class="onb-dots" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div>`;
  const close=(skip)=>{if(skip){try{localStorage.setItem('cj-onb-skip','1');}catch(e){}}el.remove();};
  if(step===1){
    const SL=[
      {h:'ברוך הבא ליומן הרכב',p:'כל מה שקשור לרכב במקום אחד: דלק, טיפולים, הוצאות, ביטוח ומסמכים. פשוט, יפה, ועובד בשבילך.',stage:`<img class="mk" src="icons/emblem.png" alt="">`,
        perks:[['fuel','דלק וצריכה'],['wrench','טיפולים'],['receipt','הוצאות'],['shield','ביטוח']]},
      {h:'מצלמים קבלה. זהו.',p:'הסוכן קורא את הקבלה מהתחנה או מהמוסך, ממלא סכום, ליטרים ותחנה, ומחשב לך כמה הרכב באמת צורך ועולה.',stage:`<div class="mock">
        <div class="mrow"><div class="ic">${I('cam')}</div><div><b>קבלה מ־Yellow</b><span>נקראה תוך שניות</span></div><span class="tag">₪291.62</span></div>
        <div class="mrow"><div class="ic">${I('fuel')}</div><div><b>37.2 ליטר</b><span>7.85 ₪ לליטר</span></div><span class="tag">14.3 ק״מ/ל׳</span></div>
        <div class="mrow"><div class="ic">${I('chart')}</div><div><b>החודש על הרכב</b><span>דלק, טיפולים והוצאות</span></div><span class="tag">₪1,092</span></div></div>`},
      {h:'לא שוכחים כלום',p:'טיפול תקופתי, טסט, חידוש ביטוח ובדיקות של שמן, מים ואוויר. היומן יודע מתי, ושולח התראה לטלפון לפני הזמן.',stage:`<div class="mock">
        <div class="mrow notif warn"><div class="ic">${I('bell')}</div><div><b>טסט שנתי</b><span>יומן הרכב · עכשיו</span></div><span class="tag">עוד 7 ימים</span></div>
        <div class="mrow notif"><div class="ic">${I('wrench')}</div><div><b>טיפול 15,000</b><span>לפי הק״מ שלך</span></div><span class="tag">עוד 1,200 ק״מ</span></div>
        <div class="mrow notif ok"><div class="ic">${I('tire')}</div><div><b>לחץ אוויר בצמיגים</b><span>סימנת שבדקת</span></div><span class="tag">${I('check')}</span></div></div>`},
      {h:'הביטוח שלך, בשפה פשוטה',p:'מעלים את הפוליסה ורישיון הרכב. הסוכן מסביר מה מכוסה ומה לא, ויועץ הרכב עונה על כל שאלה. הנתונים שלך פרטיים, מוצפנים, ואפשר לייצא או למחוק אותם בכל רגע.',stage:`<div class="mock">
        <div class="mrow"><div class="ic">${I('shield')}</div><div><b>נזק לרכב שלך</b><span>גם אם אתה אשם</span></div><span class="tag">עד שווי הרכב</span></div>
        <div class="mrow"><div class="ic">${I('car')}</div><div><b>רכב חלופי</b><span>כשהרכב במוסך</span></div><span class="tag">עד 14 ימים</span></div>
        <div class="mrow"><div class="ic">${I('chat')}</div><div><b>״מה מכוסה אם נכנסו בי?״</b><span>יועץ הרכב</span></div><span class="tag">${I('send')}</span></div></div>`}];
    el.innerHTML=`<div class="intro">
      <div class="intro-top"><span class="beta" style="top:0;margin:0">בטא</span><button class="onb-skip" id="onbSkipI">דילוג</button></div>
      <div class="intro-track" id="itr" aria-roledescription="קרוסלה" aria-label="מה יש ביומן הרכב">
        ${SL.map((x,i)=>`<section class="slide ${i===0?'on':''}" aria-roledescription="שקופית" aria-label="${i+1} מתוך ${SL.length}">
          <div class="stage">${x.stage}</div><h2>${x.h}</h2><p>${x.p}</p>${x.perks?`<div class="perks">${x.perks.map(([ic,t])=>`<span>${I(ic)}${t}</span>`).join('')}</div>`:''}</section>`).join('')}
      </div>
      <div class="intro-dots" role="tablist">${SL.map((x,i)=>`<button type="button" role="tab" aria-label="שקופית ${i+1}" class="${i===0?'on':''}" data-i="${i}"></button>`).join('')}</div>
      <div class="onb-acts"><button class="btn primary block" id="onbNext">הבא</button><button class="onb-skip" id="onbLater">אחר כך</button></div></div>`;
    const tr=el.querySelector('#itr'),slides=[...tr.children],dotsB=[...el.querySelectorAll('.intro-dots button')],nx=el.querySelector('#onbNext');
    let cur=0;
    const show=i=>{cur=i;slides.forEach((x,k)=>x.classList.toggle('on',k===i));dotsB.forEach((d,k)=>{d.classList.toggle('on',k===i);d.setAttribute('aria-selected',k===i);});nx.textContent=i===slides.length-1?'בוא נגדיר את הרכב':'הבא';};
    const goTo=i=>{tr.scrollTo({left:slides[i].offsetLeft-tr.offsetLeft+(getComputedStyle(tr).direction==='rtl'?0:0),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});show(i);};
    let t;tr.addEventListener('scroll',()=>{clearTimeout(t);t=setTimeout(()=>{const c=tr.getBoundingClientRect();let best=0,bd=1e9;slides.forEach((x,k)=>{const r=x.getBoundingClientRect();const d=Math.abs(r.left-c.left);if(d<bd){bd=d;best=k;}});if(best!==cur)show(best);},60);},{passive:true});
    dotsB.forEach(d=>d.onclick=()=>goTo(+d.dataset.i));
    nx.onclick=()=>cur<slides.length-1?goTo(cur+1):onboarding(2,st);
    el.querySelector('#onbSkipI').onclick=()=>onboarding(2,st);
    el.querySelector('#onbLater').onclick=()=>close(true);
    el.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'&&cur<slides.length-1)goTo(cur+1);if(e.key==='ArrowRight'&&cur>0)goTo(cur-1);});
    return;
  }
  if(step===2){
    el.innerHTML=`<div class="onb-in">${dots}
      <h1>${st.carId==='car2'?'הרכב השני':st.carId?'רכב נוסף':'הרכב שלך'}</h1><p class="lead">${sample?'הכי מהיר: מצלמים את רישיון הרכב והסוכן ממלא הכל. אפשר גם למלא ידנית.':'רק השדות המסומנים חובה. את השאר אפשר להשלים אחר כך.'}</p>
      ${sample?`<div class="scanlic"><button type="button" class="btn ${st.lic?'ghost':'primary'} block" id="oScan">${I('cam')}${st.lic?'רישיון הרכב נקרא ✓ לצלם שוב':'צילום רישיון הרכב'}</button><input type="file" id="oScanF" accept="image/*,application/pdf" hidden><div class="small muted" id="oScanS" role="status" style="text-align:center;min-height:1.3em;margin-top:6px"></div></div>`:''}
      <form id="onbCar" class="fgrid" novalidate>
        <div class="field"><label for="oMk">יצרן *</label><input type="text" id="oMk" value="${esc(st.make||'')}" placeholder="טויוטה, קיה, שברולט…" autocomplete="off"></div>
        <div class="field"><label for="oMd">דגם *</label><input type="text" id="oMd" value="${esc(st.model||'')}" placeholder="קורולה, פיקנטו…" autocomplete="off"></div>
        <div class="field"><label for="oY">שנת ייצור</label><input type="number" id="oY" inputmode="numeric" value="${esc(st.year||'')}"></div>
        <div class="field"><label for="oF">סוג דלק</label><select id="oF">${['95','98','סולר','היברידי','פלאג־אין','חשמלי'].map(x=>`<option ${st.fuelType===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="field"><label for="oP">מספר רישוי</label><input type="text" id="oP" dir="ltr" value="${esc(st.plate||'')}" placeholder="12-345-67"></div>
        <div class="field"><label for="oO">קילומטראז׳ נוכחי *</label><input type="number" id="oO" inputmode="numeric" value="${esc(st.odometer||'')}"></div>
        <div class="err full" id="onbErr" role="alert" style="color:var(--crit);font-size:14px;min-height:1.2em"></div>
        <div class="onb-acts full"><button class="btn primary block" type="submit">המשך</button><button class="onb-skip" type="button" id="onbBack">חזרה</button></div>
      </form></div>`;
    el.querySelector('#onbBack').onclick=()=>st.carId?close(false):onboarding(1,st);
    const sb=el.querySelector('#oScan'),sf=el.querySelector('#oScanF'),ss=el.querySelector('#oScanS');
    if(sb){sb.onclick=()=>sf.click();
      sf.onchange=async()=>{const f=sf.files[0];if(!f)return;busy(sb,true,'הסוכן קורא את הרישיון…');ss.textContent='';
        try{const raw=await sample.json(licensePrompt(),{images:[f],modelTier:'default',maxTokens:800,purpose:'scan'});
          if(!raw||raw.isLicense===false){ss.textContent='זה לא נראה כמו רישיון רכב. אפשר לנסות שוב או למלא ידנית.';busy(sb,false);return;}
          const d=/^\d{4}-\d\d-\d\d$/;const fuel=String(raw.fuel||'');
          st.lic={plate:raw.plate||'',make:raw.make||'',model:raw.model||'',year:n(raw.year),validUntil:d.test(raw.validUntil||'')?raw.validUntil:'',ownership:raw.ownership||'',color:raw.color||''};st.licFile=f;
          const set=(id,v)=>{const x=el.querySelector('#'+id);if(x&&v)x.value=v;};
          set('oMk',st.lic.make);set('oMd',st.lic.model);set('oY',st.lic.year);set('oP',st.lic.plate);
          const fsel=el.querySelector('#oF');const fm=/דיזל|סולר/.test(fuel)?'סולר':/פלאג|plug/i.test(fuel)?'פלאג־אין':/היבריד|hybrid/i.test(fuel)?'היברידי':/חשמל|electric/i.test(fuel)?'חשמלי':/בנזין|petrol|gas/i.test(fuel)?'95':'';if(fsel&&fm)fsel.value=fm;
          busy(sb,false);sb.className='btn ghost block';sb.innerHTML=`${I('check')}רישיון הרכב נקרא. לצלם שוב`;
          ss.textContent='מילאנו את הפרטים. נשאר רק להוסיף את הקילומטראז׳ הנוכחי.';const o=el.querySelector('#oO');if(o)o.focus();
        }catch(e){busy(sb,false);ss.textContent=aiErr(e,'הסוכן לא הצליח לקרוא. אפשר לנסות צילום ברור יותר או למלא ידנית.');}};}
    el.querySelector('#onbCar').onsubmit=e=>{e.preventDefault();const g=id=>el.querySelector('#'+id).value.trim();
      Object.assign(st,{make:g('oMk'),model:g('oMd'),year:n(g('oY')),fuelType:g('oF'),plate:g('oP'),odometer:n(g('oO'))});
      if(!st.make||!st.model||!st.odometer){el.querySelector('#onbErr').textContent='צריך יצרן, דגם וקילומטראז׳';return;}
      onboarding(3,st);};
    return;
  }
  if(step===3){
    const aiOk=!!sample;
    el.innerHTML=`<div class="onb-in">${dots}
      <h1>תזכורות</h1><p class="lead">איך לבנות את לוח הטיפולים של ה־${esc(st.model)}?</p>
      <label class="onb-choice"><input type="radio" name="plan" value="ai" ${aiOk?'checked':'disabled'}><div><b>תוכנית מותאמת לדגם</b><span>הסוכן בונה לוח טיפולים לפי היצרן, הדגם והקילומטראז׳. אתה בוחר מה להוסיף.</span></div></label>
      <label class="onb-choice"><input type="radio" name="plan" value="basic" ${aiOk?'':'checked'}><div><b>תזכורות בסיסיות</b><span>טיפול שנתי, טסט, ובדיקות של שמן, מים, אוויר ונוזל שמשות.</span></div></label>
      <div class="fgrid">
        <div class="field"><label for="oLs">הטיפול האחרון היה ב־</label><input type="date" id="oLs" max="${today()}"></div>
        <div class="field"><label for="oT">הטסט הבא בתאריך${st.lic&&st.lic.validUntil?' (מהרישיון)':''}</label><input type="date" id="oT" min="${today()}" value="${esc(st.lic&&st.lic.validUntil||'')}"></div>
      </div>
      <div class="onb-acts"><button class="btn primary block" id="onbDone">${I('check')}סיום</button><button class="onb-skip" id="onbBack">חזרה</button></div></div>`;
    el.querySelector('#onbBack').onclick=()=>onboarding(2,st);
    el.querySelector('#onbDone').onclick=async e=>{const btn=e.currentTarget;busy(btn,true,'שומר…');
      try{
        const mode=(el.querySelector('input[name=plan]:checked')||{}).value||'basic';
        const lastSvc=el.querySelector('#oLs').value||today(),testDue=el.querySelector('#oT').value;
        const cid=st.carId||'car';CAR=cid;try{localStorage.setItem('cj-car',cid);}catch(e){}chatLog.length=0;
        await setRec('garage',cid,{createdAt:Date.now(),make:st.make,model:st.model,year:st.year,fuelType:st.fuelType,plate:st.plate,odometer:st.odometer,odoUpdatedAt:today(),nickname:'',tankL:null,psiFront:null,psiRear:null,example:false});
        const base=[
          {title:'בדיקת מפלס שמן',kind:'check',intervalKm:null,intervalDays:14,lastKm:st.odometer,lastDate:today()},
          {title:'מים ונוזל קירור',kind:'check',intervalKm:null,intervalDays:14,lastKm:st.odometer,lastDate:today()},
          {title:'לחץ אוויר בצמיגים',kind:'check',intervalKm:null,intervalDays:14,lastKm:st.odometer,lastDate:today()},
          {title:'נוזל שמשות ומגבים',kind:'check',intervalKm:null,intervalDays:30,lastKm:st.odometer,lastDate:today()}];
        if(testDue)base.push({title:'טסט שנתי',kind:'doc',intervalKm:null,intervalDays:365,lastKm:st.odometer,lastDate:addDays(testDue,-365)});
        if(mode==='basic')base.push({title:'טיפול תקופתי (שמן ומסנן)',kind:'service',intervalKm:15000,intervalDays:365,lastKm:st.odometer,lastDate:lastSvc});
        for(const x of base)await addRec('reminder',Object.assign({note:'',history:[]},x));
        if(st.licFile&&assets){try{const a=await assets.upload(st.licFile);const old=RAW.paper.filter(p=>p.type==='license'&&(p.carId||'car')===cid);for(const o of old)await delRec('paper',o.id);
          const pl=Object.assign({type:'license',files:[{id:a.id,type:st.licFile.type||'',name:(st.licFile.name||'').slice(0,120)}],readAt:Date.now(),createdAt:Date.now()},st.lic);
          const ref=await addRec('paper',pl);if(st.lic.validUntil)await syncDocReminder(Object.assign({id:ref.id},pl));}catch(e){console.warn(e);}}
        close(false);toast(st.carId==='car2'&&PLAN!=='business'?'הרכב השני נוסף':st.carId?'הרכב נוסף':'הרכב נוסף. ברוך הבא!');go('home');
        if(mode==='ai')setTimeout(()=>runPlan(null),400);
      }catch(err){console.error(err);busy(btn,false);toast('השמירה נכשלה. בדוק את החיבור ונסה שוב');}};
  }
}

function scanSheet(){
  if(!sample||!imgOK){toast('סריקת קבלות לא זמינה בתצוגה הזו');return;}
  openModal('סריקת קבלה',`<p class="small muted" style="margin-top:0">צלם או בחר תמונה של הקבלה. הסוכן יזהה את הפרטים ויפתח טופס ממולא לאישור.</p>
  <div class="drop" id="scBox"><input type="file" id="sc" accept="image/*" capture="environment"><span id="scTxt">${I('cam')} בחר תמונה של קבלה</span></div>
  <div class="formacts"><button class="btn primary" id="scGo" disabled>${I('spark')}זיהוי הקבלה</button><button class="btn ghost" data-act="close">ביטול</button></div>`,root=>{
    const inp=root.querySelector('#sc'),go2=root.querySelector('#scGo');let file=null;
    inp.onchange=()=>{file=inp.files[0];if(!file)return;root.querySelector('#scBox').classList.add('has');root.querySelector('#scTxt').innerHTML=`<img class="preview" alt="" src="${URL.createObjectURL(file)}">${esc(file.name)}`;go2.disabled=false;};
    go2.onclick=async()=>{busy(go2,true,'הסוכן קורא…');
      try{
        const r=await sample.json(`זו תמונה של קבלה או חשבונית הקשורה לרכב פרטי בישראל. חלץ את הפרטים והחזר JSON בלבד:
{"type":"fuel"|"service"|"expense","date":"YYYY-MM-DD"|null,"total":number|null,"liters":number|null,"pricePerL":number|null,"station":string|null,"odo":number|null,"title":string|null,"category":"insurance"|"test"|"tires"|"parking"|"wash"|"parts"|"other"|null,"vendor":string|null,"note":string|null}
fuel = תדלוק בתחנת דלק. service = עבודת מוסך/טיפול/תיקון (title = תיאור קצר בעברית של מה שבוצע, note = פירוט הפריטים). expense = כל השאר. total הוא הסכום הסופי ששולם בשקלים כולל מע״מ; בחשבונית של Yellow זה הסכום הגדול בראש הקבלה או "סכום לתשלום לאחר הנחות", ולא "סכום ללא מע״מ" או "צבירה". מספרים כמספרי JSON בלי ₪ ובלי פסיקים. היום ${today()}.`,{images:[file],modelTier:'default'});
        closeModal();
        const pre={date:/^\d{4}-\d\d-\d\d$/.test(r?.date||'')?r.date:today()};
        if(r?.type==='fuel'){const x=normFuel(r)||{};Object.assign(pre,{total:x.total,liters:x.liters,pricePerL:x.pricePerL,station:x.station||r.vendor||'',odo:n(r.odo)||'',full:true});fuelForm(null,pre,file);}
        else if(r?.type==='service'){Object.assign(pre,{title:r.title||'טיפול',cost:n(r.total),garage:r.vendor||'',note:r.note||'',odo:n(r.odo)||odo()});serviceForm(null,pre,file);}
        else{Object.assign(pre,{title:r?.title||r?.vendor||'',amount:n(r?.total),category:r?.category||'other',vendor:r?.vendor||'',note:r?.note||''});expenseForm(null,pre,file);}
        toast('הסוכן מילא את הטופס, בדוק ואשר');
      }catch(e){busy(go2,false);toast(aiErr(e));}};
  });
}

/* chat */
const chatLog=[];let chatBusy=false;
function captureChat(){const i=$('#chatIn');return {val:i?i.value:'',focus:document.activeElement===i};}
function restoreChat(k){const m=$('#msgs');if(!m)return;for(const x of chatLog)appendMsg(x.role,x.html,true);const i=$('#chatIn');if(i){i.value=k.val;if(k.focus)i.focus();}m.scrollTop=m.scrollHeight;$('#sugg').hidden=chatLog.length>0;}
function appendMsg(role,html,noLog){const m=$('#msgs');if(!m)return null;const d=document.createElement('div');d.className='msg '+(role==='user'?'u':role==='note'?'note':'a');d.innerHTML=html;m.appendChild(d);m.scrollTop=m.scrollHeight;return d;}
const CHAT_SYS=`אתה "יועץ הרכב" בתוך אפליקציית יומן רכב. התפקיד היחיד שלך: לענות על הרכב של המשתמש ועל הנתונים שבאפליקציה (תדלוקים, צריכה, טיפולים, הוצאות, תזכורות, ביטוח ומסמכים, דוחות ונקודות), ועל שאלות כלליות על רכב ונהיגה (תחזוקה, נורות בלוח, צמיגים, דלק, טסט, ביטוח רכב).
כל שאלה אחרת, שלא קשורה לרכב: ענה רק במשפט "אני עונה רק על הרכב שלך ועל דברים שקשורים לרכב 🙂" בלי להפעיל כלים ובלי שום תוכן נוסף.
כללים: עברית בלבד. קצר: עד 80 מילים, אלא אם ביקשו פירוט. מספרים מדויקים מהכלים בלבד, בלי להמציא. הפעל רק את הכלי שצריך לשאלה. מותר לסמן תזכורת כבוצעה או להוסיף תזכורת רק כשהמשתמש מבקש במפורש. מטבע ₪; יחידות ק״מ, ליטר, ק״מ לליטר.`;
const chatTools=[
 {name:'get_overview',description:'Car profile, odometer, km per day, fuel economy series, monthly spend, and every reminder with its status and expected date.',inputSchema:{type:'object',properties:{}},execute:()=>snapshotData()},
 {name:'get_records',description:'List logged records of one type, newest first. fuel=fill-ups, service=garage work, expense=other costs.',inputSchema:{type:'object',properties:{type:{type:'string',enum:['fuel','service','expense']},limit:{type:'number'}},required:['type']},
  execute:({type,limit})=>[...(S[type]||[])].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,Math.min(+limit||30,100)).map(r=>{const o=Object.assign({},r);delete o.receipt;delete o.history;return o;})},
 {name:'get_insurance',description:'The car insurance policies and the vehicle license read from the documents the user uploaded: insurer, type, dates, who may drive, deductibles, every coverage in plain Hebrew, what is not covered, and phone numbers. Use it for any question about insurance, coverage, claims or the annual test.',inputSchema:{type:'object',properties:{}},
  execute:()=>S.paper.map(p=>{const o=Object.assign({},p);delete o.files;return o;})},
 {name:'get_tickets_and_license',description:'Traffic tickets (date, points, amount, payment due date, status), the current valid points total and reset date, and the driver license expiry and new-driver refresher status.',inputSchema:{type:'object',properties:{}},
  execute:()=>({points:(({total,years,last,reset})=>({total,years,last,reset}))(pointsState()),tickets:S.ticket.map(t=>{const o=Object.assign({},t);delete o.files;delete o.ticketNo;o.payBy=tkDue(t);return o;}),driver:(({exp,newEnd,refresherDue})=>({licenseExpiry:exp,newDriverEnds:newEnd,refresherDue}))(driverInfo())})},
 {name:'mark_reminder_done',description:'Mark a reminder as done today at the current odometer. Use only when the user says they did it.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id']},
  execute:async({id})=>{const ok=await markDone(id,odo(),today(),true);if(!ok)throw new Error('unknown reminder id');appendMsg('note','✓ התזכורת עודכנה');return {ok:true};}},
 {name:'add_reminder',description:'Create a new reminder counted from today and the current odometer.',inputSchema:{type:'object',properties:{title:{type:'string'},kind:{type:'string',enum:['service','check','doc']},intervalKm:{type:['number','null']},intervalDays:{type:['number','null']}},required:['title','kind']},
  execute:async(a)=>{if(!a.intervalKm&&!a.intervalDays)throw new Error('need intervalKm or intervalDays');await addRec('reminder',{title:a.title,kind:a.kind,intervalKm:n(a.intervalKm),intervalDays:n(a.intervalDays),lastKm:odo(),lastDate:today()});appendMsg('note','✓ נוספה תזכורת: '+esc(a.title));return {ok:true};}}
];
async function sendChat(q){
  q=(q||'').trim();if(!q||chatBusy)return;
  if(!sample){toast('היועץ זמין כשהדף פתוח ב־Claude');return;}
  chatBusy=true;$('#sugg')&&($('#sugg').hidden=true);
  chatLog.push({role:'user',content:q,html:esc(q)});appendMsg('user',esc(q));
  const bubble=appendMsg('assistant','<span class="spin"></span>');
  // only the last few turns are sent: shorter context = cheaper questions
  let input=chatLog.filter(m=>m.role==='user'||m.role==='assistant').slice(-6).map(m=>({role:m.role,content:m.content}));
  while(input.length&&input[0].role!=='user')input.shift();
  try{
    const res=await sample(input,{cache:false,tools:chatTools,system:CHAT_SYS,maxTokens:700,onText:({text})=>{if(bubble&&text&&text!=='Thinking...')bubble.innerHTML=mdLite(text);}});
    const html=mdLite(res.text||'');if(bubble)bubble.innerHTML=html;
    chatLog.push({role:'assistant',content:res.text||'',html});
  }catch(e){const t=e?.code==='missing_api_key'?'היועץ עוד לא מחובר: חסר מפתח API בשרת.':e?.code==='rate_limited'?'הגעת למגבלת השימוש, נסה שוב בעוד כמה דקות.':e?.code==='not_granted'?'היועץ לא קיבל הרשאה לפנות ל־Claude.':e?.code==='quota_exceeded'?aiErr(e,''):'משהו השתבש. נסה לשאול שוב.';if(bubble)bubble.innerHTML=t;chatLog.pop();}
  finally{chatBusy=false;}
}

/* ===== 075-fleet.js ===== */
/* ---------- business accounts: fleet dashboard, Excel import and export ---------- */
let FLEET_VIEW=true;try{FLEET_VIEW=localStorage.getItem('cj-fleet')!=='0';}catch(e){}
let fleetSort='urgent',fleetAll=false;
const isBiz=()=>PLAN==='business'&&S.cars.length>0&&!(S.car&&S.car.example);
function setFleetView(on){FLEET_VIEW=on;try{localStorage.setItem('cj-fleet',on?'1':'0');}catch(e){}}
// run fn while the app is looking at one car, then switch back
function withCar(id,fn){const keep=CAR;CAR=id;applyCar();try{return fn();}finally{CAR=keep;applyCar();}}
const isTest=r=>r.docKey==='test'||/טסט/.test(r.title||'');
const isIns=r=>String(r.docKey||'').startsWith('ins')||/ביטוח/.test(r.title||'');
function carStats(c){
  return withCar(c.id,()=>{
    const rem=sortedReminders(r=>r.carId!=='*'&&r.kind!=='check');
    const sp=allSpend(),m=monthKey(today()),y=today().slice(0,4);
    const sum=f=>sp.filter(f).reduce((s,r)=>s+r.amount,0);
    const eff=effStats();
    return {c,odo:odo(),rem,att:rem.filter(x=>x.st.status!=='ok'),
      test:rem.find(x=>isTest(x.r)),ins:rem.find(x=>isIns(x.r)),svc:rem.find(x=>x.r.kind==='service'),
      month:sum(r=>monthKey(r.date)===m),year:sum(r=>r.date.slice(0,4)===y),fuelMonth:sum(r=>r.cat==='fuel'&&monthKey(r.date)===m),
      kmpl:eff?eff.avg:null};
  });
}
const urgScore=s=>s.att.length?Math.min(...s.att.map(x=>RANK[x.st.status]))*1000-s.att.length:2000;
function fleetStats(){return S.cars.map(carStats);}
function dueCell(x){
  if(!x)return '<span class="muted">—</span>';
  const d=x.st.dueDate;
  return `<span class="fl-due" data-s="${x.st.status}">${d?fmtD(d):'—'}</span>`;
}
function fleetToggle(){
  if(!isBiz())return '';
  return `<div class="seg-tabs agtabs" role="tablist" aria-label="תצוגה">
    <button type="button" role="tab" class="${FLEET_VIEW?'on':''}" aria-selected="${FLEET_VIEW}" data-act="flView" data-id="1">${I('grid')}כל הצי</button>
    <button type="button" role="tab" class="${FLEET_VIEW?'':'on'}" aria-selected="${!FLEET_VIEW}" data-act="flView" data-id="0">${I('car')}${esc(carName(S.car))}</button></div>`;
}
function vFleet(){
  const st=fleetStats(),t=today();
  const items=st.flatMap(s=>s.att.map(x=>({s,x}))).sort((a,b)=>RANK[a.x.st.status]-RANK[b.x.st.status]||b.x.st.pct-a.x.st.pct);
  const carsAtt=st.filter(s=>s.att.length).length;
  const mTotal=st.reduce((a,s)=>a+s.month,0),yTotal=st.reduce((a,s)=>a+s.year,0);
  const in30=st.flatMap(s=>[s.test,s.ins].filter(Boolean)).filter(x=>x.st.daysLeft!==null&&x.st.daysLeft<=30).length;
  const sorters={urgent:(a,b)=>urgScore(a)-urgScore(b),name:(a,b)=>carName(a.c).localeCompare(carName(b.c),'he'),
    odo:(a,b)=>b.odo-a.odo,test:(a,b)=>(a.test?.st.dueDate||'9')<(b.test?.st.dueDate||'9')?-1:1,
    ins:(a,b)=>(a.ins?.st.dueDate||'9')<(b.ins?.st.dueDate||'9')?-1:1,month:(a,b)=>b.month-a.month,year:(a,b)=>b.year-a.year};
  const rows=[...st].sort(sorters[fleetSort]||sorters.urgent);
  const shown=fleetAll?items:items.slice(0,6);
  const th=(k,l)=>`<th><button type="button" class="fl-sort ${fleetSort===k?'on':''}" data-act="flSort" data-id="${k}">${l}</button></th>`;
  const maxY=Math.max(1,...st.map(s=>s.year));
  const mName=pd(t.slice(0,7)+'-15').toLocaleDateString('he-IL',{month:'long'});
  return `${fleetToggle()}
  <section class="kpis fl-kpis">
    <div class="card kpi"><div class="eyebrow">רכבים בצי</div><div class="v">${st.length}<small>מתוך ${MAX_CARS}</small></div><div class="d">${km(st.reduce((a,s)=>a+s.odo,0))} ק״מ ביחד</div></div>
    <div class="card kpi" data-s="${carsAtt?'soon':'ok'}"><div class="eyebrow">דורשים טיפול</div><div class="v">${carsAtt}<small>רכבים</small></div><div class="d">${items.length?items.length+' פריטים פתוחים':'הכול תקין'}</div></div>
    <div class="card kpi"><div class="eyebrow">עלות הצי ב${esc(mName)}</div><div class="v">${ils(mTotal)}</div><div class="d">${ils(yTotal)} מתחילת השנה</div></div>
    <div class="card kpi" data-s="${in30?'soon':'ok'}"><div class="eyebrow">טסט וביטוח</div><div class="v">${in30}<small>ב־30 יום</small></div><div class="d">כולל מה שכבר פג</div></div>
  </section>
  <section class="card fl-att"><div class="card-head"><h2>דורש טיפול</h2>${items.length>6?`<button class="link" data-act="flMore">${fleetAll?'פחות':'כל '+items.length}</button>`:''}</div>
    <div class="rlist">${shown.map(({s,x})=>`<button type="button" class="fl-item" data-act="flCar" data-id="${esc(s.c.id)}" data-go="reminder" data-s="${x.st.status}">
      <span class="ricon">${I(iconFor(x.r.title,x.r.kind))}</span>
      <span class="fl-item-t"><b>${esc(carName(s.c))}</b><span>${esc(x.r.title)}${s.c.plate?` · <span class="fl-plate">${esc(s.c.plate)}</span>`:''}</span></span>
      <span class="pill ${x.st.status}">${esc(x.st.label)}</span></button>`).join('')||'<div class="empty"><b>הכול תקין</b>אין טיפולים, טסטים או ביטוחים שמגיעים בקרוב</div>'}</div></section>
  <section class="card"><div class="card-head"><h2>הצי</h2><div class="fl-acts">
      <label class="fl-sortsel"><span class="sr">מיון</span><select data-act="flSortSel" aria-label="מיון">${[['urgent','לפי דחיפות'],['name','לפי שם'],['odo','לפי ק״מ'],['test','לפי טסט'],['ins','לפי ביטוח'],['month','לפי עלות החודש'],['year','לפי עלות השנה']].map(([k,l])=>`<option value="${k}" ${fleetSort===k?'selected':''}>${l}</option>`).join('')}</select></label>
      <button class="btn sm" data-act="flExport">${I('download')}ייצוא לאקסל</button></div></div>
    <div class="tablewrap"><table class="ledger fl-table"><thead><tr>${th('name','רכב')}${th('odo','ק״מ')}${th('test','טסט')}${th('ins','ביטוח')}<th>טיפול הבא</th>${th('month','החודש')}${th('year','השנה')}</tr></thead><tbody>
    ${rows.map(s=>`<tr data-act="flCar" data-id="${esc(s.c.id)}" tabindex="0">
      <td class="wrap"><span class="fl-car"><b>${esc(carName(s.c))}</b><span>${s.c.plate?`<span class="fl-plate">${esc(s.c.plate)}</span>`:''}${s.c.plate&&s.c.driver?' · ':''}${esc(s.c.driver||'')}</span></span>${s.att.length?`<span class="pill ${s.att[0].st.status}">${s.att.length}</span>`:''}</td>
      <td class="n" data-label="ק״מ">${km(s.odo)}</td>
      <td data-label="טסט">${dueCell(s.test)}</td>
      <td data-label="ביטוח">${dueCell(s.ins)}</td>
      <td data-label="טיפול הבא">${s.svc?`<span class="fl-due" data-s="${s.svc.st.status}">${esc(s.svc.st.label)}</span>`:'<span class="muted">—</span>'}</td>
      <td class="n" data-label="החודש">${ils(s.month)}</td>
      <td class="n" data-label="השנה">${ils(s.year)}</td></tr>`).join('')}
    </tbody></table></div></section>
  <section class="card"><div class="card-head"><h2>עלות מתחילת השנה לפי רכב</h2><span class="small muted">${ils(yTotal)} ביחד</span></div>
    <div class="fl-bars">${[...st].sort((a,b)=>b.year-a.year).slice(0,10).map(s=>`<button type="button" class="fl-bar" data-act="flCar" data-id="${esc(s.c.id)}" data-go="expense"><span class="fl-bar-l">${esc(carName(s.c))}</span><span class="fl-bar-t"><i style="width:${Math.max(2,Math.round(s.year/maxY*100))}%"></i></span><span class="fl-bar-v">${ils(s.year)}</span></button>`).join('')}</div>
    ${st.length>1&&yTotal>0?`<p class="small muted" style="margin:12px 0 0">ממוצע לרכב: ${ils(yTotal/st.length)} מתחילת השנה.</p>`:''}</section>
  <section class="fl-foot">
    ${S.cars.length<MAX_CARS?`<button class="btn" data-act="flAdd">${I('plus')}הוספת רכב בצילום רישיון</button><button class="btn" data-act="flImport">${I('upload')}ייבוא רכבים מאקסל</button>`:`<p class="small muted">הצי מלא: ${S.cars.length} מתוך ${MAX_CARS} רכבים. כדי להוסיף עוד, פנה אלינו דרך המשוב.</p>`}
  </section>`;
}
function openFleetCar(id,goTo){
  setFleetView(false);
  if(id!==CAR){CAR=id;try{localStorage.setItem('cj-car',id);}catch(e){}chatLog.length=0;applyCar();toast('עברת ל'+carName(S.car));}
  if(goTo&&goTo!==view)go(goTo);else render();
}
function newCarId(taken){let i=2,id='car';const has=x=>S.cars.some(c=>c.id===x)||(taken&&taken.has(x));if(!has(id))return id;while(has('car'+i))i++;return 'car'+i;}

/* ----- download helper ----- */
function saveBlob(blob,name){
  try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},4000);return true;}catch(e){return false;}
}
const libP={};
function loadLib(src,global){
  if(window[global])return Promise.resolve(window[global]);
  return libP[src]||(libP[src]=new Promise((res,rej)=>{const sc=document.createElement('script');sc.src=src;sc.onload=()=>window[global]?res(window[global]):rej(new Error('lib'));sc.onerror=()=>{delete libP[src];rej(new Error('lib'));};document.head.appendChild(sc);}));
}
const xlsxWriter=()=>loadLib('vendor/write-excel-file.min.js','writeXlsxFile');
const xlsxReader=()=>loadLib('vendor/read-excel-file.min.js','readXlsxFile');
async function writeXlsx(sheets,name){
  const w=await xlsxWriter();
  const r=w(sheets.map(s=>Object.assign({rightToLeft:true,stickyRowsCount:1},s)));
  const blob=r&&r.toBlob?await r.toBlob():r;
  return saveBlob(blob,name);
}
const H=v=>({value:v,fontWeight:'bold',backgroundColor:'#EFE6D6'});
const dateOrNull=s=>s&&/^\d{4}-\d\d-\d\d$/.test(s)?pd(s):null;
async function fleetExport(btn){
  busy(btn,true,'מכין קובץ…');
  try{
    const st=fleetStats();const y=today().slice(0,4);
    const fleet=[['רכב','מספר רישוי','יצרן','דגם','שנה','נהג','ק״מ','טסט','ביטוח','טיפול הבא','דורש טיפול','עלות החודש','מתחילת השנה','דלק החודש','ק״מ לליטר'].map(H),
      ...st.map(s=>[carName(s.c),s.c.plate||'',s.c.make||'',s.c.model||'',n(s.c.year),s.c.driver||'',Math.round(s.odo)||null,
        dateOrNull(s.test&&s.test.st.dueDate),dateOrNull(s.ins&&s.ins.st.dueDate),s.svc?s.svc.st.label:'',s.att.map(x=>x.r.title+' ('+x.st.label+')').join(', '),
        Math.round(s.month),Math.round(s.year),Math.round(s.fuelMonth),s.kmpl?Math.round(s.kmpl*10)/10:null].map(v=>v instanceof Date?{value:v,type:Date,format:'dd/mm/yyyy'}:v))];
    const exp=[['תאריך','רכב','מספר רישוי','קטגוריה','פירוט','סכום'].map(H)];
    for(const s of st)withCar(s.c.id,()=>{for(const r of allSpend())if(r.date.slice(0,4)===y)exp.push([{value:pd(r.date),type:Date,format:'dd/mm/yyyy'},carName(s.c),s.c.plate||'',CATS[r.cat]||r.cat,r.title||'',Math.round(r.amount*100)/100]);});
    const w=c=>c.map(x=>({width:x}));
    const ok=await writeXlsx([{sheet:'הצי',data:fleet,columns:w([18,13,12,12,7,14,10,12,12,16,34,12,13,12,10])},{sheet:'הוצאות '+y,data:exp,columns:w([12,18,13,16,30,11])}],'fleet-'+today()+'.xlsx');
    toast(ok?'הקובץ ירד לטלפון':'ההורדה לא הצליחה');
  }catch(e){console.error(e);toast('לא הצלחתי ליצור את הקובץ');}
  busy(btn,false);
}

/* ----- import ----- */
const IMP_FIELDS=[
  ['plate','מספר רישוי',/מ(ס|ספר)['׳"]?\s*(רישוי|רכב|לוחית)|לוחית|^רישוי$|plate|reg(istration)?\s*(no|number)?$/i],
  ['make','יצרן',/יצרן|תוצרת|^מותג|^(סוג\s*)?רכב$|make|brand|manufacturer|^vehicle$/i],
  ['model','דגם',/דגם|model/i],
  ['year','שנה',/שנ(ת|ה)\s*(ייצור|יצור|עלייה)?|שנתון|^year/i],
  ['fuel','דלק',/דלק|הנעה|סוג\s*מנוע|fuel/i],
  ['odo','קילומטראז׳',/ק["״']?מ|קילומטר|מד\s*אוץ|odometer|mileage|^km/i],
  ['ins','ביטוח עד',/ביטוח|insurance/i],
  ['test','טסט עד',/טסט|תוקף\s*(רישיון|רשיון|רישוי)?|רישיון\s*רכב\s*עד|test|mot|expir/i],
  ['svc','טיפול אחרון',/טיפול|service/i],
  ['driver','נהג',/נהג|אחראי|משתמש|עובד|driver|assigned/i],
  ['nick','כינוי',/כינוי|nickname|שם\s*רכב/i],
];
function guessMap(head){
  const map={};const used=new Set();
  // most specific fields first: a "רישוי עד" column is the test, not the plate
  for(const k of ['ins','test','svc','odo','plate','make','model','year','fuel','driver','nick']){
    const re=IMP_FIELDS.find(f=>f[0]===k)[2];
    const i=head.findIndex((h,j)=>!used.has(j)&&re.test(String(h||'').trim()));
    if(i>=0){map[k]=i;used.add(i);}
  }
  return map;
}
function findHeader(rows){
  let best={row:0,score:-1,map:{}};
  for(let r=0;r<Math.min(rows.length,12);r++){const m=guessMap(rows[r]||[]);const sc=Object.keys(m).length;if(sc>best.score)best={row:r,score:sc,map:m};}
  return best;
}
function parseCSV(text){
  text=text.replace(/^﻿/,'');
  const first=text.split(/\r?\n/)[0]||'';
  const d=[',',';','\t'].sort((a,b)=>first.split(b).length-first.split(a).length)[0];
  const rows=[];let row=[],cell='',q=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else q=false;}else cell+=ch;continue;}
    if(ch==='"')q=true;else if(ch===d){row.push(cell);cell='';}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=ch;}
  if(cell||row.length){row.push(cell);rows.push(row);}
  return rows.filter(r=>r.some(c=>String(c).trim()));
}
async function readTable(file){
  const name=(file.name||'').toLowerCase();
  if(/\.xls$/.test(name))throw new Error('xls');
  if(/\.(csv|txt|tsv)$/.test(name)||/text\//.test(file.type||'')){
    const buf=await file.arrayBuffer();let txt=new TextDecoder('utf-8').decode(buf);
    if(txt.includes('�'))try{txt=new TextDecoder('windows-1255').decode(buf);}catch(e){}
    return parseCSV(txt);
  }
  const read=await xlsxReader();const out=await read(file);
  const sheets=Array.isArray(out)&&out.length&&out[0]&&out[0].data?out.map(s=>s.data):[out];
  return sheets.sort((a,b)=>b.length-a.length)[0]||[];
}
function toDate(v){
  if(v==null||v==='')return '';
  if(v instanceof Date)return isNaN(v)?'':new Date(v.getTime()+12*36e5).toISOString().slice(0,10); // midnight UTC or local, either way the right day
  if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Date.UTC(1899,11,30)+v*864e5);return d.toISOString().slice(0,10);}
  const s=String(v).trim();let m;
  if((m=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)))return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  if((m=s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/))){let y=+m[3];if(y<100)y+=2000;return `${y}-${pad(+m[2])}-${pad(+m[1])}`;}
  if((m=s.match(/^(\d{1,2})[-/.](\d{4})$/)))return `${m[2]}-${pad(+m[1])}-01`;
  return '';
}
function normPlate(v){
  const d=String(v==null?'':v).replace(/\D/g,'');
  if(d.length===7)return `${d.slice(0,2)}-${d.slice(2,5)}-${d.slice(5)}`;
  if(d.length===8)return `${d.slice(0,3)}-${d.slice(3,5)}-${d.slice(5)}`;
  return String(v==null?'':v).trim();
}
const plateKey=v=>String(v||'').replace(/\D/g,'');
function normFuelType(v){const f=String(v||'');return /דיזל|סולר|diesel/i.test(f)?'סולר':/פלאג|plug/i.test(f)?'פלאג־אין':/היבריד|hybrid/i.test(f)?'היברידי':/חשמל|electric|ev\b/i.test(f)?'חשמלי':/98/.test(f)?'98':f?'95':'';}
function rowsToCars(rows,hdr,map){
  const taken=new Set(S.cars.map(c=>plateKey(c.plate)).filter(Boolean));const seen=new Set();
  const cell=(r,k)=>map[k]!=null&&map[k]>=0?r[map[k]]:'';
  return rows.slice(hdr+1).map((r,i)=>{
    let make=String(cell(r,'make')||'').trim(),model=String(cell(r,'model')||'').trim();
    if(make&&!model&&map.model==null&&make.includes(' ')){const p=make.split(/\s+/);make=p.shift();model=p.join(' ');}
    const c={line:hdr+i+2,plate:normPlate(cell(r,'plate')),make,model,year:n(cell(r,'year')),fuelType:normFuelType(cell(r,'fuel')),odometer:n(cell(r,'odo')),
      test:toDate(cell(r,'test')),ins:toDate(cell(r,'ins')),svc:toDate(cell(r,'svc')),driver:String(cell(r,'driver')||'').trim(),nickname:String(cell(r,'nick')||'').trim()};
    if(c.year&&(c.year<1950||c.year>2100))c.year=null;
    const k=plateKey(c.plate);
    c.status=!c.make&&!c.plate?'skip':k&&taken.has(k)?'exists':k&&seen.has(k)?'dup':'new';
    if(k)seen.add(k);return c;
  }).filter(c=>c.status!=='skip'||c.make||c.model);
}
async function aiMap(rows){
  if(!sample)return null;
  const head=rows.slice(0,8).map(r=>r.map(v=>v instanceof Date?dstr(v):String(v==null?'':v).slice(0,40)));
  const r=await sample.json(`אלה השורות הראשונות של טבלה עם רשימת רכבים של עסק בישראל (JSON, כל שורה מערך של תאים):
${JSON.stringify(head)}
מצא איזו שורה היא שורת הכותרות, ואיזו עמודה (אינדקס מ־0) מתאימה לכל שדה. החזר JSON בלבד:
{"headerRow":number,"columns":{"plate":number|null,"make":number|null,"model":number|null,"year":number|null,"fuel":number|null,"odo":number|null,"test":number|null,"ins":number|null,"svc":number|null,"driver":number|null,"nick":number|null}}
plate = מספר רישוי. test = תאריך תוקף רישיון הרכב / טסט. ins = תאריך סיום ביטוח. svc = תאריך הטיפול האחרון. odo = קילומטראז׳. driver = שם הנהג. אם אין שורת כותרות, headerRow = -1.`,{maxTokens:400});
  if(!r||!r.columns)return null;
  const map={};for(const [k,v] of Object.entries(r.columns))if(typeof v==='number'&&v>=0)map[k]=v;
  return {row:typeof r.headerRow==='number'?r.headerRow:0,map};
}
function importSheet(){
  if(S.cars.length>=MAX_CARS){toast(`החשבון כולל עד ${MAX_CARS} רכבים`);return;}
  openModal('ייבוא רכבים מאקסל',`<div class="stack" style="gap:14px">
    <p class="small muted" style="margin:0">מעלים קובץ Excel או CSV עם רשימת הרכבים, שורה לכל רכב. היומן מזהה לבד את העמודות: מספר רישוי, יצרן, דגם, שנה, דלק, קילומטראז׳, טסט, ביטוח, טיפול אחרון ונהג.</p>
    <div class="drop" id="imBox"><input type="file" id="imF" accept=".xlsx,.csv,.tsv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"><span id="imTxt">${I('upload')} בחירת קובץ Excel או CSV</span></div>
    <button type="button" class="linkbtn" id="imTpl" style="align-self:flex-start">${I('download')}הורדת קובץ לדוגמה, למילוי</button>
    <div id="imOut" aria-live="polite"></div></div>`,root=>{
    const out=root.querySelector('#imOut');let rows=null,hdr=0,map={};
    root.querySelector('#imTpl').onclick=async()=>{try{await writeXlsx([{sheet:'רכבים',columns:[16,12,12,8,10,12,12,12,12,14].map(x=>({width:x})),data:[
      ['מספר רישוי','יצרן','דגם','שנה','דלק','ק״מ','טסט עד','ביטוח עד','טיפול אחרון','נהג'].map(H),
      ['12-345-67','טויוטה','קורולה',2022,'בנזין',45000,{value:pd(addDays(today(),120)),type:Date,format:'dd/mm/yyyy'},{value:pd(addDays(today(),200)),type:Date,format:'dd/mm/yyyy'},{value:pd(addDays(today(),-90)),type:Date,format:'dd/mm/yyyy'},'ישראל ישראלי']]}],'fleet-template.xlsx');toast('הקובץ ירד לטלפון');}catch(e){toast('ההורדה לא הצליחה');}};
    const draw=()=>{
      if(!root.contains(out))return;
      const cars=rowsToCars(rows,hdr,map);const fresh=cars.filter(c=>c.status==='new');
      const room=Math.max(0,MAX_CARS-S.cars.length);const take=fresh.slice(0,room);
      const head=hdr>=0?(rows[hdr]||[]):(rows[0]||[]).map(()=>'');
      const opts=k=>`<option value="-1">—</option>`+head.map((h,i)=>`<option value="${i}" ${map[k]===i?'selected':''}>${esc(String(h==null||h===''?'עמודה '+(i+1):h).slice(0,30))}</option>`).join('');
      const lab={new:'',exists:'כבר ביומן',dup:'כפול בקובץ',skip:'חסר יצרן'};
      out.innerHTML=`<div class="im-sum"><b>נמצאו ${cars.length} רכבים</b>${fresh.length>take.length?`<span class="pill soon">ייכנסו ${take.length}, החשבון כולל עד ${MAX_CARS}</span>`:''}${cars.length>fresh.length?`<span class="pill neutral">${cars.length-fresh.length} יידלגו</span>`:''}</div>
        <details class="im-map" ${!map.make&&map.make!==0||map.plate==null?'open':''}><summary>התאמת עמודות</summary><div class="fgrid">${IMP_FIELDS.map(([k,l])=>`<div class="field"><label for="imM-${k}">${l}</label><select id="imM-${k}" data-k="${k}">${opts(k)}</select></div>`).join('')}</div></details>
        <div class="im-list">${cars.slice(0,40).map(c=>`<div class="im-row" data-s="${c.status}"><span class="im-car"><b>${esc([c.make,c.model].filter(Boolean).join(' ')||'ללא יצרן')}</b><span>${esc([c.plate,c.year,c.odometer?km(c.odometer)+' ק״מ':'',c.driver].filter(Boolean).join(' · '))}</span></span><span class="im-tags">${c.test?`<span class="chip">טסט ${fmtD(c.test)}</span>`:''}${c.ins?`<span class="chip">ביטוח ${fmtD(c.ins)}</span>`:''}${lab[c.status]?`<span class="pill neutral">${lab[c.status]}</span>`:''}</span></div>`).join('')}${cars.length>40?`<p class="small muted">ועוד ${cars.length-40}…</p>`:''}</div>
        <label class="toggle"><input type="checkbox" id="imCk"> להוסיף לכל רכב גם בדיקות שוטפות (שמן, מים, אוויר)</label>
        <div class="formacts"><button class="btn primary" id="imGo" ${take.length?'':'disabled'}>${I('check')}הוספת ${take.length} רכבים</button><button class="btn ghost" data-act="close">ביטול</button></div>
        <div class="small muted" id="imSt"></div>`;
      out.querySelectorAll('select[data-k]').forEach(s=>s.onchange=()=>{const v=+s.value;for(const k in map)if(map[k]===v&&k!==s.dataset.k)delete map[k];if(v>=0)map[s.dataset.k]=v;else delete map[s.dataset.k];draw();});
      const goB=out.querySelector('#imGo');goB.onclick=()=>runImport(take,out.querySelector('#imCk').checked,goB,out.querySelector('#imSt'));
    };
    root.querySelector('#imF').onchange=async e=>{const f=e.target.files[0];if(!f)return;
      root.querySelector('#imBox').classList.add('has');root.querySelector('#imTxt').innerHTML=`${I('sheet')} ${esc(f.name)}`;
      out.innerHTML=`<p class="small muted"><span class="spin"></span> קורא את הקובץ…</p>`;
      try{rows=(await readTable(f)).map(r=>(r||[]).map(v=>v==null?'':v));
        if(!root.contains(out))return;
        if(rows.length<2){out.innerHTML='<p class="small" style="color:var(--crit)">לא מצאתי שורות בקובץ.</p>';return;}
        const g=findHeader(rows);hdr=g.row;map=g.map;
        if((map.make==null&&map.plate==null)||g.score<2){out.innerHTML=`<p class="small muted"><span class="spin"></span> הסוכן מזהה את העמודות…</p>`;
          try{const a=await aiMap(rows);if(a&&Object.keys(a.map).length){hdr=a.row<0?-1:a.row;map=a.map;}}catch(x){console.warn(x);}}
        draw();
      }catch(err){console.warn(err);if(!root.contains(out))return;out.innerHTML=`<p class="small" style="color:var(--crit)">${String(err&&err.message)==='xls'?'זה קובץ Excel ישן (xls). פתח אותו באקסל ושמור בשם כ־xlsx או CSV, ונסה שוב.':'לא הצלחתי לקרוא את הקובץ. אפשר לשמור אותו כ־xlsx או CSV ולנסות שוב.'}</p>`;}
    };
  });
}
async function runImport(list,withChecks,btn,stEl){
  busy(btn,true,'מוסיף…');const taken=new Set();let done=0,firstId=null;
  try{
    for(const c of list){
      const id=newCarId(taken);taken.add(id);if(!firstId)firstId=id;
      if(stEl)stEl.textContent=`מוסיף ${done+1} מתוך ${list.length}…`;
      const o=c.odometer||0;
      await setRec('garage',id,{createdAt:Date.now()+done,make:c.make||'',model:c.model||'',year:c.year||null,fuelType:c.fuelType||'',plate:c.plate||'',odometer:o,odoUpdatedAt:today(),nickname:c.nickname||'',driver:c.driver||'',tankL:null,psiFront:null,psiRear:null,example:false});
      const rem=[{title:'טיפול תקופתי (שמן ומסנן)',kind:'service',intervalKm:15000,intervalDays:365,lastKm:o,lastDate:c.svc||today()}];
      if(c.test)rem.push({title:'טסט שנתי',kind:'doc',intervalKm:null,intervalDays:365,lastKm:o,lastDate:addDays(c.test,-365),docKey:'test'});
      if(c.ins)rem.push({title:'חידוש ביטוח רכב',kind:'doc',intervalKm:null,intervalDays:365,lastKm:o,lastDate:addDays(c.ins,-365),docKey:'ins:import'});
      if(withChecks)for(const [t,d] of [['בדיקת מפלס שמן',14],['מים ונוזל קירור',14],['לחץ אוויר בצמיגים',14],['נוזל שמשות ומגבים',30]])rem.push({title:t,kind:'check',intervalKm:null,intervalDays:d,lastKm:o,lastDate:today()});
      for(const r of rem)await addRec('reminder',Object.assign({note:'',history:[],carId:id},r));
      done++;
    }
    closeModal();setFleetView(true);if(view!=='home')go('home');else render();toast(done===1?'רכב אחד נוסף לצי':`${done} רכבים נוספו לצי`);
  }catch(err){console.error(err);busy(btn,false);
    const lim=/car_limit/.test(String(err&&(err.message||err)));
    if(stEl)stEl.innerHTML=`<span style="color:var(--crit)">${lim?`הגעת למגבלת הרכבים בחשבון (${MAX_CARS}).`:'ההוספה נעצרה בגלל שגיאה.'} נוספו ${done} מתוך ${list.length}.</span>`;
    if(done)render();}
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act^="fl"]');if(!b)return;
  const a=b.dataset.act;
  if(a==='flView'){setFleetView(b.dataset.id==='1');render();}
  else if(a==='flCar')openFleetCar(b.dataset.id,b.dataset.go);
  else if(a==='flSort'){fleetSort=b.dataset.id;render();}
  else if(a==='flMore'){fleetAll=!fleetAll;render();}
  else if(a==='flExport')fleetExport(b);
  else if(a==='flImport')importSheet();
  else if(a==='flAdd'){onboarding(2,{carId:newCarId()});}
});
document.addEventListener('change',e=>{const s=e.target.closest('select[data-act="flSortSel"]');if(s){fleetSort=s.value;render();}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const t=e.target.closest&&e.target.closest('tr[data-act="flCar"]');if(t)openFleetCar(t.dataset.id);});

/* ===== 076-voice.js ===== */
/* ---------- voice entry: say it in one sentence, the agent fills the form ---------- */
const SpeechRec=window.SpeechRecognition||window.webkitSpeechRecognition||null;
const VOICE_EX=['תדלקתי 38 ליטר ב־270 שקל, הקילומטראז׳ 31,200','החלפתי צמיגים ב־1,600 שקל אצל צמיגי השרון','שילמתי חניה 24 שקל','טיפול 15 אלף במוסך, עלה 950 שקל'];
function voicePrompt(text){
  const cars=S.cars.length>1?`\nהרכבים בחשבון: ${JSON.stringify(S.cars.map(c=>({id:c.id,name:carName(c),plate:c.plate||'',driver:c.driver||''})))}. אם המשתמש הזכיר רכב מסוים (כינוי, יצרן, דגם, מספר או נהג), החזר את ה־id שלו ב־car.`:'';
  return `המשתמש אמר בעברית משפט אחד על הרכב שלו. זה תמלול של דיבור, אז ייתכנו שגיאות תמלול ומספרים שנכתבו במילים.
המשפט: """${String(text).slice(0,600)}"""
היום ${today()}. הקילומטראז׳ האחרון הידוע: ${km(odo())}.${cars}
החזר JSON בלבד:
{"type":"fuel"|"service"|"expense"|"odo"|"none","date":"YYYY-MM-DD"|null,"total":number|null,"liters":number|null,"pricePerL":number|null,"station":string|null,"odo":number|null,"full":boolean|null,"title":string|null,"category":"insurance"|"test"|"tires"|"parking"|"wash"|"parts"|"other"|null,"vendor":string|null,"note":string|null,"car":string|null}
fuel = תדלוק. service = טיפול, תיקון או עבודה במוסך (title = תיאור קצר בעברית). expense = כל הוצאה אחרת: ביטוח, טסט, צמיגים, חניה, כביש 6, שטיפה, חלפים. odo = רק עדכון קילומטראז׳. none = לא קשור לרכב או לא ברור.
"אתמול", "ביום ראשון" וכו׳ הופכים לתאריך. "15 אלף" בהקשר של טיפול או קילומטראז׳ = 15000. "מלא" או "פול" בתדלוק = full:true. מספרים כמספרי JSON, בלי ₪ ובלי פסיקים. אם לא נאמר תאריך, date = null.`;
}
const iosApp=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)&&(navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
const canRecord=()=>!!(window.MediaRecorder&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
function recMime(){for(const t of ['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'])try{if(MediaRecorder.isTypeSupported(t))return t;}catch(e){}return '';}
// joins speech results; iPhone Safari repeats earlier phrases inside later results, so drop a phrase the next one already contains
function joinResults(results){
  const parts=[];for(let i=0;i<results.length;i++)parts.push(String(results[i][0].transcript||'').trim());
  const out=[];for(let i=0;i<parts.length;i++){if(!parts[i])continue;if(i+1<parts.length&&parts[i+1].startsWith(parts[i]))continue;if(out.length&&parts[i].startsWith(out[out.length-1])){out[out.length-1]=parts[i];continue;}out.push(parts[i]);}
  return out.join(' ').replace(/\s+/g,' ').trim();
}
function voiceSheet(){
  if(!sample){toast('הסוכן לא זמין כרגע');return;}
  const IDLE='לוחצים על המיקרופון ואומרים במשפט אחד מה היה';
  openModal('רישום בקול',`<div class="vbox">
    <button type="button" class="vmic" id="vMic" aria-label="התחלת הקלטה">${I('mic')}</button>
    <div class="vstate" id="vSt" role="status">${IDLE}</div>
    <textarea id="vTxt" rows="2" placeholder="מה שתגיד יופיע כאן" aria-label="מה אמרת"></textarea>
    <div class="vex" id="vEx"><span class="small muted">למשל:</span>${VOICE_EX.map(x=>`<button type="button">״${esc(x)}״</button>`).join('')}</div>
    <div class="formacts" style="width:100%"><button class="btn primary" id="vGo" disabled>${I('spark')}מילוי הטופס</button><button class="btn ghost" data-act="close">ביטול</button></div></div>`,root=>{
    const mic=root.querySelector('#vMic'),st=root.querySelector('#vSt'),ta=root.querySelector('#vTxt'),goB=root.querySelector('#vGo');
    const alive=()=>root.contains(ta);
    const sync=()=>{goB.disabled=!ta.value.trim();};
    ta.oninput=sync;
    root.querySelectorAll('#vEx button').forEach(b=>b.onclick=()=>{ta.value=b.textContent.replace(/[״"]/g,'');sync();});
    const say=t=>{if(alive())st.textContent=t;};
    const onMic=on=>{mic.classList.toggle('on',on);mic.setAttribute('aria-label',on?'עצירת ההקלטה':'התחלת הקלטה');};
    const keyboard=msg=>{mic.hidden=true;say(msg||'כאן אפשר לדבר דרך המקלדת: לוחצים בתיבה, ואז על המיקרופון שבמקלדת.');ta.focus();};
    // which way to listen: the server (most reliable, also in the installed iPhone app), the browser, or the keyboard's own mic
    let mode=null;const modeP=(async()=>{
      const srv=canRecord()&&window.cjSTT?await window.cjSTT.ready().catch(()=>false):false;
      mode=srv?'server':SpeechRec&&!iosApp()?'browser':'keyboard';
      if(mode==='keyboard'&&alive())keyboard();
      return mode;})();
    let stopNow=null,busyRec=false;
    const cleanup=()=>{try{stopNow&&stopNow(true);}catch(e){}};

    async function recordServer(){
      let stream;
      try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});}
      catch(e){keyboard('אין הרשאה למיקרופון. אפשר לאשר בהגדרות הטלפון, או לדבר דרך המיקרופון שבמקלדת.');return;}
      const mime=recMime();const mr=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);const chunks=[];
      let ac=null,raf=0,started=Date.now(),lastVoice=0,spoke=false,cancelled=false;
      mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
      const finish=new Promise(r=>{mr.onstop=r;});
      stopNow=(cancel)=>{cancelled=!!cancel;stopNow=null;cancelAnimationFrame(raf);try{if(mr.state!=='inactive')mr.stop();}catch(e){}stream.getTracks().forEach(t=>t.stop());try{ac&&ac.close();}catch(e){}};
      // stop by itself after a short silence once you've spoken
      try{const AC=window.AudioContext||window.webkitAudioContext;ac=new AC();const src=ac.createMediaStreamSource(stream);const an=ac.createAnalyser();an.fftSize=1024;src.connect(an);const buf=new Uint8Array(an.fftSize);
        let floor=0.01;
        const tick=()=>{an.getByteTimeDomainData(buf);let sum=0;for(const v of buf){const x=(v-128)/128;sum+=x*x;}const rms=Math.sqrt(sum/buf.length);const now=Date.now();
          if(now-started<400)floor=Math.max(floor,rms*1.2);
          if(rms>Math.max(0.02,floor*2.2)){lastVoice=now;spoke=true;}
          if(spoke&&now-lastVoice>1500)return stopNow&&stopNow();
          if(!spoke&&now-started>8000)return stopNow&&stopNow();
          if(now-started>20000)return stopNow&&stopNow();
          raf=requestAnimationFrame(tick);};
        if(ac.state==='suspended')ac.resume().catch(()=>{});tick();}catch(e){setTimeout(()=>stopNow&&stopNow(),12000);}
      mr.start(250);onMic(true);say('מקשיב… כשתסיים, פשוט תשתוק או תלחץ שוב');
      await finish;onMic(false);
      if(cancelled||!alive())return;
      const blob=new Blob(chunks,{type:(mr.mimeType||mime||'audio/webm').split(';')[0]});
      const secs=(Date.now()-started)/1000;
      if(blob.size<1500||secs<0.6){say('לא שמעתי כלום. לוחצים ומנסים שוב, קרוב יותר לטלפון.');return;}
      say('מתמלל…');busy(goB,true,'מתמלל…');
      try{const text=await window.cjSTT.transcribe(blob,secs);if(!alive())return;busy(goB,false);
        if(!text){say('לא הצלחתי להבין את ההקלטה. אפשר לנסות שוב.');return;}
        ta.value=text;sync();say('הבנתי. ממלא את הטופס…');run();
      }catch(e){if(!alive())return;busy(goB,false);
        if(e&&e.code==='missing_key'){mode=SpeechRec&&!iosApp()?'browser':'keyboard';if(mode==='keyboard')keyboard();else say('נסה שוב.');}
        else say(aiErr(e,'התמלול נכשל. אפשר לנסות שוב, או לדבר דרך המיקרופון שבמקלדת.'));}
    }

    function recordBrowser(){
      let rec;try{rec=new SpeechRec();}catch(e){keyboard();return;}
      rec.lang='he-IL';rec.interimResults=true;rec.continuous=true;rec.maxAlternatives=1;
      const base=ta.value.trim();let heard='',silence=0,cancelled=false;
      const startT=setTimeout(()=>{if(!heard)try{rec.stop();}catch(e){}},8000);
      stopNow=(cancel)=>{cancelled=!!cancel;stopNow=null;clearTimeout(silence);clearTimeout(startT);try{rec.stop();}catch(e){}};
      rec.onstart=()=>{onMic(true);say('מקשיב… כשתסיים, פשוט תשתוק או תלחץ שוב');};
      rec.onresult=ev=>{heard=joinResults(ev.results);ta.value=(base?base+' ':'')+heard;sync();clearTimeout(silence);silence=setTimeout(()=>{try{rec.stop();}catch(e){}},1600);};
      rec.onerror=ev=>{const c=ev&&ev.error;if(c==='not-allowed'||c==='service-not-allowed')keyboard('הדפדפן לא מאפשר זיהוי דיבור כאן. לוחצים בתיבה ואז על המיקרופון שבמקלדת.');else if(c==='network')keyboard('זיהוי הדיבור של הדפדפן צריך אינטרנט. אפשר לדבר דרך המיקרופון שבמקלדת.');else if(c==='language-not-supported')keyboard('הדפדפן לא מזהה עברית. לוחצים בתיבה ואז על המיקרופון שבמקלדת.');};
      rec.onend=()=>{stopNow=null;clearTimeout(silence);clearTimeout(startT);if(!alive())return;onMic(false);if(cancelled)return;
        if(heard){say('הבנתי. ממלא את הטופס…');run();}
        else if(!mic.hidden)say('לא שמעתי. אפשר לנסות שוב, או לדבר דרך המיקרופון שבמקלדת.');};
      try{rec.start();}catch(e){keyboard();}
    }

    mic.onclick=async()=>{
      if(stopNow){stopNow();return;}
      if(busyRec)return;busyRec=true;
      try{const m=mode||await modeP;if(!alive())return;
        if(m==='server')await recordServer();else if(m==='browser')recordBrowser();else keyboard();}
      finally{busyRec=false;}
    };
    let running=false;
    const run=async()=>{
      const text=ta.value.trim();if(!text||running)return;running=true;busy(goB,true,'הסוכן מבין…');
      try{
        const r=await sample.json(voicePrompt(text),{maxTokens:400,modelTier:'default'});
        if(!alive())return;
        if(!r||!r.type||r.type==='none'){busy(goB,false);running=false;say('לא הבנתי מה לרשום. אפשר לנסח שוב, למשל ״תדלקתי ב־250 שקל״.');return;}
        if(r.car&&r.car!==CAR&&S.cars.some(c=>c.id===r.car)){CAR=r.car;try{localStorage.setItem('cj-car',r.car);}catch(e){}chatLog.length=0;applyCar();if(isBiz())setFleetView(false);render();}
        closeModal();openVoiceResult(r,text);
      }catch(e){if(!alive())return;busy(goB,false);running=false;say(aiErr(e,'הסוכן לא הצליח להבין. אפשר לנסות שוב.'));}
    };
    goB.onclick=run;
    const obs=new MutationObserver(()=>{if(!alive()){cleanup();obs.disconnect();}});obs.observe(root,{childList:true});
  });
}
function openVoiceResult(r,text){
  const date=/^\d{4}-\d\d-\d\d$/.test(r.date||'')&&r.date<=today()?r.date:today();
  const pre={date};
  if(r.type==='fuel'){const x=normFuel(r)||{};Object.assign(pre,{total:x.total,liters:x.liters,pricePerL:x.pricePerL,station:x.station||r.vendor||'',odo:n(r.odo)||'',full:r.full!==false});fuelForm(null,pre);}
  else if(r.type==='service'){Object.assign(pre,{title:r.title||'טיפול',cost:n(r.total),garage:r.vendor||'',note:r.note||'',odo:n(r.odo)||odo()});serviceForm(null,pre);}
  else if(r.type==='odo'&&n(r.odo)){odoForm();const i=$('#oV');if(i)i.value=n(r.odo);}
  else{Object.assign(pre,{title:r.title||r.vendor||'',amount:n(r.total),category:r.category||'other',vendor:r.vendor||'',note:r.note||''});expenseForm(null,pre);}
  toast('בדוק את הפרטים ולחץ שמירה');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="voice"]');if(b)voiceSheet();});

/* ===== 08-events-boot.js ===== */
/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const nv=e.target.closest('[data-nav]');if(nv){if($('#ov').hidden===false)closeModal();go(nv.dataset.nav);return;}
  const b=e.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act,id=b.dataset.id;
  if(!['close','rcpt'].includes(a)&&!db&&a!=='quick'){toast('המאגר לא מחובר');return;}
  switch(a){
    case 'close':closeModal();break;
    case 'quick':quickSheet();break;
    case 'fuelForm':fuelForm(id);break;
    case 'fuelQuick':fuelQuick();break;
    case 'serviceForm':serviceForm(id);break;
    case 'expenseForm':expenseForm(id);break;
    case 'remForm':remForm(null,b.dataset.kind);break;
    case 'editRem':remForm(id);break;
    case 'del':confirmDelete(b.dataset.col,id);break;
    case 'odo':odoForm();break;
    case 'car':case 'setup':carForm();break;
    case 'account':accountSheet();break;
    case 'cars':carSheet();break;
    case 'feedback':feedbackSheet();break;
    case 'bizAsk':feedbackSheet('biz');break;
    case 'installHint':pushInstallSheet();break;
    case 'installHintX':try{localStorage.setItem('cj-install-hint','1');}catch(x){}render();break;
    case 'onboard':onbShown=true;onboarding(1);break;
    case 'checks':checksSheet();break;
    case 'scan':scanSheet();break;
    case 'plan':runPlan(b);break;
    case 'insight':runInsight(b);break;
    case 'agtab':agTab=id;render();break;
    case 'docUp':docUploadSheet(b.dataset.type||'insurance');break;
    case 'docFile':{const pp=S.paper.find(x=>x.id===id);const f=pp&&(pp.files||[])[+(b.dataset.i||0)];if(f)receiptView(f.id,f.type||'',pp.type==='license'?'רישיון הרכב':'פוליסת הביטוח');break;}
    case 'docEdit':docEditSheet(id);break;
    case 'docDel':docDeleteSheet(id);break;
    case 'drvEdit':driverSheet();break;
    case 'drvFile':{const f=(S.person&&S.person.files||[])[+(b.dataset.i||0)];if(f)receiptView(f.id,f.type||'','רישיון הנהיגה');break;}
    case 'tkAdd':ticketSheet();break;
    case 'tkEdit':ticketSheet(id);break;
    case 'tkPaid':ticketPaid(id);break;
    case 'tkImport':pointsImportSheet();break;
    case 'tkFile':{const t=S.ticket.find(x=>x.id===id);const f=t&&(t.files||[])[0];if(f)receiptView(f.id,f.type||'','הדוח');break;}
    case 'docAsk':agTab='agents';render();setTimeout(()=>{const i=$('#chatIn');if(i){i.value='לפי הביטוח שלי, ';i.focus();}},60);break;
    case 'cal':addToCalendar(id,b);break;
    case 'rcpt':receiptView(id,b.dataset.type||'');break;
    case 'ask':sendChat(b.dataset.q);break;
    case 'snooze':snoozeSheet(id);break;
    case 'restore':restoreSheet();break;
    case 'done':{const r=S.reminder.find(x=>x.id===id);if(!r)break;
      if(r.kind==='service'){serviceForm(null,{title:r.title,remId:r.id});}
      else markDone(id).catch(()=>toast('העדכון נכשל'));break;}
  }
});
document.addEventListener('submit',e=>{if(e.target.id==='composer'){e.preventDefault();const i=$('#chatIn');const q=i.value;i.value='';sendChat(q);}});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h&&h!==view&&NAV.some(x=>x[0]===h))go(h);});

(function(){
  const sp=$('#splash');if(!sp)return;let done=false;
  const fin=()=>{if(done)return;done=true;sp.remove();placeInd(true);if($('#view').children.length&&!$('#view .empty:only-child'))animateView('first');};
  sp.addEventListener('animationend',e=>{if(e.target===sp&&e.animationName==='spOut')fin();});
  sp.addEventListener('click',()=>sp.classList.add('out'));
  setTimeout(fin,5000);
})();
boot();
})();
