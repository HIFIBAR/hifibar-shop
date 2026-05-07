import { createHash } from 'crypto';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challengeCode = searchParams.get('challenge_code');
  
  const VERIFICATION_TOKEN = "hifibarSync2026EbayProductionToken";
  const ENDPOINT = "https://hifibar.eu/api/ebay/ebay-deletion";

  const hash = createHash('sha256');
  hash.update(challengeCode);
  hash.update(VERIFICATION_TOKEN);
  hash.update(ENDPOINT);
  const responseHash = hash.digest('hex');

  return new Response(JSON.stringify({ challengeResponse: responseHash }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request) {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}