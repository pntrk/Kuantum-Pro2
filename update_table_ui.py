import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make the table container overflow-hidden and rounded
old_table_wrapper = '<div className="overflow-x-auto overflow-y-auto w-full h-[calc(100vh-280px)] min-h-[400px] border border-slate-300 rounded-lg bg-slate-100 relative group/matrix custom-scrollbar shadow-inner">'
new_table_wrapper = '<div className="overflow-x-auto overflow-y-auto w-full h-[calc(100vh-280px)] min-h-[400px] overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-slate-50 relative group/matrix custom-scrollbar">'
if old_table_wrapper in code:
    code = code.replace(old_table_wrapper, new_table_wrapper)

# Update TH headers
old_th_1 = '<th className="border p-2 min-w-[70px] md:min-w-[80px] w-[70px] md:w-[80px] font-black bg-white sticky top-0 left-0 z-30 shadow-[2px_2px_4px_rgba(0,0,0,0.05)]">'
new_th_1 = '<th className="border px-4 py-3 min-w-[70px] md:min-w-[80px] w-[70px] md:w-[80px] font-black bg-slate-100/90 backdrop-blur-sm sticky top-0 left-0 z-30 shadow-[2px_2px_4px_rgba(0,0,0,0.05)] text-slate-800 align-middle">'
code = code.replace(old_th_1, new_th_1)

old_th_2 = 'className="border p-1.5 min-w-[120px] md:min-w-[160px] font-bold sticky top-0 z-20 bg-white shadow-sm"'
new_th_2 = 'className="border px-4 py-3 min-w-[120px] md:min-w-[160px] font-bold sticky top-0 z-20 bg-slate-100/90 backdrop-blur-sm shadow-sm text-slate-800 align-middle"'
code = code.replace(old_th_2, new_th_2)

# Update TRs
old_tr = '<tr key={rowKey} className="group/row">'
new_tr = '<tr key={rowKey} className="group/row transition-colors hover:bg-slate-50/80">'
code = code.replace(old_tr, new_tr)

# Text slate replacements
code = code.replace('text-black', 'text-slate-800')
code = code.replace('text-slate-600', 'text-slate-500')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("App.tsx table styles updated.")
