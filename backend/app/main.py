from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, github, generate

app = FastAPI(
    title="DocuMind AI Backend",
    description="API for analyzing repositories and generating technical documentation using AI.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router, tags=["Upload"])
app.include_router(github.router, tags=["GitHub"])
app.include_router(generate.router, tags=["Generation"])

from fastapi.staticfiles import StaticFiles
import os

frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="static")
else:
    @app.get("/")
    async def root():
        return {
            "message": "Welcome to DocuMind AI Backend API.",
            "status": "Online",
            "docs_url": "/docs"
        }
