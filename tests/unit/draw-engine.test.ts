import { describe, it, expect } from 'vitest';
import { generateRandomDraw } from '@/lib/draw-engine/random';
import { generateAlgorithmicDraw } from '@/lib/draw-engine/algorithmic';
import { matchScores, processDrawEntries } from '@/lib/draw-engine/matcher';
import { calculatePrizeDistribution } from '@/lib/draw-engine/prize-calculator';

describe('Random Draw Generator', () => {
  it('generates exactly 5 numbers', () => { expect(generateRandomDraw()).toHaveLength(5); });
  it('generates numbers in range [1, 45]', () => {
    for (let i = 0; i < 100; i++) { const nums = generateRandomDraw(); for (const n of nums) { expect(n).toBeGreaterThanOrEqual(1); expect(n).toBeLessThanOrEqual(45); } }
  });
  it('generates unique numbers', () => { for (let i = 0; i < 100; i++) { const nums = generateRandomDraw(); expect(new Set(nums).size).toBe(5); } });
  it('returns sorted numbers', () => { for (let i = 0; i < 50; i++) { const nums = generateRandomDraw(); for (let j = 1; j < nums.length; j++) expect(nums[j]).toBeGreaterThanOrEqual(nums[j - 1]); } });
});

describe('Algorithmic Draw Generator', () => {
  it('generates 5 unique numbers with user scores', () => {
    const nums = generateAlgorithmicDraw([[10,20,30,35,40],[10,15,25,30,40],[5,10,20,30,45]]);
    expect(nums).toHaveLength(5); expect(new Set(nums).size).toBe(5);
  });
  it('handles empty scores gracefully', () => { expect(generateAlgorithmicDraw([])).toHaveLength(5); });
});

describe('Score Matcher', () => {
  it('correctly identifies 5-number match', () => {
    const result = matchScores([10,20,30,35,40], [10,20,30,35,40]);
    expect(result.matchType).toBe('match_5'); expect(result.matchCount).toBe(5);
  });
  it('correctly identifies 4-number match', () => {
    const result = matchScores([10,20,30,35,40], [10,20,30,35,1]);
    expect(result.matchType).toBe('match_4'); expect(result.matchCount).toBe(4);
  });
  it('correctly identifies 3-number match', () => {
    const result = matchScores([10,20,30,35,40], [10,20,30,1,2]);
    expect(result.matchType).toBe('match_3'); expect(result.matchCount).toBe(3);
  });
  it('correctly identifies no match', () => {
    const result = matchScores([10,20,30,35,40], [10,20,1,2,3]);
    expect(result.matchType).toBe('no_match'); expect(result.matchCount).toBe(2);
  });
  it('is order-independent', () => { expect(matchScores([40,10,30,20,35], [35,30,10,40,20]).matchType).toBe('match_5'); });
});

describe('Prize Calculator', () => {
  const totalPool = 100000;
  it('distributes correctly with winners in all tiers', () => {
    const result = calculatePrizeDistribution(totalPool, 0, 1, 2, 5);
    expect(result.match5TotalPool).toBe(40000); expect(result.match5PrizePerWinner).toBe(40000);
    expect(result.match4PrizePerWinner).toBe(17500); expect(result.match3PrizePerWinner).toBe(5000);
    expect(result.rolloverAmount).toBe(0);
  });
  it('creates rollover when no 5-match winner', () => {
    const result = calculatePrizeDistribution(totalPool, 0, 0, 2, 5);
    expect(result.match5PrizePerWinner).toBe(0); expect(result.rolloverAmount).toBe(40000);
  });
  it('includes previous rollover in 5-match pool', () => {
    const result = calculatePrizeDistribution(totalPool, 50000, 1, 0, 0);
    expect(result.match5TotalPool).toBe(90000); expect(result.match5PrizePerWinner).toBe(90000);
  });
  it('splits evenly among multiple winners', () => {
    expect(calculatePrizeDistribution(totalPool, 0, 4, 0, 0).match5PrizePerWinner).toBe(10000);
  });
  it('floors prize amounts', () => {
    const result = calculatePrizeDistribution(100000, 0, 3, 3, 3);
    expect(result.match5PrizePerWinner).toBe(13333); expect(Number.isInteger(result.match5PrizePerWinner)).toBe(true);
  });
});
