from fastapi import FastAPI, status, File, UploadFile
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
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from callbacks import  ThreadedGenerator
from langchain.callbacks.manager import CallbackManager
from fastapi.responses import StreamingResponse
from streaming import chat
import copy
import json
from fastapi import Request
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from llama_cpp import Llama
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # You can replace "*" with your frontend's origin(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
llm = None
llm_chain = None
callback_manager = None


@app.get("/api/test")
def test():
    return {"message": "LLM Test API", "status": status.HTTP_200_OK}


@app.get("/api/load_model")
async def load_model():
    global llm, llm_chain, callback_manager
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
    
    llm = Llama(model_path=model_path, max_tokens=MAX_NEW_TOKENS, n_ctx=MAX_NEW_TOKENS, n_batch=512,  verbose=False, f16_kv=True, streaming=True)
    # if DEVICE_TYPE.lower() == "mps":
    #     kwargs["n_gpu_layers"] = 1  # only for MPS devices
    # if DEVICE_TYPE.lower() == "cuda":
    #     kwargs["n_gpu_layers"] = N_GPU_LAYERS  # set this based on your GPU
    #     # Create a LlamaCpp object (language model)
    # llm = LlamaCpp(**kwargs)

    return {"message": "Model loaded", "status": status.HTTP_200_OK}

from typing import List

@app.post("/api/upload/user_files")
async def upload_user_files(files: List[UploadFile]):
    # Process each uploaded file
    for file in files:
        contents = await file.read()
        with open("source/" + file.filename, "wb") as buffer:
            buffer.write(contents)
            buffer.close()

    return {"file_success":[file.filename for file in files]}

class Query(BaseModel):
    question: str

# Streaming with FastAPI
@app.post("/api/llama")
async def chat_llama(request: Request, question: Query):

    stream = llm(
        str(question.question),
        max_tokens=100,
        stop=["Q:"],
        stream=True,
    )

    async def async_generator():
        for item in stream:
            yield item
            print(item)

    async def sse_generator():
        async for item in async_generator():
            if await request.is_disconnected():
                break
            result = copy.deepcopy(item)
            text = result["choices"][0]["text"]
            finish_reason = result["choices"][0]["finish_reason"]
            yield json.dumps({"id" : result["id"],"data": text, "event": "stream", "finish_reason": finish_reason})


    return EventSourceResponse(sse_generator(),media_type='text/event-stream')

# Fake Streaming with LangChain
@app.get("/api/stream")
async def stream_llm(request: Request):
    global llm_chain, llm
    llm_chain = LLMChain(
        llm = llm,
        prompt=PromptTemplate.from_template(
        "You are a helpful assistant, you will use the provided context to answer user questions.Read the given context before answering questions and think step by step. If you can not answer a user  question based on the provided context, inform the user. Do not use any other information for answering user. Initialize the conversation with a greeting if no context is provided. {question}. Always generate response in markdown format.",
        )
    )
    async def sse_generator():
        async for item in llm_chain.astream("List top 5 places to visit in india"):
            if await request.is_disconnected():
                break
            result = copy.deepcopy(item)
            for chunk in result["text"].split():
                yield json.dumps({"data": chunk, "event": "stream"}) + "\n"
                

    return EventSourceResponse(sse_generator(), media_type="text/event-stream")

# Streaming with Threading
@app.get("/api/model/stream")
async def stream():
    return StreamingResponse(chat("List top 5 places to visit in india"), media_type='text/event-stream')



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, reload=True)