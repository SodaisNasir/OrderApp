module.exports = {
  assets: ['./src/assets/fonts/'],
  dependencies: {
    'react-native-nitro-modules': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-nitro-modules/android',
        },
      },
    },
  },
};
