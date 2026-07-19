/* ══════════════════════════════════════════════════════════
   assets/norm.js — แทนอักขระที่ฟอนต์ Layiji เรนเดอร์เพี้ยน (บั๊ก 3)
   ใช้ร่วมกันระหว่างเอนจินทำโจทย์ (set.js) กับหน้าปริ้น/PDF (print.js)
   *** ต้องเป็นตัวเดียวกันทั้งคู่ ไม่งั้นค่าตัวเลือกในกระดาษกับในแอปจะไม่ตรง ***
   ต้องโหลดไฟล์นี้ "ก่อน" set.js / print.js เสมอ
   ══════════════════════════════════════════════════════════ */
const norm = h => String(h == null ? '' : h)
  .replace(/\u00B7/g, '\u2022')          // middle dot -> bullet
  .replace(/\u00D7/g, '\u2715')          // multiply   -> cross
  .replace(/\u00F7/g, '/')               // divide     -> slash
  .replace(/\u00B9/g, '<sup>1</sup>')    // sup 1
  .replace(/\u00B2/g, '<sup>2</sup>')    // sup 2
  .replace(/\u00B3/g, '<sup>3</sup>')    // sup 3
  .replace(/\u00B0/g, '\u02DA')          // degree     -> ring
  .replace(/\u2212/g, '-');              // minus sign -> hyphen (no glyph in Layiji)

/* ตัดข้อความในชิปตัวเลือก — ถอด HTML เป็นข้อความก่อนตัด (กันตัดกลาง entity)
   ใช้ค่า max เดียวกันทั้งแอปและกระดาษ เพื่อให้ค่าตัวเลือกตรงกันเป๊ะ */
const CHIP_MAX = 22;
function chipText(html, max){
  const lim = max || CHIP_MAX;
  const d = document.createElement('div'); d.innerHTML = norm(html);
  let t = (d.textContent || '').replace(/\s+/g, ' ').trim();
  if(t.length > lim) t = t.slice(0, lim) + '\u2026';
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
