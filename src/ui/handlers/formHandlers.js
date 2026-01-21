import { parseImportPayload } from '../../services/backupService.js';
import { addGoalTimelineEntry } from '../../services/goals/goalService.js';
import { computeBaseTargets } from '../../services/nutrition/targetEngine.js';
import { calcAge, parseDateInput, todayIso } from '../../utils/date.js';
import { updateUserDb } from '../store/userDb.js';
import { createWorkoutLog } from '../workout/workoutLogUtils.js';
import { fromDisplayHeight, fromDisplayWeight } from '../../utils/units.js';
import { buildGoalModeSpec } from '../goals/goalUtils.js';
import { showStatusBanner } from '../components/StatusBanner.js';

export const handleDietAddSubmit = (store, event, form) => {
    event.preventDefault();
    const nameInput = form.querySelector('[name="mealName"]');
    const typeSelect = form.querySelector('[name="mealType"]');
    const name = nameInput ? nameInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : '기타';

    if (!name) return;

    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.diet;
        const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
        entry.meals = entry.meals.concat({
            id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            type,
            name
        });
        userdb.diet[dateKey] = entry;
        userdb.updatedAt = new Date().toISOString();
    });

    if (nameInput) nameInput.value = '';
};

export const handleWorkoutSubmit = (store, event, form) => {
    event.preventDefault();
    const nameInput = form.querySelector('[name="exerciseName"]');
    const setsInput = form.querySelector('[name="sets"]');
    const repsInput = form.querySelector('[name="reps"]');
    const weightInput = form.querySelector('[name="weight"]');
    const unitSelect = form.querySelector('[name="unit"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const sets = Number(setsInput ? setsInput.value : 0);
    const reps = Number(repsInput ? repsInput.value : 0);
    const settingsUnit = store.getState().settings.units?.workout || 'kg';
    const weight = fromDisplayWeight(Number(weightInput ? weightInput.value : 0), settingsUnit);
    const unit = unitSelect ? unitSelect.value : settingsUnit;

    if (!name || sets <= 0 || reps <= 0) return;

    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
    const nextLog = createWorkoutLog({ name, sets, reps, weight, unit: settingsUnit });
        entry.logs = entry.logs.concat(nextLog);
        userdb.workout[dateKey] = entry;
        userdb.updatedAt = new Date().toISOString();
    });

    if (nameInput) nameInput.value = '';
    if (setsInput) setsInput.value = '';
    if (repsInput) repsInput.value = '';
    if (weightInput) weightInput.value = '';
};

export const handleBodySubmit = (store, event, form) => {
    event.preventDefault();
    const weightInput = form.querySelector('[name="weight"]');
    const waistInput = form.querySelector('[name="waist"]');
    const muscleInput = form.querySelector('[name="muscle"]');
    const fatInput = form.querySelector('[name="fat"]');

    const settings = store.getState().settings;
    const weightUnit = settings.units?.weight || 'kg';
    const heightUnit = settings.units?.height || 'cm';
    const weightRaw = weightInput ? weightInput.value : '';
    const waistRaw = waistInput ? waistInput.value : '';
    const muscleRaw = muscleInput ? muscleInput.value : '';
    const fat = fatInput ? fatInput.value : '';
    const weight = weightRaw === '' ? '' : fromDisplayWeight(Number(weightRaw || 0), weightUnit);
    const waist = waistRaw === '' ? '' : fromDisplayHeight(Number(waistRaw || 0), heightUnit);
    const muscle = muscleRaw === '' ? '' : fromDisplayWeight(Number(muscleRaw || 0), weightUnit);

    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.body;
        userdb.body[dateKey] = {
            weight,
            waist,
            muscle,
            fat
        };
        userdb.updatedAt = new Date().toISOString();
    });
};

export const handleSettingsSubmit = (store, event, form) => {
    event.preventDefault();
    const dateFormat = form.querySelector('[name="dateFormat"]')?.value || 'YMD';
    const dateSync = Boolean(form.querySelector('[name="dateSync"]')?.checked);
    const timeFormat = form.querySelector('[name="timeFormat"]')?.value || 'H24';
    const weightUnit = form.querySelector('[name="weightUnit"]')?.value || 'kg';
    const waterUnit = form.querySelector('[name="waterUnit"]')?.value || 'ml';
    const heightUnit = form.querySelector('[name="heightUnit"]')?.value || 'cm';
    const foodUnit = form.querySelector('[name="foodUnit"]')?.value || 'g';
    const workoutUnit = form.querySelector('[name="workoutUnit"]')?.value || 'kg';
    const soundVolumeRaw = Number(form.querySelector('[name="soundVolume"]')?.value || 100);
    const soundVolume = Number.isNaN(soundVolumeRaw)
        ? store.getState().settings.sound.volume
        : Math.min(100, Math.max(0, soundVolumeRaw));
    const nextTimerSound = soundVolume > 0;
    const profileSex = form.querySelector('[name="profileSex"]')?.value || 'M';
    const profileBirthRaw = form.querySelector('[name="profileBirth"]')?.value || '';
    const profileHeightRaw = form.querySelector('[name="profileHeight"]')?.value || '';
    const profileWeightRaw = form.querySelector('[name="profileWeight"]')?.value || '';
    const profileActivity = form.querySelector('[name="profileActivity"]')?.value || 'light';
    const lang = form.querySelector('[name="lang"]')?.value || 'ko';
    const profileBirth = parseDateInput(profileBirthRaw, dateFormat) || '';
    const profileHeight = profileHeightRaw === ''
        ? ''
        : fromDisplayHeight(Number(profileHeightRaw || 0), heightUnit);
    const profileWeight = profileWeightRaw === ''
        ? ''
        : fromDisplayWeight(Number(profileWeightRaw || 0), weightUnit);
    const nutritionGoal = form.querySelector('[name="nutritionGoal"]')?.value || 'maintain';
    const nutritionFramework = form.querySelector('[name="nutritionFramework"]')?.value || 'dga_2025';
    const exerciseCreditEnabled = Boolean(form.querySelector('[name="exerciseCreditEnabled"]')?.checked);
    const exerciseCreditFactorRaw = Number(form.querySelector('[name="exerciseCreditFactor"]')?.value || 0);
    const exerciseCreditFactor = Math.min(1, Math.max(0, exerciseCreditFactorRaw / 100));
    const exerciseCreditCapRaw = Number(form.querySelector('[name="exerciseCreditCap"]')?.value || 0);
    const exerciseCreditCap = Number.isNaN(exerciseCreditCapRaw) ? 0 : exerciseCreditCapRaw;
    const exerciseCreditDistribution =
        form.querySelector('[name="exerciseCreditDistribution"]')?.value || 'CARB_BIASED';
    const prevSettings = store.getState().settings;

    const nextSettings = {
        ...prevSettings,
        dateFormat,
        dateSync,
        timeFormat,
        lang,
        units: {
            ...store.getState().settings.units,
            weight: weightUnit,
            water: waterUnit,
            height: heightUnit,
            food: foodUnit,
            workout: workoutUnit
        },
        sound: {
            ...store.getState().settings.sound,
            timerEnabled: nextTimerSound,
            volume: soundVolume
        },
        nutrition: {
            ...prevSettings.nutrition,
            goal: nutritionGoal,
            framework: nutritionFramework,
            exerciseCredit: {
                ...prevSettings.nutrition.exerciseCredit,
                enabled: exerciseCreditEnabled,
                factor: exerciseCreditFactor,
                capKcal: exerciseCreditCap,
                distribution: exerciseCreditDistribution
            }
        }
    };

    store.dispatch({ type: 'UPDATE_SETTINGS', payload: nextSettings });
    updateUserDb(store, (nextDb) => {
        nextDb.profile = {
            ...nextDb.profile,
            sex: profileSex,
            birth: profileBirth,
            height_cm: profileHeight,
            weight_kg: profileWeight,
            activity: profileActivity
        };
        const timeline = nextDb.goals?.timeline || [];
        const shouldAddGoal = timeline.length === 0
            || prevSettings.nutrition.goal !== nutritionGoal
            || prevSettings.nutrition.framework !== nutritionFramework;
        if (shouldAddGoal) {
            const age = calcAge(profileBirth);
            const heightCm = Number(profileHeight);
            const weightKg = Number(profileWeight);
            if (age && heightCm && weightKg) {
                const spec = {
                    frameworkId: nutritionFramework,
                    goalMode: buildGoalModeSpec(nutritionGoal)
                };
                const computed = computeBaseTargets({
                    profile: {
                        sex: profileSex,
                        age,
                        heightCm,
                        weightKg,
                        activityFactor: profileActivity
                    },
                    spec,
                    settings: { energyModel: { cutPct: 0.15, bulkPct: 0.1 } }
                });
                if (computed.targets) {
                    const { timeline: nextTimeline } = addGoalTimelineEntry({
                        goals: nextDb.goals,
                        effectiveDate: todayIso(),
                        spec,
                        computed,
                        note: '',
                        nowMs: Date.now()
                    });
                    nextDb.goals.timeline = nextTimeline;
                }
            }
        }
        nextDb.updatedAt = new Date().toISOString();
    });
    showStatusBanner({ message: '설정이 저장되었습니다.', tone: 'success' });
};

export const handleDietWaterChange = (store, actionEl) => {
    const value = Number(actionEl.value || 0);
    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.diet;
        const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
        entry.waterMl = Number.isNaN(value) ? 0 : value;
        userdb.diet[dateKey] = entry;
        userdb.updatedAt = new Date().toISOString();
    });
};

export const handleBackupImportChange = async (store, input) => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
        const payload = await parseImportPayload(file);
        store.dispatch({ type: 'UPDATE_USERDB', payload: payload.userdb });
        store.dispatch({ type: 'UPDATE_SETTINGS', payload: payload.settings });
        showStatusBanner({ message: '복원이 완료되었습니다.', tone: 'success' });
    } catch (error) {
        showStatusBanner({
            message: error.message || '백업 파일을 불러오지 못했습니다.',
            tone: 'error',
            timeoutMs: 3200
        });
    } finally {
        input.value = '';
    }
};
