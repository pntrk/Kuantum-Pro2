const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find and remove the outer calculateSafeTotalWorkload declaration
const outerRegex = /\s*\/\/ Safe Set-based calculation for total workload[\s\S]*?return totalHours;\s*\};/g;

// Since we just inserted a new one, this regex will match BOTH. 
// We only want to remove the first one (the one outside).
let matchCount = 0;
content = content.replace(outerRegex, (match) => {
    matchCount++;
    if (matchCount === 1) return ""; // Remove the first one (outer)
    return match; // Keep the second one (inner)
});

fs.writeFileSync('src/App.tsx', content);
console.log("Success cleaning up outer declaration");
