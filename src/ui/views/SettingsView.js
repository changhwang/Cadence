import { el } from '../../utils/dom.js';
import { renderGoalCard } from '../components/GoalCard.js';
import { addDays, formatDisplay, todayIso } from '../../utils/date.js';

export const renderSettingsView = (container, store) => {
    container.textContent = '';

    const { settings, userdb } = store.getState();
    const goals = userdb.goals || { timeline: [], overrideByDate: {} };

    const header = el('h1', {}, '설정');
    const headerWrap = el('div', { className: 'page-header' }, header);

    const dateSection = el(
        'div',
        { className: 'settings-section' },
        el('h3', { className: 'section-title' }, '날짜/시간 형식'),
        el(
            'div',
            { className: 'settings-format-row' },
            el(
                'label',
                { className: 'input-label' },
                '날짜 형식',
                el(
                    'select',
                    { name: 'dateFormat' },
                    el('option', { value: 'YMD', selected: settings.dateFormat === 'YMD' }, 'YYYY.MM.DD'),
                    el('option', { value: 'MDY', selected: settings.dateFormat === 'MDY' }, 'MM/DD/YYYY')
                )
            ),
            el(
                'label',
                { className: 'input-label' },
                '시간 형식',
                el(
                    'select',
                    { name: 'timeFormat' },
                    el('option', { value: 'H24', selected: settings.timeFormat !== 'H12' }, '24H'),
                    el('option', { value: 'H12', selected: settings.timeFormat === 'H12' }, '12H (AM/PM)')
                )
            )
        ),
        el(
            'label',
            { className: 'input-label inline-toggle' },
            el('span', { className: 'toggle-label' }, '탭 날짜 동기화'),
            el('input', {
                type: 'checkbox',
                name: 'dateSync',
                checked: Boolean(settings.dateSync)
            })
        )
    );

    const profileBirthDisplay = formatDisplay(userdb.profile.birth, settings.dateFormat);

    const profileSection = el(
        'div',
        { className: 'settings-section' },
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                '성별',
                el(
                    'select',
                    { name: 'profileSex' },
                    el('option', { value: 'M', selected: userdb.profile.sex === 'M' }, '남성'),
                    el('option', { value: 'F', selected: userdb.profile.sex === 'F' }, '여성')
                )
            ),
            el(
                'label',
                { className: 'input-label' },
                '생년월일',
                el('input', {
                    name: 'profileBirth',
                    type: 'text',
                    inputMode: 'numeric',
                    placeholder: settings.dateFormat === 'MDY' ? 'MM/DD/YYYY' : 'YYYY.MM.DD',
                    value: profileBirthDisplay
                })
            )
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                `키 (${settings.units.height})`,
                el('input', { name: 'profileHeight', type: 'number', min: '0', value: userdb.profile.height_cm })
            ),
            el(
                'label',
                { className: 'input-label' },
                `체중 (${settings.units.weight})`,
                el('input', { name: 'profileWeight', type: 'number', min: '0', value: userdb.profile.weight_kg })
            )
        ),
        el(
            'label',
            { className: 'input-label' },
            '활동량',
            el(
                'select',
                { name: 'profileActivity' },
                el('option', { value: 'sedentary', selected: userdb.profile.activity === 'sedentary' }, '적음'),
                el('option', { value: 'light', selected: userdb.profile.activity === 'light' }, '가벼움'),
                el('option', { value: 'moderate', selected: userdb.profile.activity === 'moderate' }, '보통'),
                el('option', { value: 'high', selected: userdb.profile.activity === 'high' }, '높음'),
                el('option', { value: 'athlete', selected: userdb.profile.activity === 'athlete' }, '매우 높음')
            )
        )
    );

    const unitSection = el(
        'div',
        { className: 'settings-section' },
        el('h3', { className: 'section-title' }, '단위'),
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                '키',
                el(
                    'select',
                    { name: 'heightUnit' },
                    el('option', { value: 'cm', selected: settings.units.height === 'cm' }, 'cm'),
                    el('option', { value: 'in', selected: settings.units.height === 'in' }, 'in')
                )
            ),
            el(
                'label',
                { className: 'input-label' },
                '체중',
                el(
                    'select',
                    { name: 'weightUnit' },
                    el('option', { value: 'kg', selected: settings.units.weight === 'kg' }, 'kg'),
                    el('option', { value: 'lb', selected: settings.units.weight === 'lb' }, 'lb')
                )
            )
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                '물',
                el(
                    'select',
                    { name: 'waterUnit' },
                    el('option', { value: 'ml', selected: settings.units.water === 'ml' }, 'ml'),
                    el('option', { value: 'oz', selected: settings.units.water === 'oz' }, 'oz')
                )
            ),
            el(
                'label',
                { className: 'input-label' },
                '음식',
                el(
                    'select',
                    { name: 'foodUnit' },
                    el('option', { value: 'g', selected: settings.units.food === 'g' }, 'g'),
                    el('option', { value: 'oz', selected: settings.units.food === 'oz' }, 'oz')
                )
            )
        ),
        el(
            'label',
            { className: 'input-label' },
            '운동 중량',
            el(
                'select',
                { name: 'workoutUnit' },
                el('option', { value: 'kg', selected: settings.units.workout === 'kg' }, 'kg'),
                el('option', { value: 'lb', selected: settings.units.workout === 'lb' }, 'lb')
            )
        )
    );

    const soundSection = el(
        'div',
        { className: 'settings-section' },
        el('h3', { className: 'section-title' }, `사운드 볼륨 (${settings.sound.volume})`),
        el(
            'div',
            { className: 'row row-gap slider-row' },
            el('input', {
                type: 'range',
                name: 'soundVolume',
                min: '0',
                max: '100',
                step: '1',
                value: settings.sound.volume
            })
        )
    );

    const languageSection = el(
        'div',
        { className: 'settings-section' },
        el('h3', { className: 'section-title' }, 'Language'),
        el(
            'select',
            { name: 'lang' },
            el('option', { value: 'ko', selected: settings.lang === 'ko' }, '한국어'),
            el('option', { value: 'en', selected: settings.lang === 'en' }, 'English')
        )
    );

    const backupSection = el(
        'div',
        { className: 'stack-form' },
        el('h2', {}, '백업/복원'),
        el(
            'button',
            { type: 'button', className: 'btn', dataset: { action: 'backup.export' } },
            '백업 파일 저장'
        ),
        el(
            'label',
            { className: 'input-label' },
            '백업 파일 불러오기',
            el('input', { type: 'file', accept: 'application/json', dataset: { action: 'backup.import' } })
        )
    );

    const creditPolicy = settings.nutrition?.exerciseCredit || {};
    const creditEnabled = creditPolicy.enabled !== false;
    const creditFactorPct = Math.round(Number(creditPolicy.factor ?? 0.5) * 100);

    const nutritionSection = el(
        'div',
        { className: 'settings-section' },
        el('h3', { className: 'section-title' }, '영양 목표'),
        el(
            'label',
            { className: 'input-label' },
            '목표',
            el(
                'select',
                { name: 'nutritionGoal' },
                el('option', { value: 'maintain', selected: settings.nutrition.goal === 'maintain' }, '유지'),
                el('option', { value: 'cut', selected: settings.nutrition.goal === 'cut' }, '감량'),
                el('option', { value: 'minicut', selected: settings.nutrition.goal === 'minicut' }, '미니컷'),
                el('option', { value: 'bulk', selected: settings.nutrition.goal === 'bulk' }, '증량'),
                el('option', { value: 'leanbulk', selected: settings.nutrition.goal === 'leanbulk' }, '린 벌크'),
                el('option', { value: 'recomp', selected: settings.nutrition.goal === 'recomp' }, '리컴프'),
                el('option', { value: 'performance', selected: settings.nutrition.goal === 'performance' }, '퍼포먼스')
            )
        ),
        el(
            'label',
            { className: 'input-label' },
            '프레임워크',
            el(
                'select',
                { name: 'nutritionFramework' },
                el('option', { value: 'dga_2025', selected: settings.nutrition.framework === 'dga_2025' }, 'DGA 2025–2030'),
                el('option', { value: 'amdr', selected: settings.nutrition.framework === 'amdr' }, 'AMDR Balanced'),
                el('option', { value: 'issn_strength', selected: settings.nutrition.framework === 'issn_strength' }, 'ISSN Strength'),
                el('option', { value: 'acsm_endurance', selected: settings.nutrition.framework === 'acsm_endurance' }, 'ACSM Endurance')
            )
        ),
        el(
            'label',
            { className: 'input-label inline-toggle' },
            el('span', { className: 'toggle-label' }, '운동 보정'),
            el('input', {
                type: 'checkbox',
                name: 'exerciseCreditEnabled',
                checked: creditEnabled
            })
        ),
        el(
            'label',
            { className: `input-label ${creditEnabled ? '' : 'is-disabled'}` },
            `운동 보정 비율 (${creditFactorPct}%)`,
            el('input', {
                type: 'range',
                className: 'range-full',
                name: 'exerciseCreditFactor',
                min: '0',
                max: '100',
                step: '5',
                value: String(creditFactorPct),
                disabled: !creditEnabled
            })
        ),
        el(
            'label',
            { className: `input-label ${creditEnabled ? '' : 'is-disabled'}` },
            `운동 보정 상한 (${creditPolicy.capKcal ?? 0} kcal)`,
            el('input', {
                type: 'range',
                className: 'range-full',
                name: 'exerciseCreditCap',
                min: '0',
                max: '1000',
                step: '25',
                value: String(creditPolicy.capKcal ?? 0),
                disabled: !creditEnabled
            })
        ),
        el(
            'label',
            { className: `input-label ${creditEnabled ? '' : 'is-disabled'}` },
            '보정 분배',
            el(
                'select',
                { name: 'exerciseCreditDistribution', disabled: !creditEnabled },
                el('option', { value: 'CARB_BIASED', selected: creditPolicy.distribution === 'CARB_BIASED' }, '탄수 위주'),
                el('option', { value: 'SAME_RATIO', selected: creditPolicy.distribution === 'SAME_RATIO' }, '기존 비율'),
                el('option', { value: 'FAT_BIASED', selected: creditPolicy.distribution === 'FAT_BIASED' }, '지방 위주')
            )
        )
    );

    const goalModeLabel = (mode) => {
        if (mode === 'CUT') return '감량';
        if (mode === 'LEAN_BULK') return '린 벌크';
        if (mode === 'BULK') return '증량';
        if (mode === 'RECOMP') return '리컴프';
        if (mode === 'MAINTAIN') return '유지';
        return mode || '-';
    };

    const frameworkLabel = (id) => {
        if (id === 'dga_2025') return 'DGA 2025–2030';
        if (id === 'amdr') return 'AMDR Balanced';
        if (id === 'issn_strength') return 'ISSN Strength';
        if (id === 'acsm_endurance') return 'ACSM Endurance';
        return id || '-';
    };

    const buildHistoryList = ({ items, renderItem, listId }) => {
        const limit = 5;
        const list = el('div', { className: 'list-group', id: listId });
        items.forEach((item, index) => {
            const row = renderItem(item);
            if (index >= limit) {
                row.classList.add('is-hidden');
            }
            list.appendChild(row);
        });
        if (items.length <= limit) {
            return { list, toggle: null };
        }
        const toggle = el(
            'button',
            {
                type: 'button',
                className: 'btn btn-secondary btn-sm btn-inline',
                dataset: { action: 'goal.history.toggle', target: listId, expanded: 'false' }
            },
            '더보기'
        );
        return { list, toggle };
    };

    const timeline = Array.isArray(goals.timeline) ? goals.timeline.slice() : [];
    const timelineGrouped = timeline.reduce((acc, entry) => {
        const date = entry?.effectiveDate || '';
        if (!date) return acc;
        if (!acc[date] || (entry.createdAt || 0) >= (acc[date].createdAt || 0)) {
            acc[date] = entry;
        }
        return acc;
    }, {});
    const overrides = goals.overrideByDate || {};

    const timelineList = (() => {
        if (timeline.length === 0) {
            return el('p', { className: 'empty-state' }, '목표 변경 이력이 없습니다.');
        }
        const items = Object.values(timelineGrouped)
            .sort((a, b) => (a.effectiveDate || '').localeCompare(b.effectiveDate || '') * -1)
        const { list, toggle } = buildHistoryList({
            items,
            listId: 'goal-history-timeline',
            renderItem: (entry) => {
                const dateLabel = formatDisplay(entry.effectiveDate, settings.dateFormat);
                const mode = goalModeLabel(entry?.spec?.goalMode?.mode);
                const framework = frameworkLabel(entry?.spec?.frameworkId);
                return el(
                    'div',
                    { className: 'list-item' },
                    el(
                        'div',
                        {},
                        el(
                            'div',
                            { className: 'list-title-row' },
                            el('div', { className: 'list-title' }, dateLabel),
                            el('span', { className: 'badge' }, mode)
                        ),
                        el('div', { className: 'list-subtitle' }, `프레임워크: ${framework}`)
                    )
                );
            }
        });
        return el('div', { className: 'history-list' }, list, toggle || null);
    })();

    const overrideList = (() => {
        const entries = Object.keys(overrides);
        if (entries.length === 0) {
            return el('p', { className: 'empty-state' }, '오버라이드가 없습니다.');
        }
        const items = entries
            .sort((a, b) => a.localeCompare(b) * -1)
        const { list, toggle } = buildHistoryList({
            items,
            listId: 'goal-history-override',
            renderItem: (dateISO) => {
                const override = overrides[dateISO] || {};
                const dateLabel = formatDisplay(dateISO, settings.dateFormat);
                const kcal = override.targets?.kcal ?? '-';
                const protein = override.targets?.proteinG ?? '-';
                const carb = override.targets?.carbG ?? '-';
                const fat = override.targets?.fatG ?? '-';
                const meta = `${kcal} / ${protein} / ${carb} / ${fat}`;
                const actions = el(
                    'div',
                    { className: 'list-actions' },
                    el(
                        'button',
                        {
                            type: 'button',
                            className: 'btn btn-secondary btn-sm btn-inline',
                            dataset: { action: 'goal.override', date: dateISO }
                        },
                        '수정'
                    ),
                    el(
                        'button',
                        {
                            type: 'button',
                            className: 'btn btn-secondary btn-sm btn-inline',
                            dataset: { action: 'goal.clear', date: dateISO }
                        },
                        '해제'
                    )
                );
                return el(
                    'div',
                    { className: 'list-item' },
                    el(
                        'div',
                        {},
                        el(
                            'div',
                            { className: 'list-title-row' },
                            el('div', { className: 'list-title' }, dateLabel),
                            el('span', { className: 'badge' }, '오버라이드')
                        ),
                        el('div', { className: 'list-subtitle' }, meta)
                    ),
                    actions
                );
            }
        });
        return el('div', { className: 'history-list' }, list, toggle || null);
    })();

    const goalCalendar = (() => {
        const pad2 = (value) => String(value).padStart(2, '0');
        let baseISO = todayIso();
        const timelineDates = new Set(Object.keys(timelineGrouped));
        const overrideDates = new Set(Object.keys(overrides));

        const calendar = el('div', { className: 'goal-calendar' });
        const title = el('div', { className: 'goal-calendar-title' });
        const prevButton = el('button', { type: 'button', className: 'btn btn-secondary btn-sm' }, '이전');
        const nextButton = el('button', { type: 'button', className: 'btn btn-secondary btn-sm' }, '다음');
        const header = el('div', { className: 'goal-calendar-header' }, prevButton, title, nextButton);
        const grid = el('div', { className: 'goal-calendar-grid' });

        const renderWeekdays = () => {
            const labels = ['일', '월', '화', '수', '목', '금', '토'];
            labels.forEach((label) => {
                grid.appendChild(el('div', { className: 'goal-calendar-weekday' }, label));
            });
        };

        const renderGrid = () => {
            grid.textContent = '';
            renderWeekdays();
            const [year, month] = baseISO.split('-').map(Number);
            title.textContent = `${year}.${pad2(month)}`;
            const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
            const startOffset = firstOfMonth.getUTCDay();
            const firstISO = `${year}-${pad2(month)}-01`;
            const startISO = addDays(firstISO, -startOffset);

            for (let i = 0; i < 42; i += 1) {
                const cellISO = addDays(startISO, i);
                const [cYear, cMonth, cDay] = cellISO.split('-');
                const isOutside = Number(cMonth) !== month;
                const isToday = cellISO === todayIso();
                const hasTimeline = timelineDates.has(cellISO);
                const hasOverride = overrideDates.has(cellISO);

                const cell = el(
                    'button',
                    {
                        type: 'button',
                        className: 'goal-calendar-cell',
                        dataset: { action: 'goal.override', date: cellISO }
                    },
                    el('span', { className: 'goal-calendar-date' }, String(Number(cDay)))
                );
                if (isOutside) cell.classList.add('is-outside');
                if (isToday) cell.classList.add('is-today');
                if (hasTimeline || hasOverride) {
                    const dots = el('div', { className: 'goal-calendar-dots' });
                    if (hasTimeline) dots.appendChild(el('span', { className: 'goal-calendar-dot timeline' }, '•'));
                    if (hasOverride) dots.appendChild(el('span', { className: 'goal-calendar-dot override' }, '•'));
                    cell.appendChild(dots);
                }
                grid.appendChild(cell);
            }
        };

        prevButton.addEventListener('click', () => {
            const [year, month] = baseISO.split('-').map(Number);
            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;
            baseISO = `${prevYear}-${pad2(prevMonth)}-01`;
            renderGrid();
        });
        nextButton.addEventListener('click', () => {
            const [year, month] = baseISO.split('-').map(Number);
            const nextMonth = month === 12 ? 1 : month + 1;
            const nextYear = month === 12 ? year + 1 : year;
            baseISO = `${nextYear}-${pad2(nextMonth)}-01`;
            renderGrid();
        });

        renderGrid();
        calendar.appendChild(header);
        calendar.appendChild(grid);
        return calendar;
    })();

    const goalHistorySection = el(
        'div',
        { className: 'settings-section goal-history' },
        el('div', { className: 'list-subtitle' }, '같은 날짜 변경은 최종값만 표시됩니다.'),
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                '이 날짜만 오버라이드',
                el('input', {
                    name: 'goalOverrideDate',
                    type: 'text',
                    inputMode: 'numeric',
                    placeholder: settings.dateFormat === 'MDY' ? 'MM/DD/YYYY' : 'YYYY.MM.DD'
                })
            ),
            el(
                'button',
                { type: 'button', className: 'btn btn-sm btn-inline', dataset: { action: 'goal.override' } },
                '오버라이드 추가'
            )
        ),
        el('div', { className: 'list-subtitle' }, '달력'),
        goalCalendar,
        el('div', { className: 'list-subtitle' }, '타임라인'),
        timelineList,
        el('div', { className: 'list-subtitle' }, '오버라이드 (kcal/단백질/탄수화물/지방)'),
        overrideList
    );

    const form = el(
        'form',
        { className: 'stack-form', dataset: { action: 'settings.save' } },
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '프로필')),
            profileSection
        ),
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '목표')),
            nutritionSection
        ),
        renderGoalCard(store, {
            title: '목표 미리보기',
            dateISO: todayIso(),
            showControls: false,
            showActions: false
        }),
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, 'Goal History')),
            goalHistorySection
        ),
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '시스템')),
            dateSection,
            languageSection,
            unitSection,
            soundSection,
            backupSection
        ),
        el('button', { type: 'submit', className: 'btn' }, '저장')
    );

    container.appendChild(headerWrap);
    container.appendChild(form);
};
