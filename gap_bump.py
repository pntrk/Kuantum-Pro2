import re
import glob

def bump_gaps(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Convert text-black to text-slate-800 globally
    code = code.replace('text-black', 'text-slate-800')
    code = code.replace('text-gray-900', 'text-slate-800')
    code = code.replace('text-gray-800', 'text-slate-800')
    code = code.replace('text-gray-700', 'text-slate-700')
    code = code.replace('text-gray-600', 'text-slate-600')
    code = code.replace('text-gray-500', 'text-slate-500')
    code = code.replace('text-gray-400', 'text-slate-400')
    
    code = code.replace('bg-gray-50', 'bg-slate-50')
    code = code.replace('bg-gray-100', 'bg-slate-100')
    code = code.replace('bg-gray-200', 'bg-slate-200')
    code = code.replace('border-gray-200', 'border-slate-200')
    code = code.replace('border-gray-300', 'border-slate-200')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)

for file in glob.glob('src/**/*.tsx', recursive=True):
    bump_gaps(file)

print("Spacing and color bumped.")
