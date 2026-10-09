import type { HTMLAttributes } from 'react';

// Web component del logo de IntelliFin (public/brand/partners/intellifin-logo.js)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'intellifin-logo': HTMLAttributes<HTMLElement> & {
        variant?: 'coral' | 'claro' | 'oscuro';
        height?: string;
        motion?: 'loop' | 'once' | 'none';
        'mark-only'?: '';
      };
    }
  }
}
