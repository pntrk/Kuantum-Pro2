# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

print("File size:", len(data))

# Header inspection
# 0..19:
print("Header:", list(data[:25]))

# Let's find how days, subjects, teachers, classes and cards are stored in data.
