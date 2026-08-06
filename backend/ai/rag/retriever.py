from langchain_chroma import Chroma
from langchain_community.vectorstores import FAISS


def get_retriever( retriever: str, embedding , persistent_directory , collection_name):
    """
    Factory function to get the appropriate retriever based on the retriever_type.
    """
    
    
    if retriever == "chroma":
        return Chroma(
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