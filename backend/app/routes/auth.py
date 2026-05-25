from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.db_service import create_user, verify_user

router = APIRouter()

class AuthRequest(BaseModel):
    username: str
    password: str

@router.post("/signup")
async def signup(request: AuthRequest):
    success = create_user(request.username, request.password)
    if not success:
        raise HTTPException(status_code=400, detail="Username already exists")
    return {"success": True, "message": "User created successfully"}

@router.post("/login")
async def login(request: AuthRequest):
    success = verify_user(request.username, request.password)
    if not success:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"success": True, "message": "Logged in successfully"}
