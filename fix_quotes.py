with open('./src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('collapse \\${', 'collapse ${')
content = content.replace('collapse \\\\${', 'collapse ${')
content = content.replace('min-h-[50px]\\\">', 'min-h-[50px]\">')
content = content.replace('truncate\\\">', 'truncate\">')
content = content.replace('truncate\\\\\">', 'truncate\">')
content = content.replace('min-h-[50px]\\\\\">', 'min-h-[50px]\">')

with open('./src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
