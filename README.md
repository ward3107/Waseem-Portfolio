<div align="center">

# Waseem Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. Features smooth animations, multi-language support, accessibility features, and a sleek dark-themed design.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-cyan)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![CI](https://github.com/ward3107/Waseem-Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/ward3107/Waseem-Portfolio/actions/workflows/ci.yml)

[Live Demo](https://wwas.netlify.app/) | [Report Bug](https://github.com/ward3107/Waseem-Portfolio/issues) | [Request Feature](https://github.com/ward3107/Waseem-Portfolio/issues)

</div>

---

## Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

This is a personal portfolio website showcasing my work, skills, and services as a developer. The site features a modern, minimalist design with smooth animations powered by Framer Motion, and includes sections for services, projects, timeline, and contact information.

---

## Features

- **Responsive Design**: Fully responsive across all device sizes
- **Dark Theme**: Modern dark-themed UI with smooth transitions
- **Animations**: Smooth page transitions and element animations using Framer Motion
- **Multi-language Support**: Built-in language context for internationalization
- **Accessibility**: ARIA labels, keyboard navigation support, and accessibility toolbar
- **Performance**: Optimized with Vite for lightning-fast builds
- **TypeScript**: Full type safety throughout the application
- **Components Include**:
  - Hero section with animated introduction
  - Services showcase
  - AI integration section
  - Interactive timeline
  - Projects gallery
  - Tech stack display
  - Social media hub
  - FAQ section
  - Contact form
  - Cookie consent banner
  - Share widget
  - Back-to-top button

---

## Technologies Used

### Frontend Framework
- [React 18](https://react.dev/) - UI library
- [TypeScript 5.2](https://www.typescriptlang.org/) - Type safety

### Build Tool
- [Vite 7.3](https://vitejs.dev/) - Next generation frontend tooling

### Styling
- [Tailwind CSS 3.4](https://tailwindcss.com/) - Utility-first CSS framework
- [PostCSS](https://postcss.org/) - CSS transformations

### Animations
- [Framer Motion 11](https://www.framer.com/motion/) - Production-ready motion library

### Icons
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icons

---

## Getting Started

### Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version
npm --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ward3107/Waseem-Portfolio.git
   cd Waseem-Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API keys if needed.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

---

## Usage

### Development

Run the development server with hot module replacement:
```bash
npm run dev
```

### Production Build

Create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format files with Prettier |
| `npm run format:check` | Check formatting without writing |

---

## Project Structure

```
waseem-portfolio/
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Router + providers
│   ├── constants.ts        # App-wide constants
│   ├── types.ts            # Shared TypeScript types
│   ├── index.css           # Global styles / Tailwind base
│   ├── features/           # One folder per feature (component + hook + data)
│   │   ├── hero/           # Hero section (animated headline, profile card)
│   │   ├── services/       # Services showcase + modal
│   │   ├── projects/       # Project gallery + wizard + data
│   │   ├── reviews/        # Client testimonials
│   │   ├── certifications/ # Certifications list
│   │   ├── tech-stack/     # Tech badges (gamified)
│   │   ├── about/          # About timeline
│   │   ├── contact/        # Contact form
│   │   ├── ai/             # AISection + VibeCoding
│   │   ├── home/           # Home-only sections (HomeCTA, Process, FAQ, SocialHub)
│   │   └── admin/          # Admin panel (layout, pages, primitives)
│   ├── shared/             # Cross-cutting UI
│   │   ├── layout/         # Navbar, Footer
│   │   ├── widgets/        # Floating widgets (a11y, share, back-to-top, cookie)
│   │   ├── ui/             # Skeleton, ScrollToHash
│   │   ├── three/          # 3D word helper
│   │   └── hooks/          # Cross-cutting React hooks
│   ├── pages/              # Route entries (stack features)
│   ├── contexts/           # Language, Theme, AdminAuth, Widget
│   ├── lib/                # Supabase client, content helpers, browser utils
│   └── translations/       # en / he / ar
├── public/                 # Static assets served as-is
├── scripts/                # Build-time & dev scripts (blog, landing pages, images)
├── supabase/               # Database schema
├── docs/                   # Repo docs
├── index.html              # HTML entry
├── package.json, vite.config.ts, tailwind.config.js, tsconfig.json, vercel.json
```

Imports use the `@/` alias mapped to `src/` — e.g. `import Reviews from '@/features/reviews/Reviews'`.

---

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
# Example:
# VITE_API_KEY=your_api_key_here
# VITE_GEMINI_API_KEY=your_gemini_key
```

### Tailwind Configuration

Customize the theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add custom colors
      }
    }
  }
}
```

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

Waseem - [@ward3107](https://github.com/ward3107)

Project Link: [https://github.com/ward3107/Waseem-Portfolio](https://github.com/ward3107/Waseem-Portfolio)

---

<div align="center">

**Built with ❤️ using React & TypeScript**

</div>
