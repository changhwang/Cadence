// V21: Water Editor Modal (Edit/Delete)
window.openWaterEditor = (waterId) => {
    const key = `diet_${state.date}`;
    const saved = Store.get(key, { meals: [], water: 0 });
    const waterEntry = saved.meals.find(m => m.id === waterId);

    if (!waterEntry) return;

    let currentAmount = waterEntry.amount;

    const modal = createModal('Edit Water');
    modal.className = 'modal-overlay center open';

    const renderModal = () => {
        modal.innerHTML = `
            <div style="background:white; padding:25px; border-radius:24px; width:85%; max-width:340px; text-align:center;">
                <i data-lucide="droplet" style="width:40px; height:40px; color:#5AC8FA; margin-bottom:10px;"></i>
                <h2 style="margin:0 0 20px 0; font-size:22px;">Edit Water Log</h2>
                
                <div style="margin-bottom:20px;">
                    <label style="font-size:12px; color:gray; display:block; margin-bottom:5px;">Amount (ml)</label>
                    <input type="number" id="editWaterInput" value="${currentAmount}" style="width:100%; padding:15px; border:2px solid #5AC8FA; border-radius:12px; text-align:center; font-size:24px; font-weight:700;">
                </div>
                
                <button type="button" onclick="saveWaterEdit()" style="width:100%; padding:15px; background:#5AC8FA; color:white; border:none; border-radius:12px; font-weight:700; margin-bottom:10px;">Save</button>
                <button type="button" onclick="deleteWater()" style="width:100%; padding:15px; background:white; border:1px solid var(--ios-red); color:var(--ios-red); border-radius:12px; font-weight:700; margin-bottom:10px;">Delete</button>
                <button type="button" onclick="closeModal()" style="background:none; border:none; color:gray;">Cancel</button>
            </div>
        `;
        lucide.createIcons();
    };

    window.saveWaterEdit = () => {
        const input = document.getElementById('editWaterInput');
        const newAmount = parseInt(input?.value || currentAmount);

        if (newAmount > 0) {
            // Update water entry
            const saved = Store.get(key, { meals: [], water: 0 });
            const idx = saved.meals.findIndex(m => m.id === waterId);

            if (idx >= 0) {
                const oldAmount = saved.meals[idx].amount;
                saved.meals[idx].amount = newAmount;

                // Update total water
                saved.water = (saved.water || 0) - oldAmount + newAmount;

                Store.set(key, saved);
                closeModal();
                render();
            }
        }
    };

    window.deleteWater = () => {
        if (!confirm('Delete this water log?')) return;

        const saved = Store.get(key, { meals: [], water: 0 });
        const idx = saved.meals.findIndex(m => m.id === waterId);

        if (idx >= 0) {
            const amount = saved.meals[idx].amount;
            saved.meals.splice(idx, 1);
            saved.water = (saved.water || 0) - amount;

            Store.set(key, saved);
            closeModal();
            render();
        }
    };

    renderModal();
};
