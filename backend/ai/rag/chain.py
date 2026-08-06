

from langchain_google_genai import ChatGoogleGenerativeAI
from langsmith import Client
from langchain_core.output_parsers import StrOutputParser
from . import retriever
from ai.embeddings.embedding_models import get_embedding_model



def get_documents_from_retriever(question: str):
    """
    Function to retrieve documents based on a question using the specified retriever and embedding model.
    """
    print("Retrieving documents from retriever...")
    
    documents = retriever.get_retriever(retriever = "chroma",
                                        embedding = get_embedding_model("HuggingFaceEmbeddings"),
                                        persistent_directory = "./chroma_db",
                                        collection_name = "resume-ousama-lasri-fr.pdf").invoke(question)

    llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)
    client = Client()
    prompt = client.pull_prompt("rlm/rag-prompt")
    # print(f"from generation " + prompt)
    generation_chain = prompt | llm | StrOutputParser()
    generation = generation_chain.invoke(
        {"question": question, "context": documents}
    )
    
    return {"question": question, "context": documents, "answer": generation}