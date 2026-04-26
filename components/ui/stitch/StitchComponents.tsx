// ============================================================
// CypherAir Stitch UI — Shared Components
// Drop into: components/ui/stitch/StitchComponents.tsx
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useEffect,
  useRef,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

// ─── Glass Card ─────────────────────────────────────────────
interface GlassCardProps {
  children: React.ReactNode;
  style?: object;
  borderRadius?: number;
}

export function GlassCard({ children, style, borderRadius = Radius.xxl }: GlassCardProps) {
  return (
    <View style={[styles.glassCard, { borderRadius }, style]}>
      {children}
    </View>
  );
}

// ─── AQI Status Badge ────────────────────────────────────────
interface AQIBadgeProps {
  label: string;
  color?: string;
}

export function AQIBadge({ label, color = Colors.aqiGood }: AQIBadgeProps) {
  return (
    <View style={styles.aqiBadge}>
      <View style={[styles.aqiDot, { backgroundColor: color }]} />
      <Text style={styles.aqiBadgeText}>{label}</Text>
    </View>
  );
}

// ─── Parameter Tile ──────────────────────────────────────────
interface ParameterTileProps {
  label: string;
  value: string | number;
  unit: string;
  /** 0–1 fill ratio */
  fill: number;
  fillColor?: string;
}

export function ParameterTile({
  label,
  value,
  unit,
  fill,
  fillColor = Colors.aqiGood,
}: ParameterTileProps) {
  return (
    <GlassCard style={styles.paramTile} borderRadius={Radius.xl}>
      <Text style={styles.paramLabel}>{label}</Text>
      <View style={styles.paramValueRow}>
        <Text style={styles.paramValue}>{value}</Text>
        <Text style={styles.paramUnit}>{unit}</Text>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(fill * 100, 100)}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
    </GlassCard>
  );
}

// ─── Forecast Node ───────────────────────────────────────────
interface ForecastNodeProps {
  time: string;
  aqi: number;
  temp: string;
  dotColor?: string;
  opacity?: number;
}

export function ForecastNode({
  time,
  aqi,
  temp,
  dotColor = Colors.aqiGood,
  opacity = 1,
}: ForecastNodeProps) {
  return (
    <GlassCard style={[styles.forecastNode, { opacity }]} borderRadius={Radius.xl}>
      <Text style={styles.forecastTime}>{time}</Text>
      <View style={[styles.forecastDot, { backgroundColor: dotColor }]} />
      <Text style={styles.forecastAqi}>{aqi}</Text>
      <Text style={styles.forecastTemp}>{temp}</Text>
    </GlassCard>
  );
}

// ─── Advisory Card ───────────────────────────────────────────
interface AdvisoryCardProps {
  icon: string;         // emoji or icon name
  title: string;
  description: string;
  iconBg?: string;
}

export function AdvisoryCard({ icon, title, description, iconBg = '#ccfbf1' }: AdvisoryCardProps) {
  return (
    <GlassCard style={styles.advisoryCard} borderRadius={Radius.card}>
      <View style={[styles.advisoryIconBox, { backgroundColor: iconBg }]}>
        <Text style={styles.advisoryIcon}>{icon}</Text>
      </View>
      <Text style={styles.advisoryTitle}>{title}</Text>
      <Text style={styles.advisoryDesc}>{description}</Text>
    </GlassCard>
  );
}

// ─── Section Header ──────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    padding: Spacing.md,
  },

  // Badge
  aqiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    alignSelf: 'flex-start',
  },
  aqiDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  aqiBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // Parameter
  paramTile: {
    flex: 1,
    padding: Spacing.gutter,
    gap: 2,
  },
  paramLabel: {
    ...Typography.labelCaps,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
  },
  paramValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 4,
  },
  paramValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  paramUnit: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginBottom: 3,
  },
  progressBg: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: Radius.full,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },

  // Forecast Node
  forecastNode: {
    width: 76,
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
  },
  forecastTime: {
    ...Typography.labelCaps,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
  },
  forecastDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  forecastAqi: {
    fontWeight: '700',
    fontSize: 16,
    color: Colors.primary,
  },
  forecastTemp: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },

  // Advisory
  advisoryCard: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  advisoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryIcon: {
    fontSize: 20,
  },
  advisoryTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.onSurface,
  },
  advisoryDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
});
