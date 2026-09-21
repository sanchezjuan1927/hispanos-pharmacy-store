import './globals.css';
import { StoreProvider } from '../context/StoreContext';

export const metadata = {
  title: 'Hispanos Pharmacy - Tu farmacia de confianza en Queens',
  description:
    'Compra medicinas, alimentos, productos de limpieza y utilidades en línea. Entrega a domicilio en Queens, NY. Buy medicines, food, cleaning supplies and utilities online.',
  keywords: 'farmacia, pharmacy, Queens, NY, delivery, entrega, medicinas, medicines',
  openGraph: {
    title: 'Hispanos Pharmacy',
    description: 'Tu farmacia de confianza en Queens, NY',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom stays enabled on purpose: many customers here are older and
  // pinch to read. Locking the scale would work against them.
  themeColor: '#103357',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
