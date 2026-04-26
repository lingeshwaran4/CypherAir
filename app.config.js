export default ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    console.warn('WARNING: GOOGLE_MAPS_API_KEY is not set. Map will crash on Android.');
  }

  return {
    ...config,
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE_NAME || 'com.cypherair.app',
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey || '',
        },
      },
    },
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || 'com.cypherair.app',
      config: {
        googleMapsApiKey: googleMapsApiKey || '',
      },
    },
    web: {
      ...config.web,
      // You can add web-specific config here if needed
    },
    extra: {
      ...config.extra,
      googleMapsApiKey: googleMapsApiKey,
    },
  };
};
