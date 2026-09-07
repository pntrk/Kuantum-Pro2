import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /className="grid grid-cols-4 sm:flex sm:items-center gap-1\.5 sm:gap-2 mt-2 md:mt-0 w-full md:w-auto shrink-0 touch-manipulation"/,
  `className="hidden sm:flex sm:items-center gap-1.5 sm:gap-2 mt-2 md:mt-0 w-full md:w-auto shrink-0 touch-manipulation"`
);

fs.writeFileSync('src/App.tsx', content);
