import os
import logging
import torch
# import chainlit as cl
from langchain.chains import RetrievalQA
from langchain.embeddings import HuggingFaceInstructEmbeddings
from langchain.llms import HuggingFacePipeline, LlamaCpp
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler  
from langchain.callbacks.manager import CallbackManager
from langchain.vectorstores import Chroma
from chromadb.config import Settings
from builder import builder
from langchain.memory import ConversationBufferWindowMemory, ConversationBufferMemory
from langchain.prompts import PromptTemplate
from huggingface_hub import hf_hub_download


MODEL_DIRECTORY = os.path.join(os.path.dirname(__file__), "models")
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), "db")
CHROMA_SETTINGS = Settings(
    anonymized_telemetry=False,
    is_persistent=True,
)
N_GPU_LAYERS = 100
MODEL_ID = "TheBloke/Llama-2-13b-Chat-GGUF"
MODEL_BASENAME = "llama-2-13b-chat.Q5_K_M.gguf"
EMBEDDING_MODEL_NAME = "hkunlp/instructor-large"
# Token Length
MAX_TOKEN_LENGTH = 4096


def load_model(device_type:str = "cpu",model_id:str = MODEL_ID, model_basename:str = MODEL_BASENAME, LOGGING=logging):
    callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    if model_basename is not None:
        if ".gguf" in model_basename.lower():
            try: 
                model_path = hf_hub_download(
                    repo_id=model_id,
                    filename=model_basename,
                    resume_download=True,
                    cache_dir=MODEL_DIRECTORY,
                )
                kwargs = {
                    "model_path": model_path,
                    "max_tokens": MAX_TOKEN_LENGTH,
                    "n_batch": 512,  
                    "callback_manager": callback_manager,
                    "temperature": 0.9,
                    "top_p": 1,
                    "verbose":False,
                    "f16_kv":True
                }
                if device_type.lower() == "mps":
                    kwargs["n_gpu_layers"] = 40
                if device_type.lower() == "cuda":
                    kwargs["n_gpu_layers"] = N_GPU_LAYERS  # set this based on your GPU
                llm =  LlamaCpp(**kwargs)
                logging.info(f"Loaded {model_id} locally from {model_path}")
                return llm 
            except Exception as e:
                logging.info(f"Error {e}")
        else:
            logging.info(f"Only .gguf models are supported")
    else:
        logging.info(f"Model {model_basename} not found in {model_id}") 

def retrival_qa_pipeline(device_type:str="cpu"):
    embeddings = HuggingFaceInstructEmbeddings(model_name = EMBEDDING_MODEL_NAME, model_kwargs={"device": device_type})
    db = Chroma(
        persist_directory=PERSIST_DIRECTORY,
        embedding_function=embeddings,
    )
    retriever = db.as_retriever()

    system_prompt = """ """

    B_INST, E_INST = "[INST]", "[/INST]"
    B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n" 
    SYSTEM_PROMPT = B_SYS + system_prompt + E_SYS

    instruction = """
            Context: {history} \n {context}
            User: {question}"""

    prompt_template =  B_INST + SYSTEM_PROMPT + instruction + E_INST
    prompt = PromptTemplate(input_variables=["history", "context", "question"], template=prompt_template)
    #memory = ConversationBufferWindowMemory(k=2,input_key = "question" , memory_key = "history")  
    memory = ConversationBufferMemory(input_key="question", memory_key="history")
    callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    llm = load_model(device_type, model_id=MODEL_ID, model_basename=MODEL_BASENAME, LOGGING=logging)
    qa = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",  # try other chains types as well. refine, map_reduce, map_rerank
            retriever=retriever,
            return_source_documents=True,  # verbose=True,
            callbacks=callback_manager,
            chain_type_kwargs={"prompt": prompt, "memory": memory},
    )
    return qa

def main(device_type:str = "cpu"):
    logging.info(f"Running on : {device_type}")

    if not os.path.exists(PERSIST_DIRECTORY):
        builder()

    qa = retrival_qa_pipeline()
    print(qa("explain user authentication?"))
        

if __name__ == "__main__":
    logging.basicConfig(
        format="%(asctime)s - %(levelname)s - %(filename)s:%(lineno)s - %(message)s", level=logging.INFO
    )
    main()