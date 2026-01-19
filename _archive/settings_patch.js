
// --- Settings Implementation (V24 Fixed) ---
window.openSettings = () => {
    const modalBody = createModal('Settings');
    modalBody.className = 'settings-body';
    renderSettingsUI(modalBody);
};

window.renderSettingsUI = (bodyContainer) => {
    const profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    const settings = Store.get('user_settings', { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, goalType: 'maint' });

    // Auto-calc Age & BMR
    const age = calculateAge(profile.birth);
    const bmr = calcBMR(profile.weight, profile.height, age, profile.gender);
    const tdee = Math.round(bmr * profile.activity);

    bodyContainer.innerHTML = `
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; text-transform:uppercase;">Profile</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
            <div class="setting-row">
                <label>Gender</label>
                <select id="setGender" onchange="updateProfile('gender', this.value)">
                    <option value="M" ${profile.gender === 'M' ? 'selected' : ''}>Male</option>
                    <option value="F" ${profile.gender === 'F' ? 'selected' : ''}>Female</option>
                </select>
            </div>
            <div class="setting-row">
                 <label>Birthday</label>
                 <input type="date" value="${profile.birth}" onchange="updateProfile('birth', this.value)" style="border:none; background:transparent; text-align:right; font-family:inherit;">
            </div>
            <div class="setting-row" style="justify-content:flex-end; padding-top:0; border-bottom:1px solid #eee;">
                 <span style="font-size:12px; color:gray;">(Age: ${age})</span>
            </div>
            <div class="setting-row">
                 <label>Height (cm)</label>
                 <input type="number" value="${profile.height}" onchange="updateProfile('height', this.value)" style="width:60px;">
            </div>
            <div class="setting-row">
                 <label>Weight (kg)</label>
                 <input type="number" value="${profile.weight}" onchange="updateProfile('weight', this.value)" style="width:60px;">
            </div>
             <div class="setting-row" style="border-bottom:none;">
                <label>Activity</label>
                <select id="setActivity" onchange="updateProfile('activity', this.value)" style="width:120px;">
                    <option value="1.2" ${profile.activity == 1.2 ? 'selected' : ''}>Sedentary</option>
                    <option value="1.375" ${profile.activity == 1.375 ? 'selected' : ''}>Light Active</option>
                    <option value="1.55" ${profile.activity == 1.55 ? 'selected' : ''}>Mod Active</option>
                    <option value="1.725" ${profile.activity == 1.725 ? 'selected' : ''}>Very Active</option>
                </select>
            </div>
        </div>

        <div style="text-align:center; font-size:13px; color:gray; margin-bottom:20px;">
            Basal Metabolic Rate: <b>${bmr}</b> kcal<br>
            Daily Energy Expenditure (TDEE): <b>${tdee}</b> kcal
        </div>

        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; text-transform:uppercase;">Goals</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
             <div class="setting-row" style="border-bottom:none;">
                <label>Goal Preset</label>
                <select onchange="applyGoalPreset(this.value, ${tdee})" style="width:100%; padding:8px; margin-top:5px;">
                    <option value="custom" ${settings.goalType === 'custom' ? 'selected' : ''}>Custom</option>
                    <option value="diet" ${settings.goalType === 'diet' ? 'selected' : ''}>Fat Loss (-500)</option>
                    <option value="maint" ${settings.goalType === 'maint' ? 'selected' : ''}>Maintenance</option>
                    <option value="bulk" ${settings.goalType === 'bulk' ? 'selected' : ''}>Bulking (+300)</option>
                </select>
            </div>
            
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                <div>
                     <label style="font-size:11px; color:gray;">Target Cals</label>
                     <input type="number" value="${settings.targetCal}" onchange="updateSetting('targetCal', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                <div>
                     <label style="font-size:11px; color:gray;">Protein (g)</label>
                     <input type="number" value="${settings.targetPro}" onchange="updateSetting('targetPro', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                 <div>
                     <label style="font-size:11px; color:gray;">Carbs (g)</label>
                     <input type="number" value="${settings.targetCarb || 300}" onchange="updateSetting('targetCarb', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                 <div>
                     <label style="font-size:11px; color:gray;">Fat (g)</label>
                     <input type="number" value="${settings.targetFat || 80}" onchange="updateSetting('targetFat', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
             </div>
        </div>

         <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; text-transform:uppercase;">Data Management</h4>
        <button onclick="exportData()" style="width:100%; padding:15px; background:#4ECDC4; color:white; border:none; border-radius:12px; font-weight:700; margin-bottom:10px;">Backup Data (JSON)</button>
        <button onclick="triggerRestore()" style="width:100%; padding:15px; background:#eee; color:black; border:none; border-radius:12px; font-weight:700; margin-bottom:30px;">Restore Data (Import)</button>
        <input type="file" id="restoreFile" style="display:none;" onchange="importData(this)">
    `;

    if (!document.getElementById('settings-css')) {
        const style = document.createElement('style');
        style.id = 'settings-css';
        style.innerHTML = `
            .setting-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee; }
            .setting-row label { font-size:14px; font-weight:600; }
            .setting-row input, .setting-row select { padding:5px; border:1px solid #ddd; border-radius:6px; text-align:right; font-size:14px; }
        `;
        document.head.appendChild(style);
    }
};

window.calculateAge = (birthDate) => {
    if (!birthDate) return 30;
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 30;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

window.calcBMR = (w, h, a, g) => {
    let base = (10 * w) + (6.25 * h) - (5 * a);
    return g === 'M' ? Math.round(base + 5) : Math.round(base - 161);
};

window.updateProfile = (key, val) => {
    const profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    if (key === 'birth' || key === 'gender') profile[key] = val;
    else profile[key] = parseFloat(val) || val;
    Store.set('user_profile', profile);

    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.updateSetting = (key, val) => {
    const settings = Store.get('user_settings', {});
    settings[key] = parseFloat(val);
    settings.goalType = 'custom';
    Store.set('user_settings', settings);
};

window.applyGoalPreset = (type, tdee) => {
    const settings = Store.get('user_settings', {});
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

    Store.set('user_settings', settings);
    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
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
        } catch (err) {
            alert("Invalid Backup File");
        }
    };
    reader.readAsText(file);
};

window.openLogBodyModal = () => { alert("Log Weight/Muscle/Fat Coming Next"); };

window.openProfileEdit = () => {
    const currentName = Store.get('user_name', 'User');
    const newName = prompt("Enter new name:", currentName);
    if (newName && newName.trim()) {
        Store.set('user_name', newName.trim());
        const headerName = document.querySelector('div[onclick="openProfileEdit()"]');
        if (headerName) headerName.innerText = newName.trim();
    }
};
