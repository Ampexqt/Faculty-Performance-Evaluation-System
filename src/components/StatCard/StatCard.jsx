import React from 'react';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/helpers';
import styles from './StatCard.module.css';

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    className,
    ...props
}) {
    const isPositive = trend === 'up' || (trendValue && trendValue > 0);

    return (
        <div className={cn(styles.statCard, className)} {...props}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        {Icon && <Icon size={24} />}
                    </div>
                    <h3 className={styles.title}>{title}</h3>
                </div>

                <div className={styles.valueWrapper}>
                    <p className={styles.value}>
                        {typeof value === 'number' ? formatNumber(value) : value}
                    </p>

                    {(trendValue || subtitle) && (
                        <div className={styles.footer}>
                            {trendValue && (
                                <span className={cn(
                                    styles.trend,
                                    isPositive ? styles.trendUp : styles.trendDown
                                )}>
                                    {isPositive ? '+' : ''}{trendValue}
                                </span>
                            )}
                            {subtitle && (
                                <span className={styles.subtitle}>{subtitle}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
