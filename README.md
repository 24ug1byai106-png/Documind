# DocuMind AI

DocuMind AI is a technical documentation generator. It analyzes your repository structure and codebase using AI to generate comprehensive project summaries, professional READMEs, API guides, and developer setup instructions.

---

## Architecture Overview
- **Frontend**: React + Vite styled with Vanilla CSS (Glassmorphism theme with smooth micro-animations).
- **Backend**: FastAPI (Python) serving upload endpoints and Git cloning subprocess handlers.
- **AI Engine**: Llama 3 on Groq Cloud (default) or Google Gemini Flash fallback.
- **Database**: Supabase PostgreSQL for storing generated project states.

---

## Quick Start (Windows)

If you are on Windows, you can start both the frontend and backend servers with a single command:

1. Double-click the launcher script:
   ```bash
   run.bat
   ```
2. The batch script will spin up two separate terminal windows for the FastAPI backend (Port 8000) and the Vite frontend (Port 5173).
3. Access the site at: **http://localhost:5173**

---

## Manual Setup & Run

### 1. Database Table Creation
Ensure your Supabase project contains the `generated_projects` table. Go to your **Supabase SQL Editor** and run the following script:

```sql
CREATE TABLE generated_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_name TEXT NOT NULL,
    repo_url TEXT,
    readme TEXT,
    api_docs TEXT,
    setup_guide TEXT,
    summary TEXT,
    folder_structure TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Environment Variables (.env)
Make sure the environment variables are set up in `backend/.env`. If you haven't yet, copy `backend/.env.example` to `backend/.env` and enter your credentials:

```ini
# Supabase Configuration (Get from Project Settings > API)
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# AI API Configurations
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Backend Server
From the root directory:
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
```
The API Swagger documentation will be available at: **http://127.0.0.1:8000/docs**

### 4. Run Frontend Server
From the root directory:
```bash
cd frontend
npm install
npm run dev
```
The client app will be available at: **http://localhost:5173**
