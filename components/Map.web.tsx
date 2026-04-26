import { View, Text, StyleSheet } from 'react-native';

export default function Map() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Map is only available on mobile devices.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f4f6',
  },
  text: {
    fontSize: 16,
    color: '#42474f',
  },
});
