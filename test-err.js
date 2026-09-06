let obj;
try { obj[-1] = 5; } catch (e) { console.log(e.message); }
