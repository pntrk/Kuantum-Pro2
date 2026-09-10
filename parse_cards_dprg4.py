# -*- coding: utf-8 -*-
with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

print("File size:", len(raw))

# In our earlier analysis, classes ended around byte 7500
# Let's inspect bytes 7500 to 8500:
print("Around 7500:")
chunk = raw[7400:7800]
print("Text in chunk:", repr(chunk.decode('latin1', errors='ignore')[:300]))

