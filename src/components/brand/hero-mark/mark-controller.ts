/**
 * Comportamiento del ojo y de la profundidad del logo, cuadro a cuadro.
 * Port de design/xamanek-movimiento.html: apertura inicial, sacadas y seguimiento suave,
 * microsacadas, parpadeos (espontáneos, al notar al visitante y en saltos de mirada),
 * entrecerrar si el cursor se acerca, pupila que reacciona y capas en paralaje.
 */
import { CX, CY, type Lash, type MarkHandles } from './build-mark';

const NS = 'http://www.w3.org/2000/svg';
type Point = [number, number];

// Esquinas del ojo
const L0 = 226;
const L1 = CY + 3;
const R0 = 374;
const R1 = CY - 2;
// Recorrido máximo de la mirada (unidades del viewBox)
const MX = 32;
const MY = 12;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
const f2 = (n: number) => n.toFixed(2);
const f1 = (n: number) => n.toFixed(1);
/** Cuantiza a 0.05 unidades del viewBox (imperceptible) para no reescribir el DOM por temblores mínimos */
const q = (n: number) => Math.round(n * 20) / 20;

const bez = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const bezD = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const u = 1 - t;
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
};
const cub = (a: Point, b: Point, c: Point, d: Point, dy: number) =>
  `M${f2(a[0])} ${f2(a[1] + dy)} C${f2(b[0])} ${f2(b[1] + dy)} ${f2(c[0])} ${f2(c[1] + dy)} ${f2(d[0])} ${f2(d[1] + dy)}`;

export interface MarkController {
  /** Avanza un cuadro (t = performance.now()) */
  frame(t: number): void;
  /** Posición del puntero en coordenadas de pantalla */
  pointer(x: number, y: number): void;
  /** El puntero salió de la ventana */
  leave(): void;
  /** Toque/clic sobre el logo: parpadeo + onda */
  tap(): void;
}

export function createMarkController(
  svg: SVGSVGElement,
  h: MarkHandles,
  { reduce }: { reduce: boolean },
): MarkController {
  function setLids(f: number, gyR: number, widen: number, squint: number) {
    const ouOpen = (1 + 0.14 * widen) * (1 - 0.3 * squint);
    const olOpen = (1 + 0.04 * widen) * (1 - 0.4 * squint) * (0.85 + 0.15 * f);
    const ld1 = 34 * olOpen;
    const ld2 = 32 * olOpen;
    const P0: Point = [L0, L1];
    const P3: Point = [R0, R1];
    const U1: Point = [L0 + 30, L1 + lerp(ld1 * 0.95, -44 * ouOpen + gyR * 0.5, f)];
    const U2: Point = [R0 - 48, R1 + lerp(ld2 * 0.95, -48 * ouOpen + gyR * 0.5, f)];
    const D1: Point = [R0 - 32, R1 + ld2 + gyR * 0.25];
    const D2: Point = [L0 + 42, L1 + ld1 + gyR * 0.25];

    h.aperture.setAttribute(
      'd',
      `${cub(P0, U1, U2, P3, 0)} C${f2(D1[0])} ${f2(D1[1])} ${f2(D2[0])} ${f2(D2[1])} ${f2(L0)} ${f2(L1)} Z`,
    );
    const up = cub(P0, U1, U2, P3, 0);
    const lo = cub(P3, D1, D2, P0, 0);
    h.lidUpperThick.setAttribute('d', up);
    h.lashLineUpper.setAttribute('d', up);
    h.shadowUpper.setAttribute('d', up);
    h.lidUpperRim.setAttribute('d', cub(P0, U1, U2, P3, -3.5));
    h.lidLowerThick.setAttribute('d', lo);
    h.lashLineLower.setAttribute('d', lo);
    h.shadowLower.setAttribute('d', lo);
    h.lidLowerRim.setAttribute('d', cub(P3, D1, D2, P0, 2.5));
    h.water.setAttribute('d', cub(P3, D1, D2, P0, -1.6));

    const cy1 = CY - 60 - 8 * f;
    const cy2 = CY - 66 - 8 * f;
    const crease = `M${L0 - 10} ${L1 - 8} C${L0 + 26} ${f2(cy1)} ${R0 - 46} ${f2(cy2)} ${R0 + 10} ${R1 - 12}`;
    h.crease.setAttribute('d', crease);
    h.creaseShadow.setAttribute('d', crease);
    h.creaseShadow.setAttribute('transform', 'translate(0 2)');

    h.lashesUpper.setAttribute('d', upperLashes(f, P0, U1, U2, P3, h.lashUpper));
    h.lashesLower.setAttribute('d', lowerLashes(P3, D1, D2, P0, h.lashLower));
  }

  function upperLashes(f: number, P0: Point, U1: Point, U2: Point, P3: Point, lashes: Lash[]) {
    let d = '';
    for (const l of lashes) {
      const b = bez(P0, U1, U2, P3, l.t);
      const tg = bezD(P0, U1, U2, P3, l.t);
      const tl = Math.hypot(tg[0], tg[1]) || 1;
      const tx = tg[0] / tl;
      const ty = tg[1] / tl;
      const nx = ty;
      const ny = -tx;
      let dx = nx * f + tx * (l.t - 0.5) * 1.2;
      let dy = ny * f + 0.8 * (1 - f) + ty * (l.t - 0.5) * 1.2;
      const dl = Math.hypot(dx, dy) || 1;
      dx /= dl;
      dy /= dl;
      const len = (6 + 9 * Math.pow(Math.sin(Math.PI * l.t), 0.7)) * (0.85 + 0.3 * l.t) * l.j;
      const cx = b[0] + (nx * f + dx * (1 - f)) * len * 0.6;
      const cy = b[1] + (ny * f + dy * (1 - f)) * len * 0.6 + l.c * len;
      d += `M${f2(b[0])} ${f2(b[1])} Q${f2(cx)} ${f2(cy)} ${f2(b[0] + dx * len)} ${f2(b[1] + dy * len)}`;
    }
    return d;
  }

  function lowerLashes(P3: Point, D1: Point, D2: Point, P0: Point, lashes: Lash[]) {
    let d = '';
    for (const l of lashes) {
      const b = bez(P3, D1, D2, P0, l.t);
      const tg = bezD(P3, D1, D2, P0, l.t);
      const tl = Math.hypot(tg[0], tg[1]) || 1;
      const nx = tg[1] / tl;
      const ny = -tg[0] / tl;
      const len = (2.6 + 2.6 * Math.sin(Math.PI * l.t)) * l.j;
      d += `M${f2(b[0])} ${f2(b[1])} L${f2(b[0] + nx * len)} ${f2(b[1] + ny * len)}`;
    }
    return d;
  }

  // ---------- mirada hacia el visitante ----------
  const pt = svg.createSVGPoint();
  function gazeFor(px: number, py: number) {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0, d: 999 };
    pt.x = CX;
    pt.y = CY;
    const c = pt.matrixTransform(m);
    const dx = px - c.x;
    const dy = py - c.y;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(d / (260 * m.a + 120), 1);
    return { x: (dx / d) * k, y: (dy / d) * k, d: d / m.a };
  }

  // ---------- estado ----------
  const t0 = performance.now();
  let last = t0;
  let introDone = reduce;
  let ptr: { x: number; y: number } | null = null;
  let lastPtr = -1e9;
  let gx = 0;
  let gy = 0;
  let fixX = 0;
  let fixY = 0;
  let micX = 0;
  let micY = 0;
  let nextMicro = 0;
  let saccUntil = 0;
  let refractory = 0;
  let widen = 0;
  let squint = 0;
  let nearT = 0;
  let pr = 10.5;
  let prBoost = 0;
  let wasActive = false;
  let lookAway: { x: number; y: number; until: number } | null = null;
  let nextLookAway = t0 + 11000;
  let blinkAt = -1;
  let blinkDepth = 1;
  let nextBlink = Infinity;
  let px = 0;
  let lastLidKey = '';
  let py = 0;
  const queue: number[] = [];

  const queueBlink = (at: number) => {
    if (introDone) queue.push(at);
  };

  function introOpen(t: number) {
    const e = t - t0;
    if (e < 2900) return 0;
    if (e < 3150) return ease((e - 2900) / 250) * 0.35;
    if (e < 3270) return 0.35 - ease((e - 3150) / 120) * 0.25;
    if (e < 3900) return 0.1 + ease((e - 3270) / 630) * 0.9;
    return 1;
  }

  function blinkFactor(t: number) {
    if (blinkAt < 0) return 1;
    const e = t - blinkAt;
    const lo = 1 - blinkDepth;
    if (e < 70) return lerp(1, lo, e / 70);
    if (e < 110) return lo;
    if (e < 270) return lerp(lo, 1, ease((e - 110) / 160));
    blinkAt = -1;
    return 1;
  }

  function startBlink(t: number, depth: number) {
    if (blinkAt < 0) {
      blinkAt = t;
      blinkDepth = depth;
    }
  }

  function notice(t: number) {
    widen = 1;
    prBoost = 3;
    queueBlink(t + 380 + Math.random() * 200);
    if (Math.random() < 0.3) queueBlink(t + 720);
  }

  function frame(t: number) {
    const dt = Math.min(t - last, 50);
    last = t;
    const base = reduce ? 1 : introOpen(t);
    if (!introDone && t - t0 > 5400) {
      introDone = true;
      nextBlink = t + 2200 + Math.random() * 2500;
    }
    const active = ptr !== null && t - lastPtr < 2600;
    let dX = 0;
    let dY = 0;
    let near = false;

    if (!introDone) {
      // Al abrir: mira al frente, luego a un lado y al otro
      const e = t - t0;
      if (e < 4100) {
        dY = 0.15;
      } else if (e < 4700) {
        dX = -0.95;
        dY = 0.1;
      } else if (e < 5300) {
        dX = 0.95;
        dY = 0.05;
      }
    } else {
      if (active && ptr) {
        const g = gazeFor(ptr.x, ptr.y);
        dX = g.x;
        dY = g.y;
        near = g.d < 120;
        if (!wasActive && !reduce) notice(t);
      }
      if (!reduce) {
        if (lookAway && t > lookAway.until) {
          lookAway = null;
          nextLookAway = t + 3500 + Math.random() * 5000;
          if (Math.random() < 0.35) queueBlink(t + 40);
        } else if (!lookAway && t > nextLookAway && !near) {
          const a = Math.random() * Math.PI * 2;
          const m = 0.45 + Math.random() * 0.45;
          lookAway = {
            x: Math.cos(a) * m,
            y: Math.sin(a) * m * 0.7,
            until: t + 500 + Math.random() * 900,
          };
        }
        if (lookAway) {
          dX = lookAway.x;
          dY = lookAway.y;
        }
      }
    }
    wasActive = active;

    // Sacadas rápidas para saltos grandes, seguimiento suave para movimientos cortos
    const amp = Math.hypot(dX - fixX, dY - fixY);
    if (amp > 0.16 && t > refractory) {
      fixX = dX;
      fixY = dY;
      saccUntil = t + 90;
      refractory = t + 140 + Math.random() * 80;
      if (introDone && !reduce && amp > 0.7 && Math.random() < 0.3) queueBlink(t + 20);
    } else if (amp <= 0.16) {
      fixX += (dX - fixX) * 0.1;
      fixY += (dY - fixY) * 0.1;
    }
    // Microsacadas y temblor de fijación
    if (!reduce && t > nextMicro) {
      micX = (Math.random() - 0.5) * 0.06;
      micY = (Math.random() - 0.5) * 0.045;
      nextMicro = t + 300 + Math.random() * 700;
      saccUntil = Math.max(saccUntil, t + 40);
    }
    const trX = reduce ? 0 : Math.sin(t * 0.083) * 0.004 + Math.sin(t * 0.131) * 0.003;
    const trY = reduce ? 0 : Math.sin(t * 0.097) * 0.003 + Math.sin(t * 0.149) * 0.003;
    const k = t < saccUntil ? 0.5 : 0.2;
    gx += ((fixX + micX + trX) * MX - gx) * k;
    gy += ((fixY + micY + trY) * MY - gy) * k;

    // Parpadeos: espontáneos, al notar al visitante y en cambios grandes de mirada
    if (introDone && !reduce && t > nextBlink) {
      queue.push(t);
      if (Math.random() < 0.15) queue.push(t + 330);
      nextBlink = t + 2200 + Math.random() * 3300;
    }
    if (queue.length && blinkAt < 0) {
      queue.sort((a, b) => a - b);
      if (t >= queue[0]) {
        queue.shift();
        startBlink(t, Math.random() < 0.2 ? 0.65 : 1);
      }
    }
    const bf = blinkFactor(t);

    // Entrecierra el ojo si te acercas demasiado; se abre de golpe al notarte
    nearT = near ? nearT + dt : 0;
    squint += ((nearT > 900 ? 1 : 0) - squint) * 0.04;
    widen *= Math.pow(0.997, dt);

    // Pupila: se contrae rápido con la luz y al acercarte, se dilata lento
    let tp = 10.5 + (near ? -2.6 : 0) + prBoost;
    prBoost *= Math.pow(0.998, dt);
    if (!reduce) {
      const c = t - t0 - 6000;
      if (c > 0) {
        const m = c % 10000;
        if (m > 4200 && m < 4800) tp = 6; // destello de la piedra angular
      }
    }
    pr += (tp - pr) * (tp < pr ? 0.12 : 0.04);
    const hippus = reduce ? 0 : Math.sin(t / 900) * 0.25 + Math.sin(t / 2300) * 0.2;

    const gyR = q(gy - 8 * (1 - bf));
    const qx = q(gx);
    const lidKey = `${(base * bf).toFixed(3)}|${gyR}|${widen.toFixed(3)}|${squint.toFixed(3)}`;
    if (lidKey !== lastLidKey) {
      lastLidKey = lidKey;
      setLids(base * bf, gyR, widen, squint);
    }
    write(h.iris, 'transform', `translate(${f2(qx)} ${f2(gyR)})`);
    write(h.reflections, 'transform', `translate(${f2(qx * 0.8)} ${f2(gyR * 0.8)})`);
    write(h.pupil, 'r', f2(q(pr + hippus)));
    write(h.pupilRuff, 'r', f2(q(pr + hippus) + 0.6));

    // Profundidad: las capas se separan siguiendo al visitante
    let nx = 0;
    let ny = 0;
    if (!reduce) {
      if (active && ptr) {
        nx = (ptr.x / window.innerWidth) * 2 - 1;
        ny = (ptr.y / window.innerHeight) * 2 - 1;
      } else {
        nx = Math.sin(t / 4200) * 0.25;
        ny = Math.cos(t / 5100) * 0.2;
      }
    }
    px += (nx - px) * 0.06;
    py += (ny - py) * 0.06;
    write(h.raysParallax, 'transform', `translate(${f1(-px * 12)} ${f1(-py * 9)})`);
    write(h.haloParallax, 'transform', `translate(${f1(-px * 6)} ${f1(-py * 4)})`);
    write(h.capParallax, 'transform', `translate(${f1(px * 5)} ${f1(py * 4)})`);
  }

  // Solo toca el DOM si el valor cambió: evita repintar el SVG cuando el ojo está quieto
  const written = new Map<Element, Record<string, string>>();
  function write(node: Element, attr: string, value: string) {
    const prev = written.get(node) ?? {};
    if (prev[attr] === value) return;
    prev[attr] = value;
    written.set(node, prev);
    node.setAttribute(attr, value);
  }

  function ripple() {
    if (reduce) return;
    const c = document.createElementNS(NS, 'circle');
    for (const [key, value] of Object.entries({
      cx: CX,
      cy: CY,
      r: 230,
      fill: 'none',
      class: 's-goldhi ripple',
      'stroke-width': 2,
    })) {
      c.setAttribute(key, String(value));
    }
    c.addEventListener('animationend', () => c.remove());
    h.rippleLayer.appendChild(c);
  }

  // Estado inicial: ojo cerrado (o abierto con movimiento reducido)
  setLids(reduce ? 1 : 0, 0, 0, 0);

  return {
    frame,
    pointer(x, y) {
      ptr = { x, y };
      lastPtr = performance.now();
    },
    leave() {
      lastPtr = -1e9;
    },
    tap() {
      queueBlink(performance.now());
      ripple();
    },
  };
}
