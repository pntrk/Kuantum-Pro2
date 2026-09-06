with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = lines[:-1]
new_lines.append("""                   setPrintModalOpen(false);
                }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold  transition-colors -md flex items-center gap-2 -md hover:-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95">
                   <Printer className="w-4 h-4"/> Önizle / Yazdır
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
""")
with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as fw:
    fw.writelines(new_lines)
