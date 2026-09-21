import { SETTINGS_DEFAULTS, type SettingsMap } from "./settings-defs";

/**
 * A last-known copy of the site settings, kept up to date by the server settings
 * loader on every read. Client components only ever *display* these values
 * (currency symbol, weight unit) – never use them for money calculations.
 */
let current: SettingsMap = { ...SETTINGS_DEFAULTS };

export function settingsSnapshot(): SettingsMap {
  return current;
}

export function writeSettingsSnapshot(values: SettingsMap) {
  current = values;
}
