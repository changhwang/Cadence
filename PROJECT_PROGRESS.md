# Cadence Rewrite Progress

## 완료
- [x] 리라이트 스켈레톤/라우터/스토어/퍼시스트 구축
- [x] 유틸(date/dom) 구성
- [x] 기본 CRUD (식단/운동/신체)
- [x] 설정 + 백업/복원
- [x] DateBar + dateSync 동작
- [x] 기본 UI 뼈대 및 디테일 1차 정리
- [x] 운동 세트 상세 편집(수정 모달 포함)
- [x] 운동 루틴/템플릿 모달
- [x] 운동 추가 모달
- [x] 추가 버튼 → 모달 선택(루틴/운동 추가) UX 정리
- [x] 설정 페이지 확장 (키/운동 단위/음식 단위/사운드 등)
- [x] Settings > Nutrition UI 확장
- [x] Goal timeline/override 데이터 구조 구축
- [x] goalSelectors 구현 (date별 목표 계산 경로 고정)
- [x] goalService/targetEngine/frameworks 스캐폴딩
- [x] Exercise Credit 정책/계산 적용
- [x] Goal override 기본 UI (이 날짜만 수정/해제)
- [x] Goal 변경 UI (오늘부터 변경)
- [x] Goal 카드 운동 보정 토글/비율 UI
- [x] Goal 카드 운동 보정 상한 슬라이더 UI

## 진행중
- [ ] 데이터베이스 분리 (exercise/food/cardio/routines)
- [ ] 영양/목표 시스템 업그레이드 (Goal × Framework)
- [ ] 목표 UI 재구성: Settings 중심 + Goal History + 대시보드 표시

## 예정
- [ ] 다국어 DB 구조 리팩터 (exercise/food id + label 분리)
- [ ] 운동 검색/DB 연결
- [ ] 운동 플랜 편집/삭제(리스트 선택 기반 관리 모드)
- [ ] 식단 DB 연결 + 영양 계산
- [ ] 통계/차트 복원
- [ ] 스와이프 삭제 UX(선택)
- [ ] 설정 페이지 UI/UX 마감
- [x] nutritionEngine + 정책 프리셋 구현
- [ ] Diet 화면 영양 카드/경고 배지 출력
- [ ] iOS 홈화면 타이틀(meta) 정리
- [ ] addDays() UTC-safe로 교체
- [x] change 이벤트 리스너 중복 제거 점검

## 페이지별 남은 작업
### 운동
- [ ] 운동 검색/선택 모달 (EXERCISE_DB 연동)
- [ ] 루틴 편집/사용자 루틴 저장
- [ ] 타이머/휴식 기능 복원
- [ ] 세트 시작/완료 UX (세트별 기록 흐름)
- [ ] 운동 상세 통계(볼륨/히스토리) 최소 복원
- [ ] 상단 요약 표시(세트/볼륨/유산소/칼로리) 최종 UI 확정

### 식단
- [ ] 음식 검색/선택 모달 (FOOD_DB 연동)
- [ ] 음식 항목(중량/수량) 입력 UI
- [ ] 영양 합산/도넛/카드(칼/단/탄/지/수분/나트륨)
- [ ] 물 타임라인/식사 타임라인(선택)
- [ ] 식단 상단 요약 구성 확정(운동 요약 제외)

### 신체
- [ ] 체중 히스토리 차트
- [ ] 허리/체지방/근량 추이 차트
- [ ] 통계 카드(최근/최고/평균)

### 설정
- [x] 프로필(성별/키/체중/생년월일/활동량) 입력
- [x] 단위 설정(키/체중/운동/음식/물)
- [x] 사운드/알림 설정
- [ ] 백업/복원 UX 마감
- [x] Goal/Nutrition 저장 시 timeline append(오늘부터 적용)
- [x] Goal History 섹션(타임라인/오버라이드 관리 UI)
- [ ] Goal History 달력 뷰(변경일 마커 표시)

## 공통/백엔드/유틸
- [ ] storage/schema 마이그레이션 정책 정리(현재 1 고정)
- [ ] 에러/저장 실패 배너 처리
- [ ] Logger/Debug Tool 마감
- [ ] 이벤트 위임 액션 네이밍 정리

