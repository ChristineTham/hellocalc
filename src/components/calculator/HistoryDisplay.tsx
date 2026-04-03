import { HistoryItem } from '@/hooks/useCalculator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef, useEffect } from 'react';

interface HistoryDisplayProps {
  history: HistoryItem[];
}

export function HistoryDisplay({ history }: HistoryDisplayProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new items are added
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <ScrollArea className="h-full w-full rounded-md border bg-card p-4 shadow-inner" viewportRef={viewportRef}>
      {history.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground opacity-50">
          History is empty
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => (
            <div key={item.id} className="flex flex-col border-b pb-2 last:border-b-0">
              <div className="text-right text-sm text-muted-foreground">
                {item.expression}
              </div>
              <div
                className={`text-right text-xl font-medium tracking-tight ${
                  item.isError ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {item.isError ? item.result : `= ${item.result}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
