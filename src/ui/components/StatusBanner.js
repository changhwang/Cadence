let bannerTimerId = null;

const getBannerEl = () => document.getElementById('status-banner');

export const hideStatusBanner = () => {
    const el = getBannerEl();
    if (!el) return;
    el.textContent = '';
    el.className = 'status-banner';
};

export const showStatusBanner = ({ message, tone = 'info', timeoutMs = 2400 } = {}) => {
    const el = getBannerEl();
    if (!el || !message) return;
    el.textContent = message;
    el.className = `status-banner is-visible is-${tone}`;
    if (bannerTimerId) {
        clearTimeout(bannerTimerId);
    }
    if (timeoutMs > 0) {
        bannerTimerId = setTimeout(() => {
            hideStatusBanner();
            bannerTimerId = null;
        }, timeoutMs);
    }
};

export const renderSaveBanner = (store) => {
    const el = getBannerEl();
    if (!el) return;
    const status = store.getState().ui?.saveStatus;
    if (!status || status.ok) {
        hideStatusBanner();
        return;
    }
    const message = status.lastError?.message || '저장에 실패했습니다. 저장 공간을 확인해 주세요.';
    showStatusBanner({ message, tone: 'error', timeoutMs: 0 });
};
