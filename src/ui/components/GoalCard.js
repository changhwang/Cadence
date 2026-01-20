import { el } from '../../utils/dom.js';
import { formatDisplay } from '../../utils/date.js';
import { selectGoalForDate, selectSelectedDate } from '../../selectors/goalSelectors.js';

const formatKcal = (value) => `${Number(value || 0)} kcal`;
const formatGram = (value) => `${Number(value || 0)} g`;

export const renderGoalCard = (store, options = {}) => {
    const state = store.getState();
    const dateISO = options.dateISO || selectSelectedDate(state, options.domain);
    const goal = selectGoalForDate(state, dateISO);
    const dateLabel = formatDisplay(goal.meta.effectiveDate, state.settings.dateFormat);
    const title = options.title || '목표';
    const showControls = options.showControls !== false;
    const showActions = options.showActions !== false;

    if (!goal.base || !goal.base.kcal) {
        return el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, title)),
            el('p', { className: 'empty-state' }, '목표가 없습니다. 설정에서 목표를 저장하세요.')
        );
    }

    const base = goal.base;
    const final = goal.final;
    const sourceLabel = goal.meta.source === 'override' ? '이 날짜만' : '기준';
    const creditLine = goal.meta.creditedKcal
        ? el(
            'div',
            { className: 'row row-gap' },
            el('div', {}, '운동 보정'),
            el('div', { className: 'badge' }, `+${goal.meta.creditedKcal} kcal`)
        )
        : null;

    const creditPolicy = state.settings.nutrition?.exerciseCredit || {};
    const creditEnabled = creditPolicy.enabled !== false;
    const creditFactor = Number(creditPolicy.factor ?? 0.5);

    const creditControls = showControls
        ? el(
            'div',
            { className: 'stack-form' },
            el(
                'label',
                { className: 'input-label inline-toggle' },
                el('span', { className: 'toggle-label' }, '운동 보정'),
                el('input', {
                    type: 'checkbox',
                    checked: creditEnabled,
                    dataset: { action: 'goal.credit.toggle' }
                })
            ),
            el(
                'label',
                { className: `input-label ${creditEnabled ? '' : 'is-disabled'}` },
                `비율 (${Math.round(creditFactor * 100)}%)`,
                el('input', {
                    type: 'range',
                    className: 'range-full',
                    min: '0',
                    max: '100',
                    step: '5',
                    value: String(Math.round(creditFactor * 100)),
                    disabled: !creditEnabled,
                    dataset: { action: 'goal.credit.factor' }
                })
            ),
            el(
                'label',
                { className: `input-label ${creditEnabled ? '' : 'is-disabled'}` },
                `상한 (${creditPolicy.capKcal ?? 0} kcal)`,
                el('input', {
                    type: 'range',
                    className: 'range-full',
                    min: '0',
                    max: '1000',
                    step: '25',
                    value: String(creditPolicy.capKcal ?? 0),
                    disabled: !creditEnabled,
                    dataset: { action: 'goal.credit.cap' }
                })
            )
        )
        : null;

    const actions = showActions
        ? el(
            'div',
            { className: 'row row-gap' },
            el(
                'button',
                {
                    type: 'button',
                    className: 'btn btn-secondary btn-sm',
                    dataset: { action: 'goal.override', date: dateISO, domain: options.domain }
                },
                '이 날짜만 수정'
            ),
            el(
                'button',
                {
                    type: 'button',
                    className: 'btn btn-secondary btn-sm',
                    dataset: { action: 'goal.changeDefault', date: dateISO, domain: options.domain }
                },
                '오늘부터 변경'
            ),
            goal.meta.source === 'override'
                ? el(
                    'button',
                    {
                        type: 'button',
                        className: 'btn btn-secondary btn-sm',
                        dataset: { action: 'goal.clear', date: dateISO, domain: options.domain }
                    },
                    '오버라이드 해제'
                )
                : null
        )
        : null;

    return el(
        'div',
        { className: 'card' },
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, title)),
        el(
            'div',
            { className: 'stack-form' },
            el('div', { className: 'list-subtitle' }, `${sourceLabel} 적용일: ${dateLabel}`),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '기준'),
                el('div', { className: 'badge' }, formatKcal(base.kcal))
            ),
            creditLine,
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '최종'),
                el('div', { className: 'badge' }, formatKcal(final.kcal))
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '단백질'),
                el('div', {}, formatGram(final.proteinG))
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '탄수'),
                el('div', {}, formatGram(final.carbG))
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '지방'),
                el('div', {}, formatGram(final.fatG))
            ),
            creditControls,
            actions
        )
    );
};
