'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, User as UserIcon, Loader2 } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AIPromptModal } from '@/components/ai/ai-prompt-modal';
import { useAISettings } from '@/hooks/use-ai-settings';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth-client';
import type { User } from '@/lib/auth';

interface TopNavbarProps {
  user: User;
}

export function TopNavbar({ user }: TopNavbarProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { hasAnyApiKey, isLoaded } = useAISettings();

  const isDisabled = isLoaded && !hasAnyApiKey();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">PDF Generator</h1>
          </div>

          <div className="flex items-center gap-2">
            {isDisabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button className="gap-2" size="sm" disabled>
                      <Sparkles className="size-4" />
                      <span className="hidden sm:inline">Generate with AI</span>
                      <span className="sm:hidden">AI</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add an API key in Settings to enable AI generation</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2"
                size="sm"
              >
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">Generate with AI</span>
                <span className="sm:hidden">AI</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase() || <UserIcon className="size-4" />}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="text-destructive focus:text-destructive"
                >
                  {isSigningOut ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 size-4" />
                  )}
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AIPromptModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
