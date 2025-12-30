from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import triage, summarization, pharmacy, generator, chat
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="MediSync AI Service",
    description="AI-powered features for MediSync Enterprise",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(triage.router, prefix="/predict", tags=["Triage"])
app.include_router(summarization.router, prefix="", tags=["Summarization"])
app.include_router(pharmacy.router, prefix="/pharmacy", tags=["Pharmacy"])
app.include_router(generator.router, prefix="/generator", tags=["Generator"])
app.include_router(chat.router, prefix="/ai", tags=["Chat"])


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "MediSync AI Service",
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    return {
        "message": "MediSync AI Service",
        "docs": "/docs",
        "health": "/health",
    }
