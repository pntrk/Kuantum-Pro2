const arr = [];
try { arr[-1][-1] = 5; } catch(e) { console.log(e.message); }
try { arr[0] = undefined; arr[0][-1] = 5; } catch(e) { console.log(e.message); }
