import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove states
code = re.sub(r'const \[brushMode, setBrushMode\] = useState[^\n]*\n', '', code)
code = re.sub(r'const \[isBrushPainting, setIsBrushPainting\] = useState[^\n]*\n', '', code)
code = re.sub(r'const isBrushPaintingRef = useRef\(false\);\n', '', code)

# Remove applyBrushToCell
brush_func_pattern = re.compile(r'const applyBrushToCell = \(.*?\n  };\n', re.DOTALL)
m = brush_func_pattern.search(code)
if m:
    code = code[:m.start()] + code[m.end():]
else:
    print("WARNING: applyBrushToCell not found")

# Remove brush toggle button in toolbar (starts with {/* Quick Constraint Brush Toggle */})
brush_toggle_pattern = re.compile(r'\{\/\* Quick Constraint Brush Toggle \*\/}.*?</div>\s*</div>', re.DOTALL)
m2 = brush_toggle_pattern.search(code)
# Wait, let's find the exact block.
