const startDate = new Date("2024-06-13T00:00:00");

const reasons = [
  "Seu sorriso muda o clima em 2 segundos.",
  "Nosso caos junto parece coreografia.",
  "Voce faz qualquer dia comum virar evento.",
  "Com voce, ate silencio vira conversa boa.",
  "Seu jeito me puxa para frente.",
  "A gente se entende ate no olhar perdido.",
  "Voce me fez gostar de planos de longo prazo.",
  "Nossa historia ficou linda sem copiar ninguem."
];

const daysTogetherEl = document.getElementById("daysTogether");
const hoursTogetherEl = document.getElementById("hoursTogether");
const daysToAnniversaryEl = document.getElementById("daysToAnniversary");
const quoteBoxEl = document.getElementById("quoteBox");
const btnMemory = document.getElementById("btnMemory");
const btnLetter = document.getElementById("btnLetter");
const letterDialog = document.getElementById("letterDialog");

function getNextAnniversary() {
  const now = new Date();
  const year = now.getMonth() > 5 || (now.getMonth() === 5 && now.getDate() > 13)
    ? now.getFullYear() + 1
    : now.getFullYear();

  return new Date(`${year}-06-13T00:00:00`);
}

function updateTimeStats() {
  const now = new Date();
  const diffMs = now - startDate;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  const nextAnniversary = getNextAnniversary();
  const daysToAnniversary = Math.ceil((nextAnniversary - now) / (1000 * 60 * 60 * 24));

  if (daysTogetherEl) daysTogetherEl.textContent = Number.isFinite(days) ? days.toLocaleString("pt-BR") : "0";
  if (hoursTogetherEl) hoursTogetherEl.textContent = Number.isFinite(hours) ? hours.toLocaleString("pt-BR") : "0";
  if (daysToAnniversaryEl) daysToAnniversaryEl.textContent = Number.isFinite(daysToAnniversary) ? String(daysToAnniversary) : "0";
}

function setRandomReason() {
  if (!quoteBoxEl) return;
  const idx = Math.floor(Math.random() * reasons.length);

  quoteBoxEl.style.opacity = "0.2";
  setTimeout(() => {
    quoteBoxEl.textContent = reasons[idx];
    quoteBoxEl.style.opacity = "1";
  }, 180);
}

btnMemory?.addEventListener("click", setRandomReason);
btnLetter?.addEventListener("click", () => letterDialog?.showModal());

updateTimeStats();
setInterval(updateTimeStats, 60_000);
