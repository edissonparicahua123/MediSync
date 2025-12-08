# MediSync Enterprise - Setup Script
# Run this script to install all dependencies

Write-Host "🏥 MediSync Enterprise - Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Install Backend Dependencies
Write-Host "📦 Installing Backend (NestJS) dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green
Write-Host ""

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
Write-Host "✅ Prisma Client generated!" -ForegroundColor Green
Write-Host ""

# Install Frontend Dependencies
Write-Host "📦 Installing Frontend (React) dependencies..." -ForegroundColor Yellow
Set-Location ../client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed!" -ForegroundColor Green
Write-Host ""

# Install AI Service Dependencies
Write-Host "📦 Installing AI Service (FastAPI) dependencies..." -ForegroundColor Yellow
Set-Location ../ai
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AI Service installation failed!" -ForegroundColor Red
    exit 1
}
deactivate
Write-Host "✅ AI Service dependencies installed!" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host "🎉 All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy .env.example to .env and configure" -ForegroundColor White
Write-Host "2. Run: docker-compose up -d (for database)" -ForegroundColor White
Write-Host "3. Run: cd server && npm run prisma:migrate" -ForegroundColor White
Write-Host "4. Run: cd server && npm run prisma:seed" -ForegroundColor White
Write-Host "5. Run: cd server && npm run start:dev" -ForegroundColor White
Write-Host "6. Run: cd client && npm run dev" -ForegroundColor White
Write-Host ""
