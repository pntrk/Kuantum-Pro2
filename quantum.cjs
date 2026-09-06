let shouldStop = false;
self.onmessage = function(e) {
  if (e.data && e.data.type === "stop") {
    shouldStop = true;
    return;
  }
  shouldStop = false;
  const {
    unplacedCourses,
    schoolSettings,
    schedules,
    classSchedules,
    roomSchedules,
    lockedCells,
    constraints,
    workerIndex
  } = e.data;
  const parseCellData = (valStr) => {
    if (!valStr || typeof valStr !== "string") return null;
    try {
      const parsed = JSON.parse(valStr);
      return {
        id: parsed.id || "id_" + Math.random(),
        teachers: Array.isArray(parsed.teachers) ? parsed.teachers : parsed.teacher ? [parsed.teacher] : [],
        classes: Array.isArray(parsed.classes) ? parsed.classes : parsed.cls ? [parsed.cls] : [],
        rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
        subject: parsed.subject || "",
        span: parsed.span || 1
      };
    } catch (err) {
      return null;
    }
  };
  try {
    const autoDistributePro = async () => {
      if (unplacedCourses.length === 0) {
        self.postMessage({ type: "error", message: "Da\u011F\u0131t\u0131lacak kart havuzda yok." });
        return;
      }
      self.postMessage({ type: "progress", progress: 0, phase: "Kuantum AI Motoru (Bitmask/Tabu) Ba\u015Flat\u0131l\u0131yor..." });
      await new Promise((r) => setTimeout(r, 50));
      const activeDays = schoolSettings.weekDays.filter((d) => d.active);
      const T_map = {};
      let T_count = 0;
      const T_rev = [];
      const C_map = {};
      let C_count = 0;
      const C_rev = [];
      const R_map = {};
      let R_count = 0;
      const R_rev = [];
      const getT = (t) => {
        if (T_map[t] === void 0) {
          T_map[t] = T_count++;
          T_rev.push(t);
        }
        return T_map[t];
      };
      const getC = (c) => {
        if (C_map[c] === void 0) {
          C_map[c] = C_count++;
          C_rev.push(c);
        }
        return C_map[c];
      };
      const getR = (r) => {
        if (R_map[r] === void 0) {
          R_map[r] = R_count++;
          R_rev.push(r);
        }
        return R_map[r];
      };
      const boardCards = /* @__PURE__ */ new Map();
      Object.keys(schedules).forEach((t) => {
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            const val = schedules[t][d]?.[p];
            if (val && val !== "") {
              const cData = parseCellData(val);
              if (cData && !boardCards.has(cData.id)) {
                let hours = 0;
                while (p + hours < 15 && schedules[t][d][p + hours] === val) hours++;
                let isLocked = false;
                for (let i = 0; i < hours; i++) {
                  if (lockedCells[`${t}-${d}-${p + i}`]) isLocked = true;
                  cData.classes.forEach((c) => {
                    if (lockedCells[`${c}-${d}-${p + i}`]) isLocked = true;
                  });
                  cData.rooms?.forEach((r) => {
                    if (lockedCells[`${r}-${d}-${p + i}`]) isLocked = true;
                  });
                }
                boardCards.set(cData.id, {
                  id: cData.id,
                  teachers: cData.teachers,
                  classes: cData.classes,
                  rooms: cData.rooms || [],
                  subject: cData.subject,
                  hours,
                  d,
                  p,
                  isLocked,
                  fromBoard: true
                });
              }
            }
          }
        }
      });
      const solverCards = [];
      unplacedCourses.forEach((c) => solverCards.push({ ...c, isLocked: false, d: -1, p: -1, fromBoard: false }));
      boardCards.forEach((c) => solverCards.push(c));
      const S_map = {};
      let S_count = 0;
      const getS = (s) => {
        if (!s) return -1;
        if (S_map[s] === void 0) S_map[s] = S_count++;
        return S_map[s];
      };
      solverCards.forEach((c) => {
        c.mappedTeachers = (c.teachers || []).map(getT);
        c.mappedClasses = (c.classes || []).map(getC);
        c.mappedRooms = (c.rooms || []).map(getR);
        c.mappedSubject = getS(c.subject);
      });
      const state_T = new Int32Array(T_count * 7);
      const state_C = new Int32Array(C_count * 7);
      const state_R = new Int32Array(R_count * 7);
      const constraint_T = new Int32Array(T_count * 7);
      const constraint_C = new Int32Array(C_count * 7);
      const constraint_R = new Int32Array(R_count * 7);
      const subjectConstraintsMask = /* @__PURE__ */ new Map();
      if (constraints.subjects) {
        Object.keys(constraints.subjects).forEach((subName) => {
          const subId = getS(subName);
          if (subId !== -1) {
            const masks = new Int32Array(7);
            const dpList = constraints.subjects[subName] || [];
            dpList.forEach((dp) => {
              const parts = dp.split("-");
              const d = Number(parts[0]);
              const p = Number(parts[1]);
              if (d >= 0 && d < 7 && p >= 0 && p < 15) {
                masks[d] |= 1 << p;
              }
            });
            subjectConstraintsMask.set(subId, masks);
          }
        });
      }
      ["teachers", "classes", "rooms"].forEach((type) => {
        Object.keys(constraints[type] || {}).forEach((k) => {
          const id = type === "teachers" ? T_map[k] : type === "classes" ? C_map[k] : R_map[k];
          if (id !== void 0) {
            constraints[type][k].forEach((dp) => {
              const parts = dp.split("-");
              const d = Number(parts[0]);
              const p = Number(parts[1]);
              if (type === "teachers") constraint_T[id * 7 + d] |= 1 << p;
              if (type === "classes") constraint_C[id * 7 + d] |= 1 << p;
              if (type === "rooms") constraint_R[id * 7 + d] |= 1 << p;
            });
          }
        });
      });
      T_rev.forEach((t, id) => {
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            if (lockedCells[`${t}-${d}-${p}`]) constraint_T[id * 7 + d] |= 1 << p;
          }
        }
      });
      C_rev.forEach((c, id) => {
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            if (lockedCells[`${c}-${d}-${p}`]) constraint_C[id * 7 + d] |= 1 << p;
          }
        }
      });
      R_rev.forEach((r, id) => {
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            if (lockedCells[`${r}-${d}-${p}`]) constraint_R[id * 7 + d] |= 1 << p;
          }
        }
      });
      const classSubjectCounts = Array.from({ length: C_count }, () => Array(7).fill(0).map(() => /* @__PURE__ */ new Map()));
      const addSubject = (c_id, d, sId) => {
        if (sId === -1) return;
        const map = classSubjectCounts[c_id][d];
        if (!map) {
          throw new Error(`Undefined map! c_id: ${c_id}, d: ${d}, C_count: ${C_count}, arr_len: ${classSubjectCounts.length}`);
        }
        map.set(sId, (map.get(sId) || 0) + 1);
      };
      const removeSubject = (c_id, d, sId) => {
        if (sId === -1) return;
        const map = classSubjectCounts[c_id][d];
        if (!map) {
          throw new Error(`Undefined map! c_id: ${c_id}, d: ${d}, C_count: ${C_count}, arr_len: ${classSubjectCounts.length}`);
        }
        const count = map.get(sId) || 0;
        if (count <= 1) map.delete(sId);
        else map.set(sId, count - 1);
      };
      const hasSubject = (c_id, d, sId) => {
        if (sId === -1) return false;
        return classSubjectCounts[c_id][d].has(sId);
      };
      const grid_T = Array.from({ length: T_count * 7 }, () => new Int32Array(15).fill(-1));
      const grid_C = Array.from({ length: C_count * 7 }, () => new Int32Array(15).fill(-1));
      const grid_R = Array.from({ length: R_count * 7 }, () => new Int32Array(15).fill(-1));
      const movableCards = [];
      const movableMap = /* @__PURE__ */ new Map();
      const unplacedList = [];
      const unplacedPos = /* @__PURE__ */ new Map();
      const addToUnplaced = (cardId) => {
        if (unplacedPos.has(cardId)) return;
        unplacedList.push(cardId);
        unplacedPos.set(cardId, unplacedList.length - 1);
      };
      const removeFromUnplaced = (cardId) => {
        const idx = unplacedPos.get(cardId);
        if (idx === void 0) return;
        const lastCardId = unplacedList[unplacedList.length - 1];
        unplacedList[idx] = lastCardId;
        unplacedPos.set(lastCardId, idx);
        unplacedList.pop();
        unplacedPos.delete(cardId);
      };
      solverCards.forEach((c, idx) => {
        c.mappedId = idx;
        if (c.isLocked) {
          const mask = (1 << c.hours) - 1 << c.p;
          c.mappedTeachers.forEach((t) => {
            state_T[t * 7 + c.d] |= mask;
            for (let i = 0; i < c.hours; i++) grid_T[t * 7 + c.d][c.p + i] = c.mappedId;
          });
          c.mappedClasses.forEach((cl) => {
            state_C[cl * 7 + c.d] |= mask;
            for (let i = 0; i < c.hours; i++) grid_C[cl * 7 + c.d][c.p + i] = c.mappedId;
            addSubject(cl, c.d, c.mappedSubject);
          });
          c.mappedRooms.forEach((r) => {
            state_R[r * 7 + c.d] |= mask;
            for (let i = 0; i < c.hours; i++) grid_R[r * 7 + c.d][c.p + i] = c.mappedId;
          });
        } else {
          c.failCount = 0;
          movableCards.push(c);
          movableMap.set(c.mappedId, c);
          if (c.d !== -1) {
            const mask = (1 << c.hours) - 1 << c.p;
            c.mappedTeachers.forEach((t) => {
              state_T[t * 7 + c.d] |= mask;
              for (let i = 0; i < c.hours; i++) grid_T[t * 7 + c.d][c.p + i] = c.mappedId;
            });
            c.mappedClasses.forEach((cl) => {
              state_C[cl * 7 + c.d] |= mask;
              for (let i = 0; i < c.hours; i++) grid_C[cl * 7 + c.d][c.p + i] = c.mappedId;
              addSubject(cl, c.d, c.mappedSubject);
            });
            c.mappedRooms.forEach((r) => {
              state_R[r * 7 + c.d] |= mask;
              for (let i = 0; i < c.hours; i++) grid_R[r * 7 + c.d][c.p + i] = c.mappedId;
            });
          } else {
            addToUnplaced(c.mappedId);
          }
        }
      });
      const place = (c, d, p) => {
        const mask = (1 << c.hours) - 1 << p;
        c.mappedTeachers.forEach((t) => {
          state_T[t * 7 + d] |= mask;
          for (let i = 0; i < c.hours; i++) grid_T[t * 7 + d][p + i] = c.mappedId;
        });
        c.mappedClasses.forEach((cl) => {
          state_C[cl * 7 + d] |= mask;
          addSubject(cl, d, c.mappedSubject);
          for (let i = 0; i < c.hours; i++) grid_C[cl * 7 + d][p + i] = c.mappedId;
        });
        c.mappedRooms.forEach((r) => {
          state_R[r * 7 + d] |= mask;
          for (let i = 0; i < c.hours; i++) grid_R[r * 7 + d][p + i] = c.mappedId;
        });
        c.d = d;
        c.p = p;
        removeFromUnplaced(c.mappedId);
      };
      const remove = (c) => {
        if (c.d === -1) return;
        const mask = (1 << c.hours) - 1 << c.p;
        c.mappedTeachers.forEach((t) => {
          state_T[t * 7 + c.d] &= ~mask;
          for (let i = 0; i < c.hours; i++) grid_T[t * 7 + c.d][c.p + i] = -1;
        });
        c.mappedClasses.forEach((cl) => {
          state_C[cl * 7 + c.d] &= ~mask;
          removeSubject(cl, c.d, c.mappedSubject);
          for (let i = 0; i < c.hours; i++) grid_C[cl * 7 + c.d][c.p + i] = -1;
        });
        c.mappedRooms.forEach((r) => {
          state_R[r * 7 + c.d] &= ~mask;
          for (let i = 0; i < c.hours; i++) grid_R[r * 7 + c.d][c.p + i] = -1;
        });
        c.d = -1;
        c.p = -1;
        addToUnplaced(c.mappedId);
      };
      const checkRules = (c, d, p) => {
        return true;
      };
      const getConflicts = (c, d, p) => {
        if (!checkRules(c, d, p)) return null;
        const mask = (1 << c.hours) - 1 << p;
        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        if (subMasks && (subMasks[d] & mask) !== 0) return null;
        const conflicts = [];
        for (let i = 0; i < c.mappedClasses.length; i++) {
          const cl = c.mappedClasses[i];
          for (let hr = 0; hr < 15; hr++) {
            const id = grid_C[cl * 7 + d][hr];
            if (id !== -1) {
              const existingCard = movableMap.get(id);
              if (existingCard && existingCard.mappedSubject === c.mappedSubject && id !== c.mappedId) {
                if (!conflicts.includes(id)) conflicts.push(id);
              }
            }
          }
        }
        for (let i = 0; i < c.mappedTeachers.length; i++) {
          const t = c.mappedTeachers[i];
          if ((constraint_T[t * 7 + d] & mask) !== 0) return null;
          if ((state_T[t * 7 + d] & mask) !== 0) {
            for (let hr = 0; hr < c.hours; hr++) {
              const id = grid_T[t * 7 + d][p + hr];
              if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
            }
          }
        }
        for (let i = 0; i < c.mappedClasses.length; i++) {
          const cl = c.mappedClasses[i];
          if ((constraint_C[cl * 7 + d] & mask) !== 0) return null;
          if ((state_C[cl * 7 + d] & mask) !== 0) {
            for (let hr = 0; hr < c.hours; hr++) {
              const id = grid_C[cl * 7 + d][p + hr];
              if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
            }
          }
        }
        for (let i = 0; i < c.mappedRooms.length; i++) {
          const r = c.mappedRooms[i];
          if ((constraint_R[r * 7 + d] & mask) !== 0) return null;
          if ((state_R[r * 7 + d] & mask) !== 0) {
            for (let hr = 0; hr < c.hours; hr++) {
              const id = grid_R[r * 7 + d][p + hr];
              if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
            }
          }
        }
        return conflicts;
      };
      let bestState = null;
      let minUnplacedCount = unplacedList.length;
      const saveBestState = () => {
        bestState = movableCards.map((c) => ({ id: c.id, d: c.d, p: c.p }));
      };
      saveBestState();
      const tabuQueue = [];
      const tabuSet = /* @__PURE__ */ new Set();
      const maxTabuSize = Math.max(30, Math.floor(movableCards.length * 0.85));
      const getTabuKey = (c_id, d, p) => {
        return c_id << 8 | d << 4 | p;
      };
      const shuffleArray = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
      };
      const shuffledDaysIndices = activeDays.map((day) => day.id - 1);
      for (let i = 0; i < (workerIndex || 0) + 1; i++) shuffleArray(shuffledDaysIndices);
      const startsScratch = new Int32Array(16);
      const getShuffledStarts = (len) => {
        for (let i = 0; i < len; i++) startsScratch[i] = i;
        for (let i = len - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = startsScratch[i];
          startsScratch[i] = startsScratch[j];
          startsScratch[j] = temp;
        }
        return startsScratch;
      };
      let lastYieldTime = performance.now();
      const TIMEOUT_MS = 36e5;
      const startTime = performance.now();
      let iter = 0;
      let lastImprovement = 0;
      let ruinStreak = 0;
      const INITIAL_TEMP = 100;
      const MIN_TEMP = 0.1;
      const COOLING_RATE = 0.9995;
      let T = INITIAL_TEMP;
      let useSoftConstraints = false;
      let useKempeChains = true;
      const isSoftConflict = (c, d, p) => {
        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        const mask = (1 << c.hours) - 1 << p;
        if (subMasks && (subMasks[d] & mask) !== 0) return true;
        for (let cl of c.mappedClasses) {
          for (let hr = 0; hr < 15; hr++) {
            const id = grid_C[cl * 7 + d][hr];
            if (id !== -1) {
              const ec = movableMap.get(id);
              if (ec && ec.mappedSubject === c.mappedSubject && ec.mappedId !== c.mappedId) return true;
            }
          }
        }
        return false;
      };
      const getConflictsAdvanced = (c, d, p, allowSoft) => {
        if (!checkRules(c, d, p)) return null;
        const mask = (1 << c.hours) - 1 << p;
        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        if (!allowSoft && subMasks && (subMasks[d] & mask) !== 0) return null;
        const conflicts = [];
        for (let i = 0; i < c.mappedClasses.length; i++) {
          const cl = c.mappedClasses[i];
          for (let hr = 0; hr < 15; hr++) {
            const id = grid_C[cl * 7 + d][hr];
            if (id !== -1) {
              const existingCard = movableMap.get(id);
              if (existingCard && existingCard.mappedSubject === c.mappedSubject && id !== c.mappedId) {
                if (!allowSoft) {
                  if (!conflicts.includes(id)) conflicts.push(id);
                }
              }
            }
          }
        }
        for (let i = 0; i < c.mappedTeachers.length; i++) {
          const t = c.mappedTeachers[i];
          if ((constraint_T[t * 7 + d] & mask) !== 0) return null;
          if ((state_T[t * 7 + d] & mask) !== 0) {
            for (let hr = 0; hr < c.hours; hr++) {
              const id = grid_T[t * 7 + d][p + hr];
              if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
            }
          }
        }
        for (let i = 0; i < c.mappedClasses.length; i++) {
          const cl = c.mappedClasses[i];
          if ((constraint_C[cl * 7 + d] & mask) !== 0) return null;
          if ((state_C[cl * 7 + d] & mask) !== 0) {
            for (let hr = 0; hr < c.hours; hr++) {
              const id = grid_C[cl * 7 + d][p + hr];
              if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
            }
          }
        }
        for (let i = 0; i < c.mappedRooms.length; i++) {
          const r = c.mappedRooms[i];
          if ((constraint_R[r * 7 + d] & mask) !== 0) return null;
          if ((state_R[r * 7 + d] & mask) !== 0) {
            for (let hr = 0; hr < c.hours; hr++) {
              const id = grid_R[r * 7 + d][p + hr];
              if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
            }
          }
        }
        return conflicts;
      };
      while (unplacedList.length > 0) {
        if (shouldStop) break;
        iter++;
        if (iter % 1e3 === 0) {
          T = Math.max(MIN_TEMP, T * COOLING_RATE);
          useSoftConstraints = ruinStreak > 3 || T < 10;
        }
        if (iter % 1e3 === 0) {
          const now = performance.now();
          if (now - startTime > TIMEOUT_MS) {
            console.log("Timeout reached, iterations:", iter);
            break;
          }
          if (now - lastYieldTime > 300) {
            const pct = Math.min(99, Math.floor((movableCards.length - unplacedList.length) / movableCards.length * 100));
            self.postMessage({ type: "progress", progress: pct, phase: `Kuantum Da\u011F\u0131t\u0131c\u0131 \u0130\u015Fleniyor... (${iter} iter) T:${T.toFixed(1)} Kalan: ${unplacedList.length}` });
            await new Promise((res) => setTimeout(res, 0));
            lastYieldTime = performance.now();
          }
        }
        let c_id = unplacedList[Math.floor(Math.random() * unplacedList.length)];
        if (Math.random() > 0.12 - (workerIndex || 0) * 0.02) {
          let best_score = -999999;
          for (let i = 0; i < Math.min(unplacedList.length, 25); i++) {
            const id = unplacedList[Math.floor(Math.random() * unplacedList.length)];
            const card = movableMap.get(id);
            if (card) {
              const score = card.hours * 80 + card.mappedTeachers.length * 35 + card.mappedClasses.length * 35 + card.mappedRooms.length * 20 + card.failCount * 30 + Math.random() * 20 + (workerIndex || 0) * 15;
              if (score > best_score) {
                best_score = score;
                c_id = id;
              }
            }
          }
        }
        const c = movableMap.get(c_id);
        if (!c) continue;
        let placed = false;
        let minConflictWeight = 999999;
        let bestSlot = null;
        let bestConflicts = [];
        shuffleArray(shuffledDaysIndices);
        let isStrictlyImpossible = true;
        for (let pass = 0; pass < 2 && !placed; pass++) {
          for (let dIdx of shuffledDaysIndices) {
            if (placed) break;
            const dayConfig = schoolSettings.weekDays[dIdx];
            const maxP = dayConfig.periods - c.hours;
            if (maxP < 0) continue;
            const starts = getShuffledStarts(maxP + 1);
            for (let i = 0; i <= maxP; i++) {
              const p = starts[i];
              const conflicts = getConflictsAdvanced(c, dIdx, p, useSoftConstraints && c.failCount > 10);
              if (conflicts !== null) isStrictlyImpossible = false;
              if (conflicts === null) continue;
              if (conflicts.length === 0) {
                place(c, dIdx, p);
                c.failCount = Math.max(0, c.failCount - 1);
                placed = true;
                break;
              }
            }
          }
        }
        if (!placed) {
          for (let dIdx of shuffledDaysIndices) {
            const dayConfig = schoolSettings.weekDays[dIdx];
            const maxP = dayConfig.periods - c.hours;
            if (maxP < 0) continue;
            const starts = getShuffledStarts(maxP + 1);
            for (let i = 0; i <= maxP; i++) {
              const p = starts[i];
              const conflicts = getConflictsAdvanced(c, dIdx, p, useSoftConstraints && c.failCount > 10);
              if (conflicts !== null) isStrictlyImpossible = false;
              if (conflicts === null) continue;
              const tabuKey = getTabuKey(c_id, dIdx, p);
              let isTabu = tabuSet.has(tabuKey);
              if (c.failCount > 30) isTabu = false;
              let weight = 0;
              let hasLockedConflict = false;
              for (let j = 0; j < conflicts.length; j++) {
                const cc = movableMap.get(conflicts[j]);
                if (cc) {
                  weight += cc.hours * cc.hours * 20 + (cc.mappedTeachers.length + cc.mappedClasses.length) * 15 + cc.failCount * 25;
                } else {
                  hasLockedConflict = true;
                  break;
                }
              }
              if (hasLockedConflict) continue;
              weight += Math.random() * 15;
              const delta = conflicts.length - 1;
              const saAccept = Math.random() < Math.exp(-delta / (T * 0.1));
              if ((!isTabu || saAccept) && weight < minConflictWeight) {
                minConflictWeight = weight;
                bestSlot = { d: dIdx, p };
                bestConflicts = conflicts;
              }
            }
          }
          if (isStrictlyImpossible) {
            removeFromUnplaced(c_id);
            continue;
          }
          if (bestSlot) {
            let kempeSuccess = false;
            if (useKempeChains && bestConflicts.length === 1 && Math.random() > 0.3) {
              const ec = movableMap.get(bestConflicts[0]);
              if (ec) {
                remove(ec);
                place(c, bestSlot.d, bestSlot.p);
                let ecPlaced = false;
                for (let kd of shuffledDaysIndices) {
                  if (ecPlaced) break;
                  const kmaxP = schoolSettings.weekDays[kd].periods - ec.hours;
                  if (kmaxP < 0) continue;
                  const kstarts = getShuffledStarts(kmaxP + 1);
                  for (let ki = 0; ki <= kmaxP; ki++) {
                    const kp = kstarts[ki];
                    const kconf = getConflictsAdvanced(ec, kd, kp, useSoftConstraints);
                    if (kconf !== null && kconf.length === 0) {
                      place(ec, kd, kp);
                      ecPlaced = true;
                      kempeSuccess = true;
                      break;
                    }
                  }
                }
                if (!kempeSuccess) {
                  remove(c);
                  place(ec, ec.d, ec.p);
                }
              }
            }
            if (!kempeSuccess) {
              bestConflicts.forEach((id) => {
                const ec = movableMap.get(id);
                if (ec) {
                  remove(ec);
                  ec.failCount += 3;
                  const tabuKey = getTabuKey(ec.mappedId, bestSlot.d, bestSlot.p);
                  if (!tabuSet.has(tabuKey)) {
                    tabuSet.add(tabuKey);
                    tabuQueue.push(tabuKey);
                    if (tabuQueue.length > maxTabuSize) {
                      const oldest = tabuQueue.shift();
                      if (oldest !== void 0) tabuSet.delete(oldest);
                    }
                  }
                }
              });
              place(c, bestSlot.d, bestSlot.p);
              c.failCount = 0;
            }
          } else {
            c.failCount += 4;
          }
        }
        if (unplacedList.length < minUnplacedCount) {
          minUnplacedCount = unplacedList.length;
          saveBestState();
          lastImprovement = iter;
          ruinStreak = 0;
        } else if (iter - lastImprovement > 6e4) {
          movableCards.forEach((cc) => {
            remove(cc);
            cc.failCount = 0;
          });
          tabuSet.clear();
          tabuQueue.length = 0;
          T = INITIAL_TEMP;
          const tempMovable = [...movableCards];
          shuffleArray(tempMovable);
          tempMovable.forEach((cc) => {
            let placedRand = false;
            shuffleArray(shuffledDaysIndices);
            for (let d of shuffledDaysIndices) {
              const dayConfig = schoolSettings.weekDays[d];
              const maxP = dayConfig.periods - cc.hours;
              if (maxP < 0) continue;
              const starts = getShuffledStarts(maxP + 1);
              for (let i = 0; i <= maxP; i++) {
                const p = starts[i];
                const conflicts = getConflictsAdvanced(cc, d, p, false);
                if (conflicts !== null && conflicts.length === 0) {
                  place(cc, d, p);
                  placedRand = true;
                  break;
                }
              }
              if (placedRand) break;
            }
          });
          lastImprovement = iter;
          ruinStreak = 0;
        } else if (iter - lastImprovement > 25e3) {
          ruinStreak += 2;
          T = Math.min(INITIAL_TEMP, T * 2);
          const placedCards = movableCards.filter((cc) => cc.d !== -1);
          if (placedCards.length > 0) {
            const ruinCount = Math.floor(placedCards.length * 0.9);
            shuffleArray(placedCards);
            for (let i = 0; i < ruinCount; i++) {
              remove(placedCards[i]);
              placedCards[i].failCount = 0;
            }
          }
          tabuSet.clear();
          tabuQueue.length = 0;
          lastImprovement = iter;
        } else if (iter - lastImprovement > 12e3) {
          ruinStreak++;
          T = Math.min(INITIAL_TEMP, T * 1.5);
          const placedCards = movableCards.filter((cc) => cc.d !== -1);
          if (placedCards.length > 0) {
            const unplacedArr = unplacedList.map((id) => movableMap.get(id));
            const unplacedTeachers = /* @__PURE__ */ new Set();
            const unplacedClasses = /* @__PURE__ */ new Set();
            unplacedArr.forEach((uc) => {
              if (uc) {
                uc.mappedTeachers.forEach((t) => unplacedTeachers.add(t));
                uc.mappedClasses.forEach((cl) => unplacedClasses.add(cl));
              }
            });
            const sortedForRuin = [...placedCards].sort((a, b) => {
              let scoreA = 0;
              let scoreB = 0;
              a.mappedTeachers.forEach((t) => {
                if (unplacedTeachers.has(t)) scoreA += 10;
              });
              a.mappedClasses.forEach((cl) => {
                if (unplacedClasses.has(cl)) scoreA += 10;
              });
              b.mappedTeachers.forEach((t) => {
                if (unplacedTeachers.has(t)) scoreB += 10;
              });
              b.mappedClasses.forEach((cl) => {
                if (unplacedClasses.has(cl)) scoreB += 10;
              });
              scoreA += a.failCount * 2;
              scoreB += b.failCount * 2;
              return scoreB - scoreA;
            });
            const baseFraction = Math.min(0.55, 0.08 + 0.06 * ruinStreak);
            const ruinCount = Math.min(placedCards.length, Math.max(1, Math.floor(placedCards.length * baseFraction)));
            const worstCount = Math.floor(ruinCount * 0.85);
            const randomCount = ruinCount - worstCount;
            const toRuinSet = /* @__PURE__ */ new Set();
            for (let i = 0; i < Math.min(sortedForRuin.length, worstCount); i++) {
              toRuinSet.add(sortedForRuin[i]);
            }
            const remaining = sortedForRuin.slice(worstCount);
            shuffleArray(remaining);
            for (let i = 0; i < Math.min(remaining.length, randomCount); i++) {
              toRuinSet.add(remaining[i]);
            }
            toRuinSet.forEach((cc) => {
              remove(cc);
              cc.failCount = Math.max(0, cc.failCount - 4);
            });
          }
          tabuSet.clear();
          tabuQueue.length = 0;
          lastImprovement = iter;
        }
      }
      if (unplacedList.length === 0 && useSoftConstraints) {
        for (let fixIter = 0; fixIter < 100; fixIter++) {
          if (fixIter % 10 === 0) {
            self.postMessage({ type: "progress", progress: 99, phase: `\u0130kincil k\u0131s\u0131tlar (Soft Constraints) onar\u0131l\u0131yor... (${fixIter}/100)` });
            await new Promise((res) => setTimeout(res, 0));
          }
          let softConflictCount = 0;
          const placedCards = movableCards.filter((cc) => cc.d !== -1);
          placedCards.forEach((c) => {
            if (isSoftConflict(c, c.d, c.p)) {
              softConflictCount++;
              remove(c);
              let fixed = false;
              for (let dIdx of shuffledDaysIndices) {
                if (fixed) break;
                const maxP = schoolSettings.weekDays[dIdx].periods - c.hours;
                if (maxP < 0) continue;
                const starts = getShuffledStarts(maxP + 1);
                for (let i = 0; i <= maxP; i++) {
                  const p = starts[i];
                  const conf = getConflictsAdvanced(c, dIdx, p, false);
                  if (conf !== null && conf.length === 0) {
                    place(c, dIdx, p);
                    fixed = true;
                    break;
                  }
                }
              }
              if (!fixed) {
                let kempeFixed = false;
                for (let dIdx of shuffledDaysIndices) {
                  if (kempeFixed) break;
                  const maxP = schoolSettings.weekDays[dIdx].periods - c.hours;
                  if (maxP < 0) continue;
                  const starts = getShuffledStarts(maxP + 1);
                  for (let i = 0; i <= maxP; i++) {
                    const p = starts[i];
                    const conf = getConflictsAdvanced(c, dIdx, p, false);
                    if (conf !== null && conf.length === 1) {
                      const ec = movableMap.get(conf[0]);
                      if (ec) {
                        remove(ec);
                        place(c, dIdx, p);
                        let ecFixed = false;
                        for (let kd of shuffledDaysIndices) {
                          if (ecFixed) break;
                          const kmax = schoolSettings.weekDays[kd].periods - ec.hours;
                          if (kmax < 0) continue;
                          const kstarts = getShuffledStarts(kmax + 1);
                          for (let ki = 0; ki <= kmax; ki++) {
                            const kp = kstarts[ki];
                            const kconf = getConflictsAdvanced(ec, kd, kp, false);
                            if (kconf !== null && kconf.length === 0) {
                              place(ec, kd, kp);
                              ecFixed = true;
                              break;
                            }
                          }
                        }
                        if (ecFixed) {
                          kempeFixed = true;
                          break;
                        } else {
                          remove(c);
                          place(ec, ec.d, ec.p);
                        }
                      }
                    }
                  }
                }
                if (!kempeFixed) {
                  place(c, c.d, c.p);
                }
              }
            }
          });
          if (softConflictCount === 0) break;
        }
        saveBestState();
      }
      const out_T = JSON.parse(JSON.stringify(schedules));
      const out_C = JSON.parse(JSON.stringify(classSchedules));
      const out_R = JSON.parse(JSON.stringify(roomSchedules));
      const applyToOut = (sched, keys, card, cardDataStr) => {
        (keys || []).forEach((k) => {
          if (!sched[k]) sched[k] = Array.from({ length: 7 }, () => Array(15).fill(""));
          for (let i = 0; i < card.hours; i++) sched[k][card.d][card.p + i] = cardDataStr;
        });
      };
      const outPool = [];
      Object.keys(out_T).forEach((t) => {
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            if (out_T[t][d]?.[p] && out_T[t][d][p] !== "" && !lockedCells[`${t}-${d}-${p}`]) {
              out_T[t][d][p] = "";
            }
          }
        }
      });
      Object.keys(out_C).forEach((c) => {
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            if (out_C[c][d]?.[p] && out_C[c][d][p] !== "" && !lockedCells[`${c}-${d}-${p}`]) {
              out_C[c][d][p] = "";
            }
          }
        }
      });
      Object.keys(out_R).forEach((r) => {
        for (let d = 0; d < 7; d++) {
          for (let p = 0; p < 15; p++) {
            if (out_R[r][d]?.[p] && out_R[r][d][p] !== "" && !lockedCells[`${r}-${d}-${p}`]) {
              out_R[r][d][p] = "";
            }
          }
        }
      });
      if (bestState) {
        const finalMap = /* @__PURE__ */ new Map();
        bestState.forEach((s) => finalMap.set(s.id, s));
        solverCards.forEach((c) => {
          const f = finalMap.get(c.id);
          if (f && f.d !== -1) {
            c.d = f.d;
            c.p = f.p;
            const cStr = JSON.stringify({ id: c.id, teachers: c.teachers, classes: c.classes, rooms: c.rooms, subject: c.subject, span: c.hours });
            applyToOut(out_T, c.teachers, c, cStr);
            applyToOut(out_C, c.classes, c, cStr);
            applyToOut(out_R, c.rooms, c, cStr);
          } else if (!c.fromBoard) {
            outPool.push({ ...c, failCount: 0 });
          } else if (c.fromBoard) {
            outPool.push({ ...c, failCount: 0 });
          }
        });
        self.postMessage({ type: "done", payload: { schedules: out_T, classSchedules: out_C, roomSchedules: out_R, unplacedCourses: outPool, iter } });
        return;
        if (outPool.length > 0) {
        } else {
        }
      } else {
        self.postMessage({ type: "error", message: "Da\u011F\u0131t\u0131m i\u015Flemi ger\xE7ekle\u015Ftirilemedi." });
        return;
      }
    };
    autoDistributePro().catch((err) => {
      self.postMessage({ type: "error", message: "\xC7\xF6kt\xFC: " + err.message });
    });
  } catch (err) {
    self.postMessage({ type: "error", message: err.message });
  }
};
