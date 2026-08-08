from typing import List, TypedDict , Annotated
import operator


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