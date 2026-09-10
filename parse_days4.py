with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

# Offset 77 to 100
for i in range(75, 110):
    print(f"{i}: {data[i]} (char={chr(data[i]) if 32<=data[i]<127 else '?'})")
