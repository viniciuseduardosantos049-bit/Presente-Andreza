const PDFDocument = require("pdfkit");

const CLAUSES = [
  { r: "Abraços são obrigatórios em qualquer dia difícil, sem exceções nem cláusulas de escape.",             n: "PROC_HUG(): obrigatório em dias difíceis. Exceções: null.",                                     m: "Abraços obrigatórios em dias difíceis." },
  { r: "Beijos extras em datas comemorativas — e em dias normais também, porque sim.",                        n: "LOOP kiss++ ON event OR random(). Frequência: ilimitada.",                                    m: "Beijos extras sempre que possível." },
  { r: "Se houver pizza, há paz. É lei universal.",                                                           n: "IF pizza == true THEN status = 'PAZ'. Lei imutável.",                                       m: "Pizza significa paz." },
  { r: "Você tem prioridade máxima na minha vida. Isso não está em negociação.",                              n: "setPriority(VOCÊ, MAX_INT). Valor não sobrescrevível.",                                      m: "Você é prioridade. Sempre." },
  { r: "Maratonar séries juntos é atividade essencial e não pode ser feita sem o outro.",                    n: "seriesSession.setMode('CO-OP'). Modo solo: proibido.",                                      m: "Séries só juntos." },
  { r: "\"Eu te amo\" nunca expira. Renovação automática diária.",                                            n: "love.setExpiry(null). autoRenew = true. Intervalo: 24h.",                                   m: "\"Eu te amo\" não tem prazo." },
  { r: "Sempre deixar o resto do seu lanche para mim.",                                                       n: "snack.share(ratio=0.5). Transferência obrigatória.",                                        m: "Lanche é para dividir." },
  { r: "Discussões só podem ser resolvidas com Pedra, Papel, Tesoura, Lagarto, Spock.",                      n: "conflict.resolve('RPSLS'). Outros métodos: DEPRECATED.",                                    m: "Conflitos: pedra, papel, tesoura, lagarto, Spock." },
  { r: "Se um dos dois estiver doente, o outro cuida com protocolos científicos e mimos.",                    n: "ON sick: deploy(DrCooper_Protocol_v3). Mimos: incluídos.",                                   m: "Doença = cuidado total." },
  { r: "Todo bug no relacionamento deve ser resolvido com diálogo, paciência e cookies.",                     n: "bugfix(relationship): dialog + patience + cookies. Merge obrigatório.",                      m: "Problemas se resolvem com conversa." },
  { r: "O Dia do Contrato deve ser celebrado com leitura do acordo em voz alta.",                             n: "CRON: 0 0 13 6 * → celebrateContract(). Testemunhas: plushies válidos.",                    m: "Comemorar o Dia do Contrato." },
  { r: "O casal deve manter, em local visível, pelo menos um item de decoração nerd.",                        n: "assert(nerdDecor.count >= 1). Local: visível. Crítico: sim.",                                m: "Um item nerd em casa, sempre." },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROMÂNTICO — papel creme, bordas ornamentais, Times Italic, flores e corações
// ─────────────────────────────────────────────────────────────────────────────
function generateRomantico(doc, { signedAt, signYou, signHer }) {
  const PW = doc.page.width, PH = doc.page.height;
  const ml = 56, mr = 56;
  const W  = PW - ml - mr;
  const MB = doc.page.margins.bottom;

  const bgPage  = "#fdf6f0";
  const bgCard  = "#fff8f4";
  const pink    = "#c2185b";
  const rose    = "#e91e8c";
  const violet  = "#7c4dff";
  const ink     = "#2d1b2e";
  const muted   = "#7a4f60";
  const border  = "#f48fb1";

  function drawPageBg() {
    doc.save().rect(0, 0, PW, PH).fill(bgPage).restore();
    // borda ornamental dupla
    const m = 14;
    doc.save().rect(m, m, PW - m*2, PH - m*2).stroke(border).lineWidth(2).stroke().restore();
    doc.save().rect(m+4, m+4, PW - (m+4)*2, PH - (m+4)*2).stroke(border).lineWidth(0.5).stroke().restore();
    // cantos decorativos
    const corners = [[m+2,m+2],[PW-m-2,m+2],[m+2,PH-m-2],[PW-m-2,PH-m-2]];
    doc.save().fillColor(pink).fontSize(12);
    corners.forEach(([x,y]) => doc.text("✦", x-5, y-6));
    doc.restore();
  }

  function header(y) {
    // linha ornamental topo
    doc.save().moveTo(ml, y).lineTo(ml+W, y).strokeColor(border).lineWidth(1).stroke().restore();
    doc.fillColor(rose).font("Times-BoldItalic").fontSize(10)
      .text("✦  Acordo de Namoro  ✦", ml, y+8, { width: W, align: "center" });
    doc.fillColor(ink).font("Times-BoldItalic").fontSize(28)
      .text("Nosso Universo", ml, y+22, { width: W, align: "center" });
    doc.fillColor(muted).font("Times-Italic").fontSize(11)
      .text("Unidos para sempre — em qualquer universo paralelo possível", ml, y+56, { width: W, align: "center" });
    doc.fillColor(muted).font("Times-Roman").fontSize(9)
      .text(`Firmado com amor em ${signedAt}`, ml, y+72, { width: W, align: "center" });
    doc.save().moveTo(ml+40, y+88).lineTo(ml+W-40, y+88).strokeColor(border).lineWidth(1).stroke().restore();
    return y + 100;
  }

  function ensureSpace(y, h) {
    if (y + h <= PH - MB - 14) return y;
    doc.addPage(); drawPageBg();
    return 38;
  }

  drawPageBg();
  let y = header(28);

  doc.fillColor(rose).font("Times-BoldItalic").fontSize(12)
    .text("— Cláusulas do Amor —", ml, y, { width: W, align: "center" });
  y += 18;

  for (const { r } of CLAUSES) {
    doc.font("Times-Roman").fontSize(11);
    const h = doc.heightOfString(r, { width: W - 36, lineGap: 2 });
    const ch = Math.max(32, h + 16);
    y = ensureSpace(y, ch + 8);

    doc.save().roundedRect(ml, y, W, ch, 8).fillAndStroke(bgCard, border).restore();
    doc.fillColor(pink).font("Times-BoldItalic").fontSize(16).text("♡", ml + 8, y + ch/2 - 9);
    doc.fillColor(ink).font("Times-Roman").fontSize(11)
      .text(r, ml + 28, y + 8, { width: W - 38, lineGap: 2 });
    y += ch + 8;
  }

  y = ensureSpace(y + 12, 110);
  doc.save().moveTo(ml+40, y).lineTo(ml+W-40, y).strokeColor(border).lineWidth(1).stroke().restore();
  doc.fillColor(rose).font("Times-BoldItalic").fontSize(12)
    .text("♡  Com amor eterno  ♡", ml, y+8, { width: W, align: "center" });
  y += 26;

  const hw = W/2 - 24, rx = ml + W/2 + 24;
  doc.save().moveTo(ml, y+22).lineTo(ml+hw, y+22).strokeColor(border).lineWidth(1).stroke().restore();
  doc.save().moveTo(rx, y+22).lineTo(rx+hw, y+22).strokeColor(border).lineWidth(1).stroke().restore();
  doc.fillColor(muted).font("Times-Italic").fontSize(9).text("Sua assinatura", ml, y+26).text("Assinatura dela", rx, y+26);
  doc.fillColor(pink).font("Times-BoldItalic").fontSize(14)
    .text(signYou, ml, y+6, { width: hw }).text(signHer, rx, y+6, { width: hw });

  doc.fillColor(muted).font("Times-Italic").fontSize(9)
    .text("\" Para sempre é tempo insuficiente. \"", ml, PH - MB - 28, { width: W, align: "center" });
  doc.save().moveTo(ml, PH-MB-14).lineTo(ml+W, PH-MB-14).strokeColor(border).lineWidth(1).stroke().restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICADO — fundo creme, bordas douradas duplas, lacre, linguagem formal
// ─────────────────────────────────────────────────────────────────────────────
function generateCertificado(doc, { signedAt, signYou, signHer }) {
  const PW = doc.page.width, PH = doc.page.height;
  const ml = 60, mr = 60;
  const W  = PW - ml - mr;
  const MB = doc.page.margins.bottom;

  const bgPage = "#fffdf5";
  const gold   = "#b8860b";
  const gold2  = "#daa520";
  const goldL  = "#f5e6a3";
  const ink    = "#2c1a00";
  const muted  = "#7a5c20";

  function drawPageBg() {
    doc.save().rect(0, 0, PW, PH).fill(bgPage).restore();
    // Borda dupla dourada
    const m1 = 12, m2 = 18;
    doc.save().rect(m1, m1, PW-m1*2, PH-m1*2).strokeColor(gold).lineWidth(2.5).stroke().restore();
    doc.save().rect(m2, m2, PW-m2*2, PH-m2*2).strokeColor(gold2).lineWidth(0.8).stroke().restore();
    // Ornamentos nos cantos
    const corners = [[m1+2,m1+2],[PW-m1-10,m1+2],[m1+2,PH-m1-12],[PW-m1-10,PH-m1-12]];
    corners.forEach(([x,y]) => {
      doc.save().circle(x+4, y+4, 5).fill(gold).restore();
    });
    // Faixas horizontais decorativas topo e rodapé
    doc.save().rect(m2+4, m2+4, PW-(m2+4)*2, 4).fill(goldL).restore();
    doc.save().rect(m2+4, PH-m2-8, PW-(m2+4)*2, 4).fill(goldL).restore();
  }

  function header(y) {
    doc.fillColor(gold).font("Times-Bold").fontSize(9).text("✦ ✦ ✦", ml, y, { width: W, align: "center" });
    y += 12;
    doc.fillColor(muted).font("Times-Italic").fontSize(11)
      .text("República do Nosso Universo — Cartório do Amor", ml, y, { width: W, align: "center" });
    y += 16;
    doc.fillColor(gold).font("Times-Bold").fontSize(26)
      .text("CERTIFICADO DE NAMORO", ml, y, { width: W, align: "center" });
    y += 32;
    doc.save().moveTo(ml+20, y).lineTo(ml+W-20, y).strokeColor(gold).lineWidth(1).stroke().restore();
    y += 10;
    doc.fillColor(ink).font("Times-Roman").fontSize(11)
      .text("Certificamos, para os devidos fins românticos, que as partes abaixo identificadas", ml, y, { width: W, align: "center" });
    y += 15;
    doc.fillColor(ink).font("Times-Roman").fontSize(11)
      .text("estão unidas em namoro oficial, perpétuo e irrevogável, com pleno amor e consentimento.", ml, y, { width: W, align: "center" });
    y += 20;
    doc.save().moveTo(ml+20, y).lineTo(ml+W-20, y).strokeColor(gold).lineWidth(1).stroke().restore();
    y += 12;
    doc.fillColor(gold2).font("Times-BoldItalic").fontSize(12)
      .text("Conferido em " + signedAt + "  —  Validade: Eterna", ml, y, { width: W, align: "center" });
    return y + 22;
  }

  function ensureSpace(y, h) {
    if (y + h <= PH - MB - 30) return y;
    doc.addPage(); drawPageBg();
    return 40;
  }

  drawPageBg();
  let y = header(30);

  doc.fillColor(gold).font("Times-Bold").fontSize(11)
    .text("— CLÁUSULAS DO ACORDO —", ml, y, { width: W, align: "center" });
  y += 18;

  for (let i = 0; i < CLAUSES.length; i++) {
    const { r } = CLAUSES[i];
    doc.font("Times-Roman").fontSize(10.5);
    const h = doc.heightOfString(r, { width: W - 52, lineGap: 2 });
    const ch = Math.max(30, h + 14);
    y = ensureSpace(y, ch + 7);

    doc.save().roundedRect(ml, y, W, ch, 6).fillAndStroke(goldL, gold2).restore();
    doc.fillColor(gold).font("Times-Bold").fontSize(9)
      .text(`Art. ${String(i+1).padStart(2,"0")}`, ml+8, y+ch/2-6);
    doc.fillColor(ink).font("Times-Roman").fontSize(10.5)
      .text(r, ml+50, y+7, { width: W-58, lineGap: 2 });
    y += ch + 7;
  }

  // Lacre e assinaturas
  y = ensureSpace(y + 16, 130);
  const cx = ml + W/2, cy = y + 28;
  doc.save().circle(cx, cy, 26).fill(gold).restore();
  doc.save().circle(cx, cy, 22).fill(gold2).restore();
  doc.save().circle(cx, cy, 18).fill(goldL).restore();
  doc.fillColor(gold).font("Times-Bold").fontSize(7)
    .text("LACRE", cx-12, cy-4, { width: 24, align: "center" });
  doc.fillColor(gold).font("Times-Bold").fontSize(6)
    .text("OFICIAL", cx-12, cy+3, { width: 24, align: "center" });

  y += 64;
  const hw = W/2 - 30, rx = ml + W/2 + 30;
  doc.save().moveTo(ml, y).lineTo(ml+hw, y).strokeColor(gold).lineWidth(1).stroke().restore();
  doc.save().moveTo(rx, y).lineTo(rx+hw, y).strokeColor(gold).lineWidth(1).stroke().restore();
  doc.fillColor(muted).font("Times-Italic").fontSize(9).text("Outorgante", ml, y+4).text("Outorgada", rx, y+4);
  doc.fillColor(ink).font("Times-BoldItalic").fontSize(13)
    .text(signYou, ml, y-16, { width: hw }).text(signHer, rx, y-16, { width: hw });

  doc.fillColor(muted).font("Times-Italic").fontSize(8)
    .text("Autenticado pelo Cartório do Nosso Universo  ·  Validade: Para sempre", ml, PH-MB-22, { width: W, align: "center" });
  doc.save().moveTo(ml+20, PH-MB-10).lineTo(ml+W-20, PH-MB-10).strokeColor(gold).lineWidth(0.8).stroke().restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// REVISTA/EDITORIAL — sidebar rosa, grid, tipografia bold moderna
// ─────────────────────────────────────────────────────────────────────────────
function generateRevista(doc, { signedAt, signYou, signHer }) {
  const PW = doc.page.width, PH = doc.page.height;
  const MB = doc.page.margins.bottom;
  const SIDEBAR = 148;
  const ml = SIDEBAR + 24;
  const W  = PW - ml - 32;

  const pink   = "#ff5fa2";
  const violet = "#7c4dff";
  const ink    = "#111111";
  const white  = "#ffffff";
  const gray   = "#555555";
  const lgray  = "#f0f0f0";

  function drawPageBg() {
    doc.save().rect(0, 0, PW, PH).fill(white).restore();
    // Sidebar rosa
    doc.save().rect(0, 0, SIDEBAR, PH).fill(pink).restore();
    // Faixa violet no topo
    doc.save().rect(0, 0, PW, 6).fill(violet).restore();
    // Linha separadora sidebar
    doc.save().moveTo(SIDEBAR, 6).lineTo(SIDEBAR, PH).strokeColor(violet).lineWidth(1.5).stroke().restore();
  }

  function sidebarContent() {
    // Título vertical grande na sidebar
    doc.save();
    doc.fillColor(white).font("Helvetica-Bold").fontSize(28);
    // Título em 3 linhas na sidebar
    doc.text("ACORDO", 12, 40, { width: SIDEBAR - 20, align: "center" });
    doc.text("DE", 12, 76, { width: SIDEBAR - 20, align: "center" });
    doc.text("NAMORO", 12, 112, { width: SIDEBAR - 20, align: "center" });
    doc.restore();

    // Data na sidebar
    doc.fillColor(white).font("Helvetica").fontSize(8)
      .text(signedAt, 10, 148, { width: SIDEBAR - 16, align: "center" });

    // Linha decorativa
    doc.save().moveTo(20, 162).lineTo(SIDEBAR-20, 162).strokeColor(white).lineWidth(1).stroke().restore();

    // Labels laterais
    doc.fillColor(white).font("Helvetica-Bold").fontSize(7.5)
      .text("VALIDADE", 10, 170, { width: SIDEBAR-16, align: "center" })
      .text("ETERNA", 10, 180, { width: SIDEBAR-16, align: "center" });

    doc.save().moveTo(20, 194).lineTo(SIDEBAR-20, 194).strokeColor(white).lineWidth(0.5).stroke().restore();

    doc.fillColor(white).font("Helvetica").fontSize(7)
      .text("Nosso Universo", 10, 200, { width: SIDEBAR-16, align: "center" })
      .text("2 anos", 10, 210, { width: SIDEBAR-16, align: "center" });
  }

  function header(y) {
    doc.fillColor(violet).font("Helvetica-Bold").fontSize(8)
      .text("DOCUMENTO OFICIAL DE NAMORO", ml, y, { width: W });
    y += 12;
    doc.save().moveTo(ml, y).lineTo(ml+W, y).strokeColor(violet).lineWidth(1.5).stroke().restore();
    y += 10;
    doc.fillColor(gray).font("Helvetica").fontSize(10)
      .text("Este acordo estabelece os termos e condições do relacionamento entre as partes, com vigor imediato e validade perpétua.", ml, y, { width: W, lineGap: 2 });
    y += 30;
    doc.save().moveTo(ml, y).lineTo(ml+W, y).strokeColor(lgray).lineWidth(1).stroke().restore();
    return y + 10;
  }

  function ensureSpace(y, h) {
    if (y + h <= PH - MB - 14) return y;
    doc.addPage(); drawPageBg(); sidebarContent();
    return 20;
  }

  drawPageBg();
  sidebarContent();
  let y = header(20);

  for (let i = 0; i < CLAUSES.length; i++) {
    const { r } = CLAUSES[i];
    doc.font("Helvetica").fontSize(10.5);
    const h = doc.heightOfString(r, { width: W - 36, lineGap: 2 });
    const ch = Math.max(28, h + 14);
    y = ensureSpace(y, ch + 6);

    // Tag numerada colorida
    const tagColor = i % 2 === 0 ? pink : violet;
    doc.save().roundedRect(ml, y, 24, ch, 4).fill(tagColor).restore();
    doc.fillColor(white).font("Helvetica-Bold").fontSize(9)
      .text(String(i+1), ml, y + ch/2 - 6, { width: 24, align: "center" });

    // Fundo alternado
    if (i % 2 === 0) {
      doc.save().rect(ml+26, y, W-26, ch).fill(lgray).restore();
    }
    doc.fillColor(ink).font("Helvetica").fontSize(10.5)
      .text(r, ml+32, y+7, { width: W-36, lineGap: 2 });
    y += ch + 6;
  }

  // Assinaturas
  y = ensureSpace(y + 18, 90);
  doc.save().rect(ml, y, W, 4).fill(violet).restore();
  y += 12;
  doc.fillColor(violet).font("Helvetica-Bold").fontSize(10)
    .text("ASSINATURAS", ml, y);
  y += 18;

  const hw = W/2 - 16, rx = ml + W/2 + 16;
  doc.save().rect(ml, y, hw, 3).fill(pink).restore();
  doc.save().rect(rx, y, hw, 3).fill(violet).restore();
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(12)
    .text(signYou, ml, y-14, { width: hw }).text(signHer, rx, y-14, { width: hw });
  doc.fillColor(gray).font("Helvetica").fontSize(8)
    .text("Você", ml, y+7).text("Ela", rx, y+7);
}

// ─────────────────────────────────────────────────────────────────────────────
function generatePdfBuffer(payload) {
  return new Promise((resolve, reject) => {
    const { signedAt, signYou, signHer, variant = "romantico" } = payload;
    const doc = new PDFDocument({ margin: 48, size: "A4", autoFirstPage: true, info: { Title: "Acordo de Namoro - Nosso Universo" } });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const data = { signedAt, signYou, signHer };
    if (variant === "nerd")                        generateNerd(doc, data);
    else if (variant === "minimal" || variant === "minimalista") generateMinimal(doc, data);
    else                                            generateRomantico(doc, data);

    doc.end();
  });
}

module.exports = { generatePdfBuffer };
