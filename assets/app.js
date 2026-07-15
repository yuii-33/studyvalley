/* ═══ หน้าแรก — โปรไฟล์เดียวต่อเครื่อง + คะแนนจริงจากผลทำโจทย์ ═══ */
const AVATARS = ['apple','rocket','sprout','cat','fox','mushroom','star','rabbit','cactus'];

/* ค่าเริ่มต้น — ถูกทับด้วยข้อมูลที่เซฟไว้ในเครื่อง (ถ้ามี) */
const store = {
  name:'ทับทิม', art:'apple',
  goals:[{id:'g1',title:'สอบ สอวน. คอมพิวเตอร์ ค่าย 1',kind:'exam',date:'2026-08-30',room:'posn'},
         {id:'g2',title:'ทบทวนข้อที่ผิดทุกวัน',kind:'daily'}],
};
let armDel = null, armTimer = null, formKind = 'exam';
let INDEX = null;                 // data/posn/index.json (ถ้าโหลดได้)

const $ = id => document.getElementById(id);
const setMsg = t => { $('msg').textContent = t || ''; };
const TH_M = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const thDate = s => { const d = new Date(s+'T00:00:00');
  return d.getDate()+' '+TH_M[d.getMonth()]+' '+(d.getFullYear()+543); };
const daysLeft = s => Math.ceil((new Date(s+'T00:00:00') - new Date().setHours(0,0,0,0))/864e5);

/* ── คะแนน : ใช้โมดูล XP กลาง (assets/xp.js) — สม่ำเสมอ + cap รายวัน ── */

/* ── เซฟโปรไฟล์ 2 ที่ : localStorage + IndexedDB ── */
const SCHEMA = 2;                 // v2 = โปรไฟล์เดียว (ของเก่า v1 ถูกมองข้าม = ล้างของเดิม)
const KEY = 'sv.home.v2';
const homeSnap = () => ({ v:SCHEMA, profile:store });
function validProfile(p){
  return p && typeof p.name === 'string' && typeof p.art === 'string' && Array.isArray(p.goals);
}
function validHome(d){ return d && d.v === SCHEMA && validProfile(d.profile); }

function saveLocal(d){ try{ localStorage.setItem(KEY, JSON.stringify(d)); }catch(e){} }
function loadLocal(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }

const IDB_DB = 'studyvalley', IDB_STORE = 'kv';
function idbOpen(){
  return new Promise((res, rej)=>{
    const r = indexedDB.open(IDB_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(IDB_STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbPut(k, d){
  try{ const db = await idbOpen();
    await new Promise((res, rej)=>{ const tx = db.transaction(IDB_STORE,'readwrite');
      tx.objectStore(IDB_STORE).put(d, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    db.close();
  }catch(e){}
}
async function idbGet(k){
  try{ const db = await idbOpen();
    const d = await new Promise((res, rej)=>{ const tx = db.transaction(IDB_STORE,'readonly');
      const rq = tx.objectStore(IDB_STORE).get(k); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); });
    db.close(); return d;
  }catch(e){ return null; }
}

let saveTimer;
function save(){
  const d = homeSnap();
  saveLocal(d);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => idbPut(KEY, d), 250);
}

/* ── อ่านคะแนนจริงจากผลทำโจทย์ (sv.posn.<id>) ── */
function readScores(){
  const byId = {};
  for(let i=0; i<localStorage.length; i++){
    const k = localStorage.key(i);
    if(k && k.indexOf('sv.posn.') === 0){
      try{ const d = JSON.parse(localStorage.getItem(k)); if(d && d.id && d.stat) byId[d.id] = d.stat; }
      catch(e){}
    }
  }
  return byId;
}

/* ── boot ── */
async function boot(){
  const saved = await idbGet(KEY) || loadLocal();
  if(validHome(saved)){ store.name = saved.profile.name; store.art = saved.profile.art; store.goals = saved.profile.goals; save(); }
  try{ INDEX = await (await fetch('data/posn/index.json', {cache:'no-cache'})).json(); }
  catch(e){ INDEX = null; }        // เปิดแบบ file:// จะโหลดไม่ได้ — คะแนนยังคิดจาก localStorage ได้
  $('rmA').innerHTML = ART.book(28);
  $('rmB').innerHTML = ART.rocket(28);
  render();
}

function render(){
  const scores = readScores();
  let totCorrect = 0, totAnswered = 0, attempted = 0;
  Object.keys(scores).forEach(id => { const s = scores[id];
    totCorrect += s.correct||0; totAnswered += s.answered||0;
    if((s.done||0) > 0) attempted++; });
  const xpTotal = XP.total(), level = XP.level(), inLv = XP.inLevel(), pct = Math.round(inLv/XP.PER_LEVEL*100);

  /* โปรไฟล์ */
  $('nm').value = store.name;
  $('av').innerHTML = ART[store.art](38);
  $('heroPin').innerHTML = ART[store.art](18);

  /* เลเวล */
  $('lv').textContent = 'Lv '+level;
  $('xp').textContent = xpTotal.toLocaleString()+' XP';
  $('lvfill').style.width = pct+'%';
  $('heroPin').style.left = Math.min(96,Math.max(4,pct))+'%';
  const st = XP.streak();
  $('toNext').textContent = (xpTotal===0 ? 'เริ่มทำโจทย์เพื่อเก็บ XP' : 'อีก '+(XP.PER_LEVEL-inLv)+' XP จะเลเวลอัป')
    + (st>1 ? ' • ต่อเนื่อง '+st+' วัน' : '');

  /* รูปประจำตัว */
  $('emo').innerHTML = '';
  AVATARS.forEach(a=>{
    const b = document.createElement('button');
    b.innerHTML = ART[a](28);
    b.style.cssText = 'width:46px;height:46px;border:0;border-radius:12px;cursor:pointer;'+
      'display:flex;align-items:center;justify-content:center;'+
      (a===store.art ? 'background:var(--gold);box-shadow:0 0 0 2px var(--gold-d)'
                     : 'background:#F5EAD2;box-shadow:0 0 0 1.5px var(--line)');
    b.onclick = ()=>{ store.art = a; save(); render(); };
    $('emo').appendChild(b);
  });

  /* เป้าหมาย */
  const G = $('goals'); G.innerHTML = '';
  if(!store.goals.length){
    G.innerHTML = '<div class="empty">ยังไม่มีเป้าหมาย — เพิ่มได้เลย</div>';
  }
  store.goals.forEach(g=>{
    let tag, cls = 'gold', sub = '';
    if(g.kind==='exam' && g.date){
      const dl = daysLeft(g.date);
      tag = dl>=0 ? 'เหลืออีก '+dl+' วัน' : 'เลยกำหนดแล้ว';
      if(dl>=0 && dl<=14) cls = 'rose';
      sub = 'สอบ '+thDate(g.date);
    } else { tag = 'ทบทวนรายวัน'; cls = 'green'; }

    const room = g.room==='posn' ? 'สอวน. คอมพิวเตอร์'
               : g.room==='english' ? 'คลังคำศัพท์อังกฤษ' : '';
    const arming = armDel===g.id;

    const el = document.createElement('div');
    el.className = 'card row';
    el.style.borderRadius = '15px';
    el.innerHTML =
      '<div class="tile" style="width:42px;height:42px;flex:0 0 42px">'+
        ART[g.kind==='exam'?'flag':'leaf'](26)+'</div>'+
      '<div style="flex:1;min-width:0">'+
        '<div style="font-weight:700;font-size:17.5px;line-height:1.3">'+g.title+'</div>'+
        (sub?'<div style="font-size:14px;color:var(--muted);margin-top:1px">'+sub+'</div>':'')+
        (room?'<div class="chip plain" style="display:inline-block;margin-top:4px">'+room+'</div>':'')+
      '</div>'+
      '<span class="chip '+cls+'" style="font-size:14.5px;padding:5px 11px">'+tag+'</span>';

    const del = document.createElement('button');
    del.className = 'btn '+(arming?'danger':'soft');
    del.style.cssText = 'flex:0 0 auto;border-radius:10px;font-size:14px;padding:6px 8px;min-height:0;box-shadow:none';
    del.textContent = arming ? 'แตะยืนยัน' : 'ลบ';
    del.onclick = ()=>{                       // แตะสองครั้ง — ไม่ใช้ confirm()
      if(armDel!==g.id){
        armDel = g.id; clearTimeout(armTimer);
        armTimer = setTimeout(()=>{ armDel=null; render(); }, 4000);
        render(); return;
      }
      clearTimeout(armTimer);
      store.goals = store.goals.filter(x=>x.id!==g.id);
      armDel = null; save(); render();
    };
    el.appendChild(del);
    G.appendChild(el);
  });

  /* การ์ดห้องเรียน สอวน. */
  const nSets = INDEX ? INDEX.sets.length : null;
  const newWin = ((INDEX && INDEX.newHours) || 48) * 3600000;
  const anyNew = !!(INDEX && INDEX.sets.some(s => s.added && Date.now()-s.added < newWin));
  $('rmAnew').style.display = anyNew ? '' : 'none';
  $('rmAsub').textContent = 'เลข + คอม' + (nSets ? ' • '+nSets+' ชุด' : '');
  $('rmAchips').innerHTML = attempted
    ? '<span class="chip green">ทำแล้ว '+attempted+(nSets?' / '+nSets:'')+' ชุด</span>'
      + (totAnswered ? '<span class="chip gold">ถูก '+Math.round(totCorrect/totAnswered*100)+'%</span>' : '')
    : '<span class="chip plain">ยังไม่เริ่ม</span>';
}


/* ── ฟอร์ม / ปุ่ม ── */
$('avBtn').onclick = ()=>{ const p=$('avPick'); p.style.display = p.style.display==='none' ? '' : 'none'; };
let nameTimer;
$('nm').oninput = e => { store.name = e.target.value; clearTimeout(nameTimer); nameTimer = setTimeout(save, 400); };
$('addBtn').onclick = ()=>{ $('addForm').style.display=''; $('addBtn').style.display='none'; };
$('gCancel').onclick = ()=>{ $('addForm').style.display='none'; $('addBtn').style.display=''; setMsg(''); };
$('addForm').querySelectorAll('[data-kind]').forEach(b=>{
  b.onclick = ()=>{
    formKind = b.dataset.kind;
    $('addForm').querySelectorAll('[data-kind]').forEach(x=>
      x.className = 'btn '+(x.dataset.kind===formKind?'on':'off'));
    $('gDate').style.display = formKind==='exam' ? '' : 'none';
  };
});
$('gSave').onclick = ()=>{
  const t = $('gTitle').value.trim();
  if(!t){ setMsg('ใส่ชื่อเป้าหมายก่อนนะ'); return; }
  const g = {id:'g'+Date.now(), title:t, kind:formKind};
  if($('gRoom').value) g.room = $('gRoom').value;
  if(formKind==='exam' && $('gDate').value) g.date = $('gDate').value;
  store.goals.push(g);
  $('gTitle').value=''; $('gDate').value=''; $('gRoom').value='';
  $('addForm').style.display='none'; $('addBtn').style.display=''; setMsg('');
  save(); render();
};

/* ── สำรอง / กู้คืน (รวมผลทำโจทย์ด้วย เพื่อย้ายเครื่อง/ให้พ่อแม่ตรวจ) ── */
function collectPosn(){
  const out = {};
  for(let i=0; i<localStorage.length; i++){ const k = localStorage.key(i);
    if(k && k.indexOf('sv.posn.') === 0){ try{ out[k] = JSON.parse(localStorage.getItem(k)); }catch(e){} } }
  return out;
}
$('backupBtn').onclick = ()=>{
  const data = { v:SCHEMA, profile:store, posn:collectPosn() };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const dt = new Date(), p = n => String(n).padStart(2,'0');
  const a = document.createElement('a');
  a.href = url;
  a.download = 'studyvalley-'+dt.getFullYear()+p(dt.getMonth()+1)+p(dt.getDate())+'.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
  setMsg('สำรองแล้ว • เลือก "บันทึกลงไฟล์" แล้วเก็บไว้ในโฟลเดอร์ iCloud เพื่อย้ายเครื่อง');
};

let pendingRestore = null, restoreArmed = false, restoreTimer;
function disarmRestore(){ restoreArmed = false; pendingRestore = null;
  clearTimeout(restoreTimer); $('restoreBtn').textContent = 'กู้คืน'; $('restoreBtn').className = 'btn soft'; }
function armRestore(){ restoreArmed = true;
  clearTimeout(restoreTimer); $('restoreBtn').textContent = 'ยืนยันกู้คืน'; $('restoreBtn').className = 'btn danger';
  restoreTimer = setTimeout(()=>{ disarmRestore(); setMsg(''); }, 6000); }

$('restoreBtn').onclick = ()=>{
  if(restoreArmed && pendingRestore){
    const d = pendingRestore;
    store.name = d.profile.name; store.art = d.profile.art; store.goals = d.profile.goals;
    if(d.posn && typeof d.posn === 'object'){
      Object.keys(d.posn).forEach(k=>{
        if(k.indexOf('sv.posn.') === 0){ try{ localStorage.setItem(k, JSON.stringify(d.posn[k])); idbPut(k, d.posn[k]); }catch(e){} }
      });
    }
    disarmRestore(); save(); render();
    setMsg('กู้คืนแล้ว • ข้อมูลและผลทำโจทย์ถูกแทนที่จากไฟล์สำรอง');
    return;
  }
  $('restoreFile').value = '';
  $('restoreFile').click();
};
$('restoreFile').onchange = e=>{
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ()=>{
    let d; try{ d = JSON.parse(r.result); }catch(_){ d = null; }
    if(!d || d.v !== SCHEMA || !validProfile(d.profile)){
      disarmRestore(); setMsg('ไฟล์นี้ใช้ไม่ได้ — ต้องเป็นไฟล์สำรองของ Study Valley'); return;
    }
    pendingRestore = d;
    const nSets = d.posn ? Object.keys(d.posn).length : 0;
    armRestore();
    setMsg('ไฟล์สำรอง: ' + d.profile.name + ' • ' + d.profile.goals.length + ' เป้าหมาย • ผลทำโจทย์ ' + nSets + ' ชุด — แตะ "ยืนยันกู้คืน"');
  };
  r.readAsText(f);
};

boot();
