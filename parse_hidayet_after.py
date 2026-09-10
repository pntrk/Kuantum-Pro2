with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

pos = 4730 - 6
# Read Hidayet:
# t_id (4), name_len (2), name (11), short_len (2), short (2), color (2), num_closed (2), closed_hour (4)
# Total = 4 + 2 + 11 + 2 + 2 + 2 + 2 + 4 = 29 bytes
print("Hidayet slice:", list(data[pos:pos+29]))
print("Next 25 bytes:", list(data[pos+29:pos+54]))
