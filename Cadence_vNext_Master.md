# Cadence vNext — Master Doc (Plan + API Spec + Mid-check)
**작성일:** 2026-01-20  
**구성:**  
1) 구현 계획/체크리스트(최적화 버전)  
2) 함수 시그니처/모듈 API 스펙  
3) 중간점검 결과(refactor/modularization zip 기준)

---

# Cadence vNext — Goal/Nutrition/Activity 설계 & 구현 계획서 (최적화 버전)
**작성일:** 2026-01-20  
**목표:** “목표(감량/유지/증량 등) + 식단 방식(저탄/케토/고탄/고단백 등)”을 설정하면, 각 날짜의 **기준 목표(Base)** 및 **최종 목표(Final: 운동 보정 포함)**를 일관되게 계산·표시하고, **과거 대시보드가 절대 흔들리지 않게**(목표 이력 기반) 만드는 것.

---

## 0) 설계 결론(핵심만)
### A. 목표 데이터 모델은 **하이브리드**가 최적
- **(1) 목표 이력 타임라인(timeline)**: “오늘부터 기본 목표가 바뀜” (v29 방식)
- **(2) 날짜별 오버라이드(overrideByDate)**: “이 날짜만 목표를 다르게”
- **(3) 운동 보정(exercise credit)**: “운동 많이 한 날 목표를 자동/반자동 보정” (계산 레이어)

➡️ 이렇게 하면
- 설정을 바꿔도 과거 목표가 바뀌지 않고(타임라인),
- 특정 날짜만 예외 처리도 가능하며(override),
- 운동량 반영도 과도한 복잡도 없이 가능(credit factor).

### B. 날짜는 저장/키는 **무조건 ISO** (`YYYY-MM-DD`)
- dateFormat은 **표시/입력 파싱**만 담당 (저장/키는 절대 바꾸지 않음)

### C. “하루 목표가 매일 바뀌는가?”
- 기본적으로는 **아닙니다.**
  - 기본 목표는 `profile + activityFactor + goalMode + framework`로 정해지고,
  - 매일 달라지는 요인은 보통 **(1) 체중 업데이트**, **(2) 운동 보정**, **(3) 해당 날짜 override**입니다.

---

## 1) 사용자 질문: “활동적/비활동(activity level)이 쓸모없어지나?”
**쓸모 있습니다.** 이유는 아래 3가지입니다.

1) **기본 TDEE(기준 칼로리)**의 출발점이 됩니다.  
   운동 보정을 별도로 하더라도, “운동 기록이 없는 날”은 활동레벨이 사실상 목표를 결정합니다.

2) **NEAT(일상 활동량) 편차를 흡수하는 ‘거친 캘리브레이션’** 역할을 합니다.  
   같은 운동을 해도 직업/일상/이동량이 다르면 유지칼로리가 달라집니다.

3) 운동 보정이 있다면 오히려 활동레벨이 중요해집니다(이중계산 방지 설계 필요).  
   - 권장 원칙: **activityFactor는 ‘운동 외 일상’ 베이스**로 두고,  
     **recorded cardio/explicit workout**만 credit로 더합니다.
   - 현실적 옵션:
     - (간단) activityFactor 그대로 + creditFactor는 0.5 이하(보수적)
     - (정확) activityFactor를 sedentary~light로 낮추고, 운동은 credit로 반영

➡️ 결론: activityFactor는 “쓸모없어지는 값”이 아니라, **기본선(베이스라인)** 입니다.

---

## 2) 데이터 모델(권장 스키마 v1)
> 단일 userdb key: `cadence.userdb`  
> 아래는 Goal 시스템에 필요한 부분만 발췌

```json
{
  "meta": { "schemaVersion": 1, "createdAt": 0, "updatedAt": 0 },
  "profile": {
    "sex": "M",
    "age": 30,
    "heightCm": 178,
    "weightKg": 75,
    "activityFactor": 1.55
  },
  "settings": {
    "dateFormat": "YMD",
    "goal": {
      "defaultFrameworkId": "DGA_BALANCED",
      "defaultGoalMode": "MAINTAIN",
      "energyModel": {
        "cutPct": 0.15,
        "bulkPct": 0.08
      },
      "exerciseCredit": {
        "enabled": true,
        "factor": 0.5,
        "capKcal": 500,
        "distribution": "CARB_BIASED"
      }
    }
  },
  "goals": {
    "timeline": [
      {
        "effectiveDate": "2026-01-01",
        "spec": { "frameworkId": "DGA_BALANCED", "goalMode": "MAINTAIN" },
        "targets": { "kcal": 2300, "proteinG": 140, "carbG": 260, "fatG": 70, "sodiumMg": 2300, "waterMl": 2500 },
        "rules": { "proteinGkg": 1.4, "satFatCapPct": 0.10, "sodiumCapMg": 2300 },
        "createdAt": 1735689600000,
        "note": "baseline"
      }
    ],
    "overrideByDate": {
      "2026-01-20": {
        "reason": "Long run",
        "targets": { "kcal": 2700, "proteinG": 150, "carbG": 340, "fatG": 70 },
        "locked": true,
        "updatedAt": 1737340000000
      }
    }
  },
  "days": {
    "2026-01-20": {
      "dietLogs": { "breakfast": [], "lunch": [], "dinner": [], "snack": [], "waterMl": 0 },
      "workoutLogs": { "cardio": [], "strength": [] }
    }
  }
}
```

### 2-1) 과거 불변 원칙(대시보드 흔들림 방지)
- 대시보드는 날짜 D에 대해 항상
  1) `overrideByDate[D]`가 있으면 그것을 목표로 사용
  2) 없으면 `timeline`에서 `effectiveDate <= D`인 가장 최근 항목 사용
- “오늘 설정 변경”은 `timeline`에 **새 항목 추가**(effectiveDate=오늘)로만 처리
- 특정 날짜만 바꾸려면 `overrideByDate[date]`로만 처리

---

## 3) Nutrition Framework(식단 방식) 설계
### 3-1) 프레임워크는 “정책 객체 + 엔진”으로 분리
- `frameworks.js`: 프리셋 정의(저탄/케토/고단백/고탄/균형 등)
- `targetEngine.js`: profile/settings/spec -> targets 계산(단백질 g/kg 우선 + 비율/제약)

### 3-2) 최소 프리셋(초기 6개)
- `DGA_BALANCED` (기본)
- `HIGH_PRO` (고단백)
- `LOW_CARB` (저탄)
- `KETO` (케토)
- `HIGH_CARB` (고탄/퍼포먼스)
- `CUSTOM` (수동)

### 3-3) 프리셋이 늘어도 복잡도 폭발하지 않는 규칙
- 프리셋은 “계산 규칙”만 제공하고, 저장은 **frameworkId**로만 저장
- 목표치 저장은 `timeline.targets`(또는 override)로만 저장(실제 수치 스냅샷)

---

## 4) 운동 보정(Exercise Credit) — “단순하지만 강력한” 정책
### 4-1) 정책
- `creditedKcal = clamp(round(exerciseKcal * factor), 0, capKcal)`
- `finalKcal = baseKcal + creditedKcal`
- 매크로 분배 방식(선택)
  - `CARB_BIASED`: creditedKcal의 80~100%를 탄수로
  - `SAME_RATIO`: 기존 탄/지 비율로 분배
  - `FAT_BIASED`: 케토에서 지방 위주

### 4-2) 어디까지 자동화할지(권장 단계)
- v1: cardio 로그에서만 exerciseKcal 추정(MET 기반 또는 간단 입력)
- strength는 kcal 추정 제외(또는 매우 보수적 상수), 추후 옵션

---

## 5) UI/UX(ìµœì†Œ ë³€ê²½ìœ¼ë¡œ ìµœê°• íš¨ìš©)
### 5-1) Settings ì¤‘ì‹¬ ëª©í‘œ ê´€ë¦¬(ê¶Œìž¥)
- Settingsì—ì„œë§Œ ëª©í‘œ/í”„ë ˆìž„ì›Œí¬/í™œë™ëŸ‰/ìš´ë™ ë³´ì • ì •ì±…ì„ ìˆ˜ì •
- ì €ìž¥ ì‹œ `goals.timeline`ì— **ì˜¤ëŠ˜ ë‚ ì§œë¡œ ì—”íŠ¸ë¦¬ ì¶”ê°€**
- Settings í•˜ë‹¨ì—ëŠ” **ì½ê¸° ì „ìš© Goal Preview ì¹´ë“œ**(ì‹¤ì‹œê°„ ë°˜ì˜)

### 5-2) Settings â†’ Goal History (ì‹ ê·œ ì„¹ì…˜)
- íƒ€ìž„ë¼ì¸ ë¦¬ìŠ¤íŠ¸(ì–¸ì œ ë¬´ì—‡ì´ ë°”ë€Œì—ˆëŠ”ì§€)
- ë‚ ì§œ ì„ íƒ í›„:
  1) â€œì´ ë‚ ì§œë§Œ ëª©í‘œ ì˜¤ë²„ë¼ì´ë“œ ì¶”ê°€/ìˆ˜ì •â€
  2) â€œì˜¤ë²„ë¼ì´ë“œ í•´ì œâ€
  3) (ì„ íƒ) â€œlockâ€ í† ê¸€
- ì´ ì„¹ì…˜ì´ `overrideByDate` UIë¥¼ ë‹´ë‹¹

### 5-3) ëŒ€ì‹œë³´ë“œ(í˜¹ì€ ìš”ì•½ ì¹´ë“œ)ì—ì„œ ëª©í‘œ vs ì‹¤ì œ
- ë„ë„› ì°¨íŠ¸(ì„­ì·¨/ìš´ë™/ìž”ì—¬) + ë‹¬ì„±ë¥  í‘œì‹œ
- â€œëª©í‘œ ê¸°ì¤€ì¼/ì¶œì²˜(override/timeline)â€ëŠ” ìž‘ì€ ì •ë³´ë¡œë§Œ í‘œì‹œ
- Workout/Diet ìƒë‹¨ì—ëŠ” **Goal Card ëŒ€ì‹  ìš”ì•½(ì„¸íŠ¸/ë³¼ë¥¨/ìœ ì‚°ì†Œ/ì¹¼ë¡œë¦¬)** ë˜ëŠ”
  **ì˜ì–‘ í•©ì‚° ìš”ì•½**ìœ¼ë¡œ ë¶„ë¦¬

### 5-4) Settings â†’ Goal/Nutrition(ì„¸ë¶€ í•­ëª©)
- Default Goal Mode / Default Framework
- Activity Factor(í™œë™ ë ˆë²¨)
- Exercise Credit: enabled, factor(0~1), capKcal, distribution
- Date format(í‘œì‹œë§Œ): YMD/MDY
## 6) 구현 순서(체크리스트 + 완료 기준)
### Phase 1 — Goal 데이터 구조 & selector
- [ ] `userdb.goals.timeline` 스키마 추가(없으면 baseline 1개 생성)
- [ ] `getEffectiveGoal(date)` selector 구현
- [ ] Dashboard/DayView가 “date별 목표”를 selector로만 읽도록 통일  
✅ 완료 기준: “오늘 목표를 바꿔도 과거 도넛이 바뀌지 않음”

### Phase 2 — Nutrition Engine(프리셋 + 계산)
- [ ] frameworks 6종 정의
- [ ] `computeBaseTargets(profile, spec, settings)` 구현
- [ ] settings 변경 시 “새 timeline 엔트리 생성”으로만 적용  
✅ 완료 기준: 프리셋 바꾸면 ‘오늘부터’ 목표가 바뀌고, 과거는 유지

### Phase 3 — Override(해당 날짜만)
- [ ] `setGoalOverride(date, patch)` / `clearGoalOverride(date)`
- [ ] UI 버튼/모달(해당 날짜만 수정, lock 옵션)  
✅ 완료 기준: 특정 날짜에만 목표가 바뀌고, 다른 날은 영향 없음

### Phase 4 — Exercise Credit
- [ ] `getExerciseKcal(date)` 구현(cardio만)
- [ ] `applyExerciseCredit(baseTargets, exerciseKcal, creditPolicy)` 구현
- [ ] Goal Card에 Base/Credit/Final 표시  
✅ 완료 기준: 운동 기록 추가/삭제 시 그 날짜 Final 목표가 즉시 반영

### Phase 5 — 회귀 테스트(최소)
- [ ] 날짜 3개(A/B/C)에서 목표 바꾸기/오버라이드/운동 보정 조합 테스트
- [ ] export/import 후에도 timeline/override 유지 확인  
✅ 완료 기준: “대시보드 달성률”이 날짜마다 안정적으로 계산됨

---

## 7) 로컬 에이전트에게 줄 구현 지시 템플릿(짧은 버전)
- 목적: `goals.timeline + goals.overrideByDate + exerciseCredit` 기반의 목표 시스템 구현
- 제약:
  - 날짜 키 ISO 고정
  - UI는 selector 함수만 사용(직접 localStorage 접근 금지)
  - 목표 변경은 timeline add 방식
  - 특정 날짜만 바꾸는 것은 overrideByDate 방식


---

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


---

# (추가) 중간점검 결과 — refactor/modularization(zip) 기준

> 범위: 업로드된 `Cadence.zip`(refactor/modularization) 코드 베이스를 기준으로 “방향성 + 즉시 수정할 이슈”를 점검했습니다.  
> 목적: vNext 목표 시스템을 얹기 전에, 현재 리팩터가 흔들릴 수 있는 지점을 먼저 고정합니다.

---

## 1) 방향성 점검(잘 하고 있는 부분)
- `src/core` / `src/utils` / `src/services` / `src/ui`로 모듈 경계가 잡혀 있습니다.
- store → render(구독) 흐름이 자리 잡아서 “UI가 로컬스토리지 직접 접근”을 줄이는 구조로 가고 있습니다.
- 이벤트를 `data-action` 중심으로 위임하는 구조가 유지보수에 유리합니다.
- nutrition 정책/엔진을 서비스로 분리해둔 것은 vNext 확장(프레임워크/보정)과 궁합이 좋습니다.

---

## 2) 즉시 수정 추천(버그/리스크)
### 2-1) `change` 이벤트 리스너 중복 등록 가능성
- `initApp()`에서 `document.addEventListener('change', ...)`가 2번 걸려 있으면,
  물 입력/설정 변경 등이 **중복 처리**될 수 있습니다.

**수정 가이드(권장):**
- `change` 리스너는 1개만 유지하고, 그 내부에서 `handleActionChange()`를 호출하세요.
- (볼륨 슬라이더 텍스트 업데이트 같은 부가 로직도 같은 리스너 안에서 처리)

---

### 2-2) dateFormat enum 불일치 가능성
- UI 선택지는 `YMD/MDY`인데, 기본값/저장값이 다른 문자열(`KO_DOTS` 등)로 섞이면
  렌더/파싱에서 “조용히 깨지는” 버그가 생길 수 있습니다.

**수정 가이드(권장):**
- `settings.dateFormat` 허용값을 enum으로 고정: `YMD | MDY | KO_DOTS`
- 기본값은 `YMD`로 통일
- 저장 키(ISO)는 절대 바꾸지 않고, dateFormat은 표시/입력 파싱만 담당

---

### 2-3) iOS 홈화면 타이틀(meta) 미정합
- `<title>Cadence</title>`를 바꿔도, iOS “홈화면에 추가” 타이틀은
  `apple-mobile-web-app-title` meta를 따로 봅니다.

**수정 가이드(권장):**
```html
<meta name="apple-mobile-web-app-title" content="Cadence">
```

---

### 2-4) 날짜 이동(addDays)의 DST/타임존 리스크
- `toISOString().slice(0, 10)` 패턴은 환경에 따라 날짜가 하루 밀리는 케이스가 생길 수 있습니다.
- vNext에서 목표 이력(timeline)과 날짜별 override는 날짜 정합성이 생명이라,
  `addDays()`는 UTC 기준으로 안전하게 만드는 편이 좋습니다.

**수정 가이드(권장):**
- ISO 문자열을 분해해 `Date.UTC(y, m-1, d)`로 만들고,
- delta를 더한 뒤 다시 UTC로 ISO를 만들기.

---

## 3) vNext 얹기 전에 “필수 정리” 체크리스트(중간점검 기반)
- [ ] `change` 리스너 1개만 유지(중복 제거)
- [ ] `settings.dateFormat` enum/기본값 통일 + 저장 키 ISO 고정 원칙 문서화
- [ ] iOS meta title Cadence로 정리
- [ ] `addDays()` UTC-safe로 교체
- [ ] UI가 목표를 계산/저장하지 않고, 반드시 `selectors/goalSelectors`를 통해 읽도록 경로 고정

---

## 4) vNext와의 연결 포인트(중간점검 → 다음 커밋)
- 목표 관련 UI(도넛/Goal 카드)는 아래 단 하나를 기준으로 합니다:
  - `selectGoalForDate(state, dateISO)` → `{ base, final, meta }`
- Settings에서 “오늘부터 목표 변경”은:
  - `Actions.setDefaultGoalSpec({ effectiveDateISO: todayISO(), frameworkId, goalMode })`
- “이 날짜만 수정”은:
  - `Actions.setGoalOverride({ dateISO, override })`

이렇게만 고정하면, 이후 기능 확장(새 프레임워크/새 보정 방식/새 규칙)이 UI에 누수되지 않습니다.

---

# (추가) 리라이트/영양 문서 통합 요약
> 아래 내용은 `cadence_rewrite_plan_final.md`와 `cadence_nutrition_upgrade_plan.md`에서 필요한 핵심만 흡수한 요약입니다.

## A) 리라이트 기본 원칙(요약)
- 데이터는 `cadence.userdb` 단일 키 + DateKey는 ISO(`YYYY-MM-DD`) 고정
- UI는 storage 직접 접근 금지, store/actions 경유
- 이벤트 위임은 `data-action` 기반, `innerHTML` 금지
- 저장은 persist 레이어에서 debounce 처리, 실패 시 배너 + 백업 유도
- 정적 DB(`/src/data/*`)는 백업 대상이 아님

## B) 권장 디렉토리 구조(요약)
- `/core`: schema/storage/store/persist/logger
- `/utils`: date/dom/helpers
- `/data`: exercise/food/cardio
- `/services`: workout/diet/body/backup + nutrition/goal 관련 로직
- `/ui`: components/views/app

## C) 영양 업그레이드 핵심(요약)
- Goal(칼로리 델타) × Framework(영양 기준) 분리
- DGA/AMDR/ISSN/Endurance 프리셋을 정책 파일로 고정
- satFat/fiber/addedSugar는 “있을 때만 표시”로 단계적 도입
- profile에 `trainingLoad`(endurance 탄수 g/kg 계산용) 확장 고려

## D) DGA 팩트 체크(요약)
- DGA는 USDA + HHS 공동 가이드라인
- 2025–2030 DGA 반영을 프리셋 기준으로 사용
