// components/ui/message-composer.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Autocomplete from "./autocomplete";
import { useAutocomplete } from "@/lib/useAutocomplete";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Wand2 } from "lucide-react";

type Props = {
  lastTurns: string[];             // pass from /chat/[id] server loader
  personaTone?: "formal" | "casual" | "playful";
  onSend: (text: string) => Promise<void>;
};

export default function MessageComposer({ lastTurns, personaTone = "casual", onSend }: Props) {
  const [draft, setDraft] = useState("");
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    open, items, highlight, setHighlight,
    update, close, onKeyNav, caretRef, extractFragment
  } = useAutocomplete({ draft, lastTurns, personaTone });

  // position the popup near caret
  function positionPopup() {
    const ta = textareaRef.current;
    if (!ta) return;
    const rect = ta.getBoundingClientRect();
    // crude: anchor bottom-left of composer; good enough for hackathon
    setCoords({ x: 12, y: rect.top - 220 }); // above composer
  }

  useEffect(() => { positionPopup(); }, []);

  async function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setDraft(val);
    const caret = e.target.selectionStart ?? val.length;
    update(val, caret);
  }

  function insertSuggestion(text: string) {
    const caret = caretRef.current;
    const { start, end } = extractFragment(draft, caret);
    const next = draft.slice(0, start) + text + draft.slice(end);
    setDraft(next);
    close();
    // put caret at end of inserted text
    requestAnimationFrame(() => {
      const ta = textareaRef.current!;
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    });
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (open && items.length) {
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        insertSuggestion(items[highlight].insertText);
        return;
      }
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      // navigation
      onKeyNav(e);
    }
    // quick trigger: Ctrl+Space to force AI suggestions on current fragment
    if ((e.ctrlKey || e.metaKey) && e.key === " ") {
      e.preventDefault();
      update(draft, (e.target as HTMLTextAreaElement).selectionStart || draft.length);
    }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    await onSend(text);
    setDraft("");
    close();
  }

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0b0f17] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_30px_-12px_rgba(155,140,255,0.3)]">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-100">
          <Paperclip className="h-5 w-5" />
        </Button>

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={positionPopup}
          onClick={positionPopup}
          placeholder="Type a message… (try /nudge or 'random idea:')"
          rows={3}
          className="flex-1 resize-none bg-transparent outline-none text-slate-100 placeholder:text-slate-500 leading-6"
        />

        <Button onClick={handleSend} className="gap-2">
          <Send className="h-4 w-4" /> Send
        </Button>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => update(draft, draft.length)}
          title="Summon suggestions"
        >
          <Wand2 className="h-4 w-4" /> Suggest
        </Button>
      </div>

      <Autocomplete
        open={open}
        x={coords.x}
        y={coords.y}
        items={items}
        highlight={highlight}
        onPick={(s) => insertSuggestion(s.insertText)}
        setHighlight={setHighlight}
      />
    </div>
  );
}
