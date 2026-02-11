# 🏥 EdiCarex Enterprise - Sistema Integral de Gestión Hospitalaria

> **La Solución Definitiva para la Gestión de Hospitales con Inteligencia Artificial Avanzada**

**EdiCarex Enterprise** es una plataforma SaaS (Software as a Service) de clase mundial, diseñada para revolucionar la administración hospitalaria. Combina una arquitectura robusta y escalable con el poder de la Inteligencia Artificial de Groq (Llama 3.3), ofreciendo una experiencia sin precedentes para médicos, pacientes y administradores.

---

## 🚀 Características Principales

### 🏥 Módulos Clínicos y Administrativos (Core)

#### 1. Gestión Integral de Pacientes
-   **Expediente Clínico Electrónico (ECE)**: Historial médico completo, alergias, diagnósticos previos y antecedentes familiares.
-   **Gestión de Archivos**: Subida y visualización segura de documentos (Rayos X, PDFs, resultados externos).
-   **Búsqueda Avanzada**: Localización instantánea de pacientes por nombre, DNI o historial.

#### 2. Portal del Paciente (Nueva Generación 👤)
-   **Autogestión**: Los pacientes pueden agendar sus propias citas y ver su historial.
-   **Resultados en Línea**: Descarga directa de resultados de laboratorio e informes médicos.
-   **Facturación Transparente**: Visualización de facturas pendientes y pagos realizados.

#### 3. Gestión de Camas Hospitalarias (Bed Management System 🛏️)
-   **Mapa Visual Interactivo**: Vista de planta del hospital con estado real de cada cama (Ocupada, Disponible, Limpieza, Mantenimiento).
-   **Asignación Drag-and-Drop**: Interfaz intuitiva para mover pacientes entre camas o habitaciones.
-   **Control de Capacidad**: Métricas en tiempo real sobre la ocupación del hospital.

#### 4. Sistema de Citas Inteligente
-   **Triaje con IA**: Priorización automática de citas basada en la gravedad de los síntomas reportados.
-   **Recordatorios Automáticos**: Notificaciones para reducir el ausentismo.
-   **Agenda Dinámica**: Vista de calendario para médicos con gestión de bloqueos y horarios.

#### 5. Farmacia e Inventario
-   **Control de Stock en Tiempo Real**: Seguimiento preciso de medicamentos e insumos.
-   **Alertas de Caducidad y Stock Bajo**: Notificaciones proactivas para evitar desabastecimiento.
-   **Trazabilidad**: Registro detallado de cada movimiento (entrada, salida, ajuste) por usuario.

#### 6. Laboratorio Clínico
-   **Gestión de Órdenes**: Creación y seguimiento de órdenes de laboratorio.
-   **Ingreso de Resultados**: Plantillas personalizables para diferentes tipos de análisis.
-   **Generación de Informes**: Creación automática de PDFs profesionales con los resultados para entregar al paciente.

#### 7. Facturación y Finanzas
-   **Facturación Automática**: Generación de facturas basada en servicios prestados, farmacia y honorarios médicos.
-   **Control de Caja**: Registro de pagos parciales, totales y gestión de métodos de pago.
-   **Reportes Financieros**: Análisis de ingresos por departamento, médico o servicio.

#### 8. Control de Asistencia y Personal
-   **Reloj Checador Digital**: Registro de entrada y salida del personal médico y administrativo.
-   **Gestión de Turnos**: Asignación y visualización de horarios laborales.
-   **Reportes de Puntualidad**: Cálculos automáticos de tardanzas y horas extra.

---

### 🤖 Inteligencia Artificial (Powered by Groq LPU ✨)

EdiCarex no es solo un software de gestión; es un asistente inteligente activo.

-   **Asistente Médico Virtual (Chatbot)**: Un chat siempre disponible capaz de responder dudas sobre protocolos médicos, información de medicamentos o navegación por el sistema, manteniendo el contexto de la conversación.
-   **Resúmenes Clínicos Automáticos**: La IA analiza las notas desestructuradas del médico y genera un resumen clínico conciso y estandarizado, ahorrando horas de documentación.
-   **Triaje Predictivo**: Análisis de síntomas ingresados para sugerir la prioridad de atención (Emergencia, Urgencia, Consulta General).
-   **Predicción de Demanda Farmacéutica**: Algoritmos que analizan el consumo histórico para predecir qué medicamentos se necesitarán la próxima semana.

---

## 🏗️ Arquitectura Tecnológica (Tech Stack)

El proyecto está construido sobre un stack moderno, robusto y escalable, siguiendo las mejores prácticas de la industria.

### Backend (Servidor API)
-   **Framework**: [NestJS](https://nestjs.com/) (Node.js) - Arquitectura modular y escalable.
-   **Lenguaje**: TypeScript - Tipado estático para mayor seguridad.
-   **Base de Datos**: PostgreSQL 15+ - Motor relacional robusto.
-   **ORM**: Prisma - Gestión de base de datos segura y moderna.
-   **Caché**: Redis - Para alto rendimiento en sesiones y datos frecuentes.
-   **Documentación API**: Swagger/OpenAPI - Interfaz interactiva para probar endpoints.

### Frontend (Cliente Web)
-   **Framework**: React 18 + Vite - Velocidad de desarrollo y rendimiento extremo.
-   **Lenguaje**: TypeScript.
-   **Estilos**: 
    -   **Tailwind CSS**: Diseño utility-first.
    -   **shadcn/ui**: Componentes accesibles y personalizables de alta calidad.
    -   **Lucide Icons**: Iconografía moderna y consistente.
-   **Estado Global**: Zustand - Gestión de estado ligera y potente.
-   **Gestión de Datos**: React Query (TanStack Query) - Caché, sincronización y actualizaciones en segundo plano.
-   **Visualización de Datos**: Recharts - Gráficos estadísticos avanzados.

### Servicio de IA (Microservicio)
-   **Framework**: FastAPI (Python) - El framework de Python más rápido para APIs.
-   **Modelo LLM**: **Groq Llama 3.3 70B** - Motor de inferencia ultra-rápido LPU.
-   **Ciencia de Datos**: Scikit-learn, Pandas, NumPy - Para modelos predictivos locales.

### Infraestructura y DevOps
-   **Contenerización**: Docker y Docker Compose - Despliegue consistente en cualquier entorno.
-   **Proxy Inverso**: Traefik - Gestión de tráfico y enrutamiento avanzado.
-   **Integración Continua (CI/CD)**: GitHub Actions - Automatización de pruebas y despliegue.

---

## 📁 Estructura del Proyecto

Entender la estructura es clave para navegar por el código fuente.

```bash
edicarex/
├── client/                 # 🖥️ Aplicación Frontend (React)
│   ├── src/
│   │   ├── components/    # Componentes UI reutilizables (Botones, Modales, Tablas)
│   │   ├── pages/         # Vistas principales (Dashboard, Pacientes, Camas)
│   │   ├── hooks/         # Hooks personalizados de React
│   │   ├── services/      # Lógica de comunicación con la API (Axios)
│   │   ├── stores/        # Estado global de la aplicación (Zustand)
│   │   └── lib/           # Utilidades y configuración
│   ├── Dockerfile         # Configuración de imagen Docker para frontend
│   └── package.json       # Dependencias del cliente
│
├── server/                 # ⚙️ API Backend (NestJS)
│   ├── src/
│   │   ├── auth/          # Módulo de Autenticación y Guardias (JWT)
│   │   ├── prisma/        # Servicio de base de datos
│   │   ├── users/         # Gestión de usuarios
│   │   ├── patients/      # Lógica de negocio para pacientes
│   │   ├── beds/          # Lógica para gestión de camas
│   │   ├── ai/            # Integración con el microservicio de IA
│   │   └── [otros]/       # Módulos para cada entidad del sistema
│   ├── prisma/
│   │   └── schema.prisma  # Definición de la base de datos completa
│   ├── Dockerfile
│   └── package.json
│
├── ai/                     # 🧠 Microservicio de Inteligencia Artificial (Python)
│   ├── app/
│   │   ├── services/      # Lógica de Groq y Modelos ML
│   │   ├── routers/       # Endpoints de la API de IA
│   │   └── models/        # Schemas de validación (Pydantic)
│   ├── requirements.txt   # Dependencias de Python
│   └── Dockerfile
│
└── docker-compose.yml      # 🐳 Orquestación de todos los servicios
```

---

## 🚦 Guía de Instalación (Paso a Paso)

Sigue estos pasos para levantar el proyecto en tu entorno local.

### 📋 Prerrequisitos
Asegúrate de tener instalado:
1.  **Docker Desktop** (Esencial para ejecutar todo junto).
2.  **Node.js 20+** (Solo si vas a desarrollar localmente sin Docker).
3.  **Git**.
4.  Una **API Key de Groq** (Consíguela en GroqCloud).

### 🚀 Opción 1: Despliegue Rápido con Docker (Recomendada)

Esta opción levanta todo el sistema (Base de datos, Backend, Frontend, Redis, IA) con un solo comando.

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/edissonparicahua123/EdiCarex.git
    cd edicarex
    ```

2.  **Configurar Variables de Entorno**:
    Copia el archivo de ejemplo y configúralo.
    ```bash
    cp .env.example .env
    ```
    ⚠️ **IMPORTANTE**: Abre el archivo `.env` y coloca tu `GROQ_API_KEY`.

3.  **Iniciar los Servicios**:
    ```bash
    docker-compose up -d
    ```
    *Esto descargará las imágenes y levantará los contenedores. Puede tardar unos minutos la primera vez.*

4.  **Inicializar la Base de Datos**:
    Ejecuta las migraciones y carga los datos de prueba (seeds) dentro del contenedor:
    ```bash
    docker-compose exec server npm run prisma:migrate
    docker-compose exec server npm run prisma:seed
    ```

5.  **¡Listo! Accede al sistema**:
    -   🖥️ **Frontend (App Web)**: http://localhost:5173
    -   ⚙️ **Backend API**: http://localhost:3000
    -   📚 **Documentación API**: http://localhost:3000/api/docs
    -   🧠 **Servicio IA**: http://localhost:8000

---

### 🛠️ Opción 2: Desarrollo Local (Manual)

Si deseas ejecutar cada servicio individualmente para desarrollo.

#### 1. Backend (`/server`)
```bash
cd server
npm install                 # Instalar dependencias
npm run prisma:generate     # Generar cliente de base de datos
npm run start:dev           # Iniciar en modo desarrollo
```

#### 2. Frontend (`/client`)
```bash
cd client
npm install
npm run dev
```

#### 3. Servicio de IA (`/ai`)
```bash
cd ai
python -m venv venv         # Crear entorno virtual
source venv/bin/activate    # Activar (En Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🔐 Seguridad y Acceso

El sistema utiliza estándares de seguridad empresarial:

-   **Autenticación JWT**: Tokens de acceso seguros con rotación de refresh tokens.
-   **RBAC (Role-Based Access Control)**:
    -   **Admin**: Acceso total al sistema.
    -   **Médico**: Acceso a pacientes, citas y sus propios horarios.
    -   **Enfermera**: Gestión de triaje, signos vitales y administración de camas.
    -   **Farmacéutico**: Control de inventario y despacho de recetas.
    -   **Paciente**: Acceso limitado a su propio portal.
-   **Guards**: Protección de rutas a nivel de servidor para asegurar que nadie acceda a datos no autorizados.

---

## 📅 Roadmap (Próximos Pasos)

-   [ ] **App Móvil**: Aplicación nativa para médicos (React Native).
-   [ ] **Telemedicina**: Videollamadas integradas en el navegador (WebRTC).
-   [ ] **Integración con Dispositivos IoT**: Lectura automática de signos vitales.
-   [ ] **Soporte Multi-idioma**: Inglés, Portugués y Quechua.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!
1.  Haz un Fork del proyecto.
2.  Crea tu rama de funcionalidad (`git checkout -b feature/AmazingFeature`).
3.  Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Haz Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---

## 📝 Licencia

Este proyecto es software propietario desarrollado por el equipo de EdiCarex. Todos los derechos reservados.

---

**Desarrollado con pasión 💙 por el Equipo de EdiCarex**
