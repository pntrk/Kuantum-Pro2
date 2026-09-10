with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

pos = 4730 - 6
# Hidayet:
# id (4): 35, 3, 0, 0
# name_len (2): 11, 0
# name (11): HİDAYET AS
# short_len (2): 2, 0
# short (2): AS
# rgb (3): 90, 204, 115
# num_closed (2): 1, 0
# closed_hours: ...
# then Harun ID starts with 66, 0, 0, 0

idx_harun = data.find(b"HARUN BARI")
print("Harun name at:", idx_harun)
# Harun ID is 6 bytes before (4 bytes id, 2 bytes name_len):
harun_id_pos = idx_harun - 6
print("Bytes between Hidayet name and Harun ID:")
print(list(data[4730 + 11 : harun_id_pos]))

