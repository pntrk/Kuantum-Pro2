import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's see if handleDropToTimetable adds the destEntity
print("destEntity in handleDropToTimetable:", "destEntity" in code)
