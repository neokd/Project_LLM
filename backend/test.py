from fastapi import Depends
from langchain.chains import ConversationChain, RetrievalQA
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms.llamacpp import LlamaCpp
from langchain.vectorstores.chroma import Chroma
from pydantic import BaseModel
from fastapi import FastAPI 
from callbacks import StreamingResponse, TokenStreamingCallbackHandler, SourceDocumentsStreamingCallbackHandler
from config import (
    PERSIST_DIRECTORY,
    EMBEDDING_MODEL_NAME,
    MAX_NEW_TOKENS
)
import chromadb

app = FastAPI()

# Instantiate the LLM outside of chain_factory
llm = LlamaCpp(
    model_path="/Users/kuldeep/Project/Project_LLM/backend/models/models--TheBloke--Mistral-7B-Instruct-v0.1-GGUF/snapshots/731a9fc8f06f5f5e2db8a0cf9d256197eb6e05d1/mistral-7b-instruct-v0.1.Q4_K_M.gguf",
    temperature=0.9,
    f16_kv=True,
    n_ctx=MAX_NEW_TOKENS,
    n_batch=512,
    verbose=True,
    streaming=True,
)

# Instantiate the retriever and other components
client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
db = Chroma(collection_name="central_db", persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings, client=client)

# Instantiate the ConversationChain with the global LLM
conversation_chain = RetrievalQA.from_chain_type(
    llm,
    retriever=db.as_retriever(search_kwargs={"k": 1}),
    return_source_documents=True,
)

def chain_factory() -> ConversationChain:
    return conversation_chain

class ChatInput(BaseModel):
    query: str

@app.post("/api/chat")
async def chat(request: ChatInput, chain: ConversationChain = Depends(chain_factory)):
    return StreamingResponse(
        chain=chain,
        config={
            "inputs": request.model_dump(),
            "callbacks": [
                TokenStreamingCallbackHandler(output_key=chain.output_key),
                SourceDocumentsStreamingCallbackHandler(),
            ],
        },
        run_mode="sync",
    )
