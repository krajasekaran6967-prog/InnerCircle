const COLORS = ["#2563eb", "#60a5fa", "#16a34a", "#f59e0b", "#ec4899", "#8b5cf6"];

let canvas = null;
let ctx = null;
let dpr = 1;
let particles = [];
let running = false;
let reducedMotion = false;

function resize() {
  if (!canvas) {
    return;
  }
  dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function initEffects(canvasEl) {
  canvas = canvasEl;
  if (!canvas || !canvas.getContext) {
    canvas = null;
    return;
  }
  ctx = canvas.getContext("2d");
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  resize();
  window.addEventListener("resize", resize);
}

function loop() {
  if (!ctx) {
    running = false;
    return;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);

  for (const p of particles) {
    p.vy += 0.18;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.life -= 1;

    const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    }
    ctx.restore();
  }

  if (particles.length > 0) {
    requestAnimationFrame(loop);
  } else {
    running = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function start() {
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
}

export function burstAt(x, y, opts = {}) {
  if (!canvas || reducedMotion) {
    return;
  }

  const count = opts.count || 36;
  const colors = opts.colors || COLORS;
  const power = opts.power || 9;

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = power * (0.4 + Math.random() * 0.8);
    const maxLife = 60 + Math.random() * 40;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      life: maxLife,
      maxLife,
    });
  }

  start();
}

export function burstFromElement(element, opts = {}) {
  if (!element) {
    return;
  }
  const rect = element.getBoundingClientRect();
  burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, opts);
}

export function burstFromEvent(event, opts = {}) {
  if (event && event.clientX) {
    burstAt(event.clientX, event.clientY, opts);
    return;
  }
  if (event && event.currentTarget) {
    burstFromElement(event.currentTarget, opts);
  }
}
