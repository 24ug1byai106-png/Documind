import os
import subprocess
from app.utils.config import settings

def clone_github_repo(repo_url: str, extract_to: str) -> bool:
    """Clones a GitHub repository to a target directory using a shallow clone."""
    try:
        # Clone with depth 1 to save time and space
        command = ["git", "clone", "--depth", "1", repo_url, extract_to]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Git clone error: {e.stderr}")
        return False
    except FileNotFoundError:
        print("Git is not installed or not in PATH.")
        return False
