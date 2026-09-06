import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Fix handleDropToTimetable placedCardStr
old_placed = """const placedCardStr = JSON.stringify({ 
          id: sourceCardData.id || generateId(), 
          teachers: sourceCardData.teachers || [], 
          classes: sourceCardData.classes || [], 
          rooms: sourceCardData.rooms || [], 
          subject: sourceCardData.subject || '' 
        });"""

new_placed = """const placedCardStr = JSON.stringify({ 
          id: sourceCardData.id || generateId(), 
          teachers: sourceCardData.teachers || [], 
          classes: sourceCardData.classes || [], 
          rooms: sourceCardData.rooms || [], 
          subject: sourceCardData.subject || '',
          hours: fitHours
        });"""
if old_placed in code:
    code = code.replace(old_placed, new_placed)
else:
    print("WARNING: old_placed not found")
    
# 2. Fix executePlacement
old_exec = """const cardDataStr = typeof cardData === 'string' ? cardData : JSON.stringify({
             id: data.id || generateId(),
             teachers: data.teachers || [],
             classes: data.classes || [],
             rooms: data.rooms || [],
             subject: data.subject || ''
         });"""

new_exec = """const cardDataStr = typeof cardData === 'string' ? cardData : JSON.stringify({
             id: data.id || generateId(),
             teachers: data.teachers || [],
             classes: data.classes || [],
             rooms: data.rooms || [],
             subject: data.subject || '',
             hours: hours
         });"""
if old_exec in code:
    code = code.replace(old_exec, new_exec)
else:
    print("WARNING: old_exec not found")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
