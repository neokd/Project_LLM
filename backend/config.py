import os
from chromadb.config import Settings
from langchain.document_loaders import (
    CSVLoader,
    TextLoader,
    UnstructuredExcelLoader,
    Docx2txtLoader,
)
from langchain.document_loaders import (
    UnstructuredFileLoader,
    UnstructuredMarkdownLoader,
)
import torch


if torch.cuda.is_available():
    DEVICE_TYPE = "cuda"
elif torch.backends.mps.is_available():
    DEVICE_TYPE = "mps"
else:
    DEVICE_TYPE = "cpu"


SOURCE_DIRECTORY = os.path.join(os.path.dirname(__file__), "source")
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), "db")

# Can be changed to a specific number
INGEST_THREADS = os.cpu_count() or 8

# Define the Chroma settings
CHROMA_SETTINGS = Settings(
    anonymized_telemetry=False,
    is_persistent=True,
)


CONTEXT_WINDOW_SIZE = 4096
MAX_NEW_TOKENS = CONTEXT_WINDOW_SIZE


N_GPU_LAYERS = 100  # Llama-2-70B has 83 layers
N_BATCH = 512


DOCUMENT_MAP = {
    ".txt": TextLoader,
    ".md": UnstructuredMarkdownLoader,
    ".py": TextLoader,
    # ".pdf": PDFMinerLoader,
    ".pdf": UnstructuredFileLoader,
    ".csv": CSVLoader,
    ".xls": UnstructuredExcelLoader,
    ".xlsx": UnstructuredExcelLoader,
    ".docx": Docx2txtLoader,
    ".doc": Docx2txtLoader,
}

# Default Instructor Model
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L12-v2"
MODEL_NAME = "TheBloke/zephyr-7B-beta-GGUF"
MODEL_FILE = "zephyr-7b-beta.Q4_K_M.gguf"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models")
