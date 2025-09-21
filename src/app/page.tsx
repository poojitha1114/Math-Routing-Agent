import { MathSolver } from '@/components/math-solver';
import { Icons } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background font-body">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Icons.logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-primary">
              MathMind AI
            </h1>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <MathSolver />
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built to demystify mathematics.
          </p>
        </div>
      </footer>
    </div>
  );
}
