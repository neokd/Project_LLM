from fastapi import FastAPI , status , UploadFile,  Depends , Form
from fastapi.middleware.cors import CORSMiddleware  
from pydantic import BaseModel
from langchain.llms.llamacpp import LlamaCpp
from config import (
    MODEL_PATH,
    MODEL_NAME,
    MODEL_FILE,
    DEVICE_TYPE,
    MAX_NEW_TOKENS,
    N_GPU_LAYERS,
    SOURCE_DIRECTORY, 
    STRUCTURE_DIRECTORY,
    PERSIST_DIRECTORY,
    EMBEDDING_MODEL_NAME
)


from huggingface_hub import hf_hub_download
from langchain.chains import LLMChain, RetrievalQA, ConversationalRetrievalChain

from langchain.prompts import PromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.callbacks.manager import CallbackManager
from typing import List
from callbacks import StreamingResponse, TokenStreamingCallbackHandler, SourceDocumentsStreamingCallbackHandler, QueueCallbackHandler, stream

from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from databases import Database
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from vector_builder.folder_structure import folder_structure_class
from vector_builder.db_ingest import content_loader_class
from vector_builder.detect_changes import detect_changes_class
from langchain.vectorstores.chroma import Chroma
import os
from builder_langchain import update_json_structure, create_json_structure
from langchain.vectorstores.chroma import Chroma
import os
import chromadb
from langchain.embeddings import HuggingFaceEmbeddings
from queue import Queue
from sse_starlette.sse import EventSourceResponse


app = FastAPI()
Base = declarative_base()
DATABASE_URL = "sqlite:///test.db"


folder_structure_object = folder_structure_class()
detect_changes_object = detect_changes_class()
root_directory = os.path.basename(os.path.normpath(SOURCE_DIRECTORY))

create_json_structure(folder_structure_object,detect_changes_object)
client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
db=Chroma(collection_name="central_db", persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings, client=client)


class UserDB(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Register(BaseModel):
    username: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str


# Create an SQLite database engine
engine = create_engine(DATABASE_URL)

# Create the chat_messages table
Base.metadata.create_all(bind=engine)

# Create a session to interact with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@app.post('/api/register')
async def register(user: Register):
    db = SessionLocal()
    try:
        # Check if the user with the provided email already exists
        existing_user = db.query(UserDB).filter(UserDB.email == user.email).first()
        if existing_user:
            return {"message": "Email already registered", "status": status.HTTP_400_BAD_REQUEST}
        os.mkdir("source/" + str(user.username))
        # If the user does not exist, create a new user in the database
        new_user = UserDB(username = user.username, email=user.email, password=user.password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    finally:
        db.close()

    return {"message": "Registration successful", "status": status.HTTP_201_CREATED, "user_id": new_user.id , "username": new_user.username}


@app.post('/api/login')
async def login(user: Login):
    db = SessionLocal()
    try:
        # Query the database for the user with the provided email and password
        db_user = (
            db.query(UserDB)
            .filter(UserDB.email == user.email, UserDB.password == user.password)
            .one()
        )
        return {
            "message": "Login successful",
            "status": status.HTTP_200_OK,
            "user_id": db_user.id,
            "username": db_user.username,
        }

    except NoResultFound:
        return {
            "message": "Invalid credentials",
            "status": status.HTTP_401_UNAUTHORIZED
        }
    finally:
        db.close()


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
async def upload_user_files(files: List[UploadFile], username:str = Form(...)):
    # Process each uploaded file
    # print(username)
    USER_DIR = "source/" + str(username) + "/"
    if not os.path.exists(USER_DIR):
        os.mkdir(USER_DIR)
    print(files)
    for file in files:
        contents = await file.read()
        with open("source/" + str(username) + "/" + file.filename, "wb") as buffer:
            buffer.write(contents)
            buffer.close()
        

        if os.path.exists(STRUCTURE_DIRECTORY):
            update_json_structure(folder_structure_object,detect_changes_object)


    return {"message": "Files uploaded", "status": status.HTTP_200_OK}


###### /api/chat API  ######

def chain_factory() -> RetrievalQA:
    try:
        return RetrievalQA.from_chain_type(
            llm,
            retriever=db.as_retriever(search_kwargs={"k": 2}),
            return_source_documents=True,
        )
    except Exception as e:
        print(e)

class RetrievalQAInput(BaseModel):
    query: str
    # question: str

@app.post("/api/chat")
async def chat(request: RetrievalQAInput, chain: RetrievalQA = Depends(chain_factory)):
    print(request.query)
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


###### /api/stream API for streaming responses ######
class ChatInput(BaseModel):
    question: str


def create_llm_chain(user_question, contexts, output_queue):
    global llm
    llm_chain = LLMChain(
        llm=llm,
        prompt=PromptTemplate.from_template(
            """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
            Question: {question} 
            Context: {context} 
            Answer:"""
        )
    )
    def cb():
        llm_chain(
            {
                "question": user_question, 
                "context": contexts
            },
            callbacks=[QueueCallbackHandler(queue=output_queue)],
        )

    return cb

@app.post("/api/stream")
async def streaming(request: ChatInput):
    context = db.similarity_search(request.question)
    print(context)
    output_queue = Queue()
    llm_cb = create_llm_chain(request.question, context, output_queue)
    return EventSourceResponse(stream(llm_cb, output_queue), media_type="text/event-stream")


@app.get("/api/suggest")
async def suggest():
    with open("./bagofwords.txt", "r") as buffer:
        words = buffer.read().split('\n')
    words = list(filter(None, words))
    word_list = [{"id": idx, "word": word} for idx, word in enumerate(words)]
    return {"message": word_list, "status": status.HTTP_200_OK}

