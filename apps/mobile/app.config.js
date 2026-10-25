module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      tomtomApiKey:
        process.env.EXPO_PUBLIC_TOMTOM_API_KEY ||
        process.env.TOMTOM_API_KEY ||
        process.env.NEXT_PUBLIC_TOMTOM_API_KEY ||
        '',
    },
  };
};
