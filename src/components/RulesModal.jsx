import { useEffect } from "react";
import { ACTIONS } from "../data/actions";

export default function RulesModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full sm:max-w-lg p-5 sm:p-6 animate-scaleIn shadow-glow max-h-[85vh] flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-ink-200/70">
              Guía de puntos
            </p>
            <h3 className="font-display text-2xl leading-tight">
              ¿Qué cuenta para sumar?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost text-sm px-3 py-1.5 min-h-[36px]"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <ul className="space-y-2 overflow-y-auto pr-1 scroll-thin">
          {ACTIONS.map((a) => (
            <li
              key={a.id}
              className="rounded-2xl p-3 border border-white/10 bg-white/[0.04]"
            >
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg bg-white/5 border border-white/10">
                  {a.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-ink-50 leading-tight">
                      {a.label}
                    </h4>
                    <span className="chip border bg-mint-soft/15 text-mint-soft border-mint-soft/20 shrink-0">
                      +{a.points}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-ink-200/80 leading-snug">
                    {a.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-[11px] text-ink-200/60 mt-4 pt-3 border-t border-white/10 text-center">
          Los puntos los suma quien corresponde según el caso. Si no está claro,
          el que NO hizo la acción los suma.
        </p>
      </div>
    </div>
  );
}
