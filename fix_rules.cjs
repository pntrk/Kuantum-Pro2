const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<label className="flex items-center gap-2 cursor-pointer">\s*<input type="checkbox" className="w-3\.5 h-3\.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"\s*checked=\{distributionRules.freeDistribution\}\s*onChange=\{e => setDistributionRules\(\{...distributionRules, freeDistribution: e\.target\.checked\}\)\} \/>\s*<span className="font-semibold text-slate-700">Kartları serbest dağıt<\/span>\s*<\/label>/;

const replacement = `<div className="space-y-2">
    <label className="flex items-center gap-2 cursor-pointer">
       <input type="radio" name="distMode" className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500" 
              checked={!distributionRules.freeDistribution} 
              onChange={() => setDistributionRules({...distributionRules, freeDistribution: false})} />
       <span className="font-semibold text-slate-700">Her kart farklı güne dağıtılsın</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
       <input type="radio" name="distMode" className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500" 
              checked={distributionRules.freeDistribution} 
              onChange={() => setDistributionRules({...distributionRules, freeDistribution: true})} />
       <span className="font-semibold text-slate-700">Kartları serbest dağıt</span>
    </label>
</div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated rules UI");
