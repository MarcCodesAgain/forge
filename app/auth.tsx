import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useAuthStore } from '@/src/store/authStore';
import { Colors, Spacing, Radius, Typography } from '@/src/theme';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Campos vacíos', 'Rellena email y contraseña');
      return;
    }
    setLoading(true);
    const error = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);
    setLoading(false);
    if (error) Alert.alert('Error', error);
    else if (mode === 'signup') Alert.alert('¡Cuenta creada!', 'Ya puedes iniciar sesión.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>💪</Text>
          </View>
          <Text style={styles.logoText}>FitJournal</Text>
          <Text style={styles.tagline}>Registra tu progreso en el gym</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signin' && styles.toggleBtnActive]}
              onPress={() => setMode('signin')}
            >
              <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>
                Iniciar sesión
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                Crear cuenta
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnText}>{mode === 'signin' ? 'Entrar' : 'Registrarse'}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  logoArea: { alignItems: 'center', marginBottom: Spacing.xl },
  logoIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.accentLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  logoText: { ...Typography.largeTitle, marginBottom: Spacing.xs },
  tagline: { ...Typography.subhead },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  toggleBtnActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  toggleText: { ...Typography.subhead, color: Colors.textSecondary },
  toggleTextActive: { color: Colors.accent, fontWeight: '600' },
  field: { marginBottom: Spacing.md },
  label: { ...Typography.caption, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
