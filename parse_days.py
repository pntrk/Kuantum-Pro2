# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

pos = 12 # after header
num_days = data[pos] # 6
pos += 1
print(f"Num days: {num_days}")

saat_map = {}
week_days = []
lesson_times = []

for d_idx in range(num_days):
    gun_id = struct.unpack('<I', data[pos:pos+4])[0]
    pos += 4
    name_len = struct.unpack('<H', data[pos:pos+2])[0]
    pos += 2
    name = data[pos:pos+name_len].decode('utf-8', errors='ignore')
    pos += name_len
    num_hours = data[pos]
    pos += 1
    print(f"Day {d_idx}: ID={gun_id}, Name={name}, Hours={num_hours}")
    week_days.append({'id': d_idx+1, 'name': name, 'active': True, 'periods': num_hours})
    
    for h_idx in range(num_hours):
        hour_id = struct.unpack('<I', data[pos:pos+4])[0]
        pos += 4
        # Next bytes:
        b1 = data[pos]; b2 = data[pos+1]; b3 = data[pos+2]; b4 = data[pos+3]
        pos += 4 # let's see how many bytes
        print(f"  Hour {h_idx}: id={hour_id}, bytes=[{b1}, {b2}, {b3}, {b4}]")
        saat_map[hour_id] = (d_idx, h_idx)

print("Pos after days:", pos)
