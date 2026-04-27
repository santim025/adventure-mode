import { useEffect, useState } from "react";

export default function RedeemModal({ prize, users, points, onConfirm, onClose }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!prize) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full sm:max-w-md p-5 sm:p-6 animate-scaleIn shadow-glow"
      >
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br from-rose-soft to-lilac-soft text-ink-900 shadow-md shrink-0">
            {prize.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-ink-200/70">
              Confirmar canje
            </p>
            <h3 className="font-display text-xl leading-tight">{prize.name}</h3>
            <p className="text-xs text-ink-200/70 mt-0.5">
              Costo:{" "}
              <b className="text-ink-50">
                {prize.cost.toLocaleString("es-CO")} pts
              </b>
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm text-ink-100">
          ¿Quién está canjeando este premio?
        </p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {users.map((u) => {
            const bal = points[u.id] ?? 0;
            const can = bal >= prize.cost;
            const active = selected === u.id;
            return (
              <button
                key={u.id}
                disabled={!can}
                onClick={() => setSelected(u.id)}
                className={[
                  "rounded-2xl p-3 border text-left transition-all duration-200 min-h-[60px]",
                  !can
                    ? "bg-white/[0.02] border-white/5 text-ink-200/40 cursor-not-allowed"
                    : active
                    ? "border-rose-soft/60 bg-rose-soft/10 ring-2 ring-rose-soft/50"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{u.emoji}</span>
                  <span className="font-semibold">{u.name}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">
                  Saldo: {bal.toLocaleString("es-CO")} pts
                  {!can && (
                    <span className="block text-rose-soft/80">
                      Le faltan {(prize.cost - bal).toLocaleString("es-CO")}
                    </span>
                  )}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="btn btn-outline flex-1">
            Cancelar
          </button>
          <button
            disabled={!selected}
            onClick={() => onConfirm(selected)}
            className={[
              "btn flex-1",
              selected
                ? "btn-primary"
                : "bg-white/[0.04] text-ink-200/50 border border-white/10 cursor-not-allowed",
            ].join(" ")}
          >
            Confirmar canje
          </button>
        </div>
      </div>
    </div>
  );
}
