// App Logic (V9 - Clean Rebuild)

/* --- V24 Localization System --- */
const TRANSLATIONS = {
    ko: {
        nav: { diet: '식단', workout: '운동', body: '신체' },
        header: { diet_log: '식단 기록', workout_log: '운동 기록' },
        workout: {
            add_to_plan: '플랜에 추가',
            edit_delete_list: '편집/삭제',
            import_routine: '루틴 가져오기',
            sets: '세트',
            vol: '볼륨',
            cardio: '유산소',
            tap_to_start: '시작하려면 탭하세요',
            logged: '기록됨',
            today: '오늘',
            no_exercises: '오늘 계획된 운동이 없습니다',
            min_logged: '분 기록됨',
            tap_to_log: '기록하려면 탭하세요',
            target: '목표',
            rest: '휴식',
            browse_exercises: '운동 찾기',
            add_cardio: '유산소 추가',
            all: '전체',
            add: '추가',
            uncheck_items: '오늘 하지 않을 항목은 체크 해제하세요',
            import_selected: '선택 항목 가져오기',
            back: '뒤로',
            log_cardio: '유산소 기록',
            duration: '시간 (분)',
            intensity: '강도',
            normal: '보통 (자동)',
            low: '낮음 (가벼게)',
            high: '높음 (힘들게)',
            calories: '칼로리',
            optional: '선택사항',
            auto_calculated: '비워두면 자동 계산',
            save_log: '기록 저장',
            search_exercise: '운동 검색...',
            search_food: '음식 검색...',
            start_set: '세트 시작',
            finish_set: '세트 완료',
            log_this_set: '이번 세트 기록',
            set_num: '세트 {0}',
            start_next_set: '다음 세트 시작',
            save_rest: '저장 & 휴식 시작',
            skip_rest: '휴식 건너뛰기',
            work_mode: '운동 중',
            rest_mode: '휴식 중',
            future_date_warning: '미래 날짜에는 기록할 수 없습니다.',
            no_history: '이전 기록 없음',
            last_session: '마지막 세션',
            log_input_header: '세트 정보 입력',
            log_record: '세트 기록',
            edit_log: '기록 수정',
            delete_log: '기록 삭제',
            update: '수정',
            cancel: '취소'
        },
        diet: {
            meal: '식사',
            snack: '간식',
            protein: '단백질',
            fat: '지방',
            drink: '음료',
            water: '물',
            timeline: '타임라인',
            select_type: '종류 선택',
            add_log: '식단 기록 추가',
            log_water: '물 기록',
            log_water_title: '수분 섭취 기록',
            custom_amount: '직접 입력',
            log_button: '기록하기',
            meal_editor_title: '식사 기록',
            edit_meal_title: '식사 수정'
        },
        food: {
            search_placeholder: '음식 검색...',
            add_item: '음식 추가',
            weight_mode: '중량 (g)',
            weight_mode_oz: '중량 (oz)',
            unit_mode: '수량 (개)',
            amount: '양',
            calories: '칼로리',
            default: '기본값',
            add_item_title: '음식 항목 추가',
            config_title: '상세 설정'
        },
        body: {
            measurements: '신체 측정',
            log_data: '데이터 기록',
            weight: '체중',
            bmi: 'BMI',
            muscle: '골격근량',
            fat: '체지방률',
            waist: '허리둘레',
            current_weight: '현재 체중',
            goal_weight: '목표 체중',
            weight_history: '체중 히스토리',
            add_weight_title: '체중 기록 추가'
        },
        categories: {
            korean: '한식',
            western: '양식/패스트푸드',
            carbs: '밥/빵/면',
            protein: '단백질',
            fruit_veg: '과일/야채',
            snack_drink: '음료/간식',
            all: '전체'
        },
        buttons: {
            add_food: '+ 음식 추가',
            delete: '삭제',
            save: '저장',
            cancel: '취소',
            confirm: '확인',
            edit: '편집',
            close: '닫기'
        },
        muscles: {
            chest: '가슴',
            back: '등',
            shoulders: '어깨',
            legs: '다리',
            arms: '팔',
            core: '코어'
        },
        exercise_types: {
            compound: '복합 운동',
            isolation: '고립 운동',
            bodyweight: '맨몸 운동',
            static: '정적 운동'
        },
        settings: {
            title: '설정 (Settings)',
            profile: '👤 프로필',
            gender: '성별',
            birth: '생년월일',
            age: '나이',
            height: '키 (cm)',
            weight: '체중 (kg)',
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
            data_restore: '데이터 복원',
            unit_pref: '단위 설정',
            unit_height: '키 단위',
            unit_weight: '체중 단위',
            unit_water: '물 단위',
            unit_food: '식품 단위',
            unit_workout: '운동 중량 단위',
            gender_m: '남성',
            gender_f: '여성'
        }
    },
    en: {
        nav: { diet: 'Diet', workout: 'Workout', body: 'Body' },
        header: { diet_log: 'Diet Log', workout_log: 'Workout Log' },
        workout: {
            add_to_plan: 'Add to Plan',
            edit_delete_list: 'Edit/Delete List',
            import_routine: 'Import Routine',
            sets: 'sets',
            vol: 'vol',
            cardio: 'cardio',
            tap_to_start: 'Tap to start',
            logged: 'logged',
            today: 'Today',
            no_exercises: 'No exercises planned for today',
            min_logged: 'min logged',
            tap_to_log: 'Tap to log',
            target: 'Target',
            rest: 'rest',
            browse_exercises: 'Browse Exercises',
            add_cardio: 'Add Cardio',
            all: 'All',
            add: 'ADD',
            uncheck_items: 'Uncheck items you don\'t want to do today',
            import_selected: 'Import Selected',
            back: 'Back',
            log_cardio: 'Log Cardio',
            duration: 'Duration (min)',
            intensity: 'Intensity',
            normal: 'Normal (Auto)',
            low: 'Low (Light effort)',
            high: 'High (Hard effort)',
            calories: 'Calories',
            optional: 'Optional',
            auto_calculated: 'Auto-calculated if empty',
            save_log: 'Save Log',
            search_exercise: 'Search exercise...',
            search_food: 'Search food...',
            start_set: 'START SET',
            finish_set: 'FINISH SET',
            log_this_set: 'LOG THIS SET',
            set_num: 'Set {0}',
            start_next_set: 'START NEXT SET',
            save_rest: 'SAVE & REST',
            skip_rest: 'SKIP REST',
            work_mode: 'WORK MODE',
            rest_mode: 'REST MODE',
            future_date_warning: 'Cannot log workouts for future dates.',
            no_history: 'No recent history',
            last_session: 'Last Session'
        },
        diet: {
            meal: 'Meal',
            snack: 'Snack',
            protein: 'Protein',
            fat: 'Fat',
            drink: 'Drink',
            water: 'Water',
            timeline: 'Timeline',
            select_type: 'Select Type'
        },
        body: {
            measurements: 'Measurements',
            log_data: '+ Log Data',
            weight: 'Weight',
            muscle_mass: 'Muscle Mass',
            body_fat: 'Body Fat',
            waist: 'Waist'
        },
        buttons: {
            add_food: '+ Add Food',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            confirm: 'Confirm',
            edit: 'Edit',
            close: 'Close'
        },
        muscles: {
            chest: 'Chest',
            back: 'Back',
            shoulders: 'Shoulders',
            legs: 'Legs',
            arms: 'Arms',
            core: 'Core'
        },
        exercise_types: {
            compound: 'Compound',
            isolation: 'Isolation',
            bodyweight: 'Bodyweight',
            static: 'Static'
        },
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
            goal_diet: 'Diet (-500)',
            goal_maint: 'Maintenance',
            goal_bulk: 'Bulk (+300)',
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
            data_restore: 'Data Restore',
            unit_pref: 'Unit Preferences',
            unit_height: 'Height Unit',
            unit_weight: 'Body Weight Unit',
            unit_water: 'Water Unit',
            unit_food: 'Food Unit',
            unit_workout: 'Workout Weight Unit',
            gender_m: 'Male',
            gender_f: 'Female'
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

// V27.5: Dynamic Localized Name Resolver
window.getDisplayName = (key, type = 'exercise') => {
    const lang = Store.get('app_lang', 'ko');

    // 1. Check if Exercise
    if (EXERCISE_DB[key]) {
        if (lang === 'ko' && EXERCISE_DB[key].name_ko) return EXERCISE_DB[key].name_ko;
        if (lang === 'en' && EXERCISE_DB[key].name_en) return EXERCISE_DB[key].name_en;
    }

    // 2. Check if Food (Pattern: "Name (English)")
    // Logic: Assume keys are always "KR (EN)" format if bi-lingual.
    // If not matching pattern, return key.
    if (key.includes('(') && key.includes(')')) {
        const match = key.match(/^(.+)\s\((.+)\)$/);
        if (match) {
            // match[1] = KR, match[2] = EN
            return lang === 'ko' ? match[1] : match[2];
        }
    }

    // Fallback: Return original key
    return key;
};

// V27.1: Unit System Helper
const Unit = {
    // Defaults (Metric Storage)
    defaults: { height: 'cm', weight: 'kg', workout: 'kg', food: 'g', water: 'ml' },

    // Convert for Display
    // "75" (kg) -> "165" (lb) if type is lb
    displayVal: (val, type, unitSys) => { // unitSys: 'kg' or 'lb'
        if (val === undefined || val === null) return 0;
        const v = parseFloat(val);
        if (isNaN(v)) return 0;

        // Weight: kg -> lb
        if (type === 'weight' || type === 'workout') {
            return unitSys === 'lb' ? (v * 2.20462).toFixed(1) : v;
        }
        // Height: cm -> ft/in (String return)
        if (type === 'height') {
            if (unitSys === 'ft') {
                const totalIn = v / 2.54;
                const ft = Math.floor(totalIn / 12);
                const inch = Math.round(totalIn % 12);
                return `${ft}' ${inch}"`; // Return string for display
            }
            return v;
        }
        // Food: g -> oz
        if (type === 'food') return unitSys === 'oz' ? (v * 0.035274).toFixed(1) : v;
        // Water: ml -> fl oz
        if (type === 'water') return unitSys === 'oz' ? (v * 0.033814).toFixed(0) : v;

        return v;
    },

    // Parse Input for Storage
    // "165" (lb) -> "75" (kg)
    parseVal: (val, type, unitSys) => {
        // If string contains ft/in logic, parse it (Simple version for now: assumes decimal input from form if customized)
        // For ft/in, we typically input 5.9 or separate fields. 
        // For now, let's assume numeric input.
        const v = parseFloat(val);
        if (isNaN(v)) return 0;

        if (type === 'weight' || type === 'workout') {
            return unitSys === 'lb' ? v / 2.20462 : v;
        }
        if (type === 'food') return unitSys === 'oz' ? v / 0.035274 : v;
        if (type === 'water') return unitSys === 'oz' ? v / 0.033814 : v;

        return v;
    },

    // Get Unit Label
    getLabel: (type, unitSys) => {
        if (type === 'height') return unitSys === 'ft' ? '' : 'cm'; // ft string includes unit
        if (type === 'weight' || type === 'workout') return unitSys === 'lb' ? 'lb' : 'kg';
        if (type === 'food') return unitSys === 'oz' ? 'oz' : 'g';
        if (type === 'water') return unitSys === 'oz' ? 'fl oz' : 'ml';
        return '';
    }
};

// V27.5: Date Normalization Helper
// Always returns "YYYY. M. D." format to ensure consistency.
window.normalizeDate = (input) => {
    let d;
    if (typeof input === 'string' && input.includes('-')) {
        const p = input.split('-').map(Number);
        d = new Date(p[0], p[1] - 1, p[2]);
    } else if (input) {
        d = new Date(input);
    } else {
        d = new Date();
    }

    if (isNaN(d.getTime())) d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}. ${month}. ${day}.`;
};

const state = {
    view: 'workout',
    date: normalizeDate(),
    dietDate: normalizeDate(),
    userSettings: Store.get('user_settings', { targetCal: 2500, targetPro: 160, targetWater: 2000, targetSodium: 2000 }),
    timer: { mode: null, seconds: 0, intervalId: null, exercise: null, targetRest: 90 }
};

// V26.1: Bulk Management - Checkbox Based Selection
window.openBulkManagement = () => {
    const modal = createModal('Manage List');
    const planKey = `plan_${state.date}`;
    const plan = Store.get(planKey, []);

    let listHtml = '';
    if (!plan || plan.length === 0) {
        listHtml = '<div style="text-align:center; color:gray; padding:20px;">List is empty</div>';
    } else {
        plan.forEach((item, idx) => {
            if (!item) return;
            const name = typeof item === 'string' ? item : item.name;
            listHtml += `
                <div style="display:flex; align-items:center; padding:12px 0; border-bottom:1px solid #eee;">
                    <input type="checkbox" id="plan_check_${idx}" style="width:20px; height:20px; margin-right:12px; cursor:pointer;">
                    <label for="plan_check_${idx}" style="font-size:15px; font-weight:600; flex:1; cursor:pointer;">${name}</label>
                </div>
            `;
        });
    }

    modal.innerHTML = `
        <div style="max-height:60vh; overflow-y:auto; margin-bottom:20px; padding:0 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 style="margin:0; font-size:14px; color:gray;">Select items to remove:</h4>
                <button onclick="window.toggleSelectAll()" style="background:none; border:1px solid var(--ios-blue); color:var(--ios-blue); padding:4px 10px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">전체 선택</button>
            </div>
            ${listHtml}
        </div>
        <button onclick="window.deleteSelectedPlanItems()" style="width:100%; padding:15px; background:var(--ios-red); color:white; border:none; border-radius:12px; font-weight:600;" ${plan.length === 0 ? 'disabled' : ''}>Delete Selected</button>
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


// V26.1: Toggle Select/Deselect All Checkboxes
window.toggleSelectAll = () => {
    const planKey = `plan_${state.date}`;
    const plan = Store.get(planKey, []);

    if (!plan || plan.length === 0) return;

    // Check if all are selected
    let allChecked = true;
    for (let i = 0; i < plan.length; i++) {
        const checkbox = document.getElementById(`plan_check_${i}`);
        if (checkbox && !checkbox.checked) {
            allChecked = false;
            break;
        }
    }

    // Toggle: if all checked, uncheck all; otherwise check all
    for (let i = 0; i < plan.length; i++) {
        const checkbox = document.getElementById(`plan_check_${i}`);
        if (checkbox) {
            checkbox.checked = !allChecked;
        }
    }
};

// V26.1: Delete Selected Plan Items
window.deleteSelectedPlanItems = () => {
    const planKey = `plan_${state.date}`;
    const plan = Store.get(planKey, []);

    // Find checked indices
    const toDelete = [];
    plan.forEach((_, idx) => {
        const checkbox = document.getElementById(`plan_check_${idx}`);
        if (checkbox && checkbox.checked) {
            toDelete.push(idx);
        }
    });

    if (toDelete.length === 0) {
        alert('Please select items to delete');
        return;
    }

    if (!confirm(`Delete ${toDelete.length} item(s)?`)) {
        return;
    }

    // Delete in reverse order to maintain indices
    for (let i = toDelete.length - 1; i >= 0; i--) {
        plan.splice(toDelete[i], 1);
    }

    Store.set(planKey, plan);
    closeModal();
    render();
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
        <div></div>
        
        <div style="display:flex; align-items:center; gap:8px;">
            <button onclick="changeDate(-1)" style="background:none; border:none; padding:5px; color:var(--ios-blue); cursor:pointer;"><i data-lucide="chevron-left" style="width:20px;"></i></button>
            <button onclick="openCalendarModal()" style="background:none; border:none; padding:8px 12px; border-radius:18px; color:black; font-weight:700; font-size:15px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                ${state.date} 
            </button>
            <button onclick="changeDate(1)" style="background:none; border:none; padding:5px; color:var(--ios-blue); cursor:pointer;"><i data-lucide="chevron-right" style="width:20px;"></i></button>
        </div>

        <div style="text-align:right;">
             <button onclick="goToToday()" style="background:none; border:none; color:var(--ios-blue); font-weight:600; font-size:14px; cursor:pointer;">${t('workout.today')}</button>
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
    // V27.1: Unit-aware stats
    const units = window.tempSettingsState.settings?.units || Unit.defaults;
    const volUnit = Unit.getLabel('workout', units.workout);
    const volDisplay = Unit.displayVal(totalVol, 'workout', units.workout);

    // Check if we display k or M
    let volStr = Math.round(volDisplay).toLocaleString();
    if (volDisplay > 1000) volStr = (volDisplay / 1000).toFixed(1) + 'k';

    stats.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; text-align:center; gap:5px;">
             <div><div style="font-size:18px; font-weight:800;">${totalSets}</div><div style="font-size:11px; opacity:0.8;">${t('workout.sets')}</div></div>
             <div><div style="font-size:18px; font-weight:800;">${volStr}</div><div style="font-size:11px; opacity:0.8;">${t('workout.vol')} (${volUnit})</div></div>
             <div><div style="font-size:18px; font-weight:800;">${Math.round(totalCardio)}</div><div style="font-size:11px; opacity:0.8;">${t('workout.cardio')} (m)</div></div>
             <div><div style="font-size:18px; font-weight:800;">${totalKcal}</div><div style="font-size:11px; opacity:0.8;">Kcal</div></div>
        </div>
        `;
    container.appendChild(stats);

    // 4. Exercise List
    const list = document.createElement('div');
    list.style.marginBottom = '20px';

    if (todaysPlan.length === 0) {
        list.innerHTML = `<div class="card" style="text-align:center; padding:40px 20px; color:gray;"><i data-lucide="dumbbell" style="width:48px; height:48px; margin-bottom:10px;"></i><div style="font-size:16px;">${t('workout.no_exercises')}</div></div>`;
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
                logDisplay = totalDur > 0 ? `<div style="color:var(--ios-green); font-weight:600;">${totalDur} ${t('workout.min_logged')}</div>` : `<div style="color:gray;">${t('workout.tap_to_log')}</div>`;
            } else {
                logDisplay = logs.length > 0 ? `<div style="color:var(--ios-green); font-weight:600;">${logs.length} ${t('workout.sets')}</div>` : `<div style="color:gray; font-size:14px;">Start</div>`;
            }

            // Display Targets if custom
            let targetDisplay = '';
            if (!isCardio && exTarget) {
                targetDisplay = `<div style="font-size:12px; color:gray; margin-top:4px;">${t('workout.target')}: ${exTarget.sets} x ${exTarget.reps} (${exTarget.rest}s ${t('workout.rest')})</div>`;
            }

            card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-weight:700; font-size:16px;">${getDisplayName(exName)}</div>
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
    addBtn.innerHTML = `<i data-lucide="plus" style="width:20px; height:20px;"></i> ${t('workout.add_to_plan')}`;
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
        manageBtn.innerHTML = t('workout.edit_delete_list');
        manageBtn.onclick = () => window.openBulkManagement();
        container.appendChild(manageBtn);
    }
}


// --- View: Diet Tracker (V18 Refined) ---
// Data Trace Helper
window.getGoalsForDate = (dateStr) => {
    const history = Store.get('goal_history', []);
    const parseDate = (d) => {
        if (!d) return 0;
        // Handle ISO format 'YYYY-MM-DD' (V27 format) or 'YYYY. M. D.' (ko-KR format)
        if (typeof d === 'string') {
            if (d.includes('-')) {
                // ISO format: YYYY-MM-DD (Treat as Local Midnight to match state.date)
                return new Date(d + 'T00:00:00').getTime();
            } else if (d.includes('.')) {
                // Korean format: YYYY. M. D.
                const parts = d.split('.').map(s => s.trim()).filter(s => s);
                if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
            }
        }
        return new Date(d).getTime();
    };
    const targetTime = parseDate(dateStr);
    const defaults = { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, targetWater: 2000, targetSodium: 2000 };

    if (!history || history.length === 0) return Store.get('user_settings', defaults);

    // Sort descending (Newest first)
    history.sort((a, b) => parseDate(b.date) - parseDate(a.date));

    // Find first entry where entry.date <= targetTime
    const entry = history.find(h => parseDate(h.date) <= targetTime);

    return entry ? entry.goals : Store.get('user_settings', defaults);
};

function renderDietView(container) {
    const dietKey = `diet_${state.date} `;
    const saved = Store.get(dietKey, { meals: [], water: 0 });
    const meals = saved.meals || [];
    const water = saved.water || 0;

    // 1. Stats Calculation (V24: Historical Goals)
    const goals = window.getGoalsForDate(state.date);
    // V27: Fix mapping - goals object uses targetCal/targetPro format, not calories/protein
    const settings = {
        targetCal: goals.targetCal || goals.calories || 2000,
        targetPro: goals.targetPro || goals.protein || 100,
        targetCarb: goals.targetCarb || goals.carbs || 250,
        targetFat: goals.targetFat || goals.fat || 67,
        targetWater: goals.targetWater || goals.water || 2000,
        targetSodium: goals.targetSodium || goals.sodium || 2000
    };

    // V27.1: Unit-aware diet
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const waterUnit = Unit.getLabel('water', units.water);
    const displayWater = (val) => Unit.displayVal(val, 'water', units.water);

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
        <div></div>
        <div style="display:flex; align-items:center; gap:8px;">
            <button onclick="changeDate(-1)" style="background:none; border:none; padding:5px; color:var(--ios-blue); cursor:pointer;"><i data-lucide="chevron-left" style="width:20px;"></i></button>
            <button onclick="openCalendarModal()" style="background:none; border:none; padding:8px 12px; border-radius:18px; color:black; font-weight:700; font-size:15px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                ${state.date} 
            </button>
            <button onclick="changeDate(1)" style="background:none; border:none; padding:5px; color:var(--ios-blue); cursor:pointer;"><i data-lucide="chevron-right" style="width:20px;"></i></button>
        </div>
        <div style="text-align:right;">
             <button onclick="goToToday()" style="background:none; border:none; color:var(--ios-blue); font-weight:600; font-size:14px; cursor:pointer;">${t('workout.today')}</button>
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
            sodium: { healthy: [30, 100], warning: [15, 130] } // V26.1: Safer ranges (low sodium also risky)
        };

        const range = ranges[type];
        if (pct >= range.healthy[0] && pct <= range.healthy[1]) return '#4ECDC4'; // Green/Turquoise
        if (pct >= range.warning[0] && pct <= range.warning[1]) return '#FFB347'; // Yellow/Amber
        return '#FF6B6B'; // Red
    };


    // V21: Unified Donut Creator (Horizontal Layout: Donut + Text Side-by-Side)
    const createNutrientDonut = (icon, label, current, target, unit, type) => {
        const pct = Math.round((current / target) * 100);
        const deg = Math.min(360, (pct / 100) * 360);
        const color = getHealthColor(current, target, type);
        const size = 70;

        // V27.1: Unit Display
        let dCur = Math.round(current);
        let dTar = target;
        let dUnit = unit;
        if (type === 'water') {
            dCur = displayWater(current);
            dTar = displayWater(target);
            dUnit = waterUnit;
        }

        // V24: Layout Fix - 3 Lines (Label / Current / Target)
        const displayText = `<div style="font-size:11px; color:gray; font-weight:600; margin-bottom:1px; white-space:nowrap;">${label}</div>
               <div style="font-size:16px; font-weight:800; color:#333; line-height:1.2;">${dCur}</div>
               <div style="font-size:11px; color:gray; font-weight:500;">/ ${dTar} ${dUnit}</div>`;

        const iconDisplay = `<i data-lucide="${icon}" style="width:18px; color:${color}; margin-bottom:2px;"></i>
        <span style="font-size:11px; font-weight:700; color:${color};">${pct}%</span>`;

        return `
            <div style="display:flex; align-items:center; gap:8px;">
                <div style="position:relative; width:${size}px; height:${size}px; border-radius:50%; background:conic-gradient(${color} ${deg}deg, #f2f2f7 0deg); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <div style="width:${size - 10}px; height:${size - 10}px; background:white; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                        ${iconDisplay}
                    </div>
                </div>
                <!--Text Container Flex Alignment-->
        <div style="display:flex; flex-direction:column; justify-content:center; flex:1; min-width:0;">
            ${displayText}
        </div>
            </div>
        `;
    };

    dashboard.innerHTML = `
        <!--V21: Row 1 - Calories, Water, Sodium (Flex Wrap for Mobile)-->
        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:space-between; margin-bottom:20px;">
            <div style="flex:1 1 100px;">${createNutrientDonut('flame', t('settings.target_cal'), total.cal, settings.targetCal, 'kcal', 'calories')}</div>
            <div style="flex:1 1 100px;">${createNutrientDonut('droplet', t('settings.target_water'), water, settings.targetWater, 'ml', 'water')}</div>
            <div style="flex:1 1 100px;">${createNutrientDonut('sparkles', t('settings.target_sodium'), total.sodium, settings.targetSodium || 2000, 'mg', 'sodium')}</div>
        </div>

        <!--V21: Row 2 - Macros-->
        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:space-between; padding-top:15px; border-top:1px solid #f5f5f5;">
            <div style="flex:1 1 100px;">${createNutrientDonut('beef', t('settings.target_pro'), total.pro, settings.targetPro, 'g', 'protein')}</div>
            <div style="flex:1 1 100px;">${createNutrientDonut('wheat', t('settings.target_carb'), total.carbo, settings.targetCarb || 300, 'g', 'carbs')}</div>
            <div style="flex:1 1 100px;">${createNutrientDonut('droplets', t('settings.target_fat'), total.fat, settings.targetFat || 80, 'g', 'fat')}</div>
        </div>
    `;
    container.appendChild(dashboard);

    // 4. Timeline (V21: renamed from "Today's Meals")
    const listTitle = document.createElement('h3');
    listTitle.style.fontSize = '18px';
    listTitle.style.marginBottom = '10px';
    listTitle.innerHTML = t('diet.timeline');
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
                card.onclick = () => {
                    console.log("Water Card Clicked. ID:", m.id);
                    if (window.openWaterEditor) window.openWaterEditor(m.id);
                    else console.error("CRITICAL: openWaterEditor is undefined!");
                };
                card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:8px;">
                             <div style="font-size:13px; font-weight:700; color:#555; background:#f0f0f0; padding:2px 6px; border-radius:4px;">${m.time}</div>
                             <span style="font-size:16px;">💧</span>
                             <div style="font-size:15px; font-weight:600;">${t('diet.water')}</div>
                        </div>
                        <div style="font-size:14px; font-weight:600; color:#5AC8FA;">${displayWater(m.amount)} ${waterUnit}</div>
                    </div>
        `;
            } else {
                // Regular meal
                const mCal = m.foods.reduce((s, f) => s + f.cal, 0);
                card.onclick = () => openMealEditor(m.id);
                const summary = m.foods.map(f => getDisplayName(f.name, 'food')).join(', ');

                // V21: Emoji for meal type (matching Add Diet Log)
                const mealEmoji = m.type === 'Meal' ? '🍱' : (m.type === 'Snack' ? '🍪' : '☕');

                card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                             <div style="font-size:13px; font-weight:700; color:#555; background:#f0f0f0; padding:2px 6px; border-radius:4px;">${m.time}</div>
                             <span style="font-size:16px;">${mealEmoji}</span>
                             <div style="font-size:15px; font-weight:600;">${t('diet.' + m.type.toLowerCase())}</div>
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
    addBtn.innerHTML = '+ ' + t('diet.add_log');
    addBtn.onclick = () => openAddDietMenu();
    container.appendChild(addBtn);
}

// --- V18 Mechanics ---

// 1. Add Menu (Type Selection) - V26.1: Fixed modal stacking
// Future Date Check Helper
// Future Date Check Helper (Numeric Comparison)
window.isFutureDate = (dStr) => {
    try {
        const now = new Date();
        const todayVal = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

        let y, m, d;
        if (dStr.includes('.')) {
            // "2026. 1. 9."
            const p = dStr.split('.').map(s => parseInt(s.trim()));
            y = p[0]; m = p[1]; d = p[2];
        } else if (dStr.includes('-')) {
            // "2026-01-09"
            const p = dStr.split('-').map(s => parseInt(s.trim()));
            y = p[0]; m = p[1]; d = p[2];
        } else {
            return false; // Unknown format
        }

        if (!y || !m || !d) return false;

        const targetVal = y * 10000 + m * 100 + d;
        console.log(`[isFutureDate] Target: ${targetVal}, Today: ${todayVal}, Result: ${targetVal > todayVal}`);
        return targetVal > todayVal;
    } catch (e) {
        console.error("isFutureDate Error:", e);
        return false;
    }
};

// 1. Add Menu (Type Selection) - V26.1: Fixed modal stacking
window.openAddDietMenu = () => {
    if (window.isFutureDate(state.date)) return alert(t('workout.future_date_warning'));

    // Create a simpler type selector without nested modals
    const modal = createModal(t('diet.select_type'));
    modal.innerHTML = `
        <div style="padding:10px;">
            <div style="display:grid; gap:10px;">
                <button onclick="closeModal(); setTimeout(() => openMealEditor(null, 'Meal'), 100)" style="padding:15px; border:1px solid #eee; background:white; border-radius:12px; font-size:16px; font-weight:600;">🍱 ${t('diet.meal')}</button>
                <button onclick="closeModal(); setTimeout(() => openMealEditor(null, 'Snack'), 100)" style="padding:15px; border:1px solid #eee; background:white; border-radius:12px; font-size:16px; font-weight:600;">🍪 ${t('diet.snack')}</button>
                <button onclick="closeModal(); setTimeout(() => openWaterModal(), 100)" style="padding:15px; border:1px solid #eee; background:white; border-radius:12px; font-size:16px; font-weight:600;">💧 ${t('diet.water')}</button>
            </div>
            <button onclick="closeModal()" style="margin-top:15px; width:100%; background:#f2f4f7; border:none; padding:12px; border-radius:12px; color:gray; font-weight:600;">${t('buttons.cancel')}</button>
        </div>
        `;
}

// V21: Enhanced Water Modal (200/500ml + Custom Input + Timeline Integration)
// V21: Enhanced Water Modal (200/500ml + Custom Input + Timeline Integration) of Edit support
window.openWaterModal = (editId = null) => {
    console.log("[openWaterModal] Called with ID:", editId);
    if (!editId && window.isFutureDate(state.date)) return alert(t('workout.future_date_warning'));

    const isEdit = !!editId;
    // Don't modify default modal class, let createModal handle it.
    // If we want center modal, we might need a different helper or CSS, but for now standard sheet is safer.
    const modal = createModal(t('diet.log_water_title'));

    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const isOz = units.water === 'oz';
    const label = isOz ? 'fl oz' : 'ml';

    // Presets
    const p1Label = isOz ? '+8 fl oz' : '+200ml';
    const p1Val = isOz ? 237 : 200;
    const p2Label = isOz ? '+16 fl oz' : '+500ml';
    const p2Val = isOz ? 473 : 500;

    let customAmount = isOz ? 8 : 250; // Display value

    // If Edit Mode, Fetch Existing
    if (isEdit) {
        const key = `diet_${state.date} `;
        const saved = Store.get(key, { meals: [], water: 0 });
        console.log("[openWaterModal] Searching key:", key, "Meals count:", saved.meals.length);
        const entry = saved.meals.find(m => m.id == editId);
        console.log("[openWaterModal] Found entry:", entry);
        if (entry) {
            // Convert to unit
            if (isOz) customAmount = Math.round(Unit.displayVal(entry.amount, 'water', 'oz'));
            else customAmount = entry.amount;
        }
    }

    const renderWaterModal = () => {
        modal.innerHTML = `
        <div style="background:white; padding:10px; border-radius:24px; width:100%; text-align:center;">
                <i data-lucide="droplet" style="width:40px; height:40px; color:#5AC8FA; margin-bottom:10px;"></i>
                <!-- <h2 style="margin:0 0 20px 0; font-size:22px;">${isEdit ? t('diet.edit_meal_title') : t('diet.log_water_title')}</h2> -->
                <!-- Duplicate title removed, standard header used -->
                
                ${!isEdit ? `
                <!--Quick Add Buttons-->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                    <button type="button" onclick="logWaterAndClose(${p1Val})" style="padding:15px; background:#f2f4f7; border:none; border-radius:12px; font-weight:600; color:#5AC8FA;">${p1Label}</button>
                    <button type="button" onclick="logWaterAndClose(${p2Val})" style="padding:15px; background:#f2f4f7; border:none; border-radius:12px; font-weight:600; color:#5AC8FA;">${p2Label}</button>
                </div>` : ''}
                
                <!--Custom Input-->
                <div style="margin-bottom:15px;">
                    <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">${t('diet.custom_amount')} (${label})</label>
                    <input type="number" id="customWaterInput" value="${customAmount}" style="width:100%; padding:12px; border:2px solid #5AC8FA; border-radius:12px; text-align:center; font-size:18px; font-weight:700;">
                </div>
                
                <div style="display:flex; gap:10px;">
                    ${isEdit ? `<button onclick="deleteWaterLog(${editId})" style="flex:1; padding:15px; background:white; border:1px solid var(--ios-red); color:var(--ios-red); border-radius:12px; font-weight:700;">${t('workout.delete_log')}</button>` : ''}
                    <button type="button" onclick="logCustomWater(${editId})" style="flex:2; padding:15px; background:#5AC8FA; color:white; border:none; border-radius:12px; font-weight:700;">${isEdit ? t('workout.update') : t('diet.log_button')}</button>
                </div>
                <button type="button" onclick="closeModal()" style="margin-top:10px; background:none; border:none; color:gray;">${t('buttons.cancel')}</button>
            </div>
        `;
        lucide.createIcons();

        // Bind input
        const input = document.getElementById('customWaterInput');
        if (input) {
            input.oninput = (e) => {
                customAmount = parseFloat(e.target.value) || 0;
            };
        }
    };

    window.logWaterAndClose = (amount) => {
        logWaterToTimeline(amount);
        closeModal();
    };

    // V28.1: Support Edit/Delete
    window.logCustomWater = (updateId = null) => {
        const input = document.getElementById('customWaterInput');
        const val = parseFloat(input?.value || customAmount);
        if (val > 0) {
            const ml = Unit.parseVal(val, 'water', units.water);
            logWaterToTimeline(ml, updateId);
            closeModal();
        }
    };

    window.deleteWaterLog = (id) => {
        if (!confirm(t('workout.delete_log') + '?')) return;
        const key = `diet_${state.date} `;
        const saved = Store.get(key, { meals: [], water: 0 });

        const idx = saved.meals.findIndex(m => m.id == id);
        if (idx !== -1) {
            const entry = saved.meals[idx];
            saved.water = Math.max(0, (saved.water || 0) - entry.amount);
            saved.meals.splice(idx, 1);
            Store.set(key, saved);
            render();
            closeModal();
        }
    };

    renderWaterModal();
};

window.openWaterEditor = (id) => window.openWaterModal(id);

// V21: Log Water to Timeline (as a meal-like entry) - Updated for Edit
function logWaterToTimeline(amount, updateId = null) {
    const key = `diet_${state.date} `;
    const saved = Store.get(key, { meals: [], water: 0 });

    if (updateId) {
        // Edit existing
        const idx = saved.meals.findIndex(m => m.id == updateId);
        if (idx !== -1) {
            const oldAmount = saved.meals[idx].amount;
            saved.meals[idx].amount = amount;
            // Update total: subtract old, add new
            saved.water = (saved.water || 0) - oldAmount + amount;
        }
    } else {
        // Add new
        const waterEntry = {
            id: Date.now(),
            time: new Date().toTimeString().slice(0, 5),
            type: 'Water',
            amount: amount,
            foods: [] // Empty for water
        };
        saved.meals.push(waterEntry);
        saved.water = (saved.water || 0) + amount;
    }

    Store.set(key, saved);
    render();
}

// 2. Updated Editor (Accepts initialType)
window.openMealEditor = (mealId = null, initialType = 'Meal') => {
    if (!mealId && window.isFutureDate(state.date)) return alert(t('workout.future_date_warning'));

    // Determine Modal Title & Initial State
    const isEdit = !!mealId;
    let tempMeal = {
        id: mealId || Date.now(),
        time: new Date().toTimeString().slice(0, 5),
        type: initialType,
        foods: [] // [{name, unit, amount, cal, pro, ...}]
    };

    if (isEdit) {
        const key = `diet_${state.date} `;
        const saved = Store.get(key, { meals: [] });
        const found = saved.meals.find(m => m.id == mealId);
        if (found) tempMeal = JSON.parse(JSON.stringify(found)); // Deep copy
    }

    // V27.1: Unit-aware
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const fUnit = Unit.getLabel('food', units.food);

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
                            <div style="font-weight:600;">${getDisplayName(f.name, 'food')}</div>
                            <div style="font-size:12px; color:gray;">${f.unit === 'g' ? Unit.displayVal(f.amount, 'food', units.food) + fUnit : f.amount + f.unit} · ${Math.round(f.cal)}kcal</div>
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
                    <option value="Meal" ${tempMeal.type === 'Meal' ? 'selected' : ''}>${t('diet.meal')}</option>
                    <option value="Snack" ${tempMeal.type === 'Snack' ? 'selected' : ''}>${t('diet.snack')}</option>
                    <option value="Drink" ${tempMeal.type === 'Drink' ? 'selected' : ''}>${t('diet.drink')}</option>
                </select>
            </div>

            <div style="background:white; border-radius:12px; box-shadow:0 1px 5px rgba(0,0,0,0.05); margin-bottom:20px;">
                ${foodListHtml}
                <button onclick="openFoodSelector()" style="width:100%; padding:15px; color:var(--ios-blue); font-weight:600; background:none; border:none;">${t('buttons.add_food')}</button>
            </div>

            <div style="text-align:right; font-size:16px; font-weight:700; margin-bottom:20px;">
                Total: ${Math.round(totalCal)} kcal
            </div>

             <div style="display:flex; gap:10px;">
                 ${isEdit ? `<button type="button" onclick="deleteMeal(${tempMeal.id})" style="flex:1; padding:15px; background:white; border:1px solid var(--ios-red); color:var(--ios-red); border-radius:12px; font-weight:700;">${t('buttons.delete')}</button>` : ''}
                 <button type="button" onclick="saveMeal()" style="flex:2; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:700;">${t('buttons.save')}</button>
            </div>
    `;
    };

    // --- Editor Logic Helpers ---
    window.updateTempMeal = (field, val) => { tempMeal[field] = val; };
    window.removeFoodItem = (idx) => { tempMeal.foods.splice(idx, 1); renderEditor(); };
    window.deleteMeal = (id) => {
        if (!confirm('Delete this meal?')) return;
        const key = `diet_${state.date} `;
        const saved = Store.get(key, { meals: [] });
        saved.meals = saved.meals.filter(m => m.id != id);
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
            const key = `diet_${state.date} `;
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
    // Categories (Mapped to DB keys)
    const catFiles = [
        { k: 'all', v: 'All' },
        { k: 'korean', v: '한식' },
        { k: 'western', v: '양식/패스트푸드' },
        { k: 'carbs', v: '밥/빵/면' },
        { k: 'protein', v: '단백질' },
        { k: 'fruit_veg', v: '과일/야채' },
        { k: 'snack_drink', v: '음료/간식' }
    ];
    const modal = createModal(t('food.add_item_title'));

    // Render
    const renderList = (filter) => {
        let html = `
        <div style="display:flex; gap:5px; overflow-x:auto; padding-bottom:10px; margin-bottom:10px;">
            ${catFiles.map(c => `<button onclick="updateFoodList('${c.v}')" style="white-space:nowrap; padding:6px 12px; border-radius:15px; border:none; background:${filter === c.v ? 'var(--ios-blue)' : '#eee'}; color:${filter === c.v ? 'white' : 'black'};">${t('categories.' + c.k)}</button>`).join('')}
            </div>
        <input type="text" id="foodSearchInput" placeholder="${t('food.search_placeholder')}" style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd; margin-bottom:10px;">
            <div id="foodListResult" style="height:50vh; overflow-y:auto;">
                `;

        Object.keys(FOOD_DB).forEach(key => {
            const item = FOOD_DB[key];
            if (filter !== "All" && item.category !== filter) return; // Simple Filter

            // V19 Logic: Display clean unit text
            const displayUnit = item.unit === 'g' ? `${item.cal}kcal / ${item.default_g}g` : `${item.cal}kcal / 1${item.unit} (${item.default_g}g)`;

            html += `
                <div onclick="selectFoodItem('${key}')" style="padding:12px 0; border-bottom:1px solid #eee; cursor:pointer;">
                    <div style="font-weight:600;">${getDisplayName(key, 'food')}</div>
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
                    div.innerHTML = `<div style="font-weight:600;">${getDisplayName(key, 'food')}</div><div style="font-size:12px; color:gray;">${item.cal}kcal</div>`;
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
    // V27.1: Unit-aware config
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const isOz = units.food === 'oz';

    // If existingIdx is not null, we are editing an added item
    const modal = createModal(name);

    // Determines if we are using weight mode (g/oz) or count mode (unit)
    let currentMode = dbItem.unit === 'g' ? 'weight' : 'unit';
    let currentVal = dbItem.default_g || 100;

    // Convert default if oz
    if (currentMode === 'weight' && isOz) currentVal = Math.round(currentVal * 0.035274);

    // If editing existing
    if (existingIdx !== null) {
        const exist = window.tempMealRef.foods[existingIdx];

        if (exist.unit === 'g') {
            currentMode = 'weight';
            currentVal = isOz ? Math.round(exist.amount * 0.035274) : exist.amount;
        } else {
            currentMode = 'unit';
            currentVal = exist.amount;
        }
    }

    // 3. Profile Settings (Quick Edit)
    window.openProfileSettings = () => {
        const currentName = Store.get('user_name', 'User');
        const newName = prompt(t('settings.enter_name'), currentName);
        if (newName && newName.trim()) {
            Store.set('user_name', newName.trim());
            render(); // Re-render to update header
        }
    };

    const renderConfig = () => {
        // Calculate Ratio for Macros
        let ratio = 1;

        let valInGrams = currentVal;
        if (currentMode === 'weight') {
            valInGrams = isOz ? (currentVal * 28.3495) : currentVal;
            ratio = valInGrams / (dbItem.default_g || 100);
        } else {
            ratio = currentVal;
        }
        // Wait, DB: "Apple": {unit: "개", cal: 95, default_g: 180} -> Cal 95 is for 1 unit (180g).
        // If mode is gram: ratio = input_g / 180.
        // If mode is unit: ratio = input_count.

        // DB Standard: Cal is for 1 "Base Unit". 
        // If unit is 'g', base unit is default_g? Usually naming is "Chicken (100g)" -> cal 165. means 165 per 100g.

        let baseG = dbItem.default_g || 100;
        let finalCal = 0;

        if (currentMode === 'weight') {
            finalCal = ratio * dbItem.cal;
        } else {
            finalCal = currentVal * dbItem.cal;
        }

        const unitLabel = currentMode === 'weight' ? (isOz ? 'Weight (oz)' : 'Weight (g)') : `${dbItem.unit} (Count)`;
        const unitShort = currentMode === 'weight' ? (isOz ? 'oz' : 'g') : dbItem.unit;

        modal.innerHTML = `
            <h2 style="margin:0 0 20px 0;">${name}</h2>

            <div style="display:flex; background:#eee; padding:5px; border-radius:12px; margin-bottom:20px;">
                <button onclick="setMode('unit')" style="flex:1; padding:10px; border-radius:8px; border:none; background:${currentMode === 'unit' ? 'white' : 'none'}; font-weight:600;">${dbItem.unit}</button>
                <button onclick="setMode('weight')" style="flex:1; padding:10px; border-radius:8px; border:none; background:${currentMode === 'weight' ? 'white' : 'none'}; font-weight:600;">${isOz ? t('food.weight_mode_oz') : t('food.weight_mode')}</button>
            </div>

            <div style="margin-bottom:20px;">
                <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">${t('food.amount')} (${unitShort})</label>
                <input type="number" id="confAmount" value="${currentVal}" style="width:100%; font-size:30px; font-weight:800; text-align:center; padding:10px; border:2px solid var(--ios-blue); border-radius:12px;">
            </div>

            <!-- V21: Custom Calorie Input -->
            <div style="margin-bottom:20px;">
                <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">${t('food.calories')} (kcal)</label>
                <input type="number" id="customCalInput" value="${Math.round(finalCal)}" style="width:100%; font-size:20px; font-weight:700; text-align:center; padding:10px; border:1px solid #ddd; border-radius:12px;">
                    <div style="font-size:11px; color:gray; margin-top:3px;">${t('food.default')}: ${Math.round(finalCal)} kcal</div>
            </div>

            <button type="button" onclick="confirmFood('${name}', ${finalCal})" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:700;">
                ${existingIdx !== null ? t('workout.update') : t('workout.add')}
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
        if (m === 'weight') {
            // Reset to default
            let g = dbItem.default_g || 100;
            currentVal = isOz ? Math.round(g * 0.035274) : g;
        } else {
            currentVal = 1;
        }
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

        let valInGrams = currentVal;

        if (currentMode === 'weight') {
            valInGrams = isOz ? (currentVal * 28.3495) : currentVal;
            ratio = valInGrams / baseG;
        } else {
            ratio = currentVal;
        }

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
            unit: currentMode === 'weight' ? 'g' : dbItem.unit,
            amount: currentMode === 'weight' ? Math.round(valInGrams) : currentVal,
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

    // Unit Support
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wLabel = Unit.getLabel('weight', units.weight);

    container.innerHTML = `
            <div style="text-align:center; padding:40px 0;">
                <div style="font-size:16px; color:gray; margin-bottom:10px;">${t('body.current_weight')}</div>
                <div style="font-size:48px; font-weight:800; color:var(--ios-black);">${lastWeight} <span style="font-size:24px; font-weight:500;">${wLabel}</span></div>
            </div>

            <div style="padding:0 20px;">
                <div style="display:flex; gap:10px; margin-bottom:30px;">
                    <input type="number" id="weightInput" placeholder="0.0" style="flex:1; padding:15px; background:white; border:none; border-radius:12px; font-size:18px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        <button onclick="logWeight()" style="padding:0 25px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">${t('body.log_data')}</button>
                </div>

                <h3 style="margin-bottom:15px;">${t('body.weight_history')}</h3>
                <div class="card">
                    ${weightHistory.slice().reverse().map((entry, idx) => `
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;">
                        <div style="color:gray;">${entry.date}</div>
                        <div style="font-weight:600;">${entry.weight} ${wLabel}</div>
                         <button onclick="deleteWeightLog(${weightHistory.length - 1 - idx})" style="background:none; border:none; color:silver;">&times;</button>
                    </div>
                `).join('')}
                    ${weightHistory.length === 0 ? `<div style="text-align:center; color:gray;">${t('workout.no_history')}</div>` : ''}
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
    const modal = createModal(t('workout.add_to_plan'));
    modal.innerHTML = `
            <div style="display:grid; gap:10px;">
                <button onclick="closeModal(); openRoutineImporter()" style="padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">${t('workout.import_routine')}</button>
                <button onclick="closeModal(); openExerciseModal()" style="padding:15px; background:white; color:var(--ios-blue); border:1px solid var(--ios-blue); border-radius:12px; font-weight:600;">${t('workout.browse_exercises')}</button>
                <button onclick="closeModal(); openCardioModal()" style="padding:15px; background:white; color:var(--ios-blue); border:1px solid var(--ios-blue); border-radius:12px; font-weight:600;">${t('workout.add_cardio')}</button>
            </div>
            `;
};

// 2. Routine Importer
// 2. Routine Importer (Smart)
window.openRoutineImporter = (selectedKey = null) => {
    const modal = createModal(t('workout.import_routine'));

    if (selectedKey) {
        // Step 2: Checklist
        const r = ROUTINE_TEMPLATES[selectedKey];
        let html = `
            <div style="margin-bottom:15px; color:gray;">${t('workout.uncheck_items')}</div>
            <div style="max-height:50vh; overflow-y:auto; margin-bottom:15px;">
                `;

        r.exercises.forEach((ex, idx) => {
            html += `
                <div style="display:flex; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                    <input type="checkbox" id="routine_check_${idx}" checked style="width:24px; height:24px; margin-right:15px;">
                    <label for="routine_check_${idx}" style="font-size:16px;">${getDisplayName(ex)}</label>
                </div>
            `;
        });

        html += `</div>
            <button onclick="importRoutine('${selectedKey}')" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:600;">${t('workout.import_selected')}</button>
            <button onclick="openRoutineImporter()" style="width:100%; margin-top:10px; padding:10px; background:none; border:none; color:gray;">${t('workout.back')}</button>
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
                <div style="font-size:12px; color:white;">${r.exercises.map(ex => getDisplayName(ex)).join(', ')}</div>
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
    const modal = createModal(t('workout.browse_exercises'));
    const categories = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

    let html = `
            <div style="display:flex; gap:5px; overflow-x:auto; padding-bottom:10px; margin-bottom:10px;">
                <button onclick="closeModal(); openExerciseModal()" style="padding:6px 12px; border-radius:15px; border:none; background:${!filter ? 'var(--ios-blue)' : '#eee'}; color:${!filter ? 'white' : 'black'}; white-space:nowrap;">${t('workout.all')}</button>
                ${categories.map(c => `
                <button onclick="closeModal(); openExerciseModal('${c}')" style="padding:6px 12px; border-radius:15px; border:none; background:${filter === c ? 'var(--ios-blue)' : '#eee'}; color:${filter === c ? 'white' : 'black'}; white-space:nowrap;">${t('muscles.' + c.toLowerCase())}</button>
            `).join('')}
            </div>
            <input type="text" id="exerciseSearchInput" placeholder="${t('workout.search_exercise')}" style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd; margin-bottom:10px;">
            <div id="exerciseListResult" style="max-height:60vh; overflow-y:auto;">
                `;

    Object.keys(EXERCISE_DB).forEach(key => {
        const ex = EXERCISE_DB[key];
        if (filter && ex.category !== filter) return;

        html += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eee;">
                    <div>
                        <div style="font-weight:600;">${getDisplayName(key)}</div>
                        <div style="font-size:12px; color:gray;">${t('muscles.' + ex.category.toLowerCase())} · ${t('exercise_types.' + ex.type.toLowerCase())}</div>
                    </div>
                    <button onclick="openAddConfigModal('${key}')" style="background:var(--ios-blue); color:white; border:none; padding:8px 15px; border-radius:15px; font-weight:600; font-size:12px;">${t('workout.add')}</button>
                </div>
                `;
    });
    html += '</div>';
    modal.innerHTML = html;

    // Search Logic (same as food selector)
    document.getElementById('exerciseSearchInput').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const list = document.getElementById('exerciseListResult');
        list.innerHTML = '';
        Object.keys(EXERCISE_DB).forEach(key => {
            const ex = EXERCISE_DB[key];
            // Search in name (both KO and EN) and apply category filter
            const nameKo = ex.name_ko ? ex.name_ko.toLowerCase() : '';
            const nameEn = ex.name_en ? ex.name_en.toLowerCase() : '';
            const matches = nameKo.includes(term) || nameEn.includes(term);

            if (matches && (!filter || ex.category === filter)) {
                const div = document.createElement('div');
                div.style.display = "flex";
                div.style.justifyContent = "space-between";
                div.style.alignItems = "center";
                div.style.padding = "12px 0";
                div.style.borderBottom = "1px solid #eee";

                div.innerHTML = `
                    <div>
                        <div style="font-weight:600;">${getDisplayName(key)}</div>
                        <div style="font-size:12px; color:gray;">${t('muscles.' + ex.category.toLowerCase())} · ${t('exercise_types.' + ex.type.toLowerCase())}</div>
                    </div>
                    <button onclick="openAddConfigModal('${key}')" style="background:var(--ios-blue); color:white; border:none; padding:8px 15px; border-radius:15px; font-weight:600; font-size:12px;">${t('workout.add')}</button>
                `;
                list.appendChild(div);
            }
        });
    };
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
    const modal = createModal(editName ? t('workout.log_cardio') : t('workout.add_cardio'));
    if (editName) {
        const icon = CARDIO_DB[editName].icon;
        modal.innerHTML = `
            <div style="text-align:center; margin-bottom:20px;">
                <i data-lucide="${icon}" style="width:48px; height:48px; color:var(--ios-green); margin-bottom:10px;"></i>
                <h3 style="margin:0;">${getDisplayName(editName)}</h3>
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">${t('workout.duration')} *</label>
                <input type="number" id="cardioDur" style="width:100%; padding:15px; border:2px solid var(--ios-green); border-radius:12px; font-size:24px; text-align:center; font-weight:700;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">${t('workout.intensity')}</label>
                <select id="cardioInt" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:12px; font-size:16px; background:white;">
                    <option value="1.0">${t('workout.normal')}</option>
                    <option value="0.7">${t('workout.low')}</option>
                    <option value="1.3">${t('workout.high')}</option>
                </select>
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">${t('workout.calories')} (${t('workout.optional')})</label>
                <input type="number" id="cardioCal" placeholder="${t('workout.auto_calculated')}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:12px; font-size:16px;">
            </div>
            <button onclick="logCardio('${editName}')" style="width:100%; padding:15px; background:var(--ios-green); color:white; border:none; border-radius:12px; font-weight:600;">${t('workout.save_log')}</button>
            `;
        setTimeout(() => document.getElementById('cardioDur').focus(), 100);
    } else {
        // Search + List format (same as exercise browser)
        let html = `
            <input type="text" id="cardioSearchInput" placeholder="${t('workout.search_exercise')}" style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd; margin-bottom:10px;">
            <div id="cardioListResult" style="max-height:60vh; overflow-y:auto;">
                `;

        Object.keys(CARDIO_DB).forEach(key => {
            const c = CARDIO_DB[key];
            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eee;">
                    <div style="font-weight:600;">${getDisplayName(key)}</div>
                    <button onclick="addExerciseToPlan('${key}'); closeModal();" style="background:var(--ios-blue); color:white; border:none; padding:8px 15px; border-radius:15px; font-weight:600; font-size:12px;">${t('workout.add')}</button>
                </div>
                `;
        });
        html += '</div>';
        modal.innerHTML = html;

        // Search Logic
        document.getElementById('cardioSearchInput').oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const list = document.getElementById('cardioListResult');
            list.innerHTML = '';
            Object.keys(CARDIO_DB).forEach(key => {
                const c = CARDIO_DB[key];
                const nameKo = c.name_ko ? c.name_ko.toLowerCase() : '';
                const nameEn = c.name_en ? c.name_en.toLowerCase() : '';
                const matches = nameKo.includes(term) || nameEn.includes(term);

                if (matches) {
                    const div = document.createElement('div');
                    div.style.display = "flex";
                    div.style.justifyContent = "space-between";
                    div.style.alignItems = "center";
                    div.style.padding = "12px 0";
                    div.style.borderBottom = "1px solid #eee";

                    div.innerHTML = `
                        <div style="font-weight:600;">${getDisplayName(key)}</div>
                        <button onclick="addExerciseToPlan('${key}'); closeModal();" style="background:var(--ios-blue); color:white; border:none; padding:8px 15px; border-radius:15px; font-weight:600; font-size:12px;">${t('workout.add')}</button>
                    `;
                    list.appendChild(div);
                    lucide.createIcons();
                }
            });
        };
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
    if (window.isFutureDate(state.date)) return alert(t('workout.future_date_warning'));
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
/* V26.1: Disabled duplicate checkbox-based openBulkManagement - using button-based version at line 106 instead
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
            */

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
    overlay.style.zIndex = '3000'; // Higher than fixed header (2000)
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'flex-end'; // Sheet style
    overlay.onclick = (e) => { if (e.target === overlay) window.closeModal(); };

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.background = 'white';
    content.style.width = '100%';
    content.style.borderRadius = '20px 20px 0 0';
    content.style.padding = '20px';
    content.style.maxHeight = '90vh';
    content.style.overflowY = 'auto';
    content.style.animation = 'slideUp 0.3s ease-out';

    // Header (DOM API for robust event binding)
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';

    const titleEl = document.createElement('h2');
    titleEl.style.margin = '0';
    titleEl.style.fontSize = '20px';
    titleEl.textContent = title;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = '#eee';
    closeBtn.style.border = 'none';
    closeBtn.style.width = '30px';
    closeBtn.style.height = '30px';
    closeBtn.style.borderRadius = '15px';
    closeBtn.style.color = 'gray';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => window.closeModal();

    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    content.appendChild(header);

    // Add slideUp keyframes if not exists
    if (!document.getElementById('anim-style')) {
        const style = document.createElement('style');
        style.id = 'anim-style';
        style.innerHTML = `@keyframes slideUp {from {transform: translateY(100%); } to {transform: translateY(0); } }`;
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
    // Defer render to ensure DOM update is processed or prevent race conditions
    setTimeout(() => {
        if (typeof render === 'function') render();
    }, 100);
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
    if (!item) return;

    const exName = typeof item === 'string' ? item : item.name;
    const targets = typeof item === 'string' ?
        (EXERCISE_DB[exName] || { sets: 3, reps: "8-12", rest: 90 }) :
        { sets: item.sets, reps: item.reps, rest: item.rest };

    const modal = createModal(getDisplayName(exName));
    const logKey = `workout_${state.date}`;
    const logs = Store.get(logKey, {});
    const exLogs = logs[exName] || [];

    // Unit Setup
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wUnit = units.workout;
    const wLabel = Unit.getLabel('workout', wUnit);
    const displayWt = (val) => Unit.displayVal(val, 'workout', wUnit);
    // Date Logic
    const todayStr = normalizeDate();
    const isToday = state.date === todayStr;

    const parseDateHelper = (s) => {
        const p = s.match(/(\d+)/g);
        return p ? new Date(p[0], p[1] - 1, p[2]) : new Date();
    };
    const viewDateObj = parseDateHelper(state.date);
    const todayDateObj = parseDateHelper(todayStr);
    todayDateObj.setHours(0, 0, 0, 0);
    viewDateObj.setHours(0, 0, 0, 0);

    const isFuture = viewDateObj > todayDateObj;

    // 2. History Lookup
    const history = getExerciseHistory(exName, state.date);
    let historyHtml = `<div style="font-size:13px; color:gray; margin-bottom:15px; text-align:center;">${t('workout.no_history')}</div>`;

    if (history) {
        let rows = history.logs.map((l, i) =>
            `<div style="display:flex; justify-content:space-between; padding:2px 0;">
                <span>${t('workout.set_num').replace('{0}', i + 1)}</span>
                <span style="font-weight:600; color:var(--ios-blue);">
                    ${displayWt(l.wt)}${wLabel} x ${l.reps} 
                    <span style="font-size:11px; color:#aaa; font-weight:400;">(${l.duration || 0}s)</span>
                </span>
            </div>`
        ).join('');
        historyHtml = `
            <div style="background:#f5f5f5; border-radius:10px; padding:10px; margin-bottom:15px;">
                <div style="font-size:12px; color:#888; margin-bottom:5px; text-align:center;">${t('workout.last_session')}: ${history.date}</div>
                ${rows}
            </div>`;
    }

    // Determine default values
    const lastWt = exLogs.length > 0 ? exLogs[exLogs.length - 1].wt : (history && history.logs.length > 0 ? history.logs[history.logs.length - 1].wt : '');
    const lastReps = exLogs.length > 0 ? exLogs[exLogs.length - 1].reps : (history && history.logs.length > 0 ? history.logs[history.logs.length - 1].reps : '');

    // 3. Render Logs (Today's Sets)
    let logHtml = `<div id="todayLogsList" style="display:flex; flex-direction:column; gap:8px;">`;
    if (exLogs.length === 0) {
        logHtml += `<div id="noLogsMsg" style="color:gray; text-align:center; padding:10px; font-size:13px;">No sets completed today</div>`;
    } else {
        exLogs.forEach((l, idx) => {
            logHtml += `
                <div onclick="editSetLog('${exName}', ${idx})" style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:8px; cursor:pointer;">
                    <div style="font-weight:600; color:gray;">${t('workout.set_num').replace('{0}', idx + 1)}</div>
                    <div style="font-weight:700;">
                        ${displayWt(l.wt)}${wLabel} x ${l.reps}
                        <span style="font-size:11px; color:#aaa; font-weight:400; margin-left:5px;">(${l.duration || 0}s)</span>
                    </div>
                </div>`;
        });
    }
    logHtml += '</div>';

    modal.innerHTML = `
        <div style="margin-bottom:15px;">
            ${historyHtml}

            <!-- Target Display (Compact) -->
             <div style="display:flex; gap:10px; margin-bottom:15px; background:#f9f9f9; padding:10px; border-radius:12px; align-items:center; text-align:center;">
                <div style="flex:1;">
                    <label style="font-size:10px; color:gray;">SETS</label>
                    <input type="number" value="${targets.sets}" onchange="updatePlanTarget(${planIdx}, 'sets', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px; text-align:center;">
                </div>
                <div style="flex:1; border-left:1px solid #eee; border-right:1px solid #eee;">
                    <label style="font-size:10px; color:gray;">REPS</label>
                    <input type="text" value="${targets.reps}" onchange="updatePlanTarget(${planIdx}, 'reps', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px; text-align:center;">
                </div>
                <div style="flex:1;">
                    <label style="font-size:10px; color:gray;">REST</label>
                    <input type="number" value="${targets.rest}" onchange="updatePlanTarget(${planIdx}, 'rest', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px; text-align:center;">
                </div>
            </div>
            
            <!-- TIMER & CONTROLS -->
            ${isToday ? `
            <div id="timerSection" style="text-align:center; padding:10px 0; margin-bottom:10px;">
                <div id="timerDisplay" style="font-size:56px; font-weight:800; font-variant-numeric:tabular-nums; margin-bottom:15px; color:#333;">00:00</div>
                <div id="timerStatus" style="font-size:14px; color:gray; margin-bottom:10px; font-weight:600; min-height:20px;">READY</div>
                <div id="timerControls">
                    <button id="mainTimerBtn" onclick="startSet('${exName}', ${targets.rest})" style="width:100%; padding:18px; background:var(--ios-blue); color:white; border:none; border-radius:16px; font-size:18px; font-weight:700; transition: all 0.2s;">
                        ${t('workout.start_set')}
                    </button>
                </div>
            </div>` : ''}

            <!-- MANUAL ADD (Past Only) -->
            ${!isToday && !isFuture ? `
            <div id="manualLogControls" style="margin-bottom:10px;">
                 <button onclick="saveSetLog('${exName}')" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-size:16px; font-weight:700;">
                    ${t('workout.log_record')}
                 </button>
            </div>` : ''}

            <!-- EDIT CONTROLS (Initially Hidden) -->
            <div id="editLogControls" style="display:none; margin-bottom:15px; padding:15px; background:#f0f0f0; border-radius:12px;">
                <div style="font-weight:700; margin-bottom:10px; text-align:center; font-size:14px;">${t('workout.edit_log')}</div>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <button onclick="updateSetLog()" style="flex:1; padding:12px; background:var(--ios-blue); color:white; border:none; border-radius:10px; font-weight:600;">${t('workout.update')}</button>
                    <button onclick="deleteSetLog()" style="flex:1; padding:12px; background:var(--ios-red); color:white; border:none; border-radius:10px; font-weight:600;">${t('workout.delete_log')}</button>
                </div>
                <button onclick="cancelEditLog()" style="width:100%; padding:10px; background:#ccc; color:white; border:none; border-radius:10px; font-weight:600;">${t('workout.cancel')}</button>
            </div>

            <!-- LOG FORM -->
            <div id="logFormArea" style="display:${isFuture ? 'none' : 'block'}; margin-top:10px; border-top:1px solid #eee; padding-top:15px;">
                <div style="font-size:13px; font-weight:700; margin-bottom:10px; color:#333;">${t('workout.log_input_header')}</div>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <div style="flex:1;">
                        <input type="number" id="logWt" placeholder="Wt (${wLabel})" value="${lastWt ? displayWt(lastWt) : ''}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; font-size:18px; text-align:center; font-weight:600;">
                    </div>
                    <div style="flex:1;">
                        <input type="number" id="logReps" placeholder="Reps" value="${lastReps || ''}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; font-size:18px; text-align:center; font-weight:600;">
                    </div>
                </div>
                <!-- Duration Hidden Input -->
                <input type="hidden" id="logDuration" value="0">
            </div>

            <div style="margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                <h3 style="margin:0 0 10px 0; font-size:14px; color:#666;">${t('workout.today')}</h3>
                ${logHtml}
            </div>
        </div>
    `;

    // Restore Timer UI State
    if (state.timer.exercise === exName && state.timer.mode) {
        updateTimerUI(state.timer.mode, exName);
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
};

// --- Timer Functions ---

// 1. Start Work Set
window.startSet = (exName, restTime) => {
    // Future Date Check
    const p = state.date.match(/(\d+)/g);
    if (p && p.length >= 3) {
        const current = new Date(p[0], p[1] - 1, p[2]);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (current > now) {
            return alert(t('workout.future_date_warning'));
        }
    }

    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.mode = 'work';
    state.timer.seconds = 0;
    state.timer.exercise = exName;
    state.timer.targetRest = restTime || 90;

    // Start UI
    updateTimerUI('work', exName);

    // Timer Interval
    state.timer.intervalId = setInterval(() => {
        state.timer.seconds++;
        const display = document.getElementById('timerDisplay');
        if (display) display.innerText = formatTime(state.timer.seconds);

        // Update hidden duration input if form is open, though form is mainly for post-set
        const durInput = document.getElementById('logDuration');
        if (durInput) durInput.value = state.timer.seconds;
    }, 1000);
};

// 2. Finish Work Set -> Show Log Form
// 2. Finish Work Set -> Show Log Form (Background Rest Start)
window.finishWorkSet = () => {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);

    // Save Work Duration Snapshot
    state.timer.lastWorkDuration = state.timer.seconds;

    // Start Background Rest Timer
    state.timer.mode = 'log';
    state.timer.seconds = state.timer.targetRest;

    state.timer.intervalId = setInterval(() => {
        if (state.timer.seconds > 0) {
            state.timer.seconds--;
        } else {
            if (state.timer.seconds === 0) playTimerSound();
            clearInterval(state.timer.intervalId);
        }

        // Update UI only if in Rest Mode
        if (state.timer.mode === 'rest') {
            const display = document.getElementById('timerDisplay');
            const controls = document.getElementById('timerControls');
            if (display) display.innerText = formatTime(state.timer.seconds);

            if (state.timer.seconds <= 0 && controls) {
                controls.innerHTML = `<button onclick="startSet('${state.timer.exercise}', ${state.timer.targetRest})" style="width:100%; padding:20px; background:var(--ios-green); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.start_next_set')}</button>`;
            }
        }
    }, 1000);

    updateTimerUI('log');
};

// 3. Save Log & Start Rest
window.saveSetLog = (exName) => {
    // Future Date Check
    const p = state.date.match(/(\d+)/g);
    if (p && p.length >= 3) {
        const current = new Date(p[0], p[1] - 1, p[2]);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (current > now) {
            return alert(t('workout.future_date_warning'));
        }
    }

    const wtInput = document.getElementById('logWt').value;
    const repsInput = document.getElementById('logReps').value;
    // Use stored duration
    const durInput = state.timer.lastWorkDuration || 0;

    if (!wtInput || !repsInput) return alert("Weight and Reps required");

    // Save Data
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wt = Unit.parseVal(wtInput, 'workout', units.workout);

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {});
    if (!logs[exName]) logs[exName] = [];
    logs[exName].push({
        wt,
        reps: repsInput,
        duration: parseInt(durInput),
        timestamp: Date.now()
    });
    Store.set(key, logs);

    // Update Logs UI (Inline Append)
    const todayList = document.getElementById('todayLogsList');
    const noLogs = document.getElementById('noLogsMsg');
    if (noLogs) noLogs.remove();

    const wLabel = Unit.getLabel('workout', units.workout);
    const displayWt = Unit.displayVal(wt, 'workout', units.workout);

    const newLogHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:5px;">
            <div style="font-weight:600; color:gray;">${t('workout.set_num').replace('{0}', logs[exName].length)}</div>
            <div style="font-weight:700;">
                ${displayWt}${wLabel} x ${repsInput}
                <span style="font-size:11px; color:#aaa; font-weight:400; margin-left:5px;">(${durInput}s)</span>
            </div>
        </div>`;
    if (todayList) todayList.innerHTML += newLogHtml;

    // Switch to Rest UI (Timer already running)
    state.timer.mode = 'rest';
    updateTimerUI('rest');
};

// 4. Rest Timer Logic
// 4. Skip Rest / Ready
window.skipRest = () => {
    // Immediate Start Next Set
    startSet(state.timer.exercise, state.timer.targetRest);
};

// UI Updater Helper
window.updateTimerUI = (mode, exName) => {
    const btn = document.getElementById('mainTimerBtn');
    const status = document.getElementById('timerStatus');
    const display = document.getElementById('timerDisplay');
    const logArea = document.getElementById('logArea');
    const controls = document.getElementById('timerControls'); // Might overlap with btn container?

    // Based on openWorkoutDetail, we have:
    // timerArea -> timerDisplay
    // timerControls -> holds buttons.
    // 'mainTimerBtn' was inside timerControls (or separate?). 
    // Let's re-verify structure. In Step 2670:
    // controls.innerHTML = `<button id="mainTimerBtn" ... >` was the old way?
    // No, I created <div id="timerControls"></div>.

    if (!controls || !status || !display) return;

    if (mode === 'work') {
        status.innerText = t('workout.work_mode');
        status.style.color = 'var(--ios-green)';
        display.innerText = formatTime(state.timer.seconds);
        display.style.color = 'var(--ios-green)';

        if (logArea) logArea.style.display = 'none';

        controls.innerHTML = `<button onclick="finishWorkSet()" style="width:100%; padding:20px; background:var(--ios-red); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.finish_set')}</button>`;

    } else if (mode === 'log') {
        status.innerText = t('workout.finish_set');
        status.style.color = '#333';
        display.innerText = formatTime(state.timer.lastWorkDuration);
        display.style.color = '#333';

        if (logArea) logArea.style.display = 'block';

        controls.innerHTML = `<button onclick="saveSetLog('${state.timer.exercise}')" style="width:100%; padding:20px; background:var(--ios-blue); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.log_this_set')}</button>`;

        setTimeout(() => { if (document.getElementById('logWt')) document.getElementById('logWt').focus(); }, 100);

    } else if (mode === 'rest') {
        status.innerText = t('workout.rest_mode');
        status.style.color = 'var(--ios-blue)';
        display.innerText = formatTime(state.timer.seconds);
        display.style.color = 'var(--ios-blue)';

        if (logArea) logArea.style.display = 'none';

        if (state.timer.seconds <= 0) {
            controls.innerHTML = `<button onclick="startSet('${state.timer.exercise}', ${state.timer.targetRest})" style="width:100%; padding:20px; background:var(--ios-green); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.start_next_set')}</button>`;
        } else {
            controls.innerHTML = `<button onclick="skipRest()" style="width:100%; padding:20px; background:#888; color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.skip_rest')}</button>`;
        }
    } else {
        // Idle
        status.innerText = 'READY';
        status.style.color = '#888';
        display.innerText = "00:00";
        display.style.color = '#ccc';
        if (logArea) logArea.style.display = 'none';
        controls.innerHTML = `<button onclick="startSet('${state.timer.exercise}', ${state.timer.targetRest})" style="width:100%; padding:20px; background:var(--ios-green); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.start_set')}</button>`;
    }
};




// --- Log Edit Functions ---
window.editSetLog = (exName, idx) => {
    const key = `workout_${state.date}`;
    const logs = Store.get(key, {})[exName];
    if (!logs || !logs[idx]) return;
    const log = logs[idx];

    state.editingLog = { name: exName, index: idx };

    // Fill Inputs
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const displayWt = Unit.displayVal(log.wt, 'workout', units.workout);

    const wtInput = document.getElementById('logWt');
    const repsInput = document.getElementById('logReps');
    if (wtInput) wtInput.value = displayWt;
    if (repsInput) repsInput.value = log.reps;

    // UI Switch
    if (document.getElementById('timerSection')) document.getElementById('timerSection').style.display = 'none';
    if (document.getElementById('manualLogControls')) document.getElementById('manualLogControls').style.display = 'none';
    if (document.getElementById('editLogControls')) document.getElementById('editLogControls').style.display = 'block';

    // Ensure form is visible
    const form = document.getElementById('logFormArea');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
};

window.cancelEditLog = () => {
    state.editingLog = null;
    const wtInput = document.getElementById('logWt');
    const repsInput = document.getElementById('logReps');
    if (wtInput) wtInput.value = '';
    if (repsInput) repsInput.value = '';

    if (document.getElementById('editLogControls')) document.getElementById('editLogControls').style.display = 'none';

    // Restore UI based on date
    const todayStr = normalizeDate();
    const isToday = state.date === todayStr;

    if (isToday && document.getElementById('timerSection')) {
        document.getElementById('timerSection').style.display = 'block';
        if (state.timer.exercise) updateTimerUI(state.timer.mode, state.timer.exercise);
    } else if (document.getElementById('manualLogControls')) {
        document.getElementById('manualLogControls').style.display = 'block';
    }
};

window.updateSetLog = () => {
    if (!state.editingLog) return;
    const { name, index } = state.editingLog;
    const wtInput = document.getElementById('logWt');
    const repsInput = document.getElementById('logReps');

    if (!wtInput || !repsInput || !wtInput.value || !repsInput.value) return alert('Please key in weight and reps');

    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wt = Unit.parseVal(wtInput.value, 'workout', units.workout);

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {});
    if (logs[name] && logs[name][index]) {
        logs[name][index].wt = wt;
        logs[name][index].reps = repsInput.value;
        Store.set(key, logs);
    }

    refreshLogList(name);
    cancelEditLog();
};

window.deleteSetLog = () => {
    if (!state.editingLog) return;
    if (!confirm(t('workout.delete_log') + '?')) return;
    const { name, index } = state.editingLog;

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {});
    if (logs[name]) {
        logs[name].splice(index, 1);
        Store.set(key, logs);
    }

    refreshLogList(name);
    cancelEditLog();
};

function refreshLogList(exName) {
    const list = document.getElementById('todayLogsList');
    if (!list) return;

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {})[exName] || [];
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wLabel = Unit.getLabel('workout', units.workout);

    if (logs.length === 0) {
        list.innerHTML = `<div id="noLogsMsg" style="color:gray; text-align:center; padding:10px; font-size:13px;">${t('workout.no_history')}</div>`;
        return;
    }

    let html = '';
    logs.forEach((l, idx) => {
        const displayWt = Unit.displayVal(l.wt, 'workout', units.workout);
        const safeName = exName.replace(/'/g, "\\'");
        html += `
            <div onclick="editSetLog('${safeName}', ${idx})" style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:5px; cursor:pointer;">
                <div style="font-weight:600; color:gray;">${t('workout.set_num').replace('{0}', idx + 1)}</div>
                <div style="font-weight:700;">
                    ${displayWt}${wLabel} x ${l.reps}
                    <span style="font-size:11px; color:#aaa; font-weight:400; margin-left:5px;">(${l.duration || 0}s)</span>
                </div>
            </div>`;
    });
    list.innerHTML = html;
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
        const dateStr = normalizeDate(d);
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
    state.date = normalizeDate(current);
    render();
};

function playTimerSound() {
    try { TIMER_AUDIO.play(); } catch (e) { }
}


window.goToToday = () => {
    state.date = normalizeDate();
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

    // V27.1: Initialize Units
    if (!window.tempSettingsState.settings.units) {
        window.tempSettingsState.settings.units = { ...Unit.defaults };
    }
    // Ensure all keys exist (if partial update)
    window.tempSettingsState.settings.units = { ...Unit.defaults, ...window.tempSettingsState.settings.units };

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

    // V27.1: Unit-aware values
    const units = settings.units || Unit.defaults;

    // Height Logic
    let heightInputHtml = '';
    if (units.height === 'ft') {
        // Convert cm to ft/in
        const totalIn = profile.height / 2.54;
        const ft = Math.floor(totalIn / 12);
        const inch = Math.round(totalIn % 12);
        heightInputHtml = `
            <div style="display:flex; gap:5px; align-items:center;">
                <input type="number" value="${ft}" onchange="updateHeightFromFtIn(this.value, document.getElementById('h_in').value)" style="width:40px;">
                <span style="font-size:12px">ft</span>
                <input type="number" id="h_in" value="${inch}" onchange="updateHeightFromFtIn(document.querySelector('input[onchange*=updateHeightFromFtIn]').value, this.value)" style="width:40px;">
                <span style="font-size:12px">in</span>
            </div>
        `;
    } else {
        heightInputHtml = `<input type="number" value="${profile.height}" onchange="updateTempProfile('height', this.value)" style="width:70px;">`;
    }

    bodyContainer.innerHTML = `
        <!-- 1. Profile Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">${t('settings.profile')}</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
            <div class="setting-row">
                <label style="white-space:nowrap; margin-right:10px;">${t('settings.gender')}</label>
                <select onchange="updateTempProfile('gender', this.value)" style="width:auto; min-width:80px; padding:6px; text-align:right;">
                    <option value="M" ${profile.gender === 'M' ? 'selected' : ''}>${t('settings.gender_m')}</option>
                    <option value="F" ${profile.gender === 'F' ? 'selected' : ''}>${t('settings.gender_f')}</option>
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
                 <label>${t('settings.height').replace(' (cm)', '')} (${Unit.getLabel('height', units.height)})</label>
                 ${heightInputHtml}
            </div>
            <div class="setting-row">
                 <label>${t('settings.weight').replace(' (kg)', '')} (${Unit.getLabel('weight', units.weight)})</label>
                 <input type="number" value="${Unit.displayVal(profile.weight, 'weight', units.weight)}" 
                        onchange="updateTempProfile('weight', Unit.parseVal(this.value, 'weight', '${units.weight}'))" style="width:70px;">
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
                     <label>${t('settings.target_water')} (${Unit.getLabel('water', units.water)})</label>
                     <input type="number" value="${Unit.displayVal(settings.targetWater, 'water', units.water)}" 
                            onchange="updateTempSetting('targetWater', Unit.parseVal(this.value, 'water', '${units.water}'))" style="width:80px;">
                </div>
                <div style="text-align:right; font-size:11px; color:gray; margin-top:-5px; margin-bottom:10px;">
                    Rec: ${Unit.displayVal(recWater, 'water', units.water)}${Unit.getLabel('water', units.water)}
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
             <div class="setting-row">
                <label>${t('settings.lang')}</label>
                <select onchange="window.tempSettingsState.lang = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                    <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>
            
            <!-- V27.1: Unit Preferences (User Request) -->
            <div style="border-top:1px solid #eee; margin:10px 0; padding-top:10px;">
                <div style="font-size:12px; color:gray; margin-bottom:10px; font-weight:700;">${t('settings.unit_pref')}</div>
                
                <div class="setting-row">
                    <label>${t('settings.unit_height')}</label>
                    <select onchange="window.tempSettingsState.settings.units.height = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                        <option value="cm" ${settings.units.height === 'cm' ? 'selected' : ''}>cm</option>
                        <option value="ft" ${settings.units.height === 'ft' ? 'selected' : ''}>ft / in</option>
                    </select>
                </div>
                <div class="setting-row">
                    <label>${t('settings.unit_weight')}</label>
                    <select onchange="window.tempSettingsState.settings.units.weight = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                        <option value="kg" ${settings.units.weight === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="lb" ${settings.units.weight === 'lb' ? 'selected' : ''}>lb</option>
                    </select>
                </div>
                <div class="setting-row">
                    <label>${t('settings.unit_workout')}</label>
                    <select onchange="window.tempSettingsState.settings.units.workout = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                        <option value="kg" ${settings.units.workout === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="lb" ${settings.units.workout === 'lb' ? 'selected' : ''}>lb</option>
                    </select>
                </div>
                <div class="setting-row">
                    <label>${t('settings.unit_food')}</label>
                    <select onchange="window.tempSettingsState.settings.units.food = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                        <option value="g" ${settings.units.food === 'g' ? 'selected' : ''}>g</option>
                        <option value="oz" ${settings.units.food === 'oz' ? 'selected' : ''}>oz</option>
                    </select>
                </div>
                 <div class="setting-row" style="border-bottom:none;">
                    <label>${t('settings.unit_water')}</label>
                    <select onchange="window.tempSettingsState.settings.units.water = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                        <option value="ml" ${settings.units.water === 'ml' ? 'selected' : ''}>ml</option>
                        <option value="oz" ${settings.units.water === 'oz' ? 'selected' : ''}>fl oz</option>
                    </select>
                </div>
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

window.updateHeightFromFtIn = (ft, inch) => {
    const f = parseFloat(ft) || 0;
    const i = parseFloat(inch) || 0;
    const totalCm = ((f * 12) + i) * 2.54;
    window.tempSettingsState.profile.height = Math.round(totalCm);
    // No re-render needed while typing, but state is updated
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

    // V27: CRITICAL - Capture OLD settings BEFORE overwriting for baseline
    const oldSettings = Store.get('user_settings', {});
    const history = Store.get('goal_history', []);

    // Now save new settings
    Store.set('user_profile', profile);
    Store.set('user_settings', settings);
    Store.set('app_lang', lang);

    // V27: Goal History - Time-Series Goal Tracking (FIXED FORMAT)
    // FIX: Use Local Time instead of UTC to avoid timezone issues (e.g., KST vs UTC)
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const today = new Date(d.getTime() - offset).toISOString().split('T')[0];

    // V27.2: Ensure Baseline Exists (Robust)
    // Check if we have a baseline entry (dated far in the past)
    const baselineDate = '2020-01-01';
    const hasBaseline = history.some(h => h.date === baselineDate);

    if (!hasBaseline) {
        // Use OLD settings captured before overwrite (Line 2571)
        const baselineSnapshot = {
            date: baselineDate, // Far past date to cover all historical data
            goals: {
                targetCal: oldSettings.targetCal || 2000,
                targetPro: oldSettings.targetPro || 100,
                targetCarb: oldSettings.targetCarb || 250,
                targetFat: oldSettings.targetFat || 67,
                targetWater: oldSettings.targetWater || 2000,
                targetSodium: oldSettings.targetSodium || 2000
            }
        };

        history.push(baselineSnapshot);
        console.log("✅ DEBUG: Baseline Created for 2020-01-01 with Cal:", baselineSnapshot.goals.targetCal);
    } else {
        console.log("ℹ️ DEBUG: Baseline already exists");
    }

    // Remove existing entry for today (update instead of duplicate)
    const filteredHistory = history.filter(h => h.date !== today);

    // Create snapshot of NEW goals for today with .goals nested object
    const snapshot = {
        date: today,
        goals: {
            targetCal: settings.targetCal || 2000,
            targetPro: settings.targetPro || 100,
            targetCarb: settings.targetCarb || 250,
            targetFat: settings.targetFat || 67,
            targetWater: settings.targetWater || 2000,
            targetSodium: settings.targetSodium || 2000,
            goalType: settings.goalType || 'maint' // Capture goal type
        }
    };

    console.log(`✅ DEBUG: Saved Goal for ${today}:`, snapshot.goals.targetCal);

    filteredHistory.push(snapshot);

    // Sort by date descending (most recent first)
    filteredHistory.sort((a, b) => b.date.localeCompare(a.date));

    Store.set('goal_history', filteredHistory);

    alert('설정이 저장되었습니다.');

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
    const today = new Date().toISOString().split('T')[0];

    // V26.1: Get existing data for today
    const history = Store.get('body_history', []);
    const existing = history.find(h => h.date === today);

    // V27.1: Unit-aware input
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wUnit = Unit.getLabel('weight', units.weight);

    // Waist Unit Logic (follows height: ft->in, cm->cm)
    const waistUnit = units.height === 'ft' ? 'in' : 'cm';
    const displayWaist = (val) => {
        if (!val) return '';
        return waistUnit === 'in' ? (val / 2.54).toFixed(1) : val;
    };

    const displayWeight = (val) => Unit.displayVal(val, 'weight', units.weight);

    modal.innerHTML = `
        <div style="padding:10px;">
            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">날짜</label>
                <input type="date" id="bodyDate" value="${today}" onchange="window.updateBodyModalData()" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px; font-family:inherit;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                <div>
                    <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">체중 (${wUnit})</label>
                    <input type="number" id="bodyWeight" placeholder="0.0" value="${displayWeight(existing?.weight)}" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px; font-size:16px;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">허리둘레 (${waistUnit})</label>
                    <input type="number" id="bodyWaist" placeholder="선택" value="${displayWaist(existing?.waist)}" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px;">
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                <div>
                     <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">골격근량 (${wUnit})</label>
                     <input type="number" id="bodyMuscle" placeholder="선택" value="${displayWeight(existing?.muscle)}" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px;">
                </div>
                 <div>
                     <label style="display:block; font-size:12px; color:gray; margin-bottom:5px;">체지방률 (%)</label>
                     <input type="number" id="bodyFat" placeholder="선택" value="${existing?.fat || ''}" style="width:100%; padding:10px; border:1px solid #eee; border-radius:10px;">
                </div>
            </div>
            <button onclick="saveBodyLog()" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-weight:700;">저장하기</button>
        </div>
    `;
};

// V26.1: Update modal data when date changes
window.updateBodyModalData = () => {
    const dateInput = document.getElementById('bodyDate').value;
    const history = Store.get('body_history', []);
    const existing = history.find(h => h.date === dateInput);

    // V27.1: Unit Display Logic
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const displayWeight = (val) => Unit.displayVal(val, 'weight', units.weight);
    const displayWaist = (val) => {
        if (!val) return '';
        return units.height === 'ft' ? (val / 2.54).toFixed(1) : val;
    };

    if (existing) {
        document.getElementById('bodyWeight').value = displayWeight(existing.weight) || '';
        document.getElementById('bodyWaist').value = displayWaist(existing.waist) || '';
        document.getElementById('bodyMuscle').value = displayWeight(existing.muscle) || '';
        document.getElementById('bodyFat').value = existing.fat || '';
    } else {
        document.getElementById('bodyWeight').value = '';
        document.getElementById('bodyWaist').value = '';
        document.getElementById('bodyMuscle').value = '';
        document.getElementById('bodyFat').value = '';
    }
};

window.saveBodyLog = () => {
    const dateInput = document.getElementById('bodyDate').value;
    const wInput = document.getElementById('bodyWeight').value;
    const mInput = document.getElementById('bodyMuscle').value;
    const waistInput = document.getElementById('bodyWaist').value;
    const fat = parseFloat(document.getElementById('bodyFat').value);

    // V27.1: Parse Units
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const weight = Unit.parseVal(wInput, 'weight', units.weight);
    const muscle = Unit.parseVal(mInput, 'weight', units.weight);

    // Waist Logic
    let waist = parseFloat(waistInput);
    if (!isNaN(waist) && units.height === 'ft') { // If display was in inches
        waist = waist * 2.54;
    }

    if (!weight) { alert('체중을 입력해주세요.'); return; }

    const history = Store.get('body_history', []);
    const existingIdx = history.findIndex(h => h.date === dateInput);
    const entry = {
        date: dateInput,
        weight,
        muscle: isNaN(muscle) ? null : muscle,
        fat: isNaN(fat) ? null : fat,
        waist: isNaN(waist) ? null : waist
    };

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
// End of duplicated function removal

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

function renderWeightBMIBox(weight, bmi, unit, isActive) {
    const bg = isActive ? 'var(--ios-blue)' : '#f9f9f9';
    const color = isActive ? 'white' : '#333';
    const subColor = isActive ? 'rgba(255,255,255,0.8)' : 'gray';

    return `
        <div onclick="switchBodyChart('weight')" style="background:${bg}; padding:12px 2px; border-radius:12px; text-align:center; cursor:pointer; transition:all 0.2s;">
            <div style="font-size:11px; color:${subColor}; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t('body.weight')} (BMI)</div>
            <div style="font-size:15px; font-weight:700; color:${color};">${weight}<span style="font-size:11px; font-weight:400; margin-left:2px;">${unit}</span></div>
            <div style="font-size:12px; color:${isActive ? 'rgba(255,255,255,0.9)' : '#555'}; font-weight:600; margin-top:2px;">(${bmi})</div>
        </div>
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

// Helper: Get Volume History (Last N Days)
// V27: Activity Volume Chart Implementation
function getVolumeHistory(days) {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);

        // FIX: Ensure consistent date formatting (YYYY. M. D.)
        const dateStr = d.toLocaleDateString('ko-KR');
        const logKey = `workout_${dateStr}`;
        const logs = Store.get(logKey, {});

        let vol = 0;
        if (logs) {
            Object.keys(logs).forEach(name => {
                // Check if cardio
                if (window.CARDIO_DB && window.CARDIO_DB[name]) return;

                // Sum volume (wt * reps)
                const sets = logs[name] || [];
                sets.forEach(l => {
                    vol += (parseFloat(l.wt || 0) * parseFloat(l.reps || 0));
                });
            });
        }

        data.push({ date: dateStr, val: vol, day: d.getDate() });
    }
    return data;
}

// Helper: Draw Volume Chart (Bar Chart)
function drawVolumeChart(days) {
    const data = getVolumeHistory(days);

    // V27.1: Unit-aware Volume
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const isLb = units.workout === 'lb';
    const scaleFactor = isLb ? 2.20462 : 1;
    const unitLabel = isLb ? 'lb' : 'kg';

    const maxVal = Math.max(...data.map(d => d.val * scaleFactor), 100); // Min scale 100
    const scale = maxVal > 0 ? (60 / maxVal) : 0; // Max height 60px

    const bars = data.map((d, i) => {
        const val = d.val * scaleFactor;
        const h = val * scale;
        const x = (i * (100 / days));
        const w = (100 / days) * 0.7; // Bar width (70% of slot)
        const gap = (100 / days) * 0.15;
        const color = d.val > 0 ? 'var(--ios-blue)' : '#eee';

        // Simplify x-axis labels (show every 5 days or first/last)
        const showLabel = (i % 5 === 0) || (i === days - 1);
        const label = showLabel ? `<text x="${x + gap + w / 2}" y="78" font-size="3" text-anchor="middle" fill="gray">${d.day}</text>` : '';

        return `
            <rect x="${x + gap}" y="${70 - h}" width="${w}" height="${h}" fill="${color}" rx="0.5" />
            ${label}
        `;
    }).join('');

    return `
        <div style="background:white; border-radius:12px; padding:10px; border:1px solid #eee;">
            <div style="font-size:12px; color:gray; text-align:right; margin-bottom:5px;">Max: ${Math.round(maxVal).toLocaleString()} ${unitLabel}</div>
            <svg viewBox="0 0 100 85" style="width:100%; height:120px; overflow:visible;">
                <!-- Baseline -->
                <line x1="0" y1="70" x2="100" y2="70" stroke="#eee" stroke-width="0.5" />
                ${bars}
            </svg>
        </div>
    `;
}

window.renderMyBodyView = (container) => {
    container.innerHTML = '';

    const profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    const userName = Store.get('user_name', 'User');
    const history = Store.get('body_history', []);
    const latest = history.length > 0 ? history[history.length - 1] : { weight: profile.weight };

    const weight = latest.weight || profile.weight || 0;
    const heightM = (profile.height || 170) / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    // V27.1: Unit Display Logic
    const units = Store.get('user_settings', {}).units || Unit.defaults;

    const displayWeight = Unit.displayVal(weight, 'weight', units.weight);
    const displayMuscle = latest.muscle ? Unit.displayVal(latest.muscle, 'weight', units.weight) : '-';

    // Waist Unit Logic (cm vs in)
    const isFt = units.height === 'ft';
    const displayWaist = latest.waist ? (isFt ? (latest.waist / 2.54).toFixed(1) : latest.waist) : '-';
    const waistUnit = isFt ? 'in' : 'cm';
    const weightUnit = Unit.getLabel('weight', units.weight);

    const muscle = latest.muscle ? latest.muscle : '-';
    const fat = latest.fat ? latest.fat : '-';
    const waist = latest.waist ? latest.waist : '-';

    // 2. Header (Restored with Settings, NO Title)
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
        <div style="font-size:20px; font-weight:800; color:#222;">
            <button onclick="openProfileSettings()" style="background:none; border:none; padding:0; font-size:20px; font-weight:800; color:#222; cursor:pointer;">
                ${userName} <i data-lucide="chevron-down" style="width:16px; height:16px; color:#888; vertical-align:middle;"></i>
            </button>
        </div> 
        <div style="display:flex; align-items:center; gap:8px;">
            <!-- Date Nav Removed for Body View -->
        </div>
        <div style="text-align:right;">
             <button onclick="openSettings()" style="background:none; border:none; color:#333; cursor:pointer;"><i data-lucide="settings" style="width:24px;"></i></button>
        </div>
    `;
    container.appendChild(header);

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.height = '80px';
    spacer.style.marginBottom = '20px';
    container.appendChild(spacer);

    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.paddingBottom = '100px';

    const currentChart = window.activeBodyChart;
    const currentRange = window.activeBodyChartRange;
    const titles = { weight: '\uccb4\uc911 (BMI)', bmi: 'BMI', muscle: '\uadfc\uc721\ub7c9', fat: '\uccb4\uc9c0\ubc29', waist: '\ud5c8\ub9ac\ub458\ub808' };

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

    // V27.4: Standardized Headers (20px, 800 weight)
    const measureCard = document.createElement('div');
    measureCard.className = 'card';
    measureCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0; font-size:20px; font-weight:800; color:#222;">${t('body.measurements')}</h3>
            <button onclick="openLogBodyModal()" style="font-size:13px; color:var(--ios-blue); background:rgba(0,122,255,0.1); border:none; padding:6px 12px; border-radius:14px; font-weight:600;">${t('body.log_data')}</button>
        </div>
        <!-- V26: 4-Box Grid with Muscle Restored -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px; margin-bottom:20px;">
            ${renderWeightBMIBox(displayWeight, bmi, weightUnit, currentChart === 'weight')}
            ${renderStatBox('waist', t('body.waist'), displayWaist, waistUnit, currentChart)}
            ${renderStatBox('muscle', t('body.muscle'), displayMuscle, weightUnit, currentChart)}
            ${renderStatBox('fat', t('body.fat'), fat, '%', currentChart)}
        </div>
        
        <div style="background:#fff; border-radius:12px; margin-top:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 style="margin:0; font-size:13px; color:gray;">${t('body.' + currentChart)}</h4>
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

    // V27.3: Monthly Heatmap (Heatmap)
    if (window.renderMonthlyHeatmap) {
        const heatmapContainer = document.createElement('div');
        heatmapContainer.innerHTML = window.renderMonthlyHeatmap();
        content.appendChild(heatmapContainer);
    }

    // Activity Placeholder
    const statsCard = document.createElement('div');
    statsCard.className = 'card';
    statsCard.style.marginTop = '20px';
    statsCard.innerHTML = `
       <h3 style="margin:0 0 15px 0; font-size:20px; font-weight:800; color:#222;">Activity Volume (Last 30 Days)</h3>
       ${drawVolumeChart(30)}
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

    // Determine slice count based on range (but filter by date for accuracy?)
    // "7D", "30D", "90D" usually means "Last X Days from Today"
    const today = new Date();
    let daysBack = 7;
    if (range === '30D') daysBack = 30;
    if (range === '90D') daysBack = 90;

    // Filter history by date range first
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - daysBack);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const filteredHistory = history.filter(h => h.date >= cutoffStr);

    // V27.1: Unit-aware Trend
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const isFt = units.height === 'ft';

    let data = filteredHistory.map(h => {
        let val = 0;
        if (type === 'weight') val = parseFloat(Unit.displayVal(h.weight, 'weight', units.weight));
        if (type === 'muscle') val = parseFloat(Unit.displayVal(h.muscle, 'weight', units.weight));
        if (type === 'fat') val = parseFloat(h.fat);
        if (type === 'waist') val = h.waist ? (isFt ? h.waist / 2.54 : h.waist) : 0; // Fix Waist Logic
        if (type === 'bmi') {
            const hM = (heightCm || 170) / 100;
            if (h.weight > 0) val = h.weight / (hM * hM);
        }
        return { date: h.date, val: isNaN(val) ? 0 : val };
    }).filter(d => d.val > 0);

    if (data.length < 2) {
        // Fallback if filtered data is empty but we have history? 
        // Or just show "No data in range".
        return `<div style="height:120px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:12px; background:#f9f9f9; border-radius:12px;">
                    No recent data (${range})
                </div>`;
    }

    // 1. Calculate Min/Max for Y-Axis
    let minVal = Math.min(...data.map(d => d.val));
    let maxVal = Math.max(...data.map(d => d.val));

    // Find Min/Max Data Points (for labelling)
    let minPointIndex = 0;
    let maxPointIndex = 0;
    data.forEach((d, i) => {
        if (d.val === minVal) minPointIndex = i;
        if (d.val === maxVal) maxPointIndex = i;
    });

    const padding = (maxVal - minVal) * 0.1 || 0.1;
    minVal -= padding;
    maxVal += padding;
    const rangeVal = maxVal - minVal || 1;

    // 2. Linear Time Scale for X-Axis
    // Convert dates to timestamps
    const timePoints = data.map(d => new Date(d.date).getTime());
    const startTime = timePoints[0];
    const endTime = timePoints[timePoints.length - 1];
    const timeRange = endTime - startTime || 1;

    const width = 100;
    const height = 50;

    const getX = (t) => ((t - startTime) / timeRange) * width;
    const getY = (v) => height - ((v - minVal) / rangeVal) * height;

    const points = data.map((d, i) => {
        const t = timePoints[i];
        const x = getX(t);
        const y = getY(d.val);
        return `${x},${y}`;
    }).join(' ');

    // 3. Sparse Labels (Start, End, Min, Max Only)
    // Avoid overlap priority: Start/End > Min/Max
    const labelIndices = new Set([0, data.length - 1]);

    // Add Min/Max only if not start/end (or explicitly handled)
    // We will render circles for ALL, but text only for these
    const importantIndices = [0, data.length - 1];
    if (minPointIndex !== 0 && minPointIndex !== data.length - 1) importantIndices.push(minPointIndex);
    if (maxPointIndex !== 0 && maxPointIndex !== data.length - 1) importantIndices.push(maxPointIndex);

    const labels = data.map((d, i) => {
        const t = new Date(d.date).getTime();
        const x = getX(t);
        const y = getY(d.val);

        let shouldShowText = importantIndices.includes(i);

        // Render
        const displayVal = Math.round(d.val * 10) / 10;

        // X-Axis Date Label: Only Start and End
        let dateLabel = '';
        if (i === 0 || i === data.length - 1) {
            const dateShort = d.date.slice(5).replace('-', '/');
            // Align text: Start -> Start, End -> End
            const anchor = i === 0 ? 'start' : 'end';
            dateLabel = `<text x="${x}" y="${65}" font-size="3.5" text-anchor="${anchor}" fill="#999" font-weight="600">${dateShort}</text>`;
        }

        // Data Point Label
        let valLabel = '';
        if (shouldShowText) {
            valLabel = `<text x="${x}" y="${y - 5}" font-size="3.5" text-anchor="middle" fill="#333" font-weight="bold">${displayVal}</text>`;
        }

        return `
            <circle cx="${x}" cy="${y}" r="${shouldShowText ? 2 : 1.5}" fill="${shouldShowText ? 'var(--ios-blue)' : '#ccc'}" />
            ${valLabel}
            ${dateLabel}
        `;
    }).join('');

    return `
        <svg viewBox="-5 -10 110 85" style="width:100%; height:180px; overflow:visible;">
            <polyline fill="none" stroke="var(--ios-blue)" stroke-width="1.5" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>
            ${labels}
        </svg>
    `;
}

// --- V24 Fix: Food Menu UI (Append) ---

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

// (Duplicate drawTrendChart removed - using V27 implementation)


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
    const modal = createModal(t('buttons.add_food') || '음식 추가');
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
            const cleanKey = key.split(' (')[0];
            return `<div onclick="selectFoodItem('${key}')" style="padding:12px 0; border-bottom:1px solid #f5f5f5; cursor:pointer; display:flex; justify-content:space-between; align-items:center;"><div style="font-weight:500; font-size:15px; color:#333;">${cleanKey}<div style="font-size:11px; color:#999; margin-top:2px;">${item.category || '기타'}</div></div><div style="font-size:12px; color:gray;">${displayUnit}</div></div>`;
        }).join('');
        body.innerHTML = `<div style="padding:0 5px 10px 5px;"><input type="text" value="${state.term}" oninput="window.updateSelectorSearch(this.value)" placeholder="Search food..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:10px; font-family:inherit; font-size:16px;"><div style="overflow-x:auto; white-space:nowrap; margin-bottom:10px; padding-bottom:5px;">${tabsHtml}</div><div style="height:50vh; overflow-y:auto; border-top:1px solid #eee;">${matched.length === 0 ? '<div style="padding:30px; text-align:center; color:gray;">No results found</div>' : listHtml}${resultCount > 50 ? `<div style="padding:10px; text-align:center; color:gray; font-size:12px;">Top 50 of ${resultCount}</div>` : ''}</div></div>`;
        if (!state.term) setTimeout(() => { const input = body.querySelector('input'); if (input) input.focus(); }, 50);
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
    modal.style.zIndex = '3200';

    modal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:24px; width:85%; max-width:340px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
            <h3 style="margin:0 0 5px 0; font-size:18px;">${key.split(' (')[0]}</h3>
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
                <button onclick="document.getElementById('food-smart-modal').remove()" style="padding:15px; background:#f0f0f5; color:gray; border:none; border-radius:12px; font-weight:600;">${t('buttons.cancel')}</button>
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

// --- V27.3: Monthly Heatmap Logic ---

// --- V27.3: Monthly Heatmap Logic (V4: 5 Levels, Cardio, refined Design) ---
window.getMonthlyWorkoutStatus = (year, month) => {
    // month is 1-12
    const daysInMonth = new Date(year, month, 0).getDate();
    const result = {};

    for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = String(d).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');

        // V27: Support both ISO and Korean formats due to legacy data
        const dateKeyISO = `${year}-${monthStr}-${dayStr}`;
        const dateKeyKR = `${year}. ${month}. ${d}.`;

        let logs = Store.get(`workout_${dateKeyISO}`);
        if (!logs || Object.keys(logs).length === 0) {
            logs = Store.get(`workout_${dateKeyKR}`, {});
        }

        // Calculate Intensity
        let setCounts = 0;
        let cardioMins = 0;
        let hasLogs = false;

        Object.keys(logs).forEach(ex => {
            if (ex === 'cardio') {
                // Cardio object: { "Running": 30, "Cycling": 20 }
                const cLogs = logs[ex];
                if (cLogs && typeof cLogs === 'object') {
                    Object.values(cLogs).forEach(min => cardioMins += (parseInt(min) || 0));
                }
            } else if (Array.isArray(logs[ex])) {
                setCounts += logs[ex].length;
            }
        });

        if (setCounts > 0 || cardioMins > 0) hasLogs = true;

        // V4 Score Logic (5 Levels)
        // 0: None
        // 1: 1-3 sets OR >10min Cardio (Light)
        // 2: 4-6 sets
        // 3: 7-9 sets
        // 4: 10-14 sets
        // 5: 15+ sets (Darkest)

        let score = 0;
        if (hasLogs) {
            if (setCounts >= 15) score = 5;
            else if (setCounts >= 10) score = 4;
            else if (setCounts >= 7) score = 3;
            else if (setCounts >= 4) score = 2;
            else if (setCounts >= 1 || cardioMins >= 10) score = 1;
        }

        result[d] = score;
    }
    return result;
};


// --- V27.3: Monthly Heatmap Logic (V7: Blue Theme, GitHub Style) ---
window.changeHeatmapMonth = (offset) => {
    if (!window.heatmapTargetDate) {
        let d = new Date();
        if (state.date.includes('-')) d = new Date(state.date);
        else if (state.date.includes('.')) {
            const p = state.date.split('.').map(s => s.trim());
            d = new Date(p[0], p[1] - 1, p[2]);
        }
        window.heatmapTargetDate = d;
    }
    const newDate = new Date(window.heatmapTargetDate);
    newDate.setMonth(newDate.getMonth() + offset);
    window.heatmapTargetDate = newDate;
    render();
};

window.renderMonthlyHeatmap = () => {
    if (!window.heatmapTargetDate) {
        let d = new Date();
        if (state.date.includes('-')) d = new Date(state.date);
        else if (state.date.includes('.')) {
            const p = state.date.split('.').map(s => s.trim());
            d = new Date(p[0], p[1] - 1, p[2]);
        }
        window.heatmapTargetDate = d;
    }

    const targetDate = window.heatmapTargetDate;
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    const statusMap = getMonthlyWorkoutStatus(year, month);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayDow = new Date(year, month - 1, 1).getDay();
    const lastDayDow = new Date(year, month - 1, daysInMonth).getDay();

    const prevMonthDays = [];
    const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
    for (let i = 0; i < firstDayDow; i++) prevMonthDays.unshift(prevMonthLastDate - i);

    const nextMonthDays = [];
    for (let i = 1; i < (7 - lastDayDow); i++) nextMonthDays.push(i);

    // Header V6/V7: Simplified
    const headerHtml = `
        <div style="margin-bottom:15px;">
             <div style="font-size:20px; font-weight:800; color:#222; margin-bottom:10px;">${t('body.workout_consistency') || 'Workout Consistency'}</div>
             <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <button onclick="changeHeatmapMonth(-1)" style="border:none; background:none; font-size:18px; color:#555; cursor:pointer; padding:5px 10px;">&#9664;</button>
                <div style="font-size:16px; font-weight:700; color:#333;">${year}. ${month}</div>
                <button onclick="changeHeatmapMonth(1)" style="border:none; background:none; font-size:18px; color:#555; cursor:pointer; padding:5px 10px;">&#9654;</button>
            </div>
        </div>
    `;

    let gridHtml = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center;">';

    // Label Contrast Boost
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, i) => {
        const color = i === 0 ? '#ff5252' : '#555'; // Darker Gray (#555) for contrast
        gridHtml += `<div style="font-size:11px; font-weight:700; color:${color}; margin-bottom:5px;">${d}</div>`;
    });

    const renderCell = (day, isCurrentMonth, statusScore, dateStr) => {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const isFuture = dateStr > todayStr;

        // V7 Blue Scale
        // L1-L2: Dark Text, L3-L5: White Text
        const colors = {
            0: '#ebedf0', // Empty
            1: '#d1e8ff', // Very Light Blue
            2: '#8ec5fc', // Light Blue
            3: '#409cff', // Medium Blue
            4: '#007aff', // Primary Blue
            5: '#004494'  // Dark Blue
        };

        const score = (!isCurrentMonth && statusScore === 0) ? 0 : (statusScore || 0);

        // Background
        let bg = colors[0];
        if (score > 0 && !isFuture) bg = colors[score] || colors[1];

        // Text Color
        let text = '#333';
        if (!isCurrentMonth) text = '#ccc';

        if (score >= 3 && !isFuture) text = 'white';
        else if (score > 0 && !isFuture) text = '#222';

        // Today Style: Border only (Dark Gray #555), No font/size change
        let weight = '500'; // Standard weight
        let size = '13px'; // Standard size

        // Adjust size/line-height for border to not break layout? 
        // Box-sizing border-box handles it usually, but let's check.
        // If border is added, size might jump. Ideally use outline or box-shadow for no layout shift.
        // But user asked for "Outline/Border".
        // Let's use `box-shadow: inset 0 0 0 2px #555` to prevent layout shift.

        let tileStyle = `
            width:100%; height:100%; 
            background:${bg}; 
            border-radius:4px; 
            display:flex; align-items:center; justify-content:center;
            color:${text}; font-size:${size}; font-weight:${weight};
        `;

        if (isToday) {
            tileStyle += `box-shadow: inset 0 0 0 2px #555;`; // Inner border
        }

        return `
            <div onclick="window.confirmDateSwitch('${dateStr}')" style="aspect-ratio:1; cursor:pointer;">
                <div style="${tileStyle}">
                    ${day}
                </div>
            </div>
        `;
    };

    // Prev Month
    prevMonthDays.forEach(d => {
        let pm = month - 1;
        let py = year;
        if (pm < 1) { pm = 12; py--; }
        const pDateStr = `${py}-${String(pm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const prevStatus = getMonthlyWorkoutStatus(py, pm);
        gridHtml += renderCell(d, false, prevStatus[d], pDateStr);
    });

    // Current Month
    for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = String(d).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        gridHtml += renderCell(d, true, statusMap[d], dateStr);
    }

    // Next Month
    nextMonthDays.forEach(d => {
        let nm = month + 1;
        let ny = year;
        if (nm > 12) { nm = 1; ny++; }
        const nDateStr = `${ny}-${String(nm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const nextStatus = getMonthlyWorkoutStatus(ny, nm);
        gridHtml += renderCell(d, false, nextStatus[d], nDateStr);
    });

    gridHtml += '</div>';

    return `
        <div class="card" style="margin-top:20px; padding:15px;">
            ${headerHtml}
            ${gridHtml}
        </div>
    `;
};

window.confirmDateSwitch = (dateStr) => {
    state.date = normalizeDate(dateStr);
    Store.set('state', state);
    state.view = 'workout';
    render();
};

// Global: Profile Settings (Quick Edit)
window.openProfileSettings = () => {
    const currentName = Store.get('user_name', 'User');
    const newName = prompt(t('settings.enter_name'), currentName);
    if (newName && newName.trim()) {
        Store.set('user_name', newName.trim());
        render(); // Re-render to update header
    }
};

// Self-Healing: Remove stuck overlays on load
try {
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    console.log("[System] Cleaned up stale overlays");
} catch (e) { console.error(e); }

// WATER MODAL EMERGENCY OVERRIDE
window.openWaterModal = (editId = null) => {
    try {
        console.log("=== FORCE OPEN WATER MODAL ===");
        console.log("Edit ID:", editId);

        if (!editId && window.isFutureDate && window.isFutureDate(state.date)) {
            alert(t('workout.future_date_warning'));
            return;
        }

        const modal = createModal(t('diet.log_water_title') || "Log Water");
        if (modal) modal.style.zIndex = "4000"; // Trigger Z-Index Force

        const units = Store.get('user_settings', {}).units || Unit.defaults;
        const isOz = units.water === 'oz';
        const label = isOz ? 'fl oz' : 'ml';
        const p1Label = isOz ? '+8 fl oz' : '+200ml';
        const p1Val = isOz ? 237 : 200;
        const p2Label = isOz ? '+16 fl oz' : '+500ml';
        const p2Val = isOz ? 473 : 500;
        let customAmount = isOz ? 8 : 250;

        let isEdit = !!editId;
        if (isEdit) {
            const key = `diet_${state.date} `; // Legacy Key
            const saved = Store.get(key, { meals: [], water: 0 });
            console.log("Searching in key:", key);
            const entry = saved.meals.find(m => m.id == editId); // Loose equality
            console.log("Found Entry:", entry);
            if (entry) {
                if (isOz) customAmount = Math.round(Unit.displayVal(entry.amount, 'water', 'oz'));
                else customAmount = entry.amount;
            }
        }

        modal.innerHTML = `
        <div style="background:white; padding:10px; border-radius:24px; width:100%; text-align:center;">
                <i data-lucide="droplet" style="width:40px; height:40px; color:#5AC8FA; margin-bottom:10px;"></i>
                
                ${!isEdit ? `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                    <button type="button" onclick="logWaterAndClose(${p1Val})" style="padding:15px; background:#f2f4f7; border:none; border-radius:12px; font-weight:600; color:#5AC8FA;">${p1Label}</button>
                    <button type="button" onclick="logWaterAndClose(${p2Val})" style="padding:15px; background:#f2f4f7; border:none; border-radius:12px; font-weight:600; color:#5AC8FA;">${p2Label}</button>
                </div>` : ''}
                
                <div style="margin-bottom:15px;">
                    <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">${t('diet.custom_amount')} (${label})</label>
                    <input type="number" id="customWaterInput" value="${customAmount}" style="width:100%; padding:12px; border:2px solid #5AC8FA; border-radius:12px; text-align:center; font-size:18px; font-weight:700;">
                </div>
                
                <div style="display:flex; gap:10px;">
                    ${isEdit ? `<button onclick="deleteWaterLog(${editId})" style="flex:2; padding:15px; background:white; border:1px solid var(--ios-red); color:var(--ios-red); border-radius:12px; font-weight:700;">${t('workout.delete_log')}</button>` : ''}
                    <button type="button" onclick="logCustomWater(${editId})" style="flex:3; padding:15px; background:#5AC8FA; color:white; border:none; border-radius:12px; font-weight:700;">${isEdit ? t('workout.update') : t('diet.log_button')}</button>
                </div>
                <button type="button" onclick="closeModal()" style="margin-top:10px; background:none; border:none; color:gray;">${t('buttons.cancel')}</button>
            </div>
        `;
        if (window.lucide) lucide.createIcons();

        const input = document.getElementById('customWaterInput');
        if (input) input.oninput = (e) => { customAmount = parseFloat(e.target.value) || 0; };

    } catch (e) {
        console.error("WATER MODAL ERROR:", e);
        alert("Error: " + e.message);
    }
};
window.openWaterEditor = window.openWaterModal;

// --- GLOBAL WATER HELPERS (MUST BE GLOBAL FOR ONCLICK) ---

window.logWaterAndClose = (amount) => {
    logWaterToTimeline(amount);
    closeModal();
};

window.logCustomWater = (updateId = null) => {
    const input = document.getElementById('customWaterInput');
    // Default to existing customAmount logic if input undefined, but here we can just read input
    // We need to re-parse the amount or use the logic from openWaterModal
    // Simpler: Just read the input value or recreate the logic.

    // NOTE: We need access to unit settings here.
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    let val = parseFloat(input?.value);

    // If input is empty (or just touched), maybe we need the current value?
    // Let's rely on input value.
    if (!val || isNaN(val)) {
        alert("Please enter an amount");
        return;
    }

    const ml = Unit.parseVal(val, 'water', units.water);
    logWaterToTimeline(ml, updateId);
    closeModal();
};

window.deleteWaterLog = (id) => {
    if (!confirm(t('workout.delete_log') + '?')) return;
    const key = `diet_${state.date} `; // Legacy Key
    const saved = Store.get(key, { meals: [], water: 0 });

    const idx = saved.meals.findIndex(m => m.id == id); // Loose equality
    if (idx !== -1) {
        const entry = saved.meals[idx];
        saved.water = Math.max(0, (saved.water || 0) - entry.amount);
        saved.meals.splice(idx, 1);
        Store.set(key, saved);
        render();
        closeModal();
    }
};
