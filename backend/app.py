
from fastapi import FastAPI, status, WebSocket, File,UploadFile
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
from langchain.callbacks.manager import CallbackManager

from llama_cpp import Llama
import copy
from sse_starlette.sse import EventSourceResponse
import json


app = FastAPI()
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
        "callback_manager": CallbackManager([StreamingStdOutCallbackHandler()]),
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
async def upload_user_files(file: UploadFile = File(...)):
    with open(f"source/{file.filename}", "wb") as buffer:
        buffer.write(file.file.read())
    return {"message": "User files uploaded", "status": status.HTTP_200_OK}


# @app.websocket("/api/chat")
# async def stream_llm(websocket: WebSocket):
#     await websocket.accept()
#     model = LlamaCpp(
#         model_path="/Users/kuldeep/Project/NeoGPT/neogpt/models/models--TheBloke--Mistral-7B-Instruct-v0.1-GGUF/snapshots/45167a542b6fa64a14aea61a4c468bbbf9f258a8/mistral-7b-instruct-v0.1.Q4_K_M.gguf",
#         max_tokens=MAX_NEW_TOKENS,
#         streaming = True,
#         verbose=False,
#         n_ctx=MAX_NEW_TOKENS,
#         callback_manager = CallbackManager([StreamingStdOutCallbackHandler(),SSECallbackHandler()]),
#     )
#     import asyncio
#     while True:
#         question = await websocket.receive_text()
#         resp = ChatResponse(sender="you", message=question, type="stream")
#         await websocket.send_json(resp.dict())
#         await asyncio.sleep(0)

#         print("Question: ", question)

#         start_resp = ChatResponse(sender="bot", message="", type="start")
#         await websocket.send_json(start_resp.dict())

#         chain = LLMChain(
#             llm=model,
#             prompt = PromptTemplate.from_template("You are a helpful assistant, you will use the provided context to answer user questions.Read the given context before answering questions and think step by step. If you can not answer a user  question based on the provided context, inform the user. Do not use any other information for answering user. Initialize the conversation with a greeting if no context is provided. {question}"),
#         )
#         chain.invoke({
#             "question": question
#         })
#         end_resp = ChatResponse(sender="bot", message="", type="end")
#         await websocket.send_json(end_resp.dict())


# llm = LlamaCpp(model_path="/Users/kuldeep/Project/NeoGPT/neogpt/models/models--TheBloke--Mistral-7B-Instruct-v0.1-GGUF/snapshots/45167a542b6fa64a14aea61a4c468bbbf9f258a8/mistral-7b-instruct-v0.1.Q4_K_M.gguf",)
@app.get("/api/llama")
async def chat_llama(request: Request):
    stream = llm(
        "Question: Who is the prime minister of India? Answer:",
        max_tokens=100,
        stop=["Q:", "\n"],
        stream=True,
    )

    async def async_generator():
        for item in stream:
            yield item

    async def sse_generator():
        async for item in async_generator():
            if await request.is_disconnected():
                break
            result = copy.deepcopy(item)
            text = result["choices"][0]["text"]
            yield {"data": text, "event": "message"}

    return EventSourceResponse(sse_generator())


llm = LlamaCpp(
    model_path="/Users/kuldeep/Project/NeoGPT/neogpt/models/models--TheBloke--Mistral-7B-Instruct-v0.1-GGUF/snapshots/45167a542b6fa64a14aea61a4c468bbbf9f258a8/mistral-7b-instruct-v0.1.Q4_K_M.gguf",
    streaming=True,
    verbose=False,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
llm_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate.from_template(
        "You are a helpful assistant, you will use the provided context to answer user questions.Read the given context before answering questions and think step by step. If you can not answer a user  question based on the provided context, inform the user. Do not use any other information for answering user. Initialize the conversation with a greeting if no context is provided. {question}"
    ),
)

from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import copy
import warnings


class Query(BaseModel):
    question: str


@app.post("/api/stream_llm1")
async def stream_llm(request: Request, query: Query):
    async def sse_generator():
        async for item in llm_chain.astream(query.question):
            if await request.is_disconnected():
                break
            result = copy.deepcopy(item)
            for chunk in result["text"].split():
                yield json.dumps({"data": chunk, "event": "stream"}) + "\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


@app.post("/api/stream_llm2")
async def stream_llm(request: Request, query: Query):
    def generate_tokens():
        result = llm_chain(query.question)
        for token in result["text"]:
            yield token

    return StreamingResponse(generate_tokens(), media_type="application/json")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, reload=True)
