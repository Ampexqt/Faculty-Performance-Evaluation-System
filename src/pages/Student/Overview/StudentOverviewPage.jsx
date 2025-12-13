import React from 'react';
import { ClipboardList, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import styles from './StudentOverviewPage.module.css';

export function StudentOverviewPage() {
    // Mock data - replace with actual data from API
    const stats = {
        totalEvaluations: 3,
        pendingEvaluations: 2,
        completedEvaluations: 1,
        completionRate: 33
    };

    return (
        <DashboardLayout
            role="Student"
            userName="Student"
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Dashboard</h1>
                        <p className={styles.subtitle}>Welcome back! Here's an overview of your evaluation progress.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <StatCard
                        icon={ClipboardList}
                        title="Total Evaluations"
                        value={stats.totalEvaluations}
                    />
                    <StatCard
                        icon={Clock}
                        title="Pending"
                        value={stats.pendingEvaluations}
                    />
                    <StatCard
                        icon={CheckCircle}
                        title="Completed"
                        value={stats.completedEvaluations}
                    />
                </div>


                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoHeader}>
                            <h3 className={styles.infoTitle}>How to Evaluate</h3>
                        </div>
                        <ol className={styles.infoList}>
                            <li>Get the evaluation code from your instructor during class</li>
                            <li>Go to "My Evaluations" and enter the code</li>
                            <li>Complete the evaluation form honestly and thoughtfully</li>
                            <li>Submit to view your grades</li>
                        </ol>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
