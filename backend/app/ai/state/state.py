import operator
from typing import Annotated, List

from langgraph.graph import MessagesState


class GraphState(MessagesState):
    documents: Annotated[List[dict], operator.add]
    language: str
    next_agent: str                                  