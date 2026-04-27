import { useEffect, useRef, useState } from "react";
import { useCoupleState } from "./hooks/useCoupleState";
import { deviceId, firebaseEnabled } from "./firebase";
import UserColumn from "./components/UserColumn";
import PrizesCatalog from "./components/PrizesCatalog";
import RedeemModal from "./components/RedeemModal";
import RulesModal from "./components/RulesModal";
import HistoryPanel from "./components/HistoryPanel";
import DailySpinModal from "./components/DailySpinModal";
import CatchHeartsModal from "./components/CatchHeartsModal";
import {
  canSpinToday,
  heartsLeftToday,
  registerSpin,
  registerHeartsPlay,
} from "./games/gameUtils";

function haptic(pattern = 12) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

const USERS = [
  { id: "santiago", name: "Santiago", emoji: "🌙", accent: "lilac" },
  { id: "nicol", name: "Nicole", emoji: "🌸", accent: "rose" },
];

const EMPTY_GAMES = {
  santiago: { spinDate: null, heartsDate: null, heartsPlays: 0, heartsBest: 0 },
  nicol: { spinDate: null, heartsDate: null, heartsPlays: 0, heartsBest: 0 },
};

export default function App() {
  const users = USERS;
  const { points, history, games, persist, status, lastUpdatedBy } =
    useCoupleState();
  const [pendingPrize, setPendingPrize] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [activeGame, setActiveGame] = useState(null); // { kind, userId }
  const [toast, setToast] = useState(null);

  const userName = (id) => users.find((u) => u.id === id)?.name ?? "";

  const showToast = (msg, tone = "success") => {
    const id = Date.now() + Math.random();
    setToast({ msg, tone, id });
    setTimeout(() => {
      setToast((t) => (t && t.id === id ? null : t));
    }, 2600);
  };

  // Aviso cuando llega un cambio desde el OTRO dispositivo
  const lastSeenHistoryId = useRef(null);
  useEffect(() => {
    const latest = history[0];
    if (!latest) {
      lastSeenHistoryId.current = null;
      return;
    }
    if (lastSeenHistoryId.current === null) {
      lastSeenHistoryId.current = latest.id;
      return;
    }
    if (latest.id !== lastSeenHistoryId.current) {
      const fromOther =
        lastUpdatedBy.current && lastUpdatedBy.current !== deviceId;
      if (fromOther) {
        if (latest.type === "redeem") {
          const name = latest.label.replace(/^Canje:\s*/, "");
          showToast(
            `🎉 ${userName(latest.userId)} canjeó: ${name}`,
            "remote-redeem"
          );
          haptic([24, 60, 30]);
        } else if (latest.type === "game") {
          showToast(
            `${latest.emoji} ${userName(latest.userId)} jugó y ganó +${
              latest.delta
            }`,
            "remote"
          );
          haptic(18);
        } else {
          showToast(
            `${userName(latest.userId)} sumó ${latest.emoji} +${latest.delta}`,
            "remote"
          );
          haptic(18);
        }
      }
      lastSeenHistoryId.current = latest.id;
    }
  }, [history, lastUpdatedBy]);

  const pushEntry = (entry) => {
    return [
      { id: crypto.randomUUID(), at: Date.now(), ...entry },
      ...history,
    ].slice(0, 80);
  };

  const handleAdd = (userId) => (action) => {
    haptic(12);
    const nextPoints = {
      ...points,
      [userId]: (points[userId] ?? 0) + action.points,
    };
    const nextHistory = pushEntry({
      userId,
      label: action.label,
      emoji: action.emoji,
      delta: action.points,
      type: "action",
    });
    persist({ points: nextPoints, history: nextHistory });
    showToast(`+${action.points} para ${userName(userId)}`);
  };

  const handleConfirmRedeem = (userId) => {
    if (!pendingPrize) return;
    const bal = points[userId] ?? 0;
    if (bal < pendingPrize.cost) return;
    haptic([18, 40, 22]);
    const nextPoints = {
      ...points,
      [userId]: bal - pendingPrize.cost,
    };
    const nextHistory = pushEntry({
      userId,
      label: `Canje: ${pendingPrize.name}`,
      emoji: pendingPrize.emoji,
      delta: -pendingPrize.cost,
      type: "redeem",
    });
    persist({ points: nextPoints, history: nextHistory });
    showToast(`${userName(userId)} canjeó: ${pendingPrize.name}`, "redeem");
    setPendingPrize(null);
  };

  const handleSpinResult = (userId, pts) => {
    haptic([20, 40, 30]);
    const nextPoints = {
      ...points,
      [userId]: (points[userId] ?? 0) + pts,
    };
    const nextHistory = pushEntry({
      userId,
      label: "Ruleta diaria",
      emoji: "🎰",
      delta: pts,
      type: "game",
    });
    const nextGames = {
      ...games,
      [userId]: registerSpin(games?.[userId]),
    };
    persist({
      points: nextPoints,
      history: nextHistory,
      games: nextGames,
    });
    showToast(`🎰 ${userName(userId)} ganó +${pts} en la ruleta`, "success");
  };

  const handleHeartsResult = (userId, pts) => {
    const nextGames = {
      ...games,
      [userId]: registerHeartsPlay(games?.[userId], pts),
    };
    if (pts <= 0) {
      persist({ games: nextGames });
      showToast(
        `💔 ${userName(userId)} no atrapó nada... ¡a intentarlo de nuevo!`,
        "info"
      );
      return;
    }
    haptic([20, 50, 30]);
    const nextPoints = {
      ...points,
      [userId]: (points[userId] ?? 0) + pts,
    };
    const nextHistory = pushEntry({
      userId,
      label: "Atrapa corazones",
      emoji: "💖",
      delta: pts,
      type: "game",
    });
    persist({
      points: nextPoints,
      history: nextHistory,
      games: nextGames,
    });
    showToast(`💖 ${userName(userId)} atrapó +${pts}`, "success");
  };

  const resetAll = () => {
    if (!window.confirm("¿Reiniciar puntos e historial de ambos?")) return;
    persist({
      points: { santiago: 0, nicol: 0 },
      history: [],
      games: EMPTY_GAMES,
    });
    showToast("Todo reiniciado", "info");
  };

  const clearHistory = () => persist({ history: [] });

  const activeUser = activeGame
    ? users.find((u) => u.id === activeGame.userId)
    : null;

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 sm:py-8 lg:px-10 relative">
      <AuroraBackground />
      <div className="max-w-6xl mx-auto flex flex-col gap-5 sm:gap-6 relative">
        <Header
          onReset={resetAll}
          onShowRules={() => setShowRules(true)}
          status={status}
        />

        <main className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {users.map((u) => {
            const ug = games?.[u.id] ?? {};
            return (
              <UserColumn
                key={u.id}
                user={u}
                value={points[u.id] ?? 0}
                onAdd={handleAdd(u.id)}
                accent={u.accent}
                onSpin={() =>
                  setActiveGame({ kind: "spin", userId: u.id })
                }
                onHearts={() =>
                  setActiveGame({ kind: "hearts", userId: u.id })
                }
                canSpin={canSpinToday(ug)}
                heartsLeft={heartsLeftToday(ug)}
              />
            );
          })}
        </main>

        <PrizesCatalog
          users={users}
          points={points}
          onRequestRedeem={setPendingPrize}
        />

        <HistoryPanel
          history={history}
          users={users}
          onClear={clearHistory}
        />
      </div>

      {pendingPrize && (
        <RedeemModal
          prize={pendingPrize}
          users={users}
          points={points}
          onConfirm={handleConfirmRedeem}
          onClose={() => setPendingPrize(null)}
        />
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {activeGame?.kind === "spin" && activeUser && (
        <DailySpinModal
          user={activeUser}
          onClose={() => setActiveGame(null)}
          onResult={(pts) => handleSpinResult(activeGame.userId, pts)}
        />
      )}

      {activeGame?.kind === "hearts" && activeUser && (
        <CatchHeartsModal
          user={activeUser}
          onClose={() => setActiveGame(null)}
          onResult={(pts) => handleHeartsResult(activeGame.userId, pts)}
        />
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}

function AuroraBackground() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora__blob aurora__blob--rose" />
      <div className="aurora__blob aurora__blob--lilac" />
      <div className="aurora__blob aurora__blob--soft" />
      <div className="aurora__grain" />
    </div>
  );
}

function Header({ onReset, onShowRules, status }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-gradient-to-br from-rose-soft to-lilac-soft text-ink-900 shadow-glow shrink-0">
          ♥
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl leading-tight truncate">
            Adventure Mode
          </h1>
          <p className="text-[11px] sm:text-xs text-ink-200/60">
            Santiago &amp; Nicole · modo aventura activado
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SyncBadge status={status} />
        <button
          onClick={onShowRules}
          className="btn btn-ghost text-sm px-3 py-2 min-h-[40px]"
          title="Ver guía de puntos"
        >
          <span aria-hidden>📖</span>
          <span className="hidden sm:inline">Guía</span>
        </button>
        <button
          onClick={onReset}
          className="btn btn-ghost text-sm px-3 py-2 min-h-[40px]"
          title="Reiniciar puntos e historial"
        >
          <span aria-hidden>↻</span>
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
      </div>
    </header>
  );
}

function SyncBadge({ status }) {
  if (!firebaseEnabled) {
    return (
      <span
        className="chip border border-white/10 bg-white/5 text-ink-200/70"
        title="Firebase no configurado. Datos solo en este navegador."
      >
        <span className="w-2 h-2 rounded-full bg-ink-200/60" /> Local
      </span>
    );
  }
  const map = {
    connecting: {
      dot: "bg-amber-300 animate-pulse",
      text: "Conectando",
    },
    online: { dot: "bg-mint-soft", text: "En vivo" },
    error: { dot: "bg-rose-soft", text: "Sin conexión" },
    offline: { dot: "bg-ink-200/60", text: "Local" },
  };
  const s = map[status] ?? map.connecting;
  return (
    <span
      className="chip border border-white/10 bg-white/5 text-ink-100"
      title="Estado de sincronización"
    >
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      <span className="hidden sm:inline">{s.text}</span>
    </span>
  );
}

function Toast({ toast }) {
  const tones = {
    success: "from-mint-soft to-lilac-soft text-ink-900",
    redeem: "from-rose-soft to-lilac-soft text-ink-900",
    "remote-redeem": "from-rose-soft to-lilac-soft text-ink-900",
    remote: "from-lilac-soft to-mint-soft text-ink-900",
    info: "from-lilac-soft to-rose-soft text-ink-900",
  };
  return (
    <div
      key={toast.id}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] animate-fadeIn pointer-events-none px-4 max-w-[92vw]"
    >
      <div
        className={[
          "rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-glow bg-gradient-to-br text-center",
          tones[toast.tone] ?? tones.success,
        ].join(" ")}
      >
        {toast.msg}
      </div>
    </div>
  );
}
