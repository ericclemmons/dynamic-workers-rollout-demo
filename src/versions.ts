/**
 * Version definitions for the demo's two services.
 *
 * In a real system, each version's source code would be built by CI and
 * uploaded to KV (or R2) as part of a PR/deploy pipeline. Here we generate
 * them programmatically so the demo is self-contained.
 *
 * The gateway never sees this module — it reads code from KV at runtime.
 * This file is only used by the /seed endpoint to populate KV.
 */

const MAX_VERSIONS = 10;

// -- Layout service: renders a colored HTML page --

function layoutWorkerCode(version: number): string {
  // Map version 1–10 across a 300° hue arc (red → magenta)
  const hue = Math.round(((version - 1) / (MAX_VERSIONS - 1)) * 300);
  const sat = 70;
  const light =
    version === 1 ? 15 : 30 + Math.round(((version - 1) / (MAX_VERSIONS - 1)) * 35);

  return `
    export default {
      async fetch(request) {
        const url = new URL(request.url);
        const apiData = url.searchParams.get("apiData") || "";
        const layoutV = ${version};
        const apiV = url.searchParams.get("apiVersion") || "?";

        return new Response(\`<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: hsl(${hue}, ${sat}%, ${light}%);
    color: hsl(${hue}, 20%, 92%);
    font-family: "SF Mono", "Fira Code", monospace;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 100vh; gap: 4px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .emoji { font-size: 28px; text-shadow: none; }
  .version { font-size: 11px; opacity: 0.8; font-weight: 600; }
  .label { font-size: 9px; opacity: 0.5; text-transform: uppercase; letter-spacing: 1px; }
</style></head>
<body>
  <div class="emoji">\${apiData || "—"}</div>
  <div class="version">v\${layoutV}</div>
  <div class="label">layout v\${layoutV} · api v\${apiV}</div>
</body></html>\`, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    };
  `;
}

// -- API service: returns JSON with an emoji and theme --

const THEMES = [
  { name: "space",  emojis: ["🚀", "🌙", "⭐", "🪐", "☄️", "🌌", "🛸", "🌠", "💫", "🌑"] },
  { name: "ocean",  emojis: ["🌊", "🐋", "🐠", "🦈", "🐙", "🦑", "🏄", "⛵", "🌅", "🐚"] },
  { name: "forest", emojis: ["🌲", "🍄", "🦊", "🐻", "🌿", "🍃", "🏔️", "⛰️", "🦌", "🐺"] },
  { name: "fire",   emojis: ["🔥", "🌋", "⚡", "💥", "🎆", "🎇", "✨", "💎", "🔮", "🌈"] },
  { name: "music",  emojis: ["🎵", "🎸", "🥁", "🎹", "🎺", "🎻", "🎷", "🎤", "🎶", "🎼"] },
  { name: "build",  emojis: ["🏗️", "🔧", "⚙️", "🔩", "🛠️", "📐", "🧱", "🏭", "🔨", "⛏️"] },
  { name: "garden", emojis: ["🌸", "🌺", "🌻", "🌷", "🌹", "💐", "🌼", "🪷", "🌱", "🪴"] },
  { name: "arcade", emojis: ["🎮", "🕹️", "👾", "🎲", "🃏", "🎯", "🏆", "🎪", "🤖", "🧩"] },
  { name: "winter", emojis: ["❄️", "⛄", "🏔️", "🧊", "🌨️", "🎿", "🛷", "🦭", "🐧", "🌬️"] },
  { name: "food",   emojis: ["🍕", "🍔", "🌮", "🍜", "🍣", "🥐", "🧁", "🍩", "🥑", "🍝"] },
];

function apiWorkerCode(version: number): string {
  // Each version gets a different theme + emoji so the visual change is obvious
  const theme = THEMES[(version - 1) % THEMES.length];
  const emoji = theme.emojis[(version - 1) % theme.emojis.length];

  return `
    export default {
      async fetch(request) {
        return Response.json({
          version: ${version},
          emoji: "${emoji}",
          theme: "${theme.name}",
        });
      }
    };
  `;
}

// -- Seed KV with all versions of both services --

export async function seedCodeStore(kv: KVNamespace): Promise<number> {
  const writes: Promise<void>[] = [];

  for (let v = 1; v <= MAX_VERSIONS; v++) {
    writes.push(kv.put(`layout-v${v}`, layoutWorkerCode(v)));
    writes.push(kv.put(`api-v${v}`, apiWorkerCode(v)));
  }

  await Promise.all(writes);
  return MAX_VERSIONS;
}
