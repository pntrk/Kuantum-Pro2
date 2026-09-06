const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /blocksToEject\.forEach\(\(\{ cData, blockSize \}\) => \{\s*nextPool\.push\(\{\s*id: generateId\(\),\s*teachers: cData\.teachers,/;
const replacement = `blocksToEject.forEach(({ cData, blockSize }) => {
              nextPool.push({
                  id: cData.id,
                  teachers: cData.teachers,`;

if(regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success replacing id in ejectMultipleCellsFromSchedules");
} else {
    console.log("Failed replacing id in ejectMultipleCellsFromSchedules");
}
