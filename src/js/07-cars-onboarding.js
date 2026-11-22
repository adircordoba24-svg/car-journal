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
    <div class="carlist">${list}</div>
    ${canAdd?`<button type="button" class="btn primary block" id="carAdd">${I('plus')}הוספת רכב${PLAN==='business'?'':' שני'}</button>`:`<p class="small muted" style="margin:0">${PLAN==='business'?`החשבון העסקי שלך כולל עד ${MAX_CARS} רכבים.`:`חשבון פרטי כולל עד ${MAX_CARS} רכבים. מנהל יותר רכבים, לעסק או למשפחה? <button type="button" class="linkbtn" data-act="bizAsk">חשבון עסקי</button>`}</p>`}
    ${S.cars.length>1&&S.car?`<button type="button" class="btn ghost block" id="carDel" style="color:var(--crit)">${I('trash')}מחיקת ${esc(carName(S.car))} וכל הרישומים שלו</button>`:''}
  </div>`,root=>{
    root.querySelectorAll('[data-car]').forEach(b=>b.onclick=()=>{closeModal();switchCar(b.dataset.car);});
    const a=root.querySelector('#carAdd');if(a)a.onclick=()=>{closeModal();let id='car';for(let i=2;S.cars.some(c=>c.id===id);i++)id='car'+i;onboarding(2,{carId:id});};
    const d=root.querySelector('#carDel');if(d)d.onclick=()=>deleteCarSheet();
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
        close(false);toast(st.carId==='car2'?'הרכב השני נוסף':st.carId?'הרכב נוסף':'הרכב נוסף. ברוך הבא!');go('home');
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
