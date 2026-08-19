import { el } from '../../utils/dom.js';
import { formatDisplay } from '../../utils/date.js';
import { selectGoalForDate, selectSelectedDate } from '../../selectors/goalSelectors.js';

const formatKcal = (value) => `${Number(value || 0)} kcal`;
const formatGram = (value) => `${Number(value || 0)} g`;

const row = (label, value, valueClassName) =>
    el(
        'div',
        { className: 'row row-gap' },
        el('div', {}, label),
        el('div', valueClassName ? { className: valueClassName } : {}, value)
    );

// 목표 편집은 설정 화면에서만 한다. 이 카드는 계산 결과를 보여주기만 한다.
export const renderGoalCard = (store, options = {}) => {
    const state = store.getState();
    const dateISO = options.dateISO || selectSelectedDate(state, options.domain);
    const goal = selectGoalForDate(state, dateISO);
    const title = options.title || '목표';

    if (!goal.base || !goal.base.kcal) {
        return el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, title)),
            el('p', { className: 'empty-state' }, '목표가 없습니다. 설정에서 목표를 저장하세요.')
        );
    }

    const { base, final, meta } = goal;
    const sourceLabel = meta.source === 'override' ? '이 날짜만' : '기준';
    const dateLabel = formatDisplay(meta.effectiveDate, state.settings.dateFormat);

    return el(
        'div',
        { className: 'card' },
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, title)),
        el(
            'div',
            { className: 'stack-form' },
            el('div', { className: 'list-subtitle' }, `${sourceLabel} 적용일: ${dateLabel}`),
            row('기준', formatKcal(base.kcal), 'badge'),
            meta.creditedKcal ? row('운동 보정', `+${meta.creditedKcal} kcal`, 'badge') : null,
            row('최종', formatKcal(final.kcal), 'badge'),
            row('단백질', formatGram(final.proteinG)),
            row('탄수', formatGram(final.carbG)),
            row('지방', formatGram(final.fatG))
        )
    );
};
