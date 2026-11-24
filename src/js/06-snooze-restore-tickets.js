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
  const up=`<div class="docs-up"><button class="btn primary" data-act="tkAdd">${I('cam')}דוח חדש</button><button class="btn ghost" data-act="tkImport">${I('doc')}ייבוא תדפיס נקודות</button><button class="btn ghost" data-act="help" data-id="points">${I('doc')}איך מביאים את התדפיס?</button></div>`;
  return `<div class="sec-title"><h2>דוחות ונקודות ${helpBtn('tickets','איך זה עובד')}</h2><span class="small muted">של הנהג, לכל הרכבים</span></div>
  <section class="card pol">
    <div class="pol-head"><div><div class="eyebrow">הנקודות שלי כרגע ${helpBtn('points','איך מביאים את תדפיס הנקודות')}</div><h2 class="num" style="font-size:44px;line-height:1">${ps.total}<small style="font-size:16px;color:var(--muted);font-weight:400"> נקודות</small></h2></div>
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
    <div class="pol-acts" style="margin-top:8px">${tkCheckBtn(t)}${t.status==='open'?`<button class="btn sm primary" data-act="tkPaid" data-id="${t.id}">${I('check')}שילמתי</button>`:''}<button class="btn sm ghost" data-act="tkEdit" data-id="${t.id}">${I('edit')}עריכה</button>${(t.files||[]).length?`<button class="btn sm ghost" data-act="tkFile" data-id="${t.id}">${I('doc')}הדוח</button>`:''}</div></div>
    </div></div>`;
}
const ticketPrompt=()=>`זה דוח תנועה, דוח מצלמה או דוח חניה בישראל (צילום או PDF). החזר JSON בלבד:
{"isTicket":boolean,"kind":"traffic"|"camera"|"parking"|"other","offenseDate":"YYYY-MM-DD"|null,"offenseTime":"HH:MM"|null,"serviceDate":"YYYY-MM-DD"|null,"dueDate":"YYYY-MM-DD"|null,"cancelBy":"YYYY-MM-DD"|null,"trialBy":"YYYY-MM-DD"|null,"amount":number|null,"points":number|null,"description":string|null,"lawSection":string|null,"location":string|null,"ticketNo":string|null,"plate":string|null,"vehicleMake":string|null,"vehicleColor":string|null,"officer":string|null,"delivery":"hand"|"windshield"|"mail"|null,"hasPhoto":boolean|null,"authority":string|null,"issues":[string]}
- offenseDate: תאריך העבירה. serviceDate: תאריך מסירת הדוח/המצאה אם מופיע. dueDate: "לתשלום עד" / מועד אחרון אם כתוב במפורש.
- description: תיאור העבירה בעברית פשוטה ובקצרה ("מהירות 20 קמ״ש מעל המותר", "חניה באדום־לבן").
- points: רק אם מספר הנקודות כתוב בדוח. אל תנחש.
- location: מקום העבירה (רחוב/כביש ועיר). officer: שם או מספר השוטר/הפקח, או מזהה המצלמה. lawSection: סעיף החוק או התקנה אם כתוב.
- vehicleMake / vehicleColor: סוג הרכב וצבעו כפי שכתוב בדוח. delivery: hand = נמסר ביד במקום, windshield = הודבק על הרכב, mail = נשלח בדואר. hasPhoto: האם יש בדוח תמונה של הרכב.
- cancelBy / trialBy: רק אם כתוב בדוח מועד אחרון לבקשת ביטול / לבקשה להישפט.
- issues: פגמים שאתה רואה בדוח עצמו, בעברית פשוטה ובקצרה: פרטים חיוניים חסרים או לא קריאים, סתירות (תאריכים, שעות, סוג רכב), תאריך מסירה לפני העבירה. רק מה שבאמת רואים. אם אין, מערך ריק.
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
          if(n(r.amount))v('tkA').value=n(r.amount);if(n(r.points)!=null)v('tkP').value=n(r.points);file._no=r.ticketNo||'';file._scan=r;
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
        if(file&&file._scan)Object.assign(data,tkScanFields(file._scan));
        Object.assign(data,tkCheckSummary(Object.assign({},t,data)));
        let tid=id;if(id)await updRec('ticket',id,data);else{const ref=await addRec('ticket',Object.assign({createdAt:Date.now()},data));tid=ref.id;}
        const due=tkDue(data);await syncGlobalReminder('tk:'+tid,`תשלום ${TK_KIND[data.kind]||'דוח'}${n(data.amount)?' '+money(data.amount):''}`,data.status==='open'?due:'');
        closeModal();toast(data.status==='open'&&due?`נשמר. נזכיר לך לפני ${fmtD(due)}`:'נשמר');
        if(!id&&data.status==='open')setTimeout(()=>tkCheckSheet(tid,true),350);
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
