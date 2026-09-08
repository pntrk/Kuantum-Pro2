import React, { useState, useRef, useEffect, useMemo } from 'react';
import lodash from 'lodash';
const { debounce } = lodash;
import EditableText from './components/EditableText';
import DutyManager from './components/DutyManager';
import { DeepPredictiveAnalysisModal } from './components/DeepPredictiveAnalysisModal';
import { QuantumTelemetryModal } from './components/QuantumTelemetryModal';
import { ConflictInspectorModal } from './components/ConflictInspectorModal';
import { SpotlightPaletteModal } from './components/SpotlightPaletteModal';
import { SplitCompareModal } from './components/SplitCompareModal';
import { ExportReportingModal } from './components/ExportReportingModal';
import { QuantumWorkerBridge } from './services/quantumWorkerBridge';
import { globalErrorHandler } from './services/globalErrorHandler';
import { backgroundTaskManager } from './services/backgroundTaskManager';
import { TaskType } from './types/taskManagerTypes';
import { CoreProgressState, WorkerRecoveryInfo } from './types/workerMessages';
import { ShadowAnalysisResult, DifficultyHeatmapMatrix, DeadEndWarning } from './types/shadowAnalysisTypes';
import { motion, AnimatePresence } from 'motion/react';
import { Play,  
  Check, HelpCircle, ArrowRight, ClipboardCheck, Users, Calendar, AlertTriangle, Printer, FileSpreadsheet,
  Search, Save, Wand2, Lock, Unlock, FileText, FolderOpen, FilePlus,
  Book, Settings2, Settings, Clock, AlertCircle, LayoutGrid, Eraser, Presentation, Upload, CheckCircle2, 
  Plus, Trash2, Edit2, X, ArrowRightLeft, LayoutList, Ban, ChevronDown, ListFilter, Activity, Info, Download, Layers, MapPin, ImageIcon, ZoomIn, ZoomOut
, Cpu, Brain, Paintbrush, Flame, ShieldAlert, Sparkles, TrendingUp, Gauge, Eye, EyeOff, Grid, Cloud } from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { initDriveAuth, uploadDriveBackupFile, findDriveBackupFile, getStoredAccessToken } from './services/googleDriveService';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileTimelineView } from './components/MobileTimelineView';
import { MobileQuickActionSheet, MobileQuickActionTarget } from './components/MobileQuickActionSheet';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_SETTINGS = {
  weekDays: [
    { id: 1, name: 'Pazartesi', active: true, periods: 9 },
    { id: 2, name: 'Salı', active: true, periods: 9 },
    { id: 3, name: 'Çarşamba', active: true, periods: 9 },
    { id: 4, name: 'Perşembe', active: true, periods: 9 },
    { id: 5, name: 'Cuma', active: true, periods: 9 },
    { id: 6, name: 'Cumartesi', active: false, periods: 4 },
    { id: 7, name: 'Pazar', active: false, periods: 0 }
  ],
  lessonTimes: Array.from({length: 15}).map((_, i) => ({
    start: `${String(8 + Math.floor(i * 0.8)).padStart(2, '0')}:${String((30 + (i * 50)) % 60).padStart(2, '0')}`,
    end: `${String(9 + Math.floor(i * 0.8)).padStart(2, '0')}:${String((10 + (i * 50)) % 60).padStart(2, '0')}`
  }))
};

const SUBJECT_PALETTES = [
  { bg: 'bg-emerald-50/90', border: 'border-emerald-200/80', text: 'text-emerald-950', accent: 'border-l-emerald-500', tag: 'bg-emerald-100 text-emerald-800' },
  { bg: 'bg-sky-50/90', border: 'border-sky-200/80', text: 'text-sky-950', accent: 'border-l-sky-500', tag: 'bg-sky-100 text-sky-800' },
  { bg: 'bg-indigo-50/90', border: 'border-indigo-200/80', text: 'text-indigo-950', accent: 'border-l-indigo-500', tag: 'bg-indigo-100 text-indigo-800' },
  { bg: 'bg-amber-50/90', border: 'border-amber-200/80', text: 'text-amber-950', accent: 'border-l-amber-500', tag: 'bg-amber-100 text-amber-800' },
  { bg: 'bg-purple-50/90', border: 'border-purple-200/80', text: 'text-purple-950', accent: 'border-l-purple-500', tag: 'bg-purple-100 text-purple-800' },
  { bg: 'bg-rose-50/90', border: 'border-rose-200/80', text: 'text-rose-950', accent: 'border-l-rose-500', tag: 'bg-rose-100 text-rose-800' },
  { bg: 'bg-teal-50/90', border: 'border-teal-200/80', text: 'text-teal-950', accent: 'border-l-teal-500', tag: 'bg-teal-100 text-teal-800' },
  { bg: 'bg-cyan-50/90', border: 'border-cyan-200/80', text: 'text-cyan-950', accent: 'border-l-cyan-500', tag: 'bg-cyan-100 text-cyan-800' },
  { bg: 'bg-violet-50/90', border: 'border-violet-200/80', text: 'text-violet-950', accent: 'border-l-violet-500', tag: 'bg-violet-100 text-violet-800' },
  { bg: 'bg-fuchsia-50/90', border: 'border-fuchsia-200/80', text: 'text-fuchsia-950', accent: 'border-l-fuchsia-500', tag: 'bg-fuchsia-100 text-fuchsia-800' },
  { bg: 'bg-blue-50/90', border: 'border-blue-200/80', text: 'text-blue-950', accent: 'border-l-blue-500', tag: 'bg-blue-100 text-blue-800' },
  { bg: 'bg-orange-50/90', border: 'border-orange-200/80', text: 'text-orange-950', accent: 'border-l-orange-500', tag: 'bg-orange-100 text-orange-800' },
  { bg: 'bg-lime-50/90', border: 'border-lime-200/80', text: 'text-lime-950', accent: 'border-l-lime-500', tag: 'bg-lime-100 text-lime-800' }
];

const getColorForSubject = (subjectName: string, isElective?: boolean) => {
  if (isElective) {
    return 'bg-amber-50/90 border-amber-300 text-amber-950 border-l-amber-500';
  }
  if (!subjectName) return 'bg-slate-50 border-slate-200 text-slate-800 border-l-slate-400';
  
  const norm = subjectName.toLowerCase().trim();
  // Semantic Department Color Matches
  if (norm.includes('matematik') || norm.includes('mat')) return 'bg-sky-50/95 border-sky-200 text-sky-950 border-l-sky-500';
  if (norm.includes('türkçe') || norm.includes('edebiyat')) return 'bg-rose-50/95 border-rose-200 text-rose-950 border-l-rose-500';
  if (norm.includes('fen') || norm.includes('fizik') || norm.includes('kimya') || norm.includes('biyoloji')) return 'bg-emerald-50/95 border-emerald-200 text-emerald-950 border-l-emerald-500';
  if (norm.includes('sosyal') || norm.includes('tarih') || norm.includes('coğrafya') || norm.includes('inkılap')) return 'bg-amber-50/95 border-amber-200 text-amber-950 border-l-amber-500';
  if (norm.includes('ingilizce') || norm.includes('yabancı') || norm.includes('almanca')) return 'bg-purple-50/95 border-purple-200 text-purple-950 border-l-purple-500';
  if (norm.includes('din') || norm.includes('ahlak')) return 'bg-teal-50/95 border-teal-200 text-teal-950 border-l-teal-500';
  if (norm.includes('beden') || norm.includes('spor')) return 'bg-lime-50/95 border-lime-200 text-lime-950 border-l-lime-500';
  if (norm.includes('müzik') || norm.includes('görsel') || norm.includes('resim') || norm.includes('sanat')) return 'bg-fuchsia-50/95 border-fuchsia-200 text-fuchsia-950 border-l-fuchsia-500';
  if (norm.includes('bilişim') || norm.includes('kodlama') || norm.includes('teknoloji')) return 'bg-indigo-50/95 border-indigo-200 text-indigo-950 border-l-indigo-500';

  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pal = SUBJECT_PALETTES[Math.abs(hash) % SUBJECT_PALETTES.length];
  return `${pal.bg} ${pal.border} ${pal.text} ${pal.accent}`;
};

const parseCellData = (valStr) => {
    if (!valStr || typeof valStr !== 'string') return null;
    try {
        const parsed = JSON.parse(valStr);
        const resolvedSpan = parsed.span || parsed.hours || 1;
        return {
            id: parsed.id || generateId(),
            teachers: Array.isArray(parsed.teachers) ? parsed.teachers : (parsed.teacher ? [parsed.teacher] : []),
            classes: Array.isArray(parsed.classes) ? parsed.classes : (parsed.cls ? [parsed.cls] : []),
            rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
            subject: parsed.subject || "",
            span: resolvedSpan,
            hours: parsed.hours || resolvedSpan
        };
    } catch (e) {
        const parts = valStr.split('::');
        const entity1 = parts[0] || '';
        const subj = parts[1] || '';
        return {
            id: generateId(),
            teachers: [entity1], 
            classes: [entity1], 
            rooms: [],
            subject: subj,
            span: 1,
            hours: 1
        };
    }
};

const LOCAL_STORAGE_WORKSPACE_KEY = 'kuantum_pro_local_workspace_state';

export const isWorkspaceDataEmpty = (data: any): boolean => {
  if (!data) return true;
  const hasTeachers = Array.isArray(data.teachers) && data.teachers.length > 0;
  const hasClasses = Array.isArray(data.classes) && data.classes.length > 0;
  const hasSubjects = Array.isArray(data.subjects) && data.subjects.length > 0;
  const hasUnplaced = Array.isArray(data.unplacedCourses) && data.unplacedCourses.length > 0;
  const hasSchedules = data.schedules && Object.keys(data.schedules).length > 0 && 
    Object.values(data.schedules).some((ts: any) => Array.isArray(ts) && ts.some((row: any) => Array.isArray(row) && row.some((c: any) => Boolean(c && c !== ''))));
  const hasDutyAssignments = data.dutyData && data.dutyData.assignments && Object.keys(data.dutyData.assignments).length > 0;
  
  // A workspace is truly empty if it has no teachers, no classes, no subjects, no schedules, and no duty assignments.
  // We explicitly DO NOT check for dutyData.locations or dutyData.admins because these might be pre-populated
  // from cache or defaults and do not indicate a real, populated workspace.
  return !hasTeachers && !hasClasses && !hasSubjects && !hasUnplaced && !hasSchedules && !hasDutyAssignments;
};

const rebuildClassAndRoomSchedules = (
  teacherSchedules: Record<string, string[][]>, 
  classesList: string[], 
  roomsList: string[]
) => {
  const newClassSchedules: Record<string, string[][]> = {};
  (classesList || []).forEach(c => {
    newClassSchedules[c] = Array.from({ length: 7 }).map(() => Array(15).fill(''));
  });

  const newRoomSchedules: Record<string, string[][]> = {};
  (roomsList || []).forEach(r => {
    newRoomSchedules[r] = Array.from({ length: 7 }).map(() => Array(15).fill(''));
  });

  if (teacherSchedules) {
    Object.entries(teacherSchedules).forEach(([teacher, days]) => {
      if (!Array.isArray(days)) return;
      days.forEach((day, dIdx) => {
        if (!Array.isArray(day)) return;
        day.forEach((cellVal, pIdx) => {
          if (cellVal && cellVal !== '') {
            const cData = parseCellData(cellVal);
            if (cData) {
              cData.classes?.forEach((c: string) => {
                if (!newClassSchedules[c]) {
                  newClassSchedules[c] = Array.from({ length: 7 }).map(() => Array(15).fill(''));
                }
                if (newClassSchedules[c][dIdx]) {
                  newClassSchedules[c][dIdx][pIdx] = cellVal;
                }
              });
              cData.rooms?.forEach((r: string) => {
                if (!newRoomSchedules[r]) {
                  newRoomSchedules[r] = Array.from({ length: 7 }).map(() => Array(15).fill(''));
                }
                if (newRoomSchedules[r][dIdx]) {
                  newRoomSchedules[r][dIdx][pIdx] = cellVal;
                }
              });
            }
          }
        });
      });
    });
  }

  return { newClassSchedules, newRoomSchedules };
};

const getInitialLocalWorkspace = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WORKSPACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && !isWorkspaceDataEmpty(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn('Initial local workspace read warning:', e);
  }
  return null;
};

function App() {
  const initialWs = useMemo(() => getInitialLocalWorkspace(), []);

  const [mainTab, setMainTab] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 'preview' : 'matrix');
  const [poolMenuOpen, setPoolMenuOpen] = useState(false);
  const [lockMenuOpen, setLockMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState(initialWs?.schoolSettings || DEFAULT_SETTINGS);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  
  const [schoolInfo, setSchoolInfo] = useState(initialWs?.schoolInfo || { name: 'Belirtilmedi', year: '2025-2026', principal: '', vicePrincipal: '' });
  const [teachers, setTeachers] = useState<string[]>(initialWs?.teachers || []);
  const [classes, setClasses] = useState<string[]>(initialWs?.classes || []);
  const [subjects, setSubjects] = useState<string[]>(initialWs?.subjects || []);
  const [rooms, setRooms] = useState<string[]>(initialWs?.rooms || []); 
  const [shortNames, setShortNames] = useState<Record<string, string>>(initialWs?.shortNames || {}); 
  
  const [schedules, setSchedules] = useState<Record<string, string[][]>>(initialWs?.schedules || {}); 
  const [classSchedules, setClassSchedules] = useState<Record<string, string[][]>>(() => {
    if (initialWs?.classSchedules && Object.keys(initialWs.classSchedules).length > 0) {
      return initialWs.classSchedules;
    }
    if (initialWs?.schedules && initialWs?.classes) {
      return rebuildClassAndRoomSchedules(initialWs.schedules, initialWs.classes, initialWs.rooms || []).newClassSchedules;
    }
    return {};
  }); 
  const [roomSchedules, setRoomSchedules] = useState<Record<string, string[][]>>(() => {
    if (initialWs?.roomSchedules && Object.keys(initialWs.roomSchedules).length > 0) {
      return initialWs.roomSchedules;
    }
    if (initialWs?.schedules && initialWs?.rooms) {
      return rebuildClassAndRoomSchedules(initialWs.schedules, initialWs.classes || [], initialWs.rooms).newRoomSchedules;
    }
    return {};
  }); 

  const subjectSchedules = useMemo(() => {
    const result = {};
    subjects.forEach(sub => {
      result[sub] = Array.from({length: 7}).map(() => Array(15).fill(null));
    });
    
    const seenCards = new Set();
    
    Object.entries(schedules).forEach(([teacher, teacherSched]) => {
      if (!Array.isArray(teacherSched)) return;
      teacherSched.forEach((daySched, dIdx) => {
        if (!Array.isArray(daySched)) return;
        daySched.forEach((cellVal, pIdx) => {
          if (cellVal && cellVal !== '') {
            const cData = parseCellData(cellVal);
            if (cData && cData.subject) {
              const sub = cData.subject;
              if (result[sub]) {
                const cardKey = `${cData.id}-${dIdx}-${pIdx}`;
                if (!seenCards.has(cardKey)) {
                  seenCards.add(cardKey);
                  if (!result[sub][dIdx][pIdx]) {
                    result[sub][dIdx][pIdx] = [];
                  }
                  result[sub][dIdx][pIdx].push(cData);
                }
              }
            }
          }
        });
      });
    });
    
    const finalResult = {};
    subjects.forEach(sub => {
      finalResult[sub] = Array.from({length: 7}).map(() => Array(15).fill(''));
      for (let d = 0; d < 7; d++) {
        for (let p = 0; p < 15; p++) {
          const cards = result[sub][d][p];
          if (cards && cards.length > 0) {
            if (cards.length === 1) {
              finalResult[sub][d][p] = JSON.stringify(cards[0]);
            } else {
              const mergedTeachers = [];
              const mergedClasses = [];
              const mergedRooms = [];
              cards.forEach(c => {
                c.teachers?.forEach(t => { if (!mergedTeachers.includes(t)) mergedTeachers.push(t); });
                c.classes?.forEach(cl => { if (!mergedClasses.includes(cl)) mergedClasses.push(cl); });
                c.rooms?.forEach(r => { if (!mergedRooms.includes(r)) mergedRooms.push(r); });
              });
              
              finalResult[sub][d][p] = JSON.stringify({
                id: `merged-${sub}-${d}-${p}`,
                teachers: mergedTeachers,
                classes: mergedClasses,
                rooms: mergedRooms,
                subject: sub,
                span: 1,
                isMerged: true
              });
            }
          }
        }
      }
    });
    
    return finalResult;
  }, [schedules, subjects]);

  const [lockedCells, setLockedCells] = useState(initialWs?.lockedCells || {}); 
  const [unplacedCourses, _setUnplacedCourses] = useState(initialWs?.unplacedCourses || []);
  const setUnplacedCourses = (action) => {
      _setUnplacedCourses(prev => {
          const nextState = typeof action === 'function' ? action(prev) : action;
          const seen = new Set();
          return nextState.filter(card => {
              if (!card || !card.id) return true; // Keep cards without id just in case
              if (seen.has(card.id)) return false;
              seen.add(card.id);
              return true;
          });
      });
  }; 
  const [constraints, setConstraints] = useState(initialWs?.constraints || { teachers: {}, classes: {}, subjects: {}, rooms: {} });
  const draggedItemRef = useRef<any>(null);

  // Safe Set-based calculation for total workload (Table + Pool) to prevent duplicate counting
  const calculateSafeTotalWorkload = (entityType, entityName) => {
      const processedIds = new Set();
      let totalHours = 0;

      unplacedCourses.forEach(card => {
          if (!card || !card.id) return;
          let matches = false;
          if (entityType === 'teacher' && card.teachers?.includes(entityName)) matches = true;
          else if (entityType === 'class' && card.classes?.includes(entityName)) matches = true;
          else if (entityType === 'room' && card.rooms?.includes(entityName)) matches = true;
          else if (entityType === 'subject' && card.subject === entityName) matches = true;

          if (matches && !processedIds.has(card.id)) {
              processedIds.add(card.id);
              totalHours += parseInt(card.hours || 1, 10);
          }
      });

      const dataMaster = entityType === 'teacher' ? schedules : entityType === 'class' ? classSchedules : roomSchedules;
      const activeDays = schoolSettings.weekDays.filter(d => d.active);

      if (entityType !== 'subject' && dataMaster[entityName]) {
          activeDays.forEach(day => {
              const absDIdx = day.id - 1;
              for (let pIdx = 0; pIdx < day.periods; pIdx++) {
                  const val = dataMaster[entityName][absDIdx]?.[pIdx];
                  if (val && val !== '') {
                      const cData = parseCellData(val);
                      if (cData && !processedIds.has(cData.id)) {
                          processedIds.add(cData.id);
                          let span = parseInt(cData.span || (cData as any).hours || 1, 10);
                          if (span <= 1) {
                              let s = 1;
                              while (pIdx + s < day.periods) {
                                  const nextVal = dataMaster[entityName][absDIdx]?.[pIdx + s];
                                  if (!nextVal) break;
                                  const nextCData = parseCellData(nextVal);
                                  if (nextCData && nextCData.id === cData.id) {
                                      s++;
                                  } else {
                                      break;
                                  }
                              }
                              span = s;
                          }
                          totalHours += span;
                          pIdx += span - 1;
                      }
                  }
              }
          });
      }

      if (entityType === 'subject') {
          Object.values(schedules).forEach(tSched => {
              activeDays.forEach(day => {
                  const absDIdx = day.id - 1;
                  for (let pIdx = 0; pIdx < day.periods; pIdx++) {
                      const val = tSched[absDIdx]?.[pIdx];
                      if (val && val !== '') {
                          const cData = parseCellData(val);
                          if (cData && cData.subject === entityName && !processedIds.has(cData.id)) {
                              processedIds.add(cData.id);
                              let span = parseInt(cData.span || (cData as any).hours || 1, 10);
                              if (span <= 1) {
                                  let s = 1;
                                  while (pIdx + s < day.periods) {
                                      const nextVal = tSched[absDIdx]?.[pIdx + s];
                                      if (!nextVal) break;
                                      const nextCData = parseCellData(nextVal);
                                      if (nextCData && nextCData.id === cData.id) {
                                          s++;
                                      } else {
                                          break;
                                      }
                                  }
                                  span = s;
                              }
                              totalHours += span;
                              pIdx += span - 1;
                          }
                      }
                  }
              });
          });
      }

      return totalHours;
  };





  // Global drag cleanup listener
  useEffect(() => {
    const clearIndicators = () => {
      draggedItemRef.current = null;
      document.querySelectorAll('.droppable-valid, .droppable-invalid').forEach(el => {
        el.classList.remove('droppable-valid', 'droppable-invalid');
      });
    };
    window.addEventListener('dragend', clearIndicators);
    window.addEventListener('drop', clearIndicators);
    return () => {
      window.removeEventListener('dragend', clearIndicators);
      window.removeEventListener('drop', clearIndicators);
    };
  }, []);

  // Keep teachers, classes, subjects, rooms in sync with all cards in schedules and unplacedCourses
  useEffect(() => {
    let changed = false;
    const currentTeachers = [...teachers];
    const currentClasses = [...classes];
    const currentSubjects = [...subjects];
    const currentRooms = [...rooms];

    const foundTeachers = new Set(currentTeachers);
    const foundClasses = new Set(currentClasses);
    const foundSubjects = new Set(currentSubjects);
    const foundRooms = new Set(currentRooms);

    // Scan unplacedCourses
    unplacedCourses.forEach(c => {
      if (c.subject && !foundSubjects.has(c.subject)) {
        foundSubjects.add(c.subject);
        changed = true;
      }
      c.teachers?.forEach(t => {
        if (t && !foundTeachers.has(t)) {
          foundTeachers.add(t);
          changed = true;
        }
      });
      c.classes?.forEach(cl => {
        if (cl && !foundClasses.has(cl)) {
          foundClasses.add(cl);
          changed = true;
        }
      });
      c.rooms?.forEach(r => {
        if (r && !foundRooms.has(r)) {
          foundRooms.add(r);
          changed = true;
        }
      });
    });

    // Scan schedules (placed cards)
    Object.values(schedules).forEach(teacherSched => {
      if (!Array.isArray(teacherSched)) return;
      teacherSched.forEach(daySched => {
        if (!Array.isArray(daySched)) return;
        daySched.forEach(cellVal => {
          if (cellVal && cellVal !== '') {
            const cData = parseCellData(cellVal);
            if (cData) {
              if (cData.subject && !foundSubjects.has(cData.subject)) {
                foundSubjects.add(cData.subject);
                changed = true;
              }
              cData.teachers?.forEach(t => {
                if (t && !foundTeachers.has(t)) {
                  foundTeachers.add(t);
                  changed = true;
                }
              });
              cData.classes?.forEach(cl => {
                if (cl && !foundClasses.has(cl)) {
                  foundClasses.add(cl);
                  changed = true;
                }
              });
              cData.rooms?.forEach(r => {
                if (r && !foundRooms.has(r)) {
                  foundRooms.add(r);
                  changed = true;
                }
              });
            }
          }
        });
      });
    });

    if (changed) {
      setSubjects(Array.from(foundSubjects).sort((a, b) => a.localeCompare(b, 'tr')));
      setTeachers(Array.from(foundTeachers).sort((a, b) => a.localeCompare(b, 'tr')));
      setClasses(Array.from(foundClasses).sort((a, b) => a.localeCompare(b, 'tr')));
      setRooms(Array.from(foundRooms).sort((a, b) => a.localeCompare(b, 'tr')));
    }
  }, [schedules, unplacedCourses, teachers, classes, subjects, rooms]);


  
  const [toast, setToast] = useState(null);
  const [previewType, setPreviewType] = useState('teacher'); 
  const [mobileSelectedDay, setMobileSelectedDay] = useState(0);
  const [mobileSelectedForSwap, setMobileSelectedForSwap] = useState<any>(null);
  const [mobileMatrixTab, setMobileMatrixTab] = useState<'timeline' | 'preview' | 'interactive' | 'pool'>('timeline');
  const [mobileQuickActionTarget, setMobileQuickActionTarget] = useState<MobileQuickActionTarget | null>(null);
  const [mobileMovingCard, setMobileMovingCard] = useState<MobileQuickActionTarget | null>(null);
  const [tableZoom, setTableZoom] = useState(100);
  const [deepLearningActive, setDeepLearningActive] = useState(false);
  const [deepLearningStats, setDeepLearningStats] = useState({ learnedPaths: 0, bottlenecks: 0 });
  const [shadowAnalysis, setShadowAnalysis] = useState<ShadowAnalysisResult | null>(null);
  const [difficultyHeatmap, setDifficultyHeatmap] = useState<DifficultyHeatmapMatrix | null>(null);
  const [deadEndWarnings, setDeadEndWarnings] = useState<DeadEndWarning[]>([]);
  const [isDeepModalOpen, setIsDeepModalOpen] = useState(false);
  const [isRunningDeepAnalysis, setIsRunningDeepAnalysis] = useState(false);
  const shadowWorkerRef = useRef<Worker | null>(null);
  const currentShadowJobIdRef = useRef<number>(0);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  
  const [settingTab, setSettingTab] = useState('info');
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [constraintModal, setConstraintModal] = useState(null);


  const [constraintTargets, setConstraintTargets] = useState([]);
  const [showConstraintTargets, setShowConstraintTargets] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [conflictReport, setConflictReport] = useState(null);
  const [paintState, setPaintState] = useState({ isPainting: false, targetClosed: false }); 
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  const [distributeState, setDistributeState] = useState({ isRunning: false, progress: 0, phase: '', activeCoresCount: 4, recoveryCount: 0 });
  const [selectedCoreCount, setSelectedCoreCount] = useState<number>(navigator.hardwareConcurrency || 4);
  const [coreStates, setCoreStates] = useState<Array<CoreProgressState>>([]);
  const [initialDistributeUnplacedCount, setInitialDistributeUnplacedCount] = useState<number>(0);
  const [inspectingCard, setInspectingCard] = useState<any>(null);

  // Spotlight, Split View & Quick Constraint Brush
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isSplitCompareOpen, setIsSplitCompareOpen] = useState(false);
  const [splitCompareInitialA, setSplitCompareInitialA] = useState<{ type: 'teacher' | 'class' | 'room'; name: string } | null>(null);
  const [splitCompareInitialB, setSplitCompareInitialB] = useState<{ type: 'teacher' | 'class' | 'room'; name: string } | null>(null);
  const [highlightedEntity, setHighlightedEntity] = useState<string | null>(null);

        const paintStateRef = useRef({ isPainting: false, targetClosed: false });

  
  // Heatmap Overlay & Filter States (Shadow Heatmap UI)
  const [heatmapOverlayActive, setHeatmapOverlayActive] = useState(false);
  const [heatmapOverlayMode, setHeatmapOverlayMode] = useState<'combined' | 'school_load' | 'unplaced_contention'>('combined');
  const [heatmapOverlayOpacity, setHeatmapOverlayOpacity] = useState(65);
  const [highlightedHeatmapPeriod, setHighlightedHeatmapPeriod] = useState<{ dayId: number; pIdx: number } | null>(null);

  // Pool Filter & Search States (Bottleneck Warning Badges)
  const [poolRiskFilter, setPoolRiskFilter] = useState<'all' | 'dead_end' | 'critical_bottleneck' | 'optimal'>('all');
  const [poolSortMode, setPoolSortMode] = useState<'risk' | 'hours' | 'teacher' | 'subject'>('risk');
  const [poolSearchQuery, setPoolSearchQuery] = useState('');

  const [poolForm, setPoolForm] = useState({ teachers: [], classes: [], rooms: [], subject: '', format: '2', editingId: null });
  const [modalPoolForm, setModalPoolForm] = useState({ teachers: [], classes: [], rooms: [], subject: "", format: "2", editingId: null });
  const fileInputRef = useRef(null);
  const programInputRef = useRef(null);

  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);

  const showToast = (message, type = 'success') => {
    setToast({ message: String(message), type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const unsubscribe = initDriveAuth((user, token) => {
      setDriveUser(user);
      setDriveToken(token);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const getFullBackupData = () => {
    let dutyData: any = undefined;
    try {
      const dutyBackupRaw = localStorage.getItem('ataturk_duty_backup_json');
      if (dutyBackupRaw) {
        dutyData = JSON.parse(dutyBackupRaw);
      } else {
        const dutyLocations = localStorage.getItem('ataturk_duty_locations');
        const dutyAssignments = localStorage.getItem('ataturk_duty_assignments');
        const exemptTeachers = localStorage.getItem('ataturk_exempt_teachers');
        const dutyAdmins = localStorage.getItem('ataturk_duty_admins');
        const adminSchedule = localStorage.getItem('ataturk_admin_schedule');
        const adminRoles = localStorage.getItem('ataturk_admin_roles');
        const generalRules = localStorage.getItem('ataturk_general_rules');
        const attentionRules = localStorage.getItem('ataturk_attention_rules');
        const principalName = localStorage.getItem('ataturk_principal_name');
        const principalTitle = localStorage.getItem('ataturk_principal_title');
        const teacherStatuses = localStorage.getItem('ataturk_teacher_statuses');
        const coverAssignments = localStorage.getItem('ataturk_cover_assignments');
        const userHolidays = localStorage.getItem('ataturk_duty_user_holidays');
        if (dutyLocations || dutyAssignments) {
          dutyData = {
            locations: dutyLocations ? JSON.parse(dutyLocations) : undefined,
            assignments: dutyAssignments ? JSON.parse(dutyAssignments) : undefined,
            exemptTeachers: exemptTeachers ? JSON.parse(exemptTeachers) : undefined,
            admins: dutyAdmins ? JSON.parse(dutyAdmins) : undefined,
            adminSchedule: adminSchedule ? JSON.parse(adminSchedule) : undefined,
            adminRoles: adminRoles ? JSON.parse(adminRoles) : undefined,
            generalRules,
            attentionRules,
            userHolidays: userHolidays ? JSON.parse(userHolidays) : undefined,
            principal: { name: principalName, title: principalTitle },
            teacherStatuses: teacherStatuses ? JSON.parse(teacherStatuses) : undefined,
            coverAssignments: coverAssignments ? JSON.parse(coverAssignments) : undefined
          };
        }
      }
    } catch (e) {
      console.error('Duty backup data pack error:', e);
    }

    return { 
      schoolSettings, 
      schoolInfo, 
      teachers, 
      classes, 
      subjects, 
      rooms, 
      shortNames,
      schedules, 
      classSchedules, 
      roomSchedules, 
      lockedCells, 
      unplacedCourses, 
      constraints,
      dutyData 
    };
  };

  const applyFullBackupData = (rawParsedData: any) => {
    let parsedData = rawParsedData;
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        console.error('applyFullBackupData JSON parse error:', e);
        showToast("Yedek dosyası verisi okunamadı.", "error");
        return;
      }
    }

    if (!parsedData || typeof parsedData !== 'object') {
      showToast("Geçersiz veya boş yedek dosyası içeriği.", "error");
      return;
    }

    // Unwrap if wrapped in data or appData
    if (parsedData.data && typeof parsedData.data === 'object' && (parsedData.data.teachers || parsedData.data.schedules)) {
      parsedData = parsedData.data;
    } else if (parsedData.appData && typeof parsedData.appData === 'object' && (parsedData.appData.teachers || parsedData.appData.schedules)) {
      parsedData = parsedData.appData;
    }

    const hasTeachers = Array.isArray(parsedData.teachers) && parsedData.teachers.length > 0;
    const hasClasses = Array.isArray(parsedData.classes) && parsedData.classes.length > 0;
    const hasSchedules = parsedData.schedules && Object.keys(parsedData.schedules).length > 0;
    const hasUnplaced = Array.isArray(parsedData.unplacedCourses) && parsedData.unplacedCourses.length > 0;
    const hasDuty = Boolean(parsedData.dutyData);

    if (hasTeachers || hasClasses || hasSchedules || hasUnplaced || parsedData.schoolSettings || hasDuty) {
      if (parsedData.schoolSettings) {
        setSchoolSettings({
          ...DEFAULT_SETTINGS,
          ...parsedData.schoolSettings,
          weekDays: parsedData.schoolSettings.weekDays || DEFAULT_SETTINGS.weekDays,
          lessonTimes: parsedData.schoolSettings.lessonTimes || DEFAULT_SETTINGS.lessonTimes
        });
      }

      setSchoolInfo(parsedData.schoolInfo || { name: 'Belirtilmedi', year: '2025-2026', principal: '', vicePrincipal: '' });
      
      const loadedTeachers = parsedData.teachers || [];
      const loadedClasses = parsedData.classes || [];
      const loadedSubjects = parsedData.subjects || [];
      const loadedRooms = parsedData.rooms || [];
      const loadedSchedules = parsedData.schedules || {};
      
      setTeachers(loadedTeachers);
      setClasses(loadedClasses);
      setSubjects(loadedSubjects);
      setRooms(loadedRooms);
      if (parsedData.shortNames && typeof parsedData.shortNames === 'object') {
        setShortNames(parsedData.shortNames);
      }
      setSchedules(loadedSchedules);

      // Rebuild classSchedules & roomSchedules if missing, empty, or incomplete
      let loadedClassSchedules = parsedData.classSchedules;
      let loadedRoomSchedules = parsedData.roomSchedules;

      const hasValidClassCards = loadedClassSchedules && Object.values(loadedClassSchedules).some((grid: any) => 
        Array.isArray(grid) && grid.some((r: any) => Array.isArray(r) && r.some((c: any) => Boolean(c && c !== '')))
      );

      if (!hasValidClassCards && hasSchedules) {
        const rebuilt = rebuildClassAndRoomSchedules(loadedSchedules, loadedClasses, loadedRooms);
        loadedClassSchedules = rebuilt.newClassSchedules;
        loadedRoomSchedules = rebuilt.newRoomSchedules;
      }

      setClassSchedules(loadedClassSchedules || {});
      setRoomSchedules(loadedRoomSchedules || {});
      setLockedCells(parsedData.lockedCells || {});
      
      const rawUnplaced = parsedData.unplacedCourses || [];
      const migratedUnplaced = rawUnplaced.map((c: any) => ({
        id: c.id || generateId(),
        teachers: Array.isArray(c.teachers) ? c.teachers : (c.teacher ? [c.teacher] : []),
        classes: Array.isArray(c.classes) ? c.classes : (c.cls ? [c.cls] : []),
        rooms: Array.isArray(c.rooms) ? c.rooms : [],
        subject: c.subject || '',
        hours: c.hours || 1,
        failCount: c.failCount || 0
      }));
      
      setUnplacedCourses(migratedUnplaced);
      setConstraints(parsedData.constraints || { teachers: {}, classes: {}, subjects: {}, rooms: {} });

      // Save locally immediately to guarantee state survival across reloads and tab closures
      try {
        localStorage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, JSON.stringify({
          schoolSettings: parsedData.schoolSettings || DEFAULT_SETTINGS,
          schoolInfo: parsedData.schoolInfo,
          teachers: loadedTeachers,
          classes: loadedClasses,
          subjects: loadedSubjects,
          rooms: loadedRooms,
          schedules: loadedSchedules,
          classSchedules: loadedClassSchedules || {},
          roomSchedules: loadedRoomSchedules || {},
          lockedCells: parsedData.lockedCells || {},
          unplacedCourses: migratedUnplaced,
          constraints: parsedData.constraints || { teachers: {}, classes: {}, subjects: {}, rooms: {} }
        }));
      } catch (e) {
        console.warn('Local workspace save warning:', e);
      }

      if (parsedData.dutyData) {
        const dd = parsedData.dutyData;
        if (dd.locations || dd.dutyLocations) {
          localStorage.setItem('ataturk_duty_locations', JSON.stringify(dd.locations || dd.dutyLocations));
        }
        if (dd.assignments || dd.dutyAssignments) {
          localStorage.setItem('ataturk_duty_assignments', JSON.stringify(dd.assignments || dd.dutyAssignments));
        }
        if (dd.exemptTeachers) {
          localStorage.setItem('ataturk_exempt_teachers', JSON.stringify(dd.exemptTeachers));
        }
        if (dd.admins || dd.dutyAdmins) {
          localStorage.setItem('ataturk_duty_admins', JSON.stringify(dd.admins || dd.dutyAdmins));
        }
        if (dd.adminSchedule) {
          localStorage.setItem('ataturk_admin_schedule', JSON.stringify(dd.adminSchedule));
        }
        if (dd.adminRoles) {
          localStorage.setItem('ataturk_admin_roles', JSON.stringify(dd.adminRoles));
        }
        if (dd.generalRules) {
          localStorage.setItem('ataturk_general_rules', dd.generalRules);
        }
        if (dd.attentionRules) {
          localStorage.setItem('ataturk_attention_rules', dd.attentionRules);
        }
        if (dd.principal?.name || dd.principalName) {
          localStorage.setItem('ataturk_principal_name', dd.principal?.name || dd.principalName);
        }
        if (dd.principal?.title || dd.principalTitle) {
          localStorage.setItem('ataturk_principal_title', dd.principal?.title || dd.principalTitle);
        }
        if (dd.teacherStatuses) {
          localStorage.setItem('ataturk_teacher_statuses', JSON.stringify(dd.teacherStatuses));
        }
        if (dd.coverAssignments) {
          localStorage.setItem('ataturk_cover_assignments', JSON.stringify(dd.coverAssignments));
        }
        if (dd.userHolidays && Array.isArray(dd.userHolidays)) {
          localStorage.setItem('ataturk_duty_user_holidays', JSON.stringify(dd.userHolidays));
        }
        if (dd.printSettings) {
          if (dd.printSettings.printStartDate) localStorage.setItem('ataturk_duty_print_start', dd.printSettings.printStartDate);
          if (dd.printSettings.printEndDate) localStorage.setItem('ataturk_duty_print_end', dd.printSettings.printEndDate);
          if (dd.printSettings.rotateTeachers !== undefined) localStorage.setItem('ataturk_duty_rotate_teachers', String(dd.printSettings.rotateTeachers));
          if (dd.printSettings.alternateAdmins !== undefined) localStorage.setItem('ataturk_duty_alternate_admins', String(dd.printSettings.alternateAdmins));
          if (dd.printSettings.showWeekends !== undefined) localStorage.setItem('ataturk_duty_show_weekends', String(dd.printSettings.showWeekends));
          if (dd.printSettings.markHolidays !== undefined) localStorage.setItem('ataturk_duty_mark_holidays', String(dd.printSettings.markHolidays));
        }
        localStorage.setItem('ataturk_duty_backup_json', JSON.stringify(dd, null, 2));
        window.dispatchEvent(new CustomEvent('ataturk_duty_saved', { detail: dd }));
      }

      setWorkspaceKey(prev => prev + 1);
    } else {
      showToast("Yedek dosyası formatı geçersiz veya boş.", "error");
    }
  };

  // Debounced auto-save to browser local storage
  const saveWorkspaceToLocalStorage = useMemo(() => {
    return debounce((data: any) => {
      try {
        if (!isWorkspaceDataEmpty(data)) {
          localStorage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, JSON.stringify(data));
        }
      } catch (e) {
        console.warn('Workspace localStorage save warning:', e);
      }
    }, 800);
  }, []);

  useEffect(() => {
    const currentWorkspace = {
      schoolSettings,
      schoolInfo,
      teachers,
      classes,
      subjects,
      rooms,
      shortNames,
      schedules,
      classSchedules,
      roomSchedules,
      lockedCells,
      unplacedCourses,
      constraints
    };
    if (!isWorkspaceDataEmpty(currentWorkspace)) {
      saveWorkspaceToLocalStorage(currentWorkspace);
    }
  }, [schedules, classSchedules, roomSchedules, teachers, classes, subjects, rooms, shortNames, unplacedCourses, schoolSettings, schoolInfo, constraints, lockedCells]);

  const autoSyncToDrive = useMemo(() => {
    return debounce(async (token: string, data: any) => {
      try {
        if (isWorkspaceDataEmpty(data)) {
          console.log('Otomatik Drive eşitleme atlandı: Çalışma alanı boş, mevcut bulut yedeği korundu.');
          return;
        }
        const file = await findDriveBackupFile(token);
        await uploadDriveBackupFile(token, data, file?.id);
        const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem('kuantum_drive_last_sync', nowStr);
      } catch (err) {
        console.warn('Otomatik Drive senkronizasyonu hatası:', err);
      }
    }, 5000);
  }, []);

  useEffect(() => {
    const activeToken = driveToken || getStoredAccessToken();
    if (driveUser && activeToken && localStorage.getItem('kuantum_drive_autosync') === 'true') {
      const fullData = getFullBackupData();
      if (!isWorkspaceDataEmpty(fullData)) {
        autoSyncToDrive(activeToken, fullData);
      }
    }
  }, [schedules, unplacedCourses, teachers, classes, schoolSettings, driveUser, driveToken]);

  // Global Shortcut Listener (Ctrl+K for Spotlight, Esc for Brush)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectEntityFromSpotlight = (type: 'teacher' | 'class' | 'room' | 'subject', name: string) => {
    setPreviewType(type);
    setHighlightedEntity(name);
    setTimeout(() => {
      const el = document.getElementById(`row-${type}-${name}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => {
      setHighlightedEntity(null);
    }, 3500);
  };

  
  // Continuous Predictive Analysis Shadow Worker Initialization
  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('./workers/shadowAnalysisWorker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (event: MessageEvent) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'SHADOW_DEAD_END_WARNING') {
          if (data.warnings && data.warnings.length > 0) {
            setDeadEndWarnings(data.warnings);
          }
        } else if (data.type === 'SHADOW_ANALYSIS_RESULT') {
          setShadowAnalysis(data.result);
          if (data.result?.heatmap) {
            setDifficultyHeatmap(data.result.heatmap);
          }
          if (data.result?.deadEndWarnings) {
            setDeadEndWarnings(data.result.deadEndWarnings);
          }
          setIsRunningDeepAnalysis(false);
          if (data.result?.bottlenecks) {
            setDeepLearningStats(prev => ({
              ...prev,
              bottlenecks: data.result.bottlenecks.length,
              learnedPaths: prev.learnedPaths + 1
            }));
          }
        } else if (data.type === 'SHADOW_ANALYSIS_ABORTED') {
          // Aborted silently when state changed rapidly
        } else if (data.type === 'SHADOW_ANALYSIS_ERROR') {
          setIsRunningDeepAnalysis(false);
        }
      };

      worker.onerror = (err) => {
        console.warn('[ShadowAnalysisWorker Error]', err);
        setIsRunningDeepAnalysis(false);
      };

      shadowWorkerRef.current = worker;

      return () => {
        worker.postMessage({ type: 'ABORT' });
        worker.terminate();
        shadowWorkerRef.current = null;
      };
    } catch (e) {
      console.error('Failed to initialize shadow analysis worker:', e);
    }
  }, []);

  // Debounced Shadow Dispatcher (1500ms debounce during user idle time)
  const debouncedShadowAnalyze = useMemo(() => {
    return debounce((payload: any) => {
      if (!shadowWorkerRef.current) return;
      const jobId = `shadow_${Date.now()}_${++currentShadowJobIdRef.current}`;
      shadowWorkerRef.current.postMessage({
        type: 'ANALYZE_SHADOW',
        jobId,
        payload
      });
    }, 1500);
  }, []);

  // Trigger continuous predictive analysis whenever constraints, locked cells, or schedules change
  useEffect(() => {
    debouncedShadowAnalyze({
      constraints,
      lockedCells,
      schoolSettings,
      schedules,
      classSchedules,
      roomSchedules,
      unplacedCourses,
      teachers,
      classes,
      subjects,
      rooms,
      isDeepRun: false
    });
  }, [
    constraints,
    lockedCells,
    schoolSettings,
    unplacedCourses,
    schedules,
    classSchedules,
    roomSchedules,
    teachers,
    classes,
    subjects,
    rooms,
    debouncedShadowAnalyze
  ]);

  // Force On-Demand Deep Analysis (e.g. when button is clicked)
  const handleForceDeepRun = () => {
    if (!shadowWorkerRef.current) return;
    setIsRunningDeepAnalysis(true);
    const jobId = `deep_force_${Date.now()}_${++currentShadowJobIdRef.current}`;
    shadowWorkerRef.current.postMessage({
      type: 'FORCE_DEEP_RUN',
      jobId,
      payload: {
        constraints,
        lockedCells,
        schoolSettings,
        schedules,
        classSchedules,
        roomSchedules,
        unplacedCourses,
        teachers,
        classes,
        subjects,
        rooms,
        isDeepRun: true
      }
    });
  };

  // Sort pool cards based on shadow worker difficulty ranking
  const handleApplyPredictiveSort = () => {
    if (!shadowAnalysis || !shadowAnalysis.recommendedPlacementOrder?.length || unplacedCourses.length === 0) {
      return showToast("Henüz sıralanacak kestirimsel kart analizi bulunamadı.", "info");
    }
    const priorityMap = new Map<string, number>();
    shadowAnalysis.recommendedPlacementOrder.forEach(item => {
      priorityMap.set(item.id, item.difficultyRank);
    });

    const sorted = [...unplacedCourses].sort((a, b) => {
      const rankA = priorityMap.get(a.id) ?? 9999;
      const rankB = priorityMap.get(b.id) ?? 9999;
      return rankA - rankB;
    });

    setUnplacedCourses(sorted);
    showToast("Ders havuzu kestirimsel zorluk sırasına göre dizildi.", "success");
  };

  useEffect(() => {
    if (!deepLearningActive || unplacedCourses.length === 0 || distributeState.isRunning) return;
    if (shadowAnalysis && shadowAnalysis.recommendedPlacementOrder?.length > 0) {
      const priorityMap = new Map<string, number>();
      shadowAnalysis.recommendedPlacementOrder.forEach(item => {
        priorityMap.set(item.id, item.difficultyRank);
      });
      const sorted = [...unplacedCourses].sort((a, b) => {
        const rankA = priorityMap.get(a.id) ?? 9999;
        const rankB = priorityMap.get(b.id) ?? 9999;
        return rankA - rankB;
      });
      const isDifferent = sorted.some((c, i) => c.id !== unplacedCourses[i].id);
      if (isDifferent) {
        setUnplacedCourses(sorted);
        setDeepLearningStats(prev => ({
          ...prev,
          learnedPaths: prev.learnedPaths + 1,
          bottlenecks: shadowAnalysis.bottlenecks.length
        }));
      }
    }
  }, [deepLearningActive, shadowAnalysis, unplacedCourses, distributeState.isRunning]);

  // Heatmap Overlay Helper
  const getSlotHeatmapData = (absDIdx: number, pIdx: number) => {
    const activeHeatmap = difficultyHeatmap || shadowAnalysis?.heatmap || null;
    const slotKey = `${absDIdx}-${pIdx}`;
    const slotLoad = activeHeatmap?.schoolSlotLoads?.[slotKey];
    const contention = activeHeatmap?.gridContentionMap?.[slotKey];

    let busyTeachers = 0;
    let closedTeachers = 0;
    teachers.forEach(t => {
      if (schedules[t]?.[absDIdx]?.[pIdx]) busyTeachers++;
      if (constraints.teachers?.[t]?.includes(slotKey)) closedTeachers++;
    });

    let busyClasses = 0;
    classes.forEach(c => {
      if (classSchedules[c]?.[absDIdx]?.[pIdx]) busyClasses++;
    });

    const totalTeachers = Math.max(1, teachers.length);
    const totalClasses = Math.max(1, classes.length);

    const schoolLoadPct = slotLoad?.loadPercentage ?? Math.min(100, Math.round(((busyTeachers + busyClasses) / (totalTeachers + totalClasses)) * 100));
    const contendersCount = contention?.totalContenders ?? slotLoad?.contendersCount ?? 0;
    const contentionPct = contention?.loadPressure ?? slotLoad?.contentionPercentage ?? 0;
    const combinedIntensity = slotLoad?.combinedIntensity ?? Math.min(100, Math.round(schoolLoadPct * 0.6 + contentionPct * 0.4));

    let activeIntensity = combinedIntensity;
    if (heatmapOverlayMode === 'school_load') {
      activeIntensity = schoolLoadPct;
    } else if (heatmapOverlayMode === 'unplaced_contention') {
      activeIntensity = contentionPct;
    }

    return {
      slotKey,
      schoolLoadPct,
      contendersCount,
      contentionPct,
      combinedIntensity,
      activeIntensity,
      busyTeachers,
      totalTeachers,
      busyClasses,
      totalClasses,
      closedTeachers
    };
  };

  const getHeatmapColor = (intensity: number, opacityPct: number = 65) => {
    const alpha = (opacityPct / 100);
    if (intensity <= 20) {
      return {
        bg: `rgba(34, 197, 94, ${alpha * 0.28})`,
        border: 'rgba(34, 197, 94, 0.4)',
        glow: '',
        text: 'text-emerald-800',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        label: 'Sakin (%0-20)'
      };
    } else if (intensity <= 45) {
      return {
        bg: `rgba(59, 130, 246, ${alpha * 0.32})`,
        border: 'rgba(59, 130, 246, 0.4)',
        glow: '',
        text: 'text-blue-800',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'Normal (%21-45)'
      };
    } else if (intensity <= 70) {
      return {
        bg: `rgba(234, 179, 8, ${alpha * 0.42})`,
        border: 'rgba(234, 179, 8, 0.6)',
        glow: '',
        text: 'text-amber-900',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        label: 'Orta Yoğunluk (%46-70)'
      };
    } else if (intensity <= 85) {
      return {
        bg: `rgba(249, 115, 22, ${alpha * 0.55})`,
        border: 'rgba(249, 115, 22, 0.75)',
        glow: 'shadow-[inset_0_0_8px_rgba(249,115,22,0.35)]',
        text: 'text-orange-950',
        badgeBg: 'bg-orange-100 text-orange-900 border-orange-400 font-black',
        label: 'Yüksek Yoğunluk (%71-85)'
      };
    } else {
      return {
        bg: `rgba(239, 68, 68, ${alpha * 0.7})`,
        border: 'rgba(239, 68, 68, 0.9)',
        glow: 'shadow-[inset_0_0_12px_rgba(239,68,68,0.5)] ring-1 ring-red-400',
        text: 'text-red-950',
        badgeBg: 'bg-red-600 text-white border-red-700 font-black animate-pulse',
        label: 'Tepe / Aşırı Yük (%86-100)'
      };
    }
  };

  // Card Bottleneck & Dead-End Diagnostics
  const getCardBottleneckStatus = (card: any) => {
    const activeHeatmap = difficultyHeatmap || shadowAnalysis?.heatmap || null;
    const cardHeatmap = activeHeatmap?.cards?.[card.id];

    const isDeadEnd = activeHeatmap?.deadEnds?.some(w => w.cardId === card.id) ||
                      shadowAnalysis?.deadEndWarnings?.some(w => w.cardId === card.id) ||
                      cardHeatmap?.isDeadEnd ||
                      cardHeatmap?.validSlotsCount === 0;

    if (isDeadEnd) {
      const reason = cardHeatmap?.deadEndReason || 
        `${card.teachers?.join(', ') || 'İlgili öğretmen'} ve ${card.classes?.join(', ') || 'sınıf'} için tahtada yerleşebilecek hiçbir boş saat kalmadı (%100 Tıkanma).`;
      return {
        category: 'dead_end' as const,
        riskScore: 100,
        validSlotsCount: 0,
        badgeLabel: '%100 Tıkanma (0 Slot)',
        badgeClass: 'bg-red-600 text-white ring-2 ring-red-400/80 animate-pulse shadow-md',
        cardBorderClass: 'border-red-500 ring-2 ring-red-400/70 bg-red-50/70',
        reason,
        details: cardHeatmap?.riskDetails || 'Öğretmen kapalı saatleri veya kilitli dersler sebebiyle bu kart için uygun yer kalmamıştır.',
        suggestedAction: cardHeatmap?.suggestedAction || 'Kısıtlamaları açın veya çakışan dersleri inceleyin.'
      };
    }

    const validSlots = cardHeatmap?.validSlotsCount ?? 99;
    const heuristicWeight = cardHeatmap?.heuristicWeight ?? 0;
    const competingCount = cardHeatmap?.competingCards?.length ?? 0;

    if (validSlots <= 2 || heuristicWeight > 380) {
      return {
        category: 'critical_bottleneck' as const,
        riskScore: Math.min(95, Math.max(80, 100 - validSlots * 6)),
        validSlotsCount: validSlots,
        badgeLabel: `Kritik Darboğaz (${validSlots} Slot)`,
        badgeClass: 'bg-amber-500 text-white ring-1 ring-amber-300 shadow-xs font-black',
        cardBorderClass: 'border-amber-400 ring-1 ring-amber-300/80 bg-amber-50/40',
        reason: `Haftada sadece ${validSlots} uygun zaman dilimi kaldı. ${competingCount > 0 ? `${competingCount} rakip kart ile çakışıyor.` : ''}`,
        details: cardHeatmap?.riskDetails || 'Bu kart için çok dar bir yerleşim aralığı mevcut.',
        suggestedAction: 'Dağıtımda öncelik verin veya alternatif saatleri açık tutun.'
      };
    }

    if (validSlots <= 6 || competingCount >= 3) {
      return {
        category: 'high_contention' as const,
        riskScore: 60,
        validSlotsCount: validSlots,
        badgeLabel: `Yüksek Çekişme (${validSlots} Slot)`,
        badgeClass: 'bg-orange-100 text-orange-900 border border-orange-300 font-bold',
        cardBorderClass: 'border-orange-300 bg-orange-50/20',
        reason: `${competingCount} kart ile aynı zaman dilimlerini talep ediyor.`,
        details: `${validSlots} adet geçerli slot mevcut.`,
        suggestedAction: 'Öncelikli yerleşim'
      };
    }

    return {
      category: 'optimal' as const,
      riskScore: 15,
      validSlotsCount: validSlots,
      badgeLabel: `Geniş Alan (${validSlots === 99 ? 'Esnek' : `${validSlots} Slot`})`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
      cardBorderClass: '',
      reason: 'Yeterli boş zaman dilimi mevcut.',
      details: `${validSlots === 99 ? 'Geniş' : validSlots} adet uygun zaman aralığı var.`,
      suggestedAction: 'Normal dağıtım'
    };
  };

  const poolAnalysisStats = useMemo(() => {
    let deadEndCount = 0;
    let criticalCount = 0;
    let contentionCount = 0;
    let optimalCount = 0;

    unplacedCourses.forEach(c => {
      const status = getCardBottleneckStatus(c);
      if (status.category === 'dead_end') deadEndCount++;
      else if (status.category === 'critical_bottleneck') criticalCount++;
      else if (status.category === 'high_contention') contentionCount++;
      else optimalCount++;
    });

    return { deadEndCount, criticalCount, contentionCount, optimalCount, total: unplacedCourses.length };
  }, [unplacedCourses, difficultyHeatmap, shadowAnalysis]);

  const filteredAndSortedPoolCards = useMemo(() => {
    let list = [...unplacedCourses];

    // Search query filter
    if (poolSearchQuery.trim()) {
      const q = poolSearchQuery.toLowerCase().trim();
      list = list.filter(c => 
        (c.subject || '').toLowerCase().includes(q) ||
        (c.teachers || []).some(t => t.toLowerCase().includes(q)) ||
        (c.classes || []).some(cls => cls.toLowerCase().includes(q)) ||
        (c.rooms || []).some(r => r.toLowerCase().includes(q))
      );
    }

    // Risk Filter
    if (poolRiskFilter === 'dead_end') {
      list = list.filter(c => getCardBottleneckStatus(c).category === 'dead_end');
    } else if (poolRiskFilter === 'critical_bottleneck') {
      list = list.filter(c => {
        const cat = getCardBottleneckStatus(c).category;
        return cat === 'critical_bottleneck' || cat === 'high_contention';
      });
    } else if (poolRiskFilter === 'optimal') {
      list = list.filter(c => getCardBottleneckStatus(c).category === 'optimal');
    }

    // Sorting
    list.sort((a, b) => {
      if (poolSortMode === 'risk') {
        const scoreA = getCardBottleneckStatus(a).riskScore;
        const scoreB = getCardBottleneckStatus(b).riskScore;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.hours || 1) - (a.hours || 1);
      } else if (poolSortMode === 'hours') {
        return (b.hours || 1) - (a.hours || 1);
      } else if (poolSortMode === 'teacher') {
        const tA = (a.teachers?.[0] || '').toLowerCase();
        const tB = (b.teachers?.[0] || '').toLowerCase();
        return tA.localeCompare(tB);
      } else if (poolSortMode === 'subject') {
        const sA = (a.subject || '').toLowerCase();
        const sB = (b.subject || '').toLowerCase();
        return sA.localeCompare(sB);
      }
      return 0;
    });

    return list;
  }, [unplacedCourses, poolSearchQuery, poolRiskFilter, poolSortMode, difficultyHeatmap, shadowAnalysis]);

  // Auto-eject conflicting lessons when constraints change
  useEffect(() => {
    let ejectedCount = 0;
    const ejectedBlockIds = new Set();
    const blocksToEject = [];

    // 1. Scan the schedules and detect any conflicts
    Object.entries(schedules).forEach(([teacher, teacherSched]) => {
      if (!Array.isArray(teacherSched)) return;
      teacherSched.forEach((daySched, dIdx) => {
        if (!Array.isArray(daySched)) return;
        daySched.forEach((cellVal, pIdx) => {
          if (cellVal && cellVal !== '') {
            const cData = parseCellData(cellVal);
            if (cData && !ejectedBlockIds.has(cData.id)) {
              let pStart = pIdx;
              while(pStart > 0 && teacherSched[dIdx][pStart - 1] === cellVal) pStart--;
              
              let blockSize = 1;
              const maxPeriods = schoolSettings.weekDays?.[dIdx]?.periods || 15;
              while(pStart + blockSize < maxPeriods && teacherSched[dIdx][pStart + blockSize] === cellVal) blockSize++;

              let hasConflict = false;
              for (let i = 0; i < blockSize; i++) {
                const currentP = pStart + i;
                const constraintKey = `${dIdx}-${currentP}`;
                
                const teacherViolation = cData.teachers.some(t => constraints.teachers?.[t]?.includes(constraintKey));
                const classViolation = cData.classes.some(c => constraints.classes?.[c]?.includes(constraintKey));
                const roomViolation = cData.rooms?.some(r => constraints.rooms?.[r]?.includes(constraintKey));
                const subjectViolation = constraints.subjects?.[cData.subject]?.includes(constraintKey);
                
                if (teacherViolation || classViolation || roomViolation || subjectViolation) {
                  hasConflict = true;
                  break;
                }
              }

              if (hasConflict) {
                ejectedBlockIds.add(cData.id);
                blocksToEject.push({
                  cData,
                  dIdx,
                  pStart,
                  blockSize
                });
              }
            }
          }
        });
      });
    });

    if (blocksToEject.length > 0) {
      // 2. Perform atomic batch updates of all schedules and the unplaced pool
      ejectMultipleCellsFromSchedules(blocksToEject);

      setTimeout(() => {
        showToast(`Kısıtlama değiştiği için çakışan ${blocksToEject.length} ders kartı otomatik havuza alındı!`, "info");
      }, 100);
    }
  }, [constraints, schoolSettings.weekDays]);

  const getSingleType = (pluralType) => {
    if (pluralType === 'teachers') return 'teacher';
    if (pluralType === 'classes') return 'class';
    if (pluralType === 'subjects') return 'subject';
    if (pluralType === 'rooms') return 'room';
    return pluralType;
  };

  const exportBackup = () => {
    const dataToBackup = getFullBackupData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToBackup, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `DersProgrami_Yedek_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("Tüm sistem ve nöbet asistanı verileri JSON formatında yedeklendi.");
  };

  const importBackup = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = evt.target?.result as string;
        const parsedData = JSON.parse(raw);
        applyFullBackupData(parsedData);
        showToast("Yedek dosyası ve nöbet planı başarıyla yüklendi!", "success");
      } catch (error) { 
        console.error("Yedek okuma hatası:", error);
        showToast("Geçersiz yedek dosyası formatı veya okuma hatası.", "error"); 
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportXMLData = () => {
    const getTId = name => "T" + teachers.indexOf(name);
    const getCId = name => "C" + classes.indexOf(name);
    const getSId = name => "S" + subjects.indexOf(name);
    const getRId = name => "R" + rooms.indexOf(name);

    let xml = `<?xml version="1.0" encoding="windows-1254"?>\n<DersProgrami>\n`;
    xml += `  <GenelBilgiler>\n    <DersSuresi Sabitmi="E" Sure="40"/>\n  </GenelBilgiler>\n`;
    xml += `  <EkBilgiler><EkBilgi EkBilgiTur="1" Deger="${schoolInfo.name}"/><EkBilgi EkBilgiTur="5" Deger="${schoolInfo.year}"/></EkBilgiler>\n<Gunler>\n`;
    
    schoolSettings.weekDays.forEach((day, dIdx) => {
        if(day.active) {
            xml += `  <Gun id="${dIdx+1}" Adi="${day.name}" SaatSayisi="${day.periods}">\n`;
            for(let pIdx=0; pIdx<day.periods; pIdx++) {
                xml += `    <Saat id="${dIdx*100 + pIdx}" Baslangic="${schoolSettings.lessonTimes[pIdx].start}" Bitis="${schoolSettings.lessonTimes[pIdx].end}"/>\n`;
            }
            xml += `  </Gun>\n`;
        }
    });
    xml += `</Gunler>\n<Dersler>\n` + subjects.map(s => `  <Ders id="${getSId(s)}" Adi="${s}" KisaAdi="${shortNames[s] || s}"/>`).join('\n') + `\n</Dersler>\n`;
    xml += `<Ogretmenler>\n` + teachers.map(t => `  <Ogretmen id="${getTId(t)}" Adi="${t}" KisaAdi="${shortNames[t] || t}"/>`).join('\n') + `\n</Ogretmenler>\n`;
    xml += `<Siniflar>\n` + classes.map(c => `  <Sinif id="${getCId(c)}" Adi="${c}" KisaAdi="${shortNames[c] || c}"/>`).join('\n') + `\n</Siniflar>\n`;
    xml += `<Derslikler>\n` + rooms.map(r => `  <Derslik id="${getRId(r)}" Adi="${r}" KisaAdi="${shortNames[r] || r}"/>`).join('\n') + `\n</Derslikler>\n`;
    xml += `<TanimliDersler>\n`;

    let lessonIdCounter = 1;
    const cardsMap: Record<string, any> = {}; 

    Object.keys(schedules).forEach(t => {
        for(let d=0; d<7; d++) {
            for(let p=0; p<15; p++) {
                const valStr = schedules[t]?.[d]?.[p];
                if (valStr && valStr !== '') {
                    const cData = parseCellData(valStr);
                    if (cData) {
                        if (!cardsMap[cData.id]) cardsMap[cData.id] = { data: cData, slots: [] };
                        if (cData.teachers[0] === t) {
                            const hours = cData.span || cData.span || 1;
                            for (let i = 0; i < hours; i++) {
                                cardsMap[cData.id].slots.push({ d, p: p + i });
                            }
                            p += hours - 1;
                        }
                    }
                }
            }
        }
    });

    Object.values(cardsMap).forEach(item => {
        const cData = item.data;
        const slots = item.slots.sort((a,b) => a.d === b.d ? a.p - b.p : a.d - b.d);
        
        const tIds = cData.teachers.map(getTId).join(',');
        const cIds = cData.classes.map(getCId).join(',');
        const rIds = cData.rooms?.map(getRId).join(',') || '';
        const sId = getSId(cData.subject);

        xml += `  <TanimliDers id="${lessonIdCounter++}" Ogretmenler="${tIds}" Siniflar="${cIds}" Ders="${sId}">\n`;
        
        let currentBlock = [];
        slots.forEach((slot) => {
            if (currentBlock.length === 0) { currentBlock.push(slot); }
            else {
                const last = currentBlock[currentBlock.length-1];
                if (last.d === slot.d && slot.p === last.p + 1) { currentBlock.push(slot); }
                else {
                    const yerlesim = currentBlock.map(x => x.d*100 + x.p).join(',');
                    xml += `    <Kart Yerlesim="${yerlesim}" Saat="${currentBlock.length}" Derslikler="${rIds}"/>\n`;
                    currentBlock = [slot];
                }
            }
        });
        if (currentBlock.length > 0) {
            const yerlesim = currentBlock.map(x => x.d*100 + x.p).join(',');
            xml += `    <Kart Yerlesim="${yerlesim}" Saat="${currentBlock.length}" Derslikler="${rIds}"/>\n`;
        }
        xml += `  </TanimliDers>\n`;
    });

    unplacedCourses.forEach(uc => {
        const tIds = uc.teachers.map(getTId).join(',');
        const cIds = uc.classes.map(getCId).join(',');
        const rIds = uc.rooms?.map(getRId).join(',') || '';
        const sId = getSId(uc.subject);

        xml += `  <TanimliDers id="${lessonIdCounter++}" Ogretmenler="${tIds}" Siniflar="${cIds}" Ders="${sId}">\n`;
        xml += `    <Kart Yerlesim="" Saat="${uc.hours}" Derslikler="${rIds}"/>\n  </TanimliDers>\n`;
    });
    xml += `</TanimliDersler>\n`;

    // Export Constraints if any exist
    const hasAnyConstraints = Object.values(constraints.teachers || {}).some((arr: any) => arr && arr.length > 0) ||
                             Object.values(constraints.classes || {}).some((arr: any) => arr && arr.length > 0) ||
                             Object.values(constraints.rooms || {}).some((arr: any) => arr && arr.length > 0) ||
                             Object.values(constraints.subjects || {}).some((arr: any) => arr && arr.length > 0);

    if (hasAnyConstraints) {
      xml += `<Kisitlar>\n`;
      Object.entries(constraints.teachers || {}).forEach(([t, slots]) => {
        const slotArr = slots as string[];
        if (slotArr && slotArr.length > 0) {
          const saatIds = slotArr.map(k => {
            const [d, p] = k.split('-').map(Number);
            return d * 100 + p;
          }).join(',');
          xml += `  <Kisit Ogretmen="${getTId(t)}" Saatler="${saatIds}"/>\n`;
        }
      });
      Object.entries(constraints.classes || {}).forEach(([c, slots]) => {
        const slotArr = slots as string[];
        if (slotArr && slotArr.length > 0) {
          const saatIds = slotArr.map(k => {
            const [d, p] = k.split('-').map(Number);
            return d * 100 + p;
          }).join(',');
          xml += `  <Kisit Sinif="${getCId(c)}" Saatler="${saatIds}"/>\n`;
        }
      });
      Object.entries(constraints.rooms || {}).forEach(([r, slots]) => {
        const slotArr = slots as string[];
        if (slotArr && slotArr.length > 0) {
          const saatIds = slotArr.map(k => {
            const [d, p] = k.split('-').map(Number);
            return d * 100 + p;
          }).join(',');
          xml += `  <Kisit Derslik="${getRId(r)}" Saatler="${saatIds}"/>\n`;
        }
      });
      Object.entries(constraints.subjects || {}).forEach(([s, slots]) => {
        const slotArr = slots as string[];
        if (slotArr && slotArr.length > 0) {
          const saatIds = slotArr.map(k => {
            const [d, p] = k.split('-').map(Number);
            return d * 100 + p;
          }).join(',');
          xml += `  <Kisit Ders="${getSId(s)}" Saatler="${saatIds}"/>\n`;
        }
      });
      xml += `</Kisitlar>\n`;
    }

    xml += `</DersProgrami>`;

    const blob = new Blob(['\uFEFF' + xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schoolInfo.name}_Program_Pro.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Program XML formatında başarıyla dışa aktarıldı.");
  };

  const parseXMLData = (xmlText) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) throw new Error("Geçersiz XML formatı.");

      const ekBilgiler = Array.from(xmlDoc.getElementsByTagName("EkBilgi"));
      let sName = schoolInfo.name;
      let sYear = schoolInfo.year;
      ekBilgiler.forEach(node => {
         if(node.getAttribute("EkBilgiTur") === "1") sName = node.getAttribute("Deger");
         if(node.getAttribute("EkBilgiTur") === "5") sYear = node.getAttribute("Deger");
      });
      setSchoolInfo(prev => ({...prev, name: sName || 'Okul Adı', year: sYear || '2024-2025'}));

      const saatMap = {};
      const newTimes = [...schoolSettings.lessonTimes];
      const newWeekDays = schoolSettings.weekDays.map((wd) => ({ ...wd }));
      
      Array.from(xmlDoc.getElementsByTagName("Gun")).forEach((gunNode, dIdx) => {
        const saatNodes = Array.from(gunNode.getElementsByTagName("Saat"));
        if (dIdx < newWeekDays.length && saatNodes.length > 0) {
          newWeekDays[dIdx].active = true;
          newWeekDays[dIdx].periods = Math.max(newWeekDays[dIdx].periods, saatNodes.length);
        }
        saatNodes.forEach((saatNode, pIdx) => {
          saatMap[saatNode.getAttribute("id") || ''] = { dIdx, pIdx };
          if (dIdx === 0 && saatNode.getAttribute("Baslangic")) {
             newTimes[pIdx] = { start: saatNode.getAttribute("Baslangic") || '', end: saatNode.getAttribute("Bitis") || '' };
          }
        });
      });
      setSchoolSettings({ ...schoolSettings, weekDays: newWeekDays, lessonTimes: newTimes });

      const newShortNames: Record<string, string> = {};
      const getEntityName = (n: Element) => {
        const longName = (n.getAttribute("Adi") || '').trim();
        const shortName = (n.getAttribute("KisaAdi") || '').trim();
        const fullName = (longName || shortName || '').toLocaleUpperCase('tr-TR');
        if (fullName && shortName) {
          newShortNames[fullName] = shortName.toLocaleUpperCase('tr-TR');
        }
        return fullName;
      };

      const tMap: Record<string, string> = {}; 
      Array.from(xmlDoc.getElementsByTagName("Ogretmen")).forEach(n => { 
        const id = n.getAttribute("id"); 
        if (id) tMap[id] = getEntityName(n); 
      });
      const cMap: Record<string, string> = {}; 
      Array.from(xmlDoc.getElementsByTagName("Sinif")).forEach(n => { 
        const id = n.getAttribute("id"); 
        if (id) cMap[id] = getEntityName(n); 
      });
      const sMap: Record<string, string> = {}; 
      Array.from(xmlDoc.getElementsByTagName("Ders")).forEach(n => { 
        const id = n.getAttribute("id"); 
        if (id) sMap[id] = getEntityName(n); 
      });
      const rMap: Record<string, string> = {}; 
      Array.from(xmlDoc.getElementsByTagName("Derslik")).forEach(n => { 
        const id = n.getAttribute("id"); 
        if (id) rMap[id] = getEntityName(n); 
      });
      setShortNames(newShortNames);

      const newSchedules: Record<string, any[][]> = {}; const newClassSchedules: Record<string, any[][]> = {}; const newRoomSchedules: Record<string, any[][]> = {}; const newUnplaced: any[] = [];
      Object.values(tMap).forEach(t => newSchedules[t] = Array.from({length: 7}).map(() => Array(15).fill('')));
      Object.values(cMap).forEach(c => newClassSchedules[c] = Array.from({length: 7}).map(() => Array(15).fill('')));
      Object.values(rMap).forEach(r => newRoomSchedules[r] = Array.from({length: 7}).map(() => Array(15).fill('')));

      let loadedCards = 0;
      Array.from(xmlDoc.getElementsByTagName("TanimliDers")).forEach(dersNode => {
        const teacherIds = (dersNode.getAttribute("Ogretmenler") || "").split(',').map(s => s.trim()).filter(Boolean);
        const classIds = (dersNode.getAttribute("Siniflar") || "").split(',').map(s => s.trim()).filter(Boolean);
        const sName = sMap[dersNode.getAttribute("Ders") || ''] || '';
        
        const teacherNames = teacherIds.map(id => tMap[id]).filter(Boolean);
        const classNames = classIds.map(id => cMap[id]).filter(Boolean);

        if (teacherNames.length === 0 || classNames.length === 0 || !sName) return;

        const defaultDersHours = parseInt(dersNode.getAttribute("HaftalikSaat") || dersNode.getAttribute("Saat") || dersNode.getAttribute("ToplamSaat") || "2", 10);
        const kartlar = Array.from(dersNode.getElementsByTagName("Kart"));
        if (kartlar.length === 0) {
          newUnplaced.push({ id: generateId(), teachers: teacherNames, classes: classNames, rooms: [], subject: sName, hours: defaultDersHours || 2 });
          return;
        }
        
        kartlar.forEach(kart => {
          const yerlesimAttr = kart.getAttribute("Yerlesim")?.trim() || "";
          const saatIds = yerlesimAttr ? yerlesimAttr.split(',').map(s => s.trim()).filter(Boolean) : [];
          const roomIds = (kart.getAttribute("Derslikler") || "").split(',').map(s => s.trim()).filter(Boolean);
          const roomNames = roomIds.map(id => rMap[id]).filter(Boolean);

          const saatAttr = parseInt(kart.getAttribute("Saat") || "0", 10);
          let hours = saatAttr > 0 ? saatAttr : (saatIds.length > 0 ? saatIds.length : 1);
          let placed = false;
          
          const cardId = generateId();
          const cardData = JSON.stringify({ 
            id: cardId, 
            teachers: teacherNames, 
            classes: classNames, 
            rooms: roomNames, 
            subject: sName,
            span: hours,
            hours: hours
          });

          saatIds.forEach(saatId => {
            const pos = saatMap[saatId];
            if (pos && pos.dIdx < 7 && pos.pIdx < 15) {
              teacherNames.forEach(t => { if(newSchedules[t]) newSchedules[t][pos.dIdx][pos.pIdx] = cardData; });
              classNames.forEach(c => { if(newClassSchedules[c]) newClassSchedules[c][pos.dIdx][pos.pIdx] = cardData; });
              roomNames.forEach(r => { if(newRoomSchedules[r]) newRoomSchedules[r][pos.dIdx][pos.pIdx] = cardData; });
              placed = true;
              loadedCards++;
            }
          });
          
          if (!placed && hours > 0) {
            newUnplaced.push({ id: generateId(), teachers: teacherNames, classes: classNames, rooms: roomNames, subject: sName, hours: hours });
          }
        });
      });

      // --- KISIT VE KOŞUL TESPİT MOTORU (Universal XML Constraint & Rule Engine) ---
      const newConstraints: {
        teachers: Record<string, string[]>;
        classes: Record<string, string[]>;
        subjects: Record<string, string[]>;
        rooms: Record<string, string[]>;
      } = { teachers: {}, classes: {}, subjects: {}, rooms: {} };

      const addConstraint = (type: 'teachers' | 'classes' | 'subjects' | 'rooms', name: string, slotKey: string) => {
        if (!name || !slotKey) return;
        if (!newConstraints[type][name]) newConstraints[type][name] = [];
        if (!newConstraints[type][name].includes(slotKey)) {
          newConstraints[type][name].push(slotKey);
        }
      };

      const addDayConstraint = (type: 'teachers' | 'classes' | 'subjects' | 'rooms', name: string, dIdx: number) => {
        if (!name || dIdx < 0 || dIdx >= newWeekDays.length) return;
        const periods = newWeekDays[dIdx]?.periods || 8;
        for (let p = 0; p < periods; p++) {
          addConstraint(type, name, `${dIdx}-${p}`);
        }
      };

      // 1. Explicit XML Nodes: Kisitlar, Kosullar, Kisit, Kosul, KapaliSaatler, IzinliSaatler, Kisitlama vb.
      const kisitNodes = [
        ...Array.from(xmlDoc.getElementsByTagName("Kisitlar")),
        ...Array.from(xmlDoc.getElementsByTagName("Kosullar")),
        ...Array.from(xmlDoc.getElementsByTagName("Kisit")),
        ...Array.from(xmlDoc.getElementsByTagName("Kosul")),
        ...Array.from(xmlDoc.getElementsByTagName("Kisitlama")),
        ...Array.from(xmlDoc.getElementsByTagName("OgretmenKisit")),
        ...Array.from(xmlDoc.getElementsByTagName("SinifKisit")),
        ...Array.from(xmlDoc.getElementsByTagName("DersKisit")),
        ...Array.from(xmlDoc.getElementsByTagName("DerslikKisit")),
        ...Array.from(xmlDoc.getElementsByTagName("KapaliSaatler")),
        ...Array.from(xmlDoc.getElementsByTagName("IzinliSaatler")),
        ...Array.from(xmlDoc.getElementsByTagName("KisitliGunler")),
        ...Array.from(xmlDoc.getElementsByTagName("IzinliGunler"))
      ];

      kisitNodes.forEach(node => {
        const ogretmenAttr = node.getAttribute("Ogretmen") || node.getAttribute("Ogretmenler") || node.getAttribute("OgretmenId");
        const sinifAttr = node.getAttribute("Sinif") || node.getAttribute("Siniflar") || node.getAttribute("SinifId");
        const derslikAttr = node.getAttribute("Derslik") || node.getAttribute("Derslikler") || node.getAttribute("DerslikId");
        const dersAttr = node.getAttribute("Ders") || node.getAttribute("Dersler") || node.getAttribute("DersId");

        const targetTeachers = ogretmenAttr ? ogretmenAttr.split(',').map(s => s.trim()).map(id => tMap[id] || id).filter(Boolean) : [];
        const targetClasses = sinifAttr ? sinifAttr.split(',').map(s => s.trim()).map(id => cMap[id] || id).filter(Boolean) : [];
        const targetRooms = derslikAttr ? derslikAttr.split(',').map(s => s.trim()).map(id => rMap[id] || id).filter(Boolean) : [];
        const targetSubjects = dersAttr ? dersAttr.split(',').map(s => s.trim()).map(id => sMap[id] || id).filter(Boolean) : [];

        const saatlerAttr = node.getAttribute("Saatler") || node.getAttribute("Saat") || node.getAttribute("SaatId") || node.getAttribute("Yerlesim");
        const gunAttr = node.getAttribute("Gun") || node.getAttribute("Gunler") || node.getAttribute("GunAdi") || node.getAttribute("GunId");

        if (saatlerAttr) {
          saatlerAttr.split(',').forEach(sId => {
            const rawId = sId.trim();
            const pos = saatMap[rawId];
            if (pos) {
              const key = `${pos.dIdx}-${pos.pIdx}`;
              targetTeachers.forEach(t => addConstraint('teachers', t, key));
              targetClasses.forEach(c => addConstraint('classes', c, key));
              targetRooms.forEach(r => addConstraint('rooms', r, key));
              targetSubjects.forEach(s => addConstraint('subjects', s, key));
            } else if (rawId.includes('-')) {
              targetTeachers.forEach(t => addConstraint('teachers', t, rawId));
              targetClasses.forEach(c => addConstraint('classes', c, rawId));
              targetRooms.forEach(r => addConstraint('rooms', r, rawId));
              targetSubjects.forEach(s => addConstraint('subjects', s, rawId));
            }
          });
        }

        if (gunAttr) {
          const gunStr = gunAttr.trim().toLocaleLowerCase('tr-TR');
          newWeekDays.forEach((wd, dIdx) => {
            if (wd.name.toLocaleLowerCase('tr-TR') === gunStr || String(dIdx + 1) === gunStr || String(wd.id) === gunStr) {
              targetTeachers.forEach(t => addDayConstraint('teachers', t, dIdx));
              targetClasses.forEach(c => addDayConstraint('classes', c, dIdx));
              targetRooms.forEach(r => addDayConstraint('rooms', r, dIdx));
              targetSubjects.forEach(s => addDayConstraint('subjects', s, dIdx));
            }
          });
        }
      });

      // 2. Explicit Attributes or Child Elements on Ogretmen, Sinif, Derslik, Ders
      const entityTypesConfig: Array<{ tag: string; type: 'teachers' | 'classes' | 'subjects' | 'rooms'; map: Record<string, string> }> = [
        { tag: "Ogretmen", type: "teachers", map: tMap },
        { tag: "Sinif", type: "classes", map: cMap },
        { tag: "Ders", type: "subjects", map: sMap },
        { tag: "Derslik", type: "rooms", map: rMap }
      ];

      entityTypesConfig.forEach(({ tag, type, map }) => {
        Array.from(xmlDoc.getElementsByTagName(tag)).forEach(n => {
          const id = n.getAttribute("id");
          const name = id ? map[id] : getEntityName(n);
          if (!name) return;

          const kisitAttr = n.getAttribute("Kisit") || n.getAttribute("Kosul") || n.getAttribute("Kapali") || n.getAttribute("KapaliSaatler") || n.getAttribute("KisitliGunler") || n.getAttribute("IzinliGunler") || n.getAttribute("Kisitlar") || n.getAttribute("KapaliIdler") || n.getAttribute("ZamanKisit") || n.getAttribute("ZamanKisitlamasi");
          if (kisitAttr) {
            kisitAttr.split(',').forEach(part => {
              const p = part.trim();
              if (saatMap[p]) {
                const pos = saatMap[p];
                addConstraint(type, name, `${pos.dIdx}-${pos.pIdx}`);
              } else if (p.includes('-')) {
                addConstraint(type, name, p);
              } else {
                newWeekDays.forEach((wd, dIdx) => {
                  if (wd.name.toLocaleLowerCase('tr-TR') === p.toLocaleLowerCase('tr-TR') || String(dIdx + 1) === p || String(wd.id) === p) {
                    addDayConstraint(type, name, dIdx);
                  }
                });
              }
            });
          }

          // Matris dizesi formatı (örn: KisitMatrisi="1111000...")
          const matrisAttr = n.getAttribute("KisitMatrisi") || n.getAttribute("ZamanMatrisi") || n.getAttribute("KisitDizisi");
          if (matrisAttr && matrisAttr.length >= newWeekDays.length * 5) {
            let mIdx = 0;
            for (let d = 0; d < newWeekDays.length; d++) {
              const wd = newWeekDays[d];
              const pCount = wd.periods || 8;
              for (let p = 0; p < pCount; p++) {
                if (mIdx < matrisAttr.length) {
                  const char = matrisAttr[mIdx];
                  // '0', 'H', 'h', '-', 'K', 'k' kısıtlı / kapalı anlamına gelir
                  if (char === '0' || char === 'H' || char === 'h' || char === '-' || char === 'K' || char === 'k') {
                    addConstraint(type, name, `${d}-${p}`);
                  }
                  mIdx++;
                }
              }
            }
          }

          Array.from(n.children).forEach(child => {
            const cName = child.tagName.toLocaleLowerCase('tr-TR');
            if (cName.includes('kapali') || cName.includes('kisit') || cName.includes('kosul') || cName.includes('izin')) {
              const sId = child.getAttribute("id") || child.getAttribute("Saat") || child.getAttribute("SaatId") || child.getAttribute("Yerlesim");
              if (sId) {
                sId.split(',').forEach(singleId => {
                  const s = singleId.trim();
                  if (saatMap[s]) {
                    const pos = saatMap[s];
                    addConstraint(type, name, `${pos.dIdx}-${pos.pIdx}`);
                  } else if (s.includes('-')) {
                    addConstraint(type, name, s);
                  }
                });
              }
              const gName = child.getAttribute("Gun") || child.getAttribute("Adi") || child.getAttribute("GunAdi") || child.getAttribute("GunId");
              if (gName) {
                newWeekDays.forEach((wd, dIdx) => {
                  if (wd.name.toLocaleLowerCase('tr-TR') === gName.toLocaleLowerCase('tr-TR') || String(dIdx + 1) === gName || String(wd.id) === gName) {
                    addDayConstraint(type, name, dIdx);
                  }
                });
              }
            }
          });
        });
      });

      // 3. Smart Schedule Constraint Detection (Dersler, Sınıflar, Öğretmenler ve Derslikler)
      // Okul genelinde normal gündüz ders saati sınırını (örn. 7 ders: 0-6 saatler) ve hafta sonu kullanımını tespit et
      const regularClassPeriods: number[] = [];
      let hasAnyWeekendLessons = false;

      Object.entries(newClassSchedules).forEach(([cName, matrix]) => {
        const nameUpper = cName.toLocaleUpperCase('tr-TR');
        const isExplicitKurs = nameUpper.includes("GRUP") || nameUpper.includes("DYK") || nameUpper.includes("KURS") || nameUpper.includes("KULÜP") || nameUpper.includes("ETKİNLİK");
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            if (matrix[d]?.[p]) {
              if (d >= 5) hasAnyWeekendLessons = true;
              if (!isExplicitKurs && d < 5) {
                regularClassPeriods.push(p);
              }
            }
          }
        }
      });

      const normalDayCutoff = regularClassPeriods.length > 0 ? (Math.max(...regularClassPeriods) + 1) : 7;
      const hasWeekendSchool = newWeekDays.some((wd, dIdx) => dIdx >= 5 && wd.active) && hasAnyWeekendLessons;

      // A) DERS KISITLAMALARI (Örn: TÜRKÇE haftaiçi 8-9. saatler ve Cumartesi kapalı; DYK ise ilk 7 saat kapalı)
      const subjectSlots: Record<string, Set<string>> = {};
      Object.values(sMap).forEach(sName => {
        subjectSlots[sName] = new Set();
      });

      Object.values(newClassSchedules).forEach(matrix => {
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            const rawCell = matrix[d]?.[p];
            if (rawCell) {
              try {
                const parsed = JSON.parse(rawCell);
                const sName = parsed.subject;
                if (sName && subjectSlots[sName]) {
                  subjectSlots[sName].add(`${d}-${p}`);
                }
              } catch (e) {}
            }
          }
        }
      });

      // Okuldaki genel Seçmeli Ders gününü/günlerini tespit et (Örn: Perşembe)
      const schoolElectiveDays = new Set<number>();
      Object.entries(subjectSlots).forEach(([sName, slots]) => {
        const nameUpper = sName.toLocaleUpperCase('tr-TR');
        if (nameUpper.includes("SEÇMELİ") || nameUpper.includes("SEÇ.") || nameUpper.startsWith("SEÇ ") || nameUpper.startsWith("SEÇM")) {
          slots.forEach(slotStr => {
            const [d] = slotStr.split('-').map(Number);
            schoolElectiveDays.add(d);
          });
        }
      });
      if (schoolElectiveDays.size === 0) {
        schoolElectiveDays.add(3); // Varsayılan: Perşembe
      }

      Object.entries(subjectSlots).forEach(([sName, slots]) => {
        const nameUpper = sName.toLocaleUpperCase('tr-TR');

        // Dersin haftalık programda işlendiği aktif günler
        const daysWithSubjectLessons = new Set<number>();
        slots.forEach(slotStr => {
          const [d] = slotStr.split('-').map(Number);
          daysWithSubjectLessons.add(d);
        });

        // Seçmeli Ders tespiti (SEÇMELİ SPOR VE FİZİKİ ETKİNLİKLER, SEÇMELİ OYUN VE OYUN ETKİNLİKLERİ vb.)
        const isSecmeliSubject = 
          nameUpper.includes("SEÇMELİ") || 
          nameUpper.includes("SEÇ.") || 
          nameUpper.startsWith("SEÇ ") || 
          nameUpper.startsWith("SEÇM");

        // Kurs / DYK / Etkinlik tespiti (Seçmeli dersler KESİNLİKLE kurs değildir)
        const isKursSubject = !isSecmeliSubject && (
          nameUpper.includes("DYK") || 
          (nameUpper.includes("ETKİNLİK") && !nameUpper.includes("SEÇ")) || 
          nameUpper.includes("KURS") || 
          nameUpper.includes("KULÜP") ||
          (slots.size > 0 && Array.from(slots).every(slotStr => {
            const [d, p] = slotStr.split('-').map(Number);
            return p >= normalDayCutoff || d >= 5;
          }))
        );

        if (isKursSubject) {
          // Kurs / Etkinlik dersleri (örn: YABANCI DİL ETKİNLİK, DYK):
          // Haftaiçi gündüz normal okul saatleri (ilk 7 ders, p=0..normalDayCutoff-1) kesinlikle kısıtlıdır
          for (let d = 0; d < Math.min(5, newWeekDays.length); d++) {
            const wd = newWeekDays[d];
            if (!wd.active) continue;
            const limit = Math.min(normalDayCutoff, wd.periods || 8);
            for (let p = 0; p < limit; p++) {
              addConstraint('subjects', sName, `${d}-${p}`);
            }
          }

          // Eğer ders hafta sonu verilmiyorsa (örn: YABANCI DİL ETKİNLİK sadece haftaiçi 8-9. saatlerde ise) hafta sonu kısıtlıdır
          const hasWeekendLessons = Array.from(slots).some(slotStr => {
            const [d] = slotStr.split('-').map(Number);
            return d >= 5;
          });

          if (!hasWeekendLessons && hasWeekendSchool) {
            for (let d = 5; d < newWeekDays.length; d++) {
              const wd = newWeekDays[d];
              if (!wd.active) continue;
              for (let p = 0; p < (wd.periods || 8); p++) {
                addConstraint('subjects', sName, `${d}-${p}`);
              }
            }
          }
        } else if (isSecmeliSubject) {
          // SEÇMELİ DERSLER (Örn: SEÇMELİ SPOR VE FİZİKİ ETKİNLİKLER, SEÇMELİ OYUN VE OYUN ETKİNLİKLERİ, SEÇMELİ OKUMA BECERİLERİ vb.):
          // 1) Dersin aktif olduğu günler (yerleşmişse o günler, henüz yerleşmemişse okuldaki seçmeli havuz günleri örn: Perşembe)
          const targetElectiveDays = daysWithSubjectLessons.size > 0 ? daysWithSubjectLessons : schoolElectiveDays;

          for (let d = 0; d < newWeekDays.length; d++) {
            const wd = newWeekDays[d];
            if (!wd.active) continue;
            const periodsInDay = wd.periods || 8;

            if (!targetElectiveDays.has(d)) {
              // Bu günde bu seçmeli ders yok -> Günün tamamı kısıtlıdır (Pzt, Salı, Çarş, Cuma, Cmt kapalı)
              for (let p = 0; p < periodsInDay; p++) {
                addConstraint('subjects', sName, `${d}-${p}`);
              }
            } else {
              // Bu günde bu seçmeli ders var (örn: Perşembe) -> Sadece normal okul saatlerinde yapılabilir (8. ve 9. saatler kapalı)
              if (d < 5) {
                for (let p = normalDayCutoff; p < periodsInDay; p++) {
                  addConstraint('subjects', sName, `${d}-${p}`);
                }
              }
            }
          }
        } else {
          // Normal müfredat dersleri (örn: TÜRKÇE, MATEMATİK, FEN BİLİMLERİ, SOSYAL BİLGİLER, İNGİLİZCE vb.):
          // 1) Haftaiçi kurs saatleri (8. ve 9. saatler, p >= normalDayCutoff) kesinlikle kısıtlıdır
          for (let d = 0; d < Math.min(5, newWeekDays.length); d++) {
            const wd = newWeekDays[d];
            if (!wd.active) continue;
            const periodsInDay = wd.periods || 8;
            for (let p = normalDayCutoff; p < periodsInDay; p++) {
              addConstraint('subjects', sName, `${d}-${p}`);
            }
          }

          // 2) Hafta sonu günleri (Cumartesi, Pazar) normal derslere tamamen kapalıdır
          for (let d = 5; d < newWeekDays.length; d++) {
            const wd = newWeekDays[d];
            if (!wd.active) continue;
            for (let p = 0; p < (wd.periods || 8); p++) {
              addConstraint('subjects', sName, `${d}-${p}`);
            }
          }
        }
      });

      // B) SINIF KISITLAMALARI (Örn: 5-1 GRUP haftaiçi ilk 7 saat kapalı; 5E ise haftaiçi 8-9 ve Cumartesi kapalı)
      Object.entries(newClassSchedules).forEach(([cName, matrix]) => {
        let totalHours = 0;
        const classSlotsList: Array<{ d: number; p: number }> = [];

        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            if (matrix[d]?.[p]) {
              totalHours++;
              classSlotsList.push({ d, p });
            }
          }
        }

        const nameUpper = cName.toLocaleUpperCase('tr-TR');
        const isKursClass = (nameUpper.includes("DYK") || nameUpper.includes("GRUP") || nameUpper.includes("KURS") || nameUpper.includes("KULÜP")) && !nameUpper.includes("DESTEK") &&
          (totalHours === 0 || classSlotsList.every(slot => slot.p >= normalDayCutoff || slot.d >= 5));

        if (isKursClass) {
          // Kurs / Grup sınıfları (örn: 5-1 GRUP, 5-2 GRUP, 6-1 GRUP, 8-1 DYK):
          // 1) Haftaiçi her gün ilk 7 ders (gündüz normal okul saatleri, p=0..normalDayCutoff-1) kısıtlıdır
          for (let d = 0; d < Math.min(5, newWeekDays.length); d++) {
            const wd = newWeekDays[d];
            if (!wd.active) continue;
            const limit = Math.min(normalDayCutoff, wd.periods || 8);
            for (let p = 0; p < limit; p++) {
              addConstraint('classes', cName, `${d}-${p}`);
            }
          }

          // 2) Eğer grup hafta sonu ders almıyorsa (örn: 5-1 GRUP sadece haftaiçi 8-9. saatlerde ise) hafta sonu kısıtlıdır
          const hasWeekendLessons = classSlotsList.some(slot => slot.d >= 5);
          if (!hasWeekendLessons && hasWeekendSchool) {
            for (let d = 5; d < newWeekDays.length; d++) {
              const wd = newWeekDays[d];
              if (!wd.active) continue;
              for (let p = 0; p < (wd.periods || 8); p++) {
                addConstraint('classes', cName, `${d}-${p}`);
              }
            }
          }
        } else {
          // Normal sınıflar (örn: 5A, 5B, 5C, 5D, 5E, 6A... 8D):
          // 1) Haftaiçi her gün 8. ve 9. saatler (p >= normalDayCutoff) normal sınıflara kısıtlıdır
          for (let d = 0; d < Math.min(5, newWeekDays.length); d++) {
            const wd = newWeekDays[d];
            if (!wd.active) continue;
            const periodsInDay = wd.periods || 8;
            for (let p = normalDayCutoff; p < periodsInDay; p++) {
              addConstraint('classes', cName, `${d}-${p}`);
            }
          }

          // 2) Hafta sonu günleri (Cumartesi, Pazar) normal sınıflara tamamen kısıtlıdır
          for (let d = 5; d < newWeekDays.length; d++) {
            const wd = newWeekDays[d];
            if (!wd.active) continue;
            for (let p = 0; p < (wd.periods || 8); p++) {
              addConstraint('classes', cName, `${d}-${p}`);
            }
          }
        }
      });

      // C) ÖĞRETMEN KISITLAMALARI
      // Öğretmenlerin haftaiçi 8-9. saatleri ve Cumartesi günleri ASLA otomatik olarak kapatılmaz (kısıtlanmaz).
      // Sadece XML'de açıkça tanımlı kısıtlar, tam zamanlı öğretmenlerin boş günleri veya sadece kurs veren öğretmenlerin gündüz kısıtları işlenir.
      Object.entries(newSchedules).forEach(([tName, weekMatrix]) => {
        let totalHours = 0;
        const dayHours: Record<number, number> = {};
        const teacherSlotsList: Array<{ d: number; p: number }> = [];
        
        for (let d = 0; d < 7; d++) {
          dayHours[d] = 0;
          for (let p = 0; p < 15; p++) {
            if (weekMatrix[d]?.[p]) {
              totalHours++;
              dayHours[d]++;
              teacherSlotsList.push({ d, p });
            }
          }
        }

        if (totalHours === 0) return;

        const activeWeekDays = newWeekDays.map((wd, dIdx) => ({ wd, dIdx })).filter(x => x.wd.active && x.dIdx < 5);
        const weekdaysWithLessons = activeWeekDays.filter(x => dayHours[x.dIdx] > 0).length;

        // 1) Tam Zamanlı Öğretmen Boş Gün Tespiti (örn: 15+ saat dersi olup 4 güne toplanmış öğretmenlerin 1 boş günü, örn: Zafer Kalkan - Çarşamba)
        if (totalHours >= 15 && weekdaysWithLessons === 4) {
          activeWeekDays.forEach(x => {
            if (dayHours[x.dIdx] === 0) {
              addDayConstraint('teachers', tName, x.dIdx);
            }
          });
        }

        // 2) Sadece DYK / Kurs veren (gündüz hiç dersi olmayan) öğretmenler için gündüz ilk 7 saat kısıtlaması
        const hasDaytimeLessons = teacherSlotsList.some(slot => slot.d < 5 && slot.p < normalDayCutoff);
        const hasAfterSchoolOrWeekendLessons = teacherSlotsList.some(slot => (slot.d < 5 && slot.p >= normalDayCutoff) || slot.d >= 5);
        if (!hasDaytimeLessons && hasAfterSchoolOrWeekendLessons) {
          for (let d = 0; d < Math.min(5, newWeekDays.length); d++) {
            const wd = newWeekDays[d];
            if (!wd.active) continue;
            const limit = Math.min(normalDayCutoff, wd.periods || 8);
            for (let p = 0; p < limit; p++) {
              addConstraint('teachers', tName, `${d}-${p}`);
            }
          }
        }
      });

      setTeachers(Object.values(tMap).sort((a,b) => a.localeCompare(b, 'tr')));
      setClasses(Object.values(cMap).sort((a,b) => a.localeCompare(b, 'tr')));
      setSubjects(Object.values(sMap).sort((a,b) => a.localeCompare(b, 'tr')));
      setRooms(Object.values(rMap).sort((a,b) => a.localeCompare(b, 'tr')));
      
      setSchedules(newSchedules);
      setClassSchedules(newClassSchedules);
      setRoomSchedules(newRoomSchedules);
      setUnplacedCourses(newUnplaced);
      setConstraints(newConstraints);

      const constrainedTeacherCount = Object.keys(newConstraints.teachers).filter(k => newConstraints.teachers[k].length > 0).length;
      const constrainedClassCount = Object.keys(newConstraints.classes).filter(k => newConstraints.classes[k].length > 0).length;
      const constrainedSubjectCount = Object.keys(newConstraints.subjects).filter(k => newConstraints.subjects[k].length > 0).length;
      const constrainedRoomCount = Object.keys(newConstraints.rooms).filter(k => newConstraints.rooms[k].length > 0).length;
      
      const totalConstrainedEntities = constrainedTeacherCount + constrainedClassCount + constrainedSubjectCount + constrainedRoomCount;

      if (totalConstrainedEntities > 0) {
        showToast(`XML Başarıyla Yüklendi! ${loadedCards} ders yerleşti. ${constrainedTeacherCount} öğretmen, ${constrainedClassCount} sınıf ve ${constrainedSubjectCount} derste tüm kısıt ve koşullar uygulandı.`);
      } else {
        showToast(`XML Başarıyla Yüklendi! ${loadedCards} adet matris hücresi yerleşti.`);
      }
      setMainTab('matrix');
    } catch (error) { showToast("Dosya Okuma Hatası: " + error.message, "error"); }
  };
  const ejectMultipleCellsFromSchedules = (blocksToEject) => {
      if (blocksToEject.length === 0) return;
      
      setSchedules(prevTSched => {
          const nextTSched = JSON.parse(JSON.stringify(prevTSched));
          blocksToEject.forEach(({ cData, dIdx, pStart, blockSize }) => {
              for (let i = 0; i < blockSize; i++) {
                  cData.teachers.forEach(tx => { if (nextTSched[tx]) nextTSched[tx][dIdx][pStart + i] = ''; });
              }
          });
          return nextTSched;
      });

      setClassSchedules(prevCSched => {
          const nextCSched = JSON.parse(JSON.stringify(prevCSched));
          blocksToEject.forEach(({ cData, dIdx, pStart, blockSize }) => {
              for (let i = 0; i < blockSize; i++) {
                  cData.classes.forEach(cx => { if (nextCSched[cx]) nextCSched[cx][dIdx][pStart + i] = ''; });
              }
          });
          return nextCSched;
      });

      setRoomSchedules(prevRSched => {
          const nextRSched = JSON.parse(JSON.stringify(prevRSched));
          blocksToEject.forEach(({ cData, dIdx, pStart, blockSize }) => {
              for (let i = 0; i < blockSize; i++) {
                  cData.rooms?.forEach(rx => { if (nextRSched[rx]) nextRSched[rx][dIdx][pStart + i] = ''; });
              }
          });
          return nextRSched;
      });

      setUnplacedCourses(prevPool => {
          const nextPool = [...prevPool];
          blocksToEject.forEach(({ cData, blockSize }) => {
              nextPool.push({
                  id: cData.id,
                  teachers: cData.teachers,
                  classes: cData.classes,
                  rooms: cData.rooms || [],
                  subject: cData.subject,
                  hours: blockSize,
                  failCount: 0
              });
          });
          return nextPool;
      });
  };

  const getEjectBlockInfo = (valStr, dIdx, pIdx) => {
      if (!valStr || valStr === '') return null;
      const cData = parseCellData(valStr);
      if (!cData) return null;
      
      const t = cData.teachers[0];
      if (!schedules[t]) return null;
      
      let pStart = pIdx;
      while(pStart > 0 && (schedules[t][dIdx][pStart - 1] === valStr || parseCellData(schedules[t][dIdx][pStart - 1])?.id === cData.id)) pStart--;
      
      let blockSize = Math.max(1, parseInt(cData.span || (cData as any).hours || 1, 10));
      const maxPeriods = schoolSettings.weekDays[dIdx]?.periods || 15;
      while(pStart + blockSize < maxPeriods && (schedules[t][dIdx][pStart + blockSize] === valStr || parseCellData(schedules[t][dIdx][pStart + blockSize])?.id === cData.id)) blockSize++;
      
      return { cData, dIdx, pStart, blockSize, valStr };
  };

  // Cache to prevent duplicate ejections within the same event loop
  const ejectedInThisEventLoop = useRef(new Set());

  const ejectCellIfOccupied = (typeKey, entityName, dIdx, pIdx) => {
      const blocksToEjectMap = new Map();
      
      const checkAndEject = (valStr) => {
          if (!valStr || valStr === '') return;
          if (ejectedInThisEventLoop.current.has(valStr)) return;
          const info = getEjectBlockInfo(valStr, dIdx, pIdx);
          if (info && !blocksToEjectMap.has(info.valStr)) {
              blocksToEjectMap.set(info.valStr, info);
              ejectedInThisEventLoop.current.add(info.valStr);
              setTimeout(() => ejectedInThisEventLoop.current.delete(info.valStr), 0);
          }
      };

      if (typeKey === 'teachers' && schedules[entityName]?.[dIdx]?.[pIdx]) checkAndEject(schedules[entityName][dIdx][pIdx]);
      else if (typeKey === 'classes' && classSchedules[entityName]?.[dIdx]?.[pIdx]) checkAndEject(classSchedules[entityName][dIdx][pIdx]);
      else if (typeKey === 'rooms' && roomSchedules[entityName]?.[dIdx]?.[pIdx]) checkAndEject(roomSchedules[entityName][dIdx][pIdx]);
      else if (typeKey === 'subjects') {
          Object.keys(schedules).forEach(t => {
              const val = schedules[t]?.[dIdx]?.[pIdx];
              if (val) {
                 const cData = parseCellData(val);
                 if (cData && cData.subject === entityName) checkAndEject(val);
              }
          });
      }
      
      if (blocksToEjectMap.size > 0) {
          const blocksToEject = Array.from(blocksToEjectMap.values());
          ejectMultipleCellsFromSchedules(blocksToEject);
          // showToast is handled at the caller or we can do it here:
          // setTimeout(() => { showToast(`Koşul kapatıldığı için çakışan ${blocksToEject.length} ders havuza alındı.`, "info"); }, 50);
      }
  };

  const toggleSpecificConstraint = (typeKey, name, dIdx, pIdx, forceClosedState) => {
    const key = `${dIdx}-${pIdx}`;
    let isClosing = false;
    
    setConstraints(prev => {
       const newConst = {...prev};
       if (!newConst[typeKey][name]) newConst[typeKey][name] = [];
       let list = newConst[typeKey][name];
       
       if (forceClosedState === true && !list.includes(key)) {
           list.push(key);
           isClosing = true;
       }
       else if (forceClosedState === false && list.includes(key)) {
           list = list.filter(k => k !== key);
       }
       newConst[typeKey][name] = list;
       return newConst;
    });

    if (isClosing || forceClosedState === true) {
       ejectCellIfOccupied(typeKey, name, dIdx, pIdx);
    }
  };

  const toggleDayConstraints = (typeKey, name, dIdx, periods) => {
    const allClosed = Array.from({length: periods}).every((_, p) => constraints[typeKey][name]?.includes(`${dIdx}-${p}`));
    for(let p = 0; p < periods; p++) toggleSpecificConstraint(typeKey, name, dIdx, p, !allClosed); 
  };


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => parseXMLData(evt.target.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportProgramData = () => {
    const data = getFullBackupData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ders_programi_yedek_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Program ve nöbet verileri başarıyla dışa aktarıldı.", "success");
  };

  const handleProgramUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = evt.target?.result as string;
        const data = JSON.parse(raw);
        applyFullBackupData(data);
        showToast("Program ve nöbet verileri başarıyla yüklendi.", "success");
      } catch (err) {
        console.error("Program yükleme hatası:", err);
        showToast("Program dosyası okunamadı. Geçersiz JSON formatı.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRequestNewWorkspace = () => {
    setConfirmDialog({
      title: "Yeni Boş Çalışma Alanı",
      message: "Hafızada tutulan tüm ders programı verileri, ders havuzu kartları, öğretmenler, sınıflar, derslikler, nöbet listeleri ve yerel kayıtlar tamamen silinerek sıfırdan boş bir uygulama açılacaktır. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?",
      confirmText: "Evet, Yeni Başlat",
      onConfirm: () => {
        // 1. Çalışan arka plan motorunu sonlandır
        try {
          workerBridgeRef.current?.terminate();
        } catch (e) {
          console.error("Worker stop error:", e);
        }

        // 2. Çekirdek program verilerini sıfırla
        setTeachers([]);
        setClasses([]);
        setSubjects([]);
        setRooms([]);
        setShortNames({});
        setSchedules({});
        setClassSchedules({});
        setRoomSchedules({});
        setLockedCells({});
        setUnplacedCourses([]);
        setConstraints({ teachers: {}, classes: {}, subjects: {}, rooms: {} });
        setSchoolInfo({ name: 'Belirtilmedi', year: '2025-2026', principal: '', vicePrincipal: '' });
        setSchoolSettings(DEFAULT_SETTINGS);

        // 3. Analiz, teşhis ve filtre durumlarını sıfırla
        setShadowAnalysis(null);
        setDifficultyHeatmap(null);
        setDeadEndWarnings([]);
        setDeepLearningStats({ learnedPaths: 0, bottlenecks: 0 });
        setConflictReport(null);
        setHighlightedEntity(null);
        setMobileSelectedForSwap(null);
        setInspectingCard(null);
        setEditingItem(null);
        setEditValue("");
        setNewItemName("");
        setDistributeState({ isRunning: false, progress: 0, phase: '', activeCoresCount: 4, recoveryCount: 0 });
        setCoreStates([]);
        setPoolForm({ teachers: [], classes: [], rooms: [], subject: '', format: '2', editingId: null });
        setModalPoolForm({ teachers: [], classes: [], rooms: [], subject: "", format: "2", editingId: null });

        // 4. Tarayıcı yerel hafızasındaki (localStorage) nöbet ve geçici tüm kayıtları temizle
        try {
          localStorage.clear();
        } catch (e) {
          console.error("LocalStorage clear error:", e);
        }

        // 5. Bağımlı bileşenleri (DutyManager vb.) tazelemek için anahtarı güncelle
        setWorkspaceKey(prev => prev + 1);

        // 6. Ana dağıtım motoru görünümüne geç
        setMainTab('matrix');
        setMobileMatrixTab('preview');

        showToast("Yeni boş çalışma alanı açıldı. Tüm veriler başarıyla sıfırlandı.", "success");
      }
    });
  };

  const toggleMultiSelect = (type, value) => {
      setPoolForm(prev => {
          const currentList = prev[type] || [];
          if (currentList.includes(value)) {
              return { ...prev, [type]: currentList.filter(item => item !== value) };
          } else {
              return { ...prev, [type]: [...currentList, value] };
          }
      });
  };

  const handleCreatePoolCard = () => {
    if (poolForm.teachers.length === 0 || poolForm.classes.length === 0 || !poolForm.subject || !poolForm.format) {
        return showToast("Eksik alan var. Öğretmen, Sınıf ve Ders zorunludur.", "warning");
    }
    const parts = poolForm.format.split('+').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (parts.length === 0) return showToast("Geçersiz saat formatı. Örnek: 2+1, 3", "error");
    
    let currentUnplaced = unplacedCourses;
    
    let isPlaced = false;
    if (poolForm.editingId) {
        // Find the original card in unplaced
        const inUnplaced = currentUnplaced.find(c => c.id === poolForm.editingId);
        
        if (!inUnplaced) {
            // It might be on the board!
            isPlaced = true;
            // Let's remove it from the board
            const newTSched = JSON.parse(JSON.stringify(schedules));
            const newCSched = JSON.parse(JSON.stringify(classSchedules));
            const newRSched = JSON.parse(JSON.stringify(roomSchedules));
            
            let cardStrToRemove = null;
            (Object.values(newTSched) as any[]).forEach(days => {
                days.forEach((periods: any) => {
                    periods.forEach((val, pIdx) => {
                        if (val && val.includes(poolForm.editingId)) {
                            cardStrToRemove = val;
                        }
                    });
                });
            });
            
            if (cardStrToRemove) {
                (Object.values(newTSched) as any[]).forEach(days => days.forEach((periods: any) => periods.forEach((val, pIdx, arr) => { if(val === cardStrToRemove) arr[pIdx] = ''; })));
                (Object.values(newCSched) as any[]).forEach(days => days.forEach((periods: any) => periods.forEach((val, pIdx, arr) => { if(val === cardStrToRemove) arr[pIdx] = ''; })));
                (Object.values(newRSched) as any[]).forEach(days => days.forEach((periods: any) => periods.forEach((val, pIdx, arr) => { if(val === cardStrToRemove) arr[pIdx] = ''; })));
                setSchedules(newTSched);
                setClassSchedules(newCSched);
                setRoomSchedules(newRSched);
            }
        }
    }
    if (poolForm.editingId) {
        currentUnplaced = currentUnplaced.filter(c => c.id !== poolForm.editingId);
    }

    const newCards = parts.map(h => ({ 
        id: generateId(), 
        teachers: poolForm.teachers, 
        classes: poolForm.classes, 
        rooms: poolForm.rooms, 
        subject: poolForm.subject, 
        hours: h,
        failCount: 0 
    }));
    
    setUnplacedCourses([...currentUnplaced, ...newCards]);
    setPoolForm({ teachers: [], classes: [], rooms: [], subject: '', format: '2', editingId: null });
    showToast(poolForm.editingId ? "Kart güncellendi!" : "Kartlar havuza eklendi!");
  };

  const handleDeletePoolCard = (id) => setUnplacedCourses(unplacedCourses.filter(c => c.id !== id));
  
  const editPoolCard = (card) => {
     setPoolForm({ 
         teachers: card.teachers || [], 
         classes: card.classes || [], 
         rooms: card.rooms || [], 
         subject: card.subject || '', 
         format: String(card.hours),
         editingId: card.id
     });
     showToast("Kart düzenleniyor... Formda güncelleyip Karta Çevir'e basın.", "info");
  };

  
  const workerBridgeRef = useRef<QuantumWorkerBridge | null>(null);

  useEffect(() => {
    globalErrorHandler.init();

    workerBridgeRef.current = new QuantumWorkerBridge({
      onProgress: (globalState, cores) => {
        setDistributeState({
          isRunning: globalState.isRunning,
          progress: globalState.progress,
          phase: globalState.phase,
          activeCoresCount: globalState.activeCoresCount,
          recoveryCount: globalState.recoveryCount
        });
        setCoreStates(cores);
      },
      onWorkerRecovering: (info: WorkerRecoveryInfo) => {
        showToast(
          `Çekirdek #${info.workerIndex + 1} beklenmeyen bir aksaklık sebebiyle otomatik olarak kurtarıldı (${info.retryCount}/${info.maxRetries}).`,
          "warning"
        );
      },
      onError: (err: Error) => {
        globalErrorHandler.logError({
          source: 'worker',
          message: err.message,
          stack: err.stack,
          isFatal: false,
          handled: true
        });
      }
    });

    return () => {
      workerBridgeRef.current?.terminate();
    };
  }, []);

  const terminateWorkers = () => {
    workerBridgeRef.current?.terminate();
  };

  const stopDistributePro = () => {
    backgroundTaskManager.cancelTasksWithLock('SCHEDULE_OPTIMIZATION_MUTEX', 'Kullanıcı durdurdu');
    workerBridgeRef.current?.stop();
    setDistributeState(prev => ({ ...prev, phase: 'İptal Ediliyor, En İyi Sonuç Hazırlanıyor...' }));
    showToast("Dağıtım durduruluyor, bulunan en iyi sonuç getiriliyor...", "info");
  };

  const autoDistributePro = async () => {
    const coreCount = selectedCoreCount;
    if (unplacedCourses.length === 0) return showToast("Dağıtılacak kart havuzda yok.", "warning");
    
    setInitialDistributeUnplacedCount(unplacedCourses.length);
    const activeHeatmap = difficultyHeatmap || shadowAnalysis?.heatmap || null;

    setDistributeState({ 
      isRunning: true, 
      progress: 0, 
      phase: activeHeatmap 
        ? `Kuantum AI: Öngörülü Zorluk Haritası ile Hızlandırılıyor (${coreCount} Çekirdek)...` 
        : `Kuantum AI Motoru (${coreCount} Çekirdek) Başlatılıyor...`,
      activeCoresCount: coreCount,
      recoveryCount: 0 
    });
    setCoreStates(Array.from({ length: coreCount }, (_, i) => ({ 
      progress: 0, 
      phase: activeHeatmap ? 'Zorluk Haritası Yükleniyor...' : 'Hazırlanıyor...',
      workerIndex: i,
      timestamp: performance.now(),
      status: 'idle',
      retryCount: 0
    })));
    
    if (!workerBridgeRef.current) {
      workerBridgeRef.current = new QuantumWorkerBridge({
        onProgress: (globalState, cores) => {
          setDistributeState({
            isRunning: globalState.isRunning,
            progress: globalState.progress,
            phase: globalState.phase,
            activeCoresCount: globalState.activeCoresCount,
            recoveryCount: globalState.recoveryCount
          });
          setCoreStates(cores);
        },
        onWorkerRecovering: (info: WorkerRecoveryInfo) => {
          showToast(
            `Çekirdek #${info.workerIndex + 1} otomatik kurtarıldı (${info.retryCount}/${info.maxRetries}).`,
            "warning"
          );
        },
        onError: (err: Error) => {
          globalErrorHandler.logError({
            source: 'worker',
            message: err.message,
            stack: err.stack,
            isFatal: false,
            handled: true
          });
        }
      });
    }

    try {
      // Dispatch via Background Task Queue to prevent race conditions and lock against concurrent mutations
      const { promise } = backgroundTaskManager.enqueue(
        TaskType.CUSTOM,
        `Kuantum Dağıtım (${coreCount} Çekirdek)`,
        {
          fn: async () => {
            return await workerBridgeRef.current!.start({
              unplacedCourses: unplacedCourses as any,
              schoolSettings: schoolSettings as any,
              schedules,
              classSchedules,
              roomSchedules,
              lockedCells,
              constraints,
              coreCount,
              heuristicHeatmap: activeHeatmap,
              options: {
                maxRetriesPerWorker: 3,
                watchdogTimeoutMs: 12000
              }
            });
          }
        },
        {
          priority: 'CRITICAL',
          lockKey: 'SCHEDULE_OPTIMIZATION_MUTEX',
          cancelPreviousWithSameLock: true
        }
      );

      const bestResult = await promise;

      if (bestResult) {
        setSchedules(bestResult.schedules);
        setClassSchedules(bestResult.classSchedules);
        setRoomSchedules(bestResult.roomSchedules);
        setUnplacedCourses(bestResult.unplacedCourses);
        
        setDistributeState({ isRunning: false, progress: 100, phase: 'Tamamlandı' });
        
        if (bestResult.unplacedCourses.length > 0) {
          showToast(`Sistem ${bestResult.iter} ihtimali taradı. Matematiksel kısıtlar sebebiyle ${bestResult.unplacedCourses.length} ders yerleşemedi.`, "warning");
        } else {
          showToast(`Kusursuz! Yapay Zeka modeli milyarlarca olasılığı tarayıp ${bestResult.iter} iterasyonda 0 çatışma ile optimum programı oluşturdu.`, "success");
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('iptal')) {
        setDistributeState({ isRunning: false, progress: 0, phase: 'İptal edildi' });
        return;
      }
      console.error('Distribution error:', err);
      setDistributeState({ isRunning: false, progress: 0, phase: '' });
      showToast(err?.message || "Dağıtım işlemi gerçekleştirilemedi.", "error");
    }
  };


  const checkCellConflict = (cData: any, dIdx: number, pStart: number, blockSize: number) => {
    if (!cData) return { hasConflict: false, reasons: [] };
    const reasons: string[] = [];

    // 1. Teacher conflicts & constraints
    if (cData.teachers && cData.teachers.length > 0) {
      cData.teachers.forEach((t: string) => {
        for (let i = 0; i < blockSize; i++) {
          const p = pStart + i;
          const constraintKey = `${dIdx}-${p}`;
          // Closed / constrained
          if (constraints.teachers?.[t]?.includes(constraintKey)) {
            reasons.push(`${t} öğretmeninin ${p + 1}. ders saati kısıtlı/kapalı.`);
          }
          // Double booked with another card
          const val = schedules[t]?.[dIdx]?.[p];
          if (val && val !== '') {
            const parsed = parseCellData(val);
            if (parsed && parsed.id !== cData.id) {
              reasons.push(`${t} öğretmeni aynı saatte başka bir derste (${parsed.classes?.join(', ')} - ${parsed.subject}).`);
            }
          }
        }
      });
    }

    // 2. Class conflicts & constraints
    if (cData.classes && cData.classes.length > 0) {
      cData.classes.forEach((cl: string) => {
        for (let i = 0; i < blockSize; i++) {
          const p = pStart + i;
          const constraintKey = `${dIdx}-${p}`;
          // Closed / constrained
          if (constraints.classes?.[cl]?.includes(constraintKey)) {
            reasons.push(`${cl} sınıfının ${p + 1}. ders saati kısıtlı/kapalı.`);
          }
          // Double booked with another card
          const val = classSchedules[cl]?.[dIdx]?.[p];
          if (val && val !== '') {
            const parsed = parseCellData(val);
            if (parsed && parsed.id !== cData.id) {
              reasons.push(`${cl} sınıfı aynı saatte başka bir derse atanmış (${parsed.subject} - ${parsed.teachers?.join(', ')}).`);
            }
          }
        }
      });
    }

    // 3. Room conflicts & constraints
    if (cData.rooms && cData.rooms.length > 0) {
      cData.rooms.forEach((r: string) => {
        for (let i = 0; i < blockSize; i++) {
          const p = pStart + i;
          const constraintKey = `${dIdx}-${p}`;
          // Closed / constrained
          if (constraints.rooms?.[r]?.includes(constraintKey)) {
            reasons.push(`${r} dersliğinin ${p + 1}. ders saati kısıtlı/kapalı.`);
          }
          // Double booked with another card
          const val = roomSchedules[r]?.[dIdx]?.[p];
          if (val && val !== '') {
            const parsed = parseCellData(val);
            if (parsed && parsed.id !== cData.id) {
              reasons.push(`${r} dersliği aynı saatte başka bir derse atanmış (${parsed.subject}).`);
            }
          }
        }
      });
    }

    // 4. Subject constraints & distribution rules
    if (cData.subject) {
      for (let i = 0; i < blockSize; i++) {
        const p = pStart + i;
        const constraintKey = `${dIdx}-${p}`;
        if (constraints.subjects?.[cData.subject]?.includes(constraintKey)) {
          reasons.push(`${cData.subject} dersi için ${p + 1}. saat kısıtlı.`);
        }
      }

      const rules = (schoolSettings as any).distributionRules || { preventSameDay: true };
      if (cData.classes && cData.classes.length > 0) {
        cData.classes.forEach((cl: string) => {
          const sameDayCards: any[] = [];
          const seenIds = new Set<string>();

          const daySched = classSchedules[cl]?.[dIdx];
          if (Array.isArray(daySched)) {
            daySched.forEach((cellVal: string) => {
              if (cellVal && cellVal !== '') {
                const parsed = parseCellData(cellVal);
                if (parsed && parsed.subject === cData.subject && parsed.id !== cData.id && !seenIds.has(parsed.id)) {
                  seenIds.add(parsed.id);
                  sameDayCards.push(parsed);
                }
              }
            });
          }

          if (sameDayCards.length > 0) {
            if (rules.preventSameDay) {
              reasons.push(`${cl} sınıfında ${cData.subject} dersi aynı gün içinde birden fazla kez yer alıyor.`);
            }
            if (rules.maxHoursActive) {
              let totalHours = blockSize;
              sameDayCards.forEach(sc => totalHours += (sc.hours || 1));
              if (totalHours > rules.maxHours) {
                reasons.push(`${cl} sınıfında ${cData.subject} dersi günlük ${rules.maxHours} saat sınırını (${totalHours} saat) aşıyor.`);
              }
            }
          }
        });
      }
    }

    return {
      hasConflict: reasons.length > 0,
      reasons
    };
  };

  const isDropTargetValid = (cardData: any, blockSize: number, targetDIdx: number, targetPIdx: number, dragInfo?: any) => {
    if (!cardData) return false;
    const hours = blockSize || 1;
    const dayPeriods = schoolSettings.weekDays[targetDIdx]?.periods || 15;
    
    // 1. Day bounds check
    if (targetPIdx + hours > dayPeriods) return false;

    // 2. Locked cell check
    if (cardData.teachers?.length) {
      for (const t of cardData.teachers) {
        for (let i = 0; i < hours; i++) {
          if (lockedCells[`${t}-${targetDIdx}-${targetPIdx + i}`]) return false;
        }
      }
    }
    if (cardData.classes?.length) {
      for (const c of cardData.classes) {
        for (let i = 0; i < hours; i++) {
          if (lockedCells[`${c}-${targetDIdx}-${targetPIdx + i}`]) return false;
        }
      }
    }
    if (cardData.rooms?.length) {
      for (const r of cardData.rooms) {
        for (let i = 0; i < hours; i++) {
          if (lockedCells[`${r}-${targetDIdx}-${targetPIdx + i}`]) return false;
        }
      }
    }

    // 3. Closed hours constraints check
    if (cardData.teachers?.length) {
      for (const t of cardData.teachers) {
        for (let i = 0; i < hours; i++) {
          if (constraints.teachers?.[t]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return false;
        }
      }
    }
    if (cardData.classes?.length) {
      for (const cl of cardData.classes) {
        for (let i = 0; i < hours; i++) {
          if (constraints.classes?.[cl]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return false;
        }
      }
    }
    if (cardData.rooms?.length) {
      for (const r of cardData.rooms) {
        for (let i = 0; i < hours; i++) {
          if (constraints.rooms?.[r]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return false;
        }
      }
    }
    if (cardData.subject) {
      for (let i = 0; i < hours; i++) {
        if (constraints.subjects?.[cardData.subject]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return false;
      }
    }

    // 4. Double booking / overlap check (is teacher/class teaching another lesson?)
    if (cardData.teachers?.length) {
      for (const t of cardData.teachers) {
        for (let i = 0; i < hours; i++) {
          const curP = targetPIdx + i;
          const val = schedules[t]?.[targetDIdx]?.[curP];
          if (val && val !== '') {
            const parsed = parseCellData(val);
            if (parsed && parsed.id !== cardData.id) {
              return false;
            }
          }
        }
      }
    }

    if (cardData.classes?.length) {
      for (const cl of cardData.classes) {
        for (let i = 0; i < hours; i++) {
          const curP = targetPIdx + i;
          const val = classSchedules[cl]?.[targetDIdx]?.[curP];
          if (val && val !== '') {
            const parsed = parseCellData(val);
            if (parsed && parsed.id !== cardData.id) {
              return false;
            }
          }
        }
      }
    }

    if (cardData.rooms?.length) {
      for (const r of cardData.rooms) {
        for (let i = 0; i < hours; i++) {
          const curP = targetPIdx + i;
          const val = roomSchedules[r]?.[targetDIdx]?.[curP];
          if (val && val !== '') {
            const parsed = parseCellData(val);
            if (parsed && parsed.id !== cardData.id) {
              return false;
            }
          }
        }
      }
    }

    return true;
  };

  const handleDragStart = (e: any, sourceEntity: any, dIdx: number, pIdx: number, targetValue: any, blockSize: number) => {
     if (!targetValue) return; 
     const cardData = parseCellData(targetValue);
     draggedItemRef.current = {
       source: 'timetable',
       cardData,
       blockSize: blockSize || 1,
       sourceEntity,
       dIdx,
       pIdx
     };
     e.dataTransfer.effectAllowed = 'move';
     e.dataTransfer.setData('text/plain', JSON.stringify({ 
       source: 'timetable', 
       sourceEntity, 
       dIdx, 
       pIdx, 
       targetValue, 
       blockSize 
     }));
  };

  const handlePoolDragStart = (e: any, card: any) => {
     draggedItemRef.current = {
       source: 'pool',
       cardData: card,
       blockSize: card?.hours || 1
     };
     e.dataTransfer.effectAllowed = 'move';
     e.dataTransfer.setData('text/plain', JSON.stringify({ 
       source: 'pool', 
       card 
     }));
  };

  const handleDragEnd = () => {
     draggedItemRef.current = null;
     document.querySelectorAll('.droppable-valid, .droppable-invalid').forEach(el => {
       el.classList.remove('droppable-valid', 'droppable-invalid');
     });
  };

  const handleCellDragEnter = (e: React.DragEvent<HTMLElement>, targetRowKey: string, targetDIdx: number, targetPIdx: number, targetBlockSize: number) => {
     e.preventDefault();
     const currentDrag = draggedItemRef.current;
     if (!currentDrag) return;

     const isValid = isDropTargetValid(currentDrag.cardData, currentDrag.blockSize, targetDIdx, targetPIdx, currentDrag);
     const targetEl = e.currentTarget;
     if (isValid) {
       targetEl.classList.remove('droppable-invalid');
       targetEl.classList.add('droppable-valid');
     } else {
       targetEl.classList.remove('droppable-valid');
       targetEl.classList.add('droppable-invalid');
     }
  };

  const handleCellDragLeave = (e: React.DragEvent<HTMLElement>) => {
     if (!e.currentTarget.contains(e.relatedTarget as Node)) {
       e.currentTarget.classList.remove('droppable-valid', 'droppable-invalid');
     }
  };

  const handleCellDragOver = (e: React.DragEvent<HTMLElement>, targetRowKey: string, targetDIdx: number, targetPIdx: number, targetBlockSize: number) => {
     e.preventDefault();
     e.dataTransfer.dropEffect = 'move';
     const targetEl = e.currentTarget;
     if (!targetEl.classList.contains('droppable-valid') && !targetEl.classList.contains('droppable-invalid')) {
       const currentDrag = draggedItemRef.current;
       if (currentDrag) {
         const isValid = isDropTargetValid(currentDrag.cardData, currentDrag.blockSize, targetDIdx, targetPIdx, currentDrag);
         if (isValid) {
           targetEl.classList.add('droppable-valid');
         } else {
           targetEl.classList.add('droppable-invalid');
         }
       }
     }
  };

  const handleCellDrop = (e: React.DragEvent<HTMLElement>, destEntity: any, targetDIdx: number, targetPIdx: number, targetBlockSize: number, existingValue: any) => {
     e.currentTarget.classList.remove('droppable-valid', 'droppable-invalid');
     document.querySelectorAll('.droppable-valid, .droppable-invalid').forEach(el => {
       el.classList.remove('droppable-valid', 'droppable-invalid');
     });
     draggedItemRef.current = null;
     handleDropToTimetable(e, destEntity, targetDIdx, targetPIdx, targetBlockSize, existingValue);
  };

  const handleDropToTimetable = (e: any, destEntity: any, targetDIdx: number, targetPIdx: number, targetBlockSize: number, existingValue: any) => {
     e.preventDefault();
     const payload = JSON.parse(e.dataTransfer.getData('text/plain') || "null");
     if (!payload) return;

     const newTSched = JSON.parse(JSON.stringify(schedules));
     const newCSched = JSON.parse(JSON.stringify(classSchedules));
     const newRSched = JSON.parse(JSON.stringify(roomSchedules));
     let newUnplaced = [...unplacedCourses];

     const executePlacement = (cardData: any, hours: number, d: number, p: number) => {
         const data = typeof cardData === 'string' ? parseCellData(cardData) : cardData;
         if (!data) return;
         const cardDataStr = typeof cardData === 'string' ? cardData : JSON.stringify({
             id: data.id || generateId(),
             teachers: data.teachers || [],
             classes: data.classes || [],
             rooms: data.rooms || [],
             subject: data.subject || '',
             hours: hours
         });
         const maxPeriods = schoolSettings.weekDays[d]?.periods || 15;
         for (let i = 0; i < hours; i++) {
             const curP = p + i;
             if (curP >= maxPeriods) break;
             data.teachers?.forEach((t: string) => {
                 if (!newTSched[t]) newTSched[t] = Array.from({length: 7}, () => Array(15).fill(''));
                 if (!newTSched[t][d]) newTSched[t][d] = Array(15).fill('');
                 newTSched[t][d][curP] = cardDataStr;
             });
             data.classes?.forEach((cl: string) => {
                 if (!newCSched[cl]) newCSched[cl] = Array.from({length: 7}, () => Array(15).fill(''));
                 if (!newCSched[cl][d]) newCSched[cl][d] = Array(15).fill('');
                 newCSched[cl][d][curP] = cardDataStr;
             });
             data.rooms?.forEach((r: string) => {
                 if (!newRSched[r]) newRSched[r] = Array.from({length: 7}, () => Array(15).fill(''));
                 if (!newRSched[r][d]) newRSched[r][d] = Array(15).fill('');
                 newRSched[r][d][curP] = cardDataStr;
             });
         }
     };

     const executeRemoval = (cardData: any, hours: number, d: number, p: number) => {
         const data = typeof cardData === 'string' ? parseCellData(cardData) : cardData;
         if (!data) return;
         const maxPeriods = schoolSettings.weekDays[d]?.periods || 15;
         for (let i = 0; i < hours; i++) {
             const curP = p + i;
             if (curP >= maxPeriods) break;
             data.teachers?.forEach((t: string) => { if (newTSched[t]?.[d]) newTSched[t][d][curP] = ''; });
             data.classes?.forEach((cl: string) => { if (newCSched[cl]?.[d]) newCSched[cl][d][curP] = ''; });
             data.rooms?.forEach((r: string) => { if (newRSched[r]?.[d]) newRSched[r][d][curP] = ''; });
         }
     };

     const dayMaxPeriods = schoolSettings.weekDays[targetDIdx]?.periods || 8;

     // 1. DRAG FROM POOL
     if (payload.source === 'pool') {
        const sourceHours = payload.card.hours || 1;
        const sourceCardData = payload.card;
        const fitHours = Math.max(0, Math.min(sourceHours, dayMaxPeriods - targetPIdx));
        const overflowHours = sourceHours - fitHours;

        if (fitHours === 0) {
            showToast("Hedef alan gün sınırları dışında!", "error");
            return;
        }

        // Auto split if overflowing day bounds
        if (overflowHours > 0) {
            for (let k = 0; k < overflowHours; k++) {
                newUnplaced.push({
                    id: generateId(),
                    teachers: sourceCardData.teachers || [],
                    classes: sourceCardData.classes || [],
                    rooms: sourceCardData.rooms || [],
                    subject: sourceCardData.subject || '',
                    hours: 1,
                    failCount: 0
                });
            }
            showToast(`Günün son saati aşıldığı için ${sourceHours} saatlik blok ders 1'er saatlik kartlara bölündü.`, "info");
        }

        // Check target & subsequent periods in target span [targetPIdx ... targetPIdx + fitHours - 1]
        const displacedItems: { cardStr: string; cardData: any; dIdx: number; pStart: number; hours: number }[] = [];
        const seenIds = new Set<string>();

        const checkSched = previewType === 'teacher' ? newTSched[destEntity] :
                           previewType === 'class' ? newCSched[destEntity] :
                           previewType === 'room' ? newRSched[destEntity] : null;

        for (let offset = 0; offset < fitHours; offset++) {
            const curTargetP = targetPIdx + offset;
            let cellVal = checkSched?.[targetDIdx]?.[curTargetP];
            if (!cellVal && offset === 0 && existingValue) {
                cellVal = existingValue;
            }
            if (cellVal && cellVal !== '') {
                const cData = parseCellData(cellVal);
                const cardId = cData?.id || cellVal;
                if (cData && !seenIds.has(cardId)) {
                    seenIds.add(cardId);
                    let pStart = curTargetP;
                    while (pStart > 0 && checkSched?.[targetDIdx]?.[pStart - 1] === cellVal) {
                        pStart--;
                    }
                    let pEnd = curTargetP;
                    while (pEnd < dayMaxPeriods && checkSched?.[targetDIdx]?.[pEnd] === cellVal) {
                        pEnd++;
                    }
                    const cardHours = Math.max(1, pEnd - pStart);
                    displacedItems.push({
                        cardStr: cellVal,
                        cardData: cData,
                        dIdx: targetDIdx,
                        pStart,
                        hours: cardHours
                    });
                }
            }
        }

        // Cleanly remove any existing/displaced cards from all entities
        displacedItems.forEach(item => {
            executeRemoval(item.cardData, item.hours, item.dIdx, item.pStart);
            newUnplaced.push({
                id: item.cardData.id || generateId(),
                teachers: item.cardData.teachers || [],
                classes: item.cardData.classes || [],
                rooms: item.cardData.rooms || [],
                subject: item.cardData.subject || '',
                hours: item.hours,
                failCount: 0
            });
        });

        // Place the pool card (or the fitted split block)
        // Ensure the destination entity is assigned to the card, and remove the source entity if it changed
        let targetTeachers = [...(sourceCardData.teachers || [])];
        let targetClasses = [...(sourceCardData.classes || [])];
        let targetRooms = [...(sourceCardData.rooms || [])];
        
        if (previewType === 'teacher' && payload.sourceEntity !== destEntity) {
            targetTeachers = targetTeachers.filter(t => t !== payload.sourceEntity);
            if (!targetTeachers.includes(destEntity)) targetTeachers.push(destEntity);
        }
        if (previewType === 'class' && payload.sourceEntity !== destEntity) {
            targetClasses = targetClasses.filter(c => c !== payload.sourceEntity);
            if (!targetClasses.includes(destEntity)) targetClasses.push(destEntity);
        }
        if (previewType === 'room' && payload.sourceEntity !== destEntity) {
            targetRooms = targetRooms.filter(r => r !== payload.sourceEntity);
            if (!targetRooms.includes(destEntity)) targetRooms.push(destEntity);
        }

        // Constraint check before placing pool card
        const hasPoolConstraintViolation = targetTeachers.some(t => {
          for (let i = 0; i < fitHours; i++) {
            if (constraints.teachers?.[t]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return true;
          }
          return false;
        }) || targetClasses.some(c => {
          for (let i = 0; i < fitHours; i++) {
            if (constraints.classes?.[c]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return true;
          }
          return false;
        }) || targetRooms.some(r => {
          for (let i = 0; i < fitHours; i++) {
            if (constraints.rooms?.[r]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return true;
          }
          return false;
        }) || (sourceCardData.subject && (() => {
          for (let i = 0; i < fitHours; i++) {
            if (constraints.subjects?.[sourceCardData.subject]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return true;
          }
          return false;
        })());

        if (hasPoolConstraintViolation) {
          showToast("Hedef saat/gün kısıtlı (kapalı) olarak ayarlanmış! Ders yerleştirilemez.", "error");
          return;
        }

        const placedCardStr = JSON.stringify({ 
          id: sourceCardData.id || generateId(), 
          teachers: targetTeachers, 
          classes: targetClasses, 
          rooms: targetRooms, 
          subject: sourceCardData.subject || '',
          hours: fitHours
        });
        executePlacement(placedCardStr, fitHours, targetDIdx, targetPIdx);
        newUnplaced = newUnplaced.filter(c => c.id !== sourceCardData.id);

        setUnplacedCourses(newUnplaced);
        setSchedules(newTSched); 
        setClassSchedules(newCSched); 
        setRoomSchedules(newRSched);
        return;
     }

     // 2. DRAG FROM TIMETABLE
     if (payload.source === 'timetable') {
        const sourceDIdx = payload.dIdx;
        const sourcePIdx = payload.pIdx;
        const sourceHours = payload.blockSize || 1;
        const sourceValue = payload.targetValue;
        const sourceCardData = parseCellData(sourceValue);

        if (!sourceCardData) return;

        // Dropped on the same exact position
        if (payload.sourceEntity === destEntity && sourceDIdx === targetDIdx && sourcePIdx === targetPIdx) return;

        // Constraint check for target slot before moving
        let tempTargetTeachers = [...(sourceCardData.teachers || [])];
        let tempTargetClasses = [...(sourceCardData.classes || [])];
        let tempTargetRooms = [...(sourceCardData.rooms || [])];
        if (previewType === 'teacher' && payload.sourceEntity !== destEntity) {
            tempTargetTeachers = tempTargetTeachers.filter(t => t !== payload.sourceEntity);
            if (!tempTargetTeachers.includes(destEntity)) tempTargetTeachers.push(destEntity);
        }
        if (previewType === 'class' && payload.sourceEntity !== destEntity) {
            tempTargetClasses = tempTargetClasses.filter(c => c !== payload.sourceEntity);
            if (!tempTargetClasses.includes(destEntity)) tempTargetClasses.push(destEntity);
        }
        if (previewType === 'room' && payload.sourceEntity !== destEntity) {
            tempTargetRooms = tempTargetRooms.filter(r => r !== payload.sourceEntity);
            if (!tempTargetRooms.includes(destEntity)) tempTargetRooms.push(destEntity);
        }

        const fitHours = Math.max(0, Math.min(sourceHours, dayMaxPeriods - targetPIdx));
        const hasTimetableConstraintViolation = tempTargetTeachers.some(t => {
          for (let i = 0; i < fitHours; i++) {
            if (constraints.teachers?.[t]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return true;
          }
          return false;
        }) || tempTargetClasses.some(c => {
          for (let i = 0; i < fitHours; i++) {
            if (constraints.classes?.[c]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return true;
          }
          return false;
        }) || tempTargetRooms.some(r => {
          for (let i = 0; i < fitHours; i++) {
            if (constraints.rooms?.[r]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return true;
          }
          return false;
        }) || (sourceCardData.subject && (() => {
          for (let i = 0; i < fitHours; i++) {
            if (constraints.subjects?.[sourceCardData.subject]?.includes(`${targetDIdx}-${targetPIdx + i}`)) return true;
          }
          return false;
        })());

        if (hasTimetableConstraintViolation) {
          showToast("Hedef saat/gün kısıtlı (kapalı) olarak ayarlanmış! Ders taşınamaz.", "error");
          return;
        }

        // 1. Cleanly remove the entire block from source position across all entities
        executeRemoval(sourceCardData, sourceHours, sourceDIdx, sourcePIdx);

        // 2. Check Day Bounds & Auto-Split Block
        const overflowHours = sourceHours - fitHours;

        if (fitHours === 0) {
            // Restore at original source
            executePlacement(sourceValue, sourceHours, sourceDIdx, sourcePIdx);
            showToast("Hedef alan gün sınırları dışında!", "error");
            return;
        }

        if (overflowHours > 0) {
            for (let k = 0; k < overflowHours; k++) {
                newUnplaced.push({
                    id: generateId(),
                    teachers: sourceCardData.teachers || [],
                    classes: sourceCardData.classes || [],
                    rooms: sourceCardData.rooms || [],
                    subject: sourceCardData.subject || '',
                    hours: 1,
                    failCount: 0
                });
            }
            showToast(`Günün son saati aşıldığı için ${sourceHours} saatlik blok ders 1'er saatlik kartlara bölündü.`, "info");
        }

        // 3. Find all cards occupying the destination range [targetPIdx ... targetPIdx + fitHours - 1]
        const displacedItems: { cardStr: string; cardData: any; dIdx: number; pStart: number; hours: number }[] = [];
        const seenIds = new Set<string>();

        const checkSched = previewType === 'teacher' ? newTSched[destEntity] :
                           previewType === 'class' ? newCSched[destEntity] :
                           previewType === 'room' ? newRSched[destEntity] : null;

        for (let offset = 0; offset < fitHours; offset++) {
            const curTargetP = targetPIdx + offset;
            let cellVal = checkSched?.[targetDIdx]?.[curTargetP];
            if (!cellVal && offset === 0 && existingValue) {
                cellVal = existingValue;
            }
            if (cellVal && cellVal !== '') {
                const cData = parseCellData(cellVal);
                const cardId = cData?.id || cellVal;
                if (cData && !seenIds.has(cardId)) {
                    seenIds.add(cardId);
                    let pStart = curTargetP;
                    while (pStart > 0 && checkSched?.[targetDIdx]?.[pStart - 1] === cellVal) {
                        pStart--;
                    }
                    let pEnd = curTargetP;
                    while (pEnd < dayMaxPeriods && checkSched?.[targetDIdx]?.[pEnd] === cellVal) {
                        pEnd++;
                    }
                    const cardHours = Math.max(1, pEnd - pStart);
                    displacedItems.push({
                        cardStr: cellVal,
                        cardData: cData,
                        dIdx: targetDIdx,
                        pStart,
                        hours: cardHours
                    });
                }
            }
        }

        // Cleanly remove all displaced cards from target positions
        displacedItems.forEach(item => {
            executeRemoval(item.cardData, item.hours, item.dIdx, item.pStart);
        });

        // Place source card at target position
        // Ensure the destination entity is assigned to the card, and remove the source entity if it changed
        let targetTeachers = [...(sourceCardData.teachers || [])];
        let targetClasses = [...(sourceCardData.classes || [])];
        let targetRooms = [...(sourceCardData.rooms || [])];
        
        if (previewType === 'teacher' && payload.sourceEntity !== destEntity) {
            targetTeachers = targetTeachers.filter(t => t !== payload.sourceEntity);
            if (!targetTeachers.includes(destEntity)) targetTeachers.push(destEntity);
        }
        if (previewType === 'class' && payload.sourceEntity !== destEntity) {
            targetClasses = targetClasses.filter(c => c !== payload.sourceEntity);
            if (!targetClasses.includes(destEntity)) targetClasses.push(destEntity);
        }
        if (previewType === 'room' && payload.sourceEntity !== destEntity) {
            targetRooms = targetRooms.filter(r => r !== payload.sourceEntity);
            if (!targetRooms.includes(destEntity)) targetRooms.push(destEntity);
        }

        const placedCardStr = JSON.stringify({ 
          id: sourceCardData.id || generateId(), 
          teachers: targetTeachers, 
          classes: targetClasses, 
          rooms: targetRooms, 
          subject: sourceCardData.subject || '',
          hours: fitHours
        });
        executePlacement(placedCardStr, fitHours, targetDIdx, targetPIdx);

        // Relocate displaced items (Swap back to source or send to unplaced pool)
        if (displacedItems.length === 1 && overflowHours === 0 && displacedItems[0].hours <= sourceHours) {
            const singleItem = displacedItems[0];
            
            // Reassign the displaced item to the source entity
            let displacedTeachers = [...(singleItem.cardData.teachers || [])];
            let displacedClasses = [...(singleItem.cardData.classes || [])];
            let displacedRooms = [...(singleItem.cardData.rooms || [])];
            
            if (previewType === 'teacher' && payload.sourceEntity !== destEntity) {
                displacedTeachers = displacedTeachers.filter(t => t !== destEntity);
                if (!displacedTeachers.includes(payload.sourceEntity)) displacedTeachers.push(payload.sourceEntity);
            }
            if (previewType === 'class' && payload.sourceEntity !== destEntity) {
                displacedClasses = displacedClasses.filter(c => c !== destEntity);
                if (!displacedClasses.includes(payload.sourceEntity)) displacedClasses.push(payload.sourceEntity);
            }
            if (previewType === 'room' && payload.sourceEntity !== destEntity) {
                displacedRooms = displacedRooms.filter(r => r !== destEntity);
                if (!displacedRooms.includes(payload.sourceEntity)) displacedRooms.push(payload.sourceEntity);
            }
            
            const displacedCardStr = JSON.stringify({
               id: singleItem.cardData.id,
               teachers: displacedTeachers,
               classes: displacedClasses,
               rooms: displacedRooms,
               subject: singleItem.cardData.subject,
               hours: singleItem.hours
            });

            executePlacement(displacedCardStr, singleItem.hours, sourceDIdx, sourcePIdx);
        } else {
            displacedItems.forEach(item => {
                newUnplaced.push({
                    id: item.cardData.id || generateId(),
                    teachers: item.cardData.teachers || [],
                    classes: item.cardData.classes || [],
                    rooms: item.cardData.rooms || [],
                    subject: item.cardData.subject || '',
                    hours: item.hours,
                    failCount: 0
                });
            });
        }

        setUnplacedCourses(newUnplaced);
        setSchedules(newTSched); 
        setClassSchedules(newCSched); 
        setRoomSchedules(newRSched);
     }
  };

  const handleCellClick = (e: React.MouseEvent, clickedEntity: string, dIdx: number, pIdx: number, cellVal: string, blockSize: number, isClosed: boolean) => {
    e.stopPropagation();
    const isMobileOrTouch = window.innerWidth < 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    
    if (isMobileOrTouch) {
      if (!mobileSelectedForSwap) {
        if (cellVal && cellVal !== '') {
          const cData = parseCellData(cellVal);
          if (cData) {
            setMobileSelectedForSwap({
              sourceCardData: cData,
              sourceDIdx: dIdx,
              sourcePIdx: pIdx,
              sourceHours: blockSize,
              sourceValue: cellVal,
              sourceEntity: clickedEntity
            });
            showToast("Kart seçildi. Taşımak istediğiniz hedef hücreye dokunun.", "info");
          }
        } else {
          toggleSpecificConstraint(previewType === 'subject' ? 'subjects' : previewType === 'teacher' ? 'teachers' : previewType === 'class' ? 'classes' : 'rooms', clickedEntity, dIdx, pIdx, !isClosed);
        }
      } else {
        const { sourceDIdx, sourcePIdx, sourceValue, sourceEntity, sourceHours } = mobileSelectedForSwap;
        if (sourceDIdx === dIdx && sourcePIdx === pIdx && sourceValue === cellVal) {
           setMobileSelectedForSwap(null);
           const cData = parseCellData(cellVal);
           if (cData) {
              setModalPoolForm({ editingBlock: cData, teachers: cData.teachers, classes: cData.classes, rooms: cData.rooms || [], subject: cData.subject, format: String(cData.span || 1), editingId: cData.id });
           }
           return;
        }

        const payload = {
          source: 'timetable',
          sourceEntity: sourceEntity,
          dIdx: sourceDIdx,
          pIdx: sourcePIdx,
          blockSize: sourceHours,
          targetValue: sourceValue
        };
        const mockedEvent = {
          preventDefault: () => {},
          dataTransfer: { getData: () => JSON.stringify(payload) },
          currentTarget: { classList: { remove: () => {} } }
        } as unknown as React.DragEvent<HTMLElement>;
        
        handleDropToTimetable(mockedEvent, clickedEntity, dIdx, pIdx, blockSize, cellVal);
        setMobileSelectedForSwap(null);
      }
    } else {
      if (cellVal && cellVal !== '') {
         const cData = parseCellData(cellVal);
         if (cData) {
            setModalPoolForm({ editingBlock: cData, teachers: cData.teachers, classes: cData.classes, rooms: cData.rooms || [], subject: cData.subject, format: String(cData.span || 1), editingId: cData.id });
         }
      } else {
         toggleSpecificConstraint(previewType === 'subject' ? 'subjects' : previewType === 'teacher' ? 'teachers' : previewType === 'class' ? 'classes' : 'rooms', clickedEntity, dIdx, pIdx, !isClosed);
      }
    }
  };

  const handleDropToPool = (e: any) => {
    e.preventDefault();
    const payload = JSON.parse(e.dataTransfer.getData('text/plain') || "null");
    if (payload && payload.source === 'timetable') {
       const cData = parseCellData(payload.targetValue);
       if (!cData) return;

       const newTSched = JSON.parse(JSON.stringify(schedules)); 
       const newCSched = JSON.parse(JSON.stringify(classSchedules));
       const newRSched = JSON.parse(JSON.stringify(roomSchedules));
       const blockSize = payload.blockSize || 1;

       for (let i = 0; i < blockSize; i++) {
           const curP = payload.pIdx + i;
           cData.teachers?.forEach((t: string) => { if (newTSched[t]?.[payload.dIdx]) newTSched[t][payload.dIdx][curP] = ''; });
           cData.classes?.forEach((cl: string) => { if (newCSched[cl]?.[payload.dIdx]) newCSched[cl][payload.dIdx][curP] = ''; });
           cData.rooms?.forEach((r: string) => { if (newRSched[r]?.[payload.dIdx]) newRSched[r][payload.dIdx][curP] = ''; });
       }

       setSchedules(newTSched); 
       setClassSchedules(newCSched); 
       setRoomSchedules(newRSched);
       setUnplacedCourses([
         ...unplacedCourses, 
         { 
           id: cData.id || generateId(), 
           teachers: cData.teachers || [], 
           classes: cData.classes || [], 
           rooms: cData.rooms || [], 
           subject: cData.subject || '', 
           hours: blockSize, 
           failCount: 0 
         }
       ]);
    }
  };

  const exportToCanvasImage = () => {
    const tableEl = document.getElementById('timetable-matrix');
    if (!tableEl) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const rows = tableEl.querySelectorAll('tr');
    const colsCount = rows[0].cells.length + rows[1].cells.length - 1;
    const cellWidth = 100;
    const cellHeight = 50;
    
    canvas.width = colsCount * cellWidth;
    canvas.height = rows.length * cellHeight;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let y = 0;
    rows.forEach((row, rIdx) => {
        let x = 0;
        Array.from(row.cells).forEach((cell, cIdx) => {
            const colSpan = cell.colSpan || 1;
            const w = cellWidth * colSpan;
            const h = cellHeight;
            
            ctx.fillStyle = rIdx < 2 ? '#f1f5f9' : '#ffffff';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#cbd5e1';
            ctx.strokeRect(x, y, w, h);
            
            ctx.fillStyle = '#1e293b';
            const text = cell.innerText.replace(/\n/g, ' ');
            if (text) ctx.fillText(text.substring(0, 30), x + w/2, y + h/2);
            
            x += w;
        });
        y += cellHeight;
    });

    const link = document.createElement('a');
    link.download = `${schoolInfo.name}_Matris.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Program resim (PNG) olarak indirildi!");
  };

  const toggleRowLock = (entity) => {
    const dataMaster = previewType === 'teacher' ? schedules : previewType === 'class' ? classSchedules : previewType === 'room' ? roomSchedules : subjectSchedules;
    const data = dataMaster[entity];
    if (!data) return;

    const activeDays = schoolSettings.weekDays.filter(d => d.active);
    const cellsToLock = [];
    let allLocked = true;

    activeDays.forEach((day) => {
        const absDIdx = day.id - 1;
        for(let p = 0; p < day.periods; p++) {
            const val = data[absDIdx]?.[p];
            if (val && val !== '') {
                const cData = parseCellData(val);
                if(cData) {
                    const lockEntity = previewType === 'teacher' ? cData.teachers[0] : previewType === 'class' ? cData.classes[0] : previewType === 'room' ? cData.rooms[0] : cData.teachers[0];
                    const hours = cData.span || cData.span || 1;
                    for (let i = 0; i < hours; i++) {
                        const lockKey = `${lockEntity}-${absDIdx}-${p + i}`;
                        cellsToLock.push(lockKey);
                        if (!lockedCells[lockKey]) allLocked = false;
                    }
                    p += hours - 1;
                }
            }
        }
    });

    if (cellsToLock.length === 0) return showToast("Kilitlenecek/Açılacak ders bulunamadı.", "warning");
    const newLocks = {...lockedCells};
    cellsToLock.forEach(key => { if (allLocked) delete newLocks[key]; else newLocks[key] = true; });
    setLockedCells(newLocks);
    showToast(allLocked ? `${entity} kilitleri açıldı.` : `${entity} tüm dersleri kilitlendi.`);
  };

  const toggleLock = (e, entity, dIdx, pIdx, blockSize = 1) => {
    e.stopPropagation();
    setLockedCells(prev => {
        const newLocks = { ...prev };
        const baseLockKey = `${entity}-${dIdx}-${pIdx}`;
        const currentlyLocked = newLocks[baseLockKey] === true;
        for(let i=0; i<blockSize; i++) {
           const lockKey = `${entity}-${dIdx}-${pIdx + i}`;
           if (currentlyLocked) delete newLocks[lockKey]; else newLocks[lockKey] = true;
        }
        return newLocks;
    });
  };

  const handleMobileToggleLock = (entity: string, dIdx: number, pIdx: number) => {
    setLockedCells(prev => {
      const newLocks = { ...prev };
      const baseKey1 = `${entity}-${dIdx}-${pIdx}`;
      const baseKey2 = `${entity}_${dIdx}_${pIdx}`;
      const currentlyLocked = newLocks[baseKey1] === true || newLocks[baseKey2] === true;
      if (currentlyLocked) {
        delete newLocks[baseKey1];
        delete newLocks[baseKey2];
        showToast(`${entity} kilidi açıldı.`);
      } else {
        newLocks[baseKey1] = true;
        newLocks[baseKey2] = true;
        showToast(`${entity} dersi kilitlendi.`);
      }
      return newLocks;
    });
  };

  const handleMobileSendToPool = (target: MobileQuickActionTarget) => {
    const { cardData, dayIdx, periodIdx } = target;
    const hours = cardData.hours || 1;

    const newTSched = JSON.parse(JSON.stringify(schedules));
    const newCSched = JSON.parse(JSON.stringify(classSchedules));
    const newRSched = JSON.parse(JSON.stringify(roomSchedules));

    for (let i = 0; i < hours; i++) {
      const p = periodIdx + i;
      target.cardData.teachers?.forEach((t: string) => { if (newTSched[t]?.[dayIdx]) newTSched[t][dayIdx][p] = ''; });
      target.cardData.classes?.forEach((cl: string) => { if (newCSched[cl]?.[dayIdx]) newCSched[cl][dayIdx][p] = ''; });
      target.cardData.rooms?.forEach((r: string) => { if (newRSched[r]?.[dayIdx]) newRSched[r][dayIdx][p] = ''; });
    }

    setSchedules(newTSched);
    setClassSchedules(newCSched);
    setRoomSchedules(newRSched);

    const newCard = {
      id: cardData.id || generateId(),
      subject: cardData.subject || '',
      teachers: cardData.teachers || [],
      classes: cardData.classes || [],
      rooms: cardData.rooms || [],
      hours: hours
    };
    setUnplacedCourses(prev => [...prev, newCard]);
    showToast(`${cardData.subject} havuza gönderildi.`);
  };

  const handleExecuteMobileMoveToSlot = (targetDayIdx: number, targetPeriodIdx: number) => {
    if (!mobileMovingCard) return;

    const source = mobileMovingCard;
    const hours = source.cardData.hours || 1;

    const newTSched = JSON.parse(JSON.stringify(schedules));
    const newCSched = JSON.parse(JSON.stringify(classSchedules));
    const newRSched = JSON.parse(JSON.stringify(roomSchedules));

    // Remove source from source slot
    for (let i = 0; i < hours; i++) {
      const p = source.periodIdx + i;
      source.cardData.teachers?.forEach((t: string) => { if (newTSched[t]?.[source.dayIdx]) newTSched[t][source.dayIdx][p] = ''; });
      source.cardData.classes?.forEach((cl: string) => { if (newCSched[cl]?.[source.dayIdx]) newCSched[cl][source.dayIdx][p] = ''; });
      source.cardData.rooms?.forEach((r: string) => { if (newRSched[r]?.[source.dayIdx]) newRSched[r][source.dayIdx][p] = ''; });
    }

    // Place source in target slot
    const cardDataStr = JSON.stringify({
      id: source.cardData.id || generateId(),
      teachers: source.cardData.teachers || [],
      classes: source.cardData.classes || [],
      rooms: source.cardData.rooms || [],
      subject: source.cardData.subject || '',
      hours: hours
    });

    const maxPeriods = schoolSettings.weekDays[targetDayIdx]?.periods || 15;
    for (let i = 0; i < hours; i++) {
      const p = targetPeriodIdx + i;
      if (p >= maxPeriods) break;
      source.cardData.teachers?.forEach((t: string) => {
        if (!newTSched[t]) newTSched[t] = Array.from({length: 7}, () => Array(15).fill(''));
        if (!newTSched[t][targetDayIdx]) newTSched[t][targetDayIdx] = Array(15).fill('');
        newTSched[t][targetDayIdx][p] = cardDataStr;
      });
      source.cardData.classes?.forEach((cl: string) => {
        if (!newCSched[cl]) newCSched[cl] = Array.from({length: 7}, () => Array(15).fill(''));
        if (!newCSched[cl][targetDayIdx]) newCSched[cl][targetDayIdx] = Array(15).fill('');
        newCSched[cl][targetDayIdx][p] = cardDataStr;
      });
      source.cardData.rooms?.forEach((r: string) => {
        if (!newRSched[r]) newRSched[r] = Array.from({length: 7}, () => Array(15).fill(''));
        if (!newRSched[r][targetDayIdx]) newRSched[r][targetDayIdx] = Array(15).fill('');
        newRSched[r][targetDayIdx][p] = cardDataStr;
      });
    }

    setSchedules(newTSched);
    setClassSchedules(newCSched);
    setRoomSchedules(newRSched);
    setMobileMovingCard(null);
    showToast(`${source.cardData.subject} başarıyla taşındı.`);
  };

  const handleLockAll = () => {
    const newLocks = { ...lockedCells };
    Object.keys(schedules).forEach(t => {
      schedules[t].forEach((day, dIdx) => {
        day.forEach((val, pIdx) => {
          if (val && val !== '') newLocks[`${t}-${dIdx}-${pIdx}`] = true;
        })
      })
    });
    setLockedCells(newLocks);
    showToast("Matristeki yerleşmiş TÜM DERSLER kilitlendi.");
  };

  const handleUnlockAll = () => {
    setLockedCells({});
    showToast("Tüm derslerin kilitleri kaldırıldı.");
  };

  const clearRowToPool = (entity) => {
    const dataMaster = previewType === 'teacher' ? schedules : previewType === 'class' ? classSchedules : previewType === 'room' ? roomSchedules : subjectSchedules;
    const tSched = JSON.parse(JSON.stringify(schedules));
    const cSched = JSON.parse(JSON.stringify(classSchedules));
    const rSched = JSON.parse(JSON.stringify(roomSchedules));
    const activeDays = schoolSettings.weekDays.filter(d => d.active);
    const removed = [];

    activeDays.forEach((day) => {
        const absDIdx = day.id - 1;
        let p = 0;
        while(p < day.periods) {
            const val = dataMaster[entity]?.[absDIdx]?.[p];
            if (val && val !== '') {
                let blockSize = 1;
                while(p + blockSize < day.periods && dataMaster[entity]?.[absDIdx]?.[p + blockSize] === val) {
                    const cData1 = parseCellData(val);
                    const cData2 = parseCellData(dataMaster[entity]?.[absDIdx]?.[p + blockSize]);
                    if (!cData1 || !cData2) break;
                    const lockE1 = previewType === 'teacher' ? cData1.teachers[0] : previewType === 'class' ? cData1.classes[0] : previewType === 'room' ? cData1.rooms[0] : cData1.teachers[0];
                    const lockE2 = previewType === 'teacher' ? cData2.teachers[0] : previewType === 'class' ? cData2.classes[0] : previewType === 'room' ? cData2.rooms[0] : cData2.teachers[0];
                    if (lockedCells[`${lockE1}-${absDIdx}-${p}`] !== lockedCells[`${lockE2}-${absDIdx}-${p + blockSize}`]) break;
                    blockSize++;
                }

                const cData = parseCellData(val);
                if (cData) {
                    let isLocked = false;
                    for(let i=0; i<blockSize; i++) {
                        cData.teachers.forEach(t => { if(lockedCells[`${t}-${absDIdx}-${p+i}`]) isLocked=true; });
                        cData.classes.forEach(c => { if(lockedCells[`${c}-${absDIdx}-${p+i}`]) isLocked=true; });
                    }

                    if (!isLocked) {
                        removed.push({ id: cData.id, teachers: cData.teachers, classes: cData.classes, rooms: cData.rooms, subject: cData.subject, hours: blockSize });
                        for(let i=0; i<blockSize; i++) { 
                            cData.teachers.forEach(tx => { if(tSched[tx]) tSched[tx][absDIdx][p+i] = ''; });
                            cData.classes.forEach(cx => { if(cSched[cx]) cSched[cx][absDIdx][p+i] = ''; });
                            cData.rooms.forEach(rx => { if(rSched[rx]) rSched[rx][absDIdx][p+i] = ''; });
                        }
                    }
                }
                p += blockSize;
            } else { p++; }
        }
    });

    setSchedules(tSched); setClassSchedules(cSched); setRoomSchedules(rSched);
    setUnplacedCourses([...unplacedCourses, ...removed]);
    if (removed.length > 0) showToast(`${removed.length} adet blok kart havuza taşındı.`);
    else showToast("Havuza gönderilecek kilitli olmayan ders bulunamadı.", "warning");
  };

  const handleClearAllToPool = () => {
    const tSched = JSON.parse(JSON.stringify(schedules));
    const cSched = JSON.parse(JSON.stringify(classSchedules));
    const rSched = JSON.parse(JSON.stringify(roomSchedules));
    const activeDays = schoolSettings.weekDays.filter(d => d.active);
    const removed = [];

    Object.keys(tSched).forEach(t => {
      for (let d = 0; d < activeDays.length; d++) {
          let p = 0;
          while(p < activeDays[d].periods) {
              const val = tSched[t][d][p];
              if (val && val !== '') {
                  let blockSize = 1;
                  while(p + blockSize < activeDays[d].periods && tSched[t][d][p + blockSize] === val) {
                      const lock1 = lockedCells[`${t}-${d}-${p}`];
                      const lock2 = lockedCells[`${t}-${d}-${p + blockSize}`];
                      if (lock1 !== lock2) break; 
                      blockSize++;
                  }

                  const cData = parseCellData(val);
                  if (cData) {
                      let isLocked = false;
                      for(let i=0; i<blockSize; i++) if (lockedCells[`${t}-${d}-${p+i}`]) isLocked = true;

                      if (!isLocked) {
                          removed.push({ id: cData.id, teachers: cData.teachers, classes: cData.classes, rooms: cData.rooms, subject: cData.subject, hours: blockSize });
                          for(let i=0; i<blockSize; i++) { 
                              cData.teachers.forEach(tx => { if(tSched[tx]) tSched[tx][d][p+i] = ''; });
                              cData.classes.forEach(cx => { if(cSched[cx]) cSched[cx][d][p+i] = ''; });
                              cData.rooms.forEach(rx => { if(rSched[rx]) rSched[rx][d][p+i] = ''; });
                          }
                      }
                  }
                  p += blockSize;
              } else { p++; }
          }
      }
    });

    setSchedules(tSched); setClassSchedules(cSched); setRoomSchedules(rSched);
    setUnplacedCourses([...unplacedCourses, ...removed]);
    if (removed.length > 0) showToast(`Tüm yerleşimler temizlendi. ${removed.length} blok havuza taşındı.`);
    else showToast("Havuza gönderilecek kilitli olmayan ders bulunamadı.", "warning");
  };

      
  const getConflictReport = () => {
     const report = {
         kartTest: { title: 'Kartların yerleşim testi', status: 'ok', errors: [] },
         tanimliDersTest: { title: 'Tanımlı derslerin yerleşim testi', status: 'ok', errors: [] },
         sinifOgretmenTest: { title: 'Sınıf ve öğretmen yerleşim testi', status: 'ok', errors: [] },
         ogretmenYeterlilikTest: { title: 'Öğretmen yeterlilik testi', status: 'ok', errors: [] },
         derslikTest: { title: 'Derslik yerleşim testi', status: 'ok', errors: [] }
     };
     
     const activeDays = schoolSettings.weekDays.filter(d => d.active);
     
     // 1. Tanımlı Ders Testi
     unplacedCourses.forEach(card => {
         let availableSlots = 0, maxConsecutiveSlot = 0;
         let possiblePlacements = 0;
         
         for(let dayIdx = 0; dayIdx < activeDays.length; dayIdx++) {
             const day = activeDays[dayIdx];
             const absDIdx = day.id - 1;
             
             
             let hasSubj = false;
             let totalHours = card.hours;
             let sameDayCards = [];
             card.classes.forEach(c => {
                 for(let p=0; p<15; p++) {
                     const cellVal = classSchedules[c]?.[absDIdx]?.[p];
                     if(cellVal) {
                         const parsed = parseCellData(cellVal);
                         if (parsed) {
                             if (parsed.subject === card.subject && parsed.id !== card.id) {
                                 hasSubj = true;
                                 if (!sameDayCards.includes(parsed.id)) {
                                     sameDayCards.push(parsed.id);
                                     totalHours += parsed.span || parsed.span || 1;
                                 }
                             }
                             p += (parsed.span || parsed.span || 1) - 1;
                         }
                     }
                 }
             });
             
             const rules = schoolSettings.distributionRules || { preventSameDay: true };
             if (hasSubj) {
                 if (rules.preventSameDay) continue;
                 if (rules.maxHoursActive && totalHours > rules.maxHours) continue;
             }

             
             let currentConsecutive = 0;
             for(let pIdx=0; pIdx<day.periods; pIdx++) {
                 let isClosed = false; let isBusy = false;
                 card.teachers.forEach(t => {
                    if(constraints.teachers[t]?.includes(`${absDIdx}-${pIdx}`)) isClosed = true;
                    if(schedules[t]?.[absDIdx]?.[pIdx]) isBusy = true;
                 });
                 card.classes.forEach(c => {
                    if(constraints.classes[c]?.includes(`${absDIdx}-${pIdx}`)) isClosed = true;
                    if(classSchedules[c]?.[absDIdx]?.[pIdx]) isBusy = true;
                 });
                 card.rooms?.forEach(r => {
                     if(constraints.rooms?.[r]?.includes(`${absDIdx}-${pIdx}`)) isClosed = true;
                     if(roomSchedules[r]?.[absDIdx]?.[pIdx]) isBusy = true;
                 });
                 if (constraints.subjects?.[card.subject]?.includes(`${absDIdx}-${pIdx}`)) isClosed = true;
                 
                 if (!isClosed && !isBusy) {
                    availableSlots++; 
                    currentConsecutive++;
                    if (currentConsecutive > maxConsecutiveSlot) maxConsecutiveSlot = currentConsecutive;
                    if (currentConsecutive >= card.hours) possiblePlacements++;
                 } else {
                    currentConsecutive = 0;
                 }
             }
         }
         
         if (possiblePlacements === 0) {
             report.tanimliDersTest.status = 'error';
             report.tanimliDersTest.errors.push({
                 label: `${card.classes.join(', ')} || ${card.subject} || ${card.teachers.join(', ')}`,
                 reason: 'Tanımlı dersin parçaları aynı güne geliyor veya kısıtlamalardan dolayı boş yer yok.'
             });
         }
     });

     const subjectCountsByClass = {};
     unplacedCourses.forEach(card => {
         card.classes.forEach(c => {
             if (!subjectCountsByClass[c]) subjectCountsByClass[c] = {};
             if (!subjectCountsByClass[c][card.subject]) subjectCountsByClass[c][card.subject] = [];
             subjectCountsByClass[c][card.subject].push(card);
         });
     });

     Object.keys(subjectCountsByClass).forEach(c => {
         Object.keys(subjectCountsByClass[c]).forEach(subject => {
             const cards = subjectCountsByClass[c][subject];
             
             
             let availableDays = 0;
             const rules = schoolSettings.distributionRules || { preventSameDay: true };
             activeDays.forEach(day => {
                 const absDIdx = day.id - 1;
                 let hasSubj = false;
                 let dayHours = 0;
                 for(let p=0; p<15; p++) {
                     const cellVal = classSchedules[c]?.[absDIdx]?.[p];
                     if(cellVal) {
                         const parsed = parseCellData(cellVal);
                         if (parsed) {
                             if (parsed.subject === subject) {
                                 hasSubj = true;
                                 dayHours += (parsed.span || parsed.span || 1);
                             }
                             p += (parsed.span || parsed.span || 1) - 1;
                         }
                     }
                 }
                 let closedPeriods = 0;
                 for(let p=0; p<day.periods; p++) {
                     if(constraints.classes[c]?.includes(`${absDIdx}-${p}`)) closedPeriods++;
                 }
                 if (closedPeriods === day.periods) hasSubj = true;
                 
                 if (!hasSubj || (!rules.preventSameDay && (!rules.maxHoursActive || dayHours < rules.maxHours))) {
                     availableDays++;
                 }
             });

             
             if (cards.length > availableDays) {
                 report.tanimliDersTest.status = 'error';
                 report.tanimliDersTest.errors.push({
                     label: `${c} || ${subject}`,
                     reason: `${cards.length} farklı kartı var ancak sadece ${availableDays} uygun gün var.`
                 });
             }
         });
     });

     // 2. Öğretmen Yeterlilik Testi (Teacher Capacity)
     teachers.forEach(t => {
         let totalHoursNeeded = 0;
         unplacedCourses.forEach(c => {
             if (c.teachers.includes(t)) totalHoursNeeded += c.hours;
         });
         
         let totalAvailable = 0;
         activeDays.forEach(day => {
             const absDIdx = day.id - 1;
             for(let p=0; p<day.periods; p++) {
                 const isClosed = constraints.teachers[t]?.includes(`${absDIdx}-${p}`);
                 const isBusy = schedules[t]?.[absDIdx]?.[p];
                 if (!isClosed && !isBusy) totalAvailable++;
             }
         });
         
         if (totalHoursNeeded > totalAvailable) {
             report.ogretmenYeterlilikTest.status = 'error';
             report.ogretmenYeterlilikTest.errors.push({
                 label: t,
                 reason: `Kalan ders yükü (${totalHoursNeeded} saat) uygun boşluktan (${totalAvailable} saat) fazla.`
             });
         }
     });

     // 3. Sınıf ve Öğretmen yerleşim testi (Class Capacity)
     classes.forEach(c => {
         let totalHoursNeeded = 0;
         unplacedCourses.forEach(card => {
             if (card.classes.includes(c)) totalHoursNeeded += card.hours;
         });
         
         let totalAvailable = 0;
         activeDays.forEach(day => {
             const absDIdx = day.id - 1;
             for(let p=0; p<day.periods; p++) {
                 const isClosed = constraints.classes[c]?.includes(`${absDIdx}-${p}`);
                 const isBusy = classSchedules[c]?.[absDIdx]?.[p];
                 if (!isClosed && !isBusy) totalAvailable++;
             }
         });
         
         if (totalHoursNeeded > totalAvailable) {
             report.sinifOgretmenTest.status = 'error';
             report.sinifOgretmenTest.errors.push({
                 label: c,
                 reason: `Sınıfın alması gereken ders yükü (${totalHoursNeeded} saat) uygun boşluktan (${totalAvailable} saat) fazla.`
             });
         }
     });

     // Has Conflicts?
     const hasConflicts = Object.values(report).some(r => r.status === 'error');
     return { report, hasConflicts };
  };

  const analyzeConflicts = () => {
     if (unplacedCourses.length === 0) return showToast("Havuza ait analiz edilecek bekleyen kart yok.", "warning");
     const result = getConflictReport();
     setConflictReport(result);
  };
const handleRename = (type, oldName, newName) => {
    if (!newName || !newName.trim()) {
      setEditingItem(null);
      return;
    }
    const name = newName.trim().toUpperCase();
    if (name === oldName) {
      setEditingItem(null);
      return;
    }
    const typeKey = type === 'teacher' ? 'teachers' : type === 'class' ? 'classes' : type === 'room' ? 'rooms' : 'subjects';
    const list = type === 'teacher' ? teachers : type === 'class' ? classes : type === 'room' ? rooms : subjects;
    const setList = type === 'teacher' ? setTeachers : type === 'class' ? setClasses : type === 'room' ? setRooms : setSubjects;

    if (list.includes(name)) {
      showToast("Bu kayıt zaten var!", "error");
      return;
    }
    
    // 1. Update the main list
    setList(list.map(i => i === oldName ? name : i).sort((a,b) => a.localeCompare(b, 'tr')));
    setShortNames(prev => {
      if (!prev[oldName]) return prev;
      const updated = { ...prev, [name]: prev[oldName] };
      delete updated[oldName];
      return updated;
    });

    // Helper to update a cell's internal references
    const updateCellWithRenamedEntity = (cellVal) => {
      if (!cellVal || cellVal === '') return cellVal;
      const cData = parseCellData(cellVal);
      if (!cData) return cellVal;
      
      let modified = false;
      if (type === 'teacher') {
        if (cData.teachers && cData.teachers.includes(oldName)) {
          cData.teachers = cData.teachers.map(t => t === oldName ? name : t);
          modified = true;
        }
      } else if (type === 'class') {
        if (cData.classes && cData.classes.includes(oldName)) {
          cData.classes = cData.classes.map(c => c === oldName ? name : c);
          modified = true;
        }
      } else if (type === 'room') {
        if (cData.rooms && cData.rooms.includes(oldName)) {
          cData.rooms = cData.rooms.map(r => r === oldName ? name : r);
          modified = true;
        }
      } else if (type === 'subject') {
        if (cData.subject === oldName) {
          cData.subject = name;
          modified = true;
        }
      }
      
      if (modified) {
        return JSON.stringify({
          id: cData.id,
          teachers: cData.teachers,
          classes: cData.classes,
          rooms: cData.rooms,
          subject: cData.subject,
          span: cData.span || 1
        });
      }
      return cellVal;
    };

    // Helper to update a schedule structure
    const updateScheduleMap = (schedMap, targetType) => {
      const newSchedMap = {};
      Object.entries(schedMap).forEach(([key, dayList]) => {
        const newKey = (type === targetType && key === oldName) ? name : key;
        if (Array.isArray(dayList)) {
          newSchedMap[newKey] = dayList.map(pList => {
            if (Array.isArray(pList)) {
              return pList.map(cellVal => updateCellWithRenamedEntity(cellVal));
            }
            return pList;
          });
        } else {
          newSchedMap[newKey] = dayList;
        }
      });
      return newSchedMap;
    };

    // 2. Cascade changes to schedules
    setSchedules(prev => updateScheduleMap(prev, 'teacher'));
    setClassSchedules(prev => updateScheduleMap(prev, 'class'));
    setRoomSchedules(prev => updateScheduleMap(prev, 'room'));

    // 3. Cascade changes to unplaced courses (the pool)
    setUnplacedCourses(prevUnplaced => {
      return prevUnplaced.map(card => {
        let modified = false;
        let cTeachers = card.teachers || [];
        let cClasses = card.classes || [];
        let cRooms = card.rooms || [];
        let cSubject = card.subject || '';
        
        if (type === 'teacher' && cTeachers.includes(oldName)) {
          cTeachers = cTeachers.map(t => t === oldName ? name : t);
          modified = true;
        } else if (type === 'class' && cClasses.includes(oldName)) {
          cClasses = cClasses.map(c => c === oldName ? name : c);
          modified = true;
        } else if (type === 'room' && cRooms.includes(oldName)) {
          cRooms = cRooms.map(r => r === oldName ? name : r);
          modified = true;
        } else if (type === 'subject' && cSubject === oldName) {
          cSubject = name;
          modified = true;
        }
        
        if (modified) {
          return { ...card, teachers: cTeachers, classes: cClasses, rooms: cRooms, subject: cSubject };
        }
        return card;
      });
    });

    // 4. Cascade changes to locked cells
    setLockedCells(prevLocked => {
      const nextLocked = {};
      Object.entries(prevLocked).forEach(([key, val]) => {
        const parts = key.split('-');
        if (parts.length >= 3) {
          const entity = parts[0];
          const dIdx = parts[1];
          const pIdx = parts[2];
          
          if (entity === oldName) {
            const newKey = `${name}-${dIdx}-${pIdx}`;
            nextLocked[newKey] = val;
          } else {
            nextLocked[key] = val;
          }
        } else {
          nextLocked[key] = val;
        }
      });
      return nextLocked;
    });

    // 5. Cascade changes to constraints
    setConstraintModal(prev => {
      if (prev && prev.name === oldName && prev.type === type) return { ...prev, name };
      return prev;
    });
    setConstraints(prevConstraints => {
      const nextConstraints = JSON.parse(JSON.stringify(prevConstraints));
      const targetKey = type === 'teacher' ? 'teachers' : type === 'class' ? 'classes' : type === 'room' ? 'rooms' : 'subjects';
      if (nextConstraints[targetKey] && nextConstraints[targetKey][oldName] !== undefined) {
        nextConstraints[targetKey][name] = nextConstraints[targetKey][oldName];
        delete nextConstraints[targetKey][oldName];
      }
      return nextConstraints;
    });

    showToast("İsim ve tüm ilişkili ders kartları başarıyla güncellendi.");
    setEditingItem(null);
  };

  const handleDeleteItem = (type, name) => {
    setConfirmDialog({
       title: "Kayıt Silinecek",
       message: `"${name}" kaydını silmek istediğinize emin misiniz? Bu kayıtla ilgili tüm matris verileri ve ders kartları temizlenecek.`,
       onConfirm: () => {
          const typeKey = type === 'teacher' ? 'teachers' : type === 'class' ? 'classes' : type === 'room' ? 'rooms' : 'subjects';
          
          if (type === 'teacher') setTeachers(prev => prev.filter(t => t !== name));
          else if (type === 'class') setClasses(prev => prev.filter(c => c !== name));
          else if (type === 'room') setRooms(prev => prev.filter(r => r !== name));
          else if (type === 'subject') setSubjects(prev => prev.filter(s => s !== name));
          setShortNames(prev => {
            if (!prev[name]) return prev;
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });

          // Helper to clean up cell value when an entity is deleted
          const cleanCellVal = (cellVal: any) => {
            if (!cellVal || cellVal === '') return '';
            const cData = parseCellData(cellVal);
            if (!cData) return '';

            if (type === 'subject' && cData.subject === name) return '';
            if (type === 'teacher') {
              const remainingTeachers = (cData.teachers || []).filter((t: string) => t !== name);
              if (remainingTeachers.length === 0) return '';
              cData.teachers = remainingTeachers;
            }
            if (type === 'class') {
              const remainingClasses = (cData.classes || []).filter((c: string) => c !== name);
              if (remainingClasses.length === 0) return '';
              cData.classes = remainingClasses;
            }
            if (type === 'room') {
              cData.rooms = (cData.rooms || []).filter((r: string) => r !== name);
            }

            return JSON.stringify({
              id: cData.id,
              teachers: cData.teachers,
              classes: cData.classes,
              rooms: cData.rooms,
              subject: cData.subject,
              span: cData.span || 1
            });
          };

          const cleanScheduleMap = (schedMap: any, targetType: string) => {
            const nextMap: any = {};
            Object.entries(schedMap || {}).forEach(([key, dayList]) => {
              if (type === targetType && key === name) return; // Delete this entity's entire schedule
              if (Array.isArray(dayList)) {
                nextMap[key] = dayList.map(pList => {
                  if (Array.isArray(pList)) {
                    return pList.map(cellVal => cleanCellVal(cellVal));
                  }
                  return pList;
                });
              } else {
                nextMap[key] = dayList;
              }
            });
            return nextMap;
          };

          setSchedules(prev => cleanScheduleMap(prev, 'teacher'));
          setClassSchedules(prev => cleanScheduleMap(prev, 'class'));
          setRoomSchedules(prev => cleanScheduleMap(prev, 'room'));

          // Clean up unplacedCourses
          setUnplacedCourses(prev => {
            return (prev || []).filter(course => {
              if (type === 'subject' && course.subject === name) return false;
              if (type === 'teacher') {
                course.teachers = (course.teachers || []).filter((t: string) => t !== name);
                if (course.teachers.length === 0) return false;
              }
              if (type === 'class') {
                course.classes = (course.classes || []).filter((c: string) => c !== name);
                if (course.classes.length === 0) return false;
              }
              if (type === 'room') {
                course.rooms = (course.rooms || []).filter((r: string) => r !== name);
              }
              return true;
            });
          });

          // Clean up constraints
          setConstraints(prev => {
            const next = { ...prev };
            if (next[typeKey]) {
              const copy = { ...next[typeKey] };
              delete copy[name];
              next[typeKey] = copy;
            }
            return next;
          });

          // Clean up local duty storage if teacher
          if (type === 'teacher') {
            try {
              const rawExempt = localStorage.getItem('ataturk_exempt_teachers');
              if (rawExempt) {
                const arr = JSON.parse(rawExempt);
                if (Array.isArray(arr)) {
                  localStorage.setItem('ataturk_exempt_teachers', JSON.stringify(arr.filter(t => t !== name)));
                }
              }
              const rawAdmins = localStorage.getItem('ataturk_duty_admins');
              if (rawAdmins) {
                const arr = JSON.parse(rawAdmins);
                if (Array.isArray(arr)) {
                  localStorage.setItem('ataturk_duty_admins', JSON.stringify(arr.filter(a => a !== name)));
                }
              }
            } catch {
              // Ignore localstorage errors
            }
          }
          
          showToast(`${name} ve ilişkili tüm veriler başarıyla silindi.`);
       }
    });
  };

  const handleAddItem = (type) => {
    if (!newItemName.trim()) return;
    const name = newItemName.trim().toUpperCase();
    if (type === 'teacher') {
      if(teachers.includes(name)) return showToast("Zaten var!", "warning");
      setTeachers([...teachers, name].sort((a,b)=>a.localeCompare(b, 'tr')));
      setSchedules({...schedules, [name]: Array.from({length: 7}).map(() => Array(15).fill(''))});
    } else if (type === 'class') {
      if(classes.includes(name)) return showToast("Zaten var!", "warning");
      setClasses([...classes, name].sort((a,b)=>a.localeCompare(b, 'tr')));
      setClassSchedules({...classSchedules, [name]: Array.from({length: 7}).map(() => Array(15).fill(''))});
    } else if (type === 'room') {
      if(rooms.includes(name)) return showToast("Zaten var!", "warning");
      setRooms([...rooms, name].sort((a,b)=>a.localeCompare(b, 'tr')));
      setRoomSchedules({...roomSchedules, [name]: Array.from({length: 7}).map(() => Array(15).fill(''))});
    } else if (type === 'subject') {
      if(subjects.includes(name)) return showToast("Zaten var!", "warning");
      setSubjects([...subjects, name].sort((a,b)=>a.localeCompare(b, 'tr')));
    }
    setNewItemName(""); showToast("Eklendi.");
  };

  
  
  const renderRulesModal = () => {
      if (!showRulesModal) return null;
      
      const rules = schoolSettings.distributionRules || {
          preventSameDay: true,
          minGapActive: false,
          minGap: 1,
          maxGapActive: false,
          maxGap: 0,
          maxHoursActive: false,
          maxHours: 2,
      };

      const updateRule = (key, value) => {
          setSchoolSettings(prev => ({
              ...prev,
              distributionRules: {
                  ...(prev.distributionRules || rules),
                  [key]: value
              }
          }));
      };

      return (
        <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm">
           <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="bg-slate-100 rounded-t-2xl md:rounded-b-2xl md:rounded-t border md:shadow-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] max-w-2xl w-full flex flex-col overflow-hidden text-slate-800 text-sm max-h-[90vh] md:max-h-[85vh] relative"
           >
               <div className="w-full flex justify-center pt-3 pb-2 md:hidden shrink-0 bg-slate-100 touch-none" onClick={() => setShowRulesModal(false)}>
                   <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
               </div>
               <div className="bg-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-300 shrink-0">
                 <div className="flex items-center gap-2 font-semibold">
                     <span>Şartlar</span>
                 </div>
                 <button onClick={() => setShowRulesModal(false)} className="hover:bg-slate-200 active:bg-slate-300 p-1.5 rounded-lg text-slate-600 transition-colors flex items-center justify-center min-h-[36px] min-w-[36px]"><X className="w-4 h-4" /></button>
               </div>
               
               <div className="p-4 bg-slate-100 flex flex-col gap-3 border-t border-white overflow-y-auto custom-scrollbar flex-1">
                   {/* preventSameDay */}
                   <label className="flex items-center gap-3 cursor-pointer">
                       <input 
                           type="checkbox" 
                           checked={rules.preventSameDay}
                           onChange={(e) => updateRule('preventSameDay', e.target.checked)}
                           className="w-4 h-4 rounded border-slate-400 bg-white cursor-pointer" 
                       />
                       <span>Aynı güne gelmesin</span>
                   </label>
                   
                   {/* minGap */}
                   <div className="flex items-center gap-3">
                       <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                               type="checkbox" 
                               checked={rules.minGapActive}
                               onChange={(e) => updateRule('minGapActive', e.target.checked)}
                               className="w-4 h-4 rounded border-slate-400 bg-white cursor-pointer" 
                           />
                           <span>Aynı güne gelen dersler arasına en az şu kadar saat boşluk bırakılsın</span>
                       </label>
                       <input 
                           type="number" 
                           min="0"
                           value={rules.minGap}
                           onChange={(e) => updateRule('minGap', parseInt(e.target.value) || 0)}
                           disabled={!rules.minGapActive}
                           className="ml-auto w-20 px-2 py-1 border border-slate-300 rounded bg-white disabled:bg-slate-100 disabled:text-slate-400"
                       />
                   </div>

                   {/* maxGap */}
                   <div className="flex items-center gap-3">
                       <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                               type="checkbox" 
                               checked={rules.maxGapActive}
                               onChange={(e) => updateRule('maxGapActive', e.target.checked)}
                               className="w-4 h-4 rounded border-slate-400 bg-white cursor-pointer" 
                           />
                           <span>Aynı güne gelen dersler arasına en fazla şu kadar saat boşluk bırakılsın</span>
                       </label>
                       <input 
                           type="number" 
                           min="0"
                           value={rules.maxGap}
                           onChange={(e) => updateRule('maxGap', parseInt(e.target.value) || 0)}
                           disabled={!rules.maxGapActive}
                           className="ml-auto w-20 px-2 py-1 border border-slate-300 rounded bg-white disabled:bg-slate-100 disabled:text-slate-400"
                       />
                   </div>

                   {/* maxHours */}
                   <div className="flex items-center gap-3">
                       <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                               type="checkbox" 
                               checked={rules.maxHoursActive}
                               onChange={(e) => updateRule('maxHoursActive', e.target.checked)}
                               className="w-4 h-4 rounded border-slate-400 bg-white cursor-pointer" 
                           />
                           <span>Aynı güne gelen derslerin toplam saat sayısı şunu geçmesin</span>
                       </label>
                       <input 
                           type="number" 
                           min="1"
                           value={rules.maxHours}
                           onChange={(e) => updateRule('maxHours', parseInt(e.target.value) || 1)}
                           disabled={!rules.maxHoursActive}
                           className="ml-auto w-20 px-2 py-1 border border-slate-300 rounded bg-white disabled:bg-slate-100 disabled:text-slate-400"
                       />
                   </div>
               </div>

               <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex justify-end gap-2 items-center shadow-inner shrink-0">
                   <button onClick={() => setShowRulesModal(false)} className="px-6 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded shadow-sm border border-slate-300">
                       Kapat
                   </button>
               </div>
           </motion.div>
        </div>
      );
  };

  const renderConflictModal = () => {
      if (!conflictReport) return null;
      const { report, hasConflicts } = conflictReport;
      
      const tests = [
          report.kartTest,
          report.tanimliDersTest,
          report.sinifOgretmenTest,
          report.ogretmenYeterlilikTest,
          report.derslikTest
      ];

      return (
        <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm">
           <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="bg-white rounded-t-2xl md:rounded-b-2xl md:rounded border shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-2xl max-w-4xl w-full flex flex-col h-[90vh] md:h-[80vh] overflow-hidden relative"
           >
               {/* Drag Handle for Mobile */}
               <div className="w-full flex justify-center pt-3 pb-2 md:hidden shrink-0 bg-slate-700 touch-none" onClick={() => setConflictReport(null)}>
                   <div className="w-12 h-1.5 bg-slate-400 rounded-full"></div>
               </div>
               {/* Header like native app */}
               <div className="bg-slate-700 text-white px-3 py-2 flex items-center justify-between text-sm shadow shrink-0">
                 <div className="flex items-center gap-2">
                     <Settings className="w-4 h-4 text-slate-300" />
                     <span>Program dağıtım kontrolü</span>
                 </div>
                 <div className="flex items-center gap-2">
                     <button className="text-xs flex items-center gap-1 bg-slate-600 px-2 py-1 rounded hover:bg-slate-500 hidden md:flex">
                         <HelpCircle className="w-3 h-3" /> Yardım
                     </button>
                     <button onClick={() => setConflictReport(null)} className="hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded transition-colors shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all active:scale-95"><X className="w-4 h-4" /></button>
                 </div>
               </div>
               
               {/* Content area */}
               <div className="flex-1 flex flex-col overflow-hidden bg-white text-slate-800 text-sm">
                   <div className="flex bg-slate-100 font-semibold border-b border-slate-300 p-1">
                       <div className="flex-1 px-2 border-r border-slate-300">Kontrol</div>
                       <div className="flex-1 px-2">Hata</div>
                   </div>
                   
                   <div className="flex-1 overflow-auto p-1 custom-scrollbar">
                       {tests.map((test, i) => (
                           <div key={i} className="mb-1">
                               <div className="flex">
                                   <div className="flex-1 px-2 py-1 flex items-start gap-2">
                                       <span className="mt-0.5">
                                           {test.status === 'ok' ? (
                                               <Check className="w-4 h-4 text-green-600 font-bold" />
                                           ) : (
                                               <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                           )}
                                       </span>
                                       <span className="font-semibold text-slate-800">{test.title}</span>
                                   </div>
                                   <div className="flex-1 px-2 py-1 font-semibold">
                                       {test.status === 'ok' ? 'Hata yok' : `${test.errors.length} ${test.title} hata var`}
                                   </div>
                               </div>
                               
                               {test.errors.length > 0 && (
                                   <div className="ml-6 pl-2 border-l border-slate-200">
                                       {test.errors.map((err, j) => (
                                           <div key={j} className="flex hover:bg-slate-50 py-0.5">
                                               <div className="flex-1 px-2 text-slate-700 flex items-center gap-2">
                                                   <span className="w-3 h-3 bg-blue-400 block shrink-0"></span>
                                                   <span>{err.label}</span>
                                               </div>
                                               <div className="flex-1 px-2 text-slate-500">
                                                   {err.reason}
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
                   
                   {/* Log area */}
                   <div className="h-48 border-t border-slate-300 bg-white p-2 overflow-auto font-mono text-xs text-slate-700 custom-scrollbar leading-relaxed">
                       <div className="flex items-center gap-2 text-green-600"><Check className="w-3 h-3"/> Tüm veriler hafızaya yüklendi.</div>
                       <div className="flex items-center gap-2 text-green-600"><Check className="w-3 h-3"/> Kısıtlamalar işlendi.</div>
                       <div className="flex items-center gap-2 text-slate-800 font-bold mt-2 mb-1"><ArrowRight className="w-3 h-3"/> Derslik durumları kontrol ediliyor...</div>
                       {rooms.map(r => (
                           <div key={r} className="flex gap-4 ml-2">
                               <div className="flex items-center gap-2 w-32"><Check className="w-3 h-3 text-green-600"/> {r}</div>
                               <div className="text-slate-500">Kapasite / Uygunluk taranıyor...</div>
                           </div>
                       ))}
                   </div>
               </div>

               {/* Footer */}
               <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex justify-end gap-2 items-center shrink-0">
                   <button onClick={() => setConflictReport(null)} className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded flex items-center gap-2 shadow-sm font-medium">
                       <X className="w-4 h-4 text-red-500" /> İptal
                   </button>
                   {!hasConflicts && (
                       <button onClick={() => { setConflictReport(null); autoDistributePro(); }} className="px-6 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 shadow font-medium">
                           <Play className="w-4 h-4" /> Dağıtıma Başla
                       </button>
                   )}
               </div>
           </motion.div>
        </div>
      );
  };
const handleModalCreatePoolCard = () => {
    if (modalPoolForm.teachers.length === 0 || modalPoolForm.classes.length === 0 || !modalPoolForm.subject || !modalPoolForm.format) {
        return showToast("Eksik alan var. Öğretmen, Sınıf ve Ders zorunludur.", "warning");
    }
    const parts = modalPoolForm.format.split('+').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (parts.length === 0) return showToast("Geçersiz saat formatı. Örnek: 2+1, 3", "error");
    
    let currentUnplaced = unplacedCourses;
    if (modalPoolForm.editingId) {
        currentUnplaced = currentUnplaced.filter(c => c.id !== modalPoolForm.editingId);
    }

    const newCards = parts.map(h => ({ 
        id: generateId(), 
        teachers: modalPoolForm.teachers, 
        classes: modalPoolForm.classes, 
        rooms: modalPoolForm.rooms, 
        subject: modalPoolForm.subject, 
        hours: h,
        failCount: 0 
    }));
    
    setUnplacedCourses([...currentUnplaced, ...newCards]);
    setModalPoolForm(prev => ({ ...prev, subject: '', format: '2', editingId: null, editingBlock: null }));
    showToast(modalPoolForm.editingId ? "Kart güncellendi!" : "Kartlar havuza eklendi!");
  };

  const toggleMultiSelectModal = (t, value) => {
      setModalPoolForm(prev => {
          const currentList = prev[t] || [];
          if (currentList.includes(value)) {
              return { ...prev, [t]: currentList.filter(item => item !== value) };
          } else {
              return { ...prev, [t]: [...currentList, value] };
          }
      });
  };

  const editModalPoolCard = (card) => {
     setModalPoolForm({ editingBlock: card._editingBlock || null, 
         teachers: card.teachers || [], 
         classes: card.classes || [], 
         rooms: card.rooms || [], 
         subject: card.subject || '', 
         format: String(card.hours), 
         editingId: card.id 
     });
  };

  const renderConstraintModal = () => {
    if (!constraintModal) return null;
    let { type, name } = constraintModal;
    if (type === 'subjects') {
        type = 'subject';
    }
    const typeKey = type === 'teacher' ? 'teachers' : type === 'class' ? 'classes' : type === 'room' ? 'rooms' : 'subjects';
    const activeDays = schoolSettings.weekDays.filter(d => d.active);
    const maxPeriods = Math.max(...activeDays.map(d => d.periods));

    const relatedCardsPlaced = [];
    const relatedCardsUnplaced = [];

    const dataMaster = type === 'teacher' ? schedules : type === 'class' ? classSchedules : roomSchedules;
    let totalPlacedHours = 0;
    const uniquePlacedCards = [];
    const seenPlacedIds = new Set();

    if (type !== 'subject' && dataMaster[name]) {
       activeDays.forEach((day) => {
           const absDIdx = day.id - 1;
           for (let pIdx = 0; pIdx < day.periods; pIdx++) {
               const val = dataMaster[name][absDIdx]?.[pIdx];
               if (val && val !== '') {
                   const cData = parseCellData(val);
                   if(cData) {
                       let span = parseInt(cData.span || (cData as any).hours || 1, 10);
                       if (span <= 1) {
                           let s = 1;
                           while (pIdx + s < day.periods) {
                               const nextVal = dataMaster[name][absDIdx]?.[pIdx + s];
                               if (!nextVal) break;
                               const nextCData = parseCellData(nextVal);
                               if (nextCData && nextCData.id === cData.id) s++;
                               else break;
                           }
                           span = s;
                       }
                       totalPlacedHours += span;
                       if(!seenPlacedIds.has(cData.id)) {
                           seenPlacedIds.add(cData.id);
                           const otherEntities = type === 'teacher' ? cData.classes.join(', ') : type === 'class' ? cData.teachers.join(', ') : cData.classes.join(', ');
                           uniquePlacedCards.push({ other: otherEntities, subject: cData.subject, day: day.name, hour: pIdx + 1, dIdx: absDIdx, pIdx, fullCard: { ...cData, span, hours: span }, originalVal: val, hours: span });
                       }
                       pIdx += span - 1;
                   }
               }
           }
       });
    }

    if (type === 'subject') {
       teachers.forEach(tName => {
           const entityData = schedules[tName];
           if (entityData) {
               activeDays.forEach((day) => {
                   const absDIdx = day.id - 1;
                   for (let pIdx = 0; pIdx < day.periods; pIdx++) {
                       const val = entityData[absDIdx]?.[pIdx];
                       if (val && val !== '') {
                           const cData = parseCellData(val);
                           if (cData) {
                               let span = parseInt(cData.span || (cData as any).hours || 1, 10);
                               if (span <= 1) {
                                   let s = 1;
                                   while (pIdx + s < day.periods) {
                                       const nextVal = entityData[absDIdx]?.[pIdx + s];
                                       if (!nextVal) break;
                                       const nextCData = parseCellData(nextVal);
                                       if (nextCData && nextCData.id === cData.id) s++;
                                       else break;
                                   }
                                   span = s;
                               }
                               if (cData.subject === name) {
                                   totalPlacedHours += span;
                                   if (!seenPlacedIds.has(cData.id)) {
                                       seenPlacedIds.add(cData.id);
                                       uniquePlacedCards.push({ other: `${tName} ➔ ${cData.classes.join(', ')}`, subject: cData.subject, day: day.name, hour: pIdx + 1, dIdx: absDIdx, pIdx, fullCard: { ...cData, span, hours: span }, originalVal: val, hours: span });
                                   }
                               }
                               pIdx += span - 1;
                           }
                       }
                   }
               });
           }
       });
    }

    unplacedCourses.forEach(uc => {
        const tMatch = type === 'teacher' && uc.teachers.includes(name);
        const cMatch = type === 'class' && uc.classes.includes(name);
        const rMatch = type === 'room' && uc.rooms?.includes(name);
        const sMatch = type === 'subject' && uc.subject === name;
        if (tMatch || cMatch || rMatch || sMatch) relatedCardsUnplaced.push(uc);
    });

    const toggleSpecificConstraint = (dIdx, pIdx, forceClosedState) => {
      const day = activeDays[dIdx];
      const absDIdx = day.id - 1;
      const key = `${absDIdx}-${pIdx}`;
      let isClosing = false;
      
      setConstraints(prev => {
         const newConst = JSON.parse(JSON.stringify(prev));
         const targets = constraintTargets.length > 0 ? Array.from(new Set([name, ...constraintTargets])) : [name];
         
         targets.forEach(t => {
             if (!newConst[typeKey][t]) newConst[typeKey][t] = [];
             let list = newConst[typeKey][t];
             
             if (forceClosedState === true && !list.includes(key)) {
                 list.push(key);
                 if (t === name) isClosing = true;
             }
             else if (forceClosedState === false && list.includes(key)) {
                 newConst[typeKey][t] = list.filter(k => k !== key);
             }
         });
         return newConst;
      });

      if (isClosing || forceClosedState === true) {
         const targets = constraintTargets.length > 0 ? Array.from(new Set([name, ...constraintTargets])) : [name];
         targets.forEach(t => ejectCellIfOccupied(typeKey, t, absDIdx, pIdx));
      }
    };

    const toggleDayConstraints = (dIdx, periods) => {
      const day = activeDays[dIdx];
      const absDIdx = day.id - 1;
      const allClosed = Array.from({length: periods}).every((_, p) => constraints[typeKey][name]?.includes(`${absDIdx}-${p}`));
      const targetState = !allClosed;
      
      const targets = constraintTargets.length > 0 ? Array.from(new Set([name, ...constraintTargets])).map(t => ({type: typeKey, name: t})) : [{type: typeKey, name: name}];

      setConstraints(prev => {
          const newConst = JSON.parse(JSON.stringify(prev)); 
          targets.forEach(t => {
              if (!newConst[t.type][t.name]) newConst[t.type][t.name] = [];
              for(let p = 0; p < periods; p++) {
                  const key = `${absDIdx}-${p}`;
                  if (targetState && !newConst[t.type][t.name].includes(key)) newConst[t.type][t.name].push(key);
                  else if (!targetState) newConst[t.type][t.name] = newConst[t.type][t.name].filter(k => k !== key);
              }
          });
          return newConst;
      });
      
      if (targetState) {
          targets.forEach(t => {
              for(let p = 0; p < periods; p++) ejectCellIfOccupied(t.type, t.name, absDIdx, p);
          });
      }
    };

    const togglePeriodConstraints = (pIdx) => {
      const allClosed = activeDays.every((d) => pIdx >= d.periods || constraints[typeKey][name]?.includes(`${d.id - 1}-${pIdx}`));
      const targetState = !allClosed;
      
      const targets = constraintTargets.length > 0 ? Array.from(new Set([name, ...constraintTargets])).map(t => ({type: typeKey, name: t})) : [{type: typeKey, name: name}];
      setConstraints(prev => {
          const newConst = JSON.parse(JSON.stringify(prev));
          targets.forEach(t => {
              if (!newConst[t.type][t.name]) newConst[t.type][t.name] = [];
              activeDays.forEach((d) => {
                  if (pIdx < d.periods) {
                      const absDIdx = d.id - 1;
                      const key = `${absDIdx}-${pIdx}`;
                      if (targetState && !newConst[t.type][t.name].includes(key)) newConst[t.type][t.name].push(key);
                      else if (!targetState) newConst[t.type][t.name] = newConst[t.type][t.name].filter(k => k !== key);
                  }
               });
          });
          return newConst;
      });

      if (targetState) {
          targets.forEach(t => {
              activeDays.forEach((d) => {
                  if (pIdx < d.periods) ejectCellIfOccupied(t.type, t.name, d.id - 1, pIdx);
              });
          });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 select-none" onMouseUp={() => setPaintState({ isPainting: false, targetClosed: false })}>
        <motion.div 
           initial={{ y: "100%" }}
           animate={{ y: 0 }}
           transition={{ type: "spring", damping: 25, stiffness: 200 }}
           className="bg-white rounded-t-2xl md:rounded-b-2xl md:rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-2xl max-w-5xl w-full flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden relative"
        >
           {/* Drag Handle for Mobile */}
           <div className="w-full flex justify-center pt-3 pb-2 md:hidden shrink-0 bg-slate-50 touch-none" onClick={() => setConstraintModal(null)}>
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
           </div>
           <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
               <Ban className="w-5 h-5 text-red-500" /> Detaylar ve Kısıtlamalar: <EditableText value={name} onSave={(newVal) => handleRename(type, name, newVal)} className="" textClassName="text-blue-700 hover:text-blue-800" />
             </h3>
             <button onClick={() => setConstraintModal(null)} className="p-1.5 text-slate-500 hover:text-slate-800 active:bg-slate-200 rounded-lg transition-colors flex items-center justify-center min-h-[38px] min-w-[38px]"><X className="w-5 h-5"/></button>
           </div>
           
           <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
               <div className="flex-1 p-4 overflow-auto custom-scrollbar border-r border-slate-200 pb-32 md:pb-4">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                     <p className="text-sm text-slate-500">
                        Atama istemediğiniz saatlere farenizle basılı tutup <b>sürükleyerek</b> kırmızı boyayabilir, 
                        ya da gün veya saat başlıklarına tıklayarak o günün/saatin tamamını açıp kapatabilirsiniz.
                     </p>
                     <div className="relative shrink-0 ml-4">
                        <button onClick={() => setShowConstraintTargets(!showConstraintTargets)} className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 cursor-pointer group transition-colors hover:bg-indigo-100">
                           <span className="text-xs font-bold text-indigo-800 group-hover:text-indigo-900">
                              {constraintTargets.length > 0 ? `${constraintTargets.length} Öğeye Uygulanıyor` : 'Diğerlerine de Uygula'}
                           </span>
                           <ChevronDown className="w-4 h-4 text-indigo-600"/>
                        </button>
                        {showConstraintTargets && (
                           <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col max-h-64">
                              <div className="p-2 border-b border-slate-100 flex justify-between gap-1">
                                 <button onClick={() => setConstraintTargets(typeKey === 'teachers' ? teachers : typeKey === 'classes' ? classes : typeKey === 'rooms' ? rooms : subjects)} className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded text-slate-700">Tümünü Seç</button>
                                 <button onClick={() => setConstraintTargets([])} className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded text-slate-700">Temizle</button>
                              </div>
                              <div className="p-2 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                 {(typeKey === 'teachers' ? teachers : typeKey === 'classes' ? classes : typeKey === 'rooms' ? rooms : subjects).map(item => (
                                    <label key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${item === name ? 'opacity-50 pointer-events-none bg-slate-50' : 'hover:bg-indigo-50'}`}>
                                       <input type="checkbox" checked={item === name || constraintTargets.includes(item)} onChange={(e) => {
                                          if (item === name) return;
                                          if (e.target.checked) setConstraintTargets([...constraintTargets, item]);
                                          else setConstraintTargets(constraintTargets.filter(t => t !== item));
                                       }} className="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer" />
                                       <span className="text-xs font-bold text-slate-700 truncate">{item} {item === name && '(Geçerli)'}</span>
                                    </label>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                 </div>
                 <table className="w-full text-center border-collapse text-sm">
                   <thead className="sticky top-0 z-10 shadow-sm ring-1 ring-slate-200">
                     <tr className="transition-colors hover:bg-slate-50/80">
                       <th className="border p-2 bg-slate-100 w-24 sticky left-0 z-20">Saat</th>
                       {activeDays.map((d, dIdx) => (
                         <th key={d.id} className="border bg-slate-100 p-0">
                            <button onClick={() => toggleDayConstraints(dIdx, d.periods)} className="w-full h-full p-2 hover:bg-slate-200 cursor-pointer font-bold transition-colors">
                               {d.name}
                            </button>
                         </th>
                       ))}
                     </tr>
                   </thead>
                   <tbody onMouseLeave={() => setPaintState({ isPainting: false, targetClosed: false })}>
                     {Array.from({length: maxPeriods}).map((_, pIdx) => (
                       <tr key={pIdx} className="transition-colors hover:bg-slate-50/80">
                         <td className="border p-0 font-bold bg-slate-50">
                             <button onClick={() => togglePeriodConstraints(pIdx)} className="w-full h-full p-2 hover:bg-slate-200 cursor-pointer transition-colors block">
                                 {pIdx+1}. Ders
                             </button>
                         </td>
                         {activeDays.map((d, dIdx) => {
                           const absDIdx = d.id - 1;
                           const isClosed = constraints[typeKey][name]?.includes(`${absDIdx}-${pIdx}`);
                           const isInvalid = pIdx >= d.periods;
                           return (
                             <td key={d.id} className="border p-0.5" 
                                 onMouseDown={() => { if(!isInvalid) { setPaintState({ isPainting: true, targetClosed: !isClosed }); toggleSpecificConstraint(dIdx, pIdx, !isClosed); } }}
                                 onMouseEnter={(e) => { if(!isInvalid && paintState.isPainting) toggleSpecificConstraint(dIdx, pIdx, paintState.targetClosed); }}>
                               {!isInvalid ? (
                                 <div className={`w-full h-10 rounded transition-colors font-bold text-xs flex items-center justify-center cursor-crosshair
                                   ${isClosed ? 'bg-red-500 text-white shadow-inner' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
                                   {isClosed ? 'KAPALI' : 'AÇIK'}
                                 </div>
                               ) : <div className="w-full h-10 bg-slate-200 rounded opacity-50 cursor-not-allowed"></div>}
                             </td>
                           )
                         })}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               
               <div className="w-full md:w-80 bg-slate-50 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 pb-32 md:pb-4">
                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex justify-between items-center shadow-sm">
                      <span className="font-bold text-indigo-900 text-sm">Toplam Ders Yükü:</span>
                      <span className="text-xl font-black text-indigo-700 bg-white px-3 py-1 rounded shadow-sm">
                         {calculateSafeTotalWorkload(type, name)} <span className="text-xs">Saat</span>
                      </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-2">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1"><Plus className="w-4 h-4 text-indigo-600"/> Hızlı Kart Oluştur</h4>
                      
                      <div className="flex gap-2">
                         <div className="flex-1">
                             <div className="text-[10px] font-bold text-slate-500 mb-0.5">Ders *</div>
                             <select className="w-full border border-slate-300 rounded p-1 text-xs font-semibold outline-none focus:border-indigo-500" value={modalPoolForm.subject} onChange={e => setModalPoolForm({ ...modalPoolForm, subject: e.target.value})}>
                                 <option value="">Seçiniz</option>
                                 {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                         </div>
                         <div className="w-20">
                             <div className="text-[10px] font-bold text-slate-500 mb-0.5">Dağılım *</div>
                             <input type="text" className="w-full border border-slate-300 rounded p-1 text-xs font-bold text-center outline-none focus:border-indigo-500 bg-slate-50" placeholder="2+1" value={modalPoolForm.format} onChange={e => setModalPoolForm({ ...modalPoolForm, format: e.target.value})} />
                         </div>
                      </div>

                      <div className="flex flex-col gap-2">
                         {type !== 'teacher' && (
                             <div className="flex-1">
                                 <div className="flex justify-between items-center mb-0.5">
                                     <div className="text-[10px] font-bold text-slate-500">Öğretmenler</div>
                                     <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-400">Çoklu seçilebilir</span>
                                 </div>
                                 <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar border border-slate-200 p-1 rounded bg-slate-50">
                                     {teachers.map(t => (
                                         <button key={t} onClick={() => toggleMultiSelectModal('teachers', t)} className={`px-1.5 py-0.5 text-[10px] rounded font-semibold transition-colors ${modalPoolForm.teachers.includes(t) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 hover:bg-indigo-50 text-slate-700'}`}>
                                             {t}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         )}
                         {type !== 'class' && (
                             <div className="flex-1">
                                 <div className="flex justify-between items-center mb-0.5">
                                     <div className="text-[10px] font-bold text-slate-500">Sınıflar</div>
                                     <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-400">Çoklu seçilebilir</span>
                                 </div>
                                 <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar border border-slate-200 p-1 rounded bg-slate-50">
                                     {classes.map(c => (
                                         <button key={c} onClick={() => toggleMultiSelectModal('classes', c)} className={`px-1.5 py-0.5 text-[10px] rounded font-semibold transition-colors ${modalPoolForm.classes.includes(c) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 hover:bg-indigo-50 text-slate-700'}`}>
                                             {c}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         )}
                         {type !== 'room' && (
                             <div className="flex-1">
                                 <div className="flex justify-between items-center mb-0.5">
                                     <div className="text-[10px] font-bold text-slate-500">Derslik</div>
                                 </div>
                                 <select className="w-full border border-slate-300 rounded p-1 text-xs font-semibold outline-none focus:border-indigo-500" value={modalPoolForm.rooms[0] || ''} onChange={e => setModalPoolForm({ ...modalPoolForm, rooms: e.target.value ? [e.target.value] : []})}>
                                     <option value="">Yok</option>
                                     {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                                 </select>
                             </div>
                         )}
                      </div>

                      <div className="flex gap-1 mt-1">
                         {modalPoolForm.editingId && <button onClick={() => setModalPoolForm(prev => ({...prev, subject: '', format: '2', editingId: null}))} className="px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors">İptal</button>}
                         <button onClick={handleModalCreatePoolCard} className="flex-1 bg-indigo-600  text-white rounded py-1.5 text-xs font-bold transition-colors -sm -md hover:-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95">{modalPoolForm.editingId ? 'Güncelle' : 'Oluştur'}</button>
                      </div>
                  </div>

                  <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between mt-2">
                     <span className="flex items-center gap-2"><Book className="w-4 h-4 text-blue-600"/> Matristekiler</span>
                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{uniquePlacedCards.length} Kart</span>
                  </h4>
                  <div className="flex flex-col gap-2">
                     {uniquePlacedCards.length === 0 ? <span className="text-xs text-slate-500 italic">Ders bulunmuyor.</span> : 
                        uniquePlacedCards.map((blk, i) => (
                           <div key={i} onClick={() => { ejectCellIfOccupied(typeKey, name, blk.dIdx, blk.pIdx); setTimeout(() => editModalPoolCard(blk.fullCard), 100); }} className="text-xs p-2 bg-white border border-slate-200 rounded shadow-sm flex flex-col gap-1 group hover:border-indigo-300 transition-colors cursor-pointer">
                               <div className="flex justify-between items-center">
                                   <div className="max-w-[65%]"><div className="font-bold text-slate-700 truncate">{blk.other}</div><div className="text-slate-500 truncate">{blk.subject}</div></div>
                                   <div className="text-right shrink-0">
                                       <div className="font-bold text-indigo-600">{blk.day}</div>
                                       <div className="text-indigo-400">{blk.hour}. D {blk.hours > 1 ? `(+${blk.hours-1})` : ''}</div>
                                   </div>
                               </div>
                               <div className="hidden group-hover:flex justify-end pt-1 mt-1 border-t border-slate-100">
                                   <button onClick={(e) => { e.stopPropagation(); ejectCellIfOccupied(typeKey, name, blk.dIdx, blk.pIdx); }} className="text-rose-600 hover:text-red-700 flex items-center gap-1 font-bold">
                                       <ArrowRightLeft className="w-3 h-3"/> Havuza At
                                   </button>
                               </div>
                           </div>
                        ))
                     }
                  </div>

                  <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between mt-4">
                      <span className="flex items-center gap-2"><LayoutList className="w-4 h-4 text-rose-600"/> Havuzdakiler</span>
                      <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">{relatedCardsUnplaced.length} Kart</span>
                  </h4>
                  <div className="flex flex-col gap-2">
                     {relatedCardsUnplaced.length === 0 ? <span className="text-xs text-slate-500 italic">Havuzda bekleyen ders yok.</span> : 
                        relatedCardsUnplaced.map((uc, i) => (
                           <div key={i} className="text-xs p-2 bg-rose-50 border border-rose-200 rounded shadow-sm flex flex-col gap-1 cursor-pointer hover:border-rose-400 group" onClick={() => editModalPoolCard(uc)}>
                               <div className="flex justify-between items-center">
                                  <div className="max-w-[75%]"><div className="font-bold text-rose-800 truncate">{type === 'teacher' ? uc.classes.join(', ') : uc.teachers.join(', ')}</div><div className="text-rose-600 truncate">{uc.subject}</div></div>
                                  <div className="font-bold bg-white text-rose-700 px-2 py-1 rounded-full border border-rose-100 shadow-sm shrink-0">{uc.hours} Saat</div>
                               </div>
                               <div className="hidden group-hover:flex justify-end gap-2 mt-1 border-t border-rose-100 pt-1">
                                  <button onClick={(e) => { e.stopPropagation(); handleDeletePoolCard(uc.id); }} className="text-rose-600 hover:text-red-700 flex items-center gap-1 font-bold">
                                      <Trash2 className="w-3 h-3"/> Sil
                                  </button>
                               </div>
                           </div>
                        ))
                     }
                  </div>
               </div>
           </div>
           <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0 sticky bottom-0 z-20 w-full">
             <button onClick={() => setConstraintModal(null)} className="w-full md:w-auto px-6 py-3 md:py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm transition-colors text-base md:text-sm min-h-[44px]">Kaydet ve Kapat</button>
           </div>
        </motion.div>
      </div>
    );
  };

  const renderSettings = () => {
    const list = settingTab === 'teachers' ? teachers : settingTab === 'classes' ? classes : settingTab === 'rooms' ? rooms : subjects;
    const title = settingTab === 'teachers' ? 'Öğretmen' : settingTab === 'classes' ? 'Sınıf' : settingTab === 'rooms' ? 'Derslik' : 'Ders';

    return (
      <div className="h-full bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row overflow-hidden relative">
        
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col p-2 gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap shrink-0">
           <button onPointerDown={()=>setSettingTab('info')} className={`p-2.5 md:p-3 rounded-xl flex items-center gap-2 font-bold text-xs md:text-sm transition-colors shrink-0 ${settingTab === 'info' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-700'}`}><Info className="w-4 h-4 md:w-5 md:h-5"/> Okul Bilgileri</button>
           <button onPointerDown={()=>setSettingTab('time')} className={`p-2.5 md:p-3 rounded-xl flex items-center gap-2 font-bold text-xs md:text-sm transition-colors shrink-0 ${settingTab === 'time' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-700'}`}><Clock className="w-4 h-4 md:w-5 md:h-5"/> Gün & Saat Ayarları</button>
           <button onPointerDown={()=>setSettingTab('teachers')} className={`p-2.5 md:p-3 rounded-xl flex items-center gap-2 font-bold text-xs md:text-sm transition-colors shrink-0 ${settingTab === 'teachers' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-700'}`}><Presentation className="w-4 h-4 md:w-5 md:h-5"/> Öğretmenler</button>
           <button onPointerDown={()=>setSettingTab('classes')} className={`p-2.5 md:p-3 rounded-xl flex items-center gap-2 font-bold text-xs md:text-sm transition-colors shrink-0 ${settingTab === 'classes' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-700'}`}><Users className="w-4 h-4 md:w-5 md:h-5"/> Sınıflar</button>
           <button onPointerDown={()=>setSettingTab('rooms')} className={`p-2.5 md:p-3 rounded-xl flex items-center gap-2 font-bold text-xs md:text-sm transition-colors shrink-0 ${settingTab === 'rooms' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-700'}`}><MapPin className="w-4 h-4 md:w-5 md:h-5"/> Derslikler</button>
           <button onPointerDown={()=>setSettingTab('subjects')} className={`p-2.5 md:p-3 rounded-xl flex items-center gap-2 font-bold text-xs md:text-sm transition-colors shrink-0 ${settingTab === 'subjects' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-700'}`}><Book className="w-4 h-4 md:w-5 md:h-5"/> Dersler</button>
        </div>

        <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto bg-white custom-scrollbar">
           {settingTab === 'info' ? (
             <div className="max-w-2xl flex flex-col gap-6">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Okul Bilgileri ve Yönetim</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1"><label className="text-sm font-bold text-slate-500">Okul Adı</label><input type="text" className="border border-slate-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={schoolInfo.name} onChange={e => setSchoolInfo({...schoolInfo, name: e.target.value})} /></div>
                   <div className="flex flex-col gap-1"><label className="text-sm font-bold text-slate-500">Eğitim Öğretim Yılı</label><input type="text" className="border border-slate-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={schoolInfo.year} onChange={e => setSchoolInfo({...schoolInfo, year: e.target.value})} /></div>
                   <div className="flex flex-col gap-1"><label className="text-sm font-bold text-slate-500">Okul Müdürü</label><input type="text" className="border border-slate-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold uppercase" value={schoolInfo.principal} onChange={e => setSchoolInfo({...schoolInfo, principal: e.target.value})} /></div>
                   <div className="flex flex-col gap-1"><label className="text-sm font-bold text-slate-500">Müdür Yardımcısı</label><input type="text" className="border border-slate-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold uppercase" value={schoolInfo.vicePrincipal} onChange={e => setSchoolInfo({...schoolInfo, vicePrincipal: e.target.value})} /></div>
                </div>
             </div>
           ) : settingTab === 'time' ? (
             <div className="max-w-4xl flex flex-col lg:flex-row gap-6 lg:gap-8">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Okul Çalışma Günleri</h2>
                  <div className="space-y-3">
                     {schoolSettings.weekDays.map((day, idx) => (
                       <div key={day.id} className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
                         <label className="flex items-center gap-2 w-32 font-bold text-slate-700 cursor-pointer text-sm">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={day.active} onChange={(e) => { const newDays = [...schoolSettings.weekDays]; newDays[idx].active = e.target.checked; setSchoolSettings({...schoolSettings, weekDays: newDays}); }} />
                            {day.name}
                         </label>
                         <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-slate-500 font-semibold">Ders Sayısı:</span>
                            <input type="number" min="0" max="15" className="border border-slate-300 rounded-lg px-2 py-1 w-20 text-center font-bold text-blue-700 bg-white" value={day.periods} disabled={!day.active} onChange={(e) => { const newDays = [...schoolSettings.weekDays]; newDays[idx].periods = parseInt(e.target.value) || 0; setSchoolSettings({...schoolSettings, weekDays: newDays}); }}/>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Ders Saatleri (Zil)</h2>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                     {schoolSettings.lessonTimes.map((lt, idx) => (
                       <div key={idx} className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                         <span className="font-bold text-slate-500 text-sm w-16">{idx+1}. Ders</span>
                         <div className="flex items-center gap-2">
                             <input type="time" className="border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 focus:border-blue-500 bg-white" value={lt.start} onChange={(e) => { const newTimes = [...schoolSettings.lessonTimes]; newTimes[idx].start = e.target.value; setSchoolSettings({...schoolSettings, lessonTimes: newTimes}); }}/>
                             <span className="text-slate-400 font-bold">-</span>
                             <input type="time" className="border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 focus:border-blue-500 bg-white" value={lt.end} onChange={(e) => { const newTimes = [...schoolSettings.lessonTimes]; newTimes[idx].end = e.target.value; setSchoolSettings({...schoolSettings, lessonTimes: newTimes}); }}/>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
             </div>
           ) : (
             <div className="max-w-4xl flex flex-col h-full">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">{title} Yönetimi ve Kısıtlamalar</h2>
                <div className="flex gap-2 mb-4">
                  <input type="text" className="flex-1 border border-slate-300 p-2.5 rounded-xl focus:outline-blue-500 uppercase font-semibold text-sm" placeholder={`Yeni ${title} Adı...`} value={newItemName} onChange={e=>setNewItemName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddItem(getSingleType(settingTab))} />
                  <button onPointerDown={() => handleAddItem(getSingleType(settingTab))} className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 rounded-xl font-bold text-sm flex items-center gap-1.5 shrink-0"><Plus className="w-5 h-5"/> Ekle</button>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-inner flex-1 overflow-auto p-2 custom-scrollbar">
                   {list.length === 0 ? <p className="text-slate-400 p-4 text-center font-semibold text-sm">Kayıt bulunamadı.</p> : (
                     <table className="w-full text-left border-collapse">
                       <tbody>
                         {list.map((item, idx) => {
                           const typeKey = settingTab; 
                           const hasConstraints = constraints[typeKey][item] && constraints[typeKey][item].length > 0;
                            const isCurrentlyEditing = editingItem === item;
                            return (
                              <tr key={item} id={`setting-row-${idx}`} className={`border-b border-slate-200 transition-colors group ${isCurrentlyEditing ? 'bg-blue-50/80 shadow-sm' : 'hover:bg-white'}`}>
                                <td className="p-3 font-semibold text-slate-700 text-sm">
                                  {isCurrentlyEditing ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-blue-600 font-bold font-mono text-xs shrink-0">{idx+1}.</span>
                                      <input 
                                        id={`setting-edit-input-${idx}`}
                                        type="text" 
                                        className="border-2 border-blue-500 rounded-lg px-2.5 py-1.5 w-full uppercase text-sm font-bold bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                        autoFocus 
                                        value={editValue} 
                                        onChange={e => setEditValue(e.target.value)} 
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleRename(getSingleType(settingTab), item, editValue);
                                          } else if (e.key === 'Escape') {
                                            e.preventDefault();
                                            setEditingItem(null);
                                          }
                                        }}
                                        placeholder="Yeni isim yazınız..."
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span>{idx+1}. {item}</span>
                                      {shortNames[item] && shortNames[item] !== item && (
                                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded" title={`Kısa Kod: ${shortNames[item]}`}>
                                          Kısa: {shortNames[item]}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  {isCurrentlyEditing ? (
                                    <div className="flex gap-1.5 sm:gap-2 justify-end items-center">
                                      <button 
                                        id={`setting-save-btn-${idx}`}
                                        type="button"
                                        onPointerDown={(e) => { 
                                          e.preventDefault(); 
                                          handleRename(getSingleType(settingTab), item, editValue); 
                                        }} 
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0" 
                                        title="Kaydet (Enter)"
                                      >
                                        <Check className="w-4 h-4" /> 
                                        <span>Kaydet</span>
                                      </button>
                                      <button 
                                        id={`setting-cancel-btn-${idx}`}
                                        type="button"
                                        onPointerDown={(e) => { 
                                          e.preventDefault(); 
                                          setEditingItem(null); 
                                        }} 
                                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0" 
                                        title="Vazgeç (Esc)"
                                      >
                                        <X className="w-4 h-4" /> 
                                        <span>İptal</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1.5 sm:gap-2 justify-end flex-wrap">
                                      <button onPointerDown={() => { setConstraintTargets([]); setShowConstraintTargets(false); setConstraintModal({ type: getSingleType(settingTab), name: item }); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${hasConstraints ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}><Ban className="w-3.5 h-3.5"/> {hasConstraints ? 'Kısıtlı' : 'Koşullar'}</button>
                                      <button onPointerDown={()=>{setEditingItem(item); setEditValue(item);}} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors bg-white border border-slate-200" title="Düzenle"><Edit2 className="w-4 h-4"/></button>
                                      <button onPointerDown={()=>handleDeleteItem(getSingleType(settingTab), item)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors bg-white border border-slate-200" title="Sil"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )
                         })}
                       </tbody>
                     </table>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    );
  };
  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {renderConstraintModal()}
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] px-6 py-3 rounded-xl font-bold shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 border-l-4 flex items-center gap-3
          ${toast.type === 'error' ? 'bg-white text-red-700 border-red-500' : toast.type === 'warning' ? 'bg-white text-amber-600 border-amber-500' : toast.type === 'info' ? 'bg-white text-blue-700 border-blue-500' : 'bg-slate-800 text-white border-green-500'}`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : toast.type === 'warning' ? <AlertCircle className="w-5 h-5 text-amber-500" /> : toast.type === 'info' ? <Info className="w-5 h-5 text-blue-500" /> : <CheckCircle2 className="w-5 h-5 text-green-400" />}
          {toast.msg}
        </div>
      )}

      <QuantumTelemetryModal
        distributeState={distributeState as any}
        coreStates={coreStates}
        onStop={stopDistributePro}
        totalInitialUnplaced={initialDistributeUnplacedCount || unplacedCourses.length}
      />

      <ConflictInspectorModal
        card={inspectingCard}
        onClose={() => setInspectingCard(null)}
        schoolSettings={schoolSettings as any}
        schedules={schedules}
        classSchedules={classSchedules}
        roomSchedules={roomSchedules}
        lockedCells={lockedCells}
        constraints={constraints as any}
      />

      {confirmDialog && (
         <div className="fixed inset-0 bg-black/60 z-[250] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm">
            <motion.div 
               initial={{ y: "100%", opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: "100%", opacity: 0 }}
               transition={{ type: "spring", damping: 25, stiffness: 220 }}
               className="bg-white p-5 sm:p-6 rounded-t-2xl md:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-2xl max-w-md w-full relative border border-slate-100"
            >
               {/* Drag Handle for Mobile */}
               <div className="w-full flex justify-center pb-3 md:hidden absolute top-2.5 left-0 right-0 touch-none" onPointerDown={() => setConfirmDialog(null)}>
                   <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
               </div>
               <div className="flex items-start gap-3 mb-2 md:mt-0 mt-3">
                 <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                   <AlertTriangle className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-snug">{confirmDialog.title}</h3>
                   <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">{confirmDialog.message}</p>
                 </div>
               </div>
               <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
                 <button onPointerDown={() => setConfirmDialog(null)} className="px-3.5 py-2 font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all active:scale-95">İptal</button>
                 <button onPointerDown={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="px-4 py-2 font-bold text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5">
                   {confirmDialog.confirmText || "Evet, Onaylıyorum"}
                 </button>
               </div>
            </motion.div>
         </div>
      )}

      {renderRulesModal()}
      {renderConflictModal()}
      <DeepPredictiveAnalysisModal
        isOpen={isDeepModalOpen}
        onClose={() => setIsDeepModalOpen(false)}
        analysis={shadowAnalysis}
        isRunningDeep={isRunningDeepAnalysis}
        onForceDeepRun={handleForceDeepRun}
        onApplyPredictiveSort={handleApplyPredictiveSort}
        deepLearningActive={deepLearningActive}
        onToggleDeepLearning={setDeepLearningActive}
      />

      <SpotlightPaletteModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        teachers={teachers}
        classes={classes}
        rooms={rooms}
        subjects={subjects}
        unplacedCount={unplacedCourses.length}
        onSelectEntity={handleSelectEntityFromSpotlight}
        onOpenSplitCompare={(entityA) => {
          if (entityA) {
            setSplitCompareInitialA(entityA);
            setSplitCompareInitialB({ type: 'class', name: classes[0] || '' });
          }
          setIsSplitCompareOpen(true);
        }}
        onOpenConstraintModal={(type, name) => {
          setConstraintTargets([]);
          setShowConstraintTargets(false);
          setConstraintModal({ type: type === 'subject' ? 'subjects' : type, name });
          setModalPoolForm({
            editingBlock: null,
            teachers: type === 'teacher' ? [name] : [],
            classes: type === 'class' ? [name] : [],
            rooms: type === 'room' ? [name] : [],
            subject: type === 'subject' ? name : '',
            format: '2',
            editingId: null
          });
        }}
        onTriggerAction={(actionId) => {
          if (actionId === 'action_distribute' || actionId === 'start_distribution') {
            autoDistributePro();
          } else if (actionId === 'action_telemetry' || actionId === 'action_deep_analysis' || actionId === 'open_predictive') {
            setIsDeepModalOpen(true);
          } else if (actionId === 'toggle_heatmap' || actionId === 'action-heatmap') {
            setHeatmapOverlayActive(prev => {
              const next = !prev;
              showToast(next ? 'Ders Yükü Isı Haritası Katmanı Açıldı' : 'Isı Haritası Kapatıldı', next ? 'info' : 'success');
              return next;
            });
          } else if (actionId === 'open_split_compare') {
            setIsSplitCompareOpen(true);
} else if (actionId === 'action_rules') {
            setShowRulesModal(true);
          } else if (actionId === 'action_export_image') {
            exportToCanvasImage();
          } else if (actionId === 'action_lock_all') {
            handleLockAll();
          } else if (actionId === 'action_unlock_all') {
            handleUnlockAll();
          } else if (actionId === 'action_clear_pool') {
            handleClearAllToPool();
          } else if (actionId === 'action_duty') {
            setMainTab('duty');
          } else if (actionId === 'action_settings') {
            setMainTab('settings');
          }
        }}
      />

      <ExportReportingModal
        isOpen={exportMenuOpen}
        onClose={() => setExportMenuOpen(false)}
        schedules={schedules}
        classSchedules={classSchedules}
        teachers={teachers}
        classes={classes}
        schoolInfo={schoolInfo}
        schoolSettings={schoolSettings}
      />

      <SplitCompareModal
        isOpen={isSplitCompareOpen}
        onClose={() => setIsSplitCompareOpen(false)}
        initialEntityA={splitCompareInitialA}
        initialEntityB={splitCompareInitialB}
        teachers={teachers}
        classes={classes}
        rooms={rooms}
        schoolSettings={schoolSettings as any}
        schedules={schedules}
        classSchedules={classSchedules}
        roomSchedules={roomSchedules}
        constraints={constraints as any}
        lockedCells={lockedCells}
        onOpenQuickCreate={(teacher, cls) => {
          setIsSplitCompareOpen(false);
          setPoolForm(prev => ({
            ...prev,
            teachers: [teacher],
            classes: [cls],
            rooms: [],
            subject: subjects[0] || '',
            format: '2',
            editingId: null
          }));
          setPoolMenuOpen(true);
        }}
      />

            <GoogleDriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        currentUser={driveUser}
        accessToken={driveToken}
        onAuthSuccess={(user, token) => {
          setDriveUser(user);
          setDriveToken(token);
        }}
        onAuthLogout={() => {
          setDriveUser(null);
          setDriveToken(null);
        }}
        getCurrentAppData={getFullBackupData}
        onApplyCloudData={applyFullBackupData}
        showToast={showToast}
      />

      {/* @locked: User requested to permanently keep this header layout structure intact. Do not remove or alter the sub-menu, duty, matrix, file ops, or export tabs. */}
      <div className="bg-slate-950 text-white px-2.5 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-2.5 shadow-xl border-b border-white/10 shrink-0 flex flex-col md:flex-row justify-between items-center relative z-[60]">
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-start">
           <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="bg-slate-900 border border-slate-700/50 p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-inner flex items-center justify-center relative overflow-hidden group shrink-0">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-50"></div>
                 <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.1" className="text-indigo-400" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-cyan-400" />
                    <circle cx="12" cy="4" r="2" fill="currentColor" className="text-indigo-400" />
                    <circle cx="12" cy="20" r="2" fill="currentColor" className="text-indigo-400" />
                    <circle cx="4" cy="12" r="2" fill="currentColor" className="text-purple-400" />
                    <circle cx="20" cy="12" r="2" fill="currentColor" className="text-purple-400" />
                    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-30" />
                 </svg>
               </div>
              <div className="hidden sm:block">
                  <h1 className="text-base sm:text-lg font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Kuantum Pro</h1>
                  <span className="text-[9px] sm:text-[10px] text-indigo-300 font-bold tracking-widest block mt-0.5">OTOMATİK DAĞITIM SİSTEMİ</span>
              </div>
           </div>
           
           <div className="hidden md:flex bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 shadow-inner overflow-x-auto max-w-full whitespace-nowrap custom-scrollbar shrink-0 gap-0.5">
             <button onPointerDown={() => setMainTab('matrix')} className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-150 shrink-0 ${mainTab === 'matrix' ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}>
                <div className="flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5"/> Dağıtım Motoru</div>
             </button>
             <button onPointerDown={() => setMainTab('duty')} className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-150 shrink-0 ${mainTab === 'duty' ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}>
                <div className="flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5"/> Nöbet Asistanı</div>
             </button>
             <button onPointerDown={() => setMainTab('settings')} className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-150 shrink-0 ${mainTab === 'settings' ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}>
                <div className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5"/> Genel Ayarlar</div>
             </button>
           </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mt-2 md:mt-0 w-full md:w-auto shrink-0 touch-manipulation pb-1 sm:pb-0">
           
           {/* PWA Install Button */}
           <PWAInstallButton />

           {/* Spotlight / Command Palette Button */}
           <button 
             onClick={() => setIsSpotlightOpen(true)}
             onPointerDown={() => setIsSpotlightOpen(true)}
             className="flex-1 sm:flex-initial min-w-max min-h-[38px] sm:min-h-[40px] bg-slate-900/95 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 hover:text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-xs group shrink-0 active:scale-95 touch-manipulation cursor-pointer"
             title="Spotlight Arama ve Hızlı Komut Paleti (Ctrl + K)"
           >
             <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
             <span className="truncate hidden sm:inline">Hızlı Ara</span>
             <span className="sm:hidden font-extrabold">Ara</span>
             <kbd className="hidden lg:inline-block bg-slate-950 text-[9px] text-indigo-300 font-mono px-1.5 py-0.5 rounded border border-slate-800">Ctrl + K</kbd>
           </button>

           {/* Google Drive Sync Button */}
           <button 
             onClick={() => setIsDriveModalOpen(true)}
             onPointerDown={() => setIsDriveModalOpen(true)}
             className={`flex-1 sm:flex-initial min-w-max min-h-[38px] sm:min-h-[40px] border px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 active:scale-95 touch-manipulation cursor-pointer ${
               driveUser 
                 ? 'bg-emerald-950/90 hover:bg-emerald-900 active:bg-emerald-950 border-emerald-500/70 text-emerald-300 ring-1 ring-emerald-500/30' 
                 : 'bg-indigo-950/80 hover:bg-indigo-900 active:bg-indigo-950 border-indigo-500/60 text-indigo-200'
             }`}
             title="Google Drive Senkronizasyonu (Telefon & Bilgisayar)"
           >
             {driveUser?.photoURL ? (
               <img src={driveUser.photoURL} alt="" className="w-4 h-4 rounded-full border border-emerald-400 object-cover shrink-0" referrerPolicy="no-referrer" />
             ) : (
               <Cloud className={`w-3.5 h-3.5 ${driveUser ? 'text-emerald-400' : 'text-indigo-400'} shrink-0`} />
             )}
             <span className="hidden sm:inline truncate">{driveUser ? 'Drive Eşitlendi' : 'Drive Eşitle'}</span>
             <span className="sm:hidden font-extrabold">Drive</span>
             {driveUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>}
           </button>

           {/* Export & Reporting Button */}
           <button 
             onClick={() => setExportMenuOpen(true)}
             onPointerDown={() => setExportMenuOpen(true)}
             className="hidden md:flex flex-1 sm:flex-initial min-w-max min-h-[38px] sm:min-h-[40px] bg-emerald-600/90 hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-500/50 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap shrink-0 active:scale-95 touch-manipulation cursor-pointer"
             title="PDF, Excel, Resim çıktısı al ve QR Kod ile paylaş"
           >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Çıktı & Paylaşım</span>
              <span className="sm:hidden font-extrabold">Çıktı</span>
           </button>

           <div className="relative flex-1 sm:flex-initial min-w-max shrink-0 z-[70]">
             <button 
               type="button"
               onClick={(e) => {
                 e.stopPropagation();
                 setFileMenuOpen((prev) => !prev);
               }}
               className="w-full min-h-[38px] sm:min-h-[40px] bg-sky-600 hover:bg-sky-500 active:bg-sky-700 border border-sky-500/50 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shadow-xs active:scale-95 touch-manipulation cursor-pointer" 
               title="Dosya işlemleri ve yeni çalışma alanı"
             >
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Dosya İşlemleri</span>
                <span className="sm:hidden font-extrabold">Dosya</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${fileMenuOpen ? "rotate-180" : ""}`}/>
             </button>
             <AnimatePresence>
             {fileMenuOpen && (
               <>
                 <div 
                   className="fixed inset-0 z-[80] cursor-default bg-slate-950/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
                   onClick={(e) => {
                     e.stopPropagation();
                     setFileMenuOpen(false);
                   }}
                 />
                 <motion.div 
                   initial={{ opacity: 0, y: -6, scale: 0.96 }} 
                   animate={{ opacity: 1, y: 0, scale: 1 }} 
                   exit={{ opacity: 0, y: -6, scale: 0.96 }}
                   transition={{ duration: 0.15, ease: "easeOut" }}
                   className="absolute right-0 top-full mt-2 w-72 sm:w-64 bg-white/98 backdrop-blur-md text-slate-800 rounded-2xl md:rounded-xl shadow-2xl border border-slate-200/90 z-[90] overflow-hidden divide-y divide-slate-100"
                   style={{ transformOrigin: 'top right' }}
                 >
                 {/* Google Drive Senkronizasyon Bölümü */}
                 <div className="p-1.5 bg-indigo-50/70 border-b border-indigo-100">
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       setFileMenuOpen(false);
                       setIsDriveModalOpen(true);
                     }} 
                     className="w-full text-left px-3 py-2 rounded-lg font-bold text-xs text-indigo-800 hover:bg-indigo-100 active:bg-indigo-200 transition-colors flex items-center justify-between group touch-manipulation"
                     title="Google Drive ile bilgisayar ve telefon arasında veri senkronizasyonu"
                   >
                     <div className="flex items-center gap-2.5">
                       <div className="w-7 h-7 rounded-lg bg-indigo-200/80 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                         <Cloud className="w-4 h-4" />
                       </div>
                       <div>
                         <div className="text-xs font-black text-slate-900 group-hover:text-indigo-800 leading-tight">Google Drive</div>
                         <div className="text-[10px] text-slate-500 font-medium leading-tight">{driveUser ? 'Bağlı & Eşitleniyor' : 'Bulut Senkronizasyon'}</div>
                       </div>
                     </div>
                     <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${driveUser ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                       {driveUser ? 'Bağlı' : 'Eşitle'}
                     </span>
                   </button>
                 </div>

                 {/* Yeni Çalışma Alanı Bölümü */}
                 <div className="p-1.5 bg-slate-50/60">
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       setFileMenuOpen(false);
                       handleRequestNewWorkspace();
                     }} 
                     className="w-full text-left px-3 py-2 rounded-lg font-bold text-xs text-rose-700 hover:bg-rose-50 active:bg-rose-100 transition-colors flex items-center justify-between group touch-manipulation"
                     title="Hafızadaki tüm verileri silerek yeni boş bir çalışma alanı başlat"
                   >
                     <div className="flex items-center gap-2.5">
                       <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-rose-200 transition-all">
                         <FilePlus className="w-4 h-4" />
                       </div>
                       <div>
                         <div className="text-xs font-black text-slate-800 group-hover:text-rose-700 leading-tight">Yeni</div>
                         <div className="text-[10px] text-slate-400 font-medium leading-tight">Hafızayı sil & boş aç</div>
                       </div>
                     </div>
                     <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100/80 text-rose-700 group-hover:bg-rose-200 transition-colors">
                       Temizle
                     </span>
                   </button>
                 </div>

                 {/* JSON Formatı (Tam Yedek) */}
                 <div>
                   <div className="bg-slate-50/80 px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">JSON Formatı (Tam Yedek)</div>
                   <div className="p-1">
                     <button onClick={() => { setFileMenuOpen(false); programInputRef.current?.click(); }} className="w-full text-left px-3 py-2.5 md:py-2 font-semibold text-xs rounded-xl md:rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 mb-0.5 cursor-pointer touch-manipulation">
                       <Upload className="w-3.5 h-3.5 text-emerald-600 shrink-0"/> Program Yükle
                     </button>
                     <button onClick={() => { setFileMenuOpen(false); exportProgramData(); }} className="w-full text-left px-3 py-2.5 md:py-2 font-semibold text-xs rounded-xl md:rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 cursor-pointer touch-manipulation">
                       <Save className="w-3.5 h-3.5 text-blue-600 shrink-0"/> Program Kaydet
                     </button>
                   </div>
                 </div>

                 {/* XML Formatı (Asc Timetables) */}
                 <div>
                   <div className="bg-slate-50/80 px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">XML Formatı (Asc Timetables)</div>
                   <div className="p-1">
                     <button onClick={() => { setFileMenuOpen(false); fileInputRef.current?.click(); }} className="w-full text-left px-3 py-2.5 md:py-2 font-medium text-xs rounded-xl md:rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 mb-0.5 cursor-pointer touch-manipulation">
                       <Upload className="w-3.5 h-3.5 text-amber-500 shrink-0"/> XML Yükle
                     </button>
                     <button onClick={() => { setFileMenuOpen(false); exportXMLData(); }} className="w-full text-left px-3 py-2.5 md:py-2 font-medium text-xs rounded-xl md:rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 cursor-pointer touch-manipulation">
                       <Save className="w-3.5 h-3.5 text-indigo-500 shrink-0"/> XML Kaydet
                     </button>
                   </div>
                 </div>
               </motion.div>
               </>
             )}
             </AnimatePresence>
           </div>
           <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xml" className="hidden" />
           <input type="file" ref={programInputRef} onChange={handleProgramUpload} accept=".json" className="hidden" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-0 pb-[72px] md:p-4 md:pb-4">
        {mainTab === 'matrix' ? (
          <div className="h-full flex flex-col md:flex-row gap-2 md:gap-4">
             {/* Mobile-only Timeline View (Kompakt Ders Blokları & Akıllı Hücre Taşıma) */}
             <div className="md:hidden flex-1 h-full w-full overflow-hidden flex flex-col">
                <MobileTimelineView
                  previewType={previewType as 'teacher' | 'class' | 'room'}
                  setPreviewType={(t) => setPreviewType(t)}
                  teachers={teachers}
                  classes={classes}
                  rooms={rooms}
                  schedules={schedules}
                  classSchedules={classSchedules}
                  roomSchedules={roomSchedules}
                  schoolSettings={schoolSettings}
                  lockedCells={lockedCells}
                  onToggleLock={handleMobileToggleLock}
                  onOpenQuickAction={(target) => setMobileQuickActionTarget(target)}
                  movingCard={mobileMovingCard}
                  onCancelMove={() => setMobileMovingCard(null)}
                  onExecuteMoveToSlot={handleExecuteMobileMoveToSlot}
                />
             </div>
             <div className="w-full md:w-80 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex-col h-full hidden md:flex">
                <div className="bg-slate-50 p-3 rounded-t-xl border-b border-slate-200 shrink-0">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><LayoutList className="w-5 h-5 text-indigo-600"/> Dağıtım Havuzu</h3>
                  <div className="flex items-center gap-2 mt-3">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-200 px-2 py-1 rounded">Kart Ekle</span>
                     <button onClick={() => setPoolMenuOpen(!poolMenuOpen)} className="flex-1 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Formu Aç
                     </button>
                  </div>
                  {poolMenuOpen && (
                     <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/40 p-0 md:p-4" onClick={() => setPoolMenuOpen(false)}>
                        <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
                           {/* Drag handle for mobile */}
                           <div className="w-full flex justify-center pt-3 pb-2 md:hidden shrink-0 touch-none">
                              <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                           </div>
                           
                           {/* Header */}
                           <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 md:rounded-t-xl shrink-0 sticky top-0 z-10">
                              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600"/> Kart Düzenle</h3>
                              <button onClick={() => setPoolMenuOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                              </button>
                           </div>

                           <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-24 md:pb-4">
                           <div>
                              <div className="text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                                  <span>Öğretmenler *</span>
                                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Çoklu seçilebilir</span>
                              </div>
                              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar border border-slate-200 p-1 rounded bg-slate-50">
                                 {teachers.map(t => (
                                     <button key={t} onClick={() => toggleMultiSelect('teachers', t)} className={`px-2 py-1 text-xs rounded font-semibold transition-colors ${poolForm.teachers.includes(t) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 hover:bg-indigo-50 text-slate-700'}`}>
                                         {t}
                                     </button>
                                 ))}
                              </div>
                           </div>
                           <div>
                              <div className="text-xs font-bold text-slate-500 mb-1 flex justify-between">
                                  <span>Sınıflar *</span>
                                  <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-400">Çoklu seçilebilir</span>
                              </div>
                              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar border border-slate-200 p-1 rounded bg-slate-50">
                                 {classes.map(c => (
                                     <button key={c} onClick={() => toggleMultiSelect('classes', c)} className={`px-2 py-1 text-xs rounded font-semibold transition-colors ${poolForm.classes.includes(c) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 hover:bg-indigo-50 text-slate-700'}`}>
                                         {c}
                                     </button>
                                 ))}
                              </div>
                           </div>
                           <div className="flex gap-2">
                               <div className="flex-1">
                                  <div className="text-xs font-bold text-slate-500 mb-1">Ders *</div>
                                  <select className="w-full border border-slate-300 rounded p-1.5 text-sm font-semibold outline-none focus:border-indigo-500" value={poolForm.subject} onChange={e => setPoolForm({...poolForm, subject: e.target.value})}>
                                      <option value="">Seçiniz</option>
                                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                               </div>
                               <div className="w-24">
                                  <div className="text-xs font-bold text-slate-500 mb-1">Derslik</div>
                                  <select className="w-full border border-slate-300 rounded p-1.5 text-sm font-semibold outline-none focus:border-indigo-500" value={poolForm.rooms[0] || ''} onChange={e => setPoolForm({...poolForm, rooms: e.target.value ? [e.target.value] : []})}>
                                      <option value="">Yok</option>
                                      {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                                  </select>
                               </div>
                           </div>
                           <div>
                               <div className="text-xs font-bold text-slate-500 mb-1">Dağılım (Örn: 2+1, 3, 2+2) *</div>
                               <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm font-bold text-center outline-none focus:border-indigo-500 bg-slate-50" placeholder="Örn: 2+1" value={poolForm.format} onChange={e => setPoolForm({...poolForm, format: e.target.value})} />
                           </div>
                           </div>
                           
                           {/* Footer */}
                           <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2 shrink-0 sticky bottom-0 z-10 w-full md:rounded-b-xl bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all">
                               <button onClick={() => {setPoolForm({ teachers: [], classes: [], rooms: [], subject: '', format: '2', editingId: null }); setPoolMenuOpen(false);}} className="flex-1 py-3 md:py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors min-h-[44px]">İptal</button>
                               <button onClick={handleCreatePoolCard} className="flex-[2] bg-indigo-600  text-white rounded-xl py-3 md:py-2 text-sm font-bold transition-colors -sm min-h-[44px] -md hover:-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95">{poolForm.editingId ? 'Güncelle' : 'Karta Çevir'}</button>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-200">
                     
                     <div className="flex gap-2">
                        <select disabled={distributeState.isRunning} value={selectedCoreCount} onChange={e => setSelectedCoreCount(Number(e.target.value))} className="w-24 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 shadow-sm cursor-pointer px-2" title="Çekirdek Sayısı">
                                {[1,2,3,4,6,8,12,16].map(c => <option key={c} value={c}>{c} Çekirdek</option>)}
                            </select>
                            <button onClick={autoDistributePro} disabled={distributeState.isRunning || unplacedCourses.length === 0} className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all disabled:opacity-50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div><Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" /> AI Kuantum Motoru
                        </button>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setShowRulesModal(true)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all group">
                         <Settings2 className="w-5 h-5 text-slate-500 group-hover:text-slate-700"/> Şartlar / Kurallar
                      </button>
                      <button onClick={analyzeConflicts} className="w-full bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                           <Activity className="w-4 h-4 text-indigo-500"/> Ön Analiz (Dağıtıma Hazır Mı?)
                        </button>
                     </div>
                     <div className="flex gap-2 mt-1">
                        <div 
                           onClick={() => {
                             setIsDeepModalOpen(true);
                             handleForceDeepRun();
                           }}
                           className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all shadow-sm group hover:shadow-md select-none ${
                             deepLearningActive ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                           }`}
                           title="Derin Kestirimsel Analizi İncele & Simülasyon Çalıştır"
                        >
                           <div className="flex items-center gap-2">
                              <Brain className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                                isRunningDeepAnalysis ? 'text-indigo-600 animate-spin' :
                                deepLearningActive ? 'text-indigo-600 animate-pulse' : 'text-slate-500'
                              }`} />
                              <span className="text-xs font-bold">Derin Öğrenme / Analiz</span>
                              {shadowAnalysis && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
                                  shadowAnalysis.feasibilityScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  shadowAnalysis.feasibilityScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  %{shadowAnalysis.feasibilityScore}
                                </span>
                              )}
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-semibold transition-colors">Rapor</span>
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeepLearningActive(!deepLearningActive);
                                }}
                                className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${deepLearningActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                title={deepLearningActive ? 'Otomatik Kestirimsel Havuz Sıralamasını Kapat' : 'Otomatik Kestirimsel Havuz Sıralamasını Aç'}
                              >
                                  <div className={`absolute top-0.5 bottom-0.5 w-3 rounded-full bg-white transition-all shadow-sm ${deepLearningActive ? 'left-[18px]' : 'left-0.5'}`}></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Dead-End Global Warning Alert Banner */}
                  {poolAnalysisStats.deadEndCount > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md border border-red-500 flex flex-col gap-1.5 animate-pulse">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                             <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                             <span className="font-black text-xs leading-tight">{poolAnalysisStats.deadEndCount} Kartta %100 Tıkanma!</span>
                          </div>
                          <button 
                            onClick={() => setPoolRiskFilter(poolRiskFilter === 'dead_end' ? 'all' : 'dead_end')}
                            className="text-[9.5px] font-extrabold bg-white text-red-700 px-2 py-0.5 rounded shadow-xs hover:bg-red-50 transition-colors"
                          >
                            {poolRiskFilter === 'dead_end' ? 'Tümünü Göster' : 'Tıkananları Filtrele'}
                          </button>
                       </div>
                       <p className="text-[10px] text-red-100 leading-snug">
                          Öğretmen kısıtları veya kilitli dersler sebebiyle bu kartlar için tahtada yerleşebilecek hiçbir saat kalmadı.
                       </p>
                    </div>
                  )}

                  {/* Pool Filters & Search Toolbar */}
                  <div className="mt-2.5 flex flex-col gap-1.5">
                     {/* Search Bar */}
                     <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={poolSearchQuery} 
                          onChange={(e) => setPoolSearchQuery(e.target.value)}
                          placeholder="Havuzda ara (Ders, Öğretmen, Sınıf)..."
                          className="w-full pl-8 pr-7 py-1 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                        />
                        {poolSearchQuery && (
                          <button onClick={() => setPoolSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                     </div>

                     {/* Risk Filter Tabs */}
                     <div className="grid grid-cols-4 gap-1 text-[9.5px] font-bold">
                        <button 
                          onClick={() => setPoolRiskFilter('all')}
                          className={`py-1 px-1 rounded-md text-center transition-all truncate ${poolRiskFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                          title="Tüm Bekleyen Kartlar"
                        >
                          Tümü ({poolAnalysisStats.total})
                        </button>
                        <button 
                          onClick={() => setPoolRiskFilter('dead_end')}
                          className={`py-1 px-0.5 rounded-md text-center transition-all truncate flex items-center justify-center gap-0.5 ${poolRiskFilter === 'dead_end' ? 'bg-red-600 text-white shadow-xs font-black' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
                          title="%100 Tıkanma Riski Olan Kartlar (0 Geçerli Slot)"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                          Tıkanma ({poolAnalysisStats.deadEndCount})
                        </button>
                        <button 
                          onClick={() => setPoolRiskFilter('critical_bottleneck')}
                          className={`py-1 px-0.5 rounded-md text-center transition-all truncate flex items-center justify-center gap-0.5 ${poolRiskFilter === 'critical_bottleneck' ? 'bg-amber-500 text-white shadow-xs font-black' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'}`}
                          title="Kritik Darboğaz ve Yüksek Çekişmeli Kartlar (1-5 Slot)"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                          Darboğaz ({poolAnalysisStats.criticalCount + poolAnalysisStats.contentionCount})
                        </button>
                        <button 
                          onClick={() => setPoolRiskFilter('optimal')}
                          className={`py-1 px-1 rounded-md text-center transition-all truncate ${poolRiskFilter === 'optimal' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'}`}
                          title="Rahat ve Esnek Yerleşim Alanına Sahip Kartlar"
                        >
                          Rahat ({poolAnalysisStats.optimalCount})
                        </button>
                     </div>

                     {/* Sort Selector */}
                     <div className="flex items-center justify-between text-[10px] text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <span className="font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-slate-400" /> Sırala:
                        </span>
                        <select 
                          value={poolSortMode} 
                          onChange={(e) => setPoolSortMode(e.target.value as any)}
                          className="bg-transparent text-indigo-700 font-bold text-[10.5px] focus:outline-none cursor-pointer"
                        >
                          <option value="risk">🔥 Darboğaz / Risk Sıralı</option>
                          <option value="hours">⏱️ Blok Saati (Azalan)</option>
                          <option value="teacher">👤 Öğretmen Adı (A-Z)</option>
                          <option value="subject">📚 Ders Adı (A-Z)</option>
                        </select>
                     </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 bg-slate-100 custom-scrollbar relative" 
                     onDragOver={(e) => e.preventDefault()} onDrop={handleDropToPool}>
                    {unplacedCourses.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <LayoutList className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm font-semibold">Havuz boş.</p>
                            <p className="text-xs mt-1">XML yükleyin veya Kart Ekle'den yeni ders oluşturun.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 pb-20">
                            {filteredAndSortedPoolCards.map((card) => {
                                const cClass = getColorForSubject(card.subject, card.isElective);
                                const status = getCardBottleneckStatus(card);
                                return (
                                   <div key={card.id} className={`relative rounded-lg shadow-xs border-l-[4px] group select-none overflow-hidden ${cClass} ${status.cardBorderClass}`}>
                                       {/* Scrollable Container */}
                                       <div className="w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory flex items-stretch">
                                            {/* Foreground Card */}
                                            <div draggable onDragStart={(e) => handlePoolDragStart(e, card)} onDragEnd={handleDragEnd}
                                                 onClick={() => { editPoolCard(card); setPoolMenuOpen(true); }}
                                                 className="w-full shrink-0 snap-start relative p-2.5 cursor-grab md:hover:-translate-y-0.5 md:hover:shadow-md transition-transform rounded-r-lg">
                                                
                                                {/* Bottleneck Warning Badge Header */}
                                                {status.category !== 'optimal' && (
                                                   <div className="mb-1.5 flex items-center justify-between gap-1">
                                                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-black tracking-tight ${status.badgeClass}`}>
                                                         {status.category === 'dead_end' ? <ShieldAlert className="w-3 h-3 shrink-0" /> : <AlertTriangle className="w-3 h-3 shrink-0" />}
                                                         <span>{status.badgeLabel}</span>
                                                      </span>
                                                      <button
                                                         onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()}
                                                         className="text-[10px] md:text-[9px] font-bold text-indigo-700 hover:text-indigo-900 bg-white/90 px-2 py-1 md:px-1.5 md:py-0.5 rounded border border-indigo-200/60 shadow-sm md:shadow-2xs flex items-center gap-1 md:gap-0.5 shrink-0 pointer-events-auto"
                                                         title="Kart Çakışma Analizörünü Aç"
                                                      >
                                                         <Search className="w-3 h-3 md:w-2.5 md:h-2.5" /> İncele
                                                      </button>
                                                   </div>
                                                )}

                                                {/* Desktop Overlay Actions (Hidden on Mobile) */}
                                                <div className="hidden md:flex absolute top-1.5 right-1.5 gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()} title="Neden Yerleşemedi? (Çakışma Analizi)" className="p-1 text-slate-500 hover:text-indigo-600 bg-white/95 hover:bg-white rounded shadow-2xs transition-colors pointer-events-auto"><Search className="w-3 h-3"/></button>
                                                    <button onPointerDown={(e) => { e.stopPropagation(); editPoolCard(card); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()} className="p-1 text-slate-500 hover:text-blue-600 bg-white/95 hover:bg-white rounded shadow-2xs transition-colors pointer-events-auto hover:scale-110 transition-transform"><Edit2 className="w-3 h-3"/></button>
                                                    <button onPointerDown={(e) => { e.stopPropagation(); handleDeletePoolCard(card.id); }} onClick={(e) => e.stopPropagation()} className="p-1 text-slate-500 hover:text-red-600 bg-white/95 hover:bg-white rounded shadow-2xs transition-colors pointer-events-auto hover:scale-110 transition-transform"><Trash2 className="w-3 h-3"/></button>
                                                </div>
                                      
                                      <div className="flex justify-between items-start mb-1 pr-12">
                                         <div className="font-extrabold text-xs text-slate-900 leading-snug truncate">{card.teachers.join(', ') || 'Öğretmen Belirtilmedi'}</div>
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-1 mb-1.5">
                                         <span className="text-[10px] bg-white/90 px-1.5 py-0.5 rounded font-bold text-slate-700 border border-slate-300/60 shadow-2xs">{card.classes.join(', ') || 'Sınıf Yok'}</span>
                                         {card.rooms?.length > 0 && <span className="text-[10px] bg-amber-100/90 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-300/60 shadow-2xs">{card.rooms.join(', ')}</span>}
                                         {card.isElective && <span className="text-[9px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-black uppercase">Seçmeli</span>}
                                      </div>
                                      
                                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-black/5">
                                         <span className="text-xs font-black text-slate-900 tracking-tight">{card.subject}</span>
                                         <span className="flex items-center gap-1 text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-full shadow-xs"><Clock className="w-3 h-3"/> {card.hours}s Blok</span>
                                      </div>
                                   </div>
                                   {/* Mobile Swipe Action Buttons */}
                                   <div className="md:hidden flex items-center justify-end px-3 gap-2 shrink-0 snap-end">
                                      <button onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()} className="p-2.5 text-indigo-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Search className="w-4 h-4"/></button>
                                      <button onPointerDown={(e) => { e.stopPropagation(); editPoolCard(card); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()} className="p-2.5 text-blue-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Edit2 className="w-4 h-4"/></button>
                                      <button onPointerDown={(e) => { e.stopPropagation(); handleDeletePoolCard(card.id); }} onClick={(e) => e.stopPropagation()} className="p-2.5 text-red-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                               </div>
                               </div>
                                )
                            })}
                        </div>
                    )}
                </div>
             </div>

             <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden relative hidden md:flex">
                <div className="bg-slate-50 p-2 md:p-3 border-b border-slate-200 flex flex-wrap gap-2 md:gap-3 items-center shrink-0">
                    <div className="w-full sm:w-auto grid grid-cols-4 sm:flex bg-white rounded-xl p-1 border border-slate-300 shadow-2xs gap-0.5">
                        <button onPointerDown={() => setPreviewType('teacher')} className={`px-2 sm:px-4 py-2 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all text-center truncate min-h-[36px] active:scale-95 touch-manipulation ${previewType === 'teacher' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Öğretmenler</button>
                        <button onPointerDown={() => setPreviewType('class')} className={`px-2 sm:px-4 py-2 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all text-center truncate min-h-[36px] active:scale-95 touch-manipulation ${previewType === 'class' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Sınıflar</button>
                        <button onPointerDown={() => setPreviewType('room')} className={`px-2 sm:px-4 py-2 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all text-center truncate min-h-[36px] active:scale-95 touch-manipulation ${previewType === 'room' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Derslikler</button>
                        <button onPointerDown={() => setPreviewType('subject')} className={`px-2 sm:px-4 py-2 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all text-center truncate min-h-[36px] active:scale-95 touch-manipulation ${previewType === 'subject' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Dersler</button>
                    </div>
                    
                    <div className="h-6 w-px bg-slate-300 hidden md:block"></div>

                    
                    <div className="hidden md:flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-sm text-xs text-slate-500">
                        <span className="font-bold text-slate-500 select-none hidden sm:inline">Tablo Boyutu:</span>
                        <button onClick={() => setTableZoom(prev => Math.max(40, prev - 10))} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Tabloyu Küçült (-10%)">
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <input 
                            type="range" 
                            min="40" 
                            max="150" 
                            step="10"
                            value={tableZoom} 
                            onChange={(e) => setTableZoom(Number(e.target.value))} 
                            className="w-16 md:w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            title="Boyut Kaydırıcı"
                        />
                        <button onClick={() => setTableZoom(100)} className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors min-w-[42px] text-center" title="Varsayılana Sıfırla (100%)">
                            %{tableZoom}
                        </button>
                        <button onClick={() => setTableZoom(prev => Math.min(150, prev + 10))} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Tabloyu Büyüt (+10%)">
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto mt-1 md:mt-0 ml-auto justify-end">
                        <div className="relative">
                            <button 
                                onClick={() => setLockMenuOpen(!lockMenuOpen)} 
                                onBlur={() => setTimeout(() => setLockMenuOpen(false), 200)} 
                                className="bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 min-h-[36px] touch-manipulation"
                                title="Tablo hücre kilitleme seçenekleri"
                            >
                               <Lock className="w-3.5 h-3.5 text-amber-600"/> 
                               <span>Kilitle</span> 
                               <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${lockMenuOpen ? "rotate-180" : ""}`}/>
                            </button>
                            {lockMenuOpen && (
                               <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-[70] overflow-hidden py-1 divide-y divide-slate-100">
                                  <button onMouseDown={handleLockAll} className="w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 flex items-center gap-2 transition-colors">
                                     <Lock className="w-3.5 h-3.5 text-amber-600"/> Tümünü Kilitle
                                  </button>
                                  <button onMouseDown={handleUnlockAll} className="w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-rose-50 text-slate-700 hover:text-rose-700 flex items-center gap-2 transition-colors">
                                     <Unlock className="w-3.5 h-3.5 text-rose-600"/> Tüm Kilitleri Aç
                                  </button>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleClearAllToPool} 
                            className="bg-white hover:bg-rose-50 active:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 min-h-[36px] touch-manipulation" 
                            title="Kilitli olmayan tüm dersleri havuza geri aktar"
                        >
                           <Eraser className="w-3.5 h-3.5 text-rose-500"/> 
                           <span>Temizle</span>
                        </button>
                    </div>
                </div>


                <div 
                  className="flex-1 overflow-auto bg-slate-100 p-2 md:p-4 custom-scrollbar select-none"
                                                    >
                   <table id="timetable-matrix" className="w-full border-collapse bg-white shadow-sm ring-1 ring-slate-200 rounded-lg origin-top-left hidden md:table" style={{ zoom: tableZoom / 100 }}>
                      <thead className="sticky top-0 z-40 bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm">
                         <tr className="transition-colors hover:bg-slate-50/80">
                            <th rowSpan="2" className="sticky left-0 z-50 border-r border-b border-slate-200 p-3 w-32 md:w-40 text-left font-black bg-slate-100 uppercase tracking-wider text-xs md:text-sm">{previewType === 'teacher' ? 'ÖĞRETMEN' : previewType === 'class' ? 'SINIF' : previewType === 'room' ? 'DERSLİK' : 'DERS'}</th>
                            {schoolSettings.weekDays.filter(d=>d.active).map(d => <th key={d.id} colSpan={d.periods} className="border-r border-b border-slate-200 p-2 font-black text-center bg-slate-100/90 backdrop-blur-md text-slate-700">{d.name}</th>)}
                         </tr>
                         <tr className="transition-colors hover:bg-slate-50/80">
                            {schoolSettings.weekDays.filter(d=>d.active).map(d => 
                               Array.from({length: d.periods}).map((_, i) => <th key={`${d.id}-${i}`} className="border-r border-b border-slate-200 p-1 text-[10px] md:text-xs font-bold text-center bg-slate-50 text-slate-500 min-w-[60px] md:min-w-[80px]">{(i+1)}<br/><span className="text-[8px] font-normal text-slate-500">{schoolSettings.lessonTimes[i].start}</span></th>)
                            )}
                         </tr>
                      </thead>
                      <tbody className="text-[10px] md:text-xs">
                         {(() => {
                            const dataMaster = previewType === 'teacher' ? schedules : previewType === 'class' ? classSchedules : previewType === 'room' ? roomSchedules : subjectSchedules;
                            const rowKeys = previewType === 'teacher' ? teachers : previewType === 'class' ? classes : previewType === 'room' ? rooms : subjects;
                            const activeDays = schoolSettings.weekDays.filter(d => d.active);

                            return rowKeys.map((rowKey, rIdx) => {
                               const unplacedCount = unplacedCourses.filter(c => {
                                   if (previewType === 'teacher') return c.teachers.includes(rowKey);
                                   if (previewType === 'class') return c.classes.includes(rowKey);
                                   if (previewType === 'room') return c.rooms?.includes(rowKey);
                                   if (previewType === 'subject') return c.subject === rowKey;
                                   return false;
                               }).length;

                               const isHighlighted = highlightedEntity === rowKey;

                               return (
                                 <tr 
                                   key={rowKey} 
                                   id={`row-${previewType}-${rowKey}`}
                                   className={`border-b border-slate-200 hover:bg-indigo-50/30 group transition-all duration-300 ${isHighlighted ? 'bg-indigo-100/70 ring-2 ring-indigo-500' : ''}`}
                                 >
                                    <td className="border-r border-slate-200 p-2 font-bold text-slate-800 bg-white sticky left-0 z-30 group-hover:bg-indigo-50 relative cursor-pointer transition-colors" onClick={() => { setConstraintTargets([]); setShowConstraintTargets(false); setConstraintModal({ type: previewType === 'subject' ? 'subjects' : previewType, name: rowKey }); setModalPoolForm({ editingBlock: null, teachers: previewType === 'teacher' ? [rowKey] : [], classes: previewType === 'class' ? [rowKey] : [], rooms: previewType === 'room' ? [rowKey] : [], subject: previewType === 'subject' ? rowKey : '', format: '2', editingId: null }); }}>
                                        <div className="flex flex-col gap-1.5">
                                           <div className="flex justify-between items-center">
                                              <span className="truncate pr-6 flex items-center gap-1.5 text-indigo-700 group-hover:text-indigo-600 group-hover:underline">
                                                  {rowKey}
                                                  {unplacedCount > 0 && (
                                                      <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all active:scale-95" title={`Havuzda ${unplacedCount} ders var`}>{unplacedCount}</span>
                                                  )}
                                                  <Plus className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Kart oluştur / Koşullar" />
                                              </span>
                                              <div className="absolute right-1 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-indigo-50 pl-4" onClick={e => e.stopPropagation()}>
                                                  <button onClick={() => toggleRowLock(rowKey)} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700" title="Satırdaki dersleri kilitle/aç"><Lock className="w-3 h-3"/></button>
                                                  <button onClick={() => clearRowToPool(rowKey)} className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600 hover:scale-110 transition-transform" title="Kilitli olmayanları havuza at"><Eraser className="w-3 h-3"/></button>
                                              </div>
                                           </div>
                                           {(() => {
                                               const typeConstraints = constraints[previewType === 'teacher' ? 'teachers' : previewType === 'class' ? 'classes' : previewType === 'room' ? 'rooms' : 'subjects'][rowKey] || [];
                                               const maxPeriodsAcrossDays = Math.max(...activeDays.map(d => d.periods), 1);
                                               return (
                                                  <div className="flex flex-col gap-[1px] mt-1 bg-slate-50 border border-slate-200 rounded-md p-1 w-fit select-none" title="Haftalık Koşul ve Doluluk (Kırmızı: Kapalı, Yeşil: Boş/Kullanılabilir, Gri: Dolu)">
                                                     {/* Header Row: Numbers 1 2 3... */}
                                                     <div className="flex gap-[2px] items-center">
                                                        <span className="w-5 shrink-0 text-[7px] font-black text-slate-400 text-center">Gün</span>
                                                        <div className="flex gap-[1.5px]">
                                                           {Array.from({length: maxPeriodsAcrossDays}).map((_, pIdx) => (
                                                              <span key={pIdx} className="w-1.5 h-1.5 md:w-2 md:h-2 flex items-center justify-center text-[7px] font-bold text-slate-400 leading-none">
                                                                 {pIdx + 1}
                                                              </span>
                                                           ))}
                                                        </div>
                                                     </div>
                                                     {/* Day Rows */}
                                                     {activeDays.map((day) => (
                                                         <div key={day.id} className="flex gap-[2px] items-center">
                                                             <span className="w-5 shrink-0 text-[7.5px] font-bold text-slate-500 text-left truncate leading-none" title={day.name}>{day.name.slice(0, 3)}</span>
                                                             <div className="flex gap-[1.5px]">
                                                                 {Array.from({length: maxPeriodsAcrossDays}).map((_, pIdx) => {
                                                                     if (pIdx >= day.periods) {
                                                                         return <div key={pIdx} className="w-1.5 h-1.5 md:w-2 md:h-2 opacity-0"></div>;
                                                                     }
                                                                     const isClosed = typeConstraints.includes(`${day.id - 1}-${pIdx}`);
                                                                     const hasLesson = !!dataMaster[rowKey]?.[day.id - 1]?.[pIdx];
                                                                     let cellColorClass = 'bg-green-600 shadow-sm shadow-green-100'; // Default: Boş (Yeşil)
                                                                     if (isClosed) {
                                                                         cellColorClass = 'bg-red-500 shadow-sm shadow-red-200'; // Kapalı (Kırmızı)
                                                                     } else if (hasLesson) {
                                                                         cellColorClass = 'bg-slate-400 shadow-sm shadow-slate-200'; // Dolu Ders (Gri)
                                                                     }
                                                                     return (
                                                                         <div 
                                                                             key={pIdx} 
                                                                             title={`${day.name} ${pIdx+1}. Ders: ${isClosed ? 'Kapalı/Kısıtlı' : hasLesson ? 'Dolu (Yerleşmiş Ders)' : 'Boş/Kullanılabilir'}`} 
                                                                             className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-[1px] border border-slate-300/20 transition-all ${cellColorClass}`}
                                                                         ></div>
                                                                     );
                                                                 })}
                                                             </div>
                                                         </div>
                                                     ))}
                                                  </div>
                                               );
                                           })()}
                                        </div>
                                    </td>
                                    {activeDays.map((day) => {
                                       const absDIdx = day.id - 1;
                                       let cells = [];
                                       let pIdx = 0;
                                       while (pIdx < day.periods) {
                                           const cellVal = dataMaster[rowKey]?.[absDIdx]?.[pIdx];
                                           const cData = cellVal ? parseCellData(cellVal) : null;
                                           let isClosed = false;

                                           if (previewType === "teacher") isClosed = constraints.teachers[rowKey]?.includes(`${absDIdx}-${pIdx}`);
                                           else if (previewType === "class") isClosed = constraints.classes[rowKey]?.includes(`${absDIdx}-${pIdx}`);
                                           else if (previewType === "room") isClosed = constraints.rooms[rowKey]?.includes(`${absDIdx}-${pIdx}`);
                                           else if (previewType === "subject") isClosed = constraints.subjects[rowKey]?.includes(`${absDIdx}-${pIdx}`);

                                           if (cData && cellVal !== "") {
                                               let blockSize = 1;
                                               while (pIdx + blockSize < day.periods && dataMaster[rowKey]?.[absDIdx]?.[pIdx + blockSize] === cellVal) {
                                                   blockSize++;
                                               }
                                               
                                               let topText = "";
                                               let bottomText = "";
                                               let subText = "";
                                               
                                               if (previewType === "teacher") {
                                                   topText = cData.classes.join(", ");
                                                   bottomText = cData.subject;
                                                   subText = cData.rooms?.length > 0 ? cData.rooms.join(", ") : "";
                                               } else if (previewType === "class") {
                                                   topText = cData.subject;
                                                   bottomText = cData.teachers.join(", ");
                                                   subText = cData.rooms?.length > 0 ? cData.rooms.join(", ") : "";
                                               } else if (previewType === "room") {
                                                   topText = cData.teachers.join(", ");
                                                   bottomText = cData.classes.join(", ");
                                                   subText = cData.subject;
                                               } else {
                                                   topText = cData.teachers.join(", ");
                                                   bottomText = cData.classes.join(", ");
                                                   subText = cData.rooms?.length > 0 ? cData.rooms.join(", ") : "";
                                               }
                                               const cClass = getColorForSubject(cData.subject);
                                               
                                               let isLocked = false;
                                               const lockEntity = previewType === "teacher" ? cData.teachers[0] : previewType === "class" ? cData.classes[0] : previewType === "room" ? cData.rooms[0] : cData.teachers[0];
                                               for(let i=0; i<blockSize; i++) if (lockedCells[`${lockEntity}-${absDIdx}-${pIdx+i}`]) isLocked = true;

                                               const conflictInfo = checkCellConflict(cData, absDIdx, pIdx, blockSize);
                                               const hasConflict = conflictInfo.hasConflict;
                                               const conflictTooltip = hasConflict ? "Çakışma / Kural Uyarısı:\n• " + conflictInfo.reasons.join("\n• ") : undefined;

                                               const hData = heatmapOverlayActive ? getSlotHeatmapData(absDIdx, pIdx) : null;
                                               const hColor = hData ? getHeatmapColor(hData.activeIntensity, heatmapOverlayOpacity) : null;
                                               const isSelectedForSwap = mobileSelectedForSwap && mobileSelectedForSwap.sourceEntity === rowKey && mobileSelectedForSwap.sourceDIdx === absDIdx && mobileSelectedForSwap.sourcePIdx === pIdx;
                                               cells.push(
                                                    <td key={`${rowKey}-${absDIdx}-${pIdx}`} colSpan={blockSize}
                                                        className={`border-r border-slate-200/80 p-0 relative transition-colors duration-150 `}
                                                        style={heatmapOverlayActive && hColor ? { backgroundColor: hColor.bg } : {}}
                                                        onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}
                                                        
                                                        onMouseEnter={() => { if (heatmapOverlayActive) setHighlightedHeatmapPeriod({ dayId: absDIdx, pIdx }); }}
                                                        
                                                        
                                                       onDragEnter={(e) => handleCellDragEnter(e, rowKey, absDIdx, pIdx, blockSize)}
                                                       onDragLeave={handleCellDragLeave}
                                                       onDragOver={(e) => handleCellDragOver(e, rowKey, absDIdx, pIdx, blockSize)}
                                                       onDrop={(e) => handleCellDrop(e, rowKey, absDIdx, pIdx, blockSize, cellVal)}>
                                                       <div draggable onDragStart={(e) => handleDragStart(e, rowKey, absDIdx, pIdx, cellVal, blockSize)} onDragEnd={handleDragEnd}
                                                            title={conflictTooltip}
                                                            tabIndex={0}
                                                            className={`h-full w-full min-h-[46px] md:min-h-[54px] p-1 flex flex-col justify-between items-center relative group/cell transition-all select-none outline-none ${cClass} border-l-[3.5px] ${blockSize >= 2 ? "rounded-lg shadow-sm" : "rounded-[3px]"} ${hasConflict ? "ring-2 ring-red-500 ring-inset border-2 border-red-600 shadow-md shadow-red-200/60 bg-red-50/95" : ""} ${isLocked ? "ring-1 ring-amber-400/80 ring-inset" : ""} ${isSelectedForSwap ? 'ring-2 ring-blue-500 shadow-blue-200 bg-blue-50/50' : ''} cursor-grab hover:shadow-md hover:brightness-[0.98] active:cursor-grabbing`}>
                                                          
                                                          {/* Top Badges / Indicators */}
                                                           <div className="w-full flex items-center justify-between gap-1 leading-none px-0.5">
                                                              {hasConflict ? (
                                                                 <span className="bg-red-600 text-white rounded-full p-0.5 shadow-sm flex items-center justify-center animate-pulse shrink-0" title={conflictTooltip}>
                                                                    <AlertTriangle className="w-2.5 h-2.5" />
                                                                 </span>
                                                              ) : isLocked ? (
                                                                 <span className="bg-amber-100/90 text-amber-800 rounded px-1 py-0.5 text-[8px] font-bold flex items-center gap-0.5 shadow-2xs shrink-0" title="Kilitli Kart">
                                                                    <Lock className="w-2.5 h-2.5" />
                                                                 </span>
                                                              ) : (
                                                                 <span className="opacity-0 w-2.5"></span>
                                                              )}

                                                              {blockSize >= 2 && (
                                                                 <span className="text-[8px] font-extrabold bg-slate-900/10 text-slate-800 px-1 py-0.2 rounded-full tracking-tight shrink-0">
                                                                    {blockSize}s Blok
                                                                 </span>
                                                              )}
                                                           </div>

                                                           {/* Main Subject & Class/Teacher Typography */}
                                                           <div className="w-full flex flex-col items-center justify-center my-auto text-center px-0.5">
                                                              <span className={`font-black tracking-tight text-slate-900 leading-tight truncate w-full ${blockSize >= 2 ? "text-[11px] md:text-xs" : "text-[9.5px] md:text-[11px]"}`} title={topText}>
                                                                 {topText}
                                                              </span>
                                                              <span className="font-semibold text-[8.5px] md:text-[9.5px] text-slate-700 mt-0.5 truncate w-full tracking-tight opacity-90" title={bottomText}>
                                                                 {bottomText}
                                                              </span>
                                                           </div>

                                                           {/* Subtext / Room Badge */}
                                                           {subText && (
                                                              <div className="w-full flex justify-center mt-0.5">
                                                                 <span className="text-[7.5px] md:text-[8px] font-bold bg-white/80 backdrop-blur-xs text-slate-500 px-1 py-0.2 rounded border border-slate-300/40 truncate max-w-full">
                                                                    {subText}
                                                                 </span>
                                                              </div>
                                                           )}
                                                           
                                                           {/* Hover Action Overlay */}
                                                           {(
                                                             <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[0.5px] opacity-0 group-hover/cell:opacity-100 transition-opacity rounded-[3px] flex items-center justify-center gap-1.5 pointer-events-none z-20" tabIndex={0}>
                                                                 {/* Universal Hover/Tap Overlay */}
                                                                 <button className="pointer-events-auto p-2 md:p-1.5 bg-white rounded-md text-slate-700 hover:text-blue-600 active:scale-95 shadow-sm transition-all hover:scale-110 transition-transform" title="Kartı Düzenle" onPointerDown={(e) => { e.stopPropagation(); editPoolCard({...cData, hours: blockSize}); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()}><Edit2 className="w-4 h-4 md:w-3 md:h-3"/></button>
                                                                 <button className={`pointer-events-auto p-2 md:p-1.5 bg-white rounded-md ${isLocked ? "text-amber-600 hover:text-slate-700" : "text-slate-700 hover:text-amber-600"} active:scale-95 shadow-sm transition-all`} title={isLocked ? "Kilidi Aç" : "Kilitle"} onPointerDown={(e) => toggleLock(e, lockEntity, absDIdx, pIdx, blockSize)} onClick={(e) => e.stopPropagation()}>
                                                                    {isLocked ? <Unlock className="w-4 h-4 md:w-3 md:h-3" /> : <Lock className="w-4 h-4 md:w-3 md:h-3"/>}
                                                                 </button>
                                                             </div>
                                                           )}
                                                        </div>
                                                    </td>
                                               );
                                               pIdx += blockSize;
                                           } else {
                                               const hData = heatmapOverlayActive ? getSlotHeatmapData(absDIdx, pIdx) : null;
                                               const hColor = hData ? getHeatmapColor(hData.activeIntensity, heatmapOverlayOpacity) : null;

                                               cells.push(
                                                    <td key={`${rowKey}-${absDIdx}-${pIdx}`} 
                                                        className={`border-r border-slate-200 p-0 relative transition-colors duration-150 ${isClosed ? "bg-red-50" : "bg-white hover:bg-slate-50"} `}
                                                        style={heatmapOverlayActive && !isClosed && hColor ? { backgroundColor: hColor.bg } : {}}
                                                        onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, "", 1, isClosed)}
                                                        onMouseEnter={() => { if (heatmapOverlayActive) setHighlightedHeatmapPeriod({ dayId: absDIdx, pIdx }); }}
                                                        onMouseLeave={() => {
                                                           if (heatmapOverlayActive) {
                                                              setHighlightedHeatmapPeriod(null);
                                                           }
                                                        }}
                                                        
                                                        
                                                        
                                                        onDragEnter={(e) => handleCellDragEnter(e, rowKey, absDIdx, pIdx, 1)}
                                                       onDragLeave={handleCellDragLeave}
                                                       onDragOver={(e) => handleCellDragOver(e, rowKey, absDIdx, pIdx, 1)}
                                                       onDrop={(e) => handleCellDrop(e, rowKey, absDIdx, pIdx, 1, "")}>
                                                      <div className="h-full w-full min-h-[44px] md:min-h-[52px] flex flex-col items-center justify-center text-slate-300 relative group/empty">
                                                          {isClosed ? <Ban className="w-4 h-4 text-red-300"/> : "·"}
                                                          
                                                          {/* Heatmap Cell Tooltip */}
                                                          {heatmapOverlayActive && !isClosed && hData && (
                                                             <div className="absolute top-0 right-0 p-0.5 opacity-60">
                                                                <span className={`text-[8px] font-black ${hColor?.text}`}>{hData.activeIntensity}%</span>
                                                             </div>
                                                          )}
                                                      </div>
                                                   </td>
                                               );
                                               pIdx++;
                                           }
                                       }
                                       return cells;
                                    })}
                                 </tr>
                               );
                            });
                         })()}
                      </tbody>
                   </table>
                   {/* MOBILE VIEW */}
                   <div className="block md:hidden pb-12">
                       <div className="flex overflow-x-auto gap-1.5 pb-2 mb-3 snap-x hide-scrollbar py-0.5">
                           {schoolSettings.weekDays.filter(d => d.active).map(d => (
                               <button
                                   key={d.id}
                                   onClick={() => setMobileSelectedDay(d.id)}
                                   className={`snap-center shrink-0 min-h-[40px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-2xs transition-all active:scale-95 touch-manipulation ${
                                       (mobileSelectedDay || schoolSettings.weekDays.filter(day => day.active)[0]?.id) === d.id
                                           ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/40 shadow-sm'
                                           : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                                   }`}
                               >
                                   {d.name}
                               </button>
                           ))}
                       </div>
                       <div className="flex flex-col gap-3">
                           {(() => {
                               const dataMaster = previewType === 'teacher' ? schedules : previewType === 'class' ? classSchedules : previewType === 'room' ? roomSchedules : subjectSchedules;
                               const rowKeys = previewType === 'teacher' ? teachers : previewType === 'class' ? classes : previewType === 'room' ? rooms : subjects;
                               const activeDays = schoolSettings.weekDays.filter(d => d.active);
                               const selectedDayObj = activeDays.find(d => d.id === (mobileSelectedDay || activeDays[0]?.id));
                               if (!selectedDayObj) return null;
                               const absDIdx = selectedDayObj.id - 1;

                               return rowKeys.map(rowKey => {
                                   const unplacedCount = unplacedCourses.filter(c => {
                                       if (previewType === 'teacher') return c.teachers.includes(rowKey);
                                       if (previewType === 'class') return c.classes.includes(rowKey);
                                       if (previewType === 'room') return c.rooms?.includes(rowKey);
                                       if (previewType === 'subject') return c.subject === rowKey;
                                       return false;
                                   }).length;
                                   
                                   const isHighlighted = highlightedEntity === rowKey;

                                   return (
                                       <div 
                                           key={rowKey} 
                                           className={`bg-white rounded-2xl shadow-xs border overflow-hidden flex flex-col transition-all mb-1 ${isHighlighted ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-200/90'}`}
                                           onClick={() => { setConstraintTargets([]); setShowConstraintTargets(false); setConstraintModal({ type: previewType === 'subject' ? 'subjects' : previewType, name: rowKey }); setModalPoolForm({ editingBlock: null, teachers: previewType === 'teacher' ? [rowKey] : [], classes: previewType === 'class' ? [rowKey] : [], rooms: previewType === 'room' ? [rowKey] : [], subject: previewType === 'subject' ? rowKey : '', format: '2', editingId: null }); }}
                                       >
                                           <div className="bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/80 px-3.5 py-2.5 flex justify-between items-center sticky top-0 z-10">
                                               <span className="font-extrabold text-indigo-800 text-sm tracking-tight">{rowKey}</span>
                                               {unplacedCount > 0 && (
                                                   <span className="bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs">
                                                       {unplacedCount} Bekleyen
                                                   </span>
                                               )}
                                           </div>
                                           <div className="flex flex-col divide-y divide-slate-100">
                                               {(() => {
                                                   let pIdx = 0;
                                                   const cells = [];
                                                   while (pIdx < selectedDayObj.periods) {
                                                       const cellVal = dataMaster[rowKey]?.[absDIdx]?.[pIdx];
                                                       const cData = cellVal ? parseCellData(cellVal) : null;
                                                       
                                                       let isClosed = false;
                                                       if (previewType === "teacher") isClosed = constraints.teachers[rowKey]?.includes(`${absDIdx}-${pIdx}`);
                                                       else if (previewType === "class") isClosed = constraints.classes[rowKey]?.includes(`${absDIdx}-${pIdx}`);
                                                       else if (previewType === "room") isClosed = constraints.rooms[rowKey]?.includes(`${absDIdx}-${pIdx}`);
                                                       else if (previewType === "subject") isClosed = constraints.subjects[rowKey]?.includes(`${absDIdx}-${pIdx}`);

                                                       if (cData && cellVal !== "") {
                                                           let blockSize = 1;
                                                           while (pIdx + blockSize < selectedDayObj.periods && dataMaster[rowKey]?.[absDIdx]?.[pIdx + blockSize] === cellVal) {
                                                               blockSize++;
                                                           }

                                                           let topText = "";
                                                           let bottomText = "";
                                                           let subText = "";

                                                           if (previewType === "teacher") {
                                                               topText = cData.classes.join(", ");
                                                               bottomText = cData.subject;
                                                               subText = cData.rooms?.length > 0 ? cData.rooms.join(", ") : "";
                                                           } else if (previewType === "class") {
                                                               topText = cData.teachers.join(", ");
                                                               bottomText = cData.subject;
                                                               subText = cData.rooms?.length > 0 ? cData.rooms.join(", ") : "";
                                                           } else if (previewType === "room") {
                                                               topText = cData.teachers.join(", ");
                                                               bottomText = cData.classes.join(", ");
                                                               subText = cData.subject;
                                                           } else if (previewType === "subject") {
                                                               topText = cData.teachers.join(", ");
                                                               bottomText = cData.classes.join(", ");
                                                               subText = cData.rooms?.length > 0 ? cData.rooms.join(", ") : "";
                                                           }

                                                           const isSelectedForSwap = mobileSelectedForSwap && mobileSelectedForSwap.sourceEntity === rowKey && mobileSelectedForSwap.sourceDIdx === absDIdx && mobileSelectedForSwap.sourcePIdx === pIdx;
                                                           cells.push(
                                                               <div key={pIdx} className={`flex min-h-[64px] cursor-pointer transition-all active:bg-slate-50 touch-manipulation ${isSelectedForSwap ? 'bg-indigo-50/70' : ''}`} onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, cellVal, blockSize, isClosed)}>
                                                                   <div className="w-14 shrink-0 bg-slate-50/80 flex flex-col items-center justify-center text-[11px] font-bold text-slate-500 border-r border-slate-100 py-2 gap-0.5">
                                                                       <span className="bg-white shadow-2xs px-1.5 rounded-md border border-slate-200 text-slate-700">{pIdx+1}</span>
                                                                       {blockSize > 1 && <span className="text-[9px] text-slate-400">-{pIdx+blockSize-1}</span>}
                                                                       <span className="text-[9px] font-normal mt-0.5 text-slate-400">{schoolSettings.lessonTimes[pIdx].start}</span>
                                                                   </div>
                                                                   <div className="flex-1 p-2 flex">
                                                                       <div className={`w-full rounded-xl p-2.5 flex flex-col justify-center border-l-[3.5px] bg-white ring-1 ring-slate-200/80 transition-all ${isClosed ? 'border-l-rose-500' : 'border-l-indigo-600'} ${isSelectedForSwap ? 'ring-2 ring-indigo-500 shadow-md shadow-indigo-100 bg-indigo-50/40 animate-pulse' : 'shadow-2xs'}`}>
                                                                           <div className="font-bold text-indigo-900 text-xs leading-tight mb-0.5">{topText}</div>
                                                                           <div className="text-[11px] font-semibold text-slate-600 truncate">{bottomText}</div>
                                                                           {subText && <div className="text-[10px] text-slate-400 mt-1 truncate">{subText}</div>}
                                                                       </div>
                                                                   </div>
                                                               </div>
                                                           );
                                                           pIdx += blockSize;
                                                       } else {
                                                           cells.push(
                                                               <div key={pIdx} className="flex min-h-[48px] cursor-pointer touch-manipulation" onClick={(e) => handleCellClick(e, rowKey, absDIdx, pIdx, "", 1, isClosed)}>
                                                                   <div className="w-14 shrink-0 bg-slate-50/80 flex flex-col items-center justify-center text-[11px] font-bold text-slate-400 border-r border-slate-100 py-1">
                                                                       <span>{pIdx+1}</span>
                                                                       <span className="text-[8px] font-normal text-slate-400">{schoolSettings.lessonTimes[pIdx].start}</span>
                                                                   </div>
                                                                   <div className="flex-1 p-1.5 flex items-center justify-center">
                                                                       {isClosed ? (
                                                                           <div className="w-full h-full min-h-[38px] rounded-xl border border-rose-200/80 bg-rose-50/70 flex items-center justify-center text-rose-500 text-[10px] font-bold">Kapalı (Kısıt)</div>
                                                                       ) : (
                                                                           <div className="w-full h-full min-h-[38px] rounded-xl border border-dashed border-slate-200 bg-slate-50/40 flex items-center justify-center text-slate-400 text-[11px] font-medium hover:bg-indigo-50/50 active:bg-indigo-100/50 transition-colors">Boş</div>
                                                                       )}
                                                                   </div>
                                                               </div>
                                                           );
                                                           pIdx++;
                                                       }
                                                   }
                                                   return cells;
                                               })()}
                                           </div>
                                       </div>
                                   );
                               });
                           })()}
                       </div>
                   </div>
                </div>
             </div>
          </div>
        ) : mainTab === 'preview' ? (
          <div key={workspaceKey + '_prev'} className="h-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-0">
             <ExportReportingModal
                 isOpen={true}
                 isInline={true}
                 onClose={() => {}}
                 schedules={schedules}
                 classSchedules={classSchedules}
                 teachers={teachers}
                 classes={classes}
                 schoolInfo={schoolInfo}
                 schoolSettings={schoolSettings}
             />
          </div>
        ) : mainTab === 'duty' ? (
          <div key={workspaceKey} className="h-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-1 sm:p-4 md:p-6 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">
             <DutyManager teachers={teachers} schedules={schedules} schoolSettings={schoolSettings} />
          </div>
        ) : (
          renderSettings()
        )}
      </div>
      <div className="hidden md:flex bg-[#111827] border-t border-slate-800 px-4 py-2 flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-medium shrink-0 gap-1 relative z-[60]">
        <div>
          <span>Kuantum Pro © {new Date().getFullYear()}</span>
        </div>
        <div>
          <span>Powered by <strong className="text-indigo-400">Kumcu</strong></span>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] z-[100] grid grid-cols-3 items-center px-3 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('matrix'); }} className="hidden">Dağıtım</button>
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('preview'); }} className={`flex flex-col items-center justify-center gap-1 w-full min-h-[46px] py-1 px-2 rounded-xl transition-all active:scale-95 touch-manipulation ${mainTab === 'preview' ? 'text-indigo-600 bg-indigo-50/90 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}>
           <Eye className={`w-5 h-5 transition-transform ${mainTab === 'preview' ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`}/>
           <span className="text-[11px] font-bold tracking-tight">Önizleme</span>
         </button>
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('duty'); }} className={`flex flex-col items-center justify-center gap-1 w-full min-h-[46px] py-1 px-2 rounded-xl transition-all active:scale-95 touch-manipulation ${mainTab === 'duty' ? 'text-indigo-600 bg-indigo-50/90 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}>
           <ClipboardCheck className={`w-5 h-5 transition-transform ${mainTab === 'duty' ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`}/>
           <span className="text-[11px] font-bold tracking-tight">Nöbet</span>
         </button>
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('settings'); }} className={`flex flex-col items-center justify-center gap-1 w-full min-h-[46px] py-1 px-2 rounded-xl transition-all active:scale-95 touch-manipulation ${mainTab === 'settings' ? 'text-indigo-600 bg-indigo-50/90 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}>
           <Settings className={`w-5 h-5 transition-transform ${mainTab === 'settings' ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`}/>
           <span className="text-[11px] font-bold tracking-tight">Ayarlar</span>
         </button>
      </div>

      {/* Mobile Quick Action Bottom Sheet */}
      <MobileQuickActionSheet
        target={mobileQuickActionTarget}
        onClose={() => setMobileQuickActionTarget(null)}
        onStartMove={(target) => {
          setMobileMovingCard(target);
          showToast(`${target.cardData.subject} için hedef saate dokunun.`);
        }}
        onToggleLock={(entity, dIdx, pIdx) => handleMobileToggleLock(entity, dIdx, pIdx)}
        onSendToPool={(target) => handleMobileSendToPool(target)}
        onInspect={(target) => {
          setConstraintTargets([]);
          setShowConstraintTargets(false);
          setConstraintModal({ 
            type: target.entityType === 'room' ? 'rooms' : target.entityType === 'class' ? 'classes' : 'teachers', 
            name: target.entityName 
          });
        }}
      />

      {/* PWA Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default App;