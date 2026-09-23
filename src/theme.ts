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
  // Background gradient (top -> bottom); warm charcoal instead of pure black to soften contrast at night
  gradientTop: '#16130F',
  gradientBottom: '#211C17',

  accent: '#D4A373',
  accentDark: '#B8895C',

  // Frosted glass surfaces
  glass: 'rgba(58, 50, 42, 0.55)',
  glassStrong: 'rgba(46, 40, 34, 0.94)',
  glassBorder: 'rgba(255, 236, 210, 0.07)',

  textPrimary: '#E8DDCB',
  textSecondary: '#9C8F7C',
  textOnAccent: '#221C16',
  // Light text for saturated fills that aren't the accent (breathing methods, pomodoro break)
  textOnColor: '#F3EADB',

  danger: '#D0785E',
  trackInactive: 'rgba(232, 221, 203, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.55)',
  iconSurface: 'rgba(0, 0, 0, 0.18)',

  // Muted dark fills for category chips / covers
  pastelPink: '#4A3438',
  pastelPeach: '#4D3C2C',
  pastelMint: '#34443A',
  pastelLavender: '#3E3848',
  pastelSky: '#2F3F45',
  pastelTeal: '#2E4340',
  pastelSlate: '#3D3A35',
  pastelIndigo: '#363850',
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
  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.35)',
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
