const BRAND = { r: 37, g: 99, b: 235 };
const LINK_DISTANCE = 140;
const MOUSE_DISTANCE = 180;

function nodeCount(width) {
  const density = Math.round((width * 0.06) / 10) * 10;
  return Math.max(28, Math.min(72, density));
}

export function initHeroCanvas(canvas) {
  if (!canvas || !canvas.getContext) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let nodes = [];
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;
  const mouse = { x: null, y: null };

  function createNodes() {
    const count = nodeCount(width);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 1.5 + Math.random() * 1.5,
    }));
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }

    dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (nodes.length === 0) {
      createNodes();
    }
    return true;
  }

  function lineColor(alpha) {
    return `rgba(${BRAND.r}, ${BRAND.g}, ${BRAND.b}, ${alpha})`;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];

      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DISTANCE) {
          ctx.strokeStyle = lineColor(0.16 * (1 - dist / LINK_DISTANCE));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const dist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dist < MOUSE_DISTANCE) {
          ctx.strokeStyle = lineColor(0.3 * (1 - dist / MOUSE_DISTANCE));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = lineColor(0.55);
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) {
        node.vx *= -1;
        node.x = Math.max(0, Math.min(width, node.x));
      }
      if (node.y < 0 || node.y > height) {
        node.vy *= -1;
        node.y = Math.max(0, Math.min(height, node.y));
      }
    }
  }

  function visible() {
    return canvas.offsetParent !== null && canvas.getBoundingClientRect().width > 0;
  }

  function frame() {
    if (visible()) {
      if (width === 0) {
        resize();
      }
      if (!prefersReducedMotion) {
        step();
      }
      draw();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    width = 0;
    resize();
    createNodes();
  });

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  canvas.addEventListener("pointerleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  requestAnimationFrame(frame);
}
