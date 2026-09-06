import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacement = """
        // Relocate displaced items (Swap back to source or send to unplaced pool)
        if (displacedItems.length === 1 && overflowHours === 0 && displacedItems[0].hours <= sourceHours) {
            const singleItem = displacedItems[0];
            
            // Reassign the displaced item to the source entity
            let displacedTeachers = [...(singleItem.cardData.teachers || [])];
            let displacedClasses = [...(singleItem.cardData.classes || [])];
            let displacedRooms = [...(singleItem.cardData.rooms || [])];
            
            if (previewType === 'teacher' && payload.sourceEntity !== destEntity) {
                displacedTeachers = displacedTeachers.filter(t => t !== destEntity);
                if (!displacedTeachers.includes(payload.sourceEntity)) displacedTeachers.push(payload.sourceEntity);
            }
            if (previewType === 'class' && payload.sourceEntity !== destEntity) {
                displacedClasses = displacedClasses.filter(c => c !== destEntity);
                if (!displacedClasses.includes(payload.sourceEntity)) displacedClasses.push(payload.sourceEntity);
            }
            if (previewType === 'room' && payload.sourceEntity !== destEntity) {
                displacedRooms = displacedRooms.filter(r => r !== destEntity);
                if (!displacedRooms.includes(payload.sourceEntity)) displacedRooms.push(payload.sourceEntity);
            }
            
            const displacedCardStr = JSON.stringify({
               id: singleItem.cardData.id,
               teachers: displacedTeachers,
               classes: displacedClasses,
               rooms: displacedRooms,
               subject: singleItem.cardData.subject,
               hours: singleItem.hours
            });

            executePlacement(displacedCardStr, singleItem.hours, sourceDIdx, sourcePIdx);
        } else {
"""
code = code.replace("""
        // Relocate displaced items (Swap back to source or send to unplaced pool)
        if (displacedItems.length === 1 && overflowHours === 0 && displacedItems[0].hours <= sourceHours) {
            const singleItem = displacedItems[0];
            executePlacement(singleItem.cardStr, singleItem.hours, sourceDIdx, sourcePIdx);
        } else {
""", replacement)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
