import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import Landing from '@/src/landing/Landing';

// On the web the root URL is the product landing page; the app itself lives
// at /home. Native apps skip straight to it.
export default function Index() {
  if (Platform.OS !== 'web') return <Redirect href="/home" />;
  return <Landing />;
}
