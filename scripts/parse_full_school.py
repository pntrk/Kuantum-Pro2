# encoding: utf-8
import re
import json

# We will define each teacher's exact schedule directly from the user's provided output
# Days: 0: Pazartesi, 1: Salı, 2: Çarşamba, 3: Perşembe, 4: Cuma, 5: Cumartesi
# Hours: 0-indexed (0 is 1st period, 1 is 2nd period, etc.)

TEACHERS_SCHEDULE = {
    "HİDAYET AS": [
        # Çarşamba 3-4 (periods 2, 3): 8D TEKNO
        {"day": 2, "periods": [2, 3], "class": "8D", "subject": "TEKNO", "co": ["BİRCAN ÖZTRAK"]}
    ],
    "HARUN BARIŞ TAHTACI": [
        # Pazartesi 6-7: 7B TEKNO
        {"day": 0, "periods": [5, 6], "class": "7B", "subject": "TEKNO", "co": ["BİRCAN ÖZTRAK"]},
        # Salı 3-4: 7A TEKNO
        {"day": 1, "periods": [2, 3], "class": "7A", "subject": "TEKNO", "co": ["BİRCAN ÖZTRAK"]},
        # Çarşamba 1-2: 7C TEKNO
        {"day": 2, "periods": [0, 1], "class": "7C", "subject": "TEKNO", "co": ["BİRCAN ÖZTRAK"]}
    ],
    "BAHADIR ŞAFAK KUMCU": [
        # Pazartesi 4-5: 8C TEKNO
        {"day": 0, "periods": [3, 4], "class": "8C", "subject": "TEKNO", "co": ["BİRCAN ÖZTRAK"]},
        # Çarşamba 6-7: 8A TEKNO
        {"day": 2, "periods": [5, 6], "class": "8A", "subject": "TEKNO", "co": ["BİRCAN ÖZTRAK"]},
        # Cuma 1-2: 8B TEKNO
        {"day": 4, "periods": [0, 1], "class": "8B", "subject": "TEKNO", "co": ["BİRCAN ÖZTRAK"]}
    ]
}
print("Base teachers defined")
