from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MessageRequest(BaseModel):
    message: str
    model: str

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.post("/send_message")
def send_message(req: MessageRequest):
    return {"message": req.message, "model": req.model, "response": f"Processed '{req.message}' with model '{req.model}'"}