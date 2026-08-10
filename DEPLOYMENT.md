Deployment checklist — Vercel

1) Overview
- This app prefers a hosted MySQL database in production. If `DATABASE_URL` is not set, the app will fall back to an ephemeral SQLite file in the system temp directory (serverless only). This fallback is ephemeral on Vercel and is only suitable for demos.

2) Recommended (production) — PlanetScale / Render / RDS
- Create a hosted MySQL-compatible database.
- Obtain the connection string in the format:
  - `mysql://DB_USER:DB_PASS@DB_HOST:DB_PORT/DB_NAME`
- Add the connection string to Vercel as an Environment Variable named `DATABASE_URL` (Project → Settings → Environment Variables) for the `production` environment.

3) Quick setup on Vercel CLI
- Install Vercel CLI and login:

```bash
npm i -g vercel
vercel login
```

- Add the env var interactively:

```bash
vercel env add DATABASE_URL production
```

- Or set it directly (not recommended with secrets in shell history):

```bash
vercel env set DATABASE_URL "mysql://user:pass@host:3306/dbname" production
```

4) PlanetScale specifics (serverless friendly)
- Create a PlanetScale database and follow PlanetScale docs to create a `branch` and a password.
- PlanetScale may require `ssl` options; use the provided `DATABASE_URL` from PlanetScale.

5) If you must use Laragon locally
- Laragon is local-only. Vercel cannot reach your local Laragon database. Use a hosted DB instead or deploy backend to a VM/container that can reach your Laragon host.

6) Verify deployment
- After setting `DATABASE_URL`, redeploy on Vercel. Visit `/health` on your deployment to confirm DB mode and status. Example:

  - `https://<your-vercel-app>/health`

- The `/health` endpoint responds with JSON describing whether `DATABASE_URL` is present and which DB type is active.

7) Notes
- SQLite fallback is ephemeral on Vercel — data will not persist across cold starts or new function instances.
- For persistent storage use a hosted MySQL provider.

If you want, I can:
- Draft exact `DATABASE_URL` value for PlanetScale or ClearDB if you paste the provider details, or
- Walk you through adding the environment variable in Vercel's web UI step-by-step.
