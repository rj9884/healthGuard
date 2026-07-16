import os
from dotenv import load_dotenv

load_dotenv()

OPENFDA_API_KEY = os.getenv("OPENFDA_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "qwen/qwen3-coder:free")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./health_monitor.db")
HF_HOME = os.getenv("HF_HOME", None)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
