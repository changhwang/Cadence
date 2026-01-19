// App Logic (V9 - Clean Rebuild)

const state = {
    view: 'workout',
    date: new Date().toLocaleDateString('ko-KR'),
    dietDate: new Date().toLocaleDateString('ko-KR'),
    userSettings: Store.get('user_settings', { targetCal: 2500, targetPro: 160, targetWater: 2000 }),
    timer: { mode: null, seconds: 0, intervalId: null, exercise: null, targetRest: 90 }
};

// --- Core Render ---
function render() {
    document.querySelectorAll('.tab-item').forEach(el => el.classList.toggle('active', el.dataset.tab === state.view));
    const main = document.getElementById('main-content');
    main.innerHTML = '';

    if (state.view === 'workout') renderWorkoutBuilder(main);
    else if (state.view === 'diet') renderDietView(main);
    else if (state.view === 'weight') renderWeightView(main);

    // @ts-ignore
    lucide.createIcons();
}

// --- View: Workout Builder ---
function renderWorkoutBuilder(container) {
    const planKey = `plan_${state.date}`;
    const todaysPlan = Store.get(planKey, []);
    const logKey = `workout_${state.date}`;
    const todaysLogs = Store.get(logKey, {});

    // 1. Calculate Stats
    let totalSets = 0;
    let totalVol = 0;
    let totalCardio = 0;
    let totalKcal = 0;

    Object.keys(todaysLogs).forEach(key => {
        const logs = todaysLogs[key];
        if (CARDIO_DB[key]) {
            const db = CARDIO_DB[key];
            logs.forEach(l => {
                totalCardio += parseFloat(l.duration || 0);
                if (l.cal) {
                    totalKcal += parseFloat(l.cal);
                } else {
                    const dur = parseFloat(l.duration || 0);
                    const weight = 75;
                    let calculated = 0;
                    if (l.note && l.note.toString().includes('km')) {
                        const dist = parseFloat(l.note) || 0;
                        calculated = dist * weight * 1.05;
                    } else {
                        let mult = 1.0;
                        const n = l.note || '';
                        if (n === 'Low') mult = 0.7;
                        if (n === 'High') mult = 1.3;
                        if (n === 'Max') mult = 1.6;
                        calculated = (db.met * mult) * weight * (dur / 60);
                    }
                    totalKcal += Math.round(calculated);
                }
            });
        } else {
            totalSets += logs.length;
            totalKcal += (logs.length * 7);
            logs.forEach(l => totalVol += (parseFloat(l.wt || 0) * parseFloat(l.reps || 0)));
        }
    });

    // 2. Sticky Header (V12 Refined)
    const header = document.createElement('div');
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '1000';
    header.style.background = '#ffffff'; // Solid white to hide scroll residue
    header.style.borderBottom = '1px solid #eee';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '15px 20px';
    header.style.marginBottom = '20px';

    header.innerHTML = `
        <div style="font-size:22px; font-weight:800; color:black;">Workout Log</div>
        <div style="display:flex; align-items:center; gap:5px;">
            <button onclick="changeDate(-1)" style="background:none; border:none; padding:8px; color:var(--ios-blue); cursor:pointer;"><i data-lucide="chevron-left"></i></button>
            <button onclick="openCalendarModal()" style="background:#f2f4f7; border:none; padding:8px 12px; border-radius:18px; color:var(--ios-blue); font-weight:600; font-size:14px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                ${state.date} 
                <i data-lucide="calendar" style="width:16px; height:16px;"></i>
            </button>
            <button onclick="changeDate(1)" style="background:none; border:none; padding:8px; color:var(--ios-blue); cursor:pointer;"><i data-lucide="chevron-right"></i></button>
        </div>
    `;
    container.appendChild(header);

    // 3. Stats Banner
    const stats = document.createElement('div');
    stats.className = 'card';
    stats.style.padding = '15px';
    stats.style.background = 'linear-gradient(135deg, #007AFF, #5856D6)';
    stats.style.color = 'white';
    stats.style.marginBottom = '20px';
    stats.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; text-align:center; gap:5px;">
             <div><div style="font-size:18px; font-weight:800;">${totalSets}</div><div style="font-size:11px; opacity:0.8;">Sets</div></div>
             <div><div style="font-size:18px; font-weight:800;">${(totalVol * 2.2 / 1000).toFixed(1)}k</div><div style="font-size:11px; opacity:0.8;">Vol (lb)</div></div>
             <div><div style="font-size:18px; font-weight:800;">${totalCardio}</div><div style="font-size:11px; opacity:0.8;">Cardio</div></div>
             <div><div style="font-size:18px; font-weight:800;">${totalKcal}</div><div style="font-size:11px; opacity:0.8;">Kcal</div></div>
        </div>
    `;
    container.appendChild(stats);

    // 4. Exercise List
    const list = document.createElement('div');
    list.style.marginBottom = '20px';

    if (todaysPlan.length === 0) {
        list.innerHTML = `<div class="card" style="text-align:center; padding:40px 20px; color:gray;"><i data-lucide="dumbbell" style="width:48px; height:48px; margin-bottom:10px;"></i><div style="font-size:16px;">No exercises planned for today</div></div>`;
    } else {
        todaysPlan.forEach((item, idx) => {
            // Support both string (legacy) and object (new)
            const exName = typeof item === 'string' ? item : item.name;
            const exTarget = typeof item === 'string' ? null : item; // Custom targets

            const dbData = EXERCISE_DB[exName] || CARDIO_DB[exName] || {};
            const isCardio = !!CARDIO_DB[exName];
            const logs = todaysLogs[exName] || [];

            const card = document.createElement('div');
            card.className = 'card';
            card.style.marginBottom = '10px';
            card.style.cursor = 'pointer';
            card.onclick = () => isCardio ? openCardioModal(exName) : openWorkoutDetail(idx); // Pass Index for editing specific plan item

            let logDisplay = '';
            if (isCardio) {
                const totalDur = logs.reduce((sum, l) => sum + parseFloat(l.duration || 0), 0);
                logDisplay = totalDur > 0 ? `<div style="color:var(--ios-green); font-weight:600;">${totalDur} min logged</div>` : '<div style="color:gray;">Tap to log</div>';
            } else {
                logDisplay = logs.length > 0 ? `<div style="color:var(--ios-green); font-weight:600;">${logs.length} sets logged</div>` : '<div style="color:gray;">Tap to start</div>';
            }

            // Display Targets if custom
            let targetDisplay = '';
            if (!isCardio && exTarget) {
                targetDisplay = `<div style="font-size:12px; color:gray; margin-top:4px;">Target: ${exTarget.sets} x ${exTarget.reps} (${exTarget.rest}s rest)</div>`;
            }

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:700; font-size:16px;">${exName}</div>
                        ${targetDisplay}
                        <div style="font-size:13px; color:gray;">${dbData.target || ''} ${dbData.sets ? '· ' + dbData.sets + ' sets' : ''}</div>
                    </div>
                    ${logDisplay}
                </div>
            `;
            list.appendChild(card);
        });
    }
    container.appendChild(list);

    // 5. Action Buttons
    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.style.width = '100%';
    addBtn.style.marginBottom = '10px';
    addBtn.style.background = 'white';
    addBtn.style.color = 'var(--ios-blue)';
    addBtn.style.border = '2px solid var(--ios-blue)';
    addBtn.style.display = 'flex';
    addBtn.style.alignItems = 'center';
    addBtn.style.justifyContent = 'center';
    addBtn.style.gap = '8px';
    addBtn.innerHTML = '<i data-lucide="plus" style="width:20px; height:20px;"></i> Add to Plan';
    addBtn.onclick = openAddMenu;
    container.appendChild(addBtn);

    if (todaysPlan.length > 0) {
        const manageBtn = document.createElement('div');
        manageBtn.style.textAlign = 'center';
        manageBtn.style.cursor = 'pointer';
        manageBtn.style.padding = '10px';
        manageBtn.style.color = 'var(--ios-red)';
        manageBtn.style.fontSize = '14px';
        manageBtn.style.fontWeight = '500';
        manageBtn.innerHTML = 'Edit / Delete List';
        manageBtn.onclick = openBulkManagement;
        container.appendChild(manageBtn);
    }
}

// --- View: Diet Tracker ---
function renderDietView(container) {
    const dietKey = `diet_${state.dietDate}`;
    const saved = Store.get(dietKey, {});
    const todaysDiet = {
        breakfast: saved.breakfast || [],
        lunch: saved.lunch || [],
        dinner: saved.dinner || [],
        snack: saved.snack || [],
        water: saved.water || 0
    };

    // 1. Stats Calculation
    const settings = state.userSettings;
    let totalCal = 0;
    let totalPro = 0;
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(meal => {
        todaysDiet[meal].forEach(item => {
            totalCal += parseFloat(item.cal || 0);
            totalPro += parseFloat(item.pro || 0);
        });
    });

    const calProgress = Math.min(100, (totalCal / settings.targetCal) * 100);
    const proProgress = Math.min(100, (totalPro / settings.targetPro) * 100);
    const waterProgress = Math.min(100, (todaysDiet.water / settings.targetWater) * 100);

    // 2. Stats Header
    const stats = document.createElement('div');
    stats.style.padding = '15px';
    stats.style.marginBottom = '20px';
    stats.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:15px;">
             <div>
                <div style="font-size:32px; font-weight:800;">${Math.round(totalCal)}</div>
                <div style="font-size:13px; color:gray;">/ ${settings.targetCal} kcal</div>
             </div>
             <div style="text-align:right;">
                <div style="font-size:20px; font-weight:600; color:var(--ios-blue);">${Math.round(totalPro)}g</div>
                <div style="font-size:13px; color:gray;">Protein / ${settings.targetPro}g</div>
             </div>
        </div>
        
        <!-- Bars -->
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>Calories</span>
                <span>${Math.round(calProgress)}%</span>
            </div>
            <div style="height:8px; background:#E5E5EA; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${calProgress}%; background:var(--ios-green);"></div>
            </div>
        </div>
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>Protein</span>
                <span>${Math.round(proProgress)}%</span>
            </div>
            <div style="height:8px; background:#E5E5EA; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${proProgress}%; background:var(--ios-blue);"></div>
            </div>
        </div>
        <div>
             <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>Water (${todaysDiet.water}ml)</span>
                <span>${Math.round(waterProgress)}%</span>
            </div>
            <div style="height:8px; background:#E5E5EA; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${waterProgress}%; background:#5AC8FA;"></div>
            </div>
        </div>
    `;
    container.appendChild(stats);

    // 2b. Date Header (Diet)
    const dateRow = document.createElement('div');
    dateRow.style.display = 'flex';
    dateRow.style.justifyContent = 'space-between';
    dateRow.style.padding = '0 15px 15px 15px';
    dateRow.innerHTML = `
        <div style="font-size:18px; font-weight:700;">${state.dietDate}</div>
        <button onclick="openDietDatePicker()" style="background:none; border:none; color:var(--ios-blue); font-weight:600;">Change Date</button>
    `;
    container.appendChild(dateRow);

    // 3. Meals
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
        const section = document.createElement('div');
        section.className = 'card';
        section.style.marginBottom = '15px';

        const title = mealType.charAt(0).toUpperCase() + mealType.slice(1);
        const items = todaysDiet[mealType];
        const sectionCal = items.reduce((sum, i) => sum + parseFloat(i.cal), 0);

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #eee;">
                <div style="font-weight:700; font-size:16px;">${title}</div>
                <div style="font-size:14px; color:gray;">${Math.round(sectionCal)} kcal</div>
            </div>
        `;

        if (items.length === 0) {
            html += `<div style="text-align:center; padding:10px; color:gray; font-size:14px;">No foods logged</div>`;
        } else {
            items.forEach((item, idx) => {
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f9f9f9;">
                        <div>
                            <div style="font-size:15px;">${item.name}</div>
                            <div style="font-size:12px; color:gray;">${item.amount}${item.unit}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:14px;">${item.cal} kcal</div>
                            <button onclick="removeDietLog('${mealType}', ${idx})" style="background:none; border:none; color:silver; font-size:18px; padding:0 5px;">&times;</button>
                        </div>
                    </div>
                `;
            });
        }

        html += `
            <button onclick="openAddFoodMenu('${mealType}')" style="width:100%; margin-top:10px; padding:8px; background:rgba(0,122,255,0.1); color:var(--ios-blue); border:none; border-radius:8px; font-weight:600;">+ Add Food</button>
        `;

        section.innerHTML = html;
        container.appendChild(section);
    });

    // 4. Water Log
    const waterCard = document.createElement('div');
    waterCard.className = 'card';
    waterCard.style.marginBottom = '80px'; // Space for tab bar
    waterCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
             <div style="font-weight:700; font-size:16px;">Water Intake</div>
             <div style="display:flex; gap:10px;">
                 <button onclick="logWater(-250)" style="width:32px; height:32px; border-radius:16px; border:1px solid #ddd; background:white;">-</button>
                 <button onclick="logWater(250)" style="width:32px; height:32px; border-radius:16px; border:1px solid #ddd; background:white;">+</button>
             </div>
        </div>
    `;
    container.appendChild(waterCard);
}

// --- View: Weight Tracker ---
function renderWeightView(container) {
    const weightHistory = Store.get('weight_history', []);
    const lastWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : '--';

    container.innerHTML = `
        <div style="text-align:center; padding:40px 0;">
            <div style="font-size:16px; color:gray; margin-bottom:10px;">Current Weight</div>
            <div style="font-size:48px; font-weight:800; color:var(--ios-black);">${lastWeight} <span style="font-size:24px; font-weight:500;">kg</span></div>
        </div>
        
        <div style="padding:0 20px;">
            <div style="display:flex; gap:10px; margin-bottom:30px;">
                <input type="number" id="weightInput" placeholder="0.0" style="flex:1; padding:15px; background:white; border:none; border-radius:12px; font-size:18px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <button onclick="logWeight()" style="padding:0 25px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">Log</button>
            </div>
            
            <h3 style="margin-bottom:15px;">History</h3>
            <div class="card">
                ${weightHistory.slice().reverse().map((entry, idx) => `
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;">
                        <div style="color:gray;">${entry.date}</div>
                        <div style="font-weight:600;">${entry.weight} kg</div>
                         <button onclick="deleteWeightLog(${weightHistory.length - 1 - idx})" style="background:none; border:none; color:silver;">&times;</button>
                    </div>
                `).join('')}
                ${weightHistory.length === 0 ? '<div style="text-align:center; color:gray;">No records yet</div>' : ''}
            </div>
        </div>
    `;
}

// --- Date Logic ---
window.openDatePicker = () => {
    const newDate = prompt("Enter date (YYYY. M. D.)", state.date);
    if (newDate) {
        state.date = newDate;
        render();
    }
};

window.openDietDatePicker = () => {
    const newDate = prompt("Enter date (YYYY. M. D.)", state.dietDate);
    if (newDate) {
        state.dietDate = newDate;
        render();
    }
};

window.selectDate = (d) => { state.date = d; render(); };
window.selectDietDate = (d) => { state.dietDate = d; render(); };

// --- Modals & Logic ---

// 1. Add Menu (Exercise)
window.openAddMenu = () => {
    const modal = createModal('Add to Plan');
    modal.innerHTML = `
        <div style="display:grid; gap:10px;">
            <button onclick="closeModal(); openRoutineImporter()" style="padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">Import Routine</button>
            <button onclick="closeModal(); openExerciseModal()" style="padding:15px; background:white; color:var(--ios-blue); border:1px solid var(--ios-blue); border-radius:12px; font-weight:600;">Browse Exercises</button>
            <button onclick="closeModal(); openCardioModal()" style="padding:15px; background:white; color:var(--ios-green); border:1px solid var(--ios-green); border-radius:12px; font-weight:600;">Add Cardio</button>
        </div>
    `;
};

// 2. Routine Importer
// 2. Routine Importer (Smart)
window.openRoutineImporter = (selectedKey = null) => {
    const modal = createModal('Import Routine');

    if (selectedKey) {
        // Step 2: Checklist
        const r = ROUTINE_TEMPLATES[selectedKey];
        let html = `
            <div style="margin-bottom:15px; color:gray;">Uncheck items you don't want to do today.</div>
            <div style="max-height:50vh; overflow-y:auto; margin-bottom:15px;">
        `;

        r.exercises.forEach((ex, idx) => {
            html += `
                <div style="display:flex; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                    <input type="checkbox" id="routine_check_${idx}" checked style="width:24px; height:24px; margin-right:15px;">
                    <label for="routine_check_${idx}" style="font-size:16px;">${ex}</label>
                </div>
            `;
        });

        html += `</div>
            <button onclick="importRoutine('${selectedKey}')" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">Import Selected</button>
            <button onclick="openRoutineImporter()" style="width:100%; margin-top:10px; padding:10px; background:none; border:none; color:gray;">Back</button>
        `;
        modal.innerHTML = html;

    } else {
        // Step 1: List Routines
        let html = '';
        Object.keys(ROUTINE_TEMPLATES).forEach(key => {
            const r = ROUTINE_TEMPLATES[key];
            html += `
                <div style="background:var(--ios-gray); padding:15px; border-radius:12px; margin-bottom:10px; cursor:pointer;" onclick="closeModal(); setTimeout(() => openRoutineImporter('${key}'), 100)">
                    <div style="font-weight:700; margin-bottom:5px;">${r.title}</div>
                    <div style="font-size:12px; color:white;">${r.exercises.join(', ')}</div>
                </div>
            `;
        });
        modal.innerHTML = html;
    }
};

window.importRoutine = (key) => {
    const r = ROUTINE_TEMPLATES[key];
    if (!r) return;

    // Collect checked items and convert to Objects
    const toImport = [];
    r.exercises.forEach((ex, idx) => {
        const cb = document.getElementById(`routine_check_${idx}`);
        if (cb && cb.checked) {
            const db = EXERCISE_DB[ex] || {};
            toImport.push({
                name: ex,
                sets: db.sets || 3,
                reps: db.target || "8-12",
                rest: db.rest || 90,
                fromRoutine: true
            });
        }
    });

    if (toImport.length === 0) {
        alert("No exercises selected.");
        return;
    }

    const planKey = `plan_${state.date}`;
    const current = Store.get(planKey, []);
    const newPlan = [...new Set([...current, ...toImport])];
    Store.set(planKey, newPlan);
    closeModal();
    render();
};

// 3. Exercise Browser
window.openExerciseModal = (filter = null) => {
    const modal = createModal('Exercises');
    const categories = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

    let html = `
        <div style="display:flex; gap:5px; overflow-x:auto; padding-bottom:10px; margin-bottom:10px;">
            <button onclick="closeModal(); openExerciseModal()" style="padding:5px 12px; border-radius:15px; border:none; background:${!filter ? 'var(--ios-blue)' : '#eee'}; color:${!filter ? 'white' : 'black'}; white-space:nowrap;">All</button>
            ${categories.map(c => `
                <button onclick="closeModal(); openExerciseModal('${c}')" style="padding:5px 12px; border-radius:15px; border:none; background:${filter === c ? 'var(--ios-blue)' : '#eee'}; color:${filter === c ? 'white' : 'black'}; white-space:nowrap;">${c}</button>
            `).join('')}
        </div>
        <div style="max-height:60vh; overflow-y:auto;">
    `;

    Object.keys(EXERCISE_DB).forEach(key => {
        const ex = EXERCISE_DB[key];
        if (filter && ex.category !== filter) return;

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eee;">
                <div>
                    <div style="font-weight:600;">${key}</div>
                    <div style="font-size:12px; color:gray;">${ex.category} · ${ex.type}</div>
                </div>
                <button onclick="openAddConfigModal('${key}')" style="background:var(--ios-blue); color:white; border:none; padding:8px 15px; border-radius:15px; font-weight:600; font-size:12px;">ADD</button>
            </div>
        `;
    });
    html += '</div>';
    modal.innerHTML = html;
};

// 3.1 Configurable Add Modal
window.openAddConfigModal = (exName) => {
    const db = EXERCISE_DB[exName] || {};
    const defaultSets = db.sets || 3;
    const defaultReps = db.target || "8-12";
    const defaultRest = db.rest || 90;

    const modal = createModal(`Add ${exName}`);
    modal.innerHTML = `
        <div style="margin-bottom:20px;">
            <label style="color:gray; font-size:12px; display:block; margin-bottom:5px;">Target Sets</label>
            <div style="display:flex; align-items:center; gap:10px;">
                <button onclick="adjustVal('addSets', -1)" style="width:40px; height:40px; border-radius:10px; border:1px solid #ddd; background:white;">-</button>
                <input id="addSets" type="number" value="${defaultSets}" style="text-align:center; font-size:20px; font-weight:700; border:none; width:60px;">
                <button onclick="adjustVal('addSets', 1)" style="width:40px; height:40px; border-radius:10px; border:1px solid #ddd; background:white;">+</button>
            </div>
        </div>

        <div style="margin-bottom:20px;">
            <label style="color:gray; font-size:12px; display:block; margin-bottom:5px;">Target Reps / Time</label>
            <input id="addReps" type="text" value="${defaultReps}" style="width:100%; padding:15px; border:1px solid #ddd; border-radius:12px; font-size:18px;">
        </div>

        <div style="margin-bottom:30px;">
            <label style="color:gray; font-size:12px; display:block; margin-bottom:5px;">Rest Time (Seconds)</label>
            <div style="display:flex; align-items:center; gap:10px;">
                <button onclick="adjustVal('addRest', -10)" style="width:40px; height:40px; border-radius:10px; border:1px solid #ddd; background:white;">-</button>
                <input id="addRest" type="number" value="${defaultRest}" style="text-align:center; font-size:20px; font-weight:700; border:none; width:80px;">
                <button onclick="adjustVal('addRest', 10)" style="width:40px; height:40px; border-radius:10px; border:1px solid #ddd; background:white;">+</button>
            </div>
        </div>

        <button onclick="confirmAddExercise('${exName}')" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-size:16px; font-weight:700;">Add to Workout</button>
    `;

    // Helper for +/- buttons
    window.adjustVal = (id, delta) => {
        const el = document.getElementById(id);
        let val = parseInt(el.value) || 0;
        val += delta;
        if (val < 0) val = 0;
        el.value = val;
    };
};

window.confirmAddExercise = (exName) => {
    const sets = parseInt(document.getElementById('addSets').value) || 3;
    const reps = document.getElementById('addReps').value || "8-12";
    const rest = parseInt(document.getElementById('addRest').value) || 90;

    const planKey = `plan_${state.date}`;
    const current = Store.get(planKey, []);

    // Add as Object
    current.push({
        name: exName,
        sets: sets,
        reps: reps,
        rest: rest,
        addedAt: Date.now()
    });

    Store.set(planKey, current);

    // Find overlay with higher Z-index (the 2nd modal)
    // Actually, createModal appends to body. The last one is on top.

    // We want to close BOTH modals? Or just this one?
    // User said "Add 할때 누르면 Modal 안없어지는데..."
    // Let's close Everything for a fresh start.
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    render();
};

window.addExerciseToPlan = (name) => {
    // Legacy direct add is deprecated for UI, but kept for Cardio call
    // Actually Cardio calls this directly? No, Cardio has its own modal.
    // This is used by Routine Import maybe? 
    // Routine Import uses direct Store manipulation.
    // So this function is mainly for the 'Browse' list buttons.
    // I replaced the button onclick in the chunk above.
    openAddConfigModal(name);
};
// 4. Cardio Modal
window.openCardioModal = (editName = null) => {
    const modal = createModal(editName ? 'Log Cardio' : 'Add Cardio');
    if (editName) {
        const icon = CARDIO_DB[editName].icon;
        modal.innerHTML = `
            <div style="text-align:center; margin-bottom:20px;">
                <i data-lucide="${icon}" style="width:48px; height:48px; color:var(--ios-green); margin-bottom:10px;"></i>
                <h3 style="margin:0;">${editName}</h3>
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">Duration (min) *</label>
                <input type="number" id="cardioDur" style="width:100%; padding:15px; border:2px solid var(--ios-green); border-radius:12px; font-size:24px; text-align:center; font-weight:700;">
            </div>
             <div style="margin-bottom:15px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">Intensity</label>
                <select id="cardioInt" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:12px; font-size:16px; background:white;">
                    <option value="1.0">Normal (Auto)</option>
                    <option value="0.7">Low (Light effort)</option>
                    <option value="1.3">High (Hard effort)</option>
                </select>
            </div>
             <div style="margin-bottom:20px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">Calories (Optional)</label>
                <input type="number" id="cardioCal" placeholder="Auto-calculated if empty" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:12px; font-size:16px;">
            </div>
            <button onclick="logCardio('${editName}')" style="width:100%; padding:15px; background:var(--ios-green); color:white; border:none; border-radius:12px; font-weight:600;">Save Log</button>
        `;
        setTimeout(() => document.getElementById('cardioDur').focus(), 100);
    } else {
        let html = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">';
        Object.keys(CARDIO_DB).forEach(key => {
            const c = CARDIO_DB[key];
            html += `
                <div onclick="addExerciseToPlan('${key}'); closeModal();" style="background:#f9f9f9; padding:15px; border-radius:12px; text-align:center; cursor:pointer;">
                    <i data-lucide="${c.icon}" style="width:24px; height:24px; margin-bottom:5px;"></i>
                    <div style="font-size:13px; font-weight:600;">${key}</div>
                </div>
            `;
        });
        html += '</div>';
        modal.innerHTML = html;
    }
    lucide.createIcons();
};

window.logCardio = (name) => {
    const dur = parseFloat(document.getElementById('cardioDur').value);
    const calInput = document.getElementById('cardioCal').value;
    const intensity = parseFloat(document.getElementById('cardioInt').value);

    if (!dur) return;

    let finalCal = 0;
    if (calInput) {
        finalCal = parseFloat(calInput);
    } else {
        // Auto Calc: MET * Weight * (Time/60)
        const db = CARDIO_DB[name] || { met: 5 };
        const weight = 75; // Default or fetch from history
        finalCal = Math.round(db.met * intensity * weight * (dur / 60));
    }

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {});
    if (!logs[name]) logs[name] = [];

    logs[name].push({ duration: dur, cal: finalCal, intensity: intensity, timestamp: Date.now() });
    Store.set(key, logs);
    closeModal();
    render();
};

// 5. Diet Actions
window.openAddFoodMenu = (mealType) => {
    const modal = createModal('Add Food');
    modal.innerHTML = `
        <input type="text" id="foodSearch" placeholder="Search food..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:15px;">
        <div id="foodResults" style="max-height:50vh; overflow-y:auto;"></div>
    `;

    const input = document.getElementById('foodSearch');
    input.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const results = document.getElementById('foodResults');
        results.innerHTML = '';

        if (term.length < 1) return;

        Object.keys(FOOD_DB).forEach(key => {
            if (key.toLowerCase().includes(term)) {
                const item = FOOD_DB[key];
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #eee';
                div.style.cursor = 'pointer';
                div.innerHTML = `<div>${key}</div><div style="font-size:12px; color:gray;">${item.cal} kcal / ${item.default_gram}${item.unit}</div>`;
                div.onclick = () => {
                    closeModal(); // Close search
                    openMealDetail(mealType, key);
                };
                results.appendChild(div);
            }
        });
    };
    setTimeout(() => input.focus(), 100);
};

window.openMealDetail = (mealType, foodName) => {
    const item = FOOD_DB[foodName];
    const modal = createModal(foodName);
    modal.innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <input type="number" id="foodAmount" value="${item.default_gram}" style="flex:1; padding:10px; border:1px solid #ddd; border-radius:8px;">
                <div style="padding:10px; background:#eee; border-radius:8px;">${item.unit}</div>
            </div>
            <div style="font-size:14px; color:gray; text-align:center;">
                <span id="calcCal">${item.cal}</span> kcal · 
                <span id="calcPro">${item.pro}</span>g Pro
            </div>
        </div>
        <button onclick="addNewMeal('${mealType}', '${foodName}')" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">Add Log</button>
    `;

    const input = document.getElementById('foodAmount');
    input.oninput = (e) => {
        const ratio = e.target.value / item.default_gram;
        document.getElementById('calcCal').innerText = Math.round(item.cal * ratio);
        document.getElementById('calcPro').innerText = (item.pro * ratio).toFixed(1);
    };
    setTimeout(() => input.select(), 100);
};

window.addNewMeal = (mealType, foodName) => {
    const amount = document.getElementById('foodAmount').value;
    const item = FOOD_DB[foodName];
    const ratio = amount / item.default_gram;

    const log = {
        name: foodName,
        amount: amount,
        unit: item.unit,
        cal: Math.round(item.cal * ratio),
        pro: (item.pro * ratio).toFixed(1),
        timestamp: Date.now()
    };

    const key = `diet_${state.dietDate}`;
    const diet = Store.get(key, { breakfast: [], lunch: [], dinner: [], snack: [], water: 0 });
    diet[mealType].push(log);
    Store.set(key, diet);

    closeModal();
    render();
};

window.removeDietLog = (mealType, idx) => {
    if (!confirm('Remove this item?')) return;
    const key = `diet_${state.dietDate}`;
    const diet = Store.get(key, { breakfast: [], lunch: [], dinner: [], snack: [], water: 0 });
    diet[mealType].splice(idx, 1);
    Store.set(key, diet);
    render();
};

window.logWater = (amount) => {
    const key = `diet_${state.dietDate}`;
    const diet = Store.get(key, { breakfast: [], lunch: [], dinner: [], snack: [], water: 0 });
    diet.water = Math.max(0, (diet.water || 0) + amount);
    Store.set(key, diet);
    render();
};

// 6. Weight Actions
window.logWeight = () => {
    const val = document.getElementById('weightInput').value;
    if (!val) return;
    const history = Store.get('weight_history', []);
    history.push({ date: new Date().toLocaleDateString('ko-KR'), weight: val });
    Store.set('weight_history', history);
    document.getElementById('weightInput').value = '';
    render();
};

window.deleteWeightLog = (idx) => {
    if (!confirm('Remove this record?')) return;
    const history = Store.get('weight_history', []);
    history.splice(idx, 1);
    Store.set('weight_history', history);
    render();
};

// 7. Bulk Management (Simple)
// 7. Bulk Management (Checkbox Mode)
window.openBulkManagement = () => {
    const modal = createModal('Manager'); // Shorter title
    const planKey = `plan_${state.date}`;
    const current = Store.get(planKey, []);

    let html = '';
    if (current.length === 0) {
        html = '<div style="text-align:center; padding:20px; color:gray;">List is empty</div>';
    } else {
        html += '<div style="margin-bottom:15px; font-size:14px; color:gray;">Select items to remove:</div>';
        current.forEach((ex, idx) => {
            html += `
                <div style="display:flex; align-items:center; padding:12px; border-bottom:1px solid #eee;">
                    <input type="checkbox" id="del_check_${idx}" style="width:24px; height:24px; margin-right:15px;">
                    <label for="del_check_${idx}" style="font-size:16px; flex:1;">${ex.name || ex}</label>
                </div>
            `;
        });
        html += `
            <button onclick="deleteSelectedExercises()" style="width:100%; margin-top:20px; padding:15px; background:var(--ios-red); color:white; border:none; border-radius:12px; font-weight:600;">Delete Selected</button>
        `;
    }
    modal.innerHTML = html;
};

window.deleteSelectedExercises = () => {
    const planKey = `plan_${state.date}`;
    const current = Store.get(planKey, []);

    // Find checked indices
    const toDelete = [];
    current.forEach((_, idx) => {
        const checkbox = document.getElementById(`del_check_${idx}`);
        if (checkbox && checkbox.checked) {
            toDelete.push(idx);
        }
    });

    if (toDelete.length === 0) {
        alert("Please select items to delete.");
        return;
    }

    if (!confirm(`Delete ${toDelete.length} items?`)) return;

    // Filter out deleted items (reverse order to keep indices valid? No, easier to filter)
    // Actually, filter by checking if index is in toDelete
    const newPlan = current.filter((_, idx) => !toDelete.includes(idx));

    Store.set(planKey, newPlan);
    closeModal();
    render();
};

// --- Utils ---
function createModal(title) {
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay open';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'flex-end'; // Sheet style
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.background = 'white';
    content.style.width = '100%';
    content.style.borderRadius = '20px 20px 0 0';
    content.style.padding = '20px';
    content.style.maxHeight = '90vh';
    content.style.overflowY = 'auto';
    content.style.animation = 'slideUp 0.3s ease-out';

    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0; font-size:20px;">${title}</h2>
            <button onclick="closeModal()" style="background:#eee; border:none; width:30px; height:30px; border-radius:15px; color:gray;">&times;</button>
        </div>
    `;

    // Add slideUp keyframes if not exists
    if (!document.getElementById('anim-style')) {
        const style = document.createElement('style');
        style.id = 'anim-style';
        style.innerHTML = `@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`;
        document.head.appendChild(style);
    }

    const body = document.createElement('div');
    content.appendChild(body);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    return body; // Return the body container for injecting content
}

window.closeModal = () => {
    const el = document.getElementById('modal-overlay');
    if (el) el.remove();
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Tab Listeners
    document.querySelectorAll('.tab-item').forEach(btn => {
        btn.onclick = () => {
            state.view = btn.dataset.tab;
            render();
        };
    });

    render();
});

// --- Active Workout Mode Logic ---
const TIMER_AUDIO = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3');

window.openWorkoutDetail = (planIdx) => {
    // 1. Get Plan Item
    const planKey = `plan_${state.date}`;
    const plan = Store.get(planKey, []);
    const item = plan[planIdx];

    // Fallback if item is string or missing
    if (!item) return;
    const exName = typeof item === 'string' ? item : item.name;
    const targets = typeof item === 'string' ?
        (EXERCISE_DB[exName] || { sets: 3, reps: "8-12", rest: 90 }) :
        { sets: item.sets, reps: item.reps, rest: item.rest };

    const modal = createModal(exName);
    const logKey = `workout_${state.date}`;
    const logs = Store.get(logKey, {});
    const exLogs = logs[exName] || [];

    // 2. History Lookup (Relative to Viewed Date)
    const history = getExerciseHistory(exName, state.date);
    let historyHtml = '<div style="font-size:13px; color:gray; margin-bottom:15px; text-align:center;">No recent history</div>';

    if (history) {
        let rows = history.logs.map((l, i) =>
            `<div style="display:flex; justify-content:space-between; padding:2px 0;">
                <span>Set ${i + 1}</span>
                <span style="font-weight:600; color:var(--ios-blue);">${l.wt}lb x ${l.reps}</span>
            </div>`
        ).join('');

        historyHtml = `
            <div style="background:#f5f5f5; border-radius:10px; padding:10px; margin-bottom:15px;">
                <div style="font-size:12px; color:#888; margin-bottom:5px; text-align:center;">Last Session: ${history.date}</div>
                ${rows}
            </div>
        `;
    }

    // Determine last logged weight for pre-filling input
    const lastWt = exLogs.length > 0 ? exLogs[exLogs.length - 1].wt : (history && history.logs.length > 0 ? history.logs[history.logs.length - 1].wt : '');


    // 3. Render Logs
    let logHtml = '';
    if (exLogs.length === 0) {
        logHtml = '<div style="color:gray; text-align:center; padding:20px;">No sets completed today</div>';
    } else {
        logHtml = '<div style="display:flex; flex-direction:column; gap:8px;">';
        exLogs.forEach((l, idx) => {
            logHtml += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:8px;">
                    <div style="font-weight:600; color:gray;">Set ${idx + 1}</div>
                    <div style="font-weight:700;">${l.wt}lb x ${l.reps}</div>
                    <div style="color:var(--ios-blue); font-size:12px;">Done</div>
                </div>
            `;
        });
        logHtml += '</div>';
    }

    modal.innerHTML = `
        <div style="margin-bottom:20px;">
            ${historyHtml}

            <!-- Editable Targets -->
            <div style="display:flex; gap:10px; margin-bottom:20px; background:#f9f9f9; padding:10px; border-radius:12px;">
                <div style="flex:1;">
                    <label style="font-size:10px; color:gray;">TARGET SETS</label>
                    <input type="number" value="${targets.sets}" onchange="updatePlanTarget(${planIdx}, 'sets', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px;">
                </div>
                <div style="flex:1;">
                    <label style="font-size:10px; color:gray;">REPS</label>
                    <input type="text" value="${targets.reps}" onchange="updatePlanTarget(${planIdx}, 'reps', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px;">
                </div>
                <div style="flex:1;">
                    <label style="font-size:10px; color:gray;">REST (s)</label>
                    <input type="number" value="${targets.rest}" onchange="updatePlanTarget(${planIdx}, 'rest', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px;">
                </div>
            </div>
            
            <div id="timerArea" style="text-align:center; padding:20px 0;">
                <div id="timerDisplay" style="font-size:60px; font-weight:800; font-variant-numeric:tabular-nums; margin-bottom:20px;">00:00</div>
                <div id="timerControls">
                   <button onclick="startSet('${exName}', ${targets.rest})" style="width:100%; padding:20px; background:var(--ios-green); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">START SET</button>
                </div>
            </div>

            <div id="logArea" style="display:none; margin-top:20px; background:#fff3cd; padding:15px; border-radius:12px;">
                <div style="font-size:12px; font-weight:700; color:#856404; margin-bottom:10px; text-align:center;">RESTING... LOG YOUR SET</div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <div style="flex:1;">
                        <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">Weight (lb)</label>
                        <input type="number" id="logWt" placeholder="0" value="${lastWt}" style="width:100%; padding:15px; border:2px solid var(--ios-blue); border-radius:12px; font-size:24px; text-align:center; font-weight:700;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">Reps</label>
                        <input type="number" id="logReps" placeholder="0" style="width:100%; padding:15px; border:2px solid var(--ios-blue); border-radius:12px; font-size:24px; text-align:center; font-weight:700;">
                    </div>
                </div>
                <button onclick="saveLog('${exName}', ${planIdx})" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">Save Log (Keep Resting)</button>
            </div>
        </div>

        <h3 style="margin-bottom:10px; font-size:16px;">Today's Session</h3>
        ${logHtml}
        
        <div style="margin-top:20px; text-align:center;">
            <button onclick="closeModal();" style="background:none; border:none; color:gray; text-decoration:underline;">Close</button>
        </div>
    `;

    // Restore Timer State
    if (state.timer.mode && state.timer.exercise === exName) {
        updateTimerUI(state.timer.mode);
    }
};

window.updatePlanTarget = (idx, field, val) => {
    const planKey = `plan_${state.date}`;
    const plan = Store.get(planKey, []);
    const item = plan[idx];

    // Convert string to object if needed
    if (typeof item === 'string') {
        const db = EXERCISE_DB[item] || { sets: 3, reps: "8-12", rest: 90 };
        plan[idx] = { name: item, sets: db.sets, reps: db.reps || db.target, rest: db.rest };
        plan[idx][field] = val;
    } else {
        item[field] = val;
    }
    Store.set(planKey, plan);
    // No render needed, input is live
};

window.startSet = (exName, restTime) => {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.mode = 'work';
    state.timer.seconds = 0;
    state.timer.exercise = exName;
    // Pass restTime to timer for next phase
    state.timer.targetRest = restTime || 90;

    updateTimerUI('work');
    state.timer.intervalId = setInterval(() => {
        state.timer.seconds++;
        const display = document.getElementById('timerDisplay');
        if (display) display.innerText = formatTime(state.timer.seconds);
    }, 1000);
};

window.finishSet = () => {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.mode = 'rest';
    state.timer.seconds = state.timer.targetRest || 90;

    updateTimerUI('rest');
    state.timer.intervalId = setInterval(() => {
        state.timer.seconds--;
        const display = document.getElementById('timerDisplay');
        if (display) display.innerText = formatTime(state.timer.seconds);
        if (state.timer.seconds <= 0) {
            clearInterval(state.timer.intervalId);
            playTimerSound();
            if (display) display.innerText = "READY";
        }
    }, 1000);
};

window.saveLog = (exName, planIdx) => {
    const wt = document.getElementById('logWt').value;
    const reps = document.getElementById('logReps').value;
    if (!wt || !reps) return;

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {});
    if (!logs[exName]) logs[exName] = [];
    logs[exName].push({ wt, reps, timestamp: Date.now() });
    Store.set(key, logs);

    // IMPORTANT: Join Rest if running
    // If timer is rest, do NOT stop it. Just refresh UI.

    // Refresh only the log section? Or re-render modal?
    // If we re-render modal, we loose focus.
    // Let's just append the log manually to DOM?

    // Simpler: Close modal? No, user might be resting.
    // Re-call openWorkoutDetail BUT keep timer state.
    openWorkoutDetail(planIdx);

    // Focus back on next set?
    // User requested: "Exercise name... Target/Rest... Timer... Session Log" order.
    // Done.
    render(); // Update bg
};

window.stopRest = () => {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.mode = null;
    updateTimerUI('idle');
};

function updateTimerUI(mode) {
    const area = document.getElementById('timerArea');
    const controls = document.getElementById('timerControls');
    const logArea = document.getElementById('logArea');

    if (!area) return; // Modal closed

    if (mode === 'work') {
        controls.innerHTML = `<button onclick="finishSet()" style="width:100%; padding:20px; background:var(--ios-red); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">FINISH SET</button>`;
        logArea.style.display = 'none';
        document.getElementById('timerDisplay').style.color = 'black';
        document.getElementById('timerDisplay').innerText = formatTime(state.timer.seconds);
    } else if (mode === 'rest') {
        // Show Stop Rest button
        controls.innerHTML = `
            <button onclick="startSet('${state.timer.exercise}', ${state.timer.targetRest})" style="width:100%; padding:15px; background:var(--ios-green); color:white; border:none; border-radius:12px; font-weight:700; margin-bottom:10px;">START NEXT SET</button>
            <button onclick="stopRest()" style="width:100%; padding:10px; background:none; color:gray; border:none;">Stop Timer</button>
        `;
        logArea.style.display = 'block';
        document.getElementById('timerDisplay').style.color = 'var(--ios-blue)';
        document.getElementById('timerDisplay').innerText = formatTime(state.timer.seconds);

        // Auto-focus logic check
        const wtInput = document.getElementById('logWt');
        if (wtInput && !wtInput.value) setTimeout(() => wtInput.focus(), 100);
    } else {
        // Idle
        controls.innerHTML = `<button onclick="startSet('${state.timer.exercise}', ${state.timer.targetRest})" style="width:100%; padding:20px; background:var(--ios-green); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">START SET</button>`;
        logArea.style.display = 'none';
        document.getElementById('timerDisplay').innerText = "00:00";
        document.getElementById('timerDisplay').style.color = 'black';
    }
}

// Helper: Get History (Full Logs relative to viewed date)
function getExerciseHistory(name, viewDateStr) {
    let viewDate = new Date(); // Default to now
    try {
        if (viewDateStr) {
            const p = viewDateStr.match(/(\d+)/g);
            if (p && p.length >= 3) viewDate = new Date(p[0], p[1] - 1, p[2]);
        }
    } catch (e) { }

    for (let i = 1; i <= 60; i++) { // Look back 60 days
        const d = new Date(viewDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('ko-KR');
        const key = `workout_${dateStr}`;
        const logs = Store.get(key, {});
        if (logs[name] && logs[name].length > 0) {
            return { date: dateStr, logs: logs[name] };
        }
    }
    return null;
}

window.changeDate = (offset) => {
    let current = new Date();
    try {
        const p = state.date.match(/(\d+)/g);
        if (p && p.length >= 3) current = new Date(p[0], p[1] - 1, p[2]);
    } catch (e) { }

    current.setDate(current.getDate() + offset);
    state.date = current.toLocaleDateString('ko-KR');
    render();
};

function playTimerSound() {
    try { TIMER_AUDIO.play(); } catch (e) { }
}

// --- Calendar Modal ---
window.openCalendarModal = () => {
    const modal = createModal('Select Date');
    const today = new Date();
    // Use currently selected date as view focus, or today
    let currentViewDate = new Date();
    try {
        if (state.date) {
            // Manual parse 2025. 1. 7.
            const p = state.date.match(/(\d+)/g);
            if (p && p.length >= 3) currentViewDate = new Date(p[0], p[1] - 1, p[2]);
        }
    } catch (e) { }

    const renderCalendar = (viewDate) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth(); // 0-11

        // Header (Month Nav)
        const headerHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <button id="calPrev" style="background:none; border:none; padding:10px;"><i data-lucide="chevron-left"></i></button>
                <div style="font-size:18px; font-weight:700;">${year}. ${month + 1}.</div>
                <button id="calNext" style="background:none; border:none; padding:10px;"><i data-lucide="chevron-right"></i></button>
            </div>
        `;

        // Grid
        let gridHtml = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; text-align:center; font-size:14px;">';
        // Days Row
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => gridHtml += `<div style="color:gray; padding-bottom:10px;">${d}</div>`);

        // Calc Blanks
        const firstDay = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) gridHtml += `<div></div>`;

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = dateObj.toLocaleDateString('ko-KR'); // "2025. 1. 7."

            // Check Data
            const hasData = Store.get(`workout_${dateStr}`) || Store.get(`plan_${dateStr}`);
            // Check Selected
            const isSelected = dateStr === state.date;
            // Check Today
            const isToday = dateObj.toDateString() === new Date().toDateString();

            let bg = isSelected ? 'var(--ios-blue)' : 'transparent';
            let color = isSelected ? 'white' : (isToday ? 'var(--ios-blue)' : 'black');
            let dot = hasData ? `<div style="width:4px; height:4px; background:${isSelected ? 'white' : 'var(--ios-blue)'}; border-radius:50%; margin:2px auto 0;"></div>` : '';

            gridHtml += `
                <div onclick="selectDate('${dateStr}')" style="cursor:pointer; padding:8px 0; border-radius:10px; background:${bg}; color:${color}; font-weight:${isToday || isSelected ? '700' : '400'};">
                    ${d}
                    ${dot}
                </div>
            `;
        }
        gridHtml += '</div>';

        modal.innerHTML = headerHtml + gridHtml;
        lucide.createIcons();

        // Bind Nav
        document.getElementById('calPrev').onclick = () => renderCalendar(new Date(year, month - 1, 1));
        document.getElementById('calNext').onclick = () => renderCalendar(new Date(year, month + 1, 1));
    };

    renderCalendar(currentViewDate);
};

window.selectDate = (dateStr) => {
    state.date = dateStr;
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    render();
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Only run if not already ran? 
    // Just run render
    if (!document.getElementById('main-content').innerHTML) {
        render();
    } else {
        render(); // Force re-render just in case
    }
});
