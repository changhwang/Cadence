
const fs = require('fs');
const path = require('path');

const srcPath = 'app_v24.js';
const destPath = 'app_v25.js';

try {
    let content = fs.readFileSync(srcPath, 'utf8');

    // 1. Truncate at line 3788 (Before V25 Append starts in v24)
    // Identify the marker or just split by lines
    const lines = content.split('\n');
    let truncatedLines = lines.slice(0, 3788);
    let newContent = truncatedLines.join('\n');

    // 2. Remove Legacy Block 1 (Around line 1504)
    // Find exact start string
    const block1Start = "window.openAddFoodMenu = (mealType) => {";
    // We can't simple-replace because it might match multiple?
    // Let's use string replacement with a unique placeholder to ensure we target the first one?
    // Actually, simple replacement of the *entire* function body is safer if we have the content.
    // But we don't want to embed 100 lines here.
    // Regex replace?
    // window.openAddFoodMenu = (mealType) => { ...code... };
    // It's risky with regex across many lines.

    // Better approach: We know the indices from previous `view_file`.
    // Block 1 is indices 1503 to 1597 (0-indexed).
    // Block 2 is indices 3156 to 3249.

    // Let's use the line-based approach since we have the array 'truncatedLines' !
    // Block 1
    for (let i = 1503; i <= 1597; i++) {
        truncatedLines[i] = "// Legacy Block 1 Removed";
    }

    // Block 2
    for (let i = 3156; i <= 3249; i++) {
        truncatedLines[i] = "// Legacy Block 2 Removed";
    }

    // Re-join
    newContent = truncatedLines.join('\n');

    // 3. Replace Goals Logic
    const oldGoals = `window.getGoalsForDate = (dateStr) => {
    const history = Store.get('goal_history', []);
    const parseDate = (d) => {
        // Handle 'YYYY. M. D.' format (ko-KR)
        if (d.includes('.')) {
            const parts = d.split('.').map(s => s.trim()).filter(s => s);
            if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
        }
        return new Date(d).getTime();
    };
    const targetTime = parseDate(dateStr);
    const defaults = { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, targetWater: 2000, targetSodium: 2000 };

    if (!history || history.length === 0) return Store.get('user_settings', defaults);

    // Sort descending (Newest first)
    history.sort((a, b) => parseDate(b.date) - parseDate(a.date));

    // Find first entry where entry.date <= targetDate
    const entry = history.find(h => parseDate(h.date) <= targetTime);

    return entry ? entry.goals : Store.get('user_settings', defaults);
};`;

    const newGoals = `// 1. Hardened getGoalsForDate (V25)
window.getGoalsForDate = (dateStr) => {
    const defaults = { targetCal: 2500, targetPro: 160, targetCarb: 300, targetFat: 80, targetWater: 2000, targetSodium: 2000 };
    try {
        const history = Store.get('goal_history', []) || [];
        const parseDate = (d) => {
            if (!d) return 0;
            if (typeof d === 'string' && d.includes('.')) {
                const parts = d.split('.').map(s => s.trim()).filter(s => s);
                if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
            }
            return new Date(d).getTime();
        };
        const targetTime = parseDate(dateStr);
        const validHistory = history.filter(h => h && h.date && h.goals);
        validHistory.sort((a, b) => parseDate(b.date) - parseDate(a.date));
        const entry = validHistory.find(h => parseDate(h.date) <= targetTime);
        if (entry && entry.goals) return entry.goals;
        const current = Store.get('user_settings', defaults);
        return current || defaults;
    } catch (e) { console.error("Goals Error:", e); return defaults; }
};`;

    if (newContent.indexOf(oldGoals) === -1) {
        console.warn("Look out! exact match for getGoalsForDate failed. Using robust regex replace or manual check.");
        // Try simple substring replacement if exact match fails due to whitespace
        // Actually, we can just replace the definition line if we are careful?
        // No, let's use the line indices for this too? Start line is ~460.
        // Let's assume the string match works (it worked for search).
    }
    newContent = newContent.replace(oldGoals, newGoals);


    // 4. Replace Save Logic
    const oldSave = `window.saveAllSettings = () => {
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
};`;

    const newSave = `// 2. Safe saveAllSettings (V25)
window.saveAllSettings = () => {
    if (!window.tempSettingsState || !window.tempSettingsState.settings) { alert("Error: State missing"); return; }
    const { profile, settings, lang } = window.tempSettingsState;
    Store.set('user_profile', profile);
    Store.set('user_settings', settings);
    Store.set('app_lang', lang);
    try {
        const history = Store.get('goal_history', []) || [];
        const d = new Date();
        const realToday = \`\${d.getFullYear()}. \${d.getMonth() + 1}. \${d.getDate()}.\`;
        const newHistory = history.filter(h => h.date !== realToday);
        newHistory.push({ date: realToday, goals: { ...settings } });
        Store.set('goal_history', newHistory);
    } catch (e) { console.error("Save Error:", e); }
    alert(lang === 'ko' ? '설정이 저장되었습니다.' : 'Settings saved.');
    const modalOverlay = document.querySelector('.settings-body')?.closest('.modal-overlay');
    if (modalOverlay) { modalOverlay.classList.remove('open'); setTimeout(() => modalOverlay.remove(), 300); }
    render();
};`;

    newContent = newContent.replace(oldSave, newSave);

    // 5. Append New Diet Logic (Smart UI)
    const appendCode = `
// --- V25 Fix 8: Smart Food Detail UI & Selector ---

// improved selector
window.openFoodSelector = () => {
    // ... Copy from previous selector.js content ...
    // Since I can't embed it all easily in specific lines here, 
    // I will read it from 'v25_append.js' but REPLACE the openFoodDetail part.
};
`;

    // To be safe, let's just load the 'smart_ui_v25.js' and 'selector_logic' (manually included here).
    // I already wrote 'smart_ui_v25.js'.
    // I don't have 'selector_logic' in a file except 'v25_append.js' (which had both).
    // I'll read 'smart_ui_v25.js'.

    // I need the Selector Logic.
    const selectorLogic = \`
// Improved Selector
window.openAddFoodMenu = window.openFoodSelector = () => {
    const state = { category: '전체', term: '' };
    const categories = ['전체', '한식', '중식', '일식', '양식/패스트푸드', '단백질', '탄수화물', '과일/야채', '소스/드레싱', '음료/간식'];
    const filterApi = (key, item) => {
        const cat = state.category;
        const term = state.term;
        if (term && !key.toLowerCase().includes(term)) return false;
        if (cat === '전체') return true;
        if (item.category === cat) return true;
        if (!item.category) return false;
        if (cat === '일식/중식') return item.category === '일식' || item.category === '중식';
        if (cat === '탄수화물') {
             if (item.category === '탄수화물') return true;
             if (/밥|빵|면|떡|고구마|감자|오트|곡물|시리얼/.test(key)) return true;
             return false;
        }
        return false;
    };
    const modal = createModal('Add Food');
    const body = document.createElement('div');
    modal.appendChild(body);
    const render = () => {
        const tabsHtml = categories.map(cat => \`<button onclick="window.updateSelectorCategory('\${cat}')" style="padding:6px 12px; margin-right:4px; margin-bottom:8px; border-radius:16px; border:none; font-size:13px; font-weight:600; cursor:pointer; background:\${state.category === cat ? '#333' : '#f0f0f5'}; color:\${state.category === cat ? 'white' : '#555'}; transition:all 0.2s;">\${cat}</button>\`).join('');
        const allKeys = Object.keys(FOOD_DB);
        let matched = allKeys.filter(key => filterApi(key, FOOD_DB[key]));
        const resultCount = matched.length;
        matched = matched.slice(0, 50);
        const listHtml = matched.map(key => {
            const item = FOOD_DB[key];
            const gram = item.default_g || item.default_gram || 100;
            const displayUnit = item.unit === 'g' ? \`\${item.cal}kcal / \${gram}g\` : \`\${item.cal}kcal / 1\${item.unit} (\${gram}g)\`;
            return \`<div onclick="selectFoodItem('\${key}')" style="padding:12px 0; border-bottom:1px solid #f5f5f5; cursor:pointer; display:flex; justify-content:space-between; align-items:center;"><div style="font-weight:500; font-size:15px; color:#333;">\${key}<div style="font-size:11px; color:#999; margin-top:2px;">\${item.category || '기타'}</div></div><div style="font-size:12px; color:gray;">\${displayUnit}</div></div>\`;
        }).join('');
        body.innerHTML = \`<div style="padding:0 5px 10px 5px;"><input type="text" value="\${state.term}" oninput="window.updateSelectorSearch(this.value)" placeholder="Search food..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; margin-bottom:10px; font-family:inherit; font-size:16px;"><div style="overflow-x:auto; white-space:nowrap; margin-bottom:10px; padding-bottom:5px;">\${tabsHtml}</div><div style="height:50vh; overflow-y:auto; border-top:1px solid #eee;">\${matched.length === 0 ? '<div style="padding:30px; text-align:center; color:gray;">No results found</div>' : listHtml}\${resultCount > 50 ? \`<div style="padding:10px; text-align:center; color:gray; font-size:12px;">Top 50 of \${resultCount}</div>\` : ''}</div></div>\`;
        if(!state.term) setTimeout(() => { const input = body.querySelector('input'); if(input) input.focus(); }, 50);
    };
    window._tempSelectorState = state;
    window._tempSelectorRender = render;
    window.updateSelectorCategory = (cat) => { window._tempSelectorState.category = cat; window._tempSelectorRender(); };
    window.updateSelectorSearch = (val) => { window._tempSelectorState.term = val.toLowerCase(); window._tempSelectorRender(); };
    render();
};
window.selectFoodItem = (key) => window.openFoodDetail(key);
\`;

    // Smart UI from file 'smart_ui_v25.js'
    const smartUi = fs.readFileSync('smart_ui_v25.js', 'utf8');

    // Combine
    newContent += "\\n" + selectorLogic + "\\n" + smartUi;

    fs.writeFileSync(destPath, newContent, 'utf8');
    console.log("Successfully built " + destPath);

} catch (e) {
    console.error("Build Error:", e);
    process.exit(1);
}
