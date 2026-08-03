const http = require("http");
const { generatePdfBuffer } = require("./lib/pdf-generator");

const PORT = 5501;
const PAYLOAD = { signedAt: "13/06/2024", signYou: "Vinicius", signHer: "Andreza" };

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>Preview PDFs — Nosso Universo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui; background: #1a1030; color: #fff; min-height: 100vh; }
    header { background: linear-gradient(135deg,#ff5fa2,#7c4dff); padding: 20px 32px; display:flex; align-items:center; gap:16px; }
    header h1 { font-size: 1.3rem; font-weight: 700; }
    header p { font-size: .85rem; opacity: .85; }
    .grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; padding: 24px; height: calc(100vh - 80px); }
    .col { display:flex; flex-direction:column; gap:10px; }
    .col-title { text-align:center; font-weight:700; font-size:1rem; padding:10px; border-radius:10px; }
    .romantico .col-title { background:#ff5fa2; }
    .nerd      .col-title { background:#4527a0; }
    .minimal   .col-title { background:#333; }
    iframe { flex:1; border:none; border-radius:10px; width:100%; background:#fff; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>📄 Preview dos PDFs</h1>
      <p>Comparação lado a lado dos 3 modelos do Acordo de Namoro</p>
    </div>
  </header>
  <div class="grid">
    <div class="col romantico">
      <div class="col-title">💗 Romântico</div>
      <iframe src="/pdf/romantico" title="Romântico"></iframe>
    </div>
    <div class="col nerd">
      <div class="col-title">⚛️ Nerd</div>
      <iframe src="/pdf/nerd" title="Nerd"></iframe>
    </div>
    <div class="col minimal">
      <div class="col-title">🖤 Minimalista</div>
      <iframe src="/pdf/minimal" title="Minimalista"></iframe>
    </div>
  </div>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  if (req.url === "/" || req.url === "") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML);
    return;
  }

  const match = req.url.match(/^\/pdf\/(romantico|nerd|minimal)$/);
  if (match) {
    try {
      const variant = match[1];
      const buf = await generatePdfBuffer({ ...PAYLOAD, variant });
      res.writeHead(200, { "Content-Type": "application/pdf", "Content-Length": buf.length });
      res.end(buf);
    } catch (e) {
      res.writeHead(500); res.end(e.message);
    }
    return;
  }

  res.writeHead(404); res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Preview rodando em http://localhost:${PORT}`);
});
