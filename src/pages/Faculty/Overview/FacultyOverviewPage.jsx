import React, { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import styles from './FacultyOverviewPage.module.css';

export function FacultyOverviewPage() {
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        collegeName: '',
        position: ''
    });

    useEffect(() => {
        const fullName = localStorage.getItem('fullName') || 'Faculty Member';
        const collegeName = localStorage.getItem('collegeName') || 'College';
        const position = localStorage.getItem('position') || 'Faculty';

        setUserInfo({ fullName, collegeName, position });
    }, []);

    return (
        <DashboardLayout
            role="Faculty"
            userName={userInfo.fullName}
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>My Dashboard</h1>
                        <p className={styles.subtitle}>
                            <span style={{ fontWeight: '700', color: '#800000', fontSize: '1.1em' }}>
                                {userInfo.collegeName}
                            </span>
                            <span style={{ color: '#6b7280' }}> • {userInfo.position}</span>
                        </p>
                    </div>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Active Subjects"
                        value={3} // Placeholder
                        subtitle="Current semester"
                        icon={BookOpen}
                    />
                    <StatCard
                        title="Students Evaluated"
                        value={47} // Placeholder
                        subtitle="Total responses received"
                        icon={Users}
                    />
                    <StatCard
                        title="Completion Rate"
                        value="35%" // Placeholder
                        subtitle="Overall progress"
                        icon={CheckCircle}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
