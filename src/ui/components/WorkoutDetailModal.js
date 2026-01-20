import { el } from '../../utils/dom.js';
import { openModal } from './Modal.js';
import { todayIso } from '../../utils/date.js';

const formatDate = (dateISO) => dateISO || '';
const formatTime = (seconds) => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const mins = String(Math.floor(safe / 60)).padStart(2, '0');
    const secs = String(safe % 60).padStart(2, '0');
    return `${mins}:${secs}`;
};

const findPreviousLog = (userdb, dateISO, exerciseId) => {
    if (!exerciseId) return null;
    const keys = Object.keys(userdb.workout || {}).filter((key) => key < dateISO);
    keys.sort((a, b) => b.localeCompare(a));
    for (const key of keys) {
        const entry = userdb.workout[key];
        const logs = Array.isArray(entry?.logs) ? entry.logs : [];
        const match = logs.find((log) => log.exerciseId === exerciseId);
        if (match) {
            return { date: key, log: match };
        }
    }
    return null;
};

const getNextIncompleteSetIndex = (setsDetail) => {
    return setsDetail.findIndex((set) => !set.completed);
};

export const openWorkoutDetailModal = (store, { log, dateISO, onUpdate }) => {
    const userdb = store.getState().userdb;
    const isToday = dateISO === todayIso();
    const targetState = {
        sets: Number(log.target?.sets || log.sets || 3),
        reps: Number(log.target?.reps || log.reps || 10),
        restSec: Number(log.target?.restSec || 60)
    };
    const targetSets = Math.max(1, Number(targetState.sets || log.sets || 1));
    let defaultReps = Number(targetState.reps || log.reps || 0);
    const defaultWeight = Number(log.weight || 0);
    const setsDetail = Array.isArray(log.setsDetail) ? log.setsDetail.map((set) => ({ ...set })) : [];
    if (setsDetail.length === 0) {
        for (let i = 0; i < targetSets; i += 1) {
            setsDetail.push({ reps: defaultReps, weight: defaultWeight, completed: false });
        }
    } else if (setsDetail.length < targetSets) {
        const missing = targetSets - setsDetail.length;
        for (let i = 0; i < missing; i += 1) {
            setsDetail.push({ reps: defaultReps, weight: defaultWeight, completed: false });
        }
    }
    let mode = 'idle';
    let intervalId = null;
    let workStartAt = 0;
    let restRemaining = Number(targetState.restSec || 60);
    let activeSetIndex = getNextIncompleteSetIndex(setsDetail);
    let restRunning = false;
    const prev = findPreviousLog(userdb, dateISO, log.exerciseId);
    const historyList = (() => {
        if (!prev) return el('div', { className: 'list-subtitle' }, '최근 기록이 없습니다.');
        const prevSets = Array.isArray(prev.log.setsDetail) ? prev.log.setsDetail : [];
        const rows = prevSets.length
            ? prevSets.map((set, index) => {
                const reps = Number(set.reps || 0);
                const weight = Number(set.weight || 0);
                return el(
                    'div',
                    { className: 'row row-gap' },
                    el('div', {}, `세트 ${index + 1}`),
                    el('div', { className: 'badge' }, `${weight}${log.unit || ''} · ${reps}회`)
                );
            })
            : [el('div', { className: 'list-subtitle' }, '이전 세트 기록이 없습니다.')];
        return el(
            'div',
            { className: 'stack-form' },
            el('div', { className: 'list-subtitle' }, `최근 기록: ${formatDate(prev.date)}`),
            ...rows
        );
    })();

    const statusText = el('div', { className: 'list-subtitle' }, isToday ? '오늘 기록' : '과거 기록');
    const progressText = el(
        'div',
        { className: 'list-subtitle' },
        `완료 ${setsDetail.filter((set) => set.completed).length}/${setsDetail.length}`
    );
    const notifyUpdate = () => {
        if (typeof onUpdate !== 'function') return;
        onUpdate({ setsDetail, target: { ...targetState } });
    };
    const setsBadge = el('div', { className: 'badge' }, `${targetState.sets}세트`);
    const repsBadge = el('div', { className: 'badge' }, `${targetState.reps}회`);
    const restBadge = el('div', { className: 'badge' }, `휴식 ${targetState.restSec || 60}s`);
    const targetSetsInput = el('input', { type: 'number', min: '1', value: targetState.sets });
    const targetRepsInput = el('input', { type: 'number', min: '1', value: targetState.reps });
    const targetRestInput = el('input', { type: 'number', min: '0', value: targetState.restSec });
    const applyTargetButton = el('button', { type: 'button', className: 'btn btn-secondary btn-sm' }, '목표 적용');
    applyTargetButton.addEventListener('click', () => {
        const nextSets = Math.max(1, Number(targetSetsInput.value || 1));
        const nextReps = Math.max(1, Number(targetRepsInput.value || 1));
        const nextRest = Math.max(0, Number(targetRestInput.value || 0));
        targetState.sets = nextSets;
        targetState.reps = nextReps;
        targetState.restSec = nextRest;
        defaultReps = nextReps;
        setsBadge.textContent = `${targetState.sets}세트`;
        repsBadge.textContent = `${targetState.reps}회`;
        restBadge.textContent = `휴식 ${targetState.restSec || 60}s`;
        if (setsDetail.length < targetState.sets) {
            const missing = targetState.sets - setsDetail.length;
            for (let i = 0; i < missing; i += 1) {
                setsDetail.push({ reps: defaultReps, weight: defaultWeight, completed: false });
            }
            renderLogList();
        }
        restRemaining = Number(targetState.restSec || 60);
        notifyUpdate();
    });

    const logList = el('div', { className: 'stack-form' });
    const editPanel = el('div', { className: 'stack-form' });
    let editingIndex = null;
    const renderLogList = () => {
        logList.textContent = '';
        setsDetail.forEach((set, index) => {
            const reps = Number(set.reps || 0);
            const weight = Number(set.weight || 0);
            const duration = Number(set.duration || 0);
            const editButton = el(
                'button',
                { type: 'button', className: 'btn btn-secondary btn-sm' },
                '수정'
            );
            const deleteButton = el(
                'button',
                { type: 'button', className: 'btn btn-secondary btn-sm' },
                '삭제'
            );
            editButton.addEventListener('click', () => {
                editingIndex = index;
                renderEditPanel();
            });
            deleteButton.addEventListener('click', () => {
                if (!window.confirm('이 세트를 삭제할까요?')) return;
                setsDetail.splice(index, 1);
                if (editingIndex === index) editingIndex = null;
                if (editingIndex !== null && editingIndex > index) editingIndex -= 1;
                if (activeSetIndex === index) {
                    activeSetIndex = getNextIncompleteSetIndex(setsDetail);
                } else if (activeSetIndex > index) {
                    activeSetIndex -= 1;
                }
                progressText.textContent = `완료 ${setsDetail.filter((s) => s.completed).length}/${setsDetail.length}`;
                renderLogList();
                renderEditPanel();
                notifyUpdate();
            });
            logList.appendChild(
                el(
                    'div',
                    { className: 'row row-gap' },
                    el('div', {}, `세트 ${index + 1}`),
                    el(
                        'div',
                        { className: 'badge' },
                        set.completed
                            ? `${weight}${log.unit || ''} · ${reps}회${duration ? ` · ${duration}s` : ''}`
                            : '미기록'
                    ),
                    el('div', { className: 'row row-gap' }, editButton, deleteButton)
                )
            );
        });
    };
    renderLogList();

    const renderEditPanel = () => {
        editPanel.textContent = '';
        if (editingIndex === null || !setsDetail[editingIndex]) return;
        const current = setsDetail[editingIndex];
        const repsInput = el('input', { type: 'number', min: '1', value: current.reps || defaultReps });
        const weightInput = el('input', { type: 'number', min: '0', value: current.weight || defaultWeight });
        const completedInput = el('input', { type: 'checkbox', checked: Boolean(current.completed) });
        const saveButton = el('button', { type: 'button', className: 'btn' }, '저장');
        const cancelButton = el('button', { type: 'button', className: 'btn btn-secondary' }, '닫기');
        saveButton.addEventListener('click', () => {
            const reps = Number(repsInput.value || 0);
            const weight = Number(weightInput.value || 0);
            if (!reps || Number.isNaN(reps)) return;
            current.reps = reps;
            current.weight = Number.isNaN(weight) ? 0 : weight;
            current.completed = completedInput.checked;
            renderLogList();
            progressText.textContent = `완료 ${setsDetail.filter((s) => s.completed).length}/${setsDetail.length}`;
            notifyUpdate();
            editingIndex = null;
            renderEditPanel();
        });
        cancelButton.addEventListener('click', () => {
            editingIndex = null;
            renderEditPanel();
        });
        editPanel.appendChild(el('div', { className: 'list-subtitle' }, `세트 ${editingIndex + 1} 수정`));
        editPanel.appendChild(el('label', { className: 'input-label' }, '횟수', repsInput));
        editPanel.appendChild(el('label', { className: 'input-label' }, `중량(${log.unit || 'kg'})`, weightInput));
        editPanel.appendChild(el('label', { className: 'input-label' }, '완료', completedInput));
        editPanel.appendChild(el('div', { className: 'row row-gap' }, saveButton, cancelButton));
    };

    const timerDisplay = el('div', { className: 'badge' }, '00:00');
    const timerStatus = el('div', { className: 'list-subtitle' }, '대기 중');
    const controls = el('div', { className: 'row row-gap' });
    const logArea = el('div', { className: 'stack-form' });
    const addSetButton = el('button', { type: 'button', className: 'btn btn-secondary btn-sm' }, '세트 추가');

    const playSound = () => {
        const audio = document.getElementById('timer-sound');
        if (!audio) return;
        const volume = Math.min(1, Math.max(0, Number(store.getState().settings?.sound?.volume || 0) / 100));
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    };
    const stopTimer = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };
    const setMode = (next) => {
        mode = next;
        controls.textContent = '';
        logArea.textContent = '';
        if (!isToday) return;
        if (activeSetIndex < 0) {
            timerStatus.textContent = '오늘 기록 완료';
            timerDisplay.textContent = '00:00';
            return;
        }
        if (mode === 'idle') {
            timerStatus.textContent = '준비';
            timerDisplay.textContent = '00:00';
            controls.appendChild(
                el(
                    'button',
                    { type: 'button', className: 'btn' },
                    '세트 시작'
                )
            );
        }
        if (mode === 'work') {
            timerStatus.textContent = '운동 중';
            controls.appendChild(
                el(
                    'button',
                    { type: 'button', className: 'btn' },
                    '세트 완료'
                )
            );
        }
        if (mode === 'log') {
            timerStatus.textContent = restRunning ? '휴식 중 · 기록 입력' : '기록 입력';
            const repsInput = el('input', { type: 'number', min: '1', value: setsDetail[activeSetIndex]?.reps || defaultReps });
            const weightInput = el('input', { type: 'number', min: '0', value: setsDetail[activeSetIndex]?.weight || defaultWeight });
            logArea.appendChild(
                el('label', { className: 'input-label' }, '횟수', repsInput)
            );
            logArea.appendChild(
                el('label', { className: 'input-label' }, `중량(${log.unit || 'kg'})`, weightInput)
            );
            controls.appendChild(
                el(
                    'button',
                    { type: 'button', className: 'btn' },
                    '기록 저장'
                )
            );
            controls.lastChild.addEventListener('click', () => {
                const reps = Number(repsInput.value || 0);
                const weight = Number(weightInput.value || 0);
                const duration = Math.max(0, Math.round((Date.now() - workStartAt) / 1000));
                if (!reps || Number.isNaN(reps)) return;
                const targetSet = setsDetail[activeSetIndex];
                targetSet.reps = reps;
                targetSet.weight = Number.isNaN(weight) ? 0 : weight;
                targetSet.duration = duration;
                targetSet.completed = true;
                notifyUpdate();
                progressText.textContent = `완료 ${setsDetail.filter((set) => set.completed).length}/${setsDetail.length}`;
                renderLogList();
                activeSetIndex = getNextIncompleteSetIndex(setsDetail);
                if (activeSetIndex < 0) {
                    setMode('done');
                    timerStatus.textContent = '오늘 기록 완료';
                    timerDisplay.textContent = '00:00';
                    return;
                }
                if (restRemaining <= 0) {
                    setMode('idle');
                } else {
                    setMode('rest');
                }
            });
        }
        if (mode === 'rest') {
            timerStatus.textContent = '휴식 중';
            controls.appendChild(
                el(
                    'button',
                    { type: 'button', className: 'btn btn-secondary' },
                    '휴식 건너뛰기'
                )
            );
            controls.lastChild.addEventListener('click', () => {
                stopTimer();
                restRunning = false;
                restRemaining = 0;
                setMode('idle');
            });
        }
        if (mode === 'done') {
            timerStatus.textContent = '오늘 기록 완료';
            timerDisplay.textContent = '00:00';
        }
    };
    const startWorkTimer = () => {
        stopTimer();
        workStartAt = Date.now();
        timerDisplay.textContent = '00:00';
        intervalId = setInterval(() => {
            const elapsed = Math.floor((Date.now() - workStartAt) / 1000);
            timerDisplay.textContent = formatTime(elapsed);
        }, 1000);
    };
    const startRestTimer = () => {
        stopTimer();
        restRunning = true;
        timerDisplay.textContent = formatTime(restRemaining);
        intervalId = setInterval(() => {
            restRemaining -= 1;
            if (restRemaining <= 0) {
                restRemaining = 0;
                timerDisplay.textContent = formatTime(restRemaining);
                stopTimer();
                restRunning = false;
                playSound();
                if (mode === 'log') {
                    timerStatus.textContent = '휴식 완료 · 기록 입력';
                } else {
                    setMode('idle');
                }
                return;
            }
            timerDisplay.textContent = formatTime(restRemaining);
        }, 1000);
    };

    const wireButtons = () => {
        const buttons = controls.querySelectorAll('button');
        if (buttons.length === 0) return;
        const primary = buttons[0];
        primary.addEventListener('click', () => {
            if (mode === 'idle') {
                setMode('work');
                startWorkTimer();
                return;
            }
            if (mode === 'work') {
                stopTimer();
                restRemaining = Number(targetState.restSec || 60);
                startRestTimer();
                setMode('log');
            }
        });
    };

    openModal({
        title: log.name || '운동 상세',
        body: el(
            'div',
            { className: 'stack-form' },
            historyList,
            el(
                'div',
                { className: 'row row-gap' },
                setsBadge,
                repsBadge,
                restBadge
            ),
            el(
                'div',
                { className: 'stack-form' },
                el('div', { className: 'list-subtitle' }, '세트 목표'),
                el(
                    'div',
                    { className: 'row row-gap' },
                    el('label', { className: 'input-label' }, '세트', targetSetsInput),
                    el('label', { className: 'input-label' }, '횟수', targetRepsInput)
                ),
                el('label', { className: 'input-label' }, '휴식(초)', targetRestInput),
                el('div', { className: 'row row-gap' }, applyTargetButton)
            ),
            statusText,
            progressText,
            logList,
            editPanel,
            isToday
                ? el(
                    'div',
                    { className: 'stack-form' },
                    el('div', { className: 'row row-gap' }, addSetButton),
                    timerDisplay,
                    timerStatus,
                    controls,
                    logArea
                )
                : el('div', { className: 'list-subtitle' }, '과거 날짜는 타이머 없이 수정/삭제만 가능합니다.')
        ),
        submitLabel: '닫기',
        onSubmit: () => {
            stopTimer();
            return true;
        }
    });

    if (isToday) {
        addSetButton.addEventListener('click', () => {
            setsDetail.push({ reps: defaultReps, weight: defaultWeight, completed: false });
            notifyUpdate();
            progressText.textContent = `완료 ${setsDetail.filter((set) => set.completed).length}/${setsDetail.length}`;
            renderLogList();
            if (activeSetIndex < 0) {
                activeSetIndex = getNextIncompleteSetIndex(setsDetail);
            }
        });
        setMode(activeSetIndex < 0 ? 'done' : 'idle');
        wireButtons();
        const observer = new MutationObserver(() => wireButtons());
        observer.observe(controls, { childList: true });
    }
};
