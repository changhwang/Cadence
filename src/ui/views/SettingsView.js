import { el } from '../../utils/dom.js';

export const renderSettingsView = (container, store) => {
    container.textContent = '';

    const { settings } = store.getState();

    const header = el('h1', {}, '설정');
    const headerWrap = el('div', { className: 'page-header' }, header);

    const form = el(
        'form',
        { className: 'stack-form', dataset: { action: 'settings.save' } },
        el(
            'label',
            { className: 'input-label' },
            '날짜 형식',
            el(
                'select',
                { name: 'dateFormat' },
                el('option', { value: 'KO_DOTS', selected: settings.dateFormat === 'KO_DOTS' }, 'YYYY.MM.DD'),
                el('option', { value: 'ISO', selected: settings.dateFormat === 'ISO' }, 'YYYY-MM-DD')
            )
        ),
        el(
            'label',
            { className: 'input-label' },
            el('input', {
                type: 'checkbox',
                name: 'dateSync',
                checked: Boolean(settings.dateSync)
            }),
            '탭 날짜 동기화'
        ),
        el(
            'label',
            { className: 'input-label' },
            '체중 단위',
            el(
                'select',
                { name: 'weightUnit' },
                el('option', { value: 'kg', selected: settings.units.weight === 'kg' }, 'kg'),
                el('option', { value: 'lb', selected: settings.units.weight === 'lb' }, 'lb')
            )
        ),
        el(
            'label',
            { className: 'input-label' },
            '물 단위',
            el(
                'select',
                { name: 'waterUnit' },
                el('option', { value: 'ml', selected: settings.units.water === 'ml' }, 'ml'),
                el('option', { value: 'oz', selected: settings.units.water === 'oz' }, 'oz')
            )
        ),
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
