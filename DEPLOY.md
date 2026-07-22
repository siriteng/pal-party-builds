# Cloudflare launch checklist

1. D1 database `pal-party-builds` is created and connected in `wrangler.jsonc`.
2. Apply the generated migration with `pnpm run db:migrate:remote`.
3. Create a Discord application and add this redirect URI:

   `https://palbuilds.iterationx.cloud/auth/discord/callback`

4. In the Worker settings, add:
   - `DISCORD_CLIENT_ID` as plaintext.
   - `DISCORD_CLIENT_SECRET` as a secret.
5. Connect the GitHub repository in Cloudflare Workers Builds:
   - Build command: `pnpm run build`
   - Deploy command: `pnpm exec wrangler deploy`
   - Root directory: `/`
6. Add `palbuilds.iterationx.cloud` under the Worker Domains tab if the route was not created automatically.

Never commit the Discord Client Secret.
