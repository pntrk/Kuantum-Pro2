import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove states
code = re.sub(r'const \[brushMode, setBrushMode\] = useState\(\{ active: false, type: \'close\' \}\);\n', '', code)
code = re.sub(r'const \[isBrushPainting, setIsBrushPainting\] = useState\(false\);\n', '', code)
code = re.sub(r'const isBrushPaintingRef = useRef\(false\);\n', '', code)

# 2. Remove applyBrushToCell
brush_func_pattern = re.compile(r'const applyBrushToCell = \(.*?\n  };\n', re.DOTALL)
m = brush_func_pattern.search(code)
if m:
    code = code[:m.start()] + code[m.end():]

# 3. Clean up the cells
# Occupied Cell (around line 4750-4820)
# className: ${brushMode.active ? "cursor-crosshair pointer-events-none" : "cursor-grab hover:shadow-md hover:brightness-[0.98] active:cursor-grabbing"} -> "cursor-grab hover:shadow-md hover:brightness-[0.98] active:cursor-grabbing"
code = code.replace('${brushMode.active ? "cursor-crosshair pointer-events-none" : "cursor-grab hover:shadow-md hover:brightness-[0.98] active:cursor-grabbing"}', 'cursor-grab hover:shadow-md hover:brightness-[0.98] active:cursor-grabbing')

code = code.replace('${brushMode.active ? "cursor-crosshair select-none" : ""}', '')
code = code.replace('draggable={!brushMode.active}', 'draggable')

code = code.replace('onDragEnter={(e) => !brushMode.active && handleCellDragEnter(e, rowKey, absDIdx, pIdx, blockSize)}', 'onDragEnter={(e) => handleCellDragEnter(e, rowKey, absDIdx, pIdx, blockSize)}')
code = code.replace('onDragOver={(e) => !brushMode.active && handleCellDragOver(e, rowKey, absDIdx, pIdx, blockSize)}', 'onDragOver={(e) => handleCellDragOver(e, rowKey, absDIdx, pIdx, blockSize)}')
code = code.replace('onDrop={(e) => !brushMode.active && handleCellDrop(e, rowKey, absDIdx, pIdx, blockSize, cellVal)}', 'onDrop={(e) => handleCellDrop(e, rowKey, absDIdx, pIdx, blockSize, cellVal)}')

code = code.replace('onDragEnter={(e) => !brushMode.active && handleCellDragEnter(e, rowKey, absDIdx, pIdx, 1)}', 'onDragEnter={(e) => handleCellDragEnter(e, rowKey, absDIdx, pIdx, 1)}')
code = code.replace('onDragOver={(e) => !brushMode.active && handleCellDragOver(e, rowKey, absDIdx, pIdx, 1)}', 'onDragOver={(e) => handleCellDragOver(e, rowKey, absDIdx, pIdx, 1)}')
code = code.replace('onDrop={(e) => !brushMode.active && handleCellDrop(e, rowKey, absDIdx, pIdx, 1, "")}', 'onDrop={(e) => handleCellDrop(e, rowKey, absDIdx, pIdx, 1, "")}')


# 4. Remove Mouse / Pointer events injected for brush mode
old_occ_handlers = """onClick={(e) => {
                                                           if (!brushMode.active) handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed);
                                                        }}
                                                        onMouseDown={(e) => {
                                                            if (brushMode.active) {
                                                                e.preventDefault();
                                                                setIsBrushPainting(true);
                                                                applyBrushToCell(previewType, rowKey, absDIdx, pIdx);
                                                            }
                                                        }}
                                                        onMouseEnter={() => {
                                                            if (brushMode.active && isBrushPainting) {
                                                                applyBrushToCell(previewType, rowKey, absDIdx, pIdx);
                                                            }
                                                        }}"""

new_occ_handlers = """onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}"""
code = code.replace(old_occ_handlers, new_occ_handlers)

# Sometimes they are formatted slightly differently. Let's do regex.
code = re.sub(r'onClick=\{\(e\) => \{\s*if \(!brushMode\.active\) handleCellClick\(e, rowKey, absDIdx, pIdx, (cellVal|"[^"]*"), (blockSize|1), isClosed\);\s*\}\}', r'onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, \1, \2, isClosed)}', code)

code = re.sub(r'onMouseDown=\{\(e\) => \{\s*if \(brushMode\.active\) \{\s*e\.preventDefault\(\);\s*setIsBrushPainting\(true\);\s*applyBrushToCell\([^)]+\);\s*\}\s*\}\}', '', code)
code = re.sub(r'onMouseEnter=\{\(\) => \{\s*if \(heatmapOverlayActive\) \{\s*setHighlightedHeatmapPeriod\(\{ dayId: absDIdx, pIdx \}\);\s*\}\s*if \(brushMode\.active && isBrushPainting\) \{\s*applyBrushToCell\([^)]+\);\s*\}\s*\}\}', r'onMouseEnter={() => { if (heatmapOverlayActive) setHighlightedHeatmapPeriod({ dayId: absDIdx, pIdx }); }}', code)
code = re.sub(r'onMouseEnter=\{\(\) => \{\s*if \(brushMode\.active && isBrushPainting\) \{\s*applyBrushToCell\([^)]+\);\s*\}\s*\}\}', '', code)


code = code.replace('!brushMode.active && ', '')

# 5. Mobile wrappers
code = code.replace('onClick={(e) => { if (!brushMode.active) handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed); else { applyBrushToCell(previewType, rowKey, absDIdx, pIdx); } }}', 'onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}')
code = code.replace('onClick={(e) => { if (!brushMode.active) handleCellClick(e, rowKey, absDIdx, pIdx, "", 1, isClosed); else { applyBrushToCell(previewType, rowKey, absDIdx, pIdx); } }}', 'onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, "", 1, isClosed)}')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
