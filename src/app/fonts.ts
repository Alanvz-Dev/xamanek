import { Inter, JetBrains_Mono, Sora } from 'next/font/google';

// Sora: títulos · Inter: texto · JetBrains Mono: cifras y precios
export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const fontVariables = `${sora.variable} ${inter.variable} ${jetbrains.variable}`;
