

from backend.ai.rag import retriever
from backend.ai.rag import embedding_models



def get_documents_from_retriever():
    """
    Function to retrieve documents based on a question using the specified retriever and embedding model.
    """
    question = "what are the contents of the document?"
    documents = retriever.get_retriever(retriever = "chroma", embedding = embedding_models.get_embedding_model("HuggingFaceEmbeddings"), persistent_directory = "./chroma_db", collection_name = "RapportStage.docx").invoke(question)

    print({"documents": documents , "question": question})