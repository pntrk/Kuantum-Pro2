import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We need to find handleAutoAssignCovers and replace teacherStatuses with statusesToUse inside it
start_idx = code.find('const handleAutoAssignCovers = (overrideStatuses?: Record<string, string>) => {')
end_idx = code.find('const generateWhatsAppMessage = () => {', start_idx)
if end_idx == -1:
    end_idx = code.find('  const ', start_idx + 10)

func_body = code[start_idx:end_idx]
func_body = func_body.replace('teacherStatuses', 'statusesToUse')
code = code[:start_idx] + func_body + code[end_idx:]

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
