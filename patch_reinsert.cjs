const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const calcFunction = `  // Safe Set-based calculation for total workload (Table + Pool) to prevent duplicate counting
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
                          const span = parseInt(cData.span || cData.hours || 1, 10);
                          totalHours += span;
                      }
                      if (cData && cData.span) pIdx += cData.span - 1;
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
                              const span = parseInt(cData.span || cData.hours || 1, 10);
                              totalHours += span;
                          }
                          if (cData && cData.span) pIdx += cData.span - 1;
                      }
                  }
              });
          });
      }

      return totalHours;
  };\n\n`;

content = content.replace(/  const draggedItemRef = useRef<any>\(null\);/, `  const draggedItemRef = useRef<any>(null);\n\n${calcFunction}`);

fs.writeFileSync('src/App.tsx', content);
console.log("Success reinserting calculateSafeTotalWorkload");
