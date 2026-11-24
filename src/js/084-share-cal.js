/* ---------- link for a buyer (read only, expires), and the calendar subscription ---------- */
const SHARE_PAGE=APP_URL+'share.html';
function newToken(){const a=new Uint8Array(18);crypto.getRandomValues(a);return btoa(String.fromCharCode(...a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function shareSnapshot(o){
  const d=reportData({cost:o.cost,fuel:false}),c=d.c;
  const test=d.rem.find(x=>isTest(x.r)),ins=d.rem.find(x=>isIns(x.r));
  return {v:1,createdAt:today(),car:{name:[c.make,c.model].filter(Boolean).join(' ')||carName(c),year:c.year||null,fuel:c.fuelType||'',plate:o.plate?(c.plate||''):'',color:(c.gov&&c.gov.color)||''},
    odometer:Math.round(odo()),kmpl:d.eff?Math.round(d.eff.avg*10)/10:null,since:d.first||'',kmLogged:d.kmLogged,
    test:test?test.st.dueDate:'',insurance:ins?ins.st.dueDate:'',lastTestGov:(c.gov&&c.gov.lastTest)||'',
    recallsOpen:(Array.isArray(c.recalls)?c.recalls:[]).filter(r=>r.exact).map(r=>r.area||'ריקול'),
    services:d.svc.slice(0,80).map(r=>({date:r.date,odo:n(r.odo),title:r.title||'',garage:r.garage||'',cost:o.cost?n(r.cost):null})),
    checks:d.checks.map(x=>({title:x.title,last:x.last,count:x.count})),
    costs:o.cost?{fuel:Math.round(d.by.fuel),service:Math.round(d.by.service),other:Math.round(d.by.other)}:null,
    fills:d.fuel.length};
}
async function shareSheet(){
  if(!window.cjSB||!S.car||S.car.example){toast('אין עדיין רכב לשתף');return;}
  let list=[];try{const r=await window.cjSB.from('shares').select('token,car_id,created_at,expires_at,revoked,views').eq('car_id',CAR).order('created_at',{ascending:false});list=(r.data||[]).filter(x=>!x.revoked&&new Date(x.expires_at)>new Date());}catch(e){}
  openModal('קישור לקונה',`<div class="stack" style="gap:14px">
    <p class="small muted" style="margin:0">קישור לצפייה בלבד בהיסטוריה של ה${esc(carName(S.car))}: טיפולים, בדיקות, קילומטראז׳ ומועדים. מי שמקבל אותו לא יכול לשנות כלום ולא רואה שום דבר אחר מהחשבון שלך. הקישור מפסיק לעבוד אחרי שבוע, ואפשר לבטל אותו קודם.</p>
    <label class="toggle"><input type="checkbox" id="shPlate" checked> להראות את מספר הרישוי</label>
    <label class="toggle"><input type="checkbox" id="shCost"> להראות עלויות</label>
    <div class="formacts"><button class="btn primary" id="shGo">${I('link')}יצירת קישור</button><button class="btn ghost" data-act="close">סגירה</button></div>
    <div id="shOut"></div>
    ${list.length?`<div><div class="eyebrow" style="margin-bottom:6px">קישורים פעילים</div>${list.map(x=>`<div class="sh-row"><span>נוצר ${fmtD(x.created_at.slice(0,10))} · בתוקף עד ${fmtD(x.expires_at.slice(0,10))} · ${x.views} צפיות</span><button class="btn sm ghost" data-shrev="${esc(x.token)}">ביטול</button></div>`).join('')}</div>`:''}</div>`,root=>{
    root.querySelectorAll('[data-shrev]').forEach(b=>b.onclick=async()=>{b.disabled=true;const r=await window.cjSB.from('shares').update({revoked:true}).eq('token',b.dataset.shrev);if(r.error){b.disabled=false;toast('הביטול נכשל');return;}b.closest('.sh-row').remove();toast('הקישור בוטל');});
    const go=root.querySelector('#shGo');
    go.onclick=async()=>{busy(go,true,'יוצר…');
      try{const token=newToken();const snap=shareSnapshot({plate:root.querySelector('#shPlate').checked,cost:root.querySelector('#shCost').checked});
        const r=await window.cjSB.from('shares').insert({token,car_id:CAR,snapshot:snap,expires_at:new Date(Date.now()+7*864e5).toISOString()});
        if(r.error)throw r.error;busy(go,false);go.hidden=true;
        const url=SHARE_PAGE+'#'+token;
        root.querySelector('#shOut').innerHTML=`<div class="sh-link"><input type="text" readonly value="${esc(url)}" dir="ltr" aria-label="הקישור"><div class="formacts" style="margin:0">${navigator.share?`<button class="btn primary" id="shSend">${I('send')}שליחה</button>`:''}<button class="btn" id="shCopy">העתקה</button><a class="btn ghost" href="${esc(url)}" target="_blank" rel="noopener">תצוגה מקדימה</a></div></div>`;
        const cp=root.querySelector('#shCopy');cp.onclick=async()=>{try{await navigator.clipboard.writeText(url);toast('הקישור הועתק');}catch(e){root.querySelector('.sh-link input').select();}};
        const sd=root.querySelector('#shSend');if(sd)sd.onclick=()=>navigator.share({title:'היסטוריית הרכב',text:`ההיסטוריה של ה${carName(S.car)} מיומן הרכב`,url}).catch(()=>{});
      }catch(e){console.error(e);busy(go,false);toast('לא הצלחתי ליצור קישור');}};
  });
}

/* calendar: one link, the calendar app keeps it up to date */
async function calSheet(renew){
  if(!window.cjSB){toast('צריך חיבור לאינטרנט');return;}
  let token='';try{const r=await window.cjSB.rpc('my_cal_token',{p_new:!!renew});if(r.error)throw r.error;token=r.data;}catch(e){toast('לא הצלחתי ליצור קישור ליומן');return;}
  const url=`${(window.CJ_CONFIG||{}).url}/functions/v1/cal?t=${token}`,webcal=url.replace(/^https:/,'webcal:');
  const google=`https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`;
  openModal('יומן גוגל',`<div class="stack" style="gap:14px">
    <p style="margin:0">מוסיפים פעם אחת, ומאז הטסט, הביטוח, הטיפולים והמועדים של הדוחות מופיעים ביומן שלך <b>ומתעדכנים לבד</b> כשמשהו משתנה באפליקציה.</p>
    <a class="btn primary block" href="${esc(google)}" target="_blank" rel="noopener">${I('cal')}הוספה ליומן גוגל</a>
    <a class="btn block" href="${esc(webcal)}">${I('cal')}הוספה ליומן של אייפון</a>
    <details class="im-map"><summary>אם זה לא נפתח</summary><ol class="hlp" style="margin-top:10px"><li>בגוגל קלנדר במחשב: ״יומנים נוספים״ ← ״+״ ← ״מכתובת URL״.</li><li>מדביקים את הקישור הזה ולוחצים ״הוספת יומן״:</li></ol>
      <div class="sh-link"><input type="text" readonly value="${esc(url)}" dir="ltr" aria-label="קישור היומן"><button class="btn sm" id="calCopy">העתקה</button></div></details>
    <p class="small muted" style="margin:0">גוגל מעדכן יומנים כאלה כמה פעמים ביום, אז שינוי באפליקציה יופיע שם תוך כמה שעות. הקישור אישי: מי שיש לו אותו רואה את המועדים (בלי מספרי רישוי). אם שלחת אותו בטעות, <button class="linkbtn" id="calNew">צור קישור חדש</button> והישן יפסיק לעבוד.</p></div>`,root=>{
    root.querySelector('#calCopy').onclick=async()=>{try{await navigator.clipboard.writeText(url);toast('הקישור הועתק');}catch(e){root.querySelector('.sh-link input').select();}};
    root.querySelector('#calNew').onclick=()=>{closeModal();calSheet(true).then(()=>toast('נוצר קישור חדש. צריך להוסיף אותו שוב ליומן.'));};
  });
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="share"],[data-act="calendar"]');if(!b)return;if(b.dataset.act==='share')shareSheet();else calSheet();});
