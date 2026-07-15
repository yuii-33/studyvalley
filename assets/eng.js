/* ══════════════════════════════════════════════════════════
   assets/eng.js — เกมเก็บศัพท์ (กู้ภัยจรวด)
   ทายอักษรผิดได้ 6 ครั้ง · สุ่มไม่ซ้ำจนครบคลังก่อนวนใหม่
   ══════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const MAXWRONG = 6;
const KEYS = 'QWERTYUIOP ASDFGHJKL ZXCVBNM';

let DATA = null;            // { levels, words }
let pool = [], order = [], idx = 0;
let cur = null, guessed = new Set(), wrong = 0, phase = 'play';
let level = 'mix';
let daily = { date:'', count:0 }, streak = 0, dailyGoal = 5;

/* ── เซฟ 2 ที่ : localStorage + IndexedDB ── */
const SCHEMA = 1, KEY = 'sv.eng.v1';
const IDB_DB = 'studyvalley', IDB_STORE = 'kv';
function idbOpen(){ return new Promise((res,rej)=>{ const r=indexedDB.open(IDB_DB,1);
  r.onupgradeneeded=()=>r.result.createObjectStore(IDB_STORE); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
async function idbPut(k,d){ try{ const db=await idbOpen();
  await new Promise((res,rej)=>{ const tx=db.transaction(IDB_STORE,'readwrite');
    tx.objectStore(IDB_STORE).put(d,k); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); db.close(); }catch(e){} }
async function idbGet(k){ try{ const db=await idbOpen();
  const d=await new Promise((res,rej)=>{ const tx=db.transaction(IDB_STORE,'readonly');
    const rq=tx.objectStore(IDB_STORE).get(k); rq.onsuccess=()=>res(rq.result); rq.onerror=()=>rej(rq.error); }); db.close(); return d; }catch(e){ return null; } }

function todayStr(){ const d=new Date(); const p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+p(d.getDate()); }
function snapshot(){ return { v:SCHEMA, level, daily, streak }; }
let saveTimer;
function save(){ const d=snapshot();
  try{ localStorage.setItem(KEY, JSON.stringify(d)); }catch(e){}
  clearTimeout(saveTimer); saveTimer=setTimeout(()=>idbPut(KEY,d),250); }

/* ── สุ่ม ── */
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

/* ── โหลด ── */
async function boot(){
  $('homelink').innerHTML = ART.home(17) + '<span>หน้าแรก</span>';
  const saved = await idbGet(KEY) || (()=>{ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } })();
  if(saved && saved.v===SCHEMA){
    if(['mix','lv1','lv2','lv3'].includes(saved.level)) level = saved.level;
    if(saved.daily) daily = saved.daily;
    streak = saved.streak||0;
  }
  if(daily.date !== todayStr()) daily = { date:todayStr(), count:0 };

  try{ DATA = await (await fetch('../data/english/words.json',{cache:'no-cache'})).json(); }
  catch(e){ $('stage').innerHTML='<div class="empty">เปิดคลังคำไม่ได้ — ต้องเปิดผ่านเว็บ (เซิร์ฟเวอร์)</div>'; return; }

  renderChips();
  buildKeyboard();
  $('nextBtn').onclick = nextWord;
  $('speakBtn').onclick = ()=> speak(cur && cur.w);
  document.addEventListener('keydown', onPhysicalKey);
  startLevel(level);
}

/* ── ระดับ ── */
function renderChips(){
  const defs = [{id:'mix',name:'คละ'}].concat(DATA.levels.map((l,i)=>({id:l.id,name:l.name,lv:i+1})));
  $('lvchips').innerHTML = defs.map(c =>
    '<button class="lvchip'+(c.id===level?' on':'')+'" data-lv="'+c.id+'">'+c.name+'</button>').join('');
  $('lvchips').querySelectorAll('[data-lv]').forEach(b=>{
    b.onclick = ()=>{ if(b.dataset.lv===level && phase==='play') return; startLevel(b.dataset.lv); };
  });
}
function startLevel(lv){
  level = lv;
  const want = lv==='mix' ? null : Number(lv.slice(2));
  pool = DATA.words.filter(w => want===null || w.lv===want);
  order = shuffle(pool.map((_,i)=>i));
  idx = 0;
  renderChips(); save();
  loadWord();
}

/* ── คำ ── */
function loadWord(){
  if(idx >= order.length){ order = shuffle(order); idx = 0; }   // ครบคลังแล้ว วนใหม่
  cur = pool[order[idx]];
  guessed = new Set(); wrong = 0; phase = 'play';
  $('engnav').style.display = 'none';
  $('speakBtn').style.display = 'none';
  render();
}
function nextWord(){ idx++; loadWord(); }

/* ── ทาย ── */
function guess(ch){
  if(phase!=='play' || guessed.has(ch)) return;
  guessed.add(ch);
  const word = cur.w.toUpperCase();
  if(word.includes(ch)){
    if([...word].every(c => guessed.has(c) || !/[A-Z]/.test(c))) win();
    else render();
  } else {
    wrong++;
    if(wrong >= MAXWRONG) lose();
    else render();
  }
}
function win(){
  phase='reveal'; streak++;
  daily = { date:todayStr(), count: daily.count + 1 };
  save(); render(); speak(cur.w);
}
function lose(){ phase='reveal'; streak=0; save(); render(); speak(cur.w); }

function onPhysicalKey(e){
  const ch = (e.key||'').toUpperCase();
  if(ch.length===1 && ch>='A' && ch<='Z') guess(ch);
  else if(e.key==='Enter' && phase==='reveal') nextWord();
}

/* ── เสียง (offline TTS) ── */
function speak(text){
  try{ const sy=window.speechSynthesis; if(!sy||!text) return;
    sy.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='en-US'; u.rate=0.75; u.pitch=1;
    const v=(sy.getVoices()||[]).find(x=>x.lang && x.lang.toLowerCase().startsWith('en'));
    if(v) u.voice=v;
    sy.speak(u);
  }catch(e){}
}

/* ── คีย์บอร์ด ── */
function buildKeyboard(){
  $('keyboard').innerHTML = KEYS.split(' ').map(row =>
    '<div class="krow">'+[...row].map(ch =>
      '<button class="kbtn" data-k="'+ch+'">'+ch+'</button>').join('')+'</div>').join('');
  $('keyboard').querySelectorAll('[data-k]').forEach(b=>{ b.onclick = ()=>guess(b.dataset.k); });
}

/* ── จรวด ── */
const PART_ORDER = ['flame','finR','finL','win','nose','body'];   // ลำดับพังเมื่อทายผิด
function rocketSVG(){
  const dead = new Set(PART_ORDER.slice(0, wrong));
  const won = phase==='reveal' && wrong < MAXWRONG;
  const op = p => dead.has(p) ? '0.12' : '1';
  const lift = won ? ' transform:translateY(-14px)' : (phase==='reveal' ? ' transform:rotate(8deg)' : '');
  return '<svg viewBox="0 0 120 150" width="112" height="146" class="rocket'+(won?' launch':'')+'" style="overflow:visible'+lift+'">'+
    '<g opacity="'+op('body')+'"><rect x="46" y="40" width="28" height="66" rx="12" fill="#EDEFF3" stroke="#B9C6D1" stroke-width="2.5"/></g>'+
    '<g opacity="'+op('nose')+'"><path d="M60 12 Q76 34 74 52 L46 52 Q44 34 60 12 Z" fill="#E05A3C" stroke="#B23D2A" stroke-width="2.5"/></g>'+
    '<g opacity="'+op('win')+'"><circle cx="60" cy="70" r="9" fill="#7FC4F5" stroke="#3F7FB5" stroke-width="2.5"/></g>'+
    '<g opacity="'+op('finL')+'"><path d="M46 88 L30 116 L46 108 Z" fill="#E05A3C" stroke="#B23D2A" stroke-width="2"/></g>'+
    '<g opacity="'+op('finR')+'"><path d="M74 88 L90 116 L74 108 Z" fill="#E05A3C" stroke="#B23D2A" stroke-width="2"/></g>'+
    '<g opacity="'+op('flame')+'"><path d="M52 106 Q60 132 68 106 Z" fill="#FFB347"/><path d="M55 106 Q60 122 65 106 Z" fill="#FF7A3C"/></g>'+
  '</svg>';
}

/* ── เรนเดอร์ ── */
function render(){
  $('streak').style.display = streak>1 ? '' : 'none';
  $('streak').innerHTML = ART.star(16) + '<span>' + streak + '</span>';

  $('dailyN').textContent = daily.count;
  $('dailyGoal').textContent = dailyGoal;
  const dp = Math.min(100, Math.round(daily.count/dailyGoal*100));
  $('dailyfill').style.width = dp + '%';
  $('dailyDone').style.display = daily.count>=dailyGoal ? '' : 'none';

  const reveal = phase==='reveal';
  const solved = reveal && wrong < MAXWRONG;

  $('stage').innerHTML =
    '<div class="lives">พลาดได้อีก ' + Math.max(0, MAXWRONG-wrong) + ' ครั้ง</div>' + rocketSVG();

  /* ช่องอักษร */
  const word = cur.w.toUpperCase();
  $('slots').innerHTML = [...word].map(ch=>{
    if(!/[A-Z]/.test(ch)) return '<div class="slot gap"></div>';
    const shown = guessed.has(ch) || reveal;
    const missed = reveal && !guessed.has(ch);
    return '<div class="slot'+(missed?' missed':'')+(shown&&guessed.has(ch)?' hit':'')+'">'+(shown?ch:'')+'</div>';
  }).join('');

  $('hinttext').innerHTML = 'ความหมาย • <b>' + cur.th + '</b>';

  /* คีย์บอร์ด */
  $('keyboard').querySelectorAll('[data-k]').forEach(b=>{
    const k = b.dataset.k;
    b.className = 'kbtn';
    if(guessed.has(k)) b.classList.add(word.includes(k) ? 'right' : 'wrong');
    b.disabled = guessed.has(k) || reveal;
  });

  /* ท้ายรอบ */
  if(reveal){
    $('speakBtn').style.display = '';
    $('speakBtn').innerHTML = ART['note'](17) + '<span>ฟังเสียงอีกครั้ง</span>';
    $('engnav').style.display = '';
    let head;
    if(solved) head = '<div class="engresult ok">' + ART.sure(20) + '<span>เก็บได้แล้ว • ' + cur.w + '</span></div>';
    else head = '<div class="engresult no">' + ART['alert'](20) + '<span>คำนี้คือ ' + cur.w + ' • ' + cur.th + ' — ลองคำใหม่</span></div>';
    $('hinttext').innerHTML = head;
  }
}

boot();
