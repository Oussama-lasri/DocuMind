import operator
from typing import Annotated, List, TypedDict


class GraphState(TypedDict):
    """
    Represents the state of our graph.

    Attributes:
        question: question
        generation: LLM generation
        documents: list of documents
    """

    question: Annotated[str, lambda x, y: y]
    generation: str
    documents: Annotated[List[str], operator.add]
    language: str
