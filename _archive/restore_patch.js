
// --- RESTORED TIMER LOGIC (V28 Fix) ---

// Ensure Audio is defined
const TIMER_AUDIO = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3');

window.openWorkoutDetail = (planIdxOrExName) => {
    // Determine if input is index or name (Cardio might pass name, List passes index)
    let exName = planIdxOrExName;
    let planIdx = -1;
    let targets = null;

    if (typeof planIdxOrExName === 'number') {
        planIdx = planIdxOrExName;
        const planKey = `plan_${state.date}`;
        const plan = Store.get(planKey, []);
        const item = plan[planIdx];
        if (!item) return;
        exName = typeof item === 'string' ? item : item.name;
        targets = typeof item === 'string' ?
            (EXERCISE_DB[exName] || { sets: 3, reps: "8-12", rest: 90 }) :
            { sets: item.sets, reps: item.reps, rest: item.rest };
    } else {
        // Direct name call (fallback)
        const db = EXERCISE_DB[exName] || { sets: 3, reps: "8-12", rest: 90 };
        targets = { sets: db.sets, reps: db.reps || db.target, rest: db.rest };
    }

    // Modal creation
    const modal = createModal(getDisplayName(exName));
    const logKey = `workout_${state.date}`;
    const logs = Store.get(logKey, {});
    const exLogs = logs[exName] || [];

    // Unit Setup
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wUnit = units.workout;
    const wLabel = Unit.getLabel('workout', wUnit);
    const displayWt = (val) => Unit.displayVal(val, 'workout', wUnit);

    // History Lookup
    const history = getExerciseHistory(exName, state.date);
    let historyHtml = `<div style="font-size:13px; color:gray; margin-bottom:15px; text-align:center;">${t('workout.no_history')}</div>`;

    if (history) {
        let rows = history.logs.map((l, i) =>
            `<div style="display:flex; justify-content:space-between; padding:2px 0;">
                <span>${t('workout.set_num').replace('{0}', i + 1)}</span>
                <span style="font-weight:600; color:var(--ios-blue);">
                    ${displayWt(l.wt)}${wLabel} x ${l.reps}
                    <span style="font-size:11px; color:#aaa; font-weight:400;">(${l.duration || 0}s)</span>
                </span>
            </div>`
        ).join('');
        historyHtml = `
            <div style="background:#f5f5f5; border-radius:10px; padding:10px; margin-bottom:15px;">
                <div style="font-size:12px; color:#888; margin-bottom:5px; text-align:center;">${t('workout.last_session')}: ${history.date}</div>
                ${rows}
            </div>`;
    }

    // Defaults
    const lastWt = exLogs.length > 0 ? exLogs[exLogs.length - 1].wt : (history && history.logs.length > 0 ? history.logs[history.logs.length - 1].wt : '');
    const lastReps = exLogs.length > 0 ? exLogs[exLogs.length - 1].reps : (history && history.logs.length > 0 ? history.logs[history.logs.length - 1].reps : '');

    // Current Logs
    let logHtml = `<div id="todayLogsList" style="display:flex; flex-direction:column; gap:8px;">`;
    if (exLogs.length === 0) {
        logHtml += `<div id="noLogsMsg" style="color:gray; text-align:center; padding:10px; font-size:13px;">No sets completed today</div>`;
    } else {
        exLogs.forEach((l, idx) => {
            const safeName = exName.replace(/'/g, "\\'");
            logHtml += `
                <div onclick="editSetLog('${safeName}', ${idx})" style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:8px; cursor:pointer;">
                    <div style="font-weight:600; color:gray;">${t('workout.set_num').replace('{0}', idx + 1)}</div>
                    <div style="font-weight:700;">
                        ${displayWt(l.wt)}${wLabel} x ${l.reps}
                        <span style="font-size:11px; color:#aaa; font-weight:400; margin-left:5px;">(${l.duration || 0}s)</span>
                    </div>
                </div>`;
        });
    }
    logHtml += '</div>';

    // Normalize Date check (isToday?)
    const todayStr = normalizeDate();
    const isToday = state.date === todayStr;
    const isFuture = window.isFutureDate ? window.isFutureDate(state.date) : false;

    modal.innerHTML = `
        <div style="margin-bottom:15px;">
            ${historyHtml}

            <!-- Targets -->
             <div style="display:flex; gap:10px; margin-bottom:15px; background:#f9f9f9; padding:10px; border-radius:12px; align-items:center; text-align:center;">
                <div style="flex:1;">
                    <label style="font-size:10px; color:gray;">SETS</label>
                    <input type="number" value="${targets.sets}" onchange="updatePlanTarget(${planIdx}, 'sets', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px; text-align:center;">
                </div>
                <div style="flex:1; border-left:1px solid #eee; border-right:1px solid #eee;">
                    <label style="font-size:10px; color:gray;">REPS</label>
                    <input type="text" value="${targets.reps}" onchange="updatePlanTarget(${planIdx}, 'reps', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px; text-align:center;">
                </div>
                <div style="flex:1;">
                    <label style="font-size:10px; color:gray;">REST</label>
                    <input type="number" value="${targets.rest}" onchange="updatePlanTarget(${planIdx}, 'rest', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; font-size:16px; text-align:center;">
                </div>
            </div>
            
            <!-- Timer Section -->
            ${isToday ? `
            <div id="timerSection" style="text-align:center; padding:10px 0; margin-bottom:10px;">
                <div id="timerDisplay" style="font-size:56px; font-weight:800; font-variant-numeric:tabular-nums; margin-bottom:15px; color:#333;">00:00</div>
                <div id="timerStatus" style="font-size:14px; color:gray; margin-bottom:10px; font-weight:600; min-height:20px;">READY</div>
                <div id="timerControls">
                    <button id="mainTimerBtn" onclick="startSet('${exName}', ${targets.rest})" style="width:100%; padding:18px; background:var(--ios-blue); color:white; border:none; border-radius:16px; font-size:18px; font-weight:700; transition: all 0.2s;">
                        ${t('workout.start_set')}
                    </button>
                </div>
            </div>` : ''}

            <!-- Manual Log (Past) -->
            ${!isToday && !isFuture ? `
            <div id="manualLogControls" style="margin-bottom:10px;">
                 <button onclick="saveSetLog('${exName}')" style="width:100%; padding:15px; background:var(--ios-blue); color:white; border:none; border-radius:12px; font-size:16px; font-weight:700;">
                    ${t('workout.log_record')}
                 </button>
            </div>` : ''}

            <!-- Edit Controls -->
            <div id="editLogControls" style="display:none; margin-bottom:15px; padding:15px; background:#f0f0f0; border-radius:12px;">
                <div style="font-weight:700; margin-bottom:10px; text-align:center; font-size:14px;">${t('workout.edit_log')}</div>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <button onclick="updateSetLog()" style="flex:1; padding:12px; background:var(--ios-blue); color:white; border:none; border-radius:10px; font-weight:600;">${t('workout.update')}</button>
                    <button onclick="deleteSetLog()" style="flex:1; padding:12px; background:var(--ios-red); color:white; border:none; border-radius:10px; font-weight:600;">${t('workout.delete_log')}</button>
                </div>
                <button onclick="cancelEditLog()" style="width:100%; padding:10px; background:#ccc; color:white; border:none; border-radius:10px; font-weight:600;">${t('workout.cancel')}</button>
            </div>

            <!-- Log Form -->
            <div id="logFormArea" style="display:${isFuture ? 'none' : 'block'}; margin-top:10px; border-top:1px solid #eee; padding-top:15px;">
                <div style="font-size:13px; font-weight:700; margin-bottom:10px; color:#333;">${t('workout.log_input_header')}</div>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <div style="flex:1;">
                        <input type="number" id="logWt" placeholder="Wt (${wLabel})" value="${lastWt ? displayWt(lastWt) : ''}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; font-size:18px; text-align:center; font-weight:600;">
                    </div>
                    <div style="flex:1;">
                        <input type="number" id="logReps" placeholder="Reps" value="${lastReps || ''}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; font-size:18px; text-align:center; font-weight:600;">
                    </div>
                </div>
                <!-- Hidden Duration -->
                <input type="hidden" id="logDuration" value="0">
            </div>

            <div style="margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                <h3 style="margin:0 0 10px 0; font-size:14px; color:#666;">${t('workout.today')}</h3>
                ${logHtml}
            </div>
        </div>
    `;

    // Restore Timer UI if active
    if (state.timer.exercise === exName && state.timer.mode) {
        updateTimerUI(state.timer.mode, exName);
    }
};

window.updatePlanTarget = (idx, field, val) => {
    if (idx < 0) return;
    const planKey = `plan_${state.date}`;
    const plan = Store.get(planKey, []);
    const item = plan[idx];
    if (!item) return;

    if (typeof item === 'string') {
        const db = EXERCISE_DB[item] || { sets: 3, reps: "8-12", rest: 90 };
        plan[idx] = { name: item, sets: db.sets, reps: db.reps || db.target, rest: db.rest };
        plan[idx][field] = val;
    } else {
        item[field] = val;
    }
    Store.set(planKey, plan);
};

// Timer Functions
window.startSet = (exName, restTime) => {
    if (window.isFutureDate && window.isFutureDate(state.date)) return alert(t('workout.future_date_warning'));

    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.mode = 'work';
    state.timer.seconds = 0;
    state.timer.exercise = exName;
    state.timer.targetRest = restTime || 90;

    updateTimerUI('work', exName);

    state.timer.intervalId = setInterval(() => {
        state.timer.seconds++;
        const display = document.getElementById('timerDisplay');
        if (display) display.innerText = formatTime(state.timer.seconds);
        const durInput = document.getElementById('logDuration');
        if (durInput) durInput.value = state.timer.seconds;
    }, 1000);
};

window.finishWorkSet = () => {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);

    state.timer.lastWorkDuration = state.timer.seconds;
    state.timer.mode = 'log';
    state.timer.seconds = state.timer.targetRest;

    // Start Rest Countdown
    state.timer.intervalId = setInterval(() => {
        if (state.timer.seconds > 0) {
            state.timer.seconds--;
        } else {
            if (state.timer.seconds === 0) playTimerSound();
            clearInterval(state.timer.intervalId);
        }

        if (state.timer.mode === 'rest') {
            const display = document.getElementById('timerDisplay');
            const controls = document.getElementById('timerControls');
            if (display) display.innerText = formatTime(state.timer.seconds);
            if (state.timer.seconds <= 0 && controls) {
                controls.innerHTML = `<button onclick="startSet('${state.timer.exercise}', ${state.timer.targetRest})" style="width:100%; padding:20px; background:var(--ios-green); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.start_next_set')}</button>`;
            }
        }
    }, 1000);

    updateTimerUI('log');
};

window.saveSetLog = (exName) => {
    const wtInput = document.getElementById('logWt').value;
    const repsInput = document.getElementById('logReps').value;
    const durInput = state.timer.lastWorkDuration || 0;

    if (!wtInput || !repsInput) return alert("Weight and Reps required");

    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wt = Unit.parseVal(wtInput, 'workout', units.workout);

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {});
    if (!logs[exName]) logs[exName] = [];
    logs[exName].push({
        wt,
        reps: repsInput,
        duration: parseInt(durInput),
        timestamp: Date.now()
    });
    Store.set(key, logs);

    // Update UI
    refreshLogList(exName);

    // Switch to Rest
    state.timer.mode = 'rest';
    updateTimerUI('rest');
};

window.skipRest = () => {
    startSet(state.timer.exercise, state.timer.targetRest);
};

window.updateTimerUI = (mode, exName) => {
    const status = document.getElementById('timerStatus');
    const display = document.getElementById('timerDisplay');
    const controls = document.getElementById('timerControls');
    const logArea = document.getElementById('logFormArea');

    if (!controls || !status || !display) return;

    if (mode === 'work') {
        status.innerText = t('workout.work_mode');
        status.style.color = 'var(--ios-green)';
        display.innerText = formatTime(state.timer.seconds);
        display.style.color = 'var(--ios-green)';
        controls.innerHTML = `<button onclick="finishWorkSet()" style="width:100%; padding:20px; background:var(--ios-red); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.finish_set')}</button>`;
    } else if (mode === 'log') {
        status.innerText = t('workout.finish_set');
        status.style.color = '#333';
        display.innerText = formatTime(state.timer.lastWorkDuration);
        display.style.color = '#333';
        controls.innerHTML = `<button onclick="saveSetLog('${state.timer.exercise}')" style="width:100%; padding:20px; background:var(--ios-blue); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.log_this_set')}</button>`;
        setTimeout(() => { if (document.getElementById('logWt')) document.getElementById('logWt').focus(); }, 100);
    } else if (mode === 'rest') {
        status.innerText = t('workout.rest_mode');
        // display managed by interval
        if (state.timer.seconds <= 0) {
            controls.innerHTML = `<button onclick="startSet('${state.timer.exercise}', ${state.timer.targetRest})" style="width:100%; padding:20px; background:var(--ios-green); color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.start_next_set')}</button>`;
        } else {
            controls.innerHTML = `<button onclick="skipRest()" style="width:100%; padding:20px; background:#888; color:white; border:none; border-radius:16px; font-size:20px; font-weight:700;">${t('workout.skip_rest')}</button>`;
        }
    }
};

window.editSetLog = (exName, idx) => {
    const key = `workout_${state.date}`;
    const logs = Store.get(key, {})[exName];
    if (!logs || !logs[idx]) return;
    const log = logs[idx];

    state.editingLog = { name: exName, index: idx };

    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const displayWt = Unit.displayVal(log.wt, 'workout', units.workout);

    const wtInput = document.getElementById('logWt');
    const repsInput = document.getElementById('logReps');
    if (wtInput) wtInput.value = displayWt;
    if (repsInput) repsInput.value = log.reps;

    // Toggle UI
    if (document.getElementById('timerSection')) document.getElementById('timerSection').style.display = 'none';
    if (document.getElementById('manualLogControls')) document.getElementById('manualLogControls').style.display = 'none';
    if (document.getElementById('editLogControls')) document.getElementById('editLogControls').style.display = 'block';
    if (document.getElementById('logFormArea')) document.getElementById('logFormArea').style.display = 'block';
};

window.cancelEditLog = () => {
    state.editingLog = null;
    if (document.getElementById('logWt')) document.getElementById('logWt').value = '';
    if (document.getElementById('logReps')) document.getElementById('logReps').value = '';

    if (document.getElementById('editLogControls')) document.getElementById('editLogControls').style.display = 'none';

    // Restore
    const isToday = state.date === normalizeDate();
    if (isToday && document.getElementById('timerSection')) {
        document.getElementById('timerSection').style.display = 'block';
        if (state.timer.mode && state.timer.exercise) updateTimerUI(state.timer.mode, state.timer.exercise);
    } else if (document.getElementById('manualLogControls')) {
        document.getElementById('manualLogControls').style.display = 'block';
    }
};

window.updateSetLog = () => {
    if (!state.editingLog) return;
    const { name, index } = state.editingLog;
    const wtInput = document.getElementById('logWt');
    const repsInput = document.getElementById('logReps');

    if (!wtInput || !repsInput) return;

    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wt = Unit.parseVal(wtInput.value, 'workout', units.workout);

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {});
    if (logs[name] && logs[name][index]) {
        logs[name][index].wt = wt;
        logs[name][index].reps = repsInput.value;
        Store.set(key, logs);
    }

    refreshLogList(name);
    cancelEditLog();
};

window.deleteSetLog = () => {
    if (!state.editingLog) return;
    if (!confirm(t('workout.delete_log') + '?')) return;
    const { name, index } = state.editingLog;

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {});
    if (logs[name]) {
        logs[name].splice(index, 1);
        Store.set(key, logs);
    }
    refreshLogList(name);
    cancelEditLog();
};

function refreshLogList(exName) {
    const list = document.getElementById('todayLogsList');
    if (!list) return;

    const key = `workout_${state.date}`;
    const logs = Store.get(key, {})[exName] || [];
    const units = Store.get('user_settings', {}).units || Unit.defaults;
    const wLabel = Unit.getLabel('workout', units.workout);
    const displayWt = (val) => Unit.displayVal(val, 'workout', units.workout);

    if (logs.length === 0) {
        list.innerHTML = `<div id="noLogsMsg" style="color:gray; text-align:center; padding:10px; font-size:13px;">${t('workout.no_history')}</div>`;
        return;
    }

    let html = '';
    logs.forEach((l, idx) => {
        const safeName = exName.replace(/'/g, "\\'");
        html += `
            <div onclick="editSetLog('${safeName}', ${idx})" style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:5px; cursor:pointer;">
                <div style="font-weight:600; color:gray;">${t('workout.set_num').replace('{0}', idx + 1)}</div>
                <div style="font-weight:700;">
                    ${displayWt(l.wt)}${wLabel} x ${l.reps}
                    <span style="font-size:11px; color:#aaa; font-weight:400; margin-left:5px;">(${l.duration || 0}s)</span>
                </div>
            </div>`;
    });
    list.innerHTML = html;
}

function getExerciseHistory(name, viewDateStr) {
    let viewDate = new Date();
    try {
        if (viewDateStr) {
            const p = viewDateStr.match(/(\d+)/g);
            if (p && p.length >= 3) viewDate = new Date(p[0], p[1] - 1, p[2]);
        }
    } catch (e) { }

    for (let i = 1; i <= 60; i++) {
        const d = new Date(viewDate);
        d.setDate(d.getDate() - i);
        const dateStr = normalizeDate(d);
        const key = `workout_${dateStr}`;
        const logs = Store.get(key, {});
        if (logs[name] && logs[name].length > 0) {
            return { date: dateStr, logs: logs[name] };
        }
    }
    return null;
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function playTimerSound() {
    try { TIMER_AUDIO.play(); } catch (e) { }
}

window.changeDate = window.changeDate || ((offset) => {
    let current = new Date();
    try {
        const p = state.date.match(/(\d+)/g);
        if (p && p.length >= 3) current = new Date(p[0], p[1] - 1, p[2]);
    } catch (e) { }

    current.setDate(current.getDate() + offset);
    state.date = normalizeDate(current);
    render();
});
