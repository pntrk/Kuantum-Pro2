with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

idx_harun = data.find(b"HARUN BARI")
idx_bahadir = data.find(b"BAHADIR")
print("Harun name len:", 20)
print("Bytes between Harun name and Bahadir ID:")
print(list(data[idx_harun + 20 : idx_bahadir - 6]))

idx_cisem = data.find(b"\xc3\x87\xc4\xb0SEM")
print("Bytes between Bahadir name and Cisem ID:")
print(list(data[idx_bahadir + 20 : idx_cisem - 6]))

