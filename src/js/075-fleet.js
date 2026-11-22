/* ---------- business accounts: fleet dashboard, Excel import and export ---------- */
let FLEET_VIEW=true;try{FLEET_VIEW=localStorage.getItem('cj-fleet')!=='0';}catch(e){}
let fleetSort='urgent',fleetAll=false;
const isBiz=()=>PLAN==='business'&&S.cars.length>0&&!(S.car&&S.car.example);
function setFleetView(on){FLEET_VIEW=on;try{localStorage.setItem('cj-fleet',on?'1':'0');}catch(e){}}
// run fn while the app is looking at one car, then switch back
function withCar(id,fn){const keep=CAR;CAR=id;applyCar();try{return fn();}finally{CAR=keep;applyCar();}}
const isTest=r=>r.docKey==='test'||/טסט/.test(r.title||'');
const isIns=r=>String(r.docKey||'').startsWith('ins')||/ביטוח/.test(r.title||'');
function carStats(c){
  return withCar(c.id,()=>{
    const rem=sortedReminders(r=>r.carId!=='*'&&r.kind!=='check');
    const sp=allSpend(),m=monthKey(today()),y=today().slice(0,4);
    const sum=f=>sp.filter(f).reduce((s,r)=>s+r.amount,0);
    const eff=effStats();
    return {c,odo:odo(),rem,att:rem.filter(x=>x.st.status!=='ok'),
      test:rem.find(x=>isTest(x.r)),ins:rem.find(x=>isIns(x.r)),svc:rem.find(x=>x.r.kind==='service'),
      month:sum(r=>monthKey(r.date)===m),year:sum(r=>r.date.slice(0,4)===y),fuelMonth:sum(r=>r.cat==='fuel'&&monthKey(r.date)===m),
      kmpl:eff?eff.avg:null};
  });
}
const urgScore=s=>s.att.length?Math.min(...s.att.map(x=>RANK[x.st.status]))*1000-s.att.length:2000;
function fleetStats(){return S.cars.map(carStats);}
function dueCell(x){
  if(!x)return '<span class="muted">—</span>';
  const d=x.st.dueDate;
  return `<span class="fl-due" data-s="${x.st.status}">${d?fmtD(d):'—'}</span>`;
}
function fleetToggle(){
  if(!isBiz())return '';
  return `<div class="seg-tabs agtabs" role="tablist" aria-label="תצוגה">
    <button type="button" role="tab" class="${FLEET_VIEW?'on':''}" aria-selected="${FLEET_VIEW}" data-act="flView" data-id="1">${I('grid')}כל הצי</button>
    <button type="button" role="tab" class="${FLEET_VIEW?'':'on'}" aria-selected="${!FLEET_VIEW}" data-act="flView" data-id="0">${I('car')}${esc(carName(S.car))}</button></div>`;
}
function vFleet(){
  const st=fleetStats(),t=today();
  const items=st.flatMap(s=>s.att.map(x=>({s,x}))).sort((a,b)=>RANK[a.x.st.status]-RANK[b.x.st.status]||b.x.st.pct-a.x.st.pct);
  const carsAtt=st.filter(s=>s.att.length).length;
  const mTotal=st.reduce((a,s)=>a+s.month,0),yTotal=st.reduce((a,s)=>a+s.year,0);
  const in30=st.flatMap(s=>[s.test,s.ins].filter(Boolean)).filter(x=>x.st.daysLeft!==null&&x.st.daysLeft<=30).length;
  const sorters={urgent:(a,b)=>urgScore(a)-urgScore(b),name:(a,b)=>carName(a.c).localeCompare(carName(b.c),'he'),
    odo:(a,b)=>b.odo-a.odo,test:(a,b)=>(a.test?.st.dueDate||'9')<(b.test?.st.dueDate||'9')?-1:1,
    ins:(a,b)=>(a.ins?.st.dueDate||'9')<(b.ins?.st.dueDate||'9')?-1:1,month:(a,b)=>b.month-a.month,year:(a,b)=>b.year-a.year};
  const rows=[...st].sort(sorters[fleetSort]||sorters.urgent);
  const shown=fleetAll?items:items.slice(0,6);
  const th=(k,l)=>`<th><button type="button" class="fl-sort ${fleetSort===k?'on':''}" data-act="flSort" data-id="${k}">${l}</button></th>`;
  const maxY=Math.max(1,...st.map(s=>s.year));
  const mName=pd(t.slice(0,7)+'-15').toLocaleDateString('he-IL',{month:'long'});
  return `${fleetToggle()}
  <section class="kpis fl-kpis">
    <div class="card kpi"><div class="eyebrow">רכבים בצי</div><div class="v">${st.length}<small>מתוך ${MAX_CARS}</small></div><div class="d">${km(st.reduce((a,s)=>a+s.odo,0))} ק״מ ביחד</div></div>
    <div class="card kpi" data-s="${carsAtt?'soon':'ok'}"><div class="eyebrow">דורשים טיפול</div><div class="v">${carsAtt}<small>רכבים</small></div><div class="d">${items.length?items.length+' פריטים פתוחים':'הכול תקין'}</div></div>
    <div class="card kpi"><div class="eyebrow">עלות הצי ב${esc(mName)}</div><div class="v">${ils(mTotal)}</div><div class="d">${ils(yTotal)} מתחילת השנה</div></div>
    <div class="card kpi" data-s="${in30?'soon':'ok'}"><div class="eyebrow">טסט וביטוח</div><div class="v">${in30}<small>ב־30 יום</small></div><div class="d">כולל מה שכבר פג</div></div>
  </section>
  <section class="card fl-att"><div class="card-head"><h2>דורש טיפול</h2>${items.length>6?`<button class="link" data-act="flMore">${fleetAll?'פחות':'כל '+items.length}</button>`:''}</div>
    <div class="rlist">${shown.map(({s,x})=>`<button type="button" class="fl-item" data-act="flCar" data-id="${esc(s.c.id)}" data-go="reminder" data-s="${x.st.status}">
      <span class="ricon">${I(iconFor(x.r.title,x.r.kind))}</span>
      <span class="fl-item-t"><b>${esc(carName(s.c))}</b><span>${esc(x.r.title)}${s.c.plate?` · <span class="fl-plate">${esc(s.c.plate)}</span>`:''}</span></span>
      <span class="pill ${x.st.status}">${esc(x.st.label)}</span></button>`).join('')||'<div class="empty"><b>הכול תקין</b>אין טיפולים, טסטים או ביטוחים שמגיעים בקרוב</div>'}</div></section>
  <section class="card"><div class="card-head"><h2>הצי</h2><div class="fl-acts">
      <label class="fl-sortsel"><span class="sr">מיון</span><select data-act="flSortSel" aria-label="מיון">${[['urgent','לפי דחיפות'],['name','לפי שם'],['odo','לפי ק״מ'],['test','לפי טסט'],['ins','לפי ביטוח'],['month','לפי עלות החודש'],['year','לפי עלות השנה']].map(([k,l])=>`<option value="${k}" ${fleetSort===k?'selected':''}>${l}</option>`).join('')}</select></label>
      <button class="btn sm" data-act="flExport">${I('download')}ייצוא לאקסל</button></div></div>
    <div class="tablewrap"><table class="ledger fl-table"><thead><tr>${th('name','רכב')}${th('odo','ק״מ')}${th('test','טסט')}${th('ins','ביטוח')}<th>טיפול הבא</th>${th('month','החודש')}${th('year','השנה')}</tr></thead><tbody>
    ${rows.map(s=>`<tr data-act="flCar" data-id="${esc(s.c.id)}" tabindex="0">
      <td class="wrap"><span class="fl-car"><b>${esc(carName(s.c))}</b><span>${s.c.plate?`<span class="fl-plate">${esc(s.c.plate)}</span>`:''}${s.c.plate&&s.c.driver?' · ':''}${esc(s.c.driver||'')}</span></span>${s.att.length?`<span class="pill ${s.att[0].st.status}">${s.att.length}</span>`:''}</td>
      <td class="n" data-label="ק״מ">${km(s.odo)}</td>
      <td data-label="טסט">${dueCell(s.test)}</td>
      <td data-label="ביטוח">${dueCell(s.ins)}</td>
      <td data-label="טיפול הבא">${s.svc?`<span class="fl-due" data-s="${s.svc.st.status}">${esc(s.svc.st.label)}</span>`:'<span class="muted">—</span>'}</td>
      <td class="n" data-label="החודש">${ils(s.month)}</td>
      <td class="n" data-label="השנה">${ils(s.year)}</td></tr>`).join('')}
    </tbody></table></div></section>
  <section class="card"><div class="card-head"><h2>עלות מתחילת השנה לפי רכב</h2><span class="small muted">${ils(yTotal)} ביחד</span></div>
    <div class="fl-bars">${[...st].sort((a,b)=>b.year-a.year).slice(0,10).map(s=>`<button type="button" class="fl-bar" data-act="flCar" data-id="${esc(s.c.id)}" data-go="expense"><span class="fl-bar-l">${esc(carName(s.c))}</span><span class="fl-bar-t"><i style="width:${Math.max(2,Math.round(s.year/maxY*100))}%"></i></span><span class="fl-bar-v">${ils(s.year)}</span></button>`).join('')}</div>
    ${st.length>1&&yTotal>0?`<p class="small muted" style="margin:12px 0 0">ממוצע לרכב: ${ils(yTotal/st.length)} מתחילת השנה.</p>`:''}</section>
  <section class="fl-foot">
    ${S.cars.length<MAX_CARS?`<button class="btn" data-act="flAdd">${I('plus')}הוספת רכב בצילום רישיון</button><button class="btn" data-act="flImport">${I('upload')}ייבוא רכבים מאקסל</button>`:`<p class="small muted">הצי מלא: ${S.cars.length} מתוך ${MAX_CARS} רכבים. כדי להוסיף עוד, פנה אלינו דרך המשוב.</p>`}
  </section>`;
}
function openFleetCar(id,goTo){
  setFleetView(false);
  if(id!==CAR){CAR=id;try{localStorage.setItem('cj-car',id);}catch(e){}chatLog.length=0;applyCar();toast('עברת ל'+carName(S.car));}
  if(goTo&&goTo!==view)go(goTo);else render();
}
function newCarId(taken){let i=2,id='car';const has=x=>S.cars.some(c=>c.id===x)||(taken&&taken.has(x));if(!has(id))return id;while(has('car'+i))i++;return 'car'+i;}

/* ----- download helper ----- */
function saveBlob(blob,name){
  try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},4000);return true;}catch(e){return false;}
}
const libP={};
function loadLib(src,global){
  if(window[global])return Promise.resolve(window[global]);
  return libP[src]||(libP[src]=new Promise((res,rej)=>{const sc=document.createElement('script');sc.src=src;sc.onload=()=>window[global]?res(window[global]):rej(new Error('lib'));sc.onerror=()=>{delete libP[src];rej(new Error('lib'));};document.head.appendChild(sc);}));
}
const xlsxWriter=()=>loadLib('vendor/write-excel-file.min.js','writeXlsxFile');
const xlsxReader=()=>loadLib('vendor/read-excel-file.min.js','readXlsxFile');
async function writeXlsx(sheets,name){
  const w=await xlsxWriter();
  const r=w(sheets.map(s=>Object.assign({rightToLeft:true,stickyRowsCount:1},s)));
  const blob=r&&r.toBlob?await r.toBlob():r;
  return saveBlob(blob,name);
}
const H=v=>({value:v,fontWeight:'bold',backgroundColor:'#EFE6D6'});
const dateOrNull=s=>s&&/^\d{4}-\d\d-\d\d$/.test(s)?pd(s):null;
async function fleetExport(btn){
  busy(btn,true,'מכין קובץ…');
  try{
    const st=fleetStats();const y=today().slice(0,4);
    const fleet=[['רכב','מספר רישוי','יצרן','דגם','שנה','נהג','ק״מ','טסט','ביטוח','טיפול הבא','דורש טיפול','עלות החודש','מתחילת השנה','דלק החודש','ק״מ לליטר'].map(H),
      ...st.map(s=>[carName(s.c),s.c.plate||'',s.c.make||'',s.c.model||'',n(s.c.year),s.c.driver||'',Math.round(s.odo)||null,
        dateOrNull(s.test&&s.test.st.dueDate),dateOrNull(s.ins&&s.ins.st.dueDate),s.svc?s.svc.st.label:'',s.att.map(x=>x.r.title+' ('+x.st.label+')').join(', '),
        Math.round(s.month),Math.round(s.year),Math.round(s.fuelMonth),s.kmpl?Math.round(s.kmpl*10)/10:null].map(v=>v instanceof Date?{value:v,type:Date,format:'dd/mm/yyyy'}:v))];
    const exp=[['תאריך','רכב','מספר רישוי','קטגוריה','פירוט','סכום'].map(H)];
    for(const s of st)withCar(s.c.id,()=>{for(const r of allSpend())if(r.date.slice(0,4)===y)exp.push([{value:pd(r.date),type:Date,format:'dd/mm/yyyy'},carName(s.c),s.c.plate||'',CATS[r.cat]||r.cat,r.title||'',Math.round(r.amount*100)/100]);});
    const w=c=>c.map(x=>({width:x}));
    const ok=await writeXlsx([{sheet:'הצי',data:fleet,columns:w([18,13,12,12,7,14,10,12,12,16,34,12,13,12,10])},{sheet:'הוצאות '+y,data:exp,columns:w([12,18,13,16,30,11])}],'fleet-'+today()+'.xlsx');
    toast(ok?'הקובץ ירד לטלפון':'ההורדה לא הצליחה');
  }catch(e){console.error(e);toast('לא הצלחתי ליצור את הקובץ');}
  busy(btn,false);
}

/* ----- import ----- */
const IMP_FIELDS=[
  ['plate','מספר רישוי',/מ(ס|ספר)['׳"]?\s*(רישוי|רכב|לוחית)|לוחית|^רישוי$|plate|reg(istration)?\s*(no|number)?$/i],
  ['make','יצרן',/יצרן|תוצרת|^מותג|^(סוג\s*)?רכב$|make|brand|manufacturer|^vehicle$/i],
  ['model','דגם',/דגם|model/i],
  ['year','שנה',/שנ(ת|ה)\s*(ייצור|יצור|עלייה)?|שנתון|^year/i],
  ['fuel','דלק',/דלק|הנעה|סוג\s*מנוע|fuel/i],
  ['odo','קילומטראז׳',/ק["״']?מ|קילומטר|מד\s*אוץ|odometer|mileage|^km/i],
  ['ins','ביטוח עד',/ביטוח|insurance/i],
  ['test','טסט עד',/טסט|תוקף\s*(רישיון|רשיון|רישוי)?|רישיון\s*רכב\s*עד|test|mot|expir/i],
  ['svc','טיפול אחרון',/טיפול|service/i],
  ['driver','נהג',/נהג|אחראי|משתמש|עובד|driver|assigned/i],
  ['nick','כינוי',/כינוי|nickname|שם\s*רכב/i],
];
function guessMap(head){
  const map={};const used=new Set();
  // most specific fields first: a "רישוי עד" column is the test, not the plate
  for(const k of ['ins','test','svc','odo','plate','make','model','year','fuel','driver','nick']){
    const re=IMP_FIELDS.find(f=>f[0]===k)[2];
    const i=head.findIndex((h,j)=>!used.has(j)&&re.test(String(h||'').trim()));
    if(i>=0){map[k]=i;used.add(i);}
  }
  return map;
}
function findHeader(rows){
  let best={row:0,score:-1,map:{}};
  for(let r=0;r<Math.min(rows.length,12);r++){const m=guessMap(rows[r]||[]);const sc=Object.keys(m).length;if(sc>best.score)best={row:r,score:sc,map:m};}
  return best;
}
function parseCSV(text){
  text=text.replace(/^﻿/,'');
  const first=text.split(/\r?\n/)[0]||'';
  const d=[',',';','\t'].sort((a,b)=>first.split(b).length-first.split(a).length)[0];
  const rows=[];let row=[],cell='',q=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else q=false;}else cell+=ch;continue;}
    if(ch==='"')q=true;else if(ch===d){row.push(cell);cell='';}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=ch;}
  if(cell||row.length){row.push(cell);rows.push(row);}
  return rows.filter(r=>r.some(c=>String(c).trim()));
}
async function readTable(file){
  const name=(file.name||'').toLowerCase();
  if(/\.xls$/.test(name))throw new Error('xls');
  if(/\.(csv|txt|tsv)$/.test(name)||/text\//.test(file.type||'')){
    const buf=await file.arrayBuffer();let txt=new TextDecoder('utf-8').decode(buf);
    if(txt.includes('�'))try{txt=new TextDecoder('windows-1255').decode(buf);}catch(e){}
    return parseCSV(txt);
  }
  const read=await xlsxReader();const out=await read(file);
  const sheets=Array.isArray(out)&&out.length&&out[0]&&out[0].data?out.map(s=>s.data):[out];
  return sheets.sort((a,b)=>b.length-a.length)[0]||[];
}
function toDate(v){
  if(v==null||v==='')return '';
  if(v instanceof Date)return isNaN(v)?'':new Date(v.getTime()+12*36e5).toISOString().slice(0,10); // midnight UTC or local, either way the right day
  if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Date.UTC(1899,11,30)+v*864e5);return d.toISOString().slice(0,10);}
  const s=String(v).trim();let m;
  if((m=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)))return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  if((m=s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/))){let y=+m[3];if(y<100)y+=2000;return `${y}-${pad(+m[2])}-${pad(+m[1])}`;}
  if((m=s.match(/^(\d{1,2})[-/.](\d{4})$/)))return `${m[2]}-${pad(+m[1])}-01`;
  return '';
}
function normPlate(v){
  const d=String(v==null?'':v).replace(/\D/g,'');
  if(d.length===7)return `${d.slice(0,2)}-${d.slice(2,5)}-${d.slice(5)}`;
  if(d.length===8)return `${d.slice(0,3)}-${d.slice(3,5)}-${d.slice(5)}`;
  return String(v==null?'':v).trim();
}
const plateKey=v=>String(v||'').replace(/\D/g,'');
function normFuelType(v){const f=String(v||'');return /דיזל|סולר|diesel/i.test(f)?'סולר':/פלאג|plug/i.test(f)?'פלאג־אין':/היבריד|hybrid/i.test(f)?'היברידי':/חשמל|electric|ev\b/i.test(f)?'חשמלי':/98/.test(f)?'98':f?'95':'';}
function rowsToCars(rows,hdr,map){
  const taken=new Set(S.cars.map(c=>plateKey(c.plate)).filter(Boolean));const seen=new Set();
  const cell=(r,k)=>map[k]!=null&&map[k]>=0?r[map[k]]:'';
  return rows.slice(hdr+1).map((r,i)=>{
    let make=String(cell(r,'make')||'').trim(),model=String(cell(r,'model')||'').trim();
    if(make&&!model&&map.model==null&&make.includes(' ')){const p=make.split(/\s+/);make=p.shift();model=p.join(' ');}
    const c={line:hdr+i+2,plate:normPlate(cell(r,'plate')),make,model,year:n(cell(r,'year')),fuelType:normFuelType(cell(r,'fuel')),odometer:n(cell(r,'odo')),
      test:toDate(cell(r,'test')),ins:toDate(cell(r,'ins')),svc:toDate(cell(r,'svc')),driver:String(cell(r,'driver')||'').trim(),nickname:String(cell(r,'nick')||'').trim()};
    if(c.year&&(c.year<1950||c.year>2100))c.year=null;
    const k=plateKey(c.plate);
    c.status=!c.make&&!c.plate?'skip':k&&taken.has(k)?'exists':k&&seen.has(k)?'dup':'new';
    if(k)seen.add(k);return c;
  }).filter(c=>c.status!=='skip'||c.make||c.model);
}
async function aiMap(rows){
  if(!sample)return null;
  const head=rows.slice(0,8).map(r=>r.map(v=>v instanceof Date?dstr(v):String(v==null?'':v).slice(0,40)));
  const r=await sample.json(`אלה השורות הראשונות של טבלה עם רשימת רכבים של עסק בישראל (JSON, כל שורה מערך של תאים):
${JSON.stringify(head)}
מצא איזו שורה היא שורת הכותרות, ואיזו עמודה (אינדקס מ־0) מתאימה לכל שדה. החזר JSON בלבד:
{"headerRow":number,"columns":{"plate":number|null,"make":number|null,"model":number|null,"year":number|null,"fuel":number|null,"odo":number|null,"test":number|null,"ins":number|null,"svc":number|null,"driver":number|null,"nick":number|null}}
plate = מספר רישוי. test = תאריך תוקף רישיון הרכב / טסט. ins = תאריך סיום ביטוח. svc = תאריך הטיפול האחרון. odo = קילומטראז׳. driver = שם הנהג. אם אין שורת כותרות, headerRow = -1.`,{maxTokens:400});
  if(!r||!r.columns)return null;
  const map={};for(const [k,v] of Object.entries(r.columns))if(typeof v==='number'&&v>=0)map[k]=v;
  return {row:typeof r.headerRow==='number'?r.headerRow:0,map};
}
function importSheet(){
  if(S.cars.length>=MAX_CARS){toast(`החשבון כולל עד ${MAX_CARS} רכבים`);return;}
  openModal('ייבוא רכבים מאקסל',`<div class="stack" style="gap:14px">
    <p class="small muted" style="margin:0">מעלים קובץ Excel או CSV עם רשימת הרכבים, שורה לכל רכב. היומן מזהה לבד את העמודות: מספר רישוי, יצרן, דגם, שנה, דלק, קילומטראז׳, טסט, ביטוח, טיפול אחרון ונהג.</p>
    <div class="drop" id="imBox"><input type="file" id="imF" accept=".xlsx,.csv,.tsv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"><span id="imTxt">${I('upload')} בחירת קובץ Excel או CSV</span></div>
    <button type="button" class="linkbtn" id="imTpl" style="align-self:flex-start">${I('download')}הורדת קובץ לדוגמה, למילוי</button>
    <div id="imOut" aria-live="polite"></div></div>`,root=>{
    const out=root.querySelector('#imOut');let rows=null,hdr=0,map={};
    root.querySelector('#imTpl').onclick=async()=>{try{await writeXlsx([{sheet:'רכבים',columns:[16,12,12,8,10,12,12,12,12,14].map(x=>({width:x})),data:[
      ['מספר רישוי','יצרן','דגם','שנה','דלק','ק״מ','טסט עד','ביטוח עד','טיפול אחרון','נהג'].map(H),
      ['12-345-67','טויוטה','קורולה',2022,'בנזין',45000,{value:pd(addDays(today(),120)),type:Date,format:'dd/mm/yyyy'},{value:pd(addDays(today(),200)),type:Date,format:'dd/mm/yyyy'},{value:pd(addDays(today(),-90)),type:Date,format:'dd/mm/yyyy'},'ישראל ישראלי']]}],'fleet-template.xlsx');toast('הקובץ ירד לטלפון');}catch(e){toast('ההורדה לא הצליחה');}};
    const draw=()=>{
      if(!root.contains(out))return;
      const cars=rowsToCars(rows,hdr,map);const fresh=cars.filter(c=>c.status==='new');
      const room=Math.max(0,MAX_CARS-S.cars.length);const take=fresh.slice(0,room);
      const head=hdr>=0?(rows[hdr]||[]):(rows[0]||[]).map(()=>'');
      const opts=k=>`<option value="-1">—</option>`+head.map((h,i)=>`<option value="${i}" ${map[k]===i?'selected':''}>${esc(String(h==null||h===''?'עמודה '+(i+1):h).slice(0,30))}</option>`).join('');
      const lab={new:'',exists:'כבר ביומן',dup:'כפול בקובץ',skip:'חסר יצרן'};
      out.innerHTML=`<div class="im-sum"><b>נמצאו ${cars.length} רכבים</b>${fresh.length>take.length?`<span class="pill soon">ייכנסו ${take.length}, החשבון כולל עד ${MAX_CARS}</span>`:''}${cars.length>fresh.length?`<span class="pill neutral">${cars.length-fresh.length} יידלגו</span>`:''}</div>
        <details class="im-map" ${!map.make&&map.make!==0||map.plate==null?'open':''}><summary>התאמת עמודות</summary><div class="fgrid">${IMP_FIELDS.map(([k,l])=>`<div class="field"><label for="imM-${k}">${l}</label><select id="imM-${k}" data-k="${k}">${opts(k)}</select></div>`).join('')}</div></details>
        <div class="im-list">${cars.slice(0,40).map(c=>`<div class="im-row" data-s="${c.status}"><span class="im-car"><b>${esc([c.make,c.model].filter(Boolean).join(' ')||'ללא יצרן')}</b><span>${esc([c.plate,c.year,c.odometer?km(c.odometer)+' ק״מ':'',c.driver].filter(Boolean).join(' · '))}</span></span><span class="im-tags">${c.test?`<span class="chip">טסט ${fmtD(c.test)}</span>`:''}${c.ins?`<span class="chip">ביטוח ${fmtD(c.ins)}</span>`:''}${lab[c.status]?`<span class="pill neutral">${lab[c.status]}</span>`:''}</span></div>`).join('')}${cars.length>40?`<p class="small muted">ועוד ${cars.length-40}…</p>`:''}</div>
        <label class="toggle"><input type="checkbox" id="imCk"> להוסיף לכל רכב גם בדיקות שוטפות (שמן, מים, אוויר)</label>
        <div class="formacts"><button class="btn primary" id="imGo" ${take.length?'':'disabled'}>${I('check')}הוספת ${take.length} רכבים</button><button class="btn ghost" data-act="close">ביטול</button></div>
        <div class="small muted" id="imSt"></div>`;
      out.querySelectorAll('select[data-k]').forEach(s=>s.onchange=()=>{const v=+s.value;for(const k in map)if(map[k]===v&&k!==s.dataset.k)delete map[k];if(v>=0)map[s.dataset.k]=v;else delete map[s.dataset.k];draw();});
      const goB=out.querySelector('#imGo');goB.onclick=()=>runImport(take,out.querySelector('#imCk').checked,goB,out.querySelector('#imSt'));
    };
    root.querySelector('#imF').onchange=async e=>{const f=e.target.files[0];if(!f)return;
      root.querySelector('#imBox').classList.add('has');root.querySelector('#imTxt').innerHTML=`${I('sheet')} ${esc(f.name)}`;
      out.innerHTML=`<p class="small muted"><span class="spin"></span> קורא את הקובץ…</p>`;
      try{rows=(await readTable(f)).map(r=>(r||[]).map(v=>v==null?'':v));
        if(!root.contains(out))return;
        if(rows.length<2){out.innerHTML='<p class="small" style="color:var(--crit)">לא מצאתי שורות בקובץ.</p>';return;}
        const g=findHeader(rows);hdr=g.row;map=g.map;
        if((map.make==null&&map.plate==null)||g.score<2){out.innerHTML=`<p class="small muted"><span class="spin"></span> הסוכן מזהה את העמודות…</p>`;
          try{const a=await aiMap(rows);if(a&&Object.keys(a.map).length){hdr=a.row<0?-1:a.row;map=a.map;}}catch(x){console.warn(x);}}
        draw();
      }catch(err){console.warn(err);if(!root.contains(out))return;out.innerHTML=`<p class="small" style="color:var(--crit)">${String(err&&err.message)==='xls'?'זה קובץ Excel ישן (xls). פתח אותו באקסל ושמור בשם כ־xlsx או CSV, ונסה שוב.':'לא הצלחתי לקרוא את הקובץ. אפשר לשמור אותו כ־xlsx או CSV ולנסות שוב.'}</p>`;}
    };
  });
}
async function runImport(list,withChecks,btn,stEl){
  busy(btn,true,'מוסיף…');const taken=new Set();let done=0,firstId=null;
  try{
    for(const c of list){
      const id=newCarId(taken);taken.add(id);if(!firstId)firstId=id;
      if(stEl)stEl.textContent=`מוסיף ${done+1} מתוך ${list.length}…`;
      const o=c.odometer||0;
      await setRec('garage',id,{createdAt:Date.now()+done,make:c.make||'',model:c.model||'',year:c.year||null,fuelType:c.fuelType||'',plate:c.plate||'',odometer:o,odoUpdatedAt:today(),nickname:c.nickname||'',driver:c.driver||'',tankL:null,psiFront:null,psiRear:null,example:false});
      const rem=[{title:'טיפול תקופתי (שמן ומסנן)',kind:'service',intervalKm:15000,intervalDays:365,lastKm:o,lastDate:c.svc||today()}];
      if(c.test)rem.push({title:'טסט שנתי',kind:'doc',intervalKm:null,intervalDays:365,lastKm:o,lastDate:addDays(c.test,-365),docKey:'test'});
      if(c.ins)rem.push({title:'חידוש ביטוח רכב',kind:'doc',intervalKm:null,intervalDays:365,lastKm:o,lastDate:addDays(c.ins,-365),docKey:'ins:import'});
      if(withChecks)for(const [t,d] of [['בדיקת מפלס שמן',14],['מים ונוזל קירור',14],['לחץ אוויר בצמיגים',14],['נוזל שמשות ומגבים',30]])rem.push({title:t,kind:'check',intervalKm:null,intervalDays:d,lastKm:o,lastDate:today()});
      for(const r of rem)await addRec('reminder',Object.assign({note:'',history:[],carId:id},r));
      done++;
    }
    closeModal();setFleetView(true);if(view!=='home')go('home');else render();toast(done===1?'רכב אחד נוסף לצי':`${done} רכבים נוספו לצי`);
  }catch(err){console.error(err);busy(btn,false);
    const lim=/car_limit/.test(String(err&&(err.message||err)));
    if(stEl)stEl.innerHTML=`<span style="color:var(--crit)">${lim?`הגעת למגבלת הרכבים בחשבון (${MAX_CARS}).`:'ההוספה נעצרה בגלל שגיאה.'} נוספו ${done} מתוך ${list.length}.</span>`;
    if(done)render();}
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act^="fl"]');if(!b)return;
  const a=b.dataset.act;
  if(a==='flView'){setFleetView(b.dataset.id==='1');render();}
  else if(a==='flCar')openFleetCar(b.dataset.id,b.dataset.go);
  else if(a==='flSort'){fleetSort=b.dataset.id;render();}
  else if(a==='flMore'){fleetAll=!fleetAll;render();}
  else if(a==='flExport')fleetExport(b);
  else if(a==='flImport')importSheet();
  else if(a==='flAdd'){onboarding(2,{carId:newCarId()});}
});
document.addEventListener('change',e=>{const s=e.target.closest('select[data-act="flSortSel"]');if(s){fleetSort=s.value;render();}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const t=e.target.closest&&e.target.closest('tr[data-act="flCar"]');if(t)openFleetCar(t.dataset.id);});
