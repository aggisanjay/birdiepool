'use client';
interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ProgressRing({ value, size = 80, strokeWidth = 6, color = '#22c55e', label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-sm font-black text-white">{Math.round(value)}%</p>
        {label && <p className="text-xs text-slate-400">{label}</p>}
      </div>
    </div>
  );
}
