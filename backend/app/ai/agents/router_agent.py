from dotenv import load_dotenv

load_dotenv() 
from typing import Literal

from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

from app.ai.state.state import GraphState

ROUTER_PROMPT = """You are a routing agent for a document assistant. \
Classify the user's latest message into exactly one category:

- "research": the user asks about selected or uploaded documents, including \
factual questions, summaries, overviews, comparisons, or extraction.
- "summarizer": the user asks to summarize text that is included directly \
in their latest message. Do not use this for an uploaded document because \
the summarizer does not retrieve files.
- "action": the user wants a report generated, an export produced, or \
some other action performed with the information.

Respond with the category only."""


class RouteDecision(BaseModel):
    next_agent: Literal["research", "summarizer", "action"] = Field(
        description="Which agent should handle this message next."
    )


llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)
router_llm = llm.with_structured_output(RouteDecision)


def router_agent_node(state: GraphState) -> dict:
    last_message = state["messages"][-1]
    decision: RouteDecision = router_llm.invoke(
        [
            {"role": "system", "content": ROUTER_PROMPT},
            {"role": "user", "content": last_message.content},
        ]
    )

    # This graph receives only the latest user message, not earlier chat
    # turns. A summary of selected files must therefore retrieve their text.
    if decision.next_agent == "summarizer" and state.get("document_ids"):
        return {"next_agent": "research"}

    return {"next_agent": decision.next_agent}
