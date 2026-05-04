from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
import uuid
from datetime import datetime, timezone
from pydantic_ai import Agent
from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    UserPromptPart,
    TextPart,
)
from dotenv import load_dotenv
from pathlib import Path
from app.db.database import get_db
from app.db.models import Chat, Message

_current_file = Path(__file__).resolve()
_env_candidates = [
    _current_file.parent / ".env",
    _current_file.parents[1] / ".env",
    _current_file.parents[2] / ".env",
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


def _build_message_history(chat) -> list[ModelMessage]:
    history = []
    for m in chat.messages:
        if m.role == "user":
            history.append(ModelRequest(parts=[UserPromptPart(content=m.content)]))
        elif m.role == "assistant":
            history.append(ModelResponse(parts=[TextPart(content=m.content)]))
    return history


def _run_agent(model_name: str, message: str, history: list[ModelMessage] | None = None) -> str:
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured in the backend environment.",
        )
    agent = Agent(model=model_name)
    try:
        result = agent.run_sync(message, message_history=history or [])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Model call failed: {exc}") from exc
    return result.output


def _create_title(message: str) -> str:
    compact = " ".join(message.split())
    if len(compact) <= 32:
        return compact or "New chat"
    return compact[:29] + "..."


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _chat_to_dict(chat: Chat) -> dict:
    return {
        "id": chat.id,
        "title": chat.title,
        "model": chat.model,
        "created_at": chat.created_at,
        "updated_at": chat.updated_at,
        "messages": [
            {"id": m.id, "role": m.role, "content": m.content}
            for m in chat.messages
        ],
    }


# ── request bodies ────────────────────────────────────────────────────────────

class MessageRequest(BaseModel):
    message: str
    model: str


class CreateChatRequest(BaseModel):
    message: str
    model: str


class AppendMessageRequest(BaseModel):
    message: str
    model: str


# ── health ────────────────────────────────────────────────────────────────────

@router.get("/health")
def health_check():
    return {"status": "ok"}


# ── legacy send_message (kept for backward compat) ───────────────────────────

@router.post("/send_message")
def send_message(req: MessageRequest):
    model_name = _resolve_model(req.model)
    response = _run_agent(model_name, req.message)
    return {"message": req.message, "model": model_name, "response": response}


# ── chat routes ───────────────────────────────────────────────────────────────

@router.get("/chats")
def list_chats(db: Session = Depends(get_db)):
    chats = db.query(Chat).order_by(Chat.updated_at.desc()).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "model": c.model,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        }
        for c in chats
    ]


@router.post("/chats", status_code=201)
def create_chat(req: CreateChatRequest, db: Session = Depends(get_db)):
    model_name = _resolve_model(req.model)
    ai_response = _run_agent(model_name, req.message, history=None)

    now = _now_iso()
    chat = Chat(
        id=str(uuid.uuid4()),
        title=_create_title(req.message),
        model=model_name,
        created_at=now,
        updated_at=now,
    )
    db.add(chat)
    db.flush()

    user_msg = Message(chat_id=chat.id, role="user", content=req.message, created_at=now)
    assistant_msg = Message(chat_id=chat.id, role="assistant", content=ai_response, created_at=now)
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    db.refresh(chat)

    return _chat_to_dict(chat)


@router.get("/chats/{chat_id}")
def get_chat(chat_id: str, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return _chat_to_dict(chat)


@router.post("/chats/{chat_id}/messages")
def append_message(chat_id: str, req: AppendMessageRequest, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    model_name = _resolve_model(req.model)
    history = _build_message_history(chat)
    ai_response = _run_agent(model_name, req.message, history=history)

    now = _now_iso()
    user_msg = Message(chat_id=chat_id, role="user", content=req.message, created_at=now)
    assistant_msg = Message(chat_id=chat_id, role="assistant", content=ai_response, created_at=now)
    db.add(user_msg)
    db.add(assistant_msg)
    chat.updated_at = now
    db.commit()
    db.refresh(user_msg)
    db.refresh(assistant_msg)

    return {
        "user_message": {"id": user_msg.id, "role": user_msg.role, "content": user_msg.content},
        "assistant_message": {"id": assistant_msg.id, "role": assistant_msg.role, "content": assistant_msg.content},
        "updated_at": now,
    }


@router.delete("/chats/{chat_id}", status_code=204)
def delete_chat(chat_id: str, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()