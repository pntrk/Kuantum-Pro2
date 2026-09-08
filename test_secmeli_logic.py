import xml.etree.ElementTree as ET
from collections import defaultdict

# Let us verify the exact behavior
days = [
    {"name": "Pazartesi", "periods": 9},
    {"name": "Salı", "periods": 9},
    {"name": "Çarşamba", "periods": 9},
    {"name": "Perşembe", "periods": 9},
    {"name": "Cuma", "periods": 9},
    {"name": "Cumartesi", "periods": 4},
]

# Subject slots from XML
subject_slots = {
    "SEÇMELİ OKUMA BECERİLERİ": {"3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "3-6"}, # Only Perşembe (d=3)
    "TÜRKÇE": {"0-0", "0-1", "1-0", "1-1", "2-0", "2-1", "3-0", "4-0"}, # Multiple days
    "DYK": {"1-7", "1-8", "5-0", "5-1", "5-2", "5-3"},
    "YABANCI DİL ETKİNLİK": {"0-7", "0-8", "1-7", "1-8", "2-8", "3-7", "3-8", "4-7"},
}

normalDayCutoff = 7
hasWeekendSchool = True

constraints = defaultdict(list)

for sName, slots in subject_slots.items():
    nameUpper = sName.upper()
    isKurs = "DYK" in nameUpper or "ETKİNLİK" in nameUpper or "KURS" in nameUpper
    isSecmeli = "SEÇMELİ" in nameUpper or "SEÇ" in nameUpper or "REHBERLİK" in nameUpper
    
    # Check which days this subject actually has lessons in XML
    daysWithLessons = set(int(slot.split("-")[0]) for slot in slots)
    
    if isKurs:
        # Kurs: Daytime 1-7 closed
        for d in range(5):
            for p in range(normalDayCutoff):
                constraints[sName].append(f"{d}-{p}")
        hasWeekend = any(int(slot.split("-")[0]) >= 5 for slot in slots)
        if not hasWeekend and hasWeekendSchool:
            for d in range(5, len(days)):
                for p in range(days[d]["periods"]):
                    constraints[sName].append(f"{d}-{p}")
    elif isSecmeli:
        # SEÇMELİ / REHBERLİK:
        # 1) The days where it has NO lessons are COMPLETELY CONSTRAINED (CLOSED)!
        for d in range(len(days)):
            if d not in daysWithLessons:
                for p in range(days[d]["periods"]):
                    constraints[sName].append(f"{d}-{p}")
            else:
                # On the days where it is taught, after-school hours (8-9) are constrained
                if d < 5:
                    for p in range(normalDayCutoff, days[d]["periods"]):
                        constraints[sName].append(f"{d}-{p}")
    else:
        # Standard main subjects (TÜRKÇE, MATEMATİK, FEN, etc.)
        # Weekday after-school hours closed
        for d in range(5):
            for p in range(normalDayCutoff, days[d]["periods"]):
                constraints[sName].append(f"{d}-{p}")
        # Weekend closed
        for d in range(5, len(days)):
            for p in range(days[d]["periods"]):
                constraints[sName].append(f"{d}-{p}")

print("SEÇMELİ OKUMA BECERİLERİ constraints count:", len(constraints["SEÇMELİ OKUMA BECERİLERİ"]))
print("Days constrained for SEÇMELİ OKUMA BECERİLERİ:")
for d_idx, day in enumerate(days):
    day_c = [c for c in constraints["SEÇMELİ OKUMA BECERİLERİ"] if c.startswith(f"{d_idx}-")]
    print(f"  {day['name']}: {len(day_c)} / {day['periods']} periods constrained. ({'COMPLETELY CLOSED' if len(day_c) == day['periods'] else 'OPEN FOR LESSONS (p=0..6)'})")

