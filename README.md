# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Bluetooth Low Energy (BLE) setup

This project can connect to BLE devices. We recommend using a development build (not plain Expo Go) on a physical device.

- Install native BLE library:

```bash
npm install react-native-ble-plx
```

- iOS: run `npx pod-install` from the `ios` directory of a dev build.
- Android: ensure `minSdkVersion` meets the library requirements and add runtime permissions.

- Permissions:
   - Android: `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION` (runtime)
   - iOS: add `NSBluetoothAlwaysUsageDescription` / `NSBluetoothPeripheralUsageDescription` to `Info.plist`.

When ready, follow the in-repo examples (we add a BLE manager, hook, and UI components) to scan, connect, and stream data into the app tabs.

### Quick start (BLE)

1. Install dependencies:

```powershell
npm install
npm install react-native-ble-plx
```

2. Create a development build for physical device testing (recommended):

```powershell
npx expo prebuild --platform ios --platform android
npx pod-install
npx expo run:android   # or run:ios
```

3. Update `app/(tabs)/ekg.tsx` when you know your device's service and characteristic UUIDs — replace `YOUR_SERVICE_UUID` and `YOUR_CHAR_UUID`.

Notes:
- Use a physical device. BLE is not supported in most simulators/emulators.
- Ensure runtime permissions are requested on Android (scan/connect/location).
- If using Expo dev clients, create a dev client that includes `react-native-ble-plx`.

Persistent mock toggle
----------------------
This project optionally persists the "Use Mock" toggle with `@react-native-async-storage/async-storage`. Install it with:

```powershell
npm install @react-native-async-storage/async-storage
```

Then rebuild your dev client if using a native module workflow.
