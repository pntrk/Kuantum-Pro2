# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

# Valid saat IDs from XML:
# Pazartesi: 12, 17, 22, 27, 32, 37, 42, 1839, 1947
# Salı: 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1948
# Çarşamba: 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1949
# Perşembe: 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1950
# Cuma: 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1951
# Cumartesi: 2830, 2831, 2832, 2833

saat_info = {
    12: ("Pazartesi", 1), 17: ("Pazartesi", 2), 22: ("Pazartesi", 3), 27: ("Pazartesi", 4),
    32: ("Pazartesi", 5), 37: ("Pazartesi", 6), 42: ("Pazartesi", 7), 1839: ("Pazartesi", 8), 1947: ("Pazartesi", 9),
    1900: ("Salı", 1), 1901: ("Salı", 2), 1902: ("Salı", 3), 1903: ("Salı", 4),
    1904: ("Salı", 5), 1905: ("Salı", 6), 1906: ("Salı", 7), 1907: ("Salı", 8), 1948: ("Salı", 9),
    1908: ("Çarşamba", 1), 1909: ("Çarşamba", 2), 1910: ("Çarşamba", 3), 1911: ("Çarşamba", 4),
    1912: ("Çarşamba", 5), 1913: ("Çarşamba", 6), 1914: ("Çarşamba", 7), 1915: ("Çarşamba", 8), 1949: ("Çarşamba", 9),
    1916: ("Perşembe", 1), 1917: ("Perşembe", 2), 1918: ("Perşembe", 3), 1919: ("Perşembe", 4),
    1920: ("Perşembe", 5), 1921: ("Perşembe", 6), 1922: ("Perşembe", 7), 1923: ("Perşembe", 8), 1950: ("Perşembe", 9),
    1924: ("Cuma", 1), 1925: ("Cuma", 2), 1926: ("Cuma", 3), 1927: ("Cuma", 4),
    1928: ("Cuma", 5), 1929: ("Cuma", 6), 1930: ("Cuma", 7), 1931: ("Cuma", 8), 1951: ("Cuma", 9),
    2830: ("Cumartesi", 1), 2831: ("Cumartesi", 2), 2832: ("Cumartesi", 3), 2833: ("Cumartesi", 4)
}

all_saat_ids = set(saat_info.keys())

# Let us scan the file for teacher names and their following closed hours:
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

# Find indices of all teachers in the raw bytes:
positions = []
for t in teachers:
    idx = raw.find(t.encode('utf-8'))
    if idx != -1:
        positions.append((idx, t))

positions.sort()

# Also find where Classes start (e.g. "5A")
sinif_start = raw.find(b"\x02\x005A\x02\x005A")
if sinif_start == -1:
    sinif_start = raw.find(b"5A\x02\x005A")

for i in range(len(positions)):
    cur_idx, cur_name = positions[i]
    next_idx = positions[i+1][0] if i+1 < len(positions) else sinif_start
    
    # Slice between cur teacher name and next teacher
    block = raw[cur_idx + len(cur_name.encode('utf-8')):next_idx]
    
    # Search for all 4-byte integers in block that match a valid saat_id!
    found_saats = []
    for p in range(0, len(block) - 3):
        val = struct.unpack('<I', block[p:p+4])[0]
        if val in all_saat_ids:
            found_saats.append(val)
            
    # Deduplicate while preserving order
    unique_saats = list(dict.fromkeys(found_saats))
    
    formatted = [f"{saat_info[s][0]} {saat_info[s][1]}.saat" for s in unique_saats]
    print(f"{cur_name:<25} | Kapalı Saat Sayısı: {len(unique_saats):<2} | {', '.join(formatted[:5])}{'...' if len(formatted)>5 else ''}")

