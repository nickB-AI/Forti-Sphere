# App Store / Play Store Readiness Notes

## Web app status
- PWA-ready with manifest and service worker
- Installable on supported devices
- Publicly hostable via GitHub Pages or any static host

## For app store submission
To publish to Google Play or the Apple App Store, the web app would need to be wrapped in a native container such as:
- Capacitor
- TWA / Trusted Web Activity
- React Native WebView

## Recommended next steps
1. Wrap the app in Capacitor
2. Add native app icons and splash screens
3. Create app store listing assets
4. Add privacy policy and support links
5. Publish with a production backend if needed
