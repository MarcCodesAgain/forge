import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { useFonts, Montserrat_700Bold, Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';

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
  const { setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootNavigator />;
}

function RootNavigator() {
  const { session, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === 'auth';
    if (!session && !inAuth) router.replace('/auth');
    else if (session && inAuth) router.replace('/');
  }, [session, isLoading]);

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
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="plan/new" options={{ title: 'Nueva rutina', presentation: 'modal' }} />
      <Stack.Screen name="plan/[id]" options={{ title: 'Editar rutina' }} />
      <Stack.Screen name="session/[planId]/[dayId]/index" options={{ title: 'Entrenamiento' }} />
    </Stack>
  );
}
