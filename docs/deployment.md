# SamvadAI — Production Deployment Guide
**Target Architecture: React + Vite (Vercel) | Node.js + Express (Render) | Supabase PostgreSQL**

---

## 1. Prerequisites Checklist
- [x] A free account on [Supabase](https://supabase.com)
- [x] A free account on [Render](https://render.com)
- [x] A free account on [Vercel](https://vercel.com)
- [x] A Google AI Studio API key for Gemini (`GEMINI_API_KEY`) from [aistudio.google.com](https://aistudio.google.com)
- [x] Git installed locally and the repository pushed to your GitHub account

---

## 2. Step 1: Supabase (Database Setup)

### 2.1 Create Project
1. Log in to your Supabase dashboard and click **New project**.
2. Name your project: `samvadai-db`.
3. Set a strong database password (e.g., `SamvadPg2025Secure!`). **Save this password securely.**
4. Choose the region nearest to your Render web service (e.g., `ap-south-1` Mumbai or `us-east-1`).
5. Wait ~2 minutes for the database cluster to finish provisioning.

### 2.2 Obtain the Session Pooler Connection String
> [!IMPORTANT]
> Render's free tier runs in an IPv4 environment. Direct Supabase connections resolve to IPv6 addresses and will fail with `ENETUNREACH`. You **MUST** use the **Session Pooler** (Port 5432).

1. In Supabase, navigate to: **Project Settings** (gear icon) → **Database** → **Connection string**.
2. Select the **URI** tab, set Mode to **Session** (Port 5432).
3. The connection string format is:
   ```text
   postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
4. If your password contains special characters (`@`, `#`, `$`, `/`), URL-encode them (e.g., `@` becomes `%40`).

### 2.3 Run Database Migrations & Seed
On your local development machine:
1. Open `server/.env` and paste your Supabase pooled connection string into `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```
2. Apply the SQL migrations to create the schema, tables, triggers, and full-text search indexes:
   ```bash
   cd server
   npm run migrate
   ```
3. Seed the database with the admin user, 18+ hospital knowledge articles (English, Hindi, Tamil), and demo conversations:
   ```bash
   npm run seed
   ```
4. In your Supabase dashboard under **Table Editor**, verify that the following tables exist:
   - `users`, `conversations`, `messages`, `knowledge_entries`, `tickets`, `appointments`, `schema_migrations`.
5. Under **Authentication → Policies**, confirm that Row Level Security (RLS) is enabled with no public access policies. All access is mediated solely through our backend.

---

## 3. Step 2: Render (Backend Web Service)

### 3.1 Create Web Service
1. In the Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository containing the SamvadAI code.
3. Configure the following fields:
   - **Name:** `samvadai-backend`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
   - **Health Check Path:** `/api/health`

### 3.2 Environment Variables on Render
Under the **Environment** tab on Render, add the following key-value pairs:

| Variable Key | Recommended Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Supabase Session Pooler connection string |
| `JWT_SECRET` | A secure random 64-char string (e.g., generated with `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `http://localhost:5173` *(temporary; update after Vercel deployment)* |
| `AI_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | Your Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `SEED_ADMIN_PASSWORD` | `Admin@Samvad2025!` |

> [!NOTE]
> Do NOT set `PORT`. Render automatically injects `process.env.PORT` which Express reads.

4. Click **Deploy Web Service**.
5. When the deployment finishes, open `https://<your-service-name>.onrender.com/api/health`.
   It should return:
   ```json
   {
     "status": "ok",
     "db": "up",
     "timestamp": "2026-10-31T06:30:00.000Z",
     "provider": "gemini"
   }
   ```

---

## 4. Step 3: Vercel (Frontend Web App)

### 4.1 Import Project
1. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Select your SamvadAI repository.
3. Configure the deployment settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 4.2 Environment Variables on Vercel
Add the single required client environment variable:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://<your-render-service-name>.onrender.com/api` |

*(Ensure there is NO trailing slash at the end).*

### 4.3 Client-side SPA Rewrites
The repository includes `client/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures React Router deep links (e.g., `/chat`, `/admin`, `/login`) work without 404 errors on page reload.

4. Click **Deploy**. Vercel will build and assign a domain (e.g. `https://samvadai-client.vercel.app`).

---

## 5. Step 4: Connect & Verify

1. **Update Render CORS:**
   Go back to Render → `samvadai-backend` → **Environment**.
   Update `CLIENT_URL` to match your Vercel URL:
   ```text
   CLIENT_URL=https://samvadai-client.vercel.app
   ```
   *(To allow local testing alongside production, comma-separate: `https://samvadai-client.vercel.app,http://localhost:5173`)*.
2. Click **Save Changes** (Render will automatically redeploy).

### 5.1 Verification Smoke Test
1. Visit your live Vercel site over HTTPS (HTTPS is mandatory for Web Speech API and microphone permissions).
2. Click **Try Voice Assistant as Guest**.
3. Select **English** and speak: *"What are the OPD timings and registration fees?"*
   - Verify speech transcribed live in the ghost bubble.
   - Verify spoken reply audio with source attribution chip (`[From: OPD Timings and Registration]`).
4. Select **தமிழ் (Tamil)** and speak: *"என் ரத்தப் பரிசோதனை அறிக்கை எப்போது கிடைக்கும்?"*
   - Verify response in spoken Tamil.
5. Log in with admin credentials (`admin@samvadai.com` / `Admin@Samvad2025!`).
   - Confirm Dashboard displays real-time analytics, charts, and your new guest session.

---

## 6. Cold Start Mitigation (Free Tier Uptime Ping)
Render's free tier spins down after 15 minutes of inactivity, resulting in a ~30 second cold start on the first request.
To prevent this:
1. Create a free account on [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org).
2. Add an HTTP monitor targeting your Render health endpoint:
   `https://<your-service>.onrender.com/api/health`
3. Set the interval to **every 5 minutes**.

---

## 7. Troubleshooting Matrix

| Problem | Root Cause | Solution |
| :--- | :--- | :--- |
| **CORS error in browser console** | `CLIENT_URL` on Render doesn't match the Vercel domain | Update `CLIENT_URL` on Render to your exact Vercel domain (no trailing slash). |
| **`ENETUNREACH` error on Render** | Direct database URI used instead of Supabase Session Pooler | Switch `DATABASE_URL` to the Session Pooler port `5432` host `*.pooler.supabase.com`. |
| **"password authentication failed"** | Special characters in PostgreSQL password not encoded | URL-encode password in `DATABASE_URL` (e.g. `p@ss` -> `p%40ss`). |
| **404 on page refresh on Vercel** | Missing SPA rewrite | Verify `client/vercel.json` exists with rewrite to `/index.html`. |
| **Microphone permission blocked** | Non-HTTPS connection or browser policy | Always test over HTTPS. Ensure microphone is allowed in browser site permissions. |
| **Rate limit false positives** | Missing reverse proxy configuration | Ensure `app.set('trust proxy', 1)` is enabled in `server/src/app.js` (already set). |
