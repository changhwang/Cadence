# Cadence 리라이트 실행 계획서 (마이그레이션 0 / Debug-first / 모듈형)

- 앱 이름: **Cadence**
- 문서 목적: 기존 스파게티 코드(`app_v29.js`)를 **디버깅이 쉽고 확장 가능한 모듈형 아키텍처**로 재작성합니다.
- 데이터 전제: “거의 데이터 없음” → **마이그레이션은 하지 않습니다.**
- 핵심 전략: **(1) 유저 DB 단일화 + ISO DateKey**, **(2) Store(Observer) + Persist 분리**, **(3) 이벤트 위임 기반 안전한 DOM 제어**, **(4) 앱 전용 백업/복원(단일 파일)**

---

## 0) 용어 정리: `app === "cadence"`는 “탭 제목”이 아닙니다
아래 두 가지를 분리해서 생각합니다.

1) **브라우저 탭에 보이는 제목**
- `index.html`의 `<title>Cadence</title>`로 결정됩니다.
- 즉, “탭 제목”은 HTML `<title>`입니다.

2) **백업 파일 내부의 식별자 `app`**
- 백업 JSON에 넣는 `"app": "cadence"`는 **백업 파일이 Cadence용인지 확인하는 식별자**입니다.
- 탭 제목과 무관합니다.

---

## 1) Core Principles (반드시 준수)

### 1-1. 데이터 (Single Source of Truth)
- 유저 데이터는 로컬스토리지에 **단일 키**로 저장:
  - `cadence.userdb`
- 날짜 키(DateKey)는 **무조건 ISO (`YYYY-MM-DD`)** 하나만 사용
- 정적 DB(운동/음식 목록)는 코드(`/src/data/*`)에 포함되며 **백업 대상이 아님**

### 1-2. 상태 (Observer Store)
- UI는 localStorage를 직접 읽지 않고 **Store**를 통해서만 상태를 읽습니다.
- 상태 변경은 **dispatch(action)**로만.
- 저장은 Store와 분리된 Persist 레이어가 처리합니다(디바운스 저장).

### 1-3. Debug-first
- `Logger`를 사용해 로그 레벨/도메인별 로그를 구조화
- 개발 모드에서만 `window.__CADENCE_DEBUG` 제공(조회 중심, 위험 액션은 가드)

### 1-4. DOM 안전성
- 사용자 입력이 섞일 수 있는 영역은 **innerHTML 금지**
- UI 생성은 `el(tag, props, ...children)` 헬퍼로 구성
- 이벤트는 `data-action` 기반 **이벤트 위임**

---

## 2) 디렉토리 구조 (권장)

```
/src
  main.js                 # 부팅(스토어/스토리지 초기화) + 라우터 시작
  router.js               # 탭/라우트 전환

  /core
    constants.js          # 키/enum/기본값
    logger.js             # Debug logger + (dev) __CADENCE_DEBUG
    store.js              # Observer store (state/dispatch/subscribe)
    persist.js            # store 구독 -> debounce 저장 + 저장 실패 처리
    storage.js            # localStorage wrapper (safe parse, setItem try/catch)
    schema.js             # userdb/settings default + validate

  /utils
    date.js               # ISO 날짜 유틸 + 표시 포맷
    dom.js                # el() + text() + attrs() 등 안전 DOM 유틸
    helpers.js

  /data                  # 정적 DB(앱 구동용)
    exerciseDb.js
    foodDb.js
    cardioDb.js

  /services               # 비즈니스 로직(저장/렌더와 분리)
    workoutService.js
    dietService.js
    bodyService.js
    backupService.js      # export/import(앱 전용 포맷)

  /ui
    /components
      TabBar.js
      DateBar.js
      Modal.js
      Card.js
      Button.js
    /views
      WorkoutView.js
      DietView.js
      BodyView.js
      SettingsView.js
    app.js                # 이벤트 위임 등록 + render orchestration
```

---

## 3) Storage Keys (Cadence 표준)

- `cadence.userdb` : 유저 데이터 전체(JSON string)
- `cadence.settings` : 설정(JSON string)
- `cadence.meta` : (선택) 진단/버전/최근 저장시간 등

> 레거시 키(`diet_*`, `workout_*` 등)는 **건드리지 않음** (자동 삭제/덮어쓰기 금지)

---

## 4) 데이터 스키마 (v1)

### 4-1. cadence.userdb (schemaVersion=1)
```json
{
  "schemaVersion": 1,
  "createdAt": "2026-01-20T00:00:00.000Z",
  "updatedAt": "2026-01-20T00:00:00.000Z",
  "workout": {},
  "diet": {},
  "body": {},
  "goals": {},
  "meta": {
    "selectedDate": {
      "workout": "2026-01-20",
      "diet": "2026-01-20",
      "body": "2026-01-20"
    }
  }
}
```

### 4-2. cadence.settings (schemaVersion=1)
```json
{
  "schemaVersion": 1,
  "dateFormat": "KO_DOTS",
  "dateSync": true,
  "units": { "weight": "kg", "water": "ml" },
  "sound": { "timerEnabled": true, "volume": 1.0 },
  "dev": { "debugToolEnabled": false }
}
```

### 4-3. 날짜 커서(탭별) 설계
- `userdb.meta.selectedDate.workout|diet|body`에 저장
- `settings.dateSync`가 true면 DateBar에서 날짜 이동 시 **모든 커서 동기화**
- false면 현재 탭 커서만 이동

---

## 5) 부팅 시퀀스 (마이그레이션 0)

1. `storage.loadSettings()` → 없으면 default 생성/저장
2. `storage.loadUserDB()` → 없으면 default 생성/저장
3. `store.init({ userdb, settings, ui })`
4. `persist.attach(store)` : debounce 저장 시작
5. `router.start()` : route 변경 → `store.dispatch(ROUTE_CHANGED)`
6. `app.render()` : 최초 렌더

---

## 6) Store / Persist / Logger 상세

### 6-1. Store(state 구조)
```js
state = {
  userdb,
  settings,
  ui: {
    route: 'workout'|'diet'|'body'|'settings',
    modal: { open:false, type:null, payload:null },
    saveStatus: { ok:true, lastError:null, lastSavedAt:null }
  }
}
```

### 6-2. Persist(저장) 규칙 (중요)
- Store 변경을 구독하되, 저장은 **debounce(권장 500ms)**로 수행
- `setItem` 실패(Quota 등) 시:
  - `SAVE_FAILED` 액션 dispatch
  - UI 상단에 “저장 실패” 배너 표시
  - 즉시 백업(export) 안내 버튼 제공

### 6-3. Logger + Debug Tool
- `logger.info(domain, msg, data)` / `logger.error(...)`
- 개발 모드에서만 노출:
  - `window.__CADENCE_DEBUG.getState()`
  - `window.__CADENCE_DEBUG.export()` (백업 파일 생성)
  - `window.__CADENCE_DEBUG.reset()`은 **가드**(예: “확인 2번” 또는 “백업 파일 생성 후만 허용”)

---

## 7) DOM / 이벤트 위임 규칙

### 7-1. DOM Helper(utils/dom.js)
- `el(tag, props, ...children)`
- `text(str)` : text node 생성
- 사용자 입력 렌더는 `textContent`만 사용

### 7-2. 이벤트 위임(ui/app.js)
- 루트 컨테이너(예: `#main-content`)에 click/change/submit 1개씩만 바인딩
- 요소에 `data-action="diet.addItem"` 같은 액션명을 부여
- 핸들러는 action명을 스위치하거나 map으로 dispatch

---

## 8) 백업/복원 (단일 파일, Cadence 전용 포맷)

### 8-1. Export 포맷
```json
{
  "app": "cadence",
  "exportedAt": "2026-01-20T00:00:00.000Z",
  "userdb": { "...": "..." },
  "settings": { "...": "..." }
}
```

### 8-2. Import 규칙
- JSON 파싱
- `app === "cadence"` 확인(아니면 거절)
- `userdb/settings.schemaVersion` 확인(현재는 1만 허용)
- 저장 후 Store에 반영(또는 페이지 리로드)

---

## 9) 단계별 실행 체크리스트 (Action Plan)

### Phase 0: 안전 확보(선택)
- [ ] 레거시 앱에서 export 1회 수행(보험)
- [ ] 새 앱은 레거시 키를 건드리지 않는 원칙 명시

### Phase 1: 스켈레톤
- [ ] src 구조 생성
- [ ] index.html: `<title>Cadence</title>` + `type="module"`로 `src/main.js` 로드
- [ ] TabBar + main-content mount
- [ ] 라우팅(해시)으로 탭 전환

### Phase 2: Core 구현
- [ ] core/schema.js (default + validate)
- [ ] core/storage.js (safeParse, trySetItem)
- [ ] core/store.js (dispatch/subscribe)
- [ ] core/persist.js (debounce 저장 + SAVE_FAILED)
- [ ] core/logger.js (+ dev debug tool)

### Phase 3: 공통 유틸
- [ ] utils/date.js (todayISO/addDays/formatDisplay)
- [ ] utils/dom.js (el/text)

### Phase 4: DietView(먼저)
- [ ] 날짜별 breakfast/lunch/dinner/snack CRUD
- [ ] waterMl 입력
- [ ] 저장/로드 확인

### Phase 5: WorkoutView
- [ ] 운동 선택(정적 DB 연결)
- [ ] 세트 로그 CRUD
- [ ] (선택) plan 기능
- [ ] 저장/로드 확인

### Phase 6: BodyView
- [ ] weight/waist/muscle 입력
- [ ] 저장/로드 확인

### Phase 7: SettingsView
- [ ] dateFormat 변경 → 전 화면 반영
- [ ] dateSync ON/OFF
- [ ] 단위 설정(필요 시)
- [ ] 백업/복원 버튼

### Phase 8: 테스트 시나리오
- [ ] 날짜 A에서 diet 입력 → 날짜 B 이동 → A 복귀 시 유지
- [ ] dateSync ON/OFF 동작
- [ ] 백업 → `cadence.userdb` 삭제 → 복원 → 데이터 재현
- [ ] 저장 실패 시 배너 및 export 유도

---

## 10) 배포/업데이트(캐시) 전략: **방법 B(파일명 해시)로 간다**

정적 웹앱(HTML/CSS/JS)은 그대로 유지하되, 배포/업데이트는 **파일명 해시(fingerprinting)** 기반으로 설계합니다.  
즉, 빌드 결과물이 예를 들어 아래처럼 바뀌게 합니다.

- `assets/main.9f3a1c.js`
- `assets/vendor.41aa02.js`
- `assets/style.8c12de.css`

이렇게 하면 브라우저가 이전 파일을 강하게 캐시하더라도 **파일명이 바뀌므로 새 버전을 반드시 받게** 됩니다.  
운영 측면에서 가장 깔끔한 캐시 베스트 프랙티스입니다.

### 10-1. 구현 선택지
#### (권장) Vite 기반
- 장점: 설정이 단순, ES Module/번들/코드 스플릿, 해시 파일명 기본 지원
- 산출물: `dist/` 폴더(정적 파일)만 올리면 됨
- 기본 정책:
  - `index.html`: **no-cache** 또는 짧은 캐시(재검증)
  - `assets/*.js`, `assets/*.css`: **long cache**(immutable) 가능

#### (대안) Webpack/Rollup
- 팀/기존 파이프라인이 있으면 선택 가능
- Cadence 단독/개인 앱이면 Vite가 평균적으로 더 빠릅니다.

### 10-2. 캐시 정책(권장 운영 룰)
- `index.html`만 “항상 최신”이 되면 충분합니다. (index가 새 해시 파일을 가리키니까)
- 서버 헤더 권장:
  - `index.html`: `Cache-Control: no-cache`
  - `assets/*`: `Cache-Control: public, max-age=31536000, immutable`

### 10-3. PWA(Service Worker)는 지금은 제외
- 설치형 경험을 주지만 업데이트 흐름(activate/waiting)이 까다롭고
- 잘못 구성하면 “업데이트가 안 된다” 체감이 커질 수 있습니다.
- Cadence는 잦은 업데이트/개발 반복이 예상되므로, PWA는 안정화 후(마지막)에 고려합니다.

### 10-4. “웹앱 말고 다른 형식 배포”가 더 나은 경우(참고)
- 파일 시스템 저장/백업을 더 강하게 통제하고 싶음
- 자동 업데이트/버전 관리가 필요
- 브라우저 호환/캐시를 완전히 통제하고 싶음
→ 이 경우 Electron/Tauri가 후보지만, 배포 파이프라인이 무거워집니다.

### 10-5. Cadence 결론(현재 조건)
- **정적 웹앱 유지 + Vite(파일명 해시)로 빌드/배포**가 최적.
- 캐시 이슈는 index.html 재검증 정책만 지키면 사실상 끝납니다.

---

## 11) 불변 조건(Invariants)
 불변 조건(Invariants)
- 저장 DateKey는 무조건 ISO(`YYYY-MM-DD`)
- 유저 데이터는 `cadence.userdb` 단일 키
- UI는 storage 직접 접근 금지(반드시 store/actions 경유)
- 이벤트는 data-action 기반 위임만 사용(전역 onclick 제거)
- 백업/복원 파일은 `"app":"cadence"`를 포함한 앱 전용 포맷

---

(문서 끝)
