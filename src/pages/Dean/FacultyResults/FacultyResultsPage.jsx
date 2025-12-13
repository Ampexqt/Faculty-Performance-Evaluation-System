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
        role: 'Professor',
        averageRating: 4.85,
        interpretation: 'Excellent'
    },
    {
        id: 2,
        facultyName: 'Prof. Ada Lovelace',
        role: 'Professor',
        averageRating: 4.92,
        interpretation: 'Excellent'
    },
    {
        id: 3,
        facultyName: 'Prof. Grace Hopper',
        role: 'Department Chair',
        averageRating: 4.75,
        interpretation: 'Very Good'
    },
    {
        id: 4,
        facultyName: 'Dr. John von Neumann',
        role: 'Visiting Lecturer',
        averageRating: 4.68,
        interpretation: 'Very Good'
    },
];

export function FacultyResultsPage() {
    const [results] = useState(mockFacultyResults);

    const getInterpretationVariant = (interpretation) => {
        if (interpretation === 'Excellent') return 'success';
        if (interpretation === 'Very Good') return 'active';
        return 'warning';
    };

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'facultyName',
            width: '30%',
        },
        {
            header: 'Role',
            accessor: 'role',
            width: '25%',
        },
        {
            header: 'Average Score',
            accessor: 'averageRating',
            width: '20%',
            align: 'center',
            render: (value) => (
                <span className={styles.rating}>{value}</span>
            ),
        },
        {
            header: 'Rating',
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
