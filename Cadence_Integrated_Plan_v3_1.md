# Cadence 리팩터링 + 목표/대시보드 설계 통합 계획서 (v3.1)

- 작성일: 2026-01-20
- 기준 코드: `Cadence.zip`(refactor/modularization 스냅샷) 기반 중간점검 + 요구사항 반영
- 핵심 결정(반영 완료 목표):
  - **내부 저장 키는 ISO 날짜(YYYY-MM-DD)로 고정**합니다. (표시는 사용자 설정)
  - **목표/식단 방식 설정 UI는 “설정(Settings)”에만 둡니다.** (Diet/Workout 페이지에는 “편집 카드”를 두지 않음)
  - 목표 변경은 **‘오늘 이후’에만 적용**되도록 하고(=과거 대시보드 흔들림 방지), 변경 이력을 기반으로 날짜별 목표를 재현합니다.
  - 시간 표시 형식은 설정에서 **12/24시간제 선택**, 12시간제일 때 표기는 **무조건 AM/PM**만 사용합니다(오전/오후 금지).

---

## 0) TL;DR (이번 라운드에서 반드시 끝내야 하는 것)

### 중간 평가 (의견)
- 방향성은 매우 좋음: ISO 날짜 고정 + 목표 타임라인 + 모듈화는 vNext의 안정성에 필수.
- 당장 리스크 큰 것은 **addDays DST 이슈**뿐이라, 이것부터 고정하는 게 맞음.
- `timeFormat`을 먼저 넣어두면 Diet/Workout/Timeline 시간 표시가 앞으로 흔들리지 않음.
- `dateFormat`은 **YMD/MDY만** 유지하고, 과거 포맷은 storage에서만 레거시 변환으로 정리.
- 목표 계산 경로는 **selector로만 읽기** 원칙 유지가 핵심(도넛/카드가 흔들리지 않음).

### Must-fix (버그/불일치)
- [x] **`dateFormat` 저장 기본값 불일치 수정**  
  - 현 코드 기준: `schema` 기본값은 `YMD`, `formHandlers` 기본값도 `YMD`.  
  - `storage` 레이어에서 레거시 값만 정리(변환)하고 있어 불일치 이슈는 해소된 상태.
- [x] **`change` 이벤트 리스너 중복 제거**  
  - `src/ui/app.js`에 같은 성격의 `change` 핸들러가 2번 붙어있는 형태입니다. (향후 “설정 변경 즉시 저장” 로직에서 버그의 씨앗)
- [x] **`addDays()` DST(서머타임) 안전하게 수정**  
  - `src/utils/date.js`는 로컬 타임존 Date 연산 + `toISOString()` 조합이라 DST 경계에서 날짜가 하루 튀는 케이스가 생길 수 있습니다.  
  - 해결: “UTC 기준 연산” 또는 “정오 고정” 패턴으로 수정.

### UX/기능 (요청사항 반영)
- [x] **설정에 시간 형식(timeFormat) 추가** (날짜 형식 옆 2열 드롭다운)
- [x] **Diet 기록 ‘시간’ 편집 가능하게**  
  - 기록 리스트에서 아이템 클릭 → “상세/수정 모달”로 들어가서 **시간 포함 수정 가능**하게
- [x] **홈 탭 제거** (운동/식단/신체에서 요약/상세 통합)

---

## 1) 현재 코드베이스 중간점검 결과 (구조/진척도)

### 1-1. 현재 폴더 구조 평가
현 구조는 “모듈화” 관점에서 좋은 출발입니다. `core / utils / services / ui / views`가 역할 기반으로 분리되어 있고, `main.js`가 부팅을 담당합니다.

#### 현재 `src/` 트리(요약)
- src/
  - core/
    - constants.js (0.2 KB)
    - logger.js (0.7 KB)
    - persist.js (1.0 KB)
    - schema.js (1.0 KB)
    - storage.js (2.3 KB)
    - store.js (1.9 KB)
  - data/
    - routines.js (2.6 KB)
  - services/
    - backupService.js (1.2 KB)
    - nutritionEngine.js (3.7 KB)
    - nutritionPolicies.js (1.3 KB)
  - ui/
    - components/
    - views/
    - app.js (25.3 KB)
  - utils/
    - date.js (1.4 KB)
    - dom.js (1.1 KB)
  - main.js (0.5 KB)
  - router.js (0.6 KB)

### 1-2. 파일 크기/집중도(유지보수 관점)
- `src/ui/app.js`: **25.3 KB** (현재도 가장 큰 파일, 앞으로 더 커질 가능성 높음)
- `src/ui/views/SettingsView.js`: **10.5 KB** (설정이 늘어날수록 커짐)
- `style.css`: **10.6 KB / 639 lines**  
  - “너무 크다” 수준은 아니지만, 기능이 늘면 빠르게 비대해질 수 있으니 “분할 기준”을 미리 정해두는 게 좋습니다.

### 1-3. 지금 당장 불필요/미사용(정리 후보)
- `src/core/logger.js`: 현재 import/사용 흔적이 거의 없습니다 → **(A) 지금 바로 디버그툴까지 붙여서 활성화**하거나, **(B) 당분간 제거/보류**가 깔끔합니다.
- `src/services/nutritionEngine.js`: 현재 UI에 연결되어 있지 않습니다 → 목표/대시보드 작업할 때 연결 예정이면 유지, 아니면 보류 폴더로 이동 권장.

---

## 2) “스냅샷 vs 목표 변경 이력”에 대한 결론 (당신의 질문에 대한 답)

### 결론
- “도넛 대시보드에 스냅샷이 나오니 굳이 저장하지 않아도 된다”는 방향은 **가능**합니다.
- 다만 **과거 대시보드가 흔들리지 않게 하려면** 최소한 아래 둘 중 하나는 필요합니다.

#### 옵션 1) 목표 이력(타임라인) 기반 재현 (권장)
- `settings` 변경 시, `goalTimeline`에 **effectiveDate + spec**을 append
- 특정 날짜를 볼 때 `goalTimeline`에서 “그 날짜에 유효한 spec”을 찾아 목표치 계산
- 장점: 저장공간 적고, 수정 이력 추적 가능  
- 단점: 계산 로직이 필수(하지만 이미 nutritionEngine 계획이 있으니 자연스럽습니다)

#### 옵션 2) 일별 목표 스냅샷 고정
- 매일 `diet[date].targetSnapshot` 같은 형태로 “그날의 목표치”를 저장
- 장점: 조회가 매우 단순  
- 단점: 데이터 중복/누적, 목표 로직이 바뀌면 과거는 영원히 예전 로직에 고정

➡️ 이번 리팩터에서는 **옵션 1(타임라인) + (선택) 옵션 2(하루 종료 시점에만 저장)** 조합을 추천합니다.

---

## 3) 설정에서 날짜/시간 형식 제공 (요청사항 반영 설계)

### 3-1. 데이터 모델
- `settings.dateFormat`: `'YMD' | 'MDY'`
- `settings.timeFormat`: `'H24' | 'H12'`  *(12시간제 표기는 **무조건 AM/PM**)*

### 3-2. UI 배치(당신 제안안 평가)
당신이 제안한 “날짜 형식 / 시간 형식”을 **한 줄 2열**로 두는 방식이 가장 정리되고 직관적입니다.

- 구현 포인트:
  - `SettingsView`에서 `dateSection`을 “grid 2열”로 만들고, 각 셀은 `(라벨 + select)` 형태로 통일
  - CSS: `.settings-format-row { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }` 같은 단순 그리드면 충분합니다.

---

## 4) Diet 기록: ‘시간’ 수정 + 상세 모달(요청사항 반영)

### 4-1. 현재 문제
- 현재 `diet[date].meals[]`는 `{ id, type, name }` 중심이라 **시간 개념이 없습니다.**
- 기록 리스트에서 아이템을 누르면 모달로 편집은 가능하지만, “시간이 없으니 시간 편집이 불가”합니다.

### 4-2. 최소 변경으로 해결하는 데이터 구조(권장)
- `diet[date].meals[]` 항목에 `timeHHMM`(예: `"07:30"`)를 추가합니다.
  - 날짜 이동까지 포함한 복잡한 timestamp 대신, **“하루 안에서의 시간”만 관리**합니다.
  - 날짜를 잘못 넣은 경우는 “아이템 이동(다른 날짜로 복사/이동)” 기능으로 해결합니다(추후).

예시:
```json
{
  "id": "m_abc123",
  "type": "breakfast",
  "name": "Greek yogurt",
  "timeHHMM": "07:30",
  "notes": "",
  "macros": { "kcal": 180, "p": 17, "c": 12, "f": 5 }
}
```

### 4-3. UI 플로우(“상세 모달” 흐름을 깔끔하게)
- **기록 리스트에서 아이템 클릭 → MealEditorModal (edit 모드)**
- **추가 버튼 클릭 → MealEditorModal (add 모드)**  
  - 이후 “푸드 DB 검색 모달 → 선택 → 상세 모달” 2단계는 다음 단계에서 붙이는 게 안정적입니다.  
  - 즉, **지금은 ‘상세 모달’ 하나로 add/edit 둘 다 해결**하고, 푸드 DB는 Phase 4에서 확장합니다.

---

## 5) 목표/식단 방식(저탄고지 등) 옵션 확장 방향

### 5-1. 왜 “활동적/비활동적(Activity level)”이 여전히 의미가 있나?
- Activity level은 **기본 TDEE(일상 활동 + 일반적 운동 포함)**을 잡는 역할이라 유용합니다.
- 다만 나중에 “오늘 운동량을 반영해서 목표를 올려주자”를 자동으로 하려면,
  - (A) **Activity level을 ‘sedentary(기본)’로 고정**하고, 운동 칼로리를 별도 +로 더하는 모델
  - (B) **Activity level을 평소대로 두고**, 운동 칼로리 자동 보정은 하지 않는 모델  
  중 하나를 선택해야 “중복 계산(double counting)”을 피할 수 있습니다.

➡️ 구현 난이도/안정성 기준으로는 **(B)부터** 시작하고, 이후 (A)를 옵션으로 넣는 것이 안전합니다.

### 5-2. 식단 방식(Diet framework) 확장(예시)
- Balanced(권장 기본)
- High-Protein
- Low-Carb / Keto
- Mediterranean
- Endurance(훈련량 많은 날)
- Custom(사용자 직접 매크로 비율/단백질 g/kg 등 입력)

이들은 “설정에서 선택”하고, 목표 타임라인에 기록되어 과거에 영향을 주지 않도록 합니다.

---

## 6) 권장 목표 아키텍처(업데이트된 Proposed Tree)

> 지금 구조가 나쁘지 않아서, “필요한 것만 추가”하는 방향입니다.  
> 특히 `ui/app.js`를 얇게 만들고, 핸들러/모달을 분리하는 게 유지보수 체감이 큽니다.

```text
src/
  main.js
  router.js
  core/
    schema.js
    storage.js
    persist.js
    store.js
    logger.js
  utils/
    date.js
    time.js                 # [NEW] time parse/format (AM/PM, 24h)
    dom.js
  data/
    routines.js
    foods.js                # [NEW] optional food DB (static)
  selectors/
    goals.js                # [NEW] resolve goal spec for date (timeline)
    diet.js                 # [NEW] group/sort meals by time, totals
    workout.js              # [NEW] (optional) totals, exercise energy estimate
  services/
    nutrition/
      policies.js
      engine.js
    backupService.js
  ui/
    app.js                  # slim: wiring only
    handlers/               # [NEW] action handlers split from app.js
      navHandlers.js
      dietHandlers.js
      workoutHandlers.js
      settingsHandlers.js
      bodyHandlers.js
    modals/                 # [NEW] modal builders
      mealEditorModal.js
      workoutLogModal.js
      confirmModal.js
    components/
      DateBar.js
      Modal.js
      TabBar.js
      ...
    views/
      DietView.js
      WorkoutView.js
      BodyView.js
      SettingsView.js
      index.js
styles/
  tokens.css                # [OPTIONAL] split when style.css grows
  base.css
  components.css
  views.css
index.html

```

---

## 7) 실행 체크리스트 (이번 스프린트 기준: 안정성 + UX 핵심만)

### Phase 0 — 리팩터 안정화(필수)
- [x] `dateFormat` 기본값/검증 불일치 해결 (레거시 포맷 제거 → `YMD/MDY`로 통일)
- [x] `change` 이벤트 핸들러 중복 제거(1개로 통합)
- [x] `addDays()` UTC-safe 패치 + 회귀 테스트(연속 날짜 이동, DST 경계)

### Phase 1 — 설정 UI 개선(요청사항)
- [x] `settings.timeFormat` 스키마 추가 + 저장/로드/검증
- [x] Settings 화면: “날짜 형식 / 시간 형식” 2열 드롭다운 배치 + CSS 추가
- [x] `utils/time.js` 추가: `formatTime()` / `parseTime()` / `coerceTimeHHMM()`

### Phase 2 — Diet 시간/상세 편집(요청사항)
- [x] `diet.meals[]`에 `timeHHMM` 필드 도입(기본값 부여)
- [x] 기존 상세 모달(식단 추가/수정/배치/수분)에서 시간 편집 가능
- [x] DietView:
  - [x] “추가” → 기존 상세 모달 흐름 유지
  - [x] “아이템 클릭” → 상세 모달(시간 포함)
  - [x] 리스트는 `timeHHMM` 기준 정렬(없으면 createdAt fallback)
- [x] UX 미세 조정: 시간 기본값/그룹 편집 흐름/12·24 표기 확인

### Phase 3 — 목표/식단 방식은 ‘설정’에서만 편집 + 과거 보호
- [ ] `userdb.goalTimeline.nutrition[]` 도입
- [ ] Settings에서 목표 변경 시:
  - [ ] effectiveDate = 오늘(또는 사용자가 선택한 적용일)로 기록
  - [ ] 과거 날짜로 effectiveDate를 만드는 UI는 “고급(override)”로 분리하거나 기본은 막기
- [ ] selectors/goals.js: 날짜별 목표 spec resolve
- [ ] (선택) Diet/Workout 페이지: “편집 UI” 없이 **대시보드(진행률)만** 표시

### Phase 4 — 푸드 DB + 2단계 모달(선택, 나중)
- [ ] `data/foods.js`(정적) 또는 사용자 커스텀 foods 컬렉션 도입
- [ ] FoodSearchModal → 선택 → MealEditorModal 자동 채움

### Phase 5 — CSS 분할 기준 도입(선택)
- [ ] 현재 style.css는 유지 가능  
- [ ] 기준: 1000 lines 또는 25KB 넘어가면 `styles/` 폴더로 분리(토큰/컴포넌트/뷰)

---

## 8) 함수 시그니처(로컬 에이전트에게 바로 지시 가능한 수준)

### 8-1. utils/time.js (NEW)
```js
export function coerceTimeHHMM(input, fallbackHHMM = '12:00') -> string
export function parseTimeHHMM(input) -> { hh: number, mm: number } | null
export function formatTimeHHMM(timeHHMM, timeFormat /* 'H24'|'H12' */) -> string
```

### 8-2. selectors/goals.js (NEW)
```js
export function resolveNutritionSpecForDate(dateISO, userdb) -> NutritionSpec
export function upsertNutritionSpec(userdb, effectiveDateISO, spec) -> userdb
```

### 8-3. ui/modals/mealEditorModal.js (NEW)
```js
export function openMealEditorModal({
  mode,            // 'add' | 'edit'
  dateISO,
  meal,            // existing meal object when edit
  onSave,          // (payload) => void
  onDelete         // optional for edit
}) -> void
```

### 8-4. services/nutrition/engine.js (existing 연결)
```js
export function computeDailyTargets({
  profile,
  nutritionSpec,   // from resolveNutritionSpecForDate
}) -> { kcal, protein_g, carbs_g, fat_g, sodium_mg?, addedSugar_g? }
```

---

## 9) 수동 테스트 시나리오(최소)
- [ ] 설정에서 날짜 형식을 바꾸고 새로고침 → 선택이 유지되는지
- [ ] 설정에서 시간 형식을 12H로 바꾸고(AM/PM) → Diet 기록 시간 표시가 AM/PM로 바뀌는지
- [ ] Diet에서 식사 추가 → 시간 저장 → 리스트 정렬 확인
- [ ] 식사 아이템 클릭 → 시간 수정 → 즉시 반영 + 저장 확인
- [ ] 날짜 이동(Day -/+ 1) 반복 → 날짜가 DST 경계에서도 하루씩 정확히 이동하는지

---

## 10) 다음 액션(당장 당신이 할 일)
1) Phase 0의 3개 must-fix를 먼저 끝내고(설정 불일치/중복 이벤트/DST),  
2) Phase 1(시간 형식) → Phase 2(식사 시간 편집) 순서로 진행하면 UI 체감이 가장 빠릅니다.

---

## 부록: “현재 상태에서 곧 터질 가능성이 큰 부분” 요약
- `dateFormat` 레거시 포맷 불일치: **가장 먼저 고쳐야 합니다**
- `app.js` 이벤트 핸들러 중복: 앞으로 기능 추가할수록 원인 추적이 어려워집니다
- `addDays()` DST 문제: 재현은 가끔이지만 한 번 터지면 “왜 날짜가 어긋나지?”로 매우 괴롭습니다
