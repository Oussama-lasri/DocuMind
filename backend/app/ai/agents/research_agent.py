from dotenv import load_dotenv
load_dotenv() 
from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.ai.state.state import GraphState
from app.ai.tools.retriever_tool import search_documents

RESEARCH_PROMPT = (
    "You are a research agent. Use the search_documents tool to find "
    "relevant information in the user's uploaded documents before "
    "answering. Only answer directly, without searching, if the answer "
    "is already clearly present earlier in the conversation."
)

llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)
llm_with_tools = llm.bind_tools([search_documents])


def research_agent_node(state: GraphState) -> dict:
    response = llm_with_tools.invoke(
        [SystemMessage(content=RESEARCH_PROMPT)] + state["messages"]
    )
    return {"messages": [response]}
