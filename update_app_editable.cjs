const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import EditableText
if (!code.includes('import EditableText')) {
    code = code.replace(/import React, \{ useState, useEffect, useCallback, useRef \} from 'react';\n/, 
        "import React, { useState, useEffect, useCallback, useRef } from 'react';\nimport EditableText from './components/EditableText';\n");
}

// 1. ConstraintModal Title
const modalTarget = '<Ban className="w-5 h-5 text-red-500" /> Detaylar ve Kısıtlamalar: <span className="text-blue-700">{name}</span>';
const modalReplacement = '<Ban className="w-5 h-5 text-red-500" /> Detaylar ve Kısıtlamalar: <EditableText value={name} onSave={(newVal) => handleRenameEntity(name, newVal, type)} textClassName="text-blue-700 hover:text-blue-800" />';
code = code.replace(modalTarget, modalReplacement);

// 2. Settings Lists
// Instead of just clicking a name to open constraint modal, maybe they can click a button to open modal, and click name to edit?
// Currently in settings:
// <button onClick={() => setConstraintModal({ type: 'teacher', name: t })} className="flex-1 text-left font-bold text-slate-700 px-3 py-2 group-hover:text-indigo-700 transition-colors">{t}</button>
// Let's change it so the name is just a div with EditableText and an "Ayarlar" button. Wait, clicking the card opens the modal. So if we put EditableText inside the button, clicking it will trigger the button too (due to propagation).
// Better to just let EditableText handle stopPropagation?
// I can update EditableText to stop propagation.

// 3. Matrix grid headers
const thTarget1 = '{previewType === \'teacher\' ? \'ÖĞRETMEN\' : previewType === \'class\' ? \'SINIF\' : previewType === \'room\' ? \'DERSLİK\' : \'DERS\'}</th>';
// This is the header of the grid. But the rows themselves:
// <td className="border-r border-b border-slate-300 p-2 font-black text-slate-700 bg-white sticky left-0 z-40 whitespace-nowrap text-xs md:text-sm cursor-pointer hover:bg-indigo-50 transition-colors" onClick={() => setConstraintModal({ type: previewType, name: rowKey })}>
//   <div className="flex items-center justify-between">
//     <span>{rowKey}</span>

// Let's replace the grid row header span with EditableText.

const gridRowTarget = '<span className="truncate max-w-[100px] md:max-w-none">{rowKey}</span>';
const gridRowReplacement = '<EditableText value={rowKey} onSave={(newVal) => handleRenameEntity(rowKey, newVal, previewType)} textClassName="truncate max-w-[100px] md:max-w-none" />';

if (code.includes(gridRowTarget)) {
    code = code.replace(gridRowTarget, gridRowReplacement);
} else {
    // maybe it is <span>{rowKey}</span>
    code = code.replace('<span>{rowKey}</span>', '<EditableText value={rowKey} onSave={(newVal) => handleRenameEntity(rowKey, newVal, previewType)} />');
}

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx with EditableText");
