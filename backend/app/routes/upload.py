import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.config import settings
from app.services.file_service import extract_zip

router = APIRouter()

@router.post("/upload")
async def upload_project(file: UploadFile = File(...)):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are supported.")
        
    project_id = str(uuid.uuid4())
    project_name = file.filename.replace('.zip', '')
    
    # Ensure upload dir exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    zip_path = os.path.join(settings.UPLOAD_DIR, f"{project_id}.zip")
    extract_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    
    try:
        # Save zip temporarily
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract zip
        extract_zip(zip_path, extract_dir)
        
        # Remove the zip file after extraction
        os.remove(zip_path)
        
        return {
            "success": True,
            "project_id": project_id,
            "project_name": project_name,
            "source_path": extract_dir,
            "message": "Files uploaded and extracted successfully."
        }
    except Exception as e:
        # Cleanup in case of error
        if os.path.exists(zip_path):
            os.remove(zip_path)
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir)
        raise HTTPException(status_code=500, detail=str(e))
