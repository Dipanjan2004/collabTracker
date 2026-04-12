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
      className={onClick ? "glass-card hover-scale cursor-pointer p-6 transition-all hover:border-[#ff4500]/30" : "glass-card hover-scale p-6"}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-white/40" style={{ fontFamily: 'monospace' }}>{title}</p>
          <div className="flex items-baseline gap-2">
            <p ref={counterRef} className="text-3xl font-extrabold tracking-tight text-white">
              0
            </p>
            {suffix && <span className="text-lg text-white/40">{suffix}</span>}
          </div>
          {trend && (
            <p className="mt-3 inline-flex rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/50" style={{ fontFamily: 'monospace' }}>{trend}</p>
          )}
          {onClick && value > 0 && (
            <p className="mt-3 text-xs text-white/30" style={{ fontFamily: 'monospace' }}>Click to view details</p>
          )}
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <Icon className="h-6 w-6 text-[#ff4500]" />
        </div>
      </div>
    </Card>
  );
}
