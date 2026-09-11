import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CalendarRange, Calendar, Printer, Search, Users, ShieldCheck, 
  Flag, Plus, X, Check, Trash2, CalendarDays, FileSpreadsheet,
  Sliders, Type, Layout, FileDown, Layers, RefreshCw, Compass,
  ChevronDown, ChevronUp, Download, Eye, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { getAcademicWeekIndex, getShiftedTeachersForLocation, getDefaultAcademicYearStart, getAdminForDutyDate } from '../utils/dutyRotationUtils';

interface DutyRangeTabProps {
  printStartDate: string;
  setPrintStartDate: (val: string) => void;
  printEndDate: string;
  setPrintEndDate: (val: string) => void;
  rotateTeachers: boolean;
  setRotateTeachers: (val: boolean) => void;
  alternateAdmins: boolean;
  setAlternateAdmins: (val: boolean) => void;
  showWeekends: boolean;
  setShowWeekends: (val: boolean) => void;
  markHolidays?: boolean;
  setMarkHolidays?: (val: boolean) => void;
  printFontSize?: string;
  setPrintFontSize?: (val: string) => void;
  printOrientation?: 'landscape' | 'portrait';
  setPrintOrientation?: (val: 'landscape' | 'portrait') => void;
  printPageSize?: 'A4' | 'A3';
  setPrintPageSize?: (val: 'A4' | 'A3') => void;
  printMargin?: 'compact' | 'normal' | 'wide';
  setPrintMargin?: (val: 'compact' | 'normal' | 'wide') => void;
  printRowsPerPage?: number;
  setPrintRowsPerPage?: (val: number) => void;
  academicYearStartDate?: string;
  setAcademicYearStartDate?: (val: string) => void;
  calculateRangeStats: (start: string, end: string) => { 
    total: number; 
    weekdays: number; 
    holidays?: number; 
    dutyDays?: number; 
    pages: number;
  };
  onPrintRange: () => void;
  onPrintWeekly?: () => void;
  onPrintMonthly?: () => void;
  onExportRangeExcel?: () => void;
  onExportWeeklyExcel?: () => void;
  activeDays: { id: number; name: string }[];
  dutyLocations: string[];
  dutyAssignments: Record<string, string[]>;
  dutyAdmins: string[];
  adminRoles: Record<string, string>;
  adminSchedule: Record<number, string>;
  teachers: any[];
  userHolidays: string[];
  onToggleUserHoliday: (dateStr: string) => void;
  onAddUserHoliday: (dateStr: string) => void;
  onRemoveUserHoliday: (dateStr: string) => void;
  principalName?: string;
}

export default function DutyRangeTab({
  printStartDate,
  setPrintStartDate,
  printEndDate,
  setPrintEndDate,
  rotateTeachers,
  setRotateTeachers,
  alternateAdmins,
  setAlternateAdmins,
  showWeekends,
  setShowWeekends,
  markHolidays = true,
  setMarkHolidays,
  printFontSize = '7.5pt',
  setPrintFontSize,
  printOrientation = 'landscape',
  setPrintOrientation,
  printPageSize = 'A4',
  setPrintPageSize,
  printMargin = 'compact',
  setPrintMargin,
  printRowsPerPage = 26,
  setPrintRowsPerPage,
  academicYearStartDate = getDefaultAcademicYearStart(),
  setAcademicYearStartDate,
  calculateRangeStats,
  onPrintRange,
  onPrintWeekly,
  onPrintMonthly,
  onExportRangeExcel,
  onExportWeeklyExcel,
  activeDays,
  dutyLocations,
  dutyAssignments,
  dutyAdmins,
  adminRoles,
  adminSchedule,
  teachers,
  userHolidays = [],
  onToggleUserHoliday,
  onAddUserHoliday,
  onRemoveUserHoliday,
  principalName = ''
}: DutyRangeTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [customHolidayInput, setCustomHolidayInput] = useState('');
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  // Helper to check if someone is principal (principals NEVER hold duty)
  const isPrincipal = (name: string) => {
    if (!name) return false;
    const n = name.trim().toLowerCase();
    if (principalName && n === principalName.trim().toLowerCase()) return true;
    if (adminRoles[name] === 'Okul Müdürü') return true;
    const role = (adminRoles[name] || '').toLowerCase();
    if (role.includes('müdür') && !role.includes('yardımc')) return true;
    return false;
  };

  // Only assistant principals hold duty
  const eligibleDutyAdmins = useMemo(() => {
    return dutyAdmins.filter(adm => !isPrincipal(adm));
  }, [dutyAdmins, adminRoles, principalName]);

  const stats = useMemo(() => {
    return calculateRangeStats(printStartDate, printEndDate);
  }, [printStartDate, printEndDate, calculateRangeStats]);

  // Generate list of days within the range
  const rangeDays = useMemo(() => {
    if (!printStartDate || !printEndDate) return [];
    const start = new Date(printStartDate);
    const end = new Date(printEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

    const days: {
      date: Date;
      dateStr: string;
      isoDate: string;
      dayOfWeek: number; // 0: Sunday, 1: Monday, ...
      dayName: string;
      isWeekend: boolean;
      activeDayId: number | null;
      occurrenceIndex: number;
      academicWeekIndex: number;
      schoolDayIndex: number;
      isUserHoliday: boolean;
    }[] = [];

    const dayOccurrences: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
    let schoolDayCount = 0;

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      const isoDate = `${y}-${m}-${d}`;
      const dateStr = `${d}.${m}.${y}`;

      const isUserHoliday = userHolidays.includes(isoDate);
      const isHoliday = markHolidays && isUserHoliday;
      
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      const activeDayObj = activeDays.find(ad => ad.id === (dayOfWeek === 0 ? 7 : dayOfWeek));

      const occurrence = dayOccurrences[dayOfWeek] || 0;
      if (!isHoliday) {
        dayOccurrences[dayOfWeek] = occurrence + 1;
        if (!isWeekend) {
          schoolDayCount++;
        }
      }

      const academicWeekIdx = getAcademicWeekIndex(current, academicYearStartDate);

      days.push({
        date: new Date(current),
        dateStr,
        isoDate,
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        isWeekend,
        activeDayId: activeDayObj ? activeDayObj.id : null,
        occurrenceIndex: occurrence,
        academicWeekIndex: academicWeekIdx,
        schoolDayIndex: schoolDayCount - 1,
        isUserHoliday
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [printStartDate, printEndDate, activeDays, markHolidays, userHolidays, academicYearStartDate]);

  // Visible days after weekend filtering
  const filteredDays = useMemo(() => {
    if (showWeekends) return rangeDays;
    return rangeDays.filter(d => !d.isWeekend);
  }, [rangeDays, showWeekends]);

  // Helper to get assistant principal for a specific day (strictly preserving weekly admin schedule & rotation anchor)
  const getAdminForDay = (day: typeof rangeDays[0]) => {
    return getAdminForDutyDate({
      date: day.date,
      weekDayId: day.dayOfWeek,
      adminSchedule,
      eligibleDutyAdmins,
      activeDays,
      rotateAdmins: alternateAdmins,
      academicYearStartDate,
      isPrincipal,
      isHoliday: Boolean(markHolidays && day.isUserHoliday),
      isWeekend: day.isWeekend
    });
  };

  // Helper to get assigned teachers for a location using continuous annual rotation
  const getAssignedTeachers = (location: string, day: typeof rangeDays[0]) => {
    if (markHolidays && day.isUserHoliday) return [];
    if (!day.activeDayId) return [];

    return getShiftedTeachersForLocation({
      targetLocation: location,
      dutyLocations,
      dutyAssignments,
      weekDayId: day.activeDayId,
      weekIndex: day.academicWeekIndex,
      rotateTeachers,
      isPrincipal
    });
  };

  // Calculate duty counts per teacher across the selected range
  const teacherStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredDays.forEach(day => {
      if (day.isWeekend || (markHolidays && day.isUserHoliday)) return;
      dutyLocations.forEach(loc => {
        const assigned = getAssignedTeachers(loc, day);
        assigned.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      });
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredDays, dutyLocations, rotateTeachers, dutyAssignments, markHolidays]);

  return (
    <div className="flex flex-col gap-4 touch-manipulation pb-16">
      {/* Top Configuration & Action Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-5">
        {/* Streamlined Action Buttons Bar - Grouped & Clean */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-3.5">
          {/* Quick Summary Pill / Toggle Settings */}
          <div className="flex items-center justify-between lg:justify-start gap-2">
            <button
              type="button"
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[40px] touch-manipulation active:scale-95"
              title="Ayar ve filtreleme panelini gizle / göster"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{isConfigExpanded ? 'Ayarları Gizle' : 'Ayarları Düzenle'}</span>
              {isConfigExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>

            {/* Quick KPI stats preview */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
              <span className="text-indigo-700">{stats.dutyDays || stats.weekdays} İş Günü</span>
              <span>•</span>
              <span className="text-slate-500">{stats.pages} Sayfa</span>
            </div>
          </div>

          {/* Grouped Actions: Excel & Print */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto">
            {/* Excel Group */}
            <div className="flex items-center gap-1 bg-emerald-50/80 p-1 rounded-xl border border-emerald-200/90 shadow-2xs">
              {onExportRangeExcel && (
                <button
                  type="button"
                  onClick={onExportRangeExcel}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3 py-2 rounded-lg font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 min-h-[38px] active:scale-95 touch-manipulation"
                  title="Seçili tarih aralığını Excel (.xlsx) olarak indir"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-emerald-100" />
                  <span className="truncate">Excel Çıktısı</span>
                </button>
              )}
              {onExportWeeklyExcel && (
                <button
                  type="button"
                  onClick={onExportWeeklyExcel}
                  className="bg-white hover:bg-emerald-100 active:bg-emerald-200 text-emerald-900 px-2.5 py-2 rounded-lg font-bold text-xs transition-all border border-emerald-300/80 flex items-center justify-center gap-1 min-h-[38px] active:scale-95 touch-manipulation"
                  title="Haftalık nöbet tablosunu Excel olarak indir"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">Haftalık</span>
                </button>
              )}
            </div>

            {/* Print & PDF Group */}
            <div className="flex items-center gap-1 bg-indigo-50/80 p-1 rounded-xl border border-indigo-200/90 shadow-2xs">
              <button
                type="button"
                onClick={onPrintRange}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-2 rounded-lg font-black text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 min-h-[38px] active:scale-95 touch-manipulation"
                title="Seçili tarih aralığı çizelgesini yazdır veya PDF olarak kaydet"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Yazdır / PDF</span>
              </button>

              {onPrintWeekly && (
                <button
                  type="button"
                  onClick={onPrintWeekly}
                  className="bg-white hover:bg-indigo-100 active:bg-indigo-200 text-slate-800 px-2.5 py-2 rounded-lg font-bold text-xs transition-all border border-slate-300/80 flex items-center justify-center gap-1 min-h-[38px] active:scale-95 touch-manipulation"
                  title="Haftalık nöbet dağıtım çizelgesini yazdır"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Haftalık</span>
                </button>
              )}

              {onPrintMonthly && (
                <button
                  type="button"
                  onClick={onPrintMonthly}
                  className="bg-white hover:bg-indigo-100 active:bg-indigo-200 text-slate-800 px-2.5 py-2 rounded-lg font-bold text-xs transition-all border border-slate-300/80 flex items-center justify-center gap-1 min-h-[38px] active:scale-95 touch-manipulation"
                  title="Aylık nöbet çizelgesini yazdır"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Aylık</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Settings Area */}
        {isConfigExpanded && (
          <div className="flex flex-col gap-3.5 transition-all">
            {/* Date Range & Page Layout / Font Settings Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end bg-slate-50/80 p-3 sm:p-4 rounded-xl border border-slate-200/90">
              {/* 1. Start Date */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Başlangıç Tarihi
                </label>
                <input 
                  type="date"
                  value={printStartDate}
                  onChange={e => setPrintStartDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-2xs min-h-[40px]"
                />
              </div>

              {/* 2. End Date */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <CalendarRange className="w-3.5 h-3.5 text-indigo-600" />
                  Bitiş Tarihi
                </label>
                <input 
                  type="date"
                  value={printEndDate}
                  onChange={e => setPrintEndDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-2xs min-h-[40px]"
                />
              </div>

              {/* 3. Font Size (Yazı Puntosu) */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-indigo-600" />
                  Yazı Puntosu
                </label>
                <select
                  value={printFontSize}
                  onChange={e => setPrintFontSize && setPrintFontSize(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-2xs min-h-[40px]"
                >
                  <option value="6.5px">6.5 pt (Çok Küçük)</option>
                  <option value="7px">7.0 pt (Kompakt)</option>
                  <option value="7.5px">7.5 pt (Varsayılan Standart)</option>
                  <option value="8px">8.0 pt (Orta Okunaklı)</option>
                  <option value="8.5px">8.5 pt (Büyük)</option>
                  <option value="9px">9.0 pt (Çok Büyük)</option>
                </select>
              </div>

              {/* 4. Page Layout & Orientation (Sayfa Yapısı) */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Layout className="w-3.5 h-3.5 text-indigo-600" />
                  Sayfa Yapısı
                </label>
                <select
                  value={`${printPageSize}_${printOrientation}`}
                  onChange={e => {
                    const [size, orient] = e.target.value.split('_');
                    if (setPrintPageSize) setPrintPageSize(size as 'A4' | 'A3');
                    if (setPrintOrientation) setPrintOrientation(orient as 'landscape' | 'portrait');
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-2xs min-h-[40px]"
                >
                  <option value="A4_landscape">A4 Yatay (Standart)</option>
                  <option value="A4_portrait">A4 Dikey</option>
                  <option value="A3_landscape">A3 Yatay (Büyük)</option>
                  <option value="A3_portrait">A3 Dikey</option>
                </select>
              </div>

              {/* 5. Page Rows / Page Count Optimization */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Sayfa / Satır Sığdırma
                </label>
                <select
                  value={printRowsPerPage}
                  onChange={e => setPrintRowsPerPage && setPrintRowsPerPage(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-2xs min-h-[40px]"
                >
                  <option value={31}>31 Satır (1 Ay / 5 Hafta - Tek Sayfa)</option>
                  <option value={26}>26 Satır/Sayfa (Standart)</option>
                  <option value={20}>20 Satır/Sayfa (Geniş)</option>
                  <option value={15}>15 Satır/Sayfa</option>
                  <option value={9999}>Tümünü Tek Sayfaya Sığdır</option>
                </select>
              </div>
            </div>

            {/* Dynamic Rotation & Distribution Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 cursor-pointer transition-colors shadow-2xs">
                <input 
                  type="checkbox"
                  checked={rotateTeachers}
                  onChange={e => setRotateTeachers(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="min-w-0">
                  <span className="block text-xs font-black text-indigo-950 flex items-center gap-1 truncate">
                    <RefreshCw className="w-3 h-3 text-indigo-600 shrink-0" />
                    Yıllık Kesintisiz Rotasyon
                  </span>
                  <span className="block text-[11px] font-medium text-indigo-700 truncate">Sıfırlanmadan akar</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs" title={alternateAdmins ? "Haftalık rotasyon hafızasına göre idareciler her hafta 1 sıra devreder" : "Haftalık çizelgede belirlenen idareciler ilgili günlerde (Pazartesi-Cuma) sabit tutulur"}>
                <input 
                  type="checkbox"
                  checked={alternateAdmins}
                  onChange={e => setAlternateAdmins(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="min-w-0">
                  <span className="block text-xs font-black text-slate-800 truncate">İdareci Rotasyonu</span>
                  <span className="block text-[11px] font-medium text-slate-500 truncate">{alternateAdmins ? 'Haftalık rotasyonla devret' : 'Haftalık çizelgeyi koru (Sabit)'}</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                <input 
                  type="checkbox"
                  checked={showWeekends}
                  onChange={e => setShowWeekends(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="min-w-0">
                  <span className="block text-xs font-black text-slate-800 truncate">Hafta Sonu Günleri</span>
                  <span className="block text-[11px] font-medium text-slate-500 truncate">Cumartesi / Pazar dahil</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 cursor-pointer transition-colors shadow-2xs">
                <input 
                  type="checkbox"
                  checked={markHolidays}
                  onChange={e => setMarkHolidays && setMarkHolidays(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <div className="min-w-0">
                  <span className="block text-xs font-black text-rose-950 flex items-center gap-1 truncate">
                    <Flag className="w-3 h-3 text-rose-600 shrink-0" />
                    Resmi Tatilleri Göster
                  </span>
                  <span className="block text-[11px] font-medium text-rose-700 truncate">Tatillere nöbet yazma</span>
                </div>
              </label>
            </div>

            {/* Continuous Rotation Academic Year Anchor Setting */}
            {rotateTeachers && (
              <div className="p-3 bg-gradient-to-r from-indigo-50/80 to-blue-50/60 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      Yıllık Kesintisiz Rotasyon Hafızası Aktif
                      <span className="text-[10px] font-black uppercase bg-indigo-200/80 text-indigo-900 px-1.5 py-0.2 rounded">
                        Yıl Boyu Sürekli
                      </span>
                    </h4>
                    <p className="text-[11px] font-medium text-indigo-700">
                      Her ay başında nöbet yerleri başa sarmaz; eğitim yılı boyunca her hafta bir sonraki bölgeye düzenli olarak devreder.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    1. Hafta Başlangıcı:
                  </label>
                  <input 
                    type="date"
                    value={academicYearStartDate}
                    onChange={e => setAcademicYearStartDate && setAcademicYearStartDate(e.target.value)}
                    className="p-1.5 rounded-lg border border-indigo-200 bg-white font-bold text-xs text-indigo-900 focus:ring-2 focus:ring-indigo-200 outline-none shadow-2xs min-h-[36px]"
                    title="Eğitim-Öğretim Yılı 1. Hafta Başlangıç Tarihi"
                  />
                  <button
                    type="button"
                    onClick={() => setAcademicYearStartDate && setAcademicYearStartDate(getDefaultAcademicYearStart())}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs min-h-[36px]"
                    title="Varsayılan Eylül başlangıcına sıfırla"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User-Controlled Official Holidays Section */}
        <div className="mt-4 pt-4 border-t border-slate-100 bg-rose-50/30 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl border-t border-rose-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600 shrink-0" />
                <h3 className="text-xs sm:text-sm font-black text-rose-950">
                  Nöbet Tutulmayan Resmi Tatil Günleri (Kullanıcı İşaretleme)
                </h3>
              </div>
              <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                Ay içinde nöbet tutulmayacak bayram veya resmi tatil günlerini aşağıdan ekleyin ya da aşağıdaki tablodan doğrudan işaretleyin.
              </p>
            </div>

            {/* Add Date Input */}
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={customHolidayInput}
                onChange={e => setCustomHolidayInput(e.target.value)}
                className="p-1.5 sm:p-2 rounded-xl border border-rose-200 bg-white font-bold text-xs text-rose-950 outline-none focus:ring-2 focus:ring-rose-300"
              />
              <button
                type="button"
                onClick={() => {
                  if (customHolidayInput) {
                    onAddUserHoliday(customHolidayInput);
                    setCustomHolidayInput('');
                  }
                }}
                disabled={!customHolidayInput}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tatil Ekle</span>
              </button>
            </div>
          </div>

          {/* List of Marked Holidays */}
          <div className="flex flex-wrap items-center gap-1.5">
            {userHolidays.length === 0 ? (
              <span className="text-xs font-semibold text-slate-400 italic">
                Henüz işaretlenmiş resmi tatil günü yok. Tatil olan günleri ekleyebilir veya tablodaki satırlardan "Tatil İşaretle" butonuna tıklayabilirsiniz.
              </span>
            ) : (
              userHolidays.map(dateStr => {
                const parts = dateStr.split('-');
                const formatted = parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : dateStr;
                return (
                  <span 
                    key={dateStr}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-rose-950 font-bold text-xs shadow-2xs group"
                  >
                    <Flag className="w-3 h-3 text-rose-600" />
                    <span>{formatted}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveUserHoliday(dateStr)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      title="Tatili Kaldır"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Range Information Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-black text-indigo-950 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              {stats.total} Gün Toplam
            </span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="font-bold text-slate-700">
              {stats.weekdays} Hafta İçi
            </span>
            {(stats.holidays ?? 0) > 0 && (
              <>
                <span className="text-slate-400 font-bold">•</span>
                <span className="font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Flag className="w-3 h-3 text-rose-600" />
                  {stats.holidays} Gün Resmi Tatil
                </span>
              </>
            )}
            <span className="text-slate-400 font-bold">•</span>
            <span className="font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {stats.dutyDays ?? stats.weekdays} Aktif Nöbet Günü
            </span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="font-bold text-slate-600">
              {dutyLocations.length} Nöbet Alanı
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-1 bg-white text-indigo-700 rounded-lg border border-indigo-100 shadow-2xs">
              Tahmini Çıktı: ~{stats.pages} Sayfa A4
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Preview Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Çizelge Önizlemesi ({filteredDays.length} Gün)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Öğretmen veya Gün ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-indigo-500 w-full sm:w-48"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tüm Nöbet Alanları ({dutyLocations.length})</option>
              {dutyLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Live Table */}
        <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 shadow-2xs">
              <tr>
                <th className="p-3 font-black text-slate-700 border-r border-slate-200 w-36 whitespace-nowrap bg-slate-100">
                  Tarih & Gün
                </th>
                <th className="p-3 font-black text-indigo-950 border-r border-slate-200 w-52 whitespace-normal leading-tight bg-indigo-50/60">
                  Nöbetçi Müdür Yardımcısı
                </th>
                {(selectedLocation === 'all' ? dutyLocations : [selectedLocation]).map(loc => (
                  <th key={loc} className="p-3 font-black text-slate-700 border-r border-slate-200 min-w-[140px] whitespace-nowrap">
                    {loc}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDays.length === 0 ? (
                <tr>
                  <td colSpan={dutyLocations.length + 2} className="p-8 text-center text-slate-400 font-semibold">
                    Geçerli bir tarih aralığı seçiniz.
                  </td>
                </tr>
              ) : (
                filteredDays.map((day, idx) => {
                  const admin = getAdminForDay(day);
                  const isWeekend = day.isWeekend;
                  const isHoliday = markHolidays && day.isUserHoliday;
                  const rowBg = isWeekend 
                    ? 'bg-slate-50/80 text-slate-400' 
                    : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30';

                  // Apply search term filter
                  if (searchTerm.trim()) {
                    const term = searchTerm.toLowerCase();
                    const matchDay = day.dateStr.toLowerCase().includes(term) || day.dayName.toLowerCase().includes(term);
                    const matchAdmin = admin && admin.toLowerCase().includes(term);
                    const matchTeacher = dutyLocations.some(loc => {
                      const assigned = getAssignedTeachers(loc, day);
                      return assigned.some(t => t.toLowerCase().includes(term));
                    });
                    const matchHoliday = isHoliday && 'resmi tatil'.includes(term);
                    if (!matchDay && !matchAdmin && !matchTeacher && !matchHoliday) return null;
                  }

                  // Render Official Holiday row
                  if (isHoliday) {
                    const colSpanCount = (selectedLocation === 'all' ? dutyLocations.length : 1) + 1;
                    return (
                      <tr key={day.dateStr} className="bg-rose-50/70 hover:bg-rose-100/50 border-l-4 border-l-rose-500 transition-colors">
                        <td className="p-2.5 font-bold border-r border-slate-200/80 whitespace-nowrap bg-rose-50/80">
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-rose-950 font-black">{day.dateStr}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-rose-200 text-rose-900">
                                {day.dayName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveUserHoliday(day.isoDate)}
                              className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-200 hover:bg-rose-50"
                              title="Resmi Tatil İşaretini Kaldır"
                            >
                              Tatili Kaldır
                            </button>
                          </div>
                        </td>
                        <td colSpan={colSpanCount} className="p-2.5 text-center bg-rose-50/30">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-200/90 font-black text-xs uppercase tracking-wider">
                              <Flag className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              RESMİ TATİL
                            </span>
                            <span className="text-[11px] font-bold text-rose-700">
                              Kullanıcı İşaretli Tatil — Nöbet Görevi Tutulmaz
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={day.dateStr} className={`transition-colors hover:bg-indigo-50/20 ${rowBg}`}>
                      <td className="p-2.5 font-bold border-r border-slate-200/80 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={isWeekend ? 'text-slate-500' : 'text-slate-900'}>
                              {day.dateStr}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                              isWeekend ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {day.dayName}
                            </span>
                          </div>

                          {!isWeekend && (
                            <button
                              type="button"
                              onClick={() => onToggleUserHoliday(day.isoDate)}
                              className="text-[10px] text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition-colors"
                              title="Resmi Tatil Olarak İşaretle (Nöbet Tutulmaz)"
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-2.5 border-r border-slate-200/80 font-bold whitespace-normal break-words bg-indigo-50/20">
                        {isWeekend ? (
                          <span className="text-slate-400 italic font-medium">Hafta Sonu</span>
                        ) : admin ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="text-indigo-950 font-black">{admin}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {(selectedLocation === 'all' ? dutyLocations : [selectedLocation]).map(loc => {
                        const assigned = isWeekend ? [] : getAssignedTeachers(loc, day);
                        return (
                          <td key={loc} className="p-2.5 border-r border-slate-200/80 font-semibold align-top">
                            {isWeekend ? (
                              <span className="text-slate-300">-</span>
                            ) : assigned.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assigned.map(t => (
                                  <span 
                                    key={t}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      searchTerm && t.toLowerCase().includes(searchTerm.toLowerCase())
                                        ? 'bg-amber-200 text-amber-950 ring-1 ring-amber-400'
                                        : 'bg-slate-100 text-slate-800'
                                    }`}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300 italic">Boş</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Teacher Distribution Summary Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" /> Bu Aralıkta Öğretmen Nöbet Dağılımı ({teacherStats.length} Öğretmen)
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Ortalama: {(teacherStats.reduce((acc, curr) => acc + curr[1], 0) / (teacherStats.length || 1)).toFixed(1)} nöbet
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1">
            {teacherStats.map(([name, count]) => (
              <div 
                key={name} 
                className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold shadow-2xs"
              >
                <span className="text-slate-800">{name}</span>
                <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
