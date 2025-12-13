import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';
import styles from './EvaluationsPage.module.css';

// Mock data - Faculty and Department Chairs to evaluate
const mockEvaluations = [
    {
        id: 1,
        name: 'Prof. Alan Turing',
        role: 'Professor',
        status: 'Pending'
    },
    {
        id: 2,
        name: 'Prof. Ada Lovelace',
        role: 'Professor',
        status: 'Completed'
    },
    {
        id: 3,
        name: 'Prof. Grace Hopper',
        role: 'Department Chair',
        status: 'Pending'
    },
    {
        id: 4,
        name: 'Dr. John von Neumann',
        role: 'Visiting Lecturer',
        status: 'Completed'
    },
];

export function EvaluationsPage() {
    const [evaluations] = useState(mockEvaluations);
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusVariant = (status) => {
        if (status === 'Completed') return 'success';
        if (status === 'Pending') return 'warning';
        return 'default';
    };

    const filteredEvaluations = evaluations.filter(evaluation =>
        evaluation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'name',
            width: '40%',
        },
        {
            header: 'Role',
            accessor: 'role',
            width: '30%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={getStatusVariant(value)}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '15%',
            align: 'center',
            render: (_, row) => (
                <button className={styles.evaluateButton}>
                    {row.status === 'Completed' ? 'View' : 'Evaluate'}
                </button>
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
                        <h1 className={styles.title}>Faculty Evaluations</h1>
                        <p className={styles.subtitle}>Evaluate department chairs and faculty members.</p>
                    </div>
                </div>

                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or role..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={filteredEvaluations} />
                </div>
            </div>
        </DashboardLayout>
    );
}
