import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { QueryProvider } from '@/components/providers/query-provider';
import { AppInitializer } from '@/components/providers/app-initializer';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: 'BondCalc | Valoración de Bonos',
  description: 'Calculadora financiera para la valoración de bonos y análisis de riesgo.',
  icons: [{ rel: "icon", url: "/favicon.ico" }], // Asume que tienes un favicon.ico en la carpeta /public
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AppInitializer />
            {children}
            <Toaster position="top-right" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}