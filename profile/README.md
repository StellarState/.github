<div align="center">
  <img src="./assets/logo.png" alt="StellarSettle Logo" width="200"/>
  
  # StellarSettle
  
  **Decentralized Invoice Financing on Stellar Blockchain**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  
</div>

## 🌍 The Problem

Small and medium businesses (SMBs) globally face a $5 trillion working capital gap. They issue invoices with 30-90 day payment terms but need cash immediately to operate. Traditional invoice factoring is expensive (15-30% fees), slow, and inaccessible to most SMBs, especially in emerging markets.

## 💡 Our Solution

StellarSettle is a decentralized invoice financing platform built on Stellar blockchain that:

- **For Businesses**: Get 80-95% of invoice value in USDC within minutes by tokenizing unpaid invoices
- **For Investors**: Earn 10-25% APY on short-term (30-90 day), asset-backed investments
- **For Everyone**: Transparent, low-fee (2-3% vs 15-30%), globally accessible invoice marketplace

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)            │
│  • Seller Dashboard  • Investor Dashboard          │
│  • Marketplace       • Wallet Integration          │
└─────────────────┬───────────────────────────────────┘
                  │ REST API
┌─────────────────┴───────────────────────────────────┐
│              Backend API (Node.js 22)               │
│  • Invoice Management  • Payment Processing         │
│  • User Auth           • IPFS Storage               │
└─────────────────┬───────────────────────────────────┘
                  │ Soroban Interactions
┌─────────────────┴───────────────────────────────────┐
│          Smart Contracts (Soroban/Stellar)          │
│  • Invoice Escrow  • Token Standard  • Distribution │
└─────────────────────────────────────────────────────┘
```

## 📁 Repository Structure

This project is organized into 3 main repositories:

| Repository | Description | Tech Stack |
|------------|-------------|------------|
| [stellarsettle-contracts](https://github.com/stellarsettle/stellarsettle-contracts) | Soroban smart contracts for escrow, tokenization, and settlement | Rust, Soroban SDK |
| [stellarsettle-api](https://github.com/stellarsettle/stellarsettle-api) | Backend API for invoice management and Stellar integration | Node.js 22, TypeScript, Prisma, Express 5 |
| [stellarsettle-app](https://github.com/stellarsettle/stellarsettle-app) | Web application for sellers and investors | Next.js 15, React 19, TailwindCSS 4 |

## 🚀 Quick Start for Contributors

### Prerequisites
- For contracts: Rust 1.83+, Soroban CLI
- For backend: Node.js 22+, PostgreSQL 17+
- For frontend: Node.js 22+
- Git, GitHub account

### Getting Started

1. **Read the docs**:
   - [Contributing Guide](./CONTRIBUTING.md) - **START HERE**
   - [Architecture Overview](./ARCHITECTURE.md)
   - [Development Setup](./DEVELOPMENT.md)
   - [Code of Conduct](./CODE_OF_CONDUCT.md)

2. **Find an issue**:
   - Browse [Good First Issues](https://github.com/issues?q=is%3Aopen+is%3Aissue+org%3Astellarsettle+label%3A%22good+first+issue%22)
   - Check the [Project Board](https://github.com/orgs/stellarsettle/projects/1)
   - Filter by difficulty: `label:difficulty:easy`, `label:difficulty:medium`, `label:difficulty:hard`

3. **Set up your environment**:
```bash
   # Clone the repo you want to work on
   git clone https://github.com/stellarsettle/stellarsettle-contracts.git
   cd stellarsettle-contracts
   
   # Follow setup instructions in DEVELOPMENT.md
```

4. **Join the community**:
   - Discord: [Join our server](https://discord.gg/stellarsettle) (Create this)
   - Weekly standups: Mondays 3pm UTC
   - Questions? Tag `@maintainers` in Discord

## 🎯 Project Roadmap

**Phase 1: Foundation (Month 1)**
- ✅ Project setup and documentation
- 🔄 Smart contract development
- 🔄 Core API endpoints
- 🔄 Basic frontend structure

**Phase 2: Core Features (Month 2)**
- ⏳ Invoice upload and tokenization
- ⏳ Marketplace functionality
- ⏳ Investment flow
- ⏳ Payment settlement

**Phase 3: Production Ready (Month 3)**
- ⏳ Security audit
- ⏳ Testing and QA
- ⏳ Performance optimization
- ⏳ Mainnet deployment

See detailed [ROADMAP.md](./ROADMAP.md)

## 🏆 Contribution Opportunities

We have **100+ issues** across difficulty levels:

### 🟢 Good First Issues (Easy)
Perfect if you're new to the project or technology:
- Documentation improvements
- Unit tests
- UI component styling
- Input validation
- Error message improvements

[Browse Easy Issues →](https://github.com/issues?q=is%3Aopen+is%3Aissue+org%3Astellarsettle+label%3A%22difficulty%3A+easy%22)

### 🟡 Intermediate Issues (Medium)
For contributors with some experience:
- API endpoint implementation
- Smart contract functions
- Dashboard components
- Database migrations
- Integration tests

[Browse Medium Issues →](https://github.com/issues?q=is%3Aopen+is%3Aissue+org%3Astellarsettle+label%3A%22difficulty%3A+medium%22)

### 🔴 Advanced Issues (Hard)
For experienced developers:
- Security implementations
- Complex Stellar integrations
- Payment distribution algorithms
- Performance optimization
- Architecture decisions

[Browse Hard Issues →](https://github.com/issues?q=is%3Aopen+is%3Aissue+org%3Astellarsettle+label%3A%22difficulty%3A+hard%22)

## 💰 Funded by Drips

StellarSettle is funded through [Drips](https://drips.network), enabling open-source contributors to earn while building impactful technology. All contributors are compensated for merged work.

### How Compensation Works
- Issues are labeled with estimated effort (1-8 hours)
- Compensation is distributed via Drips after PR merge
- Rates vary by complexity and experience
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for details

## 📊 Tech Stack

- **Smart Contracts**: Rust, Soroban SDK 22.x
- **Backend**: Node.js 22, TypeScript 5.7, Express 5, Prisma 6
- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Blockchain**: Stellar (Soroban)
- **Database**: PostgreSQL 17
- **Storage**: IPFS (Pinata)
- **Deployment**: Vercel (frontend), Railway/Fly.io (backend)

## 🤝 Contributing

We welcome contributors of all skill levels! Please read:

1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
2. [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards
3. [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup

**New to open source?** Check out our [Good First Issues](https://github.com/issues?q=is%3Aopen+is%3Aissue+org%3Astellarsettle+label%3A%22good+first+issue%22)!

## 📈 Project Stats

- **Target Launch**: June 2026 (3 months)
- **Expected Contributors**: 20+
- **Total Issues**: 100+
- **Test Coverage Goal**: >85%
- **Target Users (Year 1)**: 1,000 SMBs, 500 investors

## 🔗 Links

- **Website**: https://stellarsettle.com (Coming soon)
- **Documentation**: https://docs.stellarsettle.com
- **Discord**: https://discord.gg/stellarsettle
- **Twitter**: [@stellarsettle](https://twitter.com/stellarsettle)
- **Drips Profile**: [stellarsettle.drips.network](https://drips.network)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Funded by [Drips Network](https://drips.network)
- Built on [Stellar](https://stellar.org) blockchain
- Powered by the open-source community

---

<div align="center">
  <strong>Ready to contribute? Start with our <a href="./CONTRIBUTING.md">Contributing Guide</a>!</strong>
</div>