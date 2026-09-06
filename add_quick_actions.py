import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

funcs = """
  const handleQuickCoverSubmit = () => {
     if (!quickCoverTeacher) {
        alert("Lütfen personel seçin.");
        return;
     }
     const nextStatuses = { ...teacherStatuses };
     nextStatuses[`${selectedCoverDate}_${quickCoverTeacher}`] = quickCoverStatus;
     setTeacherStatuses(nextStatuses);
     
     // Run auto assign immediately with the new statuses
     handleAutoAssignCovers(nextStatuses);
     
     setShowQuickCoverModal(false);
     setShowShareModal(true);
  };

  const generateShareText = () => {
    const dObj = activeDays[selectedCoverDIdx];
    const dName = dObj ? dObj.name : '';
    const dateFormatted = getFormattedDate(selectedCoverDate);
    
    let text = `Tarih: ${dateFormatted} ${dName}\\n`;
    text += `Bugün okulumuzda bulunmayan öğretmenlerimiz ve boş derslerine girecek nöbetçi öğretmen listesi aşağıdadır:\\n\\n`;

    const absentTeachersList = teachers.filter(t => (teacherStatuses[`${selectedCoverDate}_${t}`] || 'aktif') !== 'aktif');
    
    if (absentTeachersList.length === 0) {
       text += "Bugün tüm öğretmenlerimiz okulda görevlerinin başındadır.";
       return text;
    }

    absentTeachersList.forEach(absent => {
        text += `Gelmeyen Personel: *${absent}*\\n`;
        const hasSched = schedules[absent]?.[selectedCoverDIdx];
        if (hasSched && dObj) {
            let hasAnyCover = false;
            for (let pIdx = 0; pIdx < Math.min(dObj.periods, 7); pIdx++) {
                const hasLesson = hasSched[pIdx];
                if (hasLesson) {
                    hasAnyCover = true;
                    let lessonInfo = '';
                    if (typeof hasLesson === 'string') {
                        try {
                            const card = JSON.parse(hasLesson);
                            lessonInfo = card.classes?.join(', ') || '';
                        } catch(e) {}
                    }
                    const key = `${selectedCoverDate}_${absent}_${pIdx}`;
                    const covering = coverAssignments[key];
                    text += `- ${pIdx + 1}. Ders (${lessonInfo}): ${covering ? `*${covering}*` : 'ATANMADI'}\\n`;
                }
            }
            if (!hasAnyCover) {
                text += `- Bugün dersi bulunmamaktadır.\\n`;
            }
        } else {
            text += `- Bugün dersi bulunmamaktadır.\\n`;
        }
        text += `\\n`;
    });

    text += `Gereğini rica ederim.\\n${principalName} - ${principalTitle}`;
    return text;
  };
"""

# Insert before `const getFormattedDate`
code = code.replace("  const getFormattedDate = ", funcs + "\n  const getFormattedDate = ", 1)

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
