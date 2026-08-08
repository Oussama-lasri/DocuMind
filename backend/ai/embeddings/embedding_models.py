

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_embedding_model(provider: str):
    """
    Factory function to get the appropriate embedding model based on the provider.
    """
    if provider == "HuggingFaceEmbeddings":
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},         
            encode_kwargs={'normalize_embeddings': True}  
            )
    elif provider == "OpenAIEmbeddings":
        return OpenAIEmbeddings(model="text-embedding-3-small")
    elif provider == "GoogleGenerativeAIEmbeddings":
        return GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")
    else:
        raise ValueError(f"Unknown embedding model: {provider}")