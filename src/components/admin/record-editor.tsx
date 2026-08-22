"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ICON_NAMES } from "@/components/icon-by-name";
import { cn } from "@/lib/utils";

/**
 * Schema-driven record editor.
 *
 * The four original editors are bespoke because their UIs genuinely differ
 * (media upload, star ratings, chip lists). The eight collections added with
 * migration 0002 are all the same shape — a list of rows, each a flat set of
 * fields — so they get one component driven by a field spec instead of eight
 * near-identical forms. Adding a column means adding a line to a spec, not
 * writing another 150-line form.
 */

export type FieldSpec = {
  key: string;
  label: string;
  type: "text" | "textarea" | "markdown" | "number" | "checkbox" | "select" | "lines" | "icon" | "links";
  /** Options for `select`. */
  options?: string[];
  placeholder?: string;
  help?: string;
  /** Renders full-width instead of half. */
  wide?: boolean;
};

const inputCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-foreground/40";
const labelCls =
  "block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";
const btnCls =
  "rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50";

const toLines = (v: unknown) => (Array.isArray(v) ? v.join("\n") : "");
const fromLines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

/** Links are edited as one `label | href | icon` per line — a compact form that
 *  avoids a nested repeater UI for what is usually one or two entries. */
function linksToText(v: unknown): string {
  if (!Array.isArray(v)) return "";
  return v.map((l: any) => [l.label, l.href, l.icon].filter(Boolean).join(" | ")).join("\n");
}
function textToLinks(v: string) {
  return v
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter((parts) => parts[0] && parts[1])
    .map(([label, href, icon]) => ({ label, href, ...(icon ? { icon } : {}) }));
}

function Field({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: any;
  onChange: (v: any) => void;
}) {
  const common = { className: inputCls, placeholder: spec.placeholder };

  return (
    <div className={cn(spec.wide || spec.type !== "text" ? "col-span-2" : "")}>
      <label className={labelCls}>{spec.label}</label>

      {spec.type === "textarea" || spec.type === "markdown" ? (
        <textarea
          {...common}
          rows={spec.type === "markdown" ? 16 : 3}
          className={cn(inputCls, spec.type === "markdown" && "font-mono leading-relaxed")}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : spec.type === "lines" ? (
        <textarea
          {...common}
          rows={4}
          value={toLines(value)}
          onChange={(e) => onChange(fromLines(e.target.value))}
        />
      ) : spec.type === "links" ? (
        <textarea
          {...common}
          rows={3}
          placeholder="Label | https://… | icon"
          value={linksToText(value)}
          onChange={(e) => onChange(textToLinks(e.target.value))}
        />
      ) : spec.type === "checkbox" ? (
        <label className="mt-1 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {spec.label}
        </label>
      ) : spec.type === "number" ? (
        <input
          {...common}
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      ) : spec.type === "select" ? (
        <select
          className={inputCls}
          value={value ?? spec.options?.[0]}
          onChange={(e) => onChange(e.target.value)}
        >
          {spec.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : spec.type === "icon" ? (
        <>
          <input
            {...common}
            list="icon-names"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <datalist id="icon-names">
            {ICON_NAMES.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </>
      ) : (
        <input
          {...common}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      )}

      {spec.help ? (
        <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground/70">{spec.help}</p>
      ) : null}
    </div>
  );
}

function RecordForm({
  fields,
  record,
  isNew,
  titleKey,
  subtitleKey,
  busy,
  onSave,
  onDelete,
}: {
  fields: FieldSpec[];
  record: Record<string, any>;
  isNew: boolean;
  titleKey: string;
  subtitleKey?: string;
  busy: boolean;
  onSave: (row: Record<string, any>) => void;
  onDelete?: (id: string) => void;
}) {
  const [form, setForm] = useState(record);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium">
            {isNew ? "+ New entry" : form[titleKey] || "(untitled)"}
          </span>
          {!isNew && subtitleKey && form[subtitleKey] ? (
            <span className="block truncate font-mono text-[10px] text-muted-foreground">
              {String(form[subtitleKey])}
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

      {open ? (
        <div className="space-y-2.5 border-t border-border px-3 py-3">
          <div className="grid grid-cols-2 gap-2.5">
            {fields.map((spec) => (
              <Field
                key={spec.key}
                spec={spec}
                value={form[spec.key]}
                onChange={(v) => setForm((f) => ({ ...f, [spec.key]: v }))}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            {!isNew && onDelete ? (
              <button
                onClick={() => onDelete(form.id)}
                disabled={busy}
                className={cn(btnCls, "border border-border text-destructive")}
              >
                Delete
              </button>
            ) : null}
            <button
              onClick={() => {
                const row = { ...form };
                // A new row must not send an empty id: the column is uuid with a
                // default, and "" fails the uuid check before the default applies.
                if (isNew) delete row.id;
                onSave(row);
              }}
              disabled={busy}
              className={cn(btnCls, "bg-foreground text-background")}
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function RecordEditor({
  table,
  fields,
  rows,
  blank,
  titleKey = "title",
  subtitleKey,
  singleton = false,
}: {
  table: string;
  fields: FieldSpec[];
  rows: Record<string, any>[];
  blank: Record<string, any>;
  titleKey?: string;
  subtitleKey?: string;
  /** Profile is one row: render the form open, with no add/delete. */
  singleton?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(row: Record<string, any>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/${table}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.issues?.[0]?.message ?? body.error ?? `Failed (${res.status})`);
      return;
    }
    router.refresh();
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

  if (singleton) {
    const record = rows[0] ?? blank;
    return (
      <div className="space-y-2">
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="grid grid-cols-2 gap-2.5">
            <SingletonFields fields={fields} record={record} busy={busy} onSave={save} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {[...rows, blank].map((row, i) => (
        <RecordForm
          key={row.id || `new-${i}`}
          fields={fields}
          record={row}
          isNew={!row.id}
          titleKey={titleKey}
          subtitleKey={subtitleKey}
          busy={busy}
          onSave={save}
          onDelete={remove}
        />
      ))}
    </div>
  );
}

function SingletonFields({
  fields,
  record,
  busy,
  onSave,
}: {
  fields: FieldSpec[];
  record: Record<string, any>;
  busy: boolean;
  onSave: (row: Record<string, any>) => void;
}) {
  const [form, setForm] = useState(record);
  return (
    <>
      {fields.map((spec) => (
        <Field
          key={spec.key}
          spec={spec}
          value={form[spec.key]}
          onChange={(v) => setForm((f) => ({ ...f, [spec.key]: v }))}
        />
      ))}
      <div className="col-span-2 flex justify-end">
        <button
          onClick={() => onSave(form)}
          disabled={busy}
          className={cn(btnCls, "bg-foreground text-background")}
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </>
  );
}
