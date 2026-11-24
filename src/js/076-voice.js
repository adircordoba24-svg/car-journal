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
function voiceSheet(opts){
  opts=opts||{};
  if(!sample){toast('הסוכן לא זמין כרגע');return;}
  const IDLE='לוחצים על המיקרופון ואומרים במשפט אחד מה היה';
  openModal(opts.agent?'לדבר עם הסוכן':'רישום בקול',`<div class="vbox">
    <button type="button" class="vmic" id="vMic" aria-label="התחלת הקלטה">${I('mic')}</button>
    <div class="vstate" id="vSt" role="status">${IDLE}</div>
    <textarea id="vTxt" rows="2" placeholder="מה שתגיד יופיע כאן" aria-label="מה אמרת"></textarea>
    <div class="vex" id="vEx"><span class="small muted">למשל:</span>${VOICE_EX.map(x=>`<button type="button">״${esc(x)}״</button>`).join('')}</div>
    <div class="formacts" style="width:100%"><button class="btn primary" id="vGo" disabled>${I('spark')}${opts.agent?'שליחה לסוכן':'מילוי הטופס'}</button><button class="btn ghost" data-act="close">ביטול</button></div></div>`,root=>{
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
        ta.value=text;sync();say(opts.agent?'הבנתי. שולח לסוכן…':'הבנתי. ממלא את הטופס…');run();
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
        if(heard){say(opts.agent?'הבנתי. שולח לסוכן…':'הבנתי. ממלא את הטופס…');run();}
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
      const text=ta.value.trim();if(!text||running)return;
      if(opts.agent){closeModal();agTab='agents';if(view!=='agents')go('agents');else render();setTimeout(()=>sendChat(text),60);return;}
      running=true;busy(goB,true,'הסוכן מבין…');
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
