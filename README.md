# Pal Party Builds

Community-created Palworld party builds with visual Pal lineups, likes, Discord sign-in, and Cloudflare D1 persistence.

## Local development

```bash
pnpm install
pnpm run db:generate
pnpm run dev
```

The homepage and sample build pages work without credentials. Publishing and liking require a D1 database plus Discord OAuth variables.

## Cloudflare bindings and variables

- D1 binding: `DB`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET` (secret)
- `APP_URL` such as `https://palbuilds.iterationx.cloud`

Discord redirect URI:

```text
https://palbuilds.iterationx.cloud/auth/discord/callback
```

The app requests only the Discord `identify` scope.

## Commands

- `pnpm run dev` — local development
- `pnpm run build` — production build
- `pnpm run test` — build and smoke tests
- `pnpm run db:generate` — generate SQL migrations from `db/schema.ts`
