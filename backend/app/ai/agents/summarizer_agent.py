from dotenv import load_dotenv
load_dotenv() 
from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.ai.state.state import GraphState

SUMMARIZER_PROMPT = (
    "You are a summarizer agent. Condense the document content already "
    "retrieved earlier in this conversation into a clear, concise answer. "
    "Cite which document each fact came from when the source is available."
)

llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)


def summarizer_agent_node(state: GraphState) -> dict:   
    
    conversation_history = [("system", SUMMARIZER_PROMPT)] + state["messages"]
    response = llm.invoke(
        [SystemMessage(content=SUMMARIZER_PROMPT)] + state["messages"]
    )
    return {"messages": [response]}
