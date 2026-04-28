#!/bin/bash
# ============================================================
# College Ecosystem App - One-click Setup Script
# Run: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}  ╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}  ║   🎓 College Ecosystem App Setup      ║${NC}"
echo -e "${CYAN}  ╚═══════════════════════════════════════╝${NC}"
echo ""

# ── Check Node.js ─────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${YELLOW}⚠️  Node.js is not installed. Please install Node.js v18+ from https://nodejs.org${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
  echo -e "${YELLOW}⚠️  Node.js v16+ is required. Current version: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# ── Backend Setup ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}📦 Installing backend dependencies...${NC}"
cd backend
npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✅ Created backend/.env from .env.example${NC}"
  echo -e "${YELLOW}   ⚠️  Please update backend/.env with your MongoDB URI and JWT secret!${NC}"
fi

echo ""
echo -e "${CYAN}🌱 Seeding database with sample data...${NC}"
npm run seed || echo -e "${YELLOW}⚠️  Seeding skipped (MongoDB may not be running)${NC}"

cd ..

# ── Frontend Setup ─────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✅ Created frontend/.env from .env.example${NC}"
fi
cd ..

# ── Done! ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Setup complete! Start the app:${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Terminal 1 (Backend):${NC}"
echo -e "    cd backend && npm run dev"
echo ""
echo -e "  ${CYAN}Terminal 2 (Frontend):${NC}"
echo -e "    cd frontend && npm run dev"
echo ""
echo -e "  ${CYAN}🌐 App URL:${NC} http://localhost:5173"
echo -e "  ${CYAN}🔌 API URL:${NC} http://localhost:5000"
echo ""
echo -e "  ${YELLOW}Demo login: aryan@college.edu / password123${NC}"
echo ""
