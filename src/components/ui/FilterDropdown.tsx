import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface FilterDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    className?: string;
    label?: string;
}

export function FilterDropdown({
    value,
    onChange,
    options,
    className = '',
    label = 'Filtrar'
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    const totalCount = selectedOption?.count;

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
          liquid-glass px-4 py-2.5 rounded-xl
          flex items-center gap-2
          text-sm font-medium text-[var(--text-main)]
          hover:glow-border-static
          transition-all duration-200
          min-w-[140px]
        "
            >
                <SlidersHorizontal size={16} className="text-purple-500" />

                <span className="flex-1 text-left">
                    {selectedOption?.label || label}
                </span>

                {totalCount !== undefined && (
                    <span className="
            px-2 py-0.5 rounded-full
            bg-purple-500/20 text-purple-500
            text-xs font-bold
          ">
                        {totalCount}
                    </span>
                )}

                <ChevronDown
                    size={16}
                    className={`
            text-[var(--text-muted)] transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="
            absolute right-0 mt-2 w-64
            liquid-glass-card
            rounded-xl border border-[var(--card-border)]
            shadow-xl z-50
            animate-slide-up
          "
                >
                    {/* Header */}
                    <div className="px-4 py-2 border-b border-[var(--card-border)]">
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                            Filtrar por estado
                        </p>
                    </div>

                    {/* Options */}
                    <div className="py-2">
                        {options.map((option) => {
                            const isSelected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                    w-full px-4 py-2.5
                    flex items-center justify-between gap-3
                    text-left transition-colors duration-150
                    ${isSelected
                                            ? 'bg-emerald-500/20 text-emerald-500'
                                            : 'hover:bg-emerald-500/10 text-[var(--text-main)]'
                                        }
                  `}
                                >
                                    <span className="flex items-center gap-3 flex-1">
                                        {isSelected && (
                                            <Check size={16} className="text-emerald-500 flex-shrink-0" />
                                        )}
                                        <span className={`font-medium ${!isSelected ? 'ml-7' : ''}`}>
                                            {option.label}
                                        </span>
                                    </span>

                                    {option.count !== undefined && (
                                        <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${isSelected
                                                ? 'bg-emerald-500/30 text-emerald-400'
                                                : 'bg-[var(--card-bg)] text-[var(--text-muted)]'
                                            }
                    `}>
                                            {option.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
