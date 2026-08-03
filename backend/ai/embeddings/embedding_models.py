

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_embedding_model(model_name: str):
    """
    Factory function to get the appropriate embedding model based on the model_name.
    """
    if model_name == "HuggingFaceEmbeddings":
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},         
            encode_kwargs={'normalize_embeddings': True}  
            )
    elif model_name == "OpenAIEmbeddings":
        return OpenAIEmbeddings(model="text-embedding-3-small")
    elif model_name == "GoogleGenerativeAIEmbeddings":
        return GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")
    else:
        raise ValueError(f"Unknown embedding model: {model_name}")