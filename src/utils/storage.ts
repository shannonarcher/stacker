const HIGH_SCORE_KEY = 'stacker_high_score';

export function getHighScore(): number {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function setHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch {
    // Storage not available
  }
}

export function updateHighScore(score: number): boolean {
  const current = getHighScore();
  if (score > current) {
    setHighScore(score);
    return true;
  }
  return false;
}
