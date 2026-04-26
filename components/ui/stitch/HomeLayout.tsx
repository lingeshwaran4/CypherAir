// ============================================================
// CypherAir — Stitch Home Screen Layout
// Drop into: components/ui/stitch/HomeLayout.tsx
//
// HOW TO USE in app/(tabs)/index.tsx:
//   1. Keep ALL your existing logic (useState, hooks, fetches)
//   2. Replace only the return(...) with:
//      return <HomeLayout {...yourProps} />;
// ============================================================

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Pressable,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import {
  GlassCard,
  AQIBadge,
  ParameterTile,
  ForecastNode,
  AdvisoryCard,
  SectionHeader,
} from './StitchComponents';

// ─── Types ───────────────────────────────────────────────────
// Wire these from your existing state / API response
export interface AQIData {
  aqi: number;
  status: string;         // e.g. "HEALTHY"
  primaryPollutant: string;
  lastUpdated: string;
  location: string;
}

export interface ForecastPoint {
  time: string;
  aqi: number;
  temp: string;
  dotColor?: string;
  opacity?: number;
}

export interface Parameter {
  label: string;
  value: number;
  unit: string;
  fill: number;           // 0–1
  fillColor?: string;
}

export interface HistoryBar {
  day: string;
  heightPercent: number;  // 0–100
  color: string;
}

export interface HomeLayoutProps {
  aqiData: AQIData;
  forecast: ForecastPoint[];
  parameters: Parameter[];
  history: HistoryBar[];
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  onReportPress?: () => void;
  onHistoryRangeChange?: (range: '7D' | '1M' | '1Y') => void;
  selectedHistoryRange?: '7D' | '1M' | '1Y';
  userAvatar?: string;
}

// ─── Component ───────────────────────────────────────────────
export function HomeLayout({
  aqiData,
  forecast,
  parameters,
  history,
  onSearchPress,
  onMenuPress,
  onReportPress,
  onHistoryRangeChange,
  selectedHistoryRange = '7D',
  userAvatar,
}: HomeLayoutProps) {
  const insets = useSafeAreaInsets();

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // AQI color for the mesh gradient
  const aqiGradient = getAQIGradient(aqiData.aqi);

  return (
    <View style={styles.root}>
      {/* ── Top Nav ─────────────────────────────────────── */}
      <View style={[styles.navbar, { paddingTop: insets.top || 12 }]}>
        <TouchableOpacity onPress={onMenuPress} style={styles.navBtn} activeOpacity={0.7}>
          <Text style={styles.navIcon}>⋮</Text>
        </TouchableOpacity>

        <View style={styles.navBrand}>
          <Text style={styles.navBrandIcon}>💨</Text>
          <Text style={styles.navBrandText}>CypherAir</Text>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity onPress={onSearchPress} style={styles.navBtn} activeOpacity={0.7}>
            <Text style={styles.navIcon}>🔍</Text>
          </TouchableOpacity>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      </View>

      {/* ── Main Scroll ──────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Hero AQI Section ───────────────────────── */}
          <View style={styles.section}>
            {/* Location + Title */}
            <View style={styles.locationRow}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationText}>{aqiData.location}</Text>
            </View>
            <Text style={styles.heroTitle}>Live Conditions</Text>

            {/* AQI Card */}
            <LinearGradient
              colors={aqiGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aqiCard}
            >
              {/* Status Badge */}
              <AQIBadge label={aqiData.status} />

              {/* Big Number */}
              <View style={styles.aqiCenter}>
                <Text style={styles.aqiNumber}>{aqiData.aqi}</Text>
                <Text style={styles.aqiLabel}>CURRENT AQI</Text>
              </View>

              {/* Footer row */}
              <View style={styles.aqiFooter}>
                <View>
                  <Text style={styles.aqiFooterLabel}>Primary Pollutant</Text>
                  <Text style={styles.aqiFooterValue}>{aqiData.primaryPollutant}</Text>
                </View>
                <View style={styles.aqiFooterRight}>
                  <Text style={styles.aqiFooterLabel}>Last Updated</Text>
                  <Text style={styles.aqiFooterValue}>{aqiData.lastUpdated}</Text>
                </View>
              </View>

              {/* Decorative blobs */}
              <View style={styles.decorBlob1} />
              <View style={styles.decorBlob2} />
            </LinearGradient>

            {/* 24-Hour Forecast */}
            <SectionHeader title="24-Hour Air Forecast" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
              <View style={styles.forecastRow}>
                {forecast.map((pt, i) => (
                  <ForecastNode
                    key={i}
                    time={pt.time}
                    aqi={pt.aqi}
                    temp={pt.temp}
                    dotColor={pt.dotColor}
                    opacity={pt.opacity ?? 1}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ── Health Advisory ────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Health Advisory" />

            {/* Cigarette Exposure Card */}
            <View style={styles.cigaretteCard}>
              <View>
                <Text style={styles.cigaretteSubtitle}>Estimated Exposure</Text>
                <Text style={styles.cigaretteValue}>4.2 cigarettes / day</Text>
                <Text style={styles.cigaretteNote}>Based on current air density levels</Text>
              </View>
              <View style={styles.cigaretteIcon}>
                <Text style={{ fontSize: 32 }}>🚬</Text>
              </View>
            </View>

            {/* Bento Advisory Cards */}
            <View style={styles.bentoRow}>
              <AdvisoryCard
                icon="🏃"
                title="Outdoor Exercise"
                description="Perfect conditions for high-intensity training outdoors."
                iconBg="#ccfbf1"
              />
              <View style={{ width: Spacing.sm }} />
              <AdvisoryCard
                icon="🪟"
                title="Ventilation"
                description="Open windows to refresh indoor air circulation."
                iconBg="#dbeafe"
              />
            </View>

            {/* World Report Banner */}
            <Pressable onPress={onReportPress} style={styles.reportBanner}>
              <LinearGradient
                colors={['rgba(13,59,102,0.92)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.reportGradient}
              >
                <Text style={styles.reportEyebrow}>EXCLUSIVE FEATURE</Text>
                <Text style={styles.reportTitle}>World Air Quality{'\n'}Report 2026</Text>
                <Text style={styles.reportCta}>Read Report →</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* ── Detailed Parameters ────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Detailed Parameters" />
            <View style={styles.paramGrid}>
              {parameters.map((p, i) => (
                <View key={i} style={styles.paramCell}>
                  <ParameterTile
                    label={p.label}
                    value={p.value}
                    unit={p.unit}
                    fill={p.fill}
                    fillColor={p.fillColor}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* ── 7-Day History ──────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader
              title="7-Day History"
              right={
                <View style={styles.rangeRow}>
                  {(['7D', '1M', '1Y'] as const).map((r) => (
                    <TouchableOpacity key={r} onPress={() => onHistoryRangeChange?.(r)}>
                      <Text
                        style={[
                          styles.rangeLabel,
                          selectedHistoryRange === r && styles.rangeLabelActive,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              }
            />

            <GlassCard style={styles.chartCard} borderRadius={Radius.card}>
              <View style={styles.chartBars}>
                {history.map((bar, i) => (
                  <View key={i} style={styles.chartBarCol}>
                    <View style={styles.chartBarTrack}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: `${bar.heightPercent}%`,
                            backgroundColor: bar.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartDay}>{bar.day}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── AQI → Gradient Helper ───────────────────────────────────
function getAQIGradient(aqi: number): [string, string, string, string] {
  if (aqi <= 50)  return ['#0d9488', '#10b981', '#34d399', '#059669'];
  if (aqi <= 100) return ['#d97706', '#f59e0b', '#fcd34d', '#b45309'];
  if (aqi <= 150) return ['#ea580c', '#f97316', '#fb923c', '#c2410c'];
  if (aqi <= 200) return ['#dc2626', '#ef4444', '#f87171', '#b91c1c'];
  if (aqi <= 300) return ['#7c3aed', '#8b5cf6', '#a78bfa', '#6d28d9'];
  return               ['#7f1d1d', '#991b1b', '#b91c1c', '#450a0a'];
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    zIndex: 50,
  },
  navBtn: {
    padding: 8,
    borderRadius: Radius.full,
  },
  navIcon: { fontSize: 20, color: Colors.onSurfaceVariant },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navBrandIcon: { fontSize: 18 },
  navBrandText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: -0.5,
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondaryContainer,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.containerPadding,
    gap: Spacing.lg,
  },

  // Sections
  section: { gap: Spacing.md, marginTop: Spacing.lg },

  // Location row
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationPin: { fontSize: 14 },
  locationText: {
    ...Typography.labelCaps,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },

  // Hero title
  heroTitle: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },

  // AQI Card
  aqiCard: {
    borderRadius: Radius.card,
    padding: Spacing.lg,
    minHeight: 280,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  aqiCenter: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  aqiNumber: {
    ...Typography.displayAqi,
    color: '#fff',
    lineHeight: 72,
  },
  aqiLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 3,
    marginTop: 4,
  },
  aqiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.gutter,
  },
  aqiFooterRight: { alignItems: 'flex-end' },
  aqiFooterLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  aqiFooterValue: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Decorative blobs
  decorBlob1: {
    position: 'absolute',
    right: -80,
    top: -80,
    width: 240,
    height: 240,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorBlob2: {
    position: 'absolute',
    left: -40,
    bottom: -40,
    width: 180,
    height: 180,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  // Forecast
  forecastScroll: { marginHorizontal: -Spacing.containerPadding },
  forecastRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.sm,
  },

  // Cigarette card
  cigaretteCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.card,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  cigaretteSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onPrimaryContainer,
    opacity: 0.8,
  },
  cigaretteValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
    marginTop: 4,
  },
  cigaretteNote: {
    fontSize: 10,
    color: Colors.onPrimaryContainer,
    opacity: 0.6,
    marginTop: 3,
  },
  cigaretteIcon: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: Spacing.md,
    borderRadius: Radius.full,
  },

  // Bento row
  bentoRow: { flexDirection: 'row' },

  // Report banner
  reportBanner: {
    borderRadius: Radius.card,
    height: 180,
    overflow: 'hidden',
    backgroundColor: Colors.primaryContainer,
  },
  reportGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  reportEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 26,
  },
  reportCta: {
    marginTop: Spacing.md,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondaryFixed,
  },

  // Param Grid
  paramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  paramCell: { width: '47.5%' },

  // History ranges
  rangeRow: { flexDirection: 'row', gap: Spacing.sm },
  rangeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.outlineVariant,
  },
  rangeLabelActive: { color: Colors.onSurfaceVariant },

  // Chart
  chartCard: { padding: Spacing.md, height: 220 },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBarTrack: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartDay: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
});
