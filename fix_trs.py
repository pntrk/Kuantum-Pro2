import re
import glob

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Find TRs without hover:bg
    code = re.sub(
        r'<tr([^>]*)className="([^"]*)"',
        lambda m: f'<tr{m.group(1)}className="{m.group(2) + (" transition-colors hover:bg-slate-50/80" if "hover:bg" not in m.group(2) else "")}"',
        code
    )
    # TRs with NO className
    code = re.sub(
        r'<tr([^>]*)>',
        lambda m: f'<tr{m.group(1)}>' if 'className=' in m.group(0) else f'<tr{m.group(1)} className="transition-colors hover:bg-slate-50/80">',
        code
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)

for file in glob.glob('src/**/*.tsx', recursive=True):
    process_file(file)

print("TRs updated.")
