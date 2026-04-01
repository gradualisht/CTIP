from fastapi import fastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/send_message")
def send_message(message: str, model: str):
    return {"message": message, "model": model, "response": f"Processed '{message}' with model '{model}'"}