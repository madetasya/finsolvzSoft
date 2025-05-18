import { getDefaultConfig, mergeConfig } from "@expo/metro-config";

const defaultConfig = await getDefaultConfig(__dirname);

const config = mergeConfig(defaultConfig, {
  transformer: {
    babelTransformerPath: "react-native-svg-transformer",
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
  },
});

export default config;
