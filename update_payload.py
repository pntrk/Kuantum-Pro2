import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    '''        const payload = {
          source: 'timetable',
          dIdx: sourceDIdx,
          pIdx: sourcePIdx,
          blockSize: sourceHours,
          targetValue: sourceValue
        };''',
    '''        const payload = {
          source: 'timetable',
          sourceEntity: sourceEntity,
          dIdx: sourceDIdx,
          pIdx: sourcePIdx,
          blockSize: sourceHours,
          targetValue: sourceValue
        };'''
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
