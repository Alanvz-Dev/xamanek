/** Une clases condicionales: cn('a', cond && 'b') */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');
