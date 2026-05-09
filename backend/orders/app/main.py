from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from app.routes_cart import router as cart_router
from app.routes_orders import router as orders_router

app = FastAPI(title="Lumen Orders")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return {"status": "ok", "service": "lumen-orders"}


app.include_router(cart_router, prefix="/api/cart", tags=["cart"])
app.include_router(orders_router, prefix="/api/orders", tags=["orders"])
