export const Colors = {
  background: '#FFFFFF',
  surface: '#F5F5F7',
  surfaceSecondary: '#EBEBED',
  border: '#E5E5EA',
  text: '#1C1C1E',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',
  accent: '#5B52E8',
  accentLight: '#EEEDFD',
  success: '#34C759',
  successLight: '#E8F8ED',
  danger: '#FF3B30',
  dangerLight: '#FFECEB',
  white: '#FFFFFF',
};

export const Typography = {
  largeTitle: { fontSize: 28, fontWeight: '700' as const, color: Colors.text },
  title: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  headline: { fontSize: 17, fontWeight: '600' as const, color: Colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.text },
  subhead: { fontSize: 13, fontWeight: '500' as const, color: Colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textTertiary },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};
