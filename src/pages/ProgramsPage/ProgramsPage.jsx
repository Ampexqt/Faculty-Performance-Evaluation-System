import React, { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import styles from './ProgramsPage.module.css';

// Mock data
const mockPrograms = [
    {
        id: 1,
        code: 'BSCS',
        name: 'Bachelor of Science in Computer Science',
        college: 'College of Computing Studies',
        status: 'Active'
    },
    {
        id: 2,
        code: 'BSIT',
        name: 'Bachelor of Science in Information Technology',
        college: 'College of Computing Studies',
        status: 'Active'
    },
    {
        id: 3,
        code: 'BSEd',
        name: 'Bachelor of Secondary Education',
        college: 'College of Education',
        status: 'Active'
    },
    {
        id: 4,
        code: 'BSN',
        name: 'Bachelor of Science in Nursing',
        college: 'College of Nursing',
        status: 'Active'
    },
];

export function ProgramsPage() {
    const [programs] = useState(mockPrograms);

    const columns = [
        {
            header: 'Program Code',
            accessor: 'code',
            width: '15%',
        },
        {
            header: 'Program Name',
            accessor: 'name',
            width: '40%',
        },
        {
            header: 'College',
            accessor: 'college',
            width: '30%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '10%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Active' ? 'active' : 'inactive'}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '5%',
            align: 'center',
            render: () => (
                <button className={styles.actionButton} aria-label="Edit">
                    <Edit size={16} />
                </button>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="Zonal Admin"
            userName="Zonal Admin"
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Academic Programs</h1>
                        <p className={styles.subtitle}>Manage degree programs offered by colleges.</p>
                    </div>
                    <Button variant="primary">
                        <Plus size={18} />
                        Add Program
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={programs} />
                </div>
            </div>
        </DashboardLayout>
    );
}
