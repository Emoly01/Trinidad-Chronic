import { promises as fs } from "fs";
import path from "path";
import type { Data } from "./types";
import { SEED_DATA } from "./seed";
import { backfillNpcLinks } from "./npcs";

const BLOB_PATHNAME = "trinidad-diaries/db.json";
const HERO_SEED_URL = "/seed/Flower.png";

// A Blob store is available either via a classic read-write token, or via a
// modern OIDC connection (which exposes BLOB_STORE_ID instead of a token — the
// @vercel/blob SDK then authenticates with the auto-injected VERCEL_OIDC_TOKEN).
// Checking only for the token made OIDC-connected deployments fall back to the
// read-only disk path and fail every write with ENOENT.
const hasBlob = () =>
  !!process.env.BLOB_READ_WRITE_TOKEN || !!process.env.BLOB_STORE_ID;

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

const emptyData = (): Data => ({ ...SEED_DATA, heroImageUrl: HERO_SEED_URL });

/**
 * Reads the chronicle. Returns null ONLY when the store is genuinely empty
 * (nothing has ever been written); anything that merely *might* be a transient
 * failure throws instead.
 *
 * That distinction matters more than it looks: callers treat null as "start a
 * fresh, empty chronicle", so returning null for a hiccup — a blob that is
 * briefly missing from `list`, a non-200 from the CDN, malformed JSON — would
 * hand back an empty document that then gets written over everyone's data.
 */
async function readRaw(attempt = 0): Promise<Data | null> {
  if (hasBlob()) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    const hit = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!hit) {
      // `list` is eventually consistent, so a freshly written document can be
      // missing for a moment. Retry before believing the store is empty.
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
        return readRaw(attempt + 1);
      }
      return null;
    }
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Blob-Lesefehler: HTTP ${res.status}`);
    return (await res.json()) as Data;
  }
  let txt: string;
  try {
    txt = await fs.readFile(LOCAL_DB_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
  return JSON.parse(txt) as Data;
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

/**
 * Reads the chronicle for rendering. Never writes: an empty chronicle is not
 * worth persisting, and persisting one after a failed read is exactly how a
 * whole campaign gets wiped. If storage can't be reached we render an empty
 * page and leave whatever is stored untouched.
 */
export async function getData(): Promise<Data> {
  let existing: Data | null;
  try {
    existing = await readRaw();
  } catch (err) {
    console.error("Chronik konnte nicht gelesen werden:", err);
    return emptyData();
  }
  if (!existing) return emptyData();
  // Character links written before NSC auto-linking have no NSC entry yet.
  // Repaired in memory here (the ids are deterministic, so this matches what
  // the write path persists) — the repair is saved with the next change.
  backfillNpcLinks(existing);
  return existing;
}

/**
 * Read-modify-write under the in-process lock. `mutator` mutates `data` in
 * place or returns a replacement. If the stored chronicle can't be read, the
 * mutation is aborted rather than written on top of an empty document, so a
 * storage hiccup surfaces as a failed save instead of silent data loss.
 */
export async function mutateData(
  mutator: (data: Data) => Data | void
): Promise<Data> {
  return withLock(async () => {
    const existing = await readRaw();
    const data = existing ?? emptyData();
    backfillNpcLinks(data);
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

export { newId } from "./id";
