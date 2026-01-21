# Cadence: Body 통계 복원·발전 + Nutrition Stat 확장 제안서 (Refactor 유지보수 중심)
**기준:** `Cadence.zip`(refactor/modularization 브랜치 상태) + 레거시 `app_v29.js`  
**작성일:** 2026-01-21  
**범위:**  
- v29의 **Body 통계 허브 + 운동 통계 상세 4종**을 vNext 구조로 **복원 + 발전**  
- 현재 refactor 구조에서 **유지보수 리스크(미사용 모듈, diet 이중 소스 등)** 정리  
- `nutritionEngine.js`, `nutrition/frameworks.js`를 **“영양 통계 페이지 1~2개”**로 연결해 **죽은 코드 → 기능화**  
- (옵셔널) 맨몸/어시스트 중량 기록 정책은 To-do에만 올림

---

## 0) 목표(Outcome) 정의
### 0-1. 사용자가 체감하는 최종 결과
- **Body 탭 = 통계 허브**로 복원
  - 측정 카드(체중/BMI/허리/근량/체지방) + 미니 트렌드
  - 월간 히트맵(운동 기반)
  - 통계 버튼: **운동 4개 + 영양 1~2개(총 5~6개)** 로 확장
- 통계 상세 페이지:
  - 운동: Activity / Balance / Distribution / Exercises (v29 동등 기능)
  - 영양: Nutrition Trend(칼로리·3대영양소) + (선택) Nutrition Quality(나트륨/당/섬유/수분, Top foods)
- 모든 통계는 **3단 분리(Analytics Engine ↔ Selector(Cache) ↔ UI)**로 구현되어,
  - 기능 추가/수정 시 UI만 건드려도 되고
  - 집계는 순수 함수라 테스트 가능하며
  - 렌더 성능은 캐시로 안정화

### 0-2. 비목표(Non-goals)
- 데이터 마이그레이션(현 데이터가 거의 없다고 가정)
- 대형 차트 라이브러리 도입(Chart.js/D3 전면 도입 등)
- PWA/서버 배포 방식 변경(캐시 해시 전략은 이미 별도 논의됨)

---

## 1) v29 기능 위치 팩트 체크 (복원 범위 정확히 고정)
> 레거시 `app_v29.js` 기준 “어디에 무엇이 있었는지”를 기준점으로 삼아, “같은 기능을 새 구조로 재작성”합니다.

### 1-1. Body 통계 허브(허브는 여기 기준)
- **Body 허브:** `window.renderMyBodyView` (L3861)
- **월간 히트맵:** `window.renderMonthlyHeatmap` (L4811)

> 로컬 모델 메모에 “renderWeightView”가 언급되지만, 허브 역할은 `renderMyBodyView`에 더 많이 집중돼 있습니다.  
> 따라서 **복원 기준은 renderMyBodyView 패턴**이 더 정확합니다.

### 1-2. 통계 상세(운동) 4종
- `renderActivityView` (L5717)
- `renderBalanceView` (L5825)
- `renderDistributionView` (L5900)
- `renderExercisesView` (L6122)

### 1-3. 집계 로직(Engine 후보)
- `renderPeriodSelector` (L5259)
- `getActivityData` (L5373)
- `getMuscleBalance` (L5437)
- `getMuscleDistribution` (L5471)
- `getBaselineP95` (L5539)
- `getExerciseIndex` (L5557)

---

## 2) 현재 refactor 구조 중간점검 (유지보수 관점)
### 2-1. 잘 된 점(계속 유지해야 할 구조)
- `core / services / selectors / ui / utils / data` 경계가 이미 잡혀 있어, 통계 복원 시에도 “파일 하나에 몰빵”으로 회귀하지 않을 기반이 있습니다.
- 목표 시스템은 Settings 중심 + 날짜별 평가 구조로 확장 가능(Goal card는 Settings에 유지하는 판단이 합리적).

### 2-2. 반드시 정리해야 할 리스크(통계 복원 전에 정리 권장)
1) **죽은 코드(미사용 모듈) 존재**
- `src/services/nutritionEngine.js`
- `src/services/nutrition/frameworks.js`
- 현재 import 사용처가 없으므로, “삭제/아카이브”하거나 “영양 통계 페이지로 연결”해야 합니다.  
➡️ 본 제안서는 **‘영양 통계 페이지로 연결’**을 권장합니다(가치 회수 + 기능 확장).

2) **diet 데이터 이중 소스 가능성**
- `diet[date].meals` 와 `diet[date].logs`가 동시에 존재/갱신될 여지가 보이면,
- totals 집계 기준이 한쪽으로 고정돼 있을 때 다른쪽이 불일치하면 통계가 깨집니다.  
➡️ 통계 페이지를 추가하려면 **Diet Single Source**를 먼저 고정해야 합니다.

---

## 3) 설계 원칙(이번 작업에서 무조건 지킬 것)
### 3-1. 3단 분리(재스파게티 방지 핵심)
- **Analytics Engine:** 순수 함수(입력: userdb+range+옵션 → 출력: JSON 결과)
- **Selectors:** rangeKey 기반 캐시 + state 조합
- **UI(View/Components):** selector 호출해서 그리기만

### 3-2. 통일된 공통 UI
- 기간 선택(rolling/calendar), metric 토글(sets/volume/time), 공통 카드/차트 컴포넌트는 반드시 재사용합니다.
- v29처럼 “페이지마다 selector UI가 제각각”이 되면 유지보수가 급격히 어려워집니다.

### 3-3. 단위/표기 규칙
- 저장 단위는 내부 표준(kg, g, HH:mm 등)으로 고정
- 사용자 표기는 settings(dateFormat, timeFormat, unit)에서 변환  
(이번 문서 범위에서는 시간/날짜 표시는 *필요시*만 건드리되, 통계 복원과 충돌하지 않게 유지)

---

## 4) 권장 디렉토리/모듈 구조(통계 확장용)
> 이미 존재하는 구조를 존중하면서 “통계” 전용 모듈을 추가합니다.

```text
src/
  services/
    analytics/
      period.js                 # rolling/calendar range 계산
      workoutAgg.js             # sets/volume/time timeseries + summary
      muscleAgg.js              # balance/distribution + baseline(p95)
      exerciseAgg.js            # exercise index(정렬/필터용)
      bodyAgg.js                # weight/BMI/waist/bodyfat trend (Body 측정치)
      nutritionAgg.js           # calories/macros/micros timeseries + top foods
  selectors/
    stats/
      workoutStatsSelectors.js
      nutritionStatsSelectors.js
      bodyStatsSelectors.js
  ui/
    views/
      body/BodyHubView.js       # Body 통계 허브(측정+히트맵+버튼)
      stats/
        ActivityView.js
        BalanceView.js
        DistributionView.js
        ExercisesView.js
        NutritionTrendView.js   # (신규) 칼로리/3대영양소 추이
        NutritionQualityView.js # (선택) 나트륨/당/섬유/수분 + Top foods
    components/
      PeriodSelector.js
      MetricToggle.js
      MiniSparkline.js          # SVG 미니차트
      HeatmapMonth.js           # 월간 히트맵
      BodyMapView.js            # 근육 바디맵 색칠
```

---

## 5) 라우팅 설계(필수 결정)
현재 router가 `dashboard/workout/diet/body/settings`만 지원한다면, 통계 상세를 위해 라우팅을 확장해야 합니다.

### 선택지 A: flat route (구현 가장 쉬움)
- `stats_activity`, `stats_balance`, `stats_distribution`, `stats_exercises`
- `stats_nutrition_trend`, `stats_nutrition_quality`

장점: 구현 쉬움  
단점: route 문자열이 늘어남

### 선택지 B: subroute (권장: 확장 친화)
- `#stats/activity`
- `#stats/nutrition/trend`

장점: 계층적 구조, 확장 쉬움  
단점: router 파싱 로직 약간 추가

**권장:** B (통계가 늘어날 가능성이 높음)

---

## 6) 통계 버튼 구성(운동 4 + 영양 1~2) UI 제안
Body 허브에서 “통계 버튼”을 2x2에서 확장해야 합니다.

### 옵션 1) 2x3 그리드(총 6개) — 추천
- Row1: Activity | Balance | Distribution  
- Row2: Exercises | Nutrition Trend | Nutrition Quality(선택)  
장점: 한 화면에서 한 번에 접근  
단점: 모바일에서 버튼이 작아질 수 있어 spacing 필요

### 옵션 2) 운동 2x2 + 하단 ‘영양’ 섹션(버튼 1~2개)
장점: 기존 2x2 감각 유지  
단점: 스크롤/인지 비용

**권장:** 옵션1(2x3) + 버튼 텍스트를 짧게(아이콘 + 1줄) + 카드형 간격 확보

---

## 7) Diet Single Source 정리(영양 통계 전에 선행)
영양 통계는 “하루 총합”이 정확해야 합니다. 따라서 식단 저장 구조를 먼저 고정합니다.

### 7-1. 권장 규칙
- **원본 기록은 logs 하나로 통일**
  - 각 log는 foodId/serving/grams/amount/time 등을 포함
- 하루 totals는 “파생 데이터”로 계산(캐시 가능)

### 7-2. 최소 변경안(현 구조를 크게 흔들지 않으면서)
- `diet[date].logs`를 **truth**로 두고,
- `diet[date].meals`가 이미 존재한다면:
  - UI용 grouping(view)으로만 사용하거나,
  - 점진적으로 제거(또는 logs로부터 재생성)합니다.

**Acceptance criteria**
- 같은 하루에 대해 logs만 있으면 totals가 정확히 계산됨
- meals/logs 간 불일치로 totals가 틀어지지 않음

---

## 8) Analytics Engine 설계 (함수 시그니처)
> “v29에서 한 파일에 섞여 있던 집계”를 “모듈 순수 함수”로 재작성합니다.

### 8-1. Period Engine
```js
// src/services/analytics/period.js
export function makeDateRange({ mode, anchorISO, spanDays, calendarMonthISO }) {}
// returns: { startISO, endISO, dates: string[], label: string, key: string }

export function shiftRange({ range, direction }) {}
// direction: -1 | +1
```

### 8-2. Workout 집계
```js
// src/services/analytics/workoutAgg.js
export function aggregateWorkoutRange({ userdb, startISO, endISO, metric }) {}
// metric: 'sets' | 'volume' | 'time'
// returns: { timeseries: Array<{dateISO, value}>, summary: {...} }

export function aggregateWorkoutHeatmap({ userdb, monthISO, metric }) {}
// returns: { days: Array<{dateISO, value, norm01}> }
```

### 8-3. Muscle 집계
```js
// src/services/analytics/muscleAgg.js
export function aggregateMuscleBalance({ userdb, startISO, endISO, metric }) {}
// returns: { groups: Array<{groupKey, value, prevValue, delta}> }

export function aggregateMuscleDistribution({ userdb, startISO, endISO, metric, baseline }) {}
// returns: { muscles: Array<{muscleKey, value, norm01}> }

export function computeBaselineP95({ muscles, metric, fallback = 10 }) {}
```

### 8-4. Exercise 인덱스
```js
// src/services/analytics/exerciseAgg.js
export function buildExerciseIndex({ userdb, startISO, endISO, metric, query, sortKey }) {}
// returns: Array<{exerciseId, name, sets, volume, time, lastISO}>
```

### 8-5. Body(측정치) 집계
```js
// src/services/analytics/bodyAgg.js
export function aggregateBodyTrend({ userdb, startISO, endISO, metricKey }) {}
// metricKey: 'weightKg'|'bmi'|'waistCm'|'bodyFatPct'|'leanMassKg'
```

### 8-6. Nutrition 집계 (죽은 코드 → 기능화 포인트)
```js
// src/services/analytics/nutritionAgg.js
export function aggregateNutritionTrend({ userdb, startISO, endISO, metric }) {}
// metric: 'kcal'|'proteinG'|'carbG'|'fatG'|'sodiumMg'|'sugarG'|'fiberG'|'waterMl'
// returns: timeseries + summary

export function buildTopFoods({ userdb, startISO, endISO, by = 'kcal', limit = 10 }) {}
// returns: [{foodId, name, totalKcal, count, grams}]
```

`nutritionEngine.js`와 `frameworks.js`는 여기로 합치는 게 가장 깔끔합니다:
- frameworks는 “목표/권장 비율” 계산에 사용
- engine은 “일별 totals 계산 + metric 도출”에 사용  
➡️ 사용처를 “NutritionTrendView / NutritionQualityView”로 연결하면 죽은 코드가 사라집니다.

---

## 9) Selector(Cache) 설계(성능/일관성)
### 9-1. 캐시 키
- `range.key`(startISO-endISO-mode-span) + `metric` + `page` 조합을 키로 사용

### 9-2. 예시 시그니처
```js
// src/selectors/stats/workoutStatsSelectors.js
export function selectWorkoutActivity(state, rangeKey, metric) {}
export function selectMuscleBalance(state, rangeKey, metric) {}
export function selectMuscleDistribution(state, rangeKey, metric) {}
export function selectExerciseIndex(state, rangeKey, metric, sortKey, query) {}

// src/selectors/stats/nutritionStatsSelectors.js
export function selectNutritionTrend(state, rangeKey, metric) {}
export function selectTopFoods(state, rangeKey, by, limit) {}
```

---

## 10) Phase 계획(권장 순서 + 완료 조건)
> “허브 복원 → 공통 컴포넌트 → 운동 4개 → 영양 1~2개” 순서로 가면 속도/리스크가 가장 좋습니다.

### Phase 0 — 기준선 고정 & 정리(반나절~1일)
**목표:** 통계 작업 전에 구조적 리스크 제거  
- [ ] router 확장 방식(A/B) 결정 및 뼈대 구현
- [ ] diet single source 방향 결정(logs truth)
- [ ] `nutritionEngine.js`, `frameworks.js` 처리 방향 결정(삭제 vs 기능화)  
  - 본 제안서에서는 “기능화”로 확정

**완료 조건**
- 통계 route로 이동 가능한 상태(빈 화면이어도 됨)
- diet totals 계산 기준이 흔들리지 않음

### Phase 1 — Analytics Engine 기반 공사(1~2일)
**목표:** UI 없이도 집계 결과가 나오는 상태  
- [ ] `services/analytics/period.js`
- [ ] `workoutAgg/muscleAgg/exerciseAgg/bodyAgg` 1차 구현
- [ ] selectors(stats/*) 캐시 레이어 구성

**완료 조건**
- 콘솔에서 “기간/metric 바꿔도 결과 JSON이 일관”되게 나옴

### Phase 2 — Body 허브 복원(1~2일)
**목표:** v29의 허브를 vNext 스타일로 이식  
- [ ] `BodyHubView`: 측정 카드 + 미니 트렌드(7/30/90)
- [ ] 월간 히트맵(운동 기반)
- [ ] 통계 버튼 2x3(운동4 + 영양1~2) UI 배치
- [ ] 공통 컴포넌트: `MiniSparkline`, `HeatmapMonth`

**완료 조건**
- Body 탭에서 “통계 허브”로 탐색이 가능
- 버튼 클릭으로 통계 상세 route 진입 가능

### Phase 3 — 운동 통계 상세 4종 복원(2~4일)
**목표:** v29 동등 기능 + 공통 토글 통일  
- [ ] ActivityView: sets/volume/time + rolling/calendar + timeseries
- [ ] BalanceView: 대근육군 비교(전기간 vs 이전기간)
- [ ] DistributionView: 목록 + 바디맵(sets/vol/time 토글)
- [ ] ExercisesView: 운동별 리스트(정렬/필터/검색, 카테고리 탭)

**완료 조건**
- 4페이지 모두 동일한 PeriodSelector/MetricToggle 사용
- 기간 이동/토글 변경 시 성능이 튀지 않음(캐시 적용 확인)

### Phase 4 — 영양 통계 1~2개 추가(1~3일)
**목표:** 죽은 코드(nutritionEngine/frameworks) 기능화 + 통계 버튼 확장 완성  
- [ ] NutritionTrendView(필수): kcal + P/C/F 추이 + 목표 대비
- [ ] NutritionQualityView(선택): 나트륨/당/섬유/수분 카드 + Top foods
- [ ] 기존 nutritionEngine/frameworks를 `nutritionAgg`에 통합/연결

**완료 조건**
- Body 허브에서 영양 통계 페이지로 진입 가능
- diet logs 기준으로 추이가 일관되게 계산됨

### Phase 5 — 리팩토링 마감(지속)
- [ ] 사용하지 않는 legacy CSS/중복 컴포넌트 정리
- [ ] stats 관련 UI 스타일 토큰 통일
- [ ] (옵션) 맨몸/어시스트 중량 기록 정책 To-do로 등록

---

## 11) Optional To-do (이번 스코프 밖, 기록만)
- [ ] 맨몸/어시스트 운동 중량 기록 정책(loadType/assistKg/addedKg/effectiveLoad) 설계
- [ ] volume 집계 제외 정책(volumePolicy) 도입 여부 검토
- [ ] 수분(water) 트래킹 UI/DB 확장

---

## 12) 리스크 & 회피 전략
### 12-1. “통계는 됐는데 숫자가 이상” 리스크(가장 흔함)
- 원인: diet/workout source가 여러 갈래, totals 계산 기준 혼재  
- 회피: **Single Source 확정(Phase 0)** + Engine은 순수 함수로 만들기

### 12-2. “렌더마다 버벅임” 리스크
- 원인: 매 렌더마다 range 전체 집계를 재계산  
- 회피: selector 캐시 + rangeKey 기반 memoization

### 12-3. “UI 컴포넌트 폭발” 리스크
- 원인: 페이지별로 period/metric UI가 다르게 구현됨  
- 회피: PeriodSelector/MetricToggle를 공통 컴포넌트로 고정

---

## 13) 바로 실행용 체크리스트(로컬 모델/에이전트에게 주기 좋은 형태)
### 13-1. Phase 0
- [ ] router에 `stats/*` route 지원(옵션 B 권장)
- [ ] diet single source 결정(logs truth)
- [ ] nutritionEngine/frameworks → nutritionAgg로 통합 계획 확정

### 13-2. Phase 1
- [ ] period.js 구현 + 테스트
- [ ] workoutAgg/muscleAgg/exerciseAgg/bodyAgg 구현
- [ ] selectors(stats/*) 캐시 구현

### 13-3. Phase 2
- [ ] BodyHubView(측정/트렌드/히트맵/버튼 2x3)
- [ ] MiniSparkline/HeatmapMonth 컴포넌트

### 13-4. Phase 3
- [ ] Activity/Balance/Distribution/Exercises 페이지 구현
- [ ] 공통 토글/기간 컴포넌트 적용

### 13-5. Phase 4
- [ ] NutritionTrendView(필수)
- [ ] NutritionQualityView(선택)
- [ ] Top foods 계산 및 표시

---

## 요약(핵심만)
- **복원 기준은 `renderMyBodyView`(허브) + 통계4종 + 집계함수 세트**가 맞습니다.
- refactor 구조는 이미 좋은 방향이며, 통계 복원은 **3단 분리(Engine/Selector/UI)**를 지키면 안전합니다.
- `nutritionEngine.js/frameworks.js`는 삭제보다 **영양 통계 1~2개 페이지로 연결해 기능화**하는 게 가치가 큽니다.
- 영양 통계 전에 **diet single source**를 먼저 고정해야 숫자 신뢰도가 유지됩니다.
- 맨몸/어시스트 중량 기록은 이번 스코프에서는 **옵셔널 To-do**로만 등록합니다.
