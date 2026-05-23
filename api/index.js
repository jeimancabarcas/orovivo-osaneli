// Vercel Serverless Function entry point (CommonJS wrapper).
// Uses dynamic import() to load the Angular SSR Express handler (.mjs ES Module).
module.exports = async (req, res) => {
  const { reqHandler } = await import('../dist/drop-fcf/server/server.mjs');
  return reqHandler(req, res);
};
