export const BRAND = {
  name: 'BirdiePool',
  tagline: 'Play. Win. Give Back.',
  description: 'Turn your golf scores into prizes and charitable impact.',
} as const;

export const SCORE_MIN = 1;
export const SCORE_MAX = 45;
export const MAX_SCORES = 5;

export const MATCH_TYPE_LABELS: Record<string, string> = {
  match_5: '5-Number Match 🏆',
  match_4: '4-Number Match 🎯',
  match_3: '3-Number Match ⭐',
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Verification',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Payout Pending',
  paid: 'Paid',
  failed: 'Payment Failed',
};
