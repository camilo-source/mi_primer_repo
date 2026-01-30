import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface TagInputProps {
    tags: string[];
    onAdd: () => void;
    onRemove: (tag: string) => void;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    color?: 'emerald' | 'red' | 'amber';
}

const colorClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
};

export function TagInput({ tags, onAdd, onRemove, value, onChange, placeholder, color = 'emerald' }: TagInputProps) {
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onAdd();
                        }
                    }}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
                <Button type="button" size="sm" variant="secondary" onClick={onAdd} icon={<Plus size={14} />}>
                    Agregar
                </Button>
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <span
                            key={tag}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[color]}`}
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemove(tag)}
                                className="hover:opacity-70 transition-opacity"
                                aria-label={`Eliminar ${tag}`}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
