# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

# Let's inspect the card section:
# In XML we have:
# TanimliDers id="1986" Ders="1972" Ogretmenler="74" Siniflar="119"
#   Kart id="1987" Saat="2" Yerlesim="1912,1913"
#   Kart id="1988" Saat="2" Yerlesim="1928,1929"
#   Kart id="4613" Saat="2" Yerlesim="37,42"

# In the binary data, let's search for 1986:
pos_1986 = []
for i in range(len(data)-4):
    v = struct.unpack('<I', data[i:i+4])[0]
    if v == 1986:
        pos_1986.append(i)

print(f"Found 1986 at: {pos_1986}")
if pos_1986:
    p = pos_1986[0]
    print(f"Around 1986 ({p}):", list(data[p-10:p+30]))

