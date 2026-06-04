import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#1C1C1E',
        headerTitleStyle: { fontWeight: '700', fontSize: 17, color: '#1C1C1E' },
        contentStyle: { backgroundColor: '#FFFFFF' },
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
