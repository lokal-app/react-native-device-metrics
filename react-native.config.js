module.exports = {
  dependency: {
    platforms: {
      // Android-only library — disabled iOS for autolinking, codegen, and pod installation
      ios: null,
    },
  },
};
