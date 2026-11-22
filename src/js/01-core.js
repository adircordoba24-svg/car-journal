try{document.documentElement.dir="rtl";document.documentElement.lang="he";}catch(e){}
/* ---------- icons ---------- */
const P={
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
