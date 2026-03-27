import { describe, it, expect } from 'vitest';
import { scoreSchema, charityContributionSchema } from '@/lib/utils/validators';

describe('Score Validator', () => {
  it('accepts valid score', () => { expect(scoreSchema.safeParse({ score: 36, played_date: '2024-06-15' }).success).toBe(true); });
  it('rejects score below 1', () => { expect(scoreSchema.safeParse({ score: 0, played_date: '2024-06-15' }).success).toBe(false); });
  it('rejects score above 45', () => { expect(scoreSchema.safeParse({ score: 46, played_date: '2024-06-15' }).success).toBe(false); });
  it('rejects non-integer score', () => { expect(scoreSchema.safeParse({ score: 36.5, played_date: '2024-06-15' }).success).toBe(false); });
  it('rejects invalid date format', () => { expect(scoreSchema.safeParse({ score: 36, played_date: '15/06/2024' }).success).toBe(false); });
  it('accepts boundary values', () => {
    expect(scoreSchema.safeParse({ score: 1, played_date: '2024-01-01' }).success).toBe(true);
    expect(scoreSchema.safeParse({ score: 45, played_date: '2024-12-31' }).success).toBe(true);
  });
});

describe('Charity Contribution Validator', () => {
  const validData = { charity_id: '550e8400-e29b-41d4-a716-446655440000', contribution_pct: 15 };
  it('accepts valid contribution', () => { expect(charityContributionSchema.safeParse(validData).success).toBe(true); });
  it('rejects contribution below 10%', () => { expect(charityContributionSchema.safeParse({ ...validData, contribution_pct: 9 }).success).toBe(false); });
  it('rejects contribution above 100%', () => { expect(charityContributionSchema.safeParse({ ...validData, contribution_pct: 101 }).success).toBe(false); });
  it('accepts boundary 10%', () => { expect(charityContributionSchema.safeParse({ ...validData, contribution_pct: 10 }).success).toBe(true); });
  it('accepts boundary 100%', () => { expect(charityContributionSchema.safeParse({ ...validData, contribution_pct: 100 }).success).toBe(true); });
});
