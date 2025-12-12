import React from 'react';
import { cn } from '@/utils/cn';
import styles from './Badge.module.css';

export function Badge({
    children,
    variant = 'default',
    size = 'default',
    className,
    ...props
}) {
    return (
        <span
            className={cn(
                styles.badge,
                styles[variant],
                styles[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
