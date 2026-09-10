# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

# Let's inspect where the card section starts:
# In XML we have TanimliDers id="1986" Ders="1972" Ogretmenler="74" Siniflar="119"
# Yerlesim="1912,1913", etc.
# Let's look for byte sequences with 1972, 74, 119, etc.
# 1972 = 0xB4, 0x07
# 74 = 0x4A, 0x00
# 119 = 0x77, 0x00

pos_1972 = []
for i in range(len(raw) - 4):
    v = struct.unpack('<H', raw[i:i+2])[0]
    if v == 1972:
        pos_1972.append(i)

print(f"Occurrences of 1972 (TÜRKÇE): {len(pos_1972)}")
for p in pos_1972[:5]:
    print(f"At {p}:", [b for b in raw[p:p+30]])

