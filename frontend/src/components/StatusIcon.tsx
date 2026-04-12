import { useId } from 'react';
import { TaskStatus } from '@/types';

interface StatusIconProps {
  status: TaskStatus;
  size?: number;
  className?: string;
}

export function StatusIcon({ status, size = 16, className = '' }: StatusIconProps) {
  const s = size;
  const uid = useId();

  switch (status) {
    case 'backlog':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 16 16"
          fill="none"
          className={className}
        >
          <circle
            cx="8"
            cy="8"
            r="6.5"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
        </svg>
      );

    case 'todo':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 16 16"
          fill="none"
          className={className}
        >
          <circle
            cx="8"
            cy="8"
            r="6.5"
            stroke="#6B7280"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'in_progress':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 16 16"
          fill="none"
          className={className}
        >
          <defs>
            <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <clipPath id={`${uid}-clip`}>
              <rect x="0" y="0" width="8" height="16" />
            </clipPath>
          </defs>
          <circle cx="8" cy="8" r="6.5" stroke={`url(#${uid}-grad)`} strokeWidth="1.5" />
          <circle
            cx="8"
            cy="8"
            r="5"
            fill={`url(#${uid}-grad)`}
            clipPath={`url(#${uid}-clip)`}
            opacity="0.3"
          />
        </svg>
      );

    case 'done':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 16 16"
          fill="none"
          className={className}
        >
          <circle cx="8" cy="8" r="7" fill="#22C55E" />
          <path
            d="M5 8L7 10L11 6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'cancelled':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 16 16"
          fill="none"
          className={className}
        >
          <circle cx="8" cy="8" r="7" fill="#6B7280" opacity="0.25" />
          <path
            d="M6 6L10 10M10 6L6 10"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
