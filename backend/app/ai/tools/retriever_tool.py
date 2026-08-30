from langchain_core.tools import tool

from app.ai.embeddings.embedding_models import get_embedding_model
from app.ai.rag.retriever import get_retriever


@tool
def search_documents(query: str, collection_name: str) -> str:
    """
    Search the user's uploaded documents for information relevant to the query.
    Use this whenever answering the question requires looking something up
    in a specific uploaded document, rather than something already known
    from the conversation so far.

    Args:
        query: The search query or question to look up.
        collection_name: Which uploaded document's collection to search
            (e.g. the filename it was stored under).
    """
    retriever = get_retriever(
        retriever="chroma",
        embedding=get_embedding_model("HuggingFaceEmbeddings"),
        persistent_directory="./chroma_db",
        collection_name=collection_name,
    )
    docs = retriever.invoke(query)

    if not docs:
        return "No relevant documents found."

    return "\n\n".join(
        f"[Source: {d.metadata.get('filename', 'unknown')}]\n{d.page_content}"
        for d in docs
    )
