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
function voiceSheet(){
  if(!sample){toast('הסוכן לא זמין כרגע');return;}
  openModal('רישום בקול',`<div class="vbox">
    ${SpeechRec?`<button type="button" class="vmic" id="vMic" aria-label="התחלת הקלטה">${I('mic')}</button>`:''}
    <div class="vstate" id="vSt" role="status">${SpeechRec?'לוחצים ואומרים במשפט אחד מה היה':'לוחצים על המיקרופון במקלדת ואומרים במשפט אחד מה היה'}</div>
    <textarea id="vTxt" rows="2" placeholder="מה שתגיד יופיע כאן" aria-label="מה אמרת"></textarea>
    <div class="vex" id="vEx"><span class="small muted">למשל:</span>${VOICE_EX.map(x=>`<button type="button">״${esc(x)}״</button>`).join('')}</div>
    <div class="formacts" style="width:100%"><button class="btn primary" id="vGo" disabled>${I('spark')}מילוי הטופס</button><button class="btn ghost" data-act="close">ביטול</button></div></div>`,root=>{
    const mic=root.querySelector('#vMic'),st=root.querySelector('#vSt'),ta=root.querySelector('#vTxt'),goB=root.querySelector('#vGo');
    let rec=null,listening=false,heard=false;
    const sync=()=>{goB.disabled=!ta.value.trim();};
    ta.oninput=sync;
    root.querySelectorAll('#vEx button').forEach(b=>b.onclick=()=>{ta.value=b.textContent.replace(/[״"]/g,'');sync();});
    const stop=()=>{try{rec&&rec.stop();}catch(e){}};
    const fallback=msg=>{if(mic)mic.hidden=true;st.textContent=msg||'הזיהוי הקולי לא זמין כאן. לוחצים על המיקרופון במקלדת ואומרים מה היה.';ta.focus();};
    if(mic)mic.onclick=()=>{
      if(listening){stop();return;}
      try{
        rec=new SpeechRec();rec.lang='he-IL';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
        const base=ta.value.trim();heard=false;
        rec.onstart=()=>{listening=true;mic.classList.add('on');mic.setAttribute('aria-label','עצירת ההקלטה');st.textContent='מקשיב…';};
        rec.onresult=ev=>{let t='';for(let i=0;i<ev.results.length;i++)t+=ev.results[i][0].transcript;ta.value=(base?base+' ':'')+t.trim();heard=true;sync();};
        rec.onerror=ev=>{const c=ev&&ev.error;if(c==='not-allowed'||c==='service-not-allowed')fallback('אין הרשאה למיקרופון. אפשר לאשר בהגדרות, או ללחוץ על המיקרופון במקלדת.');else if(c==='no-speech')st.textContent='לא שמעתי. לוחצים ומנסים שוב.';else if(c!=='aborted')fallback();};
        rec.onend=()=>{listening=false;if(!root.contains(ta))return;mic.classList.remove('on');mic.setAttribute('aria-label','התחלת הקלטה');
          if(heard&&ta.value.trim()){st.textContent='הבנתי. ממלא את הטופס…';run();}else if(!mic.hidden&&st.textContent==='מקשיב…')st.textContent='לוחצים ואומרים במשפט אחד מה היה';};
        rec.start();
      }catch(e){fallback();}
    };
    let running=false;
    const run=async()=>{
      const text=ta.value.trim();if(!text||running)return;running=true;busy(goB,true,'הסוכן מבין…');
      try{
        const r=await sample.json(voicePrompt(text),{maxTokens:400,modelTier:'default'});
        if(!root.contains(ta))return;
        if(!r||!r.type||r.type==='none'){busy(goB,false);running=false;st.textContent='לא הבנתי מה לרשום. אפשר לנסח שוב, למשל ״תדלקתי ב־250 שקל״.';return;}
        if(r.car&&r.car!==CAR&&S.cars.some(c=>c.id===r.car)){CAR=r.car;try{localStorage.setItem('cj-car',r.car);}catch(e){}chatLog.length=0;applyCar();if(isBiz())setFleetView(false);render();}
        closeModal();openVoiceResult(r,text);
      }catch(e){if(!root.contains(ta))return;busy(goB,false);running=false;st.textContent=aiErr(e,'הסוכן לא הצליח להבין. אפשר לנסות שוב.');}
    };
    goB.onclick=run;
    const obs=new MutationObserver(()=>{if(!root.contains(ta)){stop();obs.disconnect();}});obs.observe(root,{childList:true});
    if(!mic)setTimeout(()=>ta.focus(),80);
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
