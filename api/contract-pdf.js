const { generatePdfBuffer } = require("../lib/pdf-generator");

module.exports = async (req, res) => {
	if (req.method !== "POST") {
		res.status(405).json({ ok: false, message: "Method not allowed" });
		return;
	}

	try {
		const { signedAt, signYou, signHer } = req.body || {};

		if (!signedAt || !signYou || !signHer) {
			res.status(400).json({ ok: false, message: "Campos obrigatorios: signedAt, signYou, signHer" });
			return;
		}

		const pdfBuffer = await generatePdfBuffer(req.body);
		const date = String(signedAt).replace(/\//g, "-");

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename="acordo-namoro-${date}.pdf"`);
		res.status(200).send(pdfBuffer);
	} catch (error) {
		res.status(500).json({ ok: false, message: error.message || "Falha ao gerar PDF" });
	}
};
