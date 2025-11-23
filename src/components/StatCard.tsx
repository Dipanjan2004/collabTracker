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
      className={onClick ? "glass-card p-6 hover-scale cursor-pointer transition-all hover:border-primary/50" : "glass-card p-6 hover-scale"}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p ref={counterRef} className="text-3xl font-bold">
              0
            </p>
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </div>
          {trend && (
            <p className="text-xs text-primary mt-2">{trend}</p>
          )}
          {onClick && value > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Click to view details</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
