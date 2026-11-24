/* ---------- the agent: answers, and does things in the app for you ---------- */
let AGENT_NAV=null;const AGENT_UNDO={};let undoSeq=0;
function chatSys(){
  const multi=S.cars.length>1;
  return `אתה "הסוכן" של אפליקציית יומן הרכב. אתה עונה על שאלות וגם מבצע פעולות באפליקציה בשם המשתמש, בעזרת הכלים.
כשהמשתמש מספר שעשה משהו, בצע מיד עם הכלי המתאים, בלי לבקש אישור:
- טיפול, תיקון או עבודה במוסך (איזון וכיוון פרונט, החלפת שמן, צמיגים, בלמים…) → log_service. אם יש תזכורת שמתאימה למה שנעשה (לפי get_overview), העבר את ה־id שלה ב־done_reminder_ids.
- בדיקה שוטפת (שמן, מים, נוזל קירור, אוויר בצמיגים, נוזל שמשות) → mark_reminder_done עם ה־ids של התזכורות המתאימות.
- תדלוק → log_fuel (צריך סכום; אם לא נאמר, שאל במשפט אחד). הוצאה אחרת (חניה, ביטוח, טסט, כביש 6, שטיפה, חלפים) → log_expense.
- קילומטראז׳ חדש → update_odometer. תזכורת חדשה → add_reminder.
- "תעביר אותי ל…", "תראה לי…", "תפתח…" → open_screen.
אל תמציא סכומים או תאריכים: מה שלא נאמר נשאר ריק, והתאריך הוא היום. "אתמול" = התאריך של אתמול.
${multi?'בחשבון יש כמה רכבים (list_cars). אם המשתמש מזכיר רכב, כינוי, נהג או מספר רישוי, העבר car עם ה־id. אחרת הפעולה היא לרכב שפתוח עכשיו.':''}
אחרי פעולה: משפט אחד קצר, מה נרשם ומתי הפעם הבאה (לפי תוצאת הכלי). המשתמש יכול לבטל כל פעולה בכפתור, אל תציע לבטל.
שאלות: ענה על הרכב ועל הנתונים שבאפליקציה (דלק, צריכה, טיפולים, הוצאות, תזכורות, ביטוח ומסמכים, דוחות ונקודות), ועל רכב ונהיגה בכלל. מספרים רק מהכלים.
כל דבר שלא קשור לרכב: ענה רק "אני עוזר רק בדברים שקשורים לרכב ולאפליקציה 🙂".
עברית בלבד, קצר: עד 60 מילים אלא אם ביקשו פירוט. מטבע ₪.`;
}
// which car a tool call is about: id, plate, nickname, make/model or driver; default = the open car
function agentCar(ref){
  if(!ref)return S.car;
  const q=String(ref).trim().toLowerCase(),d=q.replace(/\D/g,'');
  return S.cars.find(c=>c.id===ref)||(d.length>=5?S.cars.find(c=>plateKey(c.plate)===d):null)
    ||S.cars.find(c=>[c.nickname,c.driver,[c.make,c.model].filter(Boolean).join(' '),c.make,c.model].some(x=>x&&String(x).toLowerCase()&&(String(x).toLowerCase().includes(q)||q.includes(String(x).toLowerCase()))))||null;
}
function useCar(ref){
  const c=agentCar(ref);if(!c)throw new Error('unknown car: '+ref+'. Call list_cars.');
  if(c.id!==CAR){CAR=c.id;try{localStorage.setItem('cj-car',c.id);}catch(e){}applyCar();if(typeof setFleetView==='function'&&isBiz())setFleetView(false);agentNote(`עברתי ל${esc(carName(c))}`);}
  return c;
}
function agentNote(html,undo){
  let btn='';if(undo){const k=++undoSeq;AGENT_UNDO[k]=undo;btn=` <button class="linkbtn" data-act="agUndo" data-id="${k}">ביטול</button>`;}
  const h='✓ '+html+btn;chatLog.push({role:'note',html:h});appendMsg('note',h);
}
const isoOr=(d)=>/^\d{4}-\d\d-\d\d$/.test(d||'')&&d<=today()?d:today();
const carProp={car:{type:'string',description:'Car id from list_cars, or plate / nickname / driver. Omit for the car that is open now.'}};
const chatTools=[
 {name:'list_cars',description:'All cars in the account: id, name, plate, driver, odometer, and which one is open now.',inputSchema:{type:'object',properties:{}},
  execute:()=>S.cars.map(c=>({id:c.id,name:carName(c),make:c.make,model:c.model,plate:c.plate||'',driver:c.driver||'',odometer:n(c.odometer),open:c.id===CAR}))},
 {name:'get_overview',description:'One car: profile, odometer, km per day, fuel economy, monthly spend, and every reminder (id, title, kind, status, expected date, last time done).',inputSchema:{type:'object',properties:{...carProp}},
  execute:({car})=>{const c=agentCar(car);if(!c)throw new Error('unknown car');return withCar(c.id,()=>Object.assign(snapshotData(),{carId:c.id}));}},
 {name:'get_records',description:'Logged records of one type for a car, newest first. fuel=fill-ups, service=garage work, expense=other costs.',inputSchema:{type:'object',properties:{type:{type:'string',enum:['fuel','service','expense']},limit:{type:'number'},...carProp},required:['type']},
  execute:({type,limit,car})=>{const c=agentCar(car);if(!c)throw new Error('unknown car');return withCar(c.id,()=>[...(S[type]||[])].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,Math.min(+limit||30,100)).map(r=>{const o=Object.assign({},r);delete o.receipt;delete o.history;return o;}));}},
 {name:'get_insurance',description:'Insurance policies and vehicle license read from uploaded documents: insurer, type, dates, drivers, deductibles, coverages in plain Hebrew, exclusions, phone numbers. For any insurance, claim or annual test question.',inputSchema:{type:'object',properties:{}},
  execute:()=>S.paper.map(p=>{const o=Object.assign({},p);delete o.files;return o;})},
 {name:'get_tickets_and_license',description:'Traffic tickets (date, points, amount, deadlines, check result, status), the valid points total and reset date, driver license expiry and new-driver refresher.',inputSchema:{type:'object',properties:{}},
  execute:()=>({points:(({total,years,last,reset})=>({total,years,last,reset}))(pointsState()),tickets:S.ticket.map(t=>{const o=Object.assign({},t);delete o.files;delete o.ticketNo;delete o.plateOnTicket;o.payBy=tkDue(t);return o;}),driver:(({exp,newEnd,refresherDue})=>({licenseExpiry:exp,newDriverEnds:newEnd,refresherDue}))(driverInfo())})},
 {name:'log_service',description:'Record garage work / maintenance that was done (e.g. wheel alignment, oil change, tyres, brakes). Optionally marks matching reminders done.',inputSchema:{type:'object',properties:{title:{type:'string',description:'Short Hebrew description'},cost:{type:['number','null']},date:{type:['string','null'],description:'YYYY-MM-DD, default today'},odo:{type:['number','null']},garage:{type:['string','null']},note:{type:['string','null']},done_reminder_ids:{type:'array',items:{type:'string'}},...carProp},required:['title']},
  execute:async(a)=>{const c=useCar(a.car);const data={date:isoOr(a.date),title:String(a.title).slice(0,120),cost:n(a.cost),odo:n(a.odo)||odo(),garage:a.garage||'',note:a.note||'',carId:c.id};
    const ref=await addRec('service',data);await bumpOdo(data.odo);
    const done=[];for(const id of a.done_reminder_ids||[]){const r=await markDone(id,data.odo,data.date,true);if(r&&r.undo)done.push(r);}
    agentNote(`נרשם טיפול: <b>${esc(data.title)}</b>${data.cost?' · '+ils(data.cost):''}${done.length?' · '+done.map(x=>esc(x.nextLabel)).join(' · '):''}`,async()=>{await delRec('service',ref.id);for(const x of done)await x.undo();});
    return {ok:true,carId:c.id,next:done.map(x=>({title:x.title,next:x.nextLabel}))};}},
 {name:'log_fuel',description:'Record a fill-up.',inputSchema:{type:'object',properties:{total:{type:'number',description:'Total paid in ₪'},liters:{type:['number','null']},pricePerL:{type:['number','null']},odo:{type:['number','null']},station:{type:['string','null']},full:{type:['boolean','null']},date:{type:['string','null']},...carProp},required:['total']},
  execute:async(a)=>{const c=useCar(a.car);const x=normFuel(a)||{};const data={date:isoOr(a.date),total:x.total,liters:x.liters,pricePerL:x.pricePerL,station:a.station||'',odo:n(a.odo)||null,full:a.full!==false,carId:c.id};
    const ref=await addRec('fuel',data);if(data.odo)await bumpOdo(data.odo);
    agentNote(`נרשם תדלוק: ${ils(data.total)}${data.liters?' · '+nf1.format(data.liters)+' ל׳':''}${data.odo?' · '+km(data.odo)+' ק״מ':''}`,()=>delRec('fuel',ref.id));
    return {ok:true,carId:c.id,missingOdo:!data.odo};}},
 {name:'log_expense',description:'Record any other car expense.',inputSchema:{type:'object',properties:{title:{type:'string'},amount:{type:'number'},category:{type:'string',enum:['insurance','test','tires','parking','wash','parts','other']},vendor:{type:['string','null']},date:{type:['string','null']},...carProp},required:['title','amount']},
  execute:async(a)=>{const c=useCar(a.car);const data={date:isoOr(a.date),title:String(a.title).slice(0,120),amount:n(a.amount),category:CATS[a.category]?a.category:'other',vendor:a.vendor||'',note:'',carId:c.id};
    const ref=await addRec('expense',data);agentNote(`נרשמה הוצאה: <b>${esc(data.title)}</b> · ${ils(data.amount)}`,()=>delRec('expense',ref.id));return {ok:true,carId:c.id};}},
 {name:'mark_reminder_done',description:'Mark reminders (routine checks or maintenance) as done today. Returns when each is due next.',inputSchema:{type:'object',properties:{ids:{type:'array',items:{type:'string'}},...carProp},required:['ids']},
  execute:async({ids,car})=>{useCar(car);const out=[],done=[];
    for(const id of ids||[]){const r=await markDone(id,odo(),today(),true);if(!r)throw new Error('unknown reminder id '+id);if(r.undo){done.push(r);out.push({title:r.title,next:r.nextLabel});}else out.push({id,done:true});}
    if(done.length){JUST_DONE={ids:done.map(x=>x.id),at:Date.now()};agentNote(done.map(x=>`<b>${esc(x.title)}</b>: בוצע היום. ${esc(x.nextLabel)}`).join('<br>'),()=>Promise.all(done.map(x=>x.undo())));}
    return out;}},
 {name:'add_reminder',description:'Create a reminder counted from today and the current odometer.',inputSchema:{type:'object',properties:{title:{type:'string'},kind:{type:'string',enum:['service','check','doc']},intervalKm:{type:['number','null']},intervalDays:{type:['number','null']},...carProp},required:['title','kind']},
  execute:async(a)=>{if(!a.intervalKm&&!a.intervalDays)throw new Error('need intervalKm or intervalDays');const c=useCar(a.car);
    const ref=await addRec('reminder',{title:a.title,kind:a.kind,intervalKm:n(a.intervalKm),intervalDays:n(a.intervalDays),lastKm:odo(),lastDate:today(),history:[],note:'',carId:c.id});
    agentNote('נוספה תזכורת: <b>'+esc(a.title)+'</b>',()=>delRec('reminder',ref.id));return {ok:true};}},
 {name:'update_odometer',description:'Set the current odometer reading (km).',inputSchema:{type:'object',properties:{km:{type:'number'},...carProp},required:['km']},
  execute:async({km:v,car})=>{const c=useCar(car);v=n(v);if(!v)throw new Error('bad km');const before={odometer:c.odometer,odoUpdatedAt:c.odoUpdatedAt||''};
    await updRec('garage',c.id,{odometer:v,odoUpdatedAt:today()});agentNote(`הקילומטראז׳ עודכן ל־${km(v)}`,()=>updRec('garage',c.id,before));return {ok:true};}},
 {name:'open_screen',description:'Take the user to a screen of the app (after you answer).',inputSchema:{type:'object',properties:{screen:{type:'string',enum:['home','fuel','service','expense','reminder','agent','insurance','tickets','fleet','account','checks']},...carProp},required:['screen']},
  execute:({screen,car})=>{if(car)useCar(car);
    const nav={insurance:()=>{agTab='docs';go('agents');render();},tickets:()=>{agTab='tickets';go('agents');render();},agent:()=>{agTab='agents';go('agents');render();},
      fleet:()=>{if(typeof setFleetView==='function')setFleetView(true);go('home');render();},account:()=>accountSheet(),checks:()=>checksSheet()}[screen]||(()=>{if(typeof setFleetView==='function'&&screen==='home'&&isBiz())setFleetView(false);go(screen);render();});
    AGENT_NAV=nav;return {ok:true,willOpen:screen};}},
];
// open the agent from anywhere
function agentOpen(){
  agTab='agents';if(view!=='agents')go('agents');else render();
  setTimeout(()=>{const c=$('#chat');if(c)c.scrollIntoView({block:'end',behavior:'smooth'});const i=$('#chatIn');if(i&&window.innerWidth>700)i.focus();},120);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act="agentOpen"],[data-act="agUndo"],[data-act="agMic"]');if(!b)return;
  if(b.dataset.act==='agentOpen')agentOpen();
  else if(b.dataset.act==='agMic')voiceSheet({agent:true});
  else{const f=AGENT_UNDO[b.dataset.id];if(!f)return;delete AGENT_UNDO[b.dataset.id];b.disabled=true;Promise.resolve(f()).then(()=>{b.textContent='בוטל';toast('הפעולה בוטלה');}).catch(()=>{b.disabled=false;toast('הביטול נכשל');});}
});
