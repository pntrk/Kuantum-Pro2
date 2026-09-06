with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip() == ");" and i > 3000:
        # Check if the next few lines are duplicated state
        is_dup = False
        for j in range(1, 10):
            if i + j < len(lines) and "const [activeTab, setActiveTab]" in lines[i+j]:
                is_dup = True
                break
        
        if is_dup:
            print("Found duplicate start at line", i)
            # We want to keep up to i (inclusive), then append '}\n'
            new_lines = lines[:i+1]
            new_lines.append("}\n")
            with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as fw:
                fw.writelines(new_lines)
            break
