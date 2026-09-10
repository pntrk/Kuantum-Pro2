# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

pos = 4730 - 6 # points to [35, 3, 0, 0] (ID of Hidayet)
teachers = []

for i in range(41):
    t_id = struct.unpack('<I', data[pos:pos+4])[0]
    pos += 4
    name_len = struct.unpack('<H', data[pos:pos+2])[0]
    pos += 2
    name = data[pos:pos+name_len].decode('utf-8', errors='ignore')
    pos += name_len
    short_len = struct.unpack('<H', data[pos:pos+2])[0]
    pos += 2
    short_name = data[pos:pos+short_len].decode('utf-8', errors='ignore')
    pos += short_len
    
    # 2 bytes color/flags
    color_bytes = data[pos:pos+2]
    pos += 2
    
    # Number of closed hours
    num_closed = struct.unpack('<H', data[pos:pos+2])[0]
    pos += 2
    
    closed_hours = []
    for _ in range(num_closed):
        h_id = struct.unpack('<I', data[pos:pos+4])[0]
        pos += 4
        closed_hours.append(h_id)
        
    teachers.append({
        'id': t_id,
        'name': name,
        'short_name': short_name,
        'closed': closed_hours
    })
    print(f"[{i+1}/41] ID={t_id}, Name={name} ({short_name}), Closed={len(closed_hours)}")

print(f"Position after teachers: {pos}")
print("Next bytes after teachers:", list(data[pos:pos+25]))

