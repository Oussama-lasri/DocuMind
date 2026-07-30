from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI()

@app.get("/")
async def root():
    return("Hello from back-end!")

app.include_router(api_router, prefix="/api/v1")