export default ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE_NAME || "com.cypherair.app",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || "com.cypherair.app",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    web: {
      ...config.web,
      // You can add web-specific config here if needed
    },
    extra: {
      ...config.extra,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  };
};
