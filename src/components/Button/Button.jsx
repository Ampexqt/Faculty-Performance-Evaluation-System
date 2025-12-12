import React from 'react';
import { cn } from '@/utils/cn';
import styles from './Button.module.css';

export function Button({
    children,
    className,
    variant = 'primary',
    size = 'default',
    disabled = false,
    type = 'button',
    onClick,
    ...props
}) {
    return (
        <button
            type={type}
            className={cn(
                styles.button,
                styles[variant],
                styles[size],
                disabled && styles.disabled,
                className
            )}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}
