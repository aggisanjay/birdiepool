/**
 * Algorithmic draw: weighted by frequency of user scores.
 * Numbers that appear more frequently across all users' scores
 * have a higher probability of being drawn.
 */
export function generateAlgorithmicDraw(allUserScores: number[][]): number[] {
  const frequency = new Map<number, number>();
  for (let i = 1; i <= 45; i++) frequency.set(i, 0);

  for (const userScores of allUserScores) {
    for (const score of userScores) {
      frequency.set(score, (frequency.get(score) ?? 0) + 1);
    }
  }

  const totalFrequency = Array.from(frequency.values()).reduce(( a: any, b: any ) => a + b, 0);
  if (totalFrequency === 0) return generateUniformRandom();

  const weightedPool: { number: number; weight: number }[] = [];
  for (const [num, freq] of frequency) {
    weightedPool.push({ number: num, weight: freq + 1 }); // +1 Laplace smoothing
  }

  const selected = new Set<number>();
  const pool = [...weightedPool];

  while (selected.size < 5) {
    const totalWeight = pool.reduce(( sum: any, item: any ) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
      random -= pool[i].weight;
      if (random <= 0) {
        selected.add(pool[i].number);
        pool.splice(i, 1);
        break;
      }
    }
  }

  return Array.from(selected).sort(( a: any, b: any ) => a - b);
}

function generateUniformRandom(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort(( a: any, b: any ) => a - b);
}
