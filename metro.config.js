const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// SVG 파일을 React 컴포넌트로 import (react-native-svg-transformer)
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo')
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg')
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg']

module.exports = withNativeWind(config, { input: './global.css' })
