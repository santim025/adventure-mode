export const HEARTS_MAX_PER_DAY = 3;

export function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function canSpinToday(userGames) {
  const today = todayKey();
  return (userGames?.spinDate ?? null) !== today;
}

export function heartsLeftToday(userGames) {
  const today = todayKey();
  if (!userGames || userGames.heartsDate !== today) return HEARTS_MAX_PER_DAY;
  return Math.max(0, HEARTS_MAX_PER_DAY - (userGames.heartsPlays ?? 0));
}

export function registerSpin(userGames) {
  return { ...(userGames ?? {}), spinDate: todayKey() };
}

export function registerHeartsPlay(userGames, score) {
  const today = todayKey();
  const sameDay = userGames?.heartsDate === today;
  const plays = sameDay ? (userGames.heartsPlays ?? 0) + 1 : 1;
  const best = Math.max(userGames?.heartsBest ?? 0, score);
  return {
    ...(userGames ?? {}),
    heartsDate: today,
    heartsPlays: plays,
    heartsBest: best,
  };
}
