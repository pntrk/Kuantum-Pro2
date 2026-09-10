# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

# Let's search for 1972 as 4-byte int:
pos_4byte = []
for i in range(len(raw) - 4):
    v = struct.unpack('<I', raw[i:i+4])[0]
    if v == 1972:
        pos_4byte.append(i)

print(f"4-byte occurrences of 1972: {len(pos_4byte)}")
for p in pos_4byte[:5]:
    print(f"At {p}:", [b for b in raw[p:p+30]])

