xml = """
    <Gunler>
        <Gun SaatSayisi="9" Adi="Pazartesi" id="7">
            <Saat Bitis="09:20" id="12" Baslangic="08:40"/>
            <Saat Bitis="10:15" id="17" Baslangic="09:35"/>
            <Saat Bitis="11:15" id="22" Baslangic="10:35"/>
            <Saat Bitis="12:10" id="27" Baslangic="11:30"/>
            <Saat Bitis="13:55" id="32" Baslangic="13:15"/>
            <Saat Bitis="14:50" id="37" Baslangic="14:10"/>
            <Saat Bitis="15:45" id="42" Baslangic="15:05"/>
            <Saat Bitis="16:40" id="1839" Baslangic="16:00"/>
            <Saat Bitis="17:20" id="1947" Baslangic="16:40"/>
        </Gun>
        <Gun SaatSayisi="9" Adi="Salı" id="8">
            <Saat Bitis="09:20" id="1900" Baslangic="08:40"/>
            <Saat Bitis="10:15" id="1901" Baslangic="09:35"/>
            <Saat Bitis="11:15" id="1902" Baslangic="10:35"/>
            <Saat Bitis="12:10" id="1903" Baslangic="11:30"/>
            <Saat Bitis="13:55" id="1904" Baslangic="13:15"/>
            <Saat Bitis="14:50" id="1905" Baslangic="14:10"/>
            <Saat Bitis="15:45" id="1906" Baslangic="15:05"/>
            <Saat Bitis="16:40" id="1907" Baslangic="16:00"/>
            <Saat Bitis="17:20" id="1948" Baslangic="16:40"/>
        </Gun>
        <Gun SaatSayisi="9" Adi="Çarşamba" id="9">
            <Saat Bitis="09:20" id="1908" Baslangic="08:40"/>
            <Saat Bitis="10:15" id="1909" Baslangic="09:35"/>
            <Saat Bitis="11:15" id="1910" Baslangic="10:35"/>
            <Saat Bitis="12:10" id="1911" Baslangic="11:30"/>
            <Saat Bitis="13:55" id="1912" Baslangic="13:15"/>
            <Saat Bitis="14:50" id="1913" Baslangic="14:10"/>
            <Saat Bitis="15:45" id="1914" Baslangic="15:05"/>
            <Saat Bitis="16:40" id="1915" Baslangic="16:00"/>
            <Saat Bitis="17:20" id="1949" Baslangic="16:40"/>
        </Gun>
        <Gun SaatSayisi="9" Adi="Perşembe" id="10">
            <Saat Bitis="09:20" id="1916" Baslangic="08:40"/>
            <Saat Bitis="10:15" id="1917" Baslangic="09:35"/>
            <Saat Bitis="11:15" id="1918" Baslangic="10:35"/>
            <Saat Bitis="12:10" id="1919" Baslangic="11:30"/>
            <Saat Bitis="13:55" id="1920" Baslangic="13:15"/>
            <Saat Bitis="14:50" id="1921" Baslangic="14:10"/>
            <Saat Bitis="15:45" id="1922" Baslangic="15:05"/>
            <Saat Bitis="16:40" id="1923" Baslangic="16:00"/>
            <Saat Bitis="17:20" id="1950" Baslangic="16:40"/>
        </Gun>
        <Gun SaatSayisi="9" Adi="Cuma" id="11">
            <Saat Bitis="09:20" id="1924" Baslangic="08:40"/>
            <Saat Bitis="10:15" id="1925" Baslangic="09:35"/>
            <Saat Bitis="11:15" id="1926" Baslangic="10:35"/>
            <Saat Bitis="12:10" id="1927" Baslangic="11:30"/>
            <Saat Bitis="13:55" id="1928" Baslangic="13:15"/>
            <Saat Bitis="14:50" id="1929" Baslangic="14:10"/>
            <Saat Bitis="15:45" id="1930" Baslangic="15:05"/>
            <Saat Bitis="16:40" id="1931" Baslangic="16:00"/>
            <Saat Bitis="17:20" id="1951" Baslangic="16:40"/>
        </Gun>
        <Gun SaatSayisi="4" Adi="Cumartesi" id="2829">
            <Saat Bitis="10:10" id="2830" Baslangic="09:30"/>
            <Saat Bitis="11:00" id="2831" Baslangic="10:20"/>
            <Saat Bitis="11:50" id="2832" Baslangic="11:10"/>
            <Saat Bitis="12:40" id="2833" Baslangic="12:00"/>
        </Gun>
    </Gunler>
"""

# Now look at Çarşamba 5. saat:
# Çarşamba 5. saat: id="1912" (Baslangic="13:15", Bitis="13:55")!
# Little-endian for 1912: 1912 % 256 = 120 (0x78 = 'x'), 1912 // 256 = 7 (0x07)
# So bytes are: \x78\x07\x00\x00 ('x\x07\x00\x00')
# Let us check Hidayet AS, Harun Barış Tahtacı, Bahadır Şafak Kumcu bytes:

with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

idx = raw.find(b"H\xc4\xb0DAYET AS")
print("Hidayet slice:", [b for b in raw[idx:idx+40]])

# Look at Harun Barış:
idx2 = raw.find("HARUN BARIŞ TAHTACI".encode('utf-8'))
print("Harun slice:", [b for b in raw[idx2:idx2+40]])

# Look at Bilal Akar:
idx3 = raw.find("BİLAL AKAR".encode('utf-8'))
print("Bilal slice:", [b for b in raw[idx3:idx3+40]])

# Look at Alper Kaya:
idx4 = raw.find("ALPER KAYA".encode('utf-8'))
print("Alper slice:", [b for b in raw[idx4:idx4+40]])

