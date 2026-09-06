import re
import glob

def refactor_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inputs/Selects/Textareas
    # Generic replacement for basic inputs
    content = re.sub(
        r'className="([^"]*(?:border-slate-300|border-gray-300|border-slate-200)[^"]*w-full[^"]*rounded-[^"]*)"',
        lambda m: 'className="' + m.group(1).replace('border-slate-300', 'border-slate-200').replace('rounded-md', 'rounded-xl').replace('rounded-lg', 'rounded-xl') + ' bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"',
        content
    )
    
    # 2. Card Wrappers
    content = re.sub(
        r'className="bg-white p-[^"]* rounded-[^"]* shadow-[^"]* border border-slate-[23]00([^"]*)"',
        r'className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200\1"',
        content
    )
    content = re.sub(
        r'className="bg-white rounded-[^"]* shadow-[^"]* border border-slate-[23]00([^"]*)"',
        r'className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200\1"',
        content
    )

    # 3. Main Action Buttons
    content = re.sub(
        r'className="([^"]*bg-indigo-600[^"]*text-white[^"]*transition[^"]*)"',
        r'className="\1 shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-95"',
        content
    )

    # 4. Danger Buttons (red/rose)
    # Be careful not to replace text-red-500 or bg-red-50 conditionally inside a template literal. 
    # We will do some basic string replacements.
    
    # 5. Tables
    # Table wrappers
    # In App.tsx the table is id="timetable-matrix"
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for file in glob.glob('src/**/*.tsx', recursive=True):
    refactor_file(file)

print("Initial regex refactor done.")
