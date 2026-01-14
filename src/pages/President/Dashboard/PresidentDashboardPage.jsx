import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { Table } from '@/components/Table/Table';
import { ClipboardList, UserCheck, CheckCircle } from 'lucide-react';
import styles from './PresidentDashboardPage.module.css';

export function PresidentDashboardPage() {
    const navigate = useNavigate();
    const [vpaaList, setVpaaList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const presidentId = userData.id;

    useEffect(() => {
        fetchVPAAList();
    }, []);

    const fetchVPAAList = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/president/vpaa-list');
            const data = await response.json();

            if (data.success) {
                setVpaaList(data.data);
            }
        } catch (error) {
            console.error('Error fetching VPAA list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEvaluate = (vpaa) => {
        // Navigate to evaluation form with VPAA data
        navigate('/president/evaluate', {
            state: {
                vpaa: vpaa,
                presidentId: presidentId
            }
        });
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'full_name',
            width: '30%',
        },
        {
            header: 'Email',
            accessor: 'email',
            width: '30%',
        },
        {
            header: 'Sex',
            accessor: 'sex',
            width: '15%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: (_, row) => (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEvaluate(row)}
                >
                    Evaluate
                </Button>
            ),
        },
    ];

    // Helper function to format evaluator name with honorific and suffix
    const formatEvaluatorName = (user) => {
        if (!user || !user.full_name) return '';
        const parts = [];
        if (user.honorific) parts.push(user.honorific);
        parts.push(user.full_name);
        if (user.suffix) parts.push(user.suffix);
        return parts.join(' ');
    };

    if (isLoading) {
        return (
            <DashboardLayout role="President" userName={formatEvaluatorName(userData)}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="President" userName={formatEvaluatorName(userData)}>
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>President Dashboard</h1>
                        <p className={styles.subtitle}>Evaluate VPAA Performance</p>
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <ClipboardList size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Total VPAA</p>
                            <p className={styles.statValue}>{vpaaList.length}</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <UserCheck size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Active VPAA</p>
                            <p className={styles.statValue}>{vpaaList.filter(v => v.status === 'active').length}</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <CheckCircle size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Evaluations</p>
                            <p className={styles.statValue}>0</p>
                        </div>
                    </Card>
                </div>

                <div className={styles.tableContainer}>
                    <h2 className={styles.sectionTitle}>VPAA List</h2>
                    <Table columns={columns} data={vpaaList} />
                </div>
            </div>
        </DashboardLayout>
    );
}
