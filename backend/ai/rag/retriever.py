



from langchain_chroma import Chroma
from langchain_pinecone import Pinecone

def get_retriever( retriever: str, embedding , persistent_directory , collection_name) -> BaseRetriever:
    """
    Factory function to get the appropriate retriever based on the retriever_type.
    """
    
    
    if retriever == "chroma":
        Chroma(
            collection_name=collection_name,
            persist_directory=persistent_directory,
            embedding_function=embedding,
        ).as_retriever()

    elif retriever == "pinecone":
        return Pinecone(
            index_name=collection_name,
            embedding_function=embedding,
        ).as_retriever()

    else:
        raise ValueError(f"Unknown retriever: {retriever}") 