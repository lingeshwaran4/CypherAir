import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_DATA } from '@/services/api';
import { getAQILevel } from '@/services/aqi';

export default function HomeScreen() {
  const aqiInfo = getAQILevel(MOCK_DATA.current_aqi);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1 — Header bar */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cypher Air</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>North Chennai</Text>
            <Ionicons name="location" size={18} color="#00D4FF" />
          </View>
        </View>

        {/* Section 2 — Main AQI card */}
        <View style={styles.mainCard}>
          <Text style={styles.stationName}>{MOCK_DATA.station}</Text>
          <View style={styles.aqiContainer}>
            <Text style={[styles.aqiNumber, { color: aqiInfo.color }]}>
              {MOCK_DATA.current_aqi}
            </Text>
            <View style={[styles.aqiBadge, { backgroundColor: aqiInfo.bg }]}>
              <Text style={[styles.aqiBadgeText, { color: aqiInfo.color }]}>
                {aqiInfo.label}
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>PM2.5 {MOCK_DATA.pm25} µg/m³</Text>
            <Text style={styles.footerText}>Updated 5 min ago</Text>
          </View>
        </View>

        {/* Section 3 — Weather strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherStrip}>
          <View style={styles.weatherCard}>
            <Ionicons name="thermometer" size={20} color="#00D4FF" />
            <Text style={styles.weatherValue}>{MOCK_DATA.temperature}°C</Text>
            <Text style={styles.weatherLabel}>Temperature</Text>
          </View>
          <View style={styles.weatherCard}>
            <Ionicons name="water" size={20} color="#00D4FF" />
            <Text style={styles.weatherValue}>{MOCK_DATA.humidity}%</Text>
            <Text style={styles.weatherLabel}>Humidity</Text>
          </View>
          <View style={styles.weatherCard}>
            <Ionicons name="arrow-up" size={20} color="#00D4FF" style={{ transform: [{ rotate: '315deg' }] }} />
            <Text style={styles.weatherValue}>{MOCK_DATA.wind_speed} km/h</Text>
            <Text style={styles.weatherLabel}>Wind {MOCK_DATA.wind_direction}</Text>
          </View>
          <View style={styles.weatherCard}>
            <Ionicons name="layers" size={20} color="#00D4FF" />
            <Text style={styles.weatherValue}>{MOCK_DATA.boundary_layer}m</Text>
            <Text style={styles.weatherLabel}>Boundary Layer</Text>
          </View>
        </ScrollView>

        {/* Section 4 — Hotspot list title */}
        <Text style={styles.sectionTitle}>Active Hotspots</Text>

        {/* Section 5 — Hotspot cards */}
        {MOCK_DATA.hotspots.map((hotspot, index) => {
          const hotspotAqi = getAQILevel(hotspot.aqi);
          return (
            <View key={index} style={styles.hotspotCard}>
              <View style={[styles.statusDot, { backgroundColor: hotspotAqi.color }]} />
              <View style={styles.hotspotInfo}>
                <Text style={styles.hotspotName}>{hotspot.name}</Text>
                <Text style={[styles.hotspotAqi, { color: hotspotAqi.color }]}>
                  AQI: {hotspot.aqi}
                </Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: hotspotAqi.bg }]}>
                <Text style={[styles.levelBadgeText, { color: hotspotAqi.color }]}>
                  {hotspotAqi.label}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Section 6 — Quick forecast strip title */}
        <Text style={styles.sectionTitle}>Next 24 Hours</Text>

        {/* Section 7 — Horizontal scrollable forecast strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastStrip}>
          {[6, 12, 18, 24].map((h) => {
            // Mock variation
            const forecastAqi = MOCK_DATA.current_aqi + (h === 6 ? 20 : h === 12 ? -10 : h === 18 ? 40 : 10);
            const info = getAQILevel(forecastAqi);
            return (
              <View key={h} style={styles.forecastCard}>
                <Text style={styles.forecastTime}>+{h}h</Text>
                <Text style={[styles.forecastValue, { color: info.color }]}>{forecastAqi}</Text>
                <View style={styles.forecastBarContainer}>
                  <View style={[styles.forecastBar, { backgroundColor: info.color, height: (forecastAqi / 500) * 20 }]} />
                </View>
              </View>
            );
          })}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 4,
  },
  mainCard: {
    backgroundColor: '#141824',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    marginBottom: 24,
  },
  stationName: {
    color: '#8892A4',
    fontSize: 14,
    marginBottom: 8,
  },
  aqiContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  aqiNumber: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  aqiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: -8,
  },
  aqiBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E2A3A',
    paddingTop: 16,
  },
  footerText: {
    color: '#8892A4',
    fontSize: 12,
  },
  weatherStrip: {
    marginBottom: 24,
  },
  weatherCard: {
    backgroundColor: '#141824',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 100,
    alignItems: 'center',
    gap: 4,
  },
  weatherValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherLabel: {
    color: '#8892A4',
    fontSize: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  hotspotCard: {
    backgroundColor: '#141824',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  hotspotInfo: {
    flex: 1,
  },
  hotspotName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  hotspotAqi: {
    fontSize: 13,
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  forecastStrip: {
    paddingBottom: 8,
  },
  forecastCard: {
    backgroundColor: '#141824',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 80,
    alignItems: 'center',
    gap: 8,
  },
  forecastTime: {
    color: '#8892A4',
    fontSize: 12,
  },
  forecastValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forecastBarContainer: {
    height: 20,
    justifyContent: 'flex-end',
    width: 30,
    alignItems: 'center',
  },
  forecastBar: {
    width: 6,
    borderRadius: 3,
  },
});
