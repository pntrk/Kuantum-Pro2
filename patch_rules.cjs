const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update DEFAULT_SETTINGS
if (!code.includes('distributionRules: {')) {
    code = code.replace(
        /dailyPeriods: 9\s*\}/,
        `dailyPeriods: 9,
  distributionRules: {
    preventSameDay: true,
    minGapActive: false,
    minGap: 1,
    maxGapActive: false,
    maxGap: 0,
    maxHoursActive: false,
    maxHours: 2,
  }
}`
    );
}

// 2. Add state for showRulesModal
if (!code.includes('const [showRulesModal, setShowRulesModal]')) {
    code = code.replace(
        'const [showConflictModal, setShowConflictModal]',
        `const [showConflictModal, setShowConflictModal] = useState(false);\n  const [showRulesModal, setShowRulesModal]`
    );
}

fs.writeFileSync('src/App.tsx', code);
console.log('Done rules state');
