import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { GlassCard } from './ui/GlassCard';

interface SmartInsightsProps {
    analysis: {
        technical_score: number;
        experience_score: number;
        soft_skills_score: number;
        relevance_score: number;
    } | null;
}

export function SmartInsights({ analysis }: SmartInsightsProps) {
    if (!analysis) return null;

    const data = [
        { subject: 'Técnica', A: analysis.technical_score, fullMark: 40 },
        { subject: 'Experiencia', A: analysis.experience_score, fullMark: 30 },
        { subject: 'Soft Skills', A: analysis.soft_skills_score, fullMark: 15 },
        { subject: 'Relevancia', A: analysis.relevance_score, fullMark: 15 },
    ];

    // Normalize for chart (0-100 scale for visual balance)
    const normalizedData = data.map(d => ({
        ...d,
        A: (d.A / d.fullMark) * 100
    }));

    return (
        <GlassCard className="p-4 w-[300px] h-[300px] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl">
            <h3 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">AI Analysis DNA</h3>
            <div className="w-full h-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={normalizedData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Candidate"
                            dataKey="A"
                            stroke="#10B981"
                            strokeWidth={2}
                            fill="#10B981"
                            fillOpacity={0.3}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
                            itemStyle={{ color: '#10B981' }}
                            formatter={(value: any) => Math.round(Number(value) || 0) + '%'}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
