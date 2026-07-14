#!/usr/bin/env python3
"""ตรวจกฎเหล็กก่อน commit — รันจาก root ของ repo:  python3 check.py"""
import re, sys, pathlib

FILES = [p for p in pathlib.Path('.').rglob('*')
         if p.suffix in ('.html', '.js', '.css') and 'node_modules' not in p.parts]

def strip_comments(t):
    t = re.sub(r'<!--.*?-->', '', t, flags=re.S)      # คอมเมนต์ HTML
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)       # คอมเมนต์บล็อก
    t = re.sub(r'(?<!:)//[^\n]*', '', t)              # คอมเมนต์บรรทัด (ไม่กิน https://)
    return t

RULES = [
    ('เรียก confirm/alert',      lambda t: re.findall(r'\b(?:confirm|alert)\s*\(', t)),
    ('location.reload',          lambda t: re.findall(r'location\.reload', t)),
    ('beforeunload',             lambda t: re.findall(r'beforeunload', t)),
    ('ลิงก์ทรัพยากรจากเน็ต',      lambda t: re.findall(r'https?://(?!www\.w3\.org)[^\s"\')]+', t)),
    ("ตัวคั่น '·' (ต้องใช้ '•')",  lambda t: re.findall('\u00B7', t)),
    ('อีโมจิใน UI',              lambda t: re.findall(r'[\U0001F300-\U0001FAFF\u2600-\u27BF]', t)),
    ('คำเชียร์',                 lambda t: re.findall(r'เยี่ยมมาก|สู้ ๆ|เก่งมาก', t)),
]

fail = False
print('── ตรวจกฎเหล็ก ──')
for name, rule in RULES:
    bad = []
    for p in FILES:
        hits = rule(strip_comments(p.read_text(encoding='utf-8')))
        if hits:
            bad.append(f'{p} ({len(hits)})')
    if bad:
        print(f'  ✗ {name}: ' + ', '.join(bad)); fail = True

if not fail:
    print(f'  ✓ ผ่านทั้งหมด ({len(FILES)} ไฟล์)')
sys.exit(1 if fail else 0)
