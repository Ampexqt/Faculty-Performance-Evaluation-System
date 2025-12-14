import React from 'react';
import { ChevronDown } from 'lucide-react';
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
    name,
    ...props
}) {
    return (
        <div className={cn(styles.selectWrapper, className)}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}

            <div className={styles.selectContainer}>
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={cn(
                        styles.select,
                        error && styles.error
                    )}
                    {...props}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className={styles.icon}>
                    <ChevronDown size={18} />
                </div>
            </div>

            {error && (
                <span className={styles.errorMessage}>{error}</span>
            )}
        </div>
    );
}
