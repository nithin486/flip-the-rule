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
