from fastapi import APIRouter
from app.api.endpoints import auth, student, admin, public

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(student.router, prefix="/student", tags=["Student"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administrator"])
api_router.include_router(public.router, prefix="/public", tags=["Public Verification"])
