// V22: Completely Redesigned Exercise Database
// Bilingual support (Korean/English) with muscle tracking

const EXERCISE_DB_V22 = {
    // ===== CHEST (가슴) - 15 exercises =====
    "벤치 프레스 (Barbell Bench Press)": {
        name_ko: "벤치 프레스", name_en: "Barbell Bench Press",
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
    "디클라인 벤치 프레스 (Decline Bench Press)": {
        name_ko: "디클라인 벤치 프레스", name_en: "Decline Bench Press",
        searchTerms: ["디클라인", "decline", "lower", "chest"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["lower_chest"], secondary: ["triceps"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "덤벨 벤치 프레스 (Dumbbell Bench Press)": {
        name_ko: "덤벨 벤치 프레스", name_en: "Dumbbell Bench Press",
        searchTerms: ["덤벨", "벤치", "dumbbell", "db", "chest"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["chest"], secondary: ["front_delts", "triceps"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "덤벨 인클라인 프레스 (Dumbbell Incline Press)": {
        name_ko: "덤벨 인클라인 프레스", name_en: "Dumbbell Incline Press",
        searchTerms: ["덤벨", "인클라인", "dumbbell", "incline"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["upper_chest"], secondary: ["front_delts", "triceps"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "케이블 플라이 (Cable Fly)": {
        name_ko: "케이블 플라이", name_en: "Cable Fly",
        searchTerms: ["케이블", "플라이", "cable", "fly", "chest"],
        category: "Chest", type: "Isolation",
        muscles: { primary: ["chest"], secondary: [], muscleGroup: "chest" },
        rest: 90, target: "12-15", sets: 3
    },
    "덤벨 플라이 (Dumbbell Fly)": {
        name_ko: "덤벨 플라이", name_en: "Dumbbell Fly",
        searchTerms: ["덤벨", "플라이", "dumbbell", "fly"],
        category: "Chest", type: "Isolation",
        muscles: { primary: ["chest"], secondary: [], muscleGroup: "chest" },
        rest: 90, target: "10-15", sets: 3
    },
    "푸시업 (Push-up)": {
        name_ko: "푸시업", name_en: "Push-up",
        searchTerms: ["푸시업", "팔굽혀펴기", "push", "up", "pushup"],
        category: "Chest", type: "Bodyweight",
        muscles: { primary: ["chest"], secondary: ["triceps", "front_delts"], muscleGroup: "chest" },
        rest: 60, target: "Max", sets: 3
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
    "랜드마인 프레스 (Landmine Press)": {
        name_ko: "랜드마인 프레스", name_en: "Landmine Press",
        searchTerms: ["랜드마인", "landmine", "press"],
        category: "Chest", type: "Compound",
        muscles: { primary: ["chest", "front_delts"], secondary: ["triceps"], muscleGroup: "chest" },
        rest: 120, target: "8-12", sets: 3
    },
    "케이블 크로스오버 (Cable Crossover)": {
        name_ko: "케이블 크로스오버", name_en: "Cable Crossover",
        searchTerms: ["케이블", "크로스오버", "cable", "crossover"],
        category: "Chest", type: "Isolation",
        muscles: { primary: ["chest"], secondary: [], muscleGroup: "chest" },
        rest: 75, target: "12-15", sets: 3
    },
    "스미스 머신 벤치 프레스 (Smith Machine Bench Press)": {
        name_ko: "스미스 머신 벤치 프레스", name_en: "Smith Machine Bench Press",
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
    "루마니안 데드리프트 (Romanian Deadlift)": {
        name_ko: "루마니안 데드리프트", name_en: "Romanian Deadlift",
        searchTerms: ["루마니안", "데드리프트", "romanian", "rdl"],
        category: "Back", type: "Compound",
        muscles: { primary: ["hamstrings", "lower_back"], secondary: ["glutes"], muscleGroup: "leg" },
        rest: 150, target: "6-10", sets: 3
    },
    "페이스 풀 (Face Pull)": {
        name_ko: "페이스 풀", name_en: "Face Pull",
        searchTerms: ["페이스", "풀", "face", "pull"],
        category: "Back", type: "Isolation",
        muscles: { primary: ["rear_delts", "upper_back"], secondary: ["traps"], muscleGroup: "back" },
        rest: 75, target: "12-15", sets: 3
    },
    "T-바 로우 (T-Bar Row)": {
        name_ko: "T-바 로우", name_en: "T-Bar Row",
        searchTerms: ["티바", "로우", "tbar", "row"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 3
    },
    "벤트오버 로우 (Bent-Over Row)": {
        name_ko: "벤트오버 로우", name_en: "Bent-Over Row",
        searchTerms: ["벤트", "오버", "로우", "bent", "over", "row"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps", "lower_back"], muscleGroup: "back" },
        rest: 150, target: "8-12", sets: 3
    },
    "와이드 그립 랫 풀다운 (Wide Grip Lat Pulldown)": {
        name_ko: "와이드 그립 랫 풀다운", name_en: "Wide Grip Lat Pulldown",
        searchTerms: ["와이드", "그립", "랫", "풀다운", "wide", "grip", "lat"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 3
    },
    "클로즈 그립 랫 풀다운 (Close Grip Lat Pulldown)": {
        name_ko: "클로즈 그립 랫 풀다운", name_en: "Close Grip Lat Pulldown",
        searchTerms: ["클로즈", "그립", "랫", "close", "grip"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 3
    },
    "시티드 케이블 로우 (Seated Cable Row)": {
        name_ko: "시티드 케이블 로우", name_en: "Seated Cable Row",
        searchTerms: ["시티드", "케이블", "로우", "seated", "cable"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 120, target: "8-12", sets: 3
    },
    "백 익스텐션 (Back Extension)": {
        name_ko: "백 익스텐션", name_en: "Back Extension",
        searchTerms: ["백", "익스텐션", "back", "extension", "hyperextension"],
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
    "덤벨 슈러그 (Dumbbell Shrug)": {
        name_ko: "덤벨 슈러그", name_en: "Dumbbell Shrug",
        searchTerms: ["덤벨", "슈러그", "dumbbell", "shrug"],
        category: "Back", type: "Isolation",
        muscles: { primary: ["traps"], secondary: [], muscleGroup: "back" },
        rest: 75, target: "12-15", sets: 3
    },
    "펜들레이 로우 (Pendlay Row)": {
        name_ko: "펜들레이 로우", name_en: "Pendlay Row",
        searchTerms: ["펜들레이", "로우", "pendlay", "row"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 150, target: "6-10", sets: 3
    },
    "인버티드 로우 (Inverted Row)": {
        name_ko: "인버티드 로우", name_en: "Inverted Row",
        searchTerms: ["인버티드", "로우", "inverted", "row", "bodyweight"],
        category: "Back", type: "Compound",
        muscles: { primary: ["lats", "upper_back"], secondary: ["biceps"], muscleGroup: "back" },
        rest: 90, target: "Max", sets: 3
    },
    "랫 프레이어 (Lat Prayer)": {
        name_ko: "랫 프레이어", name_en: "Lat Prayer",
        searchTerms: ["랫", "프레이어", "lat", "prayer", "pullover"],
        category: "Back", type: "Isolation",
        muscles: { primary: ["lats"], secondary: [], muscleGroup: "back" },
        rest: 75, target: "12-15", sets: 3
    }
};

// Continue with SHOULDER, ARM, LEG, CORE exercises...
// This is a partial sample - will create complete file with 100+ exercises
