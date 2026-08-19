import {
    Apple,
    BarChart2,
    Beaker,
    Droplet,
    Droplets,
    Drumstick,
    Dumbbell,
    Flame,
    LayoutGrid,
    Scale,
    Settings,
    Utensils,
    Wheat,
    Zap,
    createIcons
} from 'lucide';

// 실제로 쓰는 아이콘만 등록한다(전체 세트를 번들에 넣지 않기 위해).
const icons = {
    Apple,
    BarChart2,
    Beaker,
    Droplet,
    Droplets,
    Drumstick,
    Dumbbell,
    Flame,
    LayoutGrid,
    Scale,
    Settings,
    Utensils,
    Wheat,
    Zap
};

// data-lucide 속성이 붙은 <i>를 SVG로 치환한다.
export const renderIcons = () => createIcons({ icons });
