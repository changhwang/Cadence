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
    "A Bench/Press": {
        title: "A (월/목) Bench/Press",
        exercises: [
            "run",
            "hanging_leg_raise",
            "assist_pullup",
            "smith_bench_press",
            "standing_db_press",
            "cable_lateral_raise",
            "tricep_pushdown",
            "barbell_curl",
            "incline_run"
        ],
        category: "hypertrophy",
        tags: ["upper", "push", "bench"],
        defaults: { sets: 3, reps: 10, weight: 0, unit: "kg" },
        defaultsById: {
            run: { minutes: 5 },
            hanging_leg_raise: { sets: 3, reps: 15, restSec: 75 },
            assist_pullup: { sets: 3, reps: 10, restSec: 120 },
            smith_bench_press: { sets: 4, reps: 12, restSec: 120 },
            standing_db_press: { sets: 3, reps: 10, restSec: 120 },
            cable_lateral_raise: { sets: 3, reps: 20, restSec: 75 },
            tricep_pushdown: { sets: 2, reps: 15, restSec: 75 },
            barbell_curl: { sets: 2, reps: 15, restSec: 75 },
            incline_run: { minutes: 20 }
        }
    },
    "B Rear/Pull": {
        title: "B (화/금) Rear/Pull",
        exercises: [
            "run",
            "hanging_leg_raise",
            "assist_dip",
            "lat_pulldown",
            "seated_row",
            "reverse_pec_deck",
            "cable_lateral_raise",
            "tricep_pushdown",
            "barbell_curl",
            "incline_run"
        ],
        category: "hypertrophy",
        tags: ["upper", "pull", "rear"],
        defaults: { sets: 3, reps: 10, weight: 0, unit: "kg" },
        defaultsById: {
            run: { minutes: 5 },
            hanging_leg_raise: { sets: 3, reps: 15, restSec: 75 },
            assist_dip: { sets: 3, reps: 10, restSec: 120 },
            lat_pulldown: { sets: 3, reps: 12, restSec: 120 },
            seated_row: { sets: 3, reps: 12, restSec: 120 },
            reverse_pec_deck: { sets: 3, reps: 20, restSec: 75 },
            cable_lateral_raise: { sets: 2, reps: 20, restSec: 75 },
            tricep_pushdown: { sets: 2, reps: 15, restSec: 75 },
            barbell_curl: { sets: 2, reps: 15, restSec: 75 },
            incline_run: { minutes: 20 }
        }
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
