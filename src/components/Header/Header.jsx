import React from 'react';
import { LogOut, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '../Badge/Badge';
import styles from './Header.module.css';

export function Header({
    role = 'Zonal Admin',
    userName = 'Administrator',
    notificationCount = 0,
    onLogout,
    className,
    ...props
}) {
    return (
        <header className={cn(styles.header, className)} {...props}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <h1 className={styles.title}>Faculty Performance Evaluation System</h1>
                    <Badge variant="primary" size="small" className={styles.roleBadge}>
                        {role}
                    </Badge>
                </div>

                <div className={styles.right}>

                    {/* User Menu */}
                    <div className={styles.userMenu}>
                        <button className={styles.userButton}>
                            <User size={18} />
                            <span className={styles.userName}>{userName}</span>
                        </button>
                    </div>

                    {/* Logout */}
                    <button
                        className={styles.iconButton}
                        onClick={onLogout}
                        aria-label="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
