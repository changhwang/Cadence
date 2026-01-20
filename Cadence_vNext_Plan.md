# Cadence vNext — Goal/Nutrition/Activity 설계 & 구현 계획서 (최적화 버전)
**작성일:** 2026-01-20  
**목표:** “목표(감량/유지/증량 등) + 식단 방식(저탄/케토/고탄/고단백 등)”을 설정하면, 각 날짜의 **기준 목표(Base)** 및 **최종 목표(Final: 운동 보정 포함)**를 일관되게 계산·표시하고, **과거 대시보드가 절대 흔들리지 않게**(목표 이력 기반) 만드는 것.

## 진행 상태 요약 (2026-01-20)
- 완료: timeline/override 데이터 구조 + 기본 목표 계산 경로, Goal 변경/오버라이드 모달, 운동 보정 설정 UI
- 완료: 운동 페이지 핵심 기능/UX 마감 (운동 기록/루틴/상세/타이머/유산소)
- 진행중: 목표 UI 재구성(대시보드 요약/도넛 연결), Goal History 달력 뷰
- 남음: 회귀 테스트(목표/오버라이드/운동보정 조합)

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

## 5) UI/UX(최소 변경으로 최강 효용)
### 5-1) Diet/Workout 상단 “Goal Card”
- Base Target(효력일 표시): `base 2100kcal (since 2026-01-20)`
- Exercise Credit: `+210kcal (50%, cap 500)`
- Final Target: `2310kcal`
- 버튼:
  1) “오늘부터 목표 변경” → timeline add
  2) “이 날짜만 목표 조정” → override set/lock
  3) “오버라이드 해제” → override remove

### 5-2) Settings → Goal/Nutrition
- Default Goal Mode / Default Framework
- Exercise Credit: enabled, factor(0/0.5/1.0), capKcal, distribution
- Date format(표시만): YMD/MDY/KO_DOTS(표시용)

---

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
