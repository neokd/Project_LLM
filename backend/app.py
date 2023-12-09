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
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.callbacks.manager import CallbackManager
from typing import List
from callbacks import StreamingResponse, TokenStreamingCallbackHandler
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from databases import Database
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel


app = FastAPI()
Base = declarative_base()
DATABASE_URL = "sqlite:///test.db"
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