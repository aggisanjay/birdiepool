export interface MatchResult {
  matchedNumbers: number[];
  matchCount: number;
  matchType: 'match_5' | 'match_4' | 'match_3' | 'no_match';
}

export function matchScores(userScores: number[], drawNumbers: number[]): MatchResult {
  const drawSet = new Set(drawNumbers);
  const matchedNumbers = userScores.filter((score) => drawSet.has(score));
  const matchCount = matchedNumbers.length;

  let matchType: MatchResult['matchType'];
  if (matchCount >= 5) matchType = 'match_5';
  else if (matchCount === 4) matchType = 'match_4';
  else if (matchCount === 3) matchType = 'match_3';
  else matchType = 'no_match';

  return { matchedNumbers: matchedNumbers.sort((a, b) => a - b), matchCount, matchType };
}

export interface EntryResult {
  entryId: string;
  userId: string;
  userScores: number[];
  matchResult: MatchResult;
}

export interface DrawResults {
  drawNumbers: number[];
  match5Winners: EntryResult[];
  match4Winners: EntryResult[];
  match3Winners: EntryResult[];
  totalEntries: number;
}

export function processDrawEntries(
  drawNumbers: number[],
  entries: Array<{ id: string; user_id: string; scores: number[] }>
): DrawResults {
  const match5Winners: EntryResult[] = [];
  const match4Winners: EntryResult[] = [];
  const match3Winners: EntryResult[] = [];

  for (const entry of entries) {
    const result = matchScores(entry.scores, drawNumbers);
    const entryResult: EntryResult = {
      entryId: entry.id,
      userId: entry.user_id,
      userScores: entry.scores,
      matchResult: result,
    };
    if (result.matchType === 'match_5') match5Winners.push(entryResult);
    else if (result.matchType === 'match_4') match4Winners.push(entryResult);
    else if (result.matchType === 'match_3') match3Winners.push(entryResult);
  }

  return { drawNumbers, match5Winners, match4Winners, match3Winners, totalEntries: entries.length };
}
