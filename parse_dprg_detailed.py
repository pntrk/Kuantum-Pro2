# -*- coding: utf-8 -*-
with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

# Let's inspect where "HİDAYET AS" is in raw bytes
idx = raw.find("HİDAYET AS".encode('utf-8'))
print("Hidayet AS at index:", idx)
# Print slice around it
print("Bytes:", repr(raw[idx:idx+60]))

idx2 = raw.find("NURÇİN BÜYÜKYAKALI".encode('utf-8'))
print("Nurçin at index:", idx2)
print("Bytes:", repr(raw[idx2:idx2+60]))

idx3 = raw.find("SEMRA IŞIKLAR".encode('utf-8'))
print("Semra at index:", idx3)
print("Bytes:", repr(raw[idx3:idx3+60]))

idx4 = raw.find("BİRCAN ÖZTRAK".encode('utf-8'))
print("Bircan at index:", idx4)
print("Bytes:", repr(raw[idx4:idx4+80]))

