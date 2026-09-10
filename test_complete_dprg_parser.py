# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

# Let's verify our teacher constraint extraction on the raw dprg
# Find all occurrences of teachers and extract their closed hours:
saat_info = {
    12: (0, 0), 17: (0, 1), 22: (0, 2), 27: (0, 3), 32: (0, 4), 37: (0, 5), 42: (0, 6), 1839: (0, 7), 1947: (0, 8),
    1900: (1, 0), 1901: (1, 1), 1902: (1, 2), 1903: (1, 3), 1904: (1, 4), 1905: (1, 5), 1906: (1, 6), 1907: (1, 7), 1948: (1, 8),
    1908: (2, 0), 1909: (2, 1), 1910: (2, 2), 1911: (2, 3), 1912: (2, 4), 1913: (2, 5), 1914: (2, 6), 1915: (2, 7), 1949: (2, 8),
    1916: (3, 0), 1917: (3, 1), 1918: (3, 2), 1919: (3, 3), 1920: (3, 4), 1921: (3, 5), 1922: (3, 6), 1923: (3, 7), 1950: (3, 8),
    1924: (4, 0), 1925: (4, 1), 1926: (4, 2), 1927: (4, 3), 1928: (4, 4), 1929: (4, 5), 1930: (4, 6), 1931: (4, 7), 1951: (4, 8),
    2830: (5, 0), 2831: (5, 1), 2832: (5, 2), 2833: (5, 3)
}
all_saats = set(saat_info.keys())

# Also note: Çarşamba 5. saat is 1912!
# In the raw bytes, why did HİDAYET AS have `\x01\x00\x07\x00\x00`?
# Let's inspect bytes of HİDAYET AS carefully:
idx = raw.find("HİDAYET AS".encode('utf-8'))
h_bytes = raw[idx:idx+35]
print("HİDAYET AS bytes:", list(h_bytes))

