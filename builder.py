import logging
import os
from concurrent.futures import ProcessPoolExecutor,ThreadPoolExecutor, as_completed
from langchain.docstore.document import Document
from langchain.document_loaders import PDFMinerLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceInstructEmbeddings
import torch
from chromadb.config import Settings
from langchain.vectorstores import Chroma


# Global Variables
SOURCE_DIRECTORY = os.path.join(os.path.dirname(__file__), "documents")
MODEL_DIRECTORY = os.path.join(os.path.dirname(__file__), "models")
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), "db")
CHROMA_SETTINGS = Settings(
    anonymized_telemetry=False,
    is_persistent=True,
)
INGEST_THREADS = os.cpu_count() or 8
# Embedding Model
EMBEDDING_MODEL_NAME = "hkunlp/instructor-large"
# HuggingFace Embedding Model
HUGGINGFACE_EMBEDDING_MODEL = ''

DOCUMENT_MAP = {
    '.pdf': PDFMinerLoader,
    '.txt': TextLoader,
}


def load_single_document(file_path: str) -> Document:
    # Loads a single document from a file path
    file_extension = os.path.splitext(file_path)[1]
    loader_class = DOCUMENT_MAP.get(file_extension)
    if loader_class:
        loader = loader_class(file_path)
    else:
        raise ValueError("Document type is undefined")
    return loader.load()[0]


def load_document_batch(filepaths):
    logging.info("Loading document batch")
    # create a thread pool
    with ThreadPoolExecutor(len(filepaths)) as exe:
        # load files
        futures = [exe.submit(load_single_document, name) for name in filepaths]
        # collect data
        data_list = [future.result() for future in futures]
        # return data and file paths
        return (data_list, filepaths)


def load_documents(source_directory : str) -> list[Document]:
    doc_path = []


    for root,_,files in os.walk(source_directory):
        for file_name in files:
            file_extension = os.path.splitext(file_name)[1]
            source_file_path = os.path.join(root, file_name)
            if file_extension in DOCUMENT_MAP.keys():
                doc_path.append(source_file_path)


    
    n_workers = min(INGEST_THREADS, max(len(doc_path), 1))
    chunk_size = round(len(doc_path) / n_workers)

    docs = []

    with ProcessPoolExecutor(n_workers) as executor:
        futures = []
        # split the load operations into chunks
        for i in range(0, len(doc_path), chunk_size):
            # select a chunk of filenames
            filepaths = doc_path[i : (i + chunk_size)]
            # submit the task
            future = executor.submit(load_document_batch, filepaths)
            futures.append(future)
        # process all results
        for future in as_completed(futures):
            # open the file and load the data
            contents, _ = future.result()
            docs.extend(contents)

    return docs


def main():
    logging.info(f"Loading Documents from {SOURCE_DIRECTORY}")
    documents = load_documents(SOURCE_DIRECTORY)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)

    texts = text_splitter.split_documents(documents)

    logging.info(f"Loaded {len(documents)} documents from {SOURCE_DIRECTORY}")
    logging.info(f"Split into {len(texts)} chunks of text")


    device_type = "cuda" if torch.cuda.is_available() else "mps"

    logging.info(f"Using {device_type} device for embedding model")

    embeddings = HuggingFaceInstructEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": device_type},
        cache_folder=os.path.join(os.path.dirname(__file__), "models"),
    )

    db = Chroma.from_documents(
        texts,
        embeddings,
        persist_directory=PERSIST_DIRECTORY,
        client_settings=CHROMA_SETTINGS,

    )

    logging.info("Finished loading documents into database ")
    
# def query():
#     embeddings = HuggingFaceInstructEmbeddings(
#         model_name=EMBEDDING_MODEL_NAME,
#         model_kwargs={"device": 'mps'},
#         cache_folder=os.path.join(os.path.dirname(__file__), "models"),
#     )
#     db = Chroma(
#         embedding_function=embeddings,
#         persist_directory=PERSIST_DIRECTORY,
#     )
#     while True:
#         query = input()
#         results= db.similarity_search(query)
#         print(results)

if __name__ == "__main__":
    logging.basicConfig(
        format="%(asctime)s - %(levelname)s - %(filename)s:%(lineno)s - %(message)s", level=logging.INFO,
    )
    main()


