// Data Layer (V5 - Dynamic System)

// 1. Routine Templates (V22: Updated with Korean exercise names)
const ROUTINE_TEMPLATES = {
    "Push Day": {
        title: "푸시 (Push)",
        exercises: ["벤치 프레스 (Barbell Bench Press)", "인클라인 벤치 프레스 (Incline Bench Press)", "오버헤드 프레스 (Overhead Press)", "래터럴 레이즈 (Lateral Raise)", "트라이셉 푸시다운 (Tricep Pushdown)"]
    },
    "Pull Day": {
        title: "풀 (Pull)",
        exercises: ["랫 풀다운 (Lat Pulldown)", "시티드 로우 (Seated Row)", "페이스 풀 (Face Pull)", "덤벨 컬 (Dumbbell Curl)", "백 익스텐션 (Back Extension)"]
    },
    "Legs Day": {
        title: "하체 (Legs)",
        exercises: ["레그 프레스 (Leg Press)", "레그 컬 (Leg Curl)", "루마니안 데드리프트 (Romanian Deadlift)", "플랭크 (Plank)", "Mobility"]
    },
    "Full Body A": {
        title: "전신 A (Full Body A)",
        exercises: ["레그 프레스 (Leg Press)", "벤치 프레스 (Barbell Bench Press)", "시티드 로우 (Seated Row)", "오버헤드 프레스 (Overhead Press)", "플랭크 (Plank)"]
    },
    "Cardio & Core": {
        title: "유산소 & 코어 (Cardio & Core)",
        exercises: ["러닝 (Running)", "플랭크 (Plank)", "크런치 (Crunch)"]
    },
    // V28: New Routines (User Request)
    "Upper Body Split": {
        title: "2분할 상체 (2-Day Split Upper)",
        exercises: [
            "행잉 니 레이즈 (Hanging Knee Raise)",
            "슬로우 푸시업 (Slow Push-up)",
            "스미스 머신 벤치 (Smith Machine Bench)",
            "시티드 로우 (Seated Row)",
            "어시스트 풀업 (Assist Pull-up)",
            "스탠딩 덤벨 숄더 프레스 (Standing DB Shoulder Press)",
            "리버스 펙덱 플라이 (Reverse Pec Deck Fly)",
            "케이블 컬 (Cable Curl)",
            "트라이셉 푸시다운 (Tricep Pushdown)"
        ]
    },
    "Lower Body Split": {
        title: "2분할 하체 (2-Day Split Lower)",
        exercises: [
            "크런치 (Crunch)",
            "플랭크 (Plank)",
            "레그 프레스 (Leg Press)",
            "루마니안 데드리프트 (Romanian Deadlift)",
            "스미스 머신 스쿼트 (Smith Machine Squat)",
            "레그 익스텐션 (Leg Extension)",
            "레그 컬 (Leg Curl)"
        ]
    }
};

// 2. Exercise Database (V22: Bilingual with Muscle Tracking)
window.EXERCISE_DB = {
    // ===== CHEST (가슴) - 15 exercises =====
    "벤치 프레스 (Barbell Bench Press)": {
        name_ko: "바벨 벤치 프레스", name_en: "Barbell Bench Press",
        searchTerms: ["벤치", "프레스", "bench", "press", "chest", "가슴"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["chest"], secondary: ["front_delts", "triceps"], muscleGroup: "chest" },
        rest: 150, target: "6-10", sets: 4
    },
    "인클라인 벤치 프레스 (Incline Bench Press)": {
        name_ko: "인클라인 벤치 프레스", name_en: "Incline Bench Press",
        searchTerms: ["인클라인", "벤치", "incline", "bench", "upper", "chest"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["upper_chest"], secondary: ["front_delts", "triceps"], muscleGroup: "chest" },
        rest: 150, target: "8-12", sets: 3
    },
    "덤벨 벤치 프레스 (Dumbbell Bench Press)": {
        name_ko: "덤벨 벤치 프레스", name_en: "Dumbbell Bench Press",
        searchTerms: ["덤벨", "벤치", "dumbbell", "db", "chest"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["chest"], secondary: ["front_delts", "triceps"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "푸시업 (Push-up)": {
        name_ko: "푸시업", name_en: "Push-up",
        searchTerms: ["푸시업", "팔굽혀펴기", "push", "up", "pushup"],
        category: "Chest", type: "Bodyweight",
        muscles: { primary: ["chest"], secondary: ["triceps", "front_delts"], muscleGroup: "chest" },
        rest: 60, target: "Max", sets: 3
    },
    "슬로우 푸시업 (Slow Push-up)": {
        name_ko: "슬로우 푸시업", name_en: "Slow Push-up",
        searchTerms: ["슬로우", "푸시업", "slow", "pushup"],
        category: "Chest", type: "Bodyweight",
        muscles: { primary: ["chest"], secondary: ["triceps", "core"], muscleGroup: "chest" },
        rest: 60, target: "Max", sets: 2
    },
    "케이블 플라이 (Cable Fly)": {
        name_ko: "케이블 플라이", name_en: "Cable Fly",
        searchTerms: ["케이블", "플라이", "cable", "fly", "chest"],
        category: "Chest", type: "Isolation",
        muscles: { primary: ["chest"], secondary: [], muscleGroup: "chest" },
        rest: 90, target: "12-15", sets: 3
    },
    "디클라인 벤치 프레스 (Decline Bench Press)": {
        name_ko: "디클라인 벤치 프레스", name_en: "Decline Bench Press",
        searchTerms: ["디클라인", "decline", "lower", "chest"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["lower_chest"], secondary: ["triceps"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "덤벨 인클라인 프레스 (Dumbbell Incline Press)": {
        name_ko: "덤벨 인클라인 프레스", name_en: "Dumbbell Incline Press",
        searchTerms: ["덤벨", "인클라인", "dumbbell", "incline"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["upper_chest"], secondary: ["front_delts", "triceps"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "덤벨 플라이 (Dumbbell Fly)": {
        name_ko: "덤벨 플라이", name_en: "Dumbbell Fly",
        searchTerms: ["덤벨", "플라이", "dumbbell", "fly"],
        category: "Chest", type: "Isolation",
        muscles: { primary: ["chest"], secondary: [], muscleGroup: "chest" },
        rest: 90, target: "10-15", sets: 3
    },
    "딥스 (Chest Dips)": {
        name_ko: "딥스", name_en: "Chest Dips",
        searchTerms: ["딥스", "dips", "chest"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["lower_chest"], secondary: ["triceps", "front_delts"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "펙덱 플라이 (Pec Deck Fly)": {
        name_ko: "펙덱 플라이", name_en: "Pec Deck Fly",
        searchTerms: ["펙덱", "pec", "deck", "fly", "machine"],
        category: "Chest", type: "Isolation",
        muscles: { primary: ["chest"], secondary: [], muscleGroup: "chest" },
        rest: 75, target: "12-15", sets: 3
    },
    "체스트 프레스 머신 (Chest Press Machine)": {
        name_ko: "체스트 프레스 머신", name_en: "Chest Press Machine",
        searchTerms: ["체스트", "프레스", "머신", "chest", "press", "machine"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["chest"], secondary: ["triceps", "front_delts"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "인클라인 덤벨 플라이 (Incline Dumbbell Fly)": {
        name_ko: "인클라인 덤벨 플라이", name_en: "Incline Dumbbell Fly",
        searchTerms: ["인클라인", "덤벨", "플라이", "incline", "fly"],
        category: "Chest", type: "Isolation",
        muscles: { primary: ["upper_chest"], secondary: [], muscleGroup: "chest" },
        rest: 90, target: "10-15", sets: 3
    },
    "케이블 크로스오버 (Cable Crossover)": {
        name_ko: "케이블 크로스오버", name_en: "Cable Crossover",
        searchTerms: ["케이블", "크로스오버", "cable", "crossover"],
        category: "Chest", type: "Isolation",
        muscles: { primary: ["chest"], secondary: [], muscleGroup: "chest" },
        rest: 75, target: "12-15", sets: 3
    },
    "스미스 머신 벤치 (Smith Machine Bench)": {
        name_ko: "스미스 머신 벤치", name_en: "Smith Machine Bench Press",
        searchTerms: ["스미스", "머신", "벤치", "smith", "machine"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["chest"], secondary: ["triceps", "front_delts"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },

    // ===== BACK (등) - 20 exercises =====
    "풀업 (Pull-up)": {
        name_ko: "풀업", name_en: "Pull-up",
        searchTerms: ["풀업", "턱걸이", "pull", "up", "pullup"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats"], secondary: ["biceps", "rear_delts"], muscleGroup: "back" },
        rest: 150, target: "Max", sets: 3
    },
    "어시스트 풀업 (Assist Pull-up)": {
        name_ko: "어시스트 풀업", name_en: "Assist Pull-up",
        searchTerms: ["어시스트", "풀업", "assist", "pullup", "machine"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats"], secondary: ["biceps", "rear_delts"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 4
    },
    "친업 (Chin-up)": {
        name_ko: "친업", name_en: "Chin-up",
        searchTerms: ["친업", "chin", "up", "chinup"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "biceps"], secondary: ["rear_delts"], muscleGroup: "back" },
        rest: 150, target: "Max", sets: 3
    },
    "랫 풀다운 (Lat Pulldown)": {
        name_ko: "랫 풀다운", name_en: "Lat Pulldown",
        searchTerms: ["랫", "풀다운", "lat", "pulldown"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats"], secondary: ["biceps", "rear_delts"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 3
    },
    "바벨 로우 (Barbell Row)": {
        name_ko: "바벨 로우", name_en: "Barbell Row",
        searchTerms: ["바벨", "로우", "barbell", "row", "bent"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps", "rear_delts"], muscleGroup: "back" },
        rest: 150, target: "8-12", sets: 4
    },
    "덤벨 로우 (Dumbbell Row)": {
        name_ko: "덤벨 로우", name_en: "Dumbbell Row",
        searchTerms: ["덤벨", "로우", "dumbbell", "row", "one", "arm"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps", "rear_delts"], muscleGroup: "back" },
        rest: 90, target: "8-12", sets: 3
    },
    "시티드 로우 (Seated Row)": {
        name_ko: "시티드 로우", name_en: "Seated Row",
        searchTerms: ["시티드", "로우", "seated", "row", "cable"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 3
    },
    "데드리프트 (Deadlift)": {
        name_ko: "데드리프트", name_en: "Deadlift",
        searchTerms: ["데드리프트", "deadlift", "dl"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lower_back", "glutes", "hamstrings"], secondary: ["traps", "lats"], muscleGroup: "back" },
        rest: 180, target: "3-6", sets: 3
    },
    "페이스 풀 (Face Pull)": {
        name_ko: "페이스 풀", name_en: "Face Pull",
        searchTerms: ["페이스", "풀", "face", "pull"],
        category: "Back", type: "Isolation",
        muscles: { primary: ["rear_delts", "upper_back"], secondary: ["traps"], muscleGroup: "back" },
        rest: 75, target: "12-15", sets: 3
    },
    "리버스 펙덱 플라이 (Reverse Pec Deck Fly)": {
        name_ko: "리버스 펙덱 플라이", name_en: "Reverse Pec Deck Fly",
        searchTerms: ["리버스", "펙덱", "reverse", "pec", "deck", "rear"],
        category: "Back", type: "Isolation",
        muscles: { primary: ["rear_delts"], secondary: ["upper_back"], muscleGroup: "back" },
        rest: 75, target: "12-15", sets: 4
    },
    "T-바 로우 (T-Bar Row)": {
        name_ko: "T-바 로우", name_en: "T-Bar Row",
        searchTerms: ["티바", "로우", "tbar", "row"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 3
    },
    "와이드 그립 랫 풀다운 (Wide Grip Lat Pulldown)": {
        name_ko: "와이드 그립 랫 풀다운", name_en: "Wide Grip Lat Pulldown",
        searchTerms: ["와이드", "그립", "랫", "풀다운", "wide", "grip", "lat"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 3
    },
    "백 익스텐션 (Back Extension)": {
        name_ko: "백 익스텐션", name_en: "Back Extension",
        searchTerms: ["백", "익스텐션", "back", "extension", "hyper"],
        category: "Back", type: "Isolation",
        muscles: { primary: ["lower_back"], secondary: ["glutes", "hamstrings"], muscleGroup: "back" },
        rest: 75, target: "10-15", sets: 3
    },
    "슈러그 (Shrug)": {
        name_ko: "슈러그", name_en: "Shrug",
        searchTerms: ["슈러그", "shrug", "traps", "승모근"],
        category: "Back", type: "Isolation",
        muscles: { primary: ["traps"], secondary: [], muscleGroup: "back" },
        rest: 75, target: "12-15", sets: 3
    },

    // ===== SHOULDER (어깨) - 10 exercises =====
    "오버헤드 프레스 (Overhead Press)": {
        name_ko: "오버헤드 프레스", name_en: "Overhead Press",
        searchTerms: ["오버헤드", "프레스", "shoulder", "press", "ohp"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps"], muscleGroup: "shoulder" },
        rest: 150, target: "6-10", sets: 4
    },
    "래터럴 레이즈 (Lateral Raise)": {
        name_ko: "래터럴 레이즈", name_en: "Lateral Raise",
        searchTerms: ["래터럴", "레이즈", "lateral", "raise", "side", "delt"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["side_delts"], secondary: [], muscleGroup: "shoulder" },
        rest: 60, target: "12-20", sets: 3
    },
    "페이스 풀 어깨 (Face Pull)": {
        name_ko: "페이스 풀", name_en: "Face Pull",
        searchTerms: ["페이스", "풀", "face", "pull", "rear"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["rear_delts"], secondary: ["traps"], muscleGroup: "shoulder" },
        rest: 75, target: "12-15", sets: 3
    },
    "덤벨 숄더 프레스 (Dumbbell Shoulder Press)": {
        name_ko: "덤벨 숄더 프레스", name_en: "Dumbbell Shoulder Press",
        searchTerms: ["덤벨", "숄더", "프레스", "dumbbell", "shoulder"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts"], secondary: ["triceps"], muscleGroup: "shoulder" },
        rest: 120, target: "8-12", sets: 3
    },
    "스탠딩 덤벨 숄더 프레스 (Standing DB Shoulder Press)": {
        name_ko: "스탠딩 덤벨 숄더 프레스", name_en: "Standing DB Shoulder Press",
        searchTerms: ["스탠딩", "덤벨", "숄더", "standing", "dumbbell", "shoulder"],
        category: "Shoulders", type: "Compound",
        muscles: { primary: ["front_delts", "side_delts", "core"], secondary: ["triceps"], muscleGroup: "shoulder" },
        rest: 120, target: "8-12", sets: 3
    },
    "프론트 레이즈 (Front Raise)": {
        name_ko: "프론트 레이즈", name_en: "Front Raise",
        searchTerms: ["프론트", "레이즈", "front", "raise"],
        category: "Shoulders", type: "Isolation",
        muscles: { primary: ["front_delts"], secondary: [], muscleGroup: "shoulder" },
        rest: 60, target: "12-15", sets: 3
    },

    // ===== BICEPS (이두) - 5 exercises =====
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
    "케이블 컬 (Cable Curl)": {
        name_ko: "케이블 컬", name_en: "Cable Curl",
        searchTerms: ["케이블", "컬", "cable", "curl"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["biceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 4
    },

    // ===== TRICEPS (삼두) - 5 exercises =====
    "트라이셉 푸시다운 (Tricep Pushdown)": {
        name_ko: "트라이셉 푸시다운", name_en: "Tricep Pushdown",
        searchTerms: ["트라이셉", "푸시다운", "tricep", "pushdown"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },
    "클로즈 그립 벤치 (Close Grip Bench)": {
        name_ko: "클로즈 그립 벤치", name_en: "Close Grip Bench Press",
        searchTerms: ["클로즈", "그립", "벤치", "close", "grip", "tricep"],
        category: "Arms", type: "Compound",
        muscles: { primary: ["triceps"], secondary: ["chest"], muscleGroup: "arm" },
        rest: 120, target: "6-10", sets: 3
    },
    "오버헤드 익스텐션 (Overhead Extension)": {
        name_ko: "오버헤드 익스텐션", name_en: "Overhead Tricep Extension",
        searchTerms: ["오버헤드", "익스텐션", "overhead", "tricep", "extension"],
        category: "Arms", type: "Isolation",
        muscles: { primary: ["triceps"], secondary: [], muscleGroup: "arm" },
        rest: 75, target: "10-15", sets: 3
    },

    // ===== LEGS (다리) - 10 exercises =====
    "바벨 스쿼트 (Barbell Squat)": {
        name_ko: "바벨 스쿼트", name_en: "Barbell Squat",
        searchTerms: ["바벨", "스쿼트", "barbell", "squat"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings", "core"], muscleGroup: "leg" },
        rest: 180, target: "5-8", sets: 4
    },
    "스미스 머신 스쿼트 (Smith Machine Squat)": {
        name_ko: "스미스 머신 스쿼트", name_en: "Smith Machine Squat",
        searchTerms: ["스미스", "스쿼트", "smith", "squat"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"], muscleGroup: "leg" },
        rest: 150, target: "8-12", sets: 4
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
    "루마니안 데드리프트 (Romanian Deadlift)": {
        name_ko: "루마니안 데드리프트", name_en: "Romanian Deadlift",
        searchTerms: ["루마니안", "데드리프트", "romanian", "rdl"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["hamstrings", "glutes"], secondary: ["lower_back"], muscleGroup: "leg" },
        rest: 150, target: "6-10", sets: 3
    },
    "카프 레이즈 (Calf Raise)": {
        name_ko: "카프 레이즈", name_en: "Calf Raise",
        searchTerms: ["카프", "레이즈", "calf", "raise"],
        category: "Legs", type: "Isolation",
        muscles: { primary: ["calves"], secondary: [], muscleGroup: "leg" },
        rest: 60, target: "15-20", sets: 3
    },
    "런지 (Lunge)": {
        name_ko: "런지", name_en: "Lunge",
        searchTerms: ["런지", "lunge"],
        category: "Legs", type: "Compound",
        muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"], muscleGroup: "leg" },
        rest: 90, target: "10-15", sets: 3
    },

    // ===== CORE (코어) - 5 exercises =====
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
    "행잉 니 레이즈 (Hanging Knee Raise)": {
        name_ko: "행잉 니 레이즈", name_en: "Hanging Knee Raise",
        searchTerms: ["행잉", "니", "레이즈", "hanging", "knee", "raise"],
        category: "Core", type: "Compound",
        muscles: { primary: ["abs", "hip_flexors"], secondary: [], muscleGroup: "core" },
        rest: 75, target: "10-15", sets: 3
    },

    "Mobility": { category: "Flexibility", type: "Time", rest: 0, target: "5 min", sets: 1 }
};

// 3. Cardio Database
const CARDIO_DB = {
    "러닝 (Running)": {
        name_ko: "러닝", name_en: "Running",
        category: "Cardio", icon: "footprints", met: 9.8
    },
    "트레드밀 (Treadmill)": {
        name_ko: "트레드밀", name_en: "Treadmill",
        category: "Cardio", icon: "footprints", met: 9.0
    },
    "사이클 (Cycling)": {
        name_ko: "사이클", name_en: "Cycling",
        category: "Cardio", icon: "bike", met: 7.5
    },
    "계단 오르기 (Stair Climber)": {
        name_ko: "계단 오르기", name_en: "Stair Climber",
        category: "Cardio", icon: "trending-up", met: 9.0
    },
    "테니스 (Tennis)": {
        name_ko: "테니스", name_en: "Tennis",
        category: "Sports", icon: "activity", met: 7.3
    },
    "축구 (Soccer)": {
        name_ko: "축구", name_en: "Soccer",
        category: "Sports", icon: "activity", met: 7.0
    },
    "농구 (Basketball)": {
        name_ko: "농구", name_en: "Basketball",
        category: "Sports", icon: "activity", met: 8.0
    },
    "줄넘기 (Jump Rope)": {
        name_ko: "줄넘기", name_en: "Jump Rope",
        category: "Cardio", icon: "activity", met: 10.0
    },
    "걷기 (Walking)": {
        name_ko: "걷기", name_en: "Walking",
        category: "Cardio", icon: "footprints", met: 3.5
    }
};

// 4. Food Database (Same as before)
// 4. Food Database (Expanded)
// 4. Food Database (V17 Global Expanded)
const FOOD_DB = {
    // 1. 탄수화물 (밥/빵/면) - V21: Added sodium
    "쌀밥 (White Rice)": { unit: "공기", cal: 300, pro: 6, fat: 0.5, carbo: 65, sodium: 5, default_g: 210, category: "밥/빵/면" },
    "현미밥 (Brown Rice)": { unit: "공기", cal: 290, pro: 7, fat: 2, carbo: 60, sodium: 10, default_g: 210, category: "밥/빵/면" },
    "잡곡밥 (Mixed Grain Rice)": { unit: "공기", cal: 310, pro: 8, fat: 1.5, carbo: 62, sodium: 8, default_g: 210, category: "밥/빵/면" },
    "식빵 (White Bread)": { unit: "쪽", cal: 100, pro: 3, fat: 1.5, carbo: 18, sodium: 180, default_g: 40, category: "밥/빵/면" },
    "베이글 (Bagel)": { unit: "개", cal: 250, pro: 10, fat: 1.5, carbo: 48, sodium: 480, default_g: 100, category: "밥/빵/면" },
    "고구마 (Sweet Potato)": { unit: "개", cal: 130, pro: 2, fat: 0.2, carbo: 30, sodium: 55, default_g: 150, category: "밥/빵/면" },
    "라면 (Ramyun)": { unit: "봉지", cal: 500, pro: 10, fat: 16, carbo: 79, sodium: 1800, default_g: 120, category: "밥/빵/면" },
    "파스타 (Pasta)": { unit: "인분", cal: 400, pro: 14, fat: 8, carbo: 65, sodium: 650, default_g: 250, category: "밥/빵/면" },

    // 2. 단백질 (고기/계란/콩) - V21: Added sodium
    "닭가슴살 (Chicken Breast)": { unit: "팩", cal: 165, pro: 31, fat: 3.6, carbo: 0, sodium: 75, default_g: 100, category: "단백질" },
    "계란 (Boiled Egg)": { unit: "개", cal: 70, pro: 6, fat: 5, carbo: 0.5, sodium: 70, default_g: 50, category: "단백질" },
    "소고기 (Beef)": { unit: "g", cal: 250, pro: 26, fat: 15, carbo: 0, sodium: 65, default_g: 100, category: "단백질" },
    "돼지고기 (Pork Belly)": { unit: "g", cal: 330, pro: 17, fat: 28, carbo: 0, sodium: 58, default_g: 100, category: "단백질" },
    "연어 (Salmon)": { unit: "g", cal: 208, pro: 20, fat: 13, carbo: 0, sodium: 59, default_g: 100, category: "단백질" },
    "두부 (Tofu)": { unit: "모", cal: 240, pro: 24, fat: 15, carbo: 6, sodium: 14, default_g: 300, category: "단백질" },
    "프로틴 쉐이크 (Shake)": { unit: "스쿱", cal: 120, pro: 24, fat: 1, carbo: 3, sodium: 150, default_g: 30, category: "단백질" },

    // V21: All foods now include sodium (mg) for health tracking
    // 3. 한식 (Korean) - Expanded
    "김치찌개 (Kimchi Stew)": { unit: "인분", cal: 250, pro: 15, fat: 12, carbo: 15, sodium: 1200, default_g: 400, category: "한식" },
    "된장찌개 (Soy Stew)": { unit: "인분", cal: 180, pro: 12, fat: 6, carbo: 18, sodium: 1100, default_g: 400, category: "한식" },
    "비빔밥 (Bibimbap)": { unit: "그릇", cal: 550, pro: 20, fat: 15, carbo: 85, sodium: 900, default_g: 500, category: "한식" },
    "김밥 (Gimbap)": { unit: "줄", cal: 350, pro: 10, fat: 8, carbo: 60, sodium: 800, default_g: 250, category: "한식" },
    "떡볶이 (Tteokbokki)": { unit: "인분", cal: 600, pro: 10, fat: 12, carbo: 110, sodium: 1500, default_g: 300, category: "한식" },
    "불고기 (Bulgogi)": { unit: "인분", cal: 400, pro: 30, fat: 18, carbo: 20, sodium: 950, default_g: 200, category: "한식" },
    "미역국 (Seaweed Soup)": { unit: "그릇", cal: 80, pro: 5, fat: 4, carbo: 6, sodium: 850, default_g: 300, category: "한식" },
    "갈비찜 (Braised Ribs)": { unit: "인분", cal: 480, pro: 28, fat: 25, carbo: 30, sodium: 1100, default_g: 350, category: "한식" },
    "삼계탕 (Ginseng Chicken Soup)": { unit: "그릇", cal: 700, pro: 45, fat: 35, carbo: 40, sodium: 1300, default_g: 800, category: "한식" },
    "순두부찌개 (Soft Tofu Stew)": { unit: "그릇", cal: 220, pro: 18, fat: 10, carbo: 12, sodium: 1050, default_g: 400, category: "한식" },
    "잡채 (Japchae)": { unit: "접시", cal: 350, pro: 8, fat: 10, carbo: 60, sodium: 700, default_g: 250, category: "한식" },
    "닭갈비 (Spicy Chicken)": { unit: "인분", cal: 450, pro: 32, fat: 20, carbo: 25, sodium: 1200, default_g: 300, category: "한식" },
    "칼국수 (Noodle Soup)": { unit: "그릇", cal: 400, pro: 14, fat: 8, carbo: 70, sodium: 1400, default_g: 450, category: "한식" },
    "만두 (Dumplings)": { unit: "개", cal: 45, pro: 3, fat: 2, carbo: 5, sodium: 120, default_g: 25, category: "한식" },
    "군만두 (Pan-Fried Dumplings)": { unit: "개", cal: 55, pro: 3, fat: 3, carbo: 5, sodium: 130, default_g: 25, category: "한식" },
    "찐만두 (Steamed Dumplings)": { unit: "개", cal: 40, pro: 3, fat: 1.5, carbo: 5, sodium: 115, default_g: 25, category: "한식" },
    "라볶이 (Ramyun Tteokbokki)": { unit: "인분", cal: 750, pro: 15, fat: 18, carbo: 125, sodium: 2000, default_g: 400, category: "한식" },
    "국밥 (Rice Soup)": { unit: "그릇", cal: 520, pro: 25, fat: 15, carbo: 65, sodium: 1350, default_g: 500, category: "한식" },

    // 4. 중식 (Chinese)
    "짜장면 (Jajangmyeon)": { unit: "그릇", cal: 680, pro: 18, fat: 20, carbo: 100, sodium: 1800, default_g: 550, category: "중식" },
    "짬뽕 (Jjamppong)": { unit: "그릇", cal: 550, pro: 25, fat: 15, carbo: 75, sodium: 2200, default_g: 550, category: "중식" },
    "탕수육 (Sweet & Sour Pork)": { unit: "접시", cal: 850, pro: 30, fat: 40, carbo: 90, sodium: 1100, default_g: 400, category: "중식" },
    "마파두부 (Mapo Tofu)": { unit: "접시", cal: 320, pro: 18, fat: 20, carbo: 15, sodium: 1450, default_g: 300, category: "중식" },
    "양장피 (Yangjangpi)": { unit: "접시", cal: 280, pro: 12, fat: 10, carbo: 35, sodium: 950, default_g: 250, category: "중식" },
    "깐풍기 (Dry Fried Chicken)": { unit: "접시", cal: 720, pro: 35, fat: 35, carbo: 60, sodium: 1300, default_g: 350, category: "중식" },
    "팔보채 (Palbochae)": { unit: "접시", cal: 380, pro: 20, fat: 15, carbo: 40, sodium: 1150, default_g: 300, category: "중식" },
    "유산슬 (Yusanseul)": { unit: "접시", cal: 420, pro: 22, fat: 18, carbo: 45, sodium: 1250, default_g: 300, category: "중식" },
    "볶음밥 (Fried Rice)": { unit: "접시", cal: 520, pro: 15, fat: 18, carbo: 75, sodium: 980, default_g: 350, category: "중식" },
    "중국식 만두 (Chinese Dumpling)": { unit: "개", cal: 50, pro: 3.5, fat: 2.5, carbo: 5, sodium: 140, default_g: 30, category: "중식" },

    // 5. 일식 (Japanese)
    "초밥 (Sushi)": { unit: "개", cal: 50, pro: 3, fat: 0.5, carbo: 8, sodium: 120, default_g: 25, category: "일식" },
    "라멘 (Ramen)": { unit: "그릇", cal: 450, pro: 18, fat: 15, carbo: 60, sodium: 1900, default_g: 450, category: "일식" },
    "돈카츠 (Tonkatsu)": { unit: "접시", cal: 650, pro: 28, fat: 35, carbo: 50, sodium: 850, default_g: 300, category: "일식" },
    "우동 (Udon)": { unit: "그릇", cal: 380, pro: 12, fat: 4, carbo: 75, sodium: 1500, default_g: 400, category: "일식" },
    "소바 (Soba)": { unit: "그릇", cal: 320, pro: 14, fat: 2, carbo: 65, sodium: 950, default_g: 350, category: "일식" },
    "규동 (Gyudon)": { unit: "그릇", cal: 620, pro: 28, fat: 22, carbo: 75, sodium: 1250, default_g: 450, category: "일식" },
    "카레라이스 (Curry Rice)": { unit: "접시", cal: 580, pro: 20, fat: 18, carbo: 85, sodium: 980, default_g: 400, category: "일식" },
    "오니기리 (Onigiri)": { unit: "개", cal: 180, pro: 4, fat: 1, carbo: 38, sodium: 320, default_g: 100, category: "일식" },
    "타코야키 (Takoyaki)": { unit: "개", cal: 35, pro: 2, fat: 1.5, carbo: 4, sodium: 95, default_g: 20, category: "일식" },
    "텐동 (Tendon)": { unit: "그릇", cal: 680, pro: 22, fat: 28, carbo: 85, sodium: 1100, default_g: 450, category: "일식" },

    // 6. 양식/패스트푸드
    "피자 (Pizza)": { unit: "조각", cal: 280, pro: 12, fat: 10, carbo: 35, default_g: 100, category: "양식/패스트푸드" },
    "햄버거 (Burger)": { unit: "개", cal: 550, pro: 25, fat: 30, carbo: 45, default_g: 250, category: "양식/패스트푸드" },
    "치킨 (Fried Chicken)": { unit: "조각", cal: 250, pro: 15, fat: 15, carbo: 10, default_g: 100, category: "양식/패스트푸드" },
    "감자튀김 (Fries)": { unit: "개", cal: 300, pro: 3, fat: 15, carbo: 40, default_g: 100, category: "양식/패스트푸드" },
    "샐러드 (Salad Basic)": { unit: "접시", cal: 50, pro: 2, fat: 0, carbo: 10, default_g: 150, category: "양식/패스트푸드" },
    "콥 샐러드 (Cobb Salad)": { unit: "접시", cal: 450, pro: 25, fat: 30, carbo: 15, default_g: 300, category: "양식/패스트푸드" },

    // 5. 과일 (Fruit)
    "사과 (Apple)": { unit: "개", cal: 95, pro: 0.5, fat: 0.3, carbo: 25, default_g: 180, category: "과일/야채" },
    "바나나 (Banana)": { unit: "개", cal: 105, pro: 1.3, fat: 0.3, carbo: 27, default_g: 118, category: "과일/야채" },
    "귤 (Tangerine)": { unit: "개", cal: 40, pro: 0.6, fat: 0.1, carbo: 10, default_g: 80, category: "과일/야채" },
    "배 (Pear)": { unit: "개", cal: 160, pro: 1, fat: 0, carbo: 40, default_g: 300, category: "과일/야채" },
    "방울토마토 (Cherry Tomato)": { unit: "개", cal: 3, pro: 0, fat: 0, carbo: 0.5, default_g: 15, category: "과일/야채" },

    // 6. 음료/간식 (Drink/Snack)
    "아메리카노 (Americano)": { unit: "잔", cal: 5, pro: 0, fat: 0, carbo: 1, default_g: 350, category: "음료/간식" },
    "라떼 (Latte)": { unit: "잔", cal: 150, pro: 8, fat: 6, carbo: 12, default_g: 350, category: "음료/간식" },
    "콜라 (Cola)": { unit: "캔", cal: 140, pro: 0, fat: 0, carbo: 39, default_g: 355, category: "음료/간식" },
    "우유 (Milk)": { unit: "팩", cal: 120, pro: 6, fat: 7, carbo: 9, default_g: 200, category: "음료/간식" },
    "아몬드 (Almonds)": { unit: "줌", cal: 170, pro: 6, fat: 15, carbo: 6, default_g: 30, category: "음료/간식" },
    "요거트 (Yogurt)": { unit: "개", cal: 100, pro: 5, fat: 3, carbo: 12, default_g: 100, category: "음료/간식" },
    "과자 (Snack Bag)": { unit: "봉지", cal: 400, pro: 4, fat: 25, carbo: 50, default_g: 80, category: "음료/간식" },

    // Additional Fruits
    "오렌지 (Orange)": { unit: "개", cal: 62, pro: 1.2, fat: 0.2, carbo: 15, default_g: 140, category: "과일/야채" },
    "포도 (Grapes)": { unit: "송이", cal: 104, pro: 1.1, fat: 0.2, carbo: 27, default_g: 150, category: "과일/야채" },
    "딸기 (Strawberry)": { unit: "g", cal: 32, pro: 0.7, fat: 0.3, carbo: 7.7, default_g: 100, category: "과일/야채" },
    "수박 (Watermelon)": { unit: "g", cal: 30, pro: 0.6, fat: 0.2, carbo: 7.6, default_g: 100, category: "과일/야채" },
    "자두 (Plum)": { unit: "개", cal: 30, pro: 0.5, fat: 0.2, carbo: 7.5, default_g: 70, category: "과일/야채" },
    "복숭아 (Peach)": { unit: "개", cal: 59, pro: 1.4, fat: 0.4, carbo: 14, default_g: 150, category: "과일/야채" },
    "망고 (Mango)": { unit: "개", cal: 135, pro: 1.1, fat: 0.6, carbo: 35, default_g: 200, category: "과일/야채" },
    "키위 (Kiwi)": { unit: "개", cal: 42, pro: 0.8, fat: 0.4, carbo: 10, default_g: 70, category: "과일/야채" },
    "블루베리 (Blueberry)": { unit: "g", cal: 57, pro: 0.7, fat: 0.3, carbo: 14, default_g: 100, category: "과일/야채" },
    "파인애플 (Pineapple)": { unit: "g", cal: 50, pro: 0.5, fat: 0.1, carbo: 13, default_g: 100, category: "과일/야채" },
    "멜론 (Melon)": { unit: "g", cal: 34, pro: 0.8, fat: 0.2, carbo: 8, default_g: 100, category: "과일/야채" },

    // Additional Vegetables
    "토마토 (Tomato)": { unit: "개", cal: 22, pro: 1.1, fat: 0.2, carbo: 4.8, default_g: 120, category: "과일/야채" },
    "오이 (Cucumber)": { unit: "개", cal: 16, pro: 0.7, fat: 0.1, carbo: 3.6, default_g: 100, category: "과일/야채" },
    "당근 (Carrot)": { unit: "개", cal: 41, pro: 0.9, fat: 0.2, carbo: 10, default_g: 100, category: "과일/야채" },
    "브로콜리 (Broccoli)": { unit: "g", cal: 34, pro: 2.8, fat: 0.4, carbo: 7, default_g: 100, category: "과일/야채" },
    "시금치 (Spinach)": { unit: "g", cal: 23, pro: 2.9, fat: 0.4, carbo: 3.6, default_g: 100, category: "과일/야채" },
    "상추 (Lettuce)": { unit: "g", cal: 15, pro: 1.4, fat: 0.2, carbo: 2.9, default_g: 100, category: "과일/야채" },
    "양파 (Onion)": { unit: "개", cal: 40, pro: 1.1, fat: 0.1, carbo: 9.3, default_g: 100, category: "과일/야채" },
    "파프리카 (Bell Pepper)": { unit: "개", cal: 31, pro: 1, fat: 0.3, carbo: 7, default_g: 120, category: "과일/야채" },

    // Additional Protein
    "새우 (Shrimp)": { unit: "g", cal: 99, pro: 24, fat: 0.3, carbo: 0.2, default_g: 100, category: "단백질" },
    "참치통조림 (Tuna Can)": { unit: "캔", cal: 128, pro: 28, fat: 0.9, carbo: 0, default_g: 100, category: "단백질" },
    "오징어 (Squid)": { unit: "g", cal: 92, pro: 16, fat: 1.4, carbo: 3.1, default_g: 100, category: "단백질" },
    "고등어 (Mackerel)": { unit: "g", cal: 205, pro: 19, fat: 14, carbo: 0, default_g: 100, category: "단백질" },
    "삼겹살 (Pork Belly)": { unit: "g", cal: 518, pro: 9.3, fat: 53, carbo: 0, default_g: 100, category: "단백질" },
    "목살 (Pork Neck)": { unit: "g", cal: 213, pro: 18, fat: 15, carbo: 0, default_g: 100, category: "단백질" },

    // Additional Snacks
    "그릭요거트 (Greek Yogurt)": { unit: "bowl", cal: 140, pro: 20, fat: 3, carbo: 9, default_g: 190, category: "음료/간식" },
    "프로틴바 (Protein Bar)": { unit: "개", cal: 200, pro: 20, fat: 7, carbo: 22, default_g: 60, category: "음료/간식" },
    "호두 (Walnut)": { unit: "g", cal: 654, pro: 15, fat: 65, carbo: 14, default_g: 100, category: "음료/간식" },
    "땅콩버터 (Peanut Butter)": { unit: "스푼", cal: 96, pro: 4, fat: 8, carbo: 3.6, default_g: 16, category: "음료/간식" },
    "초콜릿 (Chocolate)": { unit: "g", cal: 546, pro: 4.9, fat: 31, carbo: 61, default_g: 100, category: "음료/간식" },
    "쿠키 (Cookie)": { unit: "개", cal: 140, pro: 2, fat: 7, carbo: 18, default_g: 30, category: "음료/간식" },
    "사탕 (Candy)": { unit: "개", cal: 25, pro: 0, fat: 0, carbo: 6, default_g: 7, category: "음료/간식" },
    "팝콘 (Popcorn)": { unit: "g", cal: 387, pro: 13, fat: 4.5, carbo: 78, default_g: 100, category: "음료/간식" },
    "아이스크림 (Ice Cream)": { unit: "스쿱", cal: 207, pro: 3.5, fat: 11, carbo: 24, default_g: 100, category: "음료/간식" },
    "두유 (Soy Milk)": { unit: "ml", cal: 54, pro: 3.3, fat: 1.8, carbo: 6, default_g: 100, category: "음료/간식" },
    "오렌지주스 (OJ)": { unit: "ml", cal: 45, pro: 0.7, fat: 0.2, carbo: 10, default_g: 100, category: "음료/간식" },
    "커피 (Coffee)": { unit: "잔", cal: 2, pro: 0.3, fat: 0, carbo: 0, default_g: 240, category: "음료/간식" },
    "에너지바 (Energy Bar)": { unit: "개", cal: 250, pro: 10, fat: 9, carbo: 35, sodium: 180, default_g: 70, category: "음료/간식" },

    // === V21: 소스/드레싱 (NEW CATEGORY) ===
    "클래식 비네그리트 (Vinaigrette)": { unit: "포션", cal: 80, pro: 0, fat: 8.6, carbo: 1, sodium: 30, default_g: 15, category: "소스/드레싱" },
    "랜치 드레싱 (Ranch)": { unit: "포션", cal: 73, pro: 0.4, fat: 7.7, carbo: 1.4, sodium: 135, default_g: 15, category: "소스/드레싱" },
    "시저 드레싱 (Caesar)": { unit: "포션", cal: 78, pro: 0.5, fat: 8.3, carbo: 0.5, sodium: 158, default_g: 15, category: "소스/드레싱" },
    "발사믹 드레싱 (Balsamic)": { unit: "포션", cal: 45, pro: 0, fat: 4, carbo: 3, sodium: 85, default_g: 15, category: "소스/드레싱" },
    "간장 (Soy Sauce)": { unit: "스푼", cal: 8, pro: 0.8, fat: 0, carbo: 0.8, sodium: 879, default_g: 15, category: "소스/드레싱" },
    "고추장 (Gochujang)": { unit: "스푼", cal: 35, pro: 1.5, fat: 0.5, carbo: 7, sodium: 280, default_g: 15, category: "소스/드레싱" },
    "된장 (Doenjang)": { unit: "스푼", cal: 33, pro: 2, fat: 1, carbo: 5, sodium: 350, default_g: 15, category: "소스/드레싱" },
    "케첩 (Ketchup)": { unit: "스푼", cal: 15, pro: 0.2, fat: 0, carbo: 4, sodium: 154, default_g: 15, category: "소스/드레싱" },
    "마요네즈 (Mayo)": { unit: "스푼", cal: 94, pro: 0.1, fat: 10.3, carbo: 0.1, sodium: 88, default_g: 15, category: "소스/드레싱" },
    "머스타드 (Mustard)": { unit: "스푼", cal: 10, pro: 0.6, fat: 0.6, carbo: 1, sodium: 120, default_g: 15, category: "소스/드레싱" },
    "타바스코 (Tabasco)": { unit: "티스푼", cal: 1, pro: 0, fat: 0, carbo: 0, sodium: 35, default_g: 5, category: "소스/드레싱" },
    "참기름 (Sesame Oil)": { unit: "스푼", cal: 120, pro: 0, fat: 14, carbo: 0, sodium: 0, default_g: 14, category: "소스/드레싱" },
    "올리브유 (Olive Oil)": { unit: "스푼", cal: 119, pro: 0, fat: 13.5, carbo: 0, sodium: 0, default_g: 14, category: "소스/드레싱" },
    "칠리소스 (Chili Sauce)": { unit: "스푼", cal: 20, pro: 0.3, fat: 0.1, carbo: 5, sodium: 280, default_g: 15, category: "소스/드레싱" },
    "스리라차 (Sriracha)": { unit: "티스푼", cal: 5, pro: 0, fat: 0, carbo: 1, sodium: 80, default_g: 5, category: "소스/드레싱" },

    // === 한식 추가 (22개 추가, 총 40개) ===
    "김치 (Kimchi)": { unit: "접시", cal: 15, pro: 1, fat: 0.5, carbo: 2, sodium: 498, default_g: 50, category: "한식" },
    "깍두기 (Kkakdugi)": { unit: "접시", cal: 18, pro: 1, fat: 0.3, carbo: 3, sodium: 520, default_g: 50, category: "한식" },
    "무생채 (Radish Salad)": { unit: "접시", cal: 25, pro: 1, fat: 0.5, carbo: 5, sodium: 380, default_g: 70, category: "한식" },
    "계란찜 (Steamed Egg)": { unit: "그릇", cal: 85, pro: 7, fat: 5.5, carbo: 2, sodium: 220, default_g: 120, category: "한식" },
    "LA갈비 (LA Galbi)": { unit: "인분", cal: 550, pro: 35, fat: 38, carbo: 15, sodium: 1100, default_g: 250, category: "한식" },
    "보쌈 (Bossam)": { unit: "인분", cal: 420, pro: 32, fat: 28, carbo: 8, sodium: 980, default_g: 200, category: "한식" },
    "족발 (Jokbal)": { unit: "인분", cal: 480, pro: 30, fat: 35, carbo: 10, sodium: 1250, default_g: 250, category: "한식" },
    "순대 (Sundae)": { unit: "인분", cal: 320, pro: 12, fat: 18, carbo: 28, sodium: 680, default_g: 200, category: "한식" },
    "파전 (Pajeon)": { unit: "접시", cal: 280, pro: 8, fat: 12, carbo: 35, sodium: 620, default_g: 180, category: "한식" },
    "김치전 (Kimchi Jeon)": { unit: "접시", cal: 250, pro: 6, fat: 10, carbo: 32, sodium: 780, default_g: 180, category: "한식" },
    "부침개 (Buchimgae)": { unit: "개", cal: 95, pro: 3, fat: 4, carbo: 12, sodium: 180, default_g: 50, category: "한식" },
    "떡국 (Tteokguk)": { unit: "그릇", cal: 380, pro: 15, fat: 8, carbo: 60, sodium: 1150, default_g: 500, category: "한식" },
    "만둣국 (Manduguk)": { unit: "그릇", cal: 420, pro: 18, fat: 12, carbo: 58, sodium: 1300, default_g: 550, category: "한식" },
    "냉면 (Naengmyeon)": { unit: "그릇", cal: 480, pro: 16, fat: 5, carbo: 95, sodium: 1200, default_g: 600, category: "한식" },
    "막국수 (Makguksu)": { unit: "그릇", cal: 420, pro: 14, fat: 4, carbo: 85, sodium: 980, default_g: 550, category: "한식" },
    "쌈밥 (Ssambap)": { unit: "세트", cal: 520, pro: 22, fat: 15, carbo: 75, sodium: 850, default_g: 400, category: "한식" },
    "육회 (Yukhoe)": { unit: "접시", cal: 180, pro: 24, fat: 8, carbo: 3, sodium: 520, default_g: 120, category: "한식" },
    "간장게장 (Gejang)": { unit: "마리", cal: 220, pro: 28, fat: 10, carbo: 5, sodium: 2800, default_g: 200, category: "한식" },
    "양념게장 (Yangnyeom Gejang)": { unit: "마리", cal: 250, pro: 26, fat: 12, carbo: 8, sodium: 2600, default_g: 200, category: "한식" },
    "해물파전 (Seafood Pajeon)": { unit: "접시", cal: 320, pro: 15, fat: 14, carbo: 35, sodium: 720, default_g: 200, category: "한식" },
    "오징어볶음 (Ojingeo)": { unit: "접시", cal: 280, pro: 22, fat: 12, carbo: 18, sodium: 980, default_g: 200, category: "한식" },
    "제육볶음 (Jeyuk)": { unit: "접시", cal: 400, pro: 28, fat: 24, carbo: 18, sodium: 1100, default_g: 250, category: "한식" },

    // === 중식 추가 (30개 추가, 총 40개) ===
    "깐쇼새우 (Ganso Shrimp)": { unit: "접시", cal: 580, pro: 28, fat: 32, carbo: 42, sodium: 1150, default_g: 300, category: "중식" },
    "라조기 (Laziji)": { unit: "접시", cal: 620, pro: 32, fat: 38, carbo: 35, sodium: 1280, default_g: 300, category: "중식" },
    "마라탕 (Malatang)": { unit: "그릇", cal: 450, pro: 25, fat: 22, carbo: 38, sodium: 2100, default_g: 500, category: "중식" },
    "마라샹궈 (Mala)": { unit: "접시", cal: 680, pro: 30, fat: 42, carbo: 48, sodium: 2300, default_g: 400, category: "중식" },
    "훠궈 (Hotpot)": { unit: "인분", cal: 520, pro: 35, fat: 28, carbo: 32, sodium: 1850, default_g: 450, category: "중식" },
    "꿔바로우 (Guobaorou)": { unit: "접시", cal: 720, pro: 28, fat: 38, carbo: 68, sodium: 980, default_g: 350, category: "중식" },
    "동파육 (Dongpo)": { unit: "접시", cal: 580, pro: 25, fat: 45, carbo: 15, sodium: 1350, default_g: 250, category: "중식" },
    "샤오롱바오 (XLB)": { unit: "개", cal: 45, pro: 3, fat: 2, carbo: 5, sodium: 95, default_g: 25, category: "중식" },
    "교자 (Gyoza)": { unit: "개", cal: 42, pro: 3, fat: 2, carbo: 4.5, sodium: 110, default_g: 22, category: "중식" },
    "춘권 (Spring Roll)": { unit: "개", cal: 85, pro: 3, fat: 4, carbo: 10, sodium: 165, default_g: 45, category: "중식" },
    "완탕 (Wonton)": { unit: "개", cal: 38, pro: 2.5, fat: 1.5, carbo: 4, sodium: 95, default_g: 20, category: "중식" },
    "딤섬 (Dim Sum)": { unit: "개", cal: 55, pro: 3, fat: 2.5, carbo: 6, sodium: 125, default_g: 30, category: "중식" },
    "하카우 (Har Gow)": { unit: "개", cal: 48, pro: 4, fat: 1.5, carbo: 5, sodium: 105, default_g: 25, category: "중식" },
    "슈마이 (Shumai)": { unit: "개", cal: 52, pro: 3.5, fat: 2, carbo: 5.5, sodium: 115, default_g: 28, category: "중식" },
    "차슈 (Char Siu)": { unit: "g", cal: 280, pro: 22, fat: 18, carbo: 8, sodium: 720, default_g: 100, category: "중식" },
    "북경오리 (Peking Duck)": { unit: "접시", cal: 620, pro: 32, fat: 48, carbo: 12, sodium: 950, default_g: 250, category: "중식" },
    "군만두중식 (Potsticker)": { unit: "개", cal: 58, pro: 3.2, fat: 3, carbo: 5, sodium: 135, default_g: 26, category: "중식" },
    "훈툰탕 (Wonton Soup)": { unit: "그릇", cal: 280, pro: 12, fat: 8, carbo: 38, sodium: 1450, default_g: 400, category: "중식" },
    "우육면 (Beef Noodle)": { unit: "그릇", cal: 580, pro: 32, fat: 18, carbo: 72, sodium: 1850, default_g: 550, category: "중식" },
    "잔폰면 (Zhajiang)": { unit: "그릇", cal: 650, pro: 20, fat: 22, carbo: 95, sodium: 1750, default_g: 500, category: "중식" },
    "탄탄면 (Tan Tan Noodles)": { unit: "그릇", cal: 520, pro: 18, fat: 24, carbo: 58, sodium: 1650, default_g: 450, category: "중식" },
    "짬뽕밥 (Jjamppong Rice)": { unit: "그릇", cal: 680, pro: 28, fat: 18, carbo: 95, sodium: 2100, default_g: 600, category: "중식" },
    "울면 (Ulmyeon)": { unit: "그릇", cal: 620, pro: 20, fat: 15, carbo: 98, sodium: 1980, default_g: 550, category: "중식" },
    "쟁반짜장 (Jjangban)": { unit: "접시", cal: 850, pro: 25, fat: 28, carbo: 122, sodium: 2100, default_g: 700, category: "중식" },
    "삼선짜장 (Samseon)": { unit: "그릇", cal: 720, pro: 24, fat: 22, carbo: 105, sodium: 1900, default_g: 580, category: "중식" },
    "고추잡채 (Gochu Japchae)": { unit: "접시", cal: 320, pro: 12, fat: 15, carbo: 35, sodium: 980, default_g: 250, category: "중식" },
    "유니짜장 (Uni Jjajang)": { unit: "그릇", cal: 780, pro: 22, fat: 28, carbo: 110, sodium: 1950, default_g: 600, category: "중식" },
    "울탕면 (Ultang)": { unit: "그릇", cal: 480, pro: 22, fat: 12, carbo: 68, sodium: 1780, default_g: 500, category: "중식" },
    "유린기 (Youlinji)": { unit: "접시", cal: 520, pro: 30, fat: 28, carbo: 32, sodium: 980, default_g: 280, category: "중식" },
    "소룡포 (Xiao Long Bao)": { unit: "개", cal: 47, pro: 3, fat: 2.2, carbo: 5, sodium: 98, default_g: 26, category: "중식" },

    // === 일식 추가 (30개 추가, 총 40개) ===
    "사시미 (Sashimi)": { unit: "접시", cal: 180, pro: 32, fat: 4, carbo: 2, sodium: 180, default_g: 150, category: "일식" },
    "연어초밥 (Salmon Sushi)": { unit: "개", cal: 58, pro: 4, fat: 1.5, carbo: 8, sodium: 125, default_g: 30, category: "일식" },
    "참치초밥 (Tuna Sushi)": { unit: "개", cal: 52, pro: 4.5, fat: 0.5, carbo: 8, sodium: 120, default_g: 30, category: "일식" },
    "새우초밥 (Shrimp Sushi)": { unit: "개", cal: 48, pro: 3.5, fat: 0.3, carbo: 8, sodium: 118, default_g: 28, category: "일식" },
    "장어덮밥 (Unadon)": { unit: "그릇", cal: 580, pro: 28, fat: 18, carbo: 75, sodium: 1150, default_g: 450, category: "일식" },
    "오야코동 (Oyakodon)": { unit: "그릇", cal: 520, pro: 26, fat: 15, carbo: 72, sodium: 1050, default_g: 420, category: "일식" },
    "가츠동 (Katsudon)": { unit: "그릇", cal: 680, pro: 30, fat: 32, carbo: 68, sodium: 1180, default_g: 450, category: "일식" },
    "츠유 (Tsuyu)": { unit: "스푼", cal: 8, pro: 0.6, fat: 0, carbo: 1.5, sodium: 420, default_g: 15, category: "일식" },
    "된장국 (Miso Soup)": { unit: "그릇", cal: 35, pro: 2, fat: 1, carbo: 5, sodium: 650, default_g: 200, category: "일식" },
    "에다마메 (Edamame)": { unit: "접시", cal: 120, pro: 11, fat: 5, carbo: 10, sodium: 5, default_g: 100, category: "일식" },
    "야키토리 (Yakitori)": { unit: "꼬치", cal: 75, pro: 8, fat: 3, carbo: 3, sodium: 220, default_g: 40, category: "일식" },
    "교자일식 (Gyoza)": { unit: "개", cal: 40, pro: 2.8, fat: 1.8, carbo: 4, sodium: 105, default_g: 22, category: "일식" },
    "야끼소바 (Yakisoba)": { unit: "접시", cal: 480, pro: 16, fat: 18, carbo: 62, sodium: 1350, default_g: 400, category: "일식" },
    "오코노미야끼 (Okonomiyaki)": { unit: "개", cal: 420, pro: 18, fat: 20, carbo: 42, sodium: 980, default_g: 300, category: "일식" },
    "모찌 (Mochi)": { unit: "개", cal: 95, pro: 1.5, fat: 0.3, carbo: 22, sodium: 15, default_g: 45, category: "일식" },
    "다이후쿠 (Daifuku)": { unit: "개", cal: 110, pro: 2, fat: 0.5, carbo: 25, sodium: 20, default_g: 50, category: "일식" },
    "도라야키 (Dorayaki)": { unit: "개", cal: 180, pro: 4, fat: 2, carbo: 38, sodium: 120, default_g: 80, category: "일식" },
    "찹쌀떡 (Dango)": { unit: "꼬치", cal: 85, pro: 1, fat: 0.2, carbo: 20, sodium: 5, default_g: 40, category: "일식" },
    "템푸라 (Tempura)": { unit: "개", cal: 75, pro: 3, fat: 4, carbo: 7, sodium: 85, default_g: 35, category: "일식" },
    "새우템푸라 (Ebi Tempura)": { unit: "개", cal: 95, pro: 5, fat: 5, carbo: 8, sodium: 95, default_g: 45, category: "일식" },
    "야채템푸라 (Yasai Tempura)": { unit: "개", cal: 55, pro: 1.5, fat: 3, carbo: 6, sodium: 65, default_g: 30, category: "일식" },
    "차돈 (Chashu Don)": { unit: "그릇", cal: 620, pro: 28, fat: 25, carbo: 70, sodium: 1280, default_g: 450, category: "일식" },
    "치라시스시 (Chirashi)": { unit: "그릇", cal: 480, pro: 32, fat: 8, carbo: 68, sodium: 980, default_g: 400, category: "일식" },
    "이나리스시 (Inari)": { unit: "개", cal: 95, pro: 3, fat: 2.5, carbo: 16, sodium: 280, default_g: 50, category: "일식" },
    "나토 (Natto)": { unit: "팩", cal: 90, pro: 8, fat: 4.5, carbo: 6, sodium: 2, default_g: 50, category: "일식" },
    "토리카라아게 (Karaage)": { unit: "개", cal: 110, pro: 8, fat: 6, carbo: 6, sodium: 220, default_g: 50, category: "일식" },
    "규카츠 (Gyukatsu)": { unit: "접시", cal: 580, pro: 32, fat: 35, carbo: 35, sodium: 780, default_g: 280, category: "일식" },
    "히레카츠 (Hirekatsu)": { unit: "접시", cal: 520, pro: 35, fat: 28, carbo: 32, sodium: 720, default_g: 250, category: "일식" },
    "메밀소바 (Soba)": { unit: "그릇", cal: 295, pro: 13, fat: 1.5, carbo: 61, sodium: 880, default_g: 320, category: "일식" },
    "자루소바 (Zaru Soba)": { unit: "그릇", cal: 280, pro: 12, fat: 1, carbo: 58, sodium: 550, default_g: 300, category: "일식" }
};

// Helper: LocalStorage Wrapper
const Store = {
    get: (key, defaultVal) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    },
    set: (key, val) => {
        localStorage.setItem(key, JSON.stringify(val));
    }
};
