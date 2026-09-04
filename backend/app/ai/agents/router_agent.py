from dotenv import load_dotenv

load_dotenv() 
from typing import Literal

from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

from app.ai.state.state import GraphState

ROUTER_PROMPT = """You are a routing agent for a document assistant. \
Classify the user's latest message into exactly one category:

- "research": the user is asking a factual question that needs looking \
something up in their documents.
- "summarizer": the user wants a summary or high-level overview of a \
document they've already had researched or uploaded.
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
    return {"next_agent": decision.next_agent}
