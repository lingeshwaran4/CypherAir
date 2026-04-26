// ============================================================
// CypherAir — Stitch Bottom Tab Bar
// Drop into: components/ui/stitch/StitchTabBar.tsx
//
// HOW TO USE in app/(tabs)/_layout.tsx:
//   Add `tabBar={(props) => <StitchTabBar {...props} />}` to
//   your existing <Tabs> component. Nothing else changes.
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '@/constants/theme';

const TABS = [
  { name: 'index',    icon: '⊞',  label: 'Status'   },
  { name: 'map',      icon: '🗺️', label: 'Map'      },
  { name: 'forecast', icon: '📈', label: 'Forecast' },
  { name: 'alerts',   icon: '🔔', label: 'Alerts'   },
  { name: 'profile',  icon: '👤', label: 'Profile'  },
];

interface StitchTabBarProps {
  state: any;
  navigation: any;
}

export function StitchTabBar({ state, navigation }: StitchTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom || Spacing.md }]}>
      {TABS.map((tab, i) => {
        const isFocused = state.index === i;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: state.routes[i]?.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.tab, isFocused && styles.tabActive]}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {/* Alert dot for Alerts tab */}
            {tab.name === 'alerts' && (
              <View style={styles.alertDot} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: Radius.xl,
    gap: 3,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  tabIcon: { fontSize: 20 },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  tabLabelActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  alertDot: {
    position: 'absolute',
    top: 4,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
