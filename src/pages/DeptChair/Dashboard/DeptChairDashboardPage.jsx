import React, { useState } from 'react';
import { BookOpen, Users, ClipboardList, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import styles from './DeptChairDashboardPage.module.css';

// Mock data
const mockFaculty = [
    {
        id: 1,
        name: 'Prof. Alan Turing',
        employmentStatus: 'Regular',
        totalUnits: 18,
        subjectsCount: 3
    },
    {
        id: 2,
        name: 'Prof. Grace Hopper',
        employmentStatus: 'Regular',
        totalUnits: 21,
        subjectsCount: 4
    },
    {
        id: 3,
        name: 'Inst. Linus Torvalds',
        employmentStatus: 'Part-time',
        totalUnits: 15,
        subjectsCount: 2
    },
];

export function DeptChairDashboardPage() {
    const [faculty] = useState(mockFaculty);

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'name',
            width: '35%',
        },
        {
            header: 'Employment Status',
            accessor: 'employmentStatus',
            width: '25%',
            render: (value) => (
                <Badge variant={value === 'Regular' ? 'success' : 'info'}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Total Units',
            accessor: 'totalUnits',
            width: '15%',
            align: 'center',
            render: (value) => `${value} units`,
        },
        {
            header: 'Subjects Count',
            accessor: 'subjectsCount',
            width: '15%',
            align: 'center',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: () => (
                <Button variant="ghost" size="small">
                    View Schedule
                </Button>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="Dept. Chair"
            userName="Dept. Chair"
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Department Management</h1>
                        <p className={styles.subtitle}>Manage faculty assignments and subject offerings.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <Button variant="secondary">
                            <Users size={18} />
                            Add Faculty
                        </Button>
                        <Button variant="primary">
                            <Plus size={18} />
                            Assign Subject
                        </Button>
                    </div>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Subjects Managed"
                        value={24}
                        subtitle="Active this semester"
                        icon={BookOpen}
                    />
                    <StatCard
                        title="Faculty Under Chair"
                        value={18}
                        subtitle="Regular & Part-time"
                        icon={Users}
                    />
                    <StatCard
                        title="Active Evaluations"
                        value={12}
                        subtitle="Pending completion"
                        icon={ClipboardList}
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Faculty Teaching Load</h2>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={columns} data={faculty} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
