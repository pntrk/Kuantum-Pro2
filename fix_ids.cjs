const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Line 403
code = code.replace(
    /id: generateId\(\),\n\s*teachers: cData\.teachers,\n\s*classes: cData\.classes,\n\s*rooms: cData\.rooms \|\| \[\],\n\s*subject: cData\.subject,\n\s*hours: blockSize,\n\s*failCount: 0/,
    'id: cData.id,\n                  teachers: cData.teachers,\n                  classes: cData.classes,\n                  rooms: cData.rooms || [],\n                  subject: cData.subject,\n                  hours: blockSize,\n                  failCount: 0'
);

// Line 1471
code = code.replace(
    /setUnplacedCourses\(\[\.\.\.unplacedCourses, \{ id: generateId\(\), teachers: cData\.teachers, classes: cData\.classes, rooms: cData\.rooms, subject: cData\.subject, hours: payload\.blockSize, failCount: 0 \}\]\);/,
    'setUnplacedCourses([...unplacedCourses, { id: cData.id, teachers: cData.teachers, classes: cData.classes, rooms: cData.rooms, subject: cData.subject, hours: payload.blockSize, failCount: 0 }]);'
);

// Line 1625
code = code.replace(
    /removed\.push\(\{ id: generateId\(\), teachers: cData\.teachers, classes: cData\.classes, rooms: cData\.rooms, subject: cData\.subject, hours: blockSize \}\);/,
    'removed.push({ id: cData.id, teachers: cData.teachers, classes: cData.classes, rooms: cData.rooms, subject: cData.subject, hours: blockSize });'
);

// Line 1671
code = code.replace(
    /removed\.push\(\{ id: generateId\(\), teachers: cData\.teachers, classes: cData\.classes, rooms: cData\.rooms, subject: cData\.subject, hours: blockSize \}\);/,
    'removed.push({ id: cData.id, teachers: cData.teachers, classes: cData.classes, rooms: cData.rooms, subject: cData.subject, hours: blockSize });'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed IDs.");
