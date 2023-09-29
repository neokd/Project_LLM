# UI Implementation for the RAG 
import os
import logging
import torch
import chainlit as cl
from langchain.chains import RetrievalQA
from langchain.embeddings import HuggingFaceInstructEmbeddings
from langchain.llms import HuggingFacePipeline, LlamaCpp
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler  
from langchain.callbacks.manager import CallbackManager
from langchain.vectorstores import Chroma
from builder import builder
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from huggingface_hub import hf_hub_download
from chainlit.playground.config import add_llm_provider
from chainlit.playground.providers.langchain import LangchainGenericProvider
from config import (
    MODEL_DIRECTORY,
    PERSIST_DIRECTORY,
    N_GPU_LAYERS,
    MODEL_ID,
    MODEL_BASENAME,
    EMBEDDING_MODEL_NAME,
    MAX_TOKEN_LENGTH,
    DEVICE_TYPE
)

@cl.cache
def load_model(device_type:str = DEVICE_TYPE,model_id:str = MODEL_ID, model_basename:str = MODEL_BASENAME, LOGGING=logging):
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
                    "n_ctx": MAX_TOKEN_LENGTH,
                    "n_batch": 512,  
                    # "callback_manager": callback_manager,
                    "verbose":False,
                    # "f16_kv":True,
                }
                if device_type.lower() == "mps":
                    kwargs["n_gpu_layers"] = 40
                if device_type.lower() == "cuda":
                    kwargs["n_gpu_layers"] = N_GPU_LAYERS  # set this based on your GPU
                llm =  LlamaCpp(**kwargs,streaming=True)
                logging.info(f"Loaded {model_id} locally")
                return llm 
            except Exception as e:
                logging.info(f"Error {e}")
        else:
            logging.info(f"Only .gguf models are supported")
    else:
        logging.info(f"Model {model_basename} not found in {model_id}") 

@cl.on_chat_start
def retrival_qa_pipeline(device_type:str=DEVICE_TYPE):
    embeddings = HuggingFaceInstructEmbeddings(model_name = EMBEDDING_MODEL_NAME, model_kwargs={"device": device_type}, cache_folder=os.path.join(os.path.dirname(__file__), "models"),)
    db = Chroma(
        persist_directory=PERSIST_DIRECTORY,
        embedding_function=embeddings,
    )

    retriever = db.as_retriever()

    system_prompt = """
        You are a helpful assistant, you will use the provided context to answer user questions.
        Read the given context before answering questions and think step by step. If you can not answer a user  question based on the provided context, inform the user. Do not use any other information for answering user.
    """

    B_INST, E_INST = "[INST]", "[/INST]"
    B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n" 
    SYSTEM_PROMPT = B_SYS + system_prompt + E_SYS

    instruction = """
            Context: {history} \n {context}
            User: {question}
    """

    prompt_template =  B_INST + SYSTEM_PROMPT + instruction + E_INST
    prompt = PromptTemplate(input_variables=["history", "context", "question"], template=prompt_template)
    # memory = ConversationBufferMemory(input_key="question", memory_key="history")
    memory = ConversationBufferWindowMemory(k=2,return_messages=True,input_key="question", memory_key="history")
    callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    llm = load_model(device_type, model_id=MODEL_ID, model_basename=MODEL_BASENAME, LOGGING=logging)
    # Chianlit 
    chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",  # try other chains types as well. refine, map_reduce, map_rerank
            retriever=retriever,
            return_source_documents=True,  # verbose=True,
            callbacks=callback_manager,
            chain_type_kwargs={"prompt": prompt, "memory": memory},
    )

    cl.user_session.set("qa_chain", chain)
    return chain


@cl.on_message
async def main(message: str):
    conversation = cl.user_session.get("qa_chain")

    cb = cl.LangchainCallbackHandler(
        stream_final_answer=True, answer_prefix_tokens=["Assistant"]
    )

    cb.answer_reached = True
    res = await cl.make_async(conversation)(message, callbacks=[cb])

def main_(device_type:str = DEVICE_TYPE):
    logging.info(f"Running on : {device_type}")
    if not os.path.exists(PERSIST_DIRECTORY):
        builder()
    qa = retrival_qa_pipeline()
    while True:
        query = input("\n \n Enter the query to retrive : ")
        qa(query)

if __name__ == "__main__":
    logging.basicConfig(
        format="%(asctime)s - %(levelname)s - %(filename)s:%(lineno)s - %(message)s", level=logging.INFO
    )
    main_()