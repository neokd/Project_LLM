from fastapi import FastAPI , status , UploadFile,  Depends  
from fastapi.middleware.cors import CORSMiddleware  
from pydantic import BaseModel
from langchain.llms import LlamaCpp
from config import (
    MODEL_PATH,
    MODEL_NAME,
    MODEL_FILE,
    DEVICE_TYPE,
    MAX_NEW_TOKENS,
    N_GPU_LAYERS,
)
from huggingface_hub import hf_hub_download
from langchain.chains import LLMChain , ConversationChain
from langchain.prompts import PromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.callbacks.manager import CallbackManager
from typing import List
from callbacks import StreamingResponse, TokenStreamingCallbackHandler


app = FastAPI()
llm = None
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/load_model")
async def load_model():
    global llm
    model_path = hf_hub_download(
        repo_id=MODEL_NAME,
        filename=MODEL_FILE,
        resume_download=True,
        cache_dir=MODEL_PATH,
    )
    kwargs = {
        "model_path": model_path,
        "max_tokens": MAX_NEW_TOKENS,
        "n_ctx": MAX_NEW_TOKENS,
        "n_batch": 512,
        "callback_manager": CallbackManager([StreamingStdOutCallbackHandler]),
        "verbose": False,
        "f16_kv": True,
        "streaming": True,
    }
    
    if DEVICE_TYPE.lower() == "mps":
        kwargs["n_gpu_layers"] = 1  # only for MPS devices
    if DEVICE_TYPE.lower() == "cuda":
        kwargs["n_gpu_layers"] = N_GPU_LAYERS  # set this based on your GPU
        # Create a LlamaCpp object (language model)
    llm = LlamaCpp(**kwargs)

    return {"message": "Model loaded", "status": status.HTTP_200_OK}

@app.post("/api/upload/user_files")
async def upload_user_files(files: List[UploadFile]):
    # Process each uploaded file
    for file in files:
        contents = await file.read()
        with open("source/" + file.filename, "wb") as buffer:
            buffer.write(contents)
            buffer.close()

    return {"message": "Files uploaded", "status": status.HTTP_200_OK}

class ChatInput(BaseModel):
    input: str


def chain_factory() -> LLMChain: 
    global llm
    return LLMChain(
        llm = llm,
        prompt=PromptTemplate.from_template("Give response to user always in one word for the question {input}"),
    )

@app.post("/api/chat")
async def chat(request: ChatInput, chain: LLMChain = Depends(chain_factory)):
    print(request.input)
    return StreamingResponse(
        chain=chain,
        config={
            "inputs": request.model_dump(),
            "callbacks": [
                TokenStreamingCallbackHandler(output_key=chain.output_key),
            ],
        },
    )