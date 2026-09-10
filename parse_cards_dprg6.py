# -*- coding: utf-8 -*-
with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

print("From 9200 to 10344:")
chunk = raw[9200:10344]
# Find MERKEZ ATATÜRK ORTAOKULU
idx = raw.find(b"MERKEZ ATAT")
print("MERKEZ ATAT at:", idx)
print("After MERKEZ:", [b for b in raw[idx:idx+200]])

