/* ══════════════════════════════════════════════════════════
   assets/set.js — เอนจินทำโจทย์
   โหลดชุดจาก ../data/posn/ · เซฟความคืบหน้า 2 ที่ (localStorage + IndexedDB)
   ══════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const norm = h => String(h == null ? '' : h).replace(/\u00B7/g, '\u2022');  // ตัวคั่นกลาง 00B7 -> bullet 2022 : กฎเหล็ก + กันเพี้ยนเป็น ท
const eqAns = (a, b) =>
  String(a).trim().replace(/\s+/g, ' ').toLowerCase() ===
  String(b).trim().replace(/\s+/g, ' ').toLowerCase();

const LAYER = {
  1: {t:'ปูพื้น',      c:'green'},
  2: {t:'ระดับข้อสอบ', c:'gold'},
  3: {t:'ท้าทาย',      c:'rose'},
};

let SET = null;        // ข้อมูลชุด { id, n, targetMin, questions:[...] }
let META = null;       // แถวจาก index.json ของชุดนี้
let ans = [];          // สถานะต่อข้อ { pick, revealed }
let cur = 0;           // ข้อปัจจุบัน (0-based)

/* ── เซฟ 2 ที่ : localStorage + IndexedDB (ตรวจ schema + จำนวนข้อ ก่อนใช้) ── */
const SCHEMA = 1;
const keyOf = id => 'sv.posn.' + id;

function computeStat(){
  let answered = 0, correct = 0, done = 0;
  SET.questions.forEach((q, i) => {
    const a = ans[i];
    if(a.revealed){ done++; answered++; if(a.pick != null && eqAns(a.pick, q.c)) correct++; }
  });
  return { n:SET.n, answered, correct, done };
}
const snapshot = () => ({ v:SCHEMA, id:SET.id, n:SET.n, cur, ans, elapsed, stat:computeStat(), t:Date.now() });
const EXPIRE = 18*3600*1000;   // ค้างเกิน 18 ชม. = ล้าง ทำใหม่
function validSaved(d){
  return d && d.v === SCHEMA && d.id === SET.id && d.n === SET.n
      && Array.isArray(d.ans) && d.ans.length === SET.n;   // จำนวนข้อต้องตรง
}

function saveLocal(d){ try{ localStorage.setItem(keyOf(SET.id), JSON.stringify(d)); }catch(e){} }
function loadLocal(id){ try{ return JSON.parse(localStorage.getItem(keyOf(id))); }catch(e){ return null; } }

const IDB_DB = 'studyvalley', IDB_STORE = 'kv';
function idbOpen(){
  return new Promise((res, rej)=>{
    const r = indexedDB.open(IDB_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(IDB_STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbSave(k, d){
  try{ const db = await idbOpen();
    await new Promise((res, rej)=>{ const tx = db.transaction(IDB_STORE,'readwrite');
      tx.objectStore(IDB_STORE).put(d, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    db.close();
  }catch(e){}
}
async function idbLoad(k){
  try{ const db = await idbOpen();
    const d = await new Promise((res, rej)=>{ const tx = db.transaction(IDB_STORE,'readonly');
      const rq = tx.objectStore(IDB_STORE).get(k); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); });
    db.close(); return d;
  }catch(e){ return null; }
}

let saveTimer;
function save(){
  const d = snapshot();
  saveLocal(d);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => idbSave(keyOf(SET.id), d), 300);
}

/* ── จับเวลา : นับขึ้น · พักตอนเฉลย/พักเบรค · หยุดเมื่อสลับแอป · กันเวลากระโดด ── */
let elapsed = 0, running = false, lastTick = 0, timerH = null, manualPaused = false;
const mmss = s => Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
function renderTimer(){
  const t = $('timer');
  t.textContent = mmss(elapsed);
  t.classList.toggle('over', SET && elapsed > SET.targetMin*60);
}
function startTimer(){
  if(running || !SET) return;
  running = true; lastTick = Date.now();
  timerH = setInterval(tick, 1000);
}
function stopTimer(){ running = false; clearInterval(timerH); }
function tick(){
  const now = Date.now(), gap = now - lastTick; lastTick = now;
  if(gap > 5000){ stopTimer(); return; }   // ช่องว่าง > 5 วิ = ถูกพักหลังบ้าน → ไม่นับ + หยุด
  elapsed += 1; renderTimer();
  if(elapsed % 5 === 0) save();
}
document.addEventListener('visibilitychange', () => { document.hidden ? stopTimer() : syncTimer(); });
window.addEventListener('pagehide', stopTimer);
window.addEventListener('blur', stopTimer);
window.addEventListener('focus', syncTimer);
/* เดินเวลาเฉพาะตอน: อยู่ในโหมดทำโจทย์ · ข้อยังไม่เฉลย · ไม่พักเบรค · ไม่สลับแอป */
function timerShouldRun(){
  return SET && $('quiz').style.display !== 'none' && $('summary').style.display === 'none'
      && !document.hidden && !manualPaused && ans[cur] && !ans[cur].revealed;
}
function syncTimer(){ if(timerShouldRun()) startTimer(); else stopTimer(); }
function pauseBreak(){ manualPaused = true; syncTimer(); $('pauseCover').style.display = 'flex'; save(); }
function resumeBreak(){ manualPaused = false; $('pauseCover').style.display = 'none'; syncTimer(); }

/* ── โหลดข้อมูล ── */
async function loadJSON(path){
  const r = await fetch(path, {cache:'no-cache'});
  if(!r.ok) throw new Error(path + ' → ' + r.status);
  return r.json();
}

async function boot(){
  const hl = $('homelink'); if(hl) hl.innerHTML = ART.home(17) + '<span>หน้าแรก</span>';
  const id = new URLSearchParams(location.search).get('id');
  let index;
  try{ index = await loadJSON('../data/posn/index.json'); }
  catch(e){ return fail('เปิดรายการชุดไม่ได้ — ต้องเปิดผ่านเว็บ (เซิร์ฟเวอร์) ไม่ใช่เปิดไฟล์ตรง ๆ'); }

  if(!id){ return renderPicker(index); }

  META = (index.sets || []).find(s => s.id === id) || null;
  let data;
  try{ data = await loadJSON('../data/posn/' + id + '.json'); }
  catch(e){ return fail('เปิดชุด "' + id + '" ไม่ได้'); }

  SET = { id, n: data.n, targetMin: data.targetMin, questions: data.questions };
  if(!Array.isArray(SET.questions) || SET.questions.length !== SET.n){
    SET.n = SET.questions.length;   // เชื่อจำนวนจริงในไฟล์
  }
  ans = SET.questions.map(() => ({ pick:null, revealed:false }));
  cur = 0; elapsed = 0;

  const saved = await idbLoad(keyOf(id)) || loadLocal(id);
  if(validSaved(saved) && (Date.now() - (saved.t||0)) <= EXPIRE){
    ans = saved.ans; cur = Math.min(saved.cur||0, SET.n-1); elapsed = saved.elapsed||0;   // ทำต่อจากเดิม
  } else if(saved){
    try{ localStorage.removeItem(keyOf(id)); }catch(e){}   // ค้างข้ามวัน/เกิน 18 ชม. → ล้าง เริ่มใหม่
  }

  $('settitle').textContent = META ? META.title : id;
  $('timer').style.display = '';
  $('picker').style.display = 'none';
  $('quiz').style.display = '';
  bindActions();
  renderQuestion();   // renderQuestion เรียก syncTimer เอง
}

function fail(msg){
  $('picker').style.display = '';
  $('picker').innerHTML = '<div class="empty">' + msg + '</div>';
}

/* ── รายการชุด (เมื่อไม่มี ?id) ── */
const SUBJ = { math:{t:'เลข',c:'gold'}, com:{t:'คอม',c:'green'}, mock:{t:'ประเมิน',c:'plum'} };
let INDEX_CACHE = null, pickFilter = 'all';
function renderPicker(index){
  INDEX_CACHE = index;
  $('settitle').textContent = 'เลือกชุดทำโจทย์';
  const box = $('picker');
  box.style.display = '';

  const filters = [{k:'all',t:'ทั้งหมด'},{k:'math',t:'เลข'},{k:'com',t:'คอม'},{k:'mock',t:'ประเมิน'}];
  const chips = '<div class="pickfilter">' + filters.map(f =>
    '<button class="lvchip'+(f.k===pickFilter?' on':'')+'" data-f="'+f.k+'">'+f.t+'</button>').join('') + '</div>';

  const list = (index.sets || []).filter(s => pickFilter==='all' || s.subject===pickFilter);
  const rows = list.map(s => {
    const sj = SUBJ[s.subject] || {t:s.subject,c:'plain'};
    const done = doneCount(s.id, s.n);
    return '<a class="card row pickrow" href="?id=' + s.id + '">'
      + '<div class="tile">' + ART.book(26) + '</div>'
      + '<div style="flex:1;min-width:0">'
        + '<div class="picktitle">' + s.title + '</div>'
        + '<div class="pickmeta"><span class="chip ' + sj.c + '">' + sj.t + '</span>'
          + '<span class="pickn">' + s.n + ' ข้อ • เป้า ' + s.targetMin + ' นาที</span></div>'
      + '</div>'
      + (done ? '<span class="chip green">ทำแล้ว ' + done + '/' + s.n + '</span>' : '')
      + '</a>';
  }).join('');
  box.innerHTML = chips + '<div class="stack">' + (rows || '<div class="empty">ยังไม่มีชุดในหมวดนี้</div>') + '</div>';
  box.querySelectorAll('[data-f]').forEach(b=>{
    b.onclick = ()=>{ pickFilter = b.dataset.f; renderPicker(INDEX_CACHE); };
  });
}
function doneCount(id, n){
  const d = loadLocal(id);
  if(!d || d.v !== SCHEMA || !Array.isArray(d.ans) || d.ans.length !== n) return 0;
  return d.ans.filter(a => a.revealed).length;
}

/* ── เรนเดอร์ข้อ ── */
function renderQuestion(){
  const q = SET.questions[cur], a = ans[cur];

  $('qprogfill').style.width = ((cur+1)/SET.n*100) + '%';
  $('qcount').textContent = 'ข้อ ' + (cur+1) + ' / ' + SET.n;
  $('qtarget').textContent = 'เป้า ' + SET.targetMin + ' นาที';

  /* ป้ายกำกับ */
  let badges = '';
  if(q.layer && LAYER[q.layer]) badges += '<span class="chip ' + LAYER[q.layer].c + '">' + LAYER[q.layer].t + '</span>';
  if(q.sec)   badges += '<span class="chip plain">' + q.sec + '</span>';
  if(q.topic && q.topic !== q.sec) badges += '<span class="chip plain">' + q.topic + '</span>';
  if(q.deep)  badges += '<span class="chip deep">' + ART.star(15) + 'ข้อลึก</span>';
  $('badges').innerHTML = badges;

  $('qbody').innerHTML = norm(q.q);

  /* ปุ่มคำใบ้ (คำแปลโจทย์) — เฉพาะข้อที่มี tr */
  const hb = $('hintbtn'), tb = $('trbox');
  if(q.tr){
    hb.style.display = '';
    hb.innerHTML = ART.bulb(20) + '<span>คำใบ้ • คำแปลโจทย์</span>';
    tb.innerHTML = ART.note(18) + '<div>' + norm(q.tr) + '</div>';
    tb.style.display = a.hintShown ? 'flex' : 'none';
  } else {
    hb.style.display = 'none'; tb.style.display = 'none';
  }

  /* ตัวเลือก / ช่องเติม */
  const isFill = q.type === 'fill' || !Array.isArray(q.ch);
  $('choices').style.display = isFill ? 'none' : '';
  $('fillwrap').style.display = isFill ? '' : 'none';
  if(isFill){
    $('fillin').value = a.pick == null ? '' : a.pick;
    $('fillin').disabled = a.revealed;
    $('fillin').classList.toggle('correct', a.revealed && a.pick != null && eqAns(a.pick, q.c));
    $('fillin').classList.toggle('wrong',   a.revealed && !(a.pick != null && eqAns(a.pick, q.c)));
  } else {
    $('choices').innerHTML = '';
    q.ch.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.innerHTML = '<span class="cletter">' + 'กขคง'[i] + '</span><span class="ctext">' + norm(c) + '</span>';
      if(a.pick === c) b.classList.add('picked');
      if(a.revealed){
        if(eqAns(c, q.c)) b.classList.add('correct');
        else if(a.pick === c) b.classList.add('wrong');
        b.disabled = true;
      }
      b.onclick = () => { if(a.revealed) return; a.pick = c; save(); renderQuestion(); };
      $('choices').appendChild(b);
    });
  }

  /* เฉลย */
  const ex = $('exbox');
  if(a.revealed){
    const ok = a.pick != null && eqAns(a.pick, q.c);
    $('exhead').className = 'exhead ' + (ok ? 'ok' : 'no');
    $('exhead').innerHTML = ok
      ? ART.sure(22) + '<div>ถูกต้อง</div>'
      : ART['alert'](22) + '<div>ยังไม่ใช่ • คำตอบที่ถูกคือ ' + norm(q.c) + '</div>';
    $('excontent').innerHTML = norm(q.ex);
    ex.style.display = '';
  } else {
    ex.style.display = 'none';
  }

  $('btnReveal').style.display = a.revealed ? 'none' : '';
  $('pauseBtn').style.display = a.revealed ? 'none' : '';   // พักเบรคได้เฉพาะตอนยังไม่เฉลย
  $('btnPrev').disabled = cur === 0;
  $('btnNext').textContent = cur === SET.n-1 ? 'ดูสรุปผล' : 'ถัดไป';

  syncTimer();          // เฉลย → พัก · ข้อใหม่ (play) → จับต่อออโต้
  window.scrollTo(0, 0);
}

/* ── ปุ่ม ── */
function bindActions(){
  $('hintbtn').onclick = () => { ans[cur].hintShown = true; save(); renderQuestion(); };
  $('fillin').oninput  = e => { ans[cur].pick = e.target.value; save(); };
  $('btnReveal').onclick = () => {
    const a = ans[cur], q = SET.questions[cur];
    a.revealed = true;
    if(a.pick != null && eqAns(a.pick, q.c) && typeof XP !== 'undefined') XP.award('p:'+SET.id+':'+cur, XP.BASE_POSN);
    save(); renderQuestion();
  };
  $('btnPrev').onclick = () => { if(cur > 0){ cur--; save(); renderQuestion(); } };
  $('btnNext').onclick = () => {
    if(cur === SET.n-1){ showSummary(); return; }
    cur++; save(); renderQuestion();
  };
  $('pauseBtn').onclick = pauseBreak;
  $('resumeBtn').onclick = resumeBreak;
}

/* ── สรุปผล ── รายการข้อที่ยังไม่ถูก/ข้ามไป · ปิดท้ายด้วยสิ่งที่ต้องทำต่อ ── */
function showSummary(){
  stopTimer(); save();
  const wrong = [], skipped = [];
  let correct = 0;
  SET.questions.forEach((q, i) => {
    const a = ans[i];
    if(!a.revealed){ skipped.push(i+1); return; }
    if(a.pick != null && eqAns(a.pick, q.c)) correct++;
    else wrong.push(i+1);
  });

  const groups = [
    { list:wrong,   icon:'alert', cls:'wrongSure', title:'ยังไม่ถูก', todo:'อ่านเฉลยให้จบ แล้วทำซ้ำภายใน 3 วัน' },
    { list:skipped, icon:'book',  cls:'dk',        title:'ข้ามไป',    todo:'กลับไปลองทำให้ครบ' },
  ];

  const targetSec = SET.targetMin*60;
  const timeLine = elapsed <= targetSec
    ? 'ใช้เวลา ' + mmss(elapsed) + ' • ในเป้า ' + SET.targetMin + ' นาที'
    : 'ใช้เวลา ' + mmss(elapsed) + ' • เกินเป้า ' + SET.targetMin + ' นาที';

  let cards = groups.filter(g => g.list.length).map(g =>
    '<div class="sumcard ' + g.cls + '">'
    + '<div class="sumicon">' + ART[g.icon](26) + '</div>'
    + '<div style="flex:1;min-width:0">'
      + '<div class="sumtitle">' + g.title + ' — ข้อ ' + g.list.join(', ') + '</div>'
      + '<div class="sumtodo">' + g.todo + '</div>'
    + '</div></div>'
  ).join('');
  if(!cards) cards = '<div class="empty">ถูกทั้งชุด • ไม่มีข้อค้าง</div>';

  $('quiz').style.display = 'none';
  const s = $('summary');
  s.style.display = '';
  s.innerHTML =
    '<div class="ribbon"><span>สรุปผล</span></div>'
    + '<div class="sumtop card">'
      + '<div class="sumscore">ถูก ' + correct + ' / ' + SET.n + '</div>'
      + '<div class="sumtime">' + timeLine + '</div>'
    + '</div>'
    + '<div class="stack" style="margin-top:12px">' + cards + '</div>'
    + '<div class="grid" style="margin-top:16px;gap:8px">'
      + '<button class="btn soft" id="btnReview" style="flex:1">ทบทวนอีกครั้ง</button>'
      + '<a class="btn primary" href="../index.html" style="flex:1;text-align:center">หน้าแรก</a>'
    + '</div>';
  $('btnReview').onclick = () => { cur = 0; $('summary').style.display = 'none'; $('quiz').style.display = ''; renderQuestion(); startTimer(); };
  window.scrollTo(0, 0);
}

boot();
