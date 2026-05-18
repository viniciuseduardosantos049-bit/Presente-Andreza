async function loadModelPage() {
  try {
    const response = await fetch("index.html", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar template");

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");

    const bodyNodes = [...parsed.body.children].filter((node) => node.tagName !== "SCRIPT");

    document.body.innerHTML = "";
    bodyNodes.forEach((node) => {
      document.body.appendChild(document.importNode(node, true));
    });

    const appScript = document.createElement("script");
    appScript.src = "script.js";
    appScript.onload = () => {
      // Se a API já estiver pronta, dispara o bootstrap manualmente.
      if (window.YT?.Player && typeof window.onYouTubeIframeAPIReady === "function") {
        window.onYouTubeIframeAPIReady();
        return;
      }

      const ytScriptAlreadyLoaded = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!ytScriptAlreadyLoaded) {
        const ytScript = document.createElement("script");
        ytScript.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(ytScript);
      }
    };
    document.body.appendChild(appScript);
  } catch (error) {
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;font-family:Poppins,Arial,sans-serif;padding:20px;">
        <div style="max-width:520px;background:#fff;border-radius:16px;padding:18px;border:1px solid #ffd1e6;box-shadow:0 12px 30px rgba(0,0,0,.08)">
          <h1 style="margin:0 0 8px;color:#ff5fa2;font-family:Pacifico,cursive;">Erro ao carregar modelo</h1>
          <p style="margin:0;color:#2a2430;">Não consegui carregar o conteúdo principal. Recarregue a página.</p>
        </div>
      </main>
    `;
    console.error(error);
  }
}

loadModelPage();
