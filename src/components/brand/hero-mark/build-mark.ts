/**
 * Construye el SVG del logo animado (pirámide maya, piedra angular dorada y ojo realista).
 * Port fiel de design/xamanek-movimiento.html: misma geometría y misma semilla aleatoria,
 * así el iris, las venas y las pestañas quedan idénticos al diseño original.
 * Devuelve las referencias que el controlador anima en cada cuadro.
 */

const NS = 'http://www.w3.org/2000/svg';
export const CX = 300;
export const CY = 243;
export const VIEWBOX = '0 -40 600 680';

type Attrs = Record<string, string | number>;

const rad = (d: number) => (d * Math.PI) / 180;
const pol = (r: number, a: number): [number, number] => [
  CX + r * Math.sin(rad(a)),
  CY - r * Math.cos(rad(a)),
];

export interface Lash {
  t: number;
  j: number;
  c: number;
}

export interface MarkHandles {
  aperture: SVGPathElement;
  crease: SVGPathElement;
  creaseShadow: SVGPathElement;
  iris: SVGGElement;
  pupil: SVGCircleElement;
  pupilRuff: SVGCircleElement;
  reflections: SVGGElement;
  shadowUpper: SVGPathElement;
  shadowLower: SVGPathElement;
  water: SVGPathElement;
  lidUpperThick: SVGPathElement;
  lidUpperRim: SVGPathElement;
  lidLowerThick: SVGPathElement;
  lidLowerRim: SVGPathElement;
  lashLineUpper: SVGPathElement;
  lashLineLower: SVGPathElement;
  lashesUpper: SVGPathElement;
  lashesLower: SVGPathElement;
  lashUpper: Lash[];
  lashLower: Lash[];
  rippleLayer: SVGGElement;
  raysParallax: SVGGElement;
  haloParallax: SVGGElement;
  capParallax: SVGGElement;
}

export function buildMark(svg: SVGSVGElement): MarkHandles {
  function el<T extends SVGElement = SVGElement>(tag: string, attrs: Attrs, parent: Element = svg) {
    const node = document.createElementNS(NS, tag) as T;
    for (const key in attrs) node.setAttribute(key, String(attrs[key]));
    parent.appendChild(node);
    return node;
  }

  // ---------- definiciones ----------
  const defs = el('defs', {});
  const glowGrad = el('radialGradient', { id: 'xmk-glowGrad' }, defs);
  el('stop', { offset: '0', class: 'g0' }, glowGrad);
  el('stop', { offset: '1', class: 'g1' }, glowGrad);
  const capGrad = el('linearGradient', { id: 'xmk-capGrad', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: '0', class: 'c0' }, capGrad);
  el('stop', { offset: '.5', class: 'c1' }, capGrad);
  el('stop', { offset: '1', class: 'c2' }, capGrad);
  const blurFilter = (id: string, deviation: string) => {
    const f = el('filter', { id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feGaussianBlur', { stdDeviation: deviation }, f);
  };
  blurFilter('xmk-blur6', '6');
  blurFilter('xmk-blur3', '3');
  const CAP = 'M300 80 L440 324 L160 324 Z';
  const capClip = el('clipPath', { id: 'xmk-capClip' }, defs);
  el('path', { d: CAP }, capClip);
  const apertureClip = el('clipPath', { id: 'xmk-aperture' }, defs);
  const aperture = el<SVGPathElement>('path', { d: '' }, apertureClip);

  // ---------- resplandor que respira + estallido ----------
  const glowWrap = el('g', { class: 'glow' });
  el('circle', { cx: CX, cy: CY, r: 190, fill: 'url(#xmk-glowGrad)', class: 'breathe' }, glowWrap);
  el('circle', { cx: CX, cy: CY, r: 230, fill: 'url(#xmk-glowGrad)', class: 'burst' });

  // ---------- rayos (dos capas girando en sentidos opuestos) ----------
  const raysParallax = el<SVGGElement>('g', {});
  const raysIn = el('g', { class: 'rays' }, raysParallax);
  const raysMain = el('g', { class: 'spin', 'stroke-linecap': 'round' }, raysIn);
  for (let a = 0; a < 360; a += 4) {
    const long = (a / 4) % 3 === 0;
    const r2 = long ? 272 : 222 + ((((a * 7919) % 23) + 23) % 23);
    const [x1, y1] = pol(200, a);
    const [x2, y2] = pol(r2, a);
    el(
      'line',
      {
        x1,
        y1,
        x2,
        y2,
        class: long ? 's-goldhi' : 's-gold',
        'stroke-width': long ? 1.6 : 0.9,
        opacity: long ? 1 : 0.6,
      },
      raysMain,
    );
  }
  const raysFine = el('g', { class: 'spin-rev', 'stroke-linecap': 'round' }, raysIn);
  for (let a = 1.5; a < 360; a += 3) {
    const r2 = 206 + ((((a * 104729) % 31) + 31) % 31);
    const [x1, y1] = pol(194, a);
    const [x2, y2] = pol(r2, a);
    el('line', { x1, y1, x2, y2, class: 's-gold', 'stroke-width': 0.5, opacity: 0.35 }, raysFine);
  }

  // ---------- halo con rumbos (gira lento) y Estrella Polar fija ----------
  const haloParallax = el<SVGGElement>('g', {});
  el(
    'circle',
    {
      cx: CX,
      cy: CY,
      r: 185,
      fill: 'none',
      class: 's-gold draw',
      pathLength: 1,
      style: '--d:.1s;--t:2.2s',
      'stroke-width': 1.2,
      opacity: 0.85,
    },
    haloParallax,
  );
  el(
    'circle',
    {
      cx: CX,
      cy: CY,
      r: 162,
      fill: 'none',
      class: 's-golddeep draw',
      pathLength: 1,
      style: '--d:.5s;--t:2.2s',
      'stroke-width': 0.6,
    },
    haloParallax,
  );
  const ticksFade = el('g', { class: 'fade', style: '--d:1.4s' }, haloParallax);
  const ticks = el('g', { class: 'spin-slow' }, ticksFade);
  for (let a = 5; a < 360; a += 5) {
    const len = a % 90 === 0 ? 16 : a % 15 === 0 ? 10 : 5;
    const [x1, y1] = pol(185, a);
    const [x2, y2] = pol(185 - len, a);
    el(
      'line',
      {
        x1,
        y1,
        x2,
        y2,
        class: a % 15 === 0 ? 's-gold' : 's-golddeep',
        'stroke-width': a % 90 === 0 ? 1.4 : 0.7,
      },
      ticks,
    );
  }
  const starWrap = el('g', { class: 'fade', style: '--d:2.5s' }, haloParallax);
  const STAR = 'M300 42 L304 54 L316 58 L304 62 L300 74 L296 62 L284 58 L296 54 Z';
  el(
    'path',
    { d: STAR, class: 'f-goldhi twinkle', filter: 'url(#xmk-blur6)', opacity: 0.9 },
    starWrap,
  );
  el('path', { d: STAR, class: 'f-goldhi twinkle' }, starWrap);

  // ---------- pirámide escalonada (9 cuerpos) ----------
  const pyramid = el('g', { 'stroke-linejoin': 'round' });
  const tiers: { yb: number; yt: number }[] = [];
  for (let i = 0; i < 9; i++) {
    const yb = 620 - 30 * i;
    const yt = yb - 30;
    const hb = 240 - (i * 120) / 9;
    const ht = hb - 5;
    tiers.push({ yb, yt });
    el(
      'path',
      {
        d: `M${CX - hb} ${yb} L${CX - ht} ${yt} L${CX + ht} ${yt} L${CX + hb} ${yb} Z`,
        class: 's-ink f-bg draw',
        pathLength: 1,
        style: `--d:${(0.15 + i * 0.11).toFixed(2)}s`,
        'stroke-width': 1.5,
      },
      pyramid,
    );
    el(
      'line',
      {
        x1: CX - ht + 4,
        y1: yt + 9,
        x2: CX + ht - 4,
        y2: yt + 9,
        class: 's-gold draw',
        pathLength: 1,
        style: `--d:${(0.45 + i * 0.11).toFixed(2)}s`,
        'stroke-width': 0.8,
        opacity: 0.8,
      },
      pyramid,
    );
  }

  // ---------- escalinata central ----------
  const stairs = el('g', { class: 'fade', style: '--d:1.3s' });
  el(
    'path',
    {
      d: 'M266 620 L274 350 L326 350 L334 620 Z',
      class: 's-ink f-bg',
      'stroke-width': 1.5,
      'stroke-linejoin': 'round',
    },
    stairs,
  );
  el(
    'line',
    { x1: 273, y1: 620, x2: 280.5, y2: 350, class: 's-gold', 'stroke-width': 1.2 },
    stairs,
  );
  el(
    'line',
    { x1: 327, y1: 620, x2: 319.5, y2: 350, class: 's-gold', 'stroke-width': 1.2 },
    stairs,
  );
  const steps: number[] = [];
  for (let y = 357.5; y < 620; y += 7.5) steps.push(y);
  steps.reverse().forEach((y, k) => {
    const t = (y - 350) / 270;
    el(
      'line',
      {
        x1: 280.5 - 7.5 * t,
        y1: y,
        x2: 319.5 + 7.5 * t,
        y2: y,
        class: 's-dim step',
        style: `--k:${k}`,
        'stroke-width': 0.8,
      },
      stairs,
    );
  });

  // ---------- serpiente de luz de Kukulkán (baja por la alfarda) ----------
  const serpent = el('g', { class: 'fade', style: '--d:2s' });
  const xb = (y: number) => 334 - (8 * (620 - y)) / 270;
  for (let j = 0; j < 7; j++) {
    const { yb, yt } = tiers[7 - j];
    const x = xb((yb + yt) / 2);
    el(
      'path',
      {
        d: `M${x} ${yt + 4} L${x + 11} ${(yb + yt) / 2} L${x} ${yb - 4} Z`,
        class: 'f-goldhi serp',
        style: `--j:${j}`,
      },
      serpent,
    );
  }
  // cabezas de serpiente en la base
  const heads = el('g', { class: 'fade', style: '--d:1.5s' });
  for (const [x, s] of [
    [248, 1],
    [352, -1],
  ] as const) {
    const x2 = x + 22 * s;
    el(
      'path',
      {
        d: `M${x} 620 L${x} 606 L${x2 - 4 * s} 604 L${x2} 609 L${x2} 620 Z`,
        class: 's-ink f-bg',
        'stroke-width': 1.3,
        'stroke-linejoin': 'round',
      },
      heads,
    );
    el(
      'path',
      {
        d: `M${x2} 613 L${x + 9 * s} 613 L${x + 9 * s} 616`,
        class: 's-gold',
        fill: 'none',
        'stroke-width': 0.9,
      },
      heads,
    );
    el(
      'circle',
      { cx: x + 14 * s, cy: 609, r: 7, class: 'f-goldhi head-glow', filter: 'url(#xmk-blur3)' },
      heads,
    );
    el('circle', { cx: x + 14 * s, cy: 609, r: 1.9, class: 'f-goldhi' }, heads);
  }

  // ---------- piedra angular dorada ----------
  const capParallax = el<SVGGElement>('g', {});
  const cap = el('g', { class: 'cap' }, capParallax);
  const floating = el('g', { class: 'float' }, cap);
  el(
    'path',
    {
      d: CAP,
      class: 's-goldhi capflash',
      fill: 'none',
      'stroke-width': 7,
      filter: 'url(#xmk-blur6)',
      'stroke-linejoin': 'round',
    },
    floating,
  );
  el(
    'path',
    {
      d: CAP,
      fill: 'url(#xmk-capGrad)',
      class: 's-goldhi',
      'stroke-width': 1.6,
      'stroke-linejoin': 'round',
    },
    floating,
  );
  const hatch = el('g', { 'clip-path': 'url(#xmk-capClip)', opacity: 0.32 }, floating);
  for (let y = 100; y < 324; y += 6) {
    el('line', { x1: 150, y1: y, x2: 450, y2: y, class: 's-golddeep', 'stroke-width': 0.6 }, hatch);
  }
  el(
    'path',
    {
      d: 'M300 104 L416 314 L184 314 Z',
      class: 's-golddeep',
      fill: 'none',
      'stroke-width': 0.9,
      'stroke-linejoin': 'round',
    },
    floating,
  );

  // ---------- definiciones del ojo realista ----------
  let seed = 20261006;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const gradient = (id: string, stops: [string, string][], attrs: Attrs = {}) => {
    const g = el('radialGradient', { id, ...attrs }, defs);
    for (const [offset, color] of stops) el('stop', { offset, 'stop-color': color }, g);
  };
  gradient(
    'xmk-scleraGrad',
    [
      ['0', '#FBF6EC'],
      ['.5', '#F1E7D6'],
      ['.8', '#DCC9B0'],
      ['1', '#A88C72'],
    ],
    { cx: '.5', cy: '.55', r: '.6' },
  );
  gradient('xmk-irisGrad', [
    ['0', '#2B1804'],
    ['.33', '#7A4C0E'],
    ['.48', '#C88E2A'],
    ['.62', '#E2AE45'],
    ['.8', '#B9822A'],
    ['.93', '#6A430E'],
    ['1', '#24160A'],
  ]);
  gradient('xmk-carGrad', [
    ['0', '#EDB2A8'],
    ['1', '#B4685F'],
  ]);
  blurFilter('xmk-soft', '.45');
  blurFilter('xmk-soft1', '.9');
  blurFilter('xmk-blur4', '4');
  blurFilter('xmk-blur9', '9');
  const noise = el(
    'filter',
    { id: 'xmk-irisNoise', x: 0, y: 0, width: '100%', height: '100%' },
    defs,
  );
  el(
    'feTurbulence',
    { type: 'fractalNoise', baseFrequency: '.85', numOctaves: '2', seed: '7' },
    noise,
  );
  el(
    'feColorMatrix',
    { type: 'matrix', values: '0 0 0 0 .16  0 0 0 0 .1  0 0 0 0 .03  1.6 0 0 0 -.55' },
    noise,
  );
  el('feComposite', { in2: 'SourceGraphic', operator: 'in' }, noise);

  // ---------- ojo ----------
  const eye = el('g', {}, floating);
  el(
    'ellipse',
    { cx: CX, cy: CY, rx: 96, ry: 54, fill: '#1A0E04', opacity: 0.5, filter: 'url(#xmk-blur9)' },
    eye,
  );
  const creaseShadow = el<SVGPathElement>(
    'path',
    {
      fill: 'none',
      stroke: '#1A0E04',
      'stroke-width': 4,
      opacity: 0.35,
      filter: 'url(#xmk-blur4)',
    },
    eye,
  );
  const crease = el<SVGPathElement>(
    'path',
    { fill: 'none', class: 's-golddeep', 'stroke-width': 1.8, 'stroke-linecap': 'round' },
    eye,
  );

  const inner = el('g', { 'clip-path': 'url(#xmk-aperture)' }, eye);
  el('rect', { x: 220, y: 190, width: 160, height: 110, fill: 'url(#xmk-scleraGrad)' }, inner);
  const veins = el('g', { fill: 'none', stroke: '#B8605A', 'stroke-linecap': 'round' }, inner);
  for (const side of [-1, 1]) {
    for (let v = 0; v < 4; v++) {
      let x = side < 0 ? 229 + rnd() * 6 : 371 - rnd() * 6;
      let y = CY + (rnd() - 0.5) * 22;
      let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
      for (let s = 0; s < 4; s++) {
        x += -side * (5 + rnd() * 6);
        y += (rnd() - 0.5) * 6;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      el('path', { d, 'stroke-width': (0.35 + rnd() * 0.3).toFixed(2), opacity: 0.28 }, veins);
    }
  }
  el(
    'ellipse',
    { cx: 233, cy: CY + 3, rx: 8, ry: 6.5, fill: 'url(#xmk-carGrad)', filter: 'url(#xmk-soft1)' },
    inner,
  );

  const iris = el<SVGGElement>('g', {}, inner);
  el(
    'circle',
    { cx: CX, cy: CY, r: 34, fill: '#2A1A08', opacity: 0.25, filter: 'url(#xmk-blur4)' },
    iris,
  );
  el('circle', { cx: CX, cy: CY, r: 30, fill: 'url(#xmk-irisGrad)' }, iris);
  const fibers = el('g', { fill: 'none', 'stroke-linecap': 'round' }, iris);
  for (let i = 0; i < 190; i++) {
    const a = rnd() * Math.PI * 2;
    const r1 = 10 + rnd() * 3;
    const r2 = 18 + rnd() * 11.5;
    const light = rnd() < 0.45;
    const ca = a + (rnd() - 0.5) * 0.14;
    const rm = (r1 + r2) / 2;
    el(
      'path',
      {
        d: `M${(CX + r1 * Math.cos(a)).toFixed(2)} ${(CY + r1 * Math.sin(a)).toFixed(2)} Q${(CX + rm * Math.cos(ca)).toFixed(2)} ${(CY + rm * Math.sin(ca)).toFixed(2)} ${(CX + r2 * Math.cos(a)).toFixed(2)} ${(CY + r2 * Math.sin(a)).toFixed(2)}`,
        stroke: light ? '#F6D58A' : '#4A2E08',
        'stroke-width': (0.3 + rnd() * 0.35).toFixed(2),
        opacity: (light ? 0.18 + rnd() * 0.3 : 0.2 + rnd() * 0.3).toFixed(2),
      },
      fibers,
    );
  }
  el(
    'circle',
    {
      cx: CX,
      cy: CY,
      r: 30,
      fill: '#FFFFFF',
      filter: 'url(#xmk-irisNoise)',
      opacity: 0.5,
      style: 'mix-blend-mode:multiply',
    },
    iris,
  );
  let collarette = '';
  for (let i = 0; i <= 120; i++) {
    const th = (i / 120) * Math.PI * 2;
    const r = 14.5 + 1.3 * Math.sin(11 * th + 1) + 0.7 * Math.sin(27 * th);
    collarette += `${i ? ' L' : 'M'}${(CX + r * Math.cos(th)).toFixed(2)} ${(CY + r * Math.sin(th)).toFixed(2)}`;
  }
  el(
    'path',
    { d: `${collarette} Z`, fill: 'none', stroke: '#F2C96A', 'stroke-width': 1.1, opacity: 0.5 },
    iris,
  );
  for (let i = 0; i < 8; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 17 + rnd() * 7;
    const cx = CX + r * Math.cos(a);
    const cy = CY + r * Math.sin(a);
    el(
      'ellipse',
      {
        cx,
        cy,
        rx: 1.6 + rnd() * 1.4,
        ry: 0.8 + rnd() * 0.6,
        fill: '#2A1805',
        opacity: 0.35,
        transform: `rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${cx.toFixed(2)} ${cy.toFixed(2)})`,
      },
      iris,
    );
  }
  el(
    'circle',
    {
      cx: CX,
      cy: CY,
      r: 29.3,
      fill: 'none',
      stroke: '#1A0F03',
      'stroke-width': 3,
      opacity: 0.75,
      filter: 'url(#xmk-soft1)',
    },
    iris,
  );
  const pupil = el<SVGCircleElement>(
    'circle',
    { cx: CX, cy: CY, r: 10.5, fill: '#060302', filter: 'url(#xmk-soft)' },
    iris,
  );
  const pupilRuff = el<SVGCircleElement>(
    'circle',
    { cx: CX, cy: CY, r: 11, fill: 'none', stroke: '#8A5A16', 'stroke-width': 0.9, opacity: 0.55 },
    iris,
  );

  const shadowUpper = el<SVGPathElement>(
    'path',
    {
      fill: 'none',
      stroke: '#1A0E04',
      'stroke-width': 15,
      opacity: 0.5,
      filter: 'url(#xmk-blur4)',
    },
    inner,
  );
  const shadowLower = el<SVGPathElement>(
    'path',
    {
      fill: 'none',
      stroke: '#1A0E04',
      'stroke-width': 7,
      opacity: 0.22,
      filter: 'url(#xmk-blur4)',
    },
    inner,
  );
  const reflections = el<SVGGElement>('g', {}, inner);
  el(
    'rect',
    {
      x: CX - 15,
      y: CY - 18,
      width: 9,
      height: 6.5,
      rx: 2,
      fill: '#FFFFFF',
      opacity: 0.9,
      filter: 'url(#xmk-soft)',
      transform: `rotate(-12 ${CX - 10} ${CY - 15})`,
    },
    reflections,
  );
  el('circle', { cx: CX + 12, cy: CY + 9, r: 1.3, fill: '#FFFFFF', opacity: 0.55 }, reflections);
  el(
    'path',
    {
      d: `M${CX - 26} ${CY - 6} A28 28 0 0 1 ${CX - 6} ${CY - 27}`,
      fill: 'none',
      stroke: '#FFFFFF',
      'stroke-width': 5,
      opacity: 0.13,
      filter: 'url(#xmk-soft1)',
    },
    reflections,
  );
  const water = el<SVGPathElement>(
    'path',
    { fill: 'none', stroke: '#FFF6E6', 'stroke-width': 0.9, opacity: 0.4 },
    inner,
  );

  const lidPath = (attrs: Attrs) => el<SVGPathElement>('path', { fill: 'none', ...attrs }, eye);
  const lidUpperThick = lidPath({
    class: 's-golddeep',
    'stroke-width': 6,
    'stroke-linecap': 'round',
  });
  const lidUpperRim = lidPath({
    class: 's-goldhi',
    'stroke-width': 1.1,
    opacity: 0.8,
    'stroke-linecap': 'round',
  });
  const lidLowerThick = lidPath({
    class: 's-golddeep',
    'stroke-width': 3.5,
    'stroke-linecap': 'round',
  });
  const lidLowerRim = lidPath({
    class: 's-goldhi',
    'stroke-width': 0.8,
    opacity: 0.6,
    'stroke-linecap': 'round',
  });
  const lashLineUpper = lidPath({
    stroke: '#160C03',
    'stroke-width': 1.8,
    'stroke-linecap': 'round',
  });
  const lashLineLower = lidPath({
    stroke: '#2A1A08',
    'stroke-width': 0.9,
    opacity: 0.7,
    'stroke-linecap': 'round',
  });
  const lashesUpper = lidPath({ stroke: '#140A02', 'stroke-width': 1, 'stroke-linecap': 'round' });
  const lashesLower = lidPath({
    stroke: '#2A1A08',
    'stroke-width': 0.7,
    opacity: 0.55,
    'stroke-linecap': 'round',
  });

  const lashUpper = Array.from({ length: 28 }, (_, i) => ({
    t: 0.07 + (i / 27) * 0.88,
    j: 0.8 + rnd() * 0.45,
    c: (rnd() - 0.5) * 0.3,
  }));
  const lashLower = Array.from({ length: 13 }, (_, i) => ({
    t: 0.14 + (i / 12) * 0.74,
    j: 0.7 + rnd() * 0.6,
    c: 0,
  }));

  const rippleLayer = el<SVGGElement>('g', {});

  return {
    aperture,
    crease,
    creaseShadow,
    iris,
    pupil,
    pupilRuff,
    reflections,
    shadowUpper,
    shadowLower,
    water,
    lidUpperThick,
    lidUpperRim,
    lidLowerThick,
    lidLowerRim,
    lashLineUpper,
    lashLineLower,
    lashesUpper,
    lashesLower,
    lashUpper,
    lashLower,
    rippleLayer,
    raysParallax,
    haloParallax,
    capParallax,
  };
}
