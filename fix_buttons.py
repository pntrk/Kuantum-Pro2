import re
with open('./src/components/DutySettingsModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make Admin Button
content = re.sub(
    r"<button\s+onClick=\{\(\) => toggleAdmin\(person\)\}\s+className=\"text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2\.5 py-1\.5 rounded-lg transition-all flex items-center gap-1 active:scale-95\"\s+title=\"İdareci Kadrosuna Ekle\">\s*<UserCheck className=\"w-3\.5 h-3\.5 text-amber-600\" />\s*<span>İdareci Yap</span>\s*</button>",
    r"""<button
                                    onClick={() => toggleAdmin(person)}
                                    className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2 sm:px-2.5 sm:py-1.5 min-h-[36px] sm:min-h-0 rounded-lg transition-all flex items-center gap-1 active:scale-95 touch-manipulation"
                                    title="İdareci Kadrosuna Ekle">
                                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                                    <span>İdareci Yap</span>
                                  </button>""",
    content
)

# Exemption Toggle Button
content = re.sub(
    r"className=\{`text-xs font-bold px-3 py-1\.5 rounded-lg transition-all flex items-center gap-1\.5 active:scale-95 \$\{\s*isExempt\s*\?\s*'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'\s*:\s*'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200'\s*\}`\}",
    r"className={`text-xs font-bold px-3 py-2 sm:py-1.5 min-h-[36px] sm:min-h-0 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 touch-manipulation ${isExempt ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300' : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200'}`}",
    content
)

with open('./src/components/DutySettingsModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Regex modifications completed via file')
