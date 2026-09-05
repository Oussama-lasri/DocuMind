from fastapi import HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.jwt_service import JwtService

PUBLIC_PATHS = [
    "/",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/openapi.json",
    "/docs",
    "/docs/oauth2-redirect",  # Swagger redirect
    "/redoc",
]

_jwt_service = JwtService()

class AuthMiddleware(BaseHTTPMiddleware):
    
    async def dispatch(self, request, call_next):
        # Skip authentication for public paths
        if request.url.path in PUBLIC_PATHS:
            print("Public path accessed:", request.url.path)
            return await call_next(request)

        try:
            token = request.headers.get("Authorization")
            if not token or not token.startswith("Bearer "):
                raise HTTPException(
                    status_code=401,
                    detail="Missing or invalid Authorization header",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            token = token.split(" ")[1]  # Extract the token part
            _jwt_service.decode_jwt(token)
        except HTTPException as e:
            return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
        
        return await call_next(request)