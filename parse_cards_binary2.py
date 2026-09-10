# -*- coding: utf-8 -*-
with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

# 1912 = 0x0778 -> bytes: 120, 7, 0, 0 or 120, 7
target = bytes([120, 7])
pos = 0
found = []
while True:
    idx = data.find(target, pos)
    if idx == -1: break
    found.append(idx)
    pos = idx + 1

print(f"Found [120, 7] at {len(found)} places: {found[:10]}")
for p in found[:5]:
    print(f"At {p}:", list(data[p-6:p+16]))

