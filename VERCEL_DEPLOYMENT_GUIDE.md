# Deploying to Vercel (Only Vercel Full-Stack Deployment)

Your project is configured to run **100% on Vercel** as a unified full-stack application:
- **Frontend**: React + Vite + Tailwind served globally from Vercel's Edge CDN.
- **Backend**: FastAPI running as a Serverless Python Function via `api/index.py`.
- **Database**: Supabase PostgreSQL.

---

## Method 1: Deploy with Vercel Web Dashboard (Recommended)

### Step 1: Push Project to GitHub
If you haven't pushed yet:
```bash
git init
git add .
git commit -m "Configure full-stack Vercel deployment"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

### Step 2: Import Project in Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select your repository.
3. In the project configuration:
   - **Framework Preset**: Leave as **Vite** or **Other**.
   - **Root Directory**: `./` (leave default).
   - The build command and output directory are already configured in `vercel.json` (`outputDirectory: "frontend/dist"`).

### Step 3: Add Environment Variables in Vercel
Under **Environment Variables**, add these 5 variables:

| Variable Name | Value |
| :--- | :--- |
| `ENVIRONMENT` | `production` |
| `SUPABASE_URL` | `https://iavhizzpgofmphbkpbzh.supabase.co` |
| `SUPABASE_ANON_KEY` | *(your Supabase anon key)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(your Supabase service role key)* |
| `HUGGINGFACE_API_KEY` | `hf_your_token_here` |
| `HUGGINGFACE_MODEL` | `meta-llama/Llama-3.3-70B-Instruct` |

Click **Deploy**!

---

## Method 2: Deploy with Vercel CLI (From Terminal)

1. Install Vercel CLI (if not installed):
   ```bash
   npm install -g vercel
   ```
2. Run deployment command in your project root:
   ```bash
   vercel
   ```
3. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## How It Works Under The Hood:
1. `vercel.json` routes all `/api/*` requests to [`api/index.py`](file:///d:/New%20folder%20%286%29/api/index.py).
2. Vercel automatically installs Python dependencies from [`requirements.txt`](file:///d:/New%20folder%20%286%29/requirements.txt).
3. The frontend is pre-built from `frontend/` into `frontend/dist` and served on the root `/` and all client-side routes.
