/* ---------- quick fuel: odometer, receipt, save ---------- */
function fuelQuick(){
  const last=odo();
  const since=S.car?.odoUpdatedAt?Math.max(0,daysBetween(S.car.odoUpdatedAt,today())):0;
  const est=Math.round(last+kmPerDay()*since);
  const ai=!!(sample&&imgOK);
  openModal('תדלוק',`<form id="qf" class="qf" novalidate>
    <div class="field"><label for="qfOdo">כמה ק״מ מראה המד עכשיו?</label>
      <input type="number" id="qfOdo" class="big" inputmode="numeric" enterkeyhint="done" placeholder="${km(est)}" autocomplete="off">
      <div class="small muted">הקילומטראז׳ האחרון: ${km(last)}</div></div>
    <label class="qf-cam" id="qfCam"><input type="file" id="qfFile" accept="image/*">
      <span class="qf-cam-ic" id="qfThumb">${I('cam')}</span>
      <span class="qf-cam-t"><b id="qfCamT">קבלה מ־Yellow או מהתחנה</b><span class="small muted">${ai?'צילום מסך או תמונה, והסוכן ימלא את הפרטים':'צירוף תמונה של הקבלה'}</span><span class="small muted" id="qfQuota"></span></span></label>
    <div class="qf-status" id="qfStatus" hidden></div>
    <details class="qf-more" id="qfMore" ${ai?'':'open'}><summary>פרטי התדלוק <span class="muted small" id="qfSum"></span></summary>
      <div class="fgrid" style="margin-top:12px">
        <div class="field"><label for="qfT">סכום ששולם (₪)</label><input type="number" step="0.01" inputmode="decimal" id="qfT"></div>
        <div class="field"><label for="qfL">ליטרים</label><input type="number" step="0.01" inputmode="decimal" id="qfL"></div>
        <div class="field"><label for="qfS">תחנה</label><input type="text" id="qfS" placeholder="Yellow, פז, דלק…"></div>
        <div class="field"><label for="qfD">תאריך</label><input type="date" id="qfD" value="${today()}"></div>
        <label class="toggle full"><input type="checkbox" id="qfFull" checked> מילוי מלא של המכל</label>
      </div></details>
    <button class="btn primary block" type="submit" id="qfSave">${I('check')}שמירת התדלוק</button>
  </form>`,root=>{
    const $r=q=>root.querySelector(q);
    const odoIn=$r('#qfOdo'),file=$r('#qfFile'),st=$r('#qfStatus');
    quotaText('receipt').then(t=>{const q=$r('#qfQuota');if(q&&t)q.textContent=t;});
    let rcpt=null,ppl=null,okLow=false,reading=false;
    try{odoIn.focus({preventScroll:true});}catch(e){}
    const status=(cls,html)=>{st.hidden=!html;st.className='qf-status'+(cls?' '+cls:'');st.innerHTML=html||'';};
    const sum=()=>{const t=n($r('#qfT').value),l=n($r('#qfL').value),s=$r('#qfS').value.trim();$r('#qfSum').textContent=[t?ils2(t):'',l?nf1.format(l)+' ל׳':'',s].filter(Boolean).join(' · ');};
    root.querySelectorAll('#qfT,#qfL,#qfS').forEach(i=>i.addEventListener('input',sum));
    file.addEventListener('change',async()=>{
      const f=file.files[0];if(!f)return;rcpt=f;
      $r('#qfCam').classList.add('has');$r('#qfThumb').innerHTML=`<img alt="" src="${URL.createObjectURL(f)}">`;$r('#qfCamT').textContent='הקבלה צורפה';
      if(!(sample&&imgOK)){$r('#qfMore').open=true;return;}
      reading=true;status('',`<span class="spin"></span>הסוכן קורא את הקבלה…`);
      try{
        const r=await readFuelReceipt(f);
        if(!root.contains(file))return; // the window was closed while the agent was reading
        if(!r){status('warn','זו לא נראית קבלת דלק. אפשר למלא את הפרטים ידנית.');$r('#qfMore').open=true;return;}
        if(r.total)$r('#qfT').value=r.total.toFixed(2);
        if(r.liters)$r('#qfL').value=+r.liters.toFixed(3);
        if(r.station)$r('#qfS').value=r.station;
        if(r.date)$r('#qfD').value=r.date;
        ppl=r.pricePerL;if(r.invoice)root._inv=r.invoice;
        sum();
        if(r.total)status('ok',`${I('check')}הסוכן מילא: ${esc($r('#qfSum').textContent)}${r.date&&r.date!==today()?` · ${fmtD(r.date)}`:''}`);
        else{status('warn','הסוכן לא מצא את הסכום בקבלה. השלם אותו בפרטים.');$r('#qfMore').open=true;$r('#qfT').focus();}
      }catch(e){console.warn(e);if(!root.contains(file))return;status('warn',aiErr(e));$r('#qfMore').open=true;}
      finally{reading=false;}
    });
    $r('#qf').onsubmit=async e=>{
      e.preventDefault();
      if(reading){toast('רגע, הסוכן עוד קורא את הקבלה');return;}
      const total=n($r('#qfT').value),o=n(odoIn.value);
      if(!total){$r('#qfMore').open=true;$r('#qfT').focus();status('warn',rcpt?'חסר סכום. השלם אותו בפרטים.':'צרף קבלה או מלא סכום.');return;}
      if(o&&o<last&&!okLow){okLow=true;status('warn',`המספר נמוך מהקילומטראז׳ האחרון (${km(last)}). לחץ שוב לשמירה בכל זאת.`);return;}
      const btn=$r('#qfSave');busy(btn,true);
      try{
        let liters=n($r('#qfL').value);if(!liters&&ppl)liters=+(total/ppl).toFixed(2);
        const data={date:$r('#qfD').value||today(),odo:o,liters,total,pricePerL:ppl||(liters?+(total/liters).toFixed(3):null),station:$r('#qfS').value.trim(),full:$r('#qfFull').checked,note:root._inv?'חשבונית '+root._inv:''};
        if(rcpt){const rc=await uploadReceipt(rcpt);if(rc)data.receipt=rc;}
        let msg='התדלוק נשמר';
        if(o&&data.full&&liters){
          const prev=S.fuel.filter(f=>f.full&&n(f.odo)&&f.odo<o).sort((a,b)=>b.odo-a.odo)[0];
          if(prev){const mid=S.fuel.filter(f=>n(f.odo)&&f.odo>prev.odo&&f.odo<o).reduce((t,f)=>t+(n(f.liters)||0),0);const k=(o-prev.odo)/(mid+liters);if(isFinite(k)&&k>2&&k<40)msg=`נשמר · ${nf1.format(k)} ק״מ לליטר`;}
        }
        await addRec('fuel',data);await bumpOdo(o);closeModal();toast(msg);
      }catch(err){console.error(err);busy(btn,false);status('warn','השמירה נכשלה. בדוק את החיבור ונסה שוב.');}
    };
  });
}

/* ---------- AI quota ---------- */
async function quotaText(kind){
  if(!window.cjAccount)return '';
  try{const q=await window.cjAccount.quota();if(q.unlimited)return '';const k=q[kind];if(!k)return '';
    const left=Math.max(0,k.limit-k.used);
    return kind==='receipt'?`נשארו ${left} מתוך ${k.limit} צילומים החודש`:kind==='chat'?`נשארו ${left} מתוך ${k.limit} שאלות ליועץ החודש`:`נשארו ${left} מתוך ${k.limit} ניתוחים החודש`;
  }catch(e){return '';}
}
function fillAgentQuota(){const el=$('#agQuota');if(!el||!window.cjAccount)return;
  Promise.all(['receipt','chat','analysis'].map(quotaText)).then(t=>{const x=t.filter(Boolean);if($('#agQuota'))$('#agQuota').textContent=x.length?x.join(' · '):'';});}

/* ---------- account (standalone app) ---------- */
async function accountSheet(){
  const A=window.cjAccount;if(!A)return;
  openModal('החשבון שלי',`<div class="stack" style="gap:18px">
    <div class="small muted" dir="ltr" style="text-align:right">${esc(A._email||'')}</div>
    <div class="acct-q" id="acQ"><div class="small muted">טוען את המכסה…</div></div>
    <div class="acct-list">
      <button type="button" data-act="car">${I('edit')}פרטי הרכב</button>
      <button type="button" data-act="cars">${I('car')}הרכבים שלי (${S.cars.length} מתוך ${MAX_CARS})</button>
      <button type="button" id="acPush">${I('bell')}<span id="acPushTxt">התראות לטלפון</span><span class="acct-state" id="acPushState"></span></button>
      <button type="button" data-act="feedback">${I('chat')}משוב ודיווח על תקלה</button>
      <button type="button" id="acExport">${I('doc')}ייצוא כל הנתונים (קובץ גיבוי)</button>
      <button type="button" data-act="restore">${I('undo')}שחזור מגיבוי</button>
      <a href="privacy.html" target="_blank" rel="noopener">${I('shield')}מדיניות פרטיות</a>
      <a href="terms.html" target="_blank" rel="noopener">${I('list')}תנאי שימוש</a>
      <button type="button" id="acOut">${I('send')}התנתקות</button>
      <button type="button" id="acDel" class="danger">${I('trash')}מחיקת החשבון</button>
    </div></div>`,root=>{
    A.quota().then(q=>{const box=root.querySelector('#acQ');if(!box)return;
      if(q.unlimited){box.innerHTML='<div class="small muted">שימוש בסוכנים ללא הגבלה.</div>';return;}
      const L={receipt:'צילומי קבלות',chat:'שאלות ליועץ',analysis:'ניתוחים ותוכניות'};
      box.innerHTML='<div class="eyebrow">שימוש בסוכנים החודש</div>'+Object.keys(L).map(k=>{const x=q[k]||{limit:0,used:0};const pct=x.limit?Math.min(100,x.used/x.limit*100):0;
        return `<div><div class="row"><span>${L[k]}</span><span class="num">${x.used}/${x.limit}</span></div><div class="bar"><i style="width:${pct}%;background:${pct>=100?'var(--crit)':pct>=80?'var(--warn)':'var(--accent)'}"></i></div></div>`;}).join('')+'<div class="small muted">המכסה מתחדשת ב־1 בכל חודש.</div>';
    }).catch(()=>{const b=root.querySelector('#acQ');if(b)b.innerHTML='';});
    root.querySelector('#acExport').onclick=async e=>{busy(e.currentTarget,true,'מכין קובץ…');try{const nRec=await A.exportData();toast(`יוצאו ${nRec} רשומות`);}catch(x){toast('הייצוא נכשל, נסה שוב');}finally{busy(e.currentTarget,false);}};
    root.querySelector('#acOut').onclick=()=>A.signOut();
    if(A.isAdmin)A.isAdmin().then(ok=>{if(!ok)return;const l=root.querySelector('.acct-list');if(l&&!l.querySelector('.adm')){const a=document.createElement('a');a.className='adm';a.href='admin.html';a.innerHTML=I('chart')+'מסך מנהל';l.prepend(a);}});
    setupPushRow(root);
    root.querySelector('#acDel').onclick=()=>deleteAccountSheet();
  });
}
/* ---------- phone notifications ---------- */
async function setupPushRow(root){
  const P=window.cjPush,btn=root.querySelector('#acPush');if(!btn)return;
  if(!P){btn.hidden=true;return;}
  const sup=P.support();
  const paint=on=>{const st=root.querySelector('#acPushState');if(!st)return;st.textContent=sup==='ok'?(on?'פעיל':'כבוי'):sup==='denied'?'חסום':'';st.className='acct-state'+(on?' on':'');};
  let on=sup==='ok'?await P.status():false;paint(on);
  btn.onclick=async()=>{
    if(sup==='need-install'){pushInstallSheet();return;}
    if(sup==='unsupported'){toast('הדפדפן הזה לא תומך בהתראות');return;}
    if(sup==='denied'){toast('ההתראות חסומות. אפשר להפעיל אותן בהגדרות הטלפון');return;}
    busy(btn,true,on?'מכבה…':'מפעיל…');
    try{if(on){await P.disable();on=false;toast('ההתראות כובו');}else{await P.enable();on=true;toast('ההתראות פועלות. שלחנו התראת ניסיון');}}
    catch(e){toast(e&&e.code==='denied'?'לא אישרת התראות. אפשר לשנות בהגדרות הטלפון':'ההפעלה לא הצליחה, נסה שוב');}
    finally{busy(btn,false);paint(on);}
  };
}
function pushInstallSheet(){
  openModal('התקנה במסך הבית',`<p style="margin-top:0">ככה היומן נפתח כמו אפליקציה, בלי שורת כתובת, ויכול לשלוח התראות:</p>
    <ol class="steps-list"><li>לוחצים על כפתור השיתוף <b>⎙</b> בתחתית Safari.</li><li>בוחרים <b>״הוספה למסך הבית״</b>.</li><li>פותחים את היומן מהאייקון החדש, ומפעילים התראות ב״החשבון שלי״.</li></ol>
    <div class="formacts"><button class="btn primary" data-act="close">הבנתי</button></div>`);
}

/* ---------- beta feedback ---------- */
function feedbackSheet(pre){
  if(!window.cjFeedback)return;
  openModal('משוב',`<form id="fb" class="stack" style="gap:14px">
    <p class="small muted" style="margin:0">היומן בגרסת בטא. כל הערה עוזרת: מה לא עבד, מה חסר, מה היה מבלבל.</p>
    <div class="seg" role="radiogroup" aria-label="סוג">
      <label><input type="radio" name="k" value="bug" ${pre==='biz'?'':'checked'}><span>תקלה</span></label>
      <label><input type="radio" name="k" value="idea" ${pre==='biz'?'checked':''}><span>רעיון</span></label>
      <label><input type="radio" name="k" value="other"><span>אחר</span></label>
    </div>
    <div class="field"><label for="fbT">מה תרצה לספר?</label><textarea id="fbT" rows="5" maxlength="3000" required>${pre==='biz'?'מעוניין בחשבון עסקי. כמה רכבים: ':''}</textarea></div>
    <div class="formacts"><button class="btn primary" type="submit">${I('send')}שליחה</button><button class="btn ghost" type="button" data-act="close">ביטול</button></div>
    <p class="small muted" style="margin:0">גרסה ${esc(window.cjVersion||'')}</p></form>`,root=>{
    root.querySelector('#fb').onsubmit=async e=>{e.preventDefault();const t=root.querySelector('#fbT').value.trim();if(!t)return;
      const b=root.querySelector('button[type=submit]');busy(b,true,'שולח…');
      try{await window.cjFeedback(root.querySelector('input[name=k]:checked').value,t);closeModal();toast('תודה! המשוב התקבל');}
      catch(x){busy(b,false);toast(x&&x.code==='limit'?'שלחת הרבה משוב היום, נסה מחר':'השליחה נכשלה, נסה שוב');}};
  });
}

function deleteAccountSheet(){
  openModal('מחיקת החשבון',`<p style="margin-top:0">המחיקה מוחקת לצמיתות את החשבון, את כל הרישומים ואת כל הקבלות. אי אפשר לשחזר אחר כך.</p>
    <p class="small muted">כדאי לייצא קודם את הנתונים מתוך ״החשבון שלי״.</p>
    <div class="field"><label for="delTxt">כדי לאשר, הקלד <b>מחק</b></label><input type="text" id="delTxt" autocomplete="off"></div>
    <div class="formacts"><button class="btn primary" id="delGo" disabled style="background:var(--crit);border-color:var(--crit)">${I('trash')}מחיקה לצמיתות</button><button class="btn ghost" data-act="close">ביטול</button></div>`,root=>{
    const t=root.querySelector('#delTxt'),g=root.querySelector('#delGo');
    t.oninput=()=>{g.disabled=t.value.trim()!=='מחק';};
    g.onclick=async()=>{busy(g,true,'מוחק…');try{await window.cjAccount.deleteAccount();}catch(e){busy(g,false);toast('המחיקה נכשלה. נסה שוב או פנה אלינו.');}};
  });
}
