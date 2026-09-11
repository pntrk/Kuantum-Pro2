import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Printer,
  FileSpreadsheet,
  ImageIcon,
  QrCode,
  Smartphone,
  Users,
  Book,
  Building2,
  Calendar,
  Check,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  List,
  Grid,
  Clock,
  MapPin,
  Eye,
  Sparkles,
  SlidersHorizontal,
  MessageCircle,
  Share2,
  Copy,
  Send,
  ExternalLink,
  LayoutList,
  Layers,
  Table as TableIcon,
} from "lucide-react";
import ExcelJS from "exceljs";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ROBOTO_REGULAR_BASE64 } from "../utils/turkishPdfFont";

interface ExportReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: any;
  classSchedules: any;
  teachers: string[];
  classes: string[];
  schoolInfo: any;
  schoolSettings: any;
  isInline?: boolean;
}

export function ExportReportingModal({
  isOpen,
  onClose,
  schedules,
  classSchedules,
  teachers,
  classes,
  schoolInfo,
  schoolSettings,
  isInline = false,
}: ExportReportingModalProps) {
  const [activeTab, setActiveTab] = useState<"print" | "qr">("print");
  const [exportType, setExportType] = useState<"teacher" | "class" | "school">(
    "teacher",
  );
  const [selectedEntities, setSelectedEntities] = useState<string[]>(
    teachers.length > 0 ? [teachers[0]] : [],
  );
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isSharingPNG, setIsSharingPNG] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [copiedTextNotification, setCopiedTextNotification] = useState(false);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);
  const [showQrCodeMobile, setShowQrCodeMobile] = useState(false);
  
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [isCompactSchoolView, setIsCompactSchoolView] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [mobileScheduleViewMode, setMobileScheduleViewMode] = useState<"cards" | "table">("cards");

  const getShortDayName = (fullName: string) => {
    if (!fullName) return "";
    if (fullName.startsWith("Pazartesi")) return "Pzt";
    if (fullName.startsWith("Salı")) return "Sal";
    if (fullName.startsWith("Çarşamba")) return "Çrş";
    if (fullName.startsWith("Perşembe")) return "Prş";
    if (fullName.startsWith("Cumartesi")) return "Cts";
    if (fullName.startsWith("Cuma")) return "Cum";
    if (fullName.startsWith("Pazar")) return "Paz";
    return fullName.slice(0, 3);
  };

  const printRef = useRef<HTMLDivElement>(null);

  // Keep selectedEntities[0] synced when type or lists change
  useEffect(() => {
    if (exportType === "teacher") {
      if (
        selectedEntities.length === 0 ||
        !selectedEntities.every((e) => teachers.includes(e))
      ) {
        setSelectedEntities(teachers.length > 0 ? [teachers[0]] : []);
      }
    } else if (exportType === "class") {
      if (
        selectedEntities.length === 0 ||
        !selectedEntities.every((e) => classes.includes(e))
      ) {
        setSelectedEntities(classes.length > 0 ? [classes[0]] : []);
      }
    }
  }, [exportType, teachers, classes, isOpen]);

  const currentEntityList = exportType === "class" ? classes : teachers;
  const currentEntityIndex = currentEntityList.indexOf(selectedEntities[0] || "");

  const handlePrevEntity = () => {
    if (currentEntityList.length === 0) return;
    const newIdx = currentEntityIndex <= 0 ? currentEntityList.length - 1 : currentEntityIndex - 1;
    setSelectedEntities([currentEntityList[newIdx]]);
  };

  const handleNextEntity = () => {
    if (currentEntityList.length === 0) return;
    const newIdx = (currentEntityIndex + 1) % currentEntityList.length;
    setSelectedEntities([currentEntityList[newIdx]]);
  };

  let activeDays = schoolSettings?.weekDays?.filter((d: any) => d.active) || [];
  
  // Ensure Cumartesi (Saturday - id: 6) is included as requested
  if (!activeDays.find((d: any) => d.id === 6)) {
    const saturday = schoolSettings?.weekDays?.find((d: any) => d.id === 6) || { id: 6, name: 'Cumartesi', active: true, periods: 9 };
    activeDays.push({ ...saturday, active: true });
  }

  // Ensure Pazar (Sunday - id: 7) is included if there's data for it (optional, but let's stick to Cumartesi for now as requested)

  // Ensure at least 9 periods for all active days to satisfy the 9-hour requirement
  activeDays = activeDays.map((d: any) => ({ ...d, periods: Math.max(d.periods || 0, 9) }));
  
  // Sort days by ID to ensure correct order (Pazartesi to Cumartesi)
  activeDays.sort((a: any, b: any) => a.id - b.id);

  const maxPeriods = Math.max(...activeDays.map((d: any) => d.periods), 9);

  // Auto-select user's current real calendar/device day of week when modal opens or activeDays change
  useEffect(() => {
    if (!isOpen || !activeDays || activeDays.length === 0) return;

    const todayJsDay = new Date().getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
    const targetDayId = todayJsDay === 0 ? 7 : todayJsDay;

    const dayNameMap: Record<number, string> = {
      1: "Pazartesi",
      2: "Salı",
      3: "Çarşamba",
      4: "Perşembe",
      5: "Cuma",
      6: "Cumartesi",
      7: "Pazar",
    };
    const targetName = dayNameMap[targetDayId];

    const dayIdxInActive = activeDays.findIndex(
      (d: any) =>
        d.id === targetDayId ||
        (targetName &&
          d.name?.toLowerCase().startsWith(targetName.toLowerCase())),
    );

    if (dayIdxInActive !== -1) {
      setSelectedDayIndex(dayIdxInActive);
    } else {
      setSelectedDayIndex(0);
    }
  }, [isOpen, schoolSettings?.weekDays]);

  const parseCellData = (valStr: any) => {
    if (!valStr) return null;
    if (typeof valStr === "object") {
      const subject = valStr.subject || valStr.lessonName || valStr.name || "";
      const classes = valStr.classes || (valStr.className ? [valStr.className] : []);
      const teachers = valStr.teachers || (valStr.teacher ? [valStr.teacher] : []);
      const rooms = valStr.rooms || (valStr.room ? [valStr.room] : []);
      return {
        subject,
        classes,
        teachers,
        rooms,
        time: valStr.time || "",
        teacher: teachers[0] || valStr.teacher || "",
        room: rooms[0] || valStr.room || "",
        className: classes[0] || valStr.className || "",
      };
    }
    if (typeof valStr !== "string") return null;
    try {
      const parsed = JSON.parse(valStr);
      if (typeof parsed === "object" && parsed !== null) {
        const subject = parsed.subject || parsed.lessonName || parsed.name || "";
        const classes = parsed.classes || (parsed.className ? [parsed.className] : []);
        const teachers = parsed.teachers || (parsed.teacher ? [parsed.teacher] : []);
        const rooms = parsed.rooms || (parsed.room ? [parsed.room] : []);
        return {
          subject,
          classes,
          teachers,
          rooms,
          time: parsed.time || "",
          teacher: teachers[0] || parsed.teacher || "",
          room: rooms[0] || parsed.room || "",
          className: classes[0] || parsed.className || "",
        };
      }
      return {
        subject: String(parsed),
        classes: [],
        teachers: [],
        rooms: [],
        time: "",
        teacher: "",
        room: "",
        className: "",
      };
    } catch {
      return {
        subject: valStr,
        classes: [],
        teachers: [],
        rooms: [],
        time: "",
        teacher: "",
        room: "",
        className: "",
      };
    }
  };

  // Calculate total scheduled hours for the currently selected entity
  const calculateEntityTotalHours = (entity: string) => {
    if (!entity) return 0;
    const isTeacher = exportType === "teacher";
    const dataSource = isTeacher ? schedules[entity] : classSchedules[entity];
    if (!dataSource) return 0;

    let total = 0;
    activeDays.forEach((day: any) => {
      const dIdx = day.id - 1;
      for (let p = 0; p < day.periods; p++) {
        if (dataSource[dIdx]?.[p]) total++;
      }
    });
    return total;
  };

  // Helper for adaptive cell typography scaling based on text lengths
  const getAdaptiveCellTypography = (
    subject: string,
    secondary: string,
    hasRoom: boolean,
  ) => {
    const sub = subject?.trim() || "";
    const sec = secondary?.trim() || "";
    const subLen = sub.length;
    const secLen = sec.length;

    // Subject font class (UI) and jsPDF font size
    let subjectStyle =
      "text-xs md:text-sm font-black text-indigo-950 leading-tight";
    let jsPdfSubjectSize = 9.5;
    let canvasSubjectSize = 12;

    if (subLen > 24) {
      subjectStyle =
        "text-[9px] md:text-[10px] font-bold text-indigo-950 leading-tight line-clamp-2";
      jsPdfSubjectSize = 6.8;
      canvasSubjectSize = 9;
    } else if (subLen > 15) {
      subjectStyle =
        "text-[10px] md:text-[11px] font-extrabold text-indigo-950 leading-tight";
      jsPdfSubjectSize = 7.8;
      canvasSubjectSize = 10;
    } else if (subLen > 9) {
      subjectStyle =
        "text-[11px] md:text-xs font-black text-indigo-950 leading-tight";
      jsPdfSubjectSize = 8.6;
      canvasSubjectSize = 11;
    }

    // Secondary font class (classes / teachers) and jsPDF font size
    let secondaryStyle =
      "text-[9.5px] md:text-[11px] font-semibold text-slate-600 leading-tight";
    let jsPdfSecondarySize = 8.0;
    let canvasSecondarySize = 10;

    if (secLen > 22) {
      secondaryStyle =
        "text-[7.5px] md:text-[8.5px] font-medium text-slate-600 leading-none line-clamp-1";
      jsPdfSecondarySize = 6.0;
      canvasSecondarySize = 8;
    } else if (secLen > 14) {
      secondaryStyle =
        "text-[8.5px] md:text-[9.5px] font-semibold text-slate-600 leading-tight";
      jsPdfSecondarySize = 7.0;
      canvasSecondarySize = 9;
    }

    if (hasRoom && (subLen > 12 || secLen > 12)) {
      jsPdfSubjectSize = Math.max(6.5, jsPdfSubjectSize - 0.4);
      jsPdfSecondarySize = Math.max(5.8, jsPdfSecondarySize - 0.4);
      canvasSubjectSize = Math.max(8.5, canvasSubjectSize - 1);
      canvasSecondarySize = Math.max(7.5, canvasSecondarySize - 1);
    }

    return {
      subjectStyle,
      secondaryStyle,
      jsPdfSubjectSize,
      jsPdfSecondarySize,
      canvasSubjectSize,
      canvasSecondarySize,
    };
  };

  // Helper for school chart adaptive typography
  const getAdaptiveSchoolTypography = (subject: string, classesStr: string) => {
    const subLen = (subject || "").length;
    const clsLen = (classesStr || "").length;

    let subClass = "text-[10px] font-extrabold text-indigo-950";
    let clsClass = "text-[8.5px] font-semibold text-slate-600";
    let jsPdfSize = 6.5;

    if (subLen > 16 || clsLen > 16) {
      subClass = "text-[8px] font-bold text-indigo-950 leading-tight";
      clsClass = "text-[7px] font-medium text-slate-600 leading-none";
      jsPdfSize = 5.0;
    } else if (subLen > 10 || clsLen > 10) {
      subClass = "text-[9px] font-extrabold text-indigo-950 leading-tight";
      clsClass = "text-[7.5px] font-semibold text-slate-600 leading-tight";
      jsPdfSize = 5.8;
    }

    return { subClass, clsClass, jsPdfSize };
  };

  // Helper function to render high-resolution canvas for image exports
  const createRenderedCanvas = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scale = 2; // Crisp Retina scale
    const numPeriods = maxPeriods;
    const numDays = activeDays.length;

    if (exportType === "school") {
      const colWidth = 110;
      const rowHeight = 44;
      const headerHeight = 160;
      const footerHeight = 110;
      const teacherColWidth = 160;

      const totalWidth =
        40 + teacherColWidth + numPeriods * numDays * colWidth + 40;
      const totalHeight =
        headerHeight + teachers.length * rowHeight + footerHeight;

      canvas.width = totalWidth * scale;
      canvas.height = totalHeight * scale;
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Header Title
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        (schoolInfo.name || "OKUL ADI").toLocaleUpperCase("tr-TR"),
        totalWidth / 2,
        45,
      );

      ctx.fillStyle = "#475569";
      ctx.font = "600 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `${schoolInfo.year || ""} EĞİTİM ÖĞRETİM YILI`.toLocaleUpperCase(
          "tr-TR",
        ),
        totalWidth / 2,
        70,
      );

      // Badge
      ctx.fillStyle = "#eef2ff";
      ctx.beginPath();
      ctx.roundRect(totalWidth / 2 - 180, 85, 360, 34, 17);
      ctx.fill();
      ctx.strokeStyle = "#c7d2fe";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#312e81";
      ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
      ctx.fillText("OKUL GENEL ÇARŞAF LİSTESİ", totalWidth / 2, 107);

      // Table Header
      const startY = 140;
      const startX = 40;

      // Teacher header cell
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(startX, startY, teacherColWidth, 40);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, startY, teacherColWidth, 40);

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Öğretmen", startX + teacherColWidth / 2, startY + 24);

      let curX = startX + teacherColWidth;
      activeDays.forEach((day: any) => {
        const dayWidth = day.periods * colWidth;
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(curX, startY, dayWidth, 20);
        ctx.strokeRect(curX, startY, dayWidth, 20);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.fillText(day.name, curX + dayWidth / 2, startY + 14);

        for (let p = 0; p < day.periods; p++) {
          const pX = curX + p * colWidth;
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(pX, startY + 20, colWidth, 20);
          ctx.strokeRect(pX, startY + 20, colWidth, 20);

          ctx.fillStyle = "#475569";
          ctx.font = "600 10px system-ui, -apple-system, sans-serif";
          ctx.fillText(`${p + 1}.Ders`, pX + colWidth / 2, startY + 34);
        }
        curX += dayWidth;
      });

      // Table Rows
      teachers.forEach((t, tIdx) => {
        const rowY = startY + 40 + tIdx * rowHeight;

        // Teacher name cell
        ctx.fillStyle = tIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
        ctx.fillRect(startX, rowY, teacherColWidth, rowHeight);
        ctx.strokeRect(startX, rowY, teacherColWidth, rowHeight);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(t, startX + 10, rowY + 26);

        let cellX = startX + teacherColWidth;
        activeDays.forEach((day: any) => {
          const dIdx = day.id - 1;
          for (let p = 0; p < day.periods; p++) {
            const val = schedules[t]?.[dIdx]?.[p];
            const parsed = parseCellData(val);

            ctx.fillStyle = tIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
            ctx.fillRect(cellX, rowY, colWidth, rowHeight);
            ctx.strokeRect(cellX, rowY, colWidth, rowHeight);

            if (parsed) {
              const sub = parsed.subject || "";
              const cls = parsed.classes?.join(", ") || "";
              const subLen = sub.length;

              ctx.fillStyle = "#312e81";
              ctx.font = `bold ${subLen > 14 ? 8.5 : 10}px system-ui, -apple-system, sans-serif`;
              ctx.textAlign = "center";
              ctx.fillText(sub, cellX + colWidth / 2, rowY + 18);

              ctx.fillStyle = "#475569";
              ctx.font = `500 ${cls.length > 14 ? 7.5 : 9}px system-ui, -apple-system, sans-serif`;
              ctx.fillText(cls, cellX + colWidth / 2, rowY + 32);
            } else {
              ctx.fillStyle = "#cbd5e1";
              ctx.font = "10px system-ui, -apple-system, sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("-", cellX + colWidth / 2, rowY + 26);
            }
            cellX += colWidth;
          }
        });
      });

      return canvas;
    } else {
      // Teacher or Class Schedule Single Timetable
      const isTeacher = exportType === "teacher";
      const entityName =
        selectedEntities[0] || (isTeacher ? "ÖĞRETMEN" : "SINIF");
      const cellWidth = 120;
      const cellHeight = 65;
      const dayColWidth = 110;
      const headerHeight = 160;
      const footerHeight = 120;

      const totalWidth = 40 + dayColWidth + maxPeriods * cellWidth + 40;
      const totalHeight =
        headerHeight + activeDays.length * cellHeight + footerHeight;

      canvas.width = totalWidth * scale;
      canvas.height = totalHeight * scale;
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Header Title
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        (schoolInfo.name || "OKUL ADI").toLocaleUpperCase("tr-TR"),
        totalWidth / 2,
        45,
      );

      ctx.fillStyle = "#475569";
      ctx.font = "600 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `${schoolInfo.year || ""} EĞİTİM ÖĞRETİM YILI`.toLocaleUpperCase(
          "tr-TR",
        ),
        totalWidth / 2,
        70,
      );

      // Badge
      ctx.fillStyle = "#eef2ff";
      ctx.beginPath();
      ctx.roundRect(totalWidth / 2 - 200, 85, 400, 36, 18);
      ctx.fill();
      ctx.strokeStyle = "#c7d2fe";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#312e81";
      ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        isTeacher
          ? `${entityName.toLocaleUpperCase("tr-TR")} HAFTALIK DERS PROGRAMI`
          : `${entityName.toLocaleUpperCase("tr-TR")} SINIFI HAFTALIK DERS PROGRAMI`,
        totalWidth / 2,
        108,
      );

      // Timetable Table Header
      const startY = 140;
      const startX = 40;

      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(startX, startY, dayColWidth, 34);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, startY, dayColWidth, 34);

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Gün", startX + dayColWidth / 2, startY + 21);

      for (let p = 0; p < maxPeriods; p++) {
        const pX = startX + dayColWidth + p * cellWidth;
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(pX, startY, cellWidth, 34);
        ctx.strokeRect(pX, startY, cellWidth, 34);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.fillText(`${p + 1}. Ders`, pX + cellWidth / 2, startY + 16);

        const timeStr = schoolSettings?.lessonTimes?.[p]
          ? `${schoolSettings.lessonTimes[p].start}-${schoolSettings.lessonTimes[p].end}`
          : "";
        ctx.fillStyle = "#64748b";
        ctx.font = "500 9px system-ui, -apple-system, sans-serif";
        ctx.fillText(timeStr, pX + cellWidth / 2, startY + 28);
      }

      // Rows for active days
      activeDays.forEach((day: any, dIdx: number) => {
        const rowY = startY + 34 + dIdx * cellHeight;

        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(startX, rowY, dayColWidth, cellHeight);
        ctx.strokeRect(startX, rowY, dayColWidth, cellHeight);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          day.name,
          startX + dayColWidth / 2,
          rowY + cellHeight / 2 + 4,
        );

        for (let p = 0; p < maxPeriods; p++) {
          const cellX = startX + dayColWidth + p * cellWidth;
          const val = isTeacher
            ? schedules[selectedEntities[0]]?.[day.id - 1]?.[p]
            : classSchedules[selectedEntities[0]]?.[day.id - 1]?.[p];
          const parsed = parseCellData(val);

          ctx.fillStyle = parsed ? "#eef2ff" : "#ffffff";
          ctx.fillRect(cellX, rowY, cellWidth, cellHeight);
          ctx.strokeRect(cellX, rowY, cellWidth, cellHeight);

          if (parsed) {
            const subject = parsed.subject || "";
            const secondary = isTeacher
              ? parsed.classes?.join(", ") || ""
              : parsed.teachers?.join(", ") || "";
            const room =
              parsed.rooms && parsed.rooms.length > 0
                ? `[${parsed.rooms.join(", ")}]`
                : "";

            const { canvasSubjectSize, canvasSecondarySize } =
              getAdaptiveCellTypography(subject, secondary, !!room);

            ctx.fillStyle = "#312e81";
            ctx.font = `bold ${canvasSubjectSize}px system-ui, -apple-system, sans-serif`;
            ctx.fillText(
              subject,
              cellX + cellWidth / 2,
              rowY + (room ? 22 : 26),
            );

            ctx.fillStyle = "#475569";
            ctx.font = `600 ${canvasSecondarySize}px system-ui, -apple-system, sans-serif`;
            ctx.fillText(
              secondary,
              cellX + cellWidth / 2,
              rowY + (room ? 38 : 44),
            );

            if (room) {
              ctx.fillStyle = "#b45309";
              ctx.font = "500 8.5px system-ui, -apple-system, sans-serif";
              ctx.fillText(room, cellX + cellWidth / 2, rowY + 52);
            }
          } else {
            ctx.fillStyle = "#cbd5e1";
            ctx.font = "12px system-ui, -apple-system, sans-serif";
            ctx.fillText("-", cellX + cellWidth / 2, rowY + cellHeight / 2 + 4);
          }
        }
      });

      return canvas;
    }
  };

  // 1. Vector PDF Generation with Full Turkish Unicode Support and Optimized Proportions
  const generatePDF = async () => {
    setIsExportingPDF(true);
    try {
      const isLandscape = true;
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      // Register Turkish-compatible Unicode TTF Font
      pdf.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_BASE64);
      pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      pdf.addFont("Roboto-Regular.ttf", "Roboto", "bold");
      pdf.setFont("Roboto", "normal");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Title & Subtitle
      pdf.setFont("Roboto", "bold");
      pdf.setFontSize(13.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(
        (schoolInfo.name || "OKUL ADI").toLocaleUpperCase("tr-TR"),
        pageWidth / 2,
        13,
        { align: "center" },
      );

      pdf.setFont("Roboto", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(
        `${schoolInfo.year || ""} EĞİTİM ÖĞRETİM YILI`.toLocaleUpperCase(
          "tr-TR",
        ),
        pageWidth / 2,
        18,
        { align: "center" },
      );

      // Program Type Badge
      pdf.setFont("Roboto", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(49, 46, 129);
      const titleBadge =
        exportType === "teacher"
          ? `${(selectedEntities[0] || "ÖĞRETMEN").toLocaleUpperCase("tr-TR")} HAFTALIK DERS PROGRAMI`
          : exportType === "class"
            ? `${(selectedEntities[0] || "SINIF").toLocaleUpperCase("tr-TR")} SINIFI HAFTALIK DERS PROGRAMI`
            : "OKUL GENEL ÇARŞAF LİSTESİ";
      pdf.text(titleBadge, pageWidth / 2, 24.5, { align: "center" });

      if (exportType === "school") {
        const totalPeriods = activeDays.reduce(
          (acc: number, d: any) => acc + d.periods,
          0,
        );
        const teacherColWidth = 30;
        const totalTableWidth = pageWidth - 16; // 297 - 16 = 281mm
        const periodColWidth =
          (totalTableWidth - teacherColWidth) / Math.max(1, totalPeriods);

        const schoolColStyles: any = {
          0: {
            cellWidth: teacherColWidth,
            fontStyle: "bold",
            fontSize: 7,
            halign: "left",
            valign: "middle",
          },
        };
        for (let i = 1; i <= totalPeriods; i++) {
          schoolColStyles[i] = {
            cellWidth: periodColWidth,
            halign: "center",
            valign: "middle",
          };
        }

        const headRow1: any[] = [
          {
            content: "Öğretmen",
            rowSpan: 2,
            styles: {
              font: "Roboto",
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
            },
          },
        ];
        const headRow2: any[] = [];

        activeDays.forEach((day: any) => {
          headRow1.push({
            content: day.name,
            colSpan: day.periods,
            styles: { font: "Roboto", halign: "center", fontStyle: "bold" },
          });
          for (let p = 0; p < day.periods; p++) {
            headRow2.push({
              content: `${p + 1}`,
              styles: { font: "Roboto", halign: "center", fontSize: 6 },
            });
          }
        });

        const bodyRows: any[] = [];
        teachers.forEach((t) => {
          const row: any[] = [
            {
              content: t,
              styles: { font: "Roboto", fontStyle: "bold", fontSize: 6.8 },
            },
          ];
          activeDays.forEach((day: any) => {
            const dIdx = day.id - 1;
            for (let p = 0; p < day.periods; p++) {
              const val = schedules[t]?.[dIdx]?.[p];
              const parsed = parseCellData(val);
              if (parsed) {
                const sub = parsed.subject || "";
                const cls = parsed.classes?.join(",") || "";
                const { jsPdfSize } = getAdaptiveSchoolTypography(sub, cls);
                row.push({
                  content: `${sub}\n(${cls})`,
                  styles: {
                    font: "Roboto",
                    halign: "center",
                    valign: "middle",
                    fontSize: jsPdfSize,
                  },
                });
              } else {
                row.push({
                  content: "-",
                  styles: {
                    font: "Roboto",
                    halign: "center",
                    valign: "middle",
                    fontSize: 6,
                    textColor: [148, 163, 184],
                  },
                });
              }
            }
          });
          bodyRows.push(row);
        });

        autoTable(pdf, {
          startY: 31,
          head: [headRow1, headRow2],
          body: bodyRows,
          theme: "grid",
          styles: {
            font: "Roboto",
            fontSize: 6.5,
            cellPadding: 1.0,
            textColor: [15, 23, 42],
            lineColor: [203, 213, 225],
            lineWidth: 0.15,
            valign: "middle",
            overflow: "linebreak",
          },
          headStyles: {
            font: "Roboto",
            fillColor: [241, 245, 249],
            textColor: [30, 41, 59],
            fontStyle: "bold",
            lineColor: [148, 163, 184],
            lineWidth: 0.2,
          },
          alternateRowStyles: {
            fillColor: [250, 250, 252],
          },
          columnStyles: schoolColStyles,
          margin: { left: 8, right: 8, top: 31, bottom: 22 },
          pageBreak: "auto",
        });
      } else {
        const isTeacher = exportType === "teacher";
        const totalTableWidth = pageWidth - 20;
        const dayColWidth = 26;
        const periodColWidth = (totalTableWidth - dayColWidth) / maxPeriods;

        const colStyles: any = {
          0: {
            cellWidth: dayColWidth,
            fontStyle: "bold",
            halign: "center",
            valign: "middle",
            fillColor: [248, 250, 252],
          },
        };
        for (let i = 1; i <= maxPeriods; i++) {
          colStyles[i] = {
            cellWidth: periodColWidth,
            halign: "center",
            valign: "middle",
          };
        }

        const headers: any[] = [
          {
            content: "GÜN",
            styles: {
              font: "Roboto",
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
            },
          },
        ];
        for (let p = 0; p < maxPeriods; p++) {
          const time = schoolSettings?.lessonTimes?.[p]
            ? `\n${schoolSettings.lessonTimes[p].start}-${schoolSettings.lessonTimes[p].end}`
            : "";
          headers.push({
            content: `${p + 1}. DERS${time}`,
            styles: {
              font: "Roboto",
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
            },
          });
        }

        selectedEntities.forEach((entity, index) => {
          if (index > 0) pdf.addPage();

          // Title & Subtitle for each entity page
          pdf.setFont("Roboto", "bold");
          pdf.setFontSize(13.5);
          pdf.setTextColor(15, 23, 42);
          pdf.text(
            (schoolInfo.name || "OKUL ADI").toLocaleUpperCase("tr-TR"),
            pageWidth / 2,
            13,
            { align: "center" },
          );

          pdf.setFont("Roboto", "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(71, 85, 105);
          pdf.text(
            `${schoolInfo.year || ""} EĞİTİM ÖĞRETİM YILI`.toLocaleUpperCase(
              "tr-TR",
            ),
            pageWidth / 2,
            18,
            { align: "center" },
          );

          // Program Type Badge
          pdf.setFont("Roboto", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(49, 46, 129);
          const titleBadge = isTeacher
            ? `${(entity || "ÖĞRETMEN").toLocaleUpperCase("tr-TR")} HAFTALIK DERS PROGRAMI`
            : `${(entity || "SINIF").toLocaleUpperCase("tr-TR")} SINIFI HAFTALIK DERS PROGRAMI`;
          pdf.text(titleBadge, pageWidth / 2, 24.5, { align: "center" });

          const bodyRows: any[] = [];
          activeDays.forEach((day: any) => {
            const dIdx = day.id - 1;
            const row: any[] = [
              {
                content: day.name.toLocaleUpperCase("tr-TR"),
                styles: {
                  font: "Roboto",
                  fontStyle: "bold",
                  halign: "center",
                  valign: "middle",
                  fillColor: [248, 250, 252],
                },
              },
            ];

            for (let p = 0; p < maxPeriods; p++) {
              const val = isTeacher
                ? schedules[entity]?.[dIdx]?.[p]
                : classSchedules[entity]?.[dIdx]?.[p];
              const cellData = parseCellData(val);

              if (cellData) {
                const secondary = isTeacher
                  ? cellData.classes?.join(", ") || ""
                  : cellData.teachers?.join(", ") || "";
                const room =
                  cellData.rooms && cellData.rooms.length > 0
                    ? `\n[${cellData.rooms.join(", ")}]`
                    : "";

                const { jsPdfSubjectSize } = getAdaptiveCellTypography(
                  cellData.subject,
                  secondary,
                  !!(cellData.rooms && cellData.rooms.length > 0),
                );

                row.push({
                  content: `${cellData.subject}\n${secondary}${room}`,
                  styles: {
                    halign: "center",
                    valign: "middle",
                    font: "Roboto",
                    fontSize: jsPdfSubjectSize,
                    fontStyle: "normal",
                    textColor: [30, 27, 75],
                    fillColor: [248, 250, 255],
                  },
                });
              } else {
                row.push({
                  content: "-",
                  styles: {
                    halign: "center",
                    valign: "middle",
                    font: "Roboto",
                    fontSize: 10,
                    textColor: [148, 163, 184],
                  },
                });
              }
            }
            bodyRows.push(row);
          });

          const calculatedMinCellHeight = Math.min(
            26,
            Math.max(18, Math.floor(128 / Math.max(1, activeDays.length))),
          );

          autoTable(pdf, {
            startY: 32,
            head: [headers],
            body: bodyRows,
            theme: "grid",
            styles: {
              font: "Roboto",
              fontSize: 8.5,
              cellPadding: 2,
              textColor: [15, 23, 42],
              lineColor: [148, 163, 184],
              lineWidth: 0.25,
              valign: "middle",
              halign: "center",
              minCellHeight: calculatedMinCellHeight,
              overflow: "linebreak",
            },
            headStyles: {
              font: "Roboto",
              fillColor: [241, 245, 249],
              textColor: [30, 41, 59],
              fontStyle: "bold",
              lineColor: [100, 116, 139],
              lineWidth: 0.35,
              minCellHeight: 11,
            },
            columnStyles: colStyles,
            margin: { left: 10, right: 10, top: 32, bottom: 22 },
          });

          // Add Signatures for each page
          const finalY = (pdf as any).lastAutoTable?.finalY || 160;
          const signatureY = Math.min(
            pageHeight - 14,
            Math.max(finalY + 10, pageHeight - 22),
          );

          pdf.setFont("Roboto", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(30, 41, 59);

          const leftSigX = 35;
          pdf.text("Müdür Yardımcısı", leftSigX, signatureY, {
            align: "center",
          });
          pdf.setFont("Roboto", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(
            schoolInfo.vicePrincipal || "...........................",
            leftSigX,
            signatureY + 5,
            { align: "center" },
          );

          const rightSigX = pageWidth - 35;
          pdf.setFont("Roboto", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(30, 41, 59);
          pdf.text("Okul Müdürü", rightSigX, signatureY, { align: "center" });
          pdf.setFont("Roboto", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(
            schoolInfo.principal || "...........................",
            rightSigX,
            signatureY + 5,
            { align: "center" },
          );
        });
      }

      if (exportType === "school") {
        // Add Signatures for school page
        const finalY = (pdf as any).lastAutoTable?.finalY || 160;
        const signatureY = Math.min(
          pageHeight - 14,
          Math.max(finalY + 10, pageHeight - 22),
        );

        pdf.setFont("Roboto", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(30, 41, 59);

        const leftSigX = 35;
        pdf.text("Müdür Yardımcısı", leftSigX, signatureY, { align: "center" });
        pdf.setFont("Roboto", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          schoolInfo.vicePrincipal || "...........................",
          leftSigX,
          signatureY + 5,
          { align: "center" },
        );

        const rightSigX = pageWidth - 35;
        pdf.setFont("Roboto", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(30, 41, 59);
        pdf.text("Okul Müdürü", rightSigX, signatureY, { align: "center" });
        pdf.setFont("Roboto", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          schoolInfo.principal || "...........................",
          rightSigX,
          signatureY + 5,
          { align: "center" },
        );
      }

      const safeEntity = (
        selectedEntities.length > 1
          ? "Toplu_Cikti"
          : selectedEntities[0] || "Okul_Genel"
      ).replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, "_");
      pdf.save(`Program_${exportType}_${safeEntity}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 2. High Resolution Image Export
  const downloadImage = async () => {
    setIsExportingImage(true);
    try {
      const canvas = createRenderedCanvas();
      if (!canvas) {
        setIsExportingImage(false);
        return;
      }

      const link = document.createElement("a");
      const safeEntity = (
        selectedEntities[0] ||
        (exportType === "school" ? "Okul_Genel" : "Program")
      ).replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, "_");
      link.download = `Program_${exportType}_${safeEntity}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Canvas image export error:", error);
    } finally {
      setIsExportingImage(false);
    }
  };

  // 3. Professional Excel Export with ExcelJS (Full Turkish Unicode UTF-8 & Rich Styling)
  const generateExcel = async () => {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Ders Programı & Nöbet Sistemi";
    wb.lastModifiedBy = "Atatürk Ortaokulu";
    wb.created = new Date();
    wb.modified = new Date();

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };

    if (exportType === "school") {
      const ws = wb.addWorksheet("Okul Çarşaf Liste", {
        pageSetup: {
          orientation: "landscape",
          paperSize: 9,
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      });

      const totalPeriodsCount = activeDays.reduce(
        (acc: number, d: any) => acc + d.periods,
        0,
      );
      const totalCols = 1 + totalPeriodsCount;

      // Title Row 1
      const titleRow1 = ws.addRow([
        (schoolInfo.name || "OKUL ADI").toLocaleUpperCase("tr-TR") +
          " HAFTALIK DERS PROGRAMI",
      ]);
      ws.mergeCells(1, 1, 1, totalCols);
      titleRow1.height = 24;
      titleRow1.font = {
        name: "Calibri",
        size: 13,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      titleRow1.alignment = { horizontal: "center", vertical: "middle" };
      titleRow1.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };

      // Title Row 2
      const titleRow2 = ws.addRow([
        `${schoolInfo.year || ""} EĞİTİM ÖĞRETİM YILI OKUL GENEL ÇARŞAF LİSTESİ`.toLocaleUpperCase(
          "tr-TR",
        ),
      ]);
      ws.mergeCells(2, 1, 2, totalCols);
      titleRow2.height = 18;
      titleRow2.font = {
        name: "Calibri",
        size: 10.5,
        bold: true,
        color: { argb: "FF1E293B" },
      };
      titleRow2.alignment = { horizontal: "center", vertical: "middle" };
      titleRow2.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF1F5F9" },
      };

      // Spacer
      const spacer = ws.addRow([]);
      spacer.height = 6;

      // Day Header Row (Row 4) & Period Header Row (Row 5)
      const dayHeaderRow = ws.addRow(["Öğretmen"]);
      const periodHeaderRow = ws.addRow([""]);
      ws.mergeCells(4, 1, 5, 1);

      let colPtr = 2;
      activeDays.forEach((day: any) => {
        const startCol = colPtr;
        const endCol = colPtr + day.periods - 1;

        dayHeaderRow.getCell(startCol).value =
          day.name.toLocaleUpperCase("tr-TR");
        if (day.periods > 1) {
          ws.mergeCells(4, startCol, 4, endCol);
        }

        for (let p = 0; p < day.periods; p++) {
          periodHeaderRow.getCell(colPtr).value = `${p + 1}.Ders`;
          colPtr++;
        }
      });

      dayHeaderRow.height = 20;
      periodHeaderRow.height = 18;

      for (let c = 1; c <= totalCols; c++) {
        const c1 = dayHeaderRow.getCell(c);
        c1.font = {
          name: "Calibri",
          size: 9.5,
          bold: true,
          color: { argb: "FFFFFFFF" },
        };
        c1.alignment = { horizontal: "center", vertical: "middle" };
        c1.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1E293B" },
        };
        c1.border = thinBorder;

        const c2 = periodHeaderRow.getCell(c);
        c2.font = {
          name: "Calibri",
          size: 8.5,
          bold: true,
          color: { argb: "FF334155" },
        };
        c2.alignment = { horizontal: "center", vertical: "middle" };
        c2.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE2E8F0" },
        };
        c2.border = thinBorder;
      }

      // Teacher Data Rows
      teachers.forEach((t, tIdx) => {
        const rowVals: any[] = [t];
        activeDays.forEach((day: any) => {
          const dIdx = day.id - 1;
          for (let p = 0; p < day.periods; p++) {
            const val = schedules[t]?.[dIdx]?.[p];
            const parsed = parseCellData(val);
            rowVals.push(
              parsed
                ? `${parsed.subject} (${parsed.classes?.join(",") || ""})`
                : "-",
            );
          }
        });

        const r = ws.addRow(rowVals);
        r.height = 20;
        const isEven = tIdx % 2 === 0;

        for (let c = 1; c <= totalCols; c++) {
          const cell = r.getCell(c);
          cell.font = {
            name: "Calibri",
            size: 8.5,
            bold: c === 1,
            color: { argb: c === 1 ? "FF0F172A" : "FF334155" },
          };
          cell.alignment = {
            horizontal: c === 1 ? "left" : "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = thinBorder;
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isEven ? "FFFFFFFF" : "FFF8FAFC" },
          };
        }
      });

      // Auto Column Widths
      ws.getColumn(1).width = 24;
      for (let c = 2; c <= totalCols; c++) {
        ws.getColumn(c).width = 13;
      }

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${(schoolInfo.name || "Okul").replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, "_")}_Carsaf_Liste.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } else {
      const isTeacher = exportType === "teacher";

      selectedEntities.forEach((entity) => {
        const entityName = entity || (isTeacher ? "Öğretmen" : "Sınıf");
        const sheetName = entityName
          .replace(/[:\\/?*\[\]]/g, "")
          .substring(0, 31);
        const ws = wb.addWorksheet(sheetName, {
          pageSetup: {
            orientation: "landscape",
            paperSize: 9,
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
          },
        });

        const totalCols = 1 + maxPeriods;

        // Title Row 1
        const titleRow1 = ws.addRow([
          (schoolInfo.name || "OKUL ADI").toLocaleUpperCase("tr-TR"),
        ]);
        ws.mergeCells(1, 1, 1, totalCols);
        titleRow1.height = 24;
        titleRow1.font = {
          name: "Calibri",
          size: 13,
          bold: true,
          color: { argb: "FFFFFFFF" },
        };
        titleRow1.alignment = { horizontal: "center", vertical: "middle" };
        titleRow1.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0F172A" },
        };

        // Title Row 2
        const subTitle = isTeacher
          ? `${entityName.toLocaleUpperCase("tr-TR")} HAFTALIK DERS PROGRAMI (${schoolInfo.year || ""})`
          : `${entityName.toLocaleUpperCase("tr-TR")} SINIFI HAFTALIK DERS PROGRAMI (${schoolInfo.year || ""})`;
        const titleRow2 = ws.addRow([subTitle]);
        ws.mergeCells(2, 1, 2, totalCols);
        titleRow2.height = 19;
        titleRow2.font = {
          name: "Calibri",
          size: 11,
          bold: true,
          color: { argb: "FF1E293B" },
        };
        titleRow2.alignment = { horizontal: "center", vertical: "middle" };
        titleRow2.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };

        // Spacer
        const spacer = ws.addRow([]);
        spacer.height = 6;

        // Header Row
        const headerVals = ["GÜN"];
        for (let p = 0; p < maxPeriods; p++) {
          const time = schoolSettings?.lessonTimes?.[p]
            ? ` (${schoolSettings.lessonTimes[p].start}-${schoolSettings.lessonTimes[p].end})`
            : "";
          headerVals.push(`${p + 1}. DERS${time}`);
        }
        const headerRow = ws.addRow(headerVals);
        headerRow.height = 22;

        for (let c = 1; c <= totalCols; c++) {
          const cell = headerRow.getCell(c);
          cell.font = {
            name: "Calibri",
            size: 9.5,
            bold: true,
            color: { argb: "FFFFFFFF" },
          };
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1E293B" },
          };
          cell.border = thinBorder;
        }

        // Day Rows
        activeDays.forEach((day: any, dIdx: number) => {
          const rowVals: any[] = [day.name.toLocaleUpperCase("tr-TR")];
          for (let p = 0; p < maxPeriods; p++) {
            const val = isTeacher
              ? schedules[entity]?.[day.id - 1]?.[p]
              : classSchedules[entity]?.[day.id - 1]?.[p];
            const parsed = parseCellData(val);

            if (parsed) {
              const extra = isTeacher
                ? parsed.classes?.join(", ")
                : parsed.teachers?.join(", ");
              const room =
                parsed.rooms && parsed.rooms.length > 0
                  ? ` [${parsed.rooms.join(", ")}]`
                  : "";
              rowVals.push(`${parsed.subject}\n${extra || ""}${room}`);
            } else {
              rowVals.push("-");
            }
          }
          const r = ws.addRow(rowVals);
          r.height = 36;
          const isEven = dIdx % 2 === 0;

          for (let c = 1; c <= totalCols; c++) {
            const cell = r.getCell(c);
            cell.font = {
              name: "Calibri",
              size: 9,
              bold: c === 1,
              color: { argb: c === 1 ? "FF0F172A" : "FF1E293B" },
            };
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };
            cell.border = thinBorder;
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: c === 1 ? "FFF1F5F9" : isEven ? "FFFFFFFF" : "FFF8FAFC",
              },
            };
          }
        });

        // Signature Row
        const sigSpacer = ws.addRow([]);
        sigSpacer.height = 14;
        const sigRow1 = ws.addRow([
          "",
          "Müdür Yardımcısı",
          ...Array(Math.max(0, totalCols - 3)).fill(""),
          "Okul Müdürü",
        ]);
        sigRow1.height = 18;
        sigRow1.font = {
          name: "Calibri",
          size: 9.5,
          bold: true,
          color: { argb: "FF1E293B" },
        };
        sigRow1.alignment = { horizontal: "center", vertical: "middle" };
        const sigRow2 = ws.addRow([
          "",
          schoolInfo.vicePrincipal || "...........................",
          ...Array(Math.max(0, totalCols - 3)).fill(""),
          schoolInfo.principal || "...........................",
        ]);
        sigRow2.height = 18;
        sigRow2.font = {
          name: "Calibri",
          size: 9,
          color: { argb: "FF64748B" },
        };
        sigRow2.alignment = { horizontal: "center", vertical: "middle" };

        // Column widths
        ws.getColumn(1).width = 18;
        for (let c = 2; c <= totalCols; c++) {
          ws.getColumn(c).width = 17;
        }
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const safeName =
        selectedEntities.length > 1
          ? "Toplu_Program"
          : (selectedEntities[0] || (isTeacher ? "Ogretmen" : "Sinif")).replace(
              /[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g,
              "_",
            );
      link.download = `Program_${exportType}_${safeName}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  // 4. Clean System Printing
  const handlePrint = () => {
    window.print();
  };

  const getShareLink = (teacher: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/teacher/${encodeURIComponent(teacher)}`;
  };

  const getWhatsAppShareText = (
    entityName: string,
    type: "teacher" | "class" = exportType === "class" ? "class" : "teacher",
  ) => {
    if (!entityName) return "";
    const schoolNameStr = schoolInfo?.name || "OKUL DERS PROGRAMI";
    let text = `📚 *${schoolNameStr.toLocaleUpperCase("tr-TR")}*\n`;
    if (type === "teacher") {
      text += `👨‍🏫 *Öğretmen:* ${entityName}\n`;
    } else {
      text += `🏫 *Sınıf:* ${entityName}\n`;
    }
    text += `📅 *Haftalık Ders Programı*\n`;
    text += `────────────────────\n\n`;

    activeDays.forEach((day: any) => {
      const dIdx = day.id - 1;
      const dayLessons: string[] = [];
      for (let p = 0; p < day.periods; p++) {
        const val =
          type === "teacher"
            ? schedules[entityName]?.[dIdx]?.[p]
            : classSchedules[entityName]?.[dIdx]?.[p];
        if (val) {
          const parsed = parseCellData(val);
          if (parsed && parsed.subject) {
            const timeStr = parsed.time ? ` (${parsed.time})` : "";
            const targetStr =
              type === "teacher"
                ? parsed.classes && parsed.classes.length
                  ? ` - Sınıf: ${parsed.classes.join(", ")}`
                  : ""
                : parsed.teacher
                  ? ` - Öğr: ${parsed.teacher}`
                  : "";
            const roomStr = parsed.room ? ` [Derslik: ${parsed.room}]` : "";
            dayLessons.push(
              `${p + 1}. Ders${timeStr}: *${parsed.subject}*${targetStr}${roomStr}`,
            );
          }
        }
      }
      if (dayLessons.length > 0) {
        text += `📌 *${day.name.toLocaleUpperCase("tr-TR")}*\n`;
        dayLessons.forEach((l) => {
          text += `  ${l}\n`;
        });
        text += `\n`;
      }
    });

    text += `────────────────────`;
    return text;
  };

  const handleShareWhatsApp = (
    entityName?: string,
    type?: "teacher" | "class",
  ) => {
    const target = entityName || selectedEntities[0];
    const targetType = type || (exportType === "class" ? "class" : "teacher");
    if (!target) return;
    const text = getWhatsAppShareText(target, targetType);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    const win = window.open(url, "_blank");
    if (!win) {
      window.location.href = url;
    }
  };

  const handleCopyWhatsAppText = (
    entityName?: string,
    type?: "teacher" | "class",
  ) => {
    const target = entityName || selectedEntities[0];
    const targetType = type || (exportType === "class" ? "class" : "teacher");
    if (!target) return;
    const text = getWhatsAppShareText(target, targetType);
    navigator.clipboard.writeText(text);
    setCopiedTextNotification(true);
    setTimeout(() => setCopiedTextNotification(false), 2000);
  };

  const handleShareWhatsAppImage = async (
    entityName?: string,
    type?: "teacher" | "class",
  ) => {
    const target = entityName || selectedEntities[0];
    const targetType = type || (exportType === "class" ? "class" : "teacher");
    if (!target) return;

    setIsSharingPNG(true);
    try {
      const canvas = createRenderedCanvas();
      if (!canvas) {
        setIsSharingPNG(false);
        return;
      }

      const safeEntity = target.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, "_");
      const filename = `Program_${targetType}_${safeEntity}.png`;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) {
        setIsSharingPNG(false);
        return;
      }

      const file = new File([blob], filename, { type: "image/png" });
      const shareText = getWhatsAppShareText(target, targetType);

      // Check if Web Share API with files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `${target} Haftalık Ders Programı`,
            text: shareText,
          });
          return;
        } catch (shareErr: any) {
          if (shareErr?.name === "AbortError") {
            // User cancelled share sheet
            return;
          }
          console.log("Native file share fallback:", shareErr);
        }
      }

      // Fallback for browsers without direct file share API:
      // 1. Download PNG image to device
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Try copying PNG image to clipboard if supported
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        }
      } catch (clipErr) {
        console.log("Clipboard image copy info:", clipErr);
      }

      // 3. Open WhatsApp with summary text
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        shareText +
          `\n\n📌 *Not:* PNG Program Resmi cihazınıza indirildi. WhatsApp sohbetinde ataç/resim butonuna dokunarak görseli gönderebilirsiniz.`,
      )}`;
      const win = window.open(url, "_blank");
      if (!win) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("PNG WhatsApp sharing error:", err);
    } finally {
      setIsSharingPNG(false);
    }
  };

  const handleCopyLink = () => {
    if (!selectedEntities[0]) return;
    const link = getShareLink(selectedEntities[0]);
    navigator.clipboard.writeText(link);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  if (!isOpen && !isInline) return null;

  const currentList = exportType === "teacher" ? teachers : classes;

  // Filter teachers in school view
  const filteredTeachersForSchool = teachers.filter((t) =>
    t.toLowerCase().includes(schoolSearchQuery.toLowerCase()),
  );

  const innerContent = (
    <div
      className={
        isInline ? "bg-white md:rounded-xl shadow-sm w-full flex-1 flex flex-col h-full overflow-hidden border-0 md:border border-slate-200 min-h-0" : "bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-6xl flex flex-col h-[92vh] overflow-hidden border border-slate-200 relative min-h-0"
      }
    >
      {/* Mobile Drag Handle (Modal only) */}
      {!isInline && (
        <div className="w-full flex justify-center pt-3 pb-2 md:hidden shrink-0 touch-none bg-slate-50">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>
      )}

      {/* Top Header / Toolbar */}
      <div className="flex flex-col border-b border-slate-200 bg-white shrink-0">
        {/* Header Title Row */}
        <div className={`items-center justify-between px-3 py-2.5 md:px-6 md:py-3.5 bg-slate-50/80 ${isInline ? "hidden md:flex" : "flex"}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95">
              {activeTab === "qr" ? <QrCode className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 leading-tight">
                {activeTab === "qr"
                  ? "Mobil QR & WhatsApp Paylaşım Merkezi"
                  : exportType === "teacher"
                    ? "Öğretmen Programı Önizleme"
                    : exportType === "class"
                      ? "Sınıf Programı Önizleme"
                      : "Okul Genel Çarşaf Listesi"}
              </h2>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                {schoolInfo.name || "Okul"} • {activeTab === "qr" ? "Mobil Erişim & Paylaşım" : (schoolInfo.year || "2026-2027")}
              </p>
            </div>
          </div>

          {!isInline && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Type Switcher Bar */}
        <div className="px-2.5 py-1 md:px-6 md:py-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
          {/* Segmented Type Controls */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:flex-nowrap bg-slate-100 p-1 sm:p-0.5 rounded-xl gap-1 sm:gap-0 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setExportType("teacher");
                setActiveTab("print");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-1.5 px-2 sm:px-4 rounded-lg font-bold text-xs transition-all ${
                exportType === "teacher" && activeTab === "print"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 active:bg-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Öğretmenler</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setExportType("class");
                setActiveTab("print");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-1.5 px-2 sm:px-4 rounded-lg font-bold text-xs transition-all ${
                exportType === "class" && activeTab === "print"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 active:bg-slate-200"
              }`}
            >
              <Book className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Sınıflar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setExportType("school");
                setActiveTab("print");
              }}
              className={`hidden sm:flex flex-none items-center justify-center gap-1.5 py-1.5 px-3 md:px-4 rounded-lg font-bold text-xs transition-all ${
                exportType === "school" && activeTab === "print"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 active:bg-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Çarşaf Liste</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-1.5 px-2 sm:px-4 rounded-lg font-bold text-xs transition-all ${
                activeTab === "qr"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 active:bg-slate-200"
              }`}
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Mobil QR & WhatsApp</span>
              <span className="sm:hidden truncate">Paylaşım</span>
            </button>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="hidden sm:flex flex-wrap items-center gap-1.5 w-full sm:w-auto pt-1 sm:pt-0 pb-1 sm:pb-0">
            <button
              type="button"
              onClick={generatePDF}
              disabled={isExportingPDF}
              className="shrink-0 flex items-center gap-1 bg-indigo-600   text-white px-2.5 py-1.5 rounded-lg text-xs font-bold  -xs disabled:opacity-60 cursor-pointer -md hover:-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
              title="Vektörel PDF Olarak İndir"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPDF ? "Hazırlanıyor..." : "PDF İndir"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="shrink-0 flex items-center gap-1 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Doğrudan Yazıcıya Gönder"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>

            <button
              type="button"
              onClick={generateExcel}
              className="shrink-0 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Excel (XLSX) Formatında İndir"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={downloadImage}
              disabled={isExportingImage}
              className="shrink-0 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
              title="Resim (PNG) Olarak Kaydet"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Resim (PNG)</span>
            </button>
          </div>
        </div>

        {/* Secondary Sub-Controls Bar (Entity Selectors / Stepper / Search / View Modes) */}
        {activeTab === "print" && (
          <div className="px-3 py-3 md:px-6 md:py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-inner">
            {/* When viewing Teacher or Class: Selection */}
            {(exportType === "teacher" || exportType === "class") && (
              <>
                {/* Desktop View: Multi-Select (Collapsible) */}
                <div className="hidden sm:flex flex-col w-full max-w-3xl border border-slate-300 bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div 
                    className="flex justify-between items-center px-3 py-2.5 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMultiSelectOpen(!isMultiSelectOpen)}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        {exportType === "teacher"
                          ? "Öğretmen Seçimi"
                          : "Sınıf Seçimi"}
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">
                          Çoklu Seçim
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {selectedEntities.length} kayıt seçildi. Seçimleri görmek ve düzenlemek için tıklayın.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntities(
                            exportType === "teacher"
                              ? [...teachers]
                              : [...classes],
                          );
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95"
                      >
                        Tümünü Seç
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntities([]);
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95"
                      >
                        Temizle
                      </button>
                      <div className="text-slate-400 ml-1">
                        {isMultiSelectOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Content (Collapsible) */}
                  <AnimatePresence>
                    {isMultiSelectOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-200 bg-slate-50/50"
                      >
                        <div className="p-3">
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {(exportType === "teacher" ? teachers : classes).map(
                              (item) => (
                                <button
                                  key={item}
                                  onClick={() => {
                                    setSelectedEntities((prev) =>
                                      prev.includes(item)
                                        ? prev.filter((i) => i !== item)
                                        : [...prev, item],
                                    );
                                  }}
                                  className={`px-3 py-1.5 text-[11px] rounded-lg font-extrabold transition-all shadow-2xs cursor-pointer ${
                                    selectedEntities.includes(item)
                                      ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200 ring-offset-1"
                                      : "bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold"
                                  }`}
                                >
                                  {item}
                                </button>
                              ),
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-3 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span>Önizlemede (ve sistemden yazdırmada) sadece 1. seçili kayıt görünür. Çoklu dışa aktarım için "PDF/Excel İndir"i kullanın.</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile View: Single Select for Preview + Mode Selector */}
                <div className="flex sm:hidden flex-col w-full gap-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {exportType === "teacher" ? "Öğretmen Seçimi" : "Sınıf Seçimi"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                        {selectedEntities[0] ? calculateEntityTotalHours(selectedEntities[0]) : 0} Saat Ders
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {currentEntityIndex >= 0 ? currentEntityIndex + 1 : 1}/{currentEntityList.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={handlePrevEntity}
                      title="Önceki"
                      className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="relative flex-1 min-w-0">
                      <select
                        className="w-full appearance-none bg-white border border-slate-300 rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-extrabold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate min-h-[44px]"
                        value={selectedEntities[0] || ""}
                        onChange={(e) => setSelectedEntities([e.target.value])}
                      >
                        <option value="" disabled>
                          Seçiniz...
                        </option>
                        {(exportType === "teacher" ? teachers : classes).map(
                          (item) => (
                            <option key={item} value={item}>
                              {item} ({calculateEntityTotalHours(item)} Saat)
                            </option>
                          ),
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextEntity}
                      title="Sonraki"
                      className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobil Görünüm Modu Seçici (Kartlar / Tablo) */}
                  <div className="grid grid-cols-2 bg-slate-200/80 p-1 rounded-xl gap-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setMobileScheduleViewMode("cards")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-extrabold text-xs transition-all ${
                        mobileScheduleViewMode === "cards"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-700 hover:text-slate-900 active:bg-slate-100"
                      }`}
                    >
                      <LayoutList className="w-4 h-4" />
                      <span>Kartlar (Saat Saat)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileScheduleViewMode("table")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-extrabold text-xs transition-all ${
                        mobileScheduleViewMode === "table"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-700 hover:text-slate-900 active:bg-slate-100"
                      }`}
                    >
                      <TableIcon className="w-4 h-4" />
                      <span>Tablo (Tüm Hafta)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain ${
          activeTab === "qr"
            ? "bg-slate-100/90 custom-scrollbar p-2 sm:p-4 pb-48 sm:pb-12"
            : "bg-slate-100 custom-scrollbar p-2 sm:p-4 md:p-6 pb-48 sm:pb-12 print:p-0 print:bg-white print:overflow-visible"
        }`}
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
          {/* TAB 1: Print / Preview */}
          {activeTab === "print" && (
            <div
              ref={printRef}
              id="printable-schedule-area"
              className="bg-white p-0 sm:p-6 md:p-8 shadow-none sm:shadow-md md:shadow-lg rounded-none sm:rounded-xl md:rounded-2xl print:shadow-none print:p-0 print:m-0 w-full max-w-7xl mx-auto min-h-0"
            >
              {/* Embedded Print CSS */}
                <style>{`
                @media print {
                @page {
                  size: landscape;
                  margin: 8mm;
                }
                body {
                  background: white !important;
                  color: black !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .no-print {
                  display: none !important;
                }
                #printable-schedule-area {
                  width: 100% !important;
                  max-width: 100% !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                }
                .print-matrix-table {
                  display: table !important;
                  width: 100% !important;
                  table-layout: fixed !important;
                  border-collapse: collapse !important;
                }
                .print-matrix-table th, .print-matrix-table td {
                  border: 1px solid #94a3b8 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .print-matrix-table td {
                  height: 22mm !important;
                }
              }
            `}</style>

              {/* Header Document Banner */}
              <div className="hidden sm:flex flex-col items-center text-center border-b-2 border-slate-800 pb-3 mb-3 md:pb-4 md:mb-4">
                <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 uppercase tracking-wider">
                  {schoolInfo.name || "OKUL ADI"}
                </h1>
                <h2 className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">
                  {schoolInfo.year || "2026-2027"} EĞİTİM ÖĞRETİM YILI
                </h2>
                <div className="mt-2 text-xs sm:text-sm font-extrabold text-indigo-900 border border-indigo-200 bg-indigo-50 px-3 md:px-4 py-1 rounded-full inline-flex items-center gap-2 text-center">
                  <span>
                    {exportType === "teacher"
                      ? `${(selectedEntities[0] || "ÖĞRETMEN").toLocaleUpperCase("tr-TR")} HAFTALIK DERS PROGRAMI`
                      : exportType === "class"
                        ? `${(selectedEntities[0] || "SINIF").toLocaleUpperCase("tr-TR")} SINIFI HAFTALIK DERS PROGRAMI`
                        : "OKUL GENEL ÇARŞAF LİSTESİ"}
                  </span>
                  {(exportType === "teacher" || exportType === "class") && (
                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs">
                      {selectedEntities[0]
                        ? calculateEntityTotalHours(selectedEntities[0])
                        : 0}{" "}
                      Saat
                    </span>
                  )}
                </div>
              </div>

              {/* VIEW A: OKUL GENEL ÇARŞAF LİSTESİ */}
              {exportType === "school" && (
                <>
                  {/* 1. MOBILE CARD VIEW FOR ÇARŞAF LİSTE */}
                  <div className={mobileScheduleViewMode === "cards" ? "space-y-4 block lg:hidden print:hidden" : "hidden"}>
                      {/* All Days Vertical List */}
                      <div className="space-y-6">
                        {activeDays.map((currentDay: any) => {
                          const dIdx = currentDay.id - 1;
                          const daySlots: any[] = [];
                          let activeCount = 0;
                          for (let p = 0; p < currentDay.periods; p++) {
                            const val =
                              exportType === "teacher"
                                ? schedules[selectedEntities[0]]?.[dIdx]?.[p]
                                : classSchedules[selectedEntities[0]]?.[dIdx]?.[p];
                            const parsed = val ? parseCellData(val) : null;
                            if (parsed) activeCount++;
                            daySlots.push({
                              period: p,
                              time: schoolSettings?.lessonTimes?.[p],
                              data: parsed,
                            });
                          }
                          return (
                            <div key={currentDay.id} className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                              {/* Table Header Banner */}
                              <div className="bg-slate-900 text-white px-2 py-1.5 sm:px-3.5 sm:py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-indigo-400" />
                                  <span className="font-black text-xs sm:text-sm tracking-wide">
                                    {selectedEntities[0]} — {currentDay.name.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                  {activeCount} Ders
                                </span>
                              </div>
                              {/* Detailed Day Schedule Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-max text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold text-[9px] sm:text-[11px]">
                                      <th className="p-1 sm:p-2.5 text-center w-12 sm:w-24 leading-tight">
                                        Saat / Ders
                                      </th>
                                      <th className="p-1 sm:p-2.5 leading-tight">Ders Adı</th>
                                      <th className="p-1 sm:p-2.5 leading-tight">
                                        {exportType === "teacher"
                                          ? "Sınıf(lar)"
                                          : "Öğretmen(ler)"}
                                      </th>
                                      <th className="p-1 sm:p-2.5 text-center leading-tight">
                                        Derslik
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {daySlots.map(({ period, time, data }) => (
                                      <tr
                                        key={period}
                                        className={
                                          data
                                            ? "bg-indigo-50/25 hover:bg-indigo-50/40"
                                            : "bg-slate-50/20"
                                        }
                                      >
                                        {/* Period Number & Time */}
                                        <td className="p-1 sm:p-2 text-center align-middle font-bold">
                                          <div className="flex flex-col items-center">
                                            <span className="text-indigo-700 font-black text-[10px] sm:text-xs">
                                              {period + 1}. Ders
                                            </span>
                                            {time && (
                                              <span className="text-[8px] sm:text-[9.5px] text-slate-500 font-medium tracking-tighter">
                                                {time.start} - {time.end}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        {/* Subject Name */}
                                        <td className="p-1 sm:p-2 align-middle font-bold text-slate-900">
                                          {data ? (
                                            <span className="text-[10px] sm:text-xs font-black text-indigo-950 leading-tight">
                                              {data.subject}
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 font-normal italic text-[10px] sm:text-[11px]">
                                              Boş
                                            </span>
                                          )}
                                        </td>
                                        {/* Target Classes or Teachers */}
                                        <td className="p-1 sm:p-2 align-middle text-slate-800 font-bold text-[10px] sm:text-xs leading-tight">
                                          {data ? (
                                            <span>
                                              {exportType === "teacher"
                                                ? data.classes?.join(", ")
                                                : data.teachers?.join(", ")}
                                            </span>
                                          ) : (
                                            <span className="text-slate-300">
                                              -
                                            </span>
                                          )}
                                        </td>
                                        {/* Room */}
                                        <td className="p-1 sm:p-2 text-center align-middle">
                                          {data?.rooms &&
                                          data.rooms.length > 0 ? (
                                            <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-1 sm:px-2 py-0.5 rounded font-bold text-[8px] sm:text-[10px] leading-tight">
                                              <MapPin className="w-2.5 h-2.5" />
                                              {data.rooms.join(", ")}
                                            </span>
                                          ) : (
                                            <span className="text-slate-300 text-xs">
                                              -
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  {/* 2. FULL MATRIX TABLE VIEW FOR ÇARŞAF LİSTE */}
                  <div
                    className={`overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none ${mobileScheduleViewMode === "table" ? "block" : "hidden lg:block"} print:block`}
                  >
                    <table
                      className={`w-full min-w-[800px] lg:min-w-full print:min-w-0 border-collapse table-fixed ${isCompactSchoolView ? "text-[9.5px]" : "text-xs"} print:text-[8px]`}
                    >
                      <thead>
                        {/* Row 1: Teacher Header + Day Groupings */}
                        <tr className="transition-colors hover:bg-slate-50/80">
                          <th
                            rowSpan={2}
                            style={{ width: "120px" }}
                            className="sticky left-0 bg-slate-200 z-30 border-r-2 border-b-2 border-slate-400 p-2 font-black text-slate-900 text-left shadow-xs print:static"
                          >
                            Öğretmen
                          </th>
                          {activeDays.map((day: any) => (
                            <th
                              key={day.id}
                              colSpan={day.periods}
                              className="border border-slate-300 bg-indigo-50/80 p-1.5 font-black text-indigo-900 text-center tracking-wide uppercase border-b-2"
                            >
                              {typeof window !== "undefined" && window.innerWidth < 640 ? day.name.substring(0, 3) : day.name}
                            </th>
                          ))}
                        </tr>
                        {/* Row 2: Period Numbers and Times */}
                        <tr className="transition-colors hover:bg-slate-50/80">
                          {activeDays.map((day: any) =>
                            Array.from({ length: day.periods }).map((_, p) => (
                              <th
                                key={`${day.id}-${p}`}
                                className={`border border-slate-300 bg-slate-100 font-bold text-slate-700 text-center ${
                                  isCompactSchoolView
                                    ? "p-1 min-w-[50px]"
                                    : "p-1.5 min-w-[65px]"
                                }`}
                              >
                                <span className="font-extrabold">{p + 1}</span>
                                <div className="text-[8px] font-normal text-slate-500 whitespace-nowrap">
                                  {schoolSettings?.lessonTimes?.[p]?.start}
                                </div>
                              </th>
                            )),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredTeachersForSchool.length === 0 ? (
                          <tr className="transition-colors hover:bg-slate-50/80">
                            <td
                              colSpan={100}
                              className="p-8 text-center text-slate-400 text-sm font-semibold"
                            >
                              Eşleşen öğretmen bulunamadı.
                            </td>
                          </tr>
                        ) : (
                          filteredTeachersForSchool.map((t, tIdx) => {
                            // Calculate total hours for this teacher
                            let tHours = 0;
                            activeDays.forEach((d: any) => {
                              const dIdx = d.id - 1;
                              for (let p = 0; p < d.periods; p++) {
                                if (schedules[t]?.[dIdx]?.[p]) tHours++;
                              }
                            });

                            return (
                              <tr
                                key={t}
                                className={
                                  tIdx % 2 === 0
                                    ? "bg-white hover:bg-slate-50"
                                    : "bg-slate-50/50 hover:bg-slate-100/70"
                                }
                              >
                                {/* Sticky Left Column: Teacher Name */}
                                <td className="sticky left-0 bg-inherit z-20 border-r-2 border-slate-400 p-2 font-bold text-slate-900 truncate max-w-[140px] shadow-2xs">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="truncate">{t}</span>
                                    <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold shrink-0">
                                      {tHours}s
                                    </span>
                                  </div>
                                </td>

                                {/* Schedule Cells */}
                                {activeDays.map((day: any) => {
                                  const dIdx = day.id - 1;
                                  return Array.from({
                                    length: day.periods,
                                  }).map((_, p) => {
                                    const val = schedules[t]?.[dIdx]?.[p];
                                    const cellData = val
                                      ? parseCellData(val)
                                      : null;

                                    if (!cellData) {
                                      return (
                                        <td
                                          key={`${day.id}-${p}`}
                                          className={`border border-slate-200 text-center align-middle ${
                                            isCompactSchoolView
                                              ? "p-0.5 h-10"
                                              : "p-1 h-12"
                                          }`}
                                        >
                                          <span className="text-slate-300 font-light text-[10px]">
                                            ·
                                          </span>
                                        </td>
                                      );
                                    }

                                    const { subClass, clsClass } =
                                      getAdaptiveSchoolTypography(
                                        cellData.subject,
                                        cellData.classes?.join(", ") || "",
                                      );

                                    return (
                                      <td
                                        key={`${day.id}-${p}`}
                                        className={`border border-slate-200 text-center align-middle bg-indigo-50/40 ${
                                          isCompactSchoolView
                                            ? "p-0.5 h-10"
                                            : "p-1 h-12"
                                        }`}
                                      >
                                        <div className="flex flex-col items-center justify-center leading-tight">
                                          <span
                                            className={`${subClass} truncate max-w-[65px]`}
                                          >
                                            {cellData.subject}
                                          </span>
                                          <span
                                            className={`${clsClass} truncate max-w-[65px]`}
                                          >
                                            {cellData.classes?.join(", ")}
                                          </span>
                                        </div>
                                      </td>
                                    );
                                  });
                                })}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* VIEW B: ÖĞRETMEN VEYA SINIF PROGRAMI */}
              {(exportType === "teacher" || exportType === "class") && (
                <>
                  {/* 1. MOBILE RESPONSIVE SCHEDULE SYSTEM */}
                  <div className={mobileScheduleViewMode === "cards" ? "space-y-3 block lg:hidden print:hidden" : "hidden"}>
                    {/* Day Selector Tabs */}
                    <div className="bg-slate-50/95 p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center justify-between px-1 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                            GÜN SEÇİMİ
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newIdx =
                                selectedDayIndex <= 0
                                  ? activeDays.length - 1
                                  : selectedDayIndex - 1;
                              setSelectedDayIndex(newIdx);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Önceki Gün"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                            {activeDays[selectedDayIndex]?.name || "PAZARTESİ"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newIdx =
                                (selectedDayIndex + 1) % activeDays.length;
                              setSelectedDayIndex(newIdx);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Sonraki Gün"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Flex wrapped day tabs */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5 pb-1 pt-0.5 touch-manipulation">
                        {activeDays.map((day: any, idx: number) => {
                          const dIdx = day.id - 1;
                          let daySlotsCount = 0;
                          const totalDayPeriods = Math.max(day.periods || 0, 9);
                          for (let p = 0; p < totalDayPeriods; p++) {
                            const val =
                              exportType === "teacher"
                                ? schedules[selectedEntities[0]]?.[dIdx]?.[p]
                                : classSchedules[selectedEntities[0]]?.[
                                    dIdx
                                  ]?.[p];
                            if (val) daySlotsCount++;
                          }

                          const isSelected = selectedDayIndex === idx;

                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => setSelectedDayIndex(idx)}
                              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 touch-manipulation min-h-[48px] ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/30"
                                  : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100/80 shadow-2xs"
                              }`}
                            >
                              <span className="font-black text-[11px] tracking-tight leading-tight">
                                {getShortDayName(day.name)}
                              </span>
                              <span
                                className={`text-[9px] font-black mt-1 px-1.5 py-0.5 rounded-full leading-none ${
                                  isSelected
                                    ? "bg-white/25 text-white"
                                    : daySlotsCount > 0
                                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                      : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {daySlotsCount}D
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* GÜNLÜK 9 DERS SAATİ KARTLARI (TÜM PROGRAM) */}
                    {(() => {
                      const currentDay =
                        activeDays[selectedDayIndex] || activeDays[0];
                      if (!currentDay) return null;
                      const dIdx = currentDay.id - 1;

                      const getMobileCellData = (entityName: string, dayIndex: number, periodIndex: number) => {
                        if (!entityName) return null;
                        const normTarget = entityName.trim().toLowerCase();
                        if (exportType === "teacher") {
                          let val = schedules[entityName]?.[dayIndex]?.[periodIndex];
                          if (!val) {
                            for (const [tKey, tSched] of Object.entries(schedules || {})) {
                              if (tKey.trim().toLowerCase() === normTarget) {
                                val = tSched?.[dayIndex]?.[periodIndex];
                                if (val) break;
                              }
                            }
                          }
                          if (!val) {
                            for (const [cKey, cSched] of Object.entries(classSchedules || {})) {
                              const cCell = cSched?.[dayIndex]?.[periodIndex];
                              if (cCell) {
                                const cParsed = parseCellData(cCell);
                                if (cParsed && (
                                  cParsed.teachers?.some((t: string) => t?.trim().toLowerCase() === normTarget) ||
                                  (cParsed.teacher && cParsed.teacher.trim().toLowerCase() === normTarget)
                                )) {
                                  const existingClasses = [...(cParsed.classes || [])];
                                  if (!existingClasses.includes(cKey)) {
                                    existingClasses.push(cKey);
                                  }
                                  return { ...cParsed, classes: existingClasses };
                                }
                              }
                            }
                          }
                          return val ? parseCellData(val) : null;
                        } else {
                          let val = classSchedules[entityName]?.[dayIndex]?.[periodIndex];
                          if (!val) {
                            for (const [cKey, cSched] of Object.entries(classSchedules || {})) {
                              if (cKey.trim().toLowerCase() === normTarget) {
                                val = cSched?.[dayIndex]?.[periodIndex];
                                if (val) break;
                              }
                            }
                          }
                          if (!val) {
                            for (const [tKey, tSched] of Object.entries(schedules || {})) {
                              const tCell = tSched?.[dayIndex]?.[periodIndex];
                              if (tCell) {
                                const tParsed = parseCellData(tCell);
                                if (tParsed && (
                                  tParsed.classes?.some((c: string) => c?.trim().toLowerCase() === normTarget) ||
                                  (tParsed.className && tParsed.className.trim().toLowerCase() === normTarget)
                                )) {
                                  const existingTeachers = [...(tParsed.teachers || [])];
                                  if (!existingTeachers.includes(tKey)) {
                                    existingTeachers.push(tKey);
                                  }
                                  return { ...tParsed, teachers: existingTeachers };
                                }
                              }
                            }
                          }
                          return val ? parseCellData(val) : null;
                        }
                      };

                      const targetPeriods = Math.max(currentDay.periods || 0, maxPeriods, 9);
                      const daySlots: any[] = [];
                      let activeCount = 0;
                      for (let p = 0; p < targetPeriods; p++) {
                        const parsed = getMobileCellData(selectedEntities[0], dIdx, p);
                        if (parsed) activeCount++;
                        daySlots.push({
                          period: p,
                          time: schoolSettings?.lessonTimes?.[p],
                          data: parsed,
                        });
                      }

                      return (
                        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                          {/* Banner Header */}
                          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 flex items-center justify-between border-b border-indigo-950">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 flex items-center justify-center shrink-0">
                                {exportType === "teacher" ? (
                                  <Users className="w-5 h-5 text-indigo-300" />
                                ) : (
                                  <Book className="w-5 h-5 text-indigo-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-sm sm:text-base tracking-tight truncate text-white">
                                  {selectedEntities[0]}
                                </div>
                                <div className="text-[11px] text-indigo-200/90 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                  <span className="text-amber-300">{currentDay.name} Günü</span>
                                  <span className="text-slate-400">•</span>
                                  <span>1 - {targetPeriods}. Ders Saatleri</span>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                                  activeCount > 0
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                                    : "bg-slate-800 text-slate-400 border-slate-700"
                                }`}
                              >
                                {activeCount > 0
                                  ? `${activeCount} Dolu / ${targetPeriods - activeCount} Boş`
                                  : "Tümü Boş"}
                              </span>
                            </div>
                          </div>

                          {/* 9 Lesson Periods Vertical Feed (Full Scrollable List) */}
                          <div className="p-2.5 sm:p-3 space-y-2.5 bg-slate-50/70">
                            {daySlots.map(({ period, time, data }) => {
                              const hasData = !!data;
                              const secondaryInfo =
                                exportType === "teacher"
                                  ? data?.classes?.join(", ") || ""
                                  : data?.teachers?.join(", ") || "";
                              const hasRoom = !!(
                                data?.rooms && data.rooms.length > 0
                              );

                              return (
                                <div
                                  key={period}
                                  className={`rounded-xl border transition-all p-3 flex items-center justify-between gap-3 ${
                                    hasData
                                      ? "bg-white border-indigo-200/90 shadow-xs hover:border-indigo-400 ring-1 ring-indigo-100"
                                      : "bg-slate-50/80 border-dashed border-slate-200 text-slate-400"
                                  }`}
                                >
                                  {/* Left: Period Badge and Time */}
                                  <div className={`flex flex-col items-center justify-center shrink-0 w-16 sm:w-20 py-1.5 px-1 rounded-lg border ${
                                    hasData
                                      ? "bg-indigo-50/90 border-indigo-200/80 text-indigo-900"
                                      : "bg-slate-100/90 border-slate-200/70 text-slate-500"
                                  }`}>
                                    <span className="text-xs font-black leading-none">
                                      {period + 1}. Ders
                                    </span>
                                    {time && (
                                      <span className="text-[9.5px] font-semibold text-slate-600 tracking-tighter mt-1 leading-none">
                                        {time.start} - {time.end}
                                      </span>
                                    )}
                                  </div>

                                  {/* Middle: Subject & Class/Teacher Assignment Information */}
                                  <div className="flex-1 min-w-0">
                                    {hasData ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                                            {data.subject}
                                          </span>
                                          {hasRoom && (
                                            <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                              <MapPin className="w-2.5 h-2.5 text-amber-600" />
                                              {data.rooms.join(", ")}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                                          <span className="text-slate-500 font-bold text-[11px]">
                                            {exportType === "teacher"
                                              ? "Sınıf:"
                                              : "Öğretmen:"}
                                          </span>
                                          <span className="bg-indigo-600 text-white font-black px-2 py-0.5 rounded-md shadow-2xs text-xs">
                                            {secondaryInfo || "Belirtilmemiş"}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-400 italic">
                                          Boş Saat (Ders Yok)
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Status Pill */}
                                  <div className="shrink-0">
                                    {hasData ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        Dolu
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-100">
                                        Boş
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer */}
                          <div className="bg-slate-50 px-3.5 py-2.5 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">
                              {currentDay.name} Toplam:{" "}
                              <strong className="text-indigo-900 font-extrabold">
                                {activeCount} saat ders
                              </strong>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleShareWhatsApp(selectedEntities[0])
                              }
                              className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp Paylaş</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 2. CLASSIC MATRIX TABLE VIEW (Active on desktop or when printing) */}
                  <div className={`w-full border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none ${mobileScheduleViewMode === "table" ? "block" : "hidden lg:block"} print:block overflow-x-auto custom-scrollbar`}>
                    <table className="w-full min-w-[500px] lg:min-w-full print:min-w-0 text-[6px] xs:text-[7px] sm:text-[9px] md:text-[10px] lg:text-[11px] border-collapse table-fixed print-matrix-table break-words leading-none sm:leading-tight">
                      <thead>
                        <tr className="transition-colors hover:bg-slate-50/80">
                          <th
                            style={{ width: "10%" }}
                            className="sticky left-0 bg-slate-200 z-20 border-r border-b border-slate-400 p-0.5 sm:p-2 font-black text-slate-900 text-center print:static text-[7px] sm:text-[11px]"
                          >
                            Gün
                          </th>
                          {Array.from({ length: maxPeriods }).map((_, i) => (
                            <th
                              key={i}
                              style={{ width: `${90 / maxPeriods}%` }}
                              className="border border-slate-300 bg-slate-100 p-0.5 sm:p-1.5 md:p-2 font-bold text-slate-700 text-center"
                            >
                              <span className="font-black text-[7px] sm:text-[11px] md:text-xs leading-none">
                                {i + 1}. Ders
                              </span>
                              <div className="text-[5px] sm:text-[8.5px] md:text-[9px] font-normal text-slate-500 mt-0.5 whitespace-normal sm:whitespace-nowrap leading-none">
                                {schoolSettings?.lessonTimes?.[i]?.start} -{" "}
                                {schoolSettings?.lessonTimes?.[i]?.end}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeDays.map((day: any) => {
                          const dIdx = day.id - 1;
                          return (
                            <tr key={day.id} className="hover:bg-slate-50">
                              <td className="sticky left-0 bg-slate-100 z-10 border-r border-slate-400 p-0.5 sm:p-2 font-bold text-slate-800 text-center print:static text-[7px] sm:text-xs">
                                {typeof window !== "undefined" && window.innerWidth < 640 ? day.name.substring(0, 3) : day.name}
                              </td>
                              {Array.from({ length: maxPeriods }).map(
                                (_, i) => {
                                  const val =
                                    exportType === "teacher"
                                      ? schedules[selectedEntities[0]]?.[
                                          dIdx
                                        ]?.[i]
                                      : classSchedules[selectedEntities[0]]?.[
                                          dIdx
                                        ]?.[i];
                                  const cellData = val
                                    ? parseCellData(val)
                                    : null;

                                  if (!cellData) {
                                    return (
                                      <td
                                        key={i}
                                        className="border border-slate-200 p-0 sm:p-1 text-center h-12 sm:h-16 md:h-20 print:h-[22mm] align-middle"
                                      >
                                        <span className="text-slate-300 font-light text-sm">
                                          -
                                        </span>
                                      </td>
                                    );
                                  }

                                  const secondary =
                                    exportType === "teacher"
                                      ? cellData.classes?.join(", ") || ""
                                      : cellData.teachers?.join(", ") || "";
                                  const hasRoom = !!(
                                    cellData.rooms && cellData.rooms.length > 0
                                  );

                                  const { subjectStyle, secondaryStyle } =
                                    getAdaptiveCellTypography(
                                      cellData.subject,
                                      secondary,
                                      hasRoom,
                                    );

                                  return (
                                    <td
                                      key={i}
                                      className="border border-slate-200 p-0.5 sm:p-1 md:p-1.5 text-center h-12 sm:h-16 md:h-20 print:h-[22mm] align-middle bg-indigo-50/30 overflow-hidden"
                                    >
                                      <div className="flex flex-col items-center justify-center gap-0.5 w-full h-full">
                                        <span
                                          className={`font-black text-indigo-950 text-[6px] xs:text-[7px] sm:text-[10px] md:text-[11px] leading-none sm:leading-tight break-words max-w-full`}
                                        >
                                          {cellData.subject}
                                        </span>
                                        <span
                                          className={`font-bold text-slate-700 text-[5px] xs:text-[6px] sm:text-[9px] md:text-[10px] leading-none sm:leading-tight mt-0.5 break-words max-w-full`}
                                        >
                                          {secondary}
                                        </span>
                                        {hasRoom && (
                                          <span className="text-[8px] md:text-[8.5px] text-amber-800 font-bold bg-amber-100/80 px-1 rounded">
                                            [{cellData.rooms.join(", ")}]
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  );
                                },
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Document Footer Signatures */}
              <div className="mt-6 md:mt-8 hidden sm:flex print:flex justify-between px-4 sm:px-10 text-xs md:text-sm font-bold text-slate-700 pt-3 border-t border-slate-200">
                <div className="text-center">
                  <p>Müdür Yardımcısı</p>
                  <p className="mt-1 font-normal text-slate-600">
                    {schoolInfo.vicePrincipal || "..................."}
                  </p>
                </div>
                <div className="text-center">
                  <p>Okul Müdürü</p>
                  <p className="mt-1 font-normal text-slate-600">
                    {schoolInfo.principal || "..................."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Mobile QR & WhatsApp Paylaşım Merkezi */}
          {activeTab === "qr" && (
            <div className="flex items-start justify-center w-full py-1 sm:py-6">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-sm sm:shadow-xl border border-slate-200/90 p-3 sm:p-6 flex flex-col items-center text-center my-0">
                {/* Header Banner */}
                <div className="flex items-center gap-2 mb-3 w-full pb-2.5 border-b border-slate-100 sm:border-0 sm:pb-0 sm:flex-col sm:mb-4">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-left sm:text-center flex-1 min-w-0">
                    <h3 className="font-black text-xs sm:text-lg text-slate-900 leading-tight">
                      WhatsApp & Mobil QR Paylaşım
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 leading-tight sm:mt-1 truncate sm:whitespace-normal">
                      Öğretmen ve sınıfların programlarını WhatsApp'tan anında iletin
                    </p>
                  </div>
                </div>

                {/* Type Switcher: Öğretmenler vs Sınıflar */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-full mb-3 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setExportType("teacher");
                      if (teachers.length > 0)
                        setSelectedEntities([teachers[0]]);
                    }}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                      exportType === "teacher"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Öğretmenler ({teachers.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExportType("class");
                      if (classes.length > 0) setSelectedEntities([classes[0]]);
                    }}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                      exportType === "class"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Book className="w-3.5 h-3.5" />
                    <span>Sınıflar ({classes.length})</span>
                  </button>
                </div>

                {/* Entity Picker with Prev/Next Controls */}
                <div className="w-full mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {exportType === "teacher" ? "Öğretmen Seçimi" : "Sınıf Seçimi"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                        {selectedEntities[0] ? calculateEntityTotalHours(selectedEntities[0]) : 0} Saat Ders
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {currentEntityIndex >= 0 ? currentEntityIndex + 1 : 1}/{currentEntityList.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={handlePrevEntity}
                      title="Önceki"
                      className="p-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="relative flex-1 min-w-0">
                      <select
                        value={selectedEntities[0] || ""}
                        onChange={(e) => setSelectedEntities([e.target.value])}
                        className="w-full p-2.5 pr-8 rounded-xl border border-slate-300 text-xs sm:text-sm font-extrabold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none shadow-2xs truncate min-h-[44px]"
                      >
                        {exportType === "teacher"
                          ? teachers.map((t) => (
                              <option key={t} value={t}>
                                {t} ({calculateEntityTotalHours(t)}s)
                              </option>
                            ))
                          : classes.map((c) => (
                              <option key={c} value={c}>
                                {c} ({calculateEntityTotalHours(c)}s)
                              </option>
                            ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextEntity}
                      title="Sonraki"
                      className="p-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Primary WhatsApp Action Buttons (Right below picker for immediate mobile access) */}
                <div className="w-full flex flex-col gap-2 mb-3">
                  {/* Primary Action 1: WhatsApp PNG Image Share Button */}
                  <button
                    type="button"
                    onClick={() => handleShareWhatsAppImage()}
                    disabled={isSharingPNG}
                    className="w-full py-3 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 min-h-[46px]"
                  >
                    {isSharingPNG ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate">WhatsApp ile PNG Görsel Paylaş</span>
                  </button>

                  {/* Primary Action 2: Direct WhatsApp Text Share Button */}
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp()}
                    className="w-full py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer min-h-[44px] shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">WhatsApp ile Ders Listesi Metni Paylaş</span>
                  </button>

                  {/* Secondary Action Buttons Row: Copy Link & Copy Text */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[40px]"
                    >
                      {copiedNotification ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                      <span className="truncate">
                        {copiedNotification
                          ? "Link Kopyalandı"
                          : "Canlı Linki Kopyala"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyWhatsAppText()}
                      className="py-2 px-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[40px]"
                    >
                      {copiedTextNotification ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className="truncate">
                        {copiedTextNotification
                          ? "Metin Kopyalandı"
                          : "Metni Kopyala"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* QR Code Section (Always visible on desktop, toggleable/compact on mobile) */}
                {selectedEntities.length > 0 && (
                  <div className="w-full bg-slate-50 rounded-2xl border border-slate-200/90 overflow-hidden mb-3">
                    <div 
                      onClick={() => setShowQrCodeMobile(!showQrCodeMobile)}
                      className="flex items-center justify-between p-3 cursor-pointer sm:cursor-default hover:bg-slate-100 sm:hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          Mobil QR Kod
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:hidden">
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {showQrCodeMobile ? "Gizle" : "Kodu Göster"}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showQrCodeMobile ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    <div className={`${showQrCodeMobile ? 'flex' : 'hidden sm:flex'} flex-col items-center p-3 pt-0 sm:pt-0`}>
                      <div className="p-2 sm:p-3 bg-white rounded-xl shadow-md border border-slate-200">
                        <QRCodeSVG
                          value={getShareLink(selectedEntities[0])}
                          size={130}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <span className="block font-black text-xs sm:text-sm text-slate-900 leading-tight">
                          {selectedEntities[0]}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium max-w-xs">
                          Telefon kamerasıyla okutulduğunda anlık haftalık programı açar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Message Preview Collapsible Box */}
                {selectedEntities.length > 0 && (
                  <div className="w-full text-left bg-slate-900 text-slate-200 rounded-xl p-3 border border-slate-800 text-[11px] font-mono leading-relaxed relative">
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
                      className="w-full flex items-center justify-between font-sans text-[10px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Mesaj Önizlemesi
                      </span>
                      <span className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition-colors">
                        {showWhatsAppPreview ? "Gizle" : "Metni Gör"}
                        {showWhatsAppPreview ? (
                          <ChevronUp className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        )}
                      </span>
                    </button>

                    {showWhatsAppPreview && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800">
                        <div className="flex justify-end mb-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyWhatsAppText()}
                            className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-sans"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            {copiedTextNotification ? "Kopyalandı!" : "Metni Kopyala"}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto overscroll-y-contain custom-scrollbar select-all">
                          {getWhatsAppShareText(
                            selectedEntities[0],
                            exportType === "class" ? "class" : "teacher",
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );

  if (isInline) {
    return innerContent;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 50 }}
          className="w-full md:max-w-6xl h-full md:h-auto"
        >
          {innerContent}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
