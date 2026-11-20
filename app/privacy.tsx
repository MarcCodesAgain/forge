import { ScrollView, StyleSheet, Text } from 'react-native';
import { Colors, Spacing, Typography } from '@/src/theme';

// Also served at /privacy on the web build: that URL is the privacy policy
// link required by the App Store and Google Play listings.
const UPDATED = '20 de noviembre de 2026';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Qué datos guarda Forge',
    body: 'Las rutinas que creas, los entrenos que registras (ejercicios, series, repeticiones y pesos) y, si lo usas, tu peso corporal.',
  },
  {
    title: 'Dónde se guardan',
    body: 'Solo en tu dispositivo. Forge no tiene cuentas ni servidores: no envía tus datos a ningún sitio, no usa analítica ni publicidad y no los comparte con terceros.',
  },
  {
    title: 'Copias de seguridad',
    body: 'Si exportas una copia, se genera un fichero que tú decides dónde guardar o con quién compartir. Forge no tiene acceso a él después.',
  },
  {
    title: 'Cómo borrar tus datos',
    body: 'Desde Ajustes → Borrar todos los datos, o desinstalando la app. En la versión web, borrando los datos del sitio en tu navegador.',
  },
  {
    title: 'Permisos',
    body: 'Forge no usa la cámara, la ubicación, los contactos ni los datos de salud del sistema. Solo accede a un fichero cuando tú eliges importar una copia.',
  },
];

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">Política de privacidad</Text>
      <Text style={styles.updated}>Última actualización: {UPDATED}</Text>
      {SECTIONS.map((section) => (
        <Text key={section.title} style={styles.paragraph}>
          <Text style={styles.heading}>{section.title}. </Text>
          {section.body}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.md, maxWidth: 680, width: '100%', alignSelf: 'center' },
  title: { ...Typography.headlineMd, color: Colors.text },
  updated: { ...Typography.labelSm, color: Colors.textTertiary },
  heading: { fontFamily: 'Inter_600SemiBold', color: Colors.text },
  paragraph: { ...Typography.bodyMd, color: Colors.textSecondary },
});
