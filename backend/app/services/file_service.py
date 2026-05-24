import os
import zipfile
import shutil
from typing import List

IGNORE_DIRS = {'node_modules', '.git', 'dist', 'build', 'venv', '__pycache__', '.next', 'coverage'}
IGNORE_EXTS = {'.pyc', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.mp4', '.mp3', '.zip', '.tar', '.gz', '.pdf', '.docx'}

def extract_zip(zip_path: str, extract_to: str) -> str:
    """Extracts a zip file to the given directory."""
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    return extract_to

def get_folder_structure(root_dir: str) -> str:
    """Generates a text representation of the folder structure."""
    structure = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Modify dirnames in-place to ignore certain directories
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        
        level = dirpath.replace(root_dir, '').count(os.sep)
        indent = ' ' * 4 * level
        structure.append(f"{indent}{os.path.basename(dirpath)}/")
        subindent = ' ' * 4 * (level + 1)
        for f in filenames:
            if not any(f.endswith(ext) for ext in IGNORE_EXTS):
                structure.append(f"{subindent}{f}")
                
    return '\n'.join(structure)

def read_important_files(root_dir: str, max_files: int = 50, max_file_size: int = 50000) -> str:
    """Reads the contents of important source files, avoiding large files/binaries."""
    code_content = []
    files_processed = 0
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        
        for f in filenames:
            if any(f.endswith(ext) for ext in IGNORE_EXTS):
                continue
                
            filepath = os.path.join(dirpath, f)
            try:
                # Skip large files to prevent exceeding context window limits
                if os.path.getsize(filepath) > max_file_size:
                    code_content.append(f"// File too large: {f}")
                    continue
                    
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                    rel_path = os.path.relpath(filepath, root_dir)
                    code_content.append(f"--- {rel_path} ---\n{content}\n")
                    files_processed += 1
                    
                if files_processed >= max_files:
                    code_content.append("// Reached maximum number of files to process.")
                    return '\n'.join(code_content)
                    
            except Exception as e:
                code_content.append(f"// Could not read {f}: {str(e)}")
                
    return '\n'.join(code_content)

def cleanup_directory(dir_path: str):
    """Deletes a directory and all its contents."""
    if os.path.exists(dir_path):
        try:
            shutil.rmtree(dir_path)
        except Exception as e:
            print(f"Error cleaning up {dir_path}: {e}")
