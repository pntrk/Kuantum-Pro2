# -*- coding: utf-8 -*-
with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

idx = raw.find(b"T\xc3\x9cRK\xc3\x87E")
print("TÜRKÇE at:", idx)
print("Before TÜRKÇE:", [b for b in raw[idx-20:idx]])
print("After TÜRKÇE:", [b for b in raw[idx:idx+40]])
