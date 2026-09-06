import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix the early return
code = code.replace(
    'if (sourceDIdx === targetDIdx && sourcePIdx === targetPIdx) return;',
    'if (payload.sourceEntity === destEntity && sourceDIdx === targetDIdx && sourcePIdx === targetPIdx) return;'
)

# Fix reassignment when dragging across entities
# When moving a card in Teacher view from Teacher A to Teacher B, it should REMOVE Teacher A and ADD Teacher B.
replacement = """
        // Ensure the destination entity is assigned to the card, and remove the source entity if it changed
        let targetTeachers = [...(sourceCardData.teachers || [])];
        let targetClasses = [...(sourceCardData.classes || [])];
        let targetRooms = [...(sourceCardData.rooms || [])];
        
        if (previewType === 'teacher' && payload.sourceEntity !== destEntity) {
            targetTeachers = targetTeachers.filter(t => t !== payload.sourceEntity);
            if (!targetTeachers.includes(destEntity)) targetTeachers.push(destEntity);
        }
        if (previewType === 'class' && payload.sourceEntity !== destEntity) {
            targetClasses = targetClasses.filter(c => c !== payload.sourceEntity);
            if (!targetClasses.includes(destEntity)) targetClasses.push(destEntity);
        }
        if (previewType === 'room' && payload.sourceEntity !== destEntity) {
            targetRooms = targetRooms.filter(r => r !== payload.sourceEntity);
            if (!targetRooms.includes(destEntity)) targetRooms.push(destEntity);
        }
"""
code = code.replace("""
        // Ensure the destination entity is assigned to the card
        let targetTeachers = sourceCardData.teachers || [];
        let targetClasses = sourceCardData.classes || [];
        let targetRooms = sourceCardData.rooms || [];
        
        if (previewType === 'teacher' && !targetTeachers.includes(destEntity)) targetTeachers.push(destEntity);
        if (previewType === 'class' && !targetClasses.includes(destEntity)) targetClasses.push(destEntity);
        if (previewType === 'room' && !targetRooms.includes(destEntity)) targetRooms.push(destEntity);
""", replacement)


with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
