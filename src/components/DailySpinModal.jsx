import { useEffect, useState } from "react";

const SEG = [
  { v: 2, c: "#F8C8D5" },
  { v: 10, c: "#D7C6F5" },
  { v: 5, c: "#FADCE3" },
  { v: 15, c: "#E6DAFB" },
  { v: 3, c: "#F8C8D5" },
  { v: 20, c: "#D7C6F5" },
  { v: 8, c: "#FADCE3" },
  { v: 1, c: "#E6DAFB" },
];
const N = SEG.length;
const SEG_ANGLE = 360 / N;
const TURNS = 6;

function haptic(p) {
  try {
    navigator.vibrate?.(p);
  } catch {
    /* ignore */
  }
}

export default function DailySpinModal({ user, onClose, onResult }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !spinning) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, spinning]);

  const spin = () => {
    if (spinning || result !== null) return;
    haptic(16);
    setSpinning(true);
    const idx = Math.floor(Math.random() * N);
    const targetAngle = (360 - (idx * SEG_ANGLE + SEG_ANGLE / 2) + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    let delta = targetAngle - currentMod;
    if (delta < 0) delta += 360;
    const next = rotation + TURNS * 360 + delta;
    setRotation(next);
    setTimeout(() => {
      setResult(SEG[idx].v);
      setSpinning(false);
      haptic([20, 40, 30]);
    }, 3550);
  };

  const confirm = () => {
    onResult(result);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm animate-fadeIn"
      onClick={!spinning && result === null ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full sm:max-w-md p-5 sm:p-6 animate-scaleIn shadow-glow flex flex-col items-center"
      >
        <div className="w-full flex items-start justify-between mb-1">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-ink-200/70">
              Ruleta diaria
            </p>
            <h3 className="font-display text-2xl leading-tight">
              Gira y gana · {user.name}
            </h3>
          </div>
          {!spinning && result === null && (
            <button
              onClick={onClose}
              className="btn btn-ghost text-sm px-3 py-1.5 min-h-[36px]"
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}
        </div>

        <div className="relative my-4" style={{ width: 280, height: 300 }}>
          <div
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{ top: -2 }}
          >
            <svg width="30" height="34" viewBox="0 0 30 34">
              <polygon
                points="15,34 1,7 29,7"
                fill="#F8C8D5"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="15" cy="11" r="3" fill="#fff" />
            </svg>
          </div>

          <div className="absolute inset-0 top-3 rounded-full bg-gradient-to-br from-rose-soft/20 to-lilac-soft/20 blur-xl" />

          <svg
            width="280"
            height="280"
            viewBox="0 0 200 200"
            style={{ position: "absolute", top: 14, left: 0 }}
          >
            <circle
              cx="100"
              cy="100"
              r="97"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="2"
            />
            <g
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "100px 100px",
                transition: spinning
                  ? "transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 1)"
                  : "none",
              }}
            >
              {SEG.map((s, i) => {
                const start = i * SEG_ANGLE - 90;
                const end = start + SEG_ANGLE;
                const s1 = (start * Math.PI) / 180;
                const e1 = (end * Math.PI) / 180;
                const x1 = 100 + 95 * Math.cos(s1);
                const y1 = 100 + 95 * Math.sin(s1);
                const x2 = 100 + 95 * Math.cos(e1);
                const y2 = 100 + 95 * Math.sin(e1);
                const midAngle = start + SEG_ANGLE / 2;
                const midRad = (midAngle * Math.PI) / 180;
                const tx = 100 + 62 * Math.cos(midRad);
                const ty = 100 + 62 * Math.sin(midRad);
                return (
                  <g key={i}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`}
                      fill={s.c}
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="0.8"
                    />
                    <text
                      x={tx}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90} ${tx} ${ty})`}
                      fill="#110E22"
                      fontWeight="800"
                      fontSize="20"
                      fontFamily='Fraunces, ui-serif, Georgia, serif'
                    >
                      {s.v}
                    </text>
                  </g>
                );
              })}
              <circle
                cx="100"
                cy="100"
                r="20"
                fill="#1C1732"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
              <text
                x="100"
                y="100"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="18"
                fill="#F8C8D5"
              >
                ♥
              </text>
            </g>
          </svg>
        </div>

        {result === null ? (
          <>
            <p className="text-xs text-ink-200/70 text-center mb-3 px-2">
              1 giro por día. Los puntos se suman directo a tu saldo.
            </p>
            <button
              onClick={spin}
              disabled={spinning}
              className="btn btn-primary w-full text-base"
            >
              {spinning ? "Girando..." : "🎰 Girar"}
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center gap-2">
            <p className="text-[11px] uppercase tracking-widest text-ink-200/70">
              Resultado
            </p>
            <p className="font-display text-5xl font-bold tabular-nums bg-clip-text text-transparent bg-gradient-to-br from-rose-soft to-lilac-soft">
              +{result} pts
            </p>
            <p className="text-sm text-ink-200/80 text-center">
              ¡Buena suerte mañana, {user.name}!
            </p>
            <button onClick={confirm} className="btn btn-primary w-full mt-3">
              Reclamar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
