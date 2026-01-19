
// Helper: Get Volume History (Last N Days)
function getVolumeHistory(days) {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);

        // FIX: Ensure consistent date formatting (YYYY. M. D.)
        // This matches how keys are saved in app_v26.js
        const dateStr = d.toLocaleDateString('ko-KR');
        const logKey = `workout_${dateStr}`;
        const logs = Store.get(logKey, {});

        let vol = 0;
        if (logs) {
            Object.keys(logs).forEach(name => {
                // Check if cardio
                if (window.CARDIO_DB && window.CARDIO_DB[name]) return;

                // Sum volume (wt * reps)
                const sets = logs[name] || [];
                sets.forEach(l => {
                    vol += (parseFloat(l.wt || 0) * parseFloat(l.reps || 0));
                });
            });
        }

        data.push({ date: dateStr, val: vol, day: d.getDate() });
    }
    return data;
}

// Helper: Draw Volume Chart (Bar Chart)
function drawVolumeChart(days) {
    const data = getVolumeHistory(days);
    const maxVal = Math.max(...data.map(d => d.val));
    const scale = maxVal > 0 ? (60 / maxVal) : 0; // Max height 60px

    const bars = data.map((d, i) => {
        const h = d.val * scale;
        const x = (i * (100 / days));
        const w = (100 / days) - 1; // Gap
        const color = d.val > 0 ? 'var(--ios-blue)' : '#eee';

        // Simplify x-axis labels (show every 5 days)
        const showLabel = (i % 5 === 0) || (i === days - 1);
        const label = showLabel ? `<text x="${x + w / 2}" y="78" font-size="3" text-anchor="middle" fill="gray">${d.day}</text>` : '';

        return `
            <rect x="${x}" y="${70 - h}" width="${w}" height="${h}" fill="${color}" rx="1" />
            ${label}
        `;
    }).join('');

    return `
        <div style="background:white; border-radius:12px; padding:10px; border:1px solid #eee;">
            <div style="font-size:12px; color:gray; text-align:right; margin-bottom:5px;">Max: ${Math.round(maxVal).toLocaleString()} kg</div>
            <svg viewBox="0 0 100 85" style="width:100%; height:120px; overflow:visible;">
                <!-- Baseline -->
                <line x1="0" y1="70" x2="100" y2="70" stroke="#eee" stroke-width="0.5" />
                ${bars}
            </svg>
        </div>
    `;
}
