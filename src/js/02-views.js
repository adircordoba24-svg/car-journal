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
  try{afterRender();}catch(e){console.warn(e);}
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
  return `${homeIntro()}
  <section class="card m m-hero">
    <div class="m-car"><div style="min-width:0"><div class="eyebrow">${esc(car.nickname||'הרכב שלי')}</div><div class="m-carname">${esc([car.make,car.model].filter(Boolean).join(' ')||'רכב חדש')}</div></div>${plate(car.plate)}</div>
    <button class="m-odo" data-act="odo" aria-label="עדכון מד אוץ">${odoRoll(o)}<span class="m-odo-edit">${I('edit')}</span></button>
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
  ${healthCard()}
  <section class="m m-kpis" aria-label="נתונים">
    <div class="card kpi"><div class="eyebrow">ק״מ לליטר</div><div class="v">${eff?nf1.format(eff.avg):'—'}</div><div class="d">${eff?'ממוצע':'אחרי 2 מילויים מלאים'}</div></div>
    <div class="card kpi"><div class="eyebrow">החודש</div><div class="v">${ils(mSpend)}</div><div class="d">הוצאות</div></div>
    <div class="card kpi"><div class="eyebrow">טסט</div><div class="v">${docs&&docs.st.daysLeft!==null?(docs.st.daysLeft<0?'עבר':docs.st.daysLeft):'—'}${docs&&docs.st.daysLeft>=0?'<small>ימים</small>':''}</div><div class="d">${docs?'עד '+fmtD(docs.st.dueDate):''}</div></div>
    <div class="card kpi"><div class="eyebrow">נסיעה</div><div class="v">${km(kmPerDay())}<small>ק״מ</small></div><div class="d">ביום בממוצע</div></div>
  </section>
  ${countdownCard()}
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
  return `${homeIntro()}
  <section class="hero">
    <div class="card carcard">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
        <div><div class="eyebrow">${esc(car.nickname||'הרכב שלי')}</div><div class="carname">${esc([car.make,car.model].filter(Boolean).join(' ')||'רכב חדש')}</div>
        <div class="carmeta">${esc([car.year,car.fuelType?('דלק '+car.fuelType):'',car.tankL?`מכל ${car.tankL} ל׳`:''].filter(Boolean).join(' · '))}</div></div>
        ${plate(car.plate)}
      </div>
      <div class="odo">${odoRoll(o)}<button class="btn sm" data-act="odo">${I('gauge')}עדכון מד אוץ</button></div>
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
  <section class="hd-row">${healthCard()}${countdownCard()}</section>
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

// routine checks (oil, water, tyre pressure…): what's next, and a log of every time they were done
function checksCard(){
  const list=sortedReminders(r=>r.kind==='check');
  const log=S.reminder.filter(r=>r.kind==='check').flatMap(r=>(Array.isArray(r.history)?r.history:[]).map(h=>({r,h}))).filter(x=>x.h&&x.h.date).sort((a,b)=>b.h.date.localeCompare(a.h.date)||0).slice(0,14);
  return `<section class="two" style="margin-top:16px">
    <div class="card"><div class="card-head"><h2>בדיקות שוטפות</h2><button class="btn sm" data-act="checks">${I('check')}סימון בדיקות</button></div>
      <div class="rlist">${list.map(x=>remRow(x,true)).join('')||'<div class="empty">אין בדיקות מוגדרות</div>'}</div></div>
    <div class="card"><div class="card-head"><h2>יומן הבדיקות</h2><span class="small muted">${log.length?'האחרונות':''}</span></div>
      <div class="feed">${log.map(({r,h})=>`<div class="fitem"><div class="ic ok">${I(iconFor(r.title,'check'))}</div><div style="min-width:0"><div class="rtitle">${esc(r.title)}</div><div class="rsub">${fmtD(h.date)}${n(h.km)?` · ${km(h.km)} ק״מ`:''}</div></div><span class="pill ok">בוצע</span></div>`).join('')||'<div class="empty"><b>עוד לא נרשמו בדיקות</b>כשתלחץ ״בוצע״ על בדיקה, היא תופיע כאן עם התאריך</div>'}</div></div>
  </section>`;
}
function vService(){
  const rows=[...S.service].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const sched=sortedReminders(r=>r.kind==='service');
  const tot=rows.reduce((s,r)=>s+(n(r.cost)||0),0);
  return `
  <div class="sec-title"><h2>טיפולים</h2><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="report">${I('doc')}דוח היסטוריה (PDF)</button><button class="btn primary" data-act="serviceForm">${I('plus')}רישום טיפול</button></span></div>
  <section class="two" style="margin-top:0">
    <div class="card"><div class="card-head"><h2>היסטוריית טיפולים</h2><span class="small muted">${rows.length} טיפולים · ${ils(tot)}</span></div>
      <div class="feed">${rows.map(r=>`<div class="fitem"><div class="ic">${I('wrench')}</div><div style="min-width:0"><div class="rtitle">${esc(r.title)}</div><div class="rsub">${fmtD(r.date)} · ${km(r.odo)} ק״מ${r.garage?' · '+esc(r.garage):''}</div>${r.note?`<div class="rsub" style="margin-top:3px">${esc(r.note)}</div>`:''}</div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="amt">${ils(r.cost)}</span><div class="rowacts">${rcptChip(r.receipt)}<button class="mini" data-act="serviceForm" data-id="${r.id}" aria-label="עריכה">${I('edit')}</button><button class="mini" data-act="del" data-col="service" data-id="${r.id}" aria-label="מחיקה">${I('trash')}</button></div></div></div>`).join('')||'<div class="empty"><b>אין טיפולים רשומים</b>תעד טיפול במוסך כדי לעקוב אחרי ההיסטוריה של הרכב</div>'}</div></div>
    <div class="card"><div class="card-head"><h2>לוח טיפולים</h2><button class="link" data-act="remForm" data-kind="service">הוספה</button></div>
      <div class="rlist">${sched.map(x=>remRow(x,true)).join('')||'<div class="empty">אין טיפולים מתוזמנים</div>'}</div></div>
  </section>
  ${checksCard()}`;
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
  return `<div class="sec-title"><h2>תזכורות</h2><span style="display:flex;gap:8px;flex-wrap:wrap">${window.cjSB?`<button class="btn" data-act="calendar">${I('cal')}ליומן גוגל</button>`:''}<button class="btn primary" data-act="remForm">${I('plus')}תזכורת חדשה</button></span></div>
  <p class="muted small" style="margin:-4px 0 16px;max-width:65ch">כל תזכורת נמדדת לפי קילומטרים, לפי זמן, או לפי מה שמגיע קודם. המועד המשוער מחושב לפי קצב הנסיעה שלך. ${window.cjPush?'כשמגיע המועד, היומן שולח התראה לטלפון (מפעילים ב״החשבון שלי״). אפשר גם להוסיף תזכורת ליומן של הטלפון.':'אפשר לשלוח כל תזכורת ליומן Google כדי לקבל התראה בטלפון.'}</p>
  <div class="stack">${groups.map(g=>{const list=sortedReminders(r=>(r.kind||'service')===g);return `<section class="card"><div class="card-head"><h2>${KIND[g]}</h2><button class="link" data-act="remForm" data-kind="${g}">הוספה</button></div><div class="rlist">${list.map(x=>remRow(x,false)).join('')||'<div class="empty">אין תזכורות בקבוצה הזו</div>'}</div></section>`;}).join('')}</div>`;
}

let lastInsight='',insightBusy=false;
let agTab='agents';try{if(location.hash==='#docs')agTab='docs';if(location.hash==='#tickets')agTab='tickets';}catch(e){}
function agTabs(){const t=(id,ic,l)=>`<button type="button" role="tab" aria-selected="${agTab===id}" class="${agTab===id?'on':''}" data-act="agtab" data-id="${id}">${I(ic)}${l}</button>`;
  return `<div class="seg agtabs" role="tablist" aria-label="סוכנים, מסמכים ודוחות">${t('agents','spark','הסוכן')}${t('docs','shield','מסמכים')}${t('tickets','ticket','דוחות')}</div>`;}
function vAgents(){
  if(agTab==='docs')return agTabs()+vDocs();
  if(agTab==='tickets')return agTabs()+vTickets();
  const off=!sample;
  return agTabs()+`<div class="sec-title"><h2>הסוכן</h2><span class="small muted">רושם בשבילך, עונה, ומנווט באפליקציה</span></div>
  ${off?`<div class="banner warn">הסוכנים זמינים כשהדף פתוח ב־Claude עם חשבון מחובר.</div>`:''}
  ${window.cjAccount?`<div class="small muted" id="agQuota" style="margin:-4px 0 14px"></div>`:''}
  <section class="card agent-chat" style="margin-bottom:16px">
    <div class="card-head"><h2>${I('spark')} הסוכן</h2><span class="small muted">מספרים לו מה עשית, והוא רושם. או שואלים.</span></div>
    <div class="chat" id="chat">
      <div class="msgs" id="msgs">${chatLog.length?'':`<div class="msg a">שלום! ספר לי מה עשית עם ${esc(S.car?.nickname||carName(S.car))} ואני ארשום, למשל ״עשיתי איזון וכיוון פרונט ב־250 שקל״. אפשר גם לשאול כל דבר על הרכב.</div>`}</div>
      <div class="suggest" id="sugg">${['בדקתי היום שמן ומים','עשיתי איזון וכיוון פרונט ב־250 שקל','כמה הוצאתי על הרכב החודש?','תעביר אותי לביטוח'].map(q=>`<button class="btn sm ghost" data-act="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <form class="composer" id="composer"><button class="btn ghost" type="button" data-act="agMic" aria-label="לדבר עם הסוכן" ${off?'disabled':''}>${I('mic')}</button><input type="text" id="chatIn" placeholder="מה עשית עם הרכב? או שאלה…" autocomplete="off" ${off?'disabled':''}><button class="btn primary" type="submit" ${off?'disabled':''} aria-label="שליחה">${I('send')}</button></form>
    </div>
  </section>
  <section class="agents">
    <div class="card agent"><div class="badge">${I('cam')}</div><h3>סוכן הקבלות</h3><p>צלם קבלה מהתחנה או מהמוסך. הסוכן יזהה אם זה תדלוק, טיפול או הוצאה, ימלא סכום, ליטרים, תאריך ותחנה, ויצרף את הקבלה לרישום.</p><button class="btn primary" data-act="scan" ${off||!imgOK?'disabled':''}>${I('cam')}סריקת קבלה</button>${!off&&!imgOK?'<span class="small muted">סריקת תמונות לא זמינה בתצוגה הזו</span>':''}</div>
    <div class="card agent"><div class="badge">${I('light')}</div><h3>נורה בלוח</h3><p>נדלקה נורה ולא ברור מה היא? מצלמים את הלוח, והסוכן אומר מה זה, כמה דחוף, ואם אפשר להמשיך לנסוע.</p><button class="btn primary" data-act="light" ${off||!imgOK?'disabled':''}>${I('cam')}צילום הלוח</button></div>
    <div class="card agent"><div class="badge">${I('list')}</div><h3>מתכנן הטיפולים</h3><p>לפי היצרן, הדגם, השנה והקילומטראז׳, הסוכן בונה לוח טיפולים מומלץ עם מרווחים בק״מ ובזמן. אתה בוחר מה להוסיף לתזכורות.</p><button class="btn primary" data-act="plan" ${off?'disabled':''}>${I('spark')}בניית תוכנית</button></div>
    <div class="card agent"><div class="badge">${I('chart')}</div><h3>האנליסט</h3><p>סוקר את הצריכה, המחירים וההוצאות, מאתר חריגות כמו ירידה פתאומית בק״מ לליטר, ומסכם מה כדאי לעשות החודש.</p><button class="btn primary" data-act="insight" ${off?'disabled':''}>${I('chart')}ניתוח עכשיו</button></div>
  </section>
`;
}
