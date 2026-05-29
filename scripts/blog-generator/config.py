import os
from pathlib import Path
from dotenv import load_dotenv

# Find `.env` in the current folder or project root
current_dir = Path(__file__).resolve().parent
env_file = current_dir / '.env'
if not env_file.exists():
    env_file = current_dir.parent.parent / '.env'

if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

# Blog API Settings
BLOG_API_KEY = os.getenv('BLOG_API_KEY', 'test-api-key-123')
# Default local URL, can be overridden by environment variable
BLOG_API_URL = os.getenv('BLOG_API_URL', 'http://localhost:3000/api')

# LLM Providers Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ABACUSAI_API_KEY = os.getenv('ABACUSAI_API_KEY')

# Image Search & Download Directory
LOCAL_TEMP_DIR = current_dir / 'temp'
LOCAL_TEMP_DIR.mkdir(parents=True, exist_ok=True)

def validate_config():
    """
    Validates that necessary credentials are set.
    """
    if not BLOG_API_KEY:
        print("⚠️ Warning: BLOG_API_KEY is not defined in .env.")
    
    has_llm = any([OPENAI_API_KEY, GEMINI_API_KEY, ABACUSAI_API_KEY])
    if not has_llm:
        print("⚠️ Warning: No LLM keys found (GEMINI_API_KEY, OPENAI_API_KEY, or ABACUSAI_API_KEY). "
              "The script will run in mock/dry-run mode if no active LLM is available.")

if __name__ == '__main__':
    print(f"Loaded environment from: {env_file}")
    print(f"BLOG_API_URL: {BLOG_API_URL}")
    print(f"BLOG_API_KEY: {'[SET]' if BLOG_API_KEY else '[MISSING]'}")
    print(f"GEMINI_API_KEY: {'[SET]' if GEMINI_API_KEY else '[MISSING]'}")
    print(f"OPENAI_API_KEY: {'[SET]' if OPENAI_API_KEY else '[MISSING]'}")
    print(f"ABACUSAI_API_KEY: {'[SET]' if ABACUSAI_API_KEY else '[MISSING]'}")
    validate_config()
