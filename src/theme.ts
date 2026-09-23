import {
  LucideIcon,
  Leaf,
  CloudRain,
  PawPrint,
  Building2,
  Coffee,
  TrainFront,
  Wrench,
  Activity,
  Music,
} from 'lucide-react-native';

export const colors = {
  // Background gradient (top -> bottom)
  gradientTop: '#A9D2FB',
  gradientBottom: '#E7F1FF',

  accent: '#4A90E2',
  accentDark: '#3B73C4',

  // Frosted glass surfaces
  glass: 'rgba(255, 255, 255, 0.65)',
  glassStrong: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.8)',

  textPrimary: '#2B3A67',
  textSecondary: '#7E8BB0',
  textOnAccent: '#FFFFFF',

  danger: '#E2654A',
  trackInactive: 'rgba(43, 58, 103, 0.12)',

  // Soft pastel fills for accents / category chips
  pastelPink: '#F8C7D8',
  pastelPeach: '#FAD9B6',
  pastelMint: '#C5EAD4',
  pastelLavender: '#DACBF3',
  pastelSky: '#C3DDFB',
  pastelTeal: '#BCE7E2',
  pastelSlate: '#C9D4EC',
  pastelIndigo: '#C7CBF5',
};

export const radii = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const fontSize = {
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 20,
  heading: 28,
  display: 32,
};

// Soft drop shadow shared by glass surfaces.
// boxShadow instead of Android elevation: elevation paints under the whole view,
// so it bleeds through translucent glass backgrounds.
export const shadow = {
  boxShadow: '0px 8px 16px rgba(58, 90, 155, 0.18)',
};

export interface CategoryStyle {
  icon: LucideIcon;
  color: string;
}

export const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  nature: { icon: Leaf, color: colors.pastelMint },
  rain: { icon: CloudRain, color: colors.pastelSky },
  animals: { icon: PawPrint, color: colors.pastelPeach },
  urban: { icon: Building2, color: colors.pastelSlate },
  places: { icon: Coffee, color: colors.pastelLavender },
  transport: { icon: TrainFront, color: colors.pastelTeal },
  things: { icon: Wrench, color: colors.pastelPink },
  noise: { icon: Activity, color: colors.pastelIndigo },
};

const FALLBACK_CATEGORY: CategoryStyle = { icon: Music, color: colors.pastelSky };

export const getCategoryStyle = (categoryId: string): CategoryStyle =>
  CATEGORY_STYLE[categoryId] ?? FALLBACK_CATEGORY;
