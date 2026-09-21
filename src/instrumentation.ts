/**
 * Runs once when the Next.js server boots.
 *  · seeds the demo catalogue on a fresh database so the marketplace is never empty
 *  · back-fills any settings keys added by later releases
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.SKIP_SEED === "true") return;
  try {
    const { seedIfEmpty } = await import("./db/seed");
    const seeded = await seedIfEmpty();
    if (seeded) console.log("[seed] Demo data inserted.");
  } catch (error) {
    console.error("[seed] Failed to seed database:", error);
  }
  try {
    const { ensureSettingsRows } = await import("./lib/settings");
    const added = await ensureSettingsRows();
    if (added) console.log(`[settings] Back-filled ${added} configuration keys.`);
  } catch (error) {
    console.error("[settings] Failed to back-fill settings:", error);
  }
}
