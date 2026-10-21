export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  bgCard: string;
  bgCardElevated: string;
  bgSurface: string;
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
    // Apple iOS 18 / Material 3 Dark (OLED Pitch Black & Deep Obsidian)
    bg: '#000000',              // Pure OLED Black
    bgCard: '#121316',          // Apple System Grouped Background
    bgCardElevated: '#1C1D22',  // Apple Elevated Card Surface
    bgSurface: '#16171B',       // Apple Intermediate Surface
    border: 'rgba(255, 255, 255, 0.08)',       // Hairline Apple Glass Border
    borderActive: 'rgba(255, 255, 255, 0.18)', // Focused Border
    borderSubtle: 'rgba(255, 255, 255, 0.04)',

    textPrimary: '#FFFFFF',     // Apple System Crisp White
    textSecondary: '#8E8E93',   // Apple System Gray
    textMuted: '#636366',       // Apple System Gray 3
    textDim: '#48484A',         // Apple System Gray 4

    esiCrimson: '#FF375F',      // Apple System Pink / Red
    esiCrimsonGlow: 'rgba(255, 55, 95, 0.25)',
    esiCrimsonBg: 'rgba(255, 55, 95, 0.12)',

    cobaltBlue: '#0A84FF',      // Apple System Blue (Dark)
    cobaltBlueLight: '#5AC8FA', // Apple System Teal / Light Blue
    cobaltBlueDark: '#0071E3',
    cobaltBlueGlow: 'rgba(10, 132, 255, 0.25)',
    cobaltBlueBg: 'rgba(10, 132, 255, 0.12)',

    emeraldSafe: '#30D158',     // Apple System Green (Dark)
    emeraldSafeGlow: 'rgba(48, 209, 88, 0.25)',
    emeraldSafeBg: 'rgba(48, 209, 88, 0.12)',

    redAlarm: '#FF453A',        // Apple System Red (Dark)
    redAlarmGlow: 'rgba(255, 69, 58, 0.35)',
    redAlarmBg: '#1C0E10',

    amberWarning: '#FF9F0A',    // Apple System Orange (Dark)
    amberWarningBg: 'rgba(255, 159, 10, 0.15)',

    mapBg: '#090A0D',
    mapGrid: '#14161C',
    mapRoad: '#1E212B',
    mapWater: '#0F1A2A',
    mapLabel: '#636366',
  },
  light: {
    // Apple iOS 18 / Material 3 Light (Clean Canvas & Pure White Card)
    bg: '#F2F2F7',              // Apple System Grouped Background Light
    bgCard: '#FFFFFF',          // Pure White Apple Card
    bgCardElevated: '#FBFBFD',  // Subtle Off-White Apple Surface
    bgSurface: '#E5E5EA',       // Apple System Gray 5
    border: 'rgba(0, 0, 0, 0.06)',       // Hairline Sub-pixel Border
    borderActive: 'rgba(0, 0, 0, 0.14)', // Focused Border
    borderSubtle: 'rgba(0, 0, 0, 0.03)',

    textPrimary: '#000000',     // Apple System Label Black
    textSecondary: '#6C6C70',   // Apple System Secondary Label
    textMuted: '#8E8E93',       // Apple System Gray
    textDim: '#AEAEB2',

    esiCrimson: '#D7003A',
    esiCrimsonGlow: 'rgba(215, 0, 58, 0.15)',
    esiCrimsonBg: '#FFE6EC',

    cobaltBlue: '#007AFF',      // Apple System Blue (Light)
    cobaltBlueLight: '#34AADC',
    cobaltBlueDark: '#0051A8',
    cobaltBlueGlow: 'rgba(0, 122, 255, 0.15)',
    cobaltBlueBg: '#EBF4FF',

    emeraldSafe: '#34C759',     // Apple System Green (Light)
    emeraldSafeGlow: 'rgba(52, 199, 89, 0.15)',
    emeraldSafeBg: '#EAF8ED',

    redAlarm: '#FF3B30',        // Apple System Red (Light)
    redAlarmGlow: 'rgba(255, 59, 48, 0.25)',
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
  minTouchTarget: 56, // Minimum 56px height on all primary interactive buttons
  buttonHeight: 56,
  sliderHeight: 64,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
};

export const FONT_FAMILY = {
  mono: 'monospace',
};
