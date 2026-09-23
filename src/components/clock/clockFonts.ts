import { Platform } from 'react-native';

export type ClockFontId = 'bebas' | 'oswald';

export interface ClockFont {
  id: ClockFontId;
  name: string;
  descKey: string;
  fontFamily: string;
  // Relative to the card size; mirrors XMSLEEP ClockFont fontSize/verticalOffset tuning.
  sizeRatio: number;
  offsetRatio: number;
}

// The expo-font config plugin copies TTFs as-is: Android resolves them by file name,
// iOS registers them in UIAppFonts and resolves by PostScript name.
export const CLOCK_FONTS: Record<ClockFontId, ClockFont> = {
  bebas: {
    id: 'bebas',
    name: 'Bebas Neue',
    descKey: 'fontBebasNeueDesc',
    fontFamily: Platform.select({ ios: 'BebasNeue-Regular', default: 'BebasNeue' }),
    sizeRatio: 0.78,
    offsetRatio: 0.035,
  },
  oswald: {
    id: 'oswald',
    name: 'Oswald',
    descKey: 'fontOswaldDesc',
    fontFamily: Platform.select({ ios: 'Oswald-Bold', default: 'OswaldBold' }),
    sizeRatio: 0.68,
    offsetRatio: -0.02,
  },
};

export const CLOCK_FONT_IDS = Object.keys(CLOCK_FONTS) as ClockFontId[];
