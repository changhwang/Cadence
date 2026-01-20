# Cadence vNext — 함수 시그니처/모듈 API 스펙 (v3.0)
**작성일:** 2026-01-20  
**용도:** 로컬 모델(에이전트)이 “어떤 함수/모듈이 존재해야 하는지”를 기준으로 구현/리팩터를 진행할 수 있게 하는 API 스펙입니다.  
**언어:** JS(ESM) 기준. 타입은 JSDoc 스타일로 표기.

---

## 0) 타입 정의(공통)
```js
/**
 * @typedef {{ id:string, label:string, description?:string, kind:'BALANCED'|'LOW_CARB'|'KETO'|'HIGH_PRO'|'HIGH_CARB'|'CUSTOM',
 *   macroRule: MacroRule, constraints?: Constraints, flags?: Flags }} Framework
 *
 * @typedef {{ mode:'CUT'|'MAINTAIN'|'LEAN_BULK'|'BULK'|'RECOMP', cutPct?:number, bulkPct?:number }} GoalModeSpec
 *
 * @typedef {{
 *   kcal:number, proteinG:number, carbG:number, fatG:number,
 *   waterMl?:number, sodiumMg?:number, fiberG?:number,
 * }} Targets
 *
 * @typedef {{
 *   proteinGkg:number, satFatCapPct?:number, sodiumCapMg?:number,
 *   netCarb?:boolean, addedSugarCapG?:number
 * }} Constraints
 *
 * @typedef {{
 *   protein: {{ type:'GKG', value:number }},
 *   carbs:   {{ type:'PCT'|'G'|'GKG', value:number, maxG?:number, minG?:number }},
 *   fat:     {{ type:'PCT'|'G', value:number }}
 * }} MacroRule
 *
 * @typedef {{
 *   enabled:boolean, factor:number, capKcal:number,
 *   distribution:'CARB_BIASED'|'SAME_RATIO'|'FAT_BIASED'
 * }} ExerciseCreditPolicy
 *
 * @typedef {{
 *   effectiveDate:string, // ISO YYYY-MM-DD
 *   spec: {{ frameworkId:string, goalMode:GoalModeSpec }},
 *   targets: Targets,
 *   rules?: {{ proteinGkg?:number, satFatCapPct?:number, sodiumCapMg?:number }},
 *   createdAt:number,
 *   note?:string
 * }} GoalTimelineEntry
 *
 * @typedef {{
 *   reason?:string,
 *   targets: Partial<Targets>,
 *   locked?:boolean,
 *   updatedAt:number
 * }} GoalOverride
 */
```

---

## 1) utils/date.js
```js
export function todayISO(): string;
export function toISO(input: Date | number | string): string; // strict ISO normalize
export function addDays(isoDate: string, delta: number): string;
export function compareISO(a: string, b: string): number; // -1/0/1
export function formatDate(isoDate: string, fmt: 'YMD'|'MDY'|'KO_DOTS'): string;
export function parseDisplayDate(input: string, fmt: 'YMD'|'MDY'|'KO_DOTS'): string; // -> ISO
```

---

## 2) core/storage.js
```js
export function loadUserDB(): any;
export function saveUserDB(userdb: any): void;

export function loadSettings(): any;
export function saveSettings(settings: any): void;

export function exportBackup(): Blob; // {app:'cadence', exportedAt, userdb, settings}
export function importBackup(jsonText: string): { userdb:any, settings:any };
```

---

## 3) core/store.js
```js
export function createStore(initialState: any): {
  getState(): any;
  dispatch(action: { type:string, payload?:any }): void;
  subscribe(fn: (state:any)=>void): ()=>void;
};

export const Actions: {
  init(payload:{ userdb:any, settings:any }): any;
  setRoute(route:string): any;

  // day navigation
  setSelectedDate(payload:{ domain:'diet'|'workout'|'body'|'dashboard', dateISO:string }): any;

  // goals
  setDefaultGoalSpec(payload:{ effectiveDateISO:string, frameworkId:string, goalMode:GoalModeSpec }): any; // "오늘부터" = timeline add
  setGoalOverride(payload:{ dateISO:string, override:GoalOverride }): any;          // "이 날짜만"
  clearGoalOverride(payload:{ dateISO:string }): any;

  // logs
  upsertDietLog(payload:{ dateISO:string, meal:'breakfast'|'lunch'|'dinner'|'snack', item:any }): any;
  removeDietLog(payload:{ dateISO:string, meal:string, itemId:string }): any;

  upsertCardioLog(payload:{ dateISO:string, entry:any }): any;
  removeCardioLog(payload:{ dateISO:string, entryId:string }): any;
};
```

---

## 4) services/nutrition/frameworks.js
```js
export function getFrameworks(): Framework[];
export function getFrameworkById(id:string): Framework | null;
export function validateFramework(fw: Framework): { ok:boolean, errors:string[] };
```

---

## 5) services/nutrition/targetEngine.js
```js
/**
 * profile/settings/spec을 받아 base targets를 계산합니다(운동 보정 제외).
 */
export function computeBaseTargets(params:{
  profile: { sex:'M'|'F', age:number, heightCm:number, weightKg:number, activityFactor:number },
  spec: { frameworkId:string, goalMode:GoalModeSpec },
  settings: { energyModel:{ cutPct:number, bulkPct:number }, defaults?:any }
}): { targets: Targets, rules: any };

/**
 * 운동 보정을 적용해 최종 targets를 생성합니다.
 */
export function applyExerciseCredit(params:{
  base: Targets,
  baseMacroRule?: MacroRule,
  exerciseKcal: number,
  policy: ExerciseCreditPolicy
}): { final: Targets, creditedKcal:number };

/**
 * (선택) 운동 보정분을 탄/지/단에 어떻게 분배할지.
 */
export function distributeCredit(params:{
  creditedKcal: number,
  base: Targets,
  distribution: ExerciseCreditPolicy['distribution'],
  frameworkKind?: Framework['kind']
}): Partial<Targets>;
```

---

## 6) services/goals/goalService.js (핵심)
```js
/**
 * timeline + overrideByDate를 바탕으로 해당 날짜의 base goal(스냅샷)을 구합니다.
 * 반환에는 (a) 적용된 timeline entry, (b) override 여부를 포함합니다.
 */
export function getEffectiveGoal(params:{
  dateISO: string,
  goals: { timeline: GoalTimelineEntry[], overrideByDate: Record<string, GoalOverride> },
}): {
  source: 'override'|'timeline',
  effectiveDate: string,              // override면 dateISO, timeline이면 entry.effectiveDate
  entry: GoalTimelineEntry | null,     // timeline 기반이면 entry
  override: GoalOverride | null,
  baseTargets: Targets                // override/entry 결합 결과(운동 보정 전)
};

/**
 * "오늘부터 목표 변경" = timeline에 새 엔트리 추가.
 * effectiveDate는 보통 todayISO() 또는 UI에서 선택한 날짜.
 */
export function addGoalTimelineEntry(params:{
  goals: { timeline: GoalTimelineEntry[] },
  effectiveDate: string,
  spec: { frameworkId:string, goalMode:GoalModeSpec },
  computed: { targets: Targets, rules?:any },
  note?: string,
  nowMs: number
}): { timeline: GoalTimelineEntry[] };

/**
 * "해당 날짜만 목표 조정" = overrideByDate 저장.
 */
export function setGoalOverride(params:{
  goals: { overrideByDate: Record<string, GoalOverride> },
  dateISO: string,
  override: GoalOverride,
  nowMs: number
}): { overrideByDate: Record<string, GoalOverride> };

export function clearGoalOverride(params:{
  goals: { overrideByDate: Record<string, GoalOverride> },
  dateISO: string
}): { overrideByDate: Record<string, GoalOverride> };
```

---

## 7) services/workout/energy.js
```js
/**
 * cardio entry로부터 kcal를 계산(또는 entry에 kcal가 있으면 그 값을 신뢰).
 * v1은 cardio만 추천.
 */
export function estimateCardioKcal(params:{
  entry: { type:string, minutes:number, met?:number, kcal?:number },
  profile: { weightKg:number }
}): number;

/**
 * 특정 날짜의 cardio logs를 합산해서 운동 kcal 추정.
 */
export function getExerciseKcalForDate(params:{
  day: any, // userdb.days[dateISO]
  profile: { weightKg:number }
}): number;
```

---

## 8) selectors/goalSelectors.js (UI가 반드시 이것만 사용)
```js
export function selectGoalForDate(state:any, dateISO:string): {
  base: Targets,
  final: Targets,
  meta: {
    source:'override'|'timeline',
    effectiveDate:string,
    creditedKcal:number
  }
};

export function selectSelectedDate(state:any, domain:'diet'|'workout'|'body'|'dashboard'): string;
```

---

## 9) UI Action Naming (data-action 표준)
- `goal.changeDefault`  // 오늘부터 목표 변경(설정 저장)
- `goal.setOverride`    // 이 날짜만 수정
- `goal.clearOverride`  // 이 날짜 오버라이드 해제
- `goal.toggleCredit`   // 운동 보정 ON/OFF
- `goal.setCreditFactor`// 0/50/100%
- `nav.prevDay`, `nav.nextDay`

---

## 10) 테스트 케이스(최소 10개)
1) timeline baseline만 있을 때 날짜 A/B/C의 effectiveGoal이 baseline
2) 오늘 timeline 추가 후, 내일은 새 목표, 어제는 baseline
3) overrideByDate[특정일]이 해당 일만 우선 적용
4) override 삭제하면 원래 timeline 목표로 복귀
5) exerciseCredit enabled + factor=0.5 + cap=500 동작
6) cap 초과 시 creditedKcal이 cap에 고정
7) distribution=CARB_BIASED일 때 carbG만 증가(또는 carb 우선 증가)
8) keto framework에서 distribution=FAT_BIASED일 때 fatG 증가
9) export/import 후 timeline/override/creditPolicy 보존
10) dateFormat 변경해도 저장 키(ISO)는 절대 변하지 않음
