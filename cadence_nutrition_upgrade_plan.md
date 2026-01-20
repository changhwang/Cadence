# Cadence 영양/목표 시스템 업그레이드 계획 (v2.1)

작성일: 2026-01-19 (America/Chicago)

## 0. 배경: “최근 미국에서 diet 기준 바뀐 거” 팩트 체크

- 사용자가 말한 **“미국 국무부(Department of State)”**가 아니라, 미국의 ‘Dietary Guidelines for Americans(DGA)’는 전통적으로 **USDA(농무부) + HHS(보건복지부)**가 공동으로 발행합니다.
- **2025–2030 DGA**가 2026년 1월 초 공개/발표되면서(연방 차원의 공식 가이드라인) “기준이 바뀌었다”는 인식이 생긴 것으로 보입니다.

이 문서의 목표는 **Cadence**에서 “유지/감량/증량 3모드 + 고정된 매크로 비율”을 넘어, **(1) 최신 DGA(정부 기준) 프리셋**과 **(2) 피트니스/퍼포먼스 프리셋**을 **모듈형으로 추가**해 향후 변경이 쉬운 구조로 만드는 것입니다.

---

## 1. 현재 코드(app_v29.js) 기준: 무엇이 ‘예전 기준’처럼 보였나

### 1-1. 목표(모드) 옵션이 3개로 고정
- 설정 UI에서 goal preset이 **diet(-500), maint, bulk(+300), custom**으로 고정되어 있습니다.
- 즉, 목표의 “분화(리컴프/린벌크/미니컷/퍼포먼스 유지 등)”가 구조적으로 불가능합니다.

### 1-2. 매크로 목표가 ‘고정 비율’로 계산됨
- `applyTempGoalPreset()`에서 탄/단/지 비율을 고정(p=0.30, c=0.45, f=0.25) 또는 유사 비율로 두고, 칼로리에서 역산하는 방식입니다.
- 이 방식은 “최신 가이드라인 변화(예: 단백질 g/kg 권장 범위, 포화지방/첨가당 제한 등)”를 반영하기 어렵습니다.

### 1-3. 나트륨/수분 목표는 ‘고정값/단순 공식’
- 기본값이 `targetSodium=2000mg`, `water=2000` 또는 체중 기반 추정치 등으로 처리됩니다.
- 식품 DB에는 일부 음식에 sodium 필드가 있으나(자동 추정 포함), ‘정책(가이드라인) 기반 목표’로 정교화되어 있지 않습니다.

---

## 2. “최신 기준”을 Cadence에 녹이는 방식 (설계 원칙)

### 2-1. 핵심 분리: Goal(에너지) × Framework(영양 기준)

- **Goal(목표)**: 칼로리 델타를 결정합니다.
  - 예: 유지(0), 감량(-10~20%), 증량(+5~15%), 린 벌크(+5~10%), 미니 컷(-20~25%), 리컴프(0~ -10% + 고단백) 등

- **Framework(기준/프리셋)**: 단백질/탄수/지방/제한(첨가당·포화지방·나트륨·섬유질 등)을 결정합니다.
  - 예: 정부 기준(DGA 2025–2030), 밸런스(AMDR), 근비대(ISSN), 지구력(ACSM/AND/DC) 등

이렇게 분리하면:
- “감량”이라는 Goal을 유지하면서도 “DGA vs 근비대 vs 저탄” 같은 Framework를 바꿀 수 있습니다.
- 향후 기준이 또 바뀌어도 Framework만 교체하면 됩니다.

### 2-2. ‘정책(가이드라인) → 계산식’으로 내려오는 단계를 명확히

Cadence에서는 **Policy → Targets** 단계를 갖습니다.

- **Policy (정책/프리셋)**
  - 단백질 목표: g/kg 범위 또는 % 에너지 범위
  - 탄수 목표: g/kg 범위(훈련량 기반) 또는 AMDR
  - 지방 목표: AMDR 또는 남은 칼로리
  - 제한/가드레일: 포화지방 ≤ 10% kcal, 나트륨 ≤ 2300mg, 첨가당(가능하면 10% kcal 또는 meal 단위 경고), 섬유질(14g/1000kcal) 등

- **Targets (오늘의 목표값)**
  - 사용자 프로필(체중/키/나이/성별/활동지수/훈련량) + Goal + Policy를 입력으로,
  - `targetCal`, `targetPro_g`, `targetCarb_g`, `targetFat_g`, `targetSodium_mg`, `targetSatFat_g`, `targetFiber_g` …를 생성

---

## 3. Cadence v2.1에서 추가할 “영양 옵션(분화)” 제안

### 3-1. Goal(목표) 옵션

| Goal | 의도 | 기본 칼로리 델타(초기값) | 코멘트 |
|---|---|---:|---|
| 유지(Maintain) | 체중/컨디션 유지 | 0% | 기본 |
| 감량(Cut) | 지방 감량 | -15% | 주당 -0.25~0.75% BW 페이스에 맞게 조절 |
| 미니컷(Mini-cut) | 짧고 강한 감량 | -25% | 2~6주 단기 옵션 |
| 증량(Bulk) | 근육/체중 증가 | +10% | 초보/마른 체형에 유리 |
| 린 벌크(Lean bulk) | 체지방 최소 증량 | +5% | 대부분의 사용자 기본 추천 |
| 리컴프(Recomp) | 체지방↓ 근육↑ | 0% 또는 -5% | 단백질 상향이 핵심 |
| 퍼포먼스 유지(Performance) | 운동 수행/회복 우선 | 0% | 탄수/수분/나트륨(상황별) 관리에 초점 |

### 3-2. Framework(기준/프리셋) 옵션

#### A) Government baseline (DGA 2025–2030)
- 목적: “일반 건강/만성질환 위험” 관점의 **연방 가이드라인 기반 기본 프리셋**
- 구현 포인트(앱에서 계산 가능한 항목 위주):
  - **단백질: 1.2–1.6 g/kg/day**를 기본 권장(새 DGA 문서의 핵심 변화 중 하나)
  - **포화지방: 총 열량의 10% 이내**
  - **나트륨: 2300mg/day 이하** (일반 성인 기준)
  - **첨가당**: 가능한 한 제한(앱은 “10% kcal” 또는 “식사당 10g 경고” 같은 형태로 표현)
  - **섬유질**: 14 g/1000kcal(미국 권고 관행)

#### B) Balanced (AMDR 기반)
- 목적: DRI의 AMDR(허용 범위) 기반으로 가장 교과서적인 “비율 기반”
  - 탄수 45–65%, 지방 20–35%, 단백질 10–35% (개인화/운동량에 따라 단백질을 상한 쪽으로)

#### C) Hypertrophy / Strength (ISSN 기반)
- 목적: 근비대/근력 향상에 최적화
  - 단백질: 보통 **1.4–2.0 g/kg/day** (감량/고강도 시 상향 가능)
  - 탄수/지방: 남은 칼로리를 운동량·선호에 따라 배분

#### D) Endurance / High-Volume (ACSM/AND/DC 기반)
- 목적: 지구력/고훈련량에서 탄수화물 가용성 확보
  - 탄수: 훈련량에 따라 **3–12 g/kg/day** 범위에서 설정(라이트~익스트림)
  - 단백질: 1.2–2.0 g/kg/day 범위에서 설정

---

## 4. 데이터 모델(새판) – “정책 기반 목표”를 위한 최소 스키마

### 4-1. user profile (필수)
```json
profile: {
  sex: 'M'|'F',
  birth: 'YYYY-MM-DD',
  height_cm: number,
  weight_kg: number,
  activity: 'sedentary'|'light'|'moderate'|'high'|'athlete',
  trainingLoad: 'light'|'moderate'|'high'|'extreme' // (탄수 g/kg 프리셋용)
}
```

### 4-2. nutrition settings (핵심)
```json
nutrition: {
  goal: 'maintain'|'cut'|'minicut'|'bulk'|'leanbulk'|'recomp'|'performance',
  framework: 'dga_2025'|'amdr'|'issn_strength'|'acsm_endurance'|'custom',
  overrides: {
    targetCal?: number,
    protein_g?: number,
    carbs_g?: number,
    fat_g?: number,
    sodium_mg?: number,
    satFat_g?: number,
    fiber_g?: number,
    addedSugar_g?: number
  }
}
```

### 4-3. daily log (식단)
- 기존처럼 “날짜별” 저장하되, 각 food item에 **영양 필드 확장 가능**하게 설계합니다.

```json
dietLog['YYYY-MM-DD']: {
  meals: [
    {
      type: 'breakfast'|'lunch'|'dinner'|'snack',
      foods: [
        {
          name: string,
          unit: string,
          amount: number,
          cal: number,
          pro_g: number,
          carb_g: number,
          fat_g: number,
          sodium_mg?: number,
          satFat_g?: number,
          fiber_g?: number,
          addedSugar_g?: number
        }
      ]
    }
  ],
  water_ml: number
}
```

> 포인트: **초기에는 기존 4대 매크로+나트륨만**으로 시작하고, satFat/fiber/addedSugar는 **선택 필드**로 넣어 점진 확장을 허용합니다.

---

## 5. “Targets 계산 엔진” 설계 (services/nutritionEngine.js)

### 5-1. 입력
- profile, nutrition(goal/framework/overrides)

### 5-2. 단계
1) **BMR** 계산(현재 코드의 Mifflin-St Jeor 유지 가능)
2) **TDEE** = BMR × activityFactor
3) **Goal delta** 적용 → targetCal
4) **Framework policy** 적용
   - protein: g/kg 또는 % 기반
   - carbs: g/kg(훈련량) 또는 % 기반
   - fat: remainder 또는 % 기반
   - constraints: sodium/satFat/fiber/addedSugar
5) **Overrides**가 있으면 최종 값에 덮어쓰기

### 5-3. 출력
```js
{
  targetCal,
  protein_g,
  carbs_g,
  fat_g,
  sodium_mg,
  satFat_g,
  fiber_g,
  addedSugar_g,
  notes: [/* UI용 메시지 */]
}
```

---

## 6. UI/UX: 설정과 대시보드가 바뀌어야 하는 포인트

### 6-1. Settings > Nutrition (새 UI)
1) **Goal 선택** (유지/감량/린벌크/리컴프…)
2) **Framework 선택** (DGA/AMDR/ISSN/Endurance…)
3) (옵션) **훈련량(trainingLoad)** 선택 (Endurance 프리셋에서만 강조)
4) “고급 설정(override)” 토글
   - 켜면 targetCal/pro/carb/fat/sodium/satFat/fiber/addedSugar 입력란 노출

### 6-2. Diet Dashboard
- 기존 도넛(칼/단/탄/지/수분/나트륨)에 더해:
  - satFat, fiber, addedSugar는 **데이터가 있는 경우만** 카드/도넛 노출
  - “정책 기반 가드레일”은 **경고 배지**로 표현

---

## 7. 구현 순서 (마이그레이션 생략 전제)

### Phase 1) 엔진부터 만든다
- [ ] `nutritionPolicies.js` (정책 정의)
- [ ] `nutritionEngine.js` (계산)
- [ ] `store`에 `profile`, `nutrition` 추가
- [ ] unit test(간단): 몇 케이스(maintain/cut, dga/issn/endurance)에서 목표값이 정상 범위인지 확인

### Phase 2) Settings 화면
- [ ] Goal/Framework 선택 UI
- [ ] overrides 토글 + 입력
- [ ] 저장 시 store 갱신 + 즉시 target 재계산

### Phase 3) Diet 화면
- [ ] 기존 합산 로직에 새 영양 필드(satFat/fiber/addedSugar)가 있으면 같이 합산
- [ ] progress 카드/경고 배지 출력

### Phase 4) Food DB 확장(선택)
- [ ] 자주 먹는 음식 20~50개만 우선적으로 satFat/fiber/addedSugar 채우기
- [ ] 나머지는 공란(unknown) 허용

---

## 8. 참고 기준(앱에 녹일 핵심 수치)

### 8-1. DGA 2025–2030에서 ‘앱 계산’에 바로 쓰기 좋은 것
- 단백질 1.2–1.6 g/kg/day (새 가이드라인의 큰 변화로 언급됨)
- 포화지방 10% 열량 제한(계산 가능)
- 나트륨 2300mg/day 제한(계산 가능)

### 8-2. 스포츠 영양(퍼포먼스 프리셋)
- ISSN: 단백질 1.4–2.0 g/kg/day 범위가 흔히 인용됨
- Endurance: 탄수 g/kg/day는 훈련량에 따라 3–12 g/kg/day까지 기간화(periodization) 권장

### 8-3. 섬유질(일반 권고 관행)
- 섬유질 Adequate Intake: 14 g/1000 kcal (UI에서는 “권장 섬유질”로 표시 가능)

---

## 9. (선택) “캐시 때문에 업데이트 빡센 문제”와의 연결

- Cadence를 PWA/정적 웹앱으로 유지하면서도 업데이트 스트레스를 줄이려면, **파일명 해시(예: app.abcd1234.js)** + `index.html`은 no-cache, 정적 자산은 long-cache 전략이 가장 관리하기 쉽습니다.
- nutrition 시스템은 JS 모듈이 늘어나므로 이 전략의 체감 효과가 더 커집니다.

---

## 10. 끝: 이 문서의 실전 체크리스트

- [ ] “Goal × Framework” 분리 구조로 store 스키마 확정
- [ ] nutritionEngine output이 UI에서 바로 쓰일 형태로 결정
- [ ] DGA/ISSN/Endurance 프리셋을 **정책 파일**로 고정(코드 중복 금지)
- [ ] satFat/fiber/addedSugar는 ‘데이터 있는 경우만 노출’로 단계적 도입

