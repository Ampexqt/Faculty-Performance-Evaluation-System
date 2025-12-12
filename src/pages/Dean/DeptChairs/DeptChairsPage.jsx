import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import styles from './DeptChairsPage.module.css';

// Mock data
const mockDeptChairs = [
    {
        id: 1,
        chairperson: 'Dr. Grace Hopper',
        department: 'Computer Science',
        dateAppointed: 'Aug 2022'
    },
    {
        id: 2,
        chairperson: 'Dr. John von Neumann',
        department: 'Information Technology',
        dateAppointed: 'Jan 2023'
    },
];

export function DeptChairsPage() {
    const [chairs] = useState(mockDeptChairs);

    const columns = [
        {
            header: 'Chairperson',
            accessor: 'chairperson',
            width: '35%',
        },
        {
            header: 'Department',
            accessor: 'department',
            width: '35%',
        },
        {
            header: 'Date Appointed',
            accessor: 'dateAppointed',
            width: '20%',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: () => (
                <button className={styles.reassignButton}>Reassign</button>
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
                        <h1 className={styles.title}>Department Chairs</h1>
                        <p className={styles.subtitle}>Manage appointed department chairpersons.</p>
                    </div>
                    <Button variant="primary">
                        + Assign Chair
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={chairs} />
                </div>
            </div>
        </DashboardLayout>
    );
}
