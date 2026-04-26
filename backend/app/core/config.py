import os
from typing import List, Optional, Literal
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "nexServ"
    API_V1_STR: str = "/api"
    ENV: Literal["development", "production"] = "development"
    
    # DATABASE
    DATABASE_URL: str
    
    # AUTH
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ADMIN_EMAIL: str = "admin@nexserv.com"
    
    # EMAIL
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # SUPABASE
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_BUCKET: str = "dishes"
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        if self.ENV == "development":
            return [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]

        return [
            self.FRONTEND_URL,
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
