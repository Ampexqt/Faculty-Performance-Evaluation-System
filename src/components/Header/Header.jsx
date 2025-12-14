import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '../Badge/Badge';
import styles from './Header.module.css';

export function Header({
    role = 'Zonal Admin',
    userName = 'Administrator',
    notificationCount = 0,
    onLogout,
    onMenuClick,
    className,
    ...props
}) {
    return (
        <header className={cn(styles.header, className)} {...props}>
            <div className={styles.container}>
                <div className={styles.left}>
                    {/* Hamburger Menu - Mobile Only */}
                    <button
                        className={styles.hamburger}
                        onClick={onMenuClick}
                        aria-label="Toggle menu"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Title - Hidden on Mobile */}
                    <h1 className={styles.title}>Faculty Performance Evaluation System</h1>

                    {/* User Name - Mobile Only */}
                    <div className={styles.mobileUserName}>
                        <User size={18} />
                        <span>{userName}</span>
                    </div>

                    <Badge variant="primary" size="small" className={styles.roleBadge}>
                        {role}
                    </Badge>
                </div>

                <div className={styles.right}>

                    {/* User Menu - Desktop Only */}
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
