const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

const targetCode = `  const activeDays =
    schoolSettings?.weekDays?.filter((d: any) => d.active) || [];
  const maxPeriods = Math.max(...activeDays.map((d: any) => d.periods), 0) || 8;`;

const replaceCode = `  let activeDays = schoolSettings?.weekDays?.filter((d: any) => d.active) || [];
  
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

  const maxPeriods = Math.max(...activeDays.map((d: any) => d.periods), 9);`;

code = code.replace(targetCode, replaceCode);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Fixed export modal activeDays and maxPeriods!");
