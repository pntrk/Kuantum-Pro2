import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Trash2, Users, Calendar, ClipboardCheck, AlertCircle, 
  CheckCircle2, Wand2, Save, Printer, AlertTriangle, X, ShieldCheck, 
  UserCheck, Search, HelpCircle, RefreshCw, RotateCcw, FileText, Settings, Edit, Check,
  ChevronLeft, ChevronRight, Filter, BookOpen, Clock, Layers, Sparkles, LayoutDashboard, Zap,
  Share2, ChevronDown, ChevronUp, ArrowUp, ArrowDown, CheckCheck, CalendarRange, CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import DutySettingsModal from './DutySettingsModal';
import DutySummaryTab from './DutySummaryTab';
import DutyRangeTab from './DutyRangeTab';
import { exportDutyRangeToExcel, exportWeeklyDutyToExcel } from '../utils/dutyExcelUtils';
import { getAcademicWeekIndex, getShiftedTeachersForDay, getDefaultAcademicYearStart } from '../utils/dutyRotationUtils';

export default function DutyManager({ teachers = [], schedules = {}, schoolSettings }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('locations');
  const [newLoc, setNewLoc] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedTeacherForCover, setSelectedTeacherForCover] = useState<string>('ALL');
  const [editingLoc, setEditingLoc] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState('');
  const [mobileRosterDayId, setMobileRosterDayId] = useState(schoolSettings?.weekDays?.find(d => d.active)?.id || 1);
  const [mobileRosterViewMode, setMobileRosterViewMode] = useState<'cards' | 'table'>('cards');
  const [mobileCardDensity, setMobileCardDensity] = useState<'compact' | 'grid' | 'normal'>('compact');
  const [selectingTeacherSearch, setSelectingTeacherSearch] = useState('');
  const [coverMobileFilter, setCoverMobileFilter] = useState<'all' | 'absent' | 'has_schedule'>('all');
  const [coverMobileTab, setCoverMobileTab] = useState<'attendance' | 'vacant' | 'report'>('attendance');
  const [coverVacantPeriodFilter, setCoverVacantPeriodFilter] = useState<'all' | number>('all');
  
  // Roster Tab Mobile States
  const [rosterLocationSearch, setRosterLocationSearch] = useState('');
  const [rosterLocationFilter, setRosterLocationFilter] = useState<'all' | 'empty' | 'filled'>('all');
  const [rosterTableDayFilter, setRosterTableDayFilter] = useState<'all' | number>('all');
  const [rosterWarningsTab, setRosterWarningsTab] = useState<'unassigned' | 'multiple'>('unassigned');
  const [rosterWarningsCollapsed, setRosterWarningsCollapsed] = useState(false);
  const [selectingTeacherFilter, setSelectingTeacherFilter] = useState<'all' | 'recommended' | 'free' | 'unassigned'>('all');
  
  // Summary Tab View States
  const [summaryMobileView, setSummaryMobileView] = useState<'all' | 'duties' | 'attendance' | 'vacant' | 'report'>('all');
  const [summaryLocationSearch, setSummaryLocationSearch] = useState('');
  const [expandedAbsentTeachers, setExpandedAbsentTeachers] = useState<Record<string, boolean>>({});
  
  // Quick Cover States
  const [showQuickCoverModal, setShowQuickCoverModal] = useState(false);
  const [quickCoverTeacher, setQuickCoverTeacher] = useState('');
  const [quickCoverStatus, setQuickCoverStatus] = useState('raporlu');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings') {
      setActiveTab('roster');
      setIsSettingsModalOpen(true);
    } else if (activeTab === 'covers') {
      setActiveTab('summary');
    }
  }, [activeTab]);

  // Settings Tab Mobile States
  const [exemptionFilter, setExemptionFilter] = useState<'all' | 'exempt' | 'active'>('all');
  const [adminMobileSubTab, setAdminMobileSubTab] = useState<'staff' | 'schedule'>('staff');
  const [rulesMobileTab, setRulesMobileTab] = useState<'general' | 'attention' | 'signature'>('general');


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
     
     if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
     }
     setShowQuickCoverModal(false);
     setShowShareModal(true);
  };

  const generateShareText = () => {
    const dObj = coverDay;
    const dName = dObj ? dObj.name : '';
    const dateFormatted = getFormattedDate(selectedCoverDate);
    
    let text = `Tarih: ${dateFormatted} ${dName}\n`;
    text += `Bugün okulumuzda bulunmayan öğretmenlerimiz ve boş derslerine girecek nöbetçi öğretmen listesi aşağıdadır:\n\n`;

    const absentTeachersList = teachers.filter(t => (teacherStatuses[`${selectedCoverDate}_${t}`] || 'aktif') !== 'aktif');
    
    if (absentTeachersList.length === 0) {
       text += "Bugün tüm öğretmenlerimiz okulda görevlerinin başındadır.";
       return text;
    }

    const periodsCount = dObj ? (dObj.periods || 8) : 8;

    absentTeachersList.forEach(absent => {
        text += `Gelmeyen Personel: *${absent}*\n`;
        const hasSched = coverDayScheduleIdx >= 0 ? schedules[absent]?.[coverDayScheduleIdx] : null;
        if (hasSched && dObj) {
            let hasAnyCover = false;
            for (let pIdx = 0; pIdx < periodsCount; pIdx++) {
                const hasLesson = hasSched[pIdx];
                if (isActualLesson(hasLesson)) {
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
                    text += `- ${pIdx + 1}. Ders (${lessonInfo}): ${covering ? `*${covering}*` : 'ATANMADI'}\n`;
                }
            }
            if (!hasAnyCover) {
                text += `- Bugün dersi bulunmamaktadır.\n`;
            }
        } else {
            text += `- Bugün dersi bulunmamaktadır.\n`;
        }
        text += `\n`;
    });

    return text.trimEnd();
  };

  const [dailyDutyCopiedDay, setDailyDutyCopiedDay] = useState<number | null>(null);

  const generateDailyDutyWhatsAppText = (dayId: number) => {
    const dayObj = activeDays.find(d => d.id === dayId);
    const dayName = dayObj ? dayObj.name : 'Nöbet Günü';
    const admin = adminSchedule[dayId];
    
    let text = `📋 *${schoolSettings?.name || 'Okul'} - ${dayName.toUpperCase()} GÜNÜ NÖBET ÇİZELGESİ*\n`;
    if (admin) {
      const role = adminRoles[admin] ? ` (${adminRoles[admin]})` : '';
      text += `👑 *Nöbetçi İdareci:* ${admin}${role}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📍 *NÖBET YERLERİ VE GÖREVLİ ÖĞRETMENLER:*\n\n`;

    dutyLocations.forEach((loc, idx) => {
      const assigned = dutyAssignments[`${loc}_${dayId}`] || [];
      if (assigned.length > 0) {
        text += `${idx + 1}. *${loc}:* ${assigned.join(', ')}\n`;
      } else {
        text += `${idx + 1}. *${loc}:* _(Boş / Atanmadı)_\n`;
      }
    });

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `İyi çalışmalar dileriz.`;
    return text;
  };

  const handleShareDailyDutyWhatsApp = (dayId: number) => {
    const text = generateDailyDutyWhatsAppText(dayId);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyDailyDutyText = (dayId: number) => {
    const text = generateDailyDutyWhatsAppText(dayId);
    navigator.clipboard.writeText(text);
    setDailyDutyCopiedDay(dayId);
    setTimeout(() => setDailyDutyCopiedDay(null), 2000);
  };

  // Helper to check if a lesson is actually a valid lesson that needs a substitute
  const isActualLesson = (lesson: any) => {
    if (!lesson) return false;
    if (typeof lesson === 'string') {
      try {
        const card = JSON.parse(lesson);
        // If it has no classes, it's considered an empty/unplaced slot
        if (!card.classes || card.classes.length === 0) return false;
      } catch (e) {
        if (!lesson.trim()) return false;
      }
    }
    return true;
  };



  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  };

  const shiftCoverDate = (days: number) => {
    if (!selectedCoverDate) return;
    const [y, m, d] = selectedCoverDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const nextY = dateObj.getFullYear();
    const nextM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const nextD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedCoverDate(`${nextY}-${nextM}-${nextD}`);
  };

  const setTodayCoverDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setSelectedCoverDate(`${y}-${m}-${d}`);
  };

  // Persistent States with localStorage Fallback
  const [dutyLocations, setDutyLocations] = useState(() => {
    const cached = localStorage.getItem('ataturk_duty_locations');
    return cached ? JSON.parse(cached) : ['BAHÇE-1 (Kantin+İş Kapı)', 'BAHÇE-2 (Dış Kapı)', 'ZEMİN KAT (Öğretmenler)', 'KAT1 (7. Sınıflar)', 'KAT2 (5. Sınıflar)', 'KAT3 (8. Sınıflar)', 'EK BİNA (6. Sınıflar)'];
  });

  const [dutyAssignments, setDutyAssignments] = useState(() => {
    const cached = localStorage.getItem('ataturk_duty_assignments');
    return cached ? JSON.parse(cached) : {};
  });

  const [exemptTeachers, setExemptTeachers] = useState(() => {
    const cached = localStorage.getItem('ataturk_exempt_teachers');
    return cached ? JSON.parse(cached) : [];
  });

  const [dutyAdmins, setDutyAdmins] = useState(() => {
    const cached = localStorage.getItem('ataturk_duty_admins');
    return cached ? JSON.parse(cached) : ['Bahadır Ş. KUMCU', 'Harun B. TAHTACI'];
  });

  const [adminSchedule, setAdminSchedule] = useState(() => {
    const cached = localStorage.getItem('ataturk_admin_schedule');
    return cached ? JSON.parse(cached) : {};
  });

  const [adminRoles, setAdminRoles] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem('ataturk_admin_roles');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return {
      'Bahadır Ş. KUMCU': 'Müdür Yardımcısı',
      'Harun B. TAHTACI': 'Müdür Yardımcısı'
    };
  });

  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState<'all' | 'admins' | 'teachers'>('all');
  const [adminStartTeacher, setAdminStartTeacher] = useState<string>('');

  // Customizable Descriptions & Principal Signature States
  const [generalRules, setGeneralRules] = useState(() => {
    const cached = localStorage.getItem('ataturk_general_rules');
    return cached ? cached : `1- Günlük vakit çizelgesini uygulamak;
2- Öğretmenlerin derslerine zamanında girip girmediğini izlemek, öğretmeni gelmeyen sınıfları okul yönetimine bildirmek ve bu sınıflara nezaret etmek;
3- Isıtma, elektrik ve sıhhi tesisatların çalışıp çalışmadığının, okul içi temizliğin yapılıp yapılmadığının, okul bina ve tesislerinin yangından koruma önlemlerinin alınıp alınmadığının kontrollerini yapmak. Görülen aksaklıkları idareye bildirmek;
4- Bahçedeki, koridorlardaki ve sınıflardaki öğrencileri gözetlemek;
5- Beklenmedik olaylar karşısında gerekli tedbirleri almak ve bu durumu ilgililere bildirmek;
6- Nöbet süresince okulun eğitim öğretim disiplin gibi çeşitli işlerini izlemek bu hususlarda günlük tedbirleri almak;
7- Nöbet sonunda okul nöbet defterine nöbet süresi içerisinde önemli olayları ve aldığı tedbirleri belirten raporu yazmak.`;
  });

  const [attentionRules, setAttentionRules] = useState(() => {
    const cached = localStorage.getItem('ataturk_attention_rules');
    return cached ? cached : `1- Nöbet görevi SABAH 08.15 de başlar, ÖĞLEDEN SONRA 16.00'da bütün öğrenciler okuldan çıktıktan sonra biter.
2- NÖBETÇİ ÖĞRETMENLER KENDİ ARALARINDA (idareye bilgi vermek suretiyle) YER DEĞİŞİKLİĞİ YAPABİLİRLER (Örn: 1. KAT ile 3. KAT gibi).
3- NÖBETÇİ ÖĞRETMENLER ÖĞLE TATİLİNDE NÖBET YERLERİNDEN SORUMLUDURLAR (3 nöbetçi okulda bulunacak şekilde dönüşümlü mola verilebilir).
4- NÖBET ESNASINDA ÖĞRENCİLERİN İDAREDEN ALINAN RESMİ İZİN DIŞINDA OKUL BAHÇESİNDEN ÇIKMASINA İZİN VERİLMEYECEKTİR.
5- Nöbetçi öğretmenin eksik olduğu durumlarda okul güvenliğini tehlikeye atmamak adına başka bir öğretmen nöbetçi olarak görevlendirilebilir.`;
  });

  const [principalName, setPrincipalName] = useState(() => {
    const cached = localStorage.getItem('ataturk_principal_name');
    return cached ? cached : 'Hidayet AS';
  });

  const [principalTitle, setPrincipalTitle] = useState(() => {
    const cached = localStorage.getItem('ataturk_principal_title');
    return cached ? cached : 'Okul Müdürü';
  });

  // Print Configuration States
  const [rotateTeachers, setRotateTeachers] = useState(true);
  const [alternateAdmins, setAlternateAdmins] = useState(true);
  const [showWeekends, setShowWeekends] = useState(true);
  const [markHolidays, setMarkHolidays] = useState<boolean>(() => {
    const cached = localStorage.getItem('ataturk_duty_mark_holidays');
    return cached !== null ? cached === 'true' : true;
  });

  const [userHolidays, setUserHolidays] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('ataturk_duty_user_holidays');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const handleToggleUserHoliday = (dateStr: string) => {
    setUserHolidays(prev => {
      const next = prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr];
      localStorage.setItem('ataturk_duty_user_holidays', JSON.stringify(next));
      return next;
    });
  };

  const handleAddUserHoliday = (dateStr: string) => {
    if (!dateStr) return;
    setUserHolidays(prev => {
      if (prev.includes(dateStr)) return prev;
      const next = [...prev, dateStr];
      localStorage.setItem('ataturk_duty_user_holidays', JSON.stringify(next));
      return next;
    });
  };

  const handleRemoveUserHoliday = (dateStr: string) => {
    setUserHolidays(prev => {
      const next = prev.filter(d => d !== dateStr);
      localStorage.setItem('ataturk_duty_user_holidays', JSON.stringify(next));
      return next;
    });
  };

  const [selectingCell, setSelectingCell] = useState<{loc: string, dayId: number, dIdx: number} | null>(null);
  
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState('monthly');
  const [printMonth, setPrintMonth] = useState(new Date().getMonth());
  const [printYear, setPrintYear] = useState(new Date().getFullYear());
  const [printStartDate, setPrintStartDate] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [printEndDate, setPrintEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks default
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const [academicYearStartDate, setAcademicYearStartDate] = useState<string>(() => {
    const cached = localStorage.getItem('ataturk_duty_academic_start_date');
    return cached ? cached : getDefaultAcademicYearStart();
  });

  // Print typography and page layout options
  const [printFontSize, setPrintFontSize] = useState<string>(() => {
    return localStorage.getItem('ataturk_duty_print_fontsize') || '7.5pt';
  });
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>(() => {
    return (localStorage.getItem('ataturk_duty_print_orientation') as 'landscape' | 'portrait') || 'landscape';
  });
  const [printPageSize, setPrintPageSize] = useState<'A4' | 'A3'>(() => {
    return (localStorage.getItem('ataturk_duty_print_pagesize') as 'A4' | 'A3') || 'A4';
  });
  const [printMargin, setPrintMargin] = useState<'compact' | 'normal' | 'wide'>(() => {
    return (localStorage.getItem('ataturk_duty_print_margin') as 'compact' | 'normal' | 'wide') || 'compact';
  });
  const [printRowsPerPage, setPrintRowsPerPage] = useState<number>(() => {
    const cached = localStorage.getItem('ataturk_duty_print_rows_per_page');
    return cached ? parseInt(cached, 10) : 31;
  });

  const calculateRangeStats = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return { total: 0, weekdays: 0, holidays: 0, dutyDays: 0, pages: 1 };
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return { total: 0, weekdays: 0, holidays: 0, dutyDays: 0, pages: 1 };
    const start = new Date(Math.min(s.getTime(), e.getTime()));
    const end = new Date(Math.max(s.getTime(), e.getTime()));
    let total = 0;
    let weekdays = 0;
    let holidays = 0;
    let dutyDays = 0;
    const curr = new Date(start);
    while (curr <= end) {
      total++;
      const day = curr.getDay();
      const isWeekend = day === 0 || day === 6;
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const isoDate = `${y}-${m}-${d}`;
      const isUserHoliday = userHolidays.includes(isoDate);

      if (!isWeekend) {
        weekdays++;
        if (isUserHoliday) {
          holidays++;
        } else {
          dutyDays++;
        }
      } else if (isUserHoliday) {
        holidays++;
      }
      curr.setDate(curr.getDate() + 1);
    }
    const relevantDays = showWeekends ? total : (markHolidays ? dutyDays + holidays : weekdays);
    const chunk = printRowsPerPage === 9999 ? Math.max(1, relevantDays) : (printRowsPerPage || 31);
    const pages = Math.max(1, Math.ceil(relevantDays / chunk));
    return { total, weekdays, holidays, dutyDays, pages };
  };

  const [teacherStatuses, setTeacherStatuses] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem('ataturk_teacher_statuses');
    return cached ? JSON.parse(cached) : {};
  });

  const [coverAssignments, setCoverAssignments] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem('ataturk_cover_assignments');
    return cached ? JSON.parse(cached) : {};
  });

  const [selectedCoverDate, setSelectedCoverDate] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const getSelectedCoverDayId = () => {
    if (!selectedCoverDate) return -1;
    const [y, m, d] = selectedCoverDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 7 : dayOfWeek;
  };

  // Filter out Saturday and Sunday from active duty days for weekly template
  const activeDays = (schoolSettings?.weekDays?.filter((d: any) => d.active) || [])
    .filter((d: any) => d.id !== 6 && d.id !== 7);

  const selectedCoverDayId = getSelectedCoverDayId();
  const coverDay = (schoolSettings?.weekDays || []).find((d: any) => Number(d.id) === Number(selectedCoverDayId)) || 
                   activeDays.find((d: any) => Number(d.id) === Number(selectedCoverDayId));
  const coverDayScheduleIdx = coverDay ? (Number(coverDay.id) - 1) : -1;
  const selectedCoverDIdx = activeDays.findIndex((d: any) => Number(d.id) === Number(selectedCoverDayId));

  // Current week Monday-Sunday strip for fast mobile day switching (All 7 Days)
  const weekDaysForCover = React.useMemo(() => {
    if (!selectedCoverDate) return [];
    const [y, m, d] = selectedCoverDate.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    const day = curr.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diffToMonday);

    const dayLabels = [
      { name: 'Pazartesi', short: 'Pzt' },
      { name: 'Salı', short: 'Sal' },
      { name: 'Çarşamba', short: 'Çar' },
      { name: 'Perşembe', short: 'Per' },
      { name: 'Cuma', short: 'Cum' },
      { name: 'Cumartesi', short: 'Cmt' },
      { name: 'Pazar', short: 'Paz' },
    ];

    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    return dayLabels.map((lbl, idx) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + idx);
      const isoStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return {
        dateStr: isoStr,
        dayNumber: dt.getDate(),
        monthNumber: dt.getMonth() + 1,
        shortName: lbl.short,
        fullName: lbl.name,
        isToday: isoStr === todayStr,
        isSelected: isoStr === selectedCoverDate,
        dayId: idx + 1
      };
    });
  }, [selectedCoverDate]);

  const toggleExpandAbsentTeacher = (teacher: string) => {
    setExpandedAbsentTeachers(prev => ({
      ...prev,
      [teacher]: !prev[teacher]
    }));
  };

  const formattedCoverDateDisplay = React.useMemo(() => {
    if (!selectedCoverDate) return '';
    const [y, m, d] = selectedCoverDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return `${d} ${months[m - 1]} ${y}, ${days[dt.getDay()]}`;
  }, [selectedCoverDate]);

  const isSelectedCoverDateToday = React.useMemo(() => {
    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    return selectedCoverDate === todayStr;
  }, [selectedCoverDate]);

  const vacantLessonsForDay = React.useMemo(() => {
    if (coverDayScheduleIdx < 0 || !coverDay) return [];
    const absentTeachers = teachers.filter(t => (teacherStatuses[`${selectedCoverDate}_${t}`] || 'aktif') !== 'aktif');
    const periodsCount = coverDay.periods || 8;
    const list: Array<{
      teacher: string;
      status: string;
      pIdx: number;
      periodNumber: number;
      lessonInfo: string;
      subject: string;
      classes: string;
      key: string;
      covering: string;
    }> = [];

    absentTeachers.forEach(absentTeacher => {
      const hasSched = schedules[absentTeacher]?.[coverDayScheduleIdx];
      if (hasSched) {
        for (let pIdx = 0; pIdx < periodsCount; pIdx++) {
          const hasLesson = hasSched[pIdx];
          if (isActualLesson(hasLesson)) {
            let lessonInfo = '';
            let subject = '';
            let classes = '';
            if (typeof hasLesson === 'string') {
              try {
                const card = JSON.parse(hasLesson);
                classes = card.classes?.join(', ') || '';
                subject = card.subject || '';
                lessonInfo = `${classes} ${subject}`.trim();
              } catch (e) {
                subject = hasLesson;
                lessonInfo = hasLesson;
              }
            }
            const key = `${selectedCoverDate}_${absentTeacher}_${pIdx}`;
            list.push({
              teacher: absentTeacher,
              status: teacherStatuses[`${selectedCoverDate}_${absentTeacher}`] || 'İzinli',
              pIdx,
              periodNumber: pIdx + 1,
              lessonInfo,
              subject,
              classes,
              key,
              covering: coverAssignments[key] || ''
            });
          }
        }
      }
    });

    list.sort((a, b) => a.pIdx - b.pIdx || a.teacher.localeCompare(b.teacher));
    return list;
  }, [selectedCoverDate, teacherStatuses, coverAssignments, coverDay, coverDayScheduleIdx, schedules, teachers]);

  // Auto-save on change
  useEffect(() => {
    localStorage.setItem('ataturk_duty_locations', JSON.stringify(dutyLocations));
  }, [dutyLocations]);

  useEffect(() => {
    localStorage.setItem('ataturk_duty_assignments', JSON.stringify(dutyAssignments));
  }, [dutyAssignments]);

  useEffect(() => {
    localStorage.setItem('ataturk_exempt_teachers', JSON.stringify(exemptTeachers));
  }, [exemptTeachers]);

  useEffect(() => {
    localStorage.setItem('ataturk_duty_admins', JSON.stringify(dutyAdmins));
  }, [dutyAdmins]);

  useEffect(() => {
    localStorage.setItem('ataturk_admin_schedule', JSON.stringify(adminSchedule));
  }, [adminSchedule]);

  useEffect(() => {
    localStorage.setItem('ataturk_admin_roles', JSON.stringify(adminRoles));
  }, [adminRoles]);

  useEffect(() => {
    localStorage.setItem('ataturk_general_rules', generalRules);
  }, [generalRules]);

  useEffect(() => {
    localStorage.setItem('ataturk_attention_rules', attentionRules);
  }, [attentionRules]);

  useEffect(() => {
    localStorage.setItem('ataturk_principal_name', principalName);
  }, [principalName]);

  useEffect(() => {
    localStorage.setItem('ataturk_principal_title', principalTitle);
  }, [principalTitle]);

  useEffect(() => {
    localStorage.setItem('ataturk_teacher_statuses', JSON.stringify(teacherStatuses));
  }, [teacherStatuses]);

  useEffect(() => {
    localStorage.setItem('ataturk_cover_assignments', JSON.stringify(coverAssignments));
  }, [coverAssignments]);

  useEffect(() => {
    localStorage.setItem('ataturk_duty_academic_start_date', academicYearStartDate);
  }, [academicYearStartDate]);

  const handleSaveAll = () => {
    setIsSaving(true);
    try {
      // 1. Tüm modüler localStorage anahtarlarını eksiksiz güncelle
      localStorage.setItem('ataturk_duty_locations', JSON.stringify(dutyLocations));
      localStorage.setItem('ataturk_duty_assignments', JSON.stringify(dutyAssignments));
      localStorage.setItem('ataturk_exempt_teachers', JSON.stringify(exemptTeachers));
      localStorage.setItem('ataturk_duty_admins', JSON.stringify(dutyAdmins));
      localStorage.setItem('ataturk_admin_schedule', JSON.stringify(adminSchedule));
      localStorage.setItem('ataturk_admin_roles', JSON.stringify(adminRoles));
      localStorage.setItem('ataturk_general_rules', generalRules);
      localStorage.setItem('ataturk_attention_rules', attentionRules);
      localStorage.setItem('ataturk_principal_name', principalName);
      localStorage.setItem('ataturk_principal_title', principalTitle);
      localStorage.setItem('ataturk_teacher_statuses', JSON.stringify(teacherStatuses));
      localStorage.setItem('ataturk_cover_assignments', JSON.stringify(coverAssignments));
      localStorage.setItem('ataturk_duty_print_start', printStartDate);
      localStorage.setItem('ataturk_duty_print_end', printEndDate);
      localStorage.setItem('ataturk_duty_academic_start_date', academicYearStartDate);
      localStorage.setItem('ataturk_duty_rotate_teachers', String(rotateTeachers));
      localStorage.setItem('ataturk_duty_alternate_admins', String(alternateAdmins));
      localStorage.setItem('ataturk_duty_show_weekends', String(showWeekends));
      localStorage.setItem('ataturk_duty_mark_holidays', String(markHolidays));
      localStorage.setItem('ataturk_duty_user_holidays', JSON.stringify(userHolidays));
      localStorage.setItem('ataturk_duty_print_fontsize', printFontSize);
      localStorage.setItem('ataturk_duty_print_orientation', printOrientation);
      localStorage.setItem('ataturk_duty_print_pagesize', printPageSize);
      localStorage.setItem('ataturk_duty_print_margin', printMargin);
      localStorage.setItem('ataturk_duty_print_rows_per_page', String(printRowsPerPage));

      // 2. Birleşik Tam Nöbet JSON Yedeğini oluştur
      const dutyBackupObject = {
        meta: {
          app: 'Kuantum Pro Nöbet Asistanı',
          version: '2.0',
          updatedAt: new Date().toISOString(),
          dateFormatted: new Date().toLocaleString('tr-TR'),
          totalLocations: dutyLocations.length,
          totalAdmins: dutyAdmins.length,
          totalExempt: exemptTeachers.length,
          totalAssignments: Object.values(dutyAssignments).reduce((s: number, arr: any) => s + (Array.isArray(arr) ? arr.length : 0), 0)
        },
        locations: dutyLocations,
        assignments: dutyAssignments,
        exemptTeachers,
        admins: dutyAdmins,
        adminSchedule,
        adminRoles,
        generalRules,
        attentionRules,
        userHolidays,
        principal: {
          name: principalName,
          title: principalTitle
        },
        teacherStatuses,
        coverAssignments,
        printSettings: {
          printStartDate,
          printEndDate,
          rotateTeachers,
          alternateAdmins,
          showWeekends,
          markHolidays
        }
      };

      // 3. JSON yedeğine işle
      localStorage.setItem('ataturk_duty_backup_json', JSON.stringify(dutyBackupObject, null, 2));

      // 4. Global yedekleme olayını tetikle (App.tsx ve dış bileşenlerle senkronizasyon)
      window.dispatchEvent(new CustomEvent('ataturk_duty_saved', { detail: dutyBackupObject }));

      setJustSaved(true);
      setSuccessMessage('Tüm nöbet ayarları, çizelgeler ve idareci planlaması başarıyla kaydedildi; JSON yedeğine işlendi!');
      setTimeout(() => setJustSaved(false), 2500);
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      console.error('Nöbet kayıt hatası:', err);
      setErrorMessage('Kayıt işlemi sırasında bir hata oluştu.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const addLocation = () => {
    if (newLoc.trim() && !dutyLocations.includes(newLoc.trim().toUpperCase())) {
      setDutyLocations([...dutyLocations, newLoc.trim().toUpperCase()]);
      setNewLoc('');
    }
  };

  const quickAddLocation = (locName: string) => {
    const trimmed = locName.trim().toUpperCase();
    if (trimmed && !dutyLocations.includes(trimmed)) {
      setDutyLocations([...dutyLocations, trimmed]);
      setSuccessMessage(`"${trimmed}" nöbet bölgesi olarak eklendi.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const moveLocationUp = (index: number) => {
    if (index <= 0) return;
    const next = [...dutyLocations];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setDutyLocations(next);
  };

  const moveLocationDown = (index: number) => {
    if (index >= dutyLocations.length - 1) return;
    const next = [...dutyLocations];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setDutyLocations(next);
  };

  const removeLocation = (loc: string) => {
    setDutyLocations(dutyLocations.filter(l => l !== loc));
    // Clean assignments for this location
    const nextAssignments = { ...dutyAssignments };
    activeDays.forEach(day => {
      delete nextAssignments[`${loc}_${day.id}`];
    });
    setDutyAssignments(nextAssignments);
  };

  const renameLocation = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim().toUpperCase();
    if (!trimmedNew || trimmedNew === oldName) return;
    if (dutyLocations.includes(trimmedNew)) {
      return;
    }
    setDutyLocations(dutyLocations.map(l => l === oldName ? trimmedNew : l));
    const nextAssignments = { ...dutyAssignments };
    activeDays.forEach(day => {
       const oldKey = `${oldName}_${day.id}`;
       const newKey = `${trimmedNew}_${day.id}`;
       if (nextAssignments[oldKey] !== undefined) {
          nextAssignments[newKey] = nextAssignments[oldKey];
          delete nextAssignments[oldKey];
       }
    });
    setDutyAssignments(nextAssignments);
  };

  const toggleExemption = (teacher: string) => {
    if (exemptTeachers.includes(teacher)) {
      setExemptTeachers(exemptTeachers.filter(t => t !== teacher));
    } else {
      setExemptTeachers([...exemptTeachers, teacher]);
      // Remove this teacher from any current assignments
      const nextAssignments = { ...dutyAssignments };
      Object.keys(nextAssignments).forEach(key => {
        nextAssignments[key] = (nextAssignments[key] || []).filter((t: string) => t !== teacher);
      });
      setDutyAssignments(nextAssignments);
    }
  };

  const clearAllExemptions = () => {
    if (exemptTeachers.length === 0) return;
    setExemptTeachers([]);
    setSuccessMessage("Tüm nöbet muafiyetleri kaldırıldı.");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetDefaultGeneralRules = () => {
    const defaultRules = `1- Günlük vakit çizelgesini uygulamak;
2- Öğretmenlerin derslerine zamanında girip girmediğini izlemek, öğretmeni gelmeyen sınıfları okul yönetimine bildirmek ve bu sınıflara nezaret etmek;
3- Isıtma, elektrik ve sıhhi tesisatların çalışıp çalışmadığının, okul içi temizliğin yapılıp yapılmadığının, okul bina ve tesislerinin yangından koruma önlemlerinin alınıp alınmadığının kontrollerini yapmak. Görülen aksaklıkları idareye bildirmek;
4- Bahçedeki, koridorlardaki ve sınıflardaki öğrencileri gözetlemek;
5- Beklenmedik olaylar karşısında gerekli tedbirleri almak ve bu durumu ilgililere bildirmek;
6- Nöbet süresince okulun eğitim öğretim disiplin gibi çeşitli işlerini izlemek bu hususlarda günlük tedbirleri almak;
7- Nöbet sonunda okul nöbet defterine nöbet süresi içerisinde önemli olayları ve aldığı tedbirleri belirten raporu yazmak.`;
    setGeneralRules(defaultRules);
    localStorage.setItem('ataturk_general_rules', defaultRules);
    setSuccessMessage("Genel nöbet kuralları MEB standartlarına sıfırlandı.");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetDefaultAttentionRules = () => {
    const defaultAttn = `1- Nöbet görevi SABAH 08.15 de başlar, ÖĞLEDEN SONRA 16.00'da bütün öğrenciler okuldan çıktıktan sonra biter.
2- NÖBETÇİ ÖĞRETMENLER KENDİ ARALARINDA (idareye bilgi vermek suretiyle) YER DEĞİŞİKLİĞİ YAPABİLİRLER (Örn: 1. KAT ile 3. KAT gibi).
3- NÖBETÇİ ÖĞRETMENLER ÖĞLE TATİLİNDE NÖBET YERLERİNDEN SORUMLUDURLAR (3 nöbetçi okulda bulunacak şekilde dönüşümlü mola verilebilir).
4- NÖBET ESNASINDA ÖĞRENCİLERİN İDAREDEN ALINAN RESMİ İZİN DIŞINDA OKUL BAHÇESİNDEN ÇIKMASINA İZİN VERİLMEYECEKTİR.
5- Nöbetçi öğretmenin eksik olduğu durumlarda okul güvenliğini tehlikeye atmamak adına başka bir öğretmen nöbetçi olarak görevlendirilebilir.`;
    setAttentionRules(defaultAttn);
    localStorage.setItem('ataturk_attention_rules', defaultAttn);
    setSuccessMessage("Dikkat edilecek hususlar varsayılana sıfırlandı.");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const addAdmin = () => {
    const trimmed = newAdmin.trim();
    if (trimmed && !dutyAdmins.some(a => a.trim().toLowerCase() === trimmed.toLowerCase())) {
      setDutyAdmins([...dutyAdmins, trimmed]);
      setAdminRoles(prev => ({ ...prev, [trimmed]: prev[trimmed] || 'Müdür Yardımcısı' }));
      setNewAdmin('');
      setSuccessMessage(`${trimmed} idareci kadrosuna eklendi.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const removeAdmin = (adminName: string) => {
    const trimmed = adminName.trim();
    setDutyAdmins(dutyAdmins.filter(a => a.trim().toLowerCase() !== trimmed.toLowerCase()));
    // Clean schedule of this admin
    const nextSched = { ...adminSchedule };
    Object.keys(nextSched).forEach(dayId => {
      if (nextSched[dayId]?.trim().toLowerCase() === trimmed.toLowerCase()) {
        delete nextSched[dayId];
      }
    });
    setAdminSchedule(nextSched);
    setSuccessMessage(`${trimmed} idareci kadrosundan çıkarıldı.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const toggleTeacherAdmin = (teacherName: string, defaultRole: string = 'Müdür Yardımcısı') => {
    const trimmed = teacherName.trim();
    const isCurrentlyAdmin = dutyAdmins.some(a => a.trim().toLowerCase() === trimmed.toLowerCase());
    
    if (isCurrentlyAdmin) {
      removeAdmin(trimmed);
    } else {
      setDutyAdmins([...dutyAdmins, trimmed]);
      setAdminRoles(prev => ({
        ...prev,
        [trimmed]: prev[trimmed] || defaultRole
      }));
      setSuccessMessage(`${trimmed} idareci kadrosuna tanımlandı (${adminRoles[trimmed] || defaultRole}).`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const updateTeacherAdminRole = (teacherName: string, newRole: string) => {
    const trimmed = teacherName.trim();
    setAdminRoles(prev => {
      const nextRoles = { ...prev };
      if (newRole === 'Okul Müdürü') {
        Object.keys(nextRoles).forEach(k => {
          if (nextRoles[k] === 'Okul Müdürü' && k !== trimmed) {
            nextRoles[k] = 'Müdür Yardımcısı';
          }
        });
      }
      nextRoles[trimmed] = newRole;
      return nextRoles;
    });

    if (newRole === 'Okul Müdürü') {
      setPrincipalName(trimmed);
      setPrincipalTitle('Okul Müdürü');
      // Okul Müdürü nöbet tutmaz; idareci nöbet çizelgesindeki atamaları temizlenir
      setAdminSchedule(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(dayId => {
          const numDayId = Number(dayId);
          if (next[numDayId]?.trim().toLowerCase() === trimmed.toLowerCase()) {
            delete next[numDayId];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
      setSuccessMessage(`${trimmed} Okul Müdürü olarak seçildi (nöbetten muaf) ve otomatik olarak Resmi İmza Yetkilisi olarak tanımlandı.`);
    } else {
      if (principalName === trimmed) {
        const otherDirector = dutyAdmins.find(a => a !== trimmed && adminRoles[a] === 'Okul Müdürü');
        if (otherDirector) {
          setPrincipalName(otherDirector);
          setPrincipalTitle('Okul Müdürü');
        }
      }
      setSuccessMessage(`${trimmed} için idareci rolü "${newRole}" olarak güncellendi.`);
    }

    if (!dutyAdmins.some(a => a.trim().toLowerCase() === trimmed.toLowerCase())) {
      setDutyAdmins([...dutyAdmins, trimmed]);
    }
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Sadece müdür yardımcıları idareci nöbeti tutar; Okul Müdürü nöbet tutmaz
  const eligibleDutyAdmins = React.useMemo(() => {
    return dutyAdmins.filter(adm => {
      const role = adminRoles[adm] || '';
      const isPrincipal = role === 'Okul Müdürü' || (Boolean(principalName) && adm.trim().toLowerCase() === principalName.trim().toLowerCase());
      return !isPrincipal;
    });
  }, [dutyAdmins, adminRoles, principalName]);

  const currentPrincipalAdmin = React.useMemo(() => {
    return dutyAdmins.find(adm => {
      const role = adminRoles[adm] || '';
      return role === 'Okul Müdürü' || (Boolean(principalName) && adm.trim().toLowerCase() === principalName.trim().toLowerCase());
    }) || (principalName ? principalName : null);
  }, [dutyAdmins, adminRoles, principalName]);

  const handleSequentialAdmins = () => {
    if (eligibleDutyAdmins.length === 0) {
      setErrorMessage("Nöbet tutacak müdür yardımcısı bulunamadı. Okul müdürü nöbet tutmaz. Lütfen sol taraftan müdür yardımcısı tanımlayınız.");
      setTimeout(() => setErrorMessage(''), 4500);
      return;
    }

    let orderedAdmins = [...eligibleDutyAdmins];
    if (adminStartTeacher && orderedAdmins.includes(adminStartTeacher)) {
      const sIdx = orderedAdmins.indexOf(adminStartTeacher);
      orderedAdmins = [...orderedAdmins.slice(sIdx), ...orderedAdmins.slice(0, sIdx)];
    }

    const nextSched = { ...adminSchedule };
    activeDays.forEach((day, idx) => {
      nextSched[day.id] = orderedAdmins[idx % orderedAdmins.length];
    });
    setAdminSchedule(nextSched);
    setSuccessMessage(`${orderedAdmins.length} müdür yardımcısı ${activeDays.length} iş gününe sırayla başarıyla atandı!`);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleClearAdminSchedule = () => {
    if (Object.keys(adminSchedule).length === 0) return;
    setAdminSchedule({});
    setSuccessMessage("Günlük idareci nöbet atamaları temizlendi.");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const allStaffList = React.useMemo(() => {
    const list = [...teachers];
    dutyAdmins.forEach(adm => {
      if (!list.some(t => t.trim().toLowerCase() === adm.trim().toLowerCase())) {
        list.push(adm);
      }
    });
    return list.sort((a, b) => a.localeCompare(b, 'tr'));
  }, [teachers, dutyAdmins]);

  const filteredStaffList = React.useMemo(() => {
    let result = allStaffList;
    if (adminSearch.trim()) {
      const q = adminSearch.trim().toLowerCase();
      result = result.filter(person => person.toLowerCase().includes(q));
    }
    if (adminFilter === 'admins') {
      result = result.filter(person => dutyAdmins.some(a => a.trim().toLowerCase() === person.trim().toLowerCase()));
    } else if (adminFilter === 'teachers') {
      result = result.filter(person => !dutyAdmins.some(a => a.trim().toLowerCase() === person.trim().toLowerCase()));
    }
    return result;
  }, [allStaffList, adminSearch, adminFilter, dutyAdmins]);

  const isTeacherAdmin = (t: string) => {
    if (!t) return false;
    const tNorm = t.trim().toLowerCase();
    return (
      dutyAdmins.some((a: string) => a.trim().toLowerCase() === tNorm) ||
      (Boolean(principalName) && principalName.trim().toLowerCase() === tNorm) ||
      Boolean(adminRoles[t] || Object.entries(adminRoles).some(([k, r]) => k.trim().toLowerCase() === tNorm && r)) ||
      Object.values(adminSchedule).some((a: any) => typeof a === 'string' && a.trim().toLowerCase() === tNorm)
    );
  };

  // Automatically clean up any dutyAdmins from location assignments if they were assigned
  useEffect(() => {
    let hasAdminInLocations = false;
    const cleaned = { ...dutyAssignments };
    Object.keys(cleaned).forEach(key => {
      const assigned = cleaned[key] || [];
      const withoutAdmins = assigned.filter(t => !isTeacherAdmin(t));
      if (withoutAdmins.length !== assigned.length) {
        hasAdminInLocations = true;
        cleaned[key] = withoutAdmins;
      }
    });
    if (hasAdminInLocations) {
      setDutyAssignments(cleaned);
    }
  }, [dutyAdmins, adminSchedule]);

  const toggleAssignment = (loc: string, dayId: number, teacher: string) => {
    const key = `${loc}_${dayId}`;
    const current = dutyAssignments[key] || [];
    let next;
    if (current.includes(teacher)) {
      next = current.filter(t => t !== teacher);
    } else {
      if (isTeacherAdmin(teacher)) {
        setErrorMessage(`${teacher} nöbetçi idareci olarak tanımlanmıştır. Nöbetçi idareciler tanımlanmış nöbet yerlerinde nöbet tutamaz.`);
        setTimeout(() => setErrorMessage(''), 4500);
        return;
      }
      next = [...current, teacher];
    }
    setDutyAssignments({ ...dutyAssignments, [key]: next });
  };

  const removeAssignment = (loc: string, dayId: number, teacher: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleAssignment(loc, dayId, teacher);
  };

  const getLessonCount = (teacher: string, dIdx: number) => {
    let count = 0;
    const day = activeDays[dIdx];
    const schedIdx = day ? (Number(day.id) - 1) : -1;
    if (day && schedIdx >= 0 && schedules[teacher]?.[schedIdx]) {
      for (let p = 0; p < day.periods; p++) {
        if (isActualLesson(schedules[teacher][schedIdx][p])) count++;
      }
    }
    return count;
  };

  const hasAnyLessons = (teacher: string) => {
    const teacherSched = schedules[teacher];
    if (!teacherSched) return false;
    return teacherSched.some((daySched: any) => daySched && daySched.some((p: any) => isActualLesson(p)));
  };

  const getWeeklyDutyCount = (teacher: string) => {
    let count = 0;
    Object.values(dutyAssignments).forEach((assignedTeachers: any) => {
       if (assignedTeachers.includes(teacher)) count++;
    });
    return count;
  };

  // Check if teacher has lessons at all this week
  const teachersWithLessons = teachers.filter(t => hasAnyLessons(t));

  // Intelligent Automatic Assignment Algorithm
  const handleAutoAssign = () => {
    const newAssignments = {};
    
    // Eligible teachers are those who have lessons this week, are not exempt, and are NOT duty admins
    const eligibleTeachers = teachers.filter(t => {
      if (isTeacherAdmin(t)) return false;
      const tNorm = t.trim().toLowerCase();
      if (exemptTeachers.some(e => e.trim().toLowerCase() === tNorm)) return false;
      return hasAnyLessons(t);
    });
    
    if (eligibleTeachers.length === 0) {
      setErrorMessage("Nöbet dağıtımı yapılacak uygun öğretmen bulunamadı! (Tüm öğretmenler muaf, idareci veya haftalık ders programları boş)");
      setTimeout(() => setErrorMessage(''), 4500);
      return;
    }

    // Initialize assignment counts
    const teacherDutyCounts = {};
    eligibleTeachers.forEach(t => {
      teacherDutyCounts[t] = 0;
    });

    // Strategy: Assign exactly 1 teacher per cell, prioritizing those with 3-4 lessons, 
    // and ensuring everyone gets at least 1 duty if possible.
    
    // First, map out cells to assign
    const cells: Array<{loc: string, day: any, dIdx: number}> = [];
    dutyLocations.forEach(loc => {
      activeDays.forEach((day, dIdx) => {
        cells.push({ loc, day, dIdx });
      });
    });

    // Shuffle cells to avoid bias toward the first location/day
    const shuffledCells = [...cells].sort(() => Math.random() - 0.5);

    shuffledCells.forEach(({ loc, day, dIdx }) => {
      const key = `${loc}_${day.id}`;
      if (!newAssignments[key]) newAssignments[key] = [];

      // Find candidates who have lessons on this day, not assigned elsewhere on this same day, and not exempt
      let candidates = eligibleTeachers.filter(t => {
        const lessonsToday = getLessonCount(t, dIdx);
        if (lessonsToday === 0) return false; // Must have lessons on that day to be on duty

        // Avoid multiple assignments on the same day
        const alreadyAssignedToday = dutyLocations.some(l => (newAssignments[`${l}_${day.id}`] || []).includes(t));
        return !alreadyAssignedToday;
      });

      if (candidates.length > 0) {
        // Prioritize:
        // 1. Teachers with 0 duties so far
        // 2. Teachers with "Recommended" (3-4) lessons today
        // 3. Lowest current weekly duty count
        candidates.sort((a, b) => {
          const countA = teacherDutyCounts[a];
          const countB = teacherDutyCounts[b];

          // Priority 1: Has 0 duties currently vs has duties
          if (countA === 0 && countB > 0) return -1;
          if (countB === 0 && countA > 0) return 1;

          // Priority 2: Recommended lesson count (3-4 lessons)
          const lessonsA = getLessonCount(a, dIdx);
          const lessonsB = getLessonCount(b, dIdx);
          const recA = lessonsA >= 3 && lessonsA <= 4;
          const recB = lessonsB >= 3 && lessonsB <= 4;

          if (recA && !recB) return -1;
          if (recB && !recA) return 1;

          // Priority 3: Lowest current duty count
          return countA - countB;
        });

        // Pick the best candidate
        const selected = candidates[0];
        newAssignments[key].push(selected);
        teacherDutyCounts[selected]++;
      }
    });

    setDutyAssignments(newAssignments);
    setSuccessMessage('Nöbet çizelgesi kurallara göre otomatik olarak dağıtıldı!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleClearAssignments = () => {
    if (confirm("Mevcut tüm nöbet dağıtımlarını silmek istediğinize emin misiniz?")) {
      setDutyAssignments({});
    }
  };

  const handleAutoAssignCovers = (overrideStatuses?: Record<string, string>, targetTeacher?: string) => {
    if (!selectedCoverDate) {
      setErrorMessage("Lütfen geçerli bir tarih seçin.");
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const dayId = getSelectedCoverDayId();
    if (dayId === -1) {
      setErrorMessage("Geçersiz tarih seçildi.");
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const curCoverDay = (schoolSettings?.weekDays || []).find((d: any) => Number(d.id) === Number(dayId)) || 
                        activeDays.find(d => Number(d.id) === Number(dayId));
    if (!curCoverDay) {
      setErrorMessage("Seçili gün okul haftalık çalışma günleri arasında bulunamadı.");
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const schedDayIdx = Number(curCoverDay.id) - 1;
    if (schedDayIdx < 0) {
      setErrorMessage("Ders programı günü hesaplanamadı.");
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const statusesToUse = { ...(overrideStatuses || teacherStatuses) };

    // If a specific target teacher is requested, ensure they are marked absent (default to 'izinli' if still 'aktif')
    if (targetTeacher) {
      const curStat = statusesToUse[`${selectedCoverDate}_${targetTeacher}`] || 'aktif';
      if (curStat === 'aktif') {
        statusesToUse[`${selectedCoverDate}_${targetTeacher}`] = 'izinli';
        setTeacherStatuses(prev => ({
          ...prev,
          [`${selectedCoverDate}_${targetTeacher}`]: 'izinli'
        }));
      }
    }

    // Determine candidate absent teachers to process
    let teachersToProcess: string[] = [];
    if (targetTeacher) {
      teachersToProcess = [targetTeacher];
    } else if (selectedTeacherForCover && selectedTeacherForCover !== 'ALL') {
      teachersToProcess = [selectedTeacherForCover];
      const curStat = statusesToUse[`${selectedCoverDate}_${selectedTeacherForCover}`] || 'aktif';
      if (curStat === 'aktif') {
        statusesToUse[`${selectedCoverDate}_${selectedTeacherForCover}`] = 'izinli';
        setTeacherStatuses(prev => ({
          ...prev,
          [`${selectedCoverDate}_${selectedTeacherForCover}`]: 'izinli'
        }));
      }
    } else {
      teachersToProcess = teachers.filter(t => (statusesToUse[`${selectedCoverDate}_${t}`] || 'aktif') !== 'aktif');

      // If no teacher is currently marked absent, check if searchQuery exactly matches a teacher
      if (teachersToProcess.length === 0) {
        const queryTrimmed = searchQuery.trim().toLowerCase();
        if (queryTrimmed) {
          const matched = teachers.find(t => t.toLowerCase() === queryTrimmed);
          if (matched) {
            teachersToProcess = [matched];
            statusesToUse[`${selectedCoverDate}_${matched}`] = 'izinli';
            setTeacherStatuses(prev => ({ ...prev, [`${selectedCoverDate}_${matched}`]: 'izinli' }));
          }
        }
      }

      if (teachersToProcess.length === 0) {
        setErrorMessage("Atama yapılacak izinli/raporlu öğretmen bulunamadı. Lütfen yukarıdan personel seçin veya listeden durumunu 'Raporlu/İzinli' olarak belirleyin.");
        setTimeout(() => setErrorMessage(''), 4500);
        return;
      }
    }

    // Collect duty teachers for this day
    const dutyDayId = curCoverDay.id;
    const dutyTeachersForDay = Array.from(new Set([
      ...dutyLocations.flatMap((loc: string) => dutyAssignments[`${loc}_${dutyDayId}`] || []),
      ...Object.entries(dutyAssignments)
        .filter(([k]) => k.endsWith(`_${dutyDayId}`))
        .flatMap(([, list]) => (Array.isArray(list) ? list : []))
    ])).filter(t => t && teachers.includes(t));

    const dutyAdminForDay = adminSchedule[dutyDayId] ? `${adminSchedule[dutyDayId]} (İdareci)` : null;

    if (dutyTeachersForDay.length === 0 && !dutyAdminForDay) {
      setErrorMessage(`${curCoverDay.name} günü için atanmış nöbetçi öğretmen veya idareci bulunamadı. Lütfen 'Nöbet Dağıtım Çizelgesi' sekmesinden nöbetçileri belirleyin.`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const newCovers = { ...coverAssignments };

    // Initialize counts for fair distribution across duty teachers
    const coverCounts: Record<string, number> = {};
    dutyTeachersForDay.forEach(t => { coverCounts[t] = 0; });
    if (dutyAdminForDay) coverCounts[dutyAdminForDay] = 0;

    // Pre-calculate counts from existing assignments for this day
    Object.keys(newCovers).forEach(key => {
      if (key.startsWith(`${selectedCoverDate}_`)) {
        const assigned = newCovers[key];
        if (assigned && coverCounts[assigned] !== undefined) {
          coverCounts[assigned]++;
        }
      }
    });

    let assignedCount = 0;
    let totalLessonsCount = 0;
    let noDutyAvailableCount = 0;
    const maxPeriods = curCoverDay.periods || 8;

    teachersToProcess.forEach(teacher => {
      const teacherSched = schedules[teacher]?.[schedDayIdx];
      if (!teacherSched) return;

      for (let pIdx = 0; pIdx < maxPeriods; pIdx++) {
        const lessonCell = teacherSched[pIdx];
        if (isActualLesson(lessonCell)) {
          totalLessonsCount++;
          const key = `${selectedCoverDate}_${teacher}_${pIdx}`;

          // Find free duty teachers for this period
          const freeDutyTeachers = dutyTeachersForDay.filter(dt => {
            // Cannot cover self
            if (dt === teacher) return false;

            // Duty teacher must be active today
            const dtStatus = statusesToUse[`${selectedCoverDate}_${dt}`] || 'aktif';
            if (dtStatus !== 'aktif') return false;

            // Duty teacher must NOT have a lesson in their own schedule in this period
            const ownLesson = schedules[dt]?.[schedDayIdx]?.[pIdx];
            if (ownLesson && isActualLesson(ownLesson)) return false;

            // Duty teacher must NOT already be assigned to cover another class in this period
            const isAlreadyCovering = Object.entries(newCovers).some(([k, val]) => {
              return k.startsWith(`${selectedCoverDate}_`) && k.endsWith(`_${pIdx}`) && val === dt && k !== key;
            });
            if (isAlreadyCovering) return false;

            return true;
          });

          if (freeDutyTeachers.length > 0) {
            // Sort by:
            // 1. Least covers today (fair distribution)
            // 2. Least total weekly duties
            freeDutyTeachers.sort((a, b) => {
              const diffCovers = (coverCounts[a] || 0) - (coverCounts[b] || 0);
              if (diffCovers !== 0) return diffCovers;
              return getWeeklyDutyCount(a) - getWeeklyDutyCount(b);
            });

            const selected = freeDutyTeachers[0];
            newCovers[key] = selected;
            coverCounts[selected] = (coverCounts[selected] || 0) + 1;
            assignedCount++;
          } else if (dutyAdminForDay) {
            const isAdminCovering = Object.entries(newCovers).some(([k, val]) => {
              return k.startsWith(`${selectedCoverDate}_`) && k.endsWith(`_${pIdx}`) && val === dutyAdminForDay && k !== key;
            });
            if (!isAdminCovering) {
              newCovers[key] = dutyAdminForDay;
              coverCounts[dutyAdminForDay] = (coverCounts[dutyAdminForDay] || 0) + 1;
              assignedCount++;
            } else {
              noDutyAvailableCount++;
            }
          } else {
            noDutyAvailableCount++;
          }
        }
      }
    });

    setCoverAssignments(newCovers);

    if (totalLessonsCount === 0) {
      setErrorMessage(`${teachersToProcess.length === 1 ? teachersToProcess[0] : 'Seçilen personellerin'} bugün (${curCoverDay.name}) yerleşmiş dersi bulunmuyor.`);
      setTimeout(() => setErrorMessage(''), 4000);
    } else if (assignedCount > 0) {
      if (noDutyAvailableCount > 0) {
        setSuccessMessage(`${assignedCount} derse uygun boş nöbetçi öğretmen atandı (${noDutyAvailableCount} derste tüm nöbetçilerin dersi dolu olduğu için atanamadı).`);
      } else {
        const msgPrefix = teachersToProcess.length === 1 ? `${teachersToProcess[0]} için ` : '';
        setSuccessMessage(`${msgPrefix}${assignedCount} boş derse o saatte dersi olmayan nöbetçi öğretmenler dengeli olarak yerleştirildi!`);
      }
      setTimeout(() => setSuccessMessage(''), 4500);
    } else {
      setErrorMessage(`Dersi boş olan nöbetçi öğretmen bulunamadı! Nöbetçi öğretmenlerin bu ders saatlerinde kendi dersleri bulunmaktadır.`);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handlePrintCoverReport = () => {
    const list = [];
    Object.keys(coverAssignments).forEach(key => {
      if (key.startsWith(`${selectedCoverDate}_`)) {
        const parts = key.split('_');
        if (parts.length >= 3) {
          const teacher = parts[1];
          const pIdx = parseInt(parts[2], 10);
          const assigned = coverAssignments[key];
          if (assigned) {
            const hasLesson = coverDayScheduleIdx >= 0 ? schedules[teacher]?.[coverDayScheduleIdx]?.[pIdx] : null;
            let lessonInfo = '';
            let subjectInfo = '';
            if (isActualLesson(hasLesson)) {
              try {
                const card = JSON.parse(hasLesson);
                lessonInfo = card.classes?.join(', ') || '';
                subjectInfo = card.subject || '';
              } catch(e) {
                lessonInfo = '';
                subjectInfo = hasLesson;
              }
            }
            list.push({
              absentTeacher: teacher,
              status: teacherStatuses[`${selectedCoverDate}_${teacher}`] || 'Görevli/Raporlu',
              period: pIdx + 1,
              classes: lessonInfo,
              subject: subjectInfo,
              assigned
            });
          }
        }
      }
    });

    if (list.length === 0) {
      alert("Seçili tarihte henüz boş ders ataması yapılmamış!");
      return;
    }

    // Sort by period, then absent teacher
    list.sort((a, b) => {
      if (a.period !== b.period) return a.period - b.period;
      return a.absentTeacher.localeCompare(b.absentTeacher, 'tr');
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Yeni sekme açılamadı! Lütfen açılır pencerelere izin verin.");
      return;
    }

    const formattedDate = getFormattedDate(selectedCoverDate);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>Boş Ders Atama Raporu - ${selectedCoverDate}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #000;
            background-color: #fff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .header h1 {
            font-size: 16px;
            margin: 0;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          .header h2 {
            font-size: 12px;
            margin: 5px 0 0 0;
            color: #374151;
            font-weight: 700;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-weight: bold;
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px 10px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10px;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .text-center {
            text-align: center;
          }
          .signature-container {
            margin-top: 50px;
            display: flex;
            justify-content: flex-end;
          }
          .signature-box {
            width: 200px;
            text-align: center;
          }
          .signature-name {
            font-weight: 800;
            font-size: 12px;
          }
          .signature-title {
            font-weight: 700;
            font-size: 11px;
            margin-top: 2px;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            border: 1px solid #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>T.C.</h1>
          <h1>MİLLÎ EĞİTİM BAKANLIĞI</h1>
          <h2>ATATÜRK ORTAOKULU MÜDÜRLÜĞÜ</h2>
          <h2 style="margin-top: 15px; font-weight: 800;">GÜNLÜK VEKALET / BOŞ DERS ATAMA RAPORU</h2>
        </div>

        <div class="meta-info">
          <div>Tarih: ${formattedDate}</div>
          <div>Toplam Atama Sayısı: ${list.length}</div>
        </div>

        <p>Aşağıda belirtilen tarihte çeşitli mazeretleri (rapor, izin, görev vb.) nedeniyle görevinde bulunamayan öğretmenlerin boş kalan derslerine, okul yönetimi ve nöbetçi öğretmen planlaması çerçevesinde yapılan vekalet / ikame görevlendirmeleri listelenmiştir.</p>

        <table>
          <thead>
            <tr className="transition-colors hover:bg-slate-50/80 touch-manipulation">
              <th style="width: 60px;" class="text-center">Ders Saat</th>
              <th>Gelmeyen Öğretmen</th>
              <th style="width: 100px;">Mazereti</th>
              <th style="width: 80px;" class="text-center">Sınıf</th>
              <th>Ders Adı</th>
              <th>Yerine Derse Giren (Nöbetçi / İdareci)</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(item => `
              <tr className="transition-colors hover:bg-slate-50/80 touch-manipulation">
                <td class="text-center" style="font-weight: bold;">${item.period}. Ders</td>
                <td>${item.absentTeacher}</td>
                <td><span class="badge">${item.status}</span></td>
                <td class="text-center" style="font-weight: bold;">${item.classes || '-'}</td>
                <td>${item.subject || '-'}</td>
                <td style="font-weight: bold;">${item.assigned}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p style="font-size: 10px; font-style: italic; margin-top: 20px;">Yukarıda vekalet atamaları yapılan öğretmenlerin ders görevlerini yerine getirmeleri hususunda; gereğini rica ederim.</p>

        <div class="signature-container">
          <div class="signature-box">
            <div class="signature-name">${principalName}</div>
            <div class="signature-title">${principalTitle}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.focus(); window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const executePrint = (type: string, year: number, month: number, customStartDate?: string, customEndDate?: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Yeni sekme açılamadı! Lütfen açılır pencerelere izin verin.");
      return;
    }

    const dayNamesTR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    const isPrincipal = (name: string) => {
      if (!name) return false;
      const n = name.trim().toLocaleLowerCase('tr-TR');
      if (principalName && n === principalName.trim().toLocaleLowerCase('tr-TR')) return true;
      if (adminRoles[name] === 'Okul Müdürü') return true;
      const role = (adminRoles[name] || '').toLocaleLowerCase('tr-TR');
      if (role.includes('müdür') && !role.includes('yardımc')) return true;
      return false;
    };

    const eligibleDutyAdmins = dutyAdmins.filter(adm => !isPrincipal(adm));

    const marginCss = printMargin === 'compact' ? '3mm 4mm' : (printMargin === 'wide' ? '6mm 8mm' : '4mm 5mm');
    const pageDims = printOrientation === 'portrait' 
      ? (printPageSize === 'A3' ? 'width: 297mm; min-height: 420mm;' : 'width: 210mm; min-height: 297mm;')
      : (printPageSize === 'A3' ? 'width: 420mm; min-height: 297mm;' : 'width: 297mm; min-height: 210mm;');

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>Nöbet Listesi - Atatürk Ortaokulu</title>
        <style>
          @page {
            size: ${printPageSize} ${printOrientation};
            margin: ${marginCss};
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background-color: #fff;
            font-family: 'Segoe UI', Arial, Tahoma, Geneva, Verdana, sans-serif;
            color: #000;
            width: 100%;
            height: 100%;
          }
          .page {
            width: 100%;
            height: 100%;
            max-height: 100%;
            padding: 0;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            page-break-inside: avoid;
            position: relative;
            overflow: hidden;
            background-color: #fff;
          }
          /* Prevent an extra blank page at the very end of printing */
          .page:last-of-type {
            page-break-after: avoid;
          }
          .content-top {
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
          }
          .header {
            text-align: center;
            margin-bottom: 2.5px;
            flex-shrink: 0;
          }
          .header h1 {
            font-size: 11px;
            margin: 0;
            font-weight: 900;
            letter-spacing: 0.4px;
            color: #000;
            text-transform: uppercase;
          }
          .header h2 {
            font-size: 8.5px;
            margin: 1.5px 0 0 0;
            color: #1f2937;
            font-weight: 700;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-top: 1.5px;
            margin-bottom: 1.5px;
            flex-grow: 1;
          }
          th, td {
            border: 1.1px solid #000;
            padding: 1.2px 2px;
            text-align: center;
            font-size: ${printFontSize};
            font-weight: bold;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #000;
          }
          th {
            font-weight: 900;
            font-size: 7.5px;
            text-transform: uppercase;
            background-color: #e2e8f0;
            color: #000;
          }
          .weekend {
            background-color: #e5e7eb !important;
            color: #374151 !important;
          }
          .weekend td {
            background-color: #e5e7eb !important;
            color: #374151 !important;
            border-color: #000;
          }
          .holiday {
            background-color: #fef2f2 !important;
            color: #991b1b !important;
          }
          .holiday td {
            background-color: #fef2f2 !important;
            color: #991b1b !important;
            font-weight: 800 !important;
            border-color: #000;
          }
          .rules-container {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            margin-top: auto;
            border-top: 1.3px solid #000;
            padding-top: 2.5px;
            flex-shrink: 0;
            page-break-inside: avoid;
            background-color: #fff;
          }
          .rules-left {
            flex: 1 1 auto;
            text-align: left;
            padding-right: 12px;
            border-right: 1.1px solid #000;
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 8px;
            row-gap: 2px;
          }
          .rules-title {
            font-weight: 900;
            font-size: 6px;
            margin-bottom: 1.5px;
            text-transform: uppercase;
            color: #000;
            letter-spacing: 0.2px;
          }
          .rules-body {
            white-space: pre-wrap;
            font-weight: 500;
            margin-bottom: 1px;
            color: #000;
            font-size: 5.4px;
            line-height: 1.14;
          }
          .signature-right {
            width: 160px;
            min-width: 160px;
            flex: 0 0 160px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            padding-left: 10px;
            padding-bottom: 1px;
          }
          .signature-approval {
            font-size: 6.2px;
            font-weight: 900;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            color: #000;
          }
          .signature-date {
            font-size: 5.8px;
            font-weight: 700;
            margin-top: 1px;
            color: #1f2937;
          }
          .signature-space {
            height: 12px;
          }
          .signature-name {
            font-weight: 900;
            font-size: 7.5px;
            text-transform: uppercase;
            color: #000;
            letter-spacing: 0.2px;
          }
          .signature-title {
            font-weight: 700;
            font-size: 6.5px;
            margin-top: 1px;
            color: #000;
          }

          /* 5-Week (up to 31 rows) Single-Page Adaptive Optimization */
          .density-5w .header h1 {
            font-size: 10px;
          }
          .density-5w .header h2 {
            font-size: 7.8px;
            margin-top: 1px;
          }
          .density-5w table {
            margin-top: 1px;
            margin-bottom: 1px;
          }
          .density-5w th {
            padding: 1.0px 1.5px;
            font-size: 7px;
          }
          .density-5w td {
            padding: 0.7px 1.2px;
            font-size: 6.8px;
            line-height: 1.05;
          }
          .density-5w .rules-container {
            padding-top: 1.8px;
            border-top-width: 1.1px;
          }
          .density-5w .rules-title {
            font-size: 5.2px;
            margin-bottom: 1px;
          }
          .density-5w .rules-body {
            font-size: 4.7px;
            line-height: 1.06;
          }
          .density-5w .signature-right {
            width: 150px;
            min-width: 150px;
            flex: 0 0 150px;
          }
          .density-5w .signature-approval {
            font-size: 5.8px;
          }
          .density-5w .signature-space {
            height: 7px;
          }
          .density-5w .signature-name {
            font-size: 6.8px;
          }
          .density-5w .signature-title {
            font-size: 5.8px;
          }

          @media print {
            html, body {
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .page {
              width: 100% !important;
              height: 100% !important;
              max-height: 100vh !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
            }
            .page:last-of-type {
              page-break-after: avoid !important;
            }
          }
        </style>
      </head>
      <body>
    `;

    const wrapInPage = (bodyHtml: string, rowCount: number = 0) => {
      const today = new Date();
      const formattedToday = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
      const isDensity5w = rowCount > 20;
      return `
        <div class="page ${isDensity5w ? 'density-5w' : ''}">
          <div class="content-top">
            ${bodyHtml}
          </div>
          <div class="rules-container">
            <div class="rules-left">
              <div>
                <div class="rules-title">GENEL NÖBET GÖREVLERİ:</div>
                <div class="rules-body">${generalRules || '1. Nöbet görevi ilk dersten 20 dakika önce başlar, son ders bitiminden 20 dakika sonra biter.\n2. Nöbetçi öğretmen nöbet bölgesindeki öğrencilerin güvenliğini sağlar.\n3. Nöbetçi müdür yardımcısına olağanüstü durumları derhal bildirir.'}</div>
              </div>
              <div>
                <div class="rules-title">DİKKAT EDİLECEK HUSUSLAR:</div>
                <div class="rules-body">${attentionRules || '1. Nöbet yerini izinsiz terk etmeyiniz.\n2. Teneffüslerde nöbet yerinde aktif olarak bulununuz.\n3. Nöbet defterini gün sonunda imzalayınız.'}</div>
              </div>
            </div>
            <div class="signature-right">
              <div class="signature-approval">... UYGUNDUR ...</div>
              <div class="signature-date">${formattedToday}</div>
              <div class="signature-space"></div>
              <div class="signature-name">${(principalName || 'HİDAYET AS').trim().toUpperCase()}</div>
              <div class="signature-title">${principalTitle || 'Okul Müdürü'}</div>
            </div>
          </div>
        </div>
      `;
    };

    const renderMonthBody = (y: number, m: number) => {
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const monthName = new Date(y, m, 1).toLocaleDateString('tr-TR', { month: 'long' });
      
      let html = `<div class="header">
        <h1>ATATÜRK ORTAOKULU NÖBET LİSTESİ</h1>
        <h2>${monthName.toUpperCase()} ${y}</h2>
      </div>`;

      // Main table headers with exact column width constraints for perfect fitting
      html += `<table style="table-layout: fixed; width: 100%;">
        <colgroup>
          <col style="width: 76px;" />`;
      dutyLocations.forEach(() => {
        html += `<col />`;
      });
      html += `<col style="width: 85px;" />
        </colgroup>
        <thead><tr className="transition-colors hover:bg-slate-50/80 touch-manipulation"><th>TARİH / GÜN</th>`;
      dutyLocations.forEach((loc, index) => {
        // Soft yellow highlighting for certain columns like in reference image
        const isYellowCol = index === 0 || index === 1 || index === 4 || index === 6 || (loc.toUpperCase().includes('BAHÇE') || loc.toUpperCase().includes('KAT2') || loc.toUpperCase().includes('EK BİNA'));
        const bgStyle = isYellowCol ? `style="background-color: #ffff00; color: #000;"` : `style="background-color: #f1f5f9; color: #1e293b;"`;
        html += `<th ${bgStyle}>${loc}</th>`;
      });
      html += `<th style="background-color: #f1f5f9; color: #1e293b; white-space: normal; line-height: 1.1; font-size: 7.5px; padding: 2px 3px;">NÖBETÇİ MÜDÜR YARDIMCISI</th>`;
      html += `</tr></thead><tbody>`;

      // Keep track of weekdays encountered for teacher rotation
      const weekdayOccurrenceCount: Record<number, number> = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(y, m, d);
        const jsDay = dateObj.getDay(); // 0 is Sunday, 1 is Monday, etc.
        const weekDayId = jsDay === 0 ? 7 : jsDay;
        const dayStr = String(d).padStart(2, '0') + '.' + String(m + 1).padStart(2, '0') + '.' + y;
        const dayName = dayNamesTR[jsDay].toUpperCase();

        const isActive = activeDays.some(ad => ad.id === weekDayId);
        const isWeekend = jsDay === 0 || jsDay === 6;
        const isoDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isHoliday = markHolidays && userHolidays.includes(isoDate);

        // Check if day is an official holiday marked by the user
        if (isHoliday) {
          html += `<tr class="holiday">
            <td style="font-weight: 800; background-color: #fee2e2; color: #991b1b; padding: 2.5px 2px; text-align: center; vertical-align: middle;">
              <div style="font-size: 7.8px; font-weight: 900; letter-spacing: 0.2px;">${dayStr}</div>
              <div style="font-size: 6.8px; font-weight: 700; color: #b91c1c; margin-top: 1px;">${dayName}</div>
            </td>
            <td colspan="${dutyLocations.length + 1}" style="background-color: #fef2f2; color: #991b1b; font-weight: 800; font-size: 8px; letter-spacing: 0.5px; text-align: center; vertical-align: middle;">
              RESMİ TATİL
            </td>
          </tr>`;
        } else if (!isActive || isWeekend) {
          // Weekend row - gray background, empty locations, but with alternating admin on the right side if alternateAdmins is checked
          let weekendAdmin = '-';
          if (alternateAdmins && eligibleDutyAdmins.length > 0) {
            weekendAdmin = eligibleDutyAdmins[(d - 1) % eligibleDutyAdmins.length];
          } else {
            const raw = adminSchedule[weekDayId];
            weekendAdmin = (raw && !isPrincipal(raw)) ? raw : '-';
          }
          html += `<tr class="weekend" className="transition-colors hover:bg-slate-50/80 touch-manipulation">
            <td style="font-weight: 800; background-color: #e5e7eb; color: #000; padding: 2.5px 2px; text-align: center; vertical-align: middle;">
              <div style="font-size: 7.8px; font-weight: 900; letter-spacing: 0.2px;">${dayStr}</div>
              <div style="font-size: 6.8px; font-weight: 700; color: #4b5563; margin-top: 1px;">${dayName}</div>
            </td>
            <td colspan="${dutyLocations.length}" style="background-color: #e5e7eb;"></td>
            <td style="background-color: #e5e7eb; color: #000; font-weight: bold; font-size: 7.5px; white-space: normal; overflow-wrap: break-word; line-height: 1.15; padding: 2px 3px;">${weekendAdmin}</td>
          </tr>`;
        } else {
          // Weekday row
          let currentAdmin = '-';
          if (alternateAdmins && eligibleDutyAdmins.length > 0) {
            currentAdmin = eligibleDutyAdmins[(d - 1) % eligibleDutyAdmins.length];
          } else {
            const raw = adminSchedule[weekDayId];
            currentAdmin = (raw && !isPrincipal(raw)) ? raw : '-';
          }

          html += `<tr className="transition-colors hover:bg-slate-50/80 touch-manipulation">
            <td style="font-weight: 800; background-color: #f1f5f9; color: #0f172a; padding: 2.5px 2px; text-align: center; vertical-align: middle;">
              <div style="font-size: 7.8px; font-weight: 900; letter-spacing: 0.2px;">${dayStr}</div>
              <div style="font-size: 6.8px; font-weight: 700; color: #475569; margin-top: 1px;">${dayName}</div>
            </td>`;

          // Continuous annual academic week index for seamless rotation
          const currentDayDate = new Date(year, month, d);
          const academicWeekIdx = getAcademicWeekIndex(currentDayDate, academicYearStartDate);

          const shiftedTeachers = getShiftedTeachersForDay({
            dutyLocations,
            dutyAssignments,
            weekDayId,
            weekIndex: academicWeekIdx,
            rotateTeachers,
            isPrincipal
          });

          dutyLocations.forEach((loc, index) => {
             const isYellowCol = index === 0 || index === 1 || index === 4 || index === 6 || (loc.toUpperCase().includes('BAHÇE') || loc.toUpperCase().includes('KAT2') || loc.toUpperCase().includes('EK BİNA'));
             const bgStyle = isYellowCol ? `style="background-color: #fffde6;"` : ``;
             const assigned = (shiftedTeachers[index] || []).filter(t => !isPrincipal(t));
             html += `<td ${bgStyle}>${assigned.join(', ') || '-'}</td>`;
          });

          html += `<td style="font-weight: 800; font-size: 7.5px; white-space: normal; overflow-wrap: break-word; line-height: 1.15; padding: 2px 3px; color: #0f172a;">${currentAdmin}</td></tr>`;
        }
      }
      html += `</tbody></table>`;
      return { html, daysInMonth };
    };

    const renderDateRangePages = (startStr: string, endStr: string) => {
      const dStart = new Date(startStr);
      const dEnd = new Date(endStr);
      if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) return '';

      const s = new Date(Math.min(dStart.getTime(), dEnd.getTime()));
      const e = new Date(Math.max(dStart.getTime(), dEnd.getTime()));

      const daysList: Date[] = [];
      const curr = new Date(s);
      while (curr <= e) {
        const jsDay = curr.getDay();
        const isWeekend = jsDay === 0 || jsDay === 6;
        if (showWeekends || !isWeekend) {
          daysList.push(new Date(curr));
        }
        curr.setDate(curr.getDate() + 1);
      }

      if (daysList.length === 0) return '';

      const PAGE_CHUNK_SIZE = printRowsPerPage === 9999 ? Math.max(1, daysList.length) : (printRowsPerPage || 31);
      const chunks: Date[][] = [];
      for (let i = 0; i < daysList.length; i += PAGE_CHUNK_SIZE) {
        chunks.push(daysList.slice(i, i + PAGE_CHUNK_SIZE));
      }

      const startFormatted = `${String(s.getDate()).padStart(2, '0')}.${String(s.getMonth() + 1).padStart(2, '0')}.${s.getFullYear()}`;
      const endFormatted = `${String(e.getDate()).padStart(2, '0')}.${String(e.getMonth() + 1).padStart(2, '0')}.${e.getFullYear()}`;

      const weekdayOccurrenceCount: Record<number, number> = {};
      let overallDayIndex = 0;
      let pagesHtml = '';

      chunks.forEach((chunkDays, chunkIdx) => {
        let html = `<div class="header">
          <h1>ATATÜRK ORTAOKULU NÖBET LİSTESİ</h1>
          <h2>${startFormatted} - ${endFormatted} TARİH ARALIĞI NÖBET ÇİZELGESİ ${chunks.length > 1 ? `(Sayfa ${chunkIdx + 1}/${chunks.length})` : ''}</h2>
        </div>`;

        html += `<table style="table-layout: fixed; width: 100%;">
          <colgroup>
            <col style="width: 76px;" />`;
        dutyLocations.forEach(() => {
          html += `<col />`;
        });
        html += `<col style="width: 85px;" />
          </colgroup>
          <thead><tr className="transition-colors hover:bg-slate-50/80 touch-manipulation"><th>TARİH / GÜN</th>`;
        dutyLocations.forEach((loc, index) => {
          const isYellowCol = index === 0 || index === 1 || index === 4 || index === 6 || (loc.toUpperCase().includes('BAHÇE') || loc.toUpperCase().includes('KAT2') || loc.toUpperCase().includes('EK BİNA'));
          const bgStyle = isYellowCol ? `style="background-color: #ffff00; color: #000;"` : `style="background-color: #f1f5f9; color: #1e293b;"`;
          html += `<th ${bgStyle}>${loc}</th>`;
        });
        html += `<th style="background-color: #f1f5f9; color: #1e293b; white-space: normal; line-height: 1.1; font-size: 7.5px; padding: 2px 3px;">NÖBETÇİ MÜDÜR YARDIMCISI</th>`;
        html += `</tr></thead><tbody>`;

        chunkDays.forEach(dateObj => {
          const jsDay = dateObj.getDay();
          const weekDayId = jsDay === 0 ? 7 : jsDay;
          const dayStr = String(dateObj.getDate()).padStart(2, '0') + '.' + String(dateObj.getMonth() + 1).padStart(2, '0') + '.' + dateObj.getFullYear();
          const dayName = dayNamesTR[jsDay].toUpperCase();

          const isActive = activeDays.some(ad => ad.id === weekDayId);
          const isWeekend = jsDay === 0 || jsDay === 6;
          const isoDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          const isHoliday = markHolidays && userHolidays.includes(isoDate);

          if (isHoliday) {
            // Official holiday row (Resmi Tatil)
            html += `<tr class="holiday">
              <td style="font-weight: 800; background-color: #fee2e2; color: #991b1b; padding: 2.5px 2px; text-align: center; vertical-align: middle;">
                <div style="font-size: 7.8px; font-weight: 900; letter-spacing: 0.2px;">${dayStr}</div>
                <div style="font-size: 6.8px; font-weight: 700; color: #b91c1c; margin-top: 1px;">${dayName}</div>
              </td>
              <td colspan="${dutyLocations.length + 1}" style="background-color: #fef2f2; color: #991b1b; font-weight: 800; font-size: 8px; letter-spacing: 0.5px; text-align: center; vertical-align: middle;">
                RESMİ TATİL
              </td>
            </tr>`;
          } else if (!isActive || isWeekend) {
            let weekendAdmin = '-';
            if (alternateAdmins && eligibleDutyAdmins.length > 0) {
              weekendAdmin = eligibleDutyAdmins[overallDayIndex % eligibleDutyAdmins.length];
            } else {
              const raw = adminSchedule[weekDayId];
              weekendAdmin = (raw && !isPrincipal(raw)) ? raw : '-';
            }
            html += `<tr class="weekend" className="transition-colors hover:bg-slate-50/80 touch-manipulation">
              <td style="font-weight: 800; background-color: #e5e7eb; color: #000; padding: 2.5px 2px; text-align: center; vertical-align: middle;">
                <div style="font-size: 7.8px; font-weight: 900; letter-spacing: 0.2px;">${dayStr}</div>
                <div style="font-size: 6.8px; font-weight: 700; color: #4b5563; margin-top: 1px;">${dayName}</div>
              </td>
              <td colspan="${dutyLocations.length}" style="background-color: #e5e7eb;"></td>
              <td style="background-color: #e5e7eb; color: #000; font-weight: bold; font-size: 7.5px; white-space: normal; overflow-wrap: break-word; line-height: 1.15; padding: 2px 3px;">${weekendAdmin}</td>
            </tr>`;
            overallDayIndex++;
          } else {
            let currentAdmin = '-';
            if (alternateAdmins && eligibleDutyAdmins.length > 0) {
              currentAdmin = eligibleDutyAdmins[overallDayIndex % eligibleDutyAdmins.length];
            } else {
              const raw = adminSchedule[weekDayId];
              currentAdmin = (raw && !isPrincipal(raw)) ? raw : '-';
            }

            html += `<tr className="transition-colors hover:bg-slate-50/80 touch-manipulation">
              <td style="font-weight: 800; background-color: #f1f5f9; color: #0f172a; padding: 2.5px 2px; text-align: center; vertical-align: middle;">
                <div style="font-size: 7.8px; font-weight: 900; letter-spacing: 0.2px;">${dayStr}</div>
                <div style="font-size: 6.8px; font-weight: 700; color: #475569; margin-top: 1px;">${dayName}</div>
              </td>`;

            // Continuous annual academic week index for seamless rotation
            const academicWeekIdx = getAcademicWeekIndex(dateObj, academicYearStartDate);

            const shiftedTeachers = getShiftedTeachersForDay({
              dutyLocations,
              dutyAssignments,
              weekDayId,
              weekIndex: academicWeekIdx,
              rotateTeachers,
              isPrincipal
            });

            dutyLocations.forEach((loc, index) => {
              const isYellowCol = index === 0 || index === 1 || index === 4 || index === 6 || (loc.toUpperCase().includes('BAHÇE') || loc.toUpperCase().includes('KAT2') || loc.toUpperCase().includes('EK BİNA'));
              const bgStyle = isYellowCol ? `style="background-color: #fffde6;"` : ``;
              const assigned = (shiftedTeachers[index] || []).filter(t => !isPrincipal(t));
              html += `<td ${bgStyle}>${assigned.join(', ') || '-'}</td>`;
            });

            html += `<td style="font-weight: 800; font-size: 7.5px; white-space: normal; overflow-wrap: break-word; line-height: 1.15; padding: 2px 3px; color: #0f172a;">${currentAdmin}</td></tr>`;
            overallDayIndex++;
          }
        });

        html += `</tbody></table>`;
        pagesHtml += wrapInPage(html, chunkDays.length);
      });

      return pagesHtml;
    };

    if (type === 'weekly') {
      let weeklyBody = `<div class="header">
        <h1>ATATÜRK ORTAOKULU NÖBET LİSTESİ</h1>
        <h2>Haftalık Nöbet Dağıtım Çizelgesi</h2>
      </div>`;
      weeklyBody += `<table style="table-layout: fixed; width: 100%;">
        <colgroup>
          <col style="width: 140px;" />`;
      activeDays.forEach(() => {
        weeklyBody += `<col />`;
      });
      weeklyBody += `</colgroup>
        <thead><tr className="transition-colors hover:bg-slate-50/80 touch-manipulation"><th>NÖBET YERİ / GÖREVİ</th>`;
      activeDays.forEach(day => {
        weeklyBody += `<th>${day.name.toUpperCase()}</th>`;
      });
      weeklyBody += `</tr></thead><tbody>`;
      
      // Admin row (Assistant Principal duty row)
      weeklyBody += `<tr style="background-color: #fefce8;" className="transition-colors hover:bg-slate-50/80 touch-manipulation"><td style="font-weight: 800; color: #854d0e;">NÖBETÇİ MÜDÜR YARDIMCISI</td>`;
      activeDays.forEach(day => {
        const rawAdm = adminSchedule[day.id];
        const adm = (rawAdm && !isPrincipal(rawAdm)) ? rawAdm : null;
        const admText = adm ? `${adm}${adminRoles[adm] ? ` (${adminRoles[adm]})` : ' (Müdür Yrd.)'}` : '-';
        weeklyBody += `<td style="color: #0f172a; font-weight: 800; font-size: 7.5px; white-space: normal; overflow-wrap: break-word; line-height: 1.15; padding: 2px 3px;">${admText}</td>`;
      });
      weeklyBody += `</tr>`;

      dutyLocations.forEach(loc => {
        weeklyBody += `<tr className="transition-colors hover:bg-slate-50/80 touch-manipulation"><td style="font-weight: 800;">${loc}</td>`;
        activeDays.forEach(day => {
           const key = `${loc}_${day.id}`;
           const assigned = (dutyAssignments[key] || []).filter(t => !isPrincipal(t));
           weeklyBody += `<td>${assigned.join(', ') || '-'}</td>`;
        });
        weeklyBody += `</tr>`;
      });
      weeklyBody += `</tbody></table>`;

      htmlContent += wrapInPage(weeklyBody, dutyLocations.length + 1);
    } else if (type === 'monthly') {
      const { html, daysInMonth } = renderMonthBody(year, month);
      htmlContent += wrapInPage(html, daysInMonth);
    } else if (type === 'yearly') {
      // Create schedules for standard school months
      const yearMonths = [
        { y: year, m: 8 }, { y: year, m: 9 }, { y: year, m: 10 }, { y: year, m: 11 },
        { y: year + 1, m: 0 }, { y: year + 1, m: 1 }, { y: year + 1, m: 2 }, { y: year + 1, m: 3 },
        { y: year + 1, m: 4 }, { y: year + 1, m: 5 }
      ];
      yearMonths.forEach((ym) => {
         const { html, daysInMonth } = renderMonthBody(ym.y, ym.m);
         htmlContent += wrapInPage(html, daysInMonth);
      });
    } else if (type === 'range') {
      const s = customStartDate || printStartDate;
      const e = customEndDate || printEndDate;
      htmlContent += renderDateRangePages(s, e);
    }

    htmlContent += `
        <script>
          window.onload = function() {
            setTimeout(function() { window.focus(); window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Warnings / Analytics
  // Müdür ve müdür yardımcıları nöbet yerlerinde nöbet tutmadıklarından (müdür hiç tutmaz, müdür yardımcıları idareci nöbetindedir)
  // nöbet yazılmayan öğretmenler ve çift nöbet tutanlar arasında listelenmezler.
  const unassignedTeachers = teachersWithLessons.filter(
    t => !exemptTeachers.some(e => e.trim().toLowerCase() === t.trim().toLowerCase()) &&
         !isTeacherAdmin(t) &&
         getWeeklyDutyCount(t) === 0
  );
  const multipleDutyTeachers = teachersWithLessons.filter(
    t => !isTeacherAdmin(t) && getWeeklyDutyCount(t) > 1
  );

  // Absent count for selected cover date
  const absentCountToday = teachers.filter(t => (teacherStatuses[`${selectedCoverDate}_${t}`] || 'aktif') !== 'aktif').length;

  // Filter teachers list for exemptions search and mobile filter
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const isAdmin = dutyAdmins.some(a => a.trim().toLowerCase() === t.trim().toLowerCase());
    const isExempt = exemptTeachers.includes(t) || isAdmin;
    if (exemptionFilter === 'exempt') return isExempt;
    if (exemptionFilter === 'active') return !isExempt;
    return true;
  });

  return (
    <div className="flex flex-col h-full relative pb-28 md:pb-6 min-h-0 touch-manipulation" id="duty-manager-container">
      {/* Success Notification Toast (Mobile & Desktop Responsive) */}
      {successMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-emerald-600 text-white font-bold px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 touch-manipulation">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-xs sm:text-sm">{successMessage}</span>
        </div>
      )}

      {/* Error Notification Toast (Mobile & Desktop Responsive) */}
      {errorMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-rose-600 text-white font-bold px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 touch-manipulation">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-xs sm:text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-row justify-between items-center gap-2 mb-2 md:mb-4 shrink-0 px-0.5 touch-manipulation">
          <div className="min-w-0 flex-1 touch-manipulation">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5 sm:gap-2 truncate touch-manipulation">
                <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-indigo-600 shrink-0" /> 
                <span className="truncate">Nöbet Asistanı</span>
              </h2>
              <p className="hidden sm:block text-slate-500 font-medium text-[11px] sm:text-xs md:text-sm mt-0.5 truncate">
                Okul nöbet planlaması, bölge tanımları ve idareci atamaları.
              </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 touch-manipulation">
             {/* Nöbet Ayarları Butonu */}
             <button 
               id="duty-header-settings-btn"
               onClick={() => setIsSettingsModalOpen(true)}
               className="bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-2xs min-h-[42px] sm:min-h-[44px] active:scale-95 touch-manipulation shrink-0"
               title="Nöbet Bölgeleri, Muafiyetler, İdareciler ve Genel Ayarlar"
             >
                <Settings className="w-4 h-4 text-indigo-600 shrink-0" /> 
                <span className="hidden xs:inline sm:inline">Nöbet </span><span>Ayarları</span>
             </button>

             {/* Kaydet Butonu */}
             <button 
               id="duty-header-save-btn"
               onClick={handleSaveAll}
               disabled={isSaving}
               className={`${
                 justSaved 
                   ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                   : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-100'
               } px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-sm min-h-[42px] sm:min-h-[44px] active:scale-95 touch-manipulation shrink-0`}
               title="Tüm nöbet planlamasını, ayarları ve çizelgeleri kaydet; JSON yedeğine işle"
             >
                {justSaved ? (
                  <>
                    <CheckCheck className="w-4 h-4 shrink-0 text-emerald-100 animate-pulse" /> 
                    <span className="hidden sm:inline">JSON'a </span><span>Kaydedildi!</span>
                  </>
                ) : (
                  <>
                    <Save className={`w-4 h-4 shrink-0 ${isSaving ? 'animate-spin' : ''}`} /> 
                    <span className="hidden sm:inline">Tümünü </span><span>Kaydet</span>
                  </>
                )}
             </button>
          </div>
      </div>

      {/* Custom Tabs Navigation (Sticky on Mobile & Desktop, Touch Optimized) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-1 mb-2 md:mb-5 shrink-0 border-b border-slate-100">
        <div className="bg-slate-200/80 p-1 rounded-2xl grid grid-cols-3 gap-1 border border-slate-300/70 shadow-2xs">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 min-h-[40px] sm:min-h-[46px] active:scale-95 touch-manipulation ${
              activeTab === 'summary' 
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70 bg-transparent active:bg-slate-200/60'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'summary' ? 'text-white' : 'text-indigo-600'}`} />
            <span className="truncate">Günlük Nöbet</span>
            {absentCountToday > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
                activeTab === 'summary' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-900'
              }`}>
                {absentCountToday}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('roster')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 min-h-[40px] sm:min-h-[46px] active:scale-95 touch-manipulation ${
              activeTab === 'roster' 
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70 bg-transparent active:bg-slate-200/60'
            }`}
          >
            <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'roster' ? 'text-white' : 'text-indigo-600'}`} />
            <span className="truncate">Haftalık Çizelge</span>
            {unassignedTeachers.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
                activeTab === 'roster' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {unassignedTeachers.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('range')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 min-h-[40px] sm:min-h-[46px] active:scale-95 touch-manipulation ${
              activeTab === 'range' 
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70 bg-transparent active:bg-slate-200/60'
            }`}
          >
            <Printer className={`w-4 h-4 shrink-0 ${activeTab === 'range' ? 'text-white' : 'text-indigo-600'}`} />
            <span className="truncate">Yazdırma Ayarları</span>
          </button>
        </div>
      </div>

      {/* Main Tab Contents */}
      <div className="flex-1 overflow-y-auto touch-manipulation">
        {/* Tab 0: Summary (Özet Bilgiler & Günlük Takip - İzinler ile Birleştirilmiş) */}
        {activeTab === 'summary' && (
          <DutySummaryTab
            teachers={teachers}
            schedules={schedules}
            schoolSettings={schoolSettings}
            dutyLocations={dutyLocations}
            dutyAssignments={dutyAssignments}
            adminSchedule={adminSchedule}
            adminRoles={adminRoles}
            dutyAdmins={dutyAdmins}
            exemptTeachers={exemptTeachers}
            teacherStatuses={teacherStatuses}
            setTeacherStatuses={setTeacherStatuses}
            coverAssignments={coverAssignments}
            setCoverAssignments={setCoverAssignments}
            selectedCoverDate={selectedCoverDate}
            setSelectedCoverDate={setSelectedCoverDate}
            selectedCoverDayId={selectedCoverDayId}
            coverDay={coverDay}
            coverDayScheduleIdx={coverDayScheduleIdx}
            selectedCoverDIdx={selectedCoverDIdx}
            activeDays={activeDays}
            weekDaysForCover={weekDaysForCover}
            vacantLessonsForDay={vacantLessonsForDay}
            getFormattedDate={getFormattedDate}
            shiftCoverDate={shiftCoverDate}
            setTodayCoverDate={setTodayCoverDate}
            handleAutoAssignCovers={handleAutoAssignCovers}
            handlePrintCoverReport={handlePrintCoverReport}
            generateShareText={generateShareText}
            isActualLesson={isActualLesson}
            getLessonCount={getLessonCount}
            getWeeklyDutyCount={getWeeklyDutyCount}
            setShowQuickCoverModal={setShowQuickCoverModal}
            setShowShareModal={setShowShareModal}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
            setSelectingCell={setSelectingCell}
            setActiveTab={setActiveTab}
            setMobileRosterDayId={setMobileRosterDayId}
            setSuccessMessage={setSuccessMessage}
            selectedTeacherForCover={selectedTeacherForCover}
            setSelectedTeacherForCover={setSelectedTeacherForCover}
          />
        )}

        {activeTab === 'roster' && (
          <div className="flex flex-col gap-6 touch-manipulation">
            
            {/* Table wrapper card */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden flex flex-col h-full touch-manipulation">
              
               {/* Header Action bar */}
              <div className="p-2.5 sm:p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 touch-manipulation">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full sm:w-auto gap-2.5 sm:gap-3 touch-manipulation">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-800 touch-manipulation">
                       <Calendar className="w-5 h-5 text-indigo-600 shrink-0" /> 
                       <span>Haftalık Nöbet Çizelgesi</span>
                    </div>

                    {/* Mobile View Switcher (Cards vs Table) */}
                    <div className="flex items-center bg-slate-200/90 p-1 rounded-xl text-xs md:hidden self-start touch-manipulation">
                       <button 
                         onClick={() => setMobileRosterViewMode('cards')}
                         className={`px-3 py-1.5 rounded-lg font-black transition-all text-xs flex items-center gap-1.5 min-h-[42px] ${
                           mobileRosterViewMode === 'cards' 
                             ? 'bg-indigo-600 text-white shadow-xs' 
                             : 'text-slate-700 hover:text-slate-900'
                         }`}
                       >
                         <Layers className="w-4 h-4" />
                         <span>Kartlar</span>
                       </button>
                       <button 
                         onClick={() => setMobileRosterViewMode('table')}
                         className={`px-3 py-1.5 rounded-lg font-black transition-all text-xs flex items-center gap-1.5 min-h-[42px] ${
                           mobileRosterViewMode === 'table' 
                             ? 'bg-indigo-600 text-white shadow-xs' 
                             : 'text-slate-700 hover:text-slate-900'
                         }`}
                       >
                         <BookOpen className="w-4 h-4" />
                         <span>Tablo</span>
                       </button>
                    </div>
                 </div>
                 
                 {/* Responsive Action Buttons */}
                 <div className="flex flex-row items-center gap-1.5 sm:gap-2 w-full sm:w-auto touch-manipulation">
                   <button 
                     onPointerDown={handleAutoAssign}
                     className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs flex-1 sm:flex-initial flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] min-h-[42px] sm:min-h-[44px] touch-manipulation"
                   >
                      <Wand2 className="w-4 h-4 shrink-0" /> 
                      <span>⚡ Otomatik Dağıt</span>
                   </button>

                   <button 
                     id="duty-roster-clear-btn"
                     onPointerDown={handleClearAssignments} 
                     className="bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-rose-200 active:scale-[0.98] min-h-[42px] sm:min-h-[44px] touch-manipulation"
                     title="Tüm nöbet atamalarını temizle"
                   >
                      <Trash2 className="w-4 h-4 shrink-0" /> 
                      <span className="truncate">Sıfırla</span>
                   </button>
                 </div>
              </div>

               {/* Mobile Quick Stats Strip */}
               <div className="md:hidden grid grid-cols-3 gap-2 p-2.5 bg-indigo-50/50 border-b border-indigo-100/60 text-center">
                 <div className="bg-white/90 border border-indigo-100 rounded-xl py-1.5 px-1 shadow-2xs">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Görevler</div>
                   <div className="text-xs font-black text-indigo-700">
                     {Object.values(dutyAssignments).reduce((sum: number, list: any) => sum + (list?.length || 0), 0)} Atama
                   </div>
                 </div>
                 <div className="bg-white/90 border border-indigo-100 rounded-xl py-1.5 px-1 shadow-2xs">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Boş Bölge</div>
                   <div className={`text-xs font-black ${
                     activeDays.reduce((acc, d) => acc + dutyLocations.filter(loc => !(dutyAssignments[`${loc}_${d.id}`]?.length > 0)).length, 0) > 0 
                       ? 'text-amber-600' 
                       : 'text-emerald-600'
                   }`}>
                     {activeDays.reduce((acc, d) => acc + dutyLocations.filter(loc => !(dutyAssignments[`${loc}_${d.id}`]?.length > 0)).length, 0)} Bölge
                   </div>
                 </div>
                 <div className="bg-white/90 border border-indigo-100 rounded-xl py-1.5 px-1 shadow-2xs">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nöbetsiz</div>
                   <div className={`text-xs font-black ${unassignedTeachers.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                     {unassignedTeachers.length} Kişi
                   </div>
                 </div>
               </div>
               

               
               {/* Main table (Responsive with sticky first column on mobile table mode) */}
               <div className={`${mobileRosterViewMode === 'table' ? 'block' : 'hidden md:block'} flex-1 overflow-x-auto touch-pan-x overflow-y-auto custom-scrollbar p-0 md:p-4`}>
                 {/* Mobile Day Selector for Table Mode */}
                 <div className="md:hidden p-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto touch-pan-x hide-scrollbar touch-manipulation">
                   <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0 ml-1">Sütun:</span>
                   <button
                     onClick={() => setRosterTableDayFilter('all')}
                     className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[42px] ${
                       rosterTableDayFilter === 'all'
                         ? 'bg-indigo-600 text-white shadow-xs'
                         : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                     }`}
                   >
                     Tüm Günler
                   </button>
                   {activeDays.map(day => (
                     <button
                       key={day.id}
                       onClick={() => setRosterTableDayFilter(day.id)}
                       className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[42px] ${
                         rosterTableDayFilter === day.id
                           ? 'bg-indigo-600 text-white shadow-xs'
                           : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                       }`}
                     >
                       {day.name}
                     </button>
                   ))}
                 </div>

                 {rosterTableDayFilter === 'all' && (
                   <div className="md:hidden px-3 py-1.5 bg-slate-50 text-[11px] text-slate-500 font-medium border-b border-slate-200 flex items-center justify-center gap-1 touch-manipulation">
                     <span>👈 Sağa-sola kaydırarak tüm günleri inceleyebilirsiniz 👉</span>
                   </div>
                 )}

                 {(() => {
                   const tableDays = rosterTableDayFilter === 'all' ? activeDays : activeDays.filter(d => d.id === rosterTableDayFilter);
                   return (
                     <table className={`w-full border-collapse ${rosterTableDayFilter === 'all' ? 'min-w-[500px] sm:min-w-[800px]' : 'min-w-full'}`}>
                       <thead className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-sm">
                         <tr className="transition-colors hover:bg-slate-50/80 touch-manipulation">
                           <th className="border border-slate-200 bg-slate-100 p-2 sm:p-3 text-left w-24 sm:w-48 font-black text-slate-700 sticky left-0 z-30 shadow-[2px_0_4px_rgba(0,0,0,0.06)] text-[10px] sm:text-sm truncate">Nöbet Yeri</th>
                           {tableDays.map(day => (
                              <th key={day.id} className="border border-slate-200 bg-slate-100 p-2 sm:p-3 text-center font-black text-slate-700 min-w-[90px] sm:w-64 text-[10px] sm:text-sm truncate">{day.name}</th>
                           ))}
                         </tr>
                       </thead>
                       <tbody>
                         
                         {/* Admin Row - High visual hierarchy */}
                         <tr className="bg-amber-50/60 border-y-2 border-amber-200 transition-colors hover:bg-slate-50/80 touch-manipulation">
                            <td className="border border-slate-200 px-2 sm:px-4 py-2 sm:py-3 align-middle font-black text-amber-900 bg-amber-100 sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.06)] min-h-[50px]">
                               <div className="flex items-center gap-1 sm:gap-1.5\ touch-manipulation">
                                 <ShieldCheck className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-600 shrink-0\" /> 
                                 <span className="text-[10px] sm:text-sm truncate">NÖBETÇİ İDARECİ</span>
                               </div>
                            </td>
                            {tableDays.map(day => {
                               const currentAdminName = adminSchedule[day.id] || 'Atanmadı';
                               const roleText = adminSchedule[day.id] && adminRoles[adminSchedule[day.id]] ? ` (${adminRoles[adminSchedule[day.id]]})` : '';
                               return (
                                  <td key={day.id} className="border border-slate-200 px-3 sm:px-4 py-3 align-middle text-center">
                                     <span className={`inline-block font-bold text-xs sm:text-sm px-3 py-1 rounded-full ${adminSchedule[day.id] ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800 border border-dashed border-rose-300'}`}>
                                        {currentAdminName}{roleText}
                                     </span>
                                  </td>
                               );
                            })}
                         </tr>

                         {/* Standard Duty Location Rows */}
                         {dutyLocations.map(loc => (
                           <tr key={loc} className="transition-colors hover:bg-slate-50/80 group touch-manipulation">
                             <td className="border border-slate-200 px-2 sm:px-4 py-2 sm:py-3 align-middle font-bold text-slate-700 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.06)] text-[10px] sm:text-sm truncate touch-manipulation">
                               {loc}
                             </td>
                             {tableDays.map((day) => {
                               const dIdx = activeDays.findIndex(d => d.id === day.id);
                               const key = `${loc}_${day.id}`;
                               const assigned = dutyAssignments[key] || [];
                               return (
                                 <td key={day.id} className="border border-slate-200 px-2 sm:px-4 py-2 sm:py-3 align-middle align-top relative">
                                    <div 
                                       className="min-h-[70px] sm:min-h-[80px] h-full flex flex-col gap-1.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 p-1.5 sm:p-2 cursor-pointer transition-colors touch-manipulation"
                                       onClick={() => setSelectingCell({ loc, dayId: day.id, dIdx })}
                                    >
                                       {assigned.length === 0 && (
                                          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-semibold py-2 touch-manipulation">
                                             + Nöbetçi Seç
                                          </div>
                                       )}
                                       {assigned.map(t => {
                                          const isMultiple = getWeeklyDutyCount(t) > 1;
                                          const status = teacherStatuses[t] || 'aktif';
                                          const isNotActive = status !== 'aktif';
                                          const lessonCount = getLessonCount(t, dIdx);
                                          
                                          // Status-specific styles
                                          let ringClass = isMultiple ? 'ring-1 ring-amber-400 bg-amber-50 text-amber-900 border-amber-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900';
                                          if (isNotActive) {
                                            if (status === 'görevli') ringClass = 'ring-1 ring-blue-400 bg-blue-50 text-blue-800 border-blue-200';
                                            else if (status === 'raporlu') ringClass = 'ring-1 ring-amber-400 bg-amber-50 text-amber-800 border-amber-200';
                                            else if (status === 'izinli') ringClass = 'ring-1 ring-purple-400 bg-purple-50 text-purple-800 border-purple-200';
                                            else if (status === 'mazeretsiz') ringClass = 'ring-1 ring-rose-400 bg-rose-50 text-rose-800 border-rose-200';
                                          }

                                          return (
                                            <div key={t} className={`relative rounded-xl border shadow-2xs ${ringClass}`}>
                                              <div className="flex justify-between items-center p-1.5 pl-2 gap-1 touch-manipulation">
                                                <div className="flex flex-col items-start min-w-0 touch-manipulation">
                                                  <div className="flex items-center gap-1 text-xs font-bold truncate touch-manipulation">
                                                    <span className={isNotActive ? 'line-through text-slate-500' : ''}>{t}</span>
                                                    <span className="text-[10px] text-slate-400 font-semibold">({lessonCount}D)</span>
                                                    {isMultiple && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Haftada birden fazla nöbet" />}
                                                  </div>
                                                  {isNotActive && (
                                                    <span className="text-[9px] uppercase font-black bg-white px-1 py-0.2 rounded border border-current mt-0.5">
                                                      {status}
                                                    </span>
                                                  )}
                                                </div>
                                                <button 
                                                  onClick={(e) => removeAssignment(loc, day.id, t, e)}
                                                  className="p-1 hover:bg-rose-100 hover:text-rose-700 text-slate-400 rounded-lg transition-colors shrink-0 min-h-[42px] min-w-[42px] flex items-center justify-center touch-manipulation"
                                                  title="Sil"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                       })}
                                    </div>
                                 </td>
                               );
                             })}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   );
                 })()}
               </div>
              
              {/* Mobile Roster View (Cards View) */}
              <div className={`${mobileRosterViewMode === 'cards' ? 'flex' : 'hidden'} md:hidden flex-col flex-1 overflow-hidden`}>
                {/* Day Navigation & Selector Bar - Optimized for 5 Days without overflow */}
                <div className="bg-slate-50 border-b border-slate-200 p-2 shrink-0 flex items-center justify-between gap-1 w-full touch-manipulation">
                    {activeDays.map((day) => {
                      const dayTotalDuties = dutyLocations.reduce((sum, loc) => {
                        return sum + (dutyAssignments[`${loc}_${day.id}`]?.length || 0);
                      }, 0);
                      const dayEmptySlots = dutyLocations.filter(loc => !(dutyAssignments[`${loc}_${day.id}`]?.length > 0)).length;
                      const isSelected = mobileRosterDayId === day.id;

                      return (
                        <button
                          key={day.id}
                          onPointerDown={(e) => { e.preventDefault(); setMobileRosterDayId(day.id); }}
                          className={`flex-1 min-w-0 py-2 px-0.5 sm:px-1.5 rounded-xl font-bold text-xs shrink-0 transition-all flex flex-col items-center justify-center min-h-[44px] relative active:scale-95 touch-manipulation ${
                            isSelected 
                              ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-300' 
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-[10px] sm:text-[11px] leading-tight font-extrabold truncate w-full text-center">{day.name.slice(0, 3)}</span>
                          <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-0.5 w-full touch-manipulation">
                            <span className={`text-[9px] sm:text-[10px] font-black ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                              {dayTotalDuties}
                            </span>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0 ${
                              dayEmptySlots === 0 ? 'bg-emerald-400' : isSelected ? 'bg-amber-300' : 'bg-amber-400'
                            }`} />
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Day Summary & Filter Toolbar */}
                <div className="p-2.5 bg-white border-b border-slate-200 shrink-0 flex flex-col gap-2 touch-manipulation">
                  <div className="flex items-center justify-between gap-1.5 touch-manipulation">
                    <div className="flex items-center gap-1.5 min-w-0 touch-manipulation">
                      <span className="font-black text-slate-800 text-xs sm:text-sm truncate">
                        {activeDays.find(d => d.id === mobileRosterDayId)?.name} Günü Dağılımı
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {(() => {
                        const emptyCount = dutyLocations.filter(loc => !(dutyAssignments[`${loc}_${mobileRosterDayId}`]?.length > 0)).length;
                        return emptyCount === 0 ? (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Dolu
                          </span>
                        ) : (
                          <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> {emptyCount} Boş
                          </span>
                        );
                      })()}

                      {/* WhatsApp Share / Copy Button for Current Day */}
                      <button
                        onClick={() => handleShareDailyDutyWhatsApp(mobileRosterDayId)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs min-h-[34px] active:scale-95 transition-all touch-manipulation"
                        title="Günün Nöbet Çizelgesini WhatsApp'ta Paylaş"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-extrabold hidden xs:inline">WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleCopyDailyDutyText(mobileRosterDayId)}
                        className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 p-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 min-h-[34px] active:scale-95 transition-all touch-manipulation"
                        title="Metni Kopyala"
                      >
                        {dailyDutyCopiedDay === mobileRosterDayId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Search, Filter & Density Controls */}
                  <div className="flex items-center gap-1.5 touch-manipulation">
                    <div className="relative flex-1 touch-manipulation">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={rosterLocationSearch}
                        onChange={(e) => setRosterLocationSearch(e.target.value)}
                        placeholder="Nöbet yeri ara..."
                        className="w-full pl-8 pr-7 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all min-h-[36px]"
                      />
                      {rosterLocationSearch && (
                        <button 
                          onClick={() => setRosterLocationSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills (All / Empty) */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs shrink-0 touch-manipulation">
                      <button
                        onClick={() => setRosterLocationFilter('all')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all min-h-[34px] flex items-center ${
                          rosterLocationFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Tümü ({dutyLocations.length})
                      </button>
                      <button
                        onClick={() => setRosterLocationFilter('empty')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all min-h-[34px] flex items-center ${
                          rosterLocationFilter === 'empty' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Boş ({dutyLocations.filter(loc => !(dutyAssignments[`${loc}_${mobileRosterDayId}`]?.length > 0)).length})
                      </button>
                    </div>

                    {/* Density Toggle (Kompakt / Izgara / Detaylı) */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs shrink-0 touch-manipulation">
                      <button
                        onClick={() => setMobileCardDensity('compact')}
                        className={`p-1.5 rounded-lg font-bold text-[10px] transition-all min-h-[34px] flex items-center justify-center ${
                          mobileCardDensity === 'compact' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                        }`}
                        title="Kompakt Liste"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMobileCardDensity('grid')}
                        className={`p-1.5 rounded-lg font-bold text-[10px] transition-all min-h-[34px] flex items-center justify-center ${
                          mobileCardDensity === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                        }`}
                        title="2'li Izgara Görünümü"
                      >
                        <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 p-0.5">
                          <div className="bg-current rounded-[1px]"></div>
                          <div className="bg-current rounded-[1px]"></div>
                          <div className="bg-current rounded-[1px]"></div>
                          <div className="bg-current rounded-[1px]"></div>
                        </div>
                      </button>
                      <button
                        onClick={() => setMobileCardDensity('normal')}
                        className={`p-1.5 rounded-lg font-bold text-[10px] transition-all min-h-[34px] flex items-center justify-center ${
                          mobileCardDensity === 'normal' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                        }`}
                        title="Geniş Detaylı"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Duty Location Cards */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-3 pb-24 md:pb-4 flex flex-col gap-2 touch-manipulation">
                  {/* Admin Card - Compact Modern Bar */}
                  <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 shadow-2xs relative overflow-hidden flex items-center justify-between gap-2 touch-manipulation">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    <div className="flex items-center gap-2 min-w-0 pl-1">
                      <div className="p-1 bg-amber-100 rounded-lg text-amber-700 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] font-black text-amber-900 uppercase tracking-wider">NÖBETÇİ İDARECİ</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {adminSchedule[mobileRosterDayId] ? (
                            <>
                              <span className="font-extrabold text-xs text-amber-950 truncate">
                                {adminSchedule[mobileRosterDayId]}
                              </span>
                              {adminRoles[adminSchedule[mobileRosterDayId]] && (
                                <span className="bg-amber-200/70 text-amber-900 font-bold text-[9px] px-1.5 py-0.2 rounded">
                                  {adminRoles[adminSchedule[mobileRosterDayId]]}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-rose-600 font-bold text-[11px]">İdareci Atanmadı</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="text-[10px] font-bold text-amber-800 bg-amber-200/60 hover:bg-amber-200 px-2 py-1 rounded-lg transition-colors min-h-[32px] flex items-center shrink-0 active:scale-95 touch-manipulation"
                    >
                      Değiştir
                    </button>
                  </div>

                  {/* Filtered Location Cards */}
                  {(() => {
                    const filteredLocations = dutyLocations.filter(loc => {
                      if (rosterLocationSearch.trim() && !loc.toLowerCase().includes(rosterLocationSearch.toLowerCase().trim())) {
                        return false;
                      }
                      const assigned = dutyAssignments[`${loc}_${mobileRosterDayId}`] || [];
                      if (rosterLocationFilter === 'empty' && assigned.length > 0) return false;
                      if (rosterLocationFilter === 'filled' && assigned.length === 0) return false;
                      return true;
                    });

                    if (dutyLocations.length === 0) {
                      return (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs font-semibold">
                          Henüz nöbet bölgesi eklenmemiş. Nöbet Ayarları menüsünden bölge ekleyin.
                        </div>
                      );
                    }

                    if (filteredLocations.length === 0) {
                      return (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs font-semibold">
                          Filtreye uygun nöbet bölgesi bulunamadı.
                        </div>
                      );
                    }

                    return (
                      <div className={
                        mobileCardDensity === 'grid' 
                          ? "grid grid-cols-2 gap-2" 
                          : "flex flex-col gap-2"
                      }>
                        {filteredLocations.map(loc => {
                          const dIdx = activeDays.findIndex(d => d.id === mobileRosterDayId);
                          const key = `${loc}_${mobileRosterDayId}`;
                          const assigned = dutyAssignments[key] || [];

                          // Compact Card Mode
                          if (mobileCardDensity === 'compact') {
                            return (
                              <div 
                                key={loc}
                                className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs relative overflow-hidden flex flex-col gap-1.5 touch-manipulation hover:border-slate-300 transition-colors"
                              >
                                <div className={`absolute top-0 left-0 w-1 h-full ${assigned.length > 0 ? 'bg-indigo-500' : 'bg-amber-400'}`}></div>
                                
                                <div className="flex justify-between items-center pl-1 touch-manipulation">
                                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 min-w-0">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span className="truncate">{loc}</span>
                                  </h4>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                      assigned.length > 0 
                                        ? 'text-indigo-700 bg-indigo-50 border-indigo-100' 
                                        : 'text-amber-700 bg-amber-50 border-amber-100'
                                    }`}>
                                      {assigned.length > 0 ? `${assigned.length} Kişi` : 'Boş'}
                                    </span>
                                    <button
                                      onPointerDown={(e) => { e.preventDefault(); setSelectingCell({ loc, dayId: mobileRosterDayId, dIdx }); }}
                                      className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center shrink-0 active:scale-95"
                                      title="Öğretmen Ata / Düzenle"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                {assigned.length === 0 ? (
                                  <button
                                    onPointerDown={(e) => { e.preventDefault(); setSelectingCell({ loc, dayId: mobileRosterDayId, dIdx }); }}
                                    className="w-full flex items-center justify-center py-2 px-2 bg-amber-50/60 hover:bg-amber-100/60 border border-dashed border-amber-200 rounded-lg text-amber-700 text-[11px] font-bold transition-all min-h-[34px] active:scale-[0.99] touch-manipulation"
                                  >
                                    <Plus className="w-3.5 h-3.5 mr-1 text-amber-600" /> Nöbetçi Ata
                                  </button>
                                ) : (
                                  <div className="flex flex-wrap gap-1 pl-1 touch-manipulation">
                                    {assigned.map(t => {
                                      const status = teacherStatuses[`${selectedCoverDate}_${t}`] || teacherStatuses[t] || 'aktif';
                                      const isNotActive = status !== 'aktif';
                                      const lessonCount = getLessonCount(t, dIdx);
                                      const isMultiple = getWeeklyDutyCount(t) > 1;

                                      let ringClass = 'bg-slate-50 text-slate-800 border-slate-200';
                                      if (isMultiple) ringClass = 'bg-amber-50 text-amber-900 border-amber-300';
                                      if (isNotActive) {
                                        if (status === 'görevli') ringClass = 'bg-blue-50 text-blue-800 border-blue-200';
                                        else if (status === 'raporlu') ringClass = 'bg-amber-50 text-amber-800 border-amber-200';
                                        else if (status === 'izinli') ringClass = 'bg-purple-50 text-purple-800 border-purple-200';
                                        else if (status === 'mazeretsiz') ringClass = 'bg-rose-50 text-rose-800 border-rose-200';
                                      }

                                      return (
                                        <div 
                                          key={t} 
                                          className={`font-bold text-[11px] py-1 px-2 rounded-lg border flex items-center justify-between gap-1 shadow-2xs ${ringClass}`}
                                        >
                                          <div className="flex items-center gap-1 min-w-0">
                                            <span className={`truncate ${isNotActive ? 'line-through text-slate-500' : ''}`}>{t}</span>
                                            <span className="text-[9px] font-bold text-slate-500 bg-white/90 border border-slate-200 px-1 py-0.2 rounded shrink-0">
                                              {lessonCount}D
                                            </span>
                                            {isMultiple && (
                                              <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 py-0.2 rounded shrink-0" title="Haftada 2. nöbet">
                                                2N
                                              </span>
                                            )}
                                            {isNotActive && (
                                              <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-700 px-1 py-0.2 rounded shrink-0">
                                                {status.slice(0, 3)}
                                              </span>
                                            )}
                                          </div>
                                          <button 
                                            onClick={(e) => removeAssignment(loc, mobileRosterDayId, t, e)}
                                            className="p-0.5 hover:bg-rose-100 hover:text-rose-700 text-slate-400 rounded transition-colors ml-0.5 flex items-center justify-center shrink-0 active:scale-95 touch-manipulation"
                                            title="Kaldır"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Grid Mode (2-Column Dense)
                          if (mobileCardDensity === 'grid') {
                            return (
                              <div 
                                key={loc}
                                className="bg-white border border-slate-200 rounded-xl p-2 shadow-2xs relative overflow-hidden flex flex-col justify-between gap-1.5 touch-manipulation"
                              >
                                <div className={`absolute top-0 left-0 w-1 h-full ${assigned.length > 0 ? 'bg-indigo-500' : 'bg-amber-400'}`}></div>
                                
                                <div>
                                  <div className="flex justify-between items-center pl-1 mb-1 touch-manipulation">
                                    <h4 className="font-extrabold text-slate-800 text-[11px] truncate flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                                      <span className="truncate">{loc}</span>
                                    </h4>
                                    <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                                      assigned.length > 0 ? 'text-indigo-700 bg-indigo-50' : 'text-amber-700 bg-amber-50'
                                    }`}>
                                      {assigned.length}
                                    </span>
                                  </div>

                                  {assigned.length === 0 ? (
                                    <div className="text-[10px] text-amber-600 font-semibold italic pl-1">
                                      Boş Bölge
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1 pl-1">
                                      {assigned.map(t => {
                                        const lessonCount = getLessonCount(t, dIdx);
                                        return (
                                          <div key={t} className="flex items-center justify-between text-[10px] font-bold bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
                                            <span className="truncate">{t}</span>
                                            <span className="text-[8px] font-bold text-slate-400 ml-1 shrink-0">{lessonCount}D</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                <button
                                  onPointerDown={(e) => { e.preventDefault(); setSelectingCell({ loc, dayId: mobileRosterDayId, dIdx }); }}
                                  className="w-full mt-1 py-1 px-1.5 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 min-h-[28px] active:scale-95"
                                >
                                  <Plus className="w-3 h-3" /> {assigned.length === 0 ? 'Ata' : 'Düzenle'}
                                </button>
                              </div>
                            );
                          }

                          // Normal (Detailed Single Column) Mode
                          return (
                            <div 
                              key={loc}
                              className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs relative overflow-hidden flex flex-col gap-2.5 touch-manipulation"
                            >
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${assigned.length > 0 ? 'bg-indigo-500' : 'bg-amber-400'}`}></div>
                              <div className="flex justify-between items-center pl-1 touch-manipulation">
                                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 touch-manipulation">
                                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                                  <span>{loc}</span>
                                </h4>
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border ${
                                  assigned.length > 0 
                                    ? 'text-indigo-700 bg-indigo-50 border-indigo-100' 
                                    : 'text-amber-700 bg-amber-50 border-amber-100'
                                }`}>
                                  {assigned.length > 0 ? `${assigned.length} Görevli` : 'Boş Bölge'}
                                </span>
                              </div>
                              
                              {assigned.length === 0 ? (
                                <button
                                  onPointerDown={(e) => { e.preventDefault(); setSelectingCell({ loc, dayId: mobileRosterDayId, dIdx }); }}
                                  className="w-full flex items-center justify-center p-3 bg-slate-50 hover:bg-indigo-50/50 border border-dashed border-slate-300 hover:border-indigo-300 rounded-xl text-indigo-700 text-xs font-bold transition-all min-h-[44px] active:scale-[0.99] touch-manipulation"
                                >
                                  <Plus className="w-4 h-4 mr-1.5 text-indigo-600" /> Nöbetçi Öğretmen Ekle
                                </button>
                              ) : (
                                <div className="flex flex-col gap-2 pl-1 touch-manipulation">
                                  <div className="flex flex-col gap-1.5 touch-manipulation">
                                    {assigned.map(t => {
                                      const status = teacherStatuses[`${selectedCoverDate}_${t}`] || teacherStatuses[t] || 'aktif';
                                      const isNotActive = status !== 'aktif';
                                      const lessonCount = getLessonCount(t, dIdx);
                                      const isMultiple = getWeeklyDutyCount(t) > 1;

                                      let ringClass = 'bg-slate-50/80 text-slate-800 border-slate-200';
                                      if (isMultiple) ringClass = 'bg-amber-50 text-amber-900 border-amber-300';
                                      if (isNotActive) {
                                        if (status === 'görevli') ringClass = 'bg-blue-50 text-blue-800 border-blue-200';
                                        else if (status === 'raporlu') ringClass = 'bg-amber-50 text-amber-800 border-amber-200';
                                        else if (status === 'izinli') ringClass = 'bg-purple-50 text-purple-800 border-purple-200';
                                        else if (status === 'mazeretsiz') ringClass = 'bg-rose-50 text-rose-800 border-rose-200';
                                      }

                                      return (
                                        <div 
                                          key={t} 
                                          className={`font-bold text-xs p-2 rounded-xl border flex items-center justify-between gap-2 shadow-2xs ${ringClass}`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap touch-manipulation">
                                            <span className={`truncate ${isNotActive ? 'line-through text-slate-500' : ''}`}>{t}</span>
                                            <span className="text-[10px] font-bold text-slate-500 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded-md shrink-0">
                                              {lessonCount} Ders
                                            </span>
                                            {isMultiple && (
                                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5 touch-manipulation">
                                                <AlertTriangle className="w-3 h-3" /> 2. Nöbet
                                              </span>
                                            )}
                                            {isNotActive && (
                                              <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded shrink-0">
                                                {status}
                                              </span>
                                            )}
                                          </div>
                                          <button 
                                            onClick={(e) => removeAssignment(loc, mobileRosterDayId, t, e)}
                                            className="p-1.5 hover:bg-rose-100 hover:text-rose-700 text-slate-400 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 active:scale-95 touch-manipulation"
                                            title="Kaldır"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <button
                                    onPointerDown={(e) => { e.preventDefault(); setSelectingCell({ loc, dayId: mobileRosterDayId, dIdx }); }}
                                    className="mt-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[38px] active:scale-[0.99] touch-manipulation"
                                  >
                                    <Plus className="w-4 h-4" /> Öğretmen Ekle / Düzenle
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Warnings and stats at the bottom of the roster */}
            {/* Mobile View: Collapsible Segmented Tab View */}
            <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div 
                className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer touch-manipulation"
                onClick={() => setRosterWarningsCollapsed(!rosterWarningsCollapsed)}
              >
                <div className="flex items-center gap-2 touch-manipulation">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-xs text-slate-800">
                    Nöbet Kontrolleri & Uyarılar
                  </span>
                  <div className="flex items-center gap-1 touch-manipulation">
                    {unassignedTeachers.length > 0 && (
                      <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
                        {unassignedTeachers.length} Nöbetsiz
                      </span>
                    )}
                    {multipleDutyTeachers.length > 0 && (
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                        {multipleDutyTeachers.length} Çift Nöbet
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded-lg min-h-[42px] min-w-[42px] flex items-center justify-center touch-manipulation">
                  {rosterWarningsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!rosterWarningsCollapsed && (
                <div className="p-3">
                  {/* Segmented Tab Switcher */}
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-3 touch-manipulation">
                    <button
                      onClick={() => setRosterWarningsTab('unassigned')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                        rosterWarningsTab === 'unassigned'
                          ? 'bg-white text-rose-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Nöbetsizler ({unassignedTeachers.length})</span>
                    </button>
                    <button
                      onClick={() => setRosterWarningsTab('multiple')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                        rosterWarningsTab === 'multiple'
                          ? 'bg-white text-amber-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Birden Fazla ({multipleDutyTeachers.length})</span>
                    </button>
                  </div>

                  {/* Tab 1 Content */}
                  {rosterWarningsTab === 'unassigned' && (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {unassignedTeachers.length === 0 ? (
                        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 touch-manipulation">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Tüm dersi olan öğretmenlerin nöbet görevleri yazılmıştır (İdareciler muaftır).</span>
                        </div>
                      ) : (
                        unassignedTeachers.map(t => (
                          <div key={t} className="flex justify-between items-center p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl text-xs font-bold touch-manipulation">
                            <span className="text-rose-900">{t}</span>
                            <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                              Nöbet Yazılmadı
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab 2 Content */}
                  {rosterWarningsTab === 'multiple' && (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {multipleDutyTeachers.length === 0 ? (
                        <div className="text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl p-3 italic">
                          Hiçbir öğretmene birden fazla nöbet yazılmadı.
                        </div>
                      ) : (
                        multipleDutyTeachers.map(t => {
                          const count = getWeeklyDutyCount(t);
                          return (
                            <div key={t} className="flex justify-between items-center p-2 bg-amber-50/40 border border-amber-100 rounded-lg text-xs font-bold touch-manipulation">
                              <span className="text-amber-900">{t}</span>
                              <span className="text-xs font-black text-red-600 bg-red-100 px-2.5 py-0.5 rounded-full">
                                {count} Nöbet
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop View: Side-by-Side 2-Column Grid */}
            <div className="hidden md:grid grid-cols-2 gap-6">
                
                {/* Warning Card 1: Missing duties */}
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2 touch-manipulation">
                      <AlertCircle className="w-5 h-5 text-rose-500"/> Nöbet Yazılmayan Öğretmenler ({unassignedTeachers.length})
                    </h4>
                    <p className="text-xs text-slate-500 mb-3 sm:mb-4">Haftalık dersi olan fakat henüz hiçbir nöbet bölgesine atanmayan öğretmenler (Müdür ve müdür yardımcıları muaftır).</p>
                    
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                       {unassignedTeachers.length === 0 ? (
                         <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 touch-manipulation">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Tüm dersi olan öğretmenlerin nöbet görevleri yazılmıştır (İdareciler muaftır).
                         </div>
                       ) : (
                         unassignedTeachers.map(t => (
                            <div key={t} className="flex justify-between items-center p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs font-bold touch-manipulation">
                               <span className="text-rose-900">{t}</span>
                               <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">Yetersiz Nöbet</span>
                            </div>
                         ))
                       )}
                    </div>
                </div>

                {/* Warning Card 2: Multiple duties */}
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2 touch-manipulation">
                      <AlertTriangle className="w-5 h-5 text-amber-500"/> Birden Fazla Nöbet Tutanlar ({multipleDutyTeachers.length})
                    </h4>
                    <p className="text-xs text-slate-500 mb-3 sm:mb-4">Haftalık programda birden fazla nöbet alan öğretmenler (Kırmızı çerçeveyle işaretlenmişlerdir).</p>
                    
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                       {multipleDutyTeachers.length === 0 ? (
                         <div className="text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl p-3 italic">
                           Hiçbir öğretmene birden fazla nöbet yazılmadı.
                         </div>
                       ) : (
                         multipleDutyTeachers.map(t => {
                            const count = getWeeklyDutyCount(t);
                            return (
                              <div key={t} className="flex justify-between items-center p-2 bg-amber-50/30 border border-amber-100 rounded-lg text-xs font-bold touch-manipulation">
                                 <span className="text-amber-900">{t}</span>
                                 <span className="text-xs font-black text-red-600 bg-red-100 px-2.5 py-0.5 rounded-full">{count} Nöbet</span>
                              </div>
                            );
                         })
                       )}
                    </div>
                </div>

            </div>

          </div>
        )}

        {activeTab === 'range' && (
          <DutyRangeTab
            printStartDate={printStartDate}
            setPrintStartDate={setPrintStartDate}
            printEndDate={printEndDate}
            setPrintEndDate={setPrintEndDate}
            rotateTeachers={rotateTeachers}
            setRotateTeachers={setRotateTeachers}
            alternateAdmins={alternateAdmins}
            setAlternateAdmins={setAlternateAdmins}
            showWeekends={showWeekends}
            setShowWeekends={setShowWeekends}
            markHolidays={markHolidays}
            setMarkHolidays={val => {
              setMarkHolidays(val);
              localStorage.setItem('ataturk_duty_mark_holidays', String(val));
            }}
            printFontSize={printFontSize}
            setPrintFontSize={val => {
              setPrintFontSize(val);
              localStorage.setItem('ataturk_duty_print_fontsize', val);
            }}
            printOrientation={printOrientation}
            setPrintOrientation={val => {
              setPrintOrientation(val);
              localStorage.setItem('ataturk_duty_print_orientation', val);
            }}
            printPageSize={printPageSize}
            setPrintPageSize={val => {
              setPrintPageSize(val);
              localStorage.setItem('ataturk_duty_print_pagesize', val);
            }}
            printMargin={printMargin}
            setPrintMargin={val => {
              setPrintMargin(val);
              localStorage.setItem('ataturk_duty_print_margin', val);
            }}
            printRowsPerPage={printRowsPerPage}
            setPrintRowsPerPage={val => {
              setPrintRowsPerPage(val);
              localStorage.setItem('ataturk_duty_print_rows_per_page', String(val));
            }}
            calculateRangeStats={calculateRangeStats}
            onPrintRange={() => executePrint('range', printYear, printMonth, printStartDate, printEndDate)}
            onPrintWeekly={() => executePrint('weekly', printYear, printMonth)}
            onPrintMonthly={() => executePrint('monthly', printYear, printMonth)}
            onExportRangeExcel={() => exportDutyRangeToExcel({
              startDate: printStartDate,
              endDate: printEndDate,
              dutyLocations,
              dutyAssignments,
              dutyAdmins,
              adminRoles,
              adminSchedule,
              activeDays,
              rotateTeachers,
              alternateAdmins,
              showWeekends,
              markHolidays,
              userHolidays,
              academicYearStartDate,
              principalName,
              principalTitle,
              generalRules,
              attentionRules
            })}
            onExportWeeklyExcel={() => exportWeeklyDutyToExcel({
              activeDays,
              dutyLocations,
              dutyAssignments,
              dutyAdmins,
              adminRoles,
              adminSchedule,
              principalName,
              principalTitle,
              generalRules,
              attentionRules
            })}
            academicYearStartDate={academicYearStartDate}
            setAcademicYearStartDate={setAcademicYearStartDate}
            activeDays={activeDays}
            dutyLocations={dutyLocations}
            dutyAssignments={dutyAssignments}
            dutyAdmins={dutyAdmins}
            adminRoles={adminRoles}
            adminSchedule={adminSchedule}
            teachers={teachers}
            userHolidays={userHolidays}
            onToggleUserHoliday={handleToggleUserHoliday}
            onAddUserHoliday={handleAddUserHoliday}
            onRemoveUserHoliday={handleRemoveUserHoliday}
            principalName={principalName}
          />
        )}

      </div>

      {/* Select Teacher Assignment Modal */}
      {selectingCell && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 sm:p-4 touch-manipulation" onClick={() => setSelectingCell(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md flex flex-col max-h-[90vh] sm:max-h-[85vh] relative touch-manipulation" onClick={e => e.stopPropagation()}>
             
             <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0 touch-none touch-manipulation">
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
             
             {/* Modal Header */}
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sm:rounded-t-2xl shrink-0 sticky top-0 z-10 touch-manipulation">
                <div>
                   <h3 className="font-black text-slate-800 text-sm sm:text-base">{selectingCell.loc} Nöbetçisi</h3>
                   <p className="text-xs sm:text-sm font-medium text-slate-500">{activeDays.find(d => d.id === selectingCell.dayId)?.name} Günü</p>
                </div>
                <button 
                  onClick={() => { setSelectingCell(null); setSelectingTeacherSearch(''); }} 
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             {/* Modal Search / List of teachers */}
             <div className="p-3.5 sm:p-4 overflow-y-auto custom-scrollbar flex-1 pb-24 sm:pb-4 touch-manipulation">
               {/* Search Bar */}
               <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={selectingTeacherSearch}
                    onChange={(e) => setSelectingTeacherSearch(e.target.value)}
                    placeholder="Öğretmen ara..."
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-h-[42px]"
                  />
                  {selectingTeacherSearch && (
                    <button 
                      onClick={() => setSelectingTeacherSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
               </div>

               {/* Filter Pills for Quick Selection on Mobile */}
               <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x hide-scrollbar mb-3 pb-1 touch-manipulation">
                 <button
                   onClick={() => setSelectingTeacherFilter('all')}
                   className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[42px] ${
                     selectingTeacherFilter === 'all'
                       ? 'bg-indigo-600 text-white shadow-xs'
                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                   }`}
                 >
                   Tümü ({teachers.length})
                 </button>
                 <button
                   onClick={() => setSelectingTeacherFilter('recommended')}
                   className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[42px] flex items-center gap-1 ${
                     selectingTeacherFilter === 'recommended'
                       ? 'bg-emerald-600 text-white shadow-xs'
                       : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                   }`}
                 >
                   <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Önerilen (3-4 D)
                 </button>
                 <button
                   onClick={() => setSelectingTeacherFilter('available')}
                   className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[42px] flex items-center gap-1 ${
                     selectingTeacherFilter === 'available'
                       ? 'bg-slate-700 text-white shadow-xs'
                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                   }`}
                 >
                   Uygun (0-2 D)
                 </button>
                 <button
                   onClick={() => setSelectingTeacherFilter('unassigned')}
                   className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[42px] flex items-center gap-1 ${
                     selectingTeacherFilter === 'unassigned'
                       ? 'bg-rose-600 text-white shadow-xs'
                       : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                   }`}
                 >
                   Nöbetsizler ({unassignedTeachers.length})
                 </button>
               </div>

               <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Öğretmen Listesi
               </p>
               <div className="space-y-2">
                 {teachers
                   .filter(teacher => selectingTeacherSearch.trim() === '' || teacher.toLowerCase().includes(selectingTeacherSearch.toLowerCase().trim()))
                   .filter(teacher => {
                     if (selectingTeacherFilter === 'all') return true;
                     const lessonCount = getLessonCount(teacher, selectingCell.dIdx);
                     if (selectingTeacherFilter === 'recommended') return lessonCount >= 3 && lessonCount <= 4;
                     if (selectingTeacherFilter === 'available') return lessonCount <= 2;
                     if (selectingTeacherFilter === 'unassigned') {
                       return !isTeacherAdmin(teacher) && 
                              !exemptTeachers.some(e => e.trim().toLowerCase() === teacher.trim().toLowerCase()) && 
                              getWeeklyDutyCount(teacher) === 0;
                     }
                     return true;
                   })
                   .map(teacher => {
                    const isAdmin = isTeacherAdmin(teacher);
                    const isExempt = exemptTeachers.some(e => e.trim().toLowerCase() === teacher.trim().toLowerCase()) || isAdmin;
                    const lessonCount = getLessonCount(teacher, selectingCell.dIdx);
                    const isRecommended = lessonCount >= 3 && lessonCount <= 4;
                    const isHeavy = lessonCount >= 5;
                    const isAssigned = (dutyAssignments[`${selectingCell.loc}_${selectingCell.dayId}`] || []).includes(teacher);
                    
                    // Show warning if already assigned elsewhere this week (but not strictly blocking)
                    const dutyCount = getWeeklyDutyCount(teacher);
                    const showWarning = dutyCount >= 1 && !isAssigned; 

                    return (
                      <div 
                        key={teacher} 
                        onClick={() => {
                          if (isAdmin) {
                            setErrorMessage(`${teacher} nöbetçi idareci olarak tanımlanmıştır. Nöbetçi idareciler tanımlanmış nöbet yerlerinde nöbet tutamaz.`);
                            setTimeout(() => setErrorMessage(''), 4500);
                            return;
                          }
                          if (isExempt) {
                             if (confirm(`${teacher} nöbetten muaf olarak işaretlenmiş. Yine de nöbet yazmak istiyor musunuz?`)) {
                               toggleAssignment(selectingCell.loc, selectingCell.dayId, teacher);
                             }
                          } else {
                             toggleAssignment(selectingCell.loc, selectingCell.dayId, teacher);
                          }
                        }}
                        className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${isAssigned ? 'border-indigo-500 bg-indigo-50 shadow-sm' : isAdmin ? 'border-amber-200 bg-amber-50/40 opacity-70 cursor-not-allowed' : isExempt ? 'border-red-100 bg-red-50/30 opacity-60 hover:opacity-100' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                      >
                         <div className="flex items-center gap-3 min-w-0 touch-manipulation">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${isAssigned ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                               {isAssigned && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`font-bold truncate ${isAssigned ? 'text-indigo-900' : isAdmin ? 'text-amber-800' : isExempt ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {teacher}
                            </span>
                         </div>
                         <div className="flex items-center gap-1.5 flex-wrap shrink-0 mt-1 sm:mt-0 touch-manipulation">
                            {isAdmin ? <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">NÖBETÇİ İDARECİ</span> : isExempt && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">MUAF</span>}
                            {showWarning && !isExempt && <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1 touch-manipulation"><AlertTriangle className="w-3 h-3"/> Zaten Nöbeti Var</span>}
                            {(() => {
                               const status = teacherStatuses[teacher] || 'aktif';
                               if (status !== 'aktif') {
                                 const statusColors = {
                                   görevli: 'bg-blue-100 text-blue-800 border-blue-200',
                                   raporlu: 'bg-amber-100 text-amber-800 border-amber-200',
                                   izinli: 'bg-purple-100 text-purple-800 border-purple-200',
                                   mazeretsiz: 'bg-rose-100 text-rose-800 border-rose-200'
                                 };
                                 return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${statusColors[status] || ''}`}>{status}</span>;
                               }
                               return null;
                             })()}
                            {isRecommended && !showWarning && !isExempt && (teacherStatuses[teacher] || 'aktif') === 'aktif' && <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Önerilen</span>}
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${isRecommended ? 'bg-emerald-50 text-emerald-600' : isHeavy ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                              {lessonCount} Ders
                            </span>
                         </div>
                      </div>
                    )
                 })}
               </div>
             </div>
             
             {/* Modal Footer */}
             <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 sm:rounded-b-2xl shrink-0 flex justify-end sticky bottom-0 z-10 w-full touch-manipulation">
                <button 
                  onClick={() => { setSelectingCell(null); setSelectingTeacherSearch(''); }} 
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-sm min-h-[44px] flex items-center justify-center touch-manipulation"
                >
                   Tamamla
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Advanced Print & Preview Dialog */}
      
      {/* Quick Cover Modal */}
      {showQuickCoverModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 touch-manipulation" onClick={() => setShowQuickCoverModal(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] pb-6 sm:pb-0 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 touch-manipulation" onClick={e => e.stopPropagation()}>
             <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0 touch-none touch-manipulation">
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 touch-manipulation">
                <h3 className="font-black text-slate-800 flex items-center gap-2 touch-manipulation">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Hızlı Gelmeyen Bildirimi
                </h3>
                <button onClick={() => setShowQuickCoverModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors touch-manipulation">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar touch-manipulation">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personel Seçin</label>
                   <div className="relative">
                     <select 
                       value={quickCoverTeacher} 
                       onChange={(e) => setQuickCoverTeacher(e.target.value)}
                       className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-indigo-500 min-h-[44px] appearance-none"
                     >
                        <option value="">-- Personel Seç --</option>
                        {teachers.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                     </select>
                     <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                   </div>
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Durum</label>
                   <div className="relative">
                     <select 
                       value={quickCoverStatus} 
                       onChange={(e) => setQuickCoverStatus(e.target.value)}
                       className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-indigo-500 min-h-[44px] appearance-none"
                     >
                        <option value="raporlu">Raporlu</option>
                        <option value="izinli">İzinli</option>
                        <option value="görevli">Görevli</option>
                        <option value="mazeretsiz">Mazeretsiz</option>
                     </select>
                     <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                   </div>
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-start gap-2 mt-2 touch-manipulation">
                   <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                   <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                     Kaydet'e bastığınızda personelin durumu güncellenecek, boş geçen derslerine uygun nöbetçi öğretmenler <b>otomatik olarak atanacak</b> ve tebliğ ekranı açılacaktır.
                   </p>
                </div>
             </div>
             
             <div className="p-4 border-t border-slate-200 sm:bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shrink-0 touch-manipulation">
                <button onClick={() => setShowQuickCoverModal(false)} className="w-full sm:w-auto px-4 py-2.5 font-bold text-slate-500 hover:text-slate-700 transition-colors min-h-[44px] flex items-center justify-center touch-manipulation">İptal</button>
                <button onClick={handleQuickCoverSubmit} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 min-h-[44px] flex items-center justify-center touch-manipulation">
                   Kaydet ve Dağıt
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Share Announcement Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 touch-manipulation" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] pb-6 sm:pb-0 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 touch-manipulation" onClick={e => e.stopPropagation()}>
             <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0 touch-none touch-manipulation">
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0 touch-manipulation">
                <h3 className="font-black text-slate-800 flex items-center gap-2 touch-manipulation">
                  <FileText className="w-5 h-5 text-indigo-600" /> Tebliğ / Duyuru Paylaş
                </h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors touch-manipulation">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-5 flex-1 overflow-y-auto custom-scrollbar touch-manipulation">
                <p className="text-xs text-slate-500 font-medium mb-3">Bu metni kopyalayarak WhatsApp vb. kanallardan idari gruplarınızla paylaşabilirsiniz.</p>
                <textarea 
                  readOnly 
                  value={generateShareText()} 
                  className="w-full h-[280px] sm:h-[350px] p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm text-slate-700 outline-none resize-none focus:border-indigo-400"
                ></textarea>
             </div>
             
             <div className="p-4 border-t border-slate-200 sm:bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shrink-0 touch-manipulation">
                <button onClick={() => setShowShareModal(false)} className="w-full sm:w-auto px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors min-h-[44px] flex items-center justify-center touch-manipulation">Kapat</button>
                <button 
                  onClick={() => {
                     navigator.clipboard.writeText(generateShareText());
                     if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(30);
                     }
                     setSuccessMessage("Metin panoya kopyalandı!");
                     setTimeout(() => setSuccessMessage(''), 3000);
                  }} 
                  className="w-full sm:w-auto bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-xs hover:bg-slate-900 flex items-center justify-center gap-2 min-h-[44px] active:scale-95 touch-manipulation"
                >
                   <ClipboardCheck className="w-4 h-4"/> Kopyala
                </button>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(generateShareText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-xs hover:bg-emerald-700 flex items-center justify-center gap-2 min-h-[44px] active:scale-95 touch-manipulation"
                >
                   WhatsApp'ta Paylaş
                </a>
             </div>
          </div>
        </div>
      )}

      {printModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 sm:p-4 touch-manipulation" onClick={() => setPrintModalOpen(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm flex flex-col max-h-[90vh] sm:max-h-[85vh] relative touch-manipulation" onClick={e => e.stopPropagation()}>
             <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0 touch-none touch-manipulation">
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sm:rounded-t-2xl shrink-0 sticky top-0 z-10 touch-manipulation">
                <div>
                   <h3 className="font-black text-slate-800">Çizelge Yazdır</h3>
                   <p className="text-sm font-medium text-slate-500">Yazdırma türünü ve seçeneklerini seçin.</p>
                </div>
                <button onClick={() => setPrintModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors touch-manipulation">
                  <X className="w-6 h-6 sm:w-5 sm:h-5" />
                </button>
             </div>
             
             <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pb-24 sm:pb-6 touch-manipulation">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Çıktı Türü</label>
                  
                  {/* Segmented Tab Navigation for Print Types */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-2.5 border border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setPrintType('weekly')}
                      className={`py-2 px-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        printType === 'weekly' 
                          ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Haftalık</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintType('monthly')}
                      className={`py-2 px-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        printType === 'monthly' 
                          ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Aylık</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintType('yearly')}
                      className={`py-2 px-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        printType === 'yearly' 
                          ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Yıllık</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintType('range')}
                      className={`py-2 px-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        printType === 'range' 
                          ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300' 
                          : 'text-slate-700 hover:text-indigo-700 hover:bg-white/50'
                      }`}
                    >
                      <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Tarih Aralığı</span>
                    </button>
                  </div>

                  <select value={printType} onChange={(e) => setPrintType(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500">
                     <option value="weekly">Haftalık Şablon</option>
                     <option value="monthly">Aylık Çizelge</option>
                     <option value="yearly">Yıllık Çizelge</option>
                     <option value="range">📅 Tarih Aralığı (Özel Aralık Çizelgesi)</option>
                  </select>
                </div>

                {printType === 'range' && (
                  <div className="space-y-3 bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                        <CalendarRange className="w-4 h-4 text-indigo-600 shrink-0" /> Özel Tarih Aralığı
                      </span>
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                        Dinamik Dağıtım
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Başlangıç Tarihi</label>
                        <input 
                          type="date"
                          value={printStartDate}
                          onChange={(e) => setPrintStartDate(e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Bitiş Tarihi</label>
                        <input 
                          type="date"
                          value={printEndDate}
                          onChange={(e) => setPrintEndDate(e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hızlı Aralık:</span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date();
                            const day = today.getDay();
                            const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
                            const mon = new Date(today.setDate(diffToMonday));
                            const fri = new Date(mon);
                            fri.setDate(fri.getDate() + 4);
                            setPrintStartDate(mon.toISOString().split('T')[0]);
                            setPrintEndDate(fri.toISOString().split('T')[0]);
                          }}
                          className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                        >
                          Bu Hafta
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date();
                            const day = today.getDay();
                            const diffToNextMon = today.getDate() - (day === 0 ? 6 : day - 1) + 7;
                            const nextMon = new Date(today.setDate(diffToNextMon));
                            const nextFri = new Date(nextMon);
                            nextFri.setDate(nextFri.getDate() + 4);
                            setPrintStartDate(nextMon.toISOString().split('T')[0]);
                            setPrintEndDate(nextFri.toISOString().split('T')[0]);
                          }}
                          className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                        >
                          Gelecek Hafta
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date();
                            const end = new Date();
                            end.setDate(end.getDate() + 14);
                            setPrintStartDate(today.toISOString().split('T')[0]);
                            setPrintEndDate(end.toISOString().split('T')[0]);
                          }}
                          className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                        >
                          15 Gün
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                            setPrintStartDate(firstDay.toISOString().split('T')[0]);
                            setPrintEndDate(lastDay.toISOString().split('T')[0]);
                          }}
                          className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                        >
                          Bu Ay
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const firstDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                            const lastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                            setPrintStartDate(firstDay.toISOString().split('T')[0]);
                            setPrintEndDate(lastDay.toISOString().split('T')[0]);
                          }}
                          className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                        >
                          Gelecek Ay
                        </button>
                      </div>
                    </div>

                    {/* Stats Info */}
                    <div className="bg-white/80 border border-indigo-100 p-2.5 rounded-xl text-xs text-indigo-950 flex items-center justify-between">
                      <div>
                        <span className="font-black">{calculateRangeStats(printStartDate, printEndDate).total} Gün</span>
                        <span className="text-slate-500 font-medium"> ({calculateRangeStats(printStartDate, printEndDate).weekdays} iş günü)</span>
                      </div>
                      <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        ~{calculateRangeStats(printStartDate, printEndDate).pages} Sayfa A4
                      </div>
                    </div>
                  </div>
                )}

                {printType === 'monthly' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Yıl (Takvim Yılı)</label>
                    <select value={printYear} onChange={(e) => setPrintYear(parseInt(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500">
                       <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                       <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                       <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                       <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                       <option value={new Date().getFullYear() + 2}>{new Date().getFullYear() + 2}</option>
                    </select>
                  </div>
                )}

                {printType === 'yearly' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Eğitim Yılı (Başlangıç Yılı)</label>
                    <select value={printYear} onChange={(e) => setPrintYear(parseInt(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500">
                       <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                       <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                       <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                       <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                       <option value={new Date().getFullYear() + 2}>{new Date().getFullYear() + 2}</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Seçilen yılın Eylül ayından sonraki yılın Haziran ayına kadar olan dönem çizelgesini hazırlar.</p>
                  </div>
                )}

                {printType === 'monthly' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ay</label>
                    <select value={printMonth} onChange={(e) => setPrintMonth(parseInt(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500">
                       <option value={8}>Eylül</option>
                       <option value={9}>Ekim</option>
                       <option value={10}>Kasım</option>
                       <option value={11}>Aralık</option>
                       <option value={0}>Ocak</option>
                       <option value={1}>Şubat</option>
                       <option value={2}>Mart</option>
                       <option value={3}>Nisan</option>
                       <option value={4}>Mayıs</option>
                       <option value={5}>Haziran</option>
                    </select>
                  </div>
                )}

                {(printType === 'monthly' || printType === 'range') && (
                   <div className="space-y-2 mt-2 border-t border-slate-100 pt-3">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Otomatik Dağıtım ve Planlama</label>
                     
                     <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg touch-manipulation">
                        <input 
                          type="checkbox" 
                          checked={rotateTeachers} 
                          onChange={e => setRotateTeachers(e.target.checked)} 
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-xs font-semibold text-slate-700">Öğretmenleri Haftalık Döndür (Rotasyon)</span>
                     </label>

                     <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg touch-manipulation">
                        <input 
                          type="checkbox" 
                          checked={alternateAdmins} 
                          onChange={e => setAlternateAdmins(e.target.checked)} 
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-xs font-semibold text-slate-700">İdarecileri Günlük Sırayla Değiştir</span>
                     </label>

                     <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg touch-manipulation">
                        <input 
                          type="checkbox" 
                          checked={showWeekends} 
                          onChange={e => setShowWeekends(e.target.checked)} 
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-xs font-semibold text-slate-700">Hafta Sonu Günlerini Göster (Gri Satır)</span>
                     </label>

                     <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 rounded-xl transition-colors touch-manipulation">
                        <input 
                          type="checkbox" 
                          checked={markHolidays} 
                          onChange={e => {
                            setMarkHolidays(e.target.checked);
                            localStorage.setItem('ataturk_duty_mark_holidays', String(e.target.checked));
                          }} 
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold text-rose-950 block">Resmi Tatilleri Otomatik İşle ("Resmi Tatil" Yaz)</span>
                          <span className="text-[10.5px] text-rose-700 block leading-tight">
                            Yılbaşı, Ramazan & Kurban Bayramı, 23 Nisan, 1 Mayıs, 19 Mayıs, 29 Ekim, Ara ve Yarıyıl Tatil günlerinde nöbet planlamaz, karşısına "Resmi Tatil" yazar.
                          </span>
                        </div>
                     </label>
                   </div>
                )}
             </div>
             
             <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 touch-manipulation">
                <button onClick={() => setPrintModalOpen(false)} className="w-full sm:w-auto px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors min-h-[44px] flex items-center justify-center touch-manipulation">İptal</button>
                <button onClick={() => {
                   let y = printYear;
                   let m = printMonth;
                   executePrint(printType, y, m, printStartDate, printEndDate);
                   setPrintModalOpen(false);
                }} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-95 flex items-center justify-center gap-2 min-h-[44px] touch-manipulation">
                   <Printer className="w-4 h-4"/> {printType === 'range' ? 'Tarih Aralığı Çizelgesini Yazdır' : 'Önizle / Yazdır'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Consolidated Duty Settings Modal */}
      {isSettingsModalOpen && (
        <DutySettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          dutyLocations={dutyLocations}
          setDutyLocations={setDutyLocations}
          dutyAssignments={dutyAssignments}
          setDutyAssignments={setDutyAssignments}
          exemptTeachers={exemptTeachers}
          setExemptTeachers={setExemptTeachers}
          dutyAdmins={dutyAdmins}
          setDutyAdmins={setDutyAdmins}
          adminRoles={adminRoles}
          setAdminRoles={setAdminRoles}
          adminSchedule={adminSchedule}
          setAdminSchedule={setAdminSchedule}
          generalRules={generalRules}
          setGeneralRules={setGeneralRules}
          attentionRules={attentionRules}
          setAttentionRules={setAttentionRules}
          principalName={principalName}
          setPrincipalName={setPrincipalName}
          principalTitle={principalTitle}
          setPrincipalTitle={setPrincipalTitle}
          teachers={teachers}
          schedules={schedules}
          activeDays={activeDays}
          onSaveAll={handleSaveAll}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {/* Mobile Sticky Action Bar above Bottom Nav */}
      <div className="md:hidden fixed bottom-[58px] left-0 right-0 p-2.5 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex gap-2 touch-manipulation max-w-lg mx-auto">
          <button 
            onClick={() => setShowQuickCoverModal(true)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-xs py-2.5 px-3.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 transition-all touch-manipulation"
          >
            <Zap className="w-4 h-4 text-indigo-200" />
            <span>Hızlı Bildir</span>
          </button>
          
          <button 
            onClick={() => setShowShareModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs py-2.5 px-4.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 transition-all shrink-0 touch-manipulation"
          >
            <Share2 className="w-4 h-4 text-emerald-200" />
            <span>Tebliğ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
