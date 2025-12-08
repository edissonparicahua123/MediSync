# 🏥 MediSync Enterprise

> **Comprehensive Hospital Management System with AI Integration**

A production-ready, full-stack SaaS platform for hospital management featuring patient care, doctor scheduling, pharmacy, laboratory, billing, and AI-powered triage and analytics.

---

## 🚀 Features

### Core Modules
- ✅ **Patient Management** - Complete patient records, medical history, files
- ✅ **Doctor Management** - Doctor profiles, specialties, schedules
- ✅ **Appointment System** - Scheduling, status tracking, AI triage
- ✅ **Pharmacy** - Medication inventory, stock management, alerts
- ✅ **Laboratory** - Lab orders, results, PDF reports
- ✅ **Billing & Invoicing** - Invoice generation, payment tracking
- ✅ **Attendance Tracking** - Staff check-in/out, work hours
- ✅ **Notifications** - Real-time alerts and notifications
- ✅ **Audit Logs** - Complete activity tracking
- ✅ **File Management** - Secure file storage and retrieval

### AI Features
- 🤖 **AI Triage** - Intelligent patient prioritization
- 📊 **Demand Prediction** - Pharmacy stock forecasting
- 📝 **Clinical Summaries** - Automated medical note summarization
- 🔮 **Text Generation** - Medical document generation

### Security & Access Control
- 🔐 JWT Authentication
- 👥 Role-Based Access Control (RBAC)
- 🛡️ Granular Permissions
- 📜 Complete Audit Trail

---

## 🏗️ Architecture

### Technology Stack

**Backend**
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- Redis (caching)
- JWT Authentication
- Swagger/OpenAPI

**AI Service**
- FastAPI + Python
- Scikit-learn
- Pydantic validation

**Frontend**
- React 18 + Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand + React Query
- React Hook Form + Zod

**Infrastructure**
- Docker + Docker Compose
- Traefik (reverse proxy)
- GitHub Actions (CI/CD)

---

## 📁 Project Structure

```
medisync/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand state management
│   │   └── lib/           # Utilities and helpers
│   ├── Dockerfile
│   └── package.json
│
├── server/                 # NestJS backend API
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management
│   │   ├── patients/      # Patient module
│   │   ├── doctors/       # Doctor module
│   │   ├── appointments/  # Appointments module
│   │   ├── pharmacy/      # Pharmacy module
│   │   ├── laboratory/    # Laboratory module
│   │   ├── billing/       # Billing & invoicing
│   │   ├── notifications/ # Notifications
│   │   ├── attendance/    # Attendance tracking
│   │   ├── reports/       # Reports & analytics
│   │   ├── audit/         # Audit logs
│   │   ├── files/         # File management
│   │   ├── ai/            # AI integration
│   │   └── prisma/        # Prisma service
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── Dockerfile
│   └── package.json
│
├── ai/                     # FastAPI AI service
│   ├── app/
│   │   ├── routers/       # API routers
│   │   ├── models/        # Pydantic models
│   │   ├── services/      # Business logic
│   │   └── ml/            # ML models
│   ├── tests/             # Pytest tests
│   ├── Dockerfile
│   └── requirements.txt
│
├── docs/                   # Documentation
│   ├── architecture.md    # System architecture
│   ├── api-reference.md   # API documentation
│   ├── deployment.md      # Deployment guide
│   └── user-manual.md     # User guide
│
├── config/                 # Configuration files
│
├── docker-compose.yml      # Docker orchestration
├── .env.example            # Environment variables template
└── README.md               # This file
```

---

## 🚦 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for AI service development)
- PostgreSQL 15+ (if running without Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medisync
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose** (Recommended)
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Backend API (port 3000)
   - AI Service (port 8000)
   - Frontend (port 5173)
   - Traefik Dashboard (port 8080)

4. **Initialize the database**
   ```bash
   docker-compose exec server npm run prisma:migrate
   docker-compose exec server npm run prisma:seed
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs
   - AI Service: http://localhost:8000
   - AI Docs: http://localhost:8000/docs

---

## 🔧 Development Setup

### Backend Development

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

### Frontend Development

```bash
cd client
npm install
npm run dev
```

### AI Service Development

```bash
cd ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📊 Database Schema

The system uses PostgreSQL with Prisma ORM. Key models include:

- **User, Role, Permission** - Authentication & authorization
- **Patient** - Patient records
- **Doctor, Specialty, DoctorSchedule** - Doctor management
- **Appointment, AppointmentHistory** - Appointment system
- **MedicalRecord** - Medical history
- **Medication, PharmacyStock, PharmacyMovement** - Pharmacy
- **LabOrder, LabResult** - Laboratory
- **Invoice, InvoiceItem, Payment** - Billing
- **Attendance** - Staff attendance
- **Notification** - Notifications
- **AuditLog** - Audit trail
- **FileStorage** - File management

**Total: 25+ models with complete relations**

### Database Migrations

```bash
# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npm run prisma:studio
```

---

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # E2E tests
```

### Frontend Tests
```bash
cd client
npm test
```

### AI Service Tests
```bash
cd ai
pytest
pytest --cov           # With coverage
```

---

## 📚 API Documentation

### Swagger/OpenAPI

Access interactive API documentation at:
- **Backend**: http://localhost:3000/api/docs
- **AI Service**: http://localhost:8000/docs

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

#### Patients
- `GET /api/v1/patients` - List patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/:id` - Get patient details
- `PATCH /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient

#### Appointments
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Create appointment
- `PATCH /api/v1/appointments/:id/status` - Update status
- `POST /api/v1/appointments/:id/reschedule` - Reschedule

#### AI Endpoints
- `POST /api/v1/ai/triage` - AI triage prediction
- `POST /api/v1/ai/summarize` - Clinical summary
- `POST /api/v1/ai/pharmacy/demand` - Demand prediction

*(See full API documentation in Swagger)*

---

## 🔐 Security

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Token expiration and refresh
- HTTP-only cookies (optional)

### Authorization
- Role-Based Access Control (RBAC)
- Granular permissions per resource
- Route guards and decorators

### Data Protection
- Input validation (class-validator)
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration
- Rate limiting

### Audit Trail
- Complete action logging
- User activity tracking
- Change history (before/after)
- IP address and user agent logging

---

## 🚀 Deployment

### Production Build

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Critical environment variables for production:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/medisync

# JWT
JWT_SECRET=<strong-secret-key>
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Deployment Platforms

- **Docker**: Use docker-compose.prod.yml
- **Kubernetes**: Helm charts available in `/k8s`
- **Cloud**: AWS, GCP, Azure compatible
- **VPS**: Deploy on any VPS with Docker

---

## 📈 Monitoring & Logging

### Logging
- Winston logger with daily rotation
- Log levels: error, warn, info, debug
- Structured JSON logs
- Request/response logging

### Health Checks
- `GET /health` - Application health
- Docker health checks configured
- Database connection monitoring

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👥 Team

**MediSync Development Team**

---

## 📞 Support

For support and questions:
- Email: support@medisync.com
- Documentation: https://docs.medisync.com
- Issues: GitHub Issues

---

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Core modules (Patients, Doctors, Appointments)
- ✅ Pharmacy and Laboratory
- ✅ Billing and Invoicing
- ✅ AI Triage
- ✅ RBAC and Audit Logs

### Version 1.1 (Next 3 months)
- 📅 Telemedicine integration
- 📅 Mobile app (React Native)
- 📅 Advanced reporting
- 📅 Email/SMS notifications
- 📅 Multi-language support

### Version 2.0 (6 months)
- 📅 AI-powered diagnosis assistance
- 📅 Integration with medical devices
- 📅 Advanced analytics dashboard
- 📅 Multi-hospital support
- 📅 FHIR compliance

---

## 🙏 Acknowledgments

Built with ❤️ using modern technologies:
- NestJS
- React
- FastAPI
- Prisma
- PostgreSQL
- Docker

---

**Made with 💙 by the MediSync Team**
