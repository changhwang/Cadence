export const ROUTINE_TEMPLATES = {
    "Push Day": {
        title: "푸시 (Push)",
        exercises: ["bench_press", "incline_bench_press", "overhead_press", "lateral_raise", "tricep_pushdown"],
        category: "hypertrophy",
        tags: ["push"],
        defaults: { sets: 3, reps: 10, weight: 0, unit: "kg" }
    },
    "Pull Day": {
        title: "풀 (Pull)",
        exercises: ["lat_pulldown", "seated_row", "face_pull", "bicep_curl", "back_extension"],
        category: "hypertrophy",
        tags: ["pull"],
        defaults: { sets: 3, reps: 10, weight: 0, unit: "kg" }
    },
    "Legs Day": {
        title: "하체 (Legs)",
        exercises: ["leg_press", "leg_curl", "romanian_deadlift", "plank", "mobility"],
        category: "strength",
        tags: ["legs"],
        defaults: { sets: 3, reps: 8, weight: 0, unit: "kg" }
    },
    "Full Body A": {
        title: "전신 A (Full Body A)",
        exercises: ["leg_press", "bench_press", "seated_row", "overhead_press", "plank"],
        category: "full_body",
        tags: ["full_body"],
        defaults: { sets: 3, reps: 10, weight: 0, unit: "kg" }
    },
    "Cardio & Core": {
        title: "유산소 & 코어 (Cardio & Core)",
        exercises: ["run", "plank", "crunch"],
        category: "cardio",
        tags: ["cardio", "core"],
        defaults: { sets: 1, reps: 1, weight: 0, unit: "kg" }
    },
    "Upper Body Split": {
        title: "2분할 상체 (2-Day Split Upper)",
        exercises: [
            "hanging_knee_raise",
            "push_up",
            "smith_bench_press",
            "seated_row",
            "assist_pullup",
            "standing_db_press",
            "reverse_pec_deck",
            "cable_curl",
            "tricep_pushdown"
        ],
        category: "hypertrophy",
        tags: ["upper"],
        defaults: { sets: 3, reps: 10, weight: 0, unit: "kg" }
    },
    "Lower Body Split": {
        title: "2분할 하체 (2-Day Split Lower)",
        exercises: [
            "crunch",
            "plank",
            "leg_press",
            "romanian_deadlift",
            "smith_squat",
            "leg_extension",
            "leg_curl"
        ],
        category: "hypertrophy",
        tags: ["lower"],
        defaults: { sets: 3, reps: 10, weight: 0, unit: "kg" }
    }
};
