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
    // Charcoal Grey Aesthetic Persona (Automotive & Clinical Dark)
    bg: '#121418',              // Deep Charcoal Grey background
    bgCard: '#1A1D24',          // Charcoal Card panel
    bgCardElevated: '#222630',  // Elevated Charcoal Surface
    bgSurface: '#16181F',       // Intermediate surface
    border: '#282C37',          // Subtle clinical charcoal border
    borderActive: '#3B404F',    // Active / focused border
    borderSubtle: '#1E2129',

    textPrimary: '#F9FAFB',     // Clean clinical crisp white
    textSecondary: '#9CA3AF',   // Charcoal Slate muted text
    textMuted: '#6B7280',       // Low contrast secondary text
    textDim: '#4B5563',

    esiCrimson: '#E11D48',
    esiCrimsonGlow: 'rgba(225, 29, 72, 0.25)',
    esiCrimsonBg: 'rgba(225, 29, 72, 0.15)',

    cobaltBlue: '#3B82F6',
    cobaltBlueLight: '#60A5FA',
    cobaltBlueDark: '#1D4ED8',
    cobaltBlueGlow: 'rgba(59, 130, 246, 0.25)',
    cobaltBlueBg: 'rgba(59, 130, 246, 0.12)',

    emeraldSafe: '#10B981',
    emeraldSafeGlow: 'rgba(16, 185, 129, 0.25)',
    emeraldSafeBg: 'rgba(16, 185, 129, 0.12)',

    redAlarm: '#EF4444',
    redAlarmGlow: 'rgba(239, 68, 68, 0.35)',
    redAlarmBg: '#231114',

    amberWarning: '#F59E0B',
    amberWarningBg: 'rgba(245, 158, 11, 0.15)',

    mapBg: '#121418',
    mapGrid: '#1E222B',
    mapRoad: '#272C38',
    mapWater: '#162238',
    mapLabel: '#6B7280',
  },
  light: {
    // Modern Healthcare Clinical Light Persona (Clean, Sterile, Swiss-inspired)
    bg: '#F8FAFC',              // Clean hospital sterile off-white
    bgCard: '#FFFFFF',          // Pure clinical white card
    bgCardElevated: '#F1F5F9',  // Light grey surface
    bgSurface: '#E2E8F0',       // Hairline backing
    border: '#E2E8F0',          // Hairline clinical border
    borderActive: '#CBD5E1',    // Focused slate border
    borderSubtle: '#F8FAFC',

    textPrimary: '#0F172A',     // Deep medical slate black
    textSecondary: '#475569',   // Slate secondary
    textMuted: '#64748B',       // Muted clinical text
    textDim: '#94A3B8',

    esiCrimson: '#E11D48',
    esiCrimsonGlow: 'rgba(225, 29, 72, 0.15)',
    esiCrimsonBg: '#FFE4E6',

    cobaltBlue: '#2563EB',
    cobaltBlueLight: '#3B82F6',
    cobaltBlueDark: '#1E40AF',
    cobaltBlueGlow: 'rgba(37, 99, 235, 0.15)',
    cobaltBlueBg: '#EFF6FF',

    emeraldSafe: '#059669',
    emeraldSafeGlow: 'rgba(5, 150, 105, 0.15)',
    emeraldSafeBg: '#ECFDF5',

    redAlarm: '#DC2626',
    redAlarmGlow: 'rgba(220, 38, 38, 0.25)',
    redAlarmBg: '#FEF2F2',

    amberWarning: '#D97706',
    amberWarningBg: '#FFFBEB',

    mapBg: '#F1F5F9',
    mapGrid: '#E2E8F0',
    mapRoad: '#CBD5E1',
    mapWater: '#DBEAFE',
    mapLabel: '#64748B',
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
