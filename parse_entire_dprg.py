# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

# 1. Teachers: We know there are 41 teachers
# Let's find all teachers and classes by searching in data:
# In XML we have:
# Ogretmenler: 803: HİDAYET AS, 66: HARUN BARIŞ TAHTACI, 67: BAHADIR ŞAFAK KUMCU...
# Siniflar: 119: 5A, 120: 5B, 1966: 5C, 116: 5D, 117: 5E, 118: 5F... 2787: 8-1 DYK...
# Dersler: 2834: DYK, 1972: TÜRKÇE, 2070: MATEMATİK, 2175: FEN BİLİMLERİ...

# Let's extract all teachers and classes dynamically from binary:
print("Scanning entities...")

