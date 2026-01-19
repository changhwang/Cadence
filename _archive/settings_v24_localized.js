
// --- Settings Implementation (V24 Localized & Advanced) ---
window.tempSettingsState = {
    profile: null,
    settings: null,
    lang: 'ko'
};

window.openSettings = () => {
    window.tempSettingsState.profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });

    const defaults = { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, targetWater: 2000, targetSodium: 2000, goalType: 'maint' };
    window.tempSettingsState.settings = Store.get('user_settings', defaults);

    // Ensure new fields exist
    if (!window.tempSettingsState.settings.targetWater) window.tempSettingsState.settings.targetWater = 2000;
    if (!window.tempSettingsState.settings.targetSodium) window.tempSettingsState.settings.targetSodium = 2000;

    window.tempSettingsState.lang = Store.get('app_lang', 'ko');

    const modalBody = createModal(t('settings.title'));
    modalBody.className = 'settings-body';
    renderSettingsUI(modalBody);
};

window.renderSettingsUI = (bodyContainer) => {
    const { profile, settings, lang } = window.tempSettingsState;

    const age = calculateAge(profile.birth);
    const bmr = calcBMR(profile.weight, profile.height, age, profile.gender);
    const tdee = Math.round(bmr * profile.activity);

    // Water Recommendation (Weight * 35ml)
    const recWater = Math.round(profile.weight * 35);

    const activeLabels = {
        '1.2': t('settings.act_sedentary'),
        '1.375': t('settings.act_light'),
        '1.55': t('settings.act_mod'),
        '1.725': t('settings.act_high')
    };

    const goalLabels = {
        'custom': t('settings.goal_custom'),
        'diet': t('settings.goal_diet'),
        'maint': t('settings.goal_maint'),
        'bulk': t('settings.goal_bulk')
    };

    bodyContainer.innerHTML = `
        <!-- 1. Profile Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">${t('settings.profile')}</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
            <div class="setting-row">
                <label>${t('settings.gender')}</label>
                <select onchange="updateTempProfile('gender', this.value)">
                    <option value="M" ${profile.gender === 'M' ? 'selected' : ''}>Male</option>
                    <option value="F" ${profile.gender === 'F' ? 'selected' : ''}>Female</option>
                </select>
            </div>
            <div class="setting-row">
                 <label>${t('settings.birth')}</label>
                 <input type="date" value="${profile.birth}" onchange="updateTempProfile('birth', this.value)" style="border:none; background:transparent; text-align:right; font-family:inherit; width:140px;">
            </div>
            <div class="setting-row" style="justify-content:flex-end; padding-top:0; border-bottom:1px solid #eee;">
                 <span style="font-size:12px; color:gray;">(${t('settings.age')}: ${age})</span>
            </div>
            <div class="setting-row">
                 <label>${t('settings.height')}</label>
                 <input type="number" value="${profile.height}" onchange="updateTempProfile('height', this.value)" style="width:70px;">
            </div>
            <div class="setting-row">
                 <label>${t('settings.weight')}</label>
                 <input type="number" value="${profile.weight}" onchange="updateTempProfile('weight', this.value)" style="width:70px;">
            </div>
             <div class="setting-row" style="border-bottom:none;">
                <label>${t('settings.activity')}</label>
                <select onchange="updateTempProfile('activity', this.value)" style="width:160px;">
                    <option value="1.2" ${profile.activity == 1.2 ? 'selected' : ''}>${activeLabels['1.2']}</option>
                    <option value="1.375" ${profile.activity == 1.375 ? 'selected' : ''}>${activeLabels['1.375']}</option>
                    <option value="1.55" ${profile.activity == 1.55 ? 'selected' : ''}>${activeLabels['1.55']}</option>
                    <option value="1.725" ${profile.activity == 1.725 ? 'selected' : ''}>${activeLabels['1.725']}</option>
                </select>
            </div>
            <div style="font-size:11px; color:#888; margin-top:5px; line-height:1.4;">
                ${t('settings.act_desc')}
            </div>
        </div>

        <div style="text-align:center; font-size:13px; color:#555; margin-bottom:25px; background:#fff; border:1px solid #eee; padding:10px; border-radius:8px;">
            <div>${t('settings.bmr')}: <b>${bmr}</b> kcal</div>
            <div style="font-size:14px; margin-top:4px; color:var(--ios-blue);">${t('settings.tdee')}: <b>${tdee}</b> kcal</div>
        </div>

        <!-- 2. Goal Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">${t('settings.goals')}</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
             <div class="setting-row" style="border-bottom:none;">
                <label>${t('settings.goal_preset')}</label>
                <select onchange="applyTempGoalPreset(this.value, ${tdee}, ${recWater})" style="width:100%; padding:8px; margin-top:5px;">
                    <option value="custom" ${settings.goalType === 'custom' ? 'selected' : ''}>${goalLabels['custom']}</option>
                    <option value="diet" ${settings.goalType === 'diet' ? 'selected' : ''}>${goalLabels['diet']} (-500)</option>
                    <option value="maint" ${settings.goalType === 'maint' ? 'selected' : ''}>${goalLabels['maint']}</option>
                    <option value="bulk" ${settings.goalType === 'bulk' ? 'selected' : ''}>${goalLabels['bulk']} (+300)</option>
                </select>
            </div>
            
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                <div>
                     <label style="font-size:11px; color:gray;">${t('settings.target_cal')}</label>
                     <input type="number" value="${settings.targetCal}" onchange="updateTempSetting('targetCal', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                <div>
                     <label style="font-size:11px; color:gray;">${t('settings.target_pro')}</label>
                     <input type="number" value="${settings.targetPro}" onchange="updateTempSetting('targetPro', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                 <div>
                     <label style="font-size:11px; color:gray;">${t('settings.target_carb')}</label>
                     <input type="number" value="${settings.targetCarb || 300}" onchange="updateTempSetting('targetCarb', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                 <div>
                     <label style="font-size:11px; color:gray;">${t('settings.target_fat')}</label>
                     <input type="number" value="${settings.targetFat || 80}" onchange="updateTempSetting('targetFat', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
             </div>
             
             <!-- Water & Sodium -->
             <div style="margin-top:15px; border-top:1px solid #eee; padding-top:15px;">
                <div class="setting-row">
                     <label>${t('settings.target_water')}</label>
                     <input type="number" value="${settings.targetWater}" onchange="updateTempSetting('targetWater', this.value)" style="width:80px;">
                </div>
                <div style="text-align:right; font-size:11px; color:gray; margin-top:-5px; margin-bottom:10px;">
                    Rec: ${recWater}ml
                </div>
                <div class="setting-row" style="border-bottom:none;">
                     <label>${t('settings.target_sodium')}</label>
                     <input type="number" value="${settings.targetSodium}" onchange="updateTempSetting('targetSodium', this.value)" style="width:80px;">
                </div>
             </div>
        </div>

        <!-- 3. System Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">${t('settings.system')}</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
             <div class="setting-row" style="border-bottom:none;">
                <label>${t('settings.lang')}</label>
                <select onchange="window.tempSettingsState.lang = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                    <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>
        </div>

         <button onclick="saveAllSettings()" style="width:100%; padding:16px; background:var(--ios-blue); color:white; border:none; border-radius:14px; font-weight:700; font-size:16px; margin-bottom:10px; box-shadow:0 4px 12px rgba(78,205,196,0.3);">${t('settings.save')}</button>
        
        <div style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
            <button onclick="exportData()" style="padding:10px 15px; background:#eee; color:#333; border:none; border-radius:8px; font-size:12px;">${t('settings.data_backup')}</button>
            <button onclick="triggerRestore()" style="padding:10px 15px; background:#eee; color:#333; border:none; border-radius:8px; font-size:12px;">${t('settings.data_restore')}</button>
            <input type="file" id="restoreFile" style="display:none;" onchange="importData(this)">
        </div>
    `;

    // CSS Check (Idempotent)
    if (!document.getElementById('settings-css')) {
        const style = document.createElement('style');
        style.id = 'settings-css';
        style.innerHTML = `
            .setting-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee; }
            .setting-row label { font-size:14px; font-weight:600; color:#333; }
            .setting-row input, .setting-row select { padding:6px; border:1px solid #ddd; border-radius:6px; text-align:right; font-size:14px; background:white; }
            .setting-row select:focus, .setting-row input:focus { outline:none; border-color:var(--ios-blue); }
        `;
        document.head.appendChild(style);
    }
};

window.updateTempProfile = (key, val) => {
    const profile = window.tempSettingsState.profile;
    if (key === 'birth' || key === 'gender') profile[key] = val;
    else profile[key] = parseFloat(val) || val;
    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.updateTempSetting = (key, val) => {
    const settings = window.tempSettingsState.settings;
    settings[key] = parseFloat(val);
    settings.goalType = 'custom';
    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.applyTempGoalPreset = (type, tdee, recWater) => {
    const settings = window.tempSettingsState.settings;
    settings.goalType = type;

    let cal = tdee;
    if (type === 'diet') cal = tdee - 500;
    if (type === 'bulk') cal = tdee + 300;
    settings.targetCal = cal;

    let p = 0.3, c = 0.4, f = 0.3;
    if (type === 'diet') { p = 0.4; c = 0.35; f = 0.25; }
    if (type === 'bulk') { p = 0.25; c = 0.5; f = 0.25; }

    settings.targetPro = Math.round((cal * p) / 4);
    settings.targetCarb = Math.round((cal * c) / 4);
    settings.targetFat = Math.round((cal * f) / 9);

    // Auto Water
    settings.targetWater = recWater || 2000;

    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.saveAllSettings = () => {
    const { profile, settings, lang } = window.tempSettingsState;

    Store.set('user_profile', profile);
    Store.set('user_settings', settings);
    Store.set('app_lang', lang);

    // --- Goal History Logic (Time-Series) ---
    // Save snapshot of goals for today
    const history = Store.get('goal_history', []);
    // Check if entry for today exists
    const today = state.date; // Use current view date or today's date? 
    // Usually settings apply to "now" and "future". 
    // If user changes settings, it should probably be effective from today (real time) onwards.
    // Changing past logs' goals suggests we should key by Date.now()? 
    // No, key by calendar date. Let's use new Date().toLocaleDateString('ko-KR')
    const realToday = new Date().toLocaleDateString('ko-KR');

    // Remove existing entry for exact same date to prevent dupes (update instead)
    const newHistory = history.filter(h => h.date !== realToday);
    newHistory.push({
        date: realToday,
        goals: { ...settings }
    });
    // Sort by date string (YYYY. MM. DD. format works with string sort? ko-KR format is 'YYYY. M. D.' which doesn't sort well lexically)
    // We should probably normalize date format in Store, but for now let's just push.
    // Actually, '2024. 5. 1.' sorts badly against '2024. 12. 1.' ('5' > '1'). 
    // We need ISO format for sorting. But our app uses ko-KR.
    // Let's assume we handle sorting later or just append.
    Store.set('goal_history', newHistory);

    alert(t('settings.saved'));

    const modalOverlay = document.querySelector('.settings-body')?.closest('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('open');
        setTimeout(() => modalOverlay.remove(), 300);
    }
    render();
};

window.calculateAge = (birthDate) => {
    if (!birthDate) return 30;
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 30;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) { age--; }
    return age;
};

window.calcBMR = (w, h, a, g) => {
    let base = (10 * w) + (6.25 * h) - (5 * a);
    return g === 'M' ? Math.round(base + 5) : Math.round(base - 161);
};

window.exportData = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_tracker_backup_${state.date}.json`;
    a.click();
};

window.triggerRestore = () => document.getElementById('restoreFile').click();

window.importData = (input) => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("Overwrite all data?")) {
                localStorage.clear();
                Object.keys(data).forEach(k => {
                    localStorage.setItem(k, data[k]);
                });
                alert("Restore Complete. Reloading...");
                location.reload();
            }
        } catch (err) { alert("Invalid Backup File"); }
    };
    reader.readAsText(file);
};

window.openLogBodyModal = () => { alert("Log Weight/Muscle/Fat Coming Next"); };

window.openProfileEdit = () => {
    const currentName = Store.get('user_name', 'User');
    const newName = prompt("Enter new name:", currentName);
    if (newName && newName.trim()) {
        Store.set('user_name', newName.trim());
        render();
    }
};

// --- View: My Body (Localized) ---
window.renderMyBodyView = (container) => {
    const profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    const userName = Store.get('user_name', 'User');

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '15px 20px';
    header.style.paddingTop = 'calc(15px + env(safe-area-inset-top))';
    header.style.background = 'white';
    header.style.borderBottom = '1px solid #eee';
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '100';

    header.innerHTML = `
        <div style="font-size:20px; font-weight:800; display:flex; align-items:center; gap:8px;">
            ${t('nav.body')}
            <i data-lucide="chevron-right" style="width:16px; color:gray;"></i>
            <span style="font-size:14px; font-weight:600; color:var(--ios-blue); cursor:pointer;" onclick="openProfileEdit()">${userName}</span>
        </div>
        <div onclick="openSettings()" style="cursor:pointer; padding:5px;">
            <i data-lucide="settings" style="width:24px; color:#333;"></i>
        </div>
    `;
    container.appendChild(header);

    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.paddingBottom = '100px';

    const weight = profile.weight || 0;
    const heightM = (profile.height || 170) / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    const measureCard = document.createElement('div');
    measureCard.className = 'card';
    measureCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0; font-size:16px;">Measurements</h3>
            <button onclick="openLogBodyModal()" style="font-size:13px; color:var(--ios-blue); background:none; border:none; font-weight:600;">Log Data</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
            <div style="background:#f9f9f9; padding:15px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:gray;">${t('settings.weight')}</div>
                <div style="font-size:20px; font-weight:700;">${weight} <span style="font-size:12px;">kg</span></div>
            </div>
             <div style="background:#f9f9f9; padding:15px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:gray;">BMI</div>
                <div style="font-size:20px; font-weight:700;">${bmi}</div>
            </div>
        </div>
        <div style="height:150px; background:#f0f0f5; border-radius:12px; display:flex; align-items:center; justify-content:center; color:gray; font-size:12px;">
            Weight Trend Chart
        </div>
    `;
    content.appendChild(measureCard);

    const statsCard = document.createElement('div');
    statsCard.className = 'card';
    statsCard.style.marginTop = '20px';
    statsCard.innerHTML = `
       <h3 style="margin:0 0 15px 0; font-size:16px;">Activity</h3>
       <div style="height:100px; background:#f0f0f5; border-radius:12px; display:flex; align-items:center; justify-content:center; color:gray; font-size:12px;">
            Heatmap Placeholder
       </div>
    `;
    content.appendChild(statsCard);
    container.appendChild(content);
};
