import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENFDA_API_KEY = os.getenv("OPENFDA_API_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./health_monitor.db")
HF_HOME = os.getenv("HF_HOME", None)
