# Cadence DB Spec 확장 리스트 (vNext)

## 운동 DB (exercise)
필수
- id / labels(ko/en)
- muscle.primary / muscle.secondary
- equipment
- pattern (push/pull/hinge/squat 등)

확장
- muscles.detail (upper_chest, rear_delts, adductors 등)
- classification (compound/isolation)
- unilateral (true/false)
- grip (overhand/underhand/neutral)
- range (full/partial)
- plane (sagittal/frontal/transverse)
- difficulty (beginner/intermediate/advanced)
- contraindications (knee/shoulder/low_back 등)
- cues (코칭 포인트)

## 식단 DB (food)
필수
- id / labels(ko/en)
- serving.size / serving.unit
- nutrition (kcal/proteinG/carbG/fatG)

확장
- nutrition.fiberG / unsatFatG / satFatG / transFatG
- nutrition.sugarG / addedSugarG
- nutrition.sodiumMg / potassiumMg / calciumMg / ironMg
- nutrition.waterMl
- category (protein/carb/fat/fruit/veg/meal/snack/oil/sauce)
- tags (sauce/processed/wholefood 등)
- brand / barcode
- cuisine (korean/japanese/chinese/western/etc)

## 유산소 DB (cardio)
필수
- id / labels(ko/en)
- met / intensity / kind

확장
- paceCategory (easy/moderate/hard)
- terrain (indoor/outdoor/hill)
- modality (run/row/cycle/swim)
- intervalFriendly (true/false)
