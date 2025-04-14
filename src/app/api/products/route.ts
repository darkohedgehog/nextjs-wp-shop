export async function GET() {
  try {
    const res = await fetch(
      `http://hedgehog-test.infy.uk/wp-json/wc/v3/products?consumer_key=${process.env.WC_KEY}&consumer_secret=${process.env.WC_SECRET}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const text = await res.text();

    try {
      const data = JSON.parse(text);

      if (!res.ok) {
        console.error('[Woo API error]', res.status, data);
        return new Response(JSON.stringify({ error: true, message: data.message }), {
          status: res.status,
        });
      }

      return Response.json(data);
    } catch (jsonErr) {
      console.error('[JSON parse error]', text);
      return new Response(JSON.stringify({ error: true, message: 'Invalid JSON' }), { status: 500 });
    }
  } catch (err) {
    console.error('[Unexpected error]', err);
    return new Response(JSON.stringify({ error: true, message: 'Internal server error' }), {
      status: 500,
    });
  }
}
