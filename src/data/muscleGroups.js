export const GROUP_ORDER = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Other'];

export const DETAIL_TO_GROUP = {
    chest: 'Chest',
    upper_chest: 'Chest',
    middle_chest: 'Chest',
    lower_chest: 'Chest',
    lats: 'Back',
    mid_back: 'Back',
    upper_back: 'Back',
    lower_traps: 'Back',
    traps: 'Back',
    erectors: 'Back',
    quads: 'Legs',
    hamstrings: 'Legs',
    glutes: 'Legs',
    calves: 'Legs',
    adductors: 'Legs',
    abductors: 'Legs',
    front_delts: 'Shoulders',
    lateral_delts: 'Shoulders',
    rear_delts: 'Shoulders',
    delts: 'Shoulders',
    biceps: 'Arms',
    triceps: 'Arms',
    forearms: 'Arms',
    grip: 'Arms',
    core: 'Core',
    hip_flexors: 'Core',
    abs: 'Core',
    obliques: 'Core'
};

export const toMajorGroup = (detail) => DETAIL_TO_GROUP[detail] || 'Other';
