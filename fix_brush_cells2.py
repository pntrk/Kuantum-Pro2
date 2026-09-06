import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# For the occupied cell (line ~4690)
code = re.sub(
    r'onMouseDown=\{\(e\) => \{\s*if \(brushMode\.active\).*?\}\s*\}\}', 
    '', 
    code, flags=re.DOTALL
)

code = re.sub(
    r'onPointerDown=\{\(e\) => \{\s*if \(brushMode\.active\).*?\}\s*\}\}', 
    '', 
    code, flags=re.DOTALL
)

code = re.sub(
    r'onPointerEnter=\{\(e\) => \{\s*if \(brushMode\.active\).*?\}\s*\}\}', 
    '', 
    code, flags=re.DOTALL
)

code = re.sub(
    r'onMouseEnter=\{\(e\) => \{\s*if \(heatmapOverlayActive\).*?if \(brushMode\.active.*?\s*\}\s*\}\}',
    r'onMouseEnter={() => { if (heatmapOverlayActive) setHighlightedHeatmapPeriod({ dayId: absDIdx, pIdx }); }}',
    code, flags=re.DOTALL
)

code = re.sub(
    r'onClick=\{\(e\) => \{\s*if \(!brushMode\.active\).*?else.*?\}\s*\}\}',
    r'onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}',
    code, flags=re.DOTALL
)
code = re.sub(
    r'onClick=\{\(e\) => \{\s*if \(!brushMode\.active\).*?else.*?\}\s*\}\}',
    r'onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, "", 1, isClosed)}',
    code, flags=re.DOTALL
)

# Fix Mobile wrappers
old_mobile_onClick1 = r'onClick=\{\(e\) => \{\s*if \(brushMode\.active\) \{\s*e\.preventDefault\(\);\s*e\.stopPropagation\(\);\s*applyBrushToCell\(previewType, rowKey, absDIdx, pIdx, blockSize\);\s*\} else \{\s*handleCellClick\(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed\);\s*\}\s*\}\}'
new_mobile_onClick1 = r'onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}'
code = re.sub(old_mobile_onClick1, new_mobile_onClick1, code, flags=re.DOTALL)

old_mobile_onClick2 = r'onClick=\{\(e\) => \{\s*if \(brushMode\.active\) \{\s*e\.preventDefault\(\);\s*e\.stopPropagation\(\);\s*applyBrushToCell\(previewType, rowKey, absDIdx, pIdx, 1\);\s*\} else \{\s*handleCellClick\(e, rowKey, absDIdx, pIdx, "", 1, isClosed\);\s*\}\s*\}\}'
new_mobile_onClick2 = r'onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, "", 1, isClosed)}'
code = re.sub(old_mobile_onClick2, new_mobile_onClick2, code, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
