# -*- coding: utf-8 -*-
import struct

# Save xml and dprg from user prompt
# In the user prompt, XML is from <DersProgrami> to </DersProgrami>
# DPRG is after </DersProgrami>

with open('src/dprg_sample.txt', 'rb') as f:
    dprg_raw = f.read()

print("DPRG raw length:", len(dprg_raw))

# Let's inspect the sections in DPRG:
# 1. Header & Days (Gunler)
# 2. Subjects (Dersler)
# 3. Teachers (Ogretmenler)
# 4. Classes (Siniflar)
# 5. Classrooms (Derslikler)
# 6. Lessons & Placements (TanimliDersler & Kartlar)

