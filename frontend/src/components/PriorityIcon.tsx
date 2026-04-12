import { TaskPriority } from '@/types';

interface PriorityIconProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityIcon({ priority, className = '' }: PriorityIconProps) {
  const barWidth = 3;
  const barGap = 2;
  const barMaxH = 10;

  switch (priority) {
    case 'urgent':
      return (
        <svg
          width="20"
          height="14"
          viewBox="0 0 20 14"
          fill="none"
          className={className}
        >
          <rect x="2" y="2" width={barWidth} height={barMaxH} rx="1" fill="#EF4444" />
          <rect
            x={2 + barWidth + barGap}
            y={2 - 2}
            width={barWidth}
            height={barMaxH + 2}
            rx="1"
            fill="#EF4444"
          />
          <rect
            x={2 + (barWidth + barGap) * 2}
            y={2 - 4}
            width={barWidth}
            height={barMaxH + 4}
            rx="1"
            fill="#EF4444"
          />
          <text
            x={2 + (barWidth + barGap) * 3 + 2}
            y="10"
            fill="#EF4444"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            !!
          </text>
        </svg>
      );

    case 'high':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={className}
        >
          <rect x="2" y="4" width={barWidth} height={barMaxH - 2} rx="1" fill="#F97316" />
          <rect
            x={2 + barWidth + barGap}
            y={2}
            width={barWidth}
            height={barMaxH}
            rx="1"
            fill="#F97316"
          />
        </svg>
      );

    case 'medium':
      return (
        <svg
          width="8"
          height="14"
          viewBox="0 0 8 14"
          fill="none"
          className={className}
        >
          <rect x="2" y="2" width={barWidth} height={barMaxH} rx="1" fill="#EAB308" />
        </svg>
      );

    case 'low':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={className}
        >
          <circle cx="4" cy="5" r="1.25" fill="#3B82F6" />
          <circle cx="9" cy="5" r="1.25" fill="#3B82F6" />
          <circle cx="4" cy="10" r="1.25" fill="#3B82F6" />
          <circle cx="9" cy="10" r="1.25" fill="#3B82F6" />
        </svg>
      );

    case 'none':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={className}
        >
          <line
            x1="3"
            y1="7"
            x2="11"
            y2="7"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
