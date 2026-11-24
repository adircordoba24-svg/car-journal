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
    root.querySelector('#ckSave').onclick=async e=>{busy(e.currentTarget,true);try{const done=[];for(const c of root.querySelectorAll('.ck:checked')){const r=await markDone(c.value,odo(),today(),true);if(r&&r.undo)done.push(r);}closeModal();if(!done.length){toast('לא סימנת בדיקה');return;}
      const soon=done.map(x=>x.next).filter(Boolean).sort()[0];JUST_DONE={ids:done.map(x=>x.id),at:Date.now()};render();
      toastAct(done.length===1?`✓ ${done[0].title}: בוצע היום. ${done[0].nextLabel}`:`✓ ${done.length} בדיקות נרשמו היום.${soon?` הבאה ב־${fmtD(soon)}.`:''}`,'ביטול',()=>Promise.all(done.map(x=>x.undo())).then(()=>toast('בוטל')).catch(()=>toast('הביטול נכשל')),null,7000);}catch(err){busy(e.currentTarget,false);toast('השמירה נכשלה');}};
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
  const before={lastKm:r.lastKm??null,lastDate:r.lastDate||'',history:Array.isArray(r.history)?r.history:[],snoozeDate:r.snoozeDate||'',snoozeKm:r.snoozeKm??null};
  const hist=before.history.slice(-19);
  hist.push({date:atDate||today(),km:atKm||odo()});
  const upd={lastKm:atKm||odo(),lastDate:atDate||today(),history:hist,snoozeDate:'',snoozeKm:null};
  await updRec('reminder',id,upd);
  JUST_DONE={id,at:Date.now()};
  const next=remState(Object.assign({},r,upd));
  const info={id,title:r.title,next:next.dueDate,nextLabel:nextText(r,upd,next),undo:()=>updRec('reminder',id,before)};
  if(!silent)toastAct(`✓ ${r.title}: בוצע היום. ${info.nextLabel}`,'ביטול',()=>info.undo().then(()=>toast('בוטל')).catch(()=>toast('הביטול נכשל')),null,7000);
  return info;
}
let JUST_DONE=null;
// "the next one is on 8 Dec (in 14 days)" or "in 15,000 km"
function nextText(r,upd,st){
  const parts=[];
  if(n(r.intervalDays)){const d=addDays(upd.lastDate,n(r.intervalDays));parts.push(`${fmtD(d)} (עוד ${daysLabel(daysBetween(today(),d))})`);}
  if(n(r.intervalKm))parts.push(`ב־${km((n(upd.lastKm)||0)+n(r.intervalKm))} ק״מ`);
  return parts.length?`הפעם הבאה: ${parts.join(' או ')}`:'';
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
