# 🤝 Contributing to ComputerPOS Pro

Thank you for your interest in contributing to ComputerPOS Pro! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and constructive
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Git for version control
- Cloudflare account (for testing deployments)
- Code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/computerpos-pro.git
   cd computerpos-pro
   ```

3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/original-owner/computerpos-pro.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Update .env with your development values
```

### 3. Database Setup

```bash
# Create development database
wrangler d1 create computerpos_db_dev

# Run migrations
npm run db:migrate:dev

# Seed with sample data
npm run db:seed:dev
```

### 4. Start Development Servers

```bash
# Terminal 1: Frontend (Astro)
npm run dev

# Terminal 2: Backend (Workers)
npm run dev:worker
```

## Project Structure

```
computerpos-pro/
├── src/                    # Frontend source code
│   ├── components/         # Astro components
│   ├── layouts/            # Page layouts
│   ├── pages/              # Route pages
│   ├── lib/                # Utility libraries
│   └── styles/             # CSS/Tailwind styles
├── functions/             # Backend Workers
│   ├── api/                # API endpoints
│   ├── middleware/         # Middleware functions
│   └── utils/              # Backend utilities
├── schemas/               # Database schemas
├── docs/                  # Documentation
└── tests/                 # Test files
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`
- Use async/await over Promises where possible

### Astro Components

- Use `.astro` extension for Astro components
- Follow component naming conventions (PascalCase)
- Keep components focused and reusable
- Use TypeScript in component scripts
- Document component props with TypeScript interfaces

### CSS/Tailwind

- Use Tailwind CSS classes primarily
- Create custom CSS only when necessary
- Follow mobile-first responsive design
- Use semantic class names for custom CSS
- Maintain consistent spacing and typography

### Database

- Use parameterized queries to prevent SQL injection
- Follow naming conventions (snake_case for tables/columns)
- Add proper indexes for performance
- Include migration scripts for schema changes
- Document complex queries

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(products): add product search functionality

Implement search by name, category, and specifications
Add debounced search input component
Update API endpoint to support search parameters

Closes #123
```

```
fix(pos): resolve checkout calculation error

Fix tax calculation for multiple items
Ensure discount applies correctly

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update your fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation
   - Ensure all tests pass

4. **Test your changes**:
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

### Submitting the PR

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**:
   - Use descriptive title and description
   - Reference related issues
   - Include screenshots for UI changes
   - Add reviewers if known

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests pass locally
   - [ ] Added tests for new functionality
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   ```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: Maintainers review code quality and functionality
3. **Testing**: Manual testing of new features
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge to main branch

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test products.test.ts
```

### Writing Tests

#### Frontend Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProductCard from '../components/ProductCard.astro';

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = {
      id: 1,
      name: 'Intel Core i7',
      price: 10500000,
      category: 'CPU'
    };
    
    const { getByText } = render(<ProductCard product={product} />);
    expect(getByText('Intel Core i7')).toBeInTheDocument();
    expect(getByText('10,500,000 ₫')).toBeInTheDocument();
  });
});
```

#### Backend Tests (Jest)

```typescript
import { describe, it, expect } from '@jest/globals';
import { handleRequest } from '../functions/api/products';

describe('Products API', () => {
  it('should return products list', async () => {
    const request = new Request('http://localhost/api/products');
    const response = await handleRequest(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.products)).toBe(true);
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Focus on critical business logic
- Test edge cases and error conditions
- Include integration tests for API endpoints

## Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Include usage examples for utilities
- Keep comments up-to-date with code changes

### API Documentation

- Update `docs/API.md` for API changes
- Include request/response examples
- Document error codes and responses
- Add authentication requirements

### User Documentation

- Update README.md for setup changes
- Add feature documentation
- Include troubleshooting guides
- Provide deployment instructions

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Bug Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, Node.js version
6. **Screenshots**: If applicable
7. **Error Messages**: Full error messages and stack traces

### Feature Requests

For feature requests, please include:

1. **Feature Description**: Clear description of the proposed feature
2. **Use Case**: Why this feature would be useful
3. **Proposed Solution**: How you think it should work
4. **Alternatives**: Other solutions you've considered
5. **Additional Context**: Any other relevant information

### Issue Templates

Use the provided issue templates when creating new issues:

- Bug Report Template
- Feature Request Template
- Documentation Issue Template
- Performance Issue Template

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature development branches
- `hotfix/*`: Critical bug fixes
- `release/*`: Release preparation branches

### Release Process

1. Create release branch from develop
2. Update version numbers and changelog
3. Test release candidate
4. Merge to main and tag release
5. Deploy to production
6. Merge back to develop

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussions and questions
- **Discord**: Real-time chat (if available)
- **Email**: Direct contact for sensitive issues

### Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs
- Special thanks in documentation

## Getting Help

If you need help:

1. Check existing documentation
2. Search existing issues
3. Ask in GitHub Discussions
4. Contact maintainers directly

## License

By contributing to ComputerPOS Pro, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to ComputerPOS Pro! 🚀
