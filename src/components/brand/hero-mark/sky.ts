/**
 * Cielo del hero en <canvas>: estrellas que titilan, polvo dorado que asciende desde
 * el logo y estrellas fugaces ocasionales. Port de design/xamanek-movimiento.html,
 * adaptado para ocupar solo el hero (no toda la ventana).
 */

const STAR_RGB = '233,226,208';
const DUST_RGB = '255,210,110';

interface Star {
  x: number;
  y: number;
  r: number;
  p: number;
  s: number;
}
interface Dust {
  x: number;
  y: number;
  r: number;
  vy: number;
  ph: number;
  a: number;
}

export interface Sky {
  /** Recalcula tamaño; `originX` (0–1) es de dónde sube el polvo (centro del logo) */
  resize(originX: number): void;
  draw(t: number, dt: number): void;
  /** Un solo cuadro estático (prefers-reduced-motion) */
  drawStatic(): void;
}

export function createSky(canvas: HTMLCanvasElement): Sky {
  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let originX = 0.5;
  const small = window.innerWidth < 600;

  const stars: Star[] = Array.from({ length: small ? 55 : 120 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.1 + 0.3,
    p: Math.random() * 6.28,
    s: 0.6 + Math.random() * 1.6,
  }));
  const newDust = (init: boolean): Dust => ({
    x: originX + (Math.random() - 0.5) * (small ? 0.75 : 0.4),
    y: init ? Math.random() : 1.04,
    r: Math.random() * 1.7 + 0.4,
    vy: 0.00004 + Math.random() * 0.00009,
    ph: Math.random() * 6.28,
    a: 0.35 + Math.random() * 0.6,
  });
  const dust: Dust[] = Array.from({ length: small ? 26 : 55 }, () => newDust(true));

  let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
  let nextShoot = performance.now() + 7000;
  const t0 = performance.now();

  function resize(nextOriginX: number) {
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const box = canvas.getBoundingClientRect();
    W = box.width;
    H = box.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (nextOriginX !== originX) {
      originX = nextOriginX;
      for (let i = 0; i < dust.length; i++) dust[i] = newDust(true);
    }
  }

  function draw(t: number, dt: number) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const intro = Math.min(Math.max((t - t0 - 1500) / 1500, 0), 1);

    for (const s of stars) {
      const a = (0.2 + 0.7 * (0.5 + 0.5 * Math.sin((t / 1000) * s.s + s.p))) * intro;
      ctx.fillStyle = `rgba(${STAR_RGB},${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283);
      ctx.fill();
    }

    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      d.y -= d.vy * dt;
      d.x += Math.sin(t / 1600 + d.ph) * 0.00004 * dt;
      if (d.y < -0.03) {
        dust[i] = newDust(false);
        continue;
      }
      const fade = Math.min(1, d.y * 2.5) * Math.min(1, (1.04 - d.y) * 6) * d.a * intro;
      ctx.fillStyle = `rgba(${DUST_RGB},${(fade * 0.18).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r * 3.2, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = `rgba(${DUST_RGB},${fade.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, 6.283);
      ctx.fill();
    }

    if (!shoot && t > nextShoot) {
      shoot = {
        x: W * (0.05 + Math.random() * 0.5),
        y: H * (0.04 + Math.random() * 0.25),
        vx: W * 0.9,
        vy: H * 0.28,
        life: 0,
      };
    }
    if (shoot) {
      shoot.life += dt / 1000;
      const hx = shoot.x + shoot.vx * shoot.life;
      const hy = shoot.y + shoot.vy * shoot.life;
      const tx = hx - shoot.vx * 0.14;
      const ty = hy - shoot.vy * 0.14;
      const a = Math.sin(Math.min(shoot.life / 0.75, 1) * Math.PI);
      const g = ctx.createLinearGradient(hx, hy, tx, ty);
      g.addColorStop(0, `rgba(255,236,180,${a.toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,236,180,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      if (shoot.life > 0.75) {
        shoot = null;
        nextShoot = t + 6000 + Math.random() * 7000;
      }
    }
  }

  // Cuadro fijo con las estrellas ya visibles y antes de la primera estrella fugaz
  const drawStatic = () => draw(t0 + 3000, 0);

  return { resize, draw, drawStatic };
}
