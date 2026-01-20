import { el } from '../../utils/dom.js';
import { renderDateBar } from '../components/DateBar.js';
import { formatDisplay } from '../../utils/date.js';
import { selectGoalForDate } from '../../selectors/goalSelectors.js';
import { getExerciseKcalForDate } from '../../services/workout/energy.js';
import { getDietTotalsForDate } from '../../services/nutrition/intake.js';

const formatKcal = (value) => `${Math.round(Number(value || 0))} kcal`;

export const renderDashboardView = (container, store) => {
    container.textContent = '';

    const state = store.getState();
    const { userdb, settings } = state;
    const dateKey = userdb.meta.selectedDate.dashboard || userdb.meta.selectedDate.diet;

    const header = el('h1', {}, '홈');
    const dateLabel = renderDateBar({ dateKey, dateFormat: settings.dateFormat, className: 'compact' });
    const todayButton = el(
        'button',
        { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'date.today' } },
        '오늘'
    );
    const headerWrap = el('div', { className: 'page-header-row' }, header, dateLabel, todayButton);

    const goal = selectGoalForDate(state, dateKey);
    const finalKcal = goal.final?.kcal || 0;
    const intake = getDietTotalsForDate({ day: userdb.diet?.[dateKey] });
    const intakeKcal = intake.totals.kcal || 0;
    const exerciseKcal = getExerciseKcalForDate({
        day: userdb.workout?.[dateKey],
        profile: userdb.profile
    });
    const remainingKcal = intake.hasData ? Math.max(0, finalKcal - intakeKcal) : 0;
    const progress = intake.hasData && finalKcal > 0
        ? Math.min(100, Math.round((intakeKcal / finalKcal) * 100))
        : 0;
    const sourceLabel = goal.meta.source === 'override' ? '오버라이드' : '기준';
    const effectiveLabel = formatDisplay(goal.meta.effectiveDate, settings.dateFormat);

    const donut = el(
        'div',
        { className: 'donut', style: `--percent: ${progress}` },
        el('div', { className: 'donut-center' }, `${progress}%`)
    );

    const stats = el(
        'div',
        { className: 'stack-form' },
        el(
            'div',
            { className: 'row row-gap' },
            el('div', {}, '목표'),
            el('div', { className: 'badge' }, formatKcal(finalKcal))
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('div', {}, '섭취'),
            el('div', { className: 'badge' }, intake.hasData ? formatKcal(intakeKcal) : '-')
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('div', {}, '운동'),
            el('div', { className: 'badge' }, formatKcal(exerciseKcal))
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('div', {}, '잔여'),
            el('div', { className: 'badge' }, intake.hasData ? formatKcal(remainingKcal) : '-')
        ),
        el(
            'div',
            { className: 'list-subtitle' },
            `목표 기준일: ${effectiveLabel} · ${sourceLabel}`
        ),
        el(
            'div',
            { className: 'list-subtitle' },
            intake.hasData ? '섭취 데이터 연결됨' : '식단 영양 계산 연결 예정'
        )
    );

    const summaryCard = el(
        'div',
        { className: 'card dashboard-summary' },
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '오늘 요약')),
        el('div', { className: 'row row-gap' }, donut, stats)
    );

    container.appendChild(headerWrap);
    container.appendChild(summaryCard);
};
