import re
import glob

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Primary buttons
    code = re.sub(
        r'className="([^"]*bg-indigo-600[^"]*text-white[^"]*)"',
        lambda m: f'className="{m.group(1).replace("hover:bg-indigo-700", "").replace("shadow", "").replace("transition-all", "").replace("active:scale-95", "").strip()} bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"',
        code
    )

    # Danger Buttons
    code = re.sub(
        r'className="([^"]*bg-red-500[^"]*text-white[^"]*)"',
        lambda m: f'className="{m.group(1).replace("bg-red-500", "bg-rose-500").replace("hover:bg-red-600", "hover:bg-rose-600").strip()} shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all active:scale-95"',
        code
    )

    # Secondary/Ghost buttons (often border border-slate-300 or bg-white hover:bg-slate-50)
    code = re.sub(
        r'className="([^"]*bg-white hover:bg-slate-50 border border-slate-[23]00[^"]*)"',
        lambda m: f'className="{m.group(1).replace("bg-white", "bg-slate-100").replace("hover:bg-slate-50", "hover:bg-slate-200").replace("text-slate-600", "text-slate-700").replace("text-slate-500", "text-slate-700").strip()} text-slate-700 transition-colors"',
        code
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)

for file in glob.glob('src/**/*.tsx', recursive=True):
    process_file(file)

print("Button styles updated.")
