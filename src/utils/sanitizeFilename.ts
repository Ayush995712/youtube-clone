import path from "path";

export function sanitizeFilename(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();

  const baseName = path
    .basename(fileName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "");

  const safeBaseName = baseName || "file";

  return `${safeBaseName}${ext}`;
}
