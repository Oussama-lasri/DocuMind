from langgraph.graph import MessagesState
from typing import Annotated, List
import operator

class GraphState(MessagesState):
    documents: Annotated[List[dict], operator.add]
    language: str
    next_agent: str                                  