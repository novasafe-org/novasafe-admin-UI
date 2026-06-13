# Netlify deploy — NovaSafe Blog CMS UI

## Environment variables (Netlify → Site configuration → Environment variables)

| Variable | Production value |
|----------|------------------|
| `VITE_API_BASE_URL` | `https://novasafe-blog-writing-api.vercel.app/api/v1` |
| `VITE_SITE_URL` | `https://novasafe.io` |
| `VITE_SITE_NAME` | `NovaSafe Blog` |

**Important:** Vite bakes env vars at **build time**. After changing them, trigger a **new deploy**.

## Vercel API (backend) — required env

Set on Vercel dashboard (see `../vercel-novasafe-blog-api/.env.example`):

- `CORS_ALLOWED_ORIGINS` must include `https://novasafe-blog.netlify.app`
- MongoDB, JWT, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ENVIRONMENT=production`

## After deploy

1. Open CMS → **Settings** → set API URL if needed
2. **Sign in** with admin credentials
3. Click **Save**
4. Clear browser localStorage if it still points to `localhost:8787`

## Verify

```bash
curl https://novasafe-blog-writing-api.vercel.app/api/health
curl https://novasafe-blog-writing-api.vercel.app/api/v1/posts
```

`/api/health` returns subsystem checks (MongoDB, auth, CORS) without secrets.
