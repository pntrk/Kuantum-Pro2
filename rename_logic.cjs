const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const renameFn = `
  const handleRenameEntity = (oldName, newName, type) => {
      if (!newName || newName.trim() === '' || newName === oldName) return;
      
      const checkExists = (list) => list.includes(newName);
      if (type === 'teacher' && checkExists(teachers)) return showToast("Bu isimde bir öğretmen zaten var", "error");
      if (type === 'class' && checkExists(classes)) return showToast("Bu isimde bir sınıf zaten var", "error");
      if (type === 'room' && checkExists(rooms)) return showToast("Bu isimde bir derslik zaten var", "error");
      if (type === 'subject' && checkExists(subjects)) return showToast("Bu isimde bir ders zaten var", "error");

      if (type === 'teacher') setTeachers(teachers.map(t => t === oldName ? newName : t).sort((a,b)=>a.localeCompare(b, 'tr')));
      if (type === 'class') setClasses(classes.map(c => c === oldName ? newName : c).sort((a,b)=>a.localeCompare(b, 'tr')));
      if (type === 'room') setRooms(rooms.map(r => r === oldName ? newName : r).sort((a,b)=>a.localeCompare(b, 'tr')));
      if (type === 'subject') setSubjects(subjects.map(s => s === oldName ? newName : s).sort((a,b)=>a.localeCompare(b, 'tr')));

      const renameInCardObj = (card) => {
          let changed = false;
          if (type === 'teacher' && card.teachers) {
              const idx = card.teachers.indexOf(oldName);
              if (idx !== -1) { card.teachers[idx] = newName; changed = true; }
          }
          if (type === 'class' && card.classes) {
              const idx = card.classes.indexOf(oldName);
              if (idx !== -1) { card.classes[idx] = newName; changed = true; }
          }
          if (type === 'room' && card.rooms) {
              const idx = card.rooms.indexOf(oldName);
              if (idx !== -1) { card.rooms[idx] = newName; changed = true; }
          }
          if (type === 'subject' && card.subject === oldName) {
              card.subject = newName; changed = true;
          }
          return changed;
      };

      const renameInCardStr = (str) => {
          if (!str) return str;
          try {
              const card = JSON.parse(str);
              if (renameInCardObj(card)) return JSON.stringify(card);
              return str;
          } catch(e) { return str; }
      };

      const updateSched = (schedObj, isSelfType) => {
          const newObj = {};
          Object.keys(schedObj).forEach(k => {
              const newK = (isSelfType && k === oldName) ? newName : k;
              newObj[newK] = schedObj[k].map(day => day.map(p => renameInCardStr(p)));
          });
          return newObj;
      };

      setSchedules(prev => updateSched(prev, type === 'teacher'));
      setClassSchedules(prev => updateSched(prev, type === 'class'));
      setRoomSchedules(prev => updateSched(prev, type === 'room'));
      setSubjectSchedules(prev => updateSched(prev, type === 'subject'));

      setUnplacedCourses(prev => prev.map(c => {
          const newC = {...c};
          // Need to clone arrays to trigger re-renders
          if (newC.teachers) newC.teachers = [...newC.teachers];
          if (newC.classes) newC.classes = [...newC.classes];
          if (newC.rooms) newC.rooms = [...newC.rooms];
          renameInCardObj(newC);
          return newC;
      }));

      const newLocked = {};
      Object.keys(lockedCells).forEach(k => {
          if (k.startsWith(oldName + '-')) {
              newLocked[k.replace(oldName + '-', newName + '-')] = lockedCells[k];
          } else {
              newLocked[k] = lockedCells[k];
          }
      });
      setLockedCells(newLocked);

      const newConstraints = {...constraints};
      if (newConstraints[\`\${type}_\${oldName}\`]) {
          newConstraints[\`\${type}_\${newName}\`] = newConstraints[\`\${type}_\${oldName}\`];
          delete newConstraints[\`\${type}_\${oldName}\`];
      }
      setConstraints(newConstraints);

      if (constraintModal && constraintModal.name === oldName && constraintModal.type === type) {
          setConstraintModal({ ...constraintModal, name: newName });
      }
      
      showToast("İsim başarıyla güncellendi", "success");
  };
`;

const targetAnchor = 'const handleRemoveEntity = (type, name) => {';
code = code.replace(targetAnchor, renameFn + '\n  ' + targetAnchor);

fs.writeFileSync('src/App.tsx', code);
console.log("Added handleRenameEntity");
