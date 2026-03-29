// Generates the code string for a "layout" dynamic worker at a given version.
// Each version produces a different background color on a rainbow gradient.
export function layoutWorkerCode(version: number): string {
  const hue = Math.round(((version - 1) / 9) * 300); // 0=red → 300=magenta across 10 versions
  const sat = 70;
  const light = version === 1 ? 15 : 30 + Math.round(((version - 1) / 9) * 35);
  return `
    export default {
      async fetch(request) {
        const url = new URL(request.url);
        const apiData = url.searchParams.get("apiData") || "";
        const userId = url.searchParams.get("userId") || "";
        const layoutV = ${version};
        const apiV = url.searchParams.get("apiVersion") || "?";

        return new Response(\`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: hsl(${hue}, ${sat}%, ${light}%);
    color: hsl(${hue}, 20%, 92%);
    font-family: "SF Mono", "Fira Code", monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 4px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .emoji { font-size: 28px; text-shadow: none; }
  .version { font-size: 11px; opacity: 0.8; font-weight: 600; }
  .label { font-size: 9px; opacity: 0.5; text-transform: uppercase; letter-spacing: 1px; }
</style>
</head>
<body>
  <div class="emoji">\${apiData || "—"}</div>
  <div class="version">v\${layoutV}</div>
  <div class="label">layout v\${layoutV} · api v\${apiV}</div>
</body>
</html>\`, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    };
  `;
}

// Generates the code string for an "API" dynamic worker at a given version.
// Each version returns different content (emoji/text).
const EMOJI_SETS: string[][] = [
  ["🚀", "🌙", "⭐", "🪐", "☄️", "🌌", "🛸", "🌠", "💫", "🌑"],
  ["🌊", "🐋", "🐠", "🦈", "🐙", "🦑", "🏄", "⛵", "🌅", "🐚"],
  ["🌲", "🍄", "🦊", "🐻", "🌿", "🍃", "🏔️", "⛰️", "🦌", "🐺"],
  ["🔥", "🌋", "⚡", "💥", "🎆", "🎇", "✨", "💎", "🔮", "🌈"],
  ["🎵", "🎸", "🥁", "🎹", "🎺", "🎻", "🎷", "🎤", "🎶", "🎼"],
  ["🏗️", "🔧", "⚙️", "🔩", "🛠️", "📐", "🧱", "🏭", "🔨", "⛏️"],
  ["🌸", "🌺", "🌻", "🌷", "🌹", "💐", "🌼", "🪷", "🌱", "🪴"],
  ["🎮", "🕹️", "👾", "🎲", "🃏", "🎯", "🏆", "🎪", "🤖", "🧩"],
  ["❄️", "⛄", "🏔️", "🧊", "🌨️", "🎿", "🛷", "🦭", "🐧", "🌬️"],
  ["🍕", "🍔", "🌮", "🍜", "🍣", "🥐", "🧁", "🍩", "🥑", "🍝"],
];

export function apiWorkerCode(version: number): string {
  const setIndex = Math.floor(((version - 1) / 100) * EMOJI_SETS.length) % EMOJI_SETS.length;
  const emojis = EMOJI_SETS[setIndex];
  const emoji = emojis[(version - 1) % emojis.length];

  return `
    export default {
      async fetch(request) {
        return Response.json({
          version: ${version},
          emoji: "${emoji}",
          theme: "${getThemeName(setIndex)}",
        });
      }
    };
  `;
}

function getThemeName(index: number): string {
  return [
    "space",
    "ocean",
    "forest",
    "fire",
    "music",
    "build",
    "garden",
    "arcade",
    "winter",
    "food",
  ][index];
}
