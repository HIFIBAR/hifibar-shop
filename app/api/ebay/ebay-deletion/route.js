export const dynamic = 'force-dynamic';

import { createHash } from 'crypto';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challengeCode = searchParams.get('challenge_code');
  
  console.log("GET reçu, challenge_code:", challengeCode);
  console.log("URL complète:", request.url);

  if (!challengeCode) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const VERIFICATION_TOKEN = "hifibarSync2026EbayProductionToken";
  const ENDPOINT = "https://webhook.site/341a8ec6-a74b-4e80-a3b2-b926181f24ec";

  const hash = createHash('sha256');
  hash.update(challengeCode);
  hash.update(VERIFICATION_TOKEN);
  hash.update(ENDPOINT);
  const responseHash = hash.digest('hex');

  console.log("challengeResponse:", responseHash);

  return new Response(JSON.stringify({ challengeResponse: responseHash }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request) {
  console.log("POST reçu de eBay");
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}