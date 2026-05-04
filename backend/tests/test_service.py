import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_db
from app.db.models import Base, Chat, Message
from app.routers.service import _build_message_history
from pydantic_ai.messages import ModelRequest, ModelResponse, UserPromptPart, TextPart


# ── in-memory DB fixture ──────────────────────────────────────────────────────

@pytest.fixture
def db():
    # StaticPool keeps the same in-memory connection so tables survive across requests
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


# ── _build_message_history ────────────────────────────────────────────────────

def _make_chat(messages: list[tuple[str, str]]) -> MagicMock:
    chat = MagicMock()
    chat.messages = [
        MagicMock(role=role, content=content)
        for role, content in messages
    ]
    return chat


def test_build_history_empty():
    assert _build_message_history(_make_chat([])) == []


def test_build_history_maps_user_turn():
    history = _build_message_history(_make_chat([("user", "hello")]))
    assert len(history) == 1
    assert isinstance(history[0], ModelRequest)
    assert isinstance(history[0].parts[0], UserPromptPart)
    assert history[0].parts[0].content == "hello"


def test_build_history_maps_assistant_turn():
    history = _build_message_history(_make_chat([("assistant", "hi there")]))
    assert len(history) == 1
    assert isinstance(history[0], ModelResponse)
    assert isinstance(history[0].parts[0], TextPart)
    assert history[0].parts[0].content == "hi there"


def test_build_history_preserves_order():
    history = _build_message_history(_make_chat([
        ("user", "msg1"),
        ("assistant", "reply1"),
        ("user", "msg2"),
        ("assistant", "reply2"),
    ]))
    assert len(history) == 4
    assert isinstance(history[0], ModelRequest)
    assert isinstance(history[1], ModelResponse)
    assert isinstance(history[2], ModelRequest)
    assert isinstance(history[3], ModelResponse)


def test_build_history_skips_unknown_role():
    history = _build_message_history(_make_chat([
        ("user", "hello"),
        ("system", "you are helpful"),
        ("assistant", "hi"),
    ]))
    assert len(history) == 2


# ── append_message passes history to _run_agent ──────────────────────────────

def test_append_message_passes_history(db, client):
    now = "2026-01-01T00:00:00+00:00"
    chat = Chat(id="test-chat-1", title="Test", model="groq:llama-3.3-70b-versatile",
                created_at=now, updated_at=now)
    db.add(chat)
    db.add(Message(chat_id="test-chat-1", role="user", content="Merke dir 42.", created_at=now))
    db.add(Message(chat_id="test-chat-1", role="assistant", content="Gemerkt.", created_at=now))
    db.commit()

    with patch("app.routers.service._run_agent", return_value="Die Zahl ist 42.") as mock_agent:
        res = client.post("/chats/test-chat-1/messages", json={
            "message": "Welche Zahl?",
            "model": "llama-3.3-70b-versatile",
        })

    assert res.status_code == 200
    assert res.json()["assistant_message"]["content"] == "Die Zahl ist 42."

    _, kwargs = mock_agent.call_args
    history = kwargs.get("history") or mock_agent.call_args[0][2]
    assert len(history) == 2
    assert isinstance(history[0], ModelRequest)
    assert isinstance(history[1], ModelResponse)


def test_create_chat_no_history(db, client):
    with patch("app.routers.service._run_agent", return_value="Hallo!") as mock_agent:
        res = client.post("/chats", json={
            "message": "Hi",
            "model": "llama-3.3-70b-versatile",
        })

    assert res.status_code == 201
    _, kwargs = mock_agent.call_args
    history = kwargs.get("history")
    assert history is None
