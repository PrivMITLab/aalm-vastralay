import { config } from "dotenv";
import { setTimeout as wait } from "node:timers/promises";
config();
const url = process.argv[2] ?? process.env.SITE_URL;
const token = process.env.BOOTSTRAP_TOKEN ?? "demo";
if (!url) { console.error("usage: SITE_URL=https://your.app npm run deploy:bootstrap"); process.exit(1); }
async function main() {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${url}/api/bootstrap?token=${token}`);
      const txt = await res.text();
      console.log(`[${res.status}] ${txt}`);
      if (res.ok) return;
    } catch (err) { console.error("[deploy:bootstrap] error", err); }
    await wait(5000);
  }
  process.exit(1);
}
main();
