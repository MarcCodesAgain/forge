import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useAuthStore } from '@/src/store/authStore';
import { Colors, Typography, Spacing, Radius, GlassCard, OrangeGlow } from '@/src/theme';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async () => {
    if (!email || !password) { Alert.alert('Error', 'Rellena email y contraseña'); return; }
    setLoading(true);
    const error = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (error) Alert.alert('Error', error);
    else if (mode === 'signup') Alert.alert('¡Cuenta creada!', 'Ya puedes iniciar sesión.');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>FORGE</Text>
          <Text style={styles.tagline}>Trackea tu progreso en el gym</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Toggle */}
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

          {/* Inputs */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
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
            <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={Colors.black} />
              : <Text style={styles.btnText}>{mode === 'signin' ? 'ENTRAR' : 'REGISTRARSE'}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flexGrow: 1, justifyContent: 'center', padding: Spacing.md },
  logoArea: { alignItems: 'center', marginBottom: Spacing.lg },
  logoText: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 52, color: Colors.accent,
    letterSpacing: 4, fontStyle: 'italic',
  },
  tagline: { ...Typography.labelMd, color: Colors.textTertiary, marginTop: 8, fontFamily: 'Inter_400Regular' },
  card: { ...GlassCard, borderRadius: Radius.xl, padding: Spacing.md },
  toggle: {
    flexDirection: 'row', backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.md, padding: 3, marginBottom: Spacing.md,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  toggleBtnActive: { backgroundColor: Colors.accent },
  toggleText: { ...Typography.labelMd, color: Colors.textTertiary },
  toggleTextActive: { color: Colors.black },
  field: { marginBottom: Spacing.md },
  fieldLabel: { ...Typography.labelSm, color: Colors.textTertiary, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 2, borderBottomColor: Colors.borderVariant,
    color: Colors.text, fontSize: 16, fontFamily: 'Inter_400Regular',
    paddingVertical: 10, paddingHorizontal: 4,
  },
  btn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    padding: 16, alignItems: 'center', marginTop: 8,
    ...OrangeGlow,
  },
  btnText: { ...Typography.labelMd, color: Colors.black, fontSize: 15 },
});
