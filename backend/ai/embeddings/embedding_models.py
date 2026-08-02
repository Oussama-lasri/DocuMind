

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings

def get_embedding_model(model_name: str):
    """
    Factory function to get the appropriate embedding model based on the model_name.
    """
    if model_name == "sentence-transformers/all-MiniLM-L6-v2":
        return HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={'device': 'cpu'},         
            encode_kwargs={'normalize_embeddings': True}  
            )
    elif model_name == "text-embedding-3-small":
        return OpenAIEmbeddings(model=model_name)