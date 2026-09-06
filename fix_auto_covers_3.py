import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_idx = code.find('const handleAutoAssignCovers = (overrideStatuses?: Record<string, string>) => {')
end_idx = code.find('const handlePrintCoverReport', start_idx)

if start_idx != -1 and end_idx != -1:
    func_body = code[start_idx:end_idx]
    
    # insert const statusesToUse = overrideStatuses || teacherStatuses;
    func_body = func_body.replace(
        "if (!selectedCoverDate) return;",
        "if (!selectedCoverDate) return;\n    const statusesToUse = overrideStatuses || teacherStatuses;"
    )
    
    # replace teacherStatuses[ with statusesToUse[
    func_body = func_body.replace('teacherStatuses[`', 'statusesToUse[`')
    func_body = func_body.replace('teacherStatuses[t', 'statusesToUse[t')
    
    code = code[:start_idx] + func_body + code[end_idx:]

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
