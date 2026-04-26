import os
from typing import List, Optional, Literal
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "nexServ"
    API_V1_STR: str = "/api"
    ENV: Literal["development", "production"] = "development"
    
    DATABASE_URL: str
    
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    ADMIN_EMAIL: str = "admin@nexserv.com"
    
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None
    
    FRONTEND_URL: str = "http://localhost:5173"
    
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_BUCKET: str = "dishes"

    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        return [
            "https://nex-serv.vercel.app",
            "https://nex-serv-rajmru3m8-karthikn-vrs-projects.vercel.app"
        ]


    @field_validator("DATABASE_URL", "JWT_SECRET")
    @classmethod
    def check_not_empty(cls, v: str) -> str:
        if not v or v.strip() == "":
            raise ValueError("Must not be empty")
        return v

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
