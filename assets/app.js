/* ═══ ตัวอย่าง — ข้อมูลจำลอง (ของจริงจะโหลดจาก data/posn/index.json) ═══ */
const PROFILES = [
  {id:'tubtim', name:'ทับทิม', art:'apple',  color:'#C56C77'},
  {id:'tham',   name:'ธามม์',  art:'rocket', color:'#4E90AF'},
];
const AVATARS = ['apple','rocket','sprout','cat','fox','mushroom','star','rabbit','cactus'];
const WEEKS = [
  {n:1, label:'สัปดาห์ 1 • ปูพื้น',    art:'castle', done:14, total:14, xp:1810},
  {n:2, label:'สัปดาห์ 2 • ระดับสอบ', art:'tree',   done:13, total:13, xp:1640},
  {n:3, label:'สัปดาห์ 3 • ท้าทาย',   art:'chest',  done:2,  total:6,  xp:280 },
];
const store = {
  tubtim:{name:'ทับทิม', art:'apple',
    goals:[{id:'g1',title:'สอบ สอวน. คอมพิวเตอร์ ค่าย 1',kind:'exam',date:'2026-08-30',room:'posn'},
           {id:'g2',title:'ทบทวนข้อที่ผิดทุกวัน',kind:'daily'}]},
  tham:{name:'ธามม์', art:'rocket',
    goals:[{id:'g3',title:'สอบเข้า ม.1 สาธิต มช.',kind:'exam',date:'2027-01-17'}]},
};
let who = 'tubtim', armDel = null, armTimer = null, formKind = 'exam';

const $ = id => document.getElementById(id);
const TH_M = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const thDate = s => { const d = new Date(s+'T00:00:00');
  return d.getDate()+' '+TH_M[d.getMonth()]+' '+(d.getFullYear()+543); };
const daysLeft = s => Math.ceil((new Date(s+'T00:00:00') - new Date().setHours(0,0,0,0))/864e5);

function render(){
  const me = store[who];

  /* สลับคน */
  $('who').innerHTML = '';
  PROFILES.forEach(p=>{
    const b = document.createElement('button');
    b.className = 'btn pill';
    b.innerHTML = ART[p.art](20)+'<span>'+p.name+'</span>';
    b.style.cssText = p.id===who
      ? 'background:#fff;color:'+p.color+';box-shadow:0 0 0 2px '+p.color+',0 3px 0 rgba(150,100,40,.18)'
      : 'background:var(--tan);color:var(--tan-ink);box-shadow:0 2px 0 rgba(150,100,40,.12)';
    b.onclick = ()=>{ who=p.id; armDel=null; $('avPick').style.display='none';
                      $('addForm').style.display='none'; $('addBtn').style.display=''; render(); };
    $('who').appendChild(b);
  });

  /* โปรไฟล์ */
  $('nm').value = me.name;
  $('av').innerHTML = ART[me.art](38);
  $('heroPin').innerHTML = ART[me.art](18);

  /* XP + เลเวล */
  const totalXP = WEEKS.reduce((a,w)=>a+w.xp,0);
  const PER = 1000, level = Math.floor(totalXP/PER)+1, inLv = totalXP%PER;
  const pct = Math.round(inLv/PER*100);
  $('lv').textContent = 'Lv '+level;
  $('xp').textContent = totalXP.toLocaleString()+' XP';
  $('lvfill').style.width = pct+'%';
  $('heroPin').style.left = Math.min(96,Math.max(4,pct))+'%';
  $('toNext').textContent = 'อีก '+(PER-inLv)+' XP จะเลเวลอัป';

  /* อีโมจิ */
  $('emo').innerHTML = '';
  AVATARS.forEach(a=>{
    const b = document.createElement('button');
    b.innerHTML = ART[a](28);
    b.style.cssText = 'width:46px;height:46px;border:0;border-radius:12px;cursor:pointer;'+
      'display:flex;align-items:center;justify-content:center;'+
      (a===me.art ? 'background:var(--gold);box-shadow:0 0 0 2px var(--gold-d)'
                  : 'background:#F5EAD2;box-shadow:0 0 0 1.5px var(--line)');
    b.onclick = ()=>{ me.art = a; render(); };
    $('emo').appendChild(b);
  });

  /* เป้าหมาย */
  const G = $('goals'); G.innerHTML = '';
  if(!me.goals.length){
    G.innerHTML = '<div class="empty">ยังไม่มีเป้าหมาย — เพิ่มได้เลย</div>';
  }
  me.goals.forEach(g=>{
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
      me.goals = me.goals.filter(x=>x.id!==g.id);
      armDel = null; render();
    };
    el.appendChild(del);
    G.appendChild(el);
  });

  /* หมุดหมาย */
  $('weeks').innerHTML = WEEKS.map(w=>{
    const p = w.total ? Math.round(w.done/w.total*100) : 0;
    return '<div class="card" style="flex:1;min-width:210px">'+
      '<div class="row">'+
        '<div class="tile">'+ART[w.art](28)+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-weight:600;font-size:14px;color:var(--dim)">'+w.label+'</div>'+
          '<div style="font-weight:800;font-size:17.5px">เก็บได้ '+w.done+'/'+w.total+' ชุด</div>'+
        '</div>'+
        '<span class="chip gold" style="font-weight:800;font-size:14px;padding:4px 9px">+'+w.xp+' XP</span>'+
      '</div>'+
      '<div class="pbar"><i style="width:'+p+'%"></i></div>'+
    '</div>';
  }).join('');
}

/* ฟอร์มเพิ่มเป้าหมาย */
$('avBtn').onclick = ()=>{ const p=$('avPick');
  p.style.display = p.style.display==='none' ? '' : 'none'; };
$('nm').oninput = e => { store[who].name = e.target.value; };
$('addBtn').onclick = ()=>{ $('addForm').style.display=''; $('addBtn').style.display='none'; };
$('gCancel').onclick = ()=>{ $('addForm').style.display='none'; $('addBtn').style.display=''; $('msg').textContent=''; };
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
  if(!t){ $('msg').textContent = 'ใส่ชื่อเป้าหมายก่อนนะ'; return; }
  const g = {id:'g'+Date.now(), title:t, kind:formKind};
  if($('gRoom').value) g.room = $('gRoom').value;
  if(formKind==='exam' && $('gDate').value) g.date = $('gDate').value;
  store[who].goals.push(g);
  $('gTitle').value=''; $('gDate').value=''; $('gRoom').value='';
  $('addForm').style.display='none'; $('addBtn').style.display=''; $('msg').textContent='';
  render();
};

$('rmA').innerHTML = ART.book(28);
$('rmB').innerHTML = ART.rocket(28);
render();
