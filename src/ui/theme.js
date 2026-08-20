export const THEME_OPTIONS = [
    { value: 'auto', label: '시스템 설정' },
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' }
];

const VALID = new Set(THEME_OPTIONS.map((option) => option.value));

export const coerceTheme = (value) => (VALID.has(value) ? value : 'auto');

const prefersDark = () =>
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const resolveTheme = (theme) => {
    const safe = coerceTheme(theme);
    if (safe === 'auto') return prefersDark() ? 'dark' : 'light';
    return safe;
};

// 주소창/상태바 색은 CSS 변수를 따라가지 않으므로 직접 맞춰준다.
// index.html의 media 지정 메타는 첫 페인트용이라, JS가 뜬 뒤에는
// 선택한 테마를 그대로 반영하도록 media 없는 메타 하나로 대체한다.
const syncThemeColor = () => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--ios-bg').trim();
    if (!bg) return;
    document.querySelectorAll('meta[name="theme-color"][media]').forEach((node) => node.remove());
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', bg);
};

export const applyTheme = (theme) => {
    const safe = coerceTheme(theme);
    const root = document.documentElement;
    if (safe === 'auto') {
        delete root.dataset.theme;
    } else {
        root.dataset.theme = safe;
    }
    syncThemeColor();
    return resolveTheme(safe);
};

// 시스템 설정을 따르는 동안에는 OS 다크모드 전환에 바로 반응해야 한다.
export const watchSystemTheme = (getTheme) => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
        if (coerceTheme(getTheme()) === 'auto') syncThemeColor();
    };
    if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', onChange);
    } else if (typeof query.addListener === 'function') {
        query.addListener(onChange);
    }
};
