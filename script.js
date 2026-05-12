/* ==============================================
   NOSSO UNIVERSO — 2 ANOS  |  script.js
   ============================================== */

// ---- 1) Contador de dias e horas ----
const startDate = new Date("2024-06-13T00:00:00"); // data do namoro

const daysCountEl  = document.getElementById("daysCount");
const hoursCountEl = document.getElementById("hoursCount");

function updateCounter() {
  const now  = new Date();
  const diff = now - startDate;
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (daysCountEl)  daysCountEl.textContent  = isNaN(days)  ? "—" : days.toLocaleString("pt-BR");
  if (hoursCountEl) hoursCountEl.textContent = isNaN(hours) ? "—" : hours.toLocaleString("pt-BR");
}
updateCounter();
setInterval(updateCounter, 60_000);


// ---- 2) Motivos aleatórios ----
const motivos = [
  "Você faz o mundo ficar mais leve só por existir.",
  "Você é meu lugar seguro em qualquer tempestade.",
  "Seu carinho muda meu dia de dentro pra fora.",
  "Com você, até o silêncio é bom demais.",
  "Seu sorriso é meu plot twist favorito.",
  "Você é a minha constante no universo.",
  "Do seu lado, qualquer lugar vira lar.",
  "Você cuida de mim de um jeito que eu não sabia que precisava.",
  "Você me faz ser uma versão melhor de mim.",
  "Cada dia com você é meu capítulo favorito.",
  "Você é a prova de que as melhores teorias têm a ver com o coração.",
  "Nosso amor seria o experimento mais lindo da ciência.",
  "Você entende minhas referências e também meus silêncios.",
  "Você me acalma só com o seu abraço.",
  "Me apaixono de novo toda vez que você ri.",
];

const motivoRandomEl = document.getElementById("motivoRandom");
const btnMotivo = document.getElementById("btnAdicionarMotivo");
let lastIndex = -1;

if (btnMotivo) {
  btnMotivo.addEventListener("click", () => {
    let idx;
    do { idx = Math.floor(Math.random() * motivos.length); } while (idx === lastIndex);
    lastIndex = idx;
    motivoRandomEl.style.opacity = "0";
    setTimeout(() => {
      motivoRandomEl.textContent = `"${motivos[idx]}"`;
      motivoRandomEl.style.opacity = "1";
    }, 200);
  });
}


// ---- 3) Modal da galeria ----
const modal       = document.getElementById("modalFoto");
const modalImg    = document.getElementById("modalImg");
const modalCap    = document.getElementById("modalCaption");
const modalClose  = document.getElementById("modalClose");

document.querySelectorAll(".photo").forEach(btn => {
  btn.addEventListener("click", () => {
    const img = btn.querySelector("img");
    if (!img || btn.classList.contains("photo--placeholder")) return;
    modalImg.src = img.src;
    modalCap.textContent = btn.dataset.caption || "";
    modal.showModal();
  });
});

if (modalClose) modalClose.addEventListener("click", () => modal.close());
if (modal) {
  modal.addEventListener("click", e => {
    const rect = modal.getBoundingClientRect();
    const inside = (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom
    );
    if (!inside) modal.close();
  });
}


// ---- 4) Modal surpresa ----
const modalSurpresa  = document.getElementById("modalSurpresa");
const surpresaClose  = document.getElementById("surpresaClose");
const btnSurpresa    = document.getElementById("btnSurpresa");
const btnSurpresaCon = document.getElementById("btnSurpresaConfete");

if (btnSurpresa) {
  btnSurpresa.addEventListener("click", () => {
    modalSurpresa.showModal();
  });
}
if (surpresaClose) {
  surpresaClose.addEventListener("click", () => modalSurpresa.close());
}
if (btnSurpresaCon) {
  btnSurpresaCon.addEventListener("click", () => {
    modalSurpresa.close();
    confettiBlast(200);
  });
}


// ---- 5) Confete ----
const canvas = document.getElementById("confetti");
const ctx    = canvas.getContext("2d");
let pieces   = [];
let animId   = null;

function resize() {
  canvas.width  = window.innerWidth  * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}
window.addEventListener("resize", resize);
resize();

const COLORS = ["#ff5fa2","#ffd1e6","#7c4dff","#e8dfff","#ffffff","#ffb3d4","#c77dff"];
const SHAPES = ["rect","circle","heart"];

function spawnConfetti(count = 160) {
  pieces = Array.from({ length: count }).map(() => ({
    x:     Math.random() * canvas.width,
    y:     -Math.random() * canvas.height * 0.25,
    r:     (5 + Math.random() * 10) * devicePixelRatio,
    vx:    (-1 + Math.random() * 2) * 1.4 * devicePixelRatio,
    vy:    (2.5 + Math.random() * 4) * devicePixelRatio,
    rot:   Math.random() * Math.PI * 2,
    vr:    (-0.25 + Math.random() * 0.5),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    alpha: 1,
  }));
}

function drawPiece(p) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = p.color;

  if (p.shape === "rect") {
    ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
  } else if (p.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // heart
    const s = p.r * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, s * 2);
    ctx.bezierCurveTo(-s * 5, -s * 3, -s * 10, s * 2, 0, s * 8);
    ctx.bezierCurveTo(s * 10, s * 2, s * 5, -s * 3, 0, s * 2);
    ctx.fill();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.vr;
    if (p.y > canvas.height * 0.75) p.alpha -= 0.012;
    drawPiece(p);
  });
  pieces = pieces.filter(p => p.alpha > 0 && p.y < canvas.height + 50);
  if (pieces.length > 0) animId = requestAnimationFrame(draw);
  else { cancelAnimationFrame(animId); animId = null; }
}

function confettiBlast(count = 160) {
  spawnConfetti(count);
  if (!animId) draw();
}

const btnConfete = document.getElementById("btnConfete");
if (btnConfete) btnConfete.addEventListener("click", () => confettiBlast(220));


// ---- 6) Menu mobile ----
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

if (hamburger && mobileNav) {
  hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
  });
  document.querySelectorAll(".mnav-link").forEach(link => {
    link.addEventListener("click", () => mobileNav.classList.remove("open"));
  });
}


// ---- 7) Scroll reveal ----
const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));


// ---- 8) Easter egg: confete ao chegar na seção final ----
const finalSection = document.getElementById("final");
let finalTriggered = false;

const finalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !finalTriggered) {
      finalTriggered = true;
      setTimeout(() => confettiBlast(120), 600);
    }
  });
}, { threshold: 0.4 });

if (finalSection) finalObserver.observe(finalSection);
