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
