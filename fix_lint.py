import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. action_brush
old_brush_action = """} else if (actionId === 'action_brush') {
            setBrushMode(prev => ({ ...prev, active: true }));
            showToast('Kısıt Fırçası Aktif Edildi', 'info');
          }"""
code = code.replace(old_brush_action, "")

# 2. onMouseUp/onMouseLeave
code = code.replace('onMouseUp={() => setIsBrushPainting(false)}\n', '')
code = code.replace('onMouseLeave={() => setIsBrushPainting(false)}\n', '')

# 3. blockSize in empty cell
# Looking for line 4727
code = code.replace('onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}', 'onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, "", 1, isClosed)}')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
