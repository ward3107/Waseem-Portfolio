# Contributing to Waseem Portfolio

First off, thank you for considering contributing to the Waseem Portfolio project! It's people like you that make open-source projects thrive.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be constructive, welcoming, and respectful to all contributors.

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 11, macOS 14]
- Browser: [e.g. Chrome 120, Firefox 121]
- Node version: [e.g. 18.19.0]
- Package manager: [e.g. npm 10.2.4]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how this feature would be used**
- **Include mockups or screenshots if applicable**

### Pull Requests

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Waseem-Portfolio.git
   cd Waseem-Portfolio
   ```

2. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the coding standards below
   - Write clear, concise code
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run dev
   ```
   - Make sure everything works as expected
   - Test on multiple browsers if possible
   - Check for console errors

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "Compare & pull request"
   - Provide a clear description of your changes
   - Link any related issues

---

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` types when possible
- Use proper type definitions from `types.ts`

```tsx
// Good
interface Props {
  title: string;
  count: number;
}

const Component: React.FC<Props> = ({ title, count }) => {
  return <div>{title}: {count}</div>;
};

// Avoid
const Component = ({ title, count }: any) => {
  return <div>{title}: {count}</div>;
};
```

### React Components

- Use functional components with hooks
- Follow the existing component structure
- Use proper prop types
- Keep components focused and reusable

```tsx
// Component file structure
import React from 'react';

interface ComponentNameProps {
  // prop definitions
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop }) => {
  // Component logic
  return (
    // JSX
  );
};

export default ComponentName;
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserData`, `ApiResponse`)

### Tailwind CSS

- Use existing utility classes when possible
- Add custom classes to `tailwind.config.js` when needed
- Keep responsive design in mind (mobile-first approach)

```tsx
// Good
<div className="flex flex-col md:flex-row gap-4 p-4">

// Avoid custom inline styles
<div style={{ display: 'flex', flexDirection: 'column' }}>
```

### File Organization

```
components/
├── ComponentName.tsx      # Main component file
├── ComponentName.module.css # Component-specific styles (if needed)
```

### Imports

- Group imports in this order:
  1. React imports
  2. Third-party libraries
  3. Internal components
  4. Contexts
  5. Types/interfaces
  6. Utilities/constants

```tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './components/ui/Button';
import { useLanguage } from './contexts/LanguageContext';
import type { UserData } from './types';
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

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
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(hero): add animated background effect

fix(contact): resolve form validation issue

docs(readme): update installation instructions

style(components): format code with prettier

refactor(services): extract common logic to utils
```

---

## Questions?

If you have any questions about contributing, feel free to:

- Open an issue with your question
- Start a discussion in the issues section
- Contact the maintainer directly

---

**Happy Contributing!** 🚀
