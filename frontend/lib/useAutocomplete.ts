// lib/useAutocomplete.ts
import { useEffect, useMemo, useRef, useState } from "react";

export type Suggestion = {
  id: string;
  label: string;          // shown in the list
  insertText: string;     // what we insert
  kind: "phrase" | "command" | "ai";
};

export type ProviderCtx = {
  draft: string;
  lastTurns: string[];      // last 2–3 messages from the thread (strings)
  personaTone?: "formal" | "casual" | "playful";
};

type Provider = (fragment: string, ctx: ProviderCtx) => Promise<Suggestion[]>;

// --- local phrase provider (super fast, offline) ---
const PHRASES = [
  "quick thought —",
  "totally fair, also —",
  "random idea:",
  "two options:",
  "wild card:",
  "super quick q:",
  "tiny follow-up —",
  "btw",
  "also",
  "actually",
  "wait",
  "hmm",
  "yeah",
  "totally",
  "for sure",
  "no worries",
  "sounds good",
  "perfect",
  "thanks",
  "appreciate it",
];

const localPhraseProvider: Provider = async (fragment) => {
  const f = fragment.toLowerCase();
  if (!f) return [];
  return PHRASES
    .filter((p) => p.startsWith(f) || p.includes(" " + f))
    .slice(0, 5)
    .map((p, i) => ({ id: "p" + i + p, label: p, insertText: p, kind: "phrase" as const }));
};

// --- slash command provider ---
const COMMANDS: Array<{ cmd: string; label: string; example: string }> = [
  { cmd: "/nudge", label: "Low-risk nudge (2 options + opt-out)", example: "Ramen or tacos Thu 7–9?" },
  { cmd: "/rewrite", label: "Un-dry this (≤120 chars)", example: "Punch up my draft" },
  { cmd: "/exit", label: "Graceful exit (≤140 chars)", example: "Polite boundary" },
];

const commandProvider: Provider = async (fragment) => {
  if (!fragment.startsWith("/")) return [];
  return COMMANDS.filter(c => c.cmd.startsWith(fragment))
    .map((c) => ({
      id: c.cmd,
      label: `${c.cmd} — ${c.label}`,
      insertText: c.cmd,
      kind: "command" as const
    }));
};

// --- AI provider (Gemini) — only when fragment is long-ish & not a command ---
async function aiProvider(fragment: string, ctx: ProviderCtx): Promise<Suggestion[]> {
  if (!fragment || fragment.startsWith("/") || fragment.length < 6) return [];
  try {
    const r = await fetch("/api/coach/rewrite", {
      method: "POST",
      body: JSON.stringify({ draft: fragment, lastTurns: ctx.lastTurns, mode: "autocomplete" }),
      headers: { "Content-Type": "application/json" },
    });
    const { suggestions } = await r.json(); // expect array of strings
    return (suggestions ?? []).slice(0, 3).map((s: string, i: number) => ({
      id: "ai" + i,
      label: s,
      insertText: s,
      kind: "ai" as const
    }));
  } catch {
    return [];
  }
}

// --- util: get current fragment user is typing (token after last punctuation/line break) ---
function extractFragment(draft: string, caret: number) {
  const upto = draft.slice(0, caret);
  const m = upto.match(/([^.\n!?]*?)$/); // from last sentence break
  const frag = (m?.[1] ?? "").trimStart();
  const start = caret - (m?.[1]?.length ?? 0);
  return { fragment: frag, start, end: caret };
}

export function useAutocomplete(ctx: ProviderCtx) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [highlight, setHighlight] = useState(0);
  const caretRef = useRef(0);

  const providers = useMemo<Provider[]>(() => [commandProvider, localPhraseProvider, aiProvider], []);

  async function update(draft: string, caret: number) {
    caretRef.current = caret;
    const { fragment } = extractFragment(draft, caret);
    if (!fragment || /^\s+$/.test(fragment)) { setOpen(false); setItems([]); return; }

    // gather suggestions from providers (in parallel), then rank
    const results = (await Promise.all(providers.map(p => p(fragment, ctx)))).flat();

    // simple ranking: commands first if fragment starts with '/', else phrase > ai
    const ranked = results.sort((a, b) => {
      const k = (s: Suggestion) => s.kind === "command" ? 0 : s.kind === "phrase" ? 1 : 2;
      return k(a) - k(b);
    });

    setItems(ranked.slice(0, 7));
    setHighlight(0);
    setOpen(ranked.length > 0);
  }

  function close() { setOpen(false); }

  function onKeyNav(e: React.KeyboardEvent) {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => (h + 1) % items.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => (h - 1 + items.length) % items.length); }
  }

  return { open, items, highlight, setHighlight, update, close, onKeyNav, caretRef, extractFragment };
}
