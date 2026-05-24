import os
import sys
import asyncio

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.database.db_service import save_project_docs, get_project_docs, get_all_projects
from app.services.ai_service import call_ai

async def main():
    print("==================================================")
    print("         DOCUMIND DATABASE & AI TEST RUN          ")
    print("==================================================")
    
    # 1. Test Database (Supabase with SQLite fallback)
    print("\n[1] Testing database storage pipeline...")
    sample_data = {
        "project_name": "Workspace Test Project",
        "repo_url": "https://github.com/workspace/test",
        "readme": "# Workspace README",
        "api_docs": "## Workspace API Docs",
        "setup_guide": "## Workspace Setup Guide",
        "summary": "This is a workspace test summary.",
        "folder_structure": "workspace/\n  index.html"
    }
    
    record = await save_project_docs(sample_data)
    if record:
        print(f" -> SUCCESS: Saved record. ID: {record['id']}")
        fetched = await get_project_docs(record['id'])
        if fetched:
            print(f" -> SUCCESS: Retrieved record. Name: {fetched['project_name']}")
        else:
            print(" -> ERROR: Could not fetch saved record.")
            
        all_records = await get_all_projects()
        print(f" -> SUCCESS: List returned {len(all_records)} total records.")
    else:
        print(" -> ERROR: Failed to save record.")
        
    # 2. Test AI Connection
    print("\n[2] Testing AI response model...")
    try:
        response = await call_ai("Say 'System Online' in 2 words.")
        print(f" -> SUCCESS: AI Response: {response.strip()}")
    except Exception as e:
        print(f" -> ERROR: AI call failed: {e}")
        
    print("\n==================================================")

if __name__ == '__main__':
    asyncio.run(main())
