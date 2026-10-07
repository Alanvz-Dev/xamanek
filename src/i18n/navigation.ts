import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Usa SIEMPRE estos helpers (no los de next/link o next/navigation) para que
// los enlaces respeten el idioma y las rutas traducidas.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
