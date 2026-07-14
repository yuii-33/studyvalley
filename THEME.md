# THEME — Study Valley

## ฟอนต์: Layiji (แก้แล้ว — ห้ามใช้ไฟล์ต้นฉบับ)

`assets/fonts/Layiji.woff2` **ไม่ใช่ไฟล์เดิม** — patch จาก `LayijiMahaniyomV1041.ttf` แก้ 2 บั๊ก
ถ้าเอาไฟล์ต้นฉบับมาใช้ซ้ำ บั๊กจะกลับมา

### บั๊ก 1 — สระบนโดนเฉือน

Layiji ประกาศ metric ต่ำกว่าหมึกจริง

| | ค่าเดิม | หมึกจริง |
|---|---|---|
| `hhea ascender` | 0.514 em | `์` พุ่งถึง **0.853 em** |

Chrome ใช้ `winAscent` (0.853) → ไม่ตัด
**iOS/WebKit ใช้ `hhea ascender` (0.514)** → เฉือนหัวสระทิ้ง

**แก้:**
```
hhea ascent      1052 → 1787     (0.873 em)
hhea descent     -390 → -869
winAscent        1747 → 1787
typoAscender     1052 → 1787
OS/2 version        3 → 4
USE_TYPO_METRICS  ปิด → เปิด
```

### บั๊ก 2 — สระ `ำ` กลายเป็น `า`

GSUB `liga` ของฟอนต์มีกฎกันพิมพ์สระซ้ำ **15 กฎ** ที่ขึ้นต้นด้วยนิคหิต รวมถึง

```
นิคหิต ํ  +  สระ า   →   สระ า      ← กลืนวงกลมทิ้ง
```

HarfBuzz (เอนจินจัดตัวอักษรของทุกเบราว์เซอร์) แตก `ำ` เป็น `ํ` + `า` เสมอตามมาตรฐาน Unicode
→ แตกเสร็จก็ไปโดนกฎนี้กินพอดี

| คำ | ลำดับ glyph | ผล |
|---|---|---|
| `ทำ` | `[ท, ํ, า]` → กฎ match | `[ท, า]` ✗ |
| `น้ำ` | `[น, ํ, ้, า]` → วรรณยุกต์คั่น | นิคหิตรอด ✓ |

**แก้:** ลบ ligature ที่ขึ้นต้นด้วย `nikhahitthai` ทั้ง 15 กฎ

### การใช้งาน

```css
@font-face{
  font-family:'Layiji';
  src:url('fonts/Layiji.woff2') format('woff2');
  font-weight:400 800;
  font-display:block;
  size-adjust:112%;      /* Layiji ตัวเล็กกว่าปกติ ต้องชดเชย */
}
```

⚠️ **ห้ามลิงก์ฟอนต์จากเน็ต** (Google Fonts ฯลฯ) — ต้องออฟไลน์ได้

---

## สี

```css
/* พื้น */
--paper:#EFE1C4    พื้นหลังนอกสุด
--panel:#FBF6EA    แผงใหญ่
--card:#FFFDF7     การ์ด
--line:#E6D4B2     ขอบแผง
--line-2:#EBDCC0   ขอบการ์ด

/* ตัวอักษร */
--ink:#4A3A2E      ตัวหลัก
--ink-hi:#5C4326   หัวข้อ
--muted:#A8926E    รอง
--dim:#B09A78      จาง

/* ทอง (accent หลัก) */
--gold:#F1D486     --gold-d:#E4A93C   --gold-x:#C08A28
--gold-pale:#FBEFC9  --gold-ring:#ECD08A  --gold-ink:#8A5A1E
--wood:#6B4A2E     แถบหัวเข้ม
--tan:#F3E7CE      ชิป/ปุ่มรอง

/* สถานะ */
--green:#8FBE6E    ปุ่มหลัก  (เงา #6E9B50)
--rose:#FBE3E4     เตือน/ใกล้ถึงกำหนด
--blue:#E1EEF3     อังกฤษ
--plum:#F0E9F8     mock / ข้อลึก
```

### เงาแข็ง — ลายเซ็นของธีม

```css
--lift-1: 0 3px 0 rgba(190,160,110,.20);                              /* การ์ด */
--lift-2: 0 4px 0 rgba(190,160,110,.30), 0 14px 30px rgba(120,90,40,.10);  /* แผง */
```

ไม่ใช่เงาฟุ้ง — เป็นเงาแข็งด้านล่าง ให้ความรู้สึกกระดาษหนา/ป้ายไม้

---

## ส่วนประกอบ

| class | ใช้ทำอะไร |
|---|---|
| `.panel` | แผงใหญ่ radius 26 |
| `.card` | การ์ด radius 16 |
| `.ribbon` | ป้ายหัวข้อ (มีสามเหลี่ยมสองข้าง) |
| `.chip` + `.gold/.green/.rose/.blue` | แท็กเล็ก |
| `.btn` + `.primary/.soft/.pill/.on/.off/.dash` | ปุ่ม |

---

## ภาพ

`assets/art.js` — SVG วาดเอง 15 ชิ้น **ห้ามใช้อีโมจิใน UI**

```js
import { ART } from './art.js';
el.innerHTML = ART.book(28);      // ระบุขนาดเป็น px
```

| กลุ่ม | ชิ้น |
|---|---|
| ห้องเรียน | `book` `rocket` |
| เป้าหมาย | `flag` `leaf` |
| หมุดหมาย | `castle` `tree` `chest` |
| รูปประจำตัว | `apple` `rocket` `sprout` `cat` `fox` `mushroom` `star` `rabbit` `cactus` |

---

## กฎเหล็ก (เคยพังมาแล้ว)

- ❌ `confirm()` / `alert()` — แอป HTML viewer บน iOS บล็อก กดแล้วเงียบ
  ✅ ใช้ **แตะสองครั้งยืนยัน**
- ❌ `location.reload()` · `beforeunload` — iOS ไม่รับประกัน
- ❌ อีโมจิใน UI · คำเชียร์ ("เยี่ยมมาก" "สู้ ๆ")
- ⚠️ `<input>` ตัดเนื้อหาตามกล่อง (ต่างจาก `<div>`) — ระวังสระบนโดนเฉือน
- ⚠️ `el.style.cssText = '...'` **ล้างสไตล์เดิมทั้งหมด** — อย่าเซ็ต style ทีละตัวก่อนหน้า
