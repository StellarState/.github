# Development Setup Guide

Complete guide to setting up your local development environment for StellarSettle.

## 📋 Prerequisites

### Required Software

- **Git**: 2.40+
- **Node.js**: 22.x LTS ([Download](https://nodejs.org))
- **Rust**: 1.83+ ([Install](https://rustup.rs))
- **PostgreSQL**: 17+ ([Download](https://www.postgresql.org/download/))
- **Code Editor**: VS Code recommended

### Recommended Tools

- **Docker**: For PostgreSQL (optional)
- **Postman/Insomnia**: API testing
- **pgAdmin**: PostgreSQL GUI
- **Freighter Wallet**: Browser extension for Stellar

## 🚀 Repository Setup

### 1. Smart Contracts (stellarsettle-contracts)
```bash
# Clone the repository
git clone https://github.com/StellarState/SS-contracts
cd SS-contracts

# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Soroban CLI
cargo install --locked soroban-cli --features opt

# Add wasm target
rustup target add wasm32-unknown-unknown

# Build all contracts
soroban contract build

# Run tests
cargo test

# You should see: "test result: ok"
```

**Verify installation:**
```bash
soroban --version  # Should show version 21.0.0+
rustc --version    # Should show 1.83.0+
cargo --version    # Should show 1.83.0+
```

### 2. Backend API (stellarsettle-api)
```bash
# Clone the repository
git clone https://github.com/StellarState/SS-backend
cd SS-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Configure .env:**
```env
# Server
PORT=3000
NODE_ENV=development

# Database (local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/stellarsettle

# Stellar
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Get a testnet keypair from: https://laboratory.stellar.org/#account-creator
PLATFORM_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Smart Contracts (deploy contracts first, then add IDs here)
ESCROW_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TOKEN_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# IPFS (Pinata - get free account at https://pinata.cloud)
IPFS_API_URL=https://api.pinata.cloud
IPFS_JWT=your_pinata_jwt_token

# JWT (generate a random secret)
JWT_SECRET=your-super-secret-random-string-at-least-32-characters
JWT_EXPIRES_IN=7d

# Email (SendGrid - optional for development)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=noreply@stellarsettle.com
```

**Set up database:**

Option A - Local PostgreSQL:
```bash
# Create database
createdb stellarsettle

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

Option B - Docker:
```bash
# Start PostgreSQL container
docker run --name stellarsettle-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=stellarsettle \
  -p 5432:5432 \
  -d postgres:17

# Run migrations
npx prisma migrate dev
```

**Start development server:**
```bash
npm run dev

# You should see: "🚀 InvoiceFlow API running on port 3000"
```

**Verify installation:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Frontend App (stellarsettle-app)
```bash
# Clone the repository
git clone https://github.com/stellarsettle/stellarsettle-app.git
cd stellarsettle-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Configure .env.local:**
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Smart Contracts (same as backend)
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_TOKEN_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

**Start development server:**
```bash
npm run dev

# You should see: "▲ Next.js 15.0.0"
# Open: http://localhost:3000
```

**Install Freighter Wallet:**
1. Go to [freighter.app](https://www.freighter.app/)
2. Install browser extension
3. Create testnet account
4. Fund from [Stellar Friendbot](https://laboratory.stellar.org/#account-creator)

## 🔧 Common Development Tasks

### Deploy Smart Contracts to Testnet
```bash
cd stellarsettle-contracts

# Build contracts
soroban contract build

# Deploy invoice-escrow contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/invoice_escrow.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet

# Copy the returned contract ID to .env files

# Initialize contract
soroban contract invoke \
  --id CONTRACT_ID \
  --source YOUR_SECRET_KEY \
  --network testnet \
  -- initialize \
  --admin YOUR_PUBLIC_KEY \
  --platform_fee_bps 300
```

### Run All Tests
```bash
# Smart contracts
cd stellarsettle-contracts
cargo test

# Backend
cd stellarsettle-api
npm test
npm run test:coverage

# Frontend
cd stellarsettle-app
npm test
npm run test:e2e
```

### Database Operations
```bash
cd stellarsettle-api

# Create new migration
npx prisma migrate dev --name add_new_field

# Reset database
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate
```

### Code Quality Checks
```bash
# Backend
npm run lint            # ESLint
npm run type-check      # TypeScript
npm run format          # Prettier

# Frontend
npm run lint
npm run type-check
npm run format

# Contracts
cargo fmt              # Format Rust code
cargo clippy           # Lint Rust code
```

## 🐛 Troubleshooting

### "Soroban command not found"
```bash
# Reinstall Soroban CLI
cargo install --locked --force soroban-cli --features opt

# Add to PATH (if needed)
export PATH="$HOME/.cargo/bin:$PATH"
```

### "Database connection refused"
```bash
# Check PostgreSQL is running
pg_isready

# If not running:
brew services start postgresql@17  # macOS
sudo systemctl start postgresql    # Linux
```

### "Cannot connect to Horizon"
```bash
# Test Horizon API
curl https://horizon-testnet.stellar.org/

# If down, check status: https://status.stellar.org
```

### "Freighter not detected"

1. Ensure Freighter extension is installed
2. Refresh the page
3. Check browser console for errors
4. Try a different browser

### "JWT token invalid"

- Check JWT_SECRET matches between .env files
- Ensure token hasn't expired (default 7 days)
- Clear browser storage and re-login

### "Contract not found"

- Verify CONTRACT_ID in .env files
- Ensure contract is deployed to testnet
- Check you're on the right network (testnet vs mainnet)

## 📚 Development Workflow

### Starting a New Feature
```bash
# 1. Update your main branch
git checkout main
git pull upstream main

# 2. Create feature branch
git checkout -b feature/invoice-upload

# 3. Make changes, commit often
git add .
git commit -m "feat(invoices): add upload endpoint"

# 4. Push to your fork
git push origin feature/invoice-upload

# 5. Create PR on GitHub
```

### Before Committing
```bash
# Run these checks
npm run lint
npm run type-check
npm test

# Or use git hooks (recommended)
npx husky install
```

### Hot Reloading

All repos have hot reloading enabled:
- **Contracts**: Re-run `cargo test` after changes
- **Backend**: Nodemon auto-restarts on file changes
- **Frontend**: Next.js Fast Refresh updates instantly

## 🧪 Testing Workflow

### Unit Tests
```bash
# Contracts
cargo test --package invoice-escrow

# Backend
npm test -- invoice.service.test.ts

# Frontend
npm test -- InvoiceCard.test.tsx
```

### Integration Tests
```bash
# Backend (uses test database)
npm run test:integration

# Frontend E2E
npm run test:e2e
```

### Manual Testing

1. **Start all services:**
```bash
   # Terminal 1: Backend
   cd stellarsettle-api && npm run dev
   
   # Terminal 2: Frontend
   cd stellarsettle-app && npm run dev
```

2. **Test flow:**
   - Open http://localhost:3000
   - Connect Freighter wallet
   - Upload test invoice
   - Publish to marketplace
   - Invest in invoice (switch accounts)
   - Record payment

3. **Check logs:**
   - Backend: Terminal 1 output
   - Frontend: Browser console
   - Database: `npx prisma studio`

## 🔐 Security Best Practices

### Never Commit

- `.env` files (use `.env.example`)
- Secret keys or passwords
- API tokens
- Database credentials

### Use Environment Variables
```typescript
// ❌ Bad
const apiKey = "sk_live_12345";

// ✅ Good
const apiKey = process.env.API_KEY;
```

### Validate All Inputs
```typescript
// Always validate before using
const schema = z.object({
  amount: z.number().positive(),
  dueDate: z.date().min(new Date())
});

const result = schema.safeParse(input);
```

## 📦 Useful Commands Cheat Sheet

### Contracts
```bash
cargo build                    # Build all contracts
cargo test                                # Run tests
cargo fmt                                 # Format code
cargo clippy                              # Lint code
soroban contract deploy --wasm ... --network testnet
```

### Backend
```bash
npm run dev                               # Start dev server
npm test                                  # Run tests
npm run lint                              # Lint code
npm run type-check                        # TypeScript check
npx prisma migrate dev                    # Create migration
npx prisma studio                         # Open DB GUI
```

### Frontend
```bash
npm run dev                               # Start dev server
npm test                                  # Run tests
npm run build                             # Production build
npm run lint                              # Lint code
npx shadcn@latest add button              # Add UI component
```

## 🎓 Learning Resources

### Stellar Development
- [Stellar Documentation](https://developers.stellar.org)
- [Soroban Docs](https://soroban.stellar.org)
- [Stellar Laboratory](https://laboratory.stellar.org)

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TailwindCSS](https://tailwindcss.com/docs)

### Backend
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express 5 Docs](https://expressjs.com)

## ❓ Getting Help

1. **Check documentation** (this file, README, ARCHITECTURE)
2. **Search closed issues** on GitHub
3. **Ask in Discord** #help channel
4. **Create an issue** with details

---

**Ready to contribute? Pick an issue and start coding!** 🚀