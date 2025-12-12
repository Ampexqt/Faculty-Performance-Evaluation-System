import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { LogoutModal } from '../LogoutModal/LogoutModal';
import { cn } from '@/utils/cn';
import styles from './DashboardLayout.module.css';

export function DashboardLayout({
    children,
    role = 'Zonal Admin',
    userName = 'Administrator',
    notificationCount = 0,
    className,
    ...props
}) {
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        // Clear any auth tokens/session data here
        console.log('Logging out...');
        setIsLogoutModalOpen(false);
        // Navigate to login page
        navigate('/login');
    };

    const handleLogoutCancel = () => {
        setIsLogoutModalOpen(false);
    };

    return (
        <div className={styles.layout}>
            <Header
                role={role}
                userName={userName}
                notificationCount={notificationCount}
                onLogout={handleLogoutClick}
            />

            <div className={styles.container}>
                <Sidebar role={role} />

                <main className={cn(styles.main, className)} {...props}>
                    {children}
                </main>
            </div>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
                userName={userName}
            />
        </div>
    );
}
