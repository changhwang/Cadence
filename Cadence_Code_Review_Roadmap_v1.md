# Cadence 코드 리뷰 + 리팩터링 로드맵 (v1)

- 작성일: 2026-08-19 (실행 결과 반영: 같은 날)
- 기준 코드: `src/` 전체 (main/router/core/data/selectors/services/ui/utils 전 파일 리뷰)
- 목적: ① 발전 목표 확정 ② 버그/비효율 정리 ③ Vite 빌드 도입 계획 → 이 순서로 차근차근 진행

## 진행 현황 (2026-08-19)

| Phase | 상태 | 비고 |
|-------|------|------|
| Phase 0 버그 픽스 | ✅ 완료 | B1~B6 + 리뷰 중 추가 발견 2건 |
| Phase 1 죽은 코드/중복 제거 | ✅ 완료 | 약 370KB 아카이브 + 중복 로직 통합 |
| Phase 2 데이터 모델 v2 | ✅ 완료 | `schemaVersion: 2` 마이그레이션 도입 |
| Phase 3 Vite/Vitest/PWA | ✅ 완료 | 테스트 31개 통과, 빌드/PWA 생성 확인 |
| Phase 4 성능 | ✅ 주요 항목 완료 | foods.js 지연 로드 등 |
| Phase 5 기능(대시보드/바디맵) | ✅ 완료 | 달성률 카드 + 바디맵 SVG |

검증은 로컬 정적 서버(`python -m http.server 8734`)에 앱을 띄우고 실제 모듈을 import해 실행하는 방식으로 진행했으며,
모든 Phase에서 전 라우트 렌더 + 콘솔 에러 0을 확인했습니다.

---

## 0) TL;DR

- 전체 구조(모듈 분리, 목표 타임라인, selector 원칙)는 **건강한 상태**. 갈아엎을 필요 없음.
- 다만 **실제 동작 버그 5건**(그중 "운동 보정 kcal이 항상 0"이 제일 큼), **죽은 코드 ~370KB**, **식단 데이터 이중 저장(meals/logs)** 같은 정합성 리스크가 있음.
- 권장 순서: **버그 픽스 → 죽은 코드 제거 → 데이터 모델 단일화 → Vite/Vitest 도입 → 성능 → 신규 기능(대시보드/바디맵)**.
- Vite를 먼저 넣지 않는 이유: 지금 코드는 빌드 없이도 잘 돌아가고, 리팩터 전에 테스트 러너(Vitest)를 함께 넣어야 데이터 마이그레이션을 안전하게 할 수 있어서 "정리 → 빌드+테스트 → 최적화" 순서가 리스크가 가장 작음.

---

## 1) 발전 목표 (Goals)

| # | 목표 | 내용 | 우선순위 |
|---|------|------|----------|
| G1 | **기반 안정화** | 아래 리뷰의 버그 픽스 + 죽은 코드 제거 + 데이터 모델 단일화 | ★★★ 지금 |
| G2 | **빌드/테스트/배포 파이프라인** | Vite + Vitest + 캐시버스팅 + (선택) GitHub Pages 배포, PWA 오프라인화 | ★★★ 다음 |
| G3 | **대시보드/목표 UI 완성** | 도넛/달성률 UI, Settings 중심 목표 편집 (PROJECT_PROGRESS "진행중" 항목) | ★★ |
| G4 | **바디맵 SVG** | 전/후면 실루엣 + 근육 하이라이트 (StatsView에 WIP 주석으로 골격 존재) | ★★ |
| G5 | (옵션) 다국어 DB 리팩터, 루틴 공유/내보내기, 스와이프 삭제 | 기존 백로그 | ★ |

---

## 2) 코드 리뷰 — 버그 (심각도 순)

### B1. 운동 보정(Exercise Credit) kcal이 사실상 항상 0 — **HIGH**
- [goalSelectors.js:36](src/selectors/goalSelectors.js) → `getExerciseKcalForDate({ day: state.userdb.workout[dateISO] })`
- [energy.js:13-17](src/services/workout/energy.js)은 `day.logs`(근력 로그)만 합산하는데, 근력 로그에는 `met/minutes/kcal`이 없어 전부 0. **유산소 로그는 `day.cardio.logs`에 있는데 여기를 안 읽음.**
- 결과: 목표 카드의 "운동 보정 +N kcal"이 절대 뜨지 않음. (DailySummary는 `{ day: { logs: cardioLogs } }`로 감싸 호출해서 요약 카드 kcal은 정상 — 호출부마다 계약이 다른 게 원인)
- 수정: `getExerciseKcalForDate`가 `day.cardio?.logs`를 읽도록 통일하고, 호출부 계약을 하나로 정리.

### B2. 식단 수정 시 미량영양소 불일치 — **HIGH (데이터 정합성)**
- [foodModals.js:412-428](src/ui/modals/foodModals.js) `openDietEditModal` 저장 시:
  - `meals[]` 항목은 전체 영양소(나트륨/식이섬유/당/포화지방 등) 재계산 ✔
  - `logs[]` 항목은 kcal/단백/탄수/지방 **4개만** 동기화 ✘
- 합산([intake.js:51-66](src/services/nutrition/intake.js))은 `logs[]`를 우선 읽으므로, 수량 수정 후 나트륨·식이섬유 등이 **수정 전 값으로 남음**. 영양소 상세 모달/경고 배지가 틀린 값을 보여줌.
- 근본 원인은 B7(이중 저장). 단기 수정: 전체 필드 동기화. 근본 수정: logs 단일화.

### B3. 모달을 오버레이 클릭으로 닫으면 타이머 인터벌 누수 — **MED**
- [RestTimer.js](src/ui/components/RestTimer.js), [WorkoutDetailModal.js:348-374](src/ui/components/WorkoutDetailModal.js): `stopTimer()`가 "닫기" 버튼(onSubmit)에만 걸려 있음.
- [Modal.js:87-94](src/ui/components/Modal.js) 오버레이 클릭 / 취소로 닫으면 `setInterval`이 계속 돌고, 끝나면 **사운드까지 재생됨** (모달은 이미 사라진 상태).
- 수정: `openModal`에 onClose(모든 닫힘 경로 공통 훅) 추가하고 타이머 모달들이 거기서 정리하도록.

### B4. 통계 > 운동 기록 검색창이 한 글자마다 포커스를 잃음 — **MED (UX)**
- [StatsView.js:665-668](src/ui/views/StatsView.js): input 이벤트마다 `renderStatsView()` 전체 재렌더 → 인풋이 새로 만들어져 포커스/커서 소실.
- 수정: 검색은 이미 있는 `renderList()`만 부분 갱신하도록 변경 (metricToggle과 달리 전체 재렌더 불필요).

### B5. 루틴 모달 리스트가 삭제/수정 후에도 갱신 안 됨 — **MED (UX)**
- [workoutModals.js:286-288](src/ui/modals/workoutModals.js): 모달 열 때 `userRoutines`를 상태에서 캡처 → `routine.delete` 후에도 목록에 그대로 남음(모달 재오픈 전까지).
- 수정: renderList가 `store.getState()`에서 매번 읽도록.

### B6. `parseDateInput` 날짜 유효성 검증 느슨 — **LOW**
- [date.js:46-49](src/utils/date.js): `new Date('2024-02-31')`은 3/2로 롤오버되며 유효 판정 → 생년월일/오버라이드 날짜에 2월 31일 입력 가능.
- 수정: 파싱 후 year/month/day 재대조.

### B7. 레거시 waterMl 데이터의 물 항목 편집 불가 — **LOW (레거시 한정)**
- [DietView.js:127-133](src/ui/views/DietView.js): logs 없는 옛 데이터는 렌더마다 `water-${Date.now()}` id 재생성 → 클릭 편집 시 id 불일치로 조용히 무시됨. 데이터 마이그레이션(P2)으로 자연 해결.

### 설계 공백 (버그는 아니지만 곧 문제됨)
- **체중 변경 시 목표 미갱신**: [formHandlers.js:182-184](src/ui/handlers/formHandlers.js) — goal/framework가 바뀔 때만 타임라인 append. 프로필 체중만 바꾸면 kcal 목표가 옛 체중 기준으로 유지됨. "프로필 변경 시에도 재계산해 append" 정책 결정 필요.
- **cut/bulk 비율의 소스가 3곳**: [goalUtils.js](src/ui/goals/goalUtils.js), [nutritionPolicies.js GOAL_PRESETS](src/services/nutritionPolicies.js), 호출부 하드코딩 `{cutPct:0.15, bulkPct:0.1}` (goalModals/formHandlers). 한 곳으로 통합.
- **백업 복원 시 정규화 미적용**: [formHandlers.js:234-251](src/ui/handlers/formHandlers.js) — import한 payload를 그대로 dispatch. lb 단위/구형 cardio 형태가 정규화 없이 세션에 들어옴(새로고침 후에야 정규화). 복원 경로에서도 `loadUserDb`와 같은 정규화 파이프 통과시킬 것.

---

## 3) 코드 리뷰 — 죽은 코드 / 중복 (제거·통합 대상)

| 항목 | 위치 | 조치 |
|------|------|------|
| 레거시 모놀리스 | 루트 `app_v29.js`(309KB), `data.js`(54KB) — index.html에서 참조 안 함 | `_archive/`로 이동 |
| 미사용 엔진 (로직 중복) | [nutritionEngine.js](src/services/nutritionEngine.js) — `targetEngine.js`와 BMR/TDEE/매크로 계산 2벌 | 삭제 |
| 미사용 뷰 | [DashboardView.js](src/ui/views/DashboardView.js) — 라우트 없음, B1과 같은 버그 내포. `DEFAULT_ROUTE='dashboard'`([constants.js](src/core/constants.js))도 죽은 값 | 삭제 (G3에서 도넛 UI는 DietView/새 구현으로) |
| 죽은 폼 핸들러 4개 | [formHandlers.js](src/ui/handlers/formHandlers.js)의 `handleDietAddSubmit`/`handleWorkoutSubmit`/`handleBodySubmit`/`handleDietWaterChange` — 대응하는 `data-action` 폼이 코드에 없음(전부 모달로 대체됨). `handleWorkoutSubmit`엔 lb 이중 변환 버그도 잠재([:47](src/ui/handlers/formHandlers.js) + [workoutLogUtils.js:12](src/ui/workout/workoutLogUtils.js)) | 삭제 (app.js의 submit 분기도 함께) |
| 미사용 logger | [logger.js](src/core/logger.js) | 디버그 툴 만들 때까지 보류 or 삭제 |
| 미사용 import | DietView의 `FOOD_DB`, `getLabelByLang`; `STORAGE_KEYS.META` | 정리 |
| `getCardioLogs` 3중 형태 처리 복붙 | WorkoutView / DailySummary / workoutAgg / clickHandlers / workoutModals 5곳 | **로드 시 1회 정규화**(P2 마이그레이션)로 흡수 후 전부 삭제 |
| `summarizeStrengthLog` 3벌 | workoutAgg / muscleAgg / exerciseAgg | `services/workout/` 공용 모듈로 통합 |
| `resolveExercise` 2벌 + 매 호출 `EXERCISE_DB.find` O(n) | muscleAgg / exerciseAgg | id→exercise Map 인덱스 모듈로 통합 |
| `DETAIL_TO_GROUP` 2벌 | StatsView / muscleAgg | 상수 모듈로 |
| `createId` 패턴 6곳+ | `${Date.now()}-${random}` 복붙 | `utils/id.js`로 |
| `calcWaterTarget` 2벌 | targetEngine / DietView | targetEngine으로 통일 |
| cut/bulk 비율 3곳 | 위 "설계 공백" 참조 | 정책 모듈로 통일 |

---

## 4) 코드 리뷰 — 데이터 모델

### D1. 식단 이중 저장: `diet[date].meals[]` + `diet[date].logs[]` — **최우선 정리 대상**
- 추가/수정/삭제 모든 경로가 두 배열을 **각각** 갱신 (foodModals, dietModals, clickHandlers). 저장 용량 2배 + B2 같은 불일치 버그의 온상.
- 조회는 logs 우선, meals fallback → 사실상 logs가 진실.
- **계획**: 스키마 v2 마이그레이션으로 `logs[]` 단일화(meals는 로드 시 logs로 흡수 후 제거). 쓰기 경로를 한 함수(`dietRepo` 형태)로 몰기.

### D2. 유산소 3중 형태: `cardio.logs` / `cardioLogs` / `cardio[]`
- 현재 [userDb.js](src/ui/store/userDb.js)에서 쓸 때마다 정규화 + 읽는 곳마다 3중 분기.
- **계획**: 스키마 v2에서 `cardio.logs`로 확정, 로드 시 1회 변환, 읽기 분기 전부 제거.

### D3. 마이그레이션 파이프라인 부재
- `schemaVersion: 1` 고정. 단위 정규화는 [storage.js:95-143](src/core/storage.js)에, cardio 정규화는 userDb.js에 흩어져 있음.
- **계획**: `core/migrations.js` — `[{ from: 1, to: 2, migrate(db) }]` 체인 방식. D1/D2가 첫 마이그레이션. 백업 복원 경로도 같은 파이프 통과.

---

## 5) 코드 리뷰 — 성능

| # | 이슈 | 위치 | 처방 |
|---|------|------|------|
| P1 | **모든 mutation마다 userdb 전체 deep clone**(`JSON.parse(JSON.stringify)`) — 세트 완료 체크 1번에도 전체 DB 직렬화. 데이터가 쌓일수록 선형으로 느려짐 | [userDb.js:1,23-28](src/ui/store/userDb.js) | 단기: `structuredClone`(약 2~5배 빠름). 장기: 날짜 단위 부분 clone 또는 immer 스타일 경로 복사 |
| P2 | **모든 dispatch에 전체 뷰 재렌더** — SAVE_OK조차 재렌더 유발(액션당 풀렌더 2회), `lucide.createIcons()`가 매번 문서 전체 스캔. 모달 뒤 배경도 세트 완료마다 풀 재렌더 | [app.js:142](src/ui/app.js), [store.js:17-20](src/core/store.js) | SAVE_* 액션은 배너만 갱신하고 뷰 렌더 스킵. `createIcons`에 루트 스코프 전달. (풀렌더 자체는 앱 규모상 유지 가능 — 스킵 조건만 정리) |
| P3 | **foods.js 519KB 즉시 파싱** + 음식 검색 모달이 843개 아이템 DOM을 쿼리 없이 전부 렌더, 키 입력마다 재렌더 | [foodModals.js:113-179](src/ui/modals/foodModals.js) | Vite 도입 후 `dynamic import()`로 지연 로드. 검색 결과 상한(예: 50개) + 입력 디바운스 150ms |
| P4 | `EXERCISE_DB.find` / `CARDIO_DB.find` / `FOOD_DB.find` O(n) 반복 호출 | 뷰/모달/집계 전반 | 각 DB에 `byId` Map 제공 |
| P5 | stats selector 캐시 Map 무한 성장 + `userdb.updatedAt` 키 의존(updatedAt 안 올리는 mutation이 있으면 stale — 실제로 [BodyView.js:393-395](src/ui/views/BodyView.js) 히트맵 날짜 선택이 updatedAt을 안 올림) | [selectors/stats/*.js](src/selectors/stats) | 캐시 크기 상한(최근 N개) + updatedAt 갱신을 updateUserDb 내부로 이동(호출부 수동 갱신 제거) |
| P6 | CDN 의존: lucide `@latest`(버전 미고정), 아이콘(flaticon), 타이머 사운드(mixkit) — 오프라인 불가, PWA 목표와 상충 | [index.html](index.html) | Vite 도입 시 전부 로컬 번들/에셋화 |

---

## 6) 코드 리뷰 — 구조/일관성 (점진 개선)

- **UI 상태 3곳 분산**: `store.ui` / 모듈 전역 변수(BodyView의 `heatmapMonthISO` 등, StatsView의 `statsState`) / DOM(체크박스). → 규칙 정하기: "화면 간 살아남을 상태는 store, 화면 내 일시 상태는 뷰 로컬" + 뷰 로컬도 모듈 전역 대신 상태 객체로.
- **이벤트 스타일 혼재**: `data-action` 위임(권장) vs 직접 `addEventListener` + 자기 재귀 재렌더(BodyView/StatsView). → 신규 코드는 위임으로 통일, 기존은 만질 때 정리.
- **인라인 스타일/하드코딩 색상**: DietView의 `#4ECDC4/#FFB347/#FF6B6B`, 히트맵 `rgba(0,122,255,…)`, nutrient 모달 인라인 스타일 다수. → CSS 변수/클래스로 이관 (다크모드 대비).
- **재렌더가 입력 중인 폼을 날릴 수 있음**: SettingsView는 통째로 다시 그려지므로, 입력 중 dispatch(예: 이전 액션의 SAVE_OK)가 오면 미저장 입력 소실 가능. P2의 SAVE_* 렌더 스킵으로 대부분 해소.
- **테스트 0개**: [Cadence_vNext_API_Spec.md](Cadence_vNext_API_Spec.md) §11에 테스트 케이스 10개가 이미 정의돼 있는데 러너가 없음 → Vitest 도입과 함께 goalService/targetEngine/date/migrations부터 작성.

---

## 7) 실행 로드맵 (차근차근)

### Phase 0 — 버그 픽스 ✅ 완료
- [x] B1: `getExerciseKcalForDate`가 cardio.logs를 읽도록 수정 + 호출부 계약 통일
- [x] B2: dietEdit의 logs 동기화 전체 필드로 (Phase 2에서 이중 저장 자체를 제거해 근본 해결)
- [x] B3: `openModal`에 onClose 훅 추가 — 제출/취소/오버레이/X/모달 교체 **모든 경로**에서 1회 실행
- [x] B4: stats 검색 부분 갱신 (포커스 유지)
- [x] B5: 루틴 모달 리스트 재조회
- [x] B6: parseDateInput 재대조 검증

**리뷰 중 추가 발견 (문서에 없던 것)**
- [x] **B5b: 내 루틴 수정/삭제 버튼이 아예 동작하지 않음** — 버튼 dataset에 `type`이 없어 핸들러가 루틴을 찾지 못하고 조용히 return. 삭제 테스트를 짜다가 발견.
- [x] **설계 공백 해소**: 프로필(체중/키/생년월일/성별/활동량) 변경 시에도 목표 타임라인에 재계산 결과를 append (기존엔 goal/framework 변경 시에만)

### Phase 1 — 죽은 코드/중복 제거 ✅ 완료
- [x] app_v29.js, data.js → `_archive/`
- [x] nutritionEngine.js, DashboardView.js, 죽은 폼 핸들러 4개, 미사용 import 삭제
- [x] `services/workout/workoutEntry.js` — 유산소/근력 읽기·집계 통합 (getCardioLogs 5벌, summarizeStrengthLog 3벌 제거)
- [x] `services/workout/exerciseIndex.js` — resolveExercise 2벌 통합 + id/이름 Map 인덱스(O(1))
- [x] `data/muscleGroups.js`(DETAIL_TO_GROUP 2벌), `utils/id.js`(createId 6벌+), calcWaterTarget 2벌 통합
- [x] cut/bulk 비율을 `GOAL_PRESETS` 단일 출처로 통합 + `ui/goals/goalOptions.js`로 옵션/라벨 중복 제거
- [x] `aggregateMuscleDistribution`의 no-op 코드(`Math.max` 분기) 제거

### Phase 2 — 데이터 모델 v2 ✅ 완료
- [x] `core/migrations.js` 체인 구축 (schemaVersion 1→2, 멱등)
- [x] diet `meals[]` + `waterMl` → **`logs[]` 단일화** (물도 로그로 편입), cardio.logs 확정
- [x] 단위(lb→kg) 정규화를 storage/userDb에서 마이그레이션으로 이관
- [x] 백업 복원도 `hydrateUserDb`/`hydrateSettings`로 동일 파이프 통과
- [x] 읽기 측 3중 분기 제거, `services/nutrition/dietEntry.js`로 접근 통일
- [x] updatedAt 갱신을 `updateUserDb` 내부로 (호출부 10개 파일에서 수동 갱신 제거)

### Phase 3 — Vite + Vitest + PWA ✅ 완료 (Node.js v24.19.0)
- [x] `package.json`, `vite.config.js` + `npm install`
- [x] `tests/` 3개 파일 — **31개 케이스 전부 통과** (`npm test`)
- [x] `npm run build` — 메인 194KB(gzip 53KB) / **foods 청크 265KB 자동 분리**, 빌드 결과물 실사용 검증
- [x] **CDN 의존 전부 제거** (외부 요청 0건 확인)
  - lucide: unpkg `@latest` → npm 패키지, 사용 중인 아이콘 14개만 번들 (`src/ui/icons.js`)
  - 아이콘: flaticon 플레이스홀더 → 로컬 `public/icon.svg` + `apple-touch-icon.png`(180×180)
  - 타이머 사운드: mixkit MP3 → Web Audio 합성 (`src/ui/sound.js`, 오프라인 동작·볼륨 설정 유지)
- [x] PWA (`vite-plugin-pwa`, autoUpdate) — manifest + 서비스워커 생성, precache 10개(495KB)에 foods 청크까지 포함해 **오프라인 음식 검색 가능**
- [x] 서비스워커 활성화 확인 (크롬 DevTools > Application: `sw.js` activated and running)

> ℹ️ 앱은 **빌드 없이 정적 서버로도 그대로 실행됩니다.** (저장소 루트를 그대로 서빙하는 배포 방식 유지)
> 개발 시에는 `npm run dev`가 편하지만 필수는 아닙니다.
>
> 한때 lucide를 npm 패키지로 import하면서 bare specifier 때문에 정적 서빙이 깨진 적이 있습니다
> (`Failed to resolve module specifier "lucide"` → 흰 화면). 지금은 아이콘 데이터를
> `src/ui/icons.js`에 직접 담아 외부 의존성 없이 동작합니다.

### Phase 4 — 성능 ✅ 주요 항목 완료
- [x] **foods.js(519KB) 지연 로드** — `data/foodDb.js`로 분리, 초기 로딩 모듈에서 제외 확인
- [x] 음식 검색 결과 상한(60개) + 입력 디바운스(150ms) — 843개 전체 DOM 렌더 제거
- [x] `structuredClone` 전환 (P1)
- [x] SAVE_* 액션은 배너만 갱신하고 뷰 재렌더 스킵 (P2) — 입력 중 폼 소실 위험도 제거
- [x] EXERCISE_DB/CARDIO_DB id Map 인덱스 (P4)
- [x] selector 캐시 상한 60개 (P5)
- [x] **캐시 키 stale 버그 수정** — updatedAt(ms)만으로는 같은 밀리초 내 연속 쓰기를 구분 못 해 삭제 후에도 옛 통계가 남았음. `revision` 카운터 추가.
- [ ] (남음) lucide `createIcons` 스코프 축소 — 라이브러리가 root 옵션을 지원하지 않아 보류

### Phase 5 — 기능 (G3/G4) ✅ 완료
- [x] **오늘 달성률 카드** (`ui/components/GoalProgress.js`) — 식단 화면 상단
  - SVG 링으로 칼로리 달성률(%), 중앙에 섭취량 표시
  - 단백질/탄수화물/지방 진행 바 + 남은 열량(초과 시 색·라벨 전환)
  - 운동 보정이 적용된 목표를 쓰고, 보정분은 `운동 +N` 배지로 표시
  - 85~115%는 초록, 그 밖은 파랑/주황으로 구분
- [x] **바디맵** (`ui/components/BodyMap.js`) — 통계 > 세부 자극 > 바디맵 탭
  - 전/후면 실루엣을 **인라인 SVG로 생성**(외부 이미지 없음 → 오프라인·테마 대응)
  - 근육군별 자극량에 따라 진하기 착색, 영역 31개에 부위명 툴팁
  - 하단 범례에 근육군별 수치, 세트/볼륨/시간 지표 전환 연동
  - 기록 없으면 회색 + 안내 문구
- [x] **집계 버그 수정**: 벤치프레스처럼 한 운동이 같은 근육군의 여러 부위(윗가슴+중간가슴)를 자극하면
      근육군 합계가 중복 계산되어 5세트가 10세트로 표시됐음 → `aggregateGroupTotals`로 로그당 군별 1회만 반영
- [x] **Settings 목표 UI 마무리** — 목표 편집 경로를 설정 화면 하나로 정리
  - `GoalCard`의 조작 UI(운동 보정 슬라이더 3개, 이 날짜만 수정/오늘부터 변경/오버라이드 해제 버튼)는
    유일한 호출부가 `showControls:false, showActions:false`로 부르고 있어 **렌더된 적이 없는 죽은 코드**였음.
    설정 폼에 같은 기능이 이미 있어 카드는 읽기 전용 미리보기로 축소(168줄 → 52줄)
  - 이에만 연결돼 있던 `goal.changeDefault` 핸들러와 `openGoalChangeDefaultModal` 제거
    (설정 저장 시 타임라인에 자동 append되므로 기능 중복)
  - `goal.credit.*` 핸들러(actionHandlers 2개, app.js 슬라이더 2개)도 함께 제거
  - 유지: Goal History의 오버라이드 추가/수정/해제, 달력, 타임라인

---

## 8) 빌드 계획 — Vite + Vitest + PWA (Phase 3 상세)

현재: 빌드 없는 순수 ESM + CDN. 목표: 로컬 번들 + 해시 파일명(캐시버스팅 자동) + 테스트 + 오프라인 PWA.

Node.js v24.19.0 설치 완료, 아래 명령이 모두 동작합니다.

### 8-1. 사용법
```
npm install        # 의존성(vite, vitest, lucide, vite-plugin-pwa)
npm test           # tests/ 회귀 테스트 31개
npm run dev        # 개발 서버(8734) ← 이제 앱 실행은 이 명령으로
npm run build      # dist/ 번들 + PWA(sw.js, manifest)
npm run preview    # 빌드 결과물 확인(서비스워커는 이 모드에서만 동작)
```
- `index.html`: unpkg lucide 스크립트 제거 → `import { createIcons, icons } from 'lucide'`
- 아이콘(flaticon)/타이머 사운드(mixkit) → `public/` 로컬 에셋으로 교체
- `vite.config.js`: `base` 설정(배포 경로), vite-plugin-pwa(manifest + 서비스워커 → 오프라인/홈화면 설치)

### 8-2. 코드 스플리팅
- `data/foods.js`(519KB)는 음식 검색/식단 모달에서만 필요 → `const { FOOD_DB } = await import('../data/foods.js')` 지연 로드. 초기 로드에서 500KB 제거.
- exercises.js(60KB)는 초기 번들 유지해도 무방.

### 8-3. 테스트 (Vitest) — 작성 완료
- `tests/migrations.test.js` — v1→v2 변환(식단 통합/물 로그화/유산소 3형태/lb→kg), 멱등성, v2 무변경
- `tests/goals.test.js` — 타임라인 해석, 같은 날짜 대체, 오버라이드 적용/해제, 운동 보정(계산·상한·on/off·분배), 프리셋 매핑
- `tests/utils.test.js` — addDays DST/왕복, 날짜 유효성, ISO 키 불변, 시간 12/24 표기, 식단 합산(물 제외), 운동 집계(계획값 대체 vs 수행분)
- 기대값은 브라우저에서 실제 모듈로 29개 전부 대조 완료 → Node 설치 즉시 통과할 상태.

### 8-4. 스크립트/배포
- 배포는 GitHub Pages(actions로 push 시 build/배포) 또는 정적 호스팅 아무거나. `base: './'`로 하위 경로 배포도 안전.
- Node 도입 후 `.claude/launch.json`을 `npm run dev`로 교체 (현재는 python 정적 서버).

### 8-5. 남은 정리 대상 (다음 라운드)
- [x] 식단 수정 모달 수량 변경 시 매크로 입력칸 자동 동기화 (추가 모달과 동일하게 맞춤).
      이전에는 미량영양소만 재계산되고 kcal은 옛 값으로 저장돼 배율이 어긋났음. 사용자가 직접 고친 값은 그대로 존중.
- UI 상태가 store / 모듈 전역(BodyView·StatsView) / DOM 세 곳에 분산 — 규칙 정리 필요.
- [x] 인라인 스타일/하드코딩 색상 → CSS 토큰 이관 완료, **다크 모드 추가**
  - style.css 하드코딩 색상 52곳 + JS 인라인 13곳을 의미 기반 토큰으로 교체
  - 라이트/다크 팔레트를 같은 토큰으로 정의: `:root`(라이트) / `prefers-color-scheme`(시스템) / `[data-theme]`(수동)
  - 설정 > 화면 테마에서 시스템 설정 / 라이트 / 다크 선택, 저장 시 즉시 적용
  - 발견한 버그: `--accent` `--border` `--card-bg` `--danger` `--ios-bg-secondary` 5개 변수가
    **정의 없이 사용**되어 해당 스타일(입력창 테두리, 오늘 날짜 강조 등)이 무시되고 있었음
  - 발견한 버그: `input/select`와 활성 세그먼트 버튼의 배경이 `white` 하드코딩이라
    다크에서 흰 배경 + 흰 글자가 됨 → 토큰화
  - 검증: 두 테마 x 9개 화면의 모든 텍스트 대비를 알파 합성까지 계산해 측정 (다크 3:1 미만 0건)

---

## 9) 리뷰 중 확인한 "건드리지 말 것" (잘 되어 있는 부분)
- ISO 날짜 키 고정 + 표시 포맷 분리, `addDays` UTC-safe 처리 ✔
- 목표 타임라인/오버라이드 구조와 selector-only 읽기 원칙 ✔
- storage 로드 시 방어적 머지(부분 손상 데이터 복구) ✔
- 이벤트 위임(data-action) 골격, 디바운스 저장 + 실패 배너 ✔
