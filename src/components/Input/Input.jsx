import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './Input.module.css';

export function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    icon: Icon,
    className,
    required = false,
    disabled = false,
    name,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
        <div className={cn(styles.inputWrapper, className)}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}

            <div className={styles.inputContainer}>
                {Icon && (
                    <div className={styles.icon}>
                        <Icon size={18} />
                    </div>
                )}

                <input
                    type={inputType}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={cn(
                        styles.input,
                        Icon && styles.withIcon,
                        isPasswordField && styles.withToggle,
                        error && styles.error
                    )}
                    {...props}
                />

                {isPasswordField && (
                    <button
                        type="button"
                        className={styles.toggleButton}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {error && (
                <span className={styles.errorMessage}>{error}</span>
            )}
        </div>
    );
}
