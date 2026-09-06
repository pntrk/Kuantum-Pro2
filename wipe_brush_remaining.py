import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove states
code = re.sub(r'const \[brushMode, setBrushMode\] = useState[^\n]*\n', '', code)
code = re.sub(r'const \[isBrushPainting, setIsBrushPainting\] = useState[^\n]*\n', '', code)
code = re.sub(r'const isBrushPaintingRef = useRef[^\n]*\n', '', code)

# Remove Global Pointer & Mouse Up listener
code = re.sub(r'// Global Pointer & Mouse Up listener to prevent brush painting from sticking\s*useEffect\(\(\) => \{.*?\}, \[\]\);\n', '', code, flags=re.DOTALL)

# Remove Escape brush logic
code = re.sub(r'\} else if \(e\.key === \'Escape\'\) \{\s*if \(brushMode\.active\) \{.*?\}\s*\}', r'}', code, flags=re.DOTALL)
code = code.replace(', [brushMode.active]', ', []')

# Remove any remaining onPointerEnter with brushMode
code = re.sub(r'onPointerEnter=\{\(e\) => \{\s*if \(brushMode\.active[^}]*\}\s*\}\}', '', code, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
