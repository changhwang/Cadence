const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const sumTargets = (base, next) => ({
    kcal: base.kcal + toNumber(next.kcal),
    proteinG: base.proteinG + toNumber(next.proteinG),
    carbG: base.carbG + toNumber(next.carbG),
    fatG: base.fatG + toNumber(next.fatG),
    fiberG: base.fiberG + toNumber(next.fiberG),
    unsatFatG: base.unsatFatG + toNumber(next.unsatFatG),
    satFatG: base.satFatG + toNumber(next.satFatG),
    transFatG: base.transFatG + toNumber(next.transFatG),
    sugarG: base.sugarG + toNumber(next.sugarG),
    addedSugarG: base.addedSugarG + toNumber(next.addedSugarG),
    sodiumMg: base.sodiumMg + toNumber(next.sodiumMg),
    potassiumMg: base.potassiumMg + toNumber(next.potassiumMg)
});

const emptyTotals = () => ({
    kcal: 0,
    proteinG: 0,
    carbG: 0,
    fatG: 0,
    fiberG: 0,
    unsatFatG: 0,
    satFatG: 0,
    transFatG: 0,
    sugarG: 0,
    addedSugarG: 0,
    sodiumMg: 0,
    potassiumMg: 0
});

const hasAny = (totals) =>
    [
        totals.kcal,
        totals.proteinG,
        totals.carbG,
        totals.fatG,
        totals.fiberG,
        totals.unsatFatG,
        totals.satFatG,
        totals.transFatG,
        totals.sugarG,
        totals.addedSugarG,
        totals.sodiumMg,
        totals.potassiumMg
    ].some(
        (value) => Number(value) > 0
    );

export const getDietTotalsForDate = ({ day }) => {
    if (!day) return { totals: emptyTotals(), hasData: false };

    if (day.totals) {
        const totals = sumTargets(emptyTotals(), day.totals);
        return { totals, hasData: hasAny(totals) };
    }

    const meals = Array.isArray(day.meals) ? day.meals : [];
    const totals = meals.reduce((acc, meal) => {
        if (meal.items && Array.isArray(meal.items)) {
            meal.items.forEach((item) => {
                acc = sumTargets(acc, item || {});
            });
            return acc;
        }
        return sumTargets(acc, meal || {});
    }, emptyTotals());

    return { totals, hasData: hasAny(totals) };
};
