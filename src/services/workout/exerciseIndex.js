import { EXERCISE_DB } from '../../data/exercises.js';
import { CARDIO_DB } from '../../data/cardio.js';

const normalize = (value) => String(value || '').trim().toLowerCase();

const byId = new Map(EXERCISE_DB.map((item) => [item.id, item]));
const cardioById = new Map(CARDIO_DB.map((item) => [item.id, item]));

const byName = (() => {
    const map = new Map();
    EXERCISE_DB.forEach((item) => {
        [item.labels?.ko, item.labels?.en].forEach((label) => {
            const key = normalize(label);
            if (key && !map.has(key)) map.set(key, item);
        });
    });
    return map;
})();

export const getExerciseById = (id) => byId.get(id) || null;

export const getCardioMetaById = (id) => cardioById.get(id) || null;

// 로그에 exerciseId가 없던 구버전 기록은 이름으로 역매핑한다.
export const resolveExercise = (log) => {
    if (!log) return null;
    if (log.exerciseId) return byId.get(log.exerciseId) || null;
    return byName.get(normalize(log.name)) || null;
};

export const isCardioExercise = (exercise) => {
    if (!exercise) return false;
    if (cardioById.has(exercise.id)) return true;
    if (exercise.classification === 'cardio') return true;
    if (exercise.pattern === 'cardio') return true;
    if (Array.isArray(exercise.equipment) && exercise.equipment.includes('cardio')) return true;
    return false;
};
