import { promises as fs } from "fs";
import path from "path";
import type { Data } from "./types";
import { SEED_DATA } from "./seed";

const BLOB_PATHNAME = "trinidad-diaries/db.json";
const HERO_SEED_URL = "/seed/hero-chaconia.png";

const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// Local dev (no Blob token configured yet): a JSON file on disk plays the
// same role the Blob store plays in production, so `npm run dev` works
// out of the box before anyone connects storage on Vercel.
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "db.json");
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Serializes reads/writes within this process. Doesn't make cross-instance
// (serverless) writes atomic, but this is a small campaign-chronicle app for
// one table's worth of players, not a system with real write contention.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readRaw(): Promise<Data | null> {
  if (hasBlob()) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    const hit = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!hit) return null;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Data;
  }
  try {
    const txt = await fs.readFile(LOCAL_DB_PATH, "utf8");
    return JSON.parse(txt) as Data;
  } catch {
    return null;
  }
}

async function writeRaw(data: Data): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATHNAME, json, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
  await fs.writeFile(LOCAL_DB_PATH, json, "utf8");
}

export async function getData(): Promise<Data> {
  const existing = await readRaw();
  if (existing) return existing;
  const seeded: Data = { ...SEED_DATA, heroImageUrl: HERO_SEED_URL };
  await writeRaw(seeded);
  return seeded;
}

/** Read-modify-write under the in-process lock. `mutator` mutates `data` in place or returns a replacement. */
export async function mutateData(
  mutator: (data: Data) => Data | void
): Promise<Data> {
  return withLock(async () => {
    const data = await getData();
    const result = mutator(data) || data;
    await writeRaw(result);
    return result;
  });
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** Uploads an image and returns its publicly-reachable URL. */
export async function uploadImage(file: File, key: string): Promise<string> {
  const ext = EXT_BY_TYPE[file.type] || "bin";
  const filename = `${key}-${Date.now()}.${ext}`;
  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`trinidad-diaries/images/${filename}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }
  await fs.mkdir(LOCAL_UPLOADS_DIR, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(LOCAL_UPLOADS_DIR, filename), buf);
  return `/uploads/${filename}`;
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
