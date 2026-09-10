with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

for i in range(10000, len(data), 30):
    sub = data[i:i+30]
    print(f"{i}:", [chr(b) if 32<=b<127 else '.' for b in sub])
