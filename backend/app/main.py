from fastapi import FastAPI
from app.api.v1.router import api_router
from app.utils.init_db import create_tables

app = FastAPI()

# create_tables()

@app.get("/")
async def root():
    return("Hello from back-end!")

app.include_router(api_router, prefix="/api/v1")