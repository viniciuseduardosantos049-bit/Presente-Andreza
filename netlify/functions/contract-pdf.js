const { generatePdfBuffer } = require("../../lib/pdf-generator");

exports.handler = async (event) => {
	if (event.httpMethod !== "POST") {
		return { statusCode: 405, body: "Method not allowed" };
	}

	try {
		const payload = JSON.parse(event.body || "{}");
		const { signedAt, signYou, signHer } = payload;

		if (!signedAt || !signYou || !signHer) {
			return {
				statusCode: 400,
				body: JSON.stringify({ ok: false, message: "Campos obrigatorios: signedAt, signYou, signHer" })
			};
		}

		const pdfBuffer = await generatePdfBuffer(payload);
		const date = String(signedAt).replace(/\//g, "-");

		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="acordo-namoro-${date}.pdf"`
			},
			body: pdfBuffer.toString("base64"),
			isBase64Encoded: true
		};
	} catch (err) {
		return { statusCode: 500, body: JSON.stringify({ ok: false, message: err.message }) };
	}
};
