import struct

with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

pos = 12
num_days = data[pos]
pos += 1
print("Num days:", num_days)

days_data = []
saat_to_pos = {}

for d in range(num_days):
    gun_id = struct.unpack('<I', data[pos:pos+4])[0]
    pos += 4
    name_len = struct.unpack('<H', data[pos:pos+2])[0]
    pos += 2
    name = data[pos:pos+name_len].decode('utf-8')
    pos += name_len
    num_hours = data[pos]
    pos += 1
    hours = []
    for h in range(num_hours):
        hour_id = struct.unpack('<I', data[pos:pos+4])[0]
        pos += 4
        hr = data[pos]
        mn = data[pos+1]
        pos += 2
        hours.append((hour_id, hr, mn))
        saat_to_pos[hour_id] = (d, h)
    print(f"Day {d}: {name} ({len(hours)} hours)")
    days_data.append((gun_id, name, hours))

print("Pos after all days:", pos)
print("Next bytes after days:", list(data[pos:pos+30]))
