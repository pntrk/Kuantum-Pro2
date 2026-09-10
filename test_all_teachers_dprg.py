# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

# XML saat mapping
saat_to_pos = {
    # Pazartesi (d=0)
    12: (0, 0), 17: (0, 1), 22: (0, 2), 27: (0, 3), 32: (0, 4), 37: (0, 5), 42: (0, 6), 1839: (0, 7), 1947: (0, 8),
    # Salı (d=1)
    1900: (1, 0), 1901: (1, 1), 1902: (1, 2), 1903: (1, 3), 1904: (1, 4), 1905: (1, 5), 1906: (1, 6), 1907: (1, 7), 1948: (1, 8),
    # Çarşamba (d=2)
    1908: (2, 0), 1909: (2, 1), 1910: (2, 2), 1911: (2, 3), 1912: (2, 4), 1913: (2, 5), 1914: (2, 6), 1915: (2, 7), 1949: (2, 8),
    # Perşembe (d=3)
    1916: (3, 0), 1917: (3, 1), 1918: (3, 2), 1919: (3, 3), 1920: (3, 4), 1921: (3, 5), 1922: (3, 6), 1923: (3, 7), 1950: (3, 8),
    # Cuma (d=4)
    1924: (4, 0), 1925: (4, 1), 1926: (4, 2), 1927: (4, 3), 1928: (4, 4), 1929: (4, 5), 1930: (4, 6), 1931: (4, 7), 1951: (4, 8),
    # Cumartesi (d=5)
    2830: (5, 0), 2831: (5, 1), 2832: (5, 2), 2833: (5, 3)
}
days = ["Pzt", "Salı", "Çarş", "Perş", "Cuma", "Cmt"]

teachers = [
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

for t in teachers:
    idx = raw.find(t.encode('utf-8'))
    if idx == -1:
        continue
    # Move past name
    pos = idx + len(t.encode('utf-8'))
    # short name len (2 bytes little endian)
    short_len = struct.unpack('<H', raw[pos:pos+2])[0]
    pos += 2
    short_name = raw[pos:pos+short_len].decode('utf-8', errors='ignore')
    pos += short_len
    # color (3 bytes)
    color = raw[pos:pos+3]
    pos += 3
    # closed hours count (2 bytes)
    closed_count = struct.unpack('<H', raw[pos:pos+2])[0]
    pos += 2
    
    closed_hours = []
    for _ in range(closed_count):
        saat_id = struct.unpack('<I', raw[pos:pos+4])[0]
        pos += 4
        if saat_id in saat_to_pos:
            d, p = saat_to_pos[saat_id]
            closed_hours.append(f"{days[d]} {p+1}.ders")
        else:
            closed_hours.append(f"ID:{saat_id}")
            
    print(f"{t} ({short_name}) -> {closed_count} Kapalı Saat: {', '.join(closed_hours[:6])}{'...' if len(closed_hours)>6 else ''}")

