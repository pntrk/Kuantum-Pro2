import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

helper_func = """
  // Helper to check if a lesson is actually a valid lesson that needs a substitute
  const isActualLesson = (lesson: any) => {
    if (!lesson) return false;
    if (typeof lesson === 'string') {
      try {
        const card = JSON.parse(lesson);
        // If it has no classes, it's considered an empty/unplaced slot
        if (!card.classes || card.classes.length === 0) return false;
      } catch (e) {
        if (!lesson.trim()) return false;
      }
    }
    return true;
  };
"""

code = code.replace("  const getFormattedDate = ", helper_func + "\n  const getFormattedDate = ")

code = code.replace("const hasLesson = schedules[teacher][selectedCoverDIdx][pIdx];\n                    if (hasLesson) {", "const hasLesson = schedules[teacher][selectedCoverDIdx][pIdx];\n                    if (isActualLesson(hasLesson)) {")
code = code.replace("const hasLesson = hasSched[pIdx];\n                            if (hasLesson) {", "const hasLesson = hasSched[pIdx];\n                            if (isActualLesson(hasLesson)) {")
code = code.replace("const hasLesson = schedules[t]?.[selectedCoverDIdx]?.[pIdx];\n                                        if (!hasLesson) return null;", "const hasLesson = schedules[t]?.[selectedCoverDIdx]?.[pIdx];\n                                        if (!isActualLesson(hasLesson)) return null;")
code = code.replace("const hasLesson = schedules[teacher][selectedCoverDIdx][pIdx];\n                                        if (!hasLesson) return null;", "const hasLesson = schedules[teacher][selectedCoverDIdx][pIdx];\n                                        if (!isActualLesson(hasLesson)) return null;")
code = code.replace("if (hasLesson) {\n              try {\n                const card", "if (isActualLesson(hasLesson)) {\n              try {\n                const card")
code = code.replace("if (hasLesson) {\n                            try {\n                              const card", "if (isActualLesson(hasLesson)) {\n                            try {\n                              const card")

# Wait, there's another auto assign place maybe? Let's use regex for safety on 'if (hasLesson) {' 
# No, explicit replacement is safer. Let's just do it directly in python
with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
