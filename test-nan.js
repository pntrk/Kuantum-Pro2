const grid = Array.from({length: 7}, () => new Int32Array(15));
try { grid[NaN][0] = -1; } catch (e) { console.log("NaN:", e.message); }
try { grid[-1][0] = -1; } catch (e) { console.log("-1:", e.message); }
try { grid[100][0] = -1; } catch (e) { console.log("100:", e.message); }
