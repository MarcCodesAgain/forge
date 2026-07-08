export const Colors = {
  // Backgrounds
  background: '#080808',
  surface: '#0e0e0e',
  surfaceHigh: '#1a1a1a',
  surfaceHighest: '#222222',
  surfaceBright: '#2a2a2a',

  // Borders
  border: 'rgba(255,255,255,0.05)',
  borderVariant: '#2a2a2a',

  // Text
  text: '#e5e2e1',
  textSecondary: '#c4c6d0',
  textTertiary: '#8e9379',

  // Accent — orange
  accent: '#FF6B00',
  accentDim: 'rgba(255,107,0,0.15)',
  accentGlow: 'rgba(255,107,0,0.3)',

  // Accent — blue
  blue: '#4b8eff',
  blueDim: 'rgba(75,142,255,0.15)',

  // Semantic
  success: '#34C759',
  successDim: 'rgba(52,199,89,0.15)',
  error: '#ffb4ab',
  errorDim: 'rgba(255,180,171,0.15)',

  white: '#ffffff',
  black: '#000000',
};

export const Typography = {
  displayLg: { fontFamily: 'Montserrat_800ExtraBold', fontSize: 48, lineHeight: 56, letterSpacing: -1 },
  headlineLg: { fontFamily: 'Montserrat_700Bold', fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
  headlineMd: { fontFamily: 'Montserrat_700Bold', fontSize: 24, lineHeight: 32 },
  headlineSm: { fontFamily: 'Montserrat_700Bold', fontSize: 20, lineHeight: 28 },
  dataDisplay: { fontFamily: 'Montserrat_700Bold', fontSize: 36, lineHeight: 44, letterSpacing: -0.5 },
  bodyLg: { fontFamily: 'Inter_400Regular', fontSize: 18, lineHeight: 28 },
  bodyMd: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24 },
  labelMd: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20, letterSpacing: 0.7 },
  labelSm: { fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 32,
  xl: 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const GlassCard = {
  backgroundColor: 'rgba(26,26,26,0.6)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.03)',
};

export const OrangeGlow = {
  shadowColor: '#FF6B00',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 12,
};
