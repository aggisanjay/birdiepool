export interface PrizeDistribution {
  match5PrizePerWinner: number;
  match4PrizePerWinner: number;
  match3PrizePerWinner: number;
  match5TotalPool: number;
  match4TotalPool: number;
  match3TotalPool: number;
  rolloverAmount: number;
  totalDistributed: number;
}

export function calculatePrizeDistribution(
  totalPoolCents: number,
  rolloverCents: number,
  match5Count: number,
  match4Count: number,
  match3Count: number,
  match5PoolPct = 40,
  match4PoolPct = 35,
  match3PoolPct = 25
): PrizeDistribution {
  const match5Pool = Math.round((totalPoolCents * match5PoolPct) / 100) + rolloverCents;
  const match4Pool = Math.round((totalPoolCents * match4PoolPct) / 100);
  const match3Pool = Math.round((totalPoolCents * match3PoolPct) / 100);

  let match5PrizePerWinner = 0;
  let match4PrizePerWinner = 0;
  let match3PrizePerWinner = 0;
  let rolloverAmount = 0;
  let totalDistributed = 0;

  if (match5Count > 0) {
    match5PrizePerWinner = Math.floor(match5Pool / match5Count);
    totalDistributed += match5PrizePerWinner * match5Count;
  } else {
    rolloverAmount = match5Pool;
  }

  if (match4Count > 0) {
    match4PrizePerWinner = Math.floor(match4Pool / match4Count);
    totalDistributed += match4PrizePerWinner * match4Count;
  }

  if (match3Count > 0) {
    match3PrizePerWinner = Math.floor(match3Pool / match3Count);
    totalDistributed += match3PrizePerWinner * match3Count;
  }

  return {
    match5PrizePerWinner,
    match4PrizePerWinner,
    match3PrizePerWinner,
    match5TotalPool: match5Pool,
    match4TotalPool: match4Pool,
    match3TotalPool: match3Pool,
    rolloverAmount,
    totalDistributed,
  };
}
