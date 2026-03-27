import { describe, it, expect } from 'vitest';

interface Score { score: number; position: number; played_date: string; }

function simulateAddScore(scores: Score[], newScore: number, newDate: string): Score[] {
  let result = [...scores];
  if (result.length >= 5) result = result.filter((s) => s.position !== 5);
  result = result.map((s) => ({ ...s, position: s.position + 1 }));
  result.push({ score: newScore, position: 1, played_date: newDate });
  return result.sort((a, b) => a.position - b.position);
}

describe('Rolling Score Logic', () => {
  it('adds first score at position 1', () => {
    const result = simulateAddScore([], 36, '2024-06-01');
    expect(result).toHaveLength(1); expect(result[0].position).toBe(1); expect(result[0].score).toBe(36);
  });
  it('adds second score, pushes first to position 2', () => {
    const scores = [{ score: 36, position: 1, played_date: '2024-06-01' }];
    const result = simulateAddScore(scores, 38, '2024-06-02');
    expect(result).toHaveLength(2); expect(result[0].score).toBe(38); expect(result[1].score).toBe(36);
  });
  it('maintains only 5 scores max', () => {
    let scores: Score[] = [];
    for (let i = 1; i <= 6; i++) scores = simulateAddScore(scores, i * 5, `2024-06-0${i}`);
    expect(scores).toHaveLength(5);
  });
  it('drops the oldest score when adding 6th', () => {
    let scores: Score[] = [];
    for (let i = 1; i <= 5; i++) scores = simulateAddScore(scores, i * 10, `2024-06-0${i}`);
    scores = simulateAddScore(scores, 44, '2024-06-06');
    expect(scores).toHaveLength(5); expect(scores.find((s) => s.score === 10)).toBeUndefined(); expect(scores[0].score).toBe(44);
  });
  it('positions are always contiguous 1-N', () => {
    let scores: Score[] = [];
    for (let i = 1; i <= 8; i++) scores = simulateAddScore(scores, Math.floor(Math.random() * 45) + 1, `2024-06-${String(i).padStart(2, '0')}`);
    expect(scores.map((s) => s.position).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
