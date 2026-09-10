# encoding: utf-8
import json

# Define full mappings
DPRG_SHORT_TO_FULL_TEACHERS = {
    "AS": "HİDAYET AS",
    "HBT": "HARUN BARIŞ TAHTACI",
    "BŞK": "BAHADIR ŞAFAK KUMCU",
    "ÇİSEM": "ÇİSEM ALTINOVA",
    "YEŞİM": "YEŞİM BİÇER",
    "NURÇİ": "NURÇİN BÜYÜKYAKALI",
    "CİVAŞ": "ŞEBNEM CİVAŞ",
    "ŞEREF": "ŞEREF ÖZCAN",
    "ÖZGE": "ÖZGE KÜÇÜKDEMİR",
    "SEMRA": "SEMRA IŞIKLAR",
    "FADİME": "FADİME CANDAN LAZUT",
    "PALA": "HİLMİ PALA",
    "YELİZ": "YELİZ TUNÇ",
    "BİLAL": "BİLAL AKAR",
    "EMEL": "EMEL AYDIN",
    "SELCEN": "BÜŞRA SELCEN SERDAROĞLU",
    "ÇİÇEN": "NAGİHAN ÇİÇEN",
    "AYŞE": "AYŞE GÜL DEMİR",
    "ALPER": "ALPER KAYA",
    "ÜLKER": "SİBEL ÜLKER",
    "OYA": "OYA KIZILARSLAN",
    "DERYA": "DERYA ERTUĞRUL",
    "ÖZNUR": "ÖZNUR KANAL",
    "ORHAN": "ORHAN BÜYÜKYILMAZ",
    "GÜLSEREN": "GÜLSEREN DEMİR",
    "FUNDA": "FUNDA GÜNER",
    "ABUY": "MEHMET ABUY",
    "PINAR": "PINAR BAYKUL",
    "ERNUR": "ERNUR YAMAN",
    "AĞGÜL": "SİBEL AĞGÜL",
    "AYSEL": "AYSEL GÜNDÜZ",
    "ZAFER": "ZAFER KALKAN",
    "MELEK": "MELEK ÖZTÜRK",
    "ZEYNEP": "ZEYNEP GÜVEN",
    "SADIK": "SADIK ÇELİK",
    "KADER": "KADER MALLI",
    "CANAN": "NAHİDE CANAN ŞUMNU",
    "ALPTE": "ALPTEKİN BAŞTÜRK",
    "SERTE": "SERTER IŞIKLAR",
    "SEVGİ": "SEVGİ KIRMACI",
    "BİRÖZ": "BİRCAN ÖZTRAK"
}

DPRG_SHORT_TO_FULL_SUBJECTS = {
    "TÜRK": "TÜRKÇE",
    "MAT": "MATEMATİK",
    "FEN": "FEN BİLİMLERİ",
    "İNK": "T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK",
    "SOS": "SOSYAL BİLGİLER",
    "İNG": "İNGİLİZCE",
    "DKAB": "DİN KÜLTÜRÜ VE AHLAK BİLGİSİ",
    "SANAT": "GÖRSEL SANATLAR",
    "BEDEN": "BEDEN EĞİTİMİ VE SPOR",
    "MÜZİK": "MÜZİK",
    "BİLG": "BİLİŞİM TEKNOLOJİLERİ VE YAZILIM",
    "TEKNO": "TEKNOLOJİ VE TASARIM",
    "REHBE": "REHBERLİK VE YÖNLENDİRME",
    "OKUMA": "SEÇMELİ OKUMA BECERİLERİ",
    "BİLİM": "SEÇMELİ MATEMATİK VE BİLİM UYGULAMALARI",
    "GÖRGÜ": "SEÇMELİ GÖRGÜ KURALLARI VE NEZAKET",
    "AHLAK": "SEÇMELİ AHLAK VE YURTTAŞLIK EĞİTİMİ",
    "SEÇİNG": "SEÇMELİ YABANCI DİL",
    "SPOR": "SEÇMELİ SPOR VE FİZİKİ ETKİNLİKLER",
    "YAZAR": "SEÇMELİ YAZARLIK VE YAZMA BECERİLERİ",
    "TEMELDİN": "SEÇMELİ TEMEL DİNİ BİLGİLER",
    "SİYER": "SEÇMELİ PEYGAMBERİMİZİN HAYATI",
    "HUKUK": "SEÇMELİ HUKUK VE ADALET",
    "OYUN": "SEÇMELİ OYUN VE OYUN ETKİNLİKLERİ",
    "ÇEVRE": "SEÇMELİ ÇEVRE VE İKLİM DEĞİŞİKLİĞİ",
    "KÜLTÜR": "SEÇMELİ KÜLTÜR VE MEDENİYETİMİZE YÖN VERENLER",
    "DESEĞ": "DESTEK EĞİTİM",
    "DYK": "DYK",
    "ETKİNLİK": "YABANCI DİL ETKİNLİK"
}

DPRG_FULL_TO_SHORT_NAMES = {}
for k, v in DPRG_SHORT_TO_FULL_TEACHERS.items():
    DPRG_FULL_TO_SHORT_NAMES[v] = k
for k, v in DPRG_SHORT_TO_FULL_SUBJECTS.items():
    DPRG_FULL_TO_SHORT_NAMES[v] = k

# Build the complete list of defined lessons
LESSONS = []

def add_lesson(teachers, classes, subject, cards):
    LESSONS.append({
        "teachers": teachers,
        "classes": classes,
        "subject": subject,
        "cards": cards
    })

# We add all teachers and their lesson cards:
# 1. HİDAYET AS & BİRCAN ÖZTRAK
add_lesson(["HİDAYET AS", "BİRCAN ÖZTRAK"], ["8D"], "TEKNO", [{"hours": 2, "slots": [[2, 2], [2, 3]]}])

# 2. HARUN BARIŞ TAHTACI & BİRCAN ÖZTRAK
add_lesson(["HARUN BARIŞ TAHTACI", "BİRCAN ÖZTRAK"], ["7B"], "TEKNO", [{"hours": 2, "slots": [[0, 5], [0, 6]]}])
add_lesson(["HARUN BARIŞ TAHTACI", "BİRCAN ÖZTRAK"], ["7A"], "TEKNO", [{"hours": 2, "slots": [[1, 2], [1, 3]]}])
add_lesson(["HARUN BARIŞ TAHTACI", "BİRCAN ÖZTRAK"], ["7C"], "TEKNO", [{"hours": 2, "slots": [[2, 0], [2, 1]]}])

# 3. BAHADIR ŞAFAK KUMCU & BİRCAN ÖZTRAK
add_lesson(["BAHADIR ŞAFAK KUMCU", "BİRCAN ÖZTRAK"], ["8C"], "TEKNO", [{"hours": 2, "slots": [[0, 3], [0, 4]]}])
add_lesson(["BAHADIR ŞAFAK KUMCU", "BİRCAN ÖZTRAK"], ["8A"], "TEKNO", [{"hours": 2, "slots": [[2, 5], [2, 6]]}])
add_lesson(["BAHADIR ŞAFAK KUMCU", "BİRCAN ÖZTRAK"], ["8B"], "TEKNO", [{"hours": 2, "slots": [[4, 0], [4, 1]]}])

# BİRCAN ÖZTRAK's solo lessons:
add_lesson(["BİRCAN ÖZTRAK"], ["7D"], "TEKNO", [{"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["BİRCAN ÖZTRAK"], ["7E"], "TEKNO", [{"hours": 2, "slots": [[4, 4], [4, 5]]}])
add_lesson(["BİRCAN ÖZTRAK"], ["7F"], "TEKNO", [{"hours": 2, "slots": [[1, 5], [1, 6]]}])

# 4. ÇİSEM ALTINOVA (28 saat)
add_lesson(["ÇİSEM ALTINOVA"], ["5E"], "İNG", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 5], [1, 6]]}, {"hours": 2, "slots": [[2, 1], [2, 2]]}])
add_lesson(["ÇİSEM ALTINOVA"], ["5B"], "İNG", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 3], [2, 4]]}])
add_lesson(["ÇİSEM ALTINOVA"], ["5E"], "SEÇİNG", [{"hours": 1, "slots": [[0, 3]]}, {"hours": 1, "slots": [[3, 0]]}])
add_lesson(["ÇİSEM ALTINOVA"], ["5B"], "SEÇİNG", [{"hours": 1, "slots": [[0, 4]]}, {"hours": 1, "slots": [[1, 4]]}])
add_lesson(["ÇİSEM ALTINOVA"], ["5B"], "ETKİNLİK", [{"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["ÇİSEM ALTINOVA"], ["5E"], "ETKİNLİK", [{"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ÇİSEM ALTINOVA"], ["5E"], "REHBE", [{"hours": 1, "slots": [[3, 5]]}])
add_lesson(["ÇİSEM ALTINOVA"], ["5-1 GRUP"], "DYK", [{"hours": 2, "slots": [[4, 5], [4, 6]]}])

# 5. YEŞİM BİÇER (25 saat)
add_lesson(["YEŞİM BİÇER"], ["5D"], "İNG", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 1, "slots": [[0, 5]]}, {"hours": 1, "slots": [[2, 0]]}, {"hours": 1, "slots": [[3, 5]]}])
add_lesson(["YEŞİM BİÇER"], ["5A"], "İNG", [{"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 1], [2, 2]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["YEŞİM BİÇER"], ["5A"], "SEÇİNG", [{"hours": 1, "slots": [[0, 3]]}, {"hours": 1, "slots": [[1, 4]]}])
add_lesson(["YEŞİM BİÇER"], ["5D"], "SEÇİNG", [{"hours": 1, "slots": [[0, 4]]}, {"hours": 1, "slots": [[1, 5]]}])
add_lesson(["YEŞİM BİÇER"], ["5D"], "ETKİNLİK", [{"hours": 2, "slots": [[2, 3], [2, 4]]}])
add_lesson(["YEŞİM BİÇER"], ["5A"], "ETKİNLİK", [{"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["YEŞİM BİÇER"], ["5A"], "REHBE", [{"hours": 1, "slots": [[4, 4]]}])

# 6. NURÇİN BÜYÜKYAKALI (21 saat)
add_lesson(["NURÇİN BÜYÜKYAKALI"], ["6B"], "SEÇİNG", [{"hours": 1, "slots": [[0, 0]]}, {"hours": 1, "slots": [[3, 5]]}])
add_lesson(["NURÇİN BÜYÜKYAKALI"], ["6C"], "İNG", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 1, "slots": [[4, 0]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["NURÇİN BÜYÜKYAKALI"], ["6D"], "İNG", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}])
add_lesson(["NURÇİN BÜYÜKYAKALI"], ["6D"], "SEÇİNG", [{"hours": 1, "slots": [[1, 2]]}, {"hours": 1, "slots": [[2, 5]]}])
add_lesson(["NURÇİN BÜYÜKYAKALI"], ["6B"], "İNG", [{"hours": 2, "slots": [[1, 5], [1, 6]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}])
add_lesson(["NURÇİN BÜYÜKYAKALI"], ["6C"], "SEÇİNG", [{"hours": 1, "slots": [[3, 3]]}, {"hours": 1, "slots": [[3, 4]]}])

# 7. ŞEBNEM CİVAŞ (25 saat)
add_lesson(["ŞEBNEM CİVAŞ"], ["5C"], "İNG", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 1, "slots": [[2, 5]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ŞEBNEM CİVAŞ"], ["5F"], "SEÇİNG", [{"hours": 1, "slots": [[0, 2]]}, {"hours": 1, "slots": [[3, 2]]}])
add_lesson(["ŞEBNEM CİVAŞ"], ["5C"], "SEÇİNG", [{"hours": 1, "slots": [[0, 3]]}, {"hours": 1, "slots": [[1, 2]]}])
add_lesson(["ŞEBNEM CİVAŞ"], ["5F"], "İNG", [{"hours": 1, "slots": [[0, 4]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 3], [2, 4]]}])
add_lesson(["ŞEBNEM CİVAŞ"], ["5C"], "ETKİNLİK", [{"hours": 2, "slots": [[1, 3], [1, 4]]}])
add_lesson(["ŞEBNEM CİVAŞ"], ["5F"], "ETKİNLİK", [{"hours": 2, "slots": [[2, 0], [2, 1]]}])
add_lesson(["ŞEBNEM CİVAŞ"], ["5F"], "REHBE", [{"hours": 1, "slots": [[4, 4]]}])
add_lesson(["ŞEBNEM CİVAŞ"], ["5-2 GRUP"], "DYK", [{"hours": 2, "slots": [[4, 5], [4, 6]]}])

# 8. ŞEREF ÖZCAN (24 saat)
add_lesson(["ŞEREF ÖZCAN"], ["6E"], "İNG", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}])
add_lesson(["ŞEREF ÖZCAN"], ["6F"], "SEÇİNG", [{"hours": 1, "slots": [[0, 4]]}, {"hours": 1, "slots": [[2, 2]]}])
add_lesson(["ŞEREF ÖZCAN"], ["6A"], "İNG", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}])
add_lesson(["ŞEREF ÖZCAN"], ["6F"], "İNG", [{"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 4], [2, 5]]}, {"hours": 1, "slots": [[4, 4]]}])
add_lesson(["ŞEREF ÖZCAN"], ["6E"], "SEÇİNG", [{"hours": 1, "slots": [[1, 2]]}, {"hours": 1, "slots": [[3, 0]]}])
add_lesson(["ŞEREF ÖZCAN"], ["6A"], "REHBE", [{"hours": 1, "slots": [[1, 6]]}])
add_lesson(["ŞEREF ÖZCAN"], ["6A"], "SEÇİNG", [{"hours": 1, "slots": [[3, 1]]}, {"hours": 1, "slots": [[3, 6]]}])
add_lesson(["ŞEREF ÖZCAN"], ["6-1 GRUP"], "DYK", [{"hours": 2, "slots": [[4, 5], [4, 6]]}])

# 9. ÖZGE KÜÇÜKDEMİR (21 saat)
add_lesson(["ÖZGE KÜÇÜKDEMİR"], ["8D"], "REHBE", [{"hours": 1, "slots": [[0, 2]]}])
add_lesson(["ÖZGE KÜÇÜKDEMİR"], ["8C"], "İNG", [{"hours": 2, "slots": [[0, 3], [0, 4]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}])
add_lesson(["ÖZGE KÜÇÜKDEMİR"], ["8D"], "İNG", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}])
add_lesson(["ÖZGE KÜÇÜKDEMİR"], ["8A"], "İNG", [{"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[3, 4], [3, 5]]}])
add_lesson(["ÖZGE KÜÇÜKDEMİR"], ["8B"], "REHBE", [{"hours": 1, "slots": [[2, 4]]}])
add_lesson(["ÖZGE KÜÇÜKDEMİR"], ["8B"], "İNG", [{"hours": 2, "slots": [[3, 2], [3, 3]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ÖZGE KÜÇÜKDEMİR"], ["8-4 DYK"], "DYK", [{"hours": 2, "slots": [[4, 7], [4, 8]]}])

# 10. SEMRA IŞIKLAR (22 saat)
add_lesson(["SEMRA IŞIKLAR"], ["7E"], "İNG", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}])
add_lesson(["SEMRA IŞIKLAR"], ["7D"], "İNG", [{"hours": 2, "slots": [[0, 3], [0, 4]]}, {"hours": 2, "slots": [[1, 5], [1, 6]]}])
add_lesson(["SEMRA IŞIKLAR"], ["7F"], "İNG", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}])
add_lesson(["SEMRA IŞIKLAR"], ["7A"], "İNG", [{"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["SEMRA IŞIKLAR"], ["7F"], "REHBE", [{"hours": 1, "slots": [[2, 3]]}])
add_lesson(["SEMRA IŞIKLAR"], ["7C"], "İNG", [{"hours": 2, "slots": [[2, 4], [2, 5]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])

# 11. FADİME CANDAN LAZUT (15 saat Destek Eğitim)
add_lesson(["FADİME CANDAN LAZUT"], ["DESTEK EĞİTİM"], "DESEĞ", [
    {"hours": 2, "slots": [[0, 3], [0, 4]]},
    {"hours": 2, "slots": [[1, 0], [1, 1]]},
    {"hours": 2, "slots": [[1, 5], [1, 6]]},
    {"hours": 2, "slots": [[2, 2], [2, 3]]},
    {"hours": 2, "slots": [[2, 4], [2, 5]]},
    {"hours": 2, "slots": [[3, 3], [3, 4]]},
    {"hours": 1, "slots": [[4, 5]]}
])

# 12. HİLMİ PALA (27 saat)
add_lesson(["HİLMİ PALA"], ["8C"], "MAT", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 5], [1, 6]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["HİLMİ PALA"], ["8A"], "MAT", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 1, "slots": [[1, 0]]}, {"hours": 2, "slots": [[2, 3], [2, 4]]}, {"hours": 1, "slots": [[4, 4]]}])
add_lesson(["HİLMİ PALA"], ["8B"], "MAT", [{"hours": 1, "slots": [[0, 5]]}, {"hours": 2, "slots": [[1, 3], [1, 4]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["HİLMİ PALA"], ["8-1 DYK"], "DYK", [{"hours": 2, "slots": [[0, 7], [0, 8]]}])
add_lesson(["HİLMİ PALA"], ["8-2 DYK"], "DYK", [{"hours": 2, "slots": [[4, 7], [4, 8]]}])

# 13. YELİZ TUNÇ (24 saat)
add_lesson(["YELİZ TUNÇ"], ["6D"], "MAT", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}, {"hours": 1, "slots": [[2, 2]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["YELİZ TUNÇ"], ["6A"], "MAT", [{"hours": 2, "slots": [[0, 3], [0, 4]]}, {"hours": 1, "slots": [[1, 1]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}])
add_lesson(["YELİZ TUNÇ"], ["6-2 GRUP"], "MAT", [{"hours": 2, "slots": [[0, 5], [0, 6]]}])
add_lesson(["YELİZ TUNÇ"], ["6C"], "MAT", [{"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 4], [2, 5]]}, {"hours": 1, "slots": [[4, 2]]}])
add_lesson(["YELİZ TUNÇ"], ["6A"], "BİLİM", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["YELİZ TUNÇ"], ["6C"], "BİLİM", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])
add_lesson(["YELİZ TUNÇ"], ["6C"], "REHBE", [{"hours": 1, "slots": [[4, 3]]}])

# 14. BİLAL AKAR (25 saat)
add_lesson(["BİLAL AKAR"], ["6B"], "MAT", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 1, "slots": [[1, 5]]}, {"hours": 2, "slots": [[2, 4], [2, 5]]}])
add_lesson(["BİLAL AKAR"], ["6F"], "MAT", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 1, "slots": [[2, 2]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["BİLAL AKAR"], ["6E"], "MAT", [{"hours": 1, "slots": [[0, 4]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["BİLAL AKAR"], ["6D"], "BİLİM", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["BİLAL AKAR"], ["6B"], "BİLİM", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["BİLAL AKAR"], ["6E"], "BİLİM", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])
add_lesson(["BİLAL AKAR"], ["6E"], "REHBE", [{"hours": 1, "slots": [[4, 4]]}])

# 15. EMEL AYDIN (28 saat)
add_lesson(["EMEL AYDIN"], ["5B"], "MAT", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 1, "slots": [[1, 2]]}, {"hours": 2, "slots": [[2, 1], [2, 2]]}, {"hours": 2, "slots": [[4, 4], [4, 5]]}])
add_lesson(["EMEL AYDIN"], ["5D"], "MAT", [{"hours": 1, "slots": [[0, 2]]}, {"hours": 2, "slots": [[1, 3], [1, 4]]}, {"hours": 2, "slots": [[2, 3], [2, 4]]}])
add_lesson(["EMEL AYDIN"], ["5A"], "MAT", [{"hours": 2, "slots": [[0, 3], [0, 4]]}, {"hours": 2, "slots": [[1, 5], [1, 6]]}, {"hours": 1, "slots": [[2, 5]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["EMEL AYDIN"], ["5F"], "MAT", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 1, "slots": [[2, 0]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["EMEL AYDIN"], ["5A"], "BİLİM", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["EMEL AYDIN"], ["5D"], "BİLİM", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 16. BÜŞRA SELCEN SERDAROĞLU (24 saat)
add_lesson(["BÜŞRA SELCEN SERDAROĞLU"], ["7A"], "MAT", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}, {"hours": 2, "slots": [[2, 1], [2, 2]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["BÜŞRA SELCEN SERDAROĞLU"], ["7E"], "MAT", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 1, "slots": [[2, 0]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["BÜŞRA SELCEN SERDAROĞLU"], ["7-1 DYK"], "MAT", [{"hours": 2, "slots": [[0, 5], [0, 6]]}])
add_lesson(["BÜŞRA SELCEN SERDAROĞLU"], ["7E"], "BİLİM", [{"hours": 2, "slots": [[2, 4], [2, 5]]}])
add_lesson(["BÜŞRA SELCEN SERDAROĞLU"], ["7A"], "BİLİM", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["BÜŞRA SELCEN SERDAROĞLU"], ["7F"], "BİLİM", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 17. NAGİHAN ÇİÇEN (16 saat)
add_lesson(["NAGİHAN ÇİÇEN"], ["7F"], "MAT", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 1, "slots": [[1, 2]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["NAGİHAN ÇİÇEN"], ["7F"], "REHBE", [{"hours": 1, "slots": [[0, 2]]}])
add_lesson(["NAGİHAN ÇİÇEN"], ["7D"], "MAT", [{"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["NAGİHAN ÇİÇEN"], ["7D"], "BİLİM", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])

# 18. AYŞE GÜL DEMİR (21 saat)
add_lesson(["AYŞE GÜL DEMİR"], ["7C"], "MAT", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 1, "slots": [[2, 2]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["AYŞE GÜL DEMİR"], ["7B"], "MAT", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["AYŞE GÜL DEMİR"], ["7B"], "REHBE", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["AYŞE GÜL DEMİR"], ["7B"], "BİLİM", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["AYŞE GÜL DEMİR"], ["7C"], "BİLİM", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])

# 19. ALPER KAYA (24 saat)
add_lesson(["ALPER KAYA"], ["5C"], "MAT", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ALPER KAYA"], ["5E"], "MAT", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["ALPER KAYA"], ["5E"], "BİLİM", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["ALPER KAYA"], ["5C"], "BİLİM", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["ALPER KAYA"], ["5F"], "BİLİM", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 20. SİBEL ÜLKER (22 saat)
add_lesson(["SİBEL ÜLKER"], ["8D"], "MAT", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 1, "slots": [[2, 0]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["SİBEL ÜLKER"], ["8-3 DYK"], "MAT", [{"hours": 2, "slots": [[0, 3], [0, 4]]}])
add_lesson(["SİBEL ÜLKER"], ["8-4 DYK"], "MAT", [{"hours": 2, "slots": [[1, 3], [1, 4]]}])
add_lesson(["SİBEL ÜLKER"], ["8D"], "BİLİM", [{"hours": 2, "slots": [[2, 3], [2, 4]]}])
add_lesson(["SİBEL ÜLKER"], ["8B"], "BİLİM", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["SİBEL ÜLKER"], ["8C"], "BİLİM", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["SİBEL ÜLKER"], ["8A"], "BİLİM", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 21. OYA KIZILARSLAN (27 saat)
add_lesson(["OYA KIZILARSLAN"], ["5E"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["OYA KIZILARSLAN"], ["5B"], "REHBE", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["OYA KIZILARSLAN"], ["5B"], "TÜRK", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["OYA KIZILARSLAN"], ["5-1 GRUP"], "TÜRK", [{"hours": 2, "slots": [[1, 5], [1, 6]]}])
add_lesson(["OYA KIZILARSLAN"], ["5B"], "OKUMA", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["OYA KIZILARSLAN"], ["5E"], "OKUMA", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["OYA KIZILARSLAN"], ["5E"], "YAZAR", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 22. DERYA ERTUĞRUL (24 saat)
add_lesson(["DERYA ERTUĞRUL"], ["5F"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["DERYA ERTUĞRUL"], ["5D"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["DERYA ERTUĞRUL"], ["5-2 GRUP"], "TÜRK", [{"hours": 2, "slots": [[0, 4], [0, 5]]}])
add_lesson(["DERYA ERTUĞRUL"], ["5D"], "REHBE", [{"hours": 1, "slots": [[2, 4]]}])
add_lesson(["DERYA ERTUĞRUL"], ["5F"], "OKUMA", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["DERYA ERTUĞRUL"], ["5D"], "OKUMA", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["DERYA ERTUĞRUL"], ["5D"], "YAZAR", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 23. ÖZNUR KANAL (24 saat)
add_lesson(["ÖZNUR KANAL"], ["5A"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["ÖZNUR KANAL"], ["5C"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ÖZNUR KANAL"], ["5C"], "REHBE", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["ÖZNUR KANAL"], ["5C"], "OKUMA", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["ÖZNUR KANAL"], ["5A"], "OKUMA", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["ÖZNUR KANAL"], ["5C"], "YAZAR", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 24. ORHAN BÜYÜKYILMAZ (21 saat)
add_lesson(["ORHAN BÜYÜKYILMAZ"], ["6D"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ORHAN BÜYÜKYILMAZ"], ["6A"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["ORHAN BÜYÜKYILMAZ"], ["6-1 GRUP"], "TÜRK", [{"hours": 2, "slots": [[0, 4], [0, 5]]}])
add_lesson(["ORHAN BÜYÜKYILMAZ"], ["6D"], "REHBE", [{"hours": 1, "slots": [[2, 4]]}])
add_lesson(["ORHAN BÜYÜKYILMAZ"], ["6A"], "OKUMA", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["ORHAN BÜYÜKYILMAZ"], ["6D"], "OKUMA", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])

# 25. GÜLSEREN DEMİR (22 saat)
add_lesson(["GÜLSEREN DEMİR"], ["6E"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["GÜLSEREN DEMİR"], ["6C"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["GÜLSEREN DEMİR"], ["6C"], "REHBE", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["GÜLSEREN DEMİR"], ["6C"], "OKUMA", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["GÜLSEREN DEMİR"], ["6E"], "OKUMA", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["GÜLSEREN DEMİR"], ["6E"], "YAZAR", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 26. FUNDA GÜNER (24 saat)
add_lesson(["FUNDA GÜNER"], ["6B"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["FUNDA GÜNER"], ["6F"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["FUNDA GÜNER"], ["6F"], "REHBE", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["FUNDA GÜNER"], ["6B"], "OKUMA", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["FUNDA GÜNER"], ["6F"], "OKUMA", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["FUNDA GÜNER"], ["6-2 GRUP"], "TÜRK", [{"hours": 2, "slots": [[4, 5], [4, 6]]}])

# 27. MEHMET ABUY (16 saat)
add_lesson(["MEHMET ABUY"], ["7E"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["MEHMET ABUY"], ["7B"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["MEHMET ABUY"], ["7E"], "REHBE", [{"hours": 1, "slots": [[2, 4]]}])
add_lesson(["MEHMET ABUY"], ["7E"], "YAZAR", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])

# 28. PINAR BAYKUL (20 saat)
add_lesson(["PINAR BAYKUL"], ["7F"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["PINAR BAYKUL"], ["7A"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["PINAR BAYKUL"], ["7A"], "REHBE", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["PINAR BAYKUL"], ["7A"], "YAZAR", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["PINAR BAYKUL"], ["7F"], "YAZAR", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])

# 29. ERNUR YAMAN (20 saat)
add_lesson(["ERNUR YAMAN"], ["7D"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ERNUR YAMAN"], ["7C"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["ERNUR YAMAN"], ["7D"], "REHBE", [{"hours": 1, "slots": [[2, 4]]}])
add_lesson(["ERNUR YAMAN"], ["7C"], "YAZAR", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["ERNUR YAMAN"], ["7D"], "YAZAR", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])

# 30. SİBEL AĞGÜL (28 saat)
add_lesson(["SİBEL AĞGÜL"], ["8B"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["SİBEL AĞGÜL"], ["8A"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["SİBEL AĞGÜL"], ["8A"], "REHBE", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["SİBEL AĞGÜL"], ["8-1 DYK"], "TÜRK", [{"hours": 2, "slots": [[0, 7], [0, 8]]}])
add_lesson(["SİBEL AĞGÜL"], ["8-2 DYK"], "TÜRK", [{"hours": 2, "slots": [[1, 7], [1, 8]]}])
add_lesson(["SİBEL AĞGÜL"], ["8A"], "YAZAR", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["SİBEL AĞGÜL"], ["8B"], "YAZAR", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["SİBEL AĞGÜL"], ["8-3 DYK"], "TÜRK", [{"hours": 2, "slots": [[4, 7], [4, 8]]}])

# 31. AYSEL GÜNDÜZ (20 saat)
add_lesson(["AYSEL GÜNDÜZ"], ["8D"], "TÜRK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["AYSEL GÜNDÜZ"], ["8C"], "TÜRK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["AYSEL GÜNDÜZ"], ["8C"], "REHBE", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["AYSEL GÜNDÜZ"], ["8C"], "YAZAR", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["AYSEL GÜNDÜZ"], ["8D"], "YAZAR", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])

# 32. ZAFER KALKAN (21 saat)
add_lesson(["ZAFER KALKAN"], ["8B"], "FEN", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["ZAFER KALKAN"], ["8A"], "FEN", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ZAFER KALKAN"], ["8-3 DYK"], "FEN", [{"hours": 2, "slots": [[0, 7], [0, 8]]}])
add_lesson(["ZAFER KALKAN"], ["8-4 DYK"], "FEN", [{"hours": 2, "slots": [[1, 7], [1, 8]]}])
add_lesson(["ZAFER KALKAN"], ["8A"], "ÇEVRE", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["ZAFER KALKAN"], ["8B"], "ÇEVRE", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["ZAFER KALKAN"], ["8-1 DYK"], "FEN", [{"hours": 2, "slots": [[4, 7], [4, 8]]}])

# 33. MELEK ÖZTÜRK (22 saat)
add_lesson(["MELEK ÖZTÜRK"], ["8D"], "FEN", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["MELEK ÖZTÜRK"], ["8C"], "FEN", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["MELEK ÖZTÜRK"], ["8-2 DYK"], "FEN", [{"hours": 2, "slots": [[0, 7], [0, 8]]}])
add_lesson(["MELEK ÖZTÜRK"], ["8C"], "ÇEVRE", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["MELEK ÖZTÜRK"], ["8D"], "ÇEVRE", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])

# 34. ZEYNEP GÜVEN (22 saat)
add_lesson(["ZEYNEP GÜVEN"], ["7C"], "FEN", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}])
add_lesson(["ZEYNEP GÜVEN"], ["7B"], "FEN", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 4], [2, 5]]}])
add_lesson(["ZEYNEP GÜVEN"], ["7A"], "FEN", [{"hours": 2, "slots": [[0, 5], [0, 6]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}])
add_lesson(["ZEYNEP GÜVEN"], ["7B"], "ÇEVRE", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["ZEYNEP GÜVEN"], ["7A"], "ÇEVRE", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])

# 35. SADIK ÇELİK (36 saat)
add_lesson(["SADIK ÇELİK"], ["7F"], "FEN", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 4], [2, 5]]}])
add_lesson(["SADIK ÇELİK"], ["7E"], "FEN", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}])
add_lesson(["SADIK ÇELİK"], ["7D"], "FEN", [{"hours": 2, "slots": [[0, 4], [0, 5]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}])
add_lesson(["SADIK ÇELİK"], ["7D"], "ÇEVRE", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["SADIK ÇELİK"], ["7E"], "ÇEVRE", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["SADIK ÇELİK"], ["7F"], "ÇEVRE", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])
add_lesson(["SADIK ÇELİK"], ["5B"], "FEN", [{"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["SADIK ÇELİK"], ["5A"], "FEN", [{"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["SADIK ÇELİK"], ["5C"], "FEN", [{"hours": 2, "slots": [[4, 4], [4, 5]]}])
add_lesson(["SADIK ÇELİK"], ["8-1 DYK"], "DYK", [{"hours": 2, "slots": [[5, 0], [5, 1]]}])
add_lesson(["SADIK ÇELİK"], ["8-2 DYK"], "DYK", [{"hours": 2, "slots": [[5, 2], [5, 3]]}])

# 36. KADER MALLI (12 saat)
add_lesson(["KADER MALLI"], ["5D"], "FEN", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}])
add_lesson(["KADER MALLI"], ["5F"], "FEN", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}])
add_lesson(["KADER MALLI"], ["5E"], "FEN", [{"hours": 2, "slots": [[0, 4], [0, 5]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}])

# 37. NAHİDE CANAN ŞUMNU (22 saat)
add_lesson(["NAHİDE CANAN ŞUMNU"], ["6D"], "FEN", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 4], [2, 5]]}])
add_lesson(["NAHİDE CANAN ŞUMNU"], ["6C"], "FEN", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}])
add_lesson(["NAHİDE CANAN ŞUMNU"], ["6B"], "FEN", [{"hours": 2, "slots": [[0, 4], [0, 5]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}])
add_lesson(["NAHİDE CANAN ŞUMNU"], ["6C"], "ÇEVRE", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["NAHİDE CANAN ŞUMNU"], ["6B"], "ÇEVRE", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["NAHİDE CANAN ŞUMNU"], ["6D"], "ÇEVRE", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# 38. ALPTEKİN BAŞTÜRK (28 saat)
add_lesson(["ALPTEKİN BAŞTÜRK"], ["6F"], "FEN", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 2, "slots": [[2, 4], [2, 5]]}])
add_lesson(["ALPTEKİN BAŞTÜRK"], ["6E"], "FEN", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 2, "slots": [[1, 4], [1, 5]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}])
add_lesson(["ALPTEKİN BAŞTÜRK"], ["6A"], "FEN", [{"hours": 2, "slots": [[0, 4], [0, 5]]}, {"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}])
add_lesson(["ALPTEKİN BAŞTÜRK"], ["6A"], "ÇEVRE", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["ALPTEKİN BAŞTÜRK"], ["6E"], "ÇEVRE", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["ALPTEKİN BAŞTÜRK"], ["6F"], "ÇEVRE", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])
add_lesson(["ALPTEKİN BAŞTÜRK"], ["5D"], "FEN", [{"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["ALPTEKİN BAŞTÜRK"], ["5E"], "FEN", [{"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["ALPTEKİN BAŞTÜRK"], ["5F"], "FEN", [{"hours": 2, "slots": [[4, 4], [4, 5]]}])

# 39. SERTER IŞIKLAR (28 saat)
add_lesson(["SERTER IŞIKLAR"], ["8A"], "İNK", [{"hours": 2, "slots": [[0, 0], [0, 1]]}])
add_lesson(["SERTER IŞIKLAR"], ["8B"], "İNK", [{"hours": 2, "slots": [[0, 2], [0, 3]]}])
add_lesson(["SERTER IŞIKLAR"], ["8C"], "İNK", [{"hours": 1, "slots": [[0, 4]]}])
add_lesson(["SERTER IŞIKLAR"], ["8D"], "İNK", [{"hours": 1, "slots": [[0, 5]]}])
add_lesson(["SERTER IŞIKLAR"], ["7A"], "SOS", [{"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 1, "slots": [[2, 5]]}])
add_lesson(["SERTER IŞIKLAR"], ["7B"], "SOS", [{"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 1, "slots": [[4, 4]]}])
add_lesson(["SERTER IŞIKLAR"], ["7C"], "SOS", [{"hours": 1, "slots": [[1, 4]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["SERTER IŞIKLAR"], ["7D"], "SOS", [{"hours": 2, "slots": [[2, 0], [2, 1]]}, {"hours": 1, "slots": [[4, 5]]}])
add_lesson(["SERTER IŞIKLAR"], ["7E"], "SOS", [{"hours": 1, "slots": [[2, 2]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["SERTER IŞIKLAR"], ["7F"], "SOS", [{"hours": 2, "slots": [[2, 3], [2, 4]]}, {"hours": 1, "slots": [[4, 6]]}])
add_lesson(["SERTER IŞIKLAR"], ["8A"], "HUKUK", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["SERTER IŞIKLAR"], ["8B"], "HUKUK", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["SERTER IŞIKLAR"], ["8C"], "HUKUK", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])
add_lesson(["SERTER IŞIKLAR"], ["8D"], "HUKUK", [{"hours": 2, "slots": [[4, 0], [4, 1]]}])

# 40. SEVGİ KIRMACI (24 saat)
add_lesson(["SEVGİ KIRMACI"], ["5A"], "SOS", [{"hours": 2, "slots": [[0, 0], [0, 1]]}, {"hours": 1, "slots": [[1, 4]]}])
add_lesson(["SEVGİ KIRMACI"], ["5B"], "SOS", [{"hours": 2, "slots": [[0, 2], [0, 3]]}, {"hours": 1, "slots": [[2, 5]]}])
add_lesson(["SEVGİ KIRMACI"], ["5C"], "SOS", [{"hours": 1, "slots": [[0, 4]]}, {"hours": 2, "slots": [[2, 0], [2, 1]]}])
add_lesson(["SEVGİ KIRMACI"], ["5D"], "SOS", [{"hours": 1, "slots": [[0, 5]]}, {"hours": 2, "slots": [[2, 2], [2, 3]]}])
add_lesson(["SEVGİ KIRMACI"], ["5E"], "SOS", [{"hours": 2, "slots": [[1, 0], [1, 1]]}, {"hours": 1, "slots": [[4, 4]]}])
add_lesson(["SEVGİ KIRMACI"], ["5F"], "SOS", [{"hours": 2, "slots": [[1, 2], [1, 3]]}, {"hours": 1, "slots": [[4, 5]]}])
add_lesson(["SEVGİ KIRMACI"], ["6A"], "SOS", [{"hours": 1, "slots": [[1, 5]]}, {"hours": 2, "slots": [[4, 0], [4, 1]]}])
add_lesson(["SEVGİ KIRMACI"], ["6B"], "SOS", [{"hours": 1, "slots": [[1, 6]]}, {"hours": 2, "slots": [[4, 2], [4, 3]]}])
add_lesson(["SEVGİ KIRMACI"], ["5A"], "KÜLTÜR", [{"hours": 2, "slots": [[3, 0], [3, 1]]}])
add_lesson(["SEVGİ KIRMACI"], ["5B"], "KÜLTÜR", [{"hours": 2, "slots": [[3, 2], [3, 3]]}])
add_lesson(["SEVGİ KIRMACI"], ["5C"], "KÜLTÜR", [{"hours": 2, "slots": [[3, 4], [3, 5]]}])

# Teacher Constraints
TEACHER_CONSTRAINTS = {
    "HİDAYET AS": [],
    "HARUN BARIŞ TAHTACI": [],
    "BAHADIR ŞAFAK KUMCU": [],
    "BİRCAN ÖZTRAK": [f"3-{p}" for p in range(9)], # Perşembe tam gün boş
    "ZAFER KALKAN": [f"2-{p}" for p in range(9)], # Çarşamba tam gün boş
    "HİLMİ PALA": [f"3-{p}" for p in range(9)], # Perşembe tam gün boş
    "FADİME CANDAN LAZUT": [],
    "SEVGİ KIRMACI": [f"{d}-{p}" for d in range(5) for p in [6, 7, 8]], # 7-8-9 saatler kapalı
    "YEŞİM BİÇER": [f"{d}-{p}" for d in range(5) for p in [6, 7, 8]] # 7-8-9 saatler kapalı
}

# Generate TypeScript file
ts_output = f"""// Dağıtmatik Örnek Ders Yükleri ve Yerleşim Kartları (41 Öğretmen, 31 Sınıf, 29 Ders Tam Listesi)
export interface DPRGDefinedLesson {{
  teachers: string[];
  classes: string[];
  subject: string;
  cards: Array<{{
    hours: number;
    slots: [number, number][];
  }}>;
}}

export const DPRG_SHORT_TO_FULL_TEACHERS: Record<string, string> = {json.dumps(DPRG_SHORT_TO_FULL_TEACHERS, ensure_ascii=False, indent=2)};

export const DPRG_SHORT_TO_FULL_SUBJECTS: Record<string, string> = {json.dumps(DPRG_SHORT_TO_FULL_SUBJECTS, ensure_ascii=False, indent=2)};

export const DPRG_FULL_TO_SHORT_NAMES: Record<string, string> = {json.dumps(DPRG_FULL_TO_SHORT_NAMES, ensure_ascii=False, indent=2)};

export const DPRG_SAMPLE_TEACHER_CONSTRAINTS: Record<string, string[]> = {json.dumps(TEACHER_CONSTRAINTS, ensure_ascii=False, indent=2)};

export const DPRG_SAMPLE_LESSONS: DPRGDefinedLesson[] = {json.dumps(LESSONS, ensure_ascii=False, indent=2)};
"""

with open("src/utils/dprgDefaultLessons.ts", "w", encoding="utf-8") as f:
    f.write(ts_output)

print(f"Successfully generated src/utils/dprgDefaultLessons.ts with {len(LESSONS)} lessons!")
