import { PRIZES } from "../data/prizes";

const TIERS = {
  Dulce: "bg-rose-soft/15 text-rose-soft border-rose-soft/20",
  Aventura: "bg-lilac-soft/15 text-lilac-soft border-lilac-soft/20",
  Grande: "bg-amber-300/15 text-amber-200 border-amber-300/20",
  Épico: "bg-violet-300/15 text-violet-200 border-violet-300/20",
};

export default function PrizesCatalog({ users, points, onRequestRedeem }) {
  const maxBalance = Math.max(...users.map((u) => points[u.id] ?? 0));

  return (
    <section className="glass p-5 sm:p-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl">
            Catálogo de premios
          </h2>
          <p className="text-sm text-ink-200/70">
            Toca <b>Canjear</b> y elige quién está usando sus puntos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRIZES.map((p) => {
          const progress = Math.min(
            100,
            Math.round((maxBalance / p.cost) * 100)
          );
          const anyCanAfford = users.some(
            (u) => (points[u.id] ?? 0) >= p.cost
          );

          return (
            <article
              key={p.id}
              className="rounded-2xl p-4 border border-white/10 bg-white/[0.04]
                hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all duration-300
                flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br from-rose-soft to-lilac-soft text-ink-900 shadow-md shrink-0">
                  {p.emoji}
                </div>
                <span
                  className={`chip border ${TIERS[p.tier] ?? TIERS.Aventura}`}
                >
                  {p.tier}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-ink-50 leading-tight">
                  {p.name}
                </h3>
                <p className="text-xs text-ink-200/70 mt-1 leading-snug">
                  {p.description}
                </p>
              </div>

              <div className="mt-1">
                <div className="flex justify-between text-[11px] text-ink-200/70 mb-1">
                  <span>Progreso mayor: {progress}%</span>
                  <span className="font-semibold text-ink-100">
                    {p.cost.toLocaleString("es-CO")} pts
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-rose-soft to-lilac-soft transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => onRequestRedeem(p)}
                disabled={!anyCanAfford}
                className={[
                  "btn mt-auto w-full",
                  anyCanAfford
                    ? "btn-primary"
                    : "bg-white/[0.03] text-ink-200/40 border border-white/10 cursor-not-allowed",
                ].join(" ")}
              >
                {anyCanAfford
                  ? `Canjear · ${p.cost.toLocaleString("es-CO")} pts`
                  : "Saldo insuficiente"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
