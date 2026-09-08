import xml.etree.ElementTree as ET
from collections import defaultdict

with open("user_sample.xml", "r", encoding="utf-8") as f:
    xml_str = f.read()

root = ET.fromstring(xml_str)

days = []
hours_map = {}
for d_idx, g in enumerate(root.find("Gunler").findall("Gun")):
    d_name = g.attrib.get("Adi")
    d_id = g.attrib.get("id")
    saatler = g.findall("Saat")
    days.append({"name": d_name, "id": d_id, "periods": len(saatler)})
    for p_idx, s in enumerate(saatler):
        s_id = s.attrib.get("id")
        hours_map[s_id] = (d_idx, p_idx)

teachers = {t.attrib.get("id"): t.attrib.get("Adi") for t in root.find("Ogretmenler").findall("Ogretmen")}
classes = {c.attrib.get("id"): c.attrib.get("Adi") for c in root.find("Siniflar").findall("Sinif")}
subjects = {s.attrib.get("id"): s.attrib.get("Adi") for s in root.find("Dersler").findall("Ders")}

secmeli_subjects = {}
for sid, sname in subjects.items():
    if "SEÇMELİ" in sname.upper():
        secmeli_subjects[sid] = sname

print(f"Found {len(secmeli_subjects)} SEÇMELİ dersler:")
for sid, sname in sorted(secmeli_subjects.items(), key=lambda x: x[1]):
    print(f"  {sid}: {sname}")

secmeli_placements = defaultdict(lambda: defaultdict(list))
subj_slots_total = defaultdict(set)

# Also let's check ALL grades (5th, 6th, 7th, 8th grade) and their SEÇMELİ schedule!
grade_secmeli_slots = defaultdict(lambda: defaultdict(set)) # grade (5,6,7,8) -> day -> set of periods

for td in root.find("TanimliDersler").findall("TanimliDers"):
    s_ids = td.attrib.get("Siniflar", "").split(",")
    t_ids = td.attrib.get("Ogretmenler", "").split(",")
    d_id = td.attrib.get("Ders")
    s_name = subjects.get(d_id, d_id)
    
    for kart in td.findall("Kart"):
        yerlesim = kart.attrib.get("Yerlesim", "")
        if yerlesim:
            for y in yerlesim.split(","):
                y = y.strip()
                if y in hours_map:
                    slot = hours_map[y]
                    subj_slots_total[s_name].add(slot)
                    for c_id in s_ids:
                        if c_id in classes:
                            c_name = classes[c_id]
                            secmeli_placements[s_name][c_name].append(slot)
                            if "SEÇMELİ" in s_name.upper():
                                # Extract grade: e.g. 5A -> 5, 6B -> 6, 7C -> 7, 8D -> 8
                                grade = c_name[0] if c_name and c_name[0] in '5678' else 'other'
                                grade_secmeli_slots[grade][slot[0]].add(slot[1])

print("\n--- SEÇMELİ DERSLER PLACEMENTS ACROSS DAYS & HOURS ---")
for s_name in sorted(subj_slots_total.keys()):
    if "SEÇMELİ" in s_name.upper():
        slots = subj_slots_total[s_name]
        days_used = set(d for d, p in slots)
        periods_used = set(p for d, p in slots)
        days_names = [days[d]["name"] for d in sorted(days_used)]
        print(f"\nDers: {s_name}")
        print(f"  Total Placements: {len(slots)} hours")
        print(f"  Days Used: {days_names} (indices: {sorted(days_used)})")
        print(f"  Periods Used: {[p+1 for p in sorted(periods_used)]} (indices: {sorted(periods_used)})")
        for c_name, c_slots in secmeli_placements[s_name].items():
            slot_names = [days[d]["name"] + " " + str(p+1) + ". saat" for d, p in c_slots]
            print(f"    Class {c_name:5}: {slot_names}")

print("\n--- SEÇMELİ DERSLER BY GRADE LEVEL (KADEMELERE GÖRE SEÇMELİ GÜN & SAATLERİ) ---")
for grade in sorted(grade_secmeli_slots.keys()):
    print(f"\nKademe {grade}. Sınıflar Seçmeli Ders Dağılımı:")
    for d, p_set in sorted(grade_secmeli_slots[grade].items()):
        p_list = sorted([p+1 for p in p_set])
        print(f"  {days[d]['name']} (Gün {d}): {p_list}. ders saatleri")

