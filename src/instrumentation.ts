/**
 * Runs once when the Next.js server boots.
 *  · initializes official categories and settings if the database is fresh
 *  · creates the default admin account if not already created
 *  · NO fake demo products or fake reviews are inserted
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { initCleanBaseData } = await import("./db/init");
    await initCleanBaseData();
  } catch (error) {
    console.error("[init] Failed to initialize base data:", error);
  }
}
