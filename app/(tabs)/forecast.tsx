import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MOCK_DATA } from '@/services/api';
import { getAQILevel } from '@/services/aqi';

const HORIZONS = [
  { label: '+6h', value: 6 },
  { label: '+12h', value: 12 },
  { label: '+18h', value: 18 },
  { label: '+24h', value: 24 },
];

export default function ForecastScreen() {
  const [selectedHorizon, setSelectedHorizon] = useState(6);

  // Generate deterministic mock data for the chart
  const timelineData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      // Seeded variation: sin wave + constant offset
      const variation = Math.sin(i / 3) * 40;
      const aqi = Math.round(168 + variation);
      return Math.max(0, aqi);
    });
  }, []);

  const baseAqi = Number(MOCK_DATA.current_aqi) || 0;
  const forecastAqi = baseAqi + (selectedHorizon === 6 ? 25 : selectedHorizon === 12 ? -15 : selectedHorizon === 18 ? 45 : 15);
  const aqiInfo = getAQILevel(forecastAqi);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1 — Time horizon selector */}
        <View style={styles.selectorContainer}>
          {HORIZONS.map((h) => (
            <TouchableOpacity
              key={h.value}
              onPress={() => setSelectedHorizon(h.value)}
              style={[
                styles.selectorButton,
                selectedHorizon === h.value ? styles.selectorActive : styles.selectorInactive,
              ]}
            >
              <Text
                style={[
                  styles.selectorText,
                  selectedHorizon === h.value ? styles.selectorTextActive : styles.selectorTextInactive,
                ]}
              >
                {h.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 2 — Forecast summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Forecast for +{selectedHorizon} hours</Text>
          <Text style={[styles.summaryAqi, { color: aqiInfo.color }]}>{forecastAqi}</Text>
          <View style={[styles.badge, { backgroundColor: aqiInfo.bg }]}>
            <Text style={[styles.badgeText, { color: aqiInfo.color }]}>{aqiInfo.label}</Text>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridValue}>{(Number(MOCK_DATA.pm25) || 0) + 5}</Text>
              <Text style={styles.gridLabel}>PM2.5</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridItem}>
              <Text style={styles.gridValue}>{(Number(MOCK_DATA.temperature) || 0) - 2}°C</Text>
              <Text style={styles.gridLabel}>Temp</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridItem}>
              <Text style={styles.gridValue}>14 km/h</Text>
              <Text style={styles.gridLabel}>Wind</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridItem}>
              <Text style={styles.gridValue}>72%</Text>
              <Text style={styles.gridLabel}>Humidity</Text>
            </View>
          </View>
        </View>

        {/* Section 3 — Station forecast list */}
        <Text style={styles.sectionTitle}>Station Predictions</Text>
        {MOCK_DATA.hotspots.map((hotspot, index) => {
          const hotspotAqi = Number(hotspot.aqi) || 0;
          const prediction = hotspotAqi + (selectedHorizon === 6 ? 15 : -5);
          const info = getAQILevel(prediction);
          const confidence = 95 - (index * 5) - (selectedHorizon / 6 * 2);
          return (
            <View key={index} style={styles.stationCard}>
              <View style={styles.stationHeader}>
                <Text style={styles.stationName}>{hotspot.name}</Text>
                <View style={styles.predictionInfo}>
                  <Text style={[styles.predictionAqi, { color: info.color }]}>{prediction}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: info.bg }]}>
                    <Text style={[styles.levelBadgeText, { color: info.color }]}>{info.label}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${confidence}%`, backgroundColor: info.color }]} />
                </View>
                <Text style={styles.uncertaintyText}>± 8 µg/m³</Text>
              </View>
            </View>
          );
        })}

        {/* Section 4 — 24hr timeline chart */}
        <Text style={styles.sectionTitle}>24-Hour AQI Timeline</Text>
        <View style={styles.chartContainer}>
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>300</Text>
            <Text style={styles.axisLabel}>200</Text>
            <Text style={styles.axisLabel}>100</Text>
            <Text style={styles.axisLabel}>0</Text>
          </View>
          <View style={styles.chartArea}>
            <View style={styles.barsContainer}>
              {timelineData.map((val, i) => {
                const info = getAQILevel(val);
                return (
                  <View key={i} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(val / 300) * 100}%`,
                          backgroundColor: info.color,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.xAxis}>
              <Text style={styles.axisLabel}>0h</Text>
              <Text style={styles.axisLabel}>6h</Text>
              <Text style={styles.axisLabel}>12h</Text>
              <Text style={styles.axisLabel}>18h</Text>
              <Text style={styles.axisLabel}>24h</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  selectorButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectorActive: {
    backgroundColor: '#00D4FF',
  },
  selectorInactive: {
    backgroundColor: '#141824',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#0A0E1A',
  },
  selectorTextInactive: {
    color: '#8892A4',
  },
  summaryCard: {
    backgroundColor: '#141824',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  summaryAqi: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E2A3A',
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
  },
  gridValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  gridLabel: {
    color: '#8892A4',
    fontSize: 10,
    marginTop: 2,
  },
  gridDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#1E2A3A',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stationCard: {
    backgroundColor: '#141824',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  predictionAqi: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#1E2A3A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  uncertaintyText: {
    color: '#8892A4',
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: '#141824',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    height: 200,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingBottom: 25,
    marginRight: 8,
  },
  chartArea: {
    flex: 1,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '70%',
    maxWidth: 8,
    borderRadius: 4,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  axisLabel: {
    color: '#8892A4',
    fontSize: 10,
  },
});
