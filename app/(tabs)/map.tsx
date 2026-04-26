import React from 'react';
import { StyleSheet, View } from 'react-native';
import Map from '@/components/Map';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Map style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  map: {
    flex: 1,
    height: '100%',
    marginVertical: 0,
    borderRadius: 0,
  },
});
