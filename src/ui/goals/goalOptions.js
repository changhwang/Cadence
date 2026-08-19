import { el } from '../../utils/dom.js';
import { FRAMEWORK_POLICIES, GOAL_PRESETS } from '../../services/nutritionPolicies.js';

export const GOAL_OPTIONS = Object.entries(GOAL_PRESETS).map(([value, preset]) => ({
    value,
    label: preset.label
}));

export const FRAMEWORK_OPTIONS = Object.entries(FRAMEWORK_POLICIES).map(([value, policy]) => ({
    value,
    label: policy.label
}));

export const getFrameworkLabel = (id) => FRAMEWORK_POLICIES[id]?.label || id || '-';

export const buildOptionSelect = ({ name, options, selected }) =>
    el(
        'select',
        { name },
        ...options.map((option) =>
            el('option', { value: option.value, selected: option.value === selected }, option.label)
        )
    );
