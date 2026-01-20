import { el } from '../../utils/dom.js';

let activeOverlay = null;

export const closeModal = () => {
    if (activeOverlay) {
        activeOverlay.remove();
        activeOverlay = null;
    }
};

export const openModal = ({
    title,
    body,
    onSubmit,
    submitLabel = '저장',
    dangerLabel,
    onDanger
}) => {
    closeModal();

    const overlay = el('div', { className: 'modal-overlay open center' });
    const content = el('div', { className: 'modal-content' });
    const header = el('h2', {}, title);
    const form = el('form', { className: 'stack-form' });

    if (body) {
        form.appendChild(body);
    }

    const actions = el('div', { className: 'modal-actions' });
    const cancelButton = el('button', { type: 'button', className: 'btn btn-text' }, '취소');
    actions.appendChild(cancelButton);
    if (dangerLabel && typeof onDanger === 'function') {
        const dangerButton = el('button', { type: 'button', className: 'btn btn-text btn-danger-text' }, dangerLabel);
        dangerButton.addEventListener('click', () => {
            const result = onDanger();
            if (result === false) return;
            closeModal();
        });
        actions.appendChild(dangerButton);
    }
    const submitClass = submitLabel.trim() === '닫기' ? 'btn btn-text' : 'btn';
    actions.appendChild(el('button', { type: 'submit', className: submitClass }, submitLabel));

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
