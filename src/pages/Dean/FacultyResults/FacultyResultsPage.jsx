import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import styles from './FacultyResultsPage.module.css';

// Mock data
const mockFacultyResults = [
    {
        id: 1,
        facultyName: 'Prof. Alan Turing',
        department: 'Computer Science',
        averageRating: 4.85,
        interpretation: 'Outstanding'
    },
    {
        id: 2,
        facultyName: 'Prof. Ada Lovelace',
        department: 'IT',
        averageRating: 4.92,
        interpretation: 'Outstanding'
    },
    {
        id: 3,
        facultyName: 'Inst. Linus Torvalds',
        department: 'Computer Science',
        averageRating: 4.25,
        interpretation: 'Very Satisfactory'
    },
];

export function FacultyResultsPage() {
    const [results] = useState(mockFacultyResults);

    const getInterpretationVariant = (interpretation) => {
        if (interpretation === 'Outstanding') return 'success';
        if (interpretation === 'Very Satisfactory') return 'warning';
        return 'error';
    };

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'facultyName',
            width: '30%',
        },
        {
            header: 'Department',
            accessor: 'department',
            width: '25%',
        },
        {
            header: 'Average Rating',
            accessor: 'averageRating',
            width: '20%',
            align: 'center',
            render: (value) => (
                <span className={styles.rating}>{value}</span>
            ),
        },
        {
            header: 'Interpretation',
            accessor: 'interpretation',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={getInterpretationVariant(value)}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: () => (
                <button className={styles.viewButton}>View Details</button>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="College Dean"
            userName="College Dean"
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Faculty Evaluation Results</h1>
                        <p className={styles.subtitle}>Detailed performance reports for all faculty members.</p>
                    </div>
                    <Button variant="ghost">
                        <Download size={18} />
                        Export All Reports
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={results} />
                </div>
            </div>
        </DashboardLayout>
    );
}
