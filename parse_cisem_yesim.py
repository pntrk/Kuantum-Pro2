with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

idx_cisem = data.find(b"\xc3\x87\xc4\xb0SEM")
idx_yesim = data.find(b"YE\xc5\x9e\xc4\xb0M")
print("Bytes between Cisem name and Yesim ID:")
print(list(data[idx_cisem + 16 : idx_yesim - 6]))

idx_nurcin = data.find(b"NUR\xc3\x87\xc4\xb0N")
print("Bytes between Yesim name and Nurcin ID:")
print(list(data[idx_yesim + 13 : idx_nurcin - 6]))

