const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  const ejectCellIfOccupied = \(typeKey, entityName, dIdx, pIdx\) => \{[\s\S]*?if \(ejectedCount > 0\) \{\s*setTimeout\(\(\) => \{ showToast\(\`Koşul kapatıldığı için çakışan \$\{ejectedCount\} ders havuza alındı.\`, "info"\); \}, 50\);\s*\}\s*\};/;

const replacement = `  const ejectMultipleCellsFromSchedules = (blocksToEject) => {
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
                  id: generateId(),
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
      while(pStart > 0 && schedules[t][dIdx][pStart - 1] === valStr) pStart--;
      
      let blockSize = 1;
      const maxPeriods = schoolSettings.weekDays[dIdx]?.periods || 15;
      while(pStart + blockSize < maxPeriods && schedules[t][dIdx][pStart + blockSize] === valStr) blockSize++;
      
      return { cData, dIdx, pStart, blockSize, valStr };
  };

  const ejectCellIfOccupied = (typeKey, entityName, dIdx, pIdx) => {
      const blocksToEjectMap = new Map();
      
      const checkAndEject = (valStr) => {
          if (!valStr || valStr === '') return;
          const info = getEjectBlockInfo(valStr, dIdx, pIdx);
          if (info && !blocksToEjectMap.has(info.valStr)) {
              blocksToEjectMap.set(info.valStr, info);
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
          // setTimeout(() => { showToast(\`Koşul kapatıldığı için çakışan \${blocksToEject.length} ders havuza alındı.\`, "info"); }, 50);
      }
  };`;

if(regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success replacing ejectCellIfOccupied");
} else {
    console.log("Failed replacing ejectCellIfOccupied regex");
}
