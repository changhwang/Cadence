
// --- Settings Implementation (V24 Fixed: Explicit Save & Localization) ---
// Temporary state holder
window.tempSettingsState = {
    profile: null,
    settings: null,
    lang: 'ko'
};

window.openSettings = () => {
    // 1. Initialize Temp State from Store
    window.tempSettingsState.profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    window.tempSettingsState.settings = Store.get('user_settings', { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, goalType: 'maint' });
    window.tempSettingsState.lang = Store.get('app_lang', 'ko');

    const modalBody = createModal('설정 (Settings)');
    modalBody.className = 'settings-body';
    renderSettingsUI(modalBody);
};

window.renderSettingsUI = (bodyContainer) => {
    const { profile, settings, lang } = window.tempSettingsState;

    // Auto-calc Logic (Live Preview)
    const age = calculateAge(profile.birth);
    const bmr = calcBMR(profile.weight, profile.height, age, profile.gender);
    const tdee = Math.round(bmr * profile.activity);

    // Activity Labels (Korean)
    const activeLabels = {
        '1.2': '활동 적음 (사무직/운동X)',
        '1.375': '가벼운 활동 (주 1-3회)',
        '1.55': '보통 활동 (주 3-5회)',
        '1.725': '많은 활동 (주 6-7회)'
    };

    bodyContainer.innerHTML = `
        <!-- 1. Profile Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">👤 프로필 (Profile)</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
            <div class="setting-row">
                <label>성별</label>
                <select onchange="updateTempProfile('gender', this.value)">
                    <option value="M" ${profile.gender === 'M' ? 'selected' : ''}>남성 (Male)</option>
                    <option value="F" ${profile.gender === 'F' ? 'selected' : ''}>여성 (Female)</option>
                </select>
            </div>
            <div class="setting-row">
                 <label>생년월일</label>
                 <input type="date" value="${profile.birth}" onchange="updateTempProfile('birth', this.value)" style="border:none; background:transparent; text-align:right; font-family:inherit; width:140px;">
            </div>
            <div class="setting-row" style="justify-content:flex-end; padding-top:0; border-bottom:1px solid #eee;">
                 <span style="font-size:12px; color:gray;">(만 ${age}세)</span>
            </div>
            <div class="setting-row">
                 <label>키 (cm)</label>
                 <input type="number" value="${profile.height}" onchange="updateTempProfile('height', this.value)" style="width:70px;">
            </div>
            <div class="setting-row">
                 <label>몸무게 (kg)</label>
                 <input type="number" value="${profile.weight}" onchange="updateTempProfile('weight', this.value)" style="width:70px;">
            </div>
             <div class="setting-row" style="border-bottom:none;">
                <label>활동량</label>
                <select onchange="updateTempProfile('activity', this.value)" style="width:160px;">
                    <option value="1.2" ${profile.activity == 1.2 ? 'selected' : ''}>${activeLabels['1.2']}</option>
                    <option value="1.375" ${profile.activity == 1.375 ? 'selected' : ''}>${activeLabels['1.375']}</option>
                    <option value="1.55" ${profile.activity == 1.55 ? 'selected' : ''}>${activeLabels['1.55']}</option>
                    <option value="1.725" ${profile.activity == 1.725 ? 'selected' : ''}>${activeLabels['1.725']}</option>
                </select>
            </div>
            <div style="font-size:11px; color:#888; margin-top:5px; line-height:1.4;">
                * 활동량은 하루 총 에너지 소비량(TDEE) 계산에 사용됩니다.
            </div>
        </div>

        <div style="text-align:center; font-size:13px; color:#555; margin-bottom:25px; background:#fff; border:1px solid #eee; padding:10px; border-radius:8px;">
            <div>기초대사량 (BMR): <b>${bmr}</b> kcal</div>
            <div style="font-size:14px; margin-top:4px; color:var(--ios-blue);">유지 칼로리 (TDEE): <b>${tdee}</b> kcal</div>
        </div>

        <!-- 2. Goal Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">🎯 목표 (Goals)</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
             <div class="setting-row" style="border-bottom:none;">
                <label>목표 설정</label>
                <select onchange="applyTempGoalPreset(this.value, ${tdee})" style="width:100%; padding:8px; margin-top:5px;">
                    <option value="custom" ${settings.goalType === 'custom' ? 'selected' : ''}>직접 입력 (Custom)</option>
                    <option value="diet" ${settings.goalType === 'diet' ? 'selected' : ''}>다이어트 (체지방 감소)</option>
                    <option value="maint" ${settings.goalType === 'maint' ? 'selected' : ''}>현재 체중 유지</option>
                    <option value="bulk" ${settings.goalType === 'bulk' ? 'selected' : ''}>벌크업 (근육량 증가)</option>
                </select>
            </div>
            
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                <div>
                     <label style="font-size:11px; color:gray;">목표 칼로리</label>
                     <input type="number" value="${settings.targetCal}" onchange="updateTempSetting('targetCal', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                <div>
                     <label style="font-size:11px; color:gray;">단백질 (g)</label>
                     <input type="number" value="${settings.targetPro}" onchange="updateTempSetting('targetPro', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                 <div>
                     <label style="font-size:11px; color:gray;">탄수화물 (g)</label>
                     <input type="number" value="${settings.targetCarb || 300}" onchange="updateTempSetting('targetCarb', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
                 <div>
                     <label style="font-size:11px; color:gray;">지방 (g)</label>
                     <input type="number" value="${settings.targetFat || 80}" onchange="updateTempSetting('targetFat', this.value)" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                </div>
             </div>
        </div>

        <!-- 3. System Section -->
        <h4 style="margin:0 0 10px 0; color:gray; font-size:13px; font-weight:700;">⚙️ 시스템 (System)</h4>
        <div class="settings-group" style="background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:20px;">
             <div class="setting-row" style="border-bottom:none;">
                <label>언어 (Language)</label>
                <select onchange="window.tempSettingsState.lang = this.value; renderSettingsUI(document.querySelector('.settings-body'));" style="width:100px;">
                    <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>
        </div>

         <button onclick="saveAllSettings()" style="width:100%; padding:16px; background:var(--ios-blue); color:white; border:none; border-radius:14px; font-weight:700; font-size:16px; margin-bottom:10px; box-shadow:0 4px 12px rgba(78,205,196,0.3);">저장하기 (Save)</button>
        
        <div style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
            <button onclick="exportData()" style="padding:10px 15px; background:#eee; color:#333; border:none; border-radius:8px; font-size:12px;">Data Backup</button>
            <button onclick="triggerRestore()" style="padding:10px 15px; background:#eee; color:#333; border:none; border-radius:8px; font-size:12px;">Data Restore</button>
            <input type="file" id="restoreFile" style="display:none;" onchange="importData(this)">
        </div>
    `;

    // CSS Injection for rows
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

// --- Temp Logic Updates ---
window.updateTempProfile = (key, val) => {
    const profile = window.tempSettingsState.profile;
    if (key === 'birth' || key === 'gender') profile[key] = val;
    else profile[key] = parseFloat(val) || val;

    // Re-render only
    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.updateTempSetting = (key, val) => {
    const settings = window.tempSettingsState.settings;
    settings[key] = parseFloat(val);
    settings.goalType = 'custom';

    // Re-render
    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

window.applyTempGoalPreset = (type, tdee) => {
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

    const body = document.querySelector('.settings-body');
    if (body) renderSettingsUI(body);
};

// --- Commit Save ---
window.saveAllSettings = () => {
    const { profile, settings, lang } = window.tempSettingsState;

    Store.set('user_profile', profile);
    Store.set('user_settings', settings);
    Store.set('app_lang', lang);

    alert("설정이 저장되었습니다.");

    // Close Modal
    const modalOverlay = document.querySelector('.settings-body')?.closest('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('open');
        setTimeout(() => modalOverlay.remove(), 300);
    }

    // Reload View
    render();
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
        render();
    }
};

// --- View: My Body (Restored V24) ---
window.renderMyBodyView = (container) => {
    // 1. Get Measurements
    const profile = Store.get('user_profile', { gender: 'M', height: 175, weight: 75, birth: '1995-01-01', activity: 1.2 });
    const userName = Store.get('user_name', 'User');

    // 2. Header
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
            My Body
            <i data-lucide="chevron-right" style="width:16px; color:gray;"></i>
            <span style="font-size:14px; font-weight:600; color:var(--ios-blue); cursor:pointer;" onclick="openProfileEdit()">${userName}</span>
        </div>
        <div onclick="openSettings()" style="cursor:pointer; padding:5px;">
            <i data-lucide="settings" style="width:24px; color:#333;"></i>
        </div>
    `;
    container.appendChild(header);

    // 3. Main Content
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.paddingBottom = '100px';

    // 3.1 Measurements Card
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
                <div style="font-size:12px; color:gray;">Weight</div>
                <div style="font-size:20px; font-weight:700;">${weight} <span style="font-size:12px;">kg</span></div>
            </div>
             <div style="background:#f9f9f9; padding:15px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:gray;">BMI</div>
                <div style="font-size:20px; font-weight:700;">${bmi}</div>
            </div>
        </div>

        <div style="height:150px; background:#f0f0f5; border-radius:12px; display:flex; align-items:center; justify-content:center; color:gray; font-size:12px;">
            Chart Placeholder (Weight Trend)
        </div>
    `;
    content.appendChild(measureCard);

    // 3.2 Stats Placeholder
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
