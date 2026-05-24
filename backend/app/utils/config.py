import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))
    GENERATED_DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../generated_docs"))

    # Optional for fallback
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

settings = Config()
