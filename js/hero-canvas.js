(function () {
  'use strict';

  const COLORS = {
    navy:      'rgba(26,  31,  54,  0.75)',
    coral:     'rgba(232, 97,  58,  0.80)',
    haloNavy:  'rgba(26,  31,  54,  0.12)',
    haloCoral: 'rgba(232, 97,  58,  0.15)',
    lineNavy:  'rgba(26,  31,  54,  {a})',
    lineCoral: 'rgba(232, 97,  58,  {a})',
  };

  const CFG = {
    desktop: { count: 55, dist: 145 },
    mobile:  { count: 26, dist: 100 },
    speed:       0.55,   
    mouseRadius: 130,    
    mouseForce:  0.022,  
    damping:     0.990,  
    minR: 2.2,
    maxR: 4.8,
  };

  let canvas, ctx, hero;
  let nodes = [];
  let mouse = { x: -9999, y: -9999 };
  let animId = null;
  let W = 0, H = 0, dpr = 1;
  let cfg = CFG.desktop;

  function makeNode() {
    const isCoral = Math.random() < 0.30;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * CFG.speed * 2,
      vy: (Math.random() - 0.5) * CFG.speed * 2,
      r:  CFG.minR + Math.random() * (CFG.maxR - CFG.minR),
      coral: isCoral,
      pulse: Math.random() * Math.PI * 2,
      pulseS: 0.018 + Math.random() * 0.014,
      alpha: 0.60 + Math.random() * 0.40,
    };
  }

  function init() {
    canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    hero  = canvas.closest('.hero') || canvas.parentElement;

    resize();
    window.addEventListener('resize', resize);

    hero.addEventListener('mousemove', onMouseMove);
    hero.addEventListener('mouseleave', onMouseLeave);

    hero.addEventListener('touchmove', onTouchMove, { passive: true });
    hero.addEventListener('touchend',  onMouseLeave);

    start();
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }
  function onTouchMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W   = canvas.offsetWidth;
    H   = canvas.offsetHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cfg = window.innerWidth < 768 ? CFG.mobile : CFG.desktop;

    if (nodes.length !== cfg.count) {
      nodes = Array.from({ length: cfg.count }, makeNode);
    }
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    tick();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      n.pulse += n.pulseS;

      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < CFG.mouseRadius * CFG.mouseRadius && d2 > 0.01) {
        const d    = Math.sqrt(d2);
        const f    = (1 - d / CFG.mouseRadius) * CFG.mouseForce;
        n.vx += (dx / d) * f;
        n.vy += (dy / d) * f;
      }

      n.vx *= CFG.damping;
      n.vy *= CFG.damping;

      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd < 0.15) {

        n.vx += (Math.random() - 0.5) * 0.12;
        n.vy += (Math.random() - 0.5) * 0.12;
      }

      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0)  { n.x = 0; n.vx = Math.abs(n.vx); }
      if (n.x > W)  { n.x = W; n.vx = -Math.abs(n.vx); }
      if (n.y < 0)  { n.y = 0; n.vy = Math.abs(n.vy); }
      if (n.y > H)  { n.y = H; n.vy = -Math.abs(n.vy); }
    });

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b  = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d > cfg.dist) continue;

        const alpha    = (1 - d / cfg.dist) * 0.60;
        const useCoral = a.coral || b.coral;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = useCoral
          ? `rgba(232,97,58,${alpha})`
          : `rgba(26,31,54,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    nodes.forEach(n => {
      const pr = n.r + Math.sin(n.pulse) * 0.7;

      ctx.beginPath();
      ctx.arc(n.x, n.y, pr + (n.coral ? 4 : 3), 0, Math.PI * 2);
      ctx.fillStyle = n.coral
        ? `rgba(232,97,58,${0.12 + Math.sin(n.pulse) * 0.06})`
        : `rgba(26,31,54,${0.07 + Math.sin(n.pulse) * 0.04})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
      ctx.fillStyle = n.coral
        ? `rgba(232,97,58,${n.alpha})`
        : `rgba(26,31,54,${n.alpha})`;
      ctx.fill();
    });
  }

  function start() {
    if (!animId) loop();
  }
  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();