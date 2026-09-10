with open('src/dprg_sample.txt', 'rb') as f:
    data = f.read()

# Let's inspect where classes end and what is next:
# Classes ended around 9100.
# Let's print out text strings from 9000 to 10300:
for i in range(9100, 10300, 20):
    sub = data[i:i+20]
    print(f"{i}:", list(sub))
