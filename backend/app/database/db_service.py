from app.database.supabase_client import supabase
from typing import Dict, Any, Optional
import sqlite3
import uuid
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "documind.db")

def get_sqlite_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite():
    try:
        with get_sqlite_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS generated_projects (
                    id TEXT PRIMARY KEY,
                    username TEXT NOT NULL,
                    project_name TEXT NOT NULL,
                    repo_url TEXT,
                    readme TEXT,
                    api_docs TEXT,
                    setup_guide TEXT,
                    summary TEXT,
                    folder_structure TEXT,
                    created_at TEXT NOT NULL
                )
            """)
            conn.commit()
    except Exception as e:
        print(f"SQLite initialization error: {e}")

# Initialize SQLite database on module import
init_sqlite()

def sqlite_save(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    init_sqlite()
    try:
        doc_id = data.get("id") or str(uuid.uuid4())
        created_at = data.get("created_at") or (datetime.utcnow().isoformat() + "Z")
        
        with get_sqlite_conn() as conn:
            conn.execute(
                """
                INSERT INTO generated_projects (id, username, project_name, repo_url, readme, api_docs, setup_guide, summary, folder_structure, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    doc_id,
                    data.get("username", "admin"),
                    data.get("project_name"),
                    data.get("repo_url"),
                    data.get("readme"),
                    data.get("api_docs"),
                    data.get("setup_guide"),
                    data.get("summary"),
                    data.get("folder_structure"),
                    created_at
                )
            )
            conn.commit()
            
        return {
            "id": doc_id,
            "project_name": data.get("project_name"),
            "repo_url": data.get("repo_url"),
            "readme": data.get("readme"),
            "api_docs": data.get("api_docs"),
            "setup_guide": data.get("setup_guide"),
            "summary": data.get("summary"),
            "folder_structure": data.get("folder_structure"),
            "created_at": created_at
        }
    except Exception as e:
        print(f"SQLite save error: {e}")
        return None

def sqlite_get(project_id: str) -> Optional[Dict[str, Any]]:
    init_sqlite()
    try:
        with get_sqlite_conn() as conn:
            row = conn.execute("SELECT * FROM generated_projects WHERE id = ?", (project_id,)).fetchone()
            if row:
                return dict(row)
    except Exception as e:
        print(f"SQLite fetch error: {e}")
    return None

def sqlite_get_all(username: str) -> list[Dict[str, Any]]:
    init_sqlite()
    try:
        with get_sqlite_conn() as conn:
            rows = conn.execute("SELECT id, project_name, repo_url, summary, created_at FROM generated_projects WHERE username = ? ORDER BY created_at DESC", (username,)).fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        print(f"SQLite fetch all error: {e}")
    return []

async def save_project_docs(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Saves generated documentation into Supabase. If Supabase fails, falls back to SQLite.
    data dict should match columns: project_name, repo_url, readme, api_docs, setup_guide, summary, folder_structure
    """
    if supabase:
        try:
            response = supabase.table("generated_projects").insert(data).execute()
            if response.data:
                return response.data[0]
        except Exception as e:
            print(f"Supabase save failed: {e}. Falling back to SQLite.")
            
    return sqlite_save(data)

async def get_project_docs(project_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a project's documentation by ID, checking Supabase first, then SQLite."""
    if supabase:
        try:
            response = supabase.table("generated_projects").select("*").eq("id", project_id).execute()
            if response.data:
                return response.data[0]
        except Exception as e:
            print(f"Supabase fetch failed: {e}. Checking SQLite.")
            
    return sqlite_get(project_id)

async def get_all_projects(username: str) -> list[Dict[str, Any]]:
    """Fetches a list of all projects, merging Supabase and SQLite results."""
    projects = []
    if supabase:
        try:
            response = supabase.table("generated_projects").select("id, project_name, repo_url, summary, created_at").eq("username", username).order("created_at", desc=True).execute()
            if response.data:
                projects.extend(response.data)
        except Exception as e:
            print(f"Supabase fetch all failed: {e}. Falling back to SQLite only.")
            
    sqlite_projects = sqlite_get_all(username)
    existing_ids = {p["id"] for p in projects}
    for sp in sqlite_projects:
        if sp["id"] not in existing_ids:
            projects.append(sp)
            
    projects.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return projects

