import React from 'react';
import { cn } from '@/utils/cn';
import { calculatePercentage } from '@/utils/helpers';
import styles from './ProgressBar.module.css';

export function ProgressBar({
    value = 0,
    max = 100,
    showLabel = false,
    size = 'default',
    variant = 'default',
    className,
    ...props
}) {
    const percentage = calculatePercentage(value, max);

    return (
        <div className={cn(styles.container, className)} {...props}>
            <div className={cn(styles.progressBar, styles[size])}>
                <div
                    className={cn(styles.fill, styles[variant])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className={styles.label}>
                    {value}/{max}
                </span>
            )}
        </div>
    );
}
