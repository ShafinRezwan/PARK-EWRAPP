
import "server-only";

import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";

export const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024;

const allowedTypes = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export function getUploadRoot(): string {
  const root = process.env.EWR_UPLOAD_DIR;

  if (!root || !path.isAbsolute(root)) {
    throw new Error(
      "EWR_UPLOAD_DIR must be an absolute directory path."
    );
  }

  return path.resolve(root);
}

export function getExtension(mimeType: string) {
  return allowedTypes.get(mimeType) ?? null;
}

export async function saveAttachment(
  file: File,
  reportId: string,
  invoiceId: string,
  extension: string
) {
  const pathname = path.posix.join(
    "ewr",
    randomUUID(),
    "invoices",
    randomUUID() + extension
  );

  const absolutePath = path.resolve(
    getUploadRoot(),
    ...pathname.split("/")
  );

  await mkdir(path.dirname(absolutePath), {
    recursive: true,
  });

  await writeFile(
    absolutePath,
    Buffer.from(await file.arrayBuffer()),
    { flag: "wx" }
  );

  return { pathname, absolutePath };
}

export async function deleteStoredFile(
  absolutePath: string
) {
  try {
    await unlink(absolutePath);
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code !== "ENOENT"
    ) {
      throw error;
    }
  }
}
