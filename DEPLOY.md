# Deploy to Cloudflare Pages (free, no watermark)

1. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git -> pick `flip-the-rule`.
2. Build settings:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable (optional): `NODE_VERSION` = `20`
3. Save and Deploy. The game is live at `https://<project>.pages.dev` and redeploys on every push to `main`.

Asset paths are relative (`base: './'`), so it also works from any sub-path or static host and uploads to CrazyGames as-is
(zip the contents of `dist`).

## If the dashboard shows "Deploy command: npx wrangler deploy" (Workers Builds)
`wrangler.jsonc` in the repo root tells wrangler to serve the `dist` folder as static assets, so the default
build command `npm run build` + deploy command `npx wrangler deploy` works with no other settings.
