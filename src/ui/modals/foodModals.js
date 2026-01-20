import { FOOD_DB } from '../../data/foods.js';
import { el } from '../../utils/dom.js';
import { closeModal, openModal } from '../components/Modal.js';
import { updateUserDb } from '../store/userDb.js';
import { getLabelByLang } from '../utils/labels.js';

export const openFoodSearchModal = (store) => {
    const state = store.getState();
    const lang = state.settings.lang || 'ko';
    const list = el('div', { className: 'list-group' });
    const searchInput = el('input', { type: 'text', placeholder: '음식 검색' });
    const typeSelect = el(
        'select',
        { name: 'mealType' },
        el('option', { value: '아침' }, '아침'),
        el('option', { value: '점심' }, '점심'),
        el('option', { value: '저녁' }, '저녁'),
        el('option', { value: '간식' }, '간식')
    );
    const amountInput = el('input', { type: 'number', min: '0', value: 1, placeholder: '수량' });
    const unitSelect = el(
        'select',
        { name: 'foodAmountUnit' },
        el('option', { value: 'serving' }, '서빙'),
        el('option', { value: 'g' }, '그램(g)')
    );
    const categorySelect = el(
        'select',
        { name: 'foodCategory' },
        el('option', { value: 'all' }, '전체 카테고리'),
        el('option', { value: 'protein' }, '단백질'),
        el('option', { value: 'carb' }, '탄수'),
        el('option', { value: 'fat' }, '지방'),
        el('option', { value: 'fruit' }, '과일'),
        el('option', { value: 'veg' }, '채소'),
        el('option', { value: 'oil' }, '오일/소스'),
        el('option', { value: 'meal' }, '식사'),
        el('option', { value: 'snack' }, '간식')
    );
    const cuisineSelect = el(
        'select',
        { name: 'foodCuisine' },
        el('option', { value: 'all' }, '전체 지역'),
        el('option', { value: 'korean' }, '한식'),
        el('option', { value: 'japanese' }, '일식'),
        el('option', { value: 'chinese' }, '중식'),
        el('option', { value: 'western' }, '양식'),
        el('option', { value: 'global' }, '기타')
    );
    const sortSelect = el(
        'select',
        { name: 'foodSort' },
        el('option', { value: 'name' }, '이름순'),
        el('option', { value: 'kcal' }, '칼로리'),
        el('option', { value: 'protein' }, '단백질'),
        el('option', { value: 'fiber' }, '식이섬유')
    );

    const renderList = (query = '') => {
        const lowered = query.trim().toLowerCase();
        const category = categorySelect.value;
        const cuisine = cuisineSelect.value;
        list.textContent = '';
        const items = FOOD_DB.filter((item) => {
            if (!lowered) return true;
            const label = getLabelByLang(item.labels, lang).toLowerCase();
            return label.includes(lowered) || item.id.includes(lowered);
        })
            .filter((item) => (category === 'all' ? true : item.category === category))
            .filter((item) => {
                if (cuisine === 'all') return true;
                return Array.isArray(item.cuisine) ? item.cuisine.includes(cuisine) : item.cuisine === cuisine;
            });
        const getValue = (item) => {
            const n = item.nutrition || {};
            if (sortSelect.value === 'kcal') return n.kcal || 0;
            if (sortSelect.value === 'protein') return n.proteinG || 0;
            if (sortSelect.value === 'fiber') return n.fiberG || 0;
            return 0;
        };
        items.sort((a, b) => {
            if (sortSelect.value === 'name') {
                return getLabelByLang(a.labels, lang).localeCompare(getLabelByLang(b.labels, lang));
            }
            return getValue(b) - getValue(a);
        });
        items.forEach((item) => {
            const label = getLabelByLang(item.labels, lang);
            const kcal = item.nutrition?.kcal ?? '-';
            const fiber = item.nutrition?.fiberG ?? '-';
            const sugar = item.nutrition?.sugarG ?? '-';
            const satFat = item.nutrition?.satFatG ?? '-';
            const sodium = item.nutrition?.sodiumMg ?? '-';
            const potassium = item.nutrition?.potassiumMg ?? '-';
            const meta = [item.category, ...(item.cuisine || [])].filter(Boolean).join(' · ');
            list.appendChild(
                el(
                    'div',
                    { className: 'list-item', dataset: { action: 'food.select', id: item.id } },
                    el(
                        'div',
                        {},
                        el('div', { className: 'list-title' }, label),
                        el(
                            'div',
                            { className: 'list-subtitle' },
                            `기준 ${item.serving?.size || '-'}${item.serving?.unit || ''} · ${kcal} kcal`
                        ),
                        meta ? el('div', { className: 'list-subtitle' }, meta) : null,
                        el(
                            'div',
                            { className: 'list-subtitle' },
                            `식이섬유 ${fiber}g · 당 ${sugar}g · 포화지방 ${satFat}g`
                        ),
                        el(
                            'div',
                            { className: 'list-subtitle' },
                            `나트륨 ${sodium}mg · 칼륨 ${potassium}mg`
                        )
                    ),
                    el('div', { className: 'list-actions' }, el('span', { className: 'badge' }, '추가'))
                )
            );
        });
    };

    renderList('');
    searchInput.addEventListener('input', (event) => renderList(event.target.value));
    categorySelect.addEventListener('change', () => renderList(searchInput.value));
    cuisineSelect.addEventListener('change', () => renderList(searchInput.value));
    sortSelect.addEventListener('change', () => renderList(searchInput.value));
    list.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action="food.select"]');
        if (!actionEl) return;
        const id = actionEl.dataset.id;
        const food = FOOD_DB.find((item) => item.id === id);
        if (!food) return;
        const type = typeSelect.value || '기타';
        const amount = Math.max(0, Number(amountInput.value || 1));
        const unit = unitSelect.value || 'serving';
        const label = getLabelByLang(food.labels, lang);
        const per = food.nutrition || {};
        const servingSize = food.serving?.size || 1;
        const multiplier = unit === 'g' ? amount / servingSize : amount;
        const scaled = {
            kcal: (per.kcal || 0) * multiplier,
            proteinG: (per.proteinG || 0) * multiplier,
            carbG: (per.carbG || 0) * multiplier,
            fatG: (per.fatG || 0) * multiplier,
            fiberG: (per.fiberG || 0) * multiplier,
            unsatFatG: (per.unsatFatG || 0) * multiplier,
            satFatG: (per.satFatG || 0) * multiplier,
            transFatG: (per.transFatG || 0) * multiplier,
            sugarG: (per.sugarG || 0) * multiplier,
            addedSugarG: (per.addedSugarG || 0) * multiplier,
            sodiumMg: (per.sodiumMg || 0) * multiplier,
            potassiumMg: (per.potassiumMg || 0) * multiplier
        };
        updateUserDb(store, (userdb) => {
            const dateKey = userdb.meta.selectedDate.diet;
            const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
            entry.meals = entry.meals.concat({
                id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                type,
                name: label,
                foodId: food.id,
                serving: food.serving,
                nutrition: food.nutrition,
                amount,
                amountUnit: unit,
                kcal: scaled.kcal,
                proteinG: scaled.proteinG,
                carbG: scaled.carbG,
                fatG: scaled.fatG,
                fiberG: scaled.fiberG,
                unsatFatG: scaled.unsatFatG,
                satFatG: scaled.satFatG,
                transFatG: scaled.transFatG,
                sugarG: scaled.sugarG,
                addedSugarG: scaled.addedSugarG,
                sodiumMg: scaled.sodiumMg,
                potassiumMg: scaled.potassiumMg
            });
            userdb.diet[dateKey] = entry;
            userdb.updatedAt = new Date().toISOString();
        });
        closeModal();
    });

    openModal({
        title: '음식 검색',
        body: el(
            'div',
            { className: 'stack-form' },
            typeSelect,
            unitSelect,
            amountInput,
            categorySelect,
            cuisineSelect,
            sortSelect,
            searchInput,
            list
        ),
        submitLabel: '닫기',
        onSubmit: () => true
    });
};

export const openDietEditModal = (store, { id }) => {
    if (!id) return;
    const { userdb } = store.getState();
    const dateKey = userdb.meta.selectedDate.diet;
    const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
    const target = entry.meals.find((meal) => meal.id === id);
    if (!target) return;
    const food = target.foodId ? FOOD_DB.find((item) => item.id === target.foodId) : null;
    const servingSize = food?.serving?.size || 1;
    openModal({
        title: '식단 수정',
        body: el(
            'div',
            { className: 'stack-form' },
            el('input', { name: 'mealName', type: 'text', value: target.name }),
            el(
                'select',
                { name: 'mealType' },
                el('option', { value: '아침', selected: target.type === '아침' }, '아침'),
                el('option', { value: '점심', selected: target.type === '점심' }, '점심'),
                el('option', { value: '저녁', selected: target.type === '저녁' }, '저녁'),
                el('option', { value: '간식', selected: target.type === '간식' }, '간식')
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('input', {
                    name: 'amount',
                    type: 'number',
                    min: '0',
                    value: target.amount ?? 1
                }),
                el(
                    'select',
                    { name: 'amountUnit' },
                    el('option', { value: 'serving', selected: target.amountUnit === 'serving' }, '서빙'),
                    el('option', { value: 'g', selected: target.amountUnit === 'g' }, '그램')
                )
            )
        ),
        onSubmit: (form) => {
            const name = form.querySelector('[name="mealName"]')?.value.trim() || '';
            const type = form.querySelector('[name="mealType"]')?.value || target.type;
            const amountRaw = Number(form.querySelector('[name="amount"]')?.value || 0);
            const amount = Number.isNaN(amountRaw) ? target.amount ?? 1 : Math.max(0, amountRaw);
            const amountUnit = form.querySelector('[name="amountUnit"]')?.value || target.amountUnit || 'serving';
            if (!name) return false;
            updateUserDb(store, (nextDb) => {
                const nextEntry = nextDb.diet[dateKey] || { meals: [], waterMl: 0 };
                const nextTarget = nextEntry.meals.find((meal) => meal.id === id);
                if (!nextTarget) return;
                nextTarget.name = name;
                nextTarget.type = type;
                nextTarget.amount = amount;
                nextTarget.amountUnit = amountUnit;
                if (food) {
                    const per = food.nutrition || {};
                    const multiplier = amountUnit === 'g' ? amount / servingSize : amount;
                    nextTarget.nutrition = food.nutrition;
                    nextTarget.serving = food.serving;
                    nextTarget.kcal = (per.kcal || 0) * multiplier;
                    nextTarget.proteinG = (per.proteinG || 0) * multiplier;
                    nextTarget.carbG = (per.carbG || 0) * multiplier;
                    nextTarget.fatG = (per.fatG || 0) * multiplier;
                    nextTarget.fiberG = (per.fiberG || 0) * multiplier;
                    nextTarget.unsatFatG = (per.unsatFatG || 0) * multiplier;
                    nextTarget.satFatG = (per.satFatG || 0) * multiplier;
                    nextTarget.transFatG = (per.transFatG || 0) * multiplier;
                    nextTarget.sugarG = (per.sugarG || 0) * multiplier;
                    nextTarget.addedSugarG = (per.addedSugarG || 0) * multiplier;
                    nextTarget.sodiumMg = (per.sodiumMg || 0) * multiplier;
                    nextTarget.potassiumMg = (per.potassiumMg || 0) * multiplier;
                }
                nextDb.diet[dateKey] = nextEntry;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        },
        dangerLabel: '삭제',
        onDanger: () => {
            if (!window.confirm('식단 내역을 삭제하시겠습니까?')) {
                return false;
            }
            updateUserDb(store, (nextDb) => {
                const nextEntry = nextDb.diet[dateKey] || { meals: [], waterMl: 0 };
                nextEntry.meals = nextEntry.meals.filter((meal) => meal.id !== id);
                nextDb.diet[dateKey] = nextEntry;
                nextDb.updatedAt = new Date().toISOString();
            });
        }
    });
};
