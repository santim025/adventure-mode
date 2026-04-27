import { ACTIONS } from "../data/actions";

export default function ActionsPanel({ onAdd, dark }) {
  return (
    <section
      className={`card ${dark ? "card-dark" : "card-light"} p-5 animate-fadeIn`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl">Ganar puntos</h2>
          <p
            className={`text-sm ${
              dark ? "text-night-200" : "text-night-400"
            }`}
          >
            Suma a quien esté activo en el selector.
          </p>
        </div>
        <span className="chip bg-peach-100 text-peach-700 border border-peach-200">
          ♥ Cortejo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => onAdd(a)}
            className={[
              "group text-left rounded-2xl p-4 border transition-all duration-200",
              "hover:-translate-y-0.5 active:scale-[0.98]",
              dark
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-white/70 border-white/80 hover:bg-white",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg",
                  "bg-gradient-to-br from-peach-100 to-peach-300 text-peach-800",
                  "group-hover:scale-110 transition-transform duration-200",
                ].join(" ")}
              >
                {a.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`font-semibold ${
                      dark ? "text-night-50" : "text-night-700"
                    }`}
                  >
                    {a.label}
                  </h3>
                  <span className="chip bg-emerald-100 text-emerald-700 border border-emerald-200">
                    +{a.points}
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    dark ? "text-night-200" : "text-night-400"
                  }`}
                >
                  {a.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
