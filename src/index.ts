import { layoutWorkerCode, apiWorkerCode } from "./dynamic-workers";
import { renderUI } from "./ui";

export { RolloutConfig } from "./rollout";

interface Env {
  LOADER: {
    get(
      id: string,
      callback: () => Promise<{
        compatibilityDate: string;
        mainModule: string;
        modules: Record<string, string>;
        globalOutbound: null;
      }>
    ): {
      getEntrypoint(): { fetch(request: Request): Promise<Response> };
    };
  };
  ROLLOUT: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve the UI
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(renderUI(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Durable Object API proxy
    if (url.pathname.startsWith("/api/")) {
      const doId = env.ROLLOUT.idFromName("global");
      const stub = env.ROLLOUT.get(doId);
      const doUrl = new URL(request.url);
      doUrl.pathname = url.pathname.replace("/api", "");
      return stub.fetch(new Request(doUrl.toString(), request));
    }

    // Preview endpoint: loads dynamic workers and composes the result
    if (url.pathname === "/preview") {
      const layoutVersion = parseInt(url.searchParams.get("layoutVersion") || "1");
      const apiVersion = parseInt(url.searchParams.get("apiVersion") || "1");
      const userId = url.searchParams.get("userId") || "anonymous";

      // 1. Load the API dynamic worker and get data
      const apiWorker = env.LOADER.get(`api-v${apiVersion}`, async () => ({
        compatibilityDate: "2026-03-24",
        mainModule: "index.js",
        modules: { "index.js": apiWorkerCode(apiVersion) },
        globalOutbound: null,
      }));

      const apiEntrypoint = apiWorker.getEntrypoint();
      const apiResponse = await apiEntrypoint.fetch(
        new Request(`http://internal/api?userId=${userId}`)
      );
      const apiData = await apiResponse.json<{ emoji: string; version: number; theme: string }>();

      // 2. Load the Layout dynamic worker and pass API data
      const layoutWorker = env.LOADER.get(`layout-v${layoutVersion}`, async () => ({
        compatibilityDate: "2026-03-24",
        mainModule: "index.js",
        modules: { "index.js": layoutWorkerCode(layoutVersion) },
        globalOutbound: null,
      }));

      const layoutEntrypoint = layoutWorker.getEntrypoint();
      return layoutEntrypoint.fetch(
        new Request(
          `http://internal/render?apiData=${encodeURIComponent(apiData.emoji)}&apiVersion=${apiVersion}&userId=${userId}`
        )
      );
    }

    return new Response("Not found", { status: 404 });
  },
};
