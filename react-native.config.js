module.exports = {
  dependency: {
    platforms: {
      ios: {
        podspecPath: "./ios/PaygateReactNative.podspec",
      },
      android: {
        packageImportPath: "import com.paygate.reactnative.PaygateReactNativePackage;",
        packageInstance: "new PaygateReactNativePackage()",
      },
    },
  },
};
