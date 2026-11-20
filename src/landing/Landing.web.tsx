import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme';

// Web-only product page served at `/`. Plain DOM (react-native-web renders to
// it anyway) so it can use real links, an iframe and responsive CSS.

const APK_URL = 'https://github.com/MarcCodesAgain/forge/releases/latest/download/forge.apk';
const REPO_URL = 'https://github.com/MarcCodesAgain/forge';

const DISPLAY = 'Montserrat_800ExtraBold, Montserrat_700Bold, system-ui, sans-serif';
const HEADING = 'Montserrat_700Bold, system-ui, sans-serif';
const BODY = 'Inter_400Regular, system-ui, sans-serif';
const BODY_STRONG = 'Inter_600SemiBold, system-ui, sans-serif';

type IconName = ComponentProps<typeof Ionicons>['name'];

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'list-outline',
    title: 'Rutinas por días',
    body: 'Monta tu rutina de empuje, tirón y pierna (o la que sigas) con sus ejercicios, series, repeticiones y pesos. Más de 70 ejercicios para elegir, o añade los tuyos.',
  },
  {
    icon: 'timer-outline',
    title: 'Entrenos sin distracciones',
    body: 'Cada serie viene rellenada con tu objetivo y te recuerda lo que levantaste la última vez. Márcala como hecha y el descanso empieza a contar solo.',
  },
  {
    icon: 'trending-up-outline',
    title: 'Tu progreso, de un vistazo',
    body: 'Récords personales, la gráfica de peso de cada ejercicio, el volumen de la semana y tu racha de semanas entrenando.',
  },
  {
    icon: 'scale-outline',
    title: 'Peso corporal',
    body: 'Apunta tu peso cada mañana en dos toques y mira cómo evoluciona junto a tus entrenos.',
  },
  {
    icon: 'cloud-offline-outline',
    title: 'Funciona sin cobertura',
    body: 'El sótano del gimnasio no es problema: Forge no necesita internet para nada.',
  },
  {
    icon: 'lock-closed-outline',
    title: 'Sin cuenta, sin anuncios',
    body: 'Abres la app y entrenas. Tus datos se quedan en tu móvil, y puedes exportar una copia para pasarlos a uno nuevo.',
  },
];

function Button({ href, onClick, variant = 'primary', children, download }: {
  href: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  download?: boolean;
}) {
  return (
    <a className={`forge-btn forge-btn--${variant}`} href={href} onClick={onClick} download={download}>
      {children}
    </a>
  );
}

function Section({ id, title, children, intro }: { id: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="forge-section">
      <h2 id={id} style={styles.h2}>{title}</h2>
      {intro && <p style={styles.intro}>{intro}</p>}
      {children}
    </section>
  );
}

export default function Landing() {
  const router = useRouter();
  const openApp = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/home');
  };

  return (
    <div style={styles.page}>
      <style>{CSS}</style>
      <div style={styles.container}>
        <header style={styles.header}>
          <span style={styles.wordmark} aria-label="Forge">FORGE</span>
          <a className="forge-link" href="/home" onClick={openApp}>Abrir la app</a>
        </header>

        <main>
          <section className="forge-hero" aria-labelledby="hero-title">
            <div>
              <h1 id="hero-title" style={styles.h1}>
                Apunta cada serie.
                <br />
                <span style={{ color: Colors.accent }}>Mira cómo subes.</span>
              </h1>
              <p style={styles.lead}>
                Forge es tu libreta de gimnasio en el móvil: rutinas, pesos, descansos y progreso, sin crear una cuenta
                y sin necesitar cobertura.
              </p>
              <div className="forge-ctas">
                <Button href={APK_URL} download>
                  <Ionicons name="logo-android" size={18} color="#080808" />
                  Descargar para Android
                </Button>
                <Button href="/home" onClick={openApp} variant="secondary">
                  Usar en el navegador
                </Button>
              </div>
              <p style={styles.small}>
                ¿iPhone? Ábrela en Safari y añádela a la pantalla de inicio: funciona como una app más.
              </p>
            </div>

            <figure className="forge-phone" aria-label="La app de Forge funcionando: pruébala aquí mismo">
              <div style={styles.phone}>
                <iframe title="Forge" src="/home" style={styles.iframe} />
              </div>
              <figcaption style={styles.caption}>Es la app real: tócala.</figcaption>
            </figure>
          </section>

          <Section id="features" title="Lo que hace por ti">
            <ul className="forge-features">
              {FEATURES.map((f) => (
                <li key={f.title} style={styles.feature}>
                  <span style={styles.featureIcon} aria-hidden="true">
                    <Ionicons name={f.icon} size={20} color={Colors.accent} />
                  </span>
                  <div>
                    <h3 style={styles.h3}>{f.title}</h3>
                    <p style={styles.body}>{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="install"
            title="Cómo instalarla"
            intro="Forge aún no está en las tiendas, pero puedes usarla hoy mismo en cualquier dispositivo."
          >
            <div className="forge-install">
              <div style={styles.platform}>
                <h3 style={styles.h3}>
                  <Ionicons name="logo-android" size={18} color={Colors.accent} /> Android
                </h3>
                <ol style={styles.steps}>
                  <li>Descarga el fichero <code style={styles.code}>forge.apk</code> desde tu móvil.</li>
                  <li>Ábrelo. Android te pedirá permitir instalar apps desde el navegador: acéptalo solo para esta.</li>
                  <li>Pulsa Instalar y abre Forge.</li>
                </ol>
                <Button href={APK_URL} download>Descargar forge.apk</Button>
              </div>
              <div style={styles.platform}>
                <h3 style={styles.h3}>
                  <Ionicons name="logo-apple" size={18} color={Colors.accent} /> iPhone
                </h3>
                <ol style={styles.steps}>
                  <li>Abre esta página en Safari.</li>
                  <li>Pulsa Compartir y elige «Añadir a pantalla de inicio».</li>
                  <li>Forge aparecerá junto al resto de tus apps.</li>
                </ol>
              </div>
              <div style={styles.platform}>
                <h3 style={styles.h3}>
                  <Ionicons name="desktop-outline" size={18} color={Colors.accent} /> Navegador
                </h3>
                <p style={styles.body}>
                  Funciona en cualquier navegador moderno, en el móvil o en el ordenador. Lo que guardes se queda en ese
                  navegador.
                </p>
                <Button href="/home" onClick={openApp} variant="secondary">Abrir Forge</Button>
              </div>
            </div>
          </Section>

          <Section id="privacy" title="Tus entrenos son tuyos">
            <p style={{ ...styles.body, maxWidth: 640 }}>
              Forge no tiene servidores: no envía tus datos a ningún sitio, no usa analítica ni publicidad y no te pide
              registrarte. Puedes borrarlo todo desde Ajustes cuando quieras.{' '}
              <a className="forge-link" href="/privacy">Lee la política de privacidad</a>.
            </p>
          </Section>
        </main>

        <footer style={styles.footer}>
          <span>Forge es un proyecto de portfolio, hecho con React Native y Expo.</span>
          <span style={{ display: 'flex', gap: 20 }}>
            <a className="forge-link" href={REPO_URL} target="_blank" rel="noreferrer">Código en GitHub</a>
            <a className="forge-link" href="/privacy">Privacidad</a>
          </span>
        </footer>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  // ScrollViewStyleReset locks body scrolling on web, so the page scrolls itself.
  page: { height: '100%', overflowY: 'auto', backgroundColor: Colors.background, color: Colors.text, fontFamily: BODY },
  container: { maxWidth: 1120, margin: '0 auto', padding: '0 20px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0' },
  wordmark: { fontFamily: DISPLAY, fontStyle: 'italic', fontSize: 26, letterSpacing: 1, color: Colors.accent },
  h1: { fontFamily: DISPLAY, fontSize: 'clamp(38px, 5.4vw, 64px)', lineHeight: 1.04, letterSpacing: -1.2, margin: 0 },
  lead: { fontSize: 19, lineHeight: 1.6, color: Colors.textSecondary, maxWidth: 520, margin: '24px 0 0' },
  small: { fontSize: 14, lineHeight: 1.5, color: Colors.textTertiary, margin: '14px 0 0', maxWidth: 480 },
  phone: {
    width: 330, height: 680, borderRadius: 46, padding: 10, backgroundColor: '#161616',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px -40px rgba(255,107,0,0.45)',
  },
  iframe: { width: '100%', height: '100%', border: 0, borderRadius: 36, backgroundColor: Colors.background },
  caption: { marginTop: 14, textAlign: 'center', fontSize: 14, color: Colors.textTertiary },
  h2: { fontFamily: HEADING, fontSize: 'clamp(28px, 3.4vw, 40px)', lineHeight: 1.15, margin: 0, letterSpacing: -0.5 },
  intro: { fontSize: 17, lineHeight: 1.6, color: Colors.textSecondary, margin: '12px 0 0', maxWidth: 640 },
  h3: { fontFamily: BODY_STRONG, fontSize: 17, margin: 0, display: 'flex', alignItems: 'center', gap: 8 },
  body: { fontSize: 16, lineHeight: 1.6, color: Colors.textSecondary, margin: '6px 0 0' },
  feature: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  featureIcon: {
    width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center',
    justifyContent: 'center', backgroundColor: Colors.accentDim,
  },
  platform: { display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' },
  steps: { margin: 0, paddingLeft: 20, fontSize: 16, lineHeight: 1.6, color: Colors.textSecondary, display: 'grid', gap: 6 },
  code: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14, color: Colors.text },
  footer: {
    display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', padding: '32px 0 40px',
    marginTop: 40, borderTop: `1px solid ${Colors.borderVariant}`, fontSize: 14, color: Colors.textTertiary,
  },
};

const CSS = `
.forge-hero { display: grid; grid-template-columns: 1.1fr auto; gap: 64px; align-items: center; padding: 48px 0 88px; }
.forge-phone { margin: 0; }
.forge-ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.forge-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 22px; border-radius: 14px;
  font-family: ${BODY_STRONG}; font-size: 16px; text-decoration: none; transition: transform .15s ease, background-color .15s ease; }
.forge-btn--primary { background: ${Colors.accent}; color: #080808; }
.forge-btn--primary:hover { background: #ff7f22; }
.forge-btn--secondary { background: ${Colors.surfaceHigh}; color: ${Colors.text}; border: 1px solid ${Colors.borderVariant}; }
.forge-btn--secondary:hover { background: ${Colors.surfaceHighest}; }
.forge-btn:active { transform: translateY(1px); }
.forge-link { color: ${Colors.accent}; text-decoration: none; font-family: ${BODY_STRONG}; font-size: 15px; }
.forge-link:hover { text-decoration: underline; }
.forge-btn:focus-visible, .forge-link:focus-visible { outline: 2px solid ${Colors.accent}; outline-offset: 3px; }
.forge-section { padding: 72px 0; border-top: 1px solid ${Colors.borderVariant}; }
.forge-features { list-style: none; margin: 40px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px 56px; }
.forge-install { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; margin-top: 40px; }
@media (max-width: 900px) {
  .forge-hero { grid-template-columns: 1fr; padding: 24px 0 56px; }
  .forge-phone { display: none; }
  .forge-features, .forge-install { grid-template-columns: 1fr; }
  .forge-section { padding: 56px 0; }
}
@media (max-width: 520px) {
  .forge-ctas .forge-btn { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .forge-btn { transition: none; } }
`;
