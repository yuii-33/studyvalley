const C = {
  ink:'#5C4326', line:'#8A6A48', paper:'#FBF6EA', cream:'#F5EAD2',
  gold:'#F1D486', gold_d:'#E4A93C', gold_x:'#C08A28',
  green:'#8FBE6E', green_d:'#6E9B50', green_l:'#CADFB4',
  rose:'#E08A94', rose_d:'#C56C77',
  blue:'#7FBBD4', blue_d:'#4E90AF',
  plum:'#B79BD6', plum_d:'#8A6DB3',
  wood:'#B98A5A', wood_d:'#8A6A48',
  white:'#FFFDF7', red:'#D9584F',
};

const svg = (body, s) =>
  `<svg viewBox="0 0 64 64" width="${s}" height="${s}" fill="none" ` +
  `stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ` +
  `xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const ART = {

  /* ── ห้องเรียน ── */
  book: s => svg(`
    <path d="M12 14c0-2 1.5-3.5 3.5-3.5H50a2 2 0 0 1 2 2v37a2 2 0 0 1-2 2H15.5C13.5 51.5 12 50 12 48z" fill="${C.rose}"/>
    <path d="M12 44.5c0-2 1.5-3.5 3.5-3.5H52" fill="none"/>
    <path d="M20 10.5v30" stroke="${C.paper}" stroke-width="3"/>
    <path d="M30 19h14M30 26h10" stroke="${C.paper}" stroke-width="2.6"/>`, s),

  rocket: s => svg(`
    <path d="M32 8c7 6 10.5 14 10.5 22.5L38 41H26l-4.5-10.5C21.5 22 25 14 32 8z" fill="${C.blue}"/>
    <circle cx="32" cy="25" r="5" fill="${C.paper}"/>
    <path d="M21.5 30 14 38l6 1 2 6z" fill="${C.gold}"/>
    <path d="M42.5 30 50 38l-6 1-2 6z" fill="${C.gold}"/>
    <path d="M27 45c1.5 5 3 8 5 10 2-2 3.5-5 5-10z" fill="${C.gold_d}"/>`, s),

  /* ── เป้าหมาย ── */
  flag: s => svg(`
    <path d="M18 54V10" stroke="${C.wood_d}" stroke-width="3.4"/>
    <path d="M18 12h26l-5 8 5 8H18z" fill="${C.rose}"/>
    <path d="M12 54h14" stroke="${C.wood_d}" stroke-width="3.4"/>`, s),

  leaf: s => svg(`
    <path d="M14 50C14 28 28 14 50 14c0 22-14 36-36 36z" fill="${C.green}"/>
    <path d="M14 50 44 20" stroke="${C.green_d}"/>
    <path d="M24 34h9M31 27v9" stroke="${C.green_d}" stroke-width="2"/>`, s),

  /* ── หมุดหมายสัปดาห์ ── */
  castle: s => svg(`
    <path d="M12 52V24h8v-6h6v6h12v-6h6v6h8v28z" fill="${C.cream}"/>
    <path d="M26 52V38h12v14z" fill="${C.wood}"/>
    <path d="M32 38v14" stroke="${C.wood_d}" stroke-width="2"/>
    <circle cx="32" cy="29" r="3.5" fill="${C.gold}"/>`, s),

  tree: s => svg(`
    <path d="M32 8 46 30H18z" fill="${C.green}"/>
    <path d="M32 20 50 44H14z" fill="${C.green_d}"/>
    <path d="M28 44h8v10h-8z" fill="${C.wood}"/>`, s),

  chest: s => svg(`
    <path d="M12 30a20 20 0 0 1 40 0z" fill="${C.wood}"/>
    <path d="M12 30h40v20a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2z" fill="${C.wood_d}" stroke="${C.ink}"/>
    <path d="M12 30h40" stroke="${C.ink}"/>
    <rect x="28" y="26" width="8" height="12" rx="2" fill="${C.gold}"/>
    <circle cx="32" cy="32" r="1.8" fill="${C.ink}" stroke="none"/>`, s),

  /* ── รูปประจำตัว ── */
  apple: s => svg(`
    <path d="M32 18c-4-4-14-3-15 7-1 11 7 22 12 22 2 0 2-1.5 3-1.5s1 1.5 3 1.5c5 0 13-11 12-22-1-10-11-11-15-7z" fill="${C.red}"/>
    <path d="M32 18V9" stroke="${C.wood_d}" stroke-width="2.6"/>
    <path d="M32 12c4-5 9-4 9-4s.5 6-5 7c-3 .5-4-3-4-3z" fill="${C.green}"/>`, s),

  sprout: s => svg(`
    <path d="M32 54V26" stroke="${C.green_d}" stroke-width="3"/>
    <path d="M32 32C24 32 16 27 16 18c10 0 16 5 16 14z" fill="${C.green}"/>
    <path d="M32 38c8 0 16-5 16-14-10 0-16 5-16 14z" fill="${C.green_l}"/>
    <path d="M22 54h20" stroke="${C.wood_d}" stroke-width="3"/>`, s),

  cat: s => svg(`
    <path d="M16 26 14 12l11 6zM48 26l2-14-11 6z" fill="${C.cream}"/>
    <path d="M32 16c10 0 17 8 17 17s-7 17-17 17-17-8-17-17 7-17 17-17z" fill="${C.cream}"/>
    <circle cx="25" cy="32" r="2.2" fill="${C.ink}" stroke="none"/>
    <circle cx="39" cy="32" r="2.2" fill="${C.ink}" stroke="none"/>
    <path d="M32 38v2M28 42c1.5 1.5 6.5 1.5 8 0" stroke-width="2"/>`, s),

  fox: s => svg(`
    <path d="M14 20l4 12M50 20l-4 12" stroke="${C.gold_x}" stroke-width="3"/>
    <path d="M32 18c9 0 15 7 15 15 0 9-7 15-15 15s-15-6-15-15c0-8 6-15 15-15z" fill="${C.gold_d}"/>
    <path d="M32 34c4 0 7 3 7 7 0 4-3 7-7 7s-7-3-7-7c0-4 3-7 7-7z" fill="${C.paper}"/>
    <circle cx="25" cy="31" r="2" fill="${C.ink}" stroke="none"/>
    <circle cx="39" cy="31" r="2" fill="${C.ink}" stroke="none"/>
    <circle cx="32" cy="40" r="2.4" fill="${C.ink}" stroke="none"/>`, s),

  mushroom: s => svg(`
    <path d="M10 34c0-12 10-20 22-20s22 8 22 20z" fill="${C.rose_d}"/>
    <circle cx="22" cy="26" r="3.5" fill="${C.paper}" stroke="none"/>
    <circle cx="40" cy="24" r="4.5" fill="${C.paper}" stroke="none"/>
    <path d="M25 34h14v14a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4z" fill="${C.cream}"/>`, s),

  star: s => svg(`
    <path d="m32 10 6.6 13.6 15 2.2-10.8 10.5 2.6 14.9L32 44.2 18.6 51.2l2.6-14.9L10.4 25.8l15-2.2z" fill="${C.gold}"/>`, s),

  rabbit: s => svg(`
    <path d="M24 26 21 8c5 0 8 6 8 14zM40 26l3-18c-5 0-8 6-8 14z" fill="${C.cream}"/>
    <path d="M32 24c9 0 15 6 15 14s-6 14-15 14-15-6-15-14 6-14 15-14z" fill="${C.paper}"/>
    <circle cx="26" cy="36" r="2" fill="${C.ink}" stroke="none"/>
    <circle cx="38" cy="36" r="2" fill="${C.ink}" stroke="none"/>
    <path d="M32 42v2" stroke-width="2"/>`, s),

  cactus: s => svg(`
    <path d="M27 54V22a5 5 0 0 1 10 0v32z" fill="${C.green}"/>
    <path d="M27 34h-6a4 4 0 0 1-4-4v-4M37 30h6a4 4 0 0 0 4-4v-6" fill="none" stroke="${C.green_d}" stroke-width="6"/>
    <path d="M20 54h24" stroke="${C.wood_d}" stroke-width="3"/>`, s),

  /* ── เอนจินทำโจทย์ ── */
  bulb: s => svg(`
    <path d="M32 12c-8 0-14 6-14 13 0 5 3 8 5 12h18c2-4 5-7 5-12 0-7-6-13-14-13z" fill="${C.gold}" stroke="${C.gold_x}"/>
    <path d="M25 43h14M27 48h10" stroke="${C.gold_x}" stroke-width="2.4"/>
    <path d="M32 6v3M13 15l2.5 2.5M51 15l-2.5 2.5M10 31h3M51 31h3" stroke="${C.gold_d}" stroke-width="2"/>`, s),

  note: s => svg(`
    <path d="M16 12h24l8 8v32a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2z" fill="${C.paper}" stroke="${C.line}"/>
    <path d="M40 12v8h8" fill="${C.cream}" stroke="${C.line}"/>
    <path d="M21 30h22M21 37h22M21 44h14" stroke="${C.blue_d}" stroke-width="2.2"/>`, s),

  sure: s => svg(`
    <circle cx="32" cy="32" r="21" fill="${C.green}" stroke="${C.green_d}"/>
    <path d="M22 33l7 7 14-15" stroke="${C.white}" stroke-width="3.4"/>`, s),

  unsure: s => svg(`
    <circle cx="32" cy="32" r="21" fill="${C.gold}" stroke="${C.gold_x}"/>
    <path d="M26 27c0-4 3-6.5 6.5-6.5S39 23 39 27c0 4-5 5-6 8v2" stroke="${C.gold_x}" stroke-width="3"/>
    <circle cx="32" cy="45" r="2.2" fill="${C.gold_x}" stroke="none"/>`, s),

  alert: s => svg(`
    <path d="M32 12 54 50a2 2 0 0 1-2 3H12a2 2 0 0 1-2-3z" fill="${C.rose}" stroke="${C.rose_d}"/>
    <path d="M32 26v12" stroke="${C.white}" stroke-width="3.4"/>
    <circle cx="32" cy="45" r="2.4" fill="${C.white}" stroke="none"/>`, s),

  grid: s => svg(`
    <rect x="12" y="14" width="40" height="36" rx="4" fill="${C.cream}" stroke="${C.line}"/>
    <path d="M12 26h40M12 38h40M26 14v36M39 14v36" stroke="${C.wood_d}" stroke-width="2"/>`, s),

  home: s => svg(`
    <path d="M32 12 54 30v22a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V30z" fill="${C.gold}" stroke="${C.gold_x}"/>
    <path d="M8 32 32 13 56 32" stroke="${C.wood_d}" stroke-width="3"/>
    <path d="M26 54V38h12v16z" fill="${C.wood}"/>`, s),
};
