from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
# from app.ai.graph.workflow import run_documind_workflow

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_documents(request: ChatRequest):
    try:
        print(f"Received chat request: {request}")
        
        # result = await run_documind_workflow(
        #     query=request.query,
        #     user_id=request.user_id,
        #     session_id=request.session_id or "default"
        # )
        return ChatResponse(
            answer="dsmn",
            sources=[
                {
                    "document_name": "example.pdf",
                    "page": 1,
                    "score": 0.95
                }
            ],
            agent_used="sndskjndsjk"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))