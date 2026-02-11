from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# Configuración de Seguridad EdiCarex
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "edicarex-ai-ultra-secret-2025")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecurityUtility:
    """
    Herramientas de Seguridad de EdiCarex.
    Utiliza JOSE para JWT y Passlib para hashing de integridad.
    """
    
    @staticmethod
    def create_integrity_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Genera un token de integridad para asegurar peticiones internas."""
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
        to_encode.update({"exp": expire, "iss": "EdiCarexAI.Core"})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def verify_password(plain_password, hashed_password):
        """Verifica hashes de integridad (ej: para claves de configuración)."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password):
        """Genera hash seguro para almacenamiento de credenciales de servicios."""
        return pwd_context.hash(password)
