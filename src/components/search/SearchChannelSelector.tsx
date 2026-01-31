import { Linkedin, MessageCircle, Mail, Globe, Send, Share2 } from 'lucide-react';
import type { ChannelConfig } from '../../types/search';

interface SearchChannelSelectorProps {
    channels: ChannelConfig;
    onChange: (channels: ChannelConfig) => void;
}

export function SearchChannelSelector({ channels, onChange }: SearchChannelSelectorProps) {
    const toggleChannel = (key: keyof ChannelConfig) => {
        onChange({
            ...channels,
            [key]: !channels[key]
        });
    };

    const channelItems = [
        { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { key: 'instagram', label: 'Instagram', icon: Share2, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { key: 'slack', label: 'Slack (Interno)', icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { key: 'email_marketing', label: 'Email Marketing', icon: Mail, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { key: 'whatsapp', label: 'WhatsApp Groups', icon: Send, color: 'text-green-500', bg: 'bg-green-500/10' },
        { key: 'job_portals', label: 'Job Portals (Multiposting)', icon: Globe, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
    ] as const;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                <Share2 size={20} className="text-indigo-500" />
                Canales de Distribución
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {channelItems.map((item) => {
                    const isActive = channels[item.key as keyof ChannelConfig];
                    const Icon = item.icon;
                    return (
                        <button
                            type="button"
                            key={item.key}
                            onClick={() => toggleChannel(item.key as keyof ChannelConfig)}
                            className={`
                                relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                                ${isActive
                                    ? `border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-lg shadow-${item.color.split('-')[1]}-500/10`
                                    : 'border-white/5 bg-white/5 opacity-60 grayscale hover:opacity-80'
                                }
                            `}
                        >
                            <div className={`p-3 rounded-lg ${isActive ? item.bg : 'bg-gray-800'}`}>
                                <Icon size={24} className={isActive ? item.color : 'text-gray-400'} />
                            </div>

                            <div className="flex-1 text-left">
                                <h3 className={`font-semibold ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                                    {item.label}
                                </h3>
                                <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                    {isActive ? 'Activo' : 'Inactivo'}
                                </div>
                            </div>

                            {/* Toggle Switch Visual */}
                            <div className={`
                                w-10 h-6 rounded-full transition-colors relative
                                ${isActive ? 'bg-emerald-500' : 'bg-gray-700'}
                            `}>
                                <div className={`
                                    absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300
                                    ${isActive ? 'left-5' : 'left-1'}
                                `} />
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="text-sm text-[var(--text-muted)] italic">
                * Los canales activos procesarán automáticamente el contenido generado por IA.
            </p>
        </div>
    );
}
