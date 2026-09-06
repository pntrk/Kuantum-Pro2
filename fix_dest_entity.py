import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_placed = """const placedCardStr = JSON.stringify({ 
          id: sourceCardData.id || generateId(), 
          teachers: sourceCardData.teachers || [], 
          classes: sourceCardData.classes || [], 
          rooms: sourceCardData.rooms || [], 
          subject: sourceCardData.subject || '',
          hours: fitHours
        });"""

new_placed = """// Ensure the destination entity is assigned to the card
        let targetTeachers = sourceCardData.teachers || [];
        let targetClasses = sourceCardData.classes || [];
        let targetRooms = sourceCardData.rooms || [];
        
        if (previewType === 'teacher' && !targetTeachers.includes(destEntity)) targetTeachers.push(destEntity);
        if (previewType === 'class' && !targetClasses.includes(destEntity)) targetClasses.push(destEntity);
        if (previewType === 'room' && !targetRooms.includes(destEntity)) targetRooms.push(destEntity);

        const placedCardStr = JSON.stringify({ 
          id: sourceCardData.id || generateId(), 
          teachers: targetTeachers, 
          classes: targetClasses, 
          rooms: targetRooms, 
          subject: sourceCardData.subject || '',
          hours: fitHours
        });"""

if old_placed in code:
    code = code.replace(old_placed, new_placed)
else:
    print("WARNING: old_placed not found")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
