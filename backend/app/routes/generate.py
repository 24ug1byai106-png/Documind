import os
from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateDocsRequest, DocsResponse
from app.services.file_service import get_folder_structure, read_important_files, cleanup_directory
from app.services.ai_service import generate_all_docs
from app.database.db_service import save_project_docs

router = APIRouter()

@router.post("/generate-docs", response_model=DocsResponse)
async def generate_documentation(request: GenerateDocsRequest):
    if not os.path.exists(request.source_path):
        raise HTTPException(status_code=404, detail="Source directory not found. Please upload or clone the repo first.")
        
    try:
        # 1. Analyze Project Structure and Files
        folder_structure = get_folder_structure(request.source_path)
        code_content = read_important_files(request.source_path)
        
        # 2. Call AI Service to generate docs
        docs = await generate_all_docs(request.project_name, folder_structure, code_content)
        
        # 3. Save to Supabase
        db_data = {
            "username": request.username,
            "project_name": request.project_name,
            "repo_url": request.repo_url,
            "readme": docs["readme"],
            "api_docs": docs["api_docs"],
            "setup_guide": docs["setup_guide"],
            "summary": docs["summary"],
            "folder_structure": docs["folder_structure"]
        }
        
        saved_record = await save_project_docs(db_data)
        
        # 4. Cleanup extracted files to save space
        cleanup_directory(request.source_path)
        
        return DocsResponse(
            success=True,
            project_name=request.project_name,
            readme=docs["readme"],
            api_docs=docs["api_docs"],
            setup_guide=docs["setup_guide"],
            summary=docs["summary"],
            folder_structure=docs["folder_structure"],
            message="Documentation generated successfully.",
            supabase_id=saved_record["id"] if saved_record else None
        )
        
    except Exception as e:
        # Attempt cleanup even on failure
        cleanup_directory(request.source_path)
        raise HTTPException(status_code=500, detail=f"Failed to generate documentation: {str(e)}")

@router.get("/projects")
async def list_projects(username: str):
    try:
        from app.database.db_service import get_all_projects
        projects = await get_all_projects(username)
        return {"success": True, "projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    try:
        from app.database.db_service import get_project_docs
        project = await get_project_docs(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")
        return {"success": True, "project": project}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
