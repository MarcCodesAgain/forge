# Forge

Gym workout tracker for iOS, Android and the web, built with Expo and React Native. Plan your routines, log every set in the gym, and see your progress — no account, no signal needed.

**[Open the web app](https://forge-nine-sigma.vercel.app)** · **[Download for Android (APK)](https://github.com/MarcCodesAgain/forge/releases/latest/download/forge.apk)** · [Privacy policy](https://forge-nine-sigma.vercel.app/privacy)

On Android, open the APK and allow installing from your browser when asked. Your workouts stay on your phone.

> The UI is in Spanish.

## Features

- **Routines** split into training days, with a searchable exercise library (filter by muscle group) or your own exercises.
- **Workout sessions**: pre-filled with your routine's targets and showing what you lifted last time; mark sets as done and a rest timer starts automatically.
- **History and progress**: personal records, sessions per month, a weekly volume strip, a weekly streak and a per-exercise weight progression chart.
- **Body weight** log, one entry per day.
- **Backups**: export everything to a JSON file and import it on another phone.

## Local-first, on purpose

Everything is stored on the device (AsyncStorage on native, `localStorage` on the web build). There are no accounts and no server:

- **It works anywhere.** Gyms are often in basements with no signal; logging a set never waits on the network.
- **No sign-up wall.** You open the app and start training.
- **Privacy by default.** Workout and body-weight data never leave the phone. No analytics, no ads.
- **Nothing to keep alive.** No backend to pay for, pause or secure.

The trade-off is that data doesn't sync between devices. Backups cover moving to a new phone; cloud sync is on the roadmap.

## Tech stack

Expo SDK 57 · React Native 0.86 · Expo Router (typed routes) · TypeScript · Zustand (`persist` middleware) · react-native-svg · Vitest · EAS Build

## Architecture

```
app/                       Screens (Expo Router, file-based)
├── (tabs)/                Home (/home), Routines, History
├── plan/                  Create / edit a routine
├── session/[planId]/[dayId]   Live workout
├── log/[logId]            Past session detail
├── settings.tsx           Data, backups, delete everything
├── privacy.tsx            Privacy policy (also the public /privacy URL on the web build)
└── index.tsx              Web: product landing page (src/landing). Native: redirects to /home
src/
├── store/
│   ├── workoutData.ts     Pure state transitions + backup format/validation (unit-tested)
│   └── workoutStore.ts    Zustand store persisted on the device
├── lib/
│   ├── stats.ts           Weekly volume, streak, monthly sessions (unit-tested)
│   ├── backup.ts          Export via share sheet / download; import via document picker
│   └── confirm.ts         Confirmations that also work on the web build
├── components/            Exercise picker, rest timer, progress chart
├── hooks/                 Derived stats for screens
└── data/exercises.ts      Built-in exercise library
```

Some decisions worth calling out:

- **Domain logic is pure and framework-free** (`workoutData.ts`, `stats.ts`), so it's tested with Vitest without a simulator.
- **Backups are validated before anything is replaced**: a wrong or corrupted file shows an error and leaves your data untouched.
- **Dates use the local calendar day.** `toISOString()` is UTC, which files a session done at 00:30 in Spain under the previous day; stats and the daily weight entry use local dates instead.
- **Weeks start on Monday** (matching the L-M-X-J-V-S-D strip), and an empty current week doesn't reset the streak on Monday morning.
- **Web parity**: react-native-web ignores `Alert.alert` buttons, so confirmations fall back to `window.confirm` — otherwise deleting a routine silently did nothing on the web.

## Getting started

```bash
npm install
npm run web        # in the browser
npm start          # Expo dev server (scan with a development build)
```

| Command | |
| --- | --- |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | TypeScript |
| `npm run export:web` | Static web build into `dist/` |

## Building and distribution

Builds run on [EAS](https://docs.expo.dev/build/introduction/):

```bash
npx eas-cli build --platform android --profile preview      # installable APK
npx eas-cli build --platform all --profile production       # store builds (AAB / IPA)
```

- **Web**: `npm run export:web` and deploy `dist/` (Vercel config included; every path falls back to `index.html`).
- **Android**: the `preview` profile produces an APK; each version is attached to a [GitHub Release](https://github.com/MarcCodesAgain/forge/releases) as `forge.apk`, so the download link above always points to the latest one.
- **App Store / Google Play**: the app is ready on the technical side (icons, splash, bundle ids, [privacy policy](https://forge-nine-sigma.vercel.app/privacy), no data collection, in-app data deletion). Publishing needs developer accounts and store listings.

## Roadmap

- Cloud sync (opt-in), so the same data is available on several devices.
- Nutrition tracking and progress photos.
- English localisation.

## License

[MIT](LICENSE)
