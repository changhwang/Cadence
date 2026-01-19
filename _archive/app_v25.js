// App Logic (V9 - Clean Rebuild)

/* --- V24 Localization System --- */
const TRANSLATIONS = {
    ko: {
        nav: { diet: '식단', workout: '운동', body: '내 몸' },
        header: { diet_log: '식단 기록', workout_log: '운동 기록' },
        settings: {
            title: '설정 (Settings)',
            profile: '👤 프로필',
            gender: '성별',
            birth: '생년월일',
            age: '나이',
            height: '키 (cm)',
            weight: '몸무게 (kg)',
            activity: '활동량',
            act_desc: '* 활동량은 하루 총 에너지 소비량(TDEE) 계산에 사용됩니다.',
            act_sedentary: '활동 적음 (사무직/운동X)',
            act_light: '가벼운 활동 (주 1-3회)',
            act_mod: '보통 활동 (주 3-5회)',
            act_high: '많은 활동 (주 6-7회)',
            goals: '🎯 목표',
            goal_preset: '목표 설정',
            goal_custom: '직접 입력',
            goal_diet: '다이어트',
            goal_maint: '유지',
            goal_bulk: '벌크업',
            target_cal: '칼로리',
            target_pro: '단백질',
            target_carb: '탄수화물',
            target_fat: '지방',
            target_water: '수분',
            target_sodium: '나트륨',
            system: '⚙️ 시스템',
            lang: '언어 (Language)',
            save: '저장하기',
            saved: '설정이 저장되었습니다.',
            bmr: '기초대사량 (BMR)',
            tdee: '유지 칼로리 (TDEE)',
            data_backup: '데이터 백업',
            data_restore: '데이터 복원'
        }
    },
    en: {
        nav: { diet: 'Diet', workout: 'Workout', body: 'My Body' },
        header: { diet_log: 'Diet Log', workout_log: 'Workout Log' },
        settings: {
            title: 'Settings',
            profile: '👤 Profile',
            gender: 'Gender',
            birth: 'Birthday',
            age: 'Age',
            height: 'Height (cm)',
            weight: 'Weight (kg)',
            activity: 'Activity Level',
            act_desc: '* Activity level determines TDEE.',
            act_sedentary: 'Sedentary',
            act_light: 'Light Active (1-3x)',
            act_mod: 'Moderate Active (3-5x)',
            act_high: 'Very Active (6-7x)',
            goals: '🎯 Goals',
            goal_preset: 'Goal Preset',
            goal_custom: 'Custom',
            goal_diet: 'Fat Loss',
            goal_maint: 'Maintenance',
            goal_bulk: 'Bulk Up',
            target_cal: 'Target Calories',
            target_pro: 'Protein (g)',
            target_carb: 'Carbs (g)',
            target_fat: 'Fat (g)',
            target_water: 'Target Water (ml)',
            target_sodium: 'Target Sodium (mg)',
            system: '⚙️ System',
            lang: 'Language',
            save: 'Save Changes',
            saved: 'Settings saved.',
            bmr: 'BMR',
            tdee: 'TDEE',
            data_backup: 'Data Backup',
            data_restore: 'Data Restore'
        }
    }
};

window.t = (key) => {
    const lang = Store.get('app_lang', 'ko');
    const keys = key.split('.');
    let val = TRANSLATIONS[lang];
    if (!val && lang !== 'ko') val = TRANSLATIONS['ko'];
    for (const k of keys) {
        if (!val) break;
        val = val[k];
    }
    return val || key;
};

const state = {
    view: 'workout',
    date: new Date().toLocaleDateString('ko-KR'),
    dietDate: new Date().toLocaleDateString('ko-KR'),
    userSettings: Store.get('user_settings', { targetCal: 2500, targetPro: 160, targetWater: 2000, targetSodium: 2000 }),
    timer: { mode: null, seconds: 0, intervalId: null, exercise: null, targetRest: 90 }
};

// V22: Bulk Management (Moved to Top-Level for Safety)
window.openBulkManagement = () => {
    const modal = createModal('Manage List');
    const planKey = `plan_${state.date}`;
    // Support both string and object
    const plan = Store.get(planKey, []);

    let listHtml = '';
    if (!plan || plan.length === 0) {
        listHtml = '<div style="text-align:center; color:gray; padding:20px;">List is empty</div>';
    } else {
        plan.forEach((item, idx) => {
            if (!item) return; // Defensive check
            const name = typeof item === 'string' ? item : item.name;
            listHtml += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #eee;">
                    <span style="font-weight:600; font-size:15px;">${name}</span>
                    <button onclick="window.removePlanItem(${idx})" style="background:#ff3b30; color:white; border:none; padding:8px 14px; border-radius:8px; font-size:13px; font-weight:600;">Delete</button>
                </div>
            `;
        });
    }

    modal.innerHTML = `
        <div style="max-height:60vh; overflow-y:auto; margin-bottom:20px; padding:0 10px;">
            ${listHtml}
        </div>
        <button onclick="closeModal()" style="width:100%; padding:15px; background:#f2f4f7; color:black; border:none; border-radius:12px; font-weight:600;">Done</button>
    `;
};

window.removePlanItem = (idx) => {
    try {
        const planKey = `plan_${state.date}`;
        const plan = Store.get(planKey, []);

        console.log(`[DEBUG] Attempting delete at idx: ${idx}, Plan length: ${plan.length}`);

        if (idx < 0 || idx >= plan.length) {
            alert(`Error: Index ${idx} is out of bounds (Length: ${plan.length})`);
            return;
        }

        const deletedItem = plan[idx];
        plan.splice(idx, 1);
        Store.set(planKey, plan);

        console.log(`[DEBUG] Deleted:`, deletedItem);
        console.log(`[DEBUG] New Plan:`, plan);

        // Refresh Modal logic
        closeModal();
        setTimeout(() => {
            window.openBulkManagement();
            render();
        }, 100);
    } catch (e) {
        alert("Delete Error: " + e.message);
        console.error(e);
    }
};


// V22: Exercise Name Migration (Old English → New Korean)
const EXERCISE_MIGRATION_MAP = {
    "Chest Press": "벤치 프레스 (Barbell Bench Press)",
    "Incline DB Press": "인클라인 벤치 프레스 (Incline Bench Press)",
    "Push Up": "푸시업 (Push-up)",
    "Cable Fly": "케이블 플라이 (Cable Fly)",
    "Lat Pulldown": "랫 풀다운 (Lat Pulldown)",
    "Seated Row": "시티드 로우 (Seated Row)",
    "Pull Up": "풀업 (Pull-up)",
    "Back Extension": "백 익스텐션 (Back Extension)",
    "Shoulder Press": "오버헤드 프레스 (Overhead Press)",
    "Lateral Raise": "래터럴 레이즈 (Lateral Raise)",
    "Face Pull": "페이스 풀 (Face Pull)",
    "Triceps Pushdown": "트라이셉 푸시다운 (Tricep Pushdown)",
    "Dumbbell Curl": "덤벨 컬 (Dumbbell Curl)",
    "Hammer Curl": "해머 컬 (Hammer Curl)",
    "Leg Press": "레그 프레스 (Leg Press)",
    "Squat (Machine)": "바벨 스쿼트 (Barbell Squat)",
    "Leg Curl": "레그 컬 (Leg Curl)",
    "Leg Extension": "레그 익스텐션 (Leg Extension)",
    "RDL / Hip Hinge": "루마니안 데드리프트 (Romanian Deadlift)",
    "Calf Raise": "카프 레이즈 (Calf Raise)",
    "Plank": "플랭크 (Plank)",
    "Crunch": "크런치 (Crunch)"
};

// V22: Migrate old workout data on page load
(function migrateWorkoutData() {
    const allKeys = Object.keys(localStorage);
    const planKeys = allKeys.filter(k => k.startsWith('plan_'));
    const logKeys = allKeys.filter(k => k.startsWith('workout_'));

    [...planKeys, ...logKeys].forEach(key => {
        try {
            const data = Store.get(key);
            if (!data) return;

            let modified = false;

            if (Array.isArray(data)) {
                // Plan data: array of exercise names
                data.forEach((item, idx) => {
                    const exName = typeof item === 'string' ? item : item.name;
                    if (EXERCISE_MIGRATION_MAP[exName]) {
                        if (typeof item === 'string') {
                            data[idx] = EXERCISE_MIGRATION_MAP[exName];
                        } else {
                            item.name = EXERCISE_MIGRATION_MAP[exName];
                        }
                        modified = true;
                    }
                });
            } else if (typeof data === 'object') {
                // Log data: object with exercise names as keys
                const newData = {};
                Object.keys(data).forEach(exName => {
                    const newName = EXERCISE_MIGRATION_MAP[exName] || exName;
                    newData[newName] = data[exName];
                    if (newName !== exName) modified = true;
                });
                if (modified) {
                    Store.set(key, newData);
                    return; // Skip the array save below
                }
            }

            if (modified && Array.isArray(data)) {
                Store.set(key, data);
            }
        } catch (e) {
            console.error(`Migration error for ${key}:`, e);
        }
    });
    console.log("[V22] Workout data migration complete");
})();


// --- Core Render ---
function render() {
    // Localize Tab Labels (V24)
    const navLabels = {
        workout: t('nav.workout'),
        diet: t('nav.diet'),
        weight: t('nav.body')
    };

    document.querySelectorAll('.tab-item').forEach(el => {
        const key = el.dataset.tab;
        el.classList.toggle('active', key === state.view);

        // Update Label
        const span = el.querySelector('span');
        if (span && navLabels[key]) span.innerText = navLabels[key];
    });

    const main = document.getElementById('main-content');
    main.innerHTML = '';

    if (state.view === 'workout') renderWorkoutBuilder(main);
    else if (state.view === 'diet') renderDietView(main);
    else if (state.view === 'weight') renderMyBodyView(main);

    // @ts-ignore
    if (window.lucide) lucide.createIcons();
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
                        ${!isCardio && !exTarget ? `<div style="font-size:13px; color:gray;">${dbData.target || ''} ${dbData.sets ? '· ' + dbData.sets + ' sets' : ''}</div>` : ''}
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
    addBtn.onclick = () => window.openAddMenu();
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
        manageBtn.onclick = () => window.openBulkManagement();
        container.appendChild(manageBtn);
    }
}


// --- View: Diet Tracker (V18 Refined) ---
// Data Trace Helper
window.getGoalsForDate = (dateStr) => {
    const history = Store.get('goal_history', []);
    const parseDate = (d) => {
        // Handle 'YYYY. M. D.' format (ko-KR)
        if (d.includes('.')) {
            const parts = d.split('.').map(s => s.trim()).filter(s => s);
            if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
        }
        return new Date(d).getTime();
    };
    const targetTime = parseDate(dateStr);
    const defaults = { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, targetWater: 2000, targetSodium: 2000 };

    if (!history || history.length === 0) return Store.get('user_settings', defaults);

    // Sort descending (Newest first)
    history.sort((a, b) => parseDate(b.date) - parseDate(a.date));

    // Find first entry where entry.date <= targetDate
    const entry = history.find(h => parseDate(h.date) <= targetTime);

    return entry ? entry.goals : Store.get('user_settings', defaults);
};

function renderDietView(container) {
    const dietKey = `diet_${state.date}`;
    const saved = Store.get(dietKey, { meals: [], water: 0 });
    const meals = saved.meals || [];
    const water = saved.water || 0;

    // 1. Stats Calculation (V24: Historical Goals)
    const settings = window.getGoalsForDate(state.date);
    let total = { cal: 0, pro: 0, fat: 0, carbo: 0, sodium: 0 };
    meals.forEach(m => {
        m.foods.forEach(f => {
            total.cal += f.cal;
            total.pro += parseFloat(f.pro);
            total.fat += parseFloat(f.fat || 0);
            total.carbo += parseFloat(f.carbo || 0);

            // V23: Self-Healing Sodium
            let sod = parseFloat(f.sodium);
            if (isNaN(sod)) {
                // Try to infer from DB based on Calorie Ratio
                const dbItem = FOOD_DB[f.name];
                if (dbItem && dbItem.cal > 0) {
                    const ratio = f.cal / dbItem.cal;
                    sod = (dbItem.sodium || 0) * ratio;
                } else {
                    sod = 0;
                }
            }
            total.sodium += sod;
        });
    });

    // 2. Fixed Header (Shared Logic)
    const header = document.createElement('div');
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.width = '100%';
    header.style.zIndex = '2000';
    header.style.background = '#ffffff';
    header.style.borderBottom = '1px solid #eee';
    header.style.display = 'grid';
    header.style.gridTemplateColumns = '1fr auto 1fr';
    header.style.alignItems = 'center';
    header.style.padding = '15px 20px';
    header.style.paddingTop = 'calc(15px + env(safe-area-inset-top))';

    header.innerHTML = `
        <div style="font-size:20px; font-weight:800; color:black;">Diet Log</div>
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

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.height = '80px';
    spacer.style.marginBottom = '20px';
    container.appendChild(spacer);

    // 3. V21: Unified Dashboard with Dynamic Health Colors
    const dashboard = document.createElement('div');
    dashboard.className = 'card';
    dashboard.style.background = '#ffffff';
    dashboard.style.padding = '20px';

    // V21: Health Color Function
    const getHealthColor = (current, target, type) => {
        const pct = (current / target) * 100;
        const ranges = {
            calories: { healthy: [80, 120], warning: [50, 150] },
            water: { healthy: [80, 120], warning: [50, 150] },
            protein: { healthy: [80, 120], warning: [60, 140] },
            carbs: { healthy: [70, 130], warning: [50, 160] },
            fat: { healthy: [70, 130], warning: [50, 160] },
            sodium: { healthy: [0, 100], warning: [0, 150] } // V21: Lower is better for sodium
        };

        const range = ranges[type];
        if (pct >= range.healthy[0] && pct <= range.healthy[1]) return '#4ECDC4'; // Green/Turquoise
        if (pct >= range.warning[0] && pct <= range.warning[1]) return '#FFB347'; // Yellow/Amber
        return '#FF6B6B'; // Red
    };

    // V21: Unified Donut Creator (Horizontal Layout: Donut + Text Side-by-Side)
    const createNutrientDonut = (icon, label, current, target, unit, type) => {
        // V21: Special handling for sodium - show "unknown" if no data
        const isSodiumUnknown = (type === 'sodium' && current < 10); // Less than 10mg = likely no data

        const pct = isSodiumUnknown ? 0 : Math.round((current / target) * 100);
        const deg = Math.min(360, (pct / 100) * 360);
        const color = isSodiumUnknown ? '#999' : getHealthColor(current, target, type);
        const size = 70;

        // V24: Layout Fix - 3 Lines (Label / Current / Target)
        const displayText = isSodiumUnknown
            ? `<div style="font-size:11px; color:#999; font-weight:600; margin-bottom:1px; white-space:nowrap;">${label}</div>
               <div style="font-size:16px; font-weight:800; color:#999; line-height:1.2;">—</div>
               <div style="font-size:11px; color:#aaa; font-weight:500;">/ ${target} ${unit}</div>`
            : `<div style="font-size:11px; color:gray; font-weight:600; margin-bottom:1px; white-space:nowrap;">${label}</div>
               <div style="font-size:16px; font-weight:800; color:#333; line-height:1.2;">${Math.round(current)}</div>
               <div style="font-size:11px; color:gray; font-weight:500;">/ ${target} ${unit}</div>`;

        const iconDisplay = isSodiumUnknown
            ? `<i data-lucide="help-circle" style="width:18px; color:#999; margin-bottom:2px;"></i>
               <span style="font-size:11px; font-weight:700; color:#999;">?</span>`
            : `<i data-lucide="${icon}" style="width:18px; color:${color}; margin-bottom:2px;"></i>
               <span style="font-size:11px; font-weight:700; color:${color};">${pct}%</span>`;

        return `
            <div style="display:flex; align-items:center; gap:8px;">
                <div style="position:relative; width:${size}px; height:${size}px; border-radius:50%; background:conic-gradient(${color} ${deg}deg, #f2f2f7 0deg); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <div style="width:${size - 10}px; height:${size - 10}px; background:white; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                        ${iconDisplay}
                    </div>
                </div>
                <!-- Text Container Flex Alignment -->
                <div style="display:flex; flex-direction:column; justify-content:center; flex:1; min-width:0;">
                    ${displayText}
                </div>
            </div>
        `;
    };

    dashboard.innerHTML = `
        <!-- V21: Row 1 - Calories, Water, Sodium -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
            ${createNutrientDonut('flame', t('settings.target_cal'), total.cal, settings.targetCal, 'kcal', 'calories')}
            ${createNutrientDonut('droplet', t('settings.target_water'), water, settings.targetWater, 'ml', 'water')}
            ${createNutrientDonut('salt', t('settings.target_sodium'), total.sodium, settings.targetSodium || 2000, 'mg', 'sodium')}
        </div>

        <!-- V21: Row 2 - Macros -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; padding-top:15px; border-top:1px solid #f5f5f5;">
            ${createNutrientDonut('beef', t('settings.target_pro'), total.pro, settings.targetPro, 'g', 'protein')}
            ${createNutrientDonut('wheat', t('settings.target_carb'), total.carbo, settings.targetCarb || 300, 'g', 'carbs')}
            ${createNutrientDonut('droplets', t('settings.target_fat'), total.fat, settings.targetFat || 80, 'g', 'fat')}
        </div>
    `;
    container.appendChild(dashboard);

    // 4. Timeline (V21: renamed from "Today's Meals")
    const listTitle = document.createElement('h3');
    listTitle.style.fontSize = '18px';
    listTitle.style.marginBottom = '10px';
    listTitle.innerHTML = 'Timeline';
    container.appendChild(listTitle);

    const mealList = document.createElement('div');
    if (meals.length === 0) {
        mealList.innerHTML = `<div style="text-align:center; padding:30px; color:gray; font-size:14px;">No entries logged yet</div>`;
    } else {
        meals.sort((a, b) => a.time.localeCompare(b.time));
        meals.forEach((m, idx) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.cursor = 'pointer';
            card.style.marginBottom = '10px';

            // V21: Check if Water entry
            if (m.type === 'Water') {
                card.onclick = () => openWaterEditor(m.id);
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:8px;">
                             <div style="font-size:13px; font-weight:700; color:#555; background:#f0f0f0; padding:2px 6px; border-radius:4px;">${m.time}</div>
                             <span style="font-size:16px;">💧</span>
                             <div style="font-size:15px; font-weight:600;">Water</div>
                        </div>
                        <div style="font-size:14px; font-weight:600; color:#5AC8FA;">${m.amount} ml</div>
                    </div>
                `;
            } else {
                // Regular meal
                const mCal = m.foods.reduce((s, f) => s + f.cal, 0);
                card.onclick = () => openMealEditor(m.id);
                const summary = m.foods.map(f => f.name).join(', ');

                // V21: Emoji for meal type (matching Add Diet Log)
                const mealEmoji = m.type === 'Meal' ? '🍱' : (m.type === 'Snack' ? '🍪' : '☕');

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                             <div style="font-size:13px; font-weight:700; color:#555; background:#f0f0f0; padding:2px 6px; border-radius:4px;">${m.time}</div>
                             <span style="font-size:16px;">${mealEmoji}</span>
                             <div style="font-size:15px; font-weight:600;">${m.type}</div>
                        </div>
                        <div style="font-size:14px; font-weight:600;">${Math.round(mCal)} kcal</div>
                    </div>
                    <div style="font-size:13px; color:gray; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${summary}</div>
                `;
            }

            mealList.appendChild(card);
        });
    }
    container.appendChild(mealList);


    // 5. Large "Add Diet Log" Button
    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.style.marginTop = '20px';
    addBtn.style.marginBottom = '100px';
    addBtn.style.background = 'rgba(0,122,255,0.1)';
    addBtn.style.color = 'var(--ios-blue)';
    addBtn.innerHTML = '+ Add Diet Log';
    addBtn.onclick = () => openAddDietMenu();
    container.appendChild(addBtn);
}

// --- V18 Mechanics ---

// 1. Add Menu (Type Selection)
window.openAddDietMenu = () => {
    const modal = createModal('Add Log');
    modal.className = 'modal-overlay center open';
    modal.innerHTML = `
        <div style="background:white; padding:20px; border-radius:20px; width:80%; max-width:300px; text-align:center;">
            <h3 style="margin-top:0;">Select Type</h3>
            <div style="display:grid; gap:10px;">
                <button onclick="closeModal(); openMealEditor(null, 'Meal')" style="padding:15px; border:1px solid #eee; background:white; border-radius:12px; font-size:16px; font-weight:600;">🍱 Meal</button>
                <button onclick="closeModal(); openMealEditor(null, 'Snack')" style="padding:15px; border:1px solid #eee; background:white; border-radius:12px; font-size:16px; font-weight:600;">🍪 Snack</button>
                <button onclick="closeModal(); openWaterModal()" style="padding:15px; border:1px solid #eee; background:white; border-radius:12px; font-size:16px; font-weight:600;">💧 Water</button>
            </div>
            <button onclick="closeModal()" style="margin-top:15px; background:none; border:none; color:gray;">Cancel</button>
        </div>
    `;
}

// V21: Enhanced Water Modal (200/500ml + Custom Input + Timeline Integration)
window.openWaterModal = () => {
    const modal = createModal('Log Water');
    modal.className = 'modal-overlay center open';

    let customAmount = 250; // Default

    const renderWaterModal = () => {
        modal.innerHTML = `
            <div style="background:white; padding:25px; border-radius:24px; width:85%; max-width:340px; text-align:center;">
                <i data-lucide="droplet" style="width:40px; height:40px; color:#5AC8FA; margin-bottom:10px;"></i>
                <h2 style="margin:0 0 20px 0; font-size:22px;">Log Water</h2>
                
                <!-- Quick Add B uttons: 200/500ml -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                    <button type="button" onclick="logWaterAndClose(200)" style="padding:15px; background:#f2f4f7; border:none; border-radius:12px; font-weight:600; color:#5AC8FA;">+200ml</button>
                    <button type="button" onclick="logWaterAndClose(500)" style="padding:15px; background:#f2f4f7; border:none; border-radius:12px; font-weight:600; color:#5AC8FA;">+500ml</button>
                </div>
                
                <!-- Custom Input -->
                <div style="margin-bottom:15px;">
                    <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">Custom Amount</label>
                    <input type="number" id="customWaterInput" value="${customAmount}" style="width:100%; padding:12px; border:2px solid #5AC8FA; border-radius:12px; text-align:center; font-size:18px; font-weight:700;">
                </div>
                
                <button type="button" onclick="logCustomWater()" style="width:100%; padding:15px; background:#5AC8FA; color:white; border:none; border-radius:12px; font-weight:700; margin-bottom:10px;">Log Custom</button>
                <button type="button" onclick="closeModal()" style="background:none; border:none; color:gray;">Cancel</button>
            </div>
        `;
        lucide.createIcons();

        // Bind input change
        const input = document.getElementById('customWaterInput');
        if (input) {
            input.oninput = (e) => {
                customAmount = parseInt(e.target.value) || 0;
            };
        }
    };

    window.logWaterAndClose = (amount) => {
        logWaterToTimeline(amount);
        closeModal();
    };

    window.logCustomWater = () => {
        const input = document.getElementById('customWaterInput');
        const amount = parseInt(input?.value || customAmount);
        if (amount > 0) {
            logWaterToTimeline(amount);
            closeModal();
        }
    };

    renderWaterModal();
};

// V21: Log Water to Timeline (as a meal-like entry)
function logWaterToTimeline(amount) {
    const key = `diet_${state.date}`;
    const saved = Store.get(key, { meals: [], water: 0 });

    // Add water as a meal entry
    const waterEntry = {
        id: Date.now(),
        time: new Date().toTimeString().slice(0, 5),
        type: 'Water',
        amount: amount,
        foods: [] // Empty for water
    };

    saved.meals.push(waterEntry);

    // Also update water total
    saved.water = (saved.water || 0) + amount;

    Store.set(key, saved);
    render();
}

// 2. Updated Editor (Accepts initialType)
window.openMealEditor = (mealId = null, initialType = 'Meal') => {
    // Determine Modal Title & Initial State
    const isEdit = !!mealId;
    let tempMeal = {
        id: mealId || Date.now(),
        time: new Date().toTimeString().slice(0, 5),
        type: initialType,
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
                 ${isEdit ? `<button type="button" onclick="deleteMeal(${tempMeal.id})" style="flex:1; padding:15px; background:white; border:1px solid var(--ios-red); color:var(--ios-red); border-radius:12px; font-weight:700;">Delete</button>` : ''}
                 <button type="button" onclick="saveMeal()" style="flex:2; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:700;">Save</button>
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

    window.saveMeal = (event) => {
        // V20: Integrated defensive save logic (preventing form submission & handling corrupted data)
        if (event) {
            if (event.preventDefault) event.preventDefault();
            if (event.stopPropagation) event.stopPropagation();
        }

        console.log("[saveMeal] Triggered", tempMeal);

        if (!tempMeal || tempMeal.foods.length === 0) {
            return alert("Add at least one food.");
        }

        try {
            const key = `diet_${state.date}`;
            console.log("[saveMeal] saving to key:", key);

            // Get existing data with defensive fallback
            let saved = Store.get(key, { meals: [], water: 0 });

            // V20: Defensive checks for corrupted localStorage data
            if (!saved || typeof saved !== 'object') {
                saved = { meals: [], water: 0 };
            }
            if (!Array.isArray(saved.meals)) {
                saved.meals = [];
            }
            if (typeof saved.water !== 'number') {
                saved.water = 0;
            }

            const existIdx = saved.meals.findIndex(m => m && m.id === tempMeal.id);
            if (existIdx >= 0) {
                console.log("[saveMeal] Updating existing meal at idx:", existIdx);
                saved.meals[existIdx] = tempMeal;
            } else {
                console.log("[saveMeal] Pushing new meal");
                saved.meals.push(tempMeal);
            }

            Store.set(key, saved);
            console.log("[saveMeal] Store set complete. Closing modal...");

            closeModal();
            console.log("[saveMeal] Modal closed. Re-rendering...");
            render();
            console.log("[saveMeal] Render complete.");

            return false; // Prevent any form submission
        } catch (e) {
            console.error("[saveMeal] Error:", e);
            alert("Error saving meal: " + e.message);
            return false;
        }
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

            // V19 Logic: Display clean unit text
            const displayUnit = item.unit === 'g' ? `${item.cal}kcal / ${item.default_g}g` : `${item.cal}kcal / 1${item.unit} (${item.default_g}g)`;

            html += `
                <div onclick="selectFoodItem('${key}')" style="padding:12px 0; border-bottom:1px solid #eee; cursor:pointer;">
                    <div style="font-weight:600;">${key}</div>
                    <div style="font-size:12px; color:gray;">${displayUnit}</div>
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
    } else {
        // New item init logic (V18 Fix)
        if (dbItem.unit === 'g') {
            currentMode = 'gram';
            currentVal = dbItem.default_g || 100;
        } else {
            currentMode = 'unit';
            currentVal = 1;
        }
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
                <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">Amount</label>
                <input type="number" id="confAmount" value="${currentVal}" style="width:100%; font-size:30px; font-weight:800; text-align:center; padding:10px; border:2px solid var(--ios-blue); border-radius:12px;">
            </div>
            
            <!-- V21: Custom Calorie Input -->
            <div style="margin-bottom:20px;">
                <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">Calories (kcal)</label>
                <input type="number" id="customCalInput" value="${Math.round(finalCal)}" style="width:100%; font-size:20px; font-weight:700; text-align:center; padding:10px; border:1px solid #ddd; border-radius:12px;">
                <div style="font-size:11px; color:gray; margin-top:3px;">Default: ${Math.round(finalCal)} kcal</div>
            </div>

            <button type="button" onclick="confirmFood('${name}', ${finalCal})" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:700;">
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

    window.setMode = (m) => {
        currentMode = m;
        if (m === 'gram') currentVal = dbItem.default_g || 100;
        else currentVal = 1;
        renderConfig();
    };

    window.confirmFood = (n, c) => {
        // V21: Get custom calorie if modified
        const customCalInput = document.getElementById('customCalInput');
        const customCal = customCalInput ? parseInt(customCalInput.value) : null;

        // Recalculate finalCal accurately before saving
        let baseG = dbItem.default_g || 100;
        let finalCal = 0, finalPro = 0, finalFat = 0, finalCarb = 0;
        let ratio = 1;

        if (currentMode === 'gram') ratio = currentVal / baseG;
        else ratio = currentVal;

        // Use custom calorie if provided, otherwise use calculated
        if (customCal && customCal > 0) {
            finalCal = customCal;
            // Adjust macros proportionally based on calorie change
            const calRatio = customCal / (dbItem.cal * ratio);
            finalPro = (dbItem.pro * ratio * calRatio).toFixed(1);
            finalFat = (dbItem.fat * ratio * calRatio).toFixed(1);
            finalCarb = (dbItem.carbo * ratio * calRatio).toFixed(1);
        } else {
            finalCal = Math.round(dbItem.cal * ratio);
            finalPro = (dbItem.pro * ratio).toFixed(1);
            finalFat = (dbItem.fat * ratio).toFixed(1);
            finalCarb = (dbItem.carbo * ratio).toFixed(1);
        }

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
const categories = ['전체', '한식', '중식', '일식', '양식/패스트푸드', '단백질', '탄수화물', '과일/야채', '소스/드레싱', '음료/간식'];

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
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1
// Legacy Removed 1

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
        // V23: Save full macros including Sodium
        carbo: Math.round((item.carbo || 0) * ratio),
        fat: Math.round((item.fat || 0) * ratio),
        sodium: Math.round((item.sodium || 0) * ratio),
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
    // overlay.id = 'modal-overlay'; // FIX: Don't use duplicate IDs. Use class only.
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
    const overlays = document.querySelectorAll('.modal-overlay');
    if (overlays.length > 0) {
        overlays[overlays.length - 1].remove(); // Always remove the top-most modal
    }
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


// Ensure closeModal is globally defined
window.closeModal = () => {
    const overlays = document.querySelectorAll('.modal-overlay');
    if (overlays.length > 0) {
        overlays[overlays.length - 1].remove();
    }
};

// Global Error Handler for Mobile Debugging
window.onerror = function (msg, url, line) {
    // alert("Error: " + msg + "\nLine: " + line); // Optional: Enable if desperate
    console.error("Global Error:", msg, url, line);
};
// V21: Water Editor Modal (Edit/Delete)
window.openWaterEditor = (waterId) => {
    const key = `diet_${state.date}`;
    const saved = Store.get(key, { meals: [], water: 0 });
    const waterEntry = saved.meals.find(m => m.id === waterId);

    if (!waterEntry) return;

    let currentAmount = waterEntry.amount;

    const modal = createModal('Edit Water');
    modal.className = 'modal-overlay center open';

    const renderModal = () => {
        modal.innerHTML = `
            <div style="background:white; padding:25px; border-radius:24px; width:85%; max-width:340px; text-align:center;">
                <i data-lucide="droplet" style="width:40px; height:40px; color:#5AC8FA; margin-bottom:10px;"></i>
                <h2 style="margin:0 0 20px 0; font-size:22px;">Edit Water Log</h2>
                
                <div style="margin-bottom:20px;">
                    <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">Amount (ml)</label>
                    <input type="number" id="editWaterInput" value="${currentAmount}" style="width:100%; padding:15px; border:2px solid #5AC8FA; border-radius:12px; text-align:center; font-size:24px; font-weight:700;">
                </div>
                
                <button type="button" onclick="saveWaterEdit()" style="width:100%; padding:15px; background:#5AC8FA; color:white; border:none; border-radius:12px; font-weight:700; margin-bottom:10px;">Save</button>
                <button type="button" onclick="deleteWater()" style="width:100%; padding:15px; background:white; border:1px solid var(--ios-red); color:var(--ios-red); border-radius:12px; font-weight:700; margin-bottom:10px;">Delete</button>
                <button type="button" onclick="closeModal()" style="background:none; border:none; color:gray;">Cancel</button>
            </div>
        `;
        lucide.createIcons();
    };

    window.saveWaterEdit = () => {
        const input = document.getElementById('editWaterInput');
        const newAmount = parseInt(input?.value || currentAmount);

        if (newAmount > 0) {
            // Update water entry
            const saved = Store.get(key, { meals: [], water: 0 });
            const idx = saved.meals.findIndex(m => m.id === waterId);

            if (idx >= 0) {
                const oldAmount = saved.meals[idx].amount;
                saved.meals[idx].amount = newAmount;

                // Update total water
                saved.water = (saved.water || 0) - oldAmount + newAmount;

                Store.set(key, saved);
                closeModal();
                render();
            }
        }
    };

    window.deleteWater = () => {
        if (!confirm('Delete this water log?')) return;

        const saved = Store.get(key, { meals: [], water: 0 });
        const idx = saved.meals.findIndex(m => m.id === waterId);

        if (idx >= 0) {
            const amount = saved.meals[idx].amount;
            saved.meals.splice(idx, 1);
            saved.water = (saved.water || 0) - amount;

            Store.set(key, saved);
            closeModal();
            render();
        }
    };

    renderModal();
};

// --- Settings Implementation (V24 Localized & Advanced) ---
window.tempSettingsState = {
    profile: null,
    settings: null,
    lang: 'ko'
};

window.openSettings = () => {
    window.tempSettingsState.profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });

    const defaults = { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, targetWater: 2000, targetSodium: 2000, goalType: 'maint' };
    window.tempSettingsState.settings = Store.get('user_settings', defaults);

    // Ensure new fields exist
    if (!window.tempSettingsState.settings.targetWater) window.tempSettingsState.settings.targetWater = 2000;
    if (!window.tempSettingsState.settings.targetSodium) window.tempSettingsState.settings.targetSodium = 2000;

    window.tempSettingsState.lang = Store.get('app_lang', 'ko');

    const modalBody = createModal(t('settings.title'));
    modalBody.className = 'settings-body';
    renderSettingsUI(modalBody);
};

window.renderSettingsUI = (bodyContainer) => {
    const { profile, settings, lang } = window.tempSettingsState;

    const age = calculateAge(profile.birth);
    const bmr = calcBMR(profile.weight, profile.height, age, profile.gender);
    const tdee = Math.round(bmr * profile.activity);

    // Water Recommendation (Weight * 35ml)
    const recWater = Math.round(profile.weight * 35);

    const activeLabels = {
        '1.2': t('settings.act_sedentary'),
        '1.375': t('settings.act_light'),
        '1.55': t('settings.act_mod'),
        '1.725': t('settings.act_high')
    };

    const goalLabels = {
        'custom': t('settings.goal_custom'),
        'diet': t('settings.goal_diet'),
        'maint': t('settings.goal_maint'),
        'bulk': t('settings.goal_bulk')
    };

    bodyContainer.innerHTML = `
        <!-- 1. Profile Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">${t('settings.profile')}</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
            <div class="setting-row">
                <label style="white-space:nowrap; margin-right:10px;">${t('settings.gender')}</label>
                <select onchange="updateTempProfile('gender', this.value)" style="width:auto; min-width:80px; padding:6px; text-align:right;">
                    <option value="M" ${profile.gender === 'M' ? 'selected' : ''}>Male</option>
                    <option value="F" ${profile.gender === 'F' ? 'selected' : ''}>Female</option>
                </select>
            </div>
            <div class="setting-row">
                 <label>${t('settings.birth')}</label>
                 <input type="date" value="${profile.birth}" onchange="updateTempProfile('birth', this.value)" style="border:none; background:transparent; text-align:right; font-family:inherit; width:140px;">
            </div>
            <div class="setting-row" style="justify-content:flex-end; padding-top:0; border-bottom:1px solid #eee;">
                 <span style="font-size:12px; color:gray;">(${t('settings.age')}: ${age})</span>
            </div>
            <div class="setting-row">
                 <label>${t('settings.height')}</label>
                 <input type="number" value="${profile.height}" onchange="updateTempProfile('height', this.value)" style="width:70px;">
            </div>
            <div class="setting-row">
                 <label>${t('settings.weight')}</label>
                 <input type="number" value="${profile.weight}" onchange="updateTempProfile('weight', this.value)" style="width:70px;">
            </div>
             <div class="setting-row" style="border-bottom:none;">
                <label>${t('settings.activity')}</label>
                <select onchange="updateTempProfile('activity', this.value)" style="width:160px;">
                    <option value="1.2" ${profile.activity == 1.2 ? 'selected' : ''}>${activeLabels['1.2']}</option>
                    <option value="1.375" ${profile.activity == 1.375 ? 'selected' : ''}>${activeLabels['1.375']}</option>
                    <option value="1.55" ${profile.activity == 1.55 ? 'selected' : ''}>${activeLabels['1.55']}</option>
                    <option value="1.725" ${profile.activity == 1.725 ? 'selected' : ''}>${activeLabels['1.725']}</option>
                </select>
            </div>
            <div style="font-size:11px; color:#888; margin-top:5px; line-height:1.4;">
                ${t('settings.act_desc')}
            </div>
        </div>

        <div style="text-align:center; font-size:13px; color:#555; margin-bottom:25px; background:#fff; border:1px solid #eee; padding:10px; border-radius:8px;">
            <div>${t('settings.bmr')}: <b>${bmr}</b> kcal</div>
            <div style="font-size:14px; margin-top:4px; color:var(--ios-blue);">${t('settings.tdee')}: <b>${tdee}</b> kcal</div>
        </div>

        <!-- 2. Goal Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">${t('settings.goals')}</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
             <div class="setting-row" style="border-bottom:none;">
                <label style="white-space:nowrap; margin-right:10px;">${t('settings.goal_preset')}</label>
                <select onchange="applyTempGoalPreset(this.value, ${tdee}, ${recWater})" style="width:auto; min-width:140px; padding:6px; text-align:right;">
                    <option value="custom" ${settings.goalType === 'custom' ? 'selected' : ''}>${goalLabels['custom']}</option>
                    <option value="diet" ${settings.goalType === 'diet' ? 'selected' : ''}>${goalLabels['diet']} (-500)</option>
                    <option value="maint" ${settings.goalType === 'maint' ? 'selected' : ''}>${goalLabels['maint']}</option>
                    <option value="bulk" ${settings.goalType === 'bulk' ? 'selected' : ''}>${goalLabels['bulk']} (+300)</option>
                </select>
            </div>
            
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                <div>
                     <label style="font-size:11px; color:gray;">${t('settings.target_cal')}</label>
                     <input type="number" value="${settings.targetCal}" onchange="updateTempSetting('targetCal', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                <div>
                     <label style="font-size:11px; color:gray;">${t('settings.target_pro')}</label>
                     <input type="number" value="${settings.targetPro}" onchange="updateTempSetting('targetPro', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                 <div>
                     <label style="font-size:11px; color:gray;">${t('settings.target_carb')}</label>
                     <input type="number" value="${settings.targetCarb || 300}" onchange="updateTempSetting('targetCarb', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                 <div>
                     <label style="font-size:11px; color:gray;">${t('settings.target_fat')}</label>
                     <input type="number" value="${settings.targetFat || 80}" onchange="updateTempSetting('targetFat', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
             </div>
             
             <!-- Water & Sodium -->
             <div style="margin-top:15px; border-top:1px solid #eee; padding-top:15px;">
                <div class="setting-row">
                     <label>${t('settings.target_water')}</label>
                     <input type="number" value="${settings.targetWater}" onchange="updateTempSetting('targetWater', this.value)" style="width:80px;">
                </div>
                <div style="text-align:right; font-size:11px; color:gray; margin-top:-5px; margin-bottom:10px;">
                    Rec: ${recWater}ml
                </div>
                <div class="setting-row" style="border-bottom:none;">
                     <label>${t('settings.target_sodium')}</label>
                     <input type="number" value="${settings.targetSodium}" onchange="updateTempSetting('targetSodium', this.value)" style="width:80px;">
                </div>
             </div>
        </div>

        <!-- 3. System Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">${t('settings.system')}</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
             <div class="setting-row" style="border-bottom:none;">
                <label>${t('settings.lang')}</label>
                <select onchange="window.tempSettingsState.lang = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                    <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>
        </div>

         <button onclick="saveAllSettings()" style="width:100%; padding:16px; background:var(--ios-blue); color:white; border:none; border-radius:14px; font-weight:700; font-size:16px; margin-bottom:10px; box-shadow:0 4px 12px rgba(78,205,196,0.3);">${t('settings.save')}</button>
        
        <div style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
            <button onclick="exportData()" style="padding:10px 15px; background:#eee; color:#333; border:none; border-radius:8px; font-size:12px;">${t('settings.data_backup')}</button>
            <button onclick="triggerRestore()" style="padding:10px 15px; background:#eee; color:#333; border:none; border-radius:8px; font-size:12px;">${t('settings.data_restore')}</button>
            <input type="file" id="restoreFile" style="display:none;" onchange="importData(this)">
        </div>
    `;

    // CSS Check (Idempotent)
    if (!document.getElementById('settings-css')) {
        const style = document.createElement('style');
        style.id = 'settings-css';
        style.innerHTML = `
            .setting-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee; }
            .setting-row label { font-size:14px; font-weight:600; color:#333; }
            .setting-row input, .setting-row select { padding:6px; border:1px solid #ddd; border-radius:6px; text-align:right; font-size:14px; background:white; }
            .setting-row select:focus, .setting-row input:focus { outline:none; border-color:var(--ios-blue); }
        `;
        document.head.appendChild(style);
    }
};

window.updateTempProfile = (key, val) => {
    const profile = window.tempSettingsState.profile;
    if (key === 'birth' || key === 'gender') profile[key] = val;
    else profile[key] = parseFloat(val) || val;
    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.updateTempSetting = (key, val) => {
    const settings = window.tempSettingsState.settings;
    settings[key] = parseFloat(val);
    settings.goalType = 'custom';
    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.applyTempGoalPreset = (type, tdee, recWater) => {
    const settings = window.tempSettingsState.settings;
    settings.goalType = type;

    let cal = tdee;
    if (type === 'diet') cal = tdee - 500;
    if (type === 'bulk') cal = tdee + 300;
    settings.targetCal = cal;

    let p = 0.3, c = 0.4, f = 0.3;
    if (type === 'diet') { p = 0.4; c = 0.35; f = 0.25; }
    if (type === 'bulk') { p = 0.25; c = 0.5; f = 0.25; }

    settings.targetPro = Math.round((cal * p) / 4);
    settings.targetCarb = Math.round((cal * c) / 4);
    settings.targetFat = Math.round((cal * f) / 9);

    // Auto Water
    settings.targetWater = recWater || 2000;

    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.saveAllSettings = () => {
    const { profile, settings, lang } = window.tempSettingsState;

    Store.set('user_profile', profile);
    Store.set('user_settings', settings);
    Store.set('app_lang', lang);

    // --- Goal History Logic (Time-Series) ---
    // Save snapshot of goals for today
    const history = Store.get('goal_history', []);
    // Check if entry for today exists
    const today = state.date; // Use current view date or today's date? 
    // Usually settings apply to "now" and "future". 
    // If user changes settings, it should probably be effective from today (real time) onwards.
    // Changing past logs' goals suggests we should key by Date.now()? 
    // No, key by calendar date. Let's use new Date().toLocaleDateString('ko-KR')
    const realToday = new Date().toLocaleDateString('ko-KR');

    // Remove existing entry for exact same date to prevent dupes (update instead)
    const newHistory = history.filter(h => h.date !== realToday);
    newHistory.push({
        date: realToday,
        goals: { ...settings }
    });
    // Sort by date string (YYYY. MM. DD. format works with string sort? ko-KR format is 'YYYY. M. D.' which doesn't sort well lexically)
    // We should probably normalize date format in Store, but for now let's just push.
    // Actually, '2024. 5. 1.' sorts badly against '2024. 12. 1.' ('5' > '1'). 
    // We need ISO format for sorting. But our app uses ko-KR.
    // Let's assume we handle sorting later or just append.
    Store.set('goal_history', newHistory);

    alert(t('settings.saved'));

    const modalOverlay = document.querySelector('.settings-body')?.closest('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('open');
        setTimeout(() => modalOverlay.remove(), 300);
    }
    render();
};

window.calculateAge = (birthDate) => {
    if (!birthDate) return 30;
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 30;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) { age--; }
    return age;
};

window.calcBMR = (w, h, a, g) => {
    let base = (10 * w) + (6.25 * h) - (5 * a);
    return g === 'M' ? Math.round(base + 5) : Math.round(base - 161);
};

window.exportData = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_tracker_backup_${state.date}.json`;
    a.click();
};

window.triggerRestore = () => document.getElementById('restoreFile').click();

window.importData = (input) => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("Overwrite all data?")) {
                localStorage.clear();
                Object.keys(data).forEach(k => {
                    localStorage.setItem(k, data[k]);
                });
                alert("Restore Complete. Reloading...");
                location.reload();
            }
        } catch (err) { alert("Invalid Backup File"); }
    };
    reader.readAsText(file);
};

window.openLogBodyModal = () => {
    const modal = createModal('신체 기록');
    // Default to today in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    modal.innerHTML = `
        <div style="padding:10px;">
            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">날짜</label>
                <input type="date" id="bodyDate" value="${today}" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px; font-family:inherit;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">체중 (kg)</label>
                <input type="number" id="bodyWeight" placeholder="0.0" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px; font-size:16px;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                <div>
                     <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">골격근량 (kg)</label>
                     <input type="number" id="bodyMuscle" placeholder="선택" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px;">
                </div>
                 <div>
                     <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">체지방률 (%)</label>
                     <input type="number" id="bodyFat" placeholder="선택" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px;">
                </div>
            </div>
            <button onclick="saveBodyLog()" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:700;">저장하기</button>
        </div>
    `;
};

window.saveBodyLog = () => {
    const dateInput = document.getElementById('bodyDate').value;
    const weight = parseFloat(document.getElementById('bodyWeight').value);
    const muscle = parseFloat(document.getElementById('bodyMuscle').value);
    const fat = parseFloat(document.getElementById('bodyFat').value);

    if (!weight) { alert('체중을 입력해주세요.'); return; }

    const history = Store.get('body_history', []);
    const existingIdx = history.findIndex(h => h.date === dateInput);
    const entry = { date: dateInput, weight, muscle: isNaN(muscle) ? null : muscle, fat: isNaN(fat) ? null : fat };

    if (existingIdx >= 0) history[existingIdx] = entry;
    else history.push(entry);

    // Sort by date
    history.sort((a, b) => a.date.localeCompare(b.date));
    Store.set('body_history', history);

    // Sync Profile Weight (if this entry is the latest)
    const latest = history[history.length - 1];
    if (latest.date === dateInput || latest.date < dateInput) {
        // Caution: logic check. If I edit yesterday's weight, and today exists, latest is today. 
        // Profile should reflect "Current" state, which usually means "Latest Known".
        // The sorted last element is the latest known state.
        const profile = Store.get('user_profile', {});
        profile.weight = latest.weight;
        Store.set('user_profile', profile);
    }

    closeModal();
    render();
};

window.openProfileEdit = () => {
    const currentName = Store.get('user_name', 'User');
    const newName = prompt("Enter new name:", currentName);
    if (newName && newName.trim()) {
        Store.set('user_name', newName.trim());
        render();
    }
};

// --- View: My Body (Localized) ---
window.renderMyBodyView = (container) => {
    const profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    const userName = Store.get('user_name', 'User');
    const history = Store.get('body_history', []);

    // Get latest data or fallback to profile
    const latest = history.length > 0 ? history[history.length - 1] : { weight: profile.weight };

    // Calculate BMI based on latest weight
    const weight = latest.weight || profile.weight || 0;
    const heightM = (profile.height || 170) / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    const muscle = latest.muscle ? latest.muscle + ' kg' : '-';
    const fat = latest.fat ? latest.fat + ' %' : '-';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '15px 20px';
    header.style.paddingTop = 'calc(15px + env(safe-area-inset-top))';
    header.style.background = 'white';
    header.style.borderBottom = '1px solid #eee';
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '100';

    header.innerHTML = `
        <div style="font-size:20px; font-weight:800; display:flex; align-items:center; gap:8px;">
            ${t('nav.body')}
            <i data-lucide="chevron-right" style="width:16px; color:gray;"></i>
            <span style="font-size:14px; font-weight:600; color:var(--ios-blue); cursor:pointer;" onclick="openProfileEdit()">${userName}</span>
        </div>
        <div onclick="openSettings()" style="cursor:pointer; padding:5px;">
            <i data-lucide="settings" style="width:24px; color:#333;"></i>
        </div>
    `;
    container.appendChild(header);

    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.paddingBottom = '100px';

    const measureCard = document.createElement('div');
    measureCard.className = 'card';
    measureCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0; font-size:16px;">Measurements</h3>
            <button onclick="openLogBodyModal()" style="font-size:13px; color:var(--ios-blue); background:rgba(0,122,255,0.1); border:none; padding:6px 12px; border-radius:14px; font-weight:600;">+ Log Data</button>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
            <div style="background:#f9f9f9; padding:15px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:gray;">${t('settings.weight')}</div>
                <div style="font-size:20px; font-weight:700;">${weight} <span style="font-size:12px;">kg</span></div>
            </div>
             <div style="background:#f9f9f9; padding:15px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:gray;">BMI</div>
                <div style="font-size:20px; font-weight:700;">${bmi}</div>
            </div>
             <div style="background:#f9f9f9; padding:15px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:gray;">Muscle</div>
                <div style="font-size:20px; font-weight:700;">${muscle}</div>
            </div>
             <div style="background:#f9f9f9; padding:15px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:gray;">Body Fat</div>
                <div style="font-size:20px; font-weight:700;">${fat}</div>
            </div>
        </div>
        
        <div style="background:#fff; border-radius:12px; margin-top:10px;">
            <h4 style="margin:0 0 10px 0; font-size:13px; color:gray;">Weight Trend (Last 7 Logs)</h4>
            ${drawWeightChart(history)}
        </div>
    `;
    content.appendChild(measureCard);

    // Activity Placeholder
    const statsCard = document.createElement('div');
    statsCard.className = 'card';
    statsCard.style.marginTop = '20px';
    statsCard.innerHTML = `
       <h3 style="margin:0 0 15px 0; font-size:16px;">Activity Volume</h3>
       <div style="height:100px; background:#f0f0f5; border-radius:12px; display:flex; align-items:center; justify-content:center; color:gray; font-size:12px;">
            Chart Placeholder
       </div>
    `;
    content.appendChild(statsCard);
    container.appendChild(content);
};

// SVG Chart Helper
function drawWeightChart(history) {
    if (!history || history.length < 2) {
        return `<div style="height:120px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:12px; background:#f9f9f9; border-radius:12px;">
                    Not enough data
                </div>`;
    }

    const data = history.slice(-7); // Last 7 entries
    let minW = Math.min(...data.map(d => d.weight));
    let maxW = Math.max(...data.map(d => d.weight));

    // Add padding
    minW -= 1;
    maxW += 1;
    const range = maxW - minW || 1;

    const width = 100; // viewBox width
    const height = 50; // viewBox height (chart area)

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.weight - minW) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    // Labels
    const labels = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.weight - minW) / range) * height;
        const displayDate = d.date.slice(5).replace('-', '/'); // "05-12" -> "05/12" (if date is YYYY-MM-DD)
        return `
            <circle cx="${x}" cy="${y}" r="1.5" fill="var(--ios-blue)" />
            <text x="${x}" y="${y - 4}" font-size="3" text-anchor="middle" fill="#333" font-weight="bold">${d.weight}</text>
            <text x="${x}" y="${60}" font-size="3" text-anchor="middle" fill="#999">${displayDate}</text>
        `;
    }).join('');

    return `
        <svg viewBox="-5 -10 110 80" style="width:100%; height:180px; overflow:visible;">
            <polyline fill="none" stroke="var(--ios-blue)" stroke-width="1.5" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>
            ${labels}
        </svg>
    `;
}

// --- V24 Refined: My Body 1x4 Grid & Interactive Trend ---
window.activeBodyChart = window.activeBodyChart || 'weight';

window.switchBodyChart = (type) => {
    window.activeBodyChart = type;
    const main = document.getElementById('main-content');
    if (main) renderMyBodyView(main);
};

window.renderMyBodyView = (container) => {
    container.innerHTML = '';

    const profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    const userName = Store.get('user_name', 'User');
    const history = Store.get('body_history', []);
    const latest = history.length > 0 ? history[history.length - 1] : { weight: profile.weight };

    const weight = latest.weight || profile.weight || 0;
    const heightM = (profile.height || 170) / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    const muscle = latest.muscle ? latest.muscle : '-';
    const fat = latest.fat ? latest.fat : '-';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '15px 20px';
    header.style.paddingTop = 'calc(15px + env(safe-area-inset-top))';
    header.style.background = 'white';
    header.style.borderBottom = '1px solid #eee';
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '100';

    header.innerHTML = `
        <div style="font-size:20px; font-weight:800; display:flex; align-items:center; gap:8px;">
            ${t('nav.body')}
            <i data-lucide="chevron-right" style="width:16px; color:gray;"></i>
            <span style="font-size:14px; font-weight:600; color:var(--ios-blue); cursor:pointer;" onclick="openProfileEdit()">${userName}</span>
        </div>
        <div onclick="openSettings()" style="cursor:pointer; padding:5px;">
            <i data-lucide="settings" style="width:24px; color:#333;"></i>
        </div>
    `;
    container.appendChild(header);

    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.paddingBottom = '100px';

    const currentChart = window.activeBodyChart;
    // Helper titles
    const titles = { weight: 'Weight', bmi: 'BMI', muscle: 'Muscle', fat: 'Body Fat' };

    const measureCard = document.createElement('div');
    measureCard.className = 'card';
    measureCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0; font-size:16px;">Measurements</h3>
            <button onclick="openLogBodyModal()" style="font-size:13px; color:var(--ios-blue); background:rgba(0,122,255,0.1); border:none; padding:6px 12px; border-radius:14px; font-weight:600;">+ Log Data</button>
        </div>
        
        <!-- 1x4 Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px; margin-bottom:20px;">
            ${renderStatBox('weight', t('settings.weight'), weight, 'kg', currentChart)}
            ${renderStatBox('bmi', 'BMI', bmi, '', currentChart)}
            ${renderStatBox('muscle', 'Muscle', muscle, 'kg', currentChart)}
            ${renderStatBox('fat', 'Fat', fat, '%', currentChart)}
        </div>
        
        <div style="background:#fff; border-radius:12px; margin-top:10px;">
            <h4 style="margin:0 0 10px 0; font-size:13px; color:gray;">${titles[currentChart]} Trend (Last 7 Logs)</h4>
            ${drawTrendChart(history, currentChart, profile.height)}
        </div>
    `;
    content.appendChild(measureCard);

    // Activity Placeholder
    const statsCard = document.createElement('div');
    statsCard.className = 'card';
    statsCard.style.marginTop = '20px';
    statsCard.innerHTML = `
       <h3 style="margin:0 0 15px 0; font-size:16px;">Activity Volume</h3>
       <div style="height:100px; background:#f0f0f5; border-radius:12px; display:flex; align-items:center; justify-content:center; color:gray; font-size:12px;">
            Chart Placeholder
       </div>
    `;
    content.appendChild(statsCard);
    container.appendChild(content);

    if (window.lucide) window.lucide.createIcons();
};

function renderStatBox(type, label, value, unit, activeType) {
    const isActive = type === activeType;
    const bg = isActive ? 'var(--ios-blue)' : '#f9f9f9';
    const color = isActive ? 'white' : '#333';
    const subColor = isActive ? 'rgba(255,255,255,0.8)' : 'gray';

    return `
        <div onclick="switchBodyChart('${type}')" style="background:${bg}; padding:12px 2px; border-radius:12px; text-align:center; cursor:pointer; transition:all 0.2s;">
            <div style="font-size:11px; color:${subColor}; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${label}</div>
            <div style="font-size:15px; font-weight:700; color:${color};">${value} <span style="font-size:10px; font-weight:400;">${unit}</span></div>
        </div>
    `;
}

function drawTrendChart(history, type, heightCm) {
    if (!history || history.length < 2) {
        return `<div style="height:120px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:12px; background:#f9f9f9; border-radius:12px;">
                    Not enough data
                </div>`;
    }

    let data = history.map(h => {
        let val = 0;
        if (type === 'weight') val = parseFloat(h.weight);
        if (type === 'muscle') val = parseFloat(h.muscle);
        if (type === 'fat') val = parseFloat(h.fat);
        if (type === 'bmi') {
            const hM = (heightCm || 170) / 100;
            if (h.weight > 0) val = h.weight / (hM * hM);
        }
        return { date: h.date, val: isNaN(val) ? 0 : val };
    }).filter(d => d.val > 0).slice(-7);

    if (data.length < 2) {
        return `<div style="height:120px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:12px; background:#f9f9f9; border-radius:12px;">
                    Not enough ${type} data
                </div>`;
    }

    let minVal = Math.min(...data.map(d => d.val));
    let maxVal = Math.max(...data.map(d => d.val));

    const padding = (maxVal - minVal) * 0.1 || 0.1;
    minVal -= padding;
    maxVal += padding;
    const range = maxVal - minVal || 1;

    const width = 100;
    const height = 50;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.val - minVal) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const labels = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.val - minVal) / range) * height;
        const displayDate = d.date.slice(5).replace('-', '/');
        const displayVal = (type === 'bmi' || type === 'weight' || type === 'muscle' || type === 'fat') ? Math.round(d.val * 10) / 10 : Math.round(d.val);

        return `
            <circle cx="${x}" cy="${y}" r="1.5" fill="var(--ios-blue)" />
            <text x="${x}" y="${y - 4}" font-size="3" text-anchor="middle" fill="#333" font-weight="bold">${displayVal}</text>
            <text x="${x}" y="${60}" font-size="3" text-anchor="middle" fill="#999">${displayDate}</text>
        `;
    }).join('');

    return `
        <svg viewBox="-5 -10 110 80" style="width:100%; height:180px; overflow:visible;">
            <polyline fill="none" stroke="var(--ios-blue)" stroke-width="1.5" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>
            ${labels}
        </svg>
    `;
}

// --- V24 Patch 2: My Body Chart Toggles (Append) ---
window.activeBodyChart = window.activeBodyChart || 'weight';
window.activeBodyChartRange = window.activeBodyChartRange || '7D';

window.switchBodyChart = (type) => {
    window.activeBodyChart = type;
    const main = document.getElementById('main-content');
    if (main) renderMyBodyView(main);
};

window.setBodyChartRange = (range) => {
    window.activeBodyChartRange = range;
    const main = document.getElementById('main-content');
    if (main) renderMyBodyView(main);
};

window.renderMyBodyView = (container) => {
    container.innerHTML = '';

    const profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    const userName = Store.get('user_name', 'User');
    const history = Store.get('body_history', []);
    const latest = history.length > 0 ? history[history.length - 1] : { weight: profile.weight };

    const weight = latest.weight || profile.weight || 0;
    const heightM = (profile.height || 170) / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    const muscle = latest.muscle ? latest.muscle : '-';
    const fat = latest.fat ? latest.fat : '-';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '15px 20px';
    header.style.paddingTop = 'calc(15px + env(safe-area-inset-top))';
    header.style.background = 'white';
    header.style.borderBottom = '1px solid #eee';
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '100';

    header.innerHTML = `
        <div style="font-size:20px; font-weight:800; display:flex; align-items:center; gap:8px;">
            ${t('nav.body')}
            <i data-lucide="chevron-right" style="width:16px; color:gray;"></i>
            <span style="font-size:14px; font-weight:600; color:var(--ios-blue); cursor:pointer;" onclick="openProfileEdit()">${userName}</span>
        </div>
        <div onclick="openSettings()" style="cursor:pointer; padding:5px;">
            <i data-lucide="settings" style="width:24px; color:#333;"></i>
        </div>
    `;
    container.appendChild(header);

    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.paddingBottom = '100px';

    const currentChart = window.activeBodyChart;
    const currentRange = window.activeBodyChartRange;
    const titles = { weight: t('settings.weight'), bmi: 'BMI', muscle: 'Muscle', fat: 'Body Fat' };

    // Toggle Buttons State
    const renderToggle = (label) => {
        const isActive = currentRange === label;
        return `
            <button onclick="window.setBodyChartRange('${label}')" 
                style="padding:4px 10px; font-size:12px; font-weight:600; border-radius:12px; border:none; background:${isActive ? 'var(--ios-blue)' : '#eee'}; color:${isActive ? 'white' : '#777'}; margin-left:4px;">
                ${label}
            </button>
        `;
    };

    const measureCard = document.createElement('div');
    measureCard.className = 'card';
    measureCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0; font-size:16px;">Measurements</h3>
            <button onclick="openLogBodyModal()" style="font-size:13px; color:var(--ios-blue); background:rgba(0,122,255,0.1); border:none; padding:6px 12px; border-radius:14px; font-weight:600;">+ Log Data</button>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px; margin-bottom:20px;">
            ${renderStatBox('weight', t('settings.weight'), weight, 'kg', currentChart)}
            ${renderStatBox('bmi', 'BMI', bmi, '', currentChart)}
            ${renderStatBox('muscle', 'Muscle', muscle, 'kg', currentChart)}
            ${renderStatBox('fat', 'Fat', fat, '%', currentChart)}
        </div>
        
        <div style="background:#fff; border-radius:12px; margin-top:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 style="margin:0; font-size:13px; color:gray;">${titles[currentChart]} Trend</h4>
                <div style="display:flex;">
                    ${renderToggle('7D')}
                    ${renderToggle('30D')}
                    ${renderToggle('90D')}
                </div>
            </div>
            ${drawTrendChart(history, currentChart, profile.height, currentRange)}
        </div>
    `;
    content.appendChild(measureCard);

    // Activity Placeholder
    const statsCard = document.createElement('div');
    statsCard.className = 'card';
    statsCard.style.marginTop = '20px';
    statsCard.innerHTML = `
       <h3 style="margin:0 0 15px 0; font-size:16px;">Activity Volume</h3>
       <div style="height:100px; background:#f0f0f5; border-radius:12px; display:flex; align-items:center; justify-content:center; color:gray; font-size:12px;">
            Chart Placeholder
       </div>
    `;
    content.appendChild(statsCard);
    container.appendChild(content);

    if (window.lucide) window.lucide.createIcons();
};

function drawTrendChart(history, type, heightCm, range) {
    if (!history || history.length < 2) {
        return `<div style="height:120px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:12px; background:#f9f9f9; border-radius:12px;">
                    Not enough data
                </div>`;
    }

    // Determine slice count
    let limit = 7;
    if (range === '30D') limit = 30;
    if (range === '90D') limit = 90;

    let data = history.map(h => {
        let val = 0;
        if (type === 'weight') val = parseFloat(h.weight);
        if (type === 'muscle') val = parseFloat(h.muscle);
        if (type === 'fat') val = parseFloat(h.fat);
        if (type === 'bmi') {
            const hM = (heightCm || 170) / 100;
            if (h.weight > 0) val = h.weight / (hM * hM);
        }
        return { date: h.date, val: isNaN(val) ? 0 : val };
    }).filter(d => d.val > 0).slice(-limit);

    if (data.length < 2) {
        return `<div style="height:120px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:12px; background:#f9f9f9; border-radius:12px;">
                    Not enough ${type} data for ${range}
                </div>`;
    }

    let minVal = Math.min(...data.map(d => d.val));
    let maxVal = Math.max(...data.map(d => d.val));

    const padding = (maxVal - minVal) * 0.1 || 0.1;
    minVal -= padding;
    maxVal += padding;
    const rangeVal = maxVal - minVal || 1;

    const width = 100;
    const height = 50;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.val - minVal) / rangeVal) * height;
        return `${x},${y}`;
    }).join(' ');

    // Labels (Show 5 max for readability)
    const step = Math.ceil(data.length / 5);
    const labels = data.map((d, i) => {
        if (i % step !== 0 && i !== data.length - 1) return ''; // Skip some
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.val - minVal) / rangeVal) * height;
        const displayDate = d.date.slice(5).replace('-', '/');
        const displayVal = (type === 'bmi' || type === 'weight' || type === 'muscle' || type === 'fat') ? Math.round(d.val * 10) / 10 : Math.round(d.val);

        return `
            <circle cx="${x}" cy="${y}" r="1.5" fill="var(--ios-blue)" />
            <text x="${x}" y="${y - 4}" font-size="3" text-anchor="middle" fill="#333" font-weight="bold">${displayVal}</text>
            <text x="${x}" y="${60}" font-size="3" text-anchor="middle" fill="#999">${displayDate}</text>
        `;
    }).join('');

    return `
        <svg viewBox="-5 -10 110 80" style="width:100%; height:180px; overflow:visible;">
            <polyline fill="none" stroke="var(--ios-blue)" stroke-width="1.5" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>
            ${labels}
        </svg>
    `;
}

// --- V24 Fix: Food Menu UI (Append) ---
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2
// Legacy Removed 2

// --- V24 Fix 3: Food Selector & Chart Date Logic (Append) ---

// 1. Refactor openFoodSelector (Legacy Meal Builder Component) to use New Categories
window.openFoodSelector = () => {
    // State
    const state = {
        category: 'All', // Default to All
        term: ''
    };

    // Category Definitions (Same as openAddFoodMenu)
const categories = ['전체', '한식', '중식', '일식', '양식/패스트푸드', '단백질', '탄수화물', '과일/야채', '소스/드레싱', '음료/간식'];
    const filterRules = {
        'All': (k) => true,
        '한식': (k) => /밥|국|찌개|김치|비빔|전|탕|반찬|나물/.test(k),
        '일식/중식': (k) => /초밥|우동|라멘|돈까스|스시|짬뽕|자장|탕수육|마라|딤섬|소바/.test(k),
        '단백질': (k) => /닭|계란|소고기|돼지|두부|참치|연어|쉐이크|프로틴|스테이크/.test(k),
        '탄수화물': (k) => /밥|빵|면|떡|고구마|감자|오트|베이글|샌드위치/.test(k),
        '소스/양념': (k) => /소스|양념|장|케첩|마요|드레싱|오일|버터|시럽|소금|후추|잼/.test(k),
        '가공식품': (k) => /라면|과자|음료|커피|유제품|아이스크림|초콜릿/.test(k)
    };

    const modal = createModal('Add Food'); // Use "Add Food" to match V24 style

    // Create Body
    const body = document.createElement('div');
    modal.appendChild(body);

    const render = () => {
        // Tabs
        const tabsHtml = categories.map(cat => `
            <button onclick="window.updateSelectorCategory('${cat}')" 
                style="padding:6px 12px; margin-right:4px; margin-bottom:8px; border-radius:16px; border:none; font-size:13px; font-weight:600; cursor:pointer; 
                background:${state.category === cat ? '#333' : '#f0f0f5'}; color:${state.category === cat ? 'white' : '#555'}; transition:all 0.2s;">
                ${cat}
            </button>
        `).join('');

        // Filter
        const allKeys = Object.keys(FOOD_DB);
        let matched = allKeys.filter(key => {
            if (!filterRules[state.category](key)) return false;
            if (state.term && !key.toLowerCase().includes(state.term)) return false;
            return true;
        });

        const resultCount = matched.length;
        matched = matched.slice(0, 100);

        const listHtml = matched.map(key => {
            const item = FOOD_DB[key];
            const displayUnit = item.unit === 'g' ? `${item.cal}kcal / ${item.default_gram}g` : `${item.cal}kcal / 1${item.unit} (${item.default_gram}g)`;
            // NOTE: selectFoodItem is defined in app_v24.js (legacy)
            return `
                <div onclick="selectFoodItem('${key}')" style="padding:12px 0; border-bottom:1px solid #f5f5f5; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:500; font-size:15px; color:#333;">${key}</div>
                    <div style="font-size:12px; color:gray;">${displayUnit}</div>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <div style="padding:0 5px 10px 5px;">
                <input type="text" value="${state.term}" oninput="window.updateSelectorSearch(this.value)" placeholder="Search food..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:10px; font-family:inherit;">
                
                <div style="overflow-x:auto; white-space:nowrap; margin-bottom:10px; padding-bottom:5px;">
                    ${tabsHtml}
                </div>

                <div style="height:50vh; overflow-y:auto; border-top:1px solid #eee;">
                    ${matched.length === 0 ? '<div style="padding:30px; text-align:center; color:gray;">No results found</div>' : listHtml}
                    ${resultCount > 100 ? `<div style="padding:10px; text-align:center; color:gray; font-size:12px;">Top 100 of ${resultCount}</div>` : ''}
                </div>
            </div>
        `;

        if (!state.term) setTimeout(() => {
            const el = body.querySelector('input');
            if (el) el.focus();
        }, 50);
    };

    window._tempSelectorState = state;
    window._tempSelectorRender = render;

    window.updateSelectorCategory = (cat) => {
        window._tempSelectorState.category = cat;
        window._tempSelectorRender();
    };

    window.updateSelectorSearch = (val) => {
        window._tempSelectorState.term = val.toLowerCase();
        window._tempSelectorRender();
    };

    render();
};

// 2. Fix Chart Logic (Date Based Filtering)
window.drawTrendChart = (history, type, heightCm, range) => {
    // 1. Filter by Date Range
    const now = new Date();
    const cutoff = new Date();

    let days = 7; // Default
    if (range === '30D') days = 30;
    if (range === '90D') days = 90;

    cutoff.setDate(now.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0]; // YYYY-MM-DD

    // Filter history
    let data = history.filter(h => h.date >= cutoffStr).map(h => {
        let val = 0;
        if (type === 'weight') val = parseFloat(h.weight);
        if (type === 'muscle') val = parseFloat(h.muscle);
        if (type === 'fat') val = parseFloat(h.fat);
        if (type === 'bmi') {
            const hM = (heightCm || 170) / 100;
            if (h.weight > 0) val = h.weight / (hM * hM);
        }
        return { date: h.date, val: isNaN(val) ? 0 : val };
    }).filter(d => d.val > 0);

    if (data.length < 2) {
        return `<div style="height:120px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:12px; background:#f9f9f9; border-radius:12px;">
                    Not enough data in last ${range}
                </div>`;
    }

    // Sort by date (asc) just in case
    data.sort((a, b) => a.date.localeCompare(b.date));

    let minVal = Math.min(...data.map(d => d.val));
    let maxVal = Math.max(...data.map(d => d.val));

    const padding = (maxVal - minVal) * 0.1 || 0.1;
    minVal -= padding;
    maxVal += padding;
    const rangeVal = maxVal - minVal || 1;

    const width = 100;
    const height = 50;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.val - minVal) / rangeVal) * height;
        return `${x},${y}`;
    }).join(' ');

    // Labels (Smart Sampling)
    let labelStep = 1;
    if (data.length > 7) labelStep = Math.ceil(data.length / 6);

    const labels = data.map((d, i) => {
        if (i % labelStep !== 0 && i !== data.length - 1) return '';
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.val - minVal) / rangeVal) * height;
        const displayDate = d.date.slice(5).replace('-', '/');
        const displayVal = (type === 'bmi' || type === 'weight' || type === 'muscle' || type === 'fat') ? Math.round(d.val * 10) / 10 : Math.round(d.val);

        return `
            <circle cx="${x}" cy="${y}" r="1.5" fill="var(--ios-blue)" />
            <text x="${x}" y="${y - 4}" font-size="3" text-anchor="middle" fill="#333" font-weight="bold">${displayVal}</text>
            <text x="${x}" y="${60}" font-size="3" text-anchor="middle" fill="#999">${displayDate}</text>
        `;
    }).join('');

    return `
        <svg viewBox="-5 -10 110 80" style="width:100%; height:180px; overflow:visible;">
            <polyline fill="none" stroke="var(--ios-blue)" stroke-width="1.5" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>
            ${labels}
        </svg>
    `;
};

// --- V24 Fix 4: Food DB Extension & Selector Logic (Append) ---

// 1. Extend FOOD_DB with Western/Fastfood & Missing Items
// Ensure we don't overwrite if already exists, but for this patch we assign new items.
const NEW_ITEMS = {
    // === 양식/패스트푸드 ===
    "피자 (Pizza)": { unit: "조각", cal: 285, pro: 12, fat: 10, carbo: 36, sodium: 640, default_g: 100, category: "양식/패스트푸드" },
    "햄버거 (Hamburger)": { unit: "개", cal: 540, pro: 24, fat: 28, carbo: 46, sodium: 980, default_g: 220, category: "양식/패스트푸드" },
    "치즈버거 (Cheeseburger)": { unit: "개", cal: 620, pro: 28, fat: 34, carbo: 48, sodium: 1150, default_g: 240, category: "양식/패스트푸드" },
    "감자튀김 (Fries)": { unit: "팩", cal: 380, pro: 4, fat: 19, carbo: 48, sodium: 280, default_g: 120, category: "양식/패스트푸드" },
    "파스타 (Pasta - Tomato)": { unit: "접시", cal: 450, pro: 14, fat: 8, carbo: 78, sodium: 420, default_g: 350, category: "양식/패스트푸드" },
    "크림파스타 (Pasta - Cream)": { unit: "접시", cal: 680, pro: 18, fat: 32, carbo: 75, sodium: 580, default_g: 350, category: "양식/패스트푸드" },
    "스테이크 (Steak)": { unit: "인분", cal: 640, pro: 62, fat: 40, carbo: 0, sodium: 140, default_g: 250, category: "양식/패스트푸드" },
    "샐러드 (Caesar Salad)": { unit: "볼", cal: 320, pro: 12, fat: 24, carbo: 14, sodium: 480, default_g: 250, category: "양식/패스트푸드" },
    "핫도그 (Hotdog)": { unit: "개", cal: 290, pro: 10, fat: 16, carbo: 26, sodium: 680, default_g: 100, category: "양식/패스트푸드" },
    "치킨 (Fried Chicken)": { unit: "조각", cal: 280, pro: 18, fat: 16, carbo: 12, sodium: 520, default_g: 100, category: "양식/패스트푸드" },
    "베이컨 (Bacon)": { unit: "줄", cal: 45, pro: 3, fat: 3.5, carbo: 0, sodium: 180, default_g: 8, category: "양식/패스트푸드" },
    "오믈렛 (Omelet)": { unit: "개", cal: 320, pro: 22, fat: 24, carbo: 4, sodium: 420, default_g: 180, category: "양식/패스트푸드" },
    "샌드위치 (Sandwich)": { unit: "개", cal: 420, pro: 18, fat: 16, carbo: 48, sodium: 780, default_g: 200, category: "양식/패스트푸드" },
    "수프 (Soup)": { unit: "그릇", cal: 180, pro: 4, fat: 8, carbo: 22, sodium: 850, default_g: 250, category: "양식/패스트푸드" },
    "리조또 (Risotto)": { unit: "그릇", cal: 520, pro: 12, fat: 22, carbo: 68, sodium: 680, default_g: 350, category: "양식/패스트푸드" },

    // === 기타 수정 (카테고리 정리) ===
    "콜라 (Cola)": { ...FOOD_DB["콜라 (Cola)"], category: "음료/간식" },
    "사이다 (Sprite)": { ...FOOD_DB["사이다 (Sprite)"], category: "음료/간식" }
};

Object.assign(FOOD_DB, NEW_ITEMS);

// 2. Refined Food Selector (Uses EXPLICIT Categories & default_g)
window.openFoodSelector = () => {
    const state = {
        category: '전체',
        term: ''
    };

    // Tabs corresponding to `category` field in FOOD_DB
    // Mapped for UI display order
const categories = ['전체', '한식', '중식', '일식', '양식/패스트푸드', '단백질', '탄수화물', '과일/야채', '소스/드레싱', '음료/간식'];

    // Map UI Tab Name -> DB Category Value (or logic)
    // If DB value is exactly the same, straightforward.
    // '전체' is special.

const filterApi = (key, item) => {
        const cat = state.category;
        const term = state.term;

        // Search
        if (term && !key.toLowerCase().includes(term)) return false;

        // Category
        if (cat === '전체') return true;

        // Smart Carbs
        if (cat === '탄수화물') {
            if (item.category === '탄수화물') return true;
            if (/밥|빵|면|떡|고구마|감자|오트|곡물|시리얼/.test(key)) return true;
            return false;
        }

        // Logic for other multi-mapping (optional)
        if (cat === '단백질') {
            if (item.category === '단백질') return true;
            if (/닭|계란|소고기|돼지|두부|참치|연어|스테이크|프로틴/.test(key)) return true;
            return false;
        }

        if (cat === '일식/중식') return item.category === '일식' || item.category === '중식';

        // Fallback
        return item.category === cat;
    };

    const modal = createModal('Add Food');
    const body = document.createElement('div');
    modal.appendChild(body);

    const render = () => {
        const tabsHtml = categories.map(cat => `
            <button onclick="window.updateSelectorCategory('${cat}')" 
                style="padding:6px 12px; margin-right:4px; margin-bottom:8px; border-radius:16px; border:none; font-size:13px; font-weight:600; cursor:pointer; 
                background:${state.category === cat ? '#333' : '#f0f0f5'}; color:${state.category === cat ? 'white' : '#555'}; transition:all 0.2s;">
                ${cat}
            </button>
        `).join('');

        // Filter and Sort
        const allKeys = Object.keys(FOOD_DB);
        let matched = allKeys.filter(key => filterApi(key, FOOD_DB[key]));

        const resultCount = matched.length;
        matched = matched.slice(0, 100);

        const listHtml = matched.map(key => {
            const item = FOOD_DB[key];
            // FIX: Use default_g OR default_gram fallback
            const gram = item.default_g || item.default_gram || 100;
            const displayUnit = item.unit === 'g' ? `${item.cal}kcal / ${gram}g` : `${item.cal}kcal / 1${item.unit} (${gram}g)`;

            return `
                <div onclick="selectFoodItem('${key}')" style="padding:12px 0; border-bottom:1px solid #f5f5f5; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:500; font-size:15px; color:#333;">
                        ${key}
                        <div style="font-size:11px; color:#999; margin-top:2px;">${item.category || '기타'}</div>
                    </div>
                    <div style="font-size:12px; color:gray;">${displayUnit}</div>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <div style="padding:0 5px 10px 5px;">
                <input type="text" value="${state.term}" oninput="window.updateSelectorSearch(this.value)" placeholder="Search food..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:10px; font-family:inherit;">
                
                <div style="overflow-x:auto; white-space:nowrap; margin-bottom:10px; padding-bottom:5px;">
                    ${tabsHtml}
                </div>

                <div style="height:50vh; overflow-y:auto; border-top:1px solid #eee;">
                    ${matched.length === 0 ? '<div style="padding:30px; text-align:center; color:gray;">No results found</div>' : listHtml}
                    ${resultCount > 100 ? `<div style="padding:10px; text-align:center; color:gray; font-size:12px;">Top 100 of ${resultCount}</div>` : ''}
                </div>
            </div>
        `;

        if (!state.term) setTimeout(() => {
            const el = body.querySelector('input');
            if (el) el.focus();
        }, 50);
    };

    window._tempSelectorState = state;
    window._tempSelectorRender = render;

    window.updateSelectorCategory = (cat) => {
        window._tempSelectorState.category = cat;
        window._tempSelectorRender();
    };

    window.updateSelectorSearch = (val) => {
        window._tempSelectorState.term = val.toLowerCase();
        window._tempSelectorRender();
    };

    render();
};

// --- V24 Fix 5: Exercise Browser Search & Carbs Logic (Append) ---

// 1. Food DB Extension (Potatoes)
const CARB_ITEMS = {
    "고구마 (Sweet Potato)": { unit: "개", cal: 128, pro: 1.4, fat: 0.2, carbo: 30, sodium: 70, default_g: 100, category: "탄수화물" },
    "군고구마 (Roasted Sweet Potato)": { unit: "개", cal: 140, pro: 1.5, fat: 0.3, carbo: 33, sodium: 80, default_g: 100, category: "탄수화물" },
    "찐감자 (Steamed Potato)": { unit: "개", cal: 70, pro: 1.8, fat: 0.1, carbo: 15, sodium: 10, default_g: 100, category: "탄수화물" },
    "감자 (Potato)": { unit: "개", cal: 66, pro: 1.6, fat: 0.1, carbo: 14, sodium: 8, default_g: 100, category: "탄수화물" },
    "옥수수 (Corn)": { unit: "개", cal: 130, pro: 4, fat: 1.5, carbo: 28, sodium: 15, default_g: 140, category: "탄수화물" },
    "떡 (Rice Cake)": { unit: "개", cal: 50, pro: 1, fat: 0.2, carbo: 11, sodium: 5, default_g: 25, category: "탄수화물" },
    "식빵 (White Bread)": { unit: "쪽", cal: 100, pro: 3, fat: 1, carbo: 20, sodium: 150, default_g: 40, category: "탄수화물" },
    "베이글 (Bagel)": { unit: "개", cal: 250, pro: 10, fat: 1.5, carbo: 48, sodium: 400, default_g: 100, category: "탄수화물" },
    "오트밀 (Oatmeal)": { unit: "g", cal: 380, pro: 13, fat: 6, carbo: 66, sodium: 2, default_g: 100, category: "탄수화물" }
};
Object.assign(FOOD_DB, CARB_ITEMS);

// 2. Updated Food Selector (Smart Carbs Logic)
window.openFoodSelector = () => {
    const state = { category: '전체', term: '' };
const categories = ['전체', '한식', '중식', '일식', '양식/패스트푸드', '단백질', '탄수화물', '과일/야채', '소스/드레싱', '음료/간식'];

    const filterApi = (key, item) => {
        const cat = state.category;
        const term = state.term;

        // Search
        if (term && !key.toLowerCase().includes(term)) return false;

        // Category
        if (cat === '전체') return true;

        // Smart Carbs: Include explicit Carbs OR Rice/Bread/Noodles
        if (cat === '탄수화물') {
            if (item.category === '탄수화물') return true;
            if (/밥|빵|면|떡|고구마|감자|오트|곡물|시리얼/.test(key)) return true;
            return false;
        }

        // Logic for other multi-mapping (optional)
        if (cat === '단백질') {
            if (item.category === '단백질') return true;
            if (/닭|계란|소고기|돼지|두부|참치|연어|스테이크|프로틴/.test(key)) return true;
            return false;
        }

        if (cat === '일식/중식') return item.category === '일식' || item.category === '중식';

        // Fallback: Exact Category Match
        return item.category === cat;
    };

    const modal = createModal('Add Food');
    const body = document.createElement('div');
    modal.appendChild(body);

    const render = () => {
        const tabsHtml = categories.map(cat => `
            <button onclick="window.updateSelectorCategory('${cat}')" 
                style="padding:6px 12px; margin-right:4px; margin-bottom:8px; border-radius:16px; border:none; font-size:13px; font-weight:600; cursor:pointer; 
                background:${state.category === cat ? '#333' : '#f0f0f5'}; color:${state.category === cat ? 'white' : '#555'}; transition:all 0.2s;">
                ${cat}
            </button>
        `).join('');

        const allKeys = Object.keys(FOOD_DB);
        let matched = allKeys.filter(key => filterApi(key, FOOD_DB[key]));

        const resultCount = matched.length;
        matched = matched.slice(0, 100);

        const listHtml = matched.map(key => {
            const item = FOOD_DB[key];
            const gram = item.default_g || item.default_gram || 100;
            const displayUnit = item.unit === 'g' ? `${item.cal}kcal / ${gram}g` : `${item.cal}kcal / 1${item.unit} (${gram}g)`;
            const categoryDisplay = item.category || '기타';

            return `
                <div onclick="selectFoodItem('${key}')" style="padding:12px 0; border-bottom:1px solid #f5f5f5; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:500; font-size:15px; color:#333;">
                        ${key}
                        <div style="font-size:11px; color:#999; margin-top:2px;">${categoryDisplay}</div>
                    </div>
                    <div style="font-size:12px; color:gray;">${displayUnit}</div>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <div style="padding:0 5px 10px 5px;">
                <input type="text" value="${state.term}" oninput="window.updateSelectorSearch(this.value)" placeholder="Search food..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:10px; font-family:inherit;">
                <div style="overflow-x:auto; white-space:nowrap; margin-bottom:10px; padding-bottom:5px;">${tabsHtml}</div>
                <div style="height:50vh; overflow-y:auto; border-top:1px solid #eee;">
                    ${matched.length === 0 ? '<div style="padding:30px; text-align:center; color:gray;">No results found</div>' : listHtml}
                    ${resultCount > 100 ? `<div style="padding:10px; text-align:center; color:gray; font-size:12px;">Top 100 of ${resultCount}</div>` : ''}
                </div>
            </div>
        `;
        if (!state.term) setTimeout(() => { const el = body.querySelector('input'); if (el) el.focus(); }, 50);
    };

    window._tempSelectorState = state;
    window._tempSelectorRender = render;

    window.updateSelectorCategory = (cat) => { state.category = cat; render(); };
    window.updateSelectorSearch = (val) => { state.term = val.toLowerCase(); render(); };

    render();
};

// 3. New Exercise Browser (Single Modal + Search)
window.openExerciseModal = (initialFilter = null) => {
    // Initial State
    const state = {
        filter: initialFilter, // Category (Chest, Back, etc)
        term: ''
    };

const categories = ['전체', '한식', '중식', '일식', '양식/패스트푸드', '단백질', '탄수화물', '과일/야채', '소스/드레싱', '음료/간식'];

    const modal = createModal('Browse Exercises'); // Single Modal
    const body = document.createElement('div');
    modal.appendChild(body);

    const render = () => {
        // Tabs
        const tabsHtml = categories.map(cat => `
            <button onclick="window.updateExerciseFilter('${cat}')" 
                style="padding:5px 14px; margin-right:5px; border-radius:15px; border:none; margin-bottom:5px;
                background:${state.filter === cat ? 'var(--ios-blue)' : '#eee'}; 
                color:${state.filter === cat ? 'white' : 'black'}; white-space:nowrap; font-weight:600; font-size:13px;">
                ${cat}
            </button>
        `).join('');

        // Add 'All' button
        const allBtn = `
            <button onclick="window.updateExerciseFilter(null)" 
                style="padding:5px 14px; margin-right:5px; border-radius:15px; border:none; margin-bottom:5px;
                background:${!state.filter ? 'var(--ios-blue)' : '#eee'}; 
                color:${!state.filter ? 'white' : 'black'}; white-space:nowrap; font-weight:600; font-size:13px;">
                All
            </button>
        `;

        // Filtering
        const allKeys = Object.keys(EXERCISE_DB);
        const filteredKeys = allKeys.filter(key => {
            const ex = EXERCISE_DB[key];

            // 1. Text Search
            if (state.term) {
                const term = state.term;
                const matchName = key.toLowerCase().includes(term) || ex.name_en.toLowerCase().includes(term);
                const matchTags = ex.searchTerms && ex.searchTerms.some(t => t.toLowerCase().includes(term));
                if (!matchName && !matchTags) return false;
            }

            // 2. Category Filter
            if (state.filter) {
                if (ex.category !== state.filter) return false;
            }

            return true;
        });

        const listHtml = filteredKeys.map(key => {
            const ex = EXERCISE_DB[key];
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f5f5f5;">
                    <div>
                        <div style="font-weight:600; color:#333;">${key}</div>
                        <div style="font-size:12px; color:gray;">${ex.category} · ${ex.type}</div>
                    </div>
                    <button onclick="openAddConfigModal('${key}')" style="background:var(--ios-blue); color:white; border:none; padding:6px 14px; border-radius:14px; font-weight:600; font-size:12px;">ADD</button>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <div style="padding:0 5px 20px 5px;">
                <!-- Search Input -->
                <input type="text" value="${state.term}" oninput="window.updateExerciseSearch(this.value)" 
                    placeholder="Search exercise..." 
                    style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:15px; font-size:16px;">

                <!-- Category Tabs -->
                <div style="overflow-x:auto; white-space:nowrap; margin-bottom:10px; padding-bottom:5px;">
                    ${allBtn}
                    ${tabsHtml}
                </div>
                
                <!-- Results -->
                <div style="height:55vh; overflow-y:auto; border-top:1px solid #eee;">
                    ${filteredKeys.length === 0 ? '<div style="padding:40px; text-align:center; color:gray;">No exercises found</div>' : listHtml}
                </div>
            </div>
        `;

        if (!state.term) setTimeout(() => { const el = body.querySelector('input'); if (el) el.focus(); }, 50);
    };

    // Attach to Window
    window._exState = state;
    window._exRender = render;

    window.updateExerciseFilter = (cat) => {
        window._exState.filter = cat;
        window._exRender();
    };

    window.updateExerciseSearch = (val) => {
        window._exState.term = val.toLowerCase();
        window._exRender();
    };

    render();
};


// --- V25 Final Fixes ---

// 1. Goal Manager (Hardened)
window.getGoalsForDate = (dateStr) => {
    const defaults = { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, targetWater: 2000, targetSodium: 2000 };
    try {
        const history = Store.get('goal_history', []) || [];
        const parseDate = (d) => {
            if (!d) return 0;
            if (typeof d === 'string' && d.includes('.')) {
                const parts = d.split('.').map(s => s.trim()).filter(s => s);
                if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
            }
            return new Date(d).getTime();
        };
        const targetTime = parseDate(dateStr);
        const validHistory = history.filter(h => h && h.date && h.goals);
        validHistory.sort((a, b) => parseDate(b.date) - parseDate(a.date));
        const entry = validHistory.find(h => parseDate(h.date) <= targetTime);
        if (entry && entry.goals) return entry.goals;
        const current = Store.get('user_settings', defaults);
        return current || defaults;
    } catch (e) { console.error("Goals Error:", e); return defaults; }
};

// 2. Save Settings (Safe)
window.saveAllSettings = () => {
    if (!window.tempSettingsState || !window.tempSettingsState.settings) { alert("Error: State missing"); return; }
    const { profile, settings, lang } = window.tempSettingsState;
    Store.set('user_profile', profile);
    Store.set('user_settings', settings);
    Store.set('app_lang', lang);
    try {
        const history = Store.get('goal_history', []) || [];
        const d = new Date();
        const realToday = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
        const newHistory = history.filter(h => h.date !== realToday);
        newHistory.push({ date: realToday, goals: { ...settings } });
        Store.set('goal_history', newHistory);
    } catch (e) { console.error("Save Error:", e); }
    alert(lang === 'ko' ? 'ì„¤ì •ì´ ì €ìž¥ë˜ì—ˆìŠµë‹ˆë‹¤.' : 'Settings saved.');
    const modalOverlay = document.querySelector('.settings-body')?.closest('.modal-overlay');
    if (modalOverlay) { modalOverlay.classList.remove('open'); setTimeout(() => modalOverlay.remove(), 300); }
    render();
};

// 3. Improved Selector
window.openAddFoodMenu = window.openFoodSelector = () => {
    const state = { category: 'ì „ì²´', term: '' };
const categories = ['전체', '한식', '중식', '일식', '양식/패스트푸드', '단백질', '탄수화물', '과일/야채', '소스/드레싱', '음료/간식'];
    const filterApi = (key, item) => {
        const cat = state.category;
        const term = state.term;
        if (term && !key.toLowerCase().includes(term)) return false;
        if (cat === 'ì „ì²´') return true;
        if (item.category === cat) return true;
        if (!item.category) return false;
        if (cat === 'ì¼ì‹/ì¤‘ì‹') return item.category === 'ì¼ì‹' || item.category === 'ì¤‘ì‹';
        if (cat === 'íƒ„ìˆ˜í™”ë¬¼') {
             if (item.category === 'íƒ„ìˆ˜í™”ë¬¼') return true;
             if (/ë°¥|ë¹µ|ë©´|ë–¡|ê³ êµ¬ë§ˆ|ê°ìž|ì˜¤íŠ¸|ê³¡ë¬¼|ì‹œë¦¬ì–¼/.test(key)) return true;
             return false;
        }
        return false;
    };
    const modal = createModal('Add Food');
    const body = document.createElement('div');
    modal.appendChild(body);
    const render = () => {
        const tabsHtml = categories.map(cat => `<button onclick="window.updateSelectorCategory('${cat}')" style="padding:6px 12px; margin-right:4px; margin-bottom:8px; border-radius:16px; border:none; font-size:13px; font-weight:600; cursor:pointer; background:${state.category === cat ? '#333' : '#f0f0f5'}; color:${state.category === cat ? 'white' : '#555'}; transition:all 0.2s;">${cat}</button>`).join('');
        const allKeys = Object.keys(FOOD_DB);
        let matched = allKeys.filter(key => filterApi(key, FOOD_DB[key]));
        const resultCount = matched.length;
        matched = matched.slice(0, 50);
        const listHtml = matched.map(key => {
            const item = FOOD_DB[key];
            const gram = item.default_g || item.default_gram || 100;
            const displayUnit = item.unit === 'g' ? `${item.cal}kcal / ${gram}g` : `${item.cal}kcal / 1${item.unit} (${gram}g)`;
            return `<div onclick="selectFoodItem('${key}')" style="padding:12px 0; border-bottom:1px solid #f5f5f5; cursor:pointer; display:flex; justify-content:space-between; align-items:center;"><div style="font-weight:500; font-size:15px; color:#333;">${key}<div style="font-size:11px; color:#999; margin-top:2px;">${item.category || 'ê¸°íƒ€'}</div></div><div style="font-size:12px; color:gray;">${displayUnit}</div></div>`;
        }).join('');
        body.innerHTML = `<div style="padding:0 5px 10px 5px;"><input type="text" value="${state.term}" oninput="window.updateSelectorSearch(this.value)" placeholder="Search food..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:10px; font-family:inherit; font-size:16px;"><div style="overflow-x:auto; white-space:nowrap; margin-bottom:10px; padding-bottom:5px;">${tabsHtml}</div><div style="height:50vh; overflow-y:auto; border-top:1px solid #eee;">${matched.length === 0 ? '<div style="padding:30px; text-align:center; color:gray;">No results found</div>' : listHtml}${resultCount > 50 ? `<div style="padding:10px; text-align:center; color:gray; font-size:12px;">Top 50 of ${resultCount}</div>` : ''}</div></div>`;
        if(!state.term) setTimeout(() => { const input = body.querySelector('input'); if(input) input.focus(); }, 50);
    };
    window._tempSelectorState = state;
    window._tempSelectorRender = render;
    window.updateSelectorCategory = (cat) => { window._tempSelectorState.category = cat; window._tempSelectorRender(); };
    window.updateSelectorSearch = (val) => { window._tempSelectorState.term = val.toLowerCase(); window._tempSelectorRender(); };
    render();
};
window.selectFoodItem = (key) => window.openFoodDetail(key);


// --- V25 Fix 8: Smart Food Detail UI (V2 Re-implement) ---

window.openFoodDetail = (key) => {
    const item = FOOD_DB[key];
    const defaultG = item.default_g || item.default_gram || 100;
    const unitLabel = item.unit || 'g';
    const isCustomUnit = unitLabel !== 'g' && unitLabel !== 'ml';

    // State
    let mode = isCustomUnit ? 'u' : 'g'; // 'u' = unit, 'g' = grams
    let currentGrams = defaultG;

    // Helpers
    const getDisplayAmount = () => {
        if (mode === 'u') return +(currentGrams / defaultG).toFixed(2);
        return Math.round(currentGrams);
    };
    const getCalculatedCal = () => Math.round(item.cal * (currentGrams / defaultG));

    // Modal
    const modal = document.createElement('div');
    modal.id = 'food-smart-modal';
    modal.className = 'modal-overlay center open';
    modal.style.zIndex = '1200';

    modal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:24px; width:85%; max-width:340px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
            <h3 style="margin:0 0 5px 0; font-size:18px;">${key}</h3>
            <div style="font-size:13px; color:gray; margin-bottom:20px;">
                Reference: ${item.cal} kcal / ${isCustomUnit ? `1 ${unitLabel} (${defaultG}g)` : `100g`}
            </div>
            
            <!-- Toggle -->
            ${isCustomUnit ? `
            <div style="display:flex; justify-content:center; margin-bottom:15px; background:#f0f0f5; border-radius:10px; padding:2px; width:fit-content; margin-left:auto; margin-right:auto;">
                <button id="btn-mode-u" onclick="window._smartSetMode('u')" style="padding:6px 12px; border-radius:8px; border:none; font-size:13px; font-weight:600; cursor:pointer; background:white; color:black; shadow:0 2px 5px rgba(0,0,0,0.1); transition:all 0.2s;">${unitLabel}</button>
                <button id="btn-mode-g" onclick="window._smartSetMode('g')" style="padding:6px 12px; border-radius:8px; border:none; font-size:13px; font-weight:600; cursor:pointer; background:transparent; color:gray; transition:all 0.2s;">g (Gram)</button>
            </div>
            ` : ''}

            <!-- Amount Input -->
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                <button onclick="window._smartAdjust(-1)" style="width:40px; height:40px; border-radius:12px; border:1px solid #eee; background:white;">-</button>
                <div style="flex:1;">
                   <input id="smartAmount" type="number" step="any" value="${mode === 'u' ? 1 : 100}" 
                        style="width:100%; text-align:center; font-size:24px; font-weight:700; border:none; color:var(--ios-blue);" 
                        oninput="window._smartOnAmount(this.value)">
                   <div id="smartUnitLabel" style="font-size:12px; color:gray;">${mode === 'u' ? unitLabel : 'grams'}</div>
                </div>
                <button onclick="window._smartAdjust(1)" style="width:40px; height:40px; border-radius:12px; border:1px solid #eee; background:white;">+</button>
            </div>

            <!-- Calorie Input (Editable) -->
            <div style="background:#f9f9f9; padding:15px; border-radius:16px; margin-bottom:20px;">
                <div style="font-size:12px; color:gray; margin-bottom:5px;">Total Calories</div>
                <div style="display:flex; justify-content:center; align-items:baseline; gap:5px;">
                    <input id="smartCal" type="number" value="${item.cal}" 
                        style="width:80px; text-align:right; font-size:20px; font-weight:700; border:none; background:transparent; border-bottom:1px solid #ddd;"
                        oninput="window._smartOnCal(this.value)">
                    <span style="font-size:14px; font-weight:600; color:#333;">kcal</span>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button onclick="document.getElementById('food-smart-modal').remove()" style="padding:15px; background:#f0f0f5; color:gray; border:none; border-radius:12px; font-weight:600;">Cancel</button>
                <button onclick="window._smartConfirmAdd('${key}')" style="padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">Add</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Global Handlers (Closures)
    window._smartSetMode = (m) => {
        mode = m;
        // Update Buttons
        const btnU = document.getElementById('btn-mode-u');
        const btnG = document.getElementById('btn-mode-g');
        if (btnU && btnG) {
            btnU.style.background = mode === 'u' ? 'white' : 'transparent';
            btnU.style.color = mode === 'u' ? 'black' : 'gray';
            btnG.style.background = mode === 'g' ? 'white' : 'transparent';
            btnG.style.color = mode === 'g' ? 'black' : 'gray';
        }
        // Update Input Value
        document.getElementById('smartAmount').value = getDisplayAmount();
        document.getElementById('smartUnitLabel').innerText = mode === 'u' ? unitLabel : 'grams';
    };

    window._smartOnAmount = (valStr) => {
        const val = parseFloat(valStr) || 0;
        if (mode === 'u') currentGrams = val * defaultG;
        else currentGrams = val;
        document.getElementById('smartCal').value = getCalculatedCal();
    };

    window._smartOnCal = (valStr) => {
        const cal = parseFloat(valStr) || 0;
        if (item.cal > 0) {
            currentGrams = (cal / item.cal) * defaultG;
            document.getElementById('smartAmount').value = getDisplayAmount();
        }
    };

    window._smartAdjust = (dir) => {
        const step = mode === 'u' ? 0.5 : 10;
        let val = parseFloat(document.getElementById('smartAmount').value) || 0;
        val += (dir * step);
        if (val < 0) val = 0;
        // Round for UI
        val = +(val.toFixed(2));

        document.getElementById('smartAmount').value = val;
        // Trigger calc
        window._smartOnAmount(val);
    };

    window._smartConfirmAdd = () => {
        const ratio = currentGrams / defaultG;

        // Construct Entry
        const entry = {
            name: key,
            amount: mode === 'u' ? (currentGrams / defaultG) : currentGrams, // Store 'amount' as display amount? 
            // V24 Logic usually stored 'amount' as standard unit count if unit!='g' or just grams?
            // Actually, `app_v24.js` logic was `amount` input value.
            // If we store 1 for 1 pack, it's fine.
            // If we store 100 for 100g, it's fine.
            // The unit field decides display.

            unit: mode === 'u' ? unitLabel : 'g',

            cal: Math.round(item.cal * ratio),
            pro: parseFloat((item.pro * ratio).toFixed(1)),
            carbo: Math.round((item.carbo || 0) * ratio),
            fat: Math.round((item.fat || 0) * ratio),
            sodium: Math.round((item.sodium || 0) * ratio),
            id: Date.now() + Math.random()
        };

        // Fix for "Amount" field consistency:
        // If mode is 'g', amount is grams. Unit is 'g'.
        // If mode is 'u', amount is count (e.g. 1.5). Unit is 'pack'.
        // Logic below:
        entry.amount = mode === 'u' ? +(currentGrams / defaultG).toFixed(2) : Math.round(currentGrams);

        if (window.tempMealRef && window.tempMealRef.foods) {
            window.tempMealRef.foods.push(entry);
            if (window.renderEditorRef) window.renderEditorRef();
            document.getElementById('food-smart-modal').remove();

            // Keep Selector Open
        } else {
            alert("Session Error");
            document.getElementById('food-smart-modal').remove();
        }
    };

    // Auto-select input
    setTimeout(() => document.getElementById('smartAmount').select(), 50);
};

// Map old function calls if necessary
window.confirmAddFood = window._smartConfirmAdd;
