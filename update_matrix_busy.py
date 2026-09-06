import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the occurrences
code = code.replace(
    'const isBusyWithOwnClass = schedules[dt] && schedules[dt][selectedCoverDIdx] && schedules[dt][selectedCoverDIdx][pIdx];\n                                          if (isBusyWithOwnClass) return false;',
    'const isBusyWithOwnClass = schedules[dt] && schedules[dt][selectedCoverDIdx] && schedules[dt][selectedCoverDIdx][pIdx];\n                                          if (isBusyWithOwnClass && isActualLesson(isBusyWithOwnClass)) return false;'
)

code = code.replace(
    'const isBusyWithOwnClass = schedules[dt] && schedules[dt][selectedCoverDIdx] && schedules[dt][selectedCoverDIdx][pIdx];\n                                      if (isBusyWithOwnClass) return false;',
    'const isBusyWithOwnClass = schedules[dt] && schedules[dt][selectedCoverDIdx] && schedules[dt][selectedCoverDIdx][pIdx];\n                                      if (isBusyWithOwnClass && isActualLesson(isBusyWithOwnClass)) return false;'
)

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
