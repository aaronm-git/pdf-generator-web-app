# PDF Generator Web App

Hey! This is my AI-powered PDF generator. It lets you create professional PDFs just by describing what you want. The AI handles all the formatting and styling while you focus on the content.

## What This Does

Basically, you sign up, describe the PDF you need (like "create a professional invoice for a client" or "make a detailed project proposal"), and the AI generates it for you in a few seconds. No design skills needed. No messing with formatting. Just tell it what you want and boom—you get a PDF.

You can generate as many documents as you want, view your generation history, and download them whenever you need them.

## Tech Stack

Here's what I built this with:

- **Next.js 16** - React framework for the full-stack app
- **TypeScript** - For keeping things type-safe
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component library
- **React PDF** - PDF rendering and generation
- **AI SDK** - Integrates both Anthropic (Claude) and OpenAI (GPT models)
- **Better Auth** - User authentication
- **Vercel Postgres** - Database for storing users and documents
- **Zod** - Data validation
- **Zustand** - State management
- **SWR** - Data fetching

## Getting Started

### What You Need

- Node.js and npm
- A database (I'm using Vercel Postgres, but you can use any PostgreSQL)
- API keys for AI models:
  - Anthropic API key (for Claude)
  - OpenAI API key (for GPT models, optional)

### Setup Steps

1. **Clone the repo and install dependencies:**

```bash
git clone <repo-url>
cd pdf-generator-web-app
npm install
```

2. **Set up your environment variables:**

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then open `.env.local` and add:

- `POSTGRES_URL` - Your database connection string
- `BETTER_AUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 16`
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com
- `OPENAI_API_KEY` - Get from https://platform.openai.com (optional)
- `BETTER_AUTH_URL` - Should be `http://localhost:3000` for local dev
- `NEXT_PUBLIC_APP_URL` - Same as above

3. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### User Flow

1. **Sign up or log in** - Create an account or sign in
2. **Go to dashboard** - Access your PDF generator
3. **Describe your PDF** - Tell the AI what you want
4. **Pick your AI model** - Choose Claude or GPT
5. **Generate** - Click generate and wait a few seconds
6. **Download** - Get your PDF and use it

### API Routes

The app has a few key APIs:

- `POST /api/generate` - Generate a new PDF (your main endpoint)
- `GET /api/documents` - Get all your generated documents
- `GET /api/history` - View generation history
- `GET/POST /api/settings` - Manage user settings and API keys

### Authentication

I'm using Better Auth for user management. It handles sign-up, sign-in, sessions, and more. Users can also add their own AI API keys in settings if they want to use their own accounts.

## Using Your Own API Keys

By default, the app uses the keys you set in your `.env.local`. But users can also add their own API keys in their account settings. This way they can use their own Anthropic or OpenAI accounts instead of yours.

## Deployment

You can deploy this on Vercel (easiest since it's a Next.js app):

1. Push your code to GitHub
2. Go to Vercel and import the repo
3. Add your environment variables
4. Deploy

Or if you prefer another host, just make sure it supports Node.js and Next.js.

## Database

I'm using Vercel Postgres. The schema includes:

- Users table (managed by Better Auth)
- Documents table (stores generated PDFs)
- History table (tracks generation attempts)
- API keys table (encrypted user API keys)

## Features

✅ AI-powered PDF generation
✅ Support for Claude and GPT models
✅ User authentication and accounts
✅ Document history and management
✅ User can bring their own API keys
✅ Dark mode support
✅ Responsive mobile design
✅ Document download and preview

## What I'm Still Working On

- More PDF templates and styling options
- Batch generation for multiple PDFs
- Team/collaboration features
- More AI model options
- Document sharing links

## Problems? Questions?

If something's not working or you have questions, check the code or reach out. Most things should be pretty straightforward.

## License

This is my project. Use it as you like, but if you're forking or using it commercially, let me know.

---

Made by [Aaron Molina](https://aaronmolina.me)
