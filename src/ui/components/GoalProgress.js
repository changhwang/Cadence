import { el } from '../../utils/dom.js';
import { selectGoalForDate } from '../../selectors/goalSelectors.js';
import { getDietTotalsForDate } from '../../services/nutrition/intake.js';
import { getDietEntry } from '../../services/nutrition/dietEntry.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const svgEl = (tag, attrs = {}) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
};

const ratio = (current, target) => (target > 0 ? current / target : 0);

// 100%를 넘으면 색으로 알린다(적정 범위 초록 → 초과 주황).
const toneFor = (pct) => {
    if (pct > 115) return 'over';
    if (pct >= 85) return 'good';
    return 'under';
};

const buildRing = ({ pct, tone }) => {
    const clamped = Math.max(0, Math.min(1, pct / 100));
    const svg = svgEl('svg', {
        class: `goal-ring is-${tone}`,
        viewBox: '0 0 120 120',
        role: 'img',
        'aria-label': `칼로리 달성률 ${Math.round(pct)}%`
    });
    svg.appendChild(svgEl('circle', {
        class: 'goal-ring-track', cx: 60, cy: 60, r: RADIUS, fill: 'none', 'stroke-width': 10
    }));
    svg.appendChild(svgEl('circle', {
        class: 'goal-ring-value',
        cx: 60,
        cy: 60,
        r: RADIUS,
        fill: 'none',
        'stroke-width': 10,
        'stroke-linecap': 'round',
        'stroke-dasharray': `${CIRCUMFERENCE * clamped} ${CIRCUMFERENCE}`,
        transform: 'rotate(-90 60 60)'
    }));
    return svg;
};

const buildMacroBar = ({ label, current, target, unit = 'g' }) => {
    const pct = Math.round(ratio(current, target) * 100);
    const tone = target > 0 ? toneFor(pct) : 'under';
    return el(
        'div',
        { className: 'goal-macro' },
        el(
            'div',
            { className: 'goal-macro-head' },
            el('span', { className: 'goal-macro-label' }, label),
            el(
                'span',
                { className: 'goal-macro-value' },
                target > 0 ? `${Math.round(current)} / ${Math.round(target)}${unit}` : `${Math.round(current)}${unit}`
            )
        ),
        el(
            'div',
            { className: 'goal-macro-track' },
            el('div', {
                className: `goal-macro-fill is-${tone}`,
                style: { width: `${Math.min(100, Math.max(0, pct))}%` }
            })
        )
    );
};

export const renderGoalProgress = (store, dateKey) => {
    const state = store.getState();
    const goal = selectGoalForDate(state, dateKey);
    const totals = getDietTotalsForDate({ day: getDietEntry(state.userdb, dateKey) }).totals;

    const targetKcal = Number(goal.final?.kcal || 0);
    const intakeKcal = Number(totals.kcal || 0);

    if (!targetKcal) {
        return el(
            'div',
            { className: 'card goal-progress-card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '오늘 달성률')),
            el('p', { className: 'empty-state' }, '설정에서 프로필과 목표를 저장하면 달성률이 표시됩니다.')
        );
    }

    const pct = Math.round(ratio(intakeKcal, targetKcal) * 100);
    const tone = toneFor(pct);
    const remaining = Math.round(targetKcal - intakeKcal);
    const credited = Math.round(Number(goal.meta?.creditedKcal || 0));

    const ring = el(
        'div',
        { className: 'goal-ring-wrap' },
        buildRing({ pct, tone }),
        el(
            'div',
            { className: 'goal-ring-center' },
            el('div', { className: `goal-ring-pct is-${tone}` }, `${pct}%`),
            el('div', { className: 'goal-ring-sub' }, `${Math.round(intakeKcal)} kcal`)
        )
    );

    const remainingLabel = remaining >= 0 ? '남은 열량' : '초과';
    const remainingValue = `${Math.abs(remaining)} kcal`;

    const detail = el(
        'div',
        { className: 'goal-progress-detail' },
        el(
            'div',
            { className: 'goal-progress-top' },
            el('div', { className: 'goal-progress-target' }, `목표 ${Math.round(targetKcal)} kcal`),
            credited > 0
                ? el('span', { className: 'badge goal-credit-badge' }, `운동 +${credited}`)
                : null
        ),
        buildMacroBar({ label: '단백질', current: totals.proteinG, target: goal.final?.proteinG }),
        buildMacroBar({ label: '탄수화물', current: totals.carbG, target: goal.final?.carbG }),
        buildMacroBar({ label: '지방', current: totals.fatG, target: goal.final?.fatG }),
        el(
            'div',
            { className: `goal-progress-remaining is-${remaining >= 0 ? 'left' : 'over'}` },
            el('span', {}, remainingLabel),
            el('strong', {}, remainingValue)
        )
    );

    return el(
        'div',
        { className: 'card goal-progress-card' },
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '오늘 달성률')),
        el('div', { className: 'goal-progress-body' }, ring, detail)
    );
};
