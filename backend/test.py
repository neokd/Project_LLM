import threading
import queue

import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse


from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

from langchain.schema import AIMessage, HumanMessage, SystemMessage


app = FastAPI(
    title="Langchain AI API",
)


@app.on_event("startup")
async def startup():
    print("Server Startup!")


class ThreadedGenerator:
    def __init__(self):
        self.queue = queue.Queue()

    def __iter__(self):
        return self

    def __next__(self):
        item = self.queue.get()
        if item is StopIteration:
            raise item
        return item

    def send(self, data):
        self.queue.put(data)

    def close(self):
        self.queue.put(StopIteration)


class ChainStreamHandler(StreamingStdOutCallbackHandler):
    def __init__(self, gen):
        super().__init__()
        self.gen = gen

    def on_llm_new_token(self, token: str, **kwargs):
        self.gen.send(token)


from langchain.llms.llamacpp import LlamaCpp
from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate


def llm_thread(g, prompt):
    try:
        chat = LlamaCpp(
            model_path="/Users/kuldeep/Project/Project_LLM/backend/models/models--TheBloke--zephyr-7B-beta-GGUF/snapshots/e4714d14e9652aa9658fa937732cceadc63ac42e/zephyr-7b-beta.Q4_K_M.gguf",
            streaming=True,
            verbose=False,
            callback_manager=CallbackManager([ChainStreamHandler(g)]),
        )
        llm_chain = LLMChain(
            llm=chat,
            prompt=PromptTemplate.from_template(
                "You are a helpful assistant, you will use the provided context to answer user questions.Read the given context before answering questions and think step by step. If you can not answer a user  question based on the provided context, inform the user. Do not use any other information for answering user. Initialize the conversation with a greeting if no context is provided. {question}. Always generate response in markdown format."
            ),
        )

        llm_chain(prompt)

    finally:
        g.close()


def chat(prompt):
    g = ThreadedGenerator()
    threading.Thread(target=llm_thread, args=(g, prompt)).start()
    return g


@app.get("/question-stream")
async def stream():
    return StreamingResponse(
        chat("Capital of tamil nadu?"), media_type="text/event-stream"
    )
