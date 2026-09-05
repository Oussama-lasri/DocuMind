from fastapi import FastAPI

from app.ai.rag.chain import get_documents_from_retriever
from app.api.v1.router import api_router
from app.utils.init_db import create_tables
from app.core.middleware import AuthMiddleware

app = FastAPI()
app.add_middleware(AuthMiddleware)

# create_tables()


@app.get("/")
async def root():
    return "Hello from back-end!"


app.include_router(api_router, prefix="/api/v1")
