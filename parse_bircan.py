with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

idx = raw.find("BİRCAN ÖZTRAK".encode('utf-8'))
b_bytes = raw[idx:idx+80]
print("Bircan full slice:", list(b_bytes))

