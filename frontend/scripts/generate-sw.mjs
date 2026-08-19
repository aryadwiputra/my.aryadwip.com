// Generate public/sw.js from sw.template.js, injecting a cache version
// derived from the current git commit short SHA. Every deploy gets a fresh
// cache name, so installed PWAs pick up new assets (activate() deletes old caches).
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

let version = "v1";
try {
  const sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  version = `v${sha}`;
} catch {
  // Not a git repo — fall back to timestamp.
  version = `v${Date.now().toString(36)}`;
}

const template = readFileSync(join(publicDir, "sw.template.js"), "utf8");
const out = template.replace("__CACHE_VERSION__", version);
writeFileSync(join(publicDir, "sw.js"), out);
console.log(`[sw] generated sw.js with cache version ${version}`);
