/*!
 * IntelliFin · Logo animado 3D  (v1.0)
 * Uso:
 *   <script src="/js/intellifin-logo.js" defer></script>
 *   <a href="/" aria-label="IntelliFin, inicio">
 *     <intellifin-logo variant="coral" height="48"></intellifin-logo>
 *   </a>
 * Atributos:
 *   variant  coral (header sobre degradado coral) | claro (fondo blanco) | oscuro (fondo azul noche)
 *   height   alto en px (default 48)
 *   tagline  si está presente, muestra "TECNOLOGÍA FINANCIERA"
 *   motion   loop (default) | once | none
 *   mark-only  si está presente, solo el monograma 3D (sin texto)
 * Sin WebGL, o si no carga la librería 3D, muestra el logo plano automáticamente.
 */
(function () {
  if (window.customElements && customElements.get('intellifin-logo')) return;

  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var NAVY = '#16223A', BONE = '#E8E0D2', TERRA = '#D0875A';
  var VARIANTS = {
    coral:  { mark: NAVY, node: '#FFFFFF', text: NAVY, tag: NAVY },
    claro:  { mark: NAVY, node: TERRA,     text: NAVY, tag: '#5B6B7F' },
    oscuro: { mark: BONE, node: TERRA,     text: BONE, tag: '#9AA6B8' }
  };

  var P_INTELLI = 'M8 0V-72H16.9V0ZM66.85 0V-27.05Q66.85 -30.88 66.16 -34.42Q65.48 -37.98 63.8 -40.81Q62.12 -43.65 59.3 -45.3Q56.48 -46.95 52.2 -46.95Q48.85 -46.95 46.11 -45.81Q43.38 -44.68 41.42 -42.39Q39.48 -40.1 38.41 -36.62Q37.35 -33.15 37.35 -28.45L31.5 -30.25Q31.5 -38.08 34.33 -43.71Q37.15 -49.35 42.28 -52.38Q47.4 -55.4 54.35 -55.4Q59.58 -55.4 63.29 -53.75Q67 -52.1 69.45 -49.36Q71.9 -46.62 73.3 -43.26Q74.7 -39.9 75.28 -36.41Q75.85 -32.93 75.85 -29.85V0ZM28.35 0V-54H36.35V-39.55H37.35V0ZM115.5 0Q110.68 0.98 106.01 0.8Q101.35 0.62 97.69 -1.1Q94.03 -2.83 92.15 -6.5Q90.55 -9.68 90.43 -12.95Q90.3 -16.23 90.3 -20.4V-69H99.2V-20.8Q99.2 -17.48 99.28 -15.14Q99.35 -12.8 100.3 -11.1Q102.1 -7.88 106.03 -7.34Q109.95 -6.8 115.5 -7.65ZM79.35 -46.65V-54H115.5V-46.65ZM146.4 1.5Q138.43 1.5 132.5 -2.01Q126.58 -5.53 123.29 -11.86Q120 -18.2 120 -26.65Q120 -35.5 123.24 -41.98Q126.48 -48.45 132.31 -51.98Q138.15 -55.5 146 -55.5Q154.12 -55.5 159.85 -51.75Q165.58 -48 168.46 -41.05Q171.35 -34.1 170.93 -24.5H161.95V-27.7Q161.8 -37.65 157.9 -42.58Q154 -47.5 146.3 -47.5Q138.03 -47.5 133.74 -42.2Q129.45 -36.9 129.45 -27Q129.45 -17.45 133.74 -12.2Q138.03 -6.95 146 -6.95Q151.35 -6.95 155.3 -9.4Q159.25 -11.85 161.5 -16.45L170.05 -13.5Q166.88 -6.35 160.56 -2.43Q154.25 1.5 146.4 1.5ZM126.45 -24.5V-31.65H166.35V-24.5ZM179.55 0V-73.5H188.45V0ZM200.95 0V-73.5H209.85V0ZM222.35 -63.55V-72.75H231.25V-63.55ZM222.35 0V-54H231.25V0Z';
  var P_FIN = 'M244.25 0V-72H288.25V-58.4H257.85V-42.8H282.25V-29.2H257.85V0ZM294.75 -61.5V-73.5H308.35V-61.5ZM294.75 0V-54H308.35V0ZM356.65 0V-25.5Q356.65 -27.35 356.45 -30.23Q356.25 -33.1 355.2 -36Q354.15 -38.9 351.78 -40.85Q349.4 -42.8 345.05 -42.8Q343.3 -42.8 341.3 -42.25Q339.3 -41.7 337.55 -40.12Q335.8 -38.55 334.68 -35.5Q333.55 -32.45 333.55 -27.4L325.75 -31.1Q325.75 -37.5 328.35 -43.1Q330.95 -48.7 336.18 -52.15Q341.4 -55.6 349.35 -55.6Q355.7 -55.6 359.7 -53.45Q363.7 -51.3 365.93 -48Q368.15 -44.7 369.1 -41.12Q370.05 -37.55 370.25 -34.6Q370.45 -31.65 370.45 -30.3V0ZM319.75 0V-54H331.85V-36.1H333.55V0Z';
  var P_TAG = 'M12.13 0V-10.32H8.17V-12.24H18.14V-10.32H14.18V0ZM27.07 0V-12.24H34.97V-10.32H29.11V-7.3H33.95V-5.38H29.11V-1.92H34.97V0ZM49.75 0.26Q47.92 0.26 46.61 -0.55Q45.3 -1.35 44.6 -2.79Q43.9 -4.22 43.9 -6.12Q43.9 -8.02 44.6 -9.45Q45.3 -10.89 46.61 -11.69Q47.92 -12.5 49.75 -12.5Q51.87 -12.5 53.28 -11.44Q54.69 -10.38 55.26 -8.58L53.19 -8.02Q52.84 -9.21 51.98 -9.89Q51.12 -10.56 49.75 -10.56Q48.52 -10.56 47.7 -10.01Q46.88 -9.46 46.47 -8.46Q46.05 -7.46 46.05 -6.12Q46.05 -4.78 46.46 -3.78Q46.87 -2.78 47.7 -2.23Q48.52 -1.68 49.75 -1.68Q51.12 -1.68 51.98 -2.36Q52.84 -3.03 53.19 -4.22L55.26 -3.66Q54.69 -1.86 53.28 -0.8Q51.87 0.26 49.75 0.26ZM64.7 0V-12.24H66.77L72.44 -3.61V-12.24H74.52V0H72.44L66.77 -8.63V0ZM89.65 0.26Q87.81 0.26 86.5 -0.55Q85.19 -1.35 84.49 -2.79Q83.79 -4.22 83.79 -6.12Q83.79 -8.02 84.49 -9.45Q85.19 -10.89 86.5 -11.69Q87.81 -12.5 89.65 -12.5Q91.48 -12.5 92.79 -11.69Q94.1 -10.89 94.8 -9.45Q95.5 -8.02 95.5 -6.12Q95.5 -4.22 94.8 -2.79Q94.1 -1.35 92.79 -0.55Q91.48 0.26 89.65 0.26ZM89.65 -1.68Q90.88 -1.66 91.7 -2.22Q92.52 -2.77 92.93 -3.78Q93.34 -4.78 93.34 -6.12Q93.34 -7.46 92.93 -8.45Q92.52 -9.44 91.7 -10Q90.88 -10.55 89.65 -10.56Q88.41 -10.58 87.59 -10.02Q86.78 -9.47 86.37 -8.47Q85.96 -7.46 85.95 -6.12Q85.95 -4.78 86.36 -3.79Q86.77 -2.8 87.59 -2.24Q88.41 -1.69 89.65 -1.68ZM104.94 0V-12.24H106.99V-1.92H112.39V0ZM126.59 0.26Q124.75 0.26 123.44 -0.55Q122.13 -1.35 121.43 -2.79Q120.73 -4.22 120.73 -6.12Q120.73 -8.02 121.43 -9.45Q122.13 -10.89 123.44 -11.69Q124.75 -12.5 126.59 -12.5Q128.42 -12.5 129.73 -11.69Q131.04 -10.89 131.75 -9.45Q132.45 -8.02 132.45 -6.12Q132.45 -4.22 131.75 -2.79Q131.04 -1.35 129.73 -0.55Q128.42 0.26 126.59 0.26ZM126.59 -1.68Q127.82 -1.66 128.64 -2.22Q129.46 -2.77 129.87 -3.78Q130.28 -4.78 130.28 -6.12Q130.28 -7.46 129.87 -8.45Q129.46 -9.44 128.64 -10Q127.82 -10.55 126.59 -10.56Q125.35 -10.58 124.54 -10.02Q123.72 -9.47 123.31 -8.47Q122.9 -7.46 122.89 -6.12Q122.89 -4.78 123.3 -3.79Q123.71 -2.8 124.53 -2.24Q125.35 -1.69 126.59 -1.68ZM146.77 0.26Q145.57 0.26 144.53 -0.17Q143.49 -0.59 142.7 -1.4Q141.92 -2.22 141.48 -3.4Q141.03 -4.59 141.03 -6.12Q141.03 -8.12 141.78 -9.55Q142.53 -10.97 143.83 -11.73Q145.13 -12.49 146.77 -12.49Q149.03 -12.49 150.35 -11.44Q151.67 -10.39 152.13 -8.5L150.05 -8.17Q149.7 -9.26 148.9 -9.9Q148.11 -10.55 146.89 -10.56Q145.66 -10.57 144.84 -10.02Q144.02 -9.47 143.61 -8.46Q143.2 -7.46 143.2 -6.12Q143.2 -4.78 143.61 -3.79Q144.02 -2.8 144.84 -2.24Q145.66 -1.69 146.89 -1.68Q147.81 -1.66 148.51 -2.01Q149.21 -2.35 149.65 -3.06Q150.09 -3.76 150.25 -4.81H148.09V-6.42H152.42Q152.44 -6.29 152.45 -6.02Q152.46 -5.76 152.46 -5.7Q152.46 -3.97 151.77 -2.62Q151.09 -1.27 149.81 -0.51Q148.54 0.26 146.77 0.26ZM163.72 -13.56H162.17L163.48 -16.7H165.04ZM161.89 0V-12.24H163.94V0ZM173.21 0 177.07 -12.24H180.07L183.93 0H181.82L178.32 -10.98H178.77L175.32 0ZM175.36 -2.65V-4.57H181.79V-2.65ZM203.98 0V-12.24H211.35V-10.19H206.03V-7.14H210.33V-5.1H206.03V0ZM220.62 0V-12.24H222.66V0ZM232.78 0V-12.24H234.86L240.53 -3.61V-12.24H242.61V0H240.53L234.86 -8.63V0ZM251.7 0 255.56 -12.24H258.57L262.42 0H260.31L256.81 -10.98H257.27L253.81 0ZM253.86 -2.65V-4.57H260.28V-2.65ZM271.52 0V-12.24H273.59L279.27 -3.61V-12.24H281.34V0H279.27L273.59 -8.63V0ZM296.47 0.26Q294.63 0.26 293.32 -0.55Q292.01 -1.35 291.31 -2.79Q290.61 -4.22 290.61 -6.12Q290.61 -8.02 291.31 -9.45Q292.01 -10.89 293.32 -11.69Q294.63 -12.5 296.47 -12.5Q298.58 -12.5 299.99 -11.44Q301.4 -10.38 301.97 -8.58L299.9 -8.02Q299.55 -9.21 298.69 -9.89Q297.83 -10.56 296.47 -10.56Q295.23 -10.56 294.41 -10.01Q293.59 -9.46 293.18 -8.46Q292.76 -7.46 292.76 -6.12Q292.76 -4.78 293.17 -3.78Q293.59 -2.78 294.41 -2.23Q295.23 -1.68 296.47 -1.68Q297.83 -1.68 298.69 -2.36Q299.55 -3.03 299.9 -4.22L301.97 -3.66Q301.4 -1.86 299.99 -0.8Q298.58 0.26 296.47 0.26ZM311.58 0V-12.24H313.62V0ZM323.74 0V-12.24H331.65V-10.32H325.79V-7.3H330.63V-5.38H325.79V-1.92H331.65V0ZM341.25 0V-12.24H346.31Q346.49 -12.24 346.77 -12.23Q347.05 -12.21 347.29 -12.17Q348.35 -12.01 349.04 -11.46Q349.74 -10.92 350.07 -10.09Q350.41 -9.27 350.41 -8.26Q350.41 -6.76 349.65 -5.68Q348.89 -4.61 347.33 -4.35L346.46 -4.27H343.3V0ZM348.28 0 345.87 -4.98 347.95 -5.44 350.6 0ZM343.3 -6.19H346.22Q346.4 -6.19 346.61 -6.21Q346.82 -6.22 347 -6.27Q347.51 -6.4 347.8 -6.72Q348.09 -7.05 348.21 -7.46Q348.34 -7.87 348.34 -8.26Q348.34 -8.65 348.21 -9.06Q348.09 -9.47 347.8 -9.79Q347.51 -10.11 347 -10.24Q346.82 -10.29 346.61 -10.31Q346.4 -10.32 346.22 -10.32H343.3ZM359.19 0 363.05 -12.24H366.05L369.91 0H367.8L364.3 -10.98H364.75L361.3 0ZM361.34 -2.65V-4.57H367.77V-2.65Z';
  var VB_WORD = '6 -75.5 366 79';
  var VB_BLOCK = '6 -75.5 366 112';
  var TAG_Y = 34;

  var threePromise = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threePromise) return threePromise;
    threePromise = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = THREE_URL; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = function () { window.THREE ? res(window.THREE) : rej(); };
      s.onerror = rej;
      document.head.appendChild(s);
      setTimeout(rej, 8000);
    });
    return threePromise;
  }

  function hasWebGL() {
    try { var c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
    catch (e) { return false; }
  }

  function flatMark(v) {
    return '<svg viewBox="3.2 3.7 113 113" width="100%" height="100%" aria-hidden="true">' +
      '<g fill="' + v.mark + '" stroke="' + v.mark + '" stroke-width="3" stroke-linejoin="round">' +
      '<path d="M14 46H32V106H14Z"/>' +
      '<path d="M42 16H106V34H60V52H88V70H60V106H42Z"/></g>' +
      '<rect x="30" y="21.4" width="14" height="5.2" rx="2.6" fill="' + v.node + '"/>' +
      '<circle cx="23" cy="24" r="11" fill="' + v.node + '"/></svg>';
  }

  function wordSvg(v, tagline) {
    var word = '<path fill="' + v.text + '" d="' + P_INTELLI + '"/><path fill="' + v.text + '" d="' + P_FIN + '"/>';
    if (!tagline) return '<svg viewBox="' + VB_WORD + '" height="100%" aria-hidden="true" style="display:block;overflow:visible">' + word + '</svg>';
    return '<svg viewBox="' + VB_BLOCK + '" height="100%" aria-hidden="true" style="display:block;overflow:visible">' + word +
      '<g transform="translate(0 ' + TAG_Y + ')"><path fill="' + v.tag + '" d="' + P_TAG + '"/></g></svg>';
  }

  class IntelliFinLogo extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      var v = VARIANTS[this.getAttribute('variant')] || VARIANTS.claro;
      var h = parseFloat(this.getAttribute('height')) || 48;
      var tagline = this.hasAttribute('tagline');
      var markOnly = this.hasAttribute('mark-only');
      this._motion = this.getAttribute('motion') || 'loop';
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) this._motion = 'none';
      if (!this.hasAttribute('role')) this.setAttribute('role', 'img');
      if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'IntelliFin');

      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML =
        '<style>:host{display:inline-flex;align-items:center;gap:' + (h * 0.26) + 'px;line-height:0;vertical-align:middle}' +
        '.mark{position:relative;width:' + h + 'px;height:' + h + 'px;flex:none}' +
        '.mark canvas,.mark .flat{position:absolute;inset:0;width:100%;height:100%}' +
        '.word{height:' + (tagline ? h * 0.72 : h * 0.5) + 'px;flex:none}</style>' +
        '<div class="mark"><div class="flat">' + flatMark(v) + '</div></div>' +
        (markOnly ? '' : '<div class="word">' + wordSvg(v, tagline) + '</div>');
      this._mark = root.querySelector('.mark');
      this._flat = root.querySelector('.flat');
      this._v = v;
      if (this._motion === 'none' && !this.hasAttribute('static-3d')) { /* plano y quieto */ }
      if (!hasWebGL()) return;
      var self = this;
      loadThree().then(function (T) { self._init3d(T, h); }).catch(function () {});
    }

    disconnectedCallback() {
      this._dead = true;
      if (this._io) this._io.disconnect();
      if (this._renderer) { this._renderer.dispose(); }
    }

    _init3d(T, h) {
      if (this._dead) return;
      var v = this._v, self = this;
      var canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      var renderer;
      try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
      catch (e) { return; }
      this._renderer = renderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
      renderer.setSize(h, h, false);
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.setClearColor(0x000000, 0);

      var scene = new T.Scene();
      var cam = new T.PerspectiveCamera(19.5, 1, 1, 2000);
      cam.position.set(0, 0, 330);
      scene.add(new T.HemisphereLight(0xffffff, 0x6a6a6a, 0.42));
      var key = new T.DirectionalLight(0xffffff, 0.95); key.position.set(-120, 150, 130); scene.add(key);
      var fill = new T.DirectionalLight(0xffffff, 0.12); fill.position.set(120, 20, 80); scene.add(fill);

      var D = 22, B = 106;
      var ext = { depth: D, bevelEnabled: true, bevelThickness: 1.6, bevelSize: 1.6, bevelSegments: 4, curveSegments: 8 };
      function shape(p) { var s = new T.Shape(); s.moveTo(p[0][0], -p[0][1]); for (var i = 1; i < p.length; i++) s.lineTo(p[i][0], -p[i][1]); s.closePath(); return s; }
      function solid(p) { var g = new T.ExtrudeGeometry(shape(p), ext); g.translate(-59, B, -D / 2); return g; }
      function lin(hex) { var c = new T.Color(hex); c.convertSRGBToLinear(); return c; }

      var mat = new T.MeshStandardMaterial({ color: lin(v.mark), roughness: 0.88, metalness: 0 });
      var nmat = new T.MeshStandardMaterial({ color: lin(v.node), roughness: 0.72, metalness: 0 });
      var logo = new T.Group(); scene.add(logo);
      var base = new T.Group(); base.position.y = -B + 59.5; logo.add(base);
      var iM = new T.Mesh(solid([[14, 46], [32, 46], [32, 106], [14, 106]]), mat); base.add(iM);
      var fM = new T.Mesh(solid([[42, 16], [106, 16], [106, 34], [60, 34], [60, 52], [88, 52], [88, 70], [60, 70], [60, 106], [42, 106]]), mat); base.add(fM);
      var node = new T.Mesh(new T.SphereGeometry(11, 48, 32), nmat); node.position.set(23 - 59, B - 24, 0); base.add(node);
      // Conector sólido nodo -> F (crece desde el nodo)
      var link = new T.Group(); link.position.set(31 - 59, B - 24, 0); base.add(link);
      var rod = new T.Mesh(new T.CylinderGeometry(2.6, 2.6, 13, 24), nmat);
      rod.rotation.z = Math.PI / 2; rod.position.x = 6.5; link.add(rod);
      var ring = new T.Mesh(new T.TorusGeometry(11, 0.8, 12, 72), new T.MeshBasicMaterial({ color: new T.Color(v.node), transparent: true, opacity: 0 }));
      ring.position.copy(node.position); base.add(ring);

      function ease(t) { t = Math.min(Math.max(t, 0), 1); return 1 - Math.pow(1 - t, 3); }
      function back(t) { t = Math.min(Math.max(t, 0), 1); var c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }

      var motion = this._motion, t0 = performance.now(), visible = true, raf = 0;
      function pose(t) {
        iM.scale.y = Math.max(.001, ease((t - 0.15) / 0.8));
        fM.scale.y = Math.max(.001, ease((t - 0.35) / 0.9));
        node.scale.setScalar(Math.max(.001, back((t - 1.05) / 0.6)));
        link.scale.x = Math.max(.001, ease((t - 1.4) / 0.45));
        var s = ease((t - 0.15) / 1.4);
        logo.rotation.x = 0.12 + (1 - s) * 0.45;
        var sway = motion === 'loop' ? Math.sin(Math.max(0, t - 1.6) * 0.45) * 0.38 : 0;
        logo.rotation.y = (1 - s) * -0.6 - 0.22 * s + sway;
        if (motion === 'loop' && t > 2) {
          var p = ((t - 2) % 3.2) / 3.2;
          ring.scale.setScalar(1 + p * 0.55); ring.material.opacity = 0.55 * (1 - p); ring.lookAt(cam.position);
        }
      }
      function draw(now) {
        if (self._dead) return;
        var t = motion === 'none' ? 99 : (now - t0) / 1000;
        pose(t);
        renderer.render(scene, cam);
        if (motion === 'none' || (motion === 'once' && t > 2.4)) return;
        if (visible) raf = requestAnimationFrame(draw);
      }
      this._mark.appendChild(canvas);
      this._flat.style.display = 'none';
      raf = requestAnimationFrame(draw);

      if ('IntersectionObserver' in window) {
        this._io = new IntersectionObserver(function (es) {
          var was = visible; visible = es[0].isIntersecting;
          if (visible && !was) raf = requestAnimationFrame(draw);
        });
        this._io.observe(this);
      }
      this.replay = function () { t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
    }
  }
  customElements.define('intellifin-logo', IntelliFinLogo);
})();
