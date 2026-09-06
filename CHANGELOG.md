## 0.2.0

- Gates can pin a flow's colour scheme. A WebView reads `prefers-color-scheme`
  from the system night mode rather than from your app, so an app with its own
  light/dark setting could show a paywall that disagreed with the screen behind
  it. The gate's `appearance` now decides, and the app can override it per
  launch — only the app knows whether it has a theme preference of its own.
- `appearance` defaults to `system`, which is exactly what every existing gate
  already does, so nothing restyles without being asked.
- Bumps the native dependencies to Android 0.3.0 and iOS 0.2.0, and the
  `@build-context/paygate` peer to 0.2.0.

## 0.1.6

- Rename from @paygate/react-native to @build-context/paygate-react-native

## 0.1.5

- Initial public release
- Native iOS/Android with Expo Go WebView fallback
