import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import styles from './EvaluationsPage.module.css';

// Mock data
const mockEvaluations = [
    {
        id: 1,
        faculty: 'Prof. Alan Turing',
        subject: 'CS101',
        section: 'BSCS 1-A',
        progress: 95,
        status: 'Completed'
    },
    {
        id: 2,
        faculty: 'Prof. Ada Lovelace',
        subject: 'CS102',
        section: 'BSCS 1-B',
        progress: 88,
        status: 'In Progress'
    },
    {
        id: 3,
        faculty: 'Inst. Linus Torvalds',
        subject: 'IT201',
        section: 'BSIT 2-A',
        progress: 72,
        status: 'In Progress'
    },
];

export function EvaluationsPage() {
    const [evaluations] = useState(mockEvaluations);

    const columns = [
        {
            header: 'Faculty',
            accessor: 'faculty',
            width: '25%',
        },
        {
            header: 'Subject',
            accessor: 'subject',
            width: '15%',
        },
        {
            header: 'Section',
            accessor: 'section',
            width: '15%',
        },
        {
            header: 'Progress',
            accessor: 'progress',
            width: '25%',
            render: (value) => (
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${value}%` }}
                        />
                    </div>
                    <span className={styles.progressText}>{value}%</span>
                </div>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '20%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Completed' ? 'success' : 'warning'}>
                    {value}
                </Badge>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="QCE Manager"
            userName="QCE Manager"
            notificationCount={5}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Evaluation Monitoring</h1>
                        <p className={styles.subtitle}>Track real-time progress of faculty evaluations.</p>
                    </div>
                    <Button variant="ghost">
                        <Filter size={18} />
                        Filter Results
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={evaluations} />
                </div>
            </div>
        </DashboardLayout>
    );
}
