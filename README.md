# @build-context/paygate-react-native

React Native bindings for Paygate: native **iOS** (`Paygate`) and **Android** (`paygate`), plus an **Expo Go** path that uses `@build-context/paygate` + `react-native-webview` inside `<PaygateRoot>`.

## Prerequisites

### iOS

- Add **`Paygate`** to your `Podfile` (Swift package sources live under `sdks/ios` in this monorepo):

```ruby
pod 'Paygate', :path => '../node_modules/@build-context/paygate-react-native/../../ios'
# or point :path at your checkout of sdks/ios
```

- Install pods and build with a dev client / EAS (not Expo Go) for full StoreKit.

### Android

1. Publish the Android SDK to Maven Local once:

```bash
cd sdks/android
gradle :paygate:publishToMavenLocal
```

2. Ensure your app’s `android/build.gradle` (or `settings.gradle`) includes `mavenLocal()`.

3. `paygate` resolves as `com.paygate:paygate:0.1.0`.

### Expo Go / WebView fallback

```bash
npm install @build-context/paygate react-native-webview
```

Wrap your app:

```tsx
import { PaygateRoot } from '@build-context/paygate-react-native';

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
