interface FrequencyBadgeProps {
    frequency: string;
    className?: string;
}

const FREQUENCY_CONFIG = {
    manual: {
        label: 'Manual',
        color: 'bg-slate-700/50 text-slate-400 border-slate-600',
        icon: '⚙️'
    },
    daily: {
        label: 'Diaria',
        color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
        icon: '📅'
    },
    every_2_days: {
        label: 'Cada 2 días',
        color: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
        icon: '📆'
    },
    weekly: {
        label: 'Semanal',
        color: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
        icon: '📊'
    }
};

export default function FrequencyBadge({ frequency, className = '' }: FrequencyBadgeProps) {
    const config = FREQUENCY_CONFIG[frequency as keyof typeof FREQUENCY_CONFIG] || FREQUENCY_CONFIG.manual;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${config.color} ${className}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}

export { FREQUENCY_CONFIG };
