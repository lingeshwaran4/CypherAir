import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROFILES, ProfileKey } from '@/constants/profiles';
import { MOCK_DATA } from '@/services/api';

export default function ProfileScreen() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileKey>('asthmatic');
  const [pushAlerts, setPushAlerts] = useState(true);
  const [hourlyUpdates, setHourlyUpdates] = useState(false);
  const [travelRecs, setTravelRecs] = useState(true);

  const profileData = PROFILES[selectedProfile];
  const currentAqi = MOCK_DATA.current_aqi;
  const isAboveWarning = currentAqi > profileData.warningThreshold;
  const isAboveAlert = currentAqi > profileData.alertThreshold;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1 — Profile header card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#00D4FF" />
          </View>
          <Text style={styles.headerTitle}>Select Your Health Profile</Text>
          <Text style={styles.headerSubtitle}>Alerts are personalised to your health condition</Text>
        </View>

        {/* Section 2 — Profile selector (2x2 grid) */}
        <View style={styles.gridContainer}>
          {(Object.keys(PROFILES) as ProfileKey[]).map((key) => {
            const p = PROFILES[key];
            const isSelected = selectedProfile === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => setSelectedProfile(key)}
                style={[
                  styles.profileCard,
                  isSelected && { borderColor: p.color, backgroundColor: '#1E2A3A' },
                ]}
              >
                <Ionicons name={p.icon as any} size={28} color={p.color} />
                <Text style={styles.profileLabel}>{p.label}</Text>
                <Text style={styles.profileThreshold}>Alert at AQI &gt; {p.alertThreshold}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 3 — Current thresholds card */}
        <View style={styles.thresholdCard}>
          <Text style={styles.thresholdTitle}>Your Alert Thresholds</Text>
          <View style={styles.thresholdRow}>
            <View style={[styles.dot, { backgroundColor: '#FFD600' }]} />
            <Text style={styles.thresholdText}>Warning at AQI &gt; {profileData.warningThreshold}</Text>
          </View>
          <View style={styles.thresholdRow}>
            <View style={[styles.dot, { backgroundColor: '#E53935' }]} />
            <Text style={styles.thresholdText}>Alert at AQI &gt; {profileData.alertThreshold}</Text>
          </View>
          <View style={[styles.statusContainer, { borderTopColor: '#1E2A3A', borderTopWidth: 1, marginTop: 12, paddingTop: 12 }]}>
            <Text style={styles.statusLabel}>Current AQI {currentAqi} is</Text>
            <Text style={[styles.statusValue, { color: isAboveAlert ? '#E53935' : isAboveWarning ? '#FFD600' : '#00C853' }]}>
              {isAboveAlert ? 'above your alert threshold' : isAboveWarning ? 'above your warning threshold' : 'within safe limits'}
            </Text>
          </View>
        </View>

        {/* Section 4 — Notification preferences */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.prefsContainer}>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Push Alerts</Text>
            <Switch
              value={pushAlerts}
              onValueChange={setPushAlerts}
              trackColor={{ false: '#1E2A3A', true: '#00D4FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Hourly Updates</Text>
            <Switch
              value={hourlyUpdates}
              onValueChange={setHourlyUpdates}
              trackColor={{ false: '#1E2A3A', true: '#00D4FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Travel Recommendations</Text>
            <Switch
              value={travelRecs}
              onValueChange={setTravelRecs}
              trackColor={{ false: '#1E2A3A', true: '#00D4FF' }}
              thumbColor="#FFFFFF"
            />
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
  headerCard: {
    backgroundColor: '#141824',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E2A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#8892A4',
    fontSize: 13,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  profileCard: {
    width: '48%',
    backgroundColor: '#141824',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 8,
  },
  profileLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileThreshold: {
    color: '#8892A4',
    fontSize: 11,
    textAlign: 'center',
  },
  thresholdCard: {
    backgroundColor: '#141824',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  thresholdTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  thresholdText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusLabel: {
    color: '#8892A4',
    fontSize: 13,
  },
  statusValue: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  prefsContainer: {
    backgroundColor: '#141824',
    borderRadius: 16,
    padding: 8,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  prefLabel: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
