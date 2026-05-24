from supabase import create_client, Client
from app.utils.config import settings

def get_supabase_client() -> Client:
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_KEY
    if not url or not key:
        print("Warning: Supabase credentials not fully configured.")
        return None
    return create_client(url, key)

supabase = get_supabase_client()
