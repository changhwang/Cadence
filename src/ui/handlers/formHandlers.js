import { parseImportPayload } from '../../services/backupService.js';
import { hydrateSettings, hydrateUserDb } from '../../core/storage.js';
import { addGoalTimelineEntry } from '../../services/goals/goalService.js';
import { DEFAULT_ENERGY_MODEL } from '../../services/nutritionPolicies.js';
import { computeBaseTargets } from '../../services/nutrition/targetEngine.js';
import { calcAge, parseDateInput, todayIso } from '../../utils/date.js';
import { updateUserDb } from '../store/userDb.js';
import { fromDisplayHeight, fromDisplayWeight } from '../../utils/units.js';
import { buildGoalModeSpec } from '../goals/goalUtils.js';
import { showStatusBanner } from '../components/StatusBanner.js';
import { applyTheme, coerceTheme } from '../theme.js';

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
    const profileName = form.querySelector('[name="profileName"]')?.value || '';
    const profileSex = form.querySelector('[name="profileSex"]')?.value || 'M';
    const profileBirthRaw = form.querySelector('[name="profileBirth"]')?.value || '';
    const profileHeightRaw = form.querySelector('[name="profileHeight"]')?.value || '';
    const profileWeightRaw = form.querySelector('[name="profileWeight"]')?.value || '';
    const profileActivity = form.querySelector('[name="profileActivity"]')?.value || 'light';
    const lang = form.querySelector('[name="lang"]')?.value || 'ko';
    const theme = coerceTheme(form.querySelector('[name="theme"]')?.value);
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
    const prevProfile = store.getState().userdb.profile || {};

    const nextSettings = {
        ...prevSettings,
        dateFormat,
        dateSync,
        timeFormat,
        theme,
        lang,
        units: {
            ...prevSettings.units,
            weight: weightUnit,
            water: waterUnit,
            height: heightUnit,
            food: foodUnit,
            workout: workoutUnit
        },
        sound: {
            ...prevSettings.sound,
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

    applyTheme(theme);
    store.dispatch({ type: 'UPDATE_SETTINGS', payload: nextSettings });
    updateUserDb(store, (nextDb) => {
        nextDb.profile = {
            ...nextDb.profile,
            name: profileName.trim(),
            sex: profileSex,
            birth: profileBirth,
            height_cm: profileHeight,
            weight_kg: profileWeight,
            activity: profileActivity
        };
        const timeline = nextDb.goals?.timeline || [];
        // 목표/프레임워크뿐 아니라 목표치를 바꾸는 프로필 값이 변해도 오늘부터 재계산해 기록한다.
        const shouldAddGoal = timeline.length === 0
            || prevSettings.nutrition.goal !== nutritionGoal
            || prevSettings.nutrition.framework !== nutritionFramework
            || String(prevProfile.weight_kg ?? '') !== String(profileWeight)
            || String(prevProfile.height_cm ?? '') !== String(profileHeight)
            || String(prevProfile.birth ?? '') !== String(profileBirth)
            || prevProfile.sex !== profileSex
            || prevProfile.activity !== profileActivity;
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
                    settings: { energyModel: DEFAULT_ENERGY_MODEL }
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
    });
    showStatusBanner({ message: '설정이 저장되었습니다.', tone: 'success' });
};

export const handleBackupImportChange = async (store, input) => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
        const payload = await parseImportPayload(file);
        // 복원 데이터도 로드 경로와 동일하게 기본값 병합 + 마이그레이션을 거친다.
        store.dispatch({ type: 'UPDATE_USERDB', payload: hydrateUserDb(payload.userdb) });
        const restoredSettings = hydrateSettings(payload.settings);
        applyTheme(restoredSettings.theme);
        store.dispatch({ type: 'UPDATE_SETTINGS', payload: restoredSettings });
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
