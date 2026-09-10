# -*- coding: utf-8 -*-
with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

print("From 8500 to 9200:")
chunk = raw[8500:9200]
print("Text in chunk:", repr(chunk.decode('latin1', errors='ignore')[:300]))

