from functools import lru_cache
from typing import Annotated

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.services.document_service import DocumentService


@lru_cache(maxsize=1)
def _document_service() -> DocumentService:
    return DocumentService()


@tool
def retrieve_documents(
    query: str,
    user_id: Annotated[int, InjectedState("user_id")],
    document_ids: Annotated[list[int], InjectedState("document_ids")],
) -> str:
    """
    Search the user's uploaded documents for information relevant to the query.
    Use this whenever answering the question requires looking something up
    in a specific uploaded document, rather than something already known
    from the conversation so far.

    Args:
        query: The search query or question to look up.
        user_id: Authenticated user ID injected from graph state.
        document_ids: Selected document IDs injected from graph state.
    """
    if not document_ids:
        return "No documents were selected for this question."

    docs = _document_service().processing_service.query(
        query_text=query,
        user_id=user_id,
        document_ids=document_ids,
    )

    if not docs:
        return "No relevant documents found."

    return "\n\n".join(
        f"[Source: {d.metadata.get('filename', 'unknown')}]\n{d.page_content}"
        for d in docs
    )
