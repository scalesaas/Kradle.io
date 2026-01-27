// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// @ts-ignore - Silence the 'Cannot find module' error
module.exports = withNativeWind(config, { input: './global.css' });