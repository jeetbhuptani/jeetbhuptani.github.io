import type { FieldSpec } from "./record-editor";

/**
 * Field specs for the schema-driven editors. One entry per editable column,
 * in the order it should appear in the form.
 *
 * Kept separate from the component so the specs can be read (and diffed)
 * without wading through form markup.
 */

export const PROFILE_FIELDS: FieldSpec[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "initials", label: "Initials", type: "text" },
  { key: "url", label: "Site URL", type: "text", placeholder: "https://jeetbhuptani.tech" },
  { key: "location", label: "Location", type: "text" },
  { key: "location_link", label: "Location link", type: "text" },
  { key: "birth_date", label: "Birth date", type: "text", placeholder: "2004-08-01", help: "Drives the live age in the hero." },
  { key: "email", label: "Email", type: "text" },
  { key: "tel", label: "Phone", type: "text" },
  { key: "avatar_url", label: "Avatar URL", type: "text" },
  { key: "description", label: "Short description", type: "textarea", help: "Used for SEO and the hero line." },
  { key: "summary", label: "About (markdown)", type: "textarea" },
];

export const SOCIAL_FIELDS: FieldSpec[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "url", label: "URL", type: "text" },
  { key: "icon", label: "Icon", type: "icon", help: "An icon name, or a path like /devfolio.svg" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "navbar", label: "Show in navbar", type: "checkbox" },
];

export const NAV_FIELDS: FieldSpec[] = [
  { key: "label", label: "Label", type: "text" },
  { key: "href", label: "Href", type: "text", placeholder: "/work" },
  { key: "icon", label: "Icon", type: "icon" },
  { key: "sort_order", label: "Sort order", type: "number" },
];

export const TIMELINE_FIELDS: FieldSpec[] = [
  { key: "kind", label: "Kind", type: "select", options: ["work", "volunteer", "education"] },
  { key: "org", label: "Organisation / school", type: "text" },
  { key: "role", label: "Role / degree", type: "text", wide: true },
  { key: "period_start", label: "Start", type: "text", placeholder: "Jun 2026" },
  { key: "period_end", label: "End", type: "text", placeholder: "blank = Present" },
  { key: "location", label: "Location", type: "text" },
  { key: "href", label: "Link", type: "text" },
  { key: "logo_url", label: "Logo URL", type: "text" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "badges", label: "Badges (one per line)", type: "lines" },
  { key: "published", label: "Published", type: "checkbox" },
];

export const PROJECT_FIELDS: FieldSpec[] = [
  { key: "kind", label: "Kind", type: "select", options: ["project", "showcase"], help: "showcase renders under Work; project in the Projects rail." },
  { key: "title", label: "Title", type: "text" },
  { key: "dates", label: "Dates", type: "text", placeholder: "May 2025 - May 2025" },
  { key: "href", label: "Link", type: "text" },
  { key: "image", label: "Image", type: "text" },
  { key: "video", label: "Video", type: "text" },
  { key: "motif", label: "Motif", type: "text", placeholder: "collections | voice" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "technologies", label: "Technologies (one per line)", type: "lines" },
  { key: "links", label: "Links", type: "links", help: "One per line: Label | https://… | icon" },
  { key: "active", label: "Active", type: "checkbox" },
  { key: "published", label: "Published", type: "checkbox" },
];

export const HACKATHON_FIELDS: FieldSpec[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "dates", label: "Dates", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "image", label: "Image", type: "text" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "links", label: "Links", type: "links", help: "One per line: Label | https://… | icon" },
  { key: "published", label: "Published", type: "checkbox" },
];

export const CERTIFICATE_FIELDS: FieldSpec[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "issuer", label: "Issuer", type: "text" },
  { key: "date_label", label: "Date", type: "text", placeholder: "June 2025" },
  { key: "credential_id", label: "Credential ID", type: "text" },
  { key: "image", label: "Image", type: "text" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "links", label: "Links", type: "links" },
  { key: "published", label: "Published", type: "checkbox" },
];

export const POST_FIELDS: FieldSpec[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "slug", label: "Slug", type: "text", help: "The URL segment. Changing it breaks existing links." },
  { key: "published_at", label: "Published date", type: "text", placeholder: "2026-04-18" },
  { key: "image", label: "Cover image", type: "text" },
  { key: "summary", label: "Summary", type: "textarea" },
  { key: "body", label: "Body (markdown)", type: "markdown", help: "Rendered with the same pipeline as the .mdx files — code blocks keep syntax highlighting." },
  { key: "published", label: "Published", type: "checkbox" },
];

/** Blank rows for the "+ New entry" form at the bottom of each editor. */
export const BLANKS: Record<string, Record<string, any>> = {
  social_links: { name: "", url: "", icon: "globe", navbar: true, sort_order: 100 },
  nav_items: { label: "", href: "", icon: "globe", sort_order: 100 },
  timeline_entries: {
    kind: "work", org: "", role: "", period_start: "", period_end: null, location: null,
    href: null, logo_url: null, description: null, badges: [], sort_order: 100, published: true,
  },
  projects: {
    kind: "project", title: "", dates: "", href: null, image: null, video: null, motif: null,
    description: "", technologies: [], links: [], active: true, sort_order: 100, published: true,
  },
  hackathons: {
    title: "", dates: "", location: "", image: null, description: "", links: [],
    sort_order: 100, published: true,
  },
  certificates: {
    title: "", issuer: "", date_label: "", credential_id: null, image: null,
    description: null, links: [], sort_order: 100, published: true,
  },
  posts: {
    title: "", slug: "", summary: "", body: "", image: null,
    published_at: new Date().toISOString().slice(0, 10), published: true,
  },
  profile: {
    name: "", initials: "", url: "", location: "", location_link: null, birth_date: null,
    description: "", summary: "", avatar_url: null, email: "", tel: null,
  },
};
