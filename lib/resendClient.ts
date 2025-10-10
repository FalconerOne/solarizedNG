const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export async function sendEmail(to:string, subject:string, html:string){
  if(!RESEND_API_KEY) return { ok:false, message:'no-key' };
  const res = await fetch('https://api.resend.com/emails', { method:'POST', headers:{ Authorization:`Bearer ${RESEND_API_KEY}`, 'Content-Type':'application/json' }, body: JSON.stringify({ from:'no-reply@solarizedng.org', to:[to], subject, html }) });
  return res.json();
}
