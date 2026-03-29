import { seedCodeStore } from "./versions";
import { renderUI } from "./ui";

export { RolloutConfig } from "./rollout";

/**
 * Gateway worker: serves the UI, manages rollout state via a Durable Object,
 * and composes responses from two dynamic sub-services (layout + API).
 *
 * The dynamic workers' source code lives in KV — as if each version were
 * deployed by a CI pipeline or PR build. The gateway loads them on demand
 * via env.LOADER.get(), which caches warm isolates by ID.
 */

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
  CODE_STORE: KVNamespace;
  ROLLOUT: DurableObjectNamespace;
}

// Loads a dynamic worker by reading its source from KV.
// LOADER.get() caches by ID — the callback only runs on cold start.
function loadWorker(env: Env, service: string, version: number) {
  return env.LOADER.get(`${service}-v${version}`, async () => {
    const code = await env.CODE_STORE.get(`${service}-v${version}`);
    if (!code) throw new Error(`Version ${service}-v${version} not found in KV`);
    return {
      compatibilityDate: "2026-03-24",
      mainModule: "index.js",
      modules: { "index.js": code },
      globalOutbound: null,
    };
  });
}

function getRolloutStub(env: Env) {
  return env.ROLLOUT.get(env.ROLLOUT.idFromName("global"));
}

// Seed KV on first request per isolate. In local dev, wrangler restarts
// clear KV, so this ensures versions are always available without a
// manual /seed step. The promise is shared so concurrent requests don't
// race or double-seed.
let seeded: Promise<void> | null = null;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!seeded) {
      seeded = seedCodeStore(env.CODE_STORE).then(() => {});
    }
    await seeded;

    const url = new URL(request.url);

    // -- UI --
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(renderUI(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // -- Rollout state API (Durable Object RPC, not fetch proxy) --
    const stub = getRolloutStub(env) as any;

    if (url.pathname === "/api/state" && request.method === "GET") {
      return Response.json(await stub.getState());
    }

    if (url.pathname === "/api/global" && request.method === "POST") {
      const body = await request.json();
      return Response.json(await stub.setGlobal(body));
    }

    if (url.pathname === "/api/user" && request.method === "POST") {
      const { id, name } = await request.json() as { id: string; name: string };
      return Response.json(await stub.addUser(id, name));
    }

    if (url.pathname.startsWith("/api/user/") && request.method === "DELETE") {
      const id = url.pathname.split("/api/user/")[1];
      return Response.json(await stub.removeUser(id));
    }

    if (url.pathname.startsWith("/api/user/") && request.method === "POST") {
      const id = url.pathname.split("/api/user/")[1];
      const overrides = await request.json() as { layoutOverride?: number; apiOverride?: number };
      return Response.json(await stub.setUserOverride(id, overrides));
    }

    if (url.pathname.startsWith("/api/clear/") && request.method === "POST") {
      const id = url.pathname.split("/api/clear/")[1];
      return Response.json(await stub.clearUserOverride(id));
    }

    // -- Preview: compose layout + API dynamic workers --
    if (url.pathname === "/preview") {
      const layoutVersion = parseInt(url.searchParams.get("layoutVersion") || "1");
      const apiVersion = parseInt(url.searchParams.get("apiVersion") || "1");
      const userId = url.searchParams.get("userId") || "anonymous";

      // Load both workers upfront. LOADER.get() is synchronous — it returns
      // a stub immediately and runs the callback (KV read) in the background
      // if the isolate isn't already warm. This lets both cold starts overlap.
      const apiWorker = loadWorker(env, "api", apiVersion);
      const layoutWorker = loadWorker(env, "layout", layoutVersion);

      // Fetch API data first (layout needs the emoji from API response)
      const apiResponse = await apiWorker.getEntrypoint().fetch(
        new Request(`http://internal/api?userId=${userId}`)
      );
      const apiData = await apiResponse.json<{ emoji: string }>();

      // Render layout with API data composed in
      return layoutWorker.getEntrypoint().fetch(
        new Request(
          `http://internal/render?apiData=${encodeURIComponent(apiData.emoji)}&apiVersion=${apiVersion}&userId=${userId}`
        )
      );
    }

    return new Response("Not found", { status: 404 });
  },
};
