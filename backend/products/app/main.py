import os
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException

from app.routes_products import router as products_router
from app.routes_categories import router as categories_router

app = FastAPI(title="Lumen Products")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("uploads/products"):
    os.makedirs("uploads/products")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.exception_handler(HTTPException)
async def http_error_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    if errors:
        first = errors[0]
        loc_parts = [str(p) for p in first.get("loc", []) if p not in ("body", "query", "path")]
        loc = ".".join(loc_parts)
        msg = first.get("msg", "Ошибка валидации")
        if loc:
            text = f"{loc}: {msg}"
        else:
            text = msg
    else:
        text = "Ошибка валидации"
    return JSONResponse(status_code=400, content={"error": text})


@app.get("/health")
def health():
    return {"status": "ok", "service": "lumen-products"}

app.include_router(products_router, prefix="/api/products", tags=["products"])
app.include_router(categories_router, prefix="/api/categories", tags=["categories"])
