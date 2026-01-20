import { renderWorkoutView } from './WorkoutView.js';
import { renderDietView } from './DietView.js';
import { renderBodyView } from './BodyView.js';
import { renderSettingsView } from './SettingsView.js';

const VIEW_RENDERERS = {
    workout: renderWorkoutView,
    diet: renderDietView,
    body: renderBodyView,
    settings: renderSettingsView
};

export const renderView = ({ route, store }) => {
    const container = document.getElementById('main-content');
    if (!container) return;

    const renderFn = VIEW_RENDERERS[route] || renderWorkoutView;
    renderFn(container, store);
};
