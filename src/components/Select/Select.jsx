import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './Select.module.css';

export function Select({
    label,
    placeholder = 'Select an option',
    value,
    onChange,
    options = [],
    error,
    className,
    required = false,
    disabled = false,
    searchable = false,
    name,
    ...props
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Focus search input when opened
            if (searchable && searchInputRef.current) {
                setTimeout(() => {
                    searchInputRef.current.focus();
                }, 0);
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, searchable]);

    const handleSelect = (option) => {
        if (disabled) return;

        // Call onChange with a synthetic event to match standard input behavior
        onChange({
            target: {
                name: name,
                value: option.value
            }
        });
        setIsOpen(false);
        setSearchQuery('');
    };

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(option =>
        option.label.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className={cn(styles.selectWrapper, className)}
            ref={containerRef}
            {...props}
        >
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}

            <div
                className={cn(
                    styles.trigger,
                    isOpen && styles.active,
                    error && styles.error,
                    disabled && styles.disabled
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={cn(!selectedOption && styles.placeholder)}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className={styles.icon} />
            </div>

            {isOpen && !disabled && (
                <div className={styles.dropdown}>
                    {searchable && (
                        <div className={styles.searchContainer}>
                            <input
                                ref={searchInputRef}
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <div className={styles.optionsList}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        styles.option,
                                        option.value === value && styles.selected
                                    )}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <span className={styles.errorMessage}>{error}</span>
            )}
        </div>
    );
}
