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

    // 2. Fixed Header (V16 Fixed + Layout Refactor)
    const header = document.createElement('div');
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.width = '100%';
    header.style.zIndex = '2000'; // Higher than modals just in case
    header.style.background = '#ffffff';
    header.style.borderBottom = '1px solid #eee';
    header.style.display = 'grid';
    header.style.gridTemplateColumns = '1fr auto 1fr'; // Grid for center alignment
    header.style.alignItems = 'center';
    header.style.padding = '15px 20px';
    header.style.paddingTop = 'calc(15px + env(safe-area-inset-top))'; // Safe area

    header.innerHTML = `
        <div style="font-size:20px; font-weight:800; color:black;">Workout Log</div>
        
        <div style="display:flex; align-items:center; gap:8px;">
            <button onclick="changeDate(-1)" style="background:none; border:none; padding:5px; color:var(--ios-blue); cursor:pointer;"><i data-lucide="chevron-left" style="width:20px;"></i></button>
            <button onclick="openCalendarModal()" style="background:#f2f4f7; border:none; padding:8px 12px; border-radius:18px; color:black; font-weight:700; font-size:15px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                ${state.date} 
            </button>
            <button onclick="changeDate(1)" style="background:none; border:none; padding:5px; color:var(--ios-blue); cursor:pointer;"><i data-lucide="chevron-right" style="width:20px;"></i></button>
        </div>

        <div style="text-align:right;">
             <button onclick="goToToday()" style="background:none; border:none; color:var(--ios-blue); font-weight:600; font-size:14px; cursor:pointer;">Today</button>
        </div>
    `;
    container.appendChild(header);

    // 2.1 Spacer for Fixed Header
    const spacer = document.createElement('div');
    spacer.style.height = '80px'; // Approx header height
    spacer.style.marginBottom = '20px';
    container.appendChild(spacer);


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

// --- View: Diet Tracker (V17 Overhaul) ---
function renderDietView(container) {
    const dietKey = `diet_${state.date}`; // Use global date logic (V16)
    // Structure: diet.meals = [{ id, time, type, foods: [{name, unit, amount, cal, pro, fat, carbo}] }]
    const saved = Store.get(dietKey, { meals: [], water: 0 });
    const meals = saved.meals || [];
    const water = saved.water || 0;

    // 1. Stats Calculation
    const settings = state.userSettings;
    let total = { cal: 0, pro: 0, fat: 0, carbo: 0 };

    meals.forEach(m => {
        m.foods.forEach(f => {
            total.cal += f.cal;
            total.pro += parseFloat(f.pro);
            total.fat += parseFloat(f.fat || 0);
            total.carbo += parseFloat(f.carbo || 0);
        });
    });

    // 2. Dashboard (Ring Charts)
    const stats = document.createElement('div');
    stats.style.padding = '15px';
    stats.style.marginBottom = '20px';

    // Helper for Ring Chart
    const createRing = (label, current, max, color, size = 60) => {
        const pct = Math.min(100, (current / max) * 100);
        const deg = (pct / 100) * 360;
        return `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="position:relative; width:${size}px; height:${size}px; border-radius:50%; background:conic-gradient(${color} ${deg}deg, #E5E5EA 0deg); display:flex; align-items:center; justify-content:center;">
                    <div style="width:${size - 10}px; height:${size - 10}px; background:var(--ios-bg); border-radius:50%; display:flex; align-items:center; justify-content:center;">
                        <span style="font-size:${size / 5}px; font-weight:700;">${Math.round(current)}</span>
                    </div>
                </div>
                <div style="font-size:11px; color:gray; margin-top:5px;">${label}</div>
            </div>
        `;
    };

    // Main Calorie Ring (Larger)
    const calPct = Math.min(100, (total.cal / settings.targetCal) * 100);
    const calDeg = (calPct / 100) * 360;
    const remaining = settings.targetCal - total.cal;

    stats.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin-bottom:20px;">
            <div style="position:relative; width:120px; height:120px; border-radius:50%; background:conic-gradient(var(--ios-blue) ${calDeg}deg, #E5E5EA 0deg); display:flex; align-items:center; justify-content:center; box-shadow:0 10px 20px rgba(0,0,0,0.05);">
                <div style="width:100px; height:100px; background:white; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:24px; font-weight:800;">${Math.round(total.cal)}</div>
                    <div style="font-size:10px; color:gray;">/ ${settings.targetCal}</div>
                    <div style="font-size:10px; color:var(--ios-blue); font-weight:600; margin-top:2px;">${remaining > 0 ? remaining + ' left' : 'Over'}</div>
                </div>
            </div>
        </div>

        <div style="display:flex; justify-content:space-around; background:white; padding:15px; border-radius:20px; box-shadow:0 2px 10px rgba(0,0,0,0.03);">
            ${createRing("Protein", total.pro, settings.targetPro, "var(--ios-blue)")}
            ${createRing("Carbs", total.carbo, 300, "var(--ios-orange)")} <!-- 300g approx default -->
            ${createRing("Fat", total.fat, 80, "#FFCC00")} <!-- 80g approx default -->
        </div>
    `;
    container.appendChild(stats);

    // 3. Water Tracker
    const waterCard = document.createElement('div');
    waterCard.className = 'card';
    waterCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
             <div style="font-weight:700; font-size:16px; display:flex; align-items:center; gap:5px;">
                <i data-lucide="droplet" style="color:#5AC8FA; width:18px;"></i> Water
             </div>
             <div style="font-weight:600; color:#5AC8FA;">${water}ml</div>
        </div>
        <div class="progress-bar-bg" style="margin-bottom:10px;">
            <div class="progress-fill" style="width:${Math.min(100, (water / settings.targetWater) * 100)}%; background:#5AC8FA;"></div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button onclick="logWater(-250)" style="width:32px; height:32px; border-radius:16px; border:1px solid #ddd; background:white;">-</button>
              <button onclick="logWater(250)" style="width:32px; height:32px; border-radius:16px; border:1px solid #ddd; background:white;">+</button>
        </div>
    `;
    container.appendChild(waterCard);

    // 4. Time-Sequence Meal List
    const listTitle = document.createElement('h3');
    listTitle.style.fontSize = '18px';
    listTitle.style.marginBottom = '10px';
    listTitle.innerHTML = 'Today\'s Meals';
    container.appendChild(listTitle);

    const mealList = document.createElement('div');
    if (meals.length === 0) {
        mealList.innerHTML = `<div style="text-align:center; padding:30px; color:gray; font-size:14px;">No meals logged yet</div>`;
    } else {
        // Sort by time
        meals.sort((a, b) => a.time.localeCompare(b.time));

        meals.forEach((m, idx) => {
            const mCal = m.foods.reduce((s, f) => s + f.cal, 0);
            const mPro = m.foods.reduce((s, f) => s + parseFloat(f.pro), 0);

            const card = document.createElement('div');
            card.className = 'card';
            card.style.cursor = 'pointer';
            card.onclick = () => openMealEditor(m.id); // Re-open editor for existing meal

            // Food Summary Text
            const summary = m.foods.map(f => f.name).join(', ');

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div style="font-size:13px; font-weight:700; color:var(--ios-blue); background:#eef; padding:3px 8px; border-radius:5px;">
                        ${m.time} · ${m.type}
                    </div>
                    <div style="font-size:14px; font-weight:600;">${Math.round(mCal)} kcal</div>
                </div>
                <div style="font-size:15px; font-weight:500; margin-bottom:4px;">${summary}</div>
                <div style="font-size:12px; color:gray;">Pro: ${mPro.toFixed(1)}g</div>
            `;
            mealList.appendChild(card);
        });
    }
    container.appendChild(mealList);

    // 5. Add Button
    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.style.position = 'fixed';
    addBtn.style.bottom = '90px';
    addBtn.style.right = '20px';
    addBtn.style.width = '56px';
    addBtn.style.height = '56px';
    addBtn.style.borderRadius = '28px';
    addBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    addBtn.innerHTML = '<i data-lucide="plus"></i>';
    addBtn.onclick = () => openMealEditor(); // New Meal
    container.appendChild(addBtn);

    // Bottom Spacer
    const spacer = document.createElement('div');
    spacer.style.height = '100px';
    container.appendChild(spacer);
}

// --- V17 Meal Editor Logic ---
window.openMealEditor = (mealId = null) => {
    // Determine Modal Title & Initial State
    const isEdit = !!mealId;
    let tempMeal = {
        id: mealId || Date.now(),
        time: new Date().toTimeString().slice(0, 5),
        type: 'Meal',
        foods: [] // [{name, unit, amount, cal, pro, ...}]
    };

    if (isEdit) {
        const key = `diet_${state.date}`;
        const saved = Store.get(key, { meals: [] });
        const found = saved.meals.find(m => m.id === mealId);
        if (found) tempMeal = JSON.parse(JSON.stringify(found)); // Deep copy
    }

    // Modal Content
    const modal = createModal(isEdit ? 'Edit Meal' : 'New Meal');
    modal.id = 'mealEditorModal';

    // Render Function inside Modal (to refresh list)
    const renderEditor = () => {
        const totalCal = tempMeal.foods.reduce((s, f) => s + f.cal, 0);

        let foodListHtml = '';
        if (tempMeal.foods.length === 0) {
            foodListHtml = '<div style="padding:20px; text-align:center; color:gray; background:#f9f9f9; border-radius:12px;">Tap "Add Food" to start</div>';
        } else {
            tempMeal.foods.forEach((f, idx) => {
                foodListHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #eee;">
                        <div onclick="editFoodItem(${idx})" style="flex:1; cursor:pointer;">
                            <div style="font-weight:600;">${f.name}</div>
                            <div style="font-size:12px; color:gray;">${f.amount}${f.unit} · ${Math.round(f.cal)}kcal</div>
                        </div>
                        <button onclick="removeFoodItem(${idx})" style="background:#ff3b30; color:white; border:none; width:24px; height:24px; border-radius:12px; font-size:12px; margin-left:10px;">&times;</button>
                    </div>
                `;
            });
        }

        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0; font-size:20px;">${isEdit ? 'Edit Meal' : 'New Meal'}</h2>
                <button onclick="closeModal()" style="background:#eee; border:none; width:30px; height:30px; border-radius:15px; color:gray;">&times;</button>
            </div>

            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <input type="time" id="mealTime" value="${tempMeal.time}" onchange="updateTempMeal('time', this.value)" style="flex:1; padding:12px; font-size:16px;">
                <select id="mealType" onchange="updateTempMeal('type', this.value)" style="flex:1; padding:12px; font-size:16px;">
                    <option value="Meal" ${tempMeal.type === 'Meal' ? 'selected' : ''}>Meal</option>
                    <option value="Snack" ${tempMeal.type === 'Snack' ? 'selected' : ''}>Snack</option>
                    <option value="Drink" ${tempMeal.type === 'Drink' ? 'selected' : ''}>Drink</option>
                </select>
            </div>

            <div style="background:white; border-radius:12px; box-shadow:0 1px 5px rgba(0,0,0,0.05); margin-bottom:20px;">
                ${foodListHtml}
                <button onclick="openFoodSelector()" style="width:100%; padding:15px; color:var(--ios-blue); font-weight:600; background:none; border:none;">+ Add Food</button>
            </div>

            <div style="text-align:right; font-size:16px; font-weight:700; margin-bottom:20px;">
                Total: ${Math.round(totalCal)} kcal
            </div>

            <div style="display:flex; gap:10px;">
                 ${isEdit ? `<button onclick="deleteMeal(${tempMeal.id})" style="flex:1; padding:15px; background:white; border:1px solid var(--ios-red); color:var(--ios-red); border-radius:12px; font-weight:700;">Delete</button>` : ''}
                 <button onclick="saveMeal()" style="flex:2; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:700;">Save</button>
            </div>
        `;
    };

    // --- Editor Logic Helpers ---
    window.updateTempMeal = (field, val) => { tempMeal[field] = val; };
    window.removeFoodItem = (idx) => { tempMeal.foods.splice(idx, 1); renderEditor(); };
    window.deleteMeal = (id) => {
        if (!confirm('Delete this meal?')) return;
        const key = `diet_${state.date}`;
        const saved = Store.get(key, { meals: [] });
        saved.meals = saved.meals.filter(m => m.id !== id);
        Store.set(key, saved);
        closeModal();
        render();
    };

    window.saveMeal = () => {
        if (tempMeal.foods.length === 0) return alert("Add at least one food.");
        const key = `diet_${state.date}`;
        const saved = Store.get(key, { meals: [], water: 0 });

        const existIdx = saved.meals.findIndex(m => m.id === tempMeal.id);
        if (existIdx >= 0) saved.meals[existIdx] = tempMeal;
        else saved.meals.push(tempMeal);

        Store.set(key, saved);
        closeModal();
        render();
    };

    // Sub-Editors (Food Selector & Detail)
    window.tempMealRef = tempMeal; // Global ref for sub-modals to access
    window.renderEditorRef = renderEditor; // Ref to re-render parent

    renderEditor();
};

window.openFoodSelector = () => {
    // Categories
    const cats = ["All", "한식", "양식/패스트푸드", "밥/빵/면", "단백질", "과일/야채", "음료/간식"];
    const modal = createModal('Add Food Item');

    // Render
    const renderList = (filter) => {
        let html = `
            <div style="display:flex; gap:5px; overflow-x:auto; padding-bottom:10px; margin-bottom:10px;">
                ${cats.map(c => `<button onclick="updateFoodList('${c}')" style="white-space:nowrap; padding:6px 12px; border-radius:15px; border:none; background:${filter === c ? 'var(--ios-blue)' : '#eee'}; color:${filter === c ? 'white' : 'black'};">${c}</button>`).join('')}
            </div>
            <input type="text" id="foodSearchInput" placeholder="Search..." style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd; margin-bottom:10px;">
            <div id="foodListResult" style="height:50vh; overflow-y:auto;">
        `;

        Object.keys(FOOD_DB).forEach(key => {
            const item = FOOD_DB[key];
            if (filter !== "All" && item.category !== filter) return; // Simple Filter

            html += `
                <div onclick="selectFoodItem('${key}')" style="padding:12px 0; border-bottom:1px solid #eee; cursor:pointer;">
                    <div style="font-weight:600;">${key}</div>
                    <div style="font-size:12px; color:gray;">${item.cal}kcal / ${item.default_g}${item.unit}</div>
                </div>
            `;
        });
        html += `</div>`;
        modal.innerHTML = html;

        // Search Logic
        document.getElementById('foodSearchInput').oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const list = document.getElementById('foodListResult');
            list.innerHTML = '';
            Object.keys(FOOD_DB).forEach(key => {
                if (key.toLowerCase().includes(term)) { // Expand search logic if needed
                    const item = FOOD_DB[key];
                    const div = document.createElement('div');
                    div.onclick = () => selectFoodItem(key);
                    div.style.padding = "12px 0";
                    div.style.borderBottom = "1px solid #eee";
                    div.innerHTML = `<div style="font-weight:600;">${key}</div><div style="font-size:12px; color:gray;">${item.cal}kcal</div>`;
                    list.appendChild(div);
                }
            });
        };
    };

    window.updateFoodList = (c) => renderList(c);
    renderList("All");
};

window.selectFoodItem = (key) => {
    // Open Detail/Unit Config
    const item = FOOD_DB[key];
    // Create new sub-modal on top? Or replace content?
    // Let's replace content of THIS modal for simplicity
    const modalBody = document.querySelector('#modal-overlay:last-child .modal-content div');
    // Actually createModal makes a new overlay. So we can just stack another modal.
    openFoodConfig(key, item);
};

window.openFoodConfig = (name, dbItem, existingIdx = null) => {
    // If existingIdx is not null, we are editing an added item
    const modal = createModal(name);

    let currentMode = dbItem.unit === 'g' ? 'gram' : 'unit'; // Default mode logic
    let currentVal = dbItem.default_g || 100;

    // If editing existing
    if (existingIdx !== null) {
        const exist = window.tempMealRef.foods[existingIdx];
        currentVal = exist.amount;
        // Logic to detect mode? 
        // If exist.unit matches dbItem.unit -> unit mode. If exist.unit == 'g' -> gram mode.
        if (exist.unit === 'g') currentMode = 'gram';
        else currentMode = 'unit';
    }

    const renderConfig = () => {
        // Calculate
        let ratio = 1;
        if (currentMode === 'gram') ratio = currentVal / dbItem.default_g; // DB Cal is based on default_g
        else ratio = currentVal; // If unit, assume DB cal is per 1 unit? 
        // Wait, DB: "Apple": {unit: "개", cal: 95, default_g: 180} -> Cal 95 is for 1 unit (180g).
        // If mode is gram: ratio = input_g / 180.
        // If mode is unit: ratio = input_count.

        // DB Standard: Cal is for 1 "Base Unit". 
        // If unit is 'g', base unit is default_g? Usually naming is "Chicken (100g)" -> cal 165. means 165 per 100g.

        let baseG = dbItem.default_g || 100;
        let finalCal = 0;

        if (currentMode === 'gram') {
            // Ratio relative to default_g
            // Example: Chicken (100g) -> 165cal. Input 200g. Ratio = 2.
            finalCal = (currentVal / baseG) * dbItem.cal;
        } else {
            // Ratio is just count
            finalCal = currentVal * dbItem.cal;
        }

        modal.innerHTML = `
            <h2 style="margin:0 0 20px 0;">${name}</h2>
            
            <div style="display:flex; background:#eee; padding:5px; border-radius:12px; margin-bottom:20px;">
                <button onclick="setMode('unit')" style="flex:1; padding:10px; border-radius:8px; border:none; background:${currentMode === 'unit' ? 'white' : 'none'}; font-weight:600;">${dbItem.unit} (Count)</button>
                <button onclick="setMode('gram')" style="flex:1; padding:10px; border-radius:8px; border:none; background:${currentMode === 'gram' ? 'white' : 'none'}; font-weight:600;">Gram (g)</button>
            </div>

            <div style="margin-bottom:20px;">
                <input type="number" id="confAmount" value="${currentVal}" style="width:100%; font-size:30px; font-weight:800; text-align:center; padding:10px; border:2px solid var(--ios-blue); border-radius:12px;">
                <div style="text-align:center; margin-top:10px; color:gray;">
                    ${Math.round(finalCal)} kcal
                </div>
            </div>

            <button onclick="confirmFood('${name}', ${finalCal})" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:700;">
                ${existingIdx !== null ? 'Update' : 'Add'}
            </button>
        `;

        // Bind input
        document.getElementById('confAmount').oninput = (e) => {
            currentVal = parseFloat(e.target.value) || 0;
            renderConfig(); // Re-render to update calc text? 
            // Re-rendering loses focus. 
            // Better: just update DOM. 
        };
        // Fix focus loss: Don't re-render whole body on input. Just update text.
        // But for this simple implementation, let's just update text manually in logic.

        document.getElementById('confAmount').focus();
    };

    window.setMode = (m) => { currentMode = m; renderConfig(); };

    window.confirmFood = (n, c) => {
        // Recalculate finalCal accurately before saving
        let baseG = dbItem.default_g || 100;
        let finalCal = 0, finalPro = 0, finalFat = 0, finalCarb = 0;
        let ratio = 1;

        if (currentMode === 'gram') ratio = currentVal / baseG;
        else ratio = currentVal;

        finalCal = Math.round(dbItem.cal * ratio);
        finalPro = (dbItem.pro * ratio).toFixed(1);
        finalFat = (dbItem.fat * ratio).toFixed(1);
        finalCarb = (dbItem.carbo * ratio).toFixed(1);

        const foodObj = {
            name: n,
            unit: currentMode === 'gram' ? 'g' : dbItem.unit,
            amount: currentVal,
            cal: finalCal,
            pro: finalPro,
            fat: finalFat,
            carbo: finalCarb
        };

        if (existingIdx !== null) tempMealRef.foods[existingIdx] = foodObj;
        else tempMealRef.foods.push(foodObj);

        renderEditorRef(); // Update parent
        // Close just this modal and the selector modal
        // We need to close top 2 modals.
        const overlays = document.querySelectorAll('.modal-overlay');
        if (existingIdx !== null) {
            overlays[overlays.length - 1].remove(); // Close config only
        } else {
            overlays[overlays.length - 1].remove(); // Close config
            overlays[overlays.length - 2].remove(); // Close selector
        }
    };

    renderConfig();
};

window.editFoodItem = (idx) => {
    const f = tempMealRef.foods[idx];
    const dbItem = FOOD_DB[f.name] || { unit: f.unit, default_g: 100, cal: f.cal, pro: f.pro }; // Fallback
    openFoodConfig(f.name, dbItem, idx);
};


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


window.goToToday = () => {
    state.date = new Date().toLocaleDateString('ko-KR');
    render();
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

// Helper: Format Time (MM:SS)
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

