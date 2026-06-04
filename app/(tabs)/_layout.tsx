import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17, color: Colors.text },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Rutinas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Entrenar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
