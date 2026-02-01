import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
              <FileText className="size-5" />
            </div>
            <span className="text-2xl font-bold">PDF Generator</span>
          </Link>
          <p className="text-muted-foreground text-sm">AI-Powered Document Creation</p>
        </div>
        {children}
      </div>
    </div>
  );
}
