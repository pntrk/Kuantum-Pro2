# encoding: utf-8
import re
import json

# Day index: 0: Pazartesi, 1: Salı, 2: Çarşamba, 3: Perşembe, 4: Cuma, 5: Cumartesi
# Period index: 0..8 (1st to 9th lesson for weekdays, 1st to 4th for Cumartesi)

# Let's map all teacher short names and full names:
TEACHER_MAP = {
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

SUBJECT_MAP = {
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

print("Maps ready")
