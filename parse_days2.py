with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

# Pazartesi is at offset 19
# Let's inspect bytes from offset 10 to 120
for i in range(10, 120):
    print(f"offset {i}: byte={data[i]} (0x{data[i]:02x}, char={chr(data[i]) if 32<=data[i]<127 else '?'})")
