# EdiCarex AI Enterprise - Módulo de Inteligencia Artificial

Este módulo representa el núcleo de inteligencia de la plataforma EdiCarex, diseñado con una arquitectura robusta en FastAPI y potenciado por la infraestructura LPU de Groq con modelos Llama 3.3.

## 🚀 Capacidades Senior

El servicio ha sido refactorizado para cumplir con estándares de producción de alto nivel:

- **Triage Médico Senior**: Implementación estricta del Protocolo Manchester para la priorización de pacientes en urgencias.
- **Analítica Financiera Predictiva**: Análisis de tendencias y proyecciones de ingresos con insights estratégicos para la toma de decisiones.
- **Asistente Virtual Médico**: Interacción empática y profesional 100% en español.
- **Resúmenes Clínicos Inteligentes**: Condensación de historias clínicas complejas manteniendo la fidelidad del dato.

## 🛠️ Arquitectura Técnica

- **Framework**: FastAPI (Python 3.13)
- **Motor de IA**: Groq LPU Engine (Llama 3.3 70B & 3.1 8B)
- **Manejo de Errores**: Middleware global que garantiza respuestas JSON estructuradas y localizadas.
- **Logging**: Sistema de trazabilidad profesional para auditoría de decisiones de IA.

## ⚙️ Configuración y Uso

### Requisitos
- Python 3.13+
- Una `GROQ_API_KEY` válida en el archivo `.env`.

### Instalación
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Documentación de API
Una vez iniciado, puede acceder a la documentación interactiva en:
- [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

## 🇪🇸 Localización
Todo el sistema, desde las respuestas de la API hasta los logs internos y prompts, está optimizado para el contexto médico de habla hispana, asegurando una comunicación clara y profesional con el sistema principal (NestJS) y el frontend.

---
**EdiCarex AI** - *Elevando la gestión clínica con Inteligencia Artificial de nivel Senior.*
