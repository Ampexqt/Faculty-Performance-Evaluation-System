import React from 'react';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { cn } from '@/utils/cn';
import styles from './DashboardLayout.module.css';

export function DashboardLayout({
    children,
    role = 'Zonal Admin',
    userName = 'Administrator',
    notificationCount = 0,
    onLogout,
    className,
    ...props
}) {
    return (
        <div className={styles.layout}>
            <Header
                role={role}
                userName={userName}
                notificationCount={notificationCount}
                onLogout={onLogout}
            />

            <div className={styles.container}>
                <Sidebar role={role} />

                <main className={cn(styles.main, className)} {...props}>
                    {children}
                </main>
            </div>
        </div>
    );
}
