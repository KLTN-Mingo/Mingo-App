const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// DotLottie (.lottie) — Metro không có sẵn trong assetExts, require() sẽ fail
config.resolver.assetExts.push("lottie");

module.exports = withNativeWind(config, { input: "./global.css" });