import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CornerDownLeft } from 'lucide-react';

interface AlgebraicCalculatorProps {
  onEvaluate: (expr: string) => void;
}

export function AlgebraicCalculator({ onEvaluate }: AlgebraicCalculatorProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEvaluate(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter expression (e.g., 2 + 2, a = 5)"
        className="text-lg font-mono py-6 pr-10 shadow-sm border-primary/20 focus-visible:ring-primary"
        autoFocus
        autoComplete="off"
        spellCheck="false"
      />
      <div 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50"
        title="Press Enter to evaluate"
      >
        <CornerDownLeft className="w-5 h-5" />
      </div>
    </div>
  );
}
