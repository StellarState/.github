# StellarSettle Architecture

## 📐 System Overview

StellarSettle is a decentralized invoice financing platform built on three main pillars:
```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Sellers    │  │  Investors   │  │   Admins     │          │
│  │  (Invoice    │  │  (Liquidity  │  │ (Platform    │          │
│  │   Issuers)   │  │  Providers)  │  │  Operators)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                  (Next.js 15 / React 19)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Seller Dashboard    • Investor Dashboard              │  │
│  │  • Marketplace         • Wallet Integration (Freighter)  │  │
│  │  • Invoice Upload      • Investment Flow                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / REST API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                (Node.js 22 / TypeScript / Express 5)            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers     Services         Middleware             │  │
│  │  • Auth          • Invoice        • JWT Auth             │  │
│  │  • Invoice       • Investment     • Validation           │  │
│  │  • Investment    • Stellar        • Rate Limiting        │  │
│  │  • Marketplace   • IPFS           • Error Handling       │  │
│  │  • Dashboard     • OCR            • Logging              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬───────────────────────┬────────────────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────────────────────────────┐
│  DATA LAYER     │    │       BLOCKCHAIN LAYER                   │
│  (PostgreSQL)   │    │   (Stellar / Soroban Smart Contracts)    │
│                 │    │  ┌────────────────────────────────────┐  │
│  • Users        │    │  │  Invoice Escrow Contract           │  │
│  • Invoices     │    │  │  • Create escrow                   │  │
│  • Investments  │    │  │  • Fund escrow                     │  │
│  • Transactions │    │  │  • Record payment                  │  │
│  • KYC Data     │    │  │  • Distribute funds                │  │
│  • Notifications│    │  └────────────────────────────────────┘  │
│                 │    │  ┌────────────────────────────────────┐  │
└─────────────────┘    │  │  Invoice Token Contract (SEP-41)   │  │
                       │  │  • Mint tokens                     │  │
                       │  │  • Transfer tokens                 │  │
                       │  │  • Burn tokens                     │  │
                       │  └────────────────────────────────────┘  │
                       │  ┌────────────────────────────────────┐  │
                       │  │  Payment Distributor Contract      │  │
                       │  │  • Calculate distribution          │  │
                       │  │  • Distribute to holders           │  │
                       │  │  • Track payments                  │  │
                       │  └────────────────────────────────────┘  │
                       └──────────────────────────────────────────┘
                                         │
                                         ▼
                       ┌──────────────────────────────────────────┐
                       │     STORAGE LAYER (IPFS / Pinata)        │
                       │  • Invoice Documents (PDFs)              │
                       │  • Supporting Documents                  │
                       │  • Verification Records                  │
                       └──────────────────────────────────────────┘
```

## 🔄 Core Workflows

### Workflow 1: Invoice Creation & Publishing
```
Seller                  Frontend              Backend API           Smart Contract        IPFS
  │                        │                      │                       │                │
  │──Upload Invoice PDF────▶│                      │                       │                │
  │                        │──POST /invoices──────▶│                       │                │
  │                        │                      │──Extract data (OCR)   │                │
  │                        │                      │──Upload document──────▶│                │
  │                        │                      │◀──Return IPFS hash────│                │
  │                        │                      │──Create DB record     │                │
  │                        │                      │──Create escrow────────▶│                │
  │                        │                      │                       │ create_escrow()│
  │                        │                      │                       │ emit event     │
  │                        │                      │◀──Contract ID─────────│                │
  │                        │◀──Invoice created────│                       │                │
  │◀──Show success─────────│                      │                       │                │
  │                        │                      │                       │                │
  │──Publish to market─────▶│──POST /publish───────▶│──Update status      │                │
  │                        │◀──Published──────────│                       │                │
  │◀──Invoice listed───────│                      │                       │                │
```

### Workflow 2: Investment Flow
```
Investor                Frontend              Backend API           Smart Contract        Seller
  │                        │                      │                       │                │
  │──Browse marketplace────▶│──GET /marketplace────▶│                       │                │
  │◀──List invoices────────│◀──Invoice list───────│                       │                │
  │                        │                      │                       │                │
  │──Click invest──────────▶│──Show calculator     │                       │                │
  │──Enter amount──────────▶│──POST /invest────────▶│──Validate amount    │                │
  │                        │                      │──Build transaction    │                │
  │                        │◀──Transaction XDR────│                       │                │
  │──Sign with wallet──────▶│──Sign via Freighter  │                       │                │
  │                        │──Submit tx───────────▶│──Submit to Stellar───▶│                │
  │                        │                      │                       │ fund_escrow()  │
  │                        │                      │                       │ transfer USDC  │
  │                        │                      │                       │ emit event     │
  │                        │                      │◀──Tx confirmed────────│                │
  │                        │                      │──Create investment    │                │
  │                        │                      │──Notify seller────────┼───────────────▶│
  │◀──Investment success───│◀──Success response───│                       │                │
```

### Workflow 3: Payment & Settlement
```
Customer               Seller                Backend API           Smart Contract        Investor
  │                      │                        │                       │                │
  │──Pay invoice────────▶│                        │                       │                │
  │                      │──Record payment───────▶│──Verify payment       │                │
  │                      │                        │──Record on-chain──────▶│                │
  │                      │                        │                       │record_payment()│
  │                      │                        │                       │calculate fees  │
  │                      │                        │                       │distribute funds│
  │                      │                        │                       │                │
  │                      │                        │                       │──Pay investor──▶│
  │                      │                        │                       │──Pay platform──▶│
  │                      │                        │◀──Settlement done─────│                │
  │                      │                        │──Update DB status     │                │
  │                      │                        │──Notify parties───────┼───────────────▶│
  │                      │◀──Payment confirmed────│                       │                │
```

## 🏗️ Component Architecture

### Frontend Architecture (Next.js 15)
```
app/
├── (auth)/
│   └── login/
│       └── page.tsx              # Wallet connection page
│
├── (dashboard)/
│   ├── layout.tsx                # Protected layout with sidebar
│   ├── seller/
│   │   ├── page.tsx              # Seller overview dashboard
│   │   ├── invoices/
│   │   │   ├── page.tsx          # Invoice list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create invoice form
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Invoice details
│   │   └── analytics/
│   │       └── page.tsx          # Seller analytics
│   │
│   └── investor/
│       ├── page.tsx              # Investor overview
│       ├── portfolio/
│       │   ├── page.tsx          # Investment portfolio
│       │   └── [id]/
│       │       └── page.tsx      # Investment details
│       └── analytics/
│           └── page.tsx          # Investor analytics
│
├── marketplace/
│   ├── page.tsx                  # Browse invoices
│   └── [id]/
│       └── page.tsx              # Invoice details + invest
│
└── api/                          # API routes (if needed for BFF pattern)
    └── webhooks/
        └── route.ts              # Stellar event webhooks

components/
├── ui/                           # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   └── ... (30+ components)
│
├── layout/
│   ├── Header.tsx                # Top navigation
│   ├── Sidebar.tsx               # Dashboard sidebar
│   └── Footer.tsx                # Footer
│
├── wallet/
│   ├── WalletButton.tsx          # Connect/disconnect wallet
│   ├── WalletProvider.tsx        # Wallet context provider
│   └── TransactionModal.tsx      # Sign transaction UI
│
├── invoices/
│   ├── InvoiceCard.tsx           # Invoice preview card
│   ├── InvoiceForm.tsx           # Create/edit form
│   ├── InvoiceTable.tsx          # Invoices table
│   └── InvoiceUpload.tsx         # PDF upload component
│
├── marketplace/
│   ├── InvoiceGrid.tsx           # Grid of available invoices
│   ├── FilterPanel.tsx           # Filters sidebar
│   ├── InvestmentCalculator.tsx  # Calculate returns
│   └── InvestmentModal.tsx       # Invest flow modal
│
└── dashboard/
    ├── StatCard.tsx              # KPI card component
    ├── RevenueChart.tsx          # Revenue visualization
    ├── PortfolioChart.tsx        # Portfolio breakdown
    └── ActivityFeed.tsx          # Recent activity

lib/
├── stellar/
│   ├── client.ts                 # Stellar server instance
│   ├── wallet.ts                 # Wallet operations
│   ├── contracts.ts              # Contract invocation helpers
│   └── transactions.ts           # Transaction builders
│
├── api/
│   ├── client.ts                 # Axios instance
│   ├── endpoints.ts              # Typed API calls
│   └── types.ts                  # API response types
│
└── utils/
    ├── formatters.ts             # Currency, date formatters
    ├── validators.ts             # Client-side validation
    └── cn.ts                     # className utility

hooks/
├── useStellarWallet.ts           # Wallet state & actions
├── useInvoices.ts                # Invoice queries & mutations
├── useInvestments.ts             # Investment queries
└── useMarketplace.ts             # Marketplace data
```

### Backend Architecture (Node.js 22)
```
src/
├── config/
│   ├── database.ts               # Prisma client setup
│   ├── env.ts                    # Environment validation
│   ├── stellar.ts                # Stellar SDK config
│   └── cors.ts                   # CORS configuration
│
├── controllers/
│   ├── auth.controller.ts        # Wallet login, JWT refresh
│   ├── invoice.controller.ts     # CRUD + publish
│   ├── investment.controller.ts  # Create, list investments
│   ├── marketplace.controller.ts # Browse, filter invoices
│   └── dashboard.controller.ts   # Analytics endpoints
│
├── services/
│   ├── invoice.service.ts
│   │   ├── create()              # Create invoice + IPFS upload
│   │   ├── publish()             # Publish to marketplace
│   │   ├── recordPayment()       # Record payment from customer
│   │   └── calculate risk()      # Risk scoring algorithm
│   │
│   ├── investment.service.ts
│   │   ├── createInvestment()    # Process investment
│   │   ├── calculateReturns()    # Expected vs actual returns
│   │   └── settleInvestment()    # Settlement after payment
│   │
│   ├── stellar.service.ts
│   │   ├── createEscrow()        # Call escrow contract
│   │   ├── fundEscrow()          # Call fund_escrow
│   │   ├── recordPayment()       # Call record_payment
│   │   ├── buildTransaction()    # Build Stellar tx
│   │   └── submitTransaction()   # Submit to Horizon
│   │
│   ├── ipfs.service.ts
│   │   ├── upload()              # Upload to Pinata
│   │   ├── retrieve()            # Get from IPFS
│   │   └── pin()                 # Pin document
│   │
│   ├── ocr.service.ts
│   │   ├── extractData()         # Extract from PDF
│   │   └── validateData()        # Validate extracted data
│   │
│   └── notification.service.ts
│       ├── sendEmail()           # Email via SendGrid
│       └── createNotification()  # In-app notification
│
├── middleware/
│   ├── auth.middleware.ts
│   │   ├── authenticateJWT()     # Verify JWT token
│   │   └── requireRole()         # Role-based access
│   │
│   ├── validate.middleware.ts
│   │   └── validateRequest()     # Joi validation
│   │
│   ├── error.middleware.ts
│   │   ├── errorHandler()        # Global error handler
│   │   └── notFoundHandler()     # 404 handler
│   │
│   ├── rateLimit.middleware.ts
│   │   ├── apiLimiter()          # General rate limit
│   │   └── authLimiter()         # Auth endpoint limit
│   │
│   └── upload.middleware.ts
│       └── multerConfig()        # File upload config
│
├── routes/
│   ├── index.ts                  # Mount all routes
│   ├── auth.routes.ts
│   ├── invoice.routes.ts
│   ├── investment.routes.ts
│   ├── marketplace.routes.ts
│   └── dashboard.routes.ts
│
├── utils/
│   ├── logger.ts                 # Winston logger
│   ├── stellar.util.ts           # Stellar helpers
│   ├── crypto.util.ts            # JWT, hashing
│   └── response.util.ts          # Response formatters
│
├── types/
│   ├── custom.d.ts               # Express type extensions
│   ├── validation.schemas.ts     # Joi schemas
│   └── index.ts                  # Exported types
│
├── app.ts                        # Express app factory
└── index.ts                      # Server entry point

prisma/
├── schema.prisma                 # Database schema
├── migrations/                   # Migration files
└── seed.ts                       # Seed data
```

### Smart Contract Architecture (Soroban/Rust)
```
contracts/
├── invoice-escrow/
│   ├── src/
│   │   ├── lib.rs                # Main contract
│   │   │   ├── initialize()      # Set admin, fees
│   │   │   ├── create_escrow()   # Create new escrow
│   │   │   ├── fund_escrow()     # Investor funds escrow
│   │   │   ├── record_payment()  # Record customer payment
│   │   │   ├── distribute()      # Distribute to investor
│   │   │   └── refund()          # Refund if unpaid
│   │   │
│   │   ├── types.rs
│   │   │   ├── InvoiceData       # Escrow data structure
│   │   │   ├── EscrowStatus      # Status enum
│   │   │   └── PaymentRecord     # Payment info
│   │   │
│   │   ├── errors.rs
│   │   │   └── Error             # Custom error enum
│   │   │
│   │   ├── storage.rs
│   │   │   ├── get_invoice()     # Retrieve escrow
│   │   │   ├── set_invoice()     # Store escrow
│   │   │   └── storage keys      # Key helpers
│   │   │
│   │   └── events.rs
│   │       ├── EscrowCreated     # Event types
│   │       ├── EscrowFunded
│   │       └── PaymentSettled
│   │
│   ├── Cargo.toml
│   └── README.md
│
├── invoice-token/
│   ├── src/
│   │   ├── lib.rs                # SEP-41 token contract
│   │   │   ├── name()            # Token name
│   │   │   ├── symbol()          # Token symbol
│   │   │   ├── decimals()        # Token decimals
│   │   │   ├── total_supply()    # Total supply
│   │   │   ├── balance()         # Get balance
│   │   │   ├── transfer()        # Transfer tokens
│   │   │   ├── mint()            # Mint new tokens
│   │   │   ├── burn()            # Burn tokens
│   │   │   ├── approve()         # Approve allowance
│   │   │   └── transfer_from()   # Transfer from allowance
│   │   │
│   │   ├── types.rs
│   │   │   ├── TokenMetadata     # Token info
│   │   │   └── Allowance         # Allowance record
│   │   │
│   │   ├── errors.rs
│   │   ├── storage.rs
│   │   └── events.rs
│   │
│   ├── Cargo.toml
│   └── README.md
│
└── payment-distributor/
    ├── src/
    │   ├── lib.rs                # Distribution contract
    │   │   ├── record_payment()  # Record payment
    │   │   ├── calculate_dist()  # Calculate distribution
    │   │   ├── distribute()      # Distribute to holders
    │   │   └── get_payment()     # Query payment status
    │   │
    │   ├── types.rs
    │   │   ├── Payment           # Payment record
    │   │   └── Distribution      # Distribution record
    │   │
    │   ├── calculations.rs       # Distribution math
    │   ├── errors.rs
    │   ├── storage.rs
    │   └── events.rs
    │
    ├── Cargo.toml
    └── README.md
```

## 🔒 Security Architecture

### Authentication Flow
```
1. User connects Freighter wallet
2. Frontend requests challenge message from backend
3. User signs challenge with private key
4. Backend verifies signature using public key
5. Backend issues JWT token (7-day expiry)
6. Frontend stores JWT in memory (not localStorage for security)
7. All API requests include JWT in Authorization header
8. Backend validates JWT on each request
9. Refresh token flow before expiry
```

### Authorization Layers
```
┌─────────────────────────────────────────────┐
│  Route Level (Middleware)                   │
│  • Public routes (marketplace, docs)        │
│  • Protected routes (dashboard)             │
│  • Admin routes (platform management)       │
└────────────────┬────────────────────────────┘
                 │
┌────────────────┴────────────────────────────┐
│  Resource Level (Service Layer)             │
│  • User can only edit own invoices          │
│  • Investor can only view own investments   │
│  • Admin can view all resources             │
└────────────────┬────────────────────────────┘
                 │
┌────────────────┴────────────────────────────┐
│  Smart Contract Level                       │
│  • Only invoice seller can publish          │
│  • Only investor can fund escrow            │
│  • Only platform can record payment         │
│  • Time-locks on critical operations        │
└─────────────────────────────────────────────┘
```

### Data Protection

- **At Rest**: PostgreSQL encryption, IPFS encrypted documents
- **In Transit**: HTTPS only, TLS 1.3+
- **Sensitive Data**: Hashed passwords, encrypted KYC documents
- **PII**: Minimal collection, GDPR compliant, right to deletion
- **API Keys**: Environment variables, never committed, rotated regularly

## 📊 Data Flow Diagrams

### Invoice Creation Data Flow
```
User Input          Validation        Storage           Blockchain
    │                   │                │                  │
    │ Upload PDF        │                │                  │
    ├──────────────────▶│ File type     │                  │
    │                   │ Size limit     │                  │
    │                   │ Scan malware   │                  │
    │                   ├───────────────▶│ Upload to IPFS   │
    │                   │                │ Get hash         │
    │                   │◀───────────────┤                  │
    │                   │                │                  │
    │ Form data         │                │                  │
    ├──────────────────▶│ Joi schema    │                  │
    │                   │ Business rules │                  │
    │                   ├───────────────▶│ Insert to DB     │
    │                   │                │ Generate ID      │
    │                   │◀───────────────┤                  │
    │                   │                │                  │
    │                   │ Build tx       │                  │
    │                   ├───────────────────────────────────▶│
    │                   │                │                  │ Create escrow
    │                   │                │                  │ Emit event
    │                   │◀───────────────────────────────────┤
    │                   │                │ Update contract  │
    │                   │                │ ID in DB         │
    │                   ├───────────────▶│                  │
    │◀──────────────────┤                │                  │
    │ Invoice created   │                │                  │
```

## 🔄 State Management

### Frontend State (React Query)
```typescript
// Server State (cached, synced with backend)
const invoices = useQuery(['invoices'], fetchInvoices, {
  staleTime: 60000,      // Consider fresh for 1 minute
  cacheTime: 300000,     // Keep in cache for 5 minutes
  refetchOnWindowFocus: true,
  retry: 3
});

// Local UI State (component-specific)
const [isModalOpen, setIsModalOpen] = useState(false);

// Global State (wallet connection)
const { publicKey, connect } = useWallet();

// Form State (React Hook Form)
const { register, handleSubmit } = useForm();
```

### Backend State (Database + Cache)
```typescript
// Persistent State (PostgreSQL via Prisma)
await prisma.invoice.create({ data: invoiceData });

// Cached State (Redis - optional for scaling)
await redis.set(`invoice:${id}`, JSON.stringify(invoice), 'EX', 3600);

// Session State (JWT payload)
const token = jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
```

### Smart Contract State (Soroban Storage)
```rust
// Instance Storage (contract-level, persistent)
env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);

// Persistent Storage (long-lived data)
env.storage().persistent().set(&invoice_id, &invoice_data);

// Temporary Storage (cache, expires)
env.storage().temporary().set(&key, &value);
```

## 🚀 Deployment Architecture

### Production Environment
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                   (Cloudflare CDN)                      │
└────────────┬─────────────────────┬──────────────────────┘
             │                     │
             ▼                     ▼
┌─────────────────────┐  ┌─────────────────────────────┐
│  Frontend           │  │  Backend API                │
│                     │  │                             │
│  • Next.js app      │  │  • Node.js servers (3x)     │
│  • Edge functions   │  │  • Auto-scaling             │
│  • Static assets    │  │  • Health checks            │
└─────────────────────┘  └────────┬────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
         ┌──────────────────┐        ┌──────────────────┐
         │  Database        │        │  Stellar Network │
         │  (PostgreSQL)    │        │  (Mainnet)       │
         │  • Primary       │        │  • Horizon API   │
         │  • Read replica  │        │  • Contracts     │
         │  • Backups       │        │  • Validators    │
         └──────────────────┘        └──────────────────┘
```

### CI/CD Pipeline
```
Git Push → GitHub Actions
    │
    ├──▶ Run Tests
    │     ├─ Unit tests
    │     ├─ Integration tests
    │     └─ E2E tests
    │
    ├──▶ Code Quality
    │     ├─ ESLint / Clippy
    │     ├─ TypeScript check
    │     └─ Security scan
    │
    ├──▶ Build
    │     ├─ Compile contracts
    │     ├─ Build backend
    │     └─ Build frontend
    │
    └──▶ Deploy
          ├─ Contracts → Stellar (manual approval)
          ├─ Backend → Railway
          └─ Frontend → Vercel
```

## 📈 Scalability Considerations

### Database Scaling

- **Read replicas** for analytics queries
- **Connection pooling** (max 100 connections)
- **Indexing** on frequently queried columns
- **Partitioning** invoices table by date (future)
- **Archiving** settled invoices >1 year old

### API Scaling

- **Horizontal scaling** with load balancer
- **Caching** with Redis for frequent queries
- **Rate limiting** per user/IP
- **Async processing** for heavy tasks (OCR, email)
- **Message queue** (Bull/BullMQ) for background jobs

### Smart Contract Optimization

- **Gas optimization** in Soroban contracts
- **Batch operations** where possible
- **Minimal storage** usage
- **Event emission** for off-chain indexing
- **Upgrade patterns** for future improvements

## 🔍 Monitoring & Observability

### Metrics to Track
```
Application Metrics:
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Throughput (requests/second)
- Database query time
- API endpoint usage

Business Metrics:
- Invoices created per day
- Investment volume
- Settlement success rate
- Average discount rate
- User retention

Blockchain Metrics:
- Transaction success rate
- Gas costs
- Contract call latency
- Failed transactions
```

### Logging Strategy
```
Frontend:
- User actions (clicks, navigations)
- Errors with stack traces
- Performance metrics

Backend:
- HTTP request logs
- Database queries (slow queries)
- External API calls
- Error logs with context

Smart Contracts:
- Contract invocations
- State changes
- Error events
```

## 🛠️ Technology Decisions

### Why Stellar/Soroban?

- **Low fees**: $0.00001 per transaction vs $1-50 on Ethereum
- **Fast finality**: 3-5 seconds vs minutes
- **Built for payments**: Native multi-asset support
- **Mature ecosystem**: 10+ years, proven at scale
- **Compliance-friendly**: Built-in features for regulation

### Why Next.js 15?

- **React 19**: Latest features (Server Components, Actions)
- **Performance**: Turbopack, automatic optimizations
- **SEO**: Server-side rendering out of the box
- **Developer experience**: Hot reload, TypeScript support
- **Production ready**: Used by Vercel, Netflix, TikTok

### Why Prisma over TypeORM?

- **Better TypeScript support**: Auto-generated types
- **Migrations**: Easier to manage
- **Performance**: Query optimization
- **Developer experience**: Prisma Studio
- **Modern**: Active development, growing ecosystem

### Why PostgreSQL?

- **ACID compliance**: Data integrity
- **JSON support**: Flexible schema where needed
- **Performance**: Excellent for read-heavy workloads
- **Mature**: 30+ years of development
- **Free & open source**: No licensing costs

## 📚 Further Reading

- [Stellar Documentation](https://developers.stellar.org)
- [Soroban Smart Contracts](https://soroban.stellar.org)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Invoice Factoring Industry](https://www.investopedia.com/terms/f/factor.asp)

---

**Questions?** Open an issue or ask in Discord!