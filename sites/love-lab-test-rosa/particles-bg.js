// Fundo animado de partículas (bolinhas e corações)
const canvas = document.getElementById('bgParticles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  let particles = [];
  const heart = (ctx, x, y, size, color) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -0.3, -0.5, -0.3, -0.5, 0.1);
    ctx.bezierCurveTo(-0.5, 0.5, 0, 0.7, 0, 1);
    ctx.bezierCurveTo(0, 0.7, 0.5, 0.5, 0.5, 0.1);
    ctx.bezierCurveTo(0.5, -0.3, 0, -0.3, 0, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  };
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener('resize', resize);
  resize();
  function randomColor() {
    const palette = ['#ff7db9', '#ffb3e6', '#ff4fa0', '#e0b3ff', '#ffd4e9', '#f7c6ff'];
    return palette[Math.floor(Math.random() * palette.length)];
  }
  function createParticle() {
    const isHeart = Math.random() < 0.33;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: isHeart ? 12 + Math.random() * 10 : 6 + Math.random() * 10,
      dx: -0.2 + Math.random() * 0.4,
      dy: 0.1 + Math.random() * 0.5,
      color: randomColor(),
      type: isHeart ? 'heart' : 'circle',
      alpha: 0.5 + Math.random() * 0.5,
      speed: 0.5 + Math.random() * 0.7
    };
  }
  function initParticles() {
    particles = [];
    const count = Math.floor((width * height) / 4200);
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      ctx.globalAlpha = p.alpha;
      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        heart(ctx, p.x, p.y, p.r / 16, p.color);
      }
      ctx.globalAlpha = 1;
    }
  }
  function update() {
    for (const p of particles) {
      p.x += p.dx * p.speed;
      p.y += p.dy * p.speed;
      if (p.x < -40 || p.x > width + 40 || p.y > height + 40) {
        // Reset particle to top
        Object.assign(p, createParticle(), { y: -20, x: Math.random() * width });
      }
    }
  }
  function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
  }
  initParticles();
  animate();
  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });
}
