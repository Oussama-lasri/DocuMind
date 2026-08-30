


from typing import List

from langchain_google_genai import ChatGoogleGenerativeAI
from langsmith import Client
from langchain_core.output_parsers import StrOutputParser
from . import retriever
from backend.app.ai.embeddings.embedding_models import get_embedding_model

def generate_answer(question: str, documents: List[str]) -> str:
    """
    Function to generate an answer based on the provided question and documents using a language model.
    """
    print("Generating answer...")

    llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)
    try:
            client = Client()
            prompt = client.pull_prompt("rlm/rag-prompt")
    except Exception:
            print("Failed to retrieve prompt from LangSmith. Using default prompt.")
            prompt = """You are a helpful assistant that provides answers based on the provided context. 
            Use the context to answer the question. If the answer is not in the context, say 'I don't know'."""
            
            
        # client = Client()
        # prompt = client.pull_prompt("rlm/rag-prompt")
    print(f"Prompt retrieved from LangSmith: {prompt}")
        # print(f"from generation " + prompt)
    generation_chain = prompt | llm | StrOutputParser()
    print(f"Generation chain created: {generation_chain}")
    generation = generation_chain.ainvoke(
            {"question": question, "context": documents}
    )
    return generation