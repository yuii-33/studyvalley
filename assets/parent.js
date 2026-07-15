/* ══════════════════════════════════════════════════════════
   assets/parent.js — หน้าผู้ปกครอง (PIN 4 หลัก + รายงานผล)
   PIN = ด่านอ่อน เก็บในเครื่อง (ไม่ใช่ระบบยืนยันตัวจริง)
   ══════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const PIN_KEY = 'sv.parent.pin';
const eqAns = (a, b) =>
  String(a).trim().replace(/\s+/g, ' ').toLowerCase() ===
  String(b).trim().replace(/\s+/g, ' ').toLowerCase();

let mode = 'enter';     // 'set' | 'confirm' | 'enter'
let buf = '', firstPin = '';

function getPin(){ try{ return localStorage.getItem(PIN_KEY) || ''; }catch(e){ return ''; } }
function setPin(p){ try{ localStorage.setItem(PIN_KEY, p); }catch(e){} }

function boot(){
  $('homelink').innerHTML = ART.home(17) + '<span>หน้าแรก</span>';
  $('lockBtn').onclick = lock;
  $('resetPin').onclick = armResetPin;
  buildPad();
  mode = getPin() ? 'enter' : 'set';
  buf = ''; firstPin = '';
  renderLock();
}

/* ── แป้น PIN ── */
function buildPad(){
  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];
  $('pinpad').innerHTML = keys.map(k =>
    k==='' ? '<div></div>'
    : '<button class="pinkey" data-k="'+k+'">'+(k==='del'?'ลบ':k)+'</button>').join('');
  $('pinpad').querySelectorAll('[data-k]').forEach(b=>{
    b.onclick = ()=>{ const k=b.dataset.k;
      if(k==='del') buf = buf.slice(0,-1);
      else if(buf.length<4) buf += k;
      $('lockMsg').textContent = '';
      if(buf.length===4) setTimeout(submitPin, 120);
      renderDots();
    };
  });
}
function renderDots(){
  $('dots').innerHTML = [0,1,2,3].map(i=>'<span class="dot'+(i<buf.length?' on':'')+'"></span>').join('');
}
function renderLock(){
  $('lock').style.display = '';
  $('report').style.display = 'none';
  $('lockBtn').style.display = 'none';
  $('resetPin').style.display = mode==='enter' ? '' : 'none';
  $('lockHint').textContent =
    mode==='set' ? 'ตั้ง PIN 4 หลัก (สำหรับผู้ปกครอง)' :
    mode==='confirm' ? 'ใส่ PIN อีกครั้งเพื่อยืนยัน' : 'ใส่ PIN 4 หลัก';
  buf = ''; renderDots(); $('lockMsg').textContent='';
}
function submitPin(){
  if(mode==='set'){ firstPin = buf; mode='confirm'; renderLock(); return; }
  if(mode==='confirm'){
    if(buf===firstPin){ setPin(buf); unlock(); }
    else { mode='set'; firstPin=''; renderLock(); $('lockMsg').textContent='ไม่ตรงกัน ลองตั้งใหม่'; }
    return;
  }
  // enter
  if(buf===getPin()) unlock();
  else { buf=''; renderDots(); $('lockMsg').textContent='PIN ไม่ถูก'; $('dots').classList.remove('shake'); void $('dots').offsetWidth; $('dots').classList.add('shake'); }
}
function lock(){ mode = getPin()?'enter':'set'; renderLock(); }

let armReset = false, armTimer;
function armResetPin(){
  if(armReset){ try{ localStorage.removeItem(PIN_KEY); }catch(e){} armReset=false; clearTimeout(armTimer);
    mode='set'; renderLock(); return; }
  armReset = true; $('resetPin').textContent = 'แตะยืนยันอีกครั้งเพื่อล้าง PIN';
  clearTimeout(armTimer); armTimer=setTimeout(()=>{ armReset=false; $('resetPin').textContent='ลืม PIN — ตั้งใหม่ (ล้างของเดิม)'; },4000);
}

/* ── ปลดล็อก → รายงาน ── */
async function unlock(){
  $('lock').style.display='none';
  $('report').style.display='';
  $('lockBtn').style.display='';
  $('report').innerHTML = '<div class="empty">กำลังโหลดผล…</div>';
  renderReport().catch(()=>{ $('report').innerHTML='<div class="empty">โหลดผลไม่ได้ — เปิดผ่านเว็บ (เซิร์ฟเวอร์)</div>'; });
}

function readPosn(){
  const out = {};
  for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i);
    if(k && k.indexOf('sv.posn.')===0){ try{ const d=JSON.parse(localStorage.getItem(k)); if(d&&d.id) out[d.id]=d; }catch(e){} } }
  return out;
}
function readHome(){ try{ const d=JSON.parse(localStorage.getItem('sv.home.v2')); return d&&d.profile?d.profile:null; }catch(e){ return null; } }
function readEng(){ try{ return JSON.parse(localStorage.getItem('sv.eng.v1')); }catch(e){ return null; } }

const GROUPS = [
  { k:'wrongSure',   icon:'alert',  title:'ผิดทั้งที่มั่นใจ', todo:'เข้าใจคลาดเคลื่อน อ่านเฉลยให้จบ' },
  { k:'rightUnsure', icon:'unsure', title:'ถูกแต่ไม่มั่นใจ',  todo:'ยังไม่แน่น ทำซ้ำภายใน 3 วัน' },
  { k:'dk',          icon:'book',   title:'ไม่รู้เลย',        todo:'เปิดเล่ม บทที่เกี่ยว' },
  { k:'miss',        icon:'grid',   title:'พลาด',             todo:'เขียนตารางไล่ค่าใหม่' },
];

function groupsFor(questions, ans){
  const G = { wrongSure:[], rightUnsure:[], dk:[], miss:[] };
  questions.forEach((q,i)=>{
    const a = ans[i]; if(!a) return;
    if(a.dk){ G.dk.push(i+1); return; }
    if(!a.revealed) return;
    const ok = a.pick!=null && eqAns(a.pick, q.c);
    if(ok){ if(a.conf==='unsure') G.rightUnsure.push(i+1); }
    else { (a.conf==='sure'?G.wrongSure:G.miss).push(i+1); }
  });
  return G;
}

async function renderReport(){
  const posn = readPosn(), profile = readHome(), eng = readEng();
  let index = null;
  try{ index = await (await fetch('../data/posn/index.json',{cache:'no-cache'})).json(); }catch(e){}
  const titleOf = id => (index && index.sets.find(s=>s.id===id)||{}).title || id;

  const ids = Object.keys(posn);
  let totC=0, totA=0;
  ids.forEach(id=>{ const st=posn[id].stat||{}; totC+=st.correct||0; totA+=st.answered||0; });
  const xpTotal = (typeof XP!=='undefined') ? XP.total() : totC*10;
  const lvl = (typeof XP!=='undefined') ? XP.level() : 1;
  const stk = (typeof XP!=='undefined') ? XP.streak() : 0;

  let html = '<div class="ribbon"><span>ภาพรวม</span></div>'
    + '<div class="card prof">'
      + '<div class="profname">'+((profile&&profile.name)||'ยังไม่ตั้งชื่อ')+'</div>'
      + '<div class="profstat">Lv '+lvl+' • '+xpTotal+' XP'+(stk>1?' • ต่อเนื่อง '+stk+' วัน':'')+'</div>'
      + '<div class="profstat">ตอบถูก '+totC+' / '+totA+' ข้อ • ทำแล้ว '+ids.length+' ชุด</div>'
    + '</div>';

  if(eng){
    html += '<div class="card engrow"><div>คลังคำศัพท์ — วันนี้เก็บ <b>'+((eng.daily&&eng.daily.count)||0)
      +'</b> คำ • ต่อเนื่อง '+(eng.streak||0)+'</div></div>';
  }

  // โหลดคำถามของชุดที่ทำแล้ว เพื่อแยกกลุ่ม
  const sets = await Promise.all(ids.map(async id=>{
    try{ const d = await (await fetch('../data/posn/'+id+'.json',{cache:'no-cache'})).json();
      return { id, data:d, save:posn[id] }; }
    catch(e){ return { id, data:null, save:posn[id] }; }
  }));
  sets.sort((a,b)=> String(a.id).localeCompare(String(b.id)));

  if(!ids.length){
    html += '<div class="empty">ยังไม่มีผลทำโจทย์</div>';
  }
  sets.forEach(s=>{
    const st = s.save.stat||{};
    html += '<div class="ribbon"><span>'+titleOf(s.id)+'</span></div>';
    html += '<div class="card setrow"><div class="setstat">ตอบถูก '+(st.correct||0)+' / '+(st.answered||0)
      +' • ทำไป '+(st.done||0)+'/'+(st.n||'?')+' ข้อ</div></div>';
    if(s.data && Array.isArray(s.data.questions)){
      const G = groupsFor(s.data.questions, s.save.ans||[]);
      const cards = GROUPS.filter(g=>G[g.k].length).map(g=>
        '<div class="pcard '+g.k+'"><div>'+ART[g.icon](22)+'</div>'
        +'<div style="flex:1;min-width:0"><div class="ptitle">'+g.title+' — ข้อ '+G[g.k].join(', ')+'</div>'
        +'<div class="ptodo">'+g.todo+'</div></div></div>').join('');
      html += cards || '<div class="allok">ไม่มีข้อค้างในชุดนี้</div>';
    }
  });

  $('report').innerHTML = html;
}

boot();
