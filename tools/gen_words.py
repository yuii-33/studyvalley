#!/usr/bin/env python3
"""สร้างคลังคำศัพท์ english → data/english/words.json
รัน: python3 tools/gen_words.py   (จาก root ของ repo)
โครงคำ: {"w":"apple","th":"แอปเปิล","lv":1}  · lv 1=ง่าย 2=กลาง 3=ยาก
"""
import json, pathlib, sys, re

# ── lv1 : ง่าย (ป.5–6) ──
LV1 = [
 ("cat","แมว"),("dog","หมา"),("bird","นก"),("fish","ปลา"),("cow","วัว"),
 ("pig","หมู"),("duck","เป็ด"),("frog","กบ"),("bear","หมี"),("lion","สิงโต"),
 ("tiger","เสือ"),("horse","ม้า"),("sheep","แกะ"),("rabbit","กระต่าย"),("mouse","หนู"),
 ("snake","งู"),("monkey","ลิง"),("elephant","ช้าง"),("chicken","ไก่"),("ant","มด"),
 ("apple","แอปเปิล"),("banana","กล้วย"),("orange","ส้ม"),("grape","องุ่น"),("rice","ข้าว"),
 ("bread","ขนมปัง"),("egg","ไข่"),("milk","นม"),("meat","เนื้อ"),("cake","เค้ก"),
 ("water","น้ำ"),("candy","ลูกอม"),("lemon","มะนาว"),("mango","มะม่วง"),("soup","ซุป"),
 ("head","หัว"),("hair","ผม"),("eye","ตา"),("ear","หู"),("nose","จมูก"),
 ("mouth","ปาก"),("hand","มือ"),("foot","เท้า"),("arm","แขน"),("leg","ขา"),
 ("house","บ้าน"),("door","ประตู"),("window","หน้าต่าง"),("table","โต๊ะ"),("chair","เก้าอี้"),
 ("bed","เตียง"),("book","หนังสือ"),("pen","ปากกา"),("pencil","ดินสอ"),("bag","กระเป๋า"),
 ("clock","นาฬิกา"),("cup","ถ้วย"),("box","กล่อง"),("key","กุญแจ"),("toy","ของเล่น"),
 ("ball","ลูกบอล"),("doll","ตุ๊กตา"),("sun","ดวงอาทิตย์"),("moon","ดวงจันทร์"),("star","ดาว"),
 ("sky","ท้องฟ้า"),("rain","ฝน"),("wind","ลม"),("tree","ต้นไม้"),("flower","ดอกไม้"),
 ("leaf","ใบไม้"),("grass","หญ้า"),("river","แม่น้ำ"),("sea","ทะเล"),("cloud","เมฆ"),
 ("fire","ไฟ"),("snow","หิมะ"),("mother","แม่"),("father","พ่อ"),("sister","พี่สาว"),
 ("brother","พี่ชาย"),("baby","ทารก"),("friend","เพื่อน"),("teacher","ครู"),("boy","เด็กชาย"),
 ("girl","เด็กหญิง"),("run","วิ่ง"),("walk","เดิน"),("jump","กระโดด"),("eat","กิน"),
 ("drink","ดื่ม"),("sleep","นอน"),("read","อ่าน"),("write","เขียน"),("sing","ร้องเพลง"),
 ("play","เล่น"),("swim","ว่ายน้ำ"),("dance","เต้น"),("cook","ทำอาหาร"),("draw","วาดรูป"),
 ("red","สีแดง"),("blue","สีน้ำเงิน"),("green","สีเขียว"),("black","สีดำ"),("white","สีขาว"),
 ("big","ใหญ่"),("small","เล็ก"),("hot","ร้อน"),("cold","หนาว"),("happy","มีความสุข"),
 ("sad","เศร้า"),("fast","เร็ว"),("slow","ช้า"),("good","ดี"),("new","ใหม่"),
]

# ── lv2 : กลาง (ม.1) ──
LV2 = [
 ("science","วิทยาศาสตร์"),("history","ประวัติศาสตร์"),("subject","วิชา"),("lesson","บทเรียน"),("homework","การบ้าน"),
 ("student","นักเรียน"),("library","ห้องสมุด"),("classroom","ห้องเรียน"),("answer","คำตอบ"),("question","คำถาม"),
 ("ruler","ไม้บรรทัด"),("weather","สภาพอากาศ"),("planet","ดาวเคราะห์"),("forest","ป่า"),("ocean","มหาสมุทร"),
 ("mountain","ภูเขา"),("island","เกาะ"),("desert","ทะเลทราย"),("volcano","ภูเขาไฟ"),("insect","แมลง"),
 ("plant","พืช"),("energy","พลังงาน"),("engine","เครื่องยนต์"),("machine","เครื่องจักร"),("robot","หุ่นยนต์"),
 ("morning","ตอนเช้า"),("evening","ตอนเย็น"),("weekend","สุดสัปดาห์"),("holiday","วันหยุด"),("market","ตลาด"),
 ("station","สถานี"),("hospital","โรงพยาบาล"),("airport","สนามบิน"),("kitchen","ครัว"),("garden","สวน"),
 ("village","หมู่บ้าน"),("city","เมือง"),("country","ประเทศ"),("bridge","สะพาน"),("castle","ปราสาท"),
 ("study","ศึกษา"),("learn","เรียนรู้"),("teach","สอน"),("travel","เดินทาง"),("visit","ไปเยี่ยม"),
 ("remember","จำ"),("forget","ลืม"),("believe","เชื่อ"),("decide","ตัดสินใจ"),("explain","อธิบาย"),
 ("describe","บรรยาย"),("compare","เปรียบเทียบ"),("collect","สะสม"),("invent","ประดิษฐ์"),("discover","ค้นพบ"),
 ("imagine","จินตนาการ"),("follow","ติดตาม"),("choose","เลือก"),("build","สร้าง"),("climb","ปีน"),
 ("important","สำคัญ"),("difficult","ยาก"),("beautiful","สวยงาม"),("dangerous","อันตราย"),("delicious","อร่อย"),
 ("favorite","ที่ชื่นชอบ"),("popular","เป็นที่นิยม"),("famous","มีชื่อเสียง"),("strange","แปลก"),("quiet","เงียบ"),
 ("careful","ระมัดระวัง"),("honest","ซื่อสัตย์"),("brave","กล้าหาญ"),("clever","ฉลาด"),("gentle","อ่อนโยน"),
 ("polite","สุภาพ"),("healthy","แข็งแรง"),("hungry","หิว"),("tired","เหนื่อย"),("angry","โกรธ"),
 ("dream","ความฝัน"),("idea","ความคิด"),("story","เรื่องราว"),("music","ดนตรี"),("picture","รูปภาพ"),
 ("letter","จดหมาย"),("present","ของขวัญ"),("treasure","สมบัติ"),("journey","การเดินทาง"),("adventure","การผจญภัย"),
 ("message","ข้อความ"),("future","อนาคต"),("reason","เหตุผล"),("chance","โอกาส"),("problem","ปัญหา"),
 ("promise","สัญญา"),("secret","ความลับ"),("danger","อันตราย"),("safe","ปลอดภัย"),("empty","ว่างเปล่า"),
 ("bright","สว่าง"),("heavy","หนัก"),("simple","ง่าย"),("special","พิเศษ"),("useful","มีประโยชน์"),
]

# ── lv3 : ยาก (ม.2) ──
LV3 = [
 ("knowledge","ความรู้"),("experience","ประสบการณ์"),("education","การศึกษา"),("information","ข้อมูล"),("communication","การสื่อสาร"),
 ("imagination","จินตนาการ"),("environment","สิ่งแวดล้อม"),("community","ชุมชน"),("government","รัฐบาล"),("technology","เทคโนโลยี"),
 ("opportunity","โอกาส"),("responsibility","ความรับผิดชอบ"),("relationship","ความสัมพันธ์"),("development","การพัฒนา"),("population","ประชากร"),
 ("generation","รุ่น"),("tradition","ประเพณี"),("culture","วัฒนธรรม"),("society","สังคม"),("economy","เศรษฐกิจ"),
 ("mathematics","คณิตศาสตร์"),("computer","คอมพิวเตอร์"),("program","โปรแกรม"),("algorithm","ขั้นตอนวิธี"),("function","ฟังก์ชัน"),
 ("variable","ตัวแปร"),("average","ค่าเฉลี่ย"),("percent","เปอร์เซ็นต์"),("triangle","สามเหลี่ยม"),("diameter","เส้นผ่านศูนย์กลาง"),
 ("chemistry","เคมี"),("biology","ชีววิทยา"),("physics","ฟิสิกส์"),("gravity","แรงโน้มถ่วง"),("molecule","โมเลกุล"),
 ("experiment","การทดลอง"),("evidence","หลักฐาน"),("theory","ทฤษฎี"),("method","วิธีการ"),("research","การวิจัย"),
 ("analyze","วิเคราะห์"),("calculate","คำนวณ"),("organize","จัดระเบียบ"),("recognize","จดจำได้"),("represent","แทน"),
 ("determine","กำหนด"),("demonstrate","สาธิต"),("participate","มีส่วนร่วม"),("concentrate","มีสมาธิ"),("appreciate","เห็นคุณค่า"),
 ("encourage","ให้กำลังใจ"),("achieve","บรรลุ"),("improve","ปรับปรุง"),("produce","ผลิต"),("require","ต้องการ"),
 ("provide","จัดหา"),("receive","ได้รับ"),("prepare","เตรียม"),("continue","ดำเนินต่อ"),("consider","พิจารณา"),
 ("suggest","แนะนำ"),("increase","เพิ่มขึ้น"),("decrease","ลดลง"),("measure","วัด"),("predict","ทำนาย"),
 ("observe","สังเกต"),("translate","แปล"),("compete","แข่งขัน"),("connect","เชื่อมต่อ"),("protect","ปกป้อง"),
 ("creative","สร้างสรรค์"),("curious","อยากรู้อยากเห็น"),("confident","มั่นใจ"),("generous","ใจกว้าง"),("patient","อดทน"),
 ("responsible","รับผิดชอบ"),("independent","เป็นอิสระ"),("intelligent","ฉลาด"),("comfortable","สบาย"),("necessary","จำเป็น"),
 ("possible","เป็นไปได้"),("familiar","คุ้นเคย"),("various","หลากหลาย"),("similar","คล้ายกัน"),("ancient","โบราณ"),
 ("modern","ทันสมัย"),("natural","เป็นธรรมชาติ"),("digital","ดิจิทัล"),("national","แห่งชาติ"),("several","หลาย"),
 ("difference","ความแตกต่าง"),("distance","ระยะทาง"),("surface","พื้นผิว"),("pattern","รูปแบบ"),("balance","ความสมดุล"),
 ("purpose","จุดประสงค์"),("progress","ความก้าวหน้า"),("success","ความสำเร็จ"),("failure","ความล้มเหลว"),("decision","การตัดสินใจ"),
]

def build():
    seen, out = set(), []
    for lv, lst in ((1, LV1), (2, LV2), (3, LV3)):
        for w, th in lst:
            k = w.lower()
            if not re.fullmatch(r"[a-z]+", k):
                sys.exit(f"คำไม่ใช่ a-z ล้วน: {w!r}")
            if k in seen:
                sys.exit(f"คำซ้ำ: {w!r}")
            seen.add(k)
            out.append({"w": k, "th": th, "lv": lv})
    return out

words = build()
data = {
    "levels": [
        {"id": "lv1", "name": "ง่าย"},
        {"id": "lv2", "name": "กลาง"},
        {"id": "lv3", "name": "ยาก"},
    ],
    "words": words,
}
root = pathlib.Path(__file__).resolve().parent.parent
out_dir = root / "data" / "english"
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / "words.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

n = len(words)
by = {1: 0, 2: 0, 3: 0}
for x in words:
    by[x["lv"]] += 1
print(f"รวม {n} คำ → data/english/words.json")
print(f"  ง่าย {by[1]} · กลาง {by[2]} · ยาก {by[3]}")
