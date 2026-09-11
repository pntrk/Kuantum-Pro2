import React, { useState, useMemo } from 'react';
import {
  MapPin, Plus, Users, Calendar, ClipboardCheck, AlertCircle,
  CheckCircle2, Wand2, Printer, AlertTriangle, X, ShieldCheck,
  UserCheck, Search, RefreshCw, FileText, Edit, Check,
  ChevronLeft, ChevronRight, Filter, Layers, Zap,
  Share2, ChevronDown, ChevronUp, Copy, Sparkles, Send,
  Clock, ArrowRight, UserX, CheckCheck, Info
} from 'lucide-react';

interface DutySummaryTabProps {
  teachers: string[];
  schedules: Record<string, any>;
  schoolSettings: any;
  dutyLocations: string[];
  dutyAssignments: Record<string, string[]>;
  adminSchedule: Record<string | number, string>;
  adminRoles: Record<string, string>;
  dutyAdmins: string[];
  exemptTeachers: string[];
  teacherStatuses: Record<string, string>;
  setTeacherStatuses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  coverAssignments: Record<string, string>;
  setCoverAssignments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedCoverDate: string;
  setSelectedCoverDate: (d: string) => void;
  selectedCoverDayId: number | string;
  coverDay: any;
  coverDayScheduleIdx: number;
  selectedCoverDIdx: number;
  activeDays: any[];
  weekDaysForCover: any[];
  vacantLessonsForDay: Array<{
    teacher: string;
    status: string;
    pIdx: number;
    periodNumber: number;
    lessonInfo: string;
    subject: string;
    classes: string;
    key: string;
    covering: string;
  }>;
  getFormattedDate: (d: string) => string;
  shiftCoverDate: (days: number) => void;
  setTodayCoverDate: () => void;
  handleAutoAssignCovers: (statuses?: Record<string, string>, onlyForTeacher?: string) => void;
  handlePrintCoverReport: () => void;
  generateShareText: () => string;
  isActualLesson: (l: any) => boolean;
  getLessonCount: (teacher: string, dIdx: number) => number;
  getWeeklyDutyCount: (teacher: string) => number;
  setShowQuickCoverModal: (v: boolean) => void;
  setShowShareModal: (v: boolean) => void;
  setIsSettingsModalOpen: (v: boolean) => void;
  setSelectingCell: (cell: { loc: string; dayId: number; dIdx: number } | null) => void;
  setActiveTab: (tab: string) => void;
  setMobileRosterDayId: (id: number) => void;
  setSuccessMessage: (msg: string) => void;
  selectedTeacherForCover: string;
  setSelectedTeacherForCover: (t: string) => void;
}

export default function DutySummaryTab({
  teachers,
  schedules,
  dutyLocations,
  dutyAssignments,
  adminSchedule,
  adminRoles,
  dutyAdmins,
  exemptTeachers,
  teacherStatuses,
  setTeacherStatuses,
  coverAssignments,
  setCoverAssignments,
  selectedCoverDate,
  setSelectedCoverDate,
  coverDay,
  coverDayScheduleIdx,
  selectedCoverDIdx,
  activeDays = [],
  weekDaysForCover = [],
  vacantLessonsForDay = [],
  getFormattedDate = (d: string) => d || '',
  shiftCoverDate = () => {},
  setTodayCoverDate = () => {},
  handleAutoAssignCovers = () => {},
  handlePrintCoverReport = () => {},
  generateShareText = () => '',
  isActualLesson = () => true,
  getLessonCount = () => 0,
  getWeeklyDutyCount = () => 0,
  setIsSettingsModalOpen = () => {},
  setSelectingCell = () => {},
  setActiveTab = () => {},
  setMobileRosterDayId = () => {},
  setSuccessMessage = () => {}
}: DutySummaryTabProps) {
  // Main Sub-views: 'vacant' (Boş Dersler & Vekalet), 'duties' (Bugünkü Nöbetçiler), 'attendance' (İzin & Raporlar)
  const [activeSubView, setActiveSubView] = useState<'vacant' | 'duties' | 'attendance'>('vacant');
  
  // Modals & Popups (Multi-Teacher Selection)
  const [showAddAbsentModal, setShowAddAbsentModal] = useState(false);
  const [selectedAbsentTeachers, setSelectedAbsentTeachers] = useState<Record<string, string>>({}); // teacherName -> status
  const [defaultBatchStatus, setDefaultBatchStatus] = useState<string>('raporlu');
  const [modalSearch, setModalSearch] = useState('');
  const [modalFilter, setModalFilter] = useState<'has_lessons' | 'all' | 'selected'>('has_lessons');

  // Open multi-teacher modal pre-loaded with current date's absent teachers
  const handleOpenAddAbsentModal = () => {
    const initialSelected: Record<string, string> = {};
    teachers.forEach(t => {
      const st = teacherStatuses[`${selectedCoverDate}_${t}`];
      if (st && st !== 'aktif') {
        initialSelected[t] = st;
      }
    });
    setSelectedAbsentTeachers(initialSelected);
    setModalSearch('');
    setDefaultBatchStatus('raporlu');
    setModalFilter('has_lessons');
    setShowAddAbsentModal(true);
  };
  
  // Filters & Searches
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'absent' | 'active'>('all');
  const [showPreviewText, setShowPreviewText] = useState(false);

  const todayDayId = activeDays[selectedCoverDIdx]?.id;
  const assignedTeachers = todayDayId ? dutyLocations.flatMap(loc => dutyAssignments[`${loc}_${todayDayId}`] || []) : [];
  const dutyAdminForDay = todayDayId ? adminSchedule[todayDayId] : undefined;

  // Available duty staff for today (including duty admin)
  const dutyStaffForDay = useMemo(() => {
    return Array.from(new Set([
      ...(dutyAdminForDay ? [dutyAdminForDay + ' (İdareci)'] : []),
      ...assignedTeachers
    ]));
  }, [dutyAdminForDay, assignedTeachers]);

  // Absent teachers for the selected date
  const absentTeachersList = useMemo(() => {
    return teachers.filter(t => (teacherStatuses[`${selectedCoverDate}_${t}`] || 'aktif') !== 'aktif');
  }, [teachers, teacherStatuses, selectedCoverDate]);

  // Helper to get free duty staff for a given period
  const getFreeDutyStaffForPeriod = (pIdx: number, excludeTeacher?: string) => {
    return dutyStaffForDay.filter(dt => {
      if (excludeTeacher && dt === excludeTeacher) return false;
      if (dt.includes('(İdareci)')) return true;
      const dtStatus = teacherStatuses[`${selectedCoverDate}_${dt}`] || 'aktif';
      if (dtStatus !== 'aktif') return false;
      const ownLesson = selectedCoverDIdx >= 0 && schedules[dt]?.[selectedCoverDIdx]?.[pIdx];
      if (ownLesson && isActualLesson(ownLesson)) return false;
      return true;
    });
  };

  // Group vacant lessons by absent teacher
  const absentTeachersWithLessons = useMemo(() => {
    return absentTeachersList.map(teacher => {
      const status = teacherStatuses[`${selectedCoverDate}_${teacher}`] || 'raporlu';
      const sched = selectedCoverDIdx >= 0 ? schedules[teacher]?.[selectedCoverDIdx] : null;
      const totalPeriods = activeDays[selectedCoverDIdx]?.periods || 8;
      
      const lessons: Array<{
        periodNumber: number;
        pIdx: number;
        isLesson: boolean;
        lessonText: string;
        classes: string;
        subject: string;
        covering: string;
        key: string;
        isOptional: boolean;
      }> = [];

      for (let pIdx = 0; pIdx < totalPeriods; pIdx++) {
        const rawSlot = sched ? sched[pIdx] : null;
        const isLesson = isActualLesson(rawSlot);
        let lessonText = '';
        let classes = '';
        let subject = '';

        if (rawSlot) {
          if (typeof rawSlot === 'string') {
            try {
              const parsed = JSON.parse(rawSlot);
              classes = parsed.classes?.join(', ') || '';
              subject = parsed.subject || '';
              lessonText = `${classes} ${subject}`.trim();
            } catch (e) {
              lessonText = rawSlot;
            }
          }
        }

        const key = `${selectedCoverDate}_${teacher}_${pIdx}`;
        const covering = coverAssignments[key] || '';
        const isOptional = pIdx >= 7;

        if (isLesson) {
          lessons.push({
            periodNumber: pIdx + 1,
            pIdx,
            isLesson: true,
            lessonText: lessonText || 'Ders',
            classes,
            subject,
            covering,
            key,
            isOptional
          });
        }
      }

      const mandatoryLessons = lessons.filter(l => !l.isOptional);
      const optionalLessons = lessons.filter(l => l.isOptional);
      const coveredMandatory = mandatoryLessons.filter(l => Boolean(l.covering)).length;

      return {
        teacher,
        status,
        lessons,
        totalLessons: lessons.length,
        mandatoryCount: mandatoryLessons.length,
        optionalCount: optionalLessons.length,
        coveredMandatory,
        coveredLessons: lessons.filter(l => Boolean(l.covering)).length
      };
    });
  }, [absentTeachersList, teacherStatuses, selectedCoverDate, selectedCoverDIdx, schedules, activeDays, isActualLesson, coverAssignments]);

  const totalVacantCount = vacantLessonsForDay.length;
  // Sadece ilk 7 saat için vekil beklenir (8 ve 9. dersler isteğe bağlı olduğundan dağıtılmaz)
  const unassignedVacantCount = vacantLessonsForDay.filter(l => l.pIdx < 7 && !l.covering).length;
  const assignedVacantCount = vacantLessonsForDay.filter(l => Boolean(l.covering)).length;

  // Actions for Multi-Teacher Modal
  const handleAddAbsentSubmit = (autoAssign: boolean = false) => {
    const nextStatuses = { ...teacherStatuses };
    let selectedCount = 0;
    let totalVacantLessons = 0;

    teachers.forEach(t => {
      const key = `${selectedCoverDate}_${t}`;
      if (selectedAbsentTeachers[t]) {
        nextStatuses[key] = selectedAbsentTeachers[t];
        selectedCount++;
        // Otomatik dağıtım ilk 7 ders için yapılır (8 ve 9. saatler isteğe bağlıdır)
        const sched = selectedCoverDIdx >= 0 ? schedules[t]?.[selectedCoverDIdx] : null;
        let tLessons = 0;
        if (sched) {
          for (let p = 0; p < Math.min(sched.length, 7); p++) {
            if (isActualLesson(sched[p])) tLessons++;
          }
        }
        totalVacantLessons += tLessons;
      } else {
        delete nextStatuses[key];
        Object.keys(coverAssignments).forEach(k => {
          if (k.startsWith(`${selectedCoverDate}_${t}_`)) {
            delete coverAssignments[k];
          }
        });
      }
    });

    setTeacherStatuses(nextStatuses);
    setShowAddAbsentModal(false);

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    if (autoAssign && selectedCount > 0) {
      handleAutoAssignCovers(nextStatuses);
      setSuccessMessage(`${selectedCount} öğretmen (${totalVacantLessons} boş ders - ilk 7 saat) kaydedildi ve nöbetçilere otomatik dağıtıldı! (8 ve 9. dersler isteğe bağlıdır)`);
    } else {
      setSuccessMessage(`${selectedCount} öğretmen devamsız/izinli olarak güncellendi.`);
    }
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleToggleTeacherSelect = (teacher: string) => {
    setSelectedAbsentTeachers(prev => {
      const next = { ...prev };
      if (next[teacher]) {
        delete next[teacher];
      } else {
        next[teacher] = defaultBatchStatus;
      }
      return next;
    });
  };

  // Generate Daily Duty Schedule WhatsApp Text
  const generateDailyDutyWhatsAppText = () => {
    const dName = activeDays[selectedCoverDIdx]?.name || '';
    const dateFormatted = getFormattedDate(selectedCoverDate);
    const displayDate = dName && !dateFormatted.includes(dName) ? `${dateFormatted} ${dName}` : dateFormatted;

    let text = `📅 NÖBET ÇİZELGESİ - ${displayDate}\n\n`;
    if (dutyAdminForDay) {
      text += `👑 Nöbetçi Müdür Yardımcısı: ${dutyAdminForDay}${adminRoles[dutyAdminForDay] ? ` (${adminRoles[dutyAdminForDay]})` : ''}\n\n`;
    }
    text += `📍 NÖBET YERLERİ VE GÖREVLİ ÖĞRETMENLER:\n`;
    dutyLocations.forEach(loc => {
      const assigned = todayDayId ? (dutyAssignments[`${loc}_${todayDayId}`] || []) : [];
      if (assigned.length > 0) {
        const staffNames = assigned.map(t => {
          const st = teacherStatuses[`${selectedCoverDate}_${t}`] || 'aktif';
          return st !== 'aktif' ? `${t} (${st.toUpperCase()})` : t;
        }).join(', ');
        text += `• ${loc}: ${staffNames}\n`;
      }
    });

    if (absentTeachersList.length > 0) {
      const formatStatusLabel = (st?: string) => {
        if (!st) return 'Raporlu';
        const lower = st.toLowerCase().trim();
        if (lower === 'raporlu') return 'Raporlu';
        if (lower === 'görevli' || lower === 'gorevli') return 'Görevli';
        if (lower === 'izinli') return 'İzinli';
        if (lower === 'mazeretsiz') return 'Mazeretsiz';
        return st.charAt(0).toLocaleUpperCase('tr-TR') + st.slice(1);
      };

      text += `\n⚠️ İZİNLİ / RAPORLU ÖĞRETMENLER:\n`;
      absentTeachersList.forEach(t => {
        const rawSt = teacherStatuses[`${selectedCoverDate}_${t}`] || 'raporlu';
        const st = formatStatusLabel(rawSt);
        text += `• ${t} (${st})\n`;
      });
    }

    text += `\nTüm öğretmenlerimize iyi dersler ve hayırlı nöbetler dileriz.`;
    return text;
  };

  const handleSetTeacherStatusInModal = (teacher: string, status: string) => {
    setSelectedAbsentTeachers(prev => ({
      ...prev,
      [teacher]: status
    }));
  };

  const handleSelectAllFilteredInModal = (filteredList: string[]) => {
    setSelectedAbsentTeachers(prev => {
      const next = { ...prev };
      filteredList.forEach(t => {
        if (!next[t]) {
          next[t] = defaultBatchStatus;
        }
      });
      return next;
    });
  };

  const handleApplyBatchStatusToAllSelected = (status: string) => {
    setDefaultBatchStatus(status);
    setSelectedAbsentTeachers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(t => {
        next[t] = status;
      });
      return next;
    });
  };

  // Filtered teachers list for modal
  const modalFilteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      if (modalSearch.trim() && !t.toLowerCase().includes(modalSearch.toLowerCase().trim())) {
        return false;
      }
      const lessonCount = selectedCoverDIdx >= 0 ? getLessonCount(t, selectedCoverDIdx) : 0;
      
      if (modalFilter === 'has_lessons' && lessonCount === 0) {
        return false;
      }
      if (modalFilter === 'selected' && !selectedAbsentTeachers[t]) {
        return false;
      }
      return true;
    });
  }, [teachers, modalSearch, modalFilter, selectedCoverDIdx, getLessonCount, selectedAbsentTeachers]);

  const modalSelectedStats = useMemo(() => {
    const selectedList = Object.keys(selectedAbsentTeachers);
    let totalVacant = 0;
    selectedList.forEach(t => {
      // Sadece ilk 7 saat hesaplanır (8 ve 9. saatler isteğe bağlıdır)
      const sched = selectedCoverDIdx >= 0 ? schedules[t]?.[selectedCoverDIdx] : null;
      if (sched) {
        for (let p = 0; p < Math.min(sched.length, 7); p++) {
          if (isActualLesson(sched[p])) totalVacant++;
        }
      }
    });
    return {
      teacherCount: selectedList.length,
      vacantLessonCount: totalVacant
    };
  }, [selectedAbsentTeachers, selectedCoverDIdx, schedules, isActualLesson]);

  const handleRemoveAbsentTeacher = (teacher: string) => {
    const nextStatuses = { ...teacherStatuses };
    delete nextStatuses[`${selectedCoverDate}_${teacher}`];
    setTeacherStatuses(nextStatuses);

    // Remove cover assignments for this teacher
    const nextCovers = { ...coverAssignments };
    Object.keys(nextCovers).forEach(k => {
      if (k.startsWith(`${selectedCoverDate}_${teacher}_`)) {
        delete nextCovers[k];
      }
    });
    setCoverAssignments(nextCovers);

    setSuccessMessage(`${teacher} okulda (aktif) olarak güncellendi.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSetTeacherStatusDirect = (teacher: string, status: string) => {
    const nextStatuses = { ...teacherStatuses };
    if (status === 'aktif') {
      delete nextStatuses[`${selectedCoverDate}_${teacher}`];
      // remove covers
      const nextCovers = { ...coverAssignments };
      Object.keys(nextCovers).forEach(k => {
        if (k.startsWith(`${selectedCoverDate}_${teacher}_`)) {
          delete nextCovers[k];
        }
      });
      setCoverAssignments(nextCovers);
      setSuccessMessage(`${teacher} okulda (aktif) yapıldı.`);
    } else {
      nextStatuses[`${selectedCoverDate}_${teacher}`] = status;
      setSuccessMessage(`${teacher} ${status} olarak işaretlendi.`);
    }
    setTeacherStatuses(nextStatuses);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 pb-6 md:pb-8 touch-manipulation" id="duty-summary-root">
      
      {/* 1. TOP HEADER: DATE & WEEKDAY STRIP (Compact mobile controls & guaranteed 5-day fit) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-2.5 sm:p-3.5 rounded-2xl shadow-xs border border-indigo-900/30 flex flex-col gap-2 w-full max-w-full overflow-hidden touch-manipulation">
        {/* Date Row */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-1.5 w-full touch-manipulation">
          <div className="flex items-center justify-between sm:justify-start gap-1.5 min-w-0 touch-manipulation">
            <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white flex items-center gap-1 truncate touch-manipulation">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{getFormattedDate(selectedCoverDate)}</span>
            </span>
            {selectedCoverDate === new Date().toISOString().split('T')[0] && (
              <span className="text-[9px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.2 rounded-full shadow-2xs shrink-0">
                Bugün
              </span>
            )}
          </div>

          {/* Date Controls - Ultra Compact Mobile Buttons */}
          <div className="flex items-center gap-1 w-full sm:w-auto justify-end shrink-0 touch-manipulation">
            <div className="flex items-center gap-0.5 bg-white/10 p-0.5 rounded-xl border border-white/15 w-full sm:w-auto justify-between sm:justify-end touch-manipulation">
              <button 
                onClick={() => shiftCoverDate(-1)} 
                className="p-1 hover:bg-white/20 active:bg-white/30 rounded-lg text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95 flex-1 sm:flex-none touch-manipulation"
                title="Önceki Gün"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={setTodayCoverDate} 
                className="px-2 py-0.5 hover:bg-white/20 active:bg-white/30 rounded-lg text-[10px] font-bold text-white transition-colors min-h-[36px] flex items-center justify-center active:scale-95 flex-1 sm:flex-none touch-manipulation"
                title="Bugüne Git"
              >
                Bugün
              </button>
              <button 
                onClick={() => shiftCoverDate(1)} 
                className="p-1 hover:bg-white/20 active:bg-white/30 rounded-lg text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95 flex-1 sm:flex-none touch-manipulation"
                title="Sonraki Gün"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="h-3.5 w-px bg-white/20 my-auto mx-0.5" />

              <div className="flex items-center justify-center gap-0.5 bg-white/10 px-1 py-0.5 rounded-lg border border-white/15 min-h-[36px] shrink-0 max-w-[100px] touch-manipulation">
                <input 
                  type="date" 
                  value={selectedCoverDate} 
                  onChange={e => setSelectedCoverDate(e.target.value)}
                  className="bg-transparent text-white border-none outline-none font-bold text-[10px] cursor-pointer [color-scheme:dark] w-full text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weekday Strip - All 7 Days of the Week (Pazartesi - Pazar) Visible At a Glance */}
        <div className="pt-1.5 border-t border-white/10 w-full">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 w-full">
            {weekDaysForCover.map((day) => {
              const isSelected = day.isSelected;
              const isToday = day.isToday;
              const isWeekend = day.dayId === 6 || day.dayId === 7;
              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedCoverDate(day.dateStr)}
                  className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-xl transition-all min-h-[42px] sm:min-h-[44px] border active:scale-95 touch-manipulation cursor-pointer w-full min-w-0 overflow-hidden ${
                    isSelected
                      ? 'bg-white text-indigo-950 border-white font-black shadow-md ring-2 ring-indigo-400 z-10'
                      : isWeekend
                        ? 'bg-white/5 hover:bg-white/15 text-indigo-200/70 border-white/5 font-semibold'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10 font-bold'
                  }`}
                  title={`${day.fullName} - ${day.dateStr}`}
                >
                  <div className="flex items-center justify-center gap-0.5 w-full min-w-0 touch-manipulation">
                    <span className="text-[9.5px] sm:text-xs leading-none font-extrabold truncate">{day.shortName}</span>
                    {isToday && (
                      <span className={`w-1.2 h-1.2 sm:w-1.5 sm:h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-indigo-600' : 'bg-emerald-400'}`} />
                    )}
                  </div>
                  <span className={`text-[9px] sm:text-[10px] mt-0.5 leading-none font-black truncate ${
                    isSelected 
                      ? 'text-indigo-900' 
                      : isWeekend 
                        ? 'text-indigo-300/70' 
                        : 'text-indigo-200'
                  }`}>
                    {day.dayNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekend Notice */}
      {selectedCoverDIdx === -1 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-3 shadow-sm touch-manipulation">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <h4 className="font-bold text-slate-800 text-lg">Hafta Sonu Seçildi</h4>
          <p className="text-slate-500 text-sm max-w-md">
            Hafta sonları standart ders programı ve nöbet görevleri bulunmamaktadır.
          </p>
          <button 
            onClick={setTodayCoverDate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 min-h-[44px] touch-manipulation"
          >
            Bugüne Git
          </button>
        </div>
      ) : (
        <>
          {/* 2. SUB-VIEW SELECTOR: 3 Equal-Width Touch Tabs */}
          <div className="bg-slate-200/90 p-1 rounded-2xl grid grid-cols-3 gap-1 border border-slate-300/60 shadow-2xs w-full mb-2.5">
            <button
              onClick={() => setActiveSubView('vacant')}
              className={`py-1.5 px-1 text-[11px] sm:text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[42px] sm:min-h-[42px] touch-manipulation active:scale-95 ${
                activeSubView === 'vacant'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 shrink-0 ${activeSubView === 'vacant' ? 'text-amber-300' : 'text-amber-600'}`} />
              <span className="truncate">Devamsızlık</span>
              {absentTeachersList.length > 0 && (
                <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
                  activeSubView === 'vacant' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  {absentTeachersList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubView('duties')}
              className={`py-1.5 px-1 text-[11px] sm:text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[42px] sm:min-h-[42px] touch-manipulation active:scale-95 ${
                activeSubView === 'duties'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${activeSubView === 'duties' ? 'text-indigo-200' : 'text-indigo-600'}`} />
              <span className="truncate">Gün Özeti</span>
              <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
                activeSubView === 'duties' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {assignedTeachers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubView('attendance')}
              className={`py-1.5 px-1 text-[11px] sm:text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[42px] sm:min-h-[42px] touch-manipulation active:scale-95 ${
                activeSubView === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className={`w-3.5 h-3.5 shrink-0 ${activeSubView === 'attendance' ? 'text-indigo-200' : 'text-rose-500'}`} />
              <span className="truncate">İzin/Rapor</span>
            </button>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* TAB 1: BOŞ DERSLER & VEKALET (GÜNÜN AKIŞI) */}
          {/* ------------------------------------------------------------------ */}
          {activeSubView === 'vacant' && (
            <div className="flex flex-col gap-3 touch-manipulation">
              {/* Absent Teachers & Lessons List */}
              {absentTeachersWithLessons.length === 0 ? (
                <div className="bg-emerald-50/70 border border-emerald-200 p-6 sm:p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-2 shadow-2xs touch-manipulation">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
                  <h4 className="font-black text-emerald-900 text-sm sm:text-base">Bugün Tüm Öğretmenler Okulda</h4>
                  <p className="text-xs text-emerald-700 max-w-sm">
                    Herhangi bir izinli veya raporlu öğretmen bildirilmedi. Boş ders oluşmadı.
                  </p>
                  <button
                    onClick={handleOpenAddAbsentModal}
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold transition-all min-h-[42px] sm:min-h-[42px] flex items-center gap-1.5 shadow-2xs active:scale-95 touch-manipulation"
                  >
                    <Plus className="w-4 h-4" /> Gelmeyen Personel Bildir
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 touch-manipulation">
                  {/* Compact Header Bar for Quick Add & Auto Assign */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-2xs touch-manipulation">
                    <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap touch-manipulation">
                      <span className="text-[11px] sm:text-xs font-black text-slate-800 flex flex-wrap items-center gap-1.5 touch-manipulation">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black">
                          {absentTeachersList.length} Gelmeyen
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium">
                          {totalVacantCount} Boş Ders
                        </span>
                        {unassignedVacantCount > 0 && (
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold">
                            {unassignedVacantCount} Bekliyor
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto touch-manipulation">
                      <button
                        onClick={handleOpenAddAbsentModal}
                        className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-[11px] sm:text-xs font-bold px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl flex items-center justify-center gap-1 min-h-[40px] sm:min-h-[42px] touch-manipulation active:scale-95 transition-all shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">+ Personel Ekle</span>
                      </button>
                      <button
                        onClick={() => handleAutoAssignCovers()}
                        disabled={absentTeachersList.length === 0}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] sm:text-xs font-bold px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl flex items-center justify-center gap-1 min-h-[40px] sm:min-h-[42px] touch-manipulation active:scale-95 transition-all shadow-2xs disabled:opacity-50"
                      >
                        <Wand2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">⚡ Dağıt</span>
                      </button>
                    </div>
                  </div>
                  {absentTeachersWithLessons.map(({ teacher, status, lessons, totalLessons, mandatoryCount, optionalCount, coveredMandatory, coveredLessons }) => {
                    const isAllCovered = mandatoryCount > 0 ? coveredMandatory === mandatoryCount : (totalLessons > 0 && coveredLessons === totalLessons);

                    return (
                      <div 
                        key={teacher}
                        className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col border-l-4 ${
                          status === 'raporlu' ? 'border-l-rose-500' :
                          status === 'izinli' ? 'border-l-amber-500' :
                          status === 'görevli' ? 'border-l-blue-500' : 'border-l-slate-400'
                        }`}
                      >
                        {/* Teacher Header Bar */}
                        <div className="p-2.5 sm:p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 touch-manipulation">
                          <div className="flex items-center gap-2.5 touch-manipulation">
                            <div className="p-2 bg-white rounded-xl shadow-2xs border border-slate-100 shrink-0">
                              <UserX className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                status === 'raporlu' ? 'text-rose-500' :
                                status === 'izinli' ? 'text-amber-500' :
                                status === 'görevli' ? 'text-blue-500' : 'text-slate-500'
                              }`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5 touch-manipulation">
                                <span className="font-black text-slate-800 text-xs sm:text-base truncate">{teacher}</span>
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                                  status === 'raporlu' ? 'bg-rose-50 text-rose-600' :
                                  status === 'izinli' ? 'bg-amber-50 text-amber-600' :
                                  status === 'görevli' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {status}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 font-medium flex-wrap touch-manipulation">
                                <span className="flex items-center gap-0.5 touch-manipulation">
                                  <Clock className="w-3 h-3 text-slate-400" /> İlk 7 Saat: {mandatoryCount} Ders
                                  {optionalCount > 0 && (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded font-semibold ml-1">
                                      +{optionalCount} İsteğe Bağlı
                                    </span>
                                  )}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 touch-manipulation">
                                  <CheckCircle2 className={`w-3 h-3 ${mandatoryCount > 0 && coveredMandatory === mandatoryCount ? 'text-emerald-500' : 'text-slate-400'}`} /> {coveredMandatory} / {mandatoryCount} Zorunlu Atandı
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Top Controls for Teacher (Desktop Only) */}
                          <div className="hidden sm:flex items-center gap-1.5 w-full sm:w-auto touch-manipulation">
                            <button
                              onClick={() => handleAutoAssignCovers(undefined, teacher)}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-[10px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center justify-center gap-1 min-h-[42px] sm:min-h-[42px] active:scale-95 transition-all shadow-2xs w-full sm:w-auto touch-manipulation"
                            >
                              <Wand2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                              <span className="truncate">Bu Öğretmene Dağıt</span>
                            </button>

                            <button
                              onClick={() => handleRemoveAbsentTeacher(teacher)}
                              className="bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 font-bold text-[10px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center justify-center gap-1 min-h-[42px] sm:min-h-[42px] active:scale-95 transition-all shadow-2xs w-full sm:w-auto touch-manipulation"
                              title="İzni kaldır ve okulda yap"
                            >
                              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                              <span className="truncate">Okulda Yap</span>
                            </button>
                          </div>
                        </div>

                        {/* Lessons Grid */}
                        <div className="p-2.5 sm:p-4">
                          {lessons.length === 0 ? (
                            <div className="text-xs text-slate-500 font-medium p-3.5 bg-slate-50 rounded-xl text-center flex items-center justify-center gap-2 border border-slate-100 touch-manipulation">
                              <Clock className="w-4 h-4 text-slate-400" />
                              Bu öğretmenin bugün programında dersi bulunmamaktadır.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                              {lessons.map(slot => {
                                const freeStaff = getFreeDutyStaffForPeriod(slot.pIdx, teacher);
                                const isOptional = slot.pIdx >= 7;

                                return (
                                  <div
                                    key={slot.pIdx}
                                    className={`p-3 sm:p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                                      slot.covering
                                        ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                                        : isOptional
                                          ? 'bg-slate-50/80 border-slate-200 shadow-2xs'
                                          : 'bg-rose-50/40 border-rose-200/80 shadow-2xs'
                                    }`}
                                  >
                                    {/* Period & Lesson Info */}
                                    <div className="flex items-center justify-between touch-manipulation">
                                      <span className="font-bold text-[11px] text-slate-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-2xs touch-manipulation">
                                        <Clock className="w-3 h-3 text-indigo-500" />
                                        {slot.periodNumber}. Ders
                                        {isOptional && (
                                          <span className="text-[9px] text-amber-700 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded ml-0.5">
                                            İsteğe Bağlı
                                          </span>
                                        )}
                                      </span>

                                      {slot.covering ? (
                                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 touch-manipulation">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Atandı
                                        </span>
                                      ) : isOptional ? (
                                        <span className="text-[10px] font-bold uppercase bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md">
                                          İsteğe Bağlı (Gerekmez)
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                                          Vekil Bekliyor
                                        </span>
                                      )}
                                    </div>

                                    {/* Lesson Details */}
                                    <div>
                                      <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                                        {slot.lessonInfo}
                                      </div>
                                    </div>

                                    {/* Duty Teacher Assignment Dropdown */}
                                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 touch-manipulation">
                                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 touch-manipulation">
                                        <CheckCircle2 className="w-3 h-3 text-slate-400" /> Nöbetçi Atama:
                                      </label>
                                      <div className="flex items-center gap-1 touch-manipulation">
                                        <div className="relative flex-1 touch-manipulation">
                                          <select
                                            value={slot.covering}
                                            onChange={(e) => {
                                              const next = { ...coverAssignments, [slot.key]: e.target.value };
                                              if (!e.target.value) delete next[slot.key];
                                              setCoverAssignments(next);
                                            }}
                                            className={`w-full p-2 pr-7 text-xs font-semibold rounded-lg border outline-none cursor-pointer min-h-[42px] transition-colors appearance-none ${
                                              slot.covering
                                                ? 'bg-white text-emerald-800 border-emerald-300 shadow-2xs font-bold'
                                                : isOptional
                                                  ? 'bg-white text-slate-500 border-slate-200'
                                                  : 'bg-white text-slate-700 border-slate-200 focus:border-indigo-400 focus:shadow-2xs'
                                            }`}
                                          >
                                            <option value="">{isOptional ? '-- İsteğe Bağlı (Nöbetçi Atanmadı) --' : '-- Seçiniz --'}</option>
                                            {freeStaff.map(s => (
                                              <option key={s} value={s}>{s}</option>
                                            ))}
                                          </select>
                                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                        {slot.covering && (
                                          <button
                                            onClick={() => {
                                              const next = { ...coverAssignments };
                                              delete next[slot.key];
                                              setCoverAssignments(next);
                                            }}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center shrink-0 border border-rose-200 bg-white shadow-2xs active:scale-95 touch-manipulation"
                                            title="Atamayı Kaldır"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* WhatsApp & Announcement Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-indigo-900/40 flex flex-col gap-3 touch-manipulation">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 touch-manipulation">
                  <div className="flex items-center gap-2 touch-manipulation">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm sm:text-base">
                        Resmi Tebliğ ve WhatsApp Duyurusu
                      </h4>
                      <p className="text-xs text-indigo-200">
                        Oluşan vekalet tablosunu anında öğretmenler grubuna iletin veya yazdırın.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPreviewText(!showPreviewText)}
                    className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 min-h-[42px] touch-manipulation"
                  >
                    {showPreviewText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{showPreviewText ? 'Metni Gizle' : 'Mesaj Metnini Gör'}</span>
                  </button>
                </div>

                {/* Collapsible Message Preview */}
                {showPreviewText && (
                  <pre className="text-xs text-indigo-100 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar bg-black/40 p-3 rounded-xl border border-white/10">
                    {generateShareText()}
                  </pre>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(generateShareText())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px] shadow-sm transition-all active:scale-95 touch-manipulation"
                  >
                    <Send className="w-4 h-4" />
                    <span>WhatsApp ile Paylaş</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateShareText());
                      if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(30);
                      }
                      setSuccessMessage("Tebliğ metni panoya kopyalandı!");
                      setTimeout(() => setSuccessMessage(''), 3000);
                    }}
                    className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px] border border-white/15 transition-all active:scale-95 touch-manipulation"
                  >
                    <Copy className="w-4 h-4 text-indigo-300" />
                    <span>Metni Kopyala</span>
                  </button>

                  <button
                    onClick={handlePrintCoverReport}
                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px] transition-all active:scale-95 touch-manipulation"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PDF / Yazdır</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* TAB 2: GÜN ÖZETİ (READ-ONLY ÖZET TABLO) */}
          {/* ------------------------------------------------------------------ */}
          {activeSubView === 'duties' && (
            <div className="flex flex-col gap-2 sm:gap-3 touch-manipulation">
              {/* Header card with Admin & Status Summary */}
              <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-2 touch-manipulation">
                <div className="flex flex-row justify-between items-center gap-2 border-b border-slate-100 pb-2 touch-manipulation">
                  <div>
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 touch-manipulation">
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
                      <span>Günlük Nöbet ve Vekalet Özet Tablosu ({activeDays[selectedCoverDIdx]?.name})</span>
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
                      Günün tüm nöbet bölgeleri, görevli öğretmen kadrosu ve vekalet ders atamalarının salt okunur özeti.
                    </p>
                  </div>

                  <span className="text-[10px] sm:text-xs font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-indigo-100 flex items-center gap-1 shrink-0 touch-manipulation">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
                    <span>Özet</span>
                  </span>
                </div>

                {/* Duty Admin Info Strip (Read Only) */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-medium touch-manipulation">
                  <div className="flex items-center gap-1 sm:gap-2 touch-manipulation">
                    <span className="font-black text-slate-700 text-[10px] sm:text-xs">Nöbetçi İdareci:</span>
                    <span className="font-black text-slate-900 bg-amber-100 text-amber-900 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md border border-amber-200 flex items-center gap-1 text-[10px] sm:text-xs touch-manipulation">
                      <ShieldCheck className="w-3 h-3 text-amber-700 shrink-0" />
                      {dutyAdminForDay || 'Atanmadı'}
                      {dutyAdminForDay && adminRoles[dutyAdminForDay] && (
                        <span className="text-[9px] sm:text-[10px] bg-amber-200/80 text-amber-950 px-1 py-0.2 rounded font-bold ml-0.5">
                          {adminRoles[dutyAdminForDay]}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-3 text-slate-600 text-[10px] sm:text-xs touch-manipulation">
                    <span>Nöbetçi: <strong className="text-slate-900">{assignedTeachers.length}</strong></span>
                    <span>•</span>
                    <span>Gelmeyen: <strong className="text-rose-600">{absentTeachersList.length}</strong></span>
                  </div>
                </div>

                {/* WhatsApp & Copy Action Bar for Today's Duties */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Günün nöbetçi çizelgesini tek tıkla öğretmen grubuna iletin:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(generateDailyDutyWhatsAppText())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 touch-manipulation"
                      title="Günün nöbet çizelgesini WhatsApp ile gönder"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp Nöbet Tebliği</span>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateDailyDutyWhatsAppText());
                        if (window.navigator && window.navigator.vibrate) {
                          window.navigator.vibrate(30);
                        }
                        setSuccessMessage("Günün nöbet listesi panoya kopyalandı!");
                        setTimeout(() => setSuccessMessage(''), 3000);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-all active:scale-95 touch-manipulation"
                      title="Metni Kopyala"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Kopyala</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Nöbet Bölgeleri & Görevli Kadro Tablosu */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-2.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center touch-manipulation">
                  <h4 className="font-black text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 touch-manipulation">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Nöbet Bölgeleri ve Görevli Öğretmen Kadrosu</span>
                  </h4>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-bold">
                    {dutyLocations.length} Bölge
                  </span>
                </div>

                <div className="overflow-x-auto touch-pan-x custom-scrollbar touch-pan-x">
                  <table className="w-full text-left text-[11px] sm:text-xs border-collapse min-w-[540px]">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider">
                        <th className="p-2 sm:p-3 whitespace-nowrap">Nöbet Yeri / Bölgesi</th>
                        <th className="p-2 sm:p-3 whitespace-nowrap">Görevli Nöbetçiler</th>
                        <th className="p-2 sm:p-3 whitespace-nowrap text-center">Durumu</th>
                        <th className="p-2 sm:p-3 whitespace-nowrap text-center">Ders Yükü</th>
                        <th className="p-2 sm:p-3 whitespace-nowrap text-center">Üstlendiği Vekalet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dutyLocations.map(loc => {
                        const assigned = todayDayId ? (dutyAssignments[`${loc}_${todayDayId}`] || []) : [];
                        
                        if (assigned.length === 0) {
                          return (
                            <tr key={loc} className="hover:bg-slate-50/50 touch-manipulation">
                              <td className="p-2 sm:p-3.5 whitespace-nowrap font-bold text-slate-800 flex items-center gap-1.5 touch-manipulation">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {loc}
                              </td>
                              <td colSpan={4} className="p-2 sm:p-3.5 whitespace-nowrap text-slate-400 italic">
                                Bu bölgeye tanımlı nöbetçi yok.
                              </td>
                            </tr>
                          );
                        }

                        return assigned.map((teacher, idx) => {
                          const tStatus = teacherStatuses[`${selectedCoverDate}_${teacher}`] || 'aktif';
                          const isAbsent = tStatus !== 'aktif';
                          const lessonCount = selectedCoverDIdx >= 0 ? getLessonCount(teacher, selectedCoverDIdx) : 0;
                          
                          // Count how many cover assignments this teacher took today
                          const takenCoversCount = Object.values(coverAssignments).filter(v => v === teacher).length;

                          return (
                            <tr key={`${loc}_${teacher}`} className={isAbsent ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}>
                              {idx === 0 && (
                                <td 
                                  rowSpan={assigned.length} 
                                  className="p-2 sm:p-3.5 whitespace-nowrap font-black text-slate-800 align-top border-r border-slate-100 bg-slate-50/30 min-w-[120px] sm:min-w-[140px]"
                                >
                                  <div className="flex items-center gap-1.5 touch-manipulation">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span>{loc}</span>
                                  </div>
                                </td>
                              )}
                              <td className="p-2 sm:p-3.5 whitespace-nowrap font-bold text-slate-800">
                                <span className={isAbsent ? 'line-through text-slate-500' : ''}>
                                  {teacher}
                                </span>
                              </td>
                              <td className="p-2 sm:p-3.5 whitespace-nowrap text-center">
                                {isAbsent ? (
                                  <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">
                                    {tStatus}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                                    Okulda
                                  </span>
                                )}
                              </td>
                              <td className="p-2 sm:p-3.5 whitespace-nowrap text-center font-bold text-slate-600">
                                {lessonCount} Ders
                              </td>
                              <td className="p-2 sm:p-3.5 whitespace-nowrap text-center">
                                {takenCoversCount > 0 ? (
                                  <span className="text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                                    +{takenCoversCount} Vekalet
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-medium">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vekalet Dağılım Tablosu (Read Only Summary) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center touch-manipulation">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2 touch-manipulation">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Günün Vekalet ve Boş Ders Dağılım Çizelgesi</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-bold">
                    {vacantLessonsForDay.length} Boş Ders
                  </span>
                </div>

                {vacantLessonsForDay.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                    Bugün için boş geçen ders veya vekalet ataması bulunmamaktadır.
                  </div>
                ) : (
                  <div className="overflow-x-auto touch-pan-x">
                    <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider">
                          <th className="p-2 sm:p-3.5 whitespace-nowrap">Saat / Ders</th>
                          <th className="p-2 sm:p-3.5 whitespace-nowrap">Gelmeyen Öğretmen</th>
                          <th className="p-2 sm:p-3.5 min-w-[120px]">Ders / Sınıf Bilgisi</th>
                          <th className="p-2 sm:p-3.5 whitespace-nowrap">Atanan Vekil Nöbetçi</th>
                          <th className="p-2 sm:p-3.5 whitespace-nowrap text-center">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vacantLessonsForDay.map(slot => (
                          <tr key={slot.key} className="hover:bg-slate-50/50 touch-manipulation">
                            <td className="p-2 sm:p-3.5 whitespace-nowrap font-black text-indigo-700">
                              {slot.periodNumber}. Ders
                            </td>
                            <td className="p-2 sm:p-3.5 whitespace-nowrap font-bold text-rose-800">
                              {slot.teacher}
                            </td>
                            <td className="p-2 sm:p-3.5 font-semibold text-slate-700">
                              {slot.lessonInfo}
                            </td>
                            <td className="p-2 sm:p-3.5 whitespace-nowrap font-bold text-slate-900">
                              {slot.covering ? (
                                <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                                  {slot.covering}
                                </span>
                              ) : slot.pIdx >= 7 ? (
                                <span className="text-slate-400 font-normal italic text-xs">İsteğe Bağlı (Gerekmez)</span>
                              ) : (
                                <span className="text-rose-600 italic">Atanmadı</span>
                              )}
                            </td>
                            <td className="p-2 sm:p-3.5 whitespace-nowrap text-center">
                              {slot.covering ? (
                                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                                  Tamamlandı
                                </span>
                              ) : slot.pIdx >= 7 ? (
                                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                  İsteğe Bağlı
                                </span>
                              ) : (
                                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                                  Bekliyor
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* TAB 3: İZİN / DEVAMSIZLIK LİSTESİ */}
          {/* ------------------------------------------------------------------ */}
          {activeSubView === 'attendance' && (
            <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-2.5 touch-manipulation">
              <div className="flex flex-row justify-between items-center gap-2 border-b border-slate-100 pb-2 touch-manipulation">
                <div>
                  <h3 className="font-black text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 touch-manipulation">
                    <Users className="w-4 h-4 text-rose-500" />
                    <span>Öğretmen İzin ve Devamsızlık Durumu</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                    Öğretmenlerin izin durumunu tek dokunuşla değiştirin.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 touch-manipulation">
                  <span className="text-[10px] sm:text-xs font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200">
                    {absentTeachersList.length} Gelmeyen
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {teachers.length - absentTeachersList.length} Okulda
                  </span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2 touch-manipulation">
                <div className="relative w-full sm:flex-1 touch-manipulation">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    placeholder="Öğretmen ara..."
                    className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 min-h-[42px] sm:min-h-[40px]"
                  />
                  {attendanceSearch && (
                    <button
                      onClick={() => setAttendanceSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="grid grid-cols-3 sm:flex items-center bg-slate-100 p-1 rounded-xl gap-1 w-full sm:w-auto touch-manipulation">
                  <button
                    onClick={() => setAttendanceFilter('all')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[42px] text-center ${
                      attendanceFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Tümü ({teachers.length})
                  </button>
                  <button
                    onClick={() => setAttendanceFilter('absent')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[42px] text-center ${
                      attendanceFilter === 'absent' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    İzinli ({absentTeachersList.length})
                  </button>
                  <button
                    onClick={() => setAttendanceFilter('active')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[42px] text-center ${
                      attendanceFilter === 'active' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Okulda ({teachers.length - absentTeachersList.length})
                  </button>
                </div>
              </div>

              {/* Teachers List */}
              <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1 touch-manipulation">
                {teachers
                  .filter(t => {
                    if (attendanceSearch.trim() && !t.toLowerCase().includes(attendanceSearch.toLowerCase().trim())) {
                      return false;
                    }
                    const st = teacherStatuses[`${selectedCoverDate}_${t}`] || 'aktif';
                    if (attendanceFilter === 'absent' && st === 'aktif') return false;
                    if (attendanceFilter === 'active' && st !== 'aktif') return false;
                    return true;
                  })
                  .map(teacher => {
                    const currentStatus = teacherStatuses[`${selectedCoverDate}_${teacher}`] || 'aktif';
                    const lessonCount = selectedCoverDIdx >= 0 ? getLessonCount(teacher, selectedCoverDIdx) : 0;

                    return (
                      <div
                        key={teacher}
                        className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all ${
                          currentStatus !== 'aktif' ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto justify-between sm:justify-start touch-manipulation">
                          <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">{teacher}</span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                            {lessonCount} Ders
                          </span>
                        </div>

                        {/* Status Buttons (Touch-friendly Grid) */}
                        <div className="grid grid-cols-5 gap-1 w-full sm:w-auto shrink-0">
                          {[
                            { id: 'aktif', label: 'Okulda', activeClass: 'bg-emerald-600 text-white' },
                            { id: 'raporlu', label: 'Raporlu', activeClass: 'bg-amber-500 text-white' },
                            { id: 'izinli', label: 'İzinli', activeClass: 'bg-purple-600 text-white' },
                            { id: 'görevli', label: 'Görevli', activeClass: 'bg-blue-600 text-white' },
                            { id: 'mazeretsiz', label: 'Mazeretsiz', activeClass: 'bg-rose-600 text-white' }
                          ].map(s => (
                            <button
                              key={s.id}
                              onClick={() => handleSetTeacherStatusDirect(teacher, s.id)}
                              className={`py-1.5 px-1 sm:px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all min-h-[42px] sm:min-h-[42px] border text-center flex items-center justify-center truncate touch-manipulation active:scale-95 ${
                                currentStatus === s.id
                                  ? `${s.activeClass} border-transparent shadow-2xs font-black`
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span className="truncate">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: MULTI-TEACHER ABSENCE SELECTION (+ Gelmeyen Ekle Modal) */}
      {/* ------------------------------------------------------------------ */}
      {showAddAbsentModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150 touch-manipulation"
          onClick={() => setShowAddAbsentModal(false)}
        >
          <div 
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl overflow-hidden flex flex-col max-h-[92vh] touch-manipulation"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Drag handle for mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0 touch-manipulation">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80 shrink-0 touch-manipulation">
              <div className="flex items-center gap-2.5 touch-manipulation">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl shadow-2xs">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base flex items-center gap-2 touch-manipulation">
                    <span>Çoklu Gelmeyen / İzinli Öğretmen Seçimi</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{getFormattedDate(selectedCoverDate)} • Toplu Seçim ve Dağıtım</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddAbsentModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 min-h-[42px] min-w-[42px] flex items-center justify-center transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 sm:p-4 overflow-y-auto flex flex-col gap-3 flex-1 touch-manipulation">

              {/* Search & Selection Controls */}
              <div className="flex flex-col gap-2 touch-manipulation">
                <div className="flex justify-between items-center touch-manipulation">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    Öğretmenleri İşaretleyin & İzin Türü Seçin
                  </label>
                  <div className="flex items-center gap-2 touch-manipulation">
                    <button
                      type="button"
                      onClick={() => handleSelectAllFilteredInModal(modalFilteredTeachers)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 active:scale-95 transition-all"
                    >
                      + Tümünü Seç
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAbsentTeachers({})}
                      className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 active:scale-95 transition-all"
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                {/* Search Input & Filter Tabs */}
                <div className="flex flex-col sm:flex-row gap-2 touch-manipulation">
                  <div className="relative flex-1 touch-manipulation">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="İsimle öğretmen ara..."
                      value={modalSearch}
                      onChange={e => setModalSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white min-h-[40px]"
                    />
                    {modalSearch && (
                      <button 
                        onClick={() => setModalSearch('')} 
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-center touch-manipulation">
                    <button
                      type="button"
                      onClick={() => setModalFilter('has_lessons')}
                      className={`px-2 py-1.5 rounded-lg transition-all text-[11px] sm:text-xs min-h-[42px] flex items-center justify-center ${
                        modalFilter === 'has_lessons' ? 'bg-white text-indigo-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dersi Olanlar
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalFilter('all')}
                      className={`px-2 py-1.5 rounded-lg transition-all text-[11px] sm:text-xs min-h-[42px] flex items-center justify-center ${
                        modalFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tümü
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalFilter('selected')}
                      className={`px-2 py-1.5 rounded-lg transition-all text-[11px] sm:text-xs min-h-[42px] flex items-center justify-center ${
                        modalFilter === 'selected' ? 'bg-indigo-600 text-white shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Seçilen ({modalSelectedStats.teacherCount})
                    </button>
                  </div>
                </div>
              </div>

              {/* Teacher Checkbox List */}
              <div className="flex flex-col gap-1.5 max-h-[360px] sm:max-h-[420px] overflow-y-auto custom-scrollbar pr-1 touch-manipulation">
                {modalFilteredTeachers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
                    Aranan kriterde öğretmen bulunamadı.
                  </div>
                ) : (
                  modalFilteredTeachers.map(teacher => {
                    const isChecked = Boolean(selectedAbsentTeachers[teacher]);
                    const currentTeacherStatus = selectedAbsentTeachers[teacher] || defaultBatchStatus;
                    const lessonCount = selectedCoverDIdx >= 0 ? getLessonCount(teacher, selectedCoverDIdx) : 0;

                    return (
                      <div
                        key={teacher}
                        onClick={() => handleToggleTeacherSelect(teacher)}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer select-none active:scale-[0.99] ${
                          isChecked
                            ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 touch-manipulation">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div onClick
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer pointer-events-none"
                          />
                          <span className={`text-xs sm:text-sm font-bold truncate ${isChecked ? 'text-slate-900 font-black' : 'text-slate-700'}`}>
                            {teacher}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                            lessonCount > 0 ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-50 text-slate-400'
                          }`}>
                            {lessonCount > 0 ? `${lessonCount} Ders` : 'Dersi Yok'}
                          </span>
                        </div>

                        {/* Individual Status Selector for Checked Teacher */}
                        {isChecked && (
                          <div onClick={e => e.stopPropagation()} className="shrink-0">
                            <select
                              value={currentTeacherStatus}
                              onChange={e => handleSetTeacherStatusInModal(teacher, e.target.value)}
                              className="text-xs font-black px-2 py-1 rounded-lg border border-amber-300 bg-white text-slate-800 outline-none shadow-2xs cursor-pointer focus:ring-2 focus:ring-amber-400"
                            >
                              <option value="raporlu">Raporlu</option>
                              <option value="izinli">İzinli</option>
                              <option value="görevli">Görevli</option>
                              <option value="mazeretsiz">Mazeretsiz</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Modal Actions & Footer Summary */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2.5 shrink-0 touch-manipulation">
              <div className="flex justify-between items-center text-xs font-black text-slate-700 bg-amber-100/60 border border-amber-200/80 px-3 py-2 rounded-xl touch-manipulation">
                <span>Seçilen Personel: <strong>{modalSelectedStats.teacherCount} Öğretmen</strong></span>
                <span>Dağıtılacak Ders (İlk 7 Saat): <strong className="text-amber-900">{modalSelectedStats.vacantLessonCount} Ders</strong></span>
              </div>

              <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Otomatik dağıtım sadece ilk 7 ders için yapılır. 8 ve 9. dersler isteğe bağlı olduğundan nöbetçilere dağıtılmaz.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddAbsentSubmit(true)}
                  disabled={modalSelectedStats.teacherCount === 0}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 min-h-[46px] active:scale-95 transition-all disabled:opacity-50 cursor-pointer touch-manipulation"
                >
                  <Wand2 className="w-4 h-4 shrink-0" />
                  <span>⚡ Kaydet & Otomatik Dağıt</span>
                </button>

                <button
                  onClick={() => handleAddAbsentSubmit(false)}
                  disabled={modalSelectedStats.teacherCount === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 min-h-[44px] active:scale-95 transition-all disabled:opacity-50 cursor-pointer touch-manipulation"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Sadece İzinli Kaydet</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
