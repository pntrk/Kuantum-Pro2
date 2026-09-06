const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const effectCode = `  useEffect(() => {
    if (!deepLearningActive || unplacedCourses.length === 0 || distributeState.isRunning) return;
    const interval = setInterval(() => {
        const newUnplaced = [...unplacedCourses].sort((a, b) => {
             const getScore = (c) => {
                 let score = (c.span || 1) * 10;
                 if (c.teachers) score += c.teachers.reduce((acc, t) => acc + (constraints.teachers[t]?.length || 0), 0);
                 if (c.classes) score += c.classes.reduce((acc, cl) => acc + (constraints.classes[cl]?.length || 0), 0);
                 return score;
             };
             return getScore(b) - getScore(a);
        });
        const isDifferent = newUnplaced.some((c, i) => c.id !== unplacedCourses[i].id);
        if (isDifferent) {
            setUnplacedCourses(newUnplaced);
            setDeepLearningStats(prev => ({ ...prev, learnedPaths: prev.learnedPaths + Math.floor(Math.random() * 10) + 1, bottlenecks: newUnplaced.length }));
        } else {
            setDeepLearningStats(prev => ({ ...prev, learnedPaths: prev.learnedPaths + Math.floor(Math.random() * 50) + 10, bottlenecks: newUnplaced.length }));
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [deepLearningActive, unplacedCourses, distributeState.isRunning, constraints]);`;

code = code.replace(effectCode, '');

const target = `  // Auto-eject conflicting lessons when constraints change`;
code = code.replace(target, effectCode + '\n\n' + target);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed effect position');
