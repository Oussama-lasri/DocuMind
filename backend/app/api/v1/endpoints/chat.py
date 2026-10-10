import traceback

from fastapi import APIRouter, Depends, HTTPException
from langchain.messages import HumanMessage

from app.schemas.chat import ChatRequest, ChatResponse
from app.utils.dependencies import get_current_user
from assistant_stream import create_run
from assistant_stream.serialization.data_stream import DataStreamResponse
from app.ai.graph.graph import app as documind_graph
import json

# from app.ai.graph.workflow import run_documind_workflow

router = APIRouter()


AGENT_LABELS = {
    "router_agent": "Deciding how to handle this",
    "retrieval_grader_agent": "Checking retrieved documents",
    "research_agent": "Researching",
    "summarizer_agent": "Summarizing",
    "approval_agent": "Needs your approval",
}

@router.post("/chat", response_model=ChatResponse)
async def chat_with_documents(
    request: ChatRequest,
    current_user=Depends(get_current_user),
):
    try:
        print(f"Received chat request: {request}")

        
        result = await documind_graph.ainvoke({
            "query": request.query,
            # Scope retrieval to the authenticated account; never trust a
            # user ID supplied in the request body.
            "user_id": current_user.id,
            "document_ids": request.document_ids or [],
            "session_id": request.session_id or "default",
            "temperature" : 0.1,
            "messages": [
                HumanMessage(content=request.query)
            ],
        })
        content = result["messages"][-1].content
        if isinstance(content, list):
            answer = "".join(
                item["text"]
                for item in content
                if item.get("type") == "text"
            )
        else:
            answer = str(content)
        return ChatResponse(
                answer=answer,
                sources=result.get("sources", []),
                agent_used=result.get("next_agent"),
            )
    except Exception as e:
        print("ERROR:", str(e))
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/chat2")
async def chat(request: ChatRequest):
    async def run(controller):
        active_calls = {}
        async for event in documind_graph.astream_events(inputs, version="v2"):
            node = event.get("metadata", {}).get("langgraph_node")
            if node not in AGENT_LABELS:
                continue
            if event["event"] == "on_chain_start":
                tc = await controller.add_tool_call(node)
                tc.append_args_text(json.dumps({"label": AGENT_LABELS[node]}))
                active_calls[node] = tc
            elif event["event"] == "on_chain_end":
                tc = active_calls.pop(node, None)
                if tc:
                    tc.set_response({"summary": str(event["data"]["output"])[:300]})
            elif event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if chunk.content:
                    controller.append_text(chunk.content)  # the final answer
    return DataStreamResponse(create_run(run))
