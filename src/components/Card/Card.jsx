import React from 'react';
import { cn } from '@/utils/cn';
import styles from './Card.module.css';

export function Card({
    children,
    className,
    padding = 'default',
    hover = false,
    ...props
}) {
    return (
        <div
            className={cn(
                styles.card,
                styles[padding],
                hover && styles.hover,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
