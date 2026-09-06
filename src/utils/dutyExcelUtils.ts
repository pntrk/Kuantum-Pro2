import ExcelJS from 'exceljs';
import { getAcademicWeekIndex, getShiftedTeachersForDay } from './dutyRotationUtils';

interface ExportRangeOptions {
  startDate: string;
  endDate: string;
  dutyLocations: string[];
  dutyAssignments: Record<string, string[]>;
  dutyAdmins: string[];
  adminRoles: Record<string, string>;
  adminSchedule: Record<number, string>;
  activeDays: { id: number; name: string }[];
  rotateTeachers: boolean;
  alternateAdmins: boolean;
  showWeekends: boolean;
  markHolidays: boolean;
  userHolidays: string[];
  academicYearStartDate?: string;
  principalName?: string;
  principalTitle?: string;
  generalRules?: string;
  attentionRules?: string;
}

interface ExportWeeklyOptions {
  activeDays: { id: number; name: string }[];
  dutyLocations: string[];
  dutyAssignments: Record<string, string[]>;
  dutyAdmins: string[];
  adminRoles: Record<string, string>;
  adminSchedule: Record<number, string>;
  principalName?: string;
  principalTitle?: string;
  generalRules?: string;
  attentionRules?: string;
}

// Styling Constants for Professional Presentation
const PALETTE = {
  headerBg: '1E293B',        // Slate 800 (Dark Navy/Slate)
  headerText: 'FFFFFF',
  subHeaderBg: 'F1F5F9',     // Slate 100
  titleBg: '0F172A',         // Slate 900
  accentYellow: 'FEF08A',    // Soft warm yellow for key locations
  accentYellowBorder: 'CA8A04',
  weekendBg: 'E2E8F0',       // Slate 200
  weekendText: '475569',     // Slate 600
  holidayBg: 'FEE2E2',       // Rose 100
  holidayText: '991B1B',     // Rose 800
  borderDark: '000000',      // Crisp black border
  borderMedium: '64748B',    // Slate 500
  borderLight: 'CBD5E1',     // Slate 300
  zebraRowBg: 'F8FAFC',      // Slate 50
  adminBg: 'FEF9C3',         // Amber 100 for admin column header
};

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } },
};

const mediumBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'medium', color: { argb: 'FF000000' } },
  left: { style: 'medium', color: { argb: 'FF000000' } },
  bottom: { style: 'medium', color: { argb: 'FF000000' } },
  right: { style: 'medium', color: { argb: 'FF000000' } },
};

/**
 * Professional Range Duty Schedule Excel Export
 */
export async function exportDutyRangeToExcel({
  startDate,
  endDate,
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
  principalName = '',
  principalTitle = 'Okul Müdürü',
  generalRules = '',
  attentionRules = ''
}: ExportRangeOptions) {
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

  const dStart = new Date(startDate);
  const dEnd = new Date(endDate);
  if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) return;

  const s = new Date(Math.min(dStart.getTime(), dEnd.getTime()));
  const e = new Date(Math.max(dStart.getTime(), dEnd.getTime()));

  const startFormatted = `${String(s.getDate()).padStart(2, '0')}.${String(s.getMonth() + 1).padStart(2, '0')}.${s.getFullYear()}`;
  const endFormatted = `${String(e.getDate()).padStart(2, '0')}.${String(e.getMonth() + 1).padStart(2, '0')}.${e.getFullYear()}`;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Atatürk Ortaokulu';
  workbook.lastModifiedBy = 'Nöbet Sistemi';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Nöbet Çizelgesi', {
    views: [{ showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2
      }
    }
  });

  const totalCols = 2 + dutyLocations.length + 1; // Tarih + Gün + Locations + Nöbetçi Md. Yrd.

  // 1. Title Row 1: School Title
  const titleRow1 = ws.addRow(['ATATÜRK ORTAOKULU MÜDÜRLÜĞÜ NÖBET ÇİZELGESİ']);
  ws.mergeCells(1, 1, 1, totalCols);
  titleRow1.height = 24;
  titleRow1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow1.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow1.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF' + PALETTE.titleBg }
  };

  // 2. Title Row 2: Date Range Subtitle
  const titleRow2 = ws.addRow([`${startFormatted} - ${endFormatted} TARİH ARALIĞI NÖBET DAĞITIM LİSTESİ`]);
  ws.mergeCells(2, 1, 2, totalCols);
  titleRow2.height = 19;
  titleRow2.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF1E293B' } };
  titleRow2.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow2.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF' + PALETTE.subHeaderBg }
  };

  // Empty Spacer Row
  const spacerRow = ws.addRow([]);
  spacerRow.height = 6;

  // 3. Table Column Headers
  const headerCols = ['TARİH', 'GÜN', ...dutyLocations, 'NÖBETÇİ MÜDÜR YARDIMCISI'];
  const headerRow = ws.addRow(headerCols);
  headerRow.height = 22;

  headerCols.forEach((colName, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    const isLocation = colIdx >= 2 && colIdx < totalCols - 1;
    const isYellowCol = isLocation && (
      colIdx === 2 || colIdx === 3 || colIdx === 6 || 
      colName.toUpperCase().includes('BAHÇE') || 
      colName.toUpperCase().includes('KAT2') || 
      colName.toUpperCase().includes('EK BİNA')
    );
    const isAdminCol = colIdx === totalCols - 1;

    cell.font = {
      name: 'Calibri',
      size: 9.5,
      bold: true,
      color: { argb: isYellowCol ? 'FF000000' : 'FFFFFFFF' }
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    cell.border = mediumBorder;

    if (isYellowCol) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + PALETTE.accentYellow }
      };
    } else if (isAdminCol) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF334155' } // Deep slate for Admin
      };
    } else {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + PALETTE.headerBg }
      };
    }
  });

  // 4. Data Rows
  let overallDayIndex = 0;
  let rowIndex = 5;
  const curr = new Date(s);

  while (curr <= e) {
    const jsDay = curr.getDay();
    const weekDayId = jsDay === 0 ? 7 : jsDay;
    const dayStr = `${String(curr.getDate()).padStart(2, '0')}.${String(curr.getMonth() + 1).padStart(2, '0')}.${curr.getFullYear()}`;
    const dayName = dayNamesTR[jsDay].toUpperCase();

    const isActive = activeDays.some(ad => ad.id === weekDayId);
    const isWeekend = jsDay === 0 || jsDay === 6;
    const isoDate = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
    const isHoliday = markHolidays && userHolidays.includes(isoDate);

    if (showWeekends || !isWeekend) {
      if (isHoliday) {
        // Holiday Row: Merged across locations
        const holidayRow = ws.addRow([dayStr, dayName, 'RESMİ TATİL']);
        holidayRow.height = 18;
        ws.mergeCells(rowIndex, 3, rowIndex, totalCols);

        for (let c = 1; c <= totalCols; c++) {
          const cell = ws.getCell(rowIndex, c);
          cell.border = thinBorder;
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + PALETTE.holidayBg }
          };
          if (c === 1 || c === 2) {
            cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF' + PALETTE.holidayText } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (c === 3) {
            cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF' + PALETTE.holidayText } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        }
        rowIndex++;
      } else if (!isActive || isWeekend) {
        // Weekend / Inactive Row
        let weekendAdmin = '-';
        if (alternateAdmins && eligibleDutyAdmins.length > 0) {
          weekendAdmin = eligibleDutyAdmins[overallDayIndex % eligibleDutyAdmins.length];
        } else {
          const raw = adminSchedule[weekDayId];
          weekendAdmin = (raw && !isPrincipal(raw)) ? raw : '-';
        }

        const rowValues = [dayStr, dayName, ...Array(dutyLocations.length).fill('-'), weekendAdmin];
        const row = ws.addRow(rowValues);
        row.height = 17;

        for (let c = 1; c <= totalCols; c++) {
          const cell = row.getCell(c);
          cell.border = thinBorder;
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + PALETTE.weekendBg }
          };
          cell.font = { name: 'Calibri', size: 8.5, bold: c <= 2 || c === totalCols, color: { argb: 'FF' + PALETTE.weekendText } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        overallDayIndex++;
        rowIndex++;
      } else {
        // Regular School Day Row
        let currentAdmin = '-';
        if (alternateAdmins && eligibleDutyAdmins.length > 0) {
          currentAdmin = eligibleDutyAdmins[overallDayIndex % eligibleDutyAdmins.length];
        } else {
          const raw = adminSchedule[weekDayId];
          currentAdmin = (raw && !isPrincipal(raw)) ? raw : '-';
        }

        const academicWeekIdx = getAcademicWeekIndex(curr, academicYearStartDate);

        const shiftedTeachers = getShiftedTeachersForDay({
          dutyLocations,
          dutyAssignments,
          weekDayId,
          weekIndex: academicWeekIdx,
          rotateTeachers,
          isPrincipal
        });

        const teacherCols = shiftedTeachers.map(tList => tList.join(', ') || '-');
        const rowValues = [dayStr, dayName, ...teacherCols, currentAdmin];
        const row = ws.addRow(rowValues);
        row.height = 18;

        const isEven = overallDayIndex % 2 === 0;

        for (let c = 1; c <= totalCols; c++) {
          const cell = row.getCell(c);
          cell.border = thinBorder;
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true
          };

          if (c === 1 || c === 2) {
            // Date / Day
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isEven ? 'FFF1F5F9' : 'FFE2E8F0' }
            };
            cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF0F172A' } };
          } else if (c === totalCols) {
            // Admin
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isEven ? 'FFFEFCE8' : 'FFFEF9C3' }
            };
            cell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: 'FF0F172A' } };
          } else {
            // Teachers
            const locIdx = c - 3;
            const isYellowCol = locIdx === 0 || locIdx === 1 || locIdx === 4 || locIdx === 6 || (
              dutyLocations[locIdx] && (
                dutyLocations[locIdx].toUpperCase().includes('BAHÇE') ||
                dutyLocations[locIdx].toUpperCase().includes('KAT2') ||
                dutyLocations[locIdx].toUpperCase().includes('EK BİNA')
              )
            );

            if (isYellowCol) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: isEven ? 'FFFFFBEB' : 'FFFEF3C7' }
              };
            } else if (!isEven) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF' + PALETTE.zebraRowBg }
              };
            }

            cell.font = { name: 'Calibri', size: 8.5, bold: false, color: { argb: 'FF000000' } };
          }
        }

        overallDayIndex++;
        rowIndex++;
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  // 5. Spacer Row
  const spacer2 = ws.addRow([]);
  spacer2.height = 10;
  rowIndex++;

  // 6. Rules and Signature Footer Section
  const rulesStartRow = rowIndex;
  const splitCol = Math.max(3, Math.floor(totalCols * 0.65));

  const generalRulesText = generalRules || '1. Nöbet görevi ilk dersten 20 dakika önce başlar, son ders bitiminden 20 dakika sonra biter.\n2. Nöbetçi öğretmen nöbet bölgesindeki öğrencilerin güvenliğini sağlar.\n3. Nöbetçi müdür yardımcısına olağanüstü durumları derhal bildirir.';
  const attentionRulesText = attentionRules || '1. Nöbet yerini izinsiz terk etmeyiniz.\n2. Teneffüslerde nöbet yerinde aktif olarak bulununuz.\n3. Nöbet defterini gün sonunda imzalayınız.';

  const fullRulesContent = `GENEL NÖBET GÖREVLERİ:\n${generalRulesText}\n\nDİKKAT EDİLECEK HUSUSLAR:\n${attentionRulesText}`;

  // Merge left side for Rules
  ws.mergeCells(rulesStartRow, 1, rulesStartRow + 5, splitCol);
  const rulesCell = ws.getCell(rulesStartRow, 1);
  rulesCell.value = fullRulesContent;
  rulesCell.font = { name: 'Calibri', size: 8, color: { argb: 'FF1E293B' } };
  rulesCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  rulesCell.border = thinBorder;
  rulesCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }
  };

  // Merge right side for Signature
  ws.mergeCells(rulesStartRow, splitCol + 1, rulesStartRow + 5, totalCols);
  const signatureCell = ws.getCell(rulesStartRow, splitCol + 1);
  const todayFormatted = new Date().toLocaleDateString('tr-TR');
  const signatureContent = `... UYGUNDUR ...\n${todayFormatted}\n\n\n${(principalName || 'HİDAYET AS').trim().toUpperCase()}\n${principalTitle || 'Okul Müdürü'}`;
  signatureCell.value = signatureContent;
  signatureCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF000000' } };
  signatureCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  signatureCell.border = thinBorder;
  signatureCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' }
  };

  // 7. Auto / Defined Column Widths
  ws.columns = [
    { width: 14 }, // Tarih
    { width: 14 }, // Gün
    ...dutyLocations.map(loc => ({
      width: Math.max(18, Math.min(26, loc.length + 5))
    })),
    { width: 26 }  // Nöbetçi Md. Yrd.
  ];

  // Write and trigger download in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Nobet_Cizelgesi_${startFormatted}_${endFormatted}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

/**
 * Professional Weekly Duty Schedule Excel Export
 */
export async function exportWeeklyDutyToExcel({
  activeDays,
  dutyLocations,
  dutyAssignments,
  dutyAdmins,
  adminRoles,
  adminSchedule,
  principalName = '',
  principalTitle = 'Okul Müdürü',
  generalRules = '',
  attentionRules = ''
}: ExportWeeklyOptions) {
  const isPrincipal = (name: string) => {
    if (!name) return false;
    const n = name.trim().toLocaleLowerCase('tr-TR');
    if (principalName && n === principalName.trim().toLocaleLowerCase('tr-TR')) return true;
    if (adminRoles[name] === 'Okul Müdürü') return true;
    const role = (adminRoles[name] || '').toLocaleLowerCase('tr-TR');
    if (role.includes('müdür') && !role.includes('yardımc')) return true;
    return false;
  };

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Atatürk Ortaokulu';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Haftalık Nöbet', {
    views: [{ showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 }
    }
  });

  const totalCols = 1 + activeDays.length; // Nöbet Yeri + Günler

  // 1. Title Row 1
  const title1 = ws.addRow(['ATATÜRK ORTAOKULU MÜDÜRLÜĞÜ']);
  ws.mergeCells(1, 1, 1, totalCols);
  title1.height = 24;
  title1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  title1.alignment = { horizontal: 'center', vertical: 'middle' };
  title1.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF' + PALETTE.titleBg }
  };

  // 2. Title Row 2
  const title2 = ws.addRow(['HAFTALIK NÖBET DAĞITIM ÇİZELGESİ']);
  ws.mergeCells(2, 1, 2, totalCols);
  title2.height = 19;
  title2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
  title2.alignment = { horizontal: 'center', vertical: 'middle' };
  title2.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF' + PALETTE.subHeaderBg }
  };

  const spacer1 = ws.addRow([]);
  spacer1.height = 6;

  // 3. Headers
  const headerCols = ['NÖBET YERİ / GÖREVİ', ...activeDays.map(d => d.name.toUpperCase())];
  const headerRow = ws.addRow(headerCols);
  headerRow.height = 24;

  headerCols.forEach((colName, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = mediumBorder;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + PALETTE.headerBg }
    };
  });

  // 4. Admin Row
  const adminValues = ['NÖBETÇİ MÜDÜR YARDIMCISI'];
  activeDays.forEach(day => {
    const rawAdm = adminSchedule[day.id];
    const adm = (rawAdm && !isPrincipal(rawAdm)) ? rawAdm : null;
    const admText = adm ? `${adm}${adminRoles[adm] ? ` (${adminRoles[adm]})` : ' (Müdür Yrd.)'}` : '-';
    adminValues.push(admText);
  });

  const adminRow = ws.addRow(adminValues);
  adminRow.height = 20;
  for (let c = 1; c <= totalCols; c++) {
    const cell = adminRow.getCell(c);
    cell.border = thinBorder;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEFCE8' }
    };
    cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF854D0E' } };
  }

  // 5. Locations Rows
  let curRowIdx = 6;
  dutyLocations.forEach((loc, idx) => {
    const locValues = [loc];
    activeDays.forEach(day => {
      const key = `${loc}_${day.id}`;
      const assigned = (dutyAssignments[key] || []).filter(t => !isPrincipal(t));
      locValues.push(assigned.join(', ') || '-');
    });

    const row = ws.addRow(locValues);
    row.height = 19;
    const isEven = idx % 2 === 0;

    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.alignment = {
        horizontal: c === 1 ? 'left' : 'center',
        vertical: 'middle',
        wrapText: true
      };

      if (c === 1) {
        cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFF1F5F9' : 'FFE2E8F0' }
        };
      } else {
        cell.font = { name: 'Calibri', size: 9, bold: false, color: { argb: 'FF000000' } };
        if (!isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + PALETTE.zebraRowBg }
          };
        }
      }
    }
    curRowIdx++;
  });

  // 6. Spacer
  const spacer2 = ws.addRow([]);
  spacer2.height = 10;
  curRowIdx++;

  // 7. Rules and Signature Footer Section
  const rulesStartRow = curRowIdx;
  const splitCol = Math.max(2, Math.floor(totalCols * 0.65));

  const generalRulesText = generalRules || '1. Nöbet görevi ilk dersten 20 dakika önce başlar, son ders bitiminden 20 dakika sonra biter.\n2. Nöbetçi öğretmen nöbet bölgesindeki öğrencilerin güvenliğini sağlar.\n3. Nöbetçi müdür yardımcısına olağanüstü durumları derhal bildirir.';
  const attentionRulesText = attentionRules || '1. Nöbet yerini izinsiz terk etmeyiniz.\n2. Teneffüslerde nöbet yerinde aktif olarak bulununuz.\n3. Nöbet defterini gün sonunda imzalayınız.';

  const fullRulesContent = `GENEL NÖBET GÖREVLERİ:\n${generalRulesText}\n\nDİKKAT EDİLECEK HUSUSLAR:\n${attentionRulesText}`;

  ws.mergeCells(rulesStartRow, 1, rulesStartRow + 5, splitCol);
  const rulesCell = ws.getCell(rulesStartRow, 1);
  rulesCell.value = fullRulesContent;
  rulesCell.font = { name: 'Calibri', size: 8, color: { argb: 'FF1E293B' } };
  rulesCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  rulesCell.border = thinBorder;
  rulesCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }
  };

  ws.mergeCells(rulesStartRow, splitCol + 1, rulesStartRow + 5, totalCols);
  const signatureCell = ws.getCell(rulesStartRow, splitCol + 1);
  const todayFormatted = new Date().toLocaleDateString('tr-TR');
  const signatureContent = `... UYGUNDUR ...\n${todayFormatted}\n\n\n${(principalName || 'HİDAYET AS').trim().toUpperCase()}\n${principalTitle || 'Okul Müdürü'}`;
  signatureCell.value = signatureContent;
  signatureCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF000000' } };
  signatureCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  signatureCell.border = thinBorder;
  signatureCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' }
  };

  // Column widths
  ws.columns = [
    { width: 28 }, // Nöbet Yeri
    ...activeDays.map(() => ({ width: 22 }))
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Haftalik_Nobet_Dagilim_Cizelgesi.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
