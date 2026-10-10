from dotenv import load_dotenv

load_dotenv() 
from uuid import uuid4

from langchain_core.messages import AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.ai.state.state import GraphState
from app.ai.tools.retriever_tool import retrieve_documents
from app.ai.tools.report_tool import generate_report

ACTION_PROMPT = (
    "You are an action agent that creates useful outputs from the user's "
    "selected documents. Use retrieved source text as the evidence. For an "
    "FAQ request, create 5 to 8 useful questions based on the source content "
    "and answer each one using only grounded facts. Cite source filenames "
    "where possible. Do not ask the user to provide questions; infer useful "
    "questions from the documents. If retrieval found no text, explain that "
    "and ask the user to select or upload a processed document. When the user "
    "asks to generate an FAQ, report, or other document, call generate_report "
    "with the finished content. After the tool succeeds, briefly confirm "
    "what was generated."
)

llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)
# bind_tools() is important.
# It tells the model: "These are the tools you are allowed to call."
llm_with_tools = llm.bind_tools([retrieve_documents, generate_report])


def action_agent_node(state: GraphState) -> dict:
    messages = state["messages"]
    has_retrieved_documents = any(
        getattr(message, "name", None) == "retrieve_documents"
        for message in messages
    )

    # Ensure grounded action requests retrieve selected sources before the
    # model drafts the report. The tool node injects authenticated user and
    # selected document IDs from graph state.
    if state.get("document_ids") and not has_retrieved_documents:
        return {
            "messages": [
                AIMessage(
                    content="",
                    tool_calls=[
                        {
                            "name": "retrieve_documents",
                            "args": {
                                "query": (
                                    "Find the key topics, facts, definitions, "
                                    "names, dates, and important details needed "
                                    f"to fulfill this request: {messages[-1].content}"
                                )
                            },
                            "id": uuid4().hex,
                            "type": "tool_call",
                        }
                    ],
                )
            ]
        }

    response = llm_with_tools.invoke(
        [SystemMessage(content=ACTION_PROMPT)] + messages
    )
    return {"messages": [response]}
