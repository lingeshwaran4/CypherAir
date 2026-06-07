import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_DATA } from '@/services/api';
import { getAQILevel } from '@/services/aqi';

const TIMELINE_ALERTS = [
  { time: '06:00', aqi: 110, risk: 'Moderate Risk', detail: 'Safe for all profiles' },
  { time: '10:00', aqi: 95, risk: 'Low Risk', detail: 'Best window for outdoor activity' },
  { time: '14:00', aqi: 185, risk: 'High Risk', detail: 'Avoid: Ennore Expressway' },
  { time: '18:00', aqi: 220, risk: 'Very High Risk', detail: 'Avoid industrial zones' },
  { time: '22:00', aqi: 190, risk: 'High Risk', detail: 'Moderate levels detected' },
  { time: '02:00', aqi: 140, risk: 'Moderate Risk', detail: 'Safe for most profiles' },
];

export default function AlertsScreen() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const currentAqi = Number(MOCK_DATA.current_aqi) || 0;
  const currentAqiInfo = getAQILevel(currentAqi);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1 — Active alert banner */}
        <View style={[styles.alertBanner, { backgroundColor: currentAqiInfo.color + '33' }]}>
          <Ionicons name="warning" size={32} color={currentAqiInfo.color} />
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>Air Quality Alert</Text>
            <Text style={styles.bannerSubtitle}>{currentAqiInfo.label} levels detected in your area</Text>
          </View>
          <View style={[styles.bannerBadge, { backgroundColor: currentAqiInfo.color }]}>
            <Text style={styles.bannerBadgeText}>{currentAqi}</Text>
          </View>
        </View>

        {/* Section 2 — Safer travel recommendation card */}
        <View style={styles.travelCard}>
          <View style={styles.travelHeader}>
            <Ionicons name="time" size={24} color="#00D4FF" />
            <Text style={styles.travelTitle}>Safer Travel Window</Text>
          </View>
          <Text style={styles.recommendationText}>Best window today: 10:00 – 12:00</Text>
          <Text style={styles.travelSubtitle}>Forecast AQI drops to 95 — Satisfactory for most profiles</Text>
          <View style={styles.routeContainer}>
            <Ionicons name="checkmark-circle" size={18} color="#00C853" />
            <Text style={styles.routeText}>Take residential route via Nehru Nagar</Text>
          </View>
        </View>

        {/* Section 3 — Forecast alert timeline */}
        <Text style={styles.sectionTitle}>Next 24 Hours</Text>
        <View style={styles.timelineContainer}>
          {TIMELINE_ALERTS.map((alert, index) => {
            const info = getAQILevel(alert.aqi);
            const isExpanded = expandedRow === index;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => setExpandedRow(isExpanded ? null : index)}
                style={[styles.timelineRow, isExpanded && styles.timelineRowExpanded]}
              >
                <View style={styles.timelineHeader}>
                  <Text style={styles.timeLabel}>{alert.time}</Text>
                  <View style={[styles.aqiBadge, { backgroundColor: info.bg }]}>
                    <Text style={[styles.aqiBadgeText, { color: info.color }]}>{alert.aqi}</Text>
                  </View>
                  <Text style={styles.riskText}>{alert.risk}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#8892A4"
                  />
                </View>
                {isExpanded && (
                  <View style={styles.timelineDetail}>
                    <Text style={styles.detailText}>{alert.detail}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 4 — Hotspot alerts list */}
        <Text style={styles.sectionTitle}>Hotspot Warnings</Text>
        {MOCK_DATA.hotspots.map((hotspot, index) => {
          const info = getAQILevel(hotspot.aqi);
          return (
            <View key={index} style={[styles.hotspotAlert, { borderLeftColor: info.color }]}>
              <View style={styles.hotspotAlertHeader}>
                <Text style={styles.hotspotStationName}>{hotspot.name}</Text>
                <Text style={[styles.hotspotAqiValue, { color: info.color }]}>AQI: {hotspot.aqi}</Text>
              </View>
              <Text style={styles.hotspotActivity}>
                Downwind of NCTPS — industrial activity detected
              </Text>
              <Text style={styles.hotspotDistance}>2.3 km from your location</Text>
            </View>
          );
        })}
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  bannerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
  },
  bannerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerBadgeText: {
    color: '#0A0E1A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  travelCard: {
    backgroundColor: '#141824',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  travelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  travelTitle: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  travelSubtitle: {
    color: '#8892A4',
    fontSize: 12,
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E2A3A',
    padding: 10,
    borderRadius: 8,
  },
  routeText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timelineContainer: {
    backgroundColor: '#141824',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  timelineRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A3A',
  },
  timelineRowExpanded: {
    backgroundColor: '#1E2A3A',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    width: 50,
  },
  aqiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginHorizontal: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  aqiBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
  },
  timelineDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  detailText: {
    color: '#8892A4',
    fontSize: 13,
  },
  hotspotAlert: {
    backgroundColor: '#141824',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  hotspotAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hotspotStationName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  hotspotAqiValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  hotspotActivity: {
    color: '#8892A4',
    fontSize: 12,
    marginBottom: 4,
  },
  hotspotDistance: {
    color: '#8892A4',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
