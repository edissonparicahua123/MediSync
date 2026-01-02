# 🏥 MediSync Enterprise

> **Comprehensive Hospital Management System with AI Integration**

A production-ready, full-stack SaaS platform for hospital management featuring patient care, doctor scheduling, pharmacy, laboratory, billing, and **next-generation AI capabilities powered by Google Gemini**.

---

## 🚀 Key Features

### 🏥 Core Modules
- **Patient Management**: Complete digital health records, medical history, and file attachments.
- **Doctor Management**: Detailed profiles, specialty management, and dynamic scheduling.
- **Appointment System**: Smart scheduling with status tracking and automated reminders.
- **Bed Management System** (NEW 🛏️): 
    - Interactive visual map of hospital beds.
    - Drag-and-drop bed assignment.
    - Real-time status tracking (Occupied, Available, Cleaning, Maintenance).
- **Patient Portal** (NEW 👤): 
    - Dedicated interface for patients.
    - View lab results, upcoming appointments, and billing history.
- **Pharmacy**: Inventory management, stock alerts, and movement tracking.
- **Laboratory**: Comprehensive lab test orders, result entry, and PDF report generation.
- **Billing & Invoicing**: Automated invoice generation, payment tracking, and financial reporting.
- **Attendance Tracking**: Staff check-in/out system with shift management.

### 🤖 Advanced AI Features
- **Google Gemini Integration** (NEW ✨): 
    - **Intelligent Assistant**: Context-aware chat for medical queries and system navigation.
    - **Smart Summaries**: Automated clinical note summarization.
- **AI Triage**: Machine learning models for patient prioritization based on symptoms.
- **Predictive Analytics**: Pharmacy stock demand forecasting and trend analysis.
- **Document Generation**: AI-assisted medical report writing.

### 🛡️ Security & Enterprise Ready
- **Authentication**: Secure JWT-based auth with refresh token rotation.
- **RBAC**: Granular Role-Based Access Control + Permission Guards.
- **Audit Logging**: Complete trail of all system activities.
- **Data Privacy**: Regulation-compliant data handling.

---

## 🏗️ Architecture & Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Caching**: Redis
- **Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Lucide Icons
- **State Management**: Zustand + React Query
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod
- **Visualization**: Recharts

### AI Service
- **Framework**: FastAPI (Python)
- **LLM**: Google Gemini Pro
- **ML Libraries**: Scikit-learn, Pandas, NumPy
- **Validation**: Pydantic

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Traefik
- **CI/CD**: GitHub Actions

---

## 📁 Project Structure

```
medisync/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages (Dashboard, Patients, Beds, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API integration services
│   │   └── stores/        # Zustand state stores
│
├── server/                 # NestJS backend API
│   ├── src/
│   │   ├── auth/          # Authentication & Guard logic
│   │   ├── prisma/        # Database schema and service
│   │   └── [modules]/     # Feature modules (patients, beds, ai, etc.)
│
├── ai/                     # Python AI microservice
│   ├── app/
│   │   ├── services/      # Gemini & ML model services
│   │   └── routers/       # AI Endpoints
│
└── docker-compose.yml      # Container orchestration
```

---

## 🚦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev)
- Python 3.11+ (for AI dev)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medisync
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Update .env with your GEMINI_API_KEY and DB credentials
   ```

3. **Start with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```
   *Starts: Postgres, Redis, Backend (3000), AI Service (8000), Client (5173)*

4. **Initialize Database**
   ```bash
   docker-compose exec server npm run prisma:migrate
   docker-compose exec server npm run prisma:seed
   ```

5. **Access the Application**
   - **Frontend**: http://localhost:5173
   - **Interactive API Docs**: http://localhost:3000/api/docs

---

## 🔧 Development Commands

### Backend (`/server`)
```bash
npm install
npm run prisma:generate
npm run start:dev
```

### Frontend (`/client`)
```bash
npm install
npm run dev
```

### AI Service (`/ai`)
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📊 Database Schema Highlights
The system uses a relational schema with **25+ models**. Key entities include:
- `User`, `Role`, `Permission`
- `Patient`, `MedicalRecord`
- `Bed`, `Room`, `Department`
- `Appointment`, `DoctorSchedule`
- `Inventory`, `PharmacyMovement`

---

## 🧪 Testing

- **Backend**: `npm run test:e2e` (Jest)
- **Frontend**: `npm run test` (Vitest)
- **AI**: `pytest`

---

## 📝 License
This project is proprietary software. All rights reserved.

---

**Made with 💙 by the MediSync Team**
