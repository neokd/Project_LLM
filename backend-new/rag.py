import chromadb
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.llms import LlamaCpp
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.vectorstores.chroma import Chroma
from langchain.chains import RetrievalQA
from langchain.embeddings import HuggingFaceEmbeddings
from huggingface_hub import hf_hub_download
from config import (PERSIST_DIRECTORY,EMBEDDING_MODEL_NAME,N_GPU_LAYERS,N_BATCH,MODEL_PATH,MODEL_NAME,MODEL_FILE,MAX_NEW_TOKENS)

"""

n_gpu_layers = 1  # Metal set to 1 is enough.

"""
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])

print("model path : ",MODEL_PATH)

model_path = hf_hub_download(
                repo_id=MODEL_NAME,
                filename=MODEL_FILE,
                resume_download=True,
                cache_dir=MODEL_PATH ,
            )

# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path=model_path,
    n_gpu_layers=N_GPU_LAYERS,
    n_batch=N_BATCH,
    n_ctx=MAX_NEW_TOKENS,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=False,
)

# Prompt
prompt = PromptTemplate.from_template(
    """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

Question: {question} 

Context: {context} 

Answer:"""
)

# Chain
llm_chain = LLMChain(llm=llm, prompt=prompt)

client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

db=Chroma(collection_name="user", persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings, client=client)

# docs = db.similarity_search(question)
# print("docs : ",docs)


#     result = llm_chain.invoke({
#     "question": question,
#     "docs": docs,
# })
#     print("result : ",result)
try:
    qa_chain = RetrievalQA.from_chain_type(
        llm,
        retriever=db.as_retriever(),
        chain_type_kwargs={"prompt": prompt},
    )
    
except TypeError as e:
    pass

except Exception as e:
    print(f"An unexpected error occurred: {e}")

while True:
    question = input("\n---Ask a question: ")
    qa_chain(question)