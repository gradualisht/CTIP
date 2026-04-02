from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel
import os
from pydantic_ai import Agent
from dotenv import load_dotenv
from pathlib import Path

_current_file = Path(__file__).resolve()
_env_candidates = [
    _current_file.parent / ".env",      # backend/app/.env
    _current_file.parents[1] / ".env",  # backend/.env
    _current_file.parents[2] / ".env",  # project root .env
]

for _env_path in _env_candidates:
    if _env_path.exists():
        load_dotenv(dotenv_path=_env_path)
        break
    
router = APIRouter()

DEFAULT_GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
MODEL_ALIASES = {
    "none": DEFAULT_GROQ_MODEL,
    "llama3": "llama-3.3-70b-versatile",
    "sonnet 4.6": DEFAULT_GROQ_MODEL,
}


def _resolve_model(raw_model: str) -> str:
    selected = (raw_model or "").strip()
    if not selected:
        selected = DEFAULT_GROQ_MODEL

    alias_key = selected.lower()
    selected = MODEL_ALIASES.get(alias_key, selected)

    if ":" in selected:
        if not selected.startswith("groq:"):
            raise HTTPException(
                status_code=400,
                detail="Only groq models are supported. Use a groq model id or prefix with groq:.",
            )
        return selected

    return f"groq:{selected}"

class MessageRequest(BaseModel):
    message: str
    model: str

@router.get("/health")  
def health_check():
    return {"status": "ok"}

@router.post("/send_message")
def send_message(req: MessageRequest):
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured in the backend environment.",
        )

    model_name = _resolve_model(req.model)
    agent = Agent(model=model_name)

    try:
        result = agent.run_sync(req.message)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Model call failed: {exc}") from exc

    return {
        "message": req.message,
        "model": model_name,
        "response": result.output,
    }