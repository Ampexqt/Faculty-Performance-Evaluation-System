import React, { useState } from 'react';
import { Users, BookOpen, ClipboardList, Clock, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import styles from './QCEDashboardPage.module.css';

// Mock data
const mockEvaluations = [
    {
        id: 1,
        facultyName: 'Prof. Alan Turing',
        subject: 'CS101',
        section: 'BSCS 1-A',
        progress: 42,
        total: 45,
        rating: 4.8,
        status: 'Completed'
    },
    {
        id: 2,
        facultyName: 'Prof. Ada Lovelace',
        subject: 'CS102',
        section: 'BSCS 1-B',
        progress: 38,
        total: 40,
        rating: 4.9,
        status: 'Completed'
    },
    {
        id: 3,
        facultyName: 'Prof. Grace Hopper',
        subject: 'IT201',
        section: 'BSIT 2-A',
        progress: 14,
        total: 50,
        rating: null,
        status: 'In Progress'
    },
];

export function QCEDashboardPage() {
    const [evaluations] = useState(mockEvaluations);

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'facultyName',
            width: '25%',
            render: (value) => (
                <div className={styles.facultyCell}>
                    <ChevronRight size={16} className={styles.chevron} />
                    <span>{value}</span>
                </div>
            ),
        },
        {
            header: 'Subject & Section',
            accessor: 'subject',
            width: '20%',
            render: (value, row) => (
                <div>
                    <div className={styles.subject}>{value}</div>
                    <div className={styles.section}>{row.section}</div>
                </div>
            ),
        },
        {
            header: 'Progress',
            accessor: 'progress',
            width: '25%',
            render: (value, row) => (
                <div className={styles.progressCell}>
                    <ProgressBar
                        value={value}
                        max={row.total}
                        showLabel
                    />
                </div>
            ),
        },
        {
            header: 'Rating',
            accessor: 'rating',
            width: '15%',
            align: 'center',
            render: (value) => (
                value ? (
                    <span className={styles.rating}>{value}</span>
                ) : (
                    <span className={styles.noRating}>-</span>
                )
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Completed' ? 'completed' : 'inProgress'}>
                    {value}
                </Badge>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="QCE Manager"
            userName="QCE Manager"
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Evaluation Management</h1>
                        <p className={styles.subtitle}>Manage faculty evaluations and monitor progress.</p>
                    </div>
                    <Button variant="primary">
                        + Generate Evaluation Code
                    </Button>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Total Faculty"
                        value={128}
                        subtitle="Active this semester"
                        icon={Users}
                    />
                    <StatCard
                        title="Total Programs"
                        value={12}
                        subtitle="Across 3 colleges"
                        icon={BookOpen}
                    />
                    <StatCard
                        title="Active Evaluations"
                        value={85}
                        subtitle="+42 Ongoing"
                        trendValue="+42"
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Pending Dean Evals"
                        value={5}
                        subtitle="Requires attention"
                        icon={Clock}
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2 className={styles.sectionTitle}>Evaluation Status</h2>
                            <p className={styles.sectionSubtitle}>Track faculty evaluation progress and ratings</p>
                        </div>
                        <div className={styles.headerActions}>
                            <input
                                type="search"
                                placeholder="Search faculty..."
                                className={styles.searchInput}
                            />
                            <Button variant="secondary" size="small">
                                Filter
                            </Button>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={columns} data={evaluations} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
