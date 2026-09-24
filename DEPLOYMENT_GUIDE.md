# BYTE4 AI — REMEMBR: Deployment Guide

This project is configured as a **unified full-stack application**:
- FastAPI serves both the **API backend** (`/api/...`) and the **React frontend SPA** (`/`) from a single server.
- No CORS configuration issues.
- Single web service hosting cost.

---

## 🚀 Option 1: Deploy on Render (Recommended & Free Tier Available)

### Step 1: Push Code to GitHub
1. Initialize a git repository if you haven't yet:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for unified deployment"
   ```
2. Push your repository to GitHub (or GitLab).

### Step 2: Create Web Service on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com) and click **"New +" -> "Web Service"**.
2. Connect your GitHub repository.
3. Choose **Docker** OR **Python**:
   - **Method A (Docker - Easiest)**:
     - Render will automatically detect the root `Dockerfile`.
     - Click **Deploy**.
   - **Method B (Native Python)**:
     - Build Command: `./build.sh`
     - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables in Render Dashboard
Go to the **Environment** tab in your Render service and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `production` | Production mode |
| `SUPABASE_URL` | `https://iavhizzpgofmphbkpbzh.supabase.co` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUz...` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUz...` | Supabase Service Role Key |
| `HUGGINGFACE_API_KEY` | `hf_your_token_here` | Your Hugging Face Token |
| `HUGGINGFACE_MODEL` | `meta-llama/Llama-3.3-70B-Instruct` | AI Diagnostic Model |

Render will build and deploy your app. You'll receive a live public HTTPS URL (e.g. `https://remembr-app.onrender.com`).

---

## 🚂 Option 2: Deploy on Railway

1. Go to [https://railway.app](https://railway.app) and click **"New Project" -> "Deploy from GitHub repo"**.
2. Select your repository. Railway will detect the `Dockerfile` automatically.
3. In the **Variables** tab, add the environment variables listed in the table above.
4. Go to **Settings -> Generate Domain** to get your public HTTPS URL.

---

## 🗄️ Database Setup in Supabase

1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/iavhizzpgofmphbkpbzh](https://supabase.com/dashboard/project/iavhizzpgofmphbkpbzh)
2. Go to **SQL Editor** on the left menu.
3. Paste the contents of `supabase/migrations/20260929_init_remembr.sql` and click **Run**.
4. (Optional) Paste `supabase/seed.sql` to populate sample machines and incidents.
