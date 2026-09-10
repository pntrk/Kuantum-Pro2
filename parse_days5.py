import struct

with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

pos = 12
num_days = data[pos] # 6
pos += 1
print(f"Number of days: {num_days}")

all_hours = {}

for d in range(num_days):
    gun_id = struct.unpack('<I', data[pos:pos+4])[0]
    pos += 4
    name_len = struct.unpack('<H', data[pos:pos+2])[0]
    pos += 2
    name = data[pos:pos+name_len].decode('utf-8')
    pos += name_len
    num_hours = data[pos]
    pos += 1
    print(f"Day {d}: {name} (ID: {gun_id}, {num_hours} hours)")
    for h in range(num_hours):
        hour_id = struct.unpack('<I', data[pos:pos+4])[0]
        pos += 4
        hr = data[pos]
        mn = data[pos+1]
        pos += 2
        all_hours[hour_id] = (d, h, f"{hr:02d}:{mn:02d}")
        print(f"   Hour {h+1}: id={hour_id}, time={hr:02d}:{mn:02d}")

print(f"Total hours parsed: {len(all_hours)}")
print(f"Pos after days: {pos}")
print("Next bytes:", list(data[pos:pos+20]))

