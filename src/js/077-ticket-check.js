/* ---------- ticket check: is the ticket in order, what are the deadlines ---------- */
// Rules (Israel): request to cancel within 30 days of receiving the ticket, request a trial within 90 days,
// pay within 90 days (then +50%). A ticket based on a photo of the car (camera) must reach the owner within
// 4 months of the offense; one sent later by mail, within a year (Criminal Procedure Law, section 225A).
const TK_SCAN_KEYS=['offenseTime','cancelBy','trialBy','lawSection','location','vehicleMake','vehicleColor','officer','delivery','hasPhoto','authority'];
function tkScanFields(r){
  const o={scanned:true};const d=/^\d{4}-\d\d-\d\d$/;
  for(const k of TK_SCAN_KEYS){const v=r[k];if(v==null||v==='')continue;if((k==='cancelBy'||k==='trialBy')&&!d.test(v))continue;o[k]=typeof v==='string'?v.slice(0,120):v;}
  if(r.plate)o.plateOnTicket=String(r.plate).slice(0,20);
  o.aiIssues=(Array.isArray(r.issues)?r.issues:[]).filter(x=>typeof x==='string'&&x.trim()).slice(0,5).map(x=>x.slice(0,200));
  return o;
}
function addMonths(s,m){const d=pd(s);const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+m);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return dstr(d);}
const MAKES=[['טויוטה','toyota'],['קיה','kia'],['יונדאי','hyundai'],['מאזדה','mazda'],['סקודה','skoda'],['שברולט','chevrolet'],['פולקסווגן','volkswagen','vw'],['ניסאן','nissan'],['סוזוקי','suzuki'],['מיצובישי','mitsubishi'],['הונדה','honda'],['רנו','renault'],['פיג׳ו','פיגו','peugeot'],['סיטרואן','citroen'],['פורד','ford'],['סובארו','subaru'],['ב.מ.וו','במוו','bmw'],['מרצדס','mercedes'],['אאודי','audi'],['טסלה','tesla'],['סיאט','seat'],['אופל','opel'],['דאצ׳יה','דאציה','dacia'],['ג׳ילי','geely'],['ביואיד','byd'],['אם ג׳י','mg'],['לקסוס','lexus'],['וולבו','volvo'],['שאנגן','changan'],['צ׳רי','chery']];
function makeKey(s){const x=String(s||'').toLowerCase().replace(/["'׳״\s.-]/g,'');for(const g of MAKES)if(g.some(m=>x.includes(m.replace(/["'׳״\s.-]/g,''))))return g[0];return x||null;}
function tkCheck(t){
  const items=[];const add=(s,x)=>items.push({s,x});
  const car=(t.carId&&t.carId!=='*'?S.cars.find(c=>c.id===t.carId):null)||(S.cars.length===1?S.cars[0]:null);
  const photo=t.kind==='camera'||t.hasPhoto===true;
  // plate
  if(t.plateOnTicket){const k=plateKey(t.plateOnTicket),mine=S.cars.map(c=>plateKey(c.plate)).filter(Boolean);
    if(k&&mine.length){if(mine.includes(k))add('ok','מספר הרכב בדוח תואם לרכב שלך.');else add('bad',`מספר הרכב בדוח (${t.plateOnTicket}) לא תואם לאף רכב שלך. אם זה לא הרכב שלך, זו עילה לבקשת ביטול.`);}}
  // make
  if(t.vehicleMake&&car&&car.make){const a=makeKey(t.vehicleMake),b=makeKey(car.make);
    if(a&&b&&a!==b)add('bad',`סוג הרכב בדוח (${t.vehicleMake}) שונה מהרכב שלך (${car.make}). טעות בזיהוי הרכב היא עילה לבקשת ביטול.`);else if(a&&b)add('ok','סוג הרכב בדוח תואם.');}
  // dates
  if(t.serviceDate&&t.offenseDate&&t.serviceDate<t.offenseDate)add('bad','תאריך קבלת הדוח מוקדם מתאריך העבירה. זו סתירה בדוח.');
  if(t.kind!=='parking'&&t.offenseDate&&t.serviceDate&&t.delivery!=='hand'&&t.delivery!=='windshield'){
    const lim=addMonths(t.offenseDate,photo?4:12),gap=daysBetween(t.offenseDate,t.serviceDate);
    if(t.serviceDate>lim)add('bad',`הדוח הגיע ${gap} ימים אחרי העבירה. ${photo?'דוח מצלמה צריך להגיע תוך 4 חודשים':'דוח שנשלח בדואר צריך להגיע תוך שנה'}, אז ייתכן שהעבירה התיישנה וזו עילה לבקשת ביטול.`);
    else add('ok',`הדוח הגיע בזמן (${gap} ימים אחרי העבירה).`);}
  if(!t.serviceDate)add('warn','חסר התאריך שבו קיבלת את הדוח. ממנו נספרים כל המועדים, וכדאי להוסיף אותו בעריכה.');
  // missing details
  if(t.scanned){const miss=[['location','מקום העבירה'],['offenseTime','שעת העבירה'],['description','תיאור העבירה']];
    if(t.kind!=='parking')miss.push(['officer',t.kind==='camera'?'זיהוי המצלמה':'שם או מספר השוטר']);
    const m=miss.filter(([k])=>!t[k]).map(x=>x[1]);
    if(m.length)add('warn',`לא מצאתי בדוח: ${m.join(', ')}. אם הפרטים באמת חסרים בדוח, זה עשוי להיות פגם. כדאי לבדוק במקור.`);
    else add('ok','כל הפרטים החיוניים מופיעים בדוח.');}
  if(t.kind==='camera'&&t.hasPhoto===false)add('warn','אין בדוח תמונה של הרכב. אפשר לבקש את תמונת המצלמה לפני שמחליטים מה לעשות.');
  for(const x of t.aiIssues||[])if(!items.some(i=>i.x===x))add('warn',x);
  const base=t.serviceDate||'';
  const cancelBy=t.cancelBy||(base?addDays(base,30):''),trialBy=t.trialBy||(base?addDays(base,90):''),payBy=tkDue(t);
  const bad=items.filter(i=>i.s==='bad').length,warn=items.filter(i=>i.s==='warn').length;
  const s=bad?'bad':warn?'warn':'ok';
  const title=bad?(bad===1?'נמצא פגם שעשוי להצדיק בקשה לביטול':`נמצאו ${bad} פגמים שעשויים להצדיק בקשה לביטול`):warn?'הדוח נראה תקין, אבל כדאי לבדוק כמה דברים':'הדוח נראה תקין';
  return {items:items.sort((a,b)=>({bad:0,warn:1,ok:2})[a.s]-({bad:0,warn:1,ok:2})[b.s]),s,title,bad,warn,cancelBy,trialBy,payBy};
}
// saved with the ticket, so the evening reminder can say what was found
function tkCheckSummary(t){const c=tkCheck(t);return {checkS:c.s,checkBad:c.bad,checkWarn:c.warn,cancelBy:t.cancelBy||c.cancelBy||'',reviewed:!!t.reviewed&&t.checkS===c.s};}
function tkCheckBtn(t){
  if(t.status!=='open'&&!t.scanned)return '';
  const c=tkCheck(t);const lbl=t.reviewed?'בדיקת הדוח':c.s==='bad'?`${c.bad===1?'פגם אפשרי':c.bad+' פגמים אפשריים'} · לבדיקה`:c.s==='warn'?'לבדיקה':'נבדק · תקין';
  return `<button class="btn sm ${!t.reviewed&&c.s==='bad'?'tk-bad':''}" data-act="tkCheck" data-id="${esc(t.id)}">${I('check')}${lbl}</button>`;
}
function tkCheckSheet(id,fresh,tries){
  const t=S.ticket.find(x=>x.id===id);if(!t){if((tries||0)<12)setTimeout(()=>tkCheckSheet(id,fresh,(tries||0)+1),250);return;}
  const c=tkCheck(t);const left=d=>{if(!d)return '';const k=daysBetween(today(),d);return k<0?` · עבר לפני ${-k} ימים`:k===0?' · היום':` · עוד ${k} ימים`;};
  const ic={ok:'check',warn:'bell',bad:'ticket'};
  const police=t.kind!=='parking';
  openModal('בדיקת הדוח',`<div class="stack" style="gap:14px">
    <div class="tkc-v" data-s="${c.s}"><b>${esc(c.title)}</b><span>${esc(t.description||TK_KIND[t.kind]||'דוח')}${t.offenseDate?' · '+fmtD(t.offenseDate):''}${n(t.amount)?' · '+money(t.amount):''}</span></div>
    <div class="tkc-list">${c.items.map(i=>`<div class="tkc-i" data-s="${i.s}"><span class="tkc-ic">${I(ic[i.s])}</span><span>${esc(i.x)}</span></div>`).join('')||'<p class="small muted">צלם את הדוח כדי שהסוכן יבדוק את כל הפרטים.</p>'}</div>
    <div class="tkc-dl"><div class="eyebrow">מועדים</div>
      ${c.cancelBy?`<div><b>בקשה לביטול</b> עד ${fmtD(c.cancelBy)}${left(c.cancelBy)}</div>`:''}
      ${c.trialBy?`<div><b>בקשה להישפט</b> עד ${fmtD(c.trialBy)}${left(c.trialBy)}</div>`:''}
      ${c.payBy?`<div><b>תשלום</b> עד ${fmtD(c.payBy)}${left(c.payBy)}. אחרי זה נוספים 50% פיגורים.</div>`:''}
      ${!c.cancelBy&&!c.payBy?'<div class="small muted">הוסף את התאריך שבו קיבלת את הדוח, ונחשב את המועדים.</div>':''}</div>
    <p class="small muted" style="margin:0">תשלום הדוח הוא הודאה בעבירה, ואז כבר אי אפשר לערער. אי אפשר להגיש בקשה לביטול ובקשה להישפט באותו זמן. ${police?'בקשה לביטול של דוח משטרה מגישים למרכז פניות נהגים ארצי.':'בקשה לביטול של דוח חניה מגישים לרשות שהוציאה אותו.'} זו בדיקה אוטומטית ולא ייעוץ משפטי.</p>
    ${!t.scanned&&(t.files||[]).length&&sample?`<button class="btn primary block" id="tkcScan">${I('spark')}בדיקה מלאה של הדוח ע״י הסוכן</button>`:''}
    <div class="formacts">${t.reviewed?'':`<button class="btn ${!t.scanned&&(t.files||[]).length&&sample?'':'primary'}" id="tkcOk">${I('check')}בדקתי</button>`}
      ${police?`<a class="btn ghost" href="https://www.gov.il/he/service/drivers_inquiries_forms" target="_blank" rel="noopener">${I('send')}בקשה לביטול באתר הממשלה</a>`:''}
      <button class="btn ghost" id="tkcAsk">${I('spark')}לשאול את היועץ</button></div></div>`,root=>{
    const ok=root.querySelector('#tkcOk');if(ok)ok.onclick=async()=>{busy(ok,true);try{await updRec('ticket',id,{reviewed:true,checkS:c.s});closeModal();toast('סומן כנבדק. לא נזכיר יותר על הבדיקה.');}catch(e){busy(ok,false);toast('העדכון נכשל');}};
    const sc=root.querySelector('#tkcScan');if(sc)sc.onclick=async()=>{busy(sc,true,'הסוכן בודק את הדוח…');
      try{const f=t.files[0];const url=window.__rcptUrlAsync?await window.__rcptUrlAsync(f.id):rcptSrc(f.id);const b=await (await fetch(url)).blob();
        const r=await sample.json(ticketPrompt(),{images:[new File([b],f.name||'ticket',{type:f.type||b.type})],modelTier:'default',maxTokens:900,purpose:'scan'});
        if(!root.contains(sc))return;
        if(!r||r.isTicket===false){busy(sc,false);toast('הסוכן לא זיהה דוח בקובץ');return;}
        const d=/^\d{4}-\d\d-\d\d$/,up=tkScanFields(r);
        for(const k of ['offenseDate','serviceDate','dueDate'])if(!t[k]&&d.test(r[k]||''))up[k]=r[k];
        if(!t.description&&r.description)up.description=r.description;if(!n(t.amount)&&n(r.amount))up.amount=n(r.amount);
        Object.assign(up,tkCheckSummary(Object.assign({},t,up)));
        await updRec('ticket',id,up);closeModal();setTimeout(()=>tkCheckSheet(id),300);
      }catch(e){if(root.contains(sc)){busy(sc,false);toast(aiErr(e,'הבדיקה נכשלה. אפשר לנסות שוב.'));}}};
    root.querySelector('#tkcAsk').onclick=()=>{closeModal();agTab='agents';go('agents');render();setTimeout(()=>{const i=$('#chatIn');if(i){i.value=`לגבי הדוח מ־${t.offenseDate?fmtD(t.offenseDate):''} (${t.description||TK_KIND[t.kind]||'דוח'}): `;i.focus();}},80);};
  });
  if(fresh&&!t.reviewed)toast('נזכיר לך בערב לעבור על הבדיקה');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="tkCheck"]');if(b)tkCheckSheet(b.dataset.id);});
