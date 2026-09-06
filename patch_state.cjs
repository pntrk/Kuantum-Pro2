const fs = require('fs');
let code = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

code = code.replace(
  "const [editLocName, setEditLocName] = useState('');",
  "const [editLocName, setEditLocName] = useState('');\n  const [mobileRosterDayId, setMobileRosterDayId] = useState(schoolSettings?.weekDays?.find(d => d.active)?.id || 1);"
);

fs.writeFileSync('src/components/DutyManager.tsx', code);
console.log("Success patch state");
