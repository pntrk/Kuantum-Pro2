# -*- coding: utf-8 -*-
import struct

with open('src/dprg_sample.txt', 'rb') as f:
    raw = f.read()

# 1. Day hours:
# In XML:
# Pazartesi: 12, 17, 22, 27, 32, 37, 42, 1839, 1947
# Salı: 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1948
# Çarşamba: 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1949
# Perşembe: 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1950
# Cuma: 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1951
# Cumartesi: 2830, 2831, 2832, 2833

# Let's inspect where "Pazartesi" is in DPRG:
pzt_idx = raw.find(b"Pazartesi")
print("Pazartesi index:", pzt_idx)
print("Pazartesi surroundings:", [b for b in raw[pzt_idx-10:pzt_idx+60]])

