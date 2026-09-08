import React, { useState, useMemo } from 'react';
import { 
  MapPin, Plus, Trash2, Users, Calendar, AlertCircle, 
  Save, X, ShieldCheck, UserCheck, Search, RotateCcw, 
  FileText, Edit, Check, ArrowUp, ArrowDown, Sparkles, 
  CheckCircle2, Info, ChevronRight, Sliders, Briefcase,
  AlertTriangle, Award
} from 'lucide-react';

interface DutySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dutyLocations: string[];
  setDutyLocations: React.Dispatch<React.SetStateAction<string[]>>;
  dutyAssignments: Record<string, string[]>;
  setDutyAssignments: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  lockedDutyAssignments?: Record<string, string[]>;
  setLockedDutyAssignments?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  exemptTeachers: string[];
  setExemptTeachers: React.Dispatch<React.SetStateAction<string[]>>;
  dutyAdmins: string[];
  setDutyAdmins: React.Dispatch<React.SetStateAction<string[]>>;
  adminRoles: Record<string, string>;
  setAdminRoles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  adminSchedule: Record<number, string>;
  setAdminSchedule: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  generalRules: string;
  setGeneralRules: React.Dispatch<React.SetStateAction<string>>;
  attentionRules: string;
  setAttentionRules: React.Dispatch<React.SetStateAction<string>>;
  principalName: string;
  setPrincipalName: React.Dispatch<React.SetStateAction<string>>;
  principalTitle: string;
  setPrincipalTitle: React.Dispatch<React.SetStateAction<string>>;
  teachers: string[];
  schedules: any;
  activeDays: Array<{ id: number; name: string }>;
  onSaveAll: () => void;
  setSuccessMessage: (msg: string) => void;
  initialTab?: 'locations' | 'staff' | 'adminSchedule' | 'rules' | 'preview';
  previewContent?: React.ReactNode;
}

export default function DutySettingsModal({
  isOpen,
  onClose,
  dutyLocations = [],
  setDutyLocations,
  dutyAssignments = {},
  setDutyAssignments,
  lockedDutyAssignments = {},
  setLockedDutyAssignments,
  exemptTeachers = [],
  setExemptTeachers,
  dutyAdmins = [],
  setDutyAdmins,
  adminRoles = {},
  setAdminRoles,
  adminSchedule = {},
  setAdminSchedule,
  generalRules = '',
  setGeneralRules,
  attentionRules = '',
  setAttentionRules,
  principalName = '',
  setPrincipalName,
  principalTitle = '',
  setPrincipalTitle,
  teachers = [],
  schedules = {},
  activeDays = [],
  onSaveAll = () => {},
  setSuccessMessage = () => {},
  initialTab = 'locations',
  previewContent
}: DutySettingsModalProps) {
  const [modalTab, setModalTab] = useState<'locations' | 'staff' | 'adminSchedule' | 'rules' | 'preview'>(initialTab);

  // Locations state
  const [newLoc, setNewLoc] = useState('');
  const [editingLoc, setEditingLoc] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState('');

  // Staff state (unified exemptions & admin management)
  const [staffSearch, setStaffSearch] = useState('');
  const [staffFilter, setStaffFilter] = useState<'all' | 'active' | 'exempt' | 'admin'>('all');
  const [newExternalAdmin, setNewExternalAdmin] = useState('');
  const [newExternalRole, setNewExternalRole] = useState('Müdür Yardımcısı');

  // Admin schedule state
  const [adminStartTeacher, setAdminStartTeacher] = useState<string>('');

  // Rules state
  const [rulesMobileTab, setRulesMobileTab] = useState<'general' | 'attention' | 'signature'>('general');

  // --- LOCATION HELPERS ---
  const addLocation = () => {
    const trimmed = newLoc.trim().toUpperCase();
    if (trimmed && !dutyLocations.includes(trimmed)) {
      setDutyLocations([...dutyLocations, trimmed]);
      setNewLoc('');
      setSuccessMessage(`"${trimmed}" nöbet bölgesi eklendi.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const removeLocation = (loc: string) => {
    setDutyLocations(dutyLocations.filter(l => l !== loc));
    const nextAssignments = { ...dutyAssignments };
    const nextLocked = setLockedDutyAssignments ? { ...lockedDutyAssignments } : null;
    activeDays.forEach(day => {
      const key = `${loc}_${day.id}`;
      delete nextAssignments[key];
      if (nextLocked && nextLocked[key]) {
        delete nextLocked[key];
      }
    });
    setDutyAssignments(nextAssignments);
    if (setLockedDutyAssignments && nextLocked) {
      setLockedDutyAssignments(nextLocked);
      localStorage.setItem('ataturk_duty_locked_assignments', JSON.stringify(nextLocked));
    }
    setSuccessMessage(`"${loc}" nöbet bölgesi silindi.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const renameLocation = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim().toUpperCase();
    if (!trimmedNew || trimmedNew === oldName) {
      setEditingLoc(null);
      return;
    }
    if (dutyLocations.includes(trimmedNew)) {
      alert("Bu isimde bir nöbet bölgesi zaten var!");
      return;
    }
    setDutyLocations(dutyLocations.map(l => l === oldName ? trimmedNew : l));
    const nextAssignments = { ...dutyAssignments };
    const nextLocked = setLockedDutyAssignments ? { ...lockedDutyAssignments } : null;
    activeDays.forEach(day => {
      const oldKey = `${oldName}_${day.id}`;
      const newKey = `${trimmedNew}_${day.id}`;
      if (nextAssignments[oldKey] !== undefined) {
        nextAssignments[newKey] = nextAssignments[oldKey];
        delete nextAssignments[oldKey];
      }
      if (nextLocked && nextLocked[oldKey] !== undefined) {
        nextLocked[newKey] = nextLocked[oldKey];
        delete nextLocked[oldKey];
      }
    });
    setDutyAssignments(nextAssignments);
    if (setLockedDutyAssignments && nextLocked) {
      setLockedDutyAssignments(nextLocked);
      localStorage.setItem('ataturk_duty_locked_assignments', JSON.stringify(nextLocked));
    }
    setEditingLoc(null);
    setSuccessMessage(`Bölge adı "${trimmedNew}" olarak güncellendi.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const moveLocationUp = (idx: number) => {
    if (idx <= 0) return;
    const nextList = [...dutyLocations];
    const temp = nextList[idx - 1];
    nextList[idx - 1] = nextList[idx];
    nextList[idx] = temp;
    setDutyLocations(nextList);
  };

  const moveLocationDown = (idx: number) => {
    if (idx >= dutyLocations.length - 1) return;
    const nextList = [...dutyLocations];
    const temp = nextList[idx + 1];
    nextList[idx + 1] = nextList[idx];
    nextList[idx] = temp;
    setDutyLocations(nextList);
  };

  // --- STAFF (EXEMPTION & ADMIN) HELPERS ---
  const toggleExemption = (teacher: string) => {
    if (exemptTeachers.includes(teacher)) {
      setExemptTeachers(exemptTeachers.filter(t => t !== teacher));
      setSuccessMessage(`${teacher} muafiyeti kaldırıldı (nöbet tutabilir).`);
    } else {
      setExemptTeachers([...exemptTeachers, teacher]);
      // Remove this teacher from any current duty assignments
      const nextAssignments = { ...dutyAssignments };
      Object.keys(nextAssignments).forEach(key => {
        nextAssignments[key] = (nextAssignments[key] || []).filter((t: string) => t !== teacher);
      });
      setDutyAssignments(nextAssignments);
      setSuccessMessage(`${teacher} nöbetten muaf tutuldu.`);
    }
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const clearAllExemptions = () => {
    if (exemptTeachers.length === 0) return;
    if (window.confirm("Tüm öğretmenlerin muafiyetini kaldırmak istediğinize emin misiniz?")) {
      setExemptTeachers([]);
      setSuccessMessage("Tüm nöbet muafiyetleri kaldırıldı.");
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const toggleAdmin = (teacher: string) => {
    const trimmed = teacher.trim();
    const isCurrentlyAdmin = dutyAdmins.some(a => a.trim().toLowerCase() === trimmed.toLowerCase());
    
    if (isCurrentlyAdmin) {
      setDutyAdmins(dutyAdmins.filter(a => a.trim().toLowerCase() !== trimmed.toLowerCase()));
      // Clean schedule of this admin
      const nextSched = { ...adminSchedule };
      Object.keys(nextSched).forEach(dayId => {
        if (nextSched[Number(dayId)]?.trim().toLowerCase() === trimmed.toLowerCase()) {
          delete nextSched[Number(dayId)];
        }
      });
      setAdminSchedule(nextSched);

      // If the removed admin was the signature authority (principalName)
      if (principalName.trim().toLowerCase() === trimmed.toLowerCase()) {
        const otherPrincipal = dutyAdmins.find(
          a => a.trim().toLowerCase() !== trimmed.toLowerCase() && adminRoles[a] === 'Okul Müdürü'
        );
        if (otherPrincipal) {
          setPrincipalName(otherPrincipal);
          setPrincipalTitle('Okul Müdürü');
        }
      }

      setSuccessMessage(`${trimmed} idareci kadrosundan çıkarıldı.`);
    } else {
      setDutyAdmins([...dutyAdmins, trimmed]);
      setAdminRoles(prev => ({ ...prev, [trimmed]: prev[trimmed] || 'Müdür Yardımcısı' }));
      // Admins are exempt from teacher location duties, clean their duty assignments
      const nextAssignments = { ...dutyAssignments };
      Object.keys(nextAssignments).forEach(key => {
        nextAssignments[key] = (nextAssignments[key] || []).filter((t: string) => t !== trimmed);
      });
      setDutyAssignments(nextAssignments);
      setSuccessMessage(`${trimmed} idareci kadrosuna eklendi.`);
    }
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const updateAdminRole = (adminName: string, role: string) => {
    setAdminRoles(prev => {
      const nextRoles = { ...prev };
      if (role === 'Okul Müdürü') {
        // Okul Müdürü tektir; diğer idareciler 'Müdür Yardımcısı'na çevrilir
        Object.keys(nextRoles).forEach(k => {
          if (nextRoles[k] === 'Okul Müdürü' && k !== adminName) {
            nextRoles[k] = 'Müdür Yardımcısı';
          }
        });
      }
      nextRoles[adminName] = role;
      return nextRoles;
    });

    if (role === 'Okul Müdürü') {
      setPrincipalName(adminName);
      setPrincipalTitle('Okul Müdürü');
      // Okul Müdürü nöbet tutmaz; idareci nöbet çizelgesindeki olası ataması temizlenir
      setAdminSchedule(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(dayId => {
          const numDayId = Number(dayId);
          if (next[numDayId]?.trim().toLowerCase() === adminName.trim().toLowerCase()) {
            delete next[numDayId];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
      setSuccessMessage(`${adminName} Okul Müdürü olarak seçildi (nöbetten muaf) ve otomatik olarak Resmi İmza Yetkilisi tanımlandı.`);
    } else {
      // Eğer bu kişi daha önce imza yetkilisiyse ve rolü müdürlükten çıkarıldıysa
      if (principalName === adminName) {
        const otherDirector = dutyAdmins.find(a => a !== adminName && adminRoles[a] === 'Okul Müdürü');
        if (otherDirector) {
          setPrincipalName(otherDirector);
          setPrincipalTitle('Okul Müdürü');
        }
      }
      setSuccessMessage(`${adminName} unvanı "${role}" olarak güncellendi.`);
    }
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const addExternalAdmin = () => {
    const trimmed = newExternalAdmin.trim();
    if (trimmed && !dutyAdmins.some(a => a.trim().toLowerCase() === trimmed.toLowerCase())) {
      setDutyAdmins([...dutyAdmins, trimmed]);
      setAdminRoles(prev => {
        const nextRoles = { ...prev };
        if (newExternalRole === 'Okul Müdürü') {
          Object.keys(nextRoles).forEach(k => {
            if (nextRoles[k] === 'Okul Müdürü') {
              nextRoles[k] = 'Müdür Yardımcısı';
            }
          });
        }
        nextRoles[trimmed] = newExternalRole;
        return nextRoles;
      });
      if (newExternalRole === 'Okul Müdürü') {
        setPrincipalName(trimmed);
        setPrincipalTitle('Okul Müdürü');
      }
      setNewExternalAdmin('');
      setSuccessMessage(`${trimmed} (${newExternalRole}) idareci kadrosuna eklendi.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // --- ADMIN SCHEDULE HELPERS ---
  // Sadece müdür yardımcıları idareci nöbeti tutar; Okul Müdürü nöbet tutmaz
  const eligibleDutyAdmins = dutyAdmins.filter(adm => {
    const role = adminRoles[adm] || '';
    const isPrincipal = role === 'Okul Müdürü' || (Boolean(principalName) && adm.trim().toLowerCase() === principalName.trim().toLowerCase());
    return !isPrincipal;
  });

  const currentPrincipalAdmin = dutyAdmins.find(adm => {
    const role = adminRoles[adm] || '';
    return role === 'Okul Müdürü' || (Boolean(principalName) && adm.trim().toLowerCase() === principalName.trim().toLowerCase());
  }) || (principalName ? principalName : null);

  const autoAssignAdmins = () => {
    if (eligibleDutyAdmins.length === 0) {
      alert("Nöbet tutacak müdür yardımcısı bulunamadı. Okul müdürleri nöbet tutmaz. Lütfen Personel sekmesinden müdür yardımcısı tanımlayın.");
      return;
    }
    const newSched: Record<number, string> = {};
    let startIdx = 0;
    if (adminStartTeacher && eligibleDutyAdmins.includes(adminStartTeacher)) {
      startIdx = eligibleDutyAdmins.indexOf(adminStartTeacher);
    }
    activeDays.forEach((day, dIdx) => {
      const adminIdx = (startIdx + dIdx) % eligibleDutyAdmins.length;
      newSched[day.id] = eligibleDutyAdmins[adminIdx];
    });
    setAdminSchedule(newSched);
    setSuccessMessage("Müdür yardımcıları günlere sırayla döngüsel olarak atandı.");
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const clearAdminSchedule = () => {
    if (Object.keys(adminSchedule).length === 0) return;
    if (window.confirm("Haftalık idareci nöbet planını temizlemek istediğinize emin misiniz?")) {
      setAdminSchedule({});
      setSuccessMessage("İdareci nöbet planı temizlendi.");
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // --- RULES RESET HELPERS ---
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

  // --- FILTERED STAFF COMPUTATION ---
  // Combine all registered teachers + external admins
  const allStaffList = useMemo(() => {
    const list = [...teachers];
    dutyAdmins.forEach(adm => {
      if (!list.some(t => t.trim().toLowerCase() === adm.trim().toLowerCase())) {
        list.push(adm);
      }
    });
    return list;
  }, [teachers, dutyAdmins]);

  const filteredStaff = useMemo(() => {
    return allStaffList.filter(person => {
      const matchesSearch = person.toLowerCase().includes(staffSearch.toLowerCase());
      if (!matchesSearch) return false;

      const isAdmin = dutyAdmins.some(a => a.trim().toLowerCase() === person.trim().toLowerCase());
      const isExempt = exemptTeachers.includes(person);

      if (staffFilter === 'admin') return isAdmin;
      if (staffFilter === 'exempt') return isExempt && !isAdmin;
      if (staffFilter === 'active') return !isExempt && !isAdmin;
      return true;
    });
  }, [allStaffList, staffSearch, staffFilter, dutyAdmins, exemptTeachers]);

  // Lesson count calculator
  const getWeeklyLessonCount = (teacher: string) => {
    const sched = schedules[teacher];
    if (!sched || !Array.isArray(sched)) return 0;
    let count = 0;
    sched.forEach(day => {
      if (Array.isArray(day)) {
        day.forEach(cell => {
          if (cell) {
            if (typeof cell === 'string') {
              try {
                const card = JSON.parse(cell);
                if (card.classes && card.classes.length > 0) count++;
              } catch {
                if (cell.trim()) count++;
              }
            } else {
              count++;
            }
          }
        });
      }
    });
    return count;
  };

  const handleSaveModal = () => {
    onSaveAll();
    setSuccessMessage("Nöbet ayarları başarıyla kaydedildi!");
    setTimeout(() => setSuccessMessage(''), 3000);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 touch-manipulation">
      <div 
        className="bg-white w-full max-w-5xl h-[100dvh] sm:h-[88vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-200/80 touch-manipulation"
        id="duty-settings-modal-dialog"
      >
        {/* Modal Top Header */}
        <div className="px-3 py-2.5 sm:px-5 sm:py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-2 shrink-0 border-b border-indigo-900/50 touch-manipulation">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 touch-manipulation">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner shrink-0 touch-manipulation">
              <Sliders className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-xs sm:text-lg tracking-tight text-white flex items-center gap-1.5 sm:gap-2 truncate touch-manipulation">
                <span className="truncate">Nöbet Ayarları Merkezi</span>
              </h3>
              <p className="text-[10px] sm:text-xs text-indigo-200/80 font-medium truncate">
                Bölgeler, personel ve kurallar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 touch-manipulation">
            <button 
              onClick={handleSaveModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm active:scale-95 min-h-[38px] sm:min-h-[44px] touch-manipulation shrink-0"
              title="Değişiklikleri Kaydet ve Kapat"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Tümünü Kaydet</span>
              <span className="sm:hidden text-[11px]">Kaydet</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors active:scale-95 min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center touch-manipulation shrink-0"
              title="Kapat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Quick Summary Badge Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto touch-pan-x hide-scrollbar touch-pan-x gap-3 text-xs shrink-0 touch-manipulation">
          <div className="flex items-center gap-3 text-slate-600 font-semibold whitespace-nowrap touch-manipulation">
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs touch-manipulation">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <strong className="text-slate-800">{dutyLocations.length}</strong> Bölge
            </span>
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs touch-manipulation">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <strong className="text-slate-800">{teachers.length}</strong> Öğretmen
            </span>
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs touch-manipulation">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <strong className="text-slate-800">{exemptTeachers.length}</strong> Muaf
            </span>
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs touch-manipulation">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <strong className="text-slate-800">{dutyAdmins.length}</strong> İdareci
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 font-medium touch-manipulation">
            <span>İmza Yetkilisi:</span>
            {principalName ? (
              <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {principalName} ({principalTitle || 'Okul Müdürü'})
              </span>
            ) : (
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Henüz Seçilmedi
              </span>
            )}
          </div>
        </div>

        {/* Modal Unified Tab Navigation */}
        <div className="p-2 sm:p-2.5 bg-slate-50 border-b border-slate-200 shrink-0 touch-manipulation">
          <div className="flex overflow-x-auto touch-pan-x whitespace-nowrap gap-1 sm:gap-1.5 p-1 bg-slate-200/70 rounded-2xl border border-slate-200 shadow-2xs hide-scrollbar touch-pan-x touch-manipulation">
            <button
              onClick={() => setModalTab('locations')}
              className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 min-h-[44px] active:scale-[0.98] shrink-0 touch-manipulation ${
                modalTab === 'locations'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Nöbet Bölgeleri</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-1.5 py-0.2 sm:py-0.5 rounded-full border border-indigo-200/60 shrink-0">
                {dutyLocations.length}
              </span>
            </button>

            <button
              onClick={() => setModalTab('staff')}
              className={`flex-1 min-w-[125px] sm:min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 min-h-[44px] active:scale-[0.98] shrink-0 touch-manipulation ${
                modalTab === 'staff'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Personel<span className="hidden sm:inline"> & Kadro</span></span>
              {exemptTeachers.length > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-700 font-black px-1.5 py-0.2 sm:py-0.5 rounded-full border border-rose-200 shrink-0">
                  {exemptTeachers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setModalTab('adminSchedule')}
              className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 min-h-[44px] active:scale-[0.98] shrink-0 touch-manipulation ${
                modalTab === 'adminSchedule'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span className="truncate">İdareci Nöbeti</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.2 sm:py-0.5 rounded-full border border-amber-200 shrink-0">
                {Object.keys(adminSchedule).length}/{activeDays.length}
              </span>
            </button>

            <button
              onClick={() => setModalTab('rules')}
              className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 min-h-[44px] active:scale-[0.98] shrink-0 touch-manipulation ${
                modalTab === 'rules'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Kurallar & İmza</span>
            </button>
            <button
              onClick={() => setModalTab('preview')}
              className={`flex-1 min-w-[125px] sm:min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 min-h-[44px] active:scale-[0.98] shrink-0 touch-manipulation ${
                modalTab === 'preview'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Çizelge Önizleme</span>
            </button>
          </div>
        </div>

        {/* Modal Main Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar bg-slate-50/50 touch-manipulation">
          
          {/* TAB: PREVIEW */}
          {modalTab === 'preview' && previewContent && (
            <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6 touch-manipulation h-full">
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 flex flex-col h-full touch-manipulation overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 touch-manipulation">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Haftalık Nöbet Çizelgesi Önizlemesi</h4>
                    <p className="text-xs text-slate-500">
                      Ayarlardaki değişikliklerin tabloya yansımasını anında görün. (Tabloyu düzenlemek için bu pencereyi kapatın.)
                    </p>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden pointer-events-none opacity-80">
                  {previewContent}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LOCATIONS */}
          {modalTab === 'locations' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6 touch-manipulation">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col touch-manipulation">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 touch-manipulation">
                  <div className="flex items-center gap-2 touch-manipulation">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 touch-manipulation">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">Nöbet Bölge ve Alanları</h4>
                      <p className="text-xs text-slate-500">
                        Okulunuzdaki nöbet alanlarını belirleyin (Katlar, bahçe, kantin vb.). Sıralama butonlarıyla önceliği ayarlayabilirsiniz.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl self-start sm:self-auto">
                    {dutyLocations.length} Bölge Tanımlı
                  </span>
                </div>

                {/* Add new location bar */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 my-2 touch-manipulation">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Yeni nöbet yeri girin (örn: KANTİN & BAHÇE)..." 
                      value={newLoc}
                      onChange={(e) => setNewLoc(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addLocation(); }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium touch-manipulation h-11 sm:h-10"
                    />
                  </div>
                  <button 
                    onClick={addLocation}
                    disabled={!newLoc.trim()}
                    className="h-11 sm:h-10 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 text-white font-bold px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 shrink-0 touch-manipulation"
                  >
                    <Plus className="w-4 h-4" /> <span>Bölge Ekle</span>
                  </button>
                </div>

                {/* Locations list */}
                <div className="mt-3 flex flex-col gap-2 touch-manipulation">
                  {dutyLocations.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-medium text-sm touch-manipulation flex flex-col items-center justify-center gap-2">
                      <MapPin className="w-8 h-8 text-slate-300" />
                      <span>Tanımlı nöbet bölgesi bulunmuyor. Yukarıdan yeni bölge ekleyin.</span>
                    </div>
                  ) : (
                    dutyLocations.map((loc, idx) => (
                      <div 
                        key={loc} 
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 transition-all shadow-2xs group touch-manipulation gap-2"
                      >
                        {editingLoc === loc ? (
                          <div className="flex items-center gap-2 flex-1 touch-manipulation min-w-0">
                            <input
                              type="text"
                              value={editLocName}
                              onChange={(e) => setEditLocName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') renameLocation(loc, editLocName);
                                if (e.key === 'Escape') setEditingLoc(null);
                              }}
                              autoFocus
                              className="flex-1 bg-white border-2 border-indigo-500 rounded-lg px-3 py-2 sm:py-1.5 text-sm font-bold text-slate-800 focus:outline-none touch-manipulation h-10 min-w-0"
                            />
                            <button
                              onClick={() => renameLocation(loc, editLocName)}
                              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shrink-0 touch-manipulation w-10 h-10 flex items-center justify-center active:scale-95"
                              title="Kaydet"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingLoc(null)}
                              className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors shrink-0 touch-manipulation w-10 h-10 flex items-center justify-center active:scale-95"
                              title="İptal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 touch-manipulation">
                              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-black flex items-center justify-center shrink-0 touch-manipulation">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                                {loc}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 touch-manipulation">
                              <button
                                onClick={() => moveLocationUp(idx)}
                                disabled={idx === 0}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-25 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors touch-manipulation active:scale-95"
                                title="Yukarı Taşı"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveLocationDown(idx)}
                                disabled={idx === dutyLocations.length - 1}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-25 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors touch-manipulation active:scale-95"
                                title="Aşağı Taşı"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingLoc(loc);
                                  setEditLocName(loc);
                                }} 
                                className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ml-0.5 touch-manipulation active:scale-95"
                                title="İsmi Düzenle"
                              >
                                <Edit className="w-4 h-4"/>
                              </button>
                              <button 
                                onClick={() => {
                                  if (window.confirm(`"${loc}" nöbet bölgesini silmek istediğinize emin misiniz?`)) {
                                    removeLocation(loc);
                                  }
                                }} 
                                className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 w-8 h-8 flex items-center justify-center rounded-lg transition-colors touch-manipulation active:scale-95"
                                title="Bölgeyi Sil"
                              >
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNIFIED STAFF & ROLES (EXEMPTIONS + ADMINS) */}
          {modalTab === 'staff' && (
            <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6 touch-manipulation">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col touch-manipulation">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 touch-manipulation">
                  <div className="flex items-center gap-2 touch-manipulation">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 touch-manipulation">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">Personel & Nöbet Kadro Durumu</h4>
                      <p className="text-xs text-slate-500">
                        Her personelin nöbet muafiyetini veya idareci statüsünü tek ekrandan anında yönetin.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto touch-manipulation">
                    {exemptTeachers.length > 0 && (
                      <button
                        onClick={clearAllExemptions}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-all flex items-center gap-1 active:scale-95 touch-manipulation"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Tüm Muafiyetleri Kaldır
                      </button>
                    )}
                  </div>
                </div>

                {/* Add External Admin Form Banner */}
                <div className="mb-4 bg-amber-50/50 p-3 sm:p-3.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 touch-manipulation">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 touch-manipulation">
                    <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Öğretmen Listesinde Olmayan İdareci Ekle:</span>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto touch-manipulation">
                    <input 
                      type="text" 
                      placeholder="Ad Soyad..." 
                      value={newExternalAdmin}
                      onChange={(e) => setNewExternalAdmin(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addExternalAdmin(); }}
                      className="bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1 sm:w-44 touch-manipulation font-semibold text-slate-800"
                    />
                    <select
                      value={newExternalRole}
                      onChange={(e) => setNewExternalRole(e.target.value)}
                      className="bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 touch-manipulation cursor-pointer"
                    >
                      <option value="Müdür Yardımcısı">Müdür Yardımcısı</option>
                      <option value="Müdür Başyardımcısı">Müdür Başyardımcısı</option>
                      <option value="Okul Müdürü">Okul Müdürü</option>
                      <option value="Nöbetçi İdareci">Nöbetçi İdareci</option>
                    </select>
                    <button 
                      onClick={addExternalAdmin}
                      disabled={!newExternalAdmin.trim()}
                      className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 sm:py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 shrink-0 min-h-[38px] sm:min-h-0 touch-manipulation shadow-2xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ekle & Kaydet
                    </button>
                  </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 touch-manipulation">
                  {/* Search input */}
                  <div className="relative flex-1 touch-manipulation">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 touch-manipulation" />
                    <input 
                      type="text" 
                      placeholder="Personel adı ile ara..." 
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {staffSearch && (
                      <button 
                        onClick={() => setStaffSearch('')} 
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 touch-manipulation"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto touch-pan-x hide-scrollbar bg-slate-100 p-1 rounded-xl shrink-0 touch-manipulation">
                    <button
                      onClick={() => setStaffFilter('all')}
                      className={`px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 whitespace-nowrap touch-manipulation rounded-lg text-xs font-bold transition-all ${
                        staffFilter === 'all'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tümü ({allStaffList.length})
                    </button>
                    <button
                      onClick={() => setStaffFilter('active')}
                      className={`px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 whitespace-nowrap touch-manipulation rounded-lg text-xs font-bold transition-all ${
                        staffFilter === 'active'
                          ? 'bg-white text-emerald-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Aktif Nöbetçi ({allStaffList.filter(t => !exemptTeachers.includes(t) && !dutyAdmins.some(a => a.trim().toLowerCase() === t.trim().toLowerCase())).length})
                    </button>
                    <button
                      onClick={() => setStaffFilter('exempt')}
                      className={`px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 whitespace-nowrap touch-manipulation rounded-lg text-xs font-bold transition-all ${
                        staffFilter === 'exempt'
                          ? 'bg-white text-rose-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Muaf ({exemptTeachers.length})
                    </button>
                    <button
                      onClick={() => setStaffFilter('admin')}
                      className={`px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 whitespace-nowrap touch-manipulation rounded-lg text-xs font-bold transition-all ${
                        staffFilter === 'admin'
                          ? 'bg-white text-amber-800 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      İdareci ({dutyAdmins.length})
                    </button>
                  </div>
                </div>

                {/* Staff List */}
                <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1 touch-manipulation">
                  {filteredStaff.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200 touch-manipulation">
                      Aramanıza uygun personel bulunamadı.
                    </div>
                  ) : (
                    filteredStaff.map(person => {
                      const isAdmin = dutyAdmins.some(a => a.trim().toLowerCase() === person.trim().toLowerCase());
                      const isExempt = exemptTeachers.includes(person);
                      const lessonCount = getWeeklyLessonCount(person);
                      const currentRole = adminRoles[person] || 'Müdür Yardımcısı';
                      const isPrincipal = isAdmin && currentRole === 'Okul Müdürü';

                      return (
                        <div 
                          key={person}
                          className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isPrincipal
                              ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300/60 shadow-2xs'
                              : isAdmin 
                              ? 'bg-amber-50/50 border-amber-200/80 shadow-2xs'
                              : isExempt
                              ? 'bg-rose-50/40 border-rose-200/80'
                              : 'bg-white border-slate-200 hover:border-indigo-200'
                          }`}
                        >
                          {/* Person Info */}
                          <div className="flex items-center gap-3 min-w-0 touch-manipulation">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              isPrincipal
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                                : isAdmin 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : isExempt 
                                ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isPrincipal ? (
                                <Award className="w-4 h-4 text-emerald-700" />
                              ) : isAdmin ? (
                                <UserCheck className="w-4 h-4" />
                              ) : isExempt ? (
                                <ShieldCheck className="w-4 h-4" />
                              ) : (
                                person.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 touch-manipulation">
                                <span className={`font-bold text-sm truncate ${isExempt ? 'text-rose-900 line-through' : 'text-slate-800'}`}>
                                  {person}
                                </span>
                                {isAdmin && (
                                  isPrincipal ? (
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      OKUL MÜDÜRÜ (İMZA YETKİLİSİ)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                                      İDARECİ
                                    </span>
                                  )
                                )}
                                {isExempt && !isAdmin && (
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                                    MUAF
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 touch-manipulation">
                                {lessonCount > 0 ? (
                                  <span>{lessonCount} Saat Ders</span>
                                ) : (
                                  <span>Programda dersi yok</span>
                                )}
                                {isAdmin && (
                                  <span className={isPrincipal ? 'text-emerald-700 font-bold' : 'text-amber-700 font-medium'}>
                                    • {isPrincipal ? 'Resmi İmza Yetkilisi • Nöbet bölgelerinden muaftır' : 'Nöbet bölgelerinden muaftır'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions (Dual controls: Exemption & Admin Role) */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto touch-manipulation">
                            {/* Role selector if admin */}
                            {isAdmin ? (
                              <div className="flex items-center gap-1.5 touch-manipulation">
                                <select
                                  value={currentRole}
                                  onChange={e => updateAdminRole(person, e.target.value)}
                                  className={`text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                                    isPrincipal
                                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 focus:ring-emerald-500 font-extrabold'
                                      : 'bg-white text-slate-800 border border-amber-300 focus:ring-amber-500'
                                  }`}
                                  title="İdareci rolünü belirleyin (Okul Müdürü seçilirse otomatik olarak Resmi İmza Yetkilisi yapılır)"
                                >
                                  <option value="Müdür Yardımcısı">Müdür Yardımcısı</option>
                                  <option value="Müdür Başyardımcısı">Müdür Başyardımcısı</option>
                                  <option value="Okul Müdürü">Okul Müdürü (İmza Yetkilisi)</option>
                                  <option value="Nöbetçi İdareci">Nöbetçi İdareci</option>
                                </select>
                                {!isPrincipal && (
                                  <button
                                    onClick={() => updateAdminRole(person, 'Okul Müdürü')}
                                    className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 touch-manipulation"
                                    title="Bu idareciyi Okul Müdürü ve İmza Yetkilisi yap"
                                  >
                                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                                    <span className="hidden sm:inline">Müdür Yap</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleAdmin(person)}
                                  className="text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors touch-manipulation"
                                  title="İdarecilikten Çıkar"
                                >
                                  İdareciliği Kaldır
                                </button>
                              </div>
                            ) : (
                              <>
                                {/* Make Admin Button */}
                                <button
                                  onClick={() => toggleAdmin(person)}
                                  className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 touch-manipulation"
                                  title="İdareci Kadrosuna Ekle"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                                  <span>İdareci Yap</span>
                                </button>

                                {/* Exemption Toggle Button */}
                                <button
                                  onClick={() => toggleExemption(person)}
                                  className={`text-xs font-bold px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 touch-manipulation ${isExempt ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300' : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200'}`}
                                  title={isExempt ? "Muafiyeti Kaldır (Nöbet Tutabilir)" : "Nöbetten Muaf Tut"}
                                >
                                  <ShieldCheck className={`w-3.5 h-3.5 ${isExempt ? 'text-rose-600' : 'text-slate-400'}`} />
                                  <span>{isExempt ? 'Muafiyeti Kaldır' : 'Muaf Tut'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DAILY ADMIN SCHEDULE */}
          {modalTab === 'adminSchedule' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6 touch-manipulation">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col touch-manipulation">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 touch-manipulation">
                  <div className="flex items-center gap-2 touch-manipulation">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 touch-manipulation">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">Günlük İdareci Nöbet Dağıtımı</h4>
                      <p className="text-xs text-slate-500">
                        Haftalık günlere nöbetçi idarecileri atayın veya otomatik sırayla dağıtın.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto touch-manipulation">
                    <button
                      onClick={autoAssignAdmins}
                      className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[40px] sm:min-h-0 touch-manipulation"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Sırayla Otomatik Ata
                    </button>
                    {Object.keys(adminSchedule).length > 0 && (
                      <button
                        onClick={clearAdminSchedule}
                        className="flex-1 sm:flex-none justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2.5 sm:py-2 rounded-xl border border-rose-200 transition-all flex items-center gap-1 active:scale-95 min-h-[40px] sm:min-h-0 touch-manipulation"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Temizle
                      </button>
                    )}
                  </div>
                </div>

                {/* Rotation info strip */}
                <div className="mb-5 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 touch-manipulation">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 touch-manipulation">
                    <div className="flex items-center gap-2 touch-manipulation">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">
                        Nöbetçi İdareci Kadrosu ({eligibleDutyAdmins.length}):
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 ml-0 sm:ml-1 touch-manipulation">
                      {eligibleDutyAdmins.length === 0 ? (
                        <span className="text-xs text-amber-800 italic">Personel sekmesinden müdür yardımcısı tanımlayın. (Okul Müdürü nöbet tutmaz)</span>
                      ) : (
                        eligibleDutyAdmins.map(adm => (
                          <span key={adm} className="text-xs font-bold bg-white text-slate-800 px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
                            {adm}
                            <span className="text-[10px] text-slate-500 font-normal ml-1">({adminRoles[adm] || 'Müdür Yrd.'})</span>
                          </span>
                        ))
                      )}
                      {currentPrincipalAdmin && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1" title="Okul Müdürü nöbet tutmaz">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Okul Müdürü ({currentPrincipalAdmin}) nöbetten muaftır
                        </span>
                      )}
                    </div>
                  </div>

                  {eligibleDutyAdmins.length > 1 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 touch-manipulation self-start sm:self-auto">
                      <span className="font-medium">Başlangıç:</span>
                      <select
                        value={eligibleDutyAdmins.includes(adminStartTeacher) ? adminStartTeacher : ''}
                        onChange={e => setAdminStartTeacher(e.target.value)}
                        className="text-xs font-bold bg-white border border-amber-300 rounded px-2 py-1 text-slate-800 focus:outline-none"
                      >
                        <option value="">İlk İdareci</option>
                        {eligibleDutyAdmins.map(adm => (
                          <option key={adm} value={adm}>{adm}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Day by Day Assignment Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 touch-manipulation">
                  {activeDays.map(day => {
                    const assignedAdmin = adminSchedule[day.id];
                    const adminRole = assignedAdmin ? (adminRoles[assignedAdmin] || 'Müdür Yardımcısı') : '';

                    return (
                      <div 
                        key={day.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                          assignedAdmin 
                            ? 'bg-white border-amber-300 shadow-2xs ring-1 ring-amber-100' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between touch-manipulation">
                          <span className="text-xs font-black text-slate-800 tracking-wide uppercase">
                            {day.name}
                          </span>
                          {assignedAdmin ? (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                              Atandı
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-slate-200/80 text-slate-500 px-2 py-0.5 rounded-full">
                              Boş
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 touch-manipulation">
                          <select
                            value={assignedAdmin || ''}
                            onChange={e => {
                              const val = e.target.value;
                              const nextSched = { ...adminSchedule };
                              if (val) {
                                nextSched[day.id] = val;
                              } else {
                                delete nextSched[day.id];
                              }
                              setAdminSchedule(nextSched);
                            }}
                            className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2.5 sm:p-2 min-h-[42px] sm:min-h-0 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 touch-manipulation"
                          >
                            <option value="">-- İdareci Seçin --</option>
                            {eligibleDutyAdmins.map(adm => (
                              <option key={adm} value={adm}>
                                {adm} {adminRoles[adm] ? `(${adminRoles[adm]})` : ''}
                              </option>
                            ))}
                          </select>

                          {assignedAdmin && (
                            <button
                              onClick={() => {
                                const nextSched = { ...adminSchedule };
                                delete nextSched[day.id];
                                setAdminSchedule(nextSched);
                              }}
                              className="p-2.5 sm:p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 min-h-[42px] min-w-[42px] flex items-center justify-center touch-manipulation"
                              title="Temizle"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {assignedAdmin && (
                          <div className="text-[11px] text-amber-800 font-medium truncate">
                            {adminRole}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: RULES & SIGNATURE */}
          {modalTab === 'rules' && (
            <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6 touch-manipulation">
              
              {/* Mobile sub-switcher for small screens */}
              <div className="sm:hidden bg-slate-200/70 p-1 rounded-xl flex gap-1 border border-slate-200 touch-manipulation">
                <button
                  onClick={() => setRulesMobileTab('general')}
                  className={`flex-1 py-2 sm:py-1.5 px-2 rounded-lg text-[11px] font-bold touch-manipulation min-h-[40px] ${rulesMobileTab === 'general' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'}`}
                >
                  Genel Görevler
                </button>
                <button
                  onClick={() => setRulesMobileTab('attention')}
                  className={`flex-1 py-2 sm:py-1.5 px-2 rounded-lg text-[11px] font-bold touch-manipulation min-h-[40px] ${rulesMobileTab === 'attention' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'}`}
                >
                  Dikkat Edilecekler
                </button>
                <button
                  onClick={() => setRulesMobileTab('signature')}
                  className={`flex-1 py-2 sm:py-1.5 px-2 rounded-lg text-[11px] font-bold touch-manipulation min-h-[40px] ${rulesMobileTab === 'signature' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'}`}
                >
                  İmza Yetkilisi
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 touch-manipulation">
                
                {/* General Duties */}
                <div className={`${rulesMobileTab === 'general' ? 'block' : 'hidden sm:block'} bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col`}>
                  <div className="flex items-center justify-between gap-2 mb-2 touch-manipulation">
                    <div className="flex items-center gap-2 touch-manipulation">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-bold text-slate-800 text-sm">Genel Nöbet Görevleri</h4>
                    </div>
                    <button
                      onClick={resetDefaultGeneralRules}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/70 transition-all flex items-center gap-1 touch-manipulation"
                    >
                      <RotateCcw className="w-3 h-3" /> MEB Standartını Yükle
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    Yazdırılan çizelgenin altındaki genel görev maddeleri:
                  </p>
                  <textarea
                    rows={8}
                    value={generalRules}
                    onChange={(e) => setGeneralRules(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans touch-manipulation"
                  />
                </div>

                {/* Attention points */}
                <div className={`${rulesMobileTab === 'attention' ? 'block' : 'hidden sm:block'} bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col`}>
                  <div className="flex items-center justify-between gap-2 mb-2 touch-manipulation">
                    <div className="flex items-center gap-2 touch-manipulation">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <h4 className="font-bold text-slate-800 text-sm">Dikkat Edilecek Hususlar</h4>
                    </div>
                    <button
                      onClick={resetDefaultAttentionRules}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200/70 transition-all flex items-center gap-1 touch-manipulation"
                    >
                      <RotateCcw className="w-3 h-3" /> Varsayılana Sıfırla
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    Nöbet esnasında öğretmenlerin uyması gereken özel kurallar:
                  </p>
                  <textarea
                    rows={8}
                    value={attentionRules}
                    onChange={(e) => setAttentionRules(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed font-sans touch-manipulation"
                  />
                </div>

              </div>

              {/* Signature & Principal info */}
              <div className={`${rulesMobileTab === 'signature' ? 'block' : 'hidden sm:block'} bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col`}>
                <div className="flex items-center gap-2 mb-3 touch-manipulation">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">Resmi İmza Yetkilisi</h4>
                    <p className="text-xs text-slate-500">
                      Çizelge altında "UYGUNDUR" ibaresiyle yer alacak kurum amiri bilgileri.
                    </p>
                  </div>
                </div>

                {/* Auto-sync info banner & quick principal selector */}
                <div className="mb-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-indigo-950 font-medium">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      Okul Müdürü olan personel resmi imza yetkilisidir. Listeden seçebilir veya aşağıdan düzenleyebilirsiniz.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold text-indigo-800 shrink-0">Personelden Seç:</span>
                    <select
                      value={principalName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          setPrincipalName(val);
                          setPrincipalTitle('Okul Müdürü');
                          if (!dutyAdmins.some(a => a.trim().toLowerCase() === val.trim().toLowerCase())) {
                            setDutyAdmins(prev => [...prev, val]);
                          }
                          updateAdminRole(val, 'Okul Müdürü');
                        }
                      }}
                      className="text-xs font-bold bg-white text-indigo-900 border border-indigo-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer max-w-[200px]"
                    >
                      <option value="">{principalName ? `${principalName} (Seçili)` : 'Müdür Seç...'}</option>
                      {dutyAdmins.length > 0 && (
                        <optgroup label="Tanımlı İdareciler">
                          {dutyAdmins.map(adm => (
                            <option key={`admin_${adm}`} value={adm}>
                              {adm} ({adminRoles[adm] || 'İdareci'})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Tüm Öğretmenler & Personel">
                        {allStaffList.filter(p => !dutyAdmins.includes(p)).map(staff => (
                          <option key={`staff_${staff}`} value={staff}>
                            {staff}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 touch-manipulation">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Yetkili Adı Soyadı:
                    </label>
                    <input
                      type="text"
                      value={principalName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPrincipalName(val);
                        const matchedAdmin = dutyAdmins.find(a => a.trim().toLowerCase() === val.trim().toLowerCase());
                        if (matchedAdmin) {
                          setAdminRoles(prev => {
                            const nextRoles = { ...prev };
                            Object.keys(nextRoles).forEach(k => {
                              if (nextRoles[k] === 'Okul Müdürü' && k !== matchedAdmin) {
                                nextRoles[k] = 'Müdür Yardımcısı';
                              }
                            });
                            nextRoles[matchedAdmin] = 'Okul Müdürü';
                            return nextRoles;
                          });
                        }
                      }}
                      placeholder="Örn: Okul Müdürü Adı Soyadı"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Unvanı:
                    </label>
                    <input
                      type="text"
                      value={principalTitle}
                      onChange={(e) => setPrincipalTitle(e.target.value)}
                      placeholder="Örn: Okul Müdürü"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Live signature block preview */}
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center touch-manipulation">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    ÇİZELGE İMZA ALANI ÖNİZLEMESİ
                  </span>
                  <div className="mt-1 font-bold text-xs text-slate-600">... UYGUNDUR ...</div>
                  <div className="text-[11px] text-slate-500">... / ... / 2026</div>
                  <div className="mt-3 font-extrabold text-sm text-slate-900 tracking-wide">{principalName || 'Ad Soyad'}</div>
                  <div className="text-xs text-slate-600 font-medium">{principalTitle || 'Okul Müdürü'}</div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-2.5 sm:p-4 bg-slate-100/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 touch-manipulation">
          <div className="hidden sm:flex text-xs text-slate-500 items-center gap-1.5 touch-manipulation">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tüm değişiklikler tarayıcıda anlık güncellenir. "Tümünü Kaydet" ile kaydetmeyi unutmayın.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto touch-manipulation">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 bg-slate-200/50 transition-colors min-h-[42px] flex items-center justify-center active:scale-95 touch-manipulation"
            >
              Kapat
            </button>
            <button
              onClick={handleSaveModal}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 min-h-[42px] touch-manipulation"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span className="truncate">Tümünü Kaydet</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
