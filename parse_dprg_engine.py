# -*- coding: utf-8 -*-
with open('src/dprg_sample.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

teachers_to_find = [
    "HİDAYET AS", "HARUN BARIŞ TAHTACI", "BAHADIR ŞAFAK KUMCU", "ÇİSEM ALTINOVA",
    "YEŞİM BİÇER", "NURÇİN BÜYÜKYAKALI", "ŞEBNEM CİVAŞ", "ŞEREF ÖZCAN",
    "ÖZGE KÜÇÜKDEMİR", "SEMRA IŞIKLAR", "FADİME CANDAN LAZUT", "HİLMİ PALA",
    "YELİZ TUNÇ", "BİLAL AKAR", "EMEL AYDIN", "BÜŞRA SELCEN SERDAROĞLU",
    "NAGİHAN ÇİÇEN", "AYŞE GÜL DEMİR", "ALPER KAYA", "SİBEL ÜLKER",
    "OYA KIZILARSLAN", "DERYA ERTUĞRUL", "ÖZNUR KANAL", "ORHAN BÜYÜKYILMAZ",
    "FUNDA GÜNER", "MEHMET ABUY", "PINAR BAYKUL", "ERNUR YAMAN",
    "SİBEL AĞGÜL", "AYSEL GÜNDÜZ", "ZAFER KALKAN", "MELEK ÖZTÜRK",
    "ZEYNEP GÜVEN", "SADIK ÇELİK", "KADER MALLI", "GÜLSEREN DEMİR",
    "NAHİDE CANAN ŞUMNU", "ALPTEKİN BAŞTÜRK", "SERTER IŞIKLAR", "SEVGİ KIRMACI",
    "BİRCAN ÖZTRAK"
]

print(f"Total teachers to find: {len(teachers_to_find)}")
found = [t for t in teachers_to_find if t in text]
print(f"Found in text: {len(found)}")

