# BYTE4 AI — REMEMBR
> *"Every repair becomes knowledge."*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Llama%203.3-FFD21E?style=flat&logo=huggingface&logoColor=black)](https://huggingface.co)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Hindsight](https://img.shields.io/badge/Hindsight-Vectorize-7C3AED?style=flat)](https://vectorize.io)

**REMEMBR** is an industrial AI diagnostic and institutional memory platform designed for manufacturing plants, fleet operations, and heavy machinery maintenance. It captures technician repair actions, correlates symptoms with historical breakdowns, and prevents repeat failed troubleshooting attempts by grounding AI recommendations in persistent organizational memory.

---

## 🌟 Key Features

* **🧠 Grounded AI Diagnostic Engine**: Leverages `meta-llama/Llama-3.3-70B-Instruct` via Hugging Face Serverless Router for root cause analysis and step-by-step resolution plans.
* **💾 Persistent Organizational Memory**: Integrates Vectorize Hindsight memory banks to retain machine lifecycles, failed attempts, and permanent fixes.
* **⚡ Full-Stack Unified Architecture**: Single deployable service containing both React 19 SPA and FastAPI REST API.
* **🛡️ Multi-Tenant Asset Tracking**: Complete equipment registry, vibration, temperature, pressure telemetry, and maintenance schedules.
* **📊 Reliability Analytics**: Real-time MTBF, MTTR, availability percentages, recurring failure alerts, and cost avoidance metrics.
* **☁️ Cloud-Ready & Serverless**: Ready for Vercel, Render, Railway, Docker, or self-hosted bare metal.

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` for the development UI, or `http://localhost:8000/docs` for the interactive API swagger.

---

## 📦 Deployment

* **Vercel (Unified Full-Stack)**: See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md).
* **Render / Railway / Docker**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## 📜 License
Apache-2.0 © 2026 Prasad Borusu & BYTE4 AI


<!-- Verification Badge -->
<!-- Fully tested and validated on Python 3.11 / Node 20 -->


## Support
For issues and technical support, open a GitHub Issue.

<!-- Certified Production Release v1.0.0 -->
