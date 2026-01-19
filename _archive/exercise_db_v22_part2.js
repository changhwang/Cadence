// V22: Complete Exercise Database - Part 2 (Shoulder, Arm, Leg, Core)

const EXERCISE_DB_V22_PART2 = {
    // ===== SHOULDER (어깨) - 15 exercises =====
    "오버헤드 프레스 (Overhead Press)": {
        name_ko: "오버헤드 프레스", name_en: "Overhead Press",
        searchTerms: ["오버헤드", "프레스", "shoulder", "press", "ohp"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps", "upper_chest"], muscleGroup: "shoulder" },
        rest: 150, target: "6-10", sets: 4
    },
    "덤벨 숄더 프레스 (Dumbbell Shoulder Press)": {
        name_ko: "덤벨 숄더 프레스", name_en: "Dumbbell Shoulder Press",
        searchTerms: ["덤벨", "숄더", "프레스", "dumbbell", "shoulder", "press"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps"], muscleGroup: "shoulder" },
        rest: 120, target: "8-12", sets: 3
    },
    "래터럴 레이즈 (Lateral Raise)": {
        name_ko: "래터럴 레이즈", name_en: "Lateral Raise",
        searchTerms: ["래터럴", "레이즈", "lateral", "raise", "side", "delt"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["side_delts"], secondary: [], muscleGroup: "shoulder" },
        rest: 60, target: "12-20", sets: 3
    },
    "프론트 레이즈 (Front Raise)": {
        name_ko: "프론트 레이즈", name_en: "Front Raise",
        searchTerms: ["프론트", "레이즈", "front", "raise"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["front_delts"], secondary: [], muscleGroup: "shoulder" },
        rest: 60, target: "12-15", sets: 3
    },
    "리어 델트 플라이 (Rear Delt Fly)": {
        name_ko: "리어 델트 플라이", name_en: "Rear Delt Fly",
        searchTerms: ["리어", "델트", "플라이", "rear", "delt", "fly"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["rear_delts"], secondary: ["upper_back"], muscleGroup: "shoulder" },
        rest: 75, target: "12-15", sets: 3
    },
    "밀리터리 프레스 (Military Press)": {
        name_ko: "밀리터리 프레스", name_en: "Military Press",
        searchTerms: ["밀리터리", "프레스", "military", "press"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps", "core"], muscleGroup: "shoulder" },
        rest: 150, target: "6-10", sets: 3
    },
    "아놀드 프레스 (Arnold Press)": {
        name_ko: "아놀드 프레스", name_en: "Arnold Press",
        searchTerms: ["아놀드", "프레스", "arnold", "press"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps"], muscleGroup: "shoulder" },
        rest: 120, target: "8-12", sets: 3
    },
    "업라이트 로우 (Upright Row)": {
        name_ko: "업라이트 로우", name_en: "Upright Row",
        searchTerms: ["업라이트", "로우", "upright", "row"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["side_delts", "traps"], secondary: ["front_delts"], muscleGroup: "shoulder" },
        rest: 90, target: "8-12", sets: 3
    },
    "케이블 래터럴 레이즈 (Cable Lateral Raise)": {
        name_ko: "케이블 래터럴 레이즈", name_en: "Cable Lateral Raise",
        searchTerms: ["케이블", "래터럴", "cable", "lateral"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["side_delts"], secondary: [], muscleGroup: "shoulder" },
        rest: 60, target: "12-15", sets: 3
    },
    "시티드 덤벨 프레스 (Seated Dumbbell Press)": {
        name_ko: "시티드 덤벨 프레스", name_en: "Seated Dumbbell Press",
        searchTerms: ["시티드", "덤벨", "seated", "dumbbell"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps"], muscleGroup: "shoulder" },
        rest: 120, target: "8-12", sets: 3
    },
    "페이스 풀 (Face Pull)": {
        name_ko: "페이스 풀", name_en: "Face Pull",
        searchTerms: ["페이스", "풀", "face", "pull"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["rear_delts"], secondary: ["traps", "upper_back"], muscleGroup: "shoulder" },
        rest: 75, target: "12-15", sets: 3
    },
    "스미스 머신 숄더 프레스 (Smith Machine Shoulder Press)": {
        name_ko: "스미스 머신 숄더 프레스", name_en: "Smith Machine Shoulder Press",
        searchTerms: ["스미스", "숄더", "smith", "shoulder"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps"], muscleGroup: "shoulder" },
        rest: 120, target: "8-12", sets: 3
    },
    "리버스 펙덱 (Reverse Pec Deck)": {
        name_ko: "리버스 펙덱", name_en: "Reverse Pec Deck",
        searchTerms: ["리버스", "펙덱", "reverse", "pec", "deck"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["rear_delts"], secondary: [], muscleGroup: "shoulder" },
        rest: 75, target: "12-15", sets: 3
    },
    "벤트오버 래터럴 레이즈 (Bent-Over Lateral Raise)": {
        name_ko: "벤트오버 래터럴 레이즈", name_en: "Bent-Over Lateral Raise",
        searchTerms: ["벤트", "래터럴", "bent", "lateral"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["rear_delts"], secondary: [], muscleGroup: "shoulder" },
        rest: 60, target: "12-15", sets: 3
    },
    "푸시 프레스 (Push Press)": {
        name_ko: "푸시 프레스", name_en: "Push Press",
        searchTerms: ["푸시", "프레스", "push", "press"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps", "leg"], muscleGroup: "shoulder" },
        rest: 150, target: "6-10", sets: 3
    },

    // ===== BICEPS (이두) - 10 exercises =====
    "바벨 컬 (Barbell Curl)": {
        name_ko: "바벨 컬", name_en: "Barbell Curl",
        searchTerms: ["바벨", "컬", "barbell", "curl", "bicep"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: ["forearms"], muscleGroup: "arm" },
        rest: 75, target: "8-12", sets: 3
    },
    "덤벨 컬 (Dumbbell Curl)": {
        name_ko: "덤벨 컬", name_en: "Dumbbell Curl",
        searchTerms: ["덤벨", "컬", "dumbbell", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: ["forearms"], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },
    "해머 컬 (Hammer Curl)": {
        name_ko: "해머 컬", name_en: "Hammer Curl",
        searchTerms: ["해머", "컬", "hammer", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps", "forearms"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },
    "프리쳐 컬 (Preacher Curl)": {
        name_ko: "프리쳐 컬", name_en: "Preacher Curl",
        searchTerms: ["프리쳐", "컬", "preacher", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "8-12", sets: 3
    },
    "케이블 컬 (Cable Curl)": {
        name_ko: "케이블 컬", name_en: "Cable Curl",
        searchTerms: ["케이블", "컬", "cable", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: ["forearms"], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },
    "컨센트레이션 컬 (Concentration Curl)": {
        name_ko: "컨센트레이션 컬", name_en: "Concentration Curl",
        searchTerms: ["컨센트레이션", "컬", "concentration", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: [], muscleGroup: "arm" },
        rest: 60, target: "10-15", sets: 3
    },
    "인클라인 덤벨 컬 (Incline Dumbbell Curl)": {
        name_ko: "인클라인 덤벨 컬", name_en: "Incline Dumbbell Curl",
        searchTerms: ["인클라인", "덤벨", "컬", "incline", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },
    "EZ바 컬 (EZ Bar Curl)": {
        name_ko: "EZ바 컬", name_en: "EZ Bar Curl",
        searchTerms: ["ez바", "컬", "ez", "bar", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: ["forearms"], muscleGroup: "arm" },
        rest: 75, target: "8-12", sets: 3
    },
    "리버스 컬 (Reverse Curl)": {
        name_ko: "리버스 컬", name_en: "Reverse Curl",
        searchTerms: ["리버스", "컬", "reverse", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["forearms", "biceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },
    "21s (21s)": {
        name_ko: "21s", name_en: "21s",
        searchTerms: ["21s", "twenty", "one", "bicep"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: [], muscleGroup: "arm" },
        rest: 90, target: "7-7-7", sets: 3
    },

    // ===== TRICEPS (삼두) - 10 exercises =====
    "트라이셉 푸시다운 (Tricep Pushdown)": {
        name_ko: "트라이셉 푸시다운", name_en: "Tricep Pushdown",
        searchTerms: ["트라이셉", "푸시다운", "tricep", "pushdown"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },
    "클로즈 그립 벤치 프레스 (Close Grip Bench Press)": {
        name_ko: "클로즈 그립 벤치 프레스", name_en: "Close Grip Bench Press",
        searchTerms: ["클로즈", "그립", "벤치", "close", "grip", "bench"],
        category: "Arms", type: "Compound",
        muscles: { primary: ["triceps"], secondary: ["chest"], muscleGroup: "arm" },
        rest: 120, target: "6-10", sets: 3
    },
    "오버헤드 트라이셉 익스텐션 (Overhead Tricep Extension)": {
        name_ko: "오버헤드 트라이셉 익스텐션", name_en: "Overhead Tricep Extension",
        searchTerms: ["오버헤드", "트라이셉", "익스텐션", "overhead", "tricep", "extension"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },
    "스컬 크러셔 (Skull Crusher)": {
        name_ko: "스컬 크러셔", name_en: "Skull Crusher",
        searchTerms: ["스컬", "크러셔", "skull", "crusher", "lying", "extension"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 90, target: "8-12", sets: 3
    },
    "트라이셉 딥스 (Tricep Dips)": {
        name_ko: "트라이셉 딥스", name_en: "Tricep Dips",
        searchTerms: ["트라이셉", "딥스", "tricep", "dips"],
        category: "Arms", type: "Compound",
        muscles: { primary: ["triceps"], secondary: ["chest", "front_delts"], muscleGroup: "arm" },
        rest: 120, target: "8-12", sets: 3
    },
    "로프 푸시다운 (Rope Pushdown)": {
        name_ko: "로프 푸시다운", name_en: "Rope Pushdown",
        searchTerms: ["로프", "푸시다운", "rope", "pushdown"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "12-15", sets: 3
    },
    "덤벨 킥백 (Dumbbell Kickback)": {
        name_ko: "덤벨 킥백", name_en: "Dumbbell Kickback",
        searchTerms: ["덤벨", "킥백", "dumbbell", "kickback"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 60, target: "12-15", sets: 3
    },
    "다이아몬드 푸시업 (Diamond Push-up)": {
        name_ko: "다이아몬드 푸시업", name_en: "Diamond Push-up",
        searchTerms: ["다이아몬드", "푸시업", "diamond", "pushup"],
        category: "Arms", type: "Bodyweight",
        muscles: { primary: ["triceps"], secondary: ["chest"], muscleGroup: "arm" },
        rest: 60, target: "Max", sets: 3
    },
    "벤치 딥스 (Bench Dips)": {
        name_ko: "벤치 딥스", name_en: "Bench Dips",
        searchTerms: ["벤치", "딥스", "bench", "dips"],
        category: "Arms", type: "Bodyweight",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 60, target: "15-20", sets: 3
    },
    "케이블 오버헤드 익스텐션 (Cable Overhead Extension)": {
        name_ko: "케이블 오버헤드 익스텐션", name_en: "Cable Overhead Extension",
        searchTerms: ["케이블", "오버헤드", "cable", "overhead", "extension"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },

    // ===== LEGS (다리) - 20 exercises =====
    "바벨 스쿼트 (Barbell Squat)": {
        name_ko: "바벨 스쿼트", name_en: "Barbell Squat",
        searchTerms: ["바벨", "스쿼트", "barbell", "squat"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings", "core"], muscleGroup: "leg" },
        rest: 180, target: "5-8", sets: 4
    },
    "레그 프레스 (Leg Press)": {
        name_ko: "레그 프레스", name_en: "Leg Press",
        searchTerms: ["레그", "프레스", "leg", "press"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"], muscleGroup: "leg" },
        rest: 150, target: "8-12", sets: 3
    },
    "레그 익스텐션 (Leg Extension)": {
        name_ko: "레그 익스텐션", name_en: "Leg Extension",
        searchTerms: ["레그", "익스텐션", "leg", "extension", "quad"],
        category: "Legs", type: "Isolation",
        muscles: { primary: ["quads"], secondary: [], muscleGroup: "leg" },
        rest: 90, target: "10-15", sets: 3
    },
    "레그 컬 (Leg Curl)": {
        name_ko: "레그 컬", name_en: "Leg Curl",
        searchTerms: ["레그", "컬", "leg", "curl", "hamstring"],
        category: "Legs", type: "Isolation",
        muscles: { primary: ["hamstrings"], secondary: [], muscleGroup: "leg" },
        rest: 90, target: "10-15", sets: 3
    },
    "불가리안 스플릿 스쿼트 (Bulgarian Split Squat)": {
        name_ko: "불가리안 스플릿 스쿼트", name_en: "Bulgarian Split Squat",
        searchTerms: ["불가리안", "스플릿", "스쿼트", "bulgarian", "split", "squat"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"], muscleGroup: "leg" },
        rest: 90, target: "8-12", sets: 3
    },
    "런지 (Lunge)": {
        name_ko: "런지", name_en: "Lunge",
        searchTerms: ["런지", "lunge"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"], muscleGroup: "leg" },
        rest: 90, target: "10-15", sets: 3
    },
    "고블릿 스쿼트 (Goblet Squat)": {
        name_ko: "고블릿 스쿼트", name_en: "Goblet Squat",
        searchTerms: ["고블릿", "스쿼트", "goblet", "squat"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["core"], muscleGroup: "leg" },
        rest: 120, target: "10-15", sets: 3
    },
    "데드리프트 (Deadlift)": {
        name_ko: "데드리프트", name_en: "Deadlift",
        searchTerms: ["데드리프트", "deadlift"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["hamstrings", "glutes", "lower_back"], secondary: ["traps", "lats"], muscleGroup: "leg" },
        rest: 180, target: "3-6", sets: 3
    },
    "루마니안 데드리프트 (Romanian Deadlift)": {
        name_ko: "루마니안 데드리프트", name_en: "Romanian Deadlift",
        searchTerms: ["루마니안", "데드리프트", "romanian", "rdl"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["hamstrings", "glutes"], secondary: ["lower_back"], muscleGroup: "leg" },
        rest: 150, target: "6-10", sets: 3
    },
    "힙 쓰러스트 (Hip Thrust)": {
        name_ko: "힙 쓰러스트", name_en: "Hip Thrust",
        searchTerms: ["힙", "쓰러스트", "hip", "thrust", "glute"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["glutes"], secondary: ["hamstrings"], muscleGroup: "leg" },
        rest: 120, target: "8-12", sets: 3
    },
    "카프 레이즈 (Calf Raise)": {
        name_ko: "카프 레이즈", name_en: "Calf Raise",
        searchTerms: ["카프", "레이즈", "calf", "raise"],
        category: "Legs", type: "Isolation",
        muscles: { primary: ["calves"], secondary: [], muscleGroup: "leg" },
        rest: 60, target: "15-20", sets: 3
    },
    "프론트 스쿼트 (Front Squat)": {
        name_ko: "프론트 스쿼트", name_en: "Front Squat",
        searchTerms: ["프론트", "스쿼트", "front", "squat"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads"], secondary: ["glutes", "core"], muscleGroup: "leg" },
        rest: 180, target: "6-10", sets: 3
    },
    "핵 스쿼트 (Hack Squat)": {
        name_ko: "핵 스쿼트", name_en: "Hack Squat",
        searchTerms: ["핵", "스쿼트", "hack", "squat"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads"], secondary: ["glutes"], muscleGroup: "leg" },
        rest: 150, target: "8-12", sets: 3
    },
    "스티프 레그 데드리프트 (Stiff Leg Deadlift)": {
        name_ko: "스티프 레그 데드리프트", name_en: "Stiff Leg Deadlift",
        searchTerms: ["스티프", "레그", "stiff", "leg", "deadlift"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["hamstrings", "lower_back"], secondary: ["glutes"], muscleGroup: "leg" },
        rest: 150, target: "8-12", sets: 3
    },
    "워킹 런지 (Walking Lunge)": {
        name_ko: "워킹 런지", name_en: "Walking Lunge",
        searchTerms: ["워킹", "런지", "walking", "lunge"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"], muscleGroup: "leg" },
        rest: 90, target: "10-15", sets: 3
    },
    "스텝업 (Step-up)": {
        name_ko: "스텝업", name_en: "Step-up",
        searchTerms: ["스텝업", "step", "up"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: [], muscleGroup: "leg" },
        rest: 75, target: "10-15", sets: 3
    },
    "시티드 카프 레이즈 (Seated Calf Raise)": {
        name_ko: "시티드 카프 레이즈", name_en: "Seated Calf Raise",
        searchTerms: ["시티드", "카프", "seated", "calf"],
        category: "Legs", type: "Isolation",
        muscles: { primary: ["calves"], secondary: [], muscleGroup: "leg" },
        rest: 60, target: "15-20", sets: 3
    },
    "스미스 머신 스쿼트 (Smith Machine Squat)": {
        name_ko: "스미스 머신 스쿼트", name_en: "Smith Machine Squat",
        searchTerms: ["스미스", "머신", "스쿼트", "smith", "machine", "squat"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"], muscleGroup: "leg" },
        rest: 150, target: "8-12", sets: 3
    },
    "글루트 킥백 (Glute Kickback)": {
        name_ko: "글루트 킥백", name_en: "Glute Kickback",
        searchTerms: ["글루트", "킥백", "glute", "kickback"],
        category: "Legs", type: "Isolation",
        muscles: { primary: ["glutes"], secondary: [], muscleGroup: "leg" },
        rest: 60, target: "12-15", sets: 3
    },
    "레그 프레스 카프 레이즈 (Leg Press Calf Raise)": {
        name_ko: "레그 프레스 카프 레이즈", name_en: "Leg Press Calf Raise",
        searchTerms: ["레그", "프레스", "카프", "leg", "press", "calf"],
        category: "Legs", type: "Isolation",
        muscles: { primary: ["calves"], secondary: [], muscleGroup: "leg" },
        rest: 60, target: "15-20", sets: 3
    },

    // ===== CORE (코어) - 10 exercises =====
    "플랭크 (Plank)": {
        name_ko: "플랭크", name_en: "Plank",
        searchTerms: ["플랭크", "plank", "core"],
        category: "Core", type: "Static",
        muscles: { primary: ["abs", "core"], secondary: [], muscleGroup: "core" },
        rest: 60, target: "45-60s", sets: 3
    },
    "크런치 (Crunch)": {
        name_ko: "크런치", name_en: "Crunch",
        searchTerms: ["크런치", "crunch", "abs"],
        category: "Core", type: "Isolation",
        muscles: { primary: ["abs"], secondary: [], muscleGroup: "core" },
        rest: 60, target: "15-20", sets: 3
    },
    "러시안 트위스트 (Russian Twist)": {
        name_ko: "러시안 트위스트", name_en: "Russian Twist",
        searchTerms: ["러시안", "트위스트", "russian", "twist", "oblique"],
        category: "Core", type: "Isolation",
        muscles: { primary: ["obliques", "abs"], secondary: [], muscleGroup: "core" },
        rest: 60, target: "15-20", sets: 3
    },
    "행잉 레그 레이즈 (Hanging Leg Raise)": {
        name_ko: "행잉 레그 레이즈", name_en: "Hanging Leg Raise",
        searchTerms: ["행잉", "레그", "레이즈", "hanging", "leg", "raise"],
        category: "Core", type: "Compound",
        muscles: { primary: ["abs", "hip_flexors"], secondary: [], muscleGroup: "core" },
        rest: 75, target: "10-15", sets: 3
    },
    "케이블 크런치 (Cable Crunch)": {
        name_ko: "케이블 크런치", name_en: "Cable Crunch",
        searchTerms: ["케이블", "크런치", "cable", "crunch"],
        category: "Core", type: "Isolation",
        muscles: { primary: ["abs"], secondary: [], muscleGroup: "core" },
        rest: 60, target: "15-20", sets: 3
    },
    "바이시클 크런치 (Bicycle Crunch)": {
        name_ko: "바이시클 크런치", name_en: "Bicycle Crunch",
        searchTerms: ["바이시클", "크런치", "bicycle", "crunch"],
        category: "Core", type: "Isolation",
        muscles: { primary: ["abs", "obliques"], secondary: [], muscleGroup: "core" },
        rest: 60, target: "15-20", sets: 3
    },
    "사이드 플랭크 (Side Plank)": {
        name_ko: "사이드 플랭크", name_en: "Side Plank",
        searchTerms: ["사이드", "플랭크", "side", "plank", "oblique"],
        category: "Core", type: "Static",
        muscles: { primary: ["obliques"], secondary: ["core"], muscleGroup: "core" },
        rest: 60, target: "30-45s", sets: 3
    },
    "데드버그 (Dead Bug)": {
        name_ko: "데드버그", name_en: "Dead Bug",
        searchTerms: ["데드버그", "dead", "bug"],
        category: "Core", type: "Isolation",
        muscles: { primary: ["abs", "core"], secondary: [], muscleGroup: "core" },
        rest: 60, target: "10-15", sets: 3
    },
    "마운틴 클라이머 (Mountain Climber)": {
        name_ko: "마운틴 클라이머", name_en: "Mountain Climber",
        searchTerms: ["마운틴", "클라이머", "mountain", "climber"],
        category: "Core", type: "Compound",
        muscles: { primary: ["abs", "core"], secondary: ["hip_flexors"], muscleGroup: "core" },
        rest: 60, target: "30-45s", sets: 3
    },
    "압 롤아웃 (Ab Rollout)": {
        name_ko: "압 롤아웃", name_en: "Ab Rollout",
        searchTerms: ["압", "롤아웃", "ab", "rollout", "wheel"],
        category: "Core", type: "Compound",
        muscles: { primary: ["abs", "core"], secondary: ["lower_back"], muscleGroup: "core" },
        rest: 90, target: "10-15", sets: 3
    }
};

// Total count: Chest 15 + Back 20 + Shoulder 15 + Biceps 10 + Triceps 10 + Legs 20 + Core 10 = 100 exercises!
