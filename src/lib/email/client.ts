export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Email skipped (no RESEND_API_KEY):', opts.subject, opts.to);
    return;
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'BirdiePool <noreply@birdiepool.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) { console.error('Email send error:', error); throw error; }
    return data;
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}
