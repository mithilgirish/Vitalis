export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  bgCard: string;
  bgCardElevated: string;
  bgSurface: string;
  bgGlass: string;
  bgGlassElevated: string;
  border: string;
  borderActive: string;
  borderSubtle: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;

  esiCrimson: string;
  esiCrimsonGlow: string;
  esiCrimsonBg: string;

  cobaltBlue: string;
  cobaltBlueLight: string;
  cobaltBlueDark: string;
  cobaltBlueGlow: string;
  cobaltBlueBg: string;

  emeraldSafe: string;
  emeraldSafeGlow: string;
  emeraldSafeBg: string;

  redAlarm: string;
  redAlarmGlow: string;
  redAlarmBg: string;

  amberWarning: string;
  amberWarningBg: string;

  mapBg: string;
  mapGrid: string;
  mapRoad: string;
  mapWater: string;
  mapLabel: string;
}

export const THEME_PALETTE: Record<ThemeMode, ThemeColors> = {
  dark: {
    // Apple iOS 18 Charcoal Glass Theme
    bg: '#141519',              // Deep Charcoal Grey Canvas
    bgCard: 'rgba(28, 29, 35, 0.88)',          // Apple Liquid Glass Card
    bgCardElevated: 'rgba(38, 39, 47, 0.94)',  // Specular Raised Glass
    bgSurface: 'rgba(24, 25, 30, 0.75)',
    bgGlass: 'rgba(34, 35, 42, 0.85)',
    bgGlassElevated: 'rgba(44, 45, 54, 0.92)',
    border: 'rgba(255, 255, 255, 0.10)',       // Hairline Specular Glass Border
    borderActive: 'rgba(255, 255, 255, 0.22)', // Focused Border
    borderSubtle: 'rgba(255, 255, 255, 0.05)',

    textPrimary: '#FFFFFF',     // Apple System Crisp White
    textSecondary: '#A1A1A6',   // Apple System Gray
    textMuted: '#6E6E73',       // Apple System Gray 3
    textDim: '#48484A',         // Apple System Gray 4

    esiCrimson: '#FF375F',      // Apple System Pink / Red
    esiCrimsonGlow: 'rgba(255, 55, 95, 0.28)',
    esiCrimsonBg: 'rgba(255, 55, 95, 0.14)',

    cobaltBlue: '#0A84FF',      // Apple System Blue (Dark)
    cobaltBlueLight: '#5AC8FA', // Apple System Teal / Light Blue
    cobaltBlueDark: '#0071E3',
    cobaltBlueGlow: 'rgba(10, 132, 255, 0.28)',
    cobaltBlueBg: 'rgba(10, 132, 255, 0.14)',

    emeraldSafe: '#30D158',     // Apple System Green (Dark)
    emeraldSafeGlow: 'rgba(48, 209, 88, 0.28)',
    emeraldSafeBg: 'rgba(48, 209, 88, 0.14)',

    redAlarm: '#FF453A',        // Apple System Red (Dark)
    redAlarmGlow: 'rgba(255, 69, 58, 0.38)',
    redAlarmBg: '#241215',

    amberWarning: '#FF9F0A',    // Apple System Orange (Dark)
    amberWarningBg: 'rgba(255, 159, 10, 0.16)',

    mapBg: '#121316',
    mapGrid: '#1C1D22',
    mapRoad: '#25262F',
    mapWater: '#162235',
    mapLabel: '#8E8E93',
  },
  light: {
    // Apple iOS 18 Light Liquid Glass Theme
    bg: '#F2F2F7',              // Apple System Grouped Background Light
    bgCard: 'rgba(255, 255, 255, 0.88)',          // Frosted Pure White Glass
    bgCardElevated: 'rgba(255, 255, 255, 0.96)',  // Raised White Surface
    bgSurface: '#E5E5EA',       // Apple System Gray 5
    bgGlass: 'rgba(255, 255, 255, 0.82)',
    bgGlassElevated: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.08)',       // Hairline Sub-pixel Border
    borderActive: 'rgba(0, 0, 0, 0.18)', // Focused Border
    borderSubtle: 'rgba(0, 0, 0, 0.04)',

    textPrimary: '#000000',     // Apple System Label Black
    textSecondary: '#6C6C70',   // Apple System Secondary Label
    textMuted: '#8E8E93',       // Apple System Gray
    textDim: '#AEAEB2',

    esiCrimson: '#D7003A',
    esiCrimsonGlow: 'rgba(215, 0, 58, 0.18)',
    esiCrimsonBg: '#FFE6EC',

    cobaltBlue: '#007AFF',      // Apple System Blue (Light)
    cobaltBlueLight: '#34AADC',
    cobaltBlueDark: '#0051A8',
    cobaltBlueGlow: 'rgba(0, 122, 255, 0.18)',
    cobaltBlueBg: '#EBF4FF',

    emeraldSafe: '#34C759',     // Apple System Green (Light)
    emeraldSafeGlow: 'rgba(52, 199, 89, 0.18)',
    emeraldSafeBg: '#EAF8ED',

    redAlarm: '#FF3B30',        // Apple System Red (Light)
    redAlarmGlow: 'rgba(255, 59, 48, 0.28)',
    redAlarmBg: '#FDF2F2',

    amberWarning: '#FF9500',    // Apple System Orange (Light)
    amberWarningBg: '#FFF7E6',

    mapBg: '#F2F2F7',
    mapGrid: '#E5E5EA',
    mapRoad: '#D1D1D6',
    mapWater: '#D6E4FF',
    mapLabel: '#8E8E93',
  },
};

// Default fallback export for backwards compatibility
export const VITALIS_COLORS = THEME_PALETTE.dark;

export const ERGONOMICS = {
  minTouchTarget: 52,
  buttonHeight: 52,
  sliderHeight: 60,
  radiusSm: 10,
  radiusMd: 16,
  radiusLg: 22,
  radiusXl: 28,
  radiusFull: 9999,
  glassShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const FONT_FAMILY = {
  mono: 'monospace',
};
