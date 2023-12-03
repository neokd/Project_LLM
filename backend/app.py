from fastapi import FastAPI, status, WebSocket
from langchain.llms import LlamaCpp
from config import MODEL_PATH, MODEL_NAME, MODEL_FILE
from huggingface_hub import hf_hub_download

app = FastAPI()


@app.get("/api/test")
def test():
    return {"message": "LLM Test API", "status": status.HTTP_200_OK}


@app.get("/api/load_model")
async def load_model():
    model_path = hf_hub_download(
        repo_id=MODEL_NAME,
        filename=MODEL_FILE,
        resume_download=True,
        cache_dir=MODEL_PATH,
    )

    llm = LlamaCpp(
        model_path=model_path,
        temperature=0.75,
        max_tokens=2000,
        top_p=1,
        # callback_manager=callback_manager,
        verbose=True,  # Verbose is required to pass to the callback manager
    )
    return {"message": "Model loaded", "status": status.HTTP_200_OK}


@app.get("/api/upload/user_files")
async def upload_user_files():
    # Logic to upload user files and save to source directory and build the vector store
    return {"message": "User files uploaded", "status": status.HTTP_200_OK}


@app.websocket("/api/chat")
async def chat(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, reload=True)
