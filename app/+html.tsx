import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// Root HTML for the web build (rendered in Node at export time).
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="Forge: registra tus entrenos de gimnasio. Rutinas, series, pesos y progreso, sin cuenta y sin conexión." />
        <meta name="theme-color" content="#080808" />
        <ScrollViewStyleReset />
        {/* The app is dark-only: paint the page dark before JS loads to avoid a white flash. */}
        <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #080808; }' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
