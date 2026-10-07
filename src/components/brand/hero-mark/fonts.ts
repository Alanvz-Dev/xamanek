import { Cinzel, Cormorant_Garamond } from 'next/font/google';

// Tipografías propias del logo animado (wordmark y lema). Solo se usan en el hero,
// sin preload para no competir con las fuentes del texto principal (LCP).
export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: '500',
  variable: '--font-cinzel',
  display: 'swap',
  preload: false,
});

export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
});

export const heroMarkFonts = `${cinzel.variable} ${cormorant.variable}`;
