# @paygate/react-native

React Native bindings for Paygate: native **iOS** (`PaygateSDK`) and **Android** (`paygate-sdk`), plus an **Expo Go** path that uses `@paygate/js` + `react-native-webview` inside `<PaygateRoot>`.

## Prerequisites

### iOS

- Add **`PaygateSDK`** to your `Podfile` (Swift package sources live under `sdks/ios` in this monorepo):

```ruby
pod 'PaygateSDK', :path => '../node_modules/@paygate/react-native/../../ios'
# or point :path at your checkout of sdks/ios
```

- Install pods and build with a dev client / EAS (not Expo Go) for full StoreKit.

### Android

1. Publish the Android SDK to Maven Local once:

```bash
cd sdks/android
gradle :paygate-sdk:publishToMavenLocal
```

2. Ensure your app’s `android/build.gradle` (or `settings.gradle`) includes `mavenLocal()`.

3. `paygate-sdk` resolves as `com.paygate:paygate-sdk:0.1.0`.

### Expo Go / WebView fallback

```bash
npm install @paygate/js react-native-webview
```

Wrap your app:

```tsx
import { PaygateRoot } from '@paygate/react-native';

export default function App() {
  return (
    <PaygateRoot>
      <YourApp />
    </PaygateRoot>
  );
}
```

## API

Matches Flutter/Dart: `Paygate.initialize`, `launchFlow`, `launchGate`, `purchase`, `getActiveSubscriptionProductIDs`. Launch statuses use **camelCase** names (`alreadySubscribed`, `planLimitReached`, …) to match iOS `PaygateLaunchStatus`.
