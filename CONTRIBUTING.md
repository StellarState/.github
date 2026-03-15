# Contributing to StellarSettle

First off, thank you for considering contributing to StellarSettle! 🎉

This document will guide you through the contribution process. We value all contributions, whether it's code, documentation, bug reports, or feature suggestions.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Issue Guidelines](#issue-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Code Style Guidelines](#code-style-guidelines)
8. [Testing Requirements](#testing-requirements)
9. [Compensation via Drips](#compensation-via-drips)
10. [Getting Help](#getting-help)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@stellarsettle.com.

## 🚀 Getting Started

### Prerequisites

**For Smart Contracts:**
- Rust 1.83+
- Soroban CLI: `cargo install soroban-cli`
- Git

**For Backend API:**
- Node.js 22+
- PostgreSQL 17+
- npm or yarn

**For Frontend:**
- Node.js 22+
- npm or yarn

### First-Time Setup

1. **Fork the repository** you want to contribute to (contracts, API, or app)

2. **Clone your fork**:
```bash
   git clone https://github.com/YOUR-USERNAME/SS-contracts.git
   cd SS-contracts
```

3. **Add upstream remote**:
```bash
   git remote add upstream https://github.com/StellarState/SS-contracts.git
```

4. **Follow the setup guide** in [DEVELOPMENT.md](./DEVELOPMENT.md) for the specific repo

5. **Join our Discord**: [discord.gg/stellarsettle](https://discord.gg/stellarsettle)

## 🤝 How to Contribute

### Types of Contributions We Need

1. **Code Contributions**
   - Implement new features
   - Fix bugs
   - Improve performance
   - Add tests

2. **Documentation**
   - Improve README files
   - Write tutorials
   - Add code comments
   - Create examples

3. **Testing**
   - Write unit tests
   - Create integration tests
   - Perform manual testing
   - Report bugs

4. **Design**
   - UI/UX improvements
   - Create mockups
   - Improve accessibility

5. **Review**
   - Review pull requests
   - Test proposed changes
   - Provide feedback

### Finding Work

#### 🟢 New to the Project?

Start with [Good First Issues](https://github.com/issues?q=is%3Aopen+is%3Aissue+org%3Astellarsettle+label%3A%22good+first+issue%22):
- Labeled `good-first-issue`
- Well-documented
- Mentorship available
- Usually 1-3 hours of work

#### 🟡 Some Experience?

Try [Intermediate Issues](https://github.com/issues?q=is%3Aopen+is%3Aissue+org%3Astellarsettle+label%3A%22difficulty%3A+medium%22):
- Labeled `difficulty: medium`
- Requires understanding of the codebase
- 3-6 hours of work

#### 🔴 Experienced Developer?

Tackle [Advanced Issues](https://github.com/issues?q=is%3Aopen+is%3Aissue+org%3Astellarsettle+label%3A%22difficulty%3A+hard%22):
- Labeled `difficulty: hard`
- Complex features or architecture
- 6-16 hours of work

### Issue Assignment

1. **Comment on the issue** saying you'd like to work on it
2. **Wait for assignment** from a maintainer (usually <24 hours)
3. **Start work** only after being assigned
4. **Ask questions** if anything is unclear

**Note**: Issues are assigned on a first-come, first-served basis. If you're assigned but can't complete it, please let us know so we can reassign.

## 🔄 Development Workflow

### 1. Create a Branch
```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Test additions
- `refactor/` - Code refactoring

### 2. Make Your Changes

- Write clean, readable code
- Follow our [code style guidelines](#code-style-guidelines)
- Add/update tests for your changes
- Update documentation if needed
- Commit frequently with clear messages

### 3. Commit Your Work

We follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(invoices): add invoice upload endpoint"
git commit -m "fix(auth): resolve JWT expiration bug"
git commit -m "docs(readme): update setup instructions"
git commit -m "test(api): add tests for investment service"
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `style`: Formatting changes
- `chore`: Maintenance tasks

### 4. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template completely
5. Link the related issue (e.g., "Closes #123")
6. Request review from maintainers

## 📝 Pull Request Process

### PR Checklist

Before submitting, ensure:

- [ ] Code follows our style guidelines
- [ ] All tests pass (`npm test` or `cargo test`)
- [ ] New code has test coverage (>80%)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] No merge conflicts with main branch
- [ ] PR description is clear and complete
- [ ] Related issue is linked

### Review Process

1. **Automated checks** run on your PR (CI/CD)
2. **Maintainer review** (usually within 48 hours)
3. **Address feedback** if requested
4. **Approval** from at least 1 maintainer
5. **Merge** by maintainer

### After Your PR is Merged

1. **Delete your branch**:
```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
```

2. **Update your fork**:
```bash
   git checkout main
   git pull upstream main
   git push origin main
```

3. **Celebrate!** 🎉 Your contribution is now part of StellarSettle!

## 🎨 Code Style Guidelines

### All Languages

- **Indentation**: 2 spaces (no tabs)
- **Line length**: Max 100 characters
- **Comments**: Write clear, concise comments explaining "why", not "what"
- **Naming**: Use descriptive, meaningful names

### Rust (Smart Contracts)
```rust
// Use snake_case for functions and variables
pub fn create_invoice_escrow(env: Env, invoice_id: Symbol) {
    // ...
}

// Use PascalCase for types
pub struct InvoiceData {
    seller: Address,
    amount: i128,
}

// Add documentation comments
/// Creates a new invoice escrow on the blockchain.
///
/// # Arguments
/// * `env` - The contract environment
/// * `invoice_id` - Unique identifier for the invoice
///
/// # Returns
/// Result indicating success or error
```

### TypeScript (Backend & Frontend)
```typescript
// Use camelCase for functions and variables
async function createInvoice(userId: string, data: InvoiceData) {
  // ...
}

// Use PascalCase for interfaces and types
interface InvoiceData {
  amount: number;
  customeName: string;
}

// Use arrow functions for callbacks
const handleSubmit = async (data: FormData) => {
  // ...
};

// Add JSDoc comments for exported functions
/**
 * Creates a new invoice in the database.
 * @param userId - The ID of the user creating the invoice
 * @param data - Invoice data
 * @returns Promise resolving to created invoice
 */
```

### React Components
```typescript
// Use PascalCase for component names
export function InvoiceCard({ invoice, onInvest }: InvoiceCardProps) {
  // Hooks at the top
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
}
```

## 🧪 Testing Requirements

### Minimum Coverage

- **Smart Contracts**: >90% coverage
- **Backend API**: >85% coverage
- **Frontend**: >80% coverage

### Test Types

**Unit Tests:**
- Test individual functions in isolation
- Mock external dependencies
- Fast execution (<100ms per test)

**Integration Tests:**
- Test interaction between components
- Use test database
- Test API endpoints end-to-end

**E2E Tests (Frontend):**
- Test user workflows
- Use Playwright or Cypress
- Critical paths only

### Running Tests
```bash
# Smart Contracts
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

### Writing Good Tests
```typescript
// ✅ Good: Descriptive test name
test('should create invoice escrow with valid data', async () => {
  const result = await createEscrow(validData);
  expect(result.success).toBe(true);
});

// ❌ Bad: Vague test name
test('it works', async () => {
  // ...
});

// ✅ Good: Test one thing
test('should return 400 for negative invoice amount', async () => {
  const response = await request(app)
    .post('/invoices')
    .send({ amount: -100 });
  
  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('INVALID_AMOUNT');
});
```

## 💰 Compensation via Drips

StellarSettle contributors are compensated through [Drips Network](https://drips.network).

### How It Works

1. **Work on assigned issues** with effort labels:
   - `effort: 1h` - Simple fixes, docs (100 USDC)
   - `effort: 3h` - Small features, tests (300 USDC)
   - `effort: 6h` - Medium features (600 USDC)
   - `effort: 8h` - Complex features (800 USDC)
   - `effort: 16h` - Major features (1600 USDC)

2. **Submit quality PR** that passes review

3. **After merge**, compensation is distributed via Drips.

4. **Set up your Drips account**:
   - Go to [drips.network](https://drips.network)
   - Connect your wallet
   - Add your GitHub account
   - Receive USDC on Ethereum/Polygon

### Earning Guidelines

- **Quality matters**: PRs must meet all requirements
- **Communication is key**: Ask questions, provide updates
- **One issue at a time**: Complete assigned work before taking more
- **First-time contributors**: Start with 1-2 small issues to build trust

### Bonuses

- **Bug bounties**: Critical bugs earn 2x the effort label
- **Exceptional quality**: Outstanding work gets bonus compensation
- **Consistent contributors**: Monthly bonuses for regular contributors

## ❓ Getting Help

### Before Asking

1. Check existing [documentation](./DEVELOPMENT.md)
2. Search [closed issues](https://github.com/stellarsettle/stellarsettle-contracts/issues?q=is%3Aissue+is%3Aclosed)
3. Read relevant code and comments

### Where to Ask

- **Discord**: [#help channel](https://discord.gg/stellarsettle) - Fastest for quick questions
- **GitHub Issues**: [Create an issue](https://github.com/stellarsettle/stellarsettle-contracts/issues/new) - For bugs or feature requests
- **Email**: contribute@stellarsettle.com - For private matters

### Office Hours

- **Weekly standup**: Mondays 3pm UTC on Discord
- **Code review sessions**: Wednesdays 5pm UTC
- **Open Q&A**: Fridays 2pm UTC

## 🌟 Recognition

Outstanding contributors will be:
- Featured in our monthly newsletter
- Listed in CONTRIBUTORS.md
- Invited to core team (after consistent quality contributions)
- Given priority for future paid opportunities

## 📚 Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Development Setup Guide](./DEVELOPMENT.md)
- [API Documentation](https://docs.stellarsettle.com/api)
- [Stellar Development Docs](https://developers.stellar.org)
- [Soroban Documentation](https://soroban.stellar.org/docs)

---

**Thank you for contributing to StellarSettle!** Together, we're building financial infrastructure that empowers SMBs globally. 🚀