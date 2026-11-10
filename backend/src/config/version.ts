import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Version de l'application, lue dans package.json (source unique de vérité).
 * Elle est aussi utilisée par Jenkins pour construire le tag de l'image Docker.
 * Fonctionne en développement (src/config) comme dans l'image (dist/config) :
 * package.json est copié à la racine de l'image.
 */
export function readAppVersion(): string {
  try {
    const raw = readFileSync(join(__dirname, "..", "..", "package.json"), "utf8");
    const { version } = JSON.parse(raw) as { version?: string };
    return version ?? "unknown";
  } catch {
    return "unknown";
  }
}

export const appVersion = readAppVersion();
