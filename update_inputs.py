import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace block sizes >= 2 to add rounded-lg shadow-sm
old_block_class = r'className=\{`h-full w-full min-h-\[46px\] md:min-h-\[54px\] p-1 flex flex-col justify-between items-center relative group/cell transition-all select-none outline-none \$\{cClass\} border-l-\[3\.5px\] rounded-\[3px\] \$\{hasConflict \? "ring-2 ring-red-500 ring-inset border-2 border-red-600 shadow-md shadow-red-200/60 bg-red-50/95" : ""\} \$\{isLocked \? "ring-1 ring-amber-400/80 ring-inset" : ""\} \$\{isSelectedForSwap \? \'ring-2 ring-blue-500 shadow-blue-200 bg-blue-50/50\' : \'\'\} \$\{brushMode\.active \? "cursor-crosshair pointer-events-none" : "cursor-grab hover:shadow-md hover:brightness-\[0\.98\] active:cursor-grabbing"\}`\}'
new_block_class = r'className={`h-full w-full min-h-[46px] md:min-h-[54px] p-1 flex flex-col justify-between items-center relative group/cell transition-all select-none outline-none ${cClass} border-l-[3.5px] ${blockSize >= 2 ? "rounded-lg shadow-sm" : "rounded-[3px]"} ${hasConflict ? "ring-2 ring-red-500 ring-inset border-2 border-red-600 shadow-md shadow-red-200/60 bg-red-50/95" : ""} ${isLocked ? "ring-1 ring-amber-400/80 ring-inset" : ""} ${isSelectedForSwap ? \'ring-2 ring-blue-500 shadow-blue-200 bg-blue-50/50\' : \'\'} ${brushMode.active ? "cursor-crosshair pointer-events-none" : "cursor-grab hover:shadow-md hover:brightness-[0.98] active:cursor-grabbing"}`}'
code = re.sub(old_block_class, new_block_class, code)

# Input replacement
input_re = r'className="([^"]*(?:border-slate-300|border-slate-200)[^"]*w-full[^"]*rounded-[^"]*)"'
def input_repl(m):
    c = m.group(1)
    c = c.replace('border-slate-300', 'border-slate-200').replace('rounded-md', 'rounded-xl').replace('rounded-lg', 'rounded-xl')
    # add spacing and transitions
    if "bg-slate-50" not in c:
        c += " bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all px-4 py-2"
    return f'className="{c}"'
code = re.sub(input_re, input_repl, code)

# Lucide icon micro-interactions (adding hover:scale-110 transition-transform)
# e.g., <Trash2 className="w-3 h-3"/> => <Trash2 className="w-3 h-3 hover:scale-110 transition-transform"/>
# Actually it's better to add it to the buttons wrapping them, or directly to the button classes
button_re = r'className="([^"]*(?:hover:text-blue-600|hover:text-red-600|hover:text-amber-600)[^"]*)"'
def btn_repl(m):
    c = m.group(1)
    if "hover:scale-110" not in c:
        c += " hover:scale-110 transition-transform"
    return f'className="{c}"'
code = re.sub(button_re, btn_repl, code)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated blocks and inputs.")
