/* ══════════════════════════════════════════════════════════
   assets/xp.js — ระบบ EXP กลาง (ใช้ร่วมทุกหน้า)
   เน้นความสม่ำเสมอ : cap รายวัน + โบนัส streak · นับซ้ำไม่ได้
   เลเวลทุก 500 XP · ข้อถูก 15 · คำศัพท์ 10 · cap 300/วัน
   ══════════════════════════════════════════════════════════ */
const XP = (function(){
  const KEY = 'sv.xp.v1';
  const CAP = 300, PER_LEVEL = 500, BASE_POSN = 15, BASE_ENG = 10;
  const IDB_DB = 'studyvalley', IDB_STORE = 'kv';

  function idbOpen(){ return new Promise((res,rej)=>{ const r=indexedDB.open(IDB_DB,1);
    r.onupgradeneeded=()=>r.result.createObjectStore(IDB_STORE); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
  async function idbPut(k,d){ try{ const db=await idbOpen();
    await new Promise((res,rej)=>{ const tx=db.transaction(IDB_STORE,'readwrite');
      tx.objectStore(IDB_STORE).put(d,k); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); db.close(); }catch(e){} }

  const p2 = n => String(n).padStart(2,'0');
  function today(){ const d=new Date(); return d.getFullYear()+'-'+p2(d.getMonth()+1)+p2(d.getDate()); }
  function prevOf(t){ const [y,m,d]=t.split('-').map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()-1);
    return dt.getFullYear()+'-'+p2(dt.getMonth()+1)+p2(dt.getDate()); }

  function blank(){ return { v:1, total:0, day:today(), todayXP:0, streak:0, lastDay:'', awarded:{} }; }
  function read(){
    let s; try{ s=JSON.parse(localStorage.getItem(KEY)); }catch(e){ s=null; }
    if(!s || s.v!==1) s=blank();
    if(s.day !== today()){ s.day=today(); s.todayXP=0; }   // ขึ้นวันใหม่ → เริ่มนับ cap ใหม่
    return s;
  }
  function write(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} idbPut(KEY, s); }

  /* streak ที่ยัง "มีชีวิต" (ทำวันนี้ หรือ ทำเมื่อวาน) ไม่งั้นถือว่าขาด */
  function liveStreak(s){
    if(s.lastDay === s.day || s.lastDay === prevOf(s.day)) return s.streak;
    return 0;
  }

  function award(key, base){
    const s = read();
    if(s.awarded[key]) return;                    // ให้ครั้งเดียวต่อ event
    if(s.lastDay !== s.day){                       // กิจกรรมแรกของวัน → เดิน/รีเซ็ต streak + โบนัส
      s.streak = (s.lastDay === prevOf(s.day)) ? (s.streak||0)+1 : 1;
      s.lastDay = s.day;
      s.total += Math.min(50, s.streak*5);         // โบนัสความต่อเนื่อง (นอก cap)
    }
    const add = Math.min(base, Math.max(0, CAP - s.todayXP));
    s.awarded[key] = 1;
    s.total += add; s.todayXP += add;
    write(s);
  }

  return {
    award, CAP, PER_LEVEL, BASE_POSN, BASE_ENG,
    total: () => read().total,
    todayXP: () => read().todayXP,
    streak: () => liveStreak(read()),
    level: () => Math.floor(read().total/PER_LEVEL)+1,
    inLevel: () => read().total % PER_LEVEL,
  };
})();
