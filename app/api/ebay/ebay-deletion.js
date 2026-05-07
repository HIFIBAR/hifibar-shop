import { createHash } from 'crypto';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challengeCode = searchParams.get('challenge_code');
  
  const VERIFICATION_TOKEN = "hifibarSync2026EbayProductionToken";
  const ENDPOINT = "https://hifibar.eu/api/ebay";

  const hash = createHash('sha256')
    .update(challengeCode + VERIFICATION_TOKEN + ENDPOINT)
    .digest('hex');

  return Response.json({ challengeResponse: hash });
}

export async function POST(request) {
  console.log("eBay account deletion notification received");
  return Response.json({ ok: true });
}