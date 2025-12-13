import React, { useState } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Badge } from '@/components/Badge/Badge';
import styles from './StudentEvaluationsPage.module.css';

// Mock data
const mockPendingEvaluations = [
    {
        id: 1,
        subject: 'CS101 - Intro to Computing',
        instructor: 'Prof. Alan Turing',
        status: 'Pending'
    },
    {
        id: 2,
        subject: 'CS102 - Programming I',
        instructor: 'Prof. Ada Lovelace',
        status: 'Pending'
    },
];

const mockCompletedEvaluations = [
    {
        id: 3,
        subject: 'MATH101 - Calculus',
        instructor: 'Prof. Isaac Newton',
        completedDate: '2024-12-10'
    },
];

export function StudentEvaluationsPage() {
    const [evalCode, setEvalCode] = useState('');
    const [pendingEvaluations] = useState(mockPendingEvaluations);
    const [completedEvaluations] = useState(mockCompletedEvaluations);

    const handleValidate = () => {
        // TODO: Implement validation logic
        console.log('Validating code:', evalCode);
    };

    const pendingColumns = [
        {
            header: 'Subject',
            accessor: 'subject',
            width: '40%',
        },
        {
            header: 'Faculty Instructor',
            accessor: 'instructor',
            width: '35%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant="warning">
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Action',
            accessor: 'action',
            width: '10%',
            align: 'center',
            render: () => (
                <Button variant="primary" size="small">
                    Evaluate Now
                </Button>
            ),
        },
    ];

    const completedColumns = [
        {
            header: 'Subject',
            accessor: 'subject',
            width: '45%',
        },
        {
            header: 'Faculty Instructor',
            accessor: 'instructor',
            width: '40%',
        },
        {
            header: 'Completed Date',
            accessor: 'completedDate',
            width: '15%',
            align: 'center',
        },
    ];

    return (
        <DashboardLayout
            role="Student"
            userName="Student"
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>My Evaluations</h1>
                        <p className={styles.subtitle}>Complete your faculty evaluations to view your grades.</p>
                    </div>
                </div>

                {/* Evaluation Code Input */}
                <div className={styles.codeSection}>
                    <div className={styles.codeCard}>
                        <div className={styles.codeHeader}>
                            <ClipboardList size={24} className={styles.codeIcon} />
                            <div>
                                <h3 className={styles.codeTitle}>Enter Evaluation Code</h3>
                                <p className={styles.codeSubtitle}>Get the evaluation code from your instructor during class.</p>
                            </div>
                        </div>

                        <div className={styles.codeInput}>
                            <Input
                                type="text"
                                placeholder="Enter 6-digit code (e.g. X7K-9P2)"
                                value={evalCode}
                                onChange={(e) => setEvalCode(e.target.value)}
                                className={styles.input}
                            />
                            <Button
                                variant="primary"
                                onClick={handleValidate}
                                className={styles.validateButton}
                            >
                                Validate
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Pending Evaluations */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionHeaderContent}>
                            <ClipboardList size={20} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Pending Evaluations</h2>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={pendingColumns} data={pendingEvaluations} />
                    </div>
                </div>

                {/* Completed Evaluations */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionHeaderContent}>
                            <CheckCircle size={20} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Completed</h2>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={completedColumns} data={completedEvaluations} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
