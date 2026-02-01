import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <FileText className="size-4" />
            </div>
            <span className="text-xl font-bold">PDF Generator</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm mb-6">
            <Sparkles className="size-4 text-primary" />
            <span>Powered by AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            Create beautiful PDFs with the power of{' '}
            <span className="text-primary">artificial intelligence</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Describe what you want, and our AI will generate professional PDF documents
            in seconds. Reports, invoices, presentations, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Start creating for free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button size="lg" variant="outline">
                Sign in to your account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to create stunning PDFs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform makes document creation simple, fast, and beautiful.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg border">
              <div className="bg-primary/10 text-primary size-12 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Generation</h3>
              <p className="text-muted-foreground">
                Simply describe what you need in plain English. Our AI understands context
                and creates professional documents instantly.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border">
              <div className="bg-primary/10 text-primary size-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate complete PDF documents in seconds, not hours. Focus on your ideas
                while we handle the formatting.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border">
              <div className="bg-primary/10 text-primary size-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="size-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your documents are encrypted and secure. Use your own API keys for complete
                control over your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Create any document you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From business reports to personal projects, our platform handles it all.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'Business Reports',
              'Invoices & Quotes',
              'Presentations',
              'Resumes & CVs',
              'Technical Documentation',
              'Meeting Notes',
              'Project Proposals',
              'Data Summaries',
            ].map((useCase) => (
              <div
                key={useCase}
                className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg"
              >
                <CheckCircle className="size-5 text-primary shrink-0" />
                <span>{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to create amazing PDFs?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of users who are already creating professional documents with AI.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="gap-2">
              Get started for free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded">
                <FileText className="size-3" />
              </div>
              <span className="font-semibold">PDF Generator</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with AI. Made for creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
