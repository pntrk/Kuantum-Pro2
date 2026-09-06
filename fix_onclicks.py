import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Desktop occupied cell (line 4646ish)
code = re.sub(
    r'(<td key=\{`\$\{rowKey\}-\$\{absDIdx\}-\$\{pIdx\}`\} colSpan=\{blockSize\}.*?)onClick=\{\(e\) => handleCellClick\(e, rowKey, absDIdx, pIdx, "", 1, isClosed\)\}',
    r'\1onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}',
    code, flags=re.DOTALL
)

# Mobile occupied cell (line 4854ish)
code = re.sub(
    r'(const isSelectedForSwap = mobileSelectedForSwap.*?cells\.push\(\s*<div key=\{pIdx\} className=\{`flex min-h-\[60px\] cursor-pointer transition-all \$\{isSelectedForSwap \? \'bg-blue-50/50\' : \'\'\}`\}) onClick=\{\(e\) => handleCellClick\(e, rowKey, absDIdx, pIdx, "", 1, isClosed\)\}',
    r'\1 onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}',
    code, flags=re.DOTALL
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
