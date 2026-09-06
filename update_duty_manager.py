import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update the button styling
code = code.replace(
    'className="w-full sm:w-auto bg-indigo-600  text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold -sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap min-h-[44px] -md hover:-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"',
    'className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap min-h-[44px] bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all active:scale-95"'
)

# 2. Update isBusyWithOwnClass check to use isActualLesson
code = code.replace(
    'const isBusyWithOwnClass = schedules[dt] && schedules[dt][selectedCoverDIdx] && schedules[dt][selectedCoverDIdx][pIdx];\n                               if (isBusyWithOwnClass) return false;',
    'const isBusyWithOwnClass = schedules[dt] && schedules[dt][selectedCoverDIdx] && schedules[dt][selectedCoverDIdx][pIdx];\n                               if (isBusyWithOwnClass && isActualLesson(isBusyWithOwnClass)) return false;'
)

# Also check for dutyAdminForDay logic, wait:
# "nöbetçi idareciler tanımlanmış nöbet yerlerinde nöbet tutamaz" 
# dutyLocations.forEach(loc => {
#    activeDays.forEach((day, dIdx) => {
#        cells.push({ loc, day, dIdx });
#    });
# });
# In handleAutoAssign, we filter dutyAdmins. But what about the matrix manual select dropdown?
# The manual dropdown:
# {teachers.map(teacher => {
#    const isAdmin = dutyAdmins.includes(teacher);
#    // is it preventing selection if isAdmin? No, the dropdown just lists them.
#    const isAssigned = ...
#    const disabled = isAdmin || isExempt; // We should disable it if they are an admin
# wait! Let's check how the manual assignment list is rendered!

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
