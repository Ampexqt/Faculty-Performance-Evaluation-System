import React, { useState } from 'react';
import { BookOpen, Users, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import styles from './FacultyDashboardPage.module.css';

// Mock data
const mockSubjects = [
    {
        id: 1,
        subject: 'CS101',
        title: 'Intro to Computing',
        section: 'BSCS 1-A',
        evalCode: 'X7K-9P2',
        progress: 71,
        total: 100
    },
    {
        id: 2,
        subject: 'CS102',
        title: 'Programming I',
        section: 'BSCS 1-B',
        evalCode: 'M4R-2L9',
        progress: 39,
        total: 100
    },
    {
        id: 3,
        subject: 'IT201',
        title: 'Web Development',
        section: 'BSIT 2-A',
        evalCode: 'P8Q-1N5',
        progress: 0,
        total: 100
    },
];

const mockRecentEvaluators = [
    { student: 'Student Name Hidden', section: 'BSCS 1-A', status: 'Submitted' },
    { student: 'Student Name Hidden', section: 'BSCS 1-A', status: 'Submitted' },
    { student: 'Student Name Hidden', section: 'BSCS 1-A', status: 'Submitted' },
    { student: 'Student Name Hidden', section: 'BSCS 1-B', status: 'Submitted' },
    { student: 'Student Name Hidden', section: 'BSCS 1-B', status: 'Submitted' },
];

export function FacultyDashboardPage() {
    const [subjects] = useState(mockSubjects);
    const [recentEvaluators] = useState(mockRecentEvaluators);

    const subjectColumns = [
        {
            header: 'Subject',
            accessor: 'subject',
            width: '15%',
            render: (value, row) => (
                <div>
                    <div className={styles.subject}>{value}</div>
                    <div className={styles.subjectTitle}>{row.title}</div>
                </div>
            ),
        },
        {
            header: 'Section',
            accessor: 'section',
            width: '15%',
        },
        {
            header: 'Eval Code',
            accessor: 'evalCode',
            width: '15%',
            render: (value) => (
                <div className={styles.evalCode}>
                    {value}
                    <button className={styles.copyButton} title="Copy code">
                        📋
                    </button>
                </div>
            ),
        },
        {
            header: 'Progress',
            accessor: 'progress',
            width: '40%',
            render: (value, row) => (
                <div className={styles.progressCell}>
                    <ProgressBar
                        value={value}
                        max={row.total}
                        showLabel
                        variant={value === 0 ? 'error' : value < 50 ? 'warning' : 'success'}
                    />
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="Faculty"
            userName="Faculty"
            notificationCount={5}
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

                <div className={styles.content}>
                    <div className={styles.leftColumn}>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Subject Evaluation Status</h2>
                            <div className={styles.tableContainer}>
                                <Table columns={subjectColumns} data={subjects} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Recent Evaluators</h2>
                            <div className={styles.evaluatorsList}>
                                {recentEvaluators.map((evaluator, index) => (
                                    <div key={index} className={styles.evaluatorItem}>
                                        <div className={styles.evaluatorInfo}>
                                            <div className={styles.evaluatorName}>{evaluator.student}</div>
                                            <div className={styles.evaluatorSection}>{evaluator.section}</div>
                                        </div>
                                        <Badge variant="success" size="small">
                                            {evaluator.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
