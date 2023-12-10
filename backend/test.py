from langchain.vectorstores.chroma import Chroma
import chromadb
# from langchain.embeddings import Hu
from config import EMBEDDING_MODEL_NAME
# embedding_function = (model_name=EMBEDDING_MODEL_NAME)

persistent_client = chromadb.PersistentClient()
collection = persistent_client.get_or_create_collection()


langchain_chroma = Chroma(
    client=persistent_client,
    collection_name="user",
    
).as_retriever()
print("There are", langchain_chroma, "in the collection")