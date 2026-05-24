import os
import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import GitHubRepoRequest
from app.utils.config import settings
from app.services.github_service import clone_github_repo

router = APIRouter()

@router.post("/github-repo")
async def fetch_github_repo(request: GitHubRepoRequest):
    repo_url = str(request.repo_url)
    if "github.com" not in repo_url:
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL.")
        
    project_name = repo_url.rstrip('/').split('/')[-1]
    project_id = str(uuid.uuid4())
    
    # Ensure upload dir exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    extract_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    
    success = clone_github_repo(repo_url, extract_dir)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clone GitHub repository. Ensure it is public.")
        
    return {
        "success": True,
        "project_id": project_id,
        "project_name": project_name,
        "source_path": extract_dir,
        "repo_url": repo_url,
        "message": "Repository cloned successfully."
    }
