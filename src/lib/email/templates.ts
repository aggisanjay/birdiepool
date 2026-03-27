export function winnerNotificationEmail(params: {
  name: string; matchType: string; prizeAmount: string;
  drawMonth: string; dashboardUrl: string;
}) {
  const matchLabels: Record<string, string> = {
    match_5: '🏆 5-NUMBER JACKPOT MATCH',
    match_4: '🎯 4-NUMBER MATCH',
    match_3: '⭐ 3-NUMBER MATCH',
  };
  return {
    subject: `🎉 You're a BirdiePool winner! ${matchLabels[params.matchType] ?? params.matchType}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0f172a;font-family:sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background-color:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
    <h2 style="color:#ffffff;text-align:center;">Congratulations, ${params.name}! 🎉</h2>
    <div style="background:linear-gradient(135deg,#065f46,#064e3b);border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="color:#86efac;font-size:14px;margin:0 0 8px;">${matchLabels[params.matchType] ?? params.matchType}</p>
      <p style="color:#ffffff;font-size:36px;font-weight:900;margin:0;">${params.prizeAmount}</p>
      <p style="color:#86efac;font-size:14px;margin:8px 0 0;">${params.drawMonth} Draw</p>
    </div>
    <p style="color:#94a3b8;font-size:16px;text-align:center;">Upload proof of your scores to claim your prize.</p>
    <div style="text-align:center;margin-top:32px;">
      <a href="${params.dashboardUrl}" style="display:inline-block;background-color:#22c55e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;">Upload Proof & Claim Prize</a>
    </div>
  </div>
</div></body></html>`,
  };
}

export function drawResultsEmail(params: {
  name: string; drawMonth: string; drawNumbers: number[];
  userScores: number[]; matchCount: number; dashboardUrl: string;
}) {
  const isWinner = params.matchCount >= 3;
  return {
    subject: isWinner
      ? `🎉 ${params.drawMonth} Draw Results — You matched ${params.matchCount} numbers!`
      : `${params.drawMonth} Draw Results — Better luck next month!`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0f172a;font-family:sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background-color:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
    <h2 style="color:#ffffff;text-align:center;">${params.drawMonth} Draw Results</h2>
    <p style="color:#94a3b8;text-align:center;">Hey ${params.name}, here are the results!</p>
    <div style="background-color:#0f172a;border-radius:12px;padding:20px;text-align:center;margin-bottom:16px;">
      <p style="color:#64748b;font-size:12px;margin:0 0 8px;">WINNING NUMBERS</p>
      <p style="color:#22c55e;font-size:24px;font-weight:900;margin:0;">${params.drawNumbers.join(' · ')}</p>
    </div>
    <div style="background-color:#0f172a;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:#64748b;font-size:12px;margin:0 0 8px;">YOUR SCORES</p>
      <p style="color:#ffffff;font-size:24px;font-weight:900;margin:0;">${params.userScores.join(' · ')}</p>
    </div>
    <div style="text-align:center;padding:16px;border-radius:12px;background:${isWinner ? 'linear-gradient(135deg,#065f46,#064e3b)' : '#1a1a2e'};">
      <p style="color:${isWinner ? '#86efac' : '#94a3b8'};font-size:18px;font-weight:700;margin:0;">
        ${isWinner ? `🎉 ${params.matchCount} Numbers Matched!` : `${params.matchCount} matched — keep playing!`}
      </p>
    </div>
    <div style="text-align:center;margin-top:32px;">
      <a href="${params.dashboardUrl}" style="display:inline-block;background-color:#22c55e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;">View Full Results</a>
    </div>
  </div>
</div></body></html>`,
  };
}

export function subscriptionConfirmationEmail(params: {
  name: string; plan: string; amount: string; dashboardUrl: string;
}) {
  return {
    subject: `Welcome to BirdiePool! Your ${params.plan} subscription is active 🎉`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0f172a;font-family:sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background-color:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
    <h2 style="color:#ffffff;text-align:center;">Welcome aboard, ${params.name}! 🏌️</h2>
    <p style="color:#94a3b8;text-align:center;">Your ${params.plan} subscription (${params.amount}) is now active.</p>
    <div style="margin:24px 0;">
      <div style="padding:12px 0;border-bottom:1px solid #334155;"><span style="color:#22c55e;">1️⃣</span> <span style="color:#e2e8f0;">Enter your last 5 Stableford golf scores</span></div>
      <div style="padding:12px 0;border-bottom:1px solid #334155;"><span style="color:#22c55e;">2️⃣</span> <span style="color:#e2e8f0;">Choose a charity to support</span></div>
      <div style="padding:12px 0;"><span style="color:#22c55e;">3️⃣</span> <span style="color:#e2e8f0;">Wait for the monthly draw!</span></div>
    </div>
    <div style="text-align:center;margin-top:32px;">
      <a href="${params.dashboardUrl}" style="display:inline-block;background-color:#22c55e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;">Go to Dashboard</a>
    </div>
  </div>
</div></body></html>`,
  };
}
