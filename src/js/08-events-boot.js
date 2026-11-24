/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const nv=e.target.closest('[data-nav]');if(nv){if($('#ov').hidden===false)closeModal();go(nv.dataset.nav);return;}
  const b=e.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act,id=b.dataset.id;
  if(!['close','rcpt'].includes(a)&&!db&&a!=='quick'){toast('המאגר לא מחובר');return;}
  switch(a){
    case 'close':closeModal();break;
    case 'quick':quickSheet();break;
    case 'fuelForm':fuelForm(id);break;
    case 'fuelQuick':fuelQuick();break;
    case 'serviceForm':serviceForm(id);break;
    case 'expenseForm':expenseForm(id);break;
    case 'remForm':remForm(null,b.dataset.kind);break;
    case 'editRem':remForm(id);break;
    case 'del':confirmDelete(b.dataset.col,id);break;
    case 'odo':odoForm();break;
    case 'car':case 'setup':carForm();break;
    case 'account':accountSheet();break;
    case 'cars':carSheet();break;
    case 'feedback':feedbackSheet();break;
    case 'bizAsk':feedbackSheet('biz');break;
    case 'installHint':pushInstallSheet();break;
    case 'installHintX':try{localStorage.setItem('cj-install-hint','1');}catch(x){}render();break;
    case 'onboard':onbShown=true;onboarding(1);break;
    case 'checks':checksSheet();break;
    case 'scan':scanSheet();break;
    case 'plan':runPlan(b);break;
    case 'insight':runInsight(b);break;
    case 'agtab':agTab=id;render();break;
    case 'docUp':docUploadSheet(b.dataset.type||'insurance');break;
    case 'docFile':{const pp=S.paper.find(x=>x.id===id);const f=pp&&(pp.files||[])[+(b.dataset.i||0)];if(f)receiptView(f.id,f.type||'',pp.type==='license'?'רישיון הרכב':'פוליסת הביטוח');break;}
    case 'docEdit':docEditSheet(id);break;
    case 'docDel':docDeleteSheet(id);break;
    case 'drvEdit':driverSheet();break;
    case 'drvFile':{const f=(S.person&&S.person.files||[])[+(b.dataset.i||0)];if(f)receiptView(f.id,f.type||'','רישיון הנהיגה');break;}
    case 'tkAdd':ticketSheet();break;
    case 'tkEdit':ticketSheet(id);break;
    case 'tkPaid':ticketPaid(id);break;
    case 'tkImport':pointsImportSheet();break;
    case 'tkFile':{const t=S.ticket.find(x=>x.id===id);const f=t&&(t.files||[])[0];if(f)receiptView(f.id,f.type||'','הדוח');break;}
    case 'docAsk':agTab='agents';render();setTimeout(()=>{const i=$('#chatIn');if(i){i.value='לפי הביטוח שלי, ';i.focus();}},60);break;
    case 'cal':addToCalendar(id,b);break;
    case 'rcpt':receiptView(id,b.dataset.type||'');break;
    case 'ask':sendChat(b.dataset.q);break;
    case 'snooze':snoozeSheet(id);break;
    case 'restore':restoreSheet();break;
    case 'done':{const r=S.reminder.find(x=>x.id===id);if(!r)break;
      if(r.kind==='service'){serviceForm(null,{title:r.title,remId:r.id});}
      else markDone(id).then(()=>render()).catch(()=>toast('העדכון נכשל'));break;}
  }
});
document.addEventListener('submit',e=>{if(e.target.id==='composer'){e.preventDefault();if(chatBusy){toast('רגע, הסוכן עוד עונה…');return;}const i=$('#chatIn');const q=i.value;i.value='';sendChat(q);}});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h&&h!==view&&NAV.some(x=>x[0]===h))go(h);});

(function(){
  const sp=$('#splash');if(!sp)return;let done=false;
  const fin=()=>{if(done)return;done=true;sp.remove();placeInd(true);if($('#view').children.length&&!$('#view .empty:only-child'))animateView('first');};
  sp.addEventListener('animationend',e=>{if(e.target===sp&&e.animationName==='spOut')fin();});
  sp.addEventListener('click',()=>sp.classList.add('out'));
  setTimeout(fin,5000);
})();
boot();
