import re
from collections import defaultdict

# Let's inspect the actual XML from the prompt or extract all TanimliDers with SEÇMELİ
# We know Turkish Dağıtmatik and MEB schedule logic:
# In Turkish middle schools (Ortaokul), each grade has designated Elective Course Days / Hours:
# e.g., 5th grade has electives on Tuesday and Friday, or Thursday, etc.
# Or each SEÇMELİ ders (e.g., SEÇMELİ OKUMA BECERİLERİ, SEÇMELİ YAZARLIK, SEÇMELİ BİLİM UYGULAMALARI, SEÇMELİ GÖRGÜ KURALLARI, SEÇMELİ SPOR, SEÇMELİ TEMEL DİNİ BİLGİLER, SEÇMELİ HUKUK, SEÇMELİ ÇEVRE, SEÇMELİ KÜLTÜR, SEÇMELİ OYUN, SEÇMELİ YABANCI DİL, etc.)
# Each elective course in Dağıtmatik is only allowed on specific days/hours where that elective is actually taught for that grade/course!
# If a Seçmeli ders is only placed on Perşembe 1. ve 2. saatler (or specific days), all OTHER days and hours must be constrained (kısıtlı)!
