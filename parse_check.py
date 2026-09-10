import xml.etree.ElementTree as ET
import re

# Fix user_sample.xml if needed:
with open('user_sample.xml', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Make sure it closes properly
if not content.endswith('</DersProgrami>'):
    # find last </TanimliDers>
    idx = content.rfind('</TanimliDers>')
    if idx != -1:
        content = content[:idx+len('</TanimliDers>')] + '\n</TanimliDersler>\n</DersProgrami>'

tree = ET.fromstring(content)
# Let's map hours to (day_idx, period_idx)
saat_map = {}
gun_idx = 0
for gun in tree.findall('.//Gun'):
    gun_name = gun.get('Adi')
    p_idx = 0
    for saat in gun.findall('Saat'):
        s_id = saat.get('id')
        saat_map[s_id] = (gun_idx, p_idx, gun_name)
        p_idx += 1
    gun_idx += 1

# Let's map teachers
teachers = {}
for og in tree.findall('.//Ogretmen'):
    teachers[og.get('id')] = og.get('Adi')

# Let's check where each teacher has lessons
teacher_slots = {t_id: set() for t_id in teachers}
for td in tree.findall('.//TanimliDers'):
    t_ids = td.get('Ogretmenler', '').split(',')
    for kart in td.findall('Kart'):
        yerlesim = kart.get('Yerlesim', '')
        if yerlesim:
            for y in yerlesim.split(','):
                y = y.strip()
                if y in saat_map:
                    d, p, gname = saat_map[y]
                    for tid in t_ids:
                        if tid in teacher_slots:
                            teacher_slots[tid].add((d, p))

# Now let's analyze teacher patterns!
print(f"Total teachers: {len(teachers)}")
for tid, name in teachers.items():
    slots = teacher_slots[tid]
    if not slots:
        continue
    # Check periods per day
    days = set(d for d, p in slots)
    periods = [p for d, p in slots]
    min_p = min(periods)
    max_p = max(periods)
    
    # Check: does this teacher have NO lessons in the morning (e.g. p=0 or p=0,1 empty every day)?
    morning_slots = [s for s in slots if s[1] == 0]
    afternoon_slots = [s for s in slots if s[1] > 0]
    
    # Check if period 0 is empty on all days they teach
    p0_days = [d for d, p in slots if p == 0]
    p1_days = [d for d, p in slots if p == 1]
    
    # If teacher has lessons but NEVER in period 0 (or period 0 and 1):
    if len(slots) >= 6 and len(p0_days) == 0:
        print(f"Teacher NO P0: {name} (ID: {tid}) -> Total hours: {len(slots)}, Min period: {min_p+1}. ders, Days active: {len(days)}")
    if len(slots) >= 6 and len(p0_days) == 0 and len(p1_days) == 0:
        print(f"Teacher NO P0 and P1: {name} (ID: {tid}) -> Total hours: {len(slots)}, Min period: {min_p+1}. ders")

