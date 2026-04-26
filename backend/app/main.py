import os
import time
from fastapi import FastAPI, Request, status, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging_config import logger
from app.core.ratelimit import limiter
from app.routes import api_auth, api_dishes, api_coupons, api_orders, api_driver
from app.db.init_db import init_db

# Initialize FastAPI
app = FastAPI(title=settings.PROJECT_NAME)

# 1. CORSMiddleware (MUST BE FIRST)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nex-serv.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/{full_path:path}", methods=["OPTIONS"])
async def preflight_handler():
    return Response(status_code=200)

# 2. Rate Limiting Setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 3. Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        f"Method: {request.method} Path: {request.url.path} "
        f"Status: {response.status_code} Duration: {duration:.2f}s"
    )
    return response

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected error occurred. Please try again later.",
            "detail": str(exc) if settings.ENV == "development" else None
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "detail": None
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Validation error",
            "detail": exc.errors()
        }
    )

# Include Routers
app.include_router(api_auth.router)
app.include_router(api_dishes.router)
app.include_router(api_coupons.router)
app.include_router(api_orders.router)
app.include_router(api_driver.router)

# Static Files
static_path = os.path.join(os.path.dirname(__file__), "routes", "image")
if not os.path.exists(static_path):
    os.makedirs(static_path)
app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get('/', tags=["health"])
async def root():
    return {
        'status': 'ok', 
        'project': settings.PROJECT_NAME,
        'environment': os.getenv("ENVIRONMENT", "development")
    }

@app.on_event('startup')
def on_startup():
    try:
        init_db()
        print('Database initialized and seeded successfully')
    except Exception as e:
        print('Database initialization failed:', e)
