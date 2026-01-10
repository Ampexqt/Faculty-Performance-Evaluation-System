import React, { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle, UserCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import styles from './FacultyOverviewPage.module.css';

export function FacultyOverviewPage() {
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        collegeName: '',
        position: ''
    });

    const [stats, setStats] = useState({
        assignedSubjects: 0,
        totalStudentsHandled: 0,
        studentsEvaluated: 0,
        supervisorsEvaluated: 0
    });

    useEffect(() => {
        const fullName = sessionStorage.getItem('fullName') || 'Faculty Member';
        const collegeName = sessionStorage.getItem('collegeName') || 'College';
        const position = sessionStorage.getItem('position') || 'Faculty';
        const userId = sessionStorage.getItem('userId');

        setUserInfo({ fullName, collegeName, position });

        // Fetch stats
        const fetchStats = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`http://localhost:5000/api/faculty/dashboard/stats?faculty_id=${userId}`);
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
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
                        title="Assigned Subjects"
                        value={stats.assignedSubjects}
                        subtitle="Current semester"
                        icon={BookOpen}
                    />
                    <StatCard
                        title="Students Evaluated"
                        value={stats.studentsEvaluated}
                        subtitle="Total responses received"
                        icon={CheckCircle}
                    />
                    <StatCard
                        title="Supervisors Evaluated"
                        value={stats.supervisorsEvaluated}
                        subtitle="Total peer/sup evals"
                        icon={UserCheck}
                    />
                    <StatCard
                        title="Total Students Handled"
                        value={stats.totalStudentsHandled}
                        subtitle="Across all sections"
                        icon={Users}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
