const { createRunOncePlugin } = require('@expo/config-plugins');
const pkg = require('./package.json');

// Placeholder for future Expo config plugin functionality.
module.exports = createRunOncePlugin((config) => config, pkg.name, pkg.version);
