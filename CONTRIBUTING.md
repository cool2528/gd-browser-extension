# Contributing to GDownload Extension

Thank you for your interest in contributing to GDownload Extension! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept responsibility for mistakes
- Prioritize the community's best interests

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)
- Chrome/Firefox/Edge browser

### Setup Development Environment

1. **Fork and clone**:
   ```bash
   git clone https://github.com/your-username/gdownload-extension.git
   cd gdownload-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Load extension in browser**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🔄 Development Workflow

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Creating a Feature

1. **Create a branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following [Coding Standards](#coding-standards)

3. **Test thoroughly** (see [Testing](#testing))

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(popup): add file size filter
fix(background): resolve WebSocket reconnection issue
docs(readme): update installation instructions
```

## 📏 Coding Standards

### TypeScript

- Use TypeScript strict mode
- Avoid `any` type when possible
- Define explicit return types for functions
- Use interfaces for object shapes

**Example**:
```typescript
// Good
interface Link {
  id: string;
  url: string;
  filename: string;
}

function processLink(link: Link): boolean {
  // ...
  return true;
}

// Avoid
function processLink(link: any) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful prop names

**Example**:
```tsx
// Good
interface LinkItemProps {
  link: Link;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function LinkItem({ link, onSelect, onDelete }: LinkItemProps) {
  // Component implementation
}
```

### Code Formatting

We use ESLint and Prettier:

- **Indentation**: Tabs (4 spaces)
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line length**: 100 characters max

**Run formatters**:
```bash
npm run lint
npm run format
```

### File Organization

```
src/
├── background/       # Service Worker code
├── content/          # Content Script code
├── popup/            # Popup UI components
├── options/          # Options UI components
└── shared/           # Shared utilities
    ├── types.ts      # TypeScript types
    ├── constants.ts  # Constants
    └── utils/        # Utility functions
```

## 🧪 Testing

### Unit Tests

We use Vitest for unit testing:

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:unit
```

**Example test**:
```typescript
import { describe, it, expect } from 'vitest';
import { formatFileSize } from './fileSize';

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(1048576)).toBe('1.00 MB');
  });
});
```

### Integration Tests

Test component interactions:

```bash
npm run test:integration
```

### E2E Tests

Test complete user workflows:

```bash
npm run test:e2e
```

### Testing Checklist

Before submitting a PR, ensure:

- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Code coverage is maintained (>80%)
- [ ] Manual testing in all supported browsers

## 📤 Submitting Changes

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run all checks**:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```
4. **Create Pull Request**:
   - Use a descriptive title
   - Reference related issues
   - Provide detailed description
   - Add screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Related Issues
Fixes #123

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Cross-browser tested

## Screenshots
(if applicable)
```

### Code Review

- Be responsive to feedback
- Make requested changes promptly
- Ask questions if unclear
- Keep discussions constructive

## 🚢 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist

1. Update version in `manifest.json` and `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build for all browsers
5. Test installation in each browser
6. Create GitHub release
7. Submit to browser stores

## 💡 Development Tips

### Debugging

**Background Service Worker**:
```javascript
// In browser console
chrome.runtime.getBackgroundPage(console.log)
```

**Content Script**:
```javascript
// In page console
console.log('[GDownload]', message);
```

**WebSocket Communication**:
```javascript
// Enable debug logging
localStorage.setItem('debug', 'aria2:*');
```

### Useful Resources

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Firefox WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [aria2 JSON-RPC](https://aria2.github.io/manual/en/html/aria2c.html#rpc-interface)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ Questions?

- **General Questions**: [GitHub Discussions](https://github.com/yourusername/gdownload-extension/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/gdownload-extension/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/gdownload-extension/discussions/categories/ideas)

---

Thank you for contributing to GDownload Extension! 🎉
