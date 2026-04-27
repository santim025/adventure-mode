import { useEffect, useRef, useState } from "react";
import { ACTIONS } from "../data/actions";

export default function UserColumn({ user, value, onAdd, accent = "rose" }) {
  const prev = useRef(value);
  const [delta, setDelta] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (prev.current !== value) {
      const d = value - prev.current;
      setDelta(d);
      setAnimKey((k) => k + 1);
      prev.current = value;
      const t = setTimeout(() => setDelta(null), 1300);
      return () => clearTimeout(t);
    }
  }, [value]);

  const accents = {
    rose: {
      avatar: "from-rose-soft to-rose-deep text-ink-900",
      number: "from-rose-soft via-rose-deep to-lilac-soft",
      ring: "ring-rose-soft/30 hover:ring-rose-soft/60",
      shadow: "shadow-glowRose",
      chip: "bg-rose-soft/15 text-rose-soft border-rose-soft/20",
    },
    lilac: {
      avatar: "from-lilac-soft to-lilac-deep text-ink-900",
      number: "from-lilac-soft via-lilac-deep to-rose-soft",
      ring: "ring-lilac-soft/30 hover:ring-lilac-soft/60",
      shadow: "shadow-glow",
      chip: "bg-lilac-soft/15 text-lilac-soft border-lilac-soft/20",
    },
  }[accent];

  return (
    <section
      className={`glass p-5 sm:p-6 flex flex-col gap-5 transition-all duration-300 ring-1 ${accents.ring} ${accents.shadow}`}
    >
      <header className="flex items-center gap-3 relative">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-gradient-to-br ${accents.avatar} shadow-md`}
        >
          {user.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-200/70">
            Perfil
          </p>
          <h2 className="font-display text-2xl sm:text-3xl leading-tight truncate">
            {user.name}
          </h2>
        </div>

        {delta !== null && (
          <span
            key={animKey}
            className={[
              "absolute right-0 top-0 text-sm font-bold animate-floatUp",
              delta > 0 ? "text-mint-soft" : "text-rose-soft",
            ].join(" ")}
          >
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </header>

      <div className="flex items-baseline gap-2">
        <span
          key={animKey + "-num"}
          className={[
            "font-display font-bold tabular-nums bg-clip-text text-transparent",
            "text-[56px] sm:text-7xl leading-none",
            `bg-gradient-to-br ${accents.number}`,
            delta !== null ? "animate-pop inline-block" : "inline-block",
          ].join(" ")}
        >
          {value.toLocaleString("es-CO")}
        </span>
        <span className="text-sm font-medium text-ink-200/70">pts</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => onAdd(a)}
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 min-h-[52px]
              bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]
              active:scale-[0.98] transition-all duration-200 touch-manipulation"
          >
            <span className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-200">
              {a.emoji}
            </span>
            <span className="flex-1 text-left text-sm sm:text-[15px] font-medium text-ink-50">
              {a.label}
            </span>
            <span className={`chip border ${accents.chip}`}>+{a.points}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
