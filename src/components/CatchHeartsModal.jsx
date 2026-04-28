import { useEffect, useRef, useState } from "react";

const DURATION = 30;
const MAX_ON_SCREEN = 22;
// Cada X corazones = 1 punto, con tope total de puntos por partida.
const HEARTS_PER_POINT = 12;
const MAX_POINTS_PER_GAME = 10;

function heartsToPoints(hearts) {
  return Math.min(MAX_POINTS_PER_GAME, Math.floor(hearts / HEARTS_PER_POINT));
}

function haptic(p) {
  try {
    navigator.vibrate?.(p);
  } catch {
    /* ignore */
  }
}

export default function CatchHeartsModal({ user, onClose, onResult }) {
  const [phase, setPhase] = useState("intro");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [hearts, setHearts] = useState([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && phase !== "playing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const tick = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    const spawn = setInterval(() => {
      setHearts((h) => {
        if (h.length >= MAX_ON_SCREEN) return h;
        const id = ++nextIdRef.current;
        const r = Math.random();
        let type = "normal";
        let emoji = "❤️";
        let value = 1;
        if (r < 0.07) {
          type = "gold";
          emoji = "💖";
          value = 5;
        } else if (r < 0.25) {
          type = "special";
          emoji = "💕";
          value = 3;
        }
        const duration = 3.2 + Math.random() * 2;
        const x = 10 + Math.random() * 80;
        const size =
          type === "gold"
            ? 52
            : type === "special"
            ? 44
            : 36 + Math.random() * 6;
        const drift = (Math.random() - 0.5) * 50;
        return [...h, { id, x, emoji, value, duration, size, drift, type }];
      });
    }, 320);
    return () => {
      clearInterval(tick);
      clearInterval(spawn);
    };
  }, [phase]);

  useEffect(() => {
    if (timeLeft <= 0 && phase === "playing") {
      setPhase("done");
      setHearts([]);
      haptic([25, 60, 25, 60, 80]);
    }
  }, [timeLeft, phase]);

  const start = () => {
    haptic(12);
    setScore(0);
    setTimeLeft(DURATION);
    setHearts([]);
    setPhase("playing");
  };

  const catchHeart = (h) => {
    setHearts((hs) => hs.filter((x) => x.id !== h.id));
    setScore((s) => s + h.value);
    haptic(h.value >= 5 ? [10, 30, 16] : 8);
  };

  const onHeartAnimEnd = (id) => {
    setHearts((hs) => hs.filter((x) => x.id !== id));
  };

  const earnedPoints = heartsToPoints(score);

  const claim = () => {
    onResult(earnedPoints);
    onClose();
  };

  const timePct = (timeLeft / DURATION) * 100;

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-ink-900/95 via-ink-800/95 to-ink-900/95 backdrop-blur-md animate-fadeIn"
      onClick={phase === "intro" ? onClose : undefined}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "manipulation" }}
      >
        <div className="flex-none px-4 pt-4 pb-2 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-ink-200/70">
              Atrapa corazones · {user.name}
            </p>
            <h3 className="font-display text-xl leading-tight truncate">
              {phase === "intro" && "Prepárate..."}
              {phase === "playing" && `${score} 💖 atrapados`}
              {phase === "done" && "¡Terminó!"}
            </h3>
          </div>
          {phase !== "playing" ? (
            <button
              onClick={onClose}
              className="btn btn-ghost text-sm px-3 py-1.5 min-h-[36px]"
              aria-label="Cerrar"
            >
              ✕
            </button>
          ) : (
            <div className="chip bg-white/5 border border-white/10 text-ink-50 px-3 py-1 text-sm tabular-nums">
              ⏱ {timeLeft}s
            </div>
          )}
        </div>

        {phase === "playing" && (
          <div className="flex-none h-1.5 mx-4 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-soft to-lilac-soft transition-all duration-1000 ease-linear"
              style={{ width: `${timePct}%` }}
            />
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          {phase === "intro" && (
            <div className="absolute inset-0 flex items-center justify-center p-5">
              <div className="text-center max-w-sm w-full space-y-3">
                <div className="text-6xl animate-pop">💖</div>
                <h4 className="font-display text-3xl">Atrapa corazones</h4>
                <p className="text-sm text-ink-200/80 leading-relaxed">
                  Toca corazones por <b>30 segundos</b>. Al final se convierten
                  en puntos para <b>{user.name}</b>.
                </p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <LegendItem emoji="❤️" label="x1" />
                  <LegendItem emoji="💕" label="x3" />
                  <LegendItem emoji="💖" label="x5" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 mt-2 text-[11px] text-ink-200/80 leading-snug">
                  Cada <b>{HEARTS_PER_POINT}</b> corazones = <b>1 pt</b> ·
                  máximo <b>{MAX_POINTS_PER_GAME} pts</b> por partida ·{" "}
                  <b>3</b> partidas/día
                </div>
                <button
                  onClick={start}
                  className="btn btn-primary w-full mt-3 text-base"
                >
                  🎯 ¡Empezar!
                </button>
              </div>
            </div>
          )}

          {phase === "playing" &&
            hearts.map((h) => (
              <Heart
                key={h.id}
                heart={h}
                onCatch={() => catchHeart(h)}
                onEnd={() => onHeartAnimEnd(h.id)}
              />
            ))}

          {phase === "done" && (
            <div className="absolute inset-0 flex items-center justify-center p-5">
              <div className="text-center max-w-sm w-full space-y-3 animate-scaleIn">
                <div className="text-6xl animate-pop">
                  {earnedPoints >= MAX_POINTS_PER_GAME
                    ? "🏆"
                    : earnedPoints >= 4
                    ? "🎉"
                    : earnedPoints > 0
                    ? "💫"
                    : "💔"}
                </div>
                <h4 className="font-display text-2xl">
                  {earnedPoints >= MAX_POINTS_PER_GAME
                    ? "¡Partida perfecta!"
                    : earnedPoints >= 4
                    ? "¡Bien jugado!"
                    : earnedPoints > 0
                    ? "¡Buen intento!"
                    : "¡Casi!"}
                </h4>

                <div className="flex items-baseline justify-center gap-2 text-ink-200/80">
                  <span className="text-4xl font-display font-bold text-ink-50 tabular-nums">
                    {score}
                  </span>
                  <span className="text-sm">💖 atrapados</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-ink-200/60 text-xs">
                  <span className="h-px w-10 bg-white/15" />
                  <span>se convierten en</span>
                  <span className="h-px w-10 bg-white/15" />
                </div>

                <p className="font-display text-6xl font-bold tabular-nums bg-clip-text text-transparent bg-gradient-to-br from-rose-soft via-lilac-soft to-mint-soft">
                  +{earnedPoints}
                </p>
                <p className="text-sm text-ink-200/80">
                  {earnedPoints === 0
                    ? "sin puntos esta vez"
                    : `puntos para ${user.name}`}
                </p>

                {earnedPoints < MAX_POINTS_PER_GAME && (
                  <p className="text-[11px] text-ink-200/60">
                    Te faltaron{" "}
                    <b>
                      {(earnedPoints + 1) * HEARTS_PER_POINT - score}
                    </b>{" "}
                    corazones para el siguiente punto.
                  </p>
                )}

                <button
                  onClick={claim}
                  className="btn btn-primary w-full mt-3"
                >
                  Reclamar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ emoji, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-200/80">
      <span className="text-xl">{emoji}</span>
      <span className="chip bg-white/5 border border-white/10 text-ink-100">
        {label}
      </span>
    </div>
  );
}

function Heart({ heart, onCatch, onEnd }) {
  const glow =
    heart.type === "gold"
      ? "drop-shadow(0 0 14px rgba(248,200,213,0.9))"
      : heart.type === "special"
      ? "drop-shadow(0 0 10px rgba(215,198,245,0.8))"
      : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";

  const handleCatch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCatch();
  };

  return (
    <button
      type="button"
      onPointerDown={handleCatch}
      onAnimationEnd={onEnd}
      aria-label="Corazón"
      className="heart-float absolute select-none leading-none"
      style={{
        left: `${heart.x}%`,
        fontSize: `${heart.size}px`,
        animationDuration: `${heart.duration}s`,
        "--heart-drift": `${heart.drift}px`,
        filter: glow,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        padding: "14px",
      }}
    >
      <span aria-hidden className="block pointer-events-none">
        {heart.emoji}
      </span>
    </button>
  );
}
