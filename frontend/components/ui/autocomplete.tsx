// components/ui/autocomplete.tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Suggestion } from "@/lib/useAutocomplete";

type Props = {
  open: boolean;
  x: number; // left coord (px) relative to composer
  y: number; // top coord
  width?: number;
  items: Suggestion[];
  highlight: number;
  onPick: (s: Suggestion) => void;
  setHighlight: (i: number) => void;
};

export default function Autocomplete({ open, x, y, width = 420, items, highlight, onPick, setHighlight }: Props) {
  if (!open || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="absolute z-50 rounded-xl border border-white/10 bg-[#121827] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_32px_-12px_rgba(155,140,255,0.30)]"
      style={{ left: x, top: y, width }}
      role="listbox"
      aria-label="Autocomplete suggestions"
    >
      <div className="max-h-64 overflow-y-auto">
        <ul className="py-1">
          {items.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={highlight === i}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => { e.preventDefault(); onPick(s); }}
              className={cn(
                "px-3 py-2.5 cursor-pointer text-sm flex items-start gap-2",
                highlight === i ? "bg-white/6" : "hover:bg-white/5"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex min-w-[64px] shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wide",
                  s.kind === "command" ? "bg-purple-500/15 text-purple-300" :
                  s.kind === "ai" ? "bg-emerald-500/15 text-emerald-300" :
                  "bg-slate-500/15 text-slate-300"
                )}
              >
                {s.kind}
              </span>
              <span className="text-slate-100">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-3 py-2 text-[11px] text-slate-400 border-t border-white/5">
        ↑/↓ to navigate • Enter/Tab to insert • Esc to close
      </div>
    </motion.div>
  );
}
