import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    debounceMs?: number;
}

export function SearchBar({
    value,
    onChange,
    placeholder = 'Buscar...',
    className = '',
    debounceMs = 300
}: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);

    // Sync with parent value
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, debounceMs, onChange]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <div className={`relative ${className}`}>
            <div
                className={`
          liquid-glass
          flex items-center gap-3 px-4 py-2.5 rounded-xl
          transition-all duration-300
          ${isFocused ? 'glow-border' : 'glow-border-static'}
        `}
            >
                {/* Search Icon */}
                <Search
                    size={18}
                    className={`
            text-emerald-500 flex-shrink-0 transition-all duration-300
            ${isFocused ? 'animate-pulse' : ''}
          `}
                />

                {/* Input */}
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="
            flex-1 bg-transparent border-none outline-none
            text-[var(--text-main)] placeholder:text-[var(--text-muted)]
            text-sm font-medium
          "
                />

                {/* Clear Button */}
                {localValue && (
                    <button
                        onClick={handleClear}
                        className="
              p-1.5 rounded-full
              text-[var(--text-muted)] hover:text-red-500
              hover:bg-red-500/10
              transition-all duration-200
              flex-shrink-0
            "
                        aria-label="Limpiar búsqueda"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Active indicator */}
            {isFocused && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-amber-500 rounded-full animate-shimmer" />
            )}
        </div>
    );
}
