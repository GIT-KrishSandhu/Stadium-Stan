import os
import sys

# Add the monorepo root to the Python path so packages can be imported (RC-1.1 reload)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine
from routes import venues, websockets, simulations, agents, actions, nodes, incidents, volunteers
from workers.event_processor import processor

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Log database connection diagnostics
    print("Database:")
    print(f"Host: {engine.url.host}")
    print(f"Port: {engine.url.port}")
    print(f"Database: {engine.url.database}")
    
    # Setup websocket broadcast callback
    processor.set_broadcast_callback(
        lambda msg: websockets.manager.broadcast_to_venue("metlife", msg)
    )
    # Start the event processor background task
    task = asyncio.create_task(processor.run())
    yield
    # Cleanup
    processor.running = False
    task.cancel()

app = FastAPI(title="Stadium Stan API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(venues.router, prefix="/api/v1")
app.include_router(nodes.router, prefix="/api/v1")
app.include_router(websockets.router)
app.include_router(simulations.router)
app.include_router(agents.router)
app.include_router(actions.router)
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(volunteers.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Stadium Stan API is running"}

@app.get("/api/v1/health")
def health_check():
    try:
        # Simple query to test database connection
        with engine.connect() as connection:
            pass
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}
