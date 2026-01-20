import { el } from '../../utils/dom.js';
import { formatDisplay } from '../../utils/date.js';

export const renderSettingsView = (container, store) => {
    container.textContent = '';

    const { settings, userdb } = store.getState();

    const header = el('h1', {}, '설정');
    const headerWrap = el('div', { className: 'page-header' }, header);

    const dateSection = el(
        'div',
        { className: 'settings-section' },
        el('h3', { className: 'section-title' }, '날짜 형식'),
        el(
            'select',
            { name: 'dateFormat' },
            el('option', { value: 'YMD', selected: settings.dateFormat === 'YMD' }, 'YYYY.MM.DD'),
            el('option', { value: 'MDY', selected: settings.dateFormat === 'MDY' }, 'MM/DD/YYYY')
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
        el('h3', { className: 'section-title' }, '프로필'),
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

    const form = el(
        'form',
        { className: 'stack-form', dataset: { action: 'settings.save' } },
        profileSection,
        dateSection,
        el(
            'div',
            { className: 'settings-section' },
            el('h3', { className: 'section-title' }, 'Language'),
            el(
                'select',
                { name: 'lang' },
                el('option', { value: 'ko', selected: settings.lang === 'ko' }, '한국어'),
                el('option', { value: 'en', selected: settings.lang === 'en' }, 'English')
            )
        ),
        unitSection,
        soundSection,
        el('button', { type: 'submit', className: 'btn' }, '저장')
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

    container.appendChild(headerWrap);
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '일반')),
            form
        )
    );
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '백업/복원')),
            backupSection
        )
    );
};
