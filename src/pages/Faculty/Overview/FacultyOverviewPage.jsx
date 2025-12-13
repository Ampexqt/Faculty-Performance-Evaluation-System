import React from 'react';
import { BookOpen, Users, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import styles from './FacultyOverviewPage.module.css';

export function FacultyOverviewPage() {
    return (
        <DashboardLayout
            role="Faculty"
            userName="Faculty Member"
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>My Dashboard</h1>
                        <p className={styles.subtitle}>Track your subjects and evaluation progress.</p>
                    </div>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Active Subjects"
                        value={3}
                        subtitle="Current semester"
                        icon={BookOpen}
                    />
                    <StatCard
                        title="Students Evaluated"
                        value={47}
                        subtitle="Total responses received"
                        icon={Users}
                    />
                    <StatCard
                        title="Completion Rate"
                        value="35%"
                        subtitle="Overall progress"
                        icon={CheckCircle}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
