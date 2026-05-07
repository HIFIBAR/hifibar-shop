import { createHash } from 'crypto';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challengeCode = searchParams.get('challenge_code');
  
  console.log("GET reçu, challenge_code:", challengeCode);
  console.log("URL complète:", request.url);

  // Si pas de challenge_code, retourner 200 simple
  if (!challengeCode) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const VERIFICATION_TOKEN = "hifibarSync2026EbayProductionToken";
  const ENDPOINT = "https://hifibar.eu/api/ebay/ebay-deletion";

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