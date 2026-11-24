/* ---------- official vehicle data (Ministry of Transport): details by plate, test date, recalls; and the warning-light reader ---------- */
async function govCar(plate){
  if(!window.cjSB)throw new Error('offline');
  const r=await window.cjSB.functions.invoke('gov',{body:{action:'car',plate}});
  if(r.error||!r.data||r.data.error)throw new Error((r.data&&r.data.error)||'gov');
  return r.data;
}
const firstWord=s=>String(s||'').trim().split(/\s+/)[0]||'';
function govFuel(f){f=String(f||'');return /דיזל|סולר/.test(f)?'סולר':/פלאג/.test(f)?'פלאג־אין':/היבר/.test(f)?'היברידי':/חשמל/.test(f)?'חשמלי':/בנזין/.test(f)?'95':'';}
const titleCase=s=>String(s||'').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());

/* fill the car form from the plate number */
function govFillButton(){return `<button type="button" class="btn block" id="oGov">${I('search')}מילוי אוטומטי לפי מספר הרישוי</button><div class="small muted" id="oGovS" style="text-align:center;min-height:1.2em"></div>`;}
function bindGovFill(root,st){
  const b=root.querySelector('#oGov');if(!b)return;const s=root.querySelector('#oGovS');
  b.onclick=async()=>{const p=root.querySelector('#oP');const plate=(p&&p.value||'').trim();
    if(plate.replace(/\D/g,'').length<7){s.textContent='כתוב קודם את מספר הרישוי (7 או 8 ספרות).';if(p){shake(p.closest('.field'));p.focus();}return;}
    busy(b,true,'בודק במאגר משרד התחבורה…');s.textContent='';
    try{const d=await govCar(plate);if(!root.contains(b))return;busy(b,false);
      if(!d.found){s.textContent='הרכב לא נמצא במאגר. אפשר למלא ידנית.';return;}
      const c=d.car,set=(id,v)=>{const x=root.querySelector('#'+id);if(x&&v){x.value=v;x.classList.add('filled');setTimeout(()=>x.classList.remove('filled'),1200);}};
      set('oMk',firstWord(c.make));set('oMd',titleCase(c.model));set('oY',c.year);set('oP',d.plate);const f=root.querySelector('#oF');const fm=govFuel(c.fuel);if(f&&fm)f.value=fm;
      st.gov=Object.assign({},c,{checkedAt:today()});st.govRecalls=d.recalls||[];
      s.innerHTML=`נמצא: ${esc(firstWord(c.make))} ${esc(titleCase(c.model))} ${c.year||''}, ${esc(c.color||'')}. ${c.testValidUntil?`הטסט בתוקף עד ${fmtD(c.testValidUntil)}.`:''}${(d.recalls||[]).some(r=>r.exact)?' <b style="color:var(--crit)">יש ריקול פתוח לרכב.</b>':''}`;
      const o=root.querySelector('#oO');if(o&&!o.value)o.focus();
    }catch(e){if(root.contains(b)){busy(b,false);s.textContent='המאגר של משרד התחבורה לא זמין כרגע. אפשר למלא ידנית.';}}};
}

/* weekly sync: test date and recalls for every car with a plate */
let govSyncing=false;
async function govSync(force){
  if(govSyncing||!window.cjSB||!db||S.ready.size<COLS.length)return;
  const due=S.cars.filter(c=>!c.example&&String(c.plate||'').replace(/\D/g,'').length>=7&&(force||!c.gov||!c.gov.checkedAt||daysBetween(c.gov.checkedAt,today())>=7));
  if(!due.length)return;govSyncing=true;let news=0;
  try{for(const c of due){
    let d;try{d=await govCar(c.plate);}catch(e){continue;}
    const seen=Array.isArray(c.recallSeen)?c.recallSeen:[];const recalls=(d.recalls||[]).slice(0,12);
    const upd={gov:d.found?Object.assign({},d.car,{checkedAt:today()}):{checkedAt:today(),notFound:true},recalls};
    // the test date from the registry keeps the test reminder right (also after you did the test)
    if(d.found&&d.car.testValidUntil&&d.car.testValidUntil>=today()){
      const r=RAW.reminder.find(x=>(x.carId||'car')===c.id&&(x.docKey==='test'||/טסט/.test(x.title||'')));
      const lastDate=addDays(d.car.testValidUntil,-365);
      if(r){if(r.lastDate!==lastDate)await updRec('reminder',r.id,{lastDate,intervalDays:365,docKey:'test'});}
      else await addRec('reminder',{title:'טסט שנתי',kind:'doc',intervalKm:null,intervalDays:365,lastDate,lastKm:n(c.odometer),docKey:'test',history:[],note:'',carId:c.id});
    }
    // new recalls become a reminder (and a phone notification): open for this vehicle, or new for the model
    const y=new Date().getFullYear();
    const fresh=recalls.filter(r=>!seen.includes(r.id)&&(r.exact||(n(r.year)&&n(r.year)>=y-1)));
    for(const r of fresh){news++;await addRec('reminder',{title:`ריקול: ${r.area||'תקלה בטיחותית'}`,kind:'doc',once:true,docKey:'recall:'+r.id,intervalKm:null,intervalDays:7,lastDate:addDays(today(),-7),lastKm:null,history:[],note:String(r.desc||'').slice(0,300),carId:c.id});}
    upd.recallSeen=[...new Set([...seen,...recalls.map(r=>r.id)])].slice(-60);
    await updRec('garage',c.id,upd);
  }}finally{govSyncing=false;}
  if(news)toastAct(news===1?'נמצא ריקול לרכב שלך':`נמצאו ${news} ריקולים`,'פרטים',()=>govSheet());
}
function govSheet(){
  const c=S.car;if(!c)return;const g=c.gov||{};const rc=Array.isArray(c.recalls)?c.recalls:[];
  const row=(l,v)=>v?`<tr><th>${l}</th><td>${esc(String(v))}</td></tr>`:'';
  openModal('נתוני משרד התחבורה',`<div class="stack" style="gap:14px">
    ${g.checkedAt&&!g.notFound?`<table class="gov-t"><tbody>${row('יצרן',g.make)}${row('דגם',[titleCase(g.model),g.trim].filter(Boolean).join(' · '))}${row('שנת ייצור',g.year)}${row('צבע',g.color)}${row('דלק',g.fuel)}${row('בעלות',g.ownership)}${row('טסט בתוקף עד',g.testValidUntil&&fmtD(g.testValidUntil))}${row('טסט אחרון',g.lastTest&&fmtD(g.lastTest))}${row('עלה לכביש',g.onRoad)}${row('צמיגים',g.tiresFront===g.tiresRear?g.tiresFront:[g.tiresFront,g.tiresRear].filter(Boolean).join(' / '))}</tbody></table>
      <p class="small muted" style="margin:0">עודכן מהמאגר הרשמי ב־${fmtD(g.checkedAt)}. היומן בודק שוב פעם בשבוע, ומעדכן לבד את מועד הטסט.</p>`
    :g.notFound?'<p class="small muted">הרכב לא נמצא במאגר של משרד התחבורה. בדוק שמספר הרישוי נכון בפרטי הרכב.</p>':'<p class="small muted">עוד לא נבדק. צריך מספר רישוי בפרטי הרכב.</p>'}
    <h3 style="margin:4px 0 0">ריקולים</h3>
    ${rc.length?`<div class="stack" style="gap:10px">${rc.map(r=>`<div class="rc" data-exact="${r.exact?1:0}"><b>${esc(r.area||'ריקול')}</b>${r.exact?'<span class="pill over">פתוח לרכב שלך</span>':'<span class="pill neutral">לדגם ולשנים שלך</span>'}<p>${esc(r.desc||'')}</p>
      <div class="small muted">${[r.type,r.fix?'תיקון: '+r.fix:'',r.opened?'נפתח '+fmtD(r.opened):r.year?'פורסם ב־'+r.year:''].filter(Boolean).map(esc).join(' · ')}</div>
      ${r.importer||r.phone?`<div class="small">${esc(r.importer||'')}${r.phone?` · <bdi dir="ltr">${esc(r.phone)}</bdi>`:''}${r.website?` · <a href="${/^https?:/i.test(r.website)?'':'https://'}${esc(String(r.website).toLowerCase())}" target="_blank" rel="noopener">אתר היבואן</a>`:''}</div>`:''}</div>`).join('')}</div>
      <p class="small muted" style="margin:0">ריקול מתקנים בחינם אצל היבואן. ״לדגם ולשנים שלך״ = ייתכן שכבר תוקן ברכב שלך. כדאי לבדוק עם היבואן לפי מספר השלדה.</p>`
    :`<p class="small muted" style="margin:0">${g.checkedAt?'אין ריקולים פתוחים לרכב הזה. 👍':'—'}</p>`}
    <div class="formacts"><button class="btn primary" id="govRe">${I('search')}בדיקה עכשיו</button><a class="btn ghost" href="https://www.gov.il/he/service/recall-vehicle" target="_blank" rel="noopener">בדיקת ריקול באתר הממשלה</a></div></div>`,root=>{
    root.querySelector('#govRe').onclick=async e=>{const b=e.currentTarget;if(!String(c.plate||'').replace(/\D/g,'')){toast('צריך מספר רישוי בפרטי הרכב');return;}busy(b,true,'בודק…');
      await govSync(true).catch(()=>{});if(root.contains(b)){closeModal();setTimeout(govSheet,300);}};
  });
}

/* what does this dashboard light mean? */
const LIGHT_PROMPT=()=>`זו תמונה של לוח המחוונים ברכב${S.car?` (${[S.car.make,S.car.model,S.car.year].filter(Boolean).join(' ')})`:''}. זהה את נורות האזהרה או החיווי שדולקות בתמונה. החזר JSON בלבד:
{"found":boolean,"lights":[{"name":string,"color":"red"|"amber"|"green"|"blue"|"white"|null,"urgency":"stop"|"soon"|"info","meaning":string,"action":string,"canDrive":string}]}
- name: שם הנורה בעברית פשוטה ("נורת לחץ שמן", "נורת מנוע (צ׳ק אנג׳ין)").
- urgency: stop = לעצור בצד בבטחה ולכבות את המנוע (למשל לחץ שמן, טמפרטורת מנוע, בלמים באדום). soon = לבדוק במוסך בקרוב. info = רק חיווי (פנסים, איתות).
- meaning: מה זה אומר, משפט או שניים. action: מה לעשות עכשיו, צעד אחר צעד בקצרה. canDrive: אפשר להמשיך לנסוע? תשובה קצרה.
- אם הנורה לא ברורה, כתוב את ההשערה הסבירה ביותר ואמור שזו הערכה. אם אין נורות דולקות, found=false. עברית בלבד.`;
function lightSheet(){
  if(!sample||!imgOK){toast('הסוכן לא זמין כרגע');return;}
  openModal('נורה בלוח המחוונים',`<div class="stack" style="gap:14px">
    <p class="small muted" style="margin:0">מצלמים את הלוח כשהנורה דולקת. הסוכן יגיד מה היא, כמה זה דחוף ומה לעשות.</p>
    <button class="btn primary block" id="lgCam">${I('cam')}צילום הלוח</button><input type="file" id="lgF" accept="image/*" capture="environment" hidden>
    <div id="lgOut" aria-live="polite"></div></div>`,root=>{
    const b=root.querySelector('#lgCam'),f=root.querySelector('#lgF'),out=root.querySelector('#lgOut');
    b.onclick=()=>f.click();
    f.onchange=async()=>{const file=f.files[0];if(!file)return;busy(b,true,'הסוכן בודק את הנורה…');out.innerHTML='';
      try{const r=await sample.json(LIGHT_PROMPT(),{images:[file],modelTier:'default',maxTokens:900,purpose:'scan'});if(!root.contains(b))return;busy(b,false);
        b.innerHTML=`${I('cam')}צילום נוסף`;
        if(!r||!r.found||!(r.lights||[]).length){out.innerHTML='<p class="small">לא זיהיתי נורה דולקת. נסה צילום קרוב וחד יותר, כשהנורה דולקת.</p>';return;}
        const U={stop:{c:'over',t:'לעצור עכשיו'},soon:{c:'soon',t:'לבדוק בקרוב'},info:{c:'ok',t:'רק חיווי'}};
        out.innerHTML=r.lights.slice(0,5).map(l=>{const u=U[l.urgency]||U.soon;return `<div class="light" data-s="${u.c}"><div class="light-h"><b>${esc(l.name||'נורה')}</b><span class="pill ${u.c}">${u.t}</span></div>
          <p>${esc(l.meaning||'')}</p>${l.action?`<p><b>מה לעשות:</b> ${esc(l.action)}</p>`:''}${l.canDrive?`<p><b>להמשיך לנסוע?</b> ${esc(l.canDrive)}</p>`:''}</div>`;}).join('')+
          `<p class="small muted" style="margin:0">זיהוי אוטומטי מתמונה. אם נורה אדומה דולקת, עדיף לעצור ולבדוק בספר הרכב או לפנות לשירותי הדרך.</p>`;
        if(r.lights.some(l=>l.urgency==='stop'))buzz([60,40,60]);
      }catch(e){if(root.contains(b)){busy(b,false);out.innerHTML=`<p class="small">${esc(aiErr(e,'הסוכן לא הצליח לבדוק. נסה שוב.'))}</p>`;}}};
  });
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="govInfo"],[data-act="light"]');if(!b)return;if(b.dataset.act==='light')lightSheet();else govSheet();});
// check once in a while, in the background
const _ar2=afterRender;afterRender=function(){_ar2();if(!govSync.done&&!govSync._t)govSync._t=setTimeout(()=>{govSync._t=null;if(S.ready.size<COLS.length||!S.cars.length)return;govSync.done=true;govSync().catch(()=>{});},2500);};
