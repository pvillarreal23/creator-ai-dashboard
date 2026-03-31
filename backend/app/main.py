from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, async_session
from app.services.agent_loader import load_agents_to_db
from app.services.scheduler import init_scheduled_tasks
from app.routers import agents, threads
from app.routers.scheduler import router as scheduler_router
from app.config import CORS_ORIGINS
import os

os.makedirs("data", exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init DB, load agents, init scheduler
    await init_db()
    async with async_session() as session:
        await load_agents_to_db(session)
    print("Loaded agents into database")
    await init_scheduled_tasks()
    print("Scheduler initialized — agents are autonomous")
    yield


app = FastAPI(title="YouTube Empire", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents.router)
app.include_router(threads.router)
app.include_router(scheduler_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
