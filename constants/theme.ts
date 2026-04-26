// ============================================================
// CypherAir Design Tokens — converted from Stitch DESIGN.md
// Drop into: constants/theme.ts
// ============================================================

export const Colors = {
  // Surface
  surface: '#f7f9fb',
  surfaceDim: '#d8dadc',
  surfaceBright: '#f7f9fb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  onSurface: '#191c1e',
  onSurfaceVariant: '#42474f',
  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',
  outline: '#737780',
  outlineVariant: '#c3c6d0',
  surfaceTint: '#3a608d',

  // Primary
  primary: '#002546',
  onPrimary: '#ffffff',
  primaryContainer: '#0d3b66',
  onPrimaryContainer: '#81a6d7',
  inversePrimary: '#a4c9fc',
  primaryFixed: '#d3e4ff',
  primaryFixedDim: '#a4c9fc',
  onPrimaryFixed: '#001c38',
  onPrimaryFixedVariant: '#204874',

  // Secondary (Teal)
  secondary: '#006a62',
  onSecondary: '#ffffff',
  secondaryContainer: '#70f8e8',
  onSecondaryContainer: '#007168',
  secondaryFixed: '#70f8e8',
  secondaryFixedDim: '#4fdbcc',
  onSecondaryFixed: '#00201d',
  onSecondaryFixedVariant: '#005049',

  // Tertiary (Green)
  tertiary: '#1c2800',
  onTertiary: '#ffffff',
  tertiaryContainer: '#2e3f00',
  onTertiaryContainer: '#8eaf40',
  tertiaryFixed: '#ccf078',
  tertiaryFixedDim: '#b0d360',
  onTertiaryFixed: '#151f00',
  onTertiaryFixedVariant: '#394d00',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Background
  background: '#f7f9fb',
  onBackground: '#191c1e',
  surfaceVariant: '#e0e3e5',

  // AQI Semantic Colors
  aqiGood: '#10b981',       // Emerald 500
  aqiModerate: '#f59e0b',   // Amber 400
  aqiSensitive: '#f97316',  // Orange 500
  aqiUnhealthy: '#ef4444',  // Red 500
  aqiVeryUnhealthy: '#8b5cf6', // Violet 500
  aqiHazardous: '#7f1d1d',  // Red 900
} as const;

export const Typography = {
  displayAqi: {
    fontFamily: 'Inter_700Bold',
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -2.56,
    fontWeight: '700' as const,
  },
  headlineLg: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '600' as const,
  },
  headlineMd: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 29,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  labelCaps: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0.96,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
} as const;

export const Spacing = {
  base: 8,
  xs: 4,
  sm: 12,
  md: 24,
  lg: 48,
  xl: 64,
  containerPadding: 20,
  gutter: 16,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  card: 32,
  full: 9999,
} as const;
