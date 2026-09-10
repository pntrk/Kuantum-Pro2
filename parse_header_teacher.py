with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

idx = raw.find("HİDAYET AS".encode('utf-8'))
print("Before HİDAYET AS:", list(raw[idx-15:idx]))

idx2 = raw.find("HARUN BARIŞ TAHTACI".encode('utf-8'))
print("Before HARUN BARIŞ:", list(raw[idx2-15:idx2]))

idx3 = raw.find("BAHADIR ŞAFAK KUMCU".encode('utf-8'))
print("Before BAHADIR:", list(raw[idx3-15:idx3]))

idx4 = raw.find("BİRCAN ÖZTRAK".encode('utf-8'))
print("Before BİRCAN:", list(raw[idx4-15:idx4]))

