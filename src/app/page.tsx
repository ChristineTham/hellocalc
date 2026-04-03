"use client";

import { useCalculator } from '@/hooks/useCalculator';
import { HistoryDisplay } from '@/components/calculator/HistoryDisplay';
import { AlgebraicCalculator } from '@/components/calculator/AlgebraicCalculator';
import { Card } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export default function Home() {
  const { history, evaluate } = useCalculator();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-background text-foreground">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <header className="flex items-center gap-3 pb-4 border-b">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Hello Calc</h1>
            <p className="text-sm text-muted-foreground">Advanced Algebraic & RPN Evaluation Engine</p>
          </div>
        </header>

        <Card className="flex flex-col h-[500px] shadow-lg border-primary/10 overflow-hidden bg-card">
          <div className="flex-1 overflow-hidden p-4">
            <HistoryDisplay history={history} />
          </div>
          <div className="p-4 bg-muted/30 border-t">
            <AlgebraicCalculator onEvaluate={evaluate} />
          </div>
        </Card>
        
        <footer className="text-center text-xs text-muted-foreground">
          Powered by Math.js BigNumbers
        </footer>
      </div>
    </main>
  );
}
