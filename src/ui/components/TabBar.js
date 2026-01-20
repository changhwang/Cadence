const TABS = [
    { route: 'workout', label: '운동', icon: 'dumbbell' },
    { route: 'diet', label: '식단', icon: 'utensils' },
    { route: 'body', label: '신체', icon: 'scale' },
    { route: 'settings', label: '설정', icon: 'settings' }
];

const createTabButton = ({ route, label, icon }, isActive) => {
    const button = document.createElement('button');
    button.className = `tab-item${isActive ? ' active' : ''}`;
    button.dataset.action = 'route';
    button.dataset.route = route;

    const iconEl = document.createElement('i');
    iconEl.dataset.lucide = icon;

    const textEl = document.createElement('span');
    textEl.textContent = label;

    button.appendChild(iconEl);
    button.appendChild(textEl);

    return button;
};

export const renderTabBar = ({ route }) => {
    const container = document.getElementById('tab-bar');
    if (!container) return;

    container.innerHTML = '';
    TABS.forEach((tab) => {
        container.appendChild(createTabButton(tab, tab.route === route));
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
};
