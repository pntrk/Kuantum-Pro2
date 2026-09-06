const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `           </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-0 w-full md:w-auto flex-wrap pb-2 md:pb-0">
           
           {/* Spotlight / Command Palette Button */}`;

const replacement = `           </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 mt-3 md:mt-0 w-full md:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0 shrink-0 snap-x">
           
           {/* Spotlight / Command Palette Button */}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success patch header container");
} else {
  console.log("target string not found.");
}
