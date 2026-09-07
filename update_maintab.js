import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const \[mainTab, setMainTab\] = useState\('matrix'\);/,
  `const [mainTab, setMainTab] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 'preview' : 'matrix');`
);

fs.writeFileSync('src/App.tsx', content);
