import { el } from '../../utils/dom.js';

let activeOverlay = null;

export const closeModal = () => {
    if (activeOverlay) {
        activeOverlay.remove();
        activeOverlay = null;
    }
};

export const openModal = ({ title, body, onSubmit, submitLabel = '저장' }) => {
    closeModal();

    const overlay = el('div', { className: 'modal-overlay open center' });
    const content = el('div', { className: 'modal-content' });
    const header = el('h2', {}, title);
    const form = el('form', { className: 'stack-form' });

    if (body) {
        form.appendChild(body);
    }

    const actions = el(
        'div',
        { className: 'modal-actions' },
        el('button', { type: 'button', className: 'btn btn-secondary' }, '취소'),
        el('button', { type: 'submit', className: 'btn' }, submitLabel)
    );

    const cancelButton = actions.querySelector('button');
    cancelButton.addEventListener('click', () => closeModal());

    form.appendChild(actions);
    content.appendChild(header);
    content.appendChild(form);
    overlay.appendChild(content);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (typeof onSubmit === 'function') {
            const shouldClose = onSubmit(form);
            if (shouldClose === false) return;
        }
        closeModal();
    });

    document.body.appendChild(overlay);
    activeOverlay = overlay;
};
