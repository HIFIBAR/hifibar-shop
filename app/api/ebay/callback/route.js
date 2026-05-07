export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  console.log("OAuth code reçu:", code);
  
  // Afficher le code directement dans le navigateur
  return new Response(`
    <html><body>
      <h1>Code OAuth reçu !</h1>
      <p style="word-break:break-all"><strong>${code}</strong></p>
    </body></html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}