# -*- coding: utf-8 -*-
with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

# Let's inspect raw around Hidayet AS, Cissem, Semra, Hilmi Pala
for name in ["HİDAYET AS", "HARUN BARIŞ TAHTACI", "ÇİSEM ALTINOVA", "SEMRA IŞIKLAR", "HİLMİ PALA"]:
    idx = raw.find(name.encode('utf-8'))
    print(f"=== {name} at {idx} ===")
    print("Next 40 bytes:", [b for b in raw[idx+len(name.encode('utf-8')):idx+len(name.encode('utf-8'))+40]])

