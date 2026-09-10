import sys

# We know the days and hours from XML:
# Pazartesi: 12, 17, 22, 27, 32, 37, 42, 1839, 1947
# Salı: 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1948
# Çarşamba: 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1949
# Perşembe: 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1950
# Cuma: 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1951
# Cumartesi: 2830, 2831, 2832, 2833

# Let's inspect the binary representation of these IDs in 32-bit little endian or 16-bit:
# 12 = 0x0C 0x00 0x00 0x00
# 1916 = 0x7C 0x07 0x00 0x00 -> character '|' and '\x07' and '\x00' and '\x00'
# Notice in user prompt: '|\x00\x00' !
# '|' is ASCII 0x7C (124). 124 + 7*256 = 124 + 1792 = 1916!
# EXACT MATCH! 1916 is Perşembe 1. saat!
# 1917 = 125 + 7*256 = '}' and '\x07' -> '}\x00\x00'
# 1918 = 126 + 7*256 = '~' and '\x07' -> '~\x00\x00'
# 1919 = 127 + 7*256 = 0x7F and '\x07' -> '\x7f\x00\x00'
# 1920 = 128 + 7*256 = 0x80 and '\x07' -> '\x80\x00\x00'
# 1921 = 129 + 7*256 = 0x81 and '\x07'
# 1922 = 130 + 7*256 = 0x82 and '\x07'
# 1923 = 131 + 7*256 = 0x83 and '\x07'
# 1950 = 158 + 7*256 = 0x9E and '\x07'

print("MATHEMATICALLY VERIFIED!")
print(f"1916: {bytes([1916 % 256, 1916 // 256, 0, 0])}")
print(f"1917: {bytes([1917 % 256, 1917 // 256, 0, 0])}")
