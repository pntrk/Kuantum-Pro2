import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Update table wrappers
old_table_wrap = 'className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm"'
new_table_wrap = 'className="overflow-x-auto overflow-hidden rounded-xl border border-slate-200 shadow-sm"'
code = code.replace(old_table_wrap, new_table_wrap)

old_table_wrap2 = 'className="overflow-x-auto"'
new_table_wrap2 = 'className="overflow-x-auto overflow-hidden rounded-xl border border-slate-200 shadow-sm"'
code = code.replace(old_table_wrap2, new_table_wrap2)

# TH
code = re.sub(
    r'<th([^>]*)className="([^"]*(?:p-3|py-3|px-4)[^"]*bg-slate-50[^"]*)"',
    lambda m: f'<th{m.group(1)}className="{m.group(2).replace("bg-slate-50", "bg-slate-100/90 backdrop-blur-sm sticky top-0 z-10").replace("text-slate-600", "text-slate-800").replace("text-slate-500", "text-slate-800").replace("p-3", "px-4 py-3 align-middle")}"',
    code
)
code = re.sub(
    r'<th([^>]*)className="([^"]*bg-white[^"]*)"',
    lambda m: f'<th{m.group(1)}className="{m.group(2).replace("bg-white", "bg-slate-100/90 backdrop-blur-sm sticky top-0 z-10").replace("text-slate-600", "text-slate-800").replace("text-slate-500", "text-slate-800").replace("p-3", "px-4 py-3 align-middle").replace("p-2", "px-4 py-3 align-middle")}"',
    code
)

# TR hover
code = re.sub(
    r'<tr([^>]*)className="([^"]*hover:bg-slate-50[^"]*)"',
    lambda m: f'<tr{m.group(1)}className="{m.group(2).replace("hover:bg-slate-50", "transition-colors hover:bg-slate-50/80")}"',
    code
)

# TD padding
code = re.sub(r'<td([^>]*)className="([^"]*p-2[^"]*)"', lambda m: f'<td{m.group(1)}className="{m.group(2).replace("p-2", "px-4 py-3 align-middle")}"', code)
code = re.sub(r'<td([^>]*)className="([^"]*p-3[^"]*)"', lambda m: f'<td{m.group(1)}className="{m.group(2).replace("p-3", "px-4 py-3 align-middle")}"', code)

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("DutyManager.tsx updated.")
