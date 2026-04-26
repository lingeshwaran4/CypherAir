# CypherAir × Stitch UI — Integration Guide

## Files Delivered

| File | Drop Into |
|------|-----------|
| `theme.ts` | `constants/theme.ts` |
| `StitchComponents.tsx` | `components/ui/stitch/StitchComponents.tsx` |
| `HomeLayout.tsx` | `components/ui/stitch/HomeLayout.tsx` |
| `StitchTabBar.tsx` | `components/ui/stitch/StitchTabBar.tsx` |
| `index.integration.tsx` | Reference only — shows how to update `app/(tabs)/index.tsx` |

---

## Step 1 — Install Dependencies

```bash
npx expo install expo-linear-gradient
npx expo install react-native-safe-area-context
npx expo install @expo-google-fonts/inter
```

---

## Step 2 — Copy Files

```
constants/
  theme.ts                    ← NEW (from theme.ts)

components/
  ui/
    stitch/                   ← NEW FOLDER
      StitchComponents.tsx
      HomeLayout.tsx
      StitchTabBar.tsx
```

---

## Step 3 — Wire HomeLayout into index.tsx

Open your existing `app/(tabs)/index.tsx`. Make **only** this change:

```tsx
// ADD this import at the top
import { HomeLayout } from '@/components/ui/stitch/HomeLayout';

// KEEP all your existing logic unchanged above return()

// REPLACE only the return() block:
return (
  <HomeLayout
    aqiData={yourAqiState}        // from your existing hook/state
    forecast={yourForecastData}
    parameters={yourParameters}
    history={yourHistory}
    onSearchPress={handleSearch}  // your existing handlers
    onMenuPress={handleMenu}
    onReportPress={handleReport}
    onHistoryRangeChange={setRange}
    selectedHistoryRange={range}
    userAvatar={user?.photoURL}
  />
);
```

See `index.integration.tsx` for the full wiring example with placeholder data.

---

## Step 4 — Wire Stitch Tab Bar (optional)

In `app/(tabs)/_layout.tsx`, add one prop to your existing `<Tabs>`:

```tsx
import { StitchTabBar } from '@/components/ui/stitch/StitchTabBar';

// Find your existing <Tabs> and add:
<Tabs
  tabBar={(props) => <StitchTabBar {...props} />}  // ← ADD THIS
  // ... all your existing Tabs props stay unchanged
>
  {/* all your existing Tab.Screen entries stay unchanged */}
</Tabs>
```

---

## Step 5 — Load Inter Font

In your `app/_layout.tsx`:

```tsx
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  // ... rest of your existing layout
}
```

---

## What Was NOT Changed

- `hooks/` — all custom hooks untouched
- `constants/` — only `theme.ts` added (nothing overwritten)
- `components/Map.tsx` — untouched
- `components/themed-text.tsx` — untouched
- `components/themed-view.tsx` — untouched
- `app.config.js`, `.env`, `package.json` — untouched
- Navigation structure in `_layout.tsx` — untouched (tab bar is opt-in)
- All business logic and API calls — untouched

---

## AQI Data Shape

Wire your existing API response into this shape:

```ts
interface AQIData {
  aqi: number;           // e.g. 43
  status: string;        // e.g. "HEALTHY"
  primaryPollutant: string; // e.g. "PM2.5"
  lastUpdated: string;   // e.g. "2 mins ago"
  location: string;      // e.g. "Chennai, Tamil Nadu"
}
```

The `getAQIGradient()` function inside `HomeLayout.tsx` auto-selects the correct gradient color based on the AQI value:

| AQI Range | Color |
|-----------|-------|
| 0–50      | Green (Good) |
| 51–100    | Amber (Moderate) |
| 101–150   | Orange (Sensitive) |
| 151–200   | Red (Unhealthy) |
| 201–300   | Violet (Very Unhealthy) |
| 300+      | Maroon (Hazardous) |
