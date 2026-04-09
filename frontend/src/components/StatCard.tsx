import { useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { animateCounter } from '@/utils/animations';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  suffix?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, icon: Icon, trend, suffix = '', onClick }: StatCardProps) {
  const counterRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (counterRef.current) {
      animateCounter(counterRef.current, value);
    }
  }, [value]);

  return (
    <Card 
      className={onClick ? "glass-card hover-scale cursor-pointer p-6 transition-all hover:border-primary/40" : "glass-card hover-scale p-6"}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p ref={counterRef} className="text-3xl font-extrabold tracking-tight text-foreground">
              0
            </p>
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </div>
          {trend && (
            <p className="mt-3 inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{trend}</p>
          )}
          {onClick && value > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">Click to view details</p>
          )}
        </div>
        <div className="rounded-2xl bg-accent p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
