/* ══════════════════════════════════════════════════════════
   assets/print.js — ใบข้อสอบสำหรับปริ้น / บันทึกเป็น PDF
   โจทย์ล้วน (ไม่มีเฉลย) · 1 ข้อไม่ขาดกลางหน้า · โจทย์ร่วมพิมพ์ครั้งเดียว
   ท้ายเล่มมีตารางคำตอบที่ใช้ "ค่าตัวเลือกเดียวกับในแอป" → ลอกแบบจับคู่ภาพ
   ต้องโหลด norm.js ก่อนไฟล์นี้
   ══════════════════════════════════════════════════════════ */
const $p = id => document.getElementById(id);
const QP = new URLSearchParams(location.search);
const PROOM = QP.get('room') === 'logic' ? 'logic' : 'posn';
const PDIR  = '../data/' + PROOM + '/';
const LET   = 'กขคง';

async function getJSON(path){
  const r = await fetch(path, {cache:'no-cache'});
  if(!r.ok) throw new Error(path + ' → ' + r.status);
  return r.json();
}

/* โจทย์ร่วม: ถ้าข้อติดกันมีกล่อง .rule เนื้อหาเหมือนกันเป๊ะ = ใช้ร่วมกัน พิมพ์ครั้งเดียว */
function ruleOf(html){
  const d = document.createElement('div'); d.innerHTML = html;
  const r = d.querySelector('.rule');
  return r ? r.outerHTML : null;
}
function withoutRule(html){
  const d = document.createElement('div'); d.innerHTML = html;
  const r = d.querySelector('.rule');
  if(r) r.remove();
  return d.innerHTML;
}

const isMC = q => Array.isArray(q.ch);

function renderQ(q, i, stripped){
  let h = '<div class="prq"><div class="prqno">ข้อ ' + (i+1) + '</div>'
        + '<div class="qbody prqbody">' + norm(stripped ? withoutRule(q.q) : q.q) + '</div>';
  if(isMC(q)){
    h += '<div class="prch">' + q.ch.map((c, k) =>
          '<div class="prc"><span class="prcl">' + LET[k] + '</span>'
        + '<span class="prct">' + norm(c) + '</span></div>').join('') + '</div>';
  } else {
    h += '<div class="prfill">ตอบ <span class="prline"></span></div>';
  }
  return h + '</div>';
}

/* ตารางคำตอบท้ายเล่ม — ใช้ norm() ตัวเดียวกับแอป (ตัวอักษรต้องแปลงเหมือนกัน)
   แต่ "ไม่ตัดข้อความ" เพราะกระดาษมีที่กว้าง โชว์เต็มอ่านง่ายกว่า
   (จับคู่กับในแอปด้วยตัวขึ้นต้น ไม่ต้องยาวเท่ากัน) */
const GRID_MAX = 120;
function renderGrid(qs){
  let h = '<div class="prgrid"><div class="prgh">ตารางคำตอบ</div>'
        + '<div class="prgnote">วงตัวอักษรที่ตอบ แล้วเอามาติ๊กในแอปตามนี้</div>';
  qs.forEach((q, i) => {
    h += '<div class="prgrow"><span class="prgno">' + (i+1) + '</span>';
    if(isMC(q)){
      h += '<span class="prgch">' + q.ch.map((c, k) =>
            '<span class="prgc"><b>' + LET[k] + '</b> ' + chipText(c, GRID_MAX) + '</span>').join('') + '</span>';
    } else {
      h += '<span class="prgch"><span class="prgfill"></span></span>';
    }
    h += '</div>';
  });
  return h + '</div>';
}

async function bootPrint(){
  const id = QP.get('id');
  const box = $p('paper');
  if(!id){ box.innerHTML = '<div class="empty">ไม่ได้ระบุชุด</div>'; return; }

  $p('backlink').href = 'set.html?' + (PROOM !== 'posn' ? 'room=' + PROOM + '&' : '') + 'id=' + id;

  let index, data;
  try{
    index = await getJSON(PDIR + 'index.json');
    data  = await getJSON(PDIR + id + '.json');
  }catch(e){
    box.innerHTML = '<div class="empty">เปิดชุดไม่ได้ — ต้องเปิดผ่านเว็บ ไม่ใช่เปิดไฟล์ตรง ๆ</div>';
    return;
  }

  const meta = (index.sets || []).find(s => s.id === id) || {};
  const qs = data.questions || [];
  document.title = (meta.title || id) + ' • ใบข้อสอบ';

  /* จัดกลุ่มข้อที่ใช้โจทย์ร่วมกัน (ติดกัน + .rule เหมือนกัน) */
  const groups = [];
  qs.forEach((q, i) => {
    const r = ruleOf(q.q), last = groups[groups.length - 1];
    if(last && r && last.rule === r) last.items.push({ q, i });
    else groups.push({ rule: r, items: [{ q, i }] });
  });

  let h = '<div class="prhead">'
        +   '<div class="prtitle">' + (meta.title || id) + '</div>'
        +   '<div class="prmeta">' + qs.length + ' ข้อ • เวลา ' + (data.targetMin || meta.targetMin || '-') + ' นาที</div>'
        +   '<div class="prfields">ชื่อ <span class="prline sm"></span>'
        +     ' วันที่ <span class="prline xs"></span>'
        +     ' เวลาที่ใช้ <span class="prline xs"></span> นาที</div>'
        + '</div>';

  groups.forEach(g => {
    const shared = g.rule && g.items.length > 1;
    if(shared){
      const a = g.items[0].i + 1, b = g.items[g.items.length - 1].i + 1;
      h += '<div class="prshared"><div class="prsh">ใช้ตอบข้อ ' + a + ' ถึง ' + b + '</div>'
        +  '<div class="qbody">' + norm(g.rule) + '</div></div>';
    }
    g.items.forEach(it => { h += renderQ(it.q, it.i, shared); });
  });

  h += renderGrid(qs);
  box.innerHTML = h;
  $p('btnPrint').onclick = () => window.print();
}

bootPrint();
