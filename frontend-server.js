const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const { promisify } = require("util");
require("dotenv").config();
const PDFDocument = require("pdfkit");

const execFileAsync = promisify(execFile);

const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 5500);

const PDF_VARIANTS = {
	romantico: {
		label: "Modelo Romantico",
		pageBg: "#fff6fb",
		headerBg: "#f9e8f4",
		headerBorder: "#f3bfd8",
		ink: "#2a2430",
		muted: "#6f5f72",
		accent: "#7c4dff",
		cardBg: "#f7ebf2",
		cardBorder: "#f3bfd8",
		line: "#b8a2bc"
	},
	minimal: {
		label: "Modelo Minimalista",
		pageBg: "#ffffff",
		headerBg: "#f7f7fa",
		headerBorder: "#e2e1ea",
		ink: "#222128",
		muted: "#62606a",
		accent: "#5a43d6",
		cardBg: "#fafafd",
		cardBorder: "#e9e8f1",
		line: "#b4b0c4"
	},
	nerd: {
		label: "Modelo Nerd Big Bang",
		pageBg: "#f8f5ff",
		headerBg: "#ede5ff",
		headerBorder: "#d9c6ff",
		ink: "#1e1a2a",
		muted: "#5f567a",
		accent: "#6b3cff",
		cardBg: "#f1ebff",
		cardBorder: "#d7c7ff",
		line: "#9f8dd3"
	},
	croche: {
		label: "Modelo Croche Cozy",
		pageBg: "#fff9f3",
		headerBg: "#f6ede2",
		headerBorder: "#e8d5bf",
		ink: "#35291f",
		muted: "#705c48",
		accent: "#a6622a",
		cardBg: "#f8f1e8",
		cardBorder: "#eadcc9",
		line: "#c4ab8c"
	},
	certificado: {
		label: "Modelo Certificado",
		pageBg: "#fffdf8",
		headerBg: "#f6f0df",
		headerBorder: "#dfd2ac",
		ink: "#2f2614",
		muted: "#6e603f",
		accent: "#9a7a2f",
		cardBg: "#fbf6e8",
		cardBorder: "#e7dbbe",
		line: "#baa87c"
	}
};

const MIME_TYPES = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".ico": "image/x-icon",
	".mp4": "video/mp4",
	".wav": "audio/wav",
	".ogg": "audio/ogg",
	".webm": "video/webm",
	".txt": "text/plain; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
	const body = JSON.stringify(payload);
	res.writeHead(statusCode, {
		"Content-Type": "application/json; charset=utf-8",
		"Content-Length": Buffer.byteLength(body)
	});
	res.end(body);
}

function readRequestBody(req, maxBytes = 10_000_000) {
	return new Promise((resolve, reject) => {
		let raw = "";

		req.on("data", (chunk) => {
			raw += chunk;
			if (raw.length > maxBytes) {
				reject(new Error("Payload muito grande"));
				req.destroy();
			}
		});

		req.on("end", () => {
			try {
				const parsed = raw ? JSON.parse(raw) : {};
				resolve(parsed);
			} catch {
				reject(new Error("JSON invalido"));
			}
		});

		req.on("error", reject);
	});
}

function streamContractPdf(res, payload, options = {}) {
	const signedAt = String(payload.signedAt || "").trim();
	const signYou = String(payload.signYou || "").trim();
	const signHer = String(payload.signHer || "").trim();
	const variantKey = String(payload.variant || "romantico").toLowerCase();

	if (!signedAt || !signYou || !signHer) {
		return sendJson(res, 400, { ok: false, message: "Campos obrigatorios: signedAt, signYou, signHer" });
	}

	const variant = PDF_VARIANTS[variantKey] || PDF_VARIANTS.romantico;
	const contentDisposition = options.contentDisposition || "attachment";

	const doc = new PDFDocument({
		margin: 44,
		size: "A4",
		info: {
			Title: "Acordo de Namoro - Nosso Universo"
		}
	});

	const filenameDate = signedAt.replace(/\//g, "-");
	const clauses = [
			"§ 1 — Abracos sao obrigatorios em qualquer dia dificil, sem excecoes nem clausulas de escape.",
			"§ 2 — Beijos extras em datas comemorativas e em dias normais tambem, porque sim.",
			"§ 3 — Se houver pizza, ha paz. E lei universal.",
			"§ 4 — Voce tem prioridade maxima na minha vida. Isso nao esta em negociacao.",
			"§ 5 — Maratonar series junto e atividade essencial e nao pode ser feita sem o outro.",
			"§ 6 — \"Eu te amo\" nunca expira. Renovacao automatica diaria.",
			"§ 7 — Sempre deixar o resto do seu lanche para mim.",
			"§ 10 — Discussoes so podem ser resolvidas com pedra, papel ou tesoura, lagarto, Spock.",
			"§ 28 — Se um dos dois estiver doente, o outro assume o papel de Dr. Cooper e cuida com protocolos cientificos (e mimos).",
			"§ 31 — Todo \"bug\" no relacionamento deve ser resolvido com dialogo, paciencia e, se necessario, cookies.",
			"§ 44 — O Dia do Contrato deve ser celebrado com a execucao do acordo de relacionamento em voz alta, com testemunhas (pelucias contam).",
			"§ 49 — O casal deve manter, em local visivel, pelo menos um item de decoracao nerd (action figure, poster, ou similar)."
		];

	const colors = {
			pageBg: variant.pageBg,
			headerBg: variant.headerBg,
			headerBorder: variant.headerBorder,
			ink: variant.ink,
			muted: variant.muted,
			violet: variant.accent,
			cardBg: variant.cardBg,
			cardBorder: variant.cardBorder,
			line: variant.line
		};

	const pageWidth = doc.page.width;
	const pageHeight = doc.page.height;
	const pageInnerWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;

	function drawPageBackground() {
			doc.save();
			doc.rect(0, 0, pageWidth, pageHeight).fill(colors.pageBg);
			doc.restore();
		}

	function drawHeader(startY) {
			const h = 96;
			doc.save();
			doc.roundedRect(doc.page.margins.left, startY, pageInnerWidth, h, 14)
				.fillAndStroke(colors.headerBg, colors.headerBorder);
			doc.restore();

			doc.fillColor(colors.violet)
				.font("Helvetica-Bold")
				.fontSize(12)
				.text("E = mc2 + amor", doc.page.margins.left + 16, startY + 14)
				.fontSize(10)
				.text(variant.label, doc.page.margins.left + pageInnerWidth - 170, startY + 16, {
					width: 154,
					align: "right"
				});

			doc.fillColor(colors.ink)
				.font("Helvetica-Bold")
				.fontSize(20)
				.text("Acordo de Namoro", doc.page.margins.left + 16, startY + 32, {
					width: pageInnerWidth - 32
				});

			doc.fillColor(colors.muted)
				.font("Helvetica")
				.fontSize(11)
				.text(
					"Este documento vincula as partes abaixo identificadas em perpetuidade romantica, em quaisquer universos paralelos possiveis.",
					doc.page.margins.left + 16,
					startY + 58,
					{ width: pageInnerWidth - 32, lineGap: 2 }
				);

			return startY + h + 14;
		}

	function ensureSpace(currentY, neededHeight) {
			const limit = pageHeight - doc.page.margins.bottom;
			if (currentY + neededHeight <= limit) return currentY;

			doc.addPage();
			drawPageBackground();
			return drawHeader(doc.page.margins.top);
		}

	drawPageBackground();

	res.writeHead(200, {
			"Content-Type": "application/pdf",
			"Content-Disposition": `${contentDisposition}; filename="acordo-namoro-nosso-universo-${filenameDate}.pdf"`
		});

	doc.pipe(res);

	let y = drawHeader(doc.page.margins.top);

	doc.fillColor(colors.violet)
			.font("Helvetica-Bold")
			.fontSize(11)
			.text(`Data de confirmacao: ${signedAt}`, doc.page.margins.left, y);

	y += 18;

	for (const clause of clauses) {
			doc.font("Helvetica").fontSize(11);
			const textHeight = doc.heightOfString(clause, {
				width: pageInnerWidth - 26,
				lineGap: 2
			});
			const cardHeight = Math.max(34, textHeight + 16);

		y = ensureSpace(y, cardHeight + 10);

			doc.save();
			doc.roundedRect(doc.page.margins.left, y, pageInnerWidth, cardHeight, 10)
				.fillAndStroke(colors.cardBg, colors.cardBorder);
			doc.restore();

			doc.fillColor(colors.ink)
				.font("Helvetica")
				.fontSize(11)
				.text(clause, doc.page.margins.left + 13, y + 8, {
					width: pageInnerWidth - 26,
					lineGap: 2
				});

		y += cardHeight + 10;
		}

	y = ensureSpace(y + 8, 130);

	doc.fillColor(colors.violet)
			.font("Helvetica-Bold")
			.fontSize(13)
			.text("Assinaturas", doc.page.margins.left, y);

	y += 26;

	const leftX = doc.page.margins.left;
	const rightX = doc.page.margins.left + pageInnerWidth / 2 + 10;
	const signLineWidth = pageInnerWidth / 2 - 16;

	doc.save();
		doc.moveTo(leftX, y).lineTo(leftX + signLineWidth, y).strokeColor(colors.line).lineWidth(1).stroke();
		doc.moveTo(rightX, y).lineTo(rightX + signLineWidth, y).strokeColor(colors.line).lineWidth(1).stroke();
		doc.restore();

	doc.fillColor(colors.ink)
			.font("Helvetica")
			.fontSize(10)
			.text("Sua assinatura:", leftX, y + 8)
			.text("Assinatura dela:", rightX, y + 8);

	doc.fillColor(colors.violet)
			.font("Helvetica-Oblique")
			.fontSize(13)
			.text(signYou, leftX, y + 24, { width: signLineWidth })
			.text(signHer, rightX, y + 24, { width: signLineWidth });

	y += 64;

	doc.fillColor(colors.muted)
			.font("Helvetica")
			.fontSize(10)
			.text("Firmado em 13 de junho de 2024. Validade: para sempre.", doc.page.margins.left, y, {
				width: pageInnerWidth,
				align: "right"
			});

	doc.fillColor(colors.violet)
			.font("Helvetica-Bold")
			.fontSize(10)
			.text("Nosso Universo - 2 anos", doc.page.margins.left, pageHeight - doc.page.margins.bottom + 8, {
				width: pageInnerWidth,
				align: "center"
			});

	doc.end();

	return;
}

async function handleSaveMedia(req, res) {
	try {
		const body = await readRequestBody(req, 10_000_000);
		const { key, dataUrl, position } = body;

		if (typeof key !== "number" && typeof key !== "string") {
			return sendJson(res, 400, { ok: false, message: "key obrigatorio" });
		}
		if (!dataUrl || !dataUrl.startsWith("data:")) {
			return sendJson(res, 400, { ok: false, message: "dataUrl invalido" });
		}

		const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
		if (!matches) {
			return sendJson(res, 400, { ok: false, message: "dataUrl mal formatado" });
		}

		const [, mime, b64] = matches;
		const ext = mime.includes("png") ? "png" : "jpg";
		const filename = `slot-${key}.${ext}`;
		const filepath = path.join(ROOT_DIR, "assets", filename);

		await fs.promises.writeFile(filepath, Buffer.from(b64, "base64"));

		const savedPosition = position || null;
		if (savedPosition) {
			const metaPath = path.join(ROOT_DIR, "assets", `slot-${key}.meta.json`);
			await fs.promises.writeFile(metaPath, JSON.stringify({ position: savedPosition }));
		}

		return sendJson(res, 200, { ok: true, path: `assets/${filename}`, position: savedPosition });
	} catch (err) {
		return sendJson(res, 500, { ok: false, message: err.message });
	}
}

async function handleContractPdf(req, res) {
	try {
		const body = await readRequestBody(req);
		return streamContractPdf(res, body);
	} catch (error) {
		return sendJson(res, 500, { ok: false, message: error.message || "Falha ao gerar PDF" });
	}
	}

function handleContractPdfExample(res, requestUrl) {
	const variantKey = String(requestUrl.searchParams.get("variant") || "romantico").toLowerCase();
	const variant = PDF_VARIANTS[variantKey] ? variantKey : "romantico";

	return streamContractPdf(res, {
		signedAt: "18/05/2026",
		signYou: "Assinatura Exemplo 1",
		signHer: "Assinatura Exemplo 2",
		variant
	}, {
		contentDisposition: "inline"
	});
}

function fetchExamplePdfBuffer(variant) {
	return new Promise((resolve, reject) => {
		const req = http.request(
			{
				hostname: "127.0.0.1",
				port: PORT,
				path: `/api/contract-pdf-example?variant=${encodeURIComponent(variant)}`,
				method: "GET",
				headers: { Accept: "application/pdf" }
			},
			(pdfRes) => {
				if (pdfRes.statusCode !== 200) {
					reject(new Error(`Falha ao obter PDF de exemplo (status ${pdfRes.statusCode})`));
					pdfRes.resume();
					return;
				}

				const chunks = [];
				pdfRes.on("data", (chunk) => chunks.push(chunk));
				pdfRes.on("end", () => resolve(Buffer.concat(chunks)));
			}
		);

		req.on("error", reject);
		req.end();
	});
}

async function handleContractPdfExamplePreview(res, requestUrl) {
	const variantKey = String(requestUrl.searchParams.get("variant") || "romantico").toLowerCase();
	const variant = PDF_VARIANTS[variantKey] ? variantKey : "romantico";
	const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const tempPrefix = path.join(os.tmpdir(), `nosso-universo-preview-${token}`);
	const tempPdfPath = `${tempPrefix}.pdf`;
	const tempPngPath = `${tempPrefix}.png`;

	try {
		const pdfBuffer = await fetchExamplePdfBuffer(variant);
		await fs.promises.writeFile(tempPdfPath, pdfBuffer);

		await execFileAsync("pdftoppm", ["-png", "-singlefile", "-f", "1", "-l", "1", tempPdfPath, tempPrefix]);

		const pngBuffer = await fs.promises.readFile(tempPngPath);
		res.writeHead(200, {
			"Content-Type": "image/png",
			"Content-Length": pngBuffer.length,
			"Cache-Control": "no-store"
		});
		res.end(pngBuffer);
	} catch (error) {
		return sendJson(res, 500, { ok: false, message: error.message || "Falha ao gerar preview do PDF" });
	} finally {
		await Promise.allSettled([
			fs.promises.unlink(tempPdfPath),
			fs.promises.unlink(tempPngPath)
		]);
	}
}

function resolveSafePath(urlPathname) {
	const decodedPath = decodeURIComponent(urlPathname);
	const normalized = path.normalize(decodedPath).replace(/^\/+/, "");
	const absolute = path.join(ROOT_DIR, normalized);

	if (!absolute.startsWith(ROOT_DIR)) {
		return null;
	}

	return absolute;
}

function serveStatic(req, res, pathname) {
	const targetPath = pathname === "/" ? "/index.html" : pathname;
	const absolutePath = resolveSafePath(targetPath);

	if (!absolutePath) {
		res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("Acesso negado");
		return;
	}

	fs.stat(absolutePath, (statErr, stats) => {
		if (statErr || !stats.isFile()) {
			res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
			res.end("Arquivo nao encontrado");
			return;
		}

		const ext = path.extname(absolutePath).toLowerCase();
		const contentType = MIME_TYPES[ext] || "application/octet-stream";

		const stream = fs.createReadStream(absolutePath);
		res.writeHead(200, { "Content-Type": contentType });
		stream.pipe(res);
		stream.on("error", () => {
			res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
			res.end("Erro ao ler arquivo");
		});
	});
}

const server = http.createServer(async (req, res) => {
	const requestUrl = new URL(req.url, `http://${req.headers.host}`);

	if (req.method === "POST" && requestUrl.pathname === "/api/save-media") {
		return handleSaveMedia(req, res);
	}

	if (req.method === "POST" && requestUrl.pathname === "/api/contract-pdf") {
		return handleContractPdf(req, res);
	}

	if ((req.method === "GET" || req.method === "HEAD") && requestUrl.pathname === "/api/contract-pdf-example") {
		return handleContractPdfExample(res, requestUrl);
	}

	if ((req.method === "GET" || req.method === "HEAD") && requestUrl.pathname === "/api/contract-pdf-example-preview") {
		return handleContractPdfExamplePreview(res, requestUrl);
	}

	if (req.method !== "GET" && req.method !== "HEAD") {
		res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("Metodo nao permitido");
		return;
	}

	serveStatic(req, res, requestUrl.pathname);
});

server.listen(PORT, "0.0.0.0", () => {
	console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
