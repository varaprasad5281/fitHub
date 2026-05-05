const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround: react-native-screens 4.x ships TypeScript fabric source files
// that use 'undefined' as a prop type — incompatible with the @react-native/codegen
// version bundled inside babel-preset-expo 13.x.
//
// Disabling unstable_enablePackageExports forces Metro to resolve modules via the
// traditional 'react-native' / 'main' fields (pre-built JS) instead of the 'exports'
// field which can point directly to the TypeScript source.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
