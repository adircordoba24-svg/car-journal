/* ---------- car history report (PDF): every service, check and fill-up, for the garage or for a buyer ---------- */
const pdfLibs=()=>Promise.all([loadLib('vendor/html2canvas.min.js','html2canvas'),loadLib('vendor/jspdf.umd.min.js','jspdf')]);
function reportSheet(){
  if(!S.car||S.car.example){toast('אין עדיין רכב לדוח');return;}
  openModal('דוח היסטוריה לרכב',`<div class="stack" style="gap:14px">
    <p class="small muted" style="margin:0">קובץ PDF עם כל ההיסטוריה של ה${esc(carName(S.car))}: טיפולים, בדיקות שוטפות, תדלוקים ומועדים. מתאים למוסך, לליסינג או לקונה כשמוכרים את הרכב.</p>
    <label class="toggle"><input type="checkbox" id="rpCost" checked> לכלול עלויות</label>
    <label class="toggle"><input type="checkbox" id="rpFuel" checked> לכלול תדלוקים</label>
    <div class="formacts"><button class="btn primary" id="rpGo">${I('download')}הורדת PDF</button><button class="btn ghost" data-act="close">ביטול</button></div>
    <div class="small muted" id="rpSt" role="status"></div></div>`,root=>{
    const b=root.querySelector('#rpGo');
    b.onclick=async()=>{busy(b,true,'מכין את הדוח…');const st=root.querySelector('#rpSt');
      try{const ok=await buildReport({cost:root.querySelector('#rpCost').checked,fuel:root.querySelector('#rpFuel').checked},m=>{if(root.contains(st))st.textContent=m;});
        if(root.contains(b)){closeModal();toast(ok?'הדוח ירד לטלפון':'ההורדה לא הצליחה');}}
      catch(e){console.error(e);if(root.contains(b)){busy(b,false);st.textContent='לא הצלחתי ליצור את הדוח. נסה שוב.';}}};
  });
}
function reportData(o){
  const c=S.car,sp=allSpend();
  const svc=[...S.service].filter(r=>r.date).sort((a,b)=>b.date.localeCompare(a.date));
  const fuel=[...S.fuel].filter(r=>r.date).sort((a,b)=>b.date.localeCompare(a.date));
  const pts=[...S.fuel,...S.service].map(r=>n(r.odo)).filter(Boolean);
  const eff=effStats();
  const rem=sortedReminders(r=>r.carId!=='*');
  const checks=S.reminder.filter(r=>r.kind==='check').map(r=>{const h=Array.isArray(r.history)?r.history:[];return {title:r.title,count:h.length,last:h.length?h[h.length-1].date:'',every:n(r.intervalDays)?daysLabel(r.intervalDays):''};});
  const by={fuel:0,service:0,other:0};for(const r of sp){const k=r.cat==='fuel'?'fuel':r.cat==='service'?'service':'other';by[k]+=r.amount;}
  return {c,svc,fuel,eff,rem,checks,by,total:by.fuel+by.service+by.other,first:sp.length?sp[sp.length-1].date:'',kmLogged:pts.length>1?Math.max(...pts)-Math.min(...pts):0,o};
}
function reportBlocks(d){
  const o=d.o,c=d.c,blocks=[];
  const due=x=>x?`${fmtD(x.st.dueDate)} <span class="rp-s ${x.st.status}">${esc(x.st.label)}</span>`:'—';
  const test=d.rem.find(x=>isTest(x.r)),ins=d.rem.find(x=>isIns(x.r)),nxt=d.rem.find(x=>x.r.kind==='service');
  blocks.push({h:`<div class="rp-head"><img src="icons/emblem.png" alt=""><div><div class="rp-k">דוח היסטוריית רכב</div><h1>${esc([c.make,c.model].filter(Boolean).join(' ')||carName(c))}</h1>
    <div class="rp-m">${esc([c.year,c.fuelType?'דלק '+c.fuelType:'',c.nickname].filter(Boolean).join(' · '))}</div></div>${c.plate?`<div class="rp-plate"><span>IL</span>${esc(c.plate)}</div>`:''}</div>
    <div class="rp-tiles"><div><span>קילומטראז׳</span><b>${km(odo())}</b></div><div><span>טיפולים שתועדו</span><b>${d.svc.length}</b></div><div><span>ק״מ לליטר</span><b>${d.eff?nf1.format(d.eff.avg):'—'}</b></div>${o.cost?`<div><span>סה״כ הוצאות</span><b>${ils(d.total)}</b></div>`:`<div><span>תדלוקים</span><b>${d.fuel.length}</b></div>`}</div>
    <div class="rp-meta">הופק ב־${fmtD(today())} · מתועד מאז ${d.first?fmtD(d.first):'—'}${d.kmLogged?` · ${km(d.kmLogged)} ק״מ מתועדים`:''}</div>`});
  blocks.push({h:`<h2>מצב נוכחי</h2><table class="rp-t"><tbody><tr><th>טסט</th><td>${due(test)}</td></tr><tr><th>ביטוח</th><td>${due(ins)}</td></tr><tr><th>טיפול הבא</th><td>${nxt?esc(nxt.r.title)+' · '+due(nxt):'—'}</td></tr></tbody></table>`});
  if(o.cost)blocks.push({h:`<h2>הוצאות לפי סוג</h2><table class="rp-t"><tbody><tr><th>דלק</th><td>${ils(d.by.fuel)}</td></tr><tr><th>טיפולים ותיקונים</th><td>${ils(d.by.service)}</td></tr><tr><th>אחר (ביטוח, טסט, צמיגים, חניה…)</th><td>${ils(d.by.other)}</td></tr><tr class="rp-sum"><th>סה״כ</th><td>${ils(d.total)}</td></tr></tbody></table>`});
  blocks.push({title:'היסטוריית טיפולים',head:['תאריך','ק״מ','מה נעשה','מוסך',...(o.cost?['עלות']:[])],rows:d.svc.map(r=>[fmtD(r.date),n(r.odo)?km(r.odo):'—',esc(r.title||'')+(r.note?`<div class="rp-n">${esc(r.note)}</div>`:''),esc(r.garage||''),...(o.cost?[n(r.cost)?ils(r.cost):'—']:[])]),empty:'עוד לא תועדו טיפולים'});
  if(d.checks.length)blocks.push({title:'בדיקות שוטפות',head:['בדיקה','כל','בוצעה לאחרונה','פעמים'],rows:d.checks.map(x=>[esc(x.title),x.every||'—',x.last?fmtD(x.last):'—',String(x.count)])});
  if(o.fuel)blocks.push({title:'תדלוקים',head:['תאריך','ק״מ','ליטרים',...(o.cost?['סכום']:[]),'תחנה'],rows:d.fuel.map(r=>[fmtD(r.date),n(r.odo)?km(r.odo):'—',n(r.liters)?nf1.format(r.liters):'—',...(o.cost?[ils(r.total)]:[]),esc(r.station||'')]),empty:'אין תדלוקים'});
  return blocks;
}
async function buildReport(o,say){
  say&&say('טוען…');
  await pdfLibs();
  const d=reportData(o),blocks=reportBlocks(d);
  const host=document.createElement('div');host.className='rp-host';document.body.appendChild(host);
  const W=794,H=1123,FOOT=46;const pages=[];
  const newPage=()=>{const p=document.createElement('div');p.className='rp-page';p.innerHTML='<div class="rp-body"></div>';host.appendChild(p);pages.push(p);return p.firstChild;};
  let body=newPage();const fits=()=>body.scrollHeight<=H-FOOT-48;
  for(const b of blocks){
    if(b.h){const x=document.createElement('div');x.className='rp-block';x.innerHTML=b.h;body.appendChild(x);if(!fits()){body.removeChild(x);body=newPage();body.appendChild(x);}continue;}
    const mk=()=>{const x=document.createElement('div');x.className='rp-block';x.innerHTML=`<h2>${b.title}</h2><table class="rp-t rp-list"><thead><tr>${b.head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody></tbody></table>`;body.appendChild(x);return x.querySelector('tbody');};
    let tb=mk();if(!fits()){tb.closest('.rp-block').remove();body=newPage();tb=mk();}
    if(!b.rows.length){tb.innerHTML=`<tr><td colspan="${b.head.length}" class="rp-empty">${b.empty||'—'}</td></tr>`;continue;}
    for(const r of b.rows){const tr=document.createElement('tr');tr.innerHTML=r.map(c=>`<td>${c}</td>`).join('');tb.appendChild(tr);
      if(!fits()){tb.removeChild(tr);body=newPage();tb=mk();tb.closest('.rp-block').querySelector('h2').textContent=b.title+' (המשך)';tb.appendChild(tr);}}
  }
  pages.forEach((p,i)=>{const f=document.createElement('div');f.className='rp-foot';f.innerHTML=`<span>יומן הרכב · ${esc(carName(d.c))}${d.c.plate?' · '+esc(d.c.plate):''}</span><span>עמוד ${i+1} מתוך ${pages.length}</span>`;p.appendChild(f);});
  try{await document.fonts.ready;}catch(e){}
  const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:'p',unit:'pt',format:'a4',compress:true});
  for(let i=0;i<pages.length;i++){say&&say(`מכין עמוד ${i+1} מתוך ${pages.length}…`);
    const cv=await window.html2canvas(pages[i],{scale:2,backgroundColor:'#ffffff',width:W,height:H,windowWidth:W,logging:false,useCORS:true});
    if(i)pdf.addPage();pdf.addImage(cv.toDataURL('image/jpeg',0.9),'JPEG',0,0,595.28,841.89);}
  host.remove();
  pdf.setProperties({title:'דוח היסטוריית רכב',creator:'יומן הרכב'});
  const name=`car-history-${(d.c.plate||carName(d.c)).replace(/[^\w֐-׿-]+/g,'-')}-${today()}.pdf`;
  return saveBlob(pdf.output('blob'),name);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="report"]');if(b)reportSheet();});
