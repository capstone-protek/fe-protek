# FE-Protek

This is the frontend application for the Protek project, built with modern web technologies to ensure a fast, responsive, and accessible user experience.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI primitives)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State/Data Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine (version 18 or higher recommended).

## Getting Started

### Installation

1. Navigate to the project directory:
   ```bash
   cd fe-protek
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Development Server

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Build for Production

To build the app for production to the `dist` folder:

```bash
npm run build
```

This will run TypeScript type checking and then bundle the application.

### Preview Production Build

To locally preview the production build:

```bash
npm run preview
```

### Linting

To run ESLint and check for code quality issues:

```bash
npm run lint
```

## Project Structure

The source code is primarily located in the `src` directory. Key directories include:

- `src/components/`: Reusable UI components (including shadcn/ui components)
- `public/`: Static assets that are served directly
