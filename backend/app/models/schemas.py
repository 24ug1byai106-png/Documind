from pydantic import BaseModel, HttpUrl
from typing import Optional

class GitHubRepoRequest(BaseModel):
    repo_url: HttpUrl

class GenerateDocsRequest(BaseModel):
    project_id: str
    project_name: str
    source_path: str  # Path to the extracted ZIP or cloned repo
    repo_url: Optional[str] = None
    username: str

class DocsResponse(BaseModel):
    success: bool
    project_name: str
    readme: Optional[str] = None
    api_docs: Optional[str] = None
    setup_guide: Optional[str] = None
    summary: Optional[str] = None
    folder_structure: Optional[str] = None
    message: Optional[str] = None
    supabase_id: Optional[str] = None
