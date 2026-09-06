import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_func = """  const handleAutoAssignCovers = () => {
    if (!selectedCoverDate) return;"""

new_func = """  const handleAutoAssignCovers = (overrideStatuses?: Record<string, string>) => {
    if (!selectedCoverDate) return;
    const statusesToUse = overrideStatuses || teacherStatuses;"""

code = code.replace(old_func, new_func)

# replace teacherStatuses[` with statusesToUse[` inside handleAutoAssignCovers
# wait, it's safer to just regex replace within the function body.
