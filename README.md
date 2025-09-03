# Is It ~~Down~~ Dumb?

LLM Status Checker - Identify when AI responses might be unreliable

This project helps users determine when LLM responses might be unreliable or "dumb". It provides analytics and insights into AI model performance and response quality.

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **Git**

You can check your Node.js version with:
```bash
node --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hvent90/is-it-dumb
   cd is-it-dumb
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure the required variables:
   ```bash
   # Tinybird Analytics API Token
   # Get this from your Tinybird project settings - use a read-only token
   NEXT_PUBLIC_TINYBIRD_API_TOKEN=your_tinybird_read_only_token_here
   ```

   **Getting a Tinybird API Token:**
   - Sign up at [Tinybird](https://www.tinybird.co/)
   - Create a new project or use an existing one
   - Go to your project settings and generate a read-only API token
   - Copy the token to your `.env.local` file

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run latency-poc` - Run latency proof of concept script

### Project Structure

```
├── src/
│   ├── app/              # Next.js 15 app directory
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utility libraries
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── e2e/                 # End-to-end tests
├── scripts/             # Utility scripts
└── tinybird/            # Tinybird configuration
```

### Technologies Used

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui with Radix UI primitives
- **Charts:** Recharts
- **Testing:** Vitest (unit), Playwright (E2E)
- **Analytics:** Tinybird integration
- **AI/ML:** Xenova Transformers
- **Build Tool:** Turbopack

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint** - For code linting
- **TypeScript** - For type safety
- **Prettier** (via ESLint config) - For code formatting

Run the linter before committing:
```bash
npm run lint
```

### Testing

**Unit Tests:**
```bash
npm run test          # Run once
npm run test:ui       # Run with UI
```

**Integration Tests:**
```bash
npm run test:integration
```

**End-to-End Tests:**
```bash
npm run test:e2e      # Run headless
npm run test:e2e:ui   # Run with UI
```

## Customization

### Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add new components:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
# etc.
```

### Styling

The project uses Tailwind CSS v4. Global styles are in `src/app/globals.css`.

## Production Deployment

### Build for Production

```bash
npm run build
```

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for deployment options.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_TINYBIRD_API_TOKEN` | Tinybird read-only API token for analytics | Yes |

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Tinybird](https://www.tinybird.co/) - Real-time analytics platform