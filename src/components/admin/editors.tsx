"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { BookOverride, LifeEntry, Skill, WorkEntry } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * Content editors for /admin.
 *
 * Deliberately plain: one collapsible row per record, a form on expand, and a
 * save that POSTs to /api/admin/<table>. No optimistic state and no client-side
 * cache — after a successful write the route handler has already called
 * revalidatePath, so router.refresh() is both the confirmation and the reload.
 */

const input =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-foreground/40";
const label = "block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";
const btn =
  "rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50";

/** Textareas hold one list item per line — the least fiddly array editor that
 *  does not need drag handles or a chip component. */
const toLines = (v: string[]) => v.join("\n");
const fromLines = (v: string) =>
  v.split("\n").map((s) => s.trim()).filter(Boolean);

function useSave(table: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(payload: unknown) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/${table}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.issues?.[0]?.message ?? body.error ?? `Failed (${res.status})`);
      return false;
    }
    router.refresh();
    return true;
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/${table}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError(`Delete failed (${res.status})`);
  }

  return { save, remove, busy, error };
}

function Row({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium">{title}</span>
          {subtitle ? (
            <span className="block truncate font-mono text-[10px] text-muted-foreground">
              {subtitle}
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            "shrink-0 font-mono text-[10px] text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        >
          ▸
        </span>
      </button>
      {open ? <div className="space-y-2.5 border-t border-border px-3 py-3">{children}</div> : null}
    </div>
  );
}

// ------------------------------------------------------------------ work

export function WorkEditor({ entries }: { entries: WorkEntry[] }) {
  const { save, remove, busy, error } = useSave("work_entries");

  const blank: WorkEntry = {
    id: "",
    title: "",
    track: "Backend",
    period_start: "2026-01",
    period_end: null,
    summary: "",
    highlights: [],
    metrics: [],
    tech: [],
    sort_order: 100,
    published: true,
  };

  return (
    <div className="space-y-2">
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {[...entries, blank].map((entry, i) => {
        const isNew = !entry.id;
        return (
          <WorkForm
            key={entry.id || `new-${i}`}
            entry={entry}
            isNew={isNew}
            busy={busy}
            onSave={save}
            onDelete={remove}
          />
        );
      })}
    </div>
  );
}

function WorkForm({
  entry,
  isNew,
  busy,
  onSave,
  onDelete,
}: {
  entry: WorkEntry;
  isNew: boolean;
  busy: boolean;
  onSave: (p: unknown) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState(entry);
  const set = <K extends keyof WorkEntry>(k: K, v: WorkEntry[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Row
      title={isNew ? "+ New work entry" : form.title || "(untitled)"}
      subtitle={isNew ? undefined : `${form.track} · ${form.period_start}`}
    >
      <div className="grid grid-cols-2 gap-2.5">
        <div className="col-span-2">
          <label className={label}>Title</label>
          <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className={label}>Track</label>
          <input className={input} value={form.track} onChange={(e) => set("track", e.target.value)} />
        </div>
        <div>
          <label className={label}>Sort order</label>
          <input
            type="number"
            className={input}
            value={form.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
          />
        </div>
        <div>
          <label className={label}>Start (yyyy-MM)</label>
          <input
            className={input}
            placeholder="2026-06"
            value={form.period_start}
            onChange={(e) => set("period_start", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>End (blank = present)</label>
          <input
            className={input}
            placeholder="2026-12"
            value={form.period_end ?? ""}
            onChange={(e) => set("period_end", e.target.value || null)}
          />
        </div>
      </div>

      <div>
        <label className={label}>Summary</label>
        <textarea
          rows={3}
          className={input}
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </div>
      <div>
        <label className={label}>Highlights (one per line)</label>
        <textarea
          rows={4}
          className={input}
          value={toLines(form.highlights)}
          onChange={(e) => set("highlights", fromLines(e.target.value))}
        />
      </div>
      <div>
        <label className={label}>Metrics (one per line)</label>
        <textarea
          rows={2}
          className={input}
          value={toLines(form.metrics)}
          onChange={(e) => set("metrics", fromLines(e.target.value))}
        />
      </div>
      <div>
        <label className={label}>Tech (one per line)</label>
        <textarea
          rows={3}
          className={input}
          value={toLines(form.tech)}
          onChange={(e) => set("tech", fromLines(e.target.value))}
        />
      </div>

      <Actions
        busy={busy}
        published={form.published}
        onTogglePublished={() => set("published", !form.published)}
        onSave={() => onSave(isNew ? stripId(form) : form)}
        onDelete={isNew ? undefined : () => onDelete(form.id)}
      />
    </Row>
  );
}

// ------------------------------------------------------------------ life

export function LifeEditor({ entries }: { entries: LifeEntry[] }) {
  const { save, remove, busy, error } = useSave("life_entries");
  const blank: LifeEntry = {
    id: "",
    title: "",
    category: "Family",
    note: null,
    media_id: null,
    media_type: "image",
    date_label: null,
    sort_order: 100,
    published: true,
  };

  return (
    <div className="space-y-2">
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {[...entries, blank].map((entry, i) => (
        <LifeForm
          key={entry.id || `new-${i}`}
          entry={entry}
          isNew={!entry.id}
          busy={busy}
          onSave={save}
          onDelete={remove}
        />
      ))}
    </div>
  );
}

function LifeForm({
  entry,
  isNew,
  busy,
  onSave,
  onDelete,
}: {
  entry: LifeEntry;
  isNew: boolean;
  busy: boolean;
  onSave: (p: unknown) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState(entry);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const set = <K extends keyof LifeEntry>(k: K, v: LifeEntry[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  /**
   * Signed direct-to-Cloudinary upload: the file goes browser -> Cloudinary and
   * never transits this app, which keeps it clear of Vercel's request body
   * limit and is the only way videos are practical on the free tier.
   */
  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const sigRes = await fetch("/api/admin/upload-signature", { method: "POST" });
      if (!sigRes.ok) throw new Error("Could not get an upload signature.");
      const { cloudName, apiKey, timestamp, folder, signature } = await sigRes.json();

      const isVideo = file.type.startsWith("video/");
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", apiKey);
      body.append("timestamp", String(timestamp));
      body.append("folder", folder);
      body.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? "video" : "image"}/upload`,
        { method: "POST", body }
      );
      if (!res.ok) throw new Error("Cloudinary rejected the upload.");
      const json = await res.json();

      set("media_id", json.public_id);
      set("media_type", isVideo ? "video" : "image");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Row
      title={isNew ? "+ New life entry" : form.title || "(untitled)"}
      subtitle={isNew ? undefined : form.category}
    >
      <div className="grid grid-cols-2 gap-2.5">
        <div className="col-span-2">
          <label className={label}>Title / name</label>
          <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className={label}>Category</label>
          <input
            className={input}
            list="life-categories"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          />
          <datalist id="life-categories">
            <option value="Family" />
            <option value="Friends" />
            <option value="Places" />
            <option value="Moments" />
          </datalist>
        </div>
        <div>
          <label className={label}>Date label</label>
          <input
            className={input}
            placeholder="Aug 2026"
            value={form.date_label ?? ""}
            onChange={(e) => set("date_label", e.target.value || null)}
          />
        </div>
      </div>

      <div>
        <label className={label}>Note</label>
        <textarea
          rows={2}
          className={input}
          value={form.note ?? ""}
          onChange={(e) => set("note", e.target.value || null)}
        />
      </div>

      <div>
        <label className={label}>Media (image or video)</label>
        <input
          type="file"
          accept="image/*,video/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
          className="w-full text-[11px] file:mr-2 file:rounded-md file:border file:border-border file:bg-secondary file:px-2 file:py-1 file:text-[10px]"
        />
        {uploading ? (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">Uploading…</p>
        ) : null}
        {uploadError ? <p className="mt-1 text-[10px] text-destructive">{uploadError}</p> : null}
        {form.media_id ? (
          <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
            {form.media_type}: {form.media_id}
          </p>
        ) : null}
      </div>

      <Actions
        busy={busy}
        published={form.published}
        onTogglePublished={() => set("published", !form.published)}
        onSave={() => onSave(isNew ? stripId(form) : form)}
        onDelete={isNew ? undefined : () => onDelete(form.id)}
      />
    </Row>
  );
}

// ------------------------------------------------------------------ skills

export function SkillsEditor({ skills }: { skills: Skill[] }) {
  const { save, remove, busy, error } = useSave("skills");
  const [draft, setDraft] = useState({ name: "", category: "Backend", weight: 2, sort_order: 100 });

  return (
    <div className="space-y-3">
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span
            key={s.id}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 font-mono text-[11px]"
          >
            {s.name}
            <span className="text-muted-foreground">{s.category}</span>
            <button
              onClick={() => remove(s.id)}
              disabled={busy}
              aria-label={`Delete ${s.name}`}
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-4 items-end gap-2 rounded-xl border border-border bg-card p-3">
        <div className="col-span-2">
          <label className={label}>Skill</label>
          <input
            className={input}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Category</label>
          <input
            className={input}
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Weight 1–3</label>
          <input
            type="number"
            min={1}
            max={3}
            className={input}
            value={draft.weight}
            onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) })}
          />
        </div>
        <button
          disabled={busy || !draft.name}
          onClick={async () => {
            if (await save(draft)) setDraft({ ...draft, name: "" });
          }}
          className={cn(btn, "col-span-4 bg-foreground text-background")}
        >
          Add skill
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ books

export function BooksEditor({
  books,
  overrides,
}: {
  books: { slug: string; title: string; author: string; genre?: string }[];
  overrides: Record<string, BookOverride>;
}) {
  const { save, busy, error } = useSave("book_overrides");

  return (
    <div className="space-y-2">
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Ratings set here take priority over Hardcover, which currently returns none.
      </p>
      {books.map((b) => (
        <BookRow
          key={b.slug}
          book={b}
          override={overrides[b.slug]}
          busy={busy}
          onSave={save}
        />
      ))}
    </div>
  );
}

function BookRow({
  book,
  override,
  busy,
  onSave,
}: {
  book: { slug: string; title: string; author: string; genre?: string };
  override?: BookOverride;
  busy: boolean;
  onSave: (p: unknown) => Promise<boolean>;
}) {
  const [rating, setRating] = useState<string>(override?.rating?.toString() ?? "");
  const [genre, setGenre] = useState(override?.genre ?? "");
  const [note, setNote] = useState(override?.note ?? "");

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">{book.title}</span>
        <span className="block truncate font-mono text-[10px] text-muted-foreground">
          {book.author} · {book.genre ?? "no genre"}
        </span>
      </span>
      <input
        type="number"
        min={0}
        max={5}
        step={0.5}
        placeholder="★"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className={cn(input, "w-16 text-center")}
      />
      <input
        placeholder="genre override"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className={cn(input, "w-32")}
      />
      <input
        placeholder="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={cn(input, "w-40")}
      />
      <button
        disabled={busy}
        onClick={() =>
          onSave({
            slug: book.slug,
            rating: rating === "" ? null : Number(rating),
            genre: genre || null,
            note: note || null,
            featured: override?.featured ?? false,
          })
        }
        className={cn(btn, "bg-foreground text-background")}
      >
        Save
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ shared

function Actions({
  busy,
  published,
  onTogglePublished,
  onSave,
  onDelete,
}: {
  busy: boolean;
  published: boolean;
  onTogglePublished: () => void;
  onSave: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <input type="checkbox" checked={published} onChange={onTogglePublished} />
        Published
      </label>
      <div className="flex gap-2">
        {onDelete ? (
          <button
            onClick={onDelete}
            disabled={busy}
            className={cn(btn, "border border-border text-destructive")}
          >
            Delete
          </button>
        ) : null}
        <button
          onClick={onSave}
          disabled={busy}
          className={cn(btn, "bg-foreground text-background")}
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

/** New rows must not send an empty `id` — the column is a uuid with a default,
 *  and "" fails the uuid check before Postgres ever sees the default. */
function stripId<T extends { id: string }>(row: T): Omit<T, "id"> {
  const { id, ...rest } = row;
  return rest;
}
