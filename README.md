# The Trinidad Diaries

A shared campaign chronicle for a Trinidad & Tobago–inspired TTRPG group — sessions, quotes, snippets, NPCs, player characters, and a moodboard, all editable by anyone at the table. Built with Next.js (App Router), deployed on Vercel.

Implements the design from `The Trinidad Diaries.dc.html` (Claude Design handoff).

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without any extra setup, data is stored in `data/db.json` and uploaded images in `public/uploads/` — both gitignored, both fine for local development.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel (or run `vercel` from this directory).
2. **Connect a Blob store** so uploaded photos are stored centrally and visible to everyone, not just your own browser:
   - In the Vercel dashboard, open the project → **Storage** → **Create Database** → **Blob**.
   - Connect it to this project. Vercel automatically sets the `BLOB_READ_WRITE_TOKEN` environment variable — no code changes needed.
3. Deploy. Once `BLOB_READ_WRITE_TOKEN` is present, the app automatically stores the chronicle data (`trinidad-diaries/db.json`) and all uploaded images in that Blob store instead of the local-disk fallback.

Without a connected Blob store, the app still runs on Vercel using the local-disk fallback, but serverless instances don't share a filesystem — writes from one request may not be visible from another. Connect Blob storage before sharing the link with your group.

## How data works

- All chronicle content (sessions, quotes, snippets, NPCs, PCs, moodboard) lives in one JSON document, read/written via `lib/store.ts`.
- Photos (portraits, moodboard images, the hero image) upload through `/api/image` and the entity-specific `POST` routes, and are stored as files (Vercel Blob in production, `public/uploads/` locally) — never as inline data.
- Any image slot (hero photo, an NSC portrait, a PC portrait, a PC's linked-NSC avatar, a moodboard tile) can be filled or replaced at any time by clicking it or dragging a photo onto it.
