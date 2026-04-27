import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import {
  db,
  authReady,
  firebaseEnabled,
  deviceId,
  COUPLE_DOC_PATH,
} from "../firebase";

const DEFAULT_POINTS = { santiago: 0, nicol: 0 };
const DEFAULT_GAMES = {
  santiago: { spinDate: null, heartsDate: null, heartsPlays: 0, heartsBest: 0 },
  nicol: { spinDate: null, heartsDate: null, heartsPlays: 0, heartsBest: 0 },
};
const LS_POINTS = "pc.points";
const LS_HISTORY = "pc.history";
const LS_GAMES = "pc.games";

function readLS(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function mergeGames(g) {
  return {
    santiago: { ...DEFAULT_GAMES.santiago, ...(g?.santiago ?? {}) },
    nicol: { ...DEFAULT_GAMES.nicol, ...(g?.nicol ?? {}) },
  };
}

export function useCoupleState() {
  const [points, setPoints] = useState(() => readLS(LS_POINTS, DEFAULT_POINTS));
  const [history, setHistory] = useState(() => readLS(LS_HISTORY, []));
  const [games, setGames] = useState(() =>
    mergeGames(readLS(LS_GAMES, DEFAULT_GAMES))
  );
  const [status, setStatus] = useState(
    firebaseEnabled ? "connecting" : "offline"
  );
  const lastUpdatedBy = useRef(null);

  useEffect(() => {
    writeLS(LS_POINTS, points);
  }, [points]);
  useEffect(() => {
    writeLS(LS_HISTORY, history);
  }, [history]);
  useEffect(() => {
    writeLS(LS_GAMES, games);
  }, [games]);

  useEffect(() => {
    if (!firebaseEnabled) return;
    let unsub = null;
    let active = true;
    authReady.then((user) => {
      if (!active) return;
      if (!user) {
        setStatus("error");
        return;
      }
      const ref = doc(db, ...COUPLE_DOC_PATH);
      unsub = onSnapshot(
        ref,
        (snap) => {
          if (!active) return;
          setStatus("online");
          if (snap.exists()) {
            const data = snap.data();
            lastUpdatedBy.current = data.updatedBy ?? null;
            if (data.points) setPoints(data.points);
            if (Array.isArray(data.history)) setHistory(data.history);
            if (data.games) setGames(mergeGames(data.games));
          } else {
            setDoc(ref, {
              points: readLS(LS_POINTS, DEFAULT_POINTS),
              history: readLS(LS_HISTORY, []),
              games: mergeGames(readLS(LS_GAMES, DEFAULT_GAMES)),
              updatedBy: deviceId,
              updatedAt: serverTimestamp(),
            }).catch((e) => console.error("[firestore] seed:", e));
          }
        },
        (err) => {
          console.error("[firestore] snapshot error:", err);
          setStatus("error");
        }
      );
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  // Generic persist: accepts a partial patch { points?, history?, games? }
  const persist = async (patch = {}) => {
    const nextPoints = patch.points ?? points;
    const nextHistory = patch.history ?? history;
    const nextGames = patch.games ? mergeGames(patch.games) : games;

    if (patch.points !== undefined) setPoints(nextPoints);
    if (patch.history !== undefined) setHistory(nextHistory);
    if (patch.games !== undefined) setGames(nextGames);

    if (!firebaseEnabled) return;
    const user = await authReady;
    if (!user) return;
    lastUpdatedBy.current = deviceId;
    try {
      await setDoc(doc(db, ...COUPLE_DOC_PATH), {
        points: nextPoints,
        history: nextHistory,
        games: nextGames,
        updatedBy: deviceId,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("[firestore] persist:", e);
    }
  };

  return { points, history, games, persist, status, lastUpdatedBy };
}
