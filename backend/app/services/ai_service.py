import google.generativeai as genai
from groq import AsyncGroq
from app.utils.config import settings
from typing import Dict, Any

# Configure Groq
if settings.GROQ_API_KEY:
    groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
else:
    groq_client = None
    print("Warning: GROQ_API_KEY is not set.")

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    gemini_enabled = True
else:
    gemini_enabled = False
    print("Warning: GEMINI_API_KEY is not set.")

async def call_ai(prompt: str) -> str:
    # 1. Try Groq first if available
    if groq_client:
        try:
            chat_completion = await groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.1-8b-instant",  # Using Llama 3.1 8B which is lightning fast on Groq
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API Error: {e}. Attempting fallback...")
            
    # 2. Try Gemini fallback if available
    if gemini_enabled:
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return f"Error generating content: {e}"

    return "Error: No AI API keys configured or valid calls succeeded."

async def summarize_project(folder_structure: str, code_content: str) -> str:
    prompt = f"""You are an expert developer. I will provide the folder structure and code snippets of a project.
    Please provide a concise, high-level summary of what this project is and what it does.
    
    Folder Structure:
    {folder_structure}
    
    Code Snippets:
    {code_content}
    """
    return await call_ai(prompt)

async def generate_readme(project_name: str, folder_structure: str, code_content: str, summary: str) -> str:
    prompt = f"""You are an expert developer. Create a professional README.md for the project '{project_name}'.
    Use the provided summary, folder structure, and code snippets as context.
    Include standard README sections: Title, Description, Features, Prerequisites, Installation, Usage.
    
    Summary: {summary}
    Folder Structure: {folder_structure}
    Code Snippets: {code_content}
    """
    return await call_ai(prompt)

async def generate_api_docs(folder_structure: str, code_content: str) -> str:
    prompt = f"""You are an expert technical writer. Based on the provided code snippets and folder structure, 
    generate API documentation (if any APIs are present). If it's not a backend project or no APIs exist, 
    just state that no APIs were detected. Use markdown formatting.
    
    Folder Structure: {folder_structure}
    Code Snippets: {code_content}
    """
    return await call_ai(prompt)

async def generate_setup_guide(folder_structure: str, code_content: str) -> str:
    prompt = f"""You are an expert DevOps engineer. Based on the provided codebase information, 
    write a step-by-step setup guide for a new developer joining the team. Include commands to install dependencies and run the project.
    
    Folder Structure: {folder_structure}
    Code Snippets: {code_content}
    """
    return await call_ai(prompt)

async def generate_all_docs(project_name: str, folder_structure: str, code_content: str) -> Dict[str, str]:
    """Generates all documentation using Groq API."""
    summary = await summarize_project(folder_structure, code_content)
    readme = await generate_readme(project_name, folder_structure, code_content, summary)
    api_docs = await generate_api_docs(folder_structure, code_content)
    setup_guide = await generate_setup_guide(folder_structure, code_content)
    
    return {
        "summary": summary,
        "readme": readme,
        "api_docs": api_docs,
        "setup_guide": setup_guide,
        "folder_structure": folder_structure
    }
