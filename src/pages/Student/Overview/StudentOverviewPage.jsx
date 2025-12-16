import React from 'react';
import { ClipboardList, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import styles from './StudentOverviewPage.module.css';

export function StudentOverviewPage() {
    const fullName = localStorage.getItem('fullName') || 'Student';
    const collegeName = localStorage.getItem('collegeName') || '';
    const programName = localStorage.getItem('programName') || '';
    const section = localStorage.getItem('section') || '';
    const yearLevel = localStorage.getItem('yearLevel') || '';

    const [stats, setStats] = React.useState({
        totalEvaluations: 0,
        pendingEvaluations: 0,
        completedEvaluations: 0,
        completionRate: 0
    });
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const programId = localStorage.getItem('programId'); // This is actually department_id
                const section = localStorage.getItem('section');

                if (!userId || !programId || !section) {
                    console.log('Missing user details in localStorage');
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:5000/api/student/dashboard/stats?studentId=${userId}&programId=${programId}&section=${section}`);
                const data = await response.json();

                if (data.success) {
                    setStats(data.stats);
                } else {
                    console.error('Failed to fetch stats:', data.message);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <DashboardLayout
            role="Student"
            userName={fullName}
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Dashboard</h1>
                        <p className={styles.subtitle}>
                            {programName} {yearLevel}-{section} <br />
                            <span className={styles.collegeName}>{collegeName}</span>
                        </p>
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
