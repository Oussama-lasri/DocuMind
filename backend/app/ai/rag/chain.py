from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langsmith import Client

from app.ai.embeddings.embedding_models import get_embedding_model

from . import retriever


def get_documents_from_retriever(question: str):
    """
    Function to retrieve documents based on a question using the specified retriever and embedding model.
    """
    print("Retrieving documents from retriever...")

    documents = retriever.get_retriever(
        retriever="chroma",
        embedding=get_embedding_model("HuggingFaceEmbeddings"),
        persistent_directory="./chroma_db",
        collection_name="resume-ousama-lasri-fr.pdf",
    ).invoke(question)

    return documents
