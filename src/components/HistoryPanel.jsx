export default function HistoryPanel({ history, users, onClear }) {
  const userBy = (id) => users.find((u) => u.id === id);

  return (
    <section className="glass p-5 sm:p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display text-2xl">Historial</h2>
          <p className="text-xs text-ink-200/70">
            Últimos movimientos de ambos.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-ink-200/70 hover:text-rose-soft underline decoration-dotted"
          >
            Limpiar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-ink-200/60">
          Aún no hay movimientos. Empieza sumando puntos ✨
        </p>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto pr-1 scroll-thin">
          {history.map((h) => {
            const u = userBy(h.userId);
            return (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 border border-white/10 bg-white/[0.04] animate-fadeIn"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">{h.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{h.label}</p>
                    <p className="text-[11px] text-ink-200/60">
                      <span className="text-ink-100/90">
                        {u?.emoji} {u?.name}
                      </span>{" "}
                      ·{" "}
                      {new Date(h.at).toLocaleString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={[
                    "chip border font-bold shrink-0",
                    h.delta > 0
                      ? "bg-mint-soft/15 text-mint-soft border-mint-soft/20"
                      : "bg-rose-soft/15 text-rose-soft border-rose-soft/20",
                  ].join(" ")}
                >
                  {h.delta > 0 ? `+${h.delta}` : h.delta}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
