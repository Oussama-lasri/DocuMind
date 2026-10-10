from dotenv import load_dotenv

load_dotenv() 
from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.ai.state.state import GraphState
from app.ai.tools.retriever_tool import retrieve_documents

RESEARCH_PROMPT = (
    "You are a research agent. When selected documents are available, you "
    "MUST call retrieve_documents before answering, including for summaries "
    "or overviews. Never claim that files were not attached and never ask "
    "the user to paste a selected file. Answer from the retrieved passages "
    "and cite the source filenames. If retrieval returns no relevant text, "
    "say that clearly."
)

llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)
llm_with_tools = llm.bind_tools([retrieve_documents])


def research_agent_node(state: GraphState) -> dict:
    response = llm_with_tools.invoke(
        [SystemMessage(content=RESEARCH_PROMPT)] + state["messages"]
    )
    return {"messages": [response]}
