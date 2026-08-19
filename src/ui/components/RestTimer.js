import { el } from '../../utils/dom.js';
import { openModal } from './Modal.js';
import { playTimerSound, primeTimerSound } from '../sound.js';

let restTimerInterval = null;

export const openRestTimerModal = (store, defaultSeconds = 60) => {
    const state = store.getState();
    const durationInput = el('input', { type: 'number', min: '10', value: defaultSeconds });
    const statusText = el('div', { className: 'timer-status' }, '대기');
    const startButton = el('button', { type: 'button', className: 'btn' }, '시작');
    const resetButton = el('button', { type: 'button', className: 'btn' }, '리셋');
    const timerValue = el('div', { className: 'timer-display' }, '00:00');
    let remaining = Number(durationInput.value || defaultSeconds);
    let running = false;

    const formatTime = (seconds) => {
        const safe = Math.max(0, Math.floor(seconds || 0));
        const mins = String(Math.floor(safe / 60)).padStart(2, '0');
        const secs = String(safe % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    };
    const updateLabel = () => {
        timerValue.textContent = formatTime(remaining);
    };
    const stopTimer = () => {
        if (restTimerInterval) {
            clearInterval(restTimerInterval);
            restTimerInterval = null;
        }
        running = false;
        startButton.textContent = '시작';
    };
    const playSound = () => playTimerSound(state.settings?.sound?.volume);

    startButton.addEventListener('click', () => {
        primeTimerSound();
        if (!running) {
            remaining = Number(durationInput.value || remaining);
            if (Number.isNaN(remaining) || remaining <= 0) {
                remaining = defaultSeconds;
            }
            running = true;
            startButton.textContent = '일시정지';
            statusText.textContent = '진행 중';
            updateLabel();
            restTimerInterval = setInterval(() => {
                remaining -= 1;
                if (remaining <= 0) {
                    remaining = 0;
                    updateLabel();
                    statusText.textContent = '완료';
                    stopTimer();
                    playSound();
                    return;
                }
                updateLabel();
            }, 1000);
            return;
        }
        statusText.textContent = '일시정지';
        stopTimer();
    });

    resetButton.addEventListener('click', () => {
        stopTimer();
        remaining = Number(durationInput.value || defaultSeconds);
        statusText.textContent = '대기';
        updateLabel();
    });

    openModal({
        title: '휴식 타이머',
        body: el(
            'div',
            { className: 'stack-form rest-timer' },
            el('label', { className: 'input-label' }, '시간(초)', durationInput),
            timerValue,
            statusText,
            el('div', { className: 'timer-controls' }, startButton, resetButton)
        ),
        submitLabel: '닫기',
        onSubmit: () => true,
        onClose: stopTimer
    });
};
