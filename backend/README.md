# DocuMind AI Backend

FastAPI backend for DocuMind AI - an AI-powered technical documentation generator for developers.

## Features
- **Upload ZIP files** of source code.
- **Fetch GitHub repositories** directly.
- **AI-Powered Documentation Generation** (README, API Docs, Setup Guide, Folder Structure).
- **Supabase Integration** for storing generated docs.

## Setup Instructions

### 1. Install Dependencies
Ensure you have Python 3.9+ installed.
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On Mac/Linux
pip install -r requirements.txt
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
- `SUPABASE_URL` and `SUPABASE_KEY`: Get these from your Supabase Project Settings > API.
- `GEMINI_API_KEY`: Get this from Google AI Studio.

### 3. Supabase Setup
Create a table in your Supabase project using the SQL Editor:

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

### 4. Run the Server
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.
Swagger UI documentation is at `http://localhost:8000/docs`.

## Deployment

### Render / Railway Deployment
1. Connect your GitHub repository to Render/Railway.
2. Set the **Build Command** to: `pip install -r requirements.txt`
3. Set the **Start Command** to: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add the environment variables (`SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`) in the deployment dashboard.
