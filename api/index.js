// Vercel Serverless Function entry point.
// Routes ALL requests (including /api/bold-webhook POST) through the Angular SSR Express server.
import { reqHandler } from '../dist/drop-fcf/server/server.mjs';

export default reqHandler;
