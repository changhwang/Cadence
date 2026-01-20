export const buildExportPayload = (state) => ({
    app: 'cadence',
    exportedAt: new Date().toISOString(),
    userdb: state.userdb,
    settings: state.settings
});

const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });

export const parseImportPayload = async (file) => {
    const raw = await readFileAsText(file);
    const payload = JSON.parse(raw);
    if (!payload || payload.app !== 'cadence') {
        throw new Error('Cadence 백업 파일이 아닙니다.');
    }
    if (!payload.userdb || !payload.settings) {
        throw new Error('백업 파일 형식이 올바르지 않습니다.');
    }
    return payload;
};

export const downloadJson = (payload, filename) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};
