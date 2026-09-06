import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. handleAutoAssign
old_eligible = "const eligibleTeachers = teachers.filter(t => hasAnyLessons(t) && !exemptTeachers.includes(t));"
new_eligible = "const eligibleTeachers = teachers.filter(t => hasAnyLessons(t) && !exemptTeachers.includes(t) && !dutyAdmins.includes(t));"
code = code.replace(old_eligible, new_eligible)

# 2. handleAutoAssignCovers (Wait, handleAutoAssignCovers is for covers, not sure if admins should be exempt from covering? Yes, probably)
# Let's check handleAutoAssignCovers
# eligible teachers there are `dutyTeachersForDay` - which doesn't include admins unless they were manually assigned. So we don't need to change it.

# 3. Manual Assignment List
# find where `const isExempt = exemptTeachers.includes(teacher);` is.
old_exempt = "const isExempt = exemptTeachers.includes(teacher);"
new_exempt = "const isAdmin = dutyAdmins.includes(teacher);\n                    const isExempt = exemptTeachers.includes(teacher) || isAdmin;"
code = code.replace(old_exempt, new_exempt)

# Find `if (isExempt) {` to change the confirm message if it's an admin
old_confirm = "if (confirm(`${teacher} nöbetten muaf olarak işaretlenmiş. Yine de nöbet yazmak istiyor musunuz?`)) {"
new_confirm = "if (confirm(isAdmin ? `${teacher} idareci olduğu için standart nöbetten muaf. Yine de nöbet yazmak istiyor musunuz?` : `${teacher} nöbetten muaf olarak işaretlenmiş. Yine de nöbet yazmak istiyor musunuz?`)) {"
code = code.replace(old_confirm, new_confirm)

# Add İdareci tag instead of Muaf tag if isAdmin
old_tag = "{isExempt && <span className=\"text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full\">MUAF</span>}"
new_tag = "{isAdmin ? <span className=\"text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full\">İDARECİ</span> : isExempt && <span className=\"text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full\">MUAF</span>}"
code = code.replace(old_tag, new_tag)

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
