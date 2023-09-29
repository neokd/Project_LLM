from chromadb.config import Settings
import os
import torch

# Source Directory for Documents to Ingest
SOURCE_DIRECTORY = os.path.join(os.path.dirname(__file__), "documents")
# To store models from HuggingFace
MODEL_DIRECTORY = os.path.join(os.path.dirname(__file__), "models")
# Store Vector Embeddings in db directory
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), "db")

# Default Settings for Chroma DB
CHROMA_SETTINGS = Settings(
    anonymized_telemetry=False,
    is_persistent=True,
)

# GGUF Model 
MODEL_ID = "TheBloke/Mistral-7B-Instruct-v0.1-GGUF"
MODEL_BASENAME = "mistral-7b-instruct-v0.1.Q4_K_M.gguf"
# MODEL_ID = "TheBloke/Llama-2-7b-Chat-GGUF"
# MODEL_BASENAME = "llama-2-7b-chat.Q5_K_M.gguf"

# HuggingFace Model
HUGGINGFACE_MODEL_ID = "google/flan-t5-xxl"
HUGGINGFACE_MODEL_NAME = None
# Text Embedding Model
EMBEDDING_MODEL_NAME = "hkunlp/instructor-large" # 4-5 GB RAM
# Model Parameters
MAX_TOKEN_LENGTH = 4096
N_GPU_LAYERS = 100
# Number of Workers for Ingestion
INGEST_THREADS = os.cpu_count() or 8


# PYTORCH DEVICE COMPATIBILITY
if torch.cuda.is_available():
    DEVICE_TYPE = "cuda"
elif torch.backends.mps.is_available():
    DEVICE_TYPE = "mps"
elif torch.cude.is_rocm_available():
    DEVICE_TYPE = "rocm"
else:
    DEVICE_TYPE = "cpu"
