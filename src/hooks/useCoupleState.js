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
const LS_POINTS = "pc.points";
const LS_HISTORY = "pc.history";

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

export function useCoupleState() {
  const [points, setPoints] = useState(() => readLS(LS_POINTS, DEFAULT_POINTS));
  const [history, setHistory] = useState(() => readLS(LS_HISTORY, []));
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
          } else {
            setDoc(ref, {
              points: readLS(LS_POINTS, DEFAULT_POINTS),
              history: readLS(LS_HISTORY, []),
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

  const persist = async (nextPoints, nextHistory) => {
    setPoints(nextPoints);
    setHistory(nextHistory);
    if (!firebaseEnabled) return;
    const user = await authReady;
    if (!user) return;
    lastUpdatedBy.current = deviceId;
    try {
      await setDoc(doc(db, ...COUPLE_DOC_PATH), {
        points: nextPoints,
        history: nextHistory,
        updatedBy: deviceId,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("[firestore] persist:", e);
    }
  };

  return { points, history, persist, status, lastUpdatedBy };
}
