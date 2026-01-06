export default async function handler(req, res) {
  try {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`
      <html>
        <head><title>EA Render Test</title></head>
        <body>
          <h1>Eastern Alchemy</h1>
          <p>render-html function is alive ✅</p>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
