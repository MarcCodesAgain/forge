import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useFonts } from 'expo-font';
// Per-weight imports: the packages' index pulls in every weight and italic.
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat/700Bold';
import { Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat/800ExtraBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Inter_400Regular,
    Inter_600SemiBold,
  });
  // Saved workouts load from the device asynchronously; keep the splash up
  // until they're in so screens never flash an empty state.
  const hasHydrated = useWorkoutStore((s) => s.hasHydrated);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const ready = loaded && hasHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return <RootNavigator />;
}

function RootNavigator() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#080808' },
        headerShadowVisible: false,
        headerTintColor: '#e5e2e1',
        headerTitleStyle: { fontFamily: 'Montserrat_700Bold', fontSize: 17, color: '#e5e2e1' },
        contentStyle: { backgroundColor: '#080808' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="plan/new" options={{ title: 'Nueva rutina', presentation: 'modal' }} />
      <Stack.Screen name="plan/edit/[id]" options={{ title: 'Editar rutina' }} />
      <Stack.Screen name="session/[planId]/[dayId]/index" options={{ title: 'Entrenamiento' }} />
      <Stack.Screen name="log/[logId]" options={{ title: 'Detalle sesión' }} />
      <Stack.Screen name="settings" options={{ title: 'Ajustes' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacidad' }} />
    </Stack>
  );
}
